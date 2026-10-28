/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Project,
  ServiceOffering,
  JournalEntry,
  ExplorationItem,
  BrandPrincipleStat,
  SiteTexts,
  DEFAULT_SITE_TEXTS,
  BRAND_NAME,
  BRAND_TAGLINE,
  GITHUB_URL,
  ROLES,
  SERVICES,
  PROJECTS,
  JOURNAL_ENTRIES,
  EXPLORATIONS,
  STATS,
  Review,
  REVIEWS,
  MediaAsset,
  DEFAULT_MEDIA_ASSETS,
  ActivityLog,
  DEFAULT_ACTIVITY_LOGS,
} from '../utils/portfolio.ts';
import { api } from '../services/api.ts';
import { checkSupabaseConnection, isSupabaseConfigured } from '../services/supabase.ts';
import { useAuth } from './AuthContext.tsx';
import { deleteMediaFile } from '../services/storage.ts';

export interface PortfolioData {
  brandName: string;
  brandTagline: string;
  githubUrl: string;
  email: string;
  linkedinUrl: string;
  heroDescription: string;
  roles: string[];
  services: ServiceOffering[];
  projects: Project[];
  journalEntries: JournalEntry[];
  explorations: ExplorationItem[];
  stats: BrandPrincipleStat[];
  reviews: Review[];
  siteTexts: SiteTexts;
  mediaAssets: MediaAsset[];
  activityLogs: ActivityLog[];
  lastPublishedAt?: string;
  hasUnpublishedChanges?: boolean;
}

const STORAGE_KEY = 'ai_build_portfolio_cms_v1';

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  brandName: BRAND_NAME,
  brandTagline: BRAND_TAGLINE,
  githubUrl: GITHUB_URL,
  email: 'garv@aibuild.studio',
  linkedinUrl: 'https://linkedin.com',
  heroDescription:
    'Specializing in Web Development, AI Videos, UGC Videos, and E-books. AI Build transforms concepts into high-impact digital products through modern code, creative direction, and generative media.',
  roles: [...ROLES],
  services: [...SERVICES],
  projects: [...PROJECTS],
  journalEntries: [...JOURNAL_ENTRIES],
  explorations: [...EXPLORATIONS],
  stats: [...STATS],
  reviews: [...REVIEWS],
  siteTexts: { ...DEFAULT_SITE_TEXTS },
  mediaAssets: [...DEFAULT_MEDIA_ASSETS],
  activityLogs: [...DEFAULT_ACTIVITY_LOGS],
  lastPublishedAt: new Date().toISOString(),
  hasUnpublishedChanges: false,
};

