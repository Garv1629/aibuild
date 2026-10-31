/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabase.ts';
import type {
  Project,
  JournalEntry,
  ExplorationItem,
  ServiceOffering,
  Review,
  MediaAsset,
  ActivityLog,
  ClientInquiry,
} from '../utils/portfolio.ts';

// ==============================================================================
// 1. DATABASE ROW <-> TYPESCRIPT INTERFACE TRANSFORMERS
// ==============================================================================

export const inquiryFromDb = (row: any): ClientInquiry => ({
  id: row.id,
  name: row.name || 'Client',
  email: row.email || '',
  serviceType: row.service_type || 'Web Development',
  ideaDescription: row.idea_description || '',
  status: row.status || 'new',
  notes: row.notes || undefined,
  createdAt: row.created_at || new Date().toISOString(),
});

export const inquiryToDb = (i: ClientInquiry): Record<string, any> => ({
  id: (i.id && i.id.trim()) || `inq-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  name: i.name,
  email: i.email || null,
  service_type: i.serviceType,
  idea_description: i.ideaDescription,
  status: i.status || 'new',
  notes: i.notes || null,
  created_at: i.createdAt || new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

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
  name: row.name || 'Client',
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
  date: r.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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
// 2. DATA ACCESS LAYER (OFFICIAL SUPABASE SDK CLIENT)
// ==============================================================================

export const api = {
  // ----------------------------------------------------------------------------
  // Projects
  // ----------------------------------------------------------------------------
  async fetchProjects(options?: { publishedOnly?: boolean }): Promise<{ data: Project[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      let query = supabase.from('projects').select('*').order('display_order', { ascending: true });
      if (options?.publishedOnly) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch projects' };
      return { data: data.map(projectFromDb), error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch projects' };
    }
  },

  async upsertProject(project: Project): Promise<{ data: Project | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      const row = projectToDb(project);
      const { data, error } = await supabase.from('projects').upsert(row, { onConflict: 'id' }).select();
      if (error) return { data: null, error: error.message };
      const saved = Array.isArray(data) && data[0] ? projectFromDb(data[0]) : project;
      return { data: saved, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to upsert project' };
    }
  },

  async deleteProject(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete project' };
    }
  },

  // ----------------------------------------------------------------------------
  // Journal
  // ----------------------------------------------------------------------------
  async fetchJournal(options?: { publishedOnly?: boolean }): Promise<{ data: JournalEntry[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      let query = supabase.from('journal_entries').select('*').order('display_order', { ascending: true });
      if (options?.publishedOnly) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch journal' };
      return { data: data.map(journalFromDb), error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch journal' };
    }
  },

  async upsertJournalEntry(entry: JournalEntry): Promise<{ data: JournalEntry | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      const row = journalToDb(entry);
      const { data, error } = await supabase.from('journal_entries').upsert(row, { onConflict: 'id' }).select();
      if (error) return { data: null, error: error.message };
      const saved = Array.isArray(data) && data[0] ? journalFromDb(data[0]) : entry;
      return { data: saved, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to upsert journal entry' };
    }
  },

  async deleteJournalEntry(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const { error } = await supabase.from('journal_entries').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete journal entry' };
    }
  },

  // ----------------------------------------------------------------------------
  // Explorations
  // ----------------------------------------------------------------------------
  async fetchExplorations(options?: { publishedOnly?: boolean }): Promise<{ data: ExplorationItem[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      let query = supabase.from('explorations').select('*').order('display_order', { ascending: true });
      if (options?.publishedOnly) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch explorations' };
      return { data: data.map(explorationFromDb), error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch explorations' };
    }
  },

  async upsertExploration(item: ExplorationItem): Promise<{ data: ExplorationItem | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      const row = explorationToDb(item);
      const { data, error } = await supabase.from('explorations').upsert(row, { onConflict: 'id' }).select();
      if (error) return { data: null, error: error.message };
      const saved = Array.isArray(data) && data[0] ? explorationFromDb(data[0]) : item;
      return { data: saved, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to upsert exploration' };
    }
  },

  async deleteExploration(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const { error } = await supabase.from('explorations').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete exploration' };
    }
  },

  // ----------------------------------------------------------------------------
  // Services
  // ----------------------------------------------------------------------------
  async fetchServices(): Promise<{ data: ServiceOffering[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true });
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch services' };
      return { data: data.map(serviceFromDb), error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch services' };
    }
  },

  async upsertService(service: ServiceOffering, order = 0): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const row = serviceToDb(service, order);
      const { error } = await supabase.from('services').upsert(row, { onConflict: 'id' });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to upsert service' };
    }
  },

  // ----------------------------------------------------------------------------
  // Reviews
  // ----------------------------------------------------------------------------
  async fetchReviews(options?: { approvedOnly?: boolean }): Promise<{ data: Review[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (options?.approvedOnly) {
        query = query.eq('status', 'approved');
      }
      const { data, error } = await query;
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch reviews' };
      return { data: data.map(reviewFromDb), error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch reviews' };
    }
  },

  async submitPublicReview(review: Omit<Review, 'id' | 'date'> & { id?: string; date?: string }): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const id = review.id || `rev-${Date.now()}`;
      const row = {
        id,
        name: review.name,
        role: review.role,
        company: review.company || null,
        category: review.category,
        rating: review.rating,
        content: review.content,
        date: review.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avatar: review.avatar || null,
        verified: false,
        status: 'pending',
      };
      const { error } = await supabase.from('reviews').insert(row);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit review' };
    }
  },

  async updateReview(id: string, updates: Partial<Review>): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const rowUpdates: Record<string, any> = {};
      if (updates.status !== undefined) rowUpdates.status = updates.status;
      if (updates.verified !== undefined) rowUpdates.verified = updates.verified;
      if (updates.content !== undefined) rowUpdates.content = updates.content;
      if (updates.rating !== undefined) rowUpdates.rating = updates.rating;
      if (updates.name !== undefined) rowUpdates.name = updates.name;
      if (updates.role !== undefined) rowUpdates.role = updates.role;
      if (updates.company !== undefined) rowUpdates.company = updates.company;

      const { error } = await supabase.from('reviews').update(rowUpdates).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update review' };
    }
  },

  async deleteReview(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete review' };
    }
  },

  // ----------------------------------------------------------------------------
  // Site Content & Brand Settings
  // ----------------------------------------------------------------------------
  async fetchSiteContent(): Promise<{ data: Record<string, any> | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      const { data, error } = await supabase.from('site_content').select('*');
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch site content' };
      const map: Record<string, any> = {};
      for (const item of data) {
        if (item.key && item.content) {
          map[item.key] = item.content;
        }
      }
      return { data: map, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch site content' };
    }
  },

  async upsertSiteContent(key: string, content: any): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const row = {
        key,
        content,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('site_content').upsert(row, { onConflict: 'key' });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to upsert site content' };
    }
  },

  // ----------------------------------------------------------------------------
  // Media Assets
  // ----------------------------------------------------------------------------
  async fetchMediaAssets(): Promise<{ data: MediaAsset[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      const { data, error } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false });
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch media assets' };
      return { data: data.map(mediaAssetFromDb), error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch media assets' };
    }
  },

  async upsertMediaAsset(asset: MediaAsset): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const row = mediaAssetToDb(asset);
      const { error } = await supabase.from('media_assets').upsert(row, { onConflict: 'id' });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to upsert media asset' };
    }
  },

  async deleteMediaAsset(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const { error } = await supabase.from('media_assets').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete media asset' };
    }
  },

  // ----------------------------------------------------------------------------
  // Activity Logs
  // ----------------------------------------------------------------------------
  async fetchActivityLogs(): Promise<{ data: ActivityLog[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      const { data, error } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(30);
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch activity logs' };
      return { data: data.map(activityLogFromDb), error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch activity logs' };
    }
  },

  async insertActivityLog(log: ActivityLog): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const row = activityLogToDb(log);
      const { error } = await supabase.from('activity_logs').insert(row);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to insert activity log' };
    }
  },

  // ----------------------------------------------------------------------------
  // Client Inquiries / Leads (Dedicated Table with Public Insert & Admin Management)
  // ----------------------------------------------------------------------------
  async fetchInquiries(): Promise<{ data: ClientInquiry[] | null; error: string | null }> {
    if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured' };
    try {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (error || !Array.isArray(data)) return { data: null, error: error?.message || 'Failed to fetch inquiries' };
      return { data: data.map(inquiryFromDb), error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to fetch inquiries' };
    }
  },

  async submitPublicInquiry(inquiry: ClientInquiry): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const row = inquiryToDb(inquiry);
      const { error } = await supabase.from('inquiries').insert(row);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit inquiry' };
    }
  },

  async updateInquiryStatus(id: string, status: ClientInquiry['status'], notes?: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (notes !== undefined) updates.notes = notes;
      const { error } = await supabase.from('inquiries').update(updates).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update inquiry status' };
    }
  },

  async deleteInquiry(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete inquiry' };
    }
  },
};
