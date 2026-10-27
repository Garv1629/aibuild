/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../utils/portfolio.ts';

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
};

interface PortfolioContextType {
  data: PortfolioData;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  updateGeneralSettings: (settings: Partial<Pick<PortfolioData, 'brandName' | 'brandTagline' | 'githubUrl' | 'email' | 'linkedinUrl' | 'heroDescription'>>) => void;
  updateSiteTexts: (texts: Partial<SiteTexts>) => void;
  // Projects
  addProject: (project: Project) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Journal
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, updated: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  // Explorations
  addExploration: (item: ExplorationItem) => void;
  updateExploration: (id: string, updated: Partial<ExplorationItem>) => void;
  deleteExploration: (id: string) => void;
  // Services
  updateService: (id: string, updated: Partial<ServiceOffering>) => void;
  // Stats
  updateStat: (index: number, updated: Partial<BrandPrincipleStat>) => void;
  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date'> & { id?: string; date?: string; status?: 'approved' | 'pending' }) => void;
  updateReview: (id: string, updated: Partial<Review>) => void;
  verifyReview: (id: string, approve?: boolean) => void;
  deleteReview: (id: string) => void;
  // Backup & Restore
  resetToDefaults: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; error?: string };
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_PORTFOLIO_DATA,
            ...parsed,
            roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : DEFAULT_PORTFOLIO_DATA.roles,
            services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : DEFAULT_PORTFOLIO_DATA.services,
            projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_PORTFOLIO_DATA.projects,
            journalEntries: Array.isArray(parsed.journalEntries) ? parsed.journalEntries : DEFAULT_PORTFOLIO_DATA.journalEntries,
            explorations: Array.isArray(parsed.explorations) ? parsed.explorations : DEFAULT_PORTFOLIO_DATA.explorations,
            stats: Array.isArray(parsed.stats) && parsed.stats.length > 0 ? parsed.stats : DEFAULT_PORTFOLIO_DATA.stats,
            reviews: Array.isArray(parsed.reviews) && parsed.reviews.length > 0
              ? parsed.reviews.map((r: Review) => ({ ...r, status: r.status || 'approved' }))
              : DEFAULT_PORTFOLIO_DATA.reviews,
            siteTexts: {
              ...DEFAULT_SITE_TEXTS,
              ...(parsed.siteTexts || {}),
            },
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
    const search = window.location.search.toLowerCase();
    return (
      path.includes('admin') ||
      hash.includes('admin') ||
      search.includes('admin')
    );
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

  // Sync with browser navigation (Back/Forward buttons & hash changes)
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminOpenState(checkIsAdminUrl());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Debounced sync with localStorage to eliminate typing lag
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to save portfolio data to localStorage:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [data]);

  // Listen for real-time updates across multiple tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setData(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to toggle Admin Panel
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

  const updateGeneralSettings = (
    settings: Partial<Pick<PortfolioData, 'brandName' | 'brandTagline' | 'githubUrl' | 'email' | 'linkedinUrl' | 'heroDescription'>>
  ) => {
    setData((prev) => ({
      ...prev,
      ...settings,
    }));
  };

  const updateSiteTexts = (texts: Partial<SiteTexts>) => {
    setData((prev) => ({
      ...prev,
      siteTexts: {
        ...prev.siteTexts,
        ...texts,
      },
    }));
  };

  // Projects CRUD
  const addProject = (project: Project) => {
    setData((prev) => ({
      ...prev,
      projects: [project, ...prev.projects],
    }));
  };

  const updateProject = (id: string, updated: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
  };

  const deleteProject = (id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // Journal CRUD
  const addJournalEntry = (entry: JournalEntry) => {
    setData((prev) => ({
      ...prev,
      journalEntries: [entry, ...prev.journalEntries],
    }));
  };

  const updateJournalEntry = (id: string, updated: Partial<JournalEntry>) => {
    setData((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.map((j) => (j.id === id ? { ...j, ...updated } : j)),
    }));
  };

  const deleteJournalEntry = (id: string) => {
    setData((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((j) => j.id !== id),
    }));
  };

  // Explorations CRUD
  const addExploration = (item: ExplorationItem) => {
    setData((prev) => ({
      ...prev,
      explorations: [item, ...prev.explorations],
    }));
  };

  const updateExploration = (id: string, updated: Partial<ExplorationItem>) => {
    setData((prev) => ({
      ...prev,
      explorations: prev.explorations.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp)),
    }));
  };

  const deleteExploration = (id: string) => {
    setData((prev) => ({
      ...prev,
      explorations: prev.explorations.filter((exp) => exp.id !== id),
    }));
  };

  // Services
  const updateService = (id: string, updated: Partial<ServiceOffering>) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updated } : s)),
    }));
  };

  // Stats
  const updateStat = (index: number, updated: Partial<BrandPrincipleStat>) => {
    setData((prev) => {
      const nextStats = [...prev.stats];
      if (nextStats[index]) {
        nextStats[index] = { ...nextStats[index], ...updated };
      }
      return { ...prev, stats: nextStats };
    });
  };

  // Reviews
  const addReview = (newReview: Omit<Review, 'id' | 'date'> & { id?: string; date?: string; status?: 'approved' | 'pending' }) => {
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
    }));
  };

  const updateReview = (id: string, updated: Partial<Review>) => {
    setData((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => (r.id === id ? { ...r, ...updated } : r)),
    }));
  };

  const verifyReview = (id: string, approve: boolean = true) => {
    setData((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === id ? { ...r, status: approve ? 'approved' : 'pending', verified: approve } : r
      ),
    }));
  };

  const deleteReview = (id: string) => {
    setData((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== id),
    }));
  };

  // Reset
  const resetToDefaults = () => {
    setData(DEFAULT_PORTFOLIO_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Export
  const exportDataJSON = () => {
    return JSON.stringify(data, null, 2);
  };

  // Import
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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'JSON parsing error' };
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        isAdminOpen,
        setIsAdminOpen,
        updateGeneralSettings,
        updateSiteTexts,
        addProject,
        updateProject,
        deleteProject,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addExploration,
        updateExploration,
        deleteExploration,
        updateService,
        updateStat,
        addReview,
        updateReview,
        verifyReview,
        deleteReview,
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