interface PortfolioContextType {
  data: PortfolioData;
  isLoading: boolean;
  isCloudConnected: boolean;
  isSyncing: boolean;
  syncError: string | null;
  revalidate: () => Promise<void>;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  updateGeneralSettings: (settings: Partial<Pick<PortfolioData, 'brandName' | 'brandTagline' | 'githubUrl' | 'email' | 'linkedinUrl' | 'heroDescription'>>) => Promise<{ success: boolean; error?: string }>;
  updateSiteTexts: (texts: Partial<SiteTexts>) => Promise<{ success: boolean; error?: string }>;
  // Projects CRUD & Publishing
  addProject: (project: Project) => Promise<{ success: boolean; error?: string; project?: Project }>;
  updateProject: (id: string, updated: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  reorderProjects: (startIndex: number, endIndex: number) => Promise<{ success: boolean; error?: string }>;
  togglePublishProject: (id: string, publish?: boolean) => Promise<{ success: boolean; error?: string }>;
  // Journal CRUD & Publishing
  addJournalEntry: (entry: JournalEntry) => Promise<{ success: boolean; error?: string; entry?: JournalEntry }>;
  updateJournalEntry: (id: string, updated: Partial<JournalEntry>) => Promise<{ success: boolean; error?: string }>;
  deleteJournalEntry: (id: string) => Promise<{ success: boolean; error?: string }>;
  reorderJournal: (startIndex: number, endIndex: number) => Promise<{ success: boolean; error?: string }>;
  togglePublishJournal: (id: string, publish?: boolean) => Promise<{ success: boolean; error?: string }>;
  // Explorations CRUD & Publishing
  addExploration: (item: ExplorationItem) => Promise<{ success: boolean; error?: string; item?: ExplorationItem }>;
  updateExploration: (id: string, updated: Partial<ExplorationItem>) => Promise<{ success: boolean; error?: string }>;
  deleteExploration: (id: string) => Promise<{ success: boolean; error?: string }>;
  reorderExplorations: (startIndex: number, endIndex: number) => Promise<{ success: boolean; error?: string }>;
  togglePublishExploration: (id: string, publish?: boolean) => Promise<{ success: boolean; error?: string }>;
  // Services
  updateService: (id: string, updated: Partial<ServiceOffering>) => Promise<{ success: boolean; error?: string }>;
  // Stats
  updateStat: (index: number, updated: Partial<BrandPrincipleStat>) => Promise<{ success: boolean; error?: string }>;
  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date'> & { id?: string; date?: string; status?: 'approved' | 'pending' }) => Promise<{ success: boolean; error?: string }>;
  updateReview: (id: string, updated: Partial<Review>) => Promise<{ success: boolean; error?: string }>;
  verifyReview: (id: string, approve?: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteReview: (id: string) => Promise<{ success: boolean; error?: string }>;
  // Media Assets
  addMediaAsset: (asset: MediaAsset) => Promise<{ success: boolean; error?: string }>;
  updateMediaAsset: (id: string, updated: Partial<MediaAsset>) => Promise<{ success: boolean; error?: string }>;
  deleteMediaAsset: (id: string) => Promise<{ success: boolean; error?: string }>;
  // Activity Logging & Global Publishing
  logActivity: (action: ActivityLog['action'], target: ActivityLog['target'], title: string, details?: string) => void;
  publishAllChanges: () => Promise<{ success: boolean; error?: string }>;
  // Backup & Restore
  resetToDefaults: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; error?: string };
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isAuthenticated } = useAuth();
  const token = session?.token;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Initialize data with local cache or factory defaults
  const [data, setData] = useState<PortfolioData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_PORTFOLIO_DATA,
            ...parsed,
            siteTexts: { ...DEFAULT_SITE_TEXTS, ...(parsed.siteTexts || {}) },
          };
        }
      } catch (err) {
        console.warn('Failed to parse portfolio content from localStorage:', err);
      }
    }
    return DEFAULT_PORTFOLIO_DATA;
  });

  const checkIsAdminUrl = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.includes('admin') || hash.includes('admin');
  };

  const [isAdminOpen, setIsAdminOpenState] = useState<boolean>(() => checkIsAdminUrl());

  const setIsAdminOpen = (open: boolean | ((prev: boolean) => boolean)) => {
    setIsAdminOpenState((current) => {
      const next = typeof open === 'function' ? open(current) : open;
      if (typeof window !== 'undefined') {
        try {
          if (next) {
            if (!window.location.pathname.includes('admin') && !window.location.hash.includes('admin')) {
              window.history.pushState({}, '', '/admin');
            }
          } else {
            if (window.location.pathname.includes('admin') || window.location.hash.includes('admin')) {
              window.history.pushState({}, '', '/');
            }
          }
        } catch (err) {
          console.warn('History pushState error:', err);
        }
      }
      return next;
    });
  };

  // Broadcast channel for multi-tab live sync
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // ----------------------------------------------------------------------------
  // Cross-Tab and Cross-Device Revalidation
  // ----------------------------------------------------------------------------
  const revalidate = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const conn = await checkSupabaseConnection();
      if (!conn.connected) {
        setIsCloudConnected(false);
        setIsSyncing(false);
        return;
      }
      setIsCloudConnected(true);

      const isAdminUser = Boolean(isAuthenticated && token);

      // Fetch all tables in parallel
      const [
        projectsRes,
        journalRes,
        explorationsRes,
        servicesRes,
        reviewsRes,
        contentRes,
        mediaRes,
        activityRes,
      ] = await Promise.allSettled([
        api.fetchProjects({ publishedOnly: !isAdminUser, token: isAdminUser ? token : undefined }),
        api.fetchJournal({ publishedOnly: !isAdminUser, token: isAdminUser ? token : undefined }),
        api.fetchExplorations({ publishedOnly: !isAdminUser, token: isAdminUser ? token : undefined }),
        api.fetchServices(isAdminUser ? token : undefined),
        api.fetchReviews({ approvedOnly: !isAdminUser, token: isAdminUser ? token : undefined }),
        api.fetchSiteContent(isAdminUser ? token : undefined),
        isAdminUser ? api.fetchMediaAssets(token) : Promise.resolve({ data: null, error: null }),
        isAdminUser ? api.fetchActivityLogs(token) : Promise.resolve({ data: null, error: null }),
      ]);

      setData((prev) => {
        const next: PortfolioData = { ...prev };

        if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
          next.projects = projectsRes.value.data;
        }
        if (journalRes.status === 'fulfilled' && journalRes.value.data) {
          next.journalEntries = journalRes.value.data;
        }
        if (explorationsRes.status === 'fulfilled' && explorationsRes.value.data) {
          next.explorations = explorationsRes.value.data;
        }
        if (servicesRes.status === 'fulfilled' && servicesRes.value.data && servicesRes.value.data.length > 0) {
          next.services = servicesRes.value.data;
        }
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.data && reviewsRes.value.data.length > 0) {
          next.reviews = reviewsRes.value.data;
        }
        if (contentRes.status === 'fulfilled' && contentRes.value.data) {
          const contentMap = contentRes.value.data;
          if (contentMap.brand_settings) {
            Object.assign(next, contentMap.brand_settings);
          }
          if (contentMap.site_texts) {
            next.siteTexts = { ...DEFAULT_SITE_TEXTS, ...contentMap.site_texts };
          }
          if (Array.isArray(contentMap.stats) && contentMap.stats.length > 0) {
            next.stats = contentMap.stats;
          }
        }
        if (mediaRes.status === 'fulfilled' && mediaRes.value.data && mediaRes.value.data.length > 0) {
          next.mediaAssets = mediaRes.value.data;
        }
        if (activityRes.status === 'fulfilled' && activityRes.value.data && activityRes.value.data.length > 0) {
          next.activityLogs = activityRes.value.data;
        }

        return next;
      });
    } catch (err: any) {
      console.warn('Revalidation error:', err);
      setSyncError(err?.message || 'Failed to revalidate content');
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  // Initial mount load and check
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (isSupabaseConfigured) {
        const conn = await checkSupabaseConnection();
        if (mounted) {
          setIsCloudConnected(conn.connected);
          if (conn.connected) {
            await revalidate();
          } else {
            setIsLoading(false);
          }
        }
      } else {
        if (mounted) {
          setIsCloudConnected(false);
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [revalidate]);

  // Multi-tab BroadcastChannel & storage synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      broadcastRef.current = new BroadcastChannel('ai_build_sync_channel');
      broadcastRef.current.onmessage = (event) => {
        if (event.data?.type === 'REVALIDATE') {
          revalidate();
        }
      };
    } catch (e) {
      // BroadcastChannel unsupported fallback
    }

    const handleCustomSync = () => revalidate();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        revalidate();
      }
    };
    const handleFocus = () => revalidate();

    window.addEventListener('ai_build_sync', handleCustomSync);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      broadcastRef.current?.close();
      window.removeEventListener('ai_build_sync', handleCustomSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [revalidate]);

  // Notify other tabs and components of an update
  const notifyContentUpdated = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai_build_sync'));
      try {
        broadcastRef.current?.postMessage({ type: 'REVALIDATE', timestamp: Date.now() });
      } catch (e) {}
    }
  }, []);

  // Debounced cache to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to save portfolio data to localStorage:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [data]);

  // Keyboard shortcut: Ctrl + Shift + A to toggle Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/';
        } else {
          window.location.href = '/admin';
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Activity logger
  const logActivity = useCallback((
    action: ActivityLog['action'],
    target: ActivityLog['target'],
    title: string,
    details?: string
  ) => {
    const newEntry: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      target,
      title,
      timestamp: 'Just now',
      details,
    };
    setData((prev) => ({
      ...prev,
      activityLogs: [newEntry, ...prev.activityLogs.slice(0, 24)],
    }));

    if (isSupabaseConfigured && token) {
      api.insertActivityLog(newEntry, token).catch(() => {});
    }
  }, [token]);

  // ----------------------------------------------------------------------------
  // General & Site Settings
  // ----------------------------------------------------------------------------
  const updateGeneralSettings = async (
    settings: Partial<Pick<PortfolioData, 'brandName' | 'brandTagline' | 'githubUrl' | 'email' | 'linkedinUrl' | 'heroDescription'>>
  ): Promise<{ success: boolean; error?: string }> => {
    setData((prev) => ({
      ...prev,
      ...settings,
      hasUnpublishedChanges: true,
    }));
    logActivity('update', 'settings', 'Updated Brand General Settings');

    if (isSupabaseConfigured && token) {
      const merged = {
        brandName: settings.brandName ?? data.brandName,
        brandTagline: settings.brandTagline ?? data.brandTagline,
        githubUrl: settings.githubUrl ?? data.githubUrl,
        email: settings.email ?? data.email,
        linkedinUrl: settings.linkedinUrl ?? data.linkedinUrl,
        heroDescription: settings.heroDescription ?? data.heroDescription,
        roles: data.roles,
      };
      const res = await api.upsertSiteContent('brand_settings', merged, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const updateSiteTexts = async (texts: Partial<SiteTexts>): Promise<{ success: boolean; error?: string }> => {
    const merged = { ...data.siteTexts, ...texts };
    setData((prev) => ({
      ...prev,
      siteTexts: merged,
      hasUnpublishedChanges: true,
    }));
    logActivity('update', 'content', 'Updated Website Content Texts');

    if (isSupabaseConfigured && token) {
      const res = await api.upsertSiteContent('site_texts', merged, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  // ----------------------------------------------------------------------------
  // Projects CRUD & Reordering & Publishing
  // ----------------------------------------------------------------------------
  const addProject = async (project: Project): Promise<{ success: boolean; error?: string; project?: Project }> => {
    const order = project.order ?? (data.projects.length + 1);
    const newProject: Project = {
      ...project,
      isPublished: project.isPublished ?? true,
      order,
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
      hasUnpublishedChanges: true,
    }));
    logActivity('create', 'project', `Created project "${newProject.title}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.upsertProject(newProject, token);
      if (res.error) {
        return { success: false, error: res.error };
      }
    }
    notifyContentUpdated();
    return { success: true, project: newProject };
  };

  const updateProject = async (id: string, updated: Partial<Project>): Promise<{ success: boolean; error?: string }> => {
    let targetProject: Project | undefined;
    setData((prev) => {
      const nextProjects = prev.projects.map((p) => {
        if (p.id === id) {
          targetProject = { ...p, ...updated, updatedAt: new Date().toISOString() };
          return targetProject;
        }
        return p;
      });
      return {
        ...prev,
        projects: nextProjects,
        hasUnpublishedChanges: true,
      };
    });
    logActivity('update', 'project', `Updated project "${updated.title || id}"`);

    if (isSupabaseConfigured && token && targetProject) {
      const res = await api.upsertProject(targetProject, token);
      if (res.error) return { success: false, error: res.error };
    }
    notifyContentUpdated();
    return { success: true };
  };

  const deleteProject = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const title = data.projects.find((p) => p.id === id)?.title || id;
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      hasUnpublishedChanges: true,
    }));
    logActivity('delete', 'project', `Deleted project "${title}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.deleteProject(id, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const reorderProjects = async (startIndex: number, endIndex: number): Promise<{ success: boolean; error?: string }> => {
    let reindexed: Project[] = [];
    setData((prev) => {
      const list = [...prev.projects];
      if (startIndex < 0 || startIndex >= list.length || endIndex < 0 || endIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, moved);
      reindexed = list.map((p, idx) => ({ ...p, order: idx + 1 }));
      return {
        ...prev,
        projects: reindexed,
        hasUnpublishedChanges: true,
      };
    });
    logActivity('reorder', 'project', 'Reordered projects display sequence');

    if (isSupabaseConfigured && token && reindexed.length > 0) {
      try {
        await Promise.all(reindexed.map((p) => api.upsertProject(p, token)));
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to persist project ordering' };
      }
    }
    notifyContentUpdated();
    return { success: true };
  };

  const togglePublishProject = async (id: string, publish?: boolean): Promise<{ success: boolean; error?: string }> => {
    let targetProject: Project | undefined;
    setData((prev) => {
      const target = prev.projects.find((p) => p.id === id);
      const newStatus = typeof publish === 'boolean' ? publish : !target?.isPublished;
      const nextProjects = prev.projects.map((p) => {
        if (p.id === id) {
          targetProject = { ...p, isPublished: newStatus, updatedAt: new Date().toISOString() };
          return targetProject;
        }
        return p;
      });
      return {
        ...prev,
        projects: nextProjects,
        hasUnpublishedChanges: true,
      };
    });

    const newStatus = targetProject?.isPublished;
    logActivity(
      newStatus ? 'publish' : 'unpublish',
      'project',
      `${newStatus ? 'Published' : 'Unpublished'} project "${targetProject?.title || id}"`
    );

    if (isSupabaseConfigured && token && targetProject) {
      const res = await api.upsertProject(targetProject, token);
      if (res.error) return { success: false, error: res.error };
    }
    notifyContentUpdated();
    return { success: true };
  };

  // ----------------------------------------------------------------------------
  // Journal CRUD & Publishing
  // ----------------------------------------------------------------------------
  const addJournalEntry = async (entry: JournalEntry): Promise<{ success: boolean; error?: string; entry?: JournalEntry }> => {
    const newEntry: JournalEntry = {
      ...entry,
      isPublished: entry.isPublished ?? true,
      order: entry.order ?? (data.journalEntries.length + 1),
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      journalEntries: [newEntry, ...prev.journalEntries],
      hasUnpublishedChanges: true,
    }));
    logActivity('create', 'journal', `Created article "${newEntry.title}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.upsertJournalEntry(newEntry, token);
      if (res.error) return { success: false, error: res.error };
    }
    notifyContentUpdated();
    return { success: true, entry: newEntry };
  };

  const updateJournalEntry = async (id: string, updated: Partial<JournalEntry>): Promise<{ success: boolean; error?: string }> => {
    let targetEntry: JournalEntry | undefined;
    setData((prev) => {
      const nextEntries = prev.journalEntries.map((j) => {
        if (j.id === id) {
          targetEntry = { ...j, ...updated, updatedAt: new Date().toISOString() };
          return targetEntry;
        }
        return j;
      });
      return {
        ...prev,
        journalEntries: nextEntries,
        hasUnpublishedChanges: true,
      };
    });
    logActivity('update', 'journal', `Updated article "${updated.title || id}"`);

    if (isSupabaseConfigured && token && targetEntry) {
      const res = await api.upsertJournalEntry(targetEntry, token);
      if (res.error) return { success: false, error: res.error };
    }
    notifyContentUpdated();
    return { success: true };
  };

  const deleteJournalEntry = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const title = data.journalEntries.find((j) => j.id === id)?.title || id;
    setData((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((j) => j.id !== id),
      hasUnpublishedChanges: true,
    }));
    logActivity('delete', 'journal', `Deleted article "${title}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.deleteJournalEntry(id, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const reorderJournal = async (startIndex: number, endIndex: number): Promise<{ success: boolean; error?: string }> => {
    let reindexed: JournalEntry[] = [];
    setData((prev) => {
      const list = [...prev.journalEntries];
      if (startIndex < 0 || startIndex >= list.length || endIndex < 0 || endIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, moved);
      reindexed = list.map((j, idx) => ({ ...j, order: idx + 1 }));
      return {
        ...prev,
        journalEntries: reindexed,
        hasUnpublishedChanges: true,
      };
    });
    logActivity('reorder', 'journal', 'Reordered journal articles sequence');

    if (isSupabaseConfigured && token && reindexed.length > 0) {
      try {
        await Promise.all(reindexed.map((j) => api.upsertJournalEntry(j, token)));
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to reorder journal' };
      }
    }
    notifyContentUpdated();
    return { success: true };
  };

  const togglePublishJournal = async (id: string, publish?: boolean): Promise<{ success: boolean; error?: string }> => {
    let targetEntry: JournalEntry | undefined;
    setData((prev) => {
      const target = prev.journalEntries.find((j) => j.id === id);
      const newStatus = typeof publish === 'boolean' ? publish : !target?.isPublished;
      const nextEntries = prev.journalEntries.map((j) => {
        if (j.id === id) {
          targetEntry = { ...j, isPublished: newStatus, updatedAt: new Date().toISOString() };
          return targetEntry;
        }
        return j;
      });
      return {
        ...prev,
        journalEntries: nextEntries,
        hasUnpublishedChanges: true,
      };
    });

    const newStatus = targetEntry?.isPublished;
    logActivity(
      newStatus ? 'publish' : 'unpublish',
      'journal',
      `${newStatus ? 'Published' : 'Unpublished'} article "${targetEntry?.title || id}"`
    );

    if (isSupabaseConfigured && token && targetEntry) {
      const res = await api.upsertJournalEntry(targetEntry, token);
      if (res.error) return { success: false, error: res.error };
    }
    notifyContentUpdated();
    return { success: true };
  };

  // ----------------------------------------------------------------------------
  // Explorations CRUD & Publishing
  // ----------------------------------------------------------------------------
  const addExploration = async (item: ExplorationItem): Promise<{ success: boolean; error?: string; item?: ExplorationItem }> => {
    const newItem: ExplorationItem = {
      ...item,
      isPublished: item.isPublished ?? true,
      order: item.order ?? (data.explorations.length + 1),
      createdAt: item.createdAt || new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      explorations: [newItem, ...prev.explorations],
      hasUnpublishedChanges: true,
    }));
    logActivity('create', 'exploration', `Created visual exploration "${newItem.title}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.upsertExploration(newItem, token);
      if (res.error) return { success: false, error: res.error };
    }
    notifyContentUpdated();
    return { success: true, item: newItem };
  };

  const updateExploration = async (id: string, updated: Partial<ExplorationItem>): Promise<{ success: boolean; error?: string }> => {
    let targetItem: ExplorationItem | undefined;
    setData((prev) => {
      const nextList = prev.explorations.map((exp) => {
        if (exp.id === id) {
          targetItem = { ...exp, ...updated };
          return targetItem;
        }
        return exp;
      });
      return {
        ...prev,
        explorations: nextList,
        hasUnpublishedChanges: true,
      };
    });
    logActivity('update', 'exploration', `Updated visual exploration "${updated.title || id}"`);

    if (isSupabaseConfigured && token && targetItem) {
      const res = await api.upsertExploration(targetItem, token);
      if (res.error) return { success: false, error: res.error };
    }
    notifyContentUpdated();
    return { success: true };
  };

  const deleteExploration = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const title = data.explorations.find((exp) => exp.id === id)?.title || id;
    setData((prev) => ({
      ...prev,
      explorations: prev.explorations.filter((exp) => exp.id !== id),
      hasUnpublishedChanges: true,
    }));
    logActivity('delete', 'exploration', `Deleted visual exploration "${title}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.deleteExploration(id, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const reorderExplorations = async (startIndex: number, endIndex: number): Promise<{ success: boolean; error?: string }> => {
    let reindexed: ExplorationItem[] = [];
    setData((prev) => {
      const list = [...prev.explorations];
      if (startIndex < 0 || startIndex >= list.length || endIndex < 0 || endIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, moved);
      reindexed = list.map((exp, idx) => ({ ...exp, order: idx + 1 }));
      return {
        ...prev,
        explorations: reindexed,
        hasUnpublishedChanges: true,
      };
    });
    logActivity('reorder', 'exploration', 'Reordered visual explorations sequence');

    if (isSupabaseConfigured && token && reindexed.length > 0) {
      try {
        await Promise.all(reindexed.map((exp) => api.upsertExploration(exp, token)));
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to reorder explorations' };
      }
    }
    notifyContentUpdated();
    return { success: true };
  };

  const togglePublishExploration = async (id: string, publish?: boolean): Promise<{ success: boolean; error?: string }> => {
    let targetItem: ExplorationItem | undefined;
    setData((prev) => {
      const target = prev.explorations.find((e) => e.id === id);
      const newStatus = typeof publish === 'boolean' ? publish : !target?.isPublished;
      const nextList = prev.explorations.map((exp) => {
        if (exp.id === id) {
          targetItem = { ...exp, isPublished: newStatus };
          return targetItem;
        }
        return exp;
      });
      return {
        ...prev,
        explorations: nextList,
        hasUnpublishedChanges: true,
      };
    });

    const newStatus = targetItem?.isPublished;
    logActivity(
      newStatus ? 'publish' : 'unpublish',
      'exploration',
      `${newStatus ? 'Published' : 'Unpublished'} exploration "${targetItem?.title || id}"`
    );

    if (isSupabaseConfigured && token && targetItem) {
      const res = await api.upsertExploration(targetItem, token);
      if (res.error) return { success: false, error: res.error };
    }
    notifyContentUpdated();
    return { success: true };
  };

  // ----------------------------------------------------------------------------
  // Services
  // ----------------------------------------------------------------------------
  const updateService = async (id: string, updated: Partial<ServiceOffering>): Promise<{ success: boolean; error?: string }> => {
    let targetService: ServiceOffering | undefined;
    let orderIndex = 0;
    setData((prev) => {
      const nextServices = prev.services.map((s, idx) => {
        if (s.id === id) {
          targetService = { ...s, ...updated };
          orderIndex = idx + 1;
          return targetService;
        }
        return s;
      });
      return {
        ...prev,
        services: nextServices,
        hasUnpublishedChanges: true,
      };
    });
    logActivity('update', 'service', `Updated service offering "${updated.title || id}"`);

    if (isSupabaseConfigured && token && targetService) {
      const res = await api.upsertService(targetService, orderIndex, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  // ----------------------------------------------------------------------------
  // Stats
  // ----------------------------------------------------------------------------
  const updateStat = async (index: number, updated: Partial<BrandPrincipleStat>): Promise<{ success: boolean; error?: string }> => {
    let nextStats: BrandPrincipleStat[] = [];
    setData((prev) => {
      nextStats = [...prev.stats];
      if (nextStats[index]) {
        nextStats[index] = { ...nextStats[index], ...updated };
      }
      return { ...prev, stats: nextStats, hasUnpublishedChanges: true };
    });
    logActivity('update', 'content', `Updated brand principle #${index + 1}`);

    if (isSupabaseConfigured && token && nextStats.length > 0) {
      const res = await api.upsertSiteContent('stats', nextStats, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  // ----------------------------------------------------------------------------
  // Client Reviews
  // ----------------------------------------------------------------------------
  const addReview = async (
    newReview: Omit<Review, 'id' | 'date'> & { id?: string; date?: string; status?: 'approved' | 'pending' }
  ): Promise<{ success: boolean; error?: string }> => {
    const isApproved = newReview.status === 'approved';
    const review: Review = {
      ...newReview,
      id: newReview.id || `rev-${Date.now()}`,
      date: newReview.date || 'Just now',
      status: newReview.status || 'pending',
      verified: isApproved ? true : (newReview.verified ?? false),
    };

    setData((prev) => ({
      ...prev,
      reviews: [review, ...prev.reviews],
      hasUnpublishedChanges: true,
    }));
    logActivity('create', 'review', `New client review received from "${review.name}"`);

    if (isSupabaseConfigured) {
      const res = await api.submitPublicReview(review);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const updateReview = async (id: string, updated: Partial<Review>): Promise<{ success: boolean; error?: string }> => {
    setData((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      hasUnpublishedChanges: true,
    }));
    logActivity('update', 'review', `Updated review for "${updated.name || id}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.updateReview(id, updated, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const verifyReview = async (id: string, approve: boolean = true): Promise<{ success: boolean; error?: string }> => {
    setData((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === id ? { ...r, status: approve ? 'approved' : 'pending', verified: approve } : r
      ),
      hasUnpublishedChanges: true,
    }));
    const r = data.reviews.find((item) => item.id === id);
    logActivity('publish', 'review', `${approve ? 'Approved' : 'Unapproved'} review from "${r?.name || id}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.updateReview(id, { status: approve ? 'approved' : 'pending', verified: approve }, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const deleteReview = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const r = data.reviews.find((item) => item.id === id);
    setData((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((item) => item.id !== id),
      hasUnpublishedChanges: true,
    }));
    logActivity('delete', 'review', `Deleted review from "${r?.name || id}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.deleteReview(id, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  // ----------------------------------------------------------------------------
  // Media Assets
  // ----------------------------------------------------------------------------
  const addMediaAsset = async (asset: MediaAsset): Promise<{ success: boolean; error?: string }> => {
    setData((prev) => ({
      ...prev,
      mediaAssets: [asset, ...prev.mediaAssets],
      hasUnpublishedChanges: true,
    }));
    logActivity('upload', 'media', `Uploaded media asset "${asset.title}"`);

    if (isSupabaseConfigured && token) {
      const res = await api.upsertMediaAsset(asset, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const updateMediaAsset = async (id: string, updated: Partial<MediaAsset>): Promise<{ success: boolean; error?: string }> => {
    let targetAsset: MediaAsset | undefined;
    setData((prev) => {
      const nextAssets = prev.mediaAssets.map((m) => {
        if (m.id === id) {
          targetAsset = { ...m, ...updated };
          return targetAsset;
        }
        return m;
      });
      return {
        ...prev,
        mediaAssets: nextAssets,
        hasUnpublishedChanges: true,
      };
    });
    logActivity('update', 'media', `Updated media asset "${updated.title || id}"`);

    if (isSupabaseConfigured && token && targetAsset) {
      const res = await api.upsertMediaAsset(targetAsset, token);
      if (!res.success) return res;
    }
    notifyContentUpdated();
    return { success: true };
  };

  const deleteMediaAsset = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const m = data.mediaAssets.find((item) => item.id === id);
    setData((prev) => ({
      ...prev,
      mediaAssets: prev.mediaAssets.filter((item) => item.id !== id),
      hasUnpublishedChanges: true,
    }));
    logActivity('delete', 'media', `Deleted media asset "${m?.title || id}"`);

    if (m) {
      await deleteMediaFile(m, token);
    }
    notifyContentUpdated();
    return { success: true };
  };

  // ----------------------------------------------------------------------------
  // Global Publish All Staged Changes
  // ----------------------------------------------------------------------------
  const publishAllChanges = async (): Promise<{ success: boolean; error?: string }> => {
    const timestamp = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      lastPublishedAt: timestamp,
      hasUnpublishedChanges: false,
    }));
    logActivity('publish', 'content', 'Published all changes to public live website');

    if (isSupabaseConfigured && token) {
      try {
        // Sync site content metadata
        await api.upsertSiteContent('brand_settings', {
          brandName: data.brandName,
          brandTagline: data.brandTagline,
          githubUrl: data.githubUrl,
          email: data.email,
          linkedinUrl: data.linkedinUrl,
          heroDescription: data.heroDescription,
          roles: data.roles,
        }, token);

        await api.upsertSiteContent('site_texts', data.siteTexts, token);
        await api.upsertSiteContent('stats', data.stats, token);
      } catch (err: any) {
        return { success: false, error: err?.message || 'Publish sync failed' };
      }
    }
    notifyContentUpdated();
    return { success: true };
  };

  // Reset
  const resetToDefaults = () => {
    setData(DEFAULT_PORTFOLIO_DATA);
    localStorage.removeItem(STORAGE_KEY);
    logActivity('settings', 'settings', 'Reset all portfolio content to factory defaults');
    notifyContentUpdated();
  };

  // Export & Import
  const exportDataJSON = () => JSON.stringify(data, null, 2);

  const importDataJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || !parsed) {
        return { success: false, error: 'Invalid JSON format' };
      }
      setData({
        ...DEFAULT_PORTFOLIO_DATA,
        ...parsed,
      });
      logActivity('update', 'settings', 'Imported portfolio content backup from JSON');
      notifyContentUpdated();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'JSON parsing error' };
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        isLoading,
        isCloudConnected,
        isSyncing,
        syncError,
        revalidate,
        isAdminOpen,
        setIsAdminOpen,
        updateGeneralSettings,
        updateSiteTexts,
        addProject,
        updateProject,
        deleteProject,
        reorderProjects,
        togglePublishProject,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        reorderJournal,
        togglePublishJournal,
        addExploration,
        updateExploration,
        deleteExploration,
        reorderExplorations,
        togglePublishExploration,
        updateService,
        updateStat,
        addReview,
        updateReview,
        verifyReview,
        deleteReview,
        addMediaAsset,
        updateMediaAsset,
        deleteMediaAsset,
        logActivity,
        publishAllChanges,
        resetToDefaults,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
