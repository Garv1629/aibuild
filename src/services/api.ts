/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabase.ts';
import {
  Project,
  JournalEntry,
  ExplorationItem,
  ServiceOffering,
  Review,
  MediaAsset,
  ActivityLog,
  SiteTexts,
  BrandPrincipleStat,
  DEFAULT_SITE_TEXTS,
  STATS,
} from '../utils/portfolio.ts';

// ==============================================================================
// 1. DATABASE ROW <-> TYPESCRIPT INTERFACE TRANSFORMERS
// ==============================================================================

export const projectFromDb = (row: any): Project => ({
  id: row.id,
  title: row.title || '',
  category: row.category || 'Web Development',
  status: row.status || 'In Progress',
  description: row.description || '',
  year: row.year || '2026',
  span: (row.span === 5 ? 5 : 7) as 7 | 5,
  image: row.image || '',
  galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
  tags: Array.isArray(row.tags) ? row.tags : [],
  features: Array.isArray(row.features) ? row.features : [],
  workflow: row.workflow || '',
  demoType: row.demo_type || 'interactive-device',
  videoUrl: row.video_url || undefined,
  video: row.video || undefined,
  videoList: Array.isArray(row.video_list) ? row.video_list : [],
  isPublished: row.is_published ?? true,
  order: row.display_order ?? 0,
  demoUrl: row.demo_url || undefined,
  githubUrl: row.github_url || undefined,
  clientUrl: row.client_url || undefined,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

export const projectToDb = (p: Project): Record<string, any> => ({
  id: p.id,
  title: p.title,
  category: p.category,
  status: p.status,
  description: p.description,
  year: p.year,
  span: p.span,
  image: p.image,
  gallery_images: p.galleryImages || [],
  tags: p.tags || [],
  features: p.features || [],
  workflow: p.workflow,
  demo_type: p.demoType || 'interactive-device',
  video_url: p.videoUrl || null,
  video: p.video || null,
  video_list: p.videoList || [],
  is_published: p.isPublished ?? true,
  display_order: p.order ?? 0,
  demo_url: p.demoUrl || null,
  github_url: p.githubUrl || null,
  client_url: p.clientUrl || null,
  updated_at: new Date().toISOString(),
});

export const journalFromDb = (row: any): JournalEntry => ({
  id: row.id,
  title: row.title || '',
  slug: row.slug || row.id,
  readTime: row.read_time || '4 min read',
  date: row.date || 'Oct 2026',
  image: row.image || '',
  galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
  videoUrl: row.video_url || undefined,
  excerpt: row.excerpt || '',
  category: row.category || 'Engineering',
  isPublished: row.is_published ?? true,
  order: row.display_order ?? 0,
  author: row.author || 'AI Build Studio',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

export const journalToDb = (j: JournalEntry): Record<string, any> => ({
  id: j.id,
  title: j.title,
  slug: j.slug || j.id,
  read_time: j.readTime,
  date: j.date,
  image: j.image,
  gallery_images: j.galleryImages || [],
  video_url: j.videoUrl || null,
  excerpt: j.excerpt,
  category: j.category,
  is_published: j.isPublished ?? true,
  display_order: j.order ?? 0,
  author: j.author || 'AI Build Studio',
  updated_at: new Date().toISOString(),
});

export const explorationFromDb = (row: any): ExplorationItem => ({
  id: row.id,
  title: row.title || '',
  column: (row.column_number === 2 ? 2 : 1) as 1 | 2,
  rotation: Number(row.rotation) || 0,
  image: row.image || '',
  galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
  video: row.video || undefined,
  videoList: Array.isArray(row.video_list) ? row.video_list : [],
  category: row.category || 'Creative',
  description: row.description || '',
  isPublished: row.is_published ?? true,
  order: row.display_order ?? 0,
  createdAt: row.created_at || new Date().toISOString(),
});

export const explorationToDb = (e: ExplorationItem): Record<string, any> => ({
  id: e.id,
  title: e.title,
  column_number: e.column,
  rotation: e.rotation,
  image: e.image,
  gallery_images: e.galleryImages || [],
  video: e.video || null,
  video_list: e.videoList || [],
  category: e.category,
  description: e.description,
  is_published: e.isPublished ?? true,
  display_order: e.order ?? 0,
});

export const serviceFromDb = (row: any): ServiceOffering => ({
  id: row.id,
  title: row.title || '',
  shortDesc: row.short_desc || '',
  deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
  tools: Array.isArray(row.tools) ? row.tools : [],
  badge: row.badge || 'Core Studio Offering',
  statsLabel: row.stats_label || '',
  statsValue: row.stats_value || '',
  image: row.image || undefined,
  galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
  videoUrl: row.video_url || undefined,
});

export const serviceToDb = (s: ServiceOffering, order = 0): Record<string, any> => ({
  id: s.id,
  title: s.title,
  short_desc: s.shortDesc,
  deliverables: s.deliverables || [],
  tools: s.tools || [],
  badge: s.badge,
  stats_label: s.statsLabel,
  stats_value: s.statsValue,
  image: s.image || null,
  gallery_images: s.galleryImages || [],
  video_url: s.videoUrl || null,
  display_order: order,
});

export const reviewFromDb = (row: any): Review => ({
  id: row.id,
  name: row.name || 'Anonymous Client',
  role: row.role || 'Executive',
  company: row.company || undefined,
  category: row.category || 'Web Development',
  rating: Number(row.rating) || 5,
  content: row.content || '',
  date: row.date || 'Recent',
  avatar: row.avatar || undefined,
  verified: Boolean(row.verified),
  status: row.status || 'approved',
});

export const reviewToDb = (r: Review): Record<string, any> => ({
  id: r.id,
  name: r.name,
  role: r.role,
  company: r.company || null,
  category: r.category,
  rating: r.rating,
  content: r.content,
  date: r.date,
  avatar: r.avatar || null,
  verified: r.verified ?? false,
  status: r.status || 'pending',
});

export const mediaAssetFromDb = (row: any): MediaAsset => ({
  id: row.id,
  title: row.title || '',
  fileName: row.file_name || '',
  url: row.url || '',
  type: (row.type === 'video' ? 'video' : 'image') as 'image' | 'video',
  mimeType: row.mime_type || 'image/jpeg',
  sizeBytes: Number(row.size_bytes) || 0,
  storageProvider: (row.storage_provider === 'supabase' ? 'supabase' : 'local') as 'supabase' | 'local',
  storagePath: row.storage_path || undefined,
  createdAt: row.created_at || new Date().toISOString(),
  tags: Array.isArray(row.tags) ? row.tags : [],
});

export const mediaAssetToDb = (m: MediaAsset): Record<string, any> => ({
  id: m.id,
  title: m.title,
  file_name: m.fileName,
  url: m.url,
  type: m.type,
  mime_type: m.mimeType,
  size_bytes: m.sizeBytes,
  storage_provider: m.storageProvider,
  storage_path: m.storagePath || null,
  tags: m.tags || [],
});

export const activityLogFromDb = (row: any): ActivityLog => ({
  id: row.id,
  action: row.action || 'update',
  target: row.target || 'content',
  title: row.title || '',
  timestamp: row.timestamp ? new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
  details: row.details || undefined,
});

export const activityLogToDb = (a: ActivityLog): Record<string, any> => ({
  id: a.id,
  action: a.action,
  target: a.target,
  title: a.title,
  timestamp: new Date().toISOString(),
  details: a.details || null,
});

// ==============================================================================
// 2. DATA ACCESS LAYER (API METHODS)
// ==============================================================================

export const api = {
  // ----------------------------------------------------------------------------
  // Projects
  // ----------------------------------------------------------------------------
  async fetchProjects(options?: { publishedOnly?: boolean; token?: string }): Promise<{ data: Project[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const query = options?.publishedOnly
      ? 'is_published=eq.true&order=display_order.asc'
      : 'order=display_order.asc';
    const { data, error } = await supabase.from('projects').select('*', query, options?.token);
    if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch projects' };
    return { data: data.map(projectFromDb), error: null };
  },

  async upsertProject(project: Project, token?: string): Promise<{ data: Project | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const row = projectToDb(project);
    const { data, error } = await supabase.from('projects').upsert(row, 'id', token);
    if (error) return { data: null, error: error.message };
    const saved = Array.isArray(data) && data[0] ? projectFromDb(data[0]) : project;
    return { data: saved, error: null };
  },

  async deleteProject(id: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const { error } = await supabase.from('projects').delete(id, token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  // ----------------------------------------------------------------------------
  // Journal
  // ----------------------------------------------------------------------------
  async fetchJournal(options?: { publishedOnly?: boolean; token?: string }): Promise<{ data: JournalEntry[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const query = options?.publishedOnly
      ? 'is_published=eq.true&order=display_order.asc'
      : 'order=display_order.asc';
    const { data, error } = await supabase.from('journal_entries').select('*', query, options?.token);
    if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch journal' };
    return { data: data.map(journalFromDb), error: null };
  },

  async upsertJournalEntry(entry: JournalEntry, token?: string): Promise<{ data: JournalEntry | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const row = journalToDb(entry);
    const { data, error } = await supabase.from('journal_entries').upsert(row, 'id', token);
    if (error) return { data: null, error: error.message };
    const saved = Array.isArray(data) && data[0] ? journalFromDb(data[0]) : entry;
    return { data: saved, error: null };
  },

  async deleteJournalEntry(id: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const { error } = await supabase.from('journal_entries').delete(id, token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  // ----------------------------------------------------------------------------
  // Explorations
  // ----------------------------------------------------------------------------
  async fetchExplorations(options?: { publishedOnly?: boolean; token?: string }): Promise<{ data: ExplorationItem[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const query = options?.publishedOnly
      ? 'is_published=eq.true&order=display_order.asc'
      : 'order=display_order.asc';
    const { data, error } = await supabase.from('explorations').select('*', query, options?.token);
    if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch explorations' };
    return { data: data.map(explorationFromDb), error: null };
  },

  async upsertExploration(item: ExplorationItem, token?: string): Promise<{ data: ExplorationItem | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const row = explorationToDb(item);
    const { data, error } = await supabase.from('explorations').upsert(row, 'id', token);
    if (error) return { data: null, error: error.message };
    const saved = Array.isArray(data) && data[0] ? explorationFromDb(data[0]) : item;
    return { data: saved, error: null };
  },

  async deleteExploration(id: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const { error } = await supabase.from('explorations').delete(id, token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  // ----------------------------------------------------------------------------
  // Services
  // ----------------------------------------------------------------------------
  async fetchServices(token?: string): Promise<{ data: ServiceOffering[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const { data, error } = await supabase.from('services').select('*', 'order=display_order.asc', token);
    if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch services' };
    return { data: data.map(serviceFromDb), error: null };
  },

  async upsertService(service: ServiceOffering, order = 0, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const row = serviceToDb(service, order);
    const { error } = await supabase.from('services').upsert(row, 'id', token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  // ----------------------------------------------------------------------------
  // Reviews
  // ----------------------------------------------------------------------------
  async fetchReviews(options?: { approvedOnly?: boolean; token?: string }): Promise<{ data: Review[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const query = options?.approvedOnly
      ? 'status=eq.approved&order=created_at.desc'
      : 'order=created_at.desc';
    const { data, error } = await supabase.from('reviews').select('*', query, options?.token);
    if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch reviews' };
    return { data: data.map(reviewFromDb), error: null };
  },

  async submitPublicReview(review: Omit<Review, 'id' | 'date'> & { id?: string }): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const id = review.id || `rev-${Date.now()}`;
    const row = {
      id,
      name: review.name,
      role: review.role,
      company: review.company || null,
      category: review.category,
      rating: review.rating,
      content: review.content,
      date: 'Just now',
      avatar: review.avatar || null,
      verified: false,
      status: 'pending',
    };
    const { error } = await supabase.from('reviews').insert(row);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  async updateReview(id: string, updates: Partial<Review>, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const rowUpdates: Record<string, any> = {};
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.verified !== undefined) rowUpdates.verified = updates.verified;
    if (updates.content !== undefined) rowUpdates.content = updates.content;
    if (updates.rating !== undefined) rowUpdates.rating = updates.rating;
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.role !== undefined) rowUpdates.role = updates.role;
    if (updates.company !== undefined) rowUpdates.company = updates.company;

    const { error } = await supabase.from('reviews').update(id, rowUpdates, token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  async deleteReview(id: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const { error } = await supabase.from('reviews').delete(id, token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  // ----------------------------------------------------------------------------
  // Site Content & Brand Settings
  // ----------------------------------------------------------------------------
  async fetchSiteContent(token?: string): Promise<{ data: Record<string, any> | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const { data, error } = await supabase.from('site_content').select('*', '', token);
    if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch site content' };
    const map: Record<string, any> = {};
    for (const item of data) {
      if (item.key && item.content) {
        map[item.key] = item.content;
      }
    }
    return { data: map, error: null };
  },

  async upsertSiteContent(key: string, content: any, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const row = {
      key,
      content,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('site_content').upsert(row, 'key', token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  // ----------------------------------------------------------------------------
  // Media Assets
  // ----------------------------------------------------------------------------
  async fetchMediaAssets(token?: string): Promise<{ data: MediaAsset[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const { data, error } = await supabase.from('media_assets').select('*', 'order=created_at.desc', token);
    if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch media assets' };
    return { data: data.map(mediaAssetFromDb), error: null };
  },

  async upsertMediaAsset(asset: MediaAsset, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const row = mediaAssetToDb(asset);
    const { error } = await supabase.from('media_assets').upsert(row, 'id', token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  async deleteMediaAsset(id: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const { error } = await supabase.from('media_assets').delete(id, token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  // ----------------------------------------------------------------------------
  // Activity Logs
  // ----------------------------------------------------------------------------
  async fetchActivityLogs(token?: string): Promise<{ data: ActivityLog[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    const { data, error } = await supabase.from('activity_logs').select('*', 'order=timestamp.desc&limit=30', token);
    if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch activity logs' };
    return { data: data.map(activityLogFromDb), error: null };
  },

  async insertActivityLog(log: ActivityLog, token?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    const row = activityLogToDb(log);
    const { error } = await supabase.from('activity_logs').insert(row, token);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },
};
