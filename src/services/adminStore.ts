import {
  ProjectItem,
  WebsiteContent,
  PublicReview,
  PublicMessage,
  AdminTab,
  ServiceItem,
  ServiceMediaItem,
  SavedScopeQuote,
  EstimatorSettings,
  CharacterLightingPresetId,
  CharacterLightingSettings,
  ContentPublishStatus,
} from '../types';
import {
  sanitizeInput,
  sanitizeEmail,
  verifyOwnerPasscode,
  updateOwnerPasscode,
  addAuditLog,
  initializeSecurity,
} from './security';
import { DEFAULT_LIGHTING_PRESET } from '../utils/lightingPresets';
import { isVideoMedia } from '../utils/mediaUpload';
import { api } from './api';
import {
  initialProjects,
  initialWebsiteContent,
  initialReviews,
  initialMessages,
  initialSavedQuotes,
  initialEstimatorSettings,
} from '../../server/seedData';

export {
  initialProjects,
  initialWebsiteContent,
  initialReviews,
  initialMessages,
  initialSavedQuotes,
  initialEstimatorSettings,
};

export const normalizeProjectCategory = (
  category: string
): 'UGC ADS' | 'AI VIDEOS' | 'WEBSITE BUILDING' | 'AUTOMATION' => {
  const c = (category || '').trim().toUpperCase();
  if (c.includes('UGC') || c.includes('CREATOR') || (c.includes('AD') && !c.includes('SQUAD'))) return 'UGC ADS';
  if (c.includes('VIDEO') || c.includes('FILM') || c.includes('CINEMA') || c.includes('MOTION')) return 'AI VIDEOS';
  if (c.includes('AUTO') || c.includes('AGENT') || c.includes('BOT') || c.includes('WORKFLOW') || c.includes('PIPELINE')) return 'AUTOMATION';
  return 'WEBSITE BUILDING';
};

export const resolveProjectAspectRatio = (project?: Partial<ProjectItem> | null): '16:9' | '9:16' => {
  if (!project) return '16:9';
  // 1. Explicit user override from Admin Settings
  if (project.aspectRatio === '9:16') return '9:16';
  if (project.aspectRatio === '16:9') return '16:9';

  // 2. Check active primary media item or videoUrl
  const firstMedia = (project.mediaItems || []).find((m) => m && m.url && m.url.trim().length > 0);
  if (firstMedia?.aspectRatio === '9:16') return '9:16';
  if (firstMedia?.aspectRatio === '16:9') return '16:9';

  const primaryUrl = (firstMedia?.url || project.videoUrl || project.col2Image || '').toLowerCase();
  const primaryTitle = (firstMedia?.title || '').toLowerCase();

  // Explicit vertical markers in media URL or title
  if (
    primaryUrl.includes('vertical') ||
    primaryUrl.includes('reel') ||
    primaryUrl.includes('tiktok') ||
    primaryUrl.includes('shorts') ||
    primaryUrl.includes('9:16') ||
    primaryUrl.includes('9-16') ||
    primaryTitle.includes('vertical') ||
    primaryTitle.includes('9:16') ||
    primaryUrl.includes('43666') ||
    primaryUrl.includes('41566')
  ) {
    return '9:16';
  }

  // Explicit 16:9 / cinema / landscape markers in media URL or title
  if (
    primaryUrl.includes('16:9') ||
    primaryUrl.includes('16-9') ||
    primaryUrl.includes('cinema') ||
    primaryUrl.includes('widescreen') ||
    primaryUrl.includes('landscape') ||
    primaryUrl.includes('horizontal') ||
    primaryTitle.includes('16:9') ||
    primaryTitle.includes('cinema') ||
    primaryTitle.includes('landscape') ||
    primaryUrl.includes('31910') ||
    primaryUrl.includes('31518') ||
    primaryUrl.includes('31911') ||
    primaryUrl.includes('41584')
  ) {
    return '16:9';
  }

  // If a video URL exists and is not marked vertical, it's standard 16:9
  if (primaryUrl && isVideoMedia(primaryUrl)) {
    return '16:9';
  }

  // 3. Fallback for unconfigured initial UGC ADS items only if no media exists
  const normCat = normalizeProjectCategory(project.category || '');
  if (normCat === 'UGC ADS' && !primaryUrl) {
    return '9:16';
  }

  return '16:9';
};

export interface AdminStoreState {
  projects: ProjectItem[];
  websiteContent: WebsiteContent;
  publishedContent?: WebsiteContent;
  draftContent?: WebsiteContent;
  publishStatus?: ContentPublishStatus;
  publishedAt?: string | null;
  hasDraftChanges?: boolean;
  reviews: PublicReview[];
  messages: PublicMessage[];
  savedQuotes: SavedScopeQuote[];
  estimatorSettings: EstimatorSettings;
  isSyncing?: boolean;
}

class AdminDataStore {
  private projects: ProjectItem[] = initialProjects as unknown as ProjectItem[];
  private websiteContent: WebsiteContent = initialWebsiteContent as unknown as WebsiteContent;
  private publishedContent: WebsiteContent = initialWebsiteContent as unknown as WebsiteContent;
  private draftContent: WebsiteContent = initialWebsiteContent as unknown as WebsiteContent;
  private publishStatus: ContentPublishStatus = 'published';
  private publishedAt: string | null = null;
  private hasDraftChanges = false;
  private reviews: PublicReview[] = initialReviews as unknown as PublicReview[];
  private messages: PublicMessage[] = initialMessages as unknown as PublicMessage[];
  private savedQuotes: SavedScopeQuote[] = initialSavedQuotes as unknown as SavedScopeQuote[];
  private estimatorSettings: EstimatorSettings = initialEstimatorSettings as unknown as EstimatorSettings;
  private listeners: Array<(state: AdminStoreState) => void> = [];
  private isSyncing = false;
  private initialFetchPromise: Promise<void> | null = null;

  constructor() {
    this.initialFetchPromise = this.fetchFromDatabase();
  }

  public async fetchFromDatabase(): Promise<void> {
    this.isSyncing = true;
    try {
      const [adminSettingsRes, projects, reviews, messages, quotes, estimator] = await Promise.allSettled([
        api.getSiteSettingsAdmin(),
        api.getProjects(true, true),
        api.getReviews(true, true),
        api.getMessages(true),
        api.getSavedQuotes(true),
        api.getEstimatorSettings(),
      ]);

      if (adminSettingsRes.status === 'fulfilled' && adminSettingsRes.value) {
        const s = adminSettingsRes.value;
        this.publishStatus = s.status || 'published';
        this.publishedAt = s.publishedAt || null;
        this.hasDraftChanges = Boolean(s.hasDraftChanges);
        this.publishedContent = (s.published || initialWebsiteContent) as unknown as WebsiteContent;
        this.draftContent = (s.draft || s.published || initialWebsiteContent) as unknown as WebsiteContent;
        this.websiteContent = this.draftContent;
      } else {
        // Fallback to basic public getSiteSettings
        const publicSettings = await api.getSiteSettings().catch(() => null);
        if (publicSettings) {
          this.websiteContent = {
            ...initialWebsiteContent,
            ...publicSettings,
          };
          this.publishedContent = this.websiteContent;
          this.draftContent = this.websiteContent;
        }
      }

      if (projects.status === 'fulfilled' && Array.isArray(projects.value) && projects.value.length > 0) {
        this.projects = projects.value;
      }

      if (reviews.status === 'fulfilled' && Array.isArray(reviews.value)) {
        this.reviews = reviews.value;
      }

      if (messages.status === 'fulfilled' && Array.isArray(messages.value)) {
        this.messages = messages.value;
      }

      if (quotes.status === 'fulfilled' && Array.isArray(quotes.value)) {
        this.savedQuotes = quotes.value;
      }

      if (estimator.status === 'fulfilled' && estimator.value) {
        this.estimatorSettings = {
          ...initialEstimatorSettings,
          ...estimator.value,
          categories: {
            ...initialEstimatorSettings.categories,
            ...(estimator.value.categories || {}),
          },
        };
      }
    } catch (err) {
      console.warn('[AdminStore] Error fetching from database backend, using fallback:', err);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  public getState(): AdminStoreState {
    return {
      projects: this.projects,
      websiteContent: this.websiteContent,
      publishedContent: this.publishedContent,
      draftContent: this.draftContent,
      publishStatus: this.publishStatus,
      publishedAt: this.publishedAt,
      hasDraftChanges: this.hasDraftChanges,
      reviews: this.reviews,
      messages: this.messages,
      savedQuotes: this.savedQuotes,
      estimatorSettings: this.estimatorSettings,
      isSyncing: this.isSyncing,
    };
  }

  private notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('[AdminStore] Listener error:', err);
      }
    });
  }

  public subscribe(listener: (state: AdminStoreState) => void) {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // --- OWNER SECURITY & AUTH ENGINE ---
  public async validateOwnerPin(enteredPin: string): Promise<boolean> {
    return await verifyOwnerPasscode(enteredPin);
  }

  public async setOwnerPin(currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
    return await updateOwnerPasscode(currentPin, newPin);
  }

  // --- PROJECTS API (DRAFT & PUBLISH) ---
  public getProjects(): ProjectItem[] {
    return [...this.projects];
  }

  public async addProject(project: Omit<ProjectItem, 'id'> | ProjectItem): Promise<ProjectItem> {
    const tempId = 'id' in project && project.id ? project.id : `proj-${Date.now()}`;
    const newProject: ProjectItem = {
      ...project,
      id: tempId,
      number: project.number || (this.projects.length + 1 < 10 ? `0${this.projects.length + 1}` : `${this.projects.length + 1}`),
      title: sanitizeInput(project.title || 'Untitled Project', 120),
      category: project.category || 'UGC ADS',
      tagline: sanitizeInput(project.tagline || '', 250),
      col1Image1: project.col1Image1 || '',
      col1Image2: project.col1Image2 || '',
      col2Image: project.col2Image || '',
      videoUrl: project.videoUrl || '',
      mediaType: project.mediaType || (project.videoUrl ? 'video' : 'image'),
      mediaItems: project.mediaItems || [],
      liveUrl: project.liveUrl || '',
      techStack: project.techStack || ['React', 'TypeScript', 'Tailwind'],
      featured: project.featured !== undefined ? project.featured : true,
      aspectRatio: project.aspectRatio || 'auto',
      status: project.status || 'published',
      published: project.status ? project.status === 'published' : true,
    };

    this.projects = [newProject, ...this.projects];
    this.notifyListeners();

    try {
      const persisted = await api.createProject(newProject);
      this.projects = this.projects.map((p) => (p.id === tempId ? persisted : p));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to save project to database:', err);
      this.projects = this.projects.filter((p) => p.id !== tempId);
      this.notifyListeners();
      throw err;
    }
  }

  public async updateProject(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem> {
    const previous = this.projects.find((p) => p.id === id);
    if (!previous) throw new Error(`Project with ID ${id} not found`);

    const updated = {
      ...previous,
      ...updates,
      title: updates.title !== undefined ? sanitizeInput(updates.title, 120) : previous.title,
      tagline: updates.tagline !== undefined ? sanitizeInput(updates.tagline, 250) : previous.tagline,
    };

    this.projects = this.projects.map((p) => (p.id === id ? updated : p));
    this.notifyListeners();

    try {
      const persisted = await api.updateProject(id, updates);
      this.projects = this.projects.map((p) => (p.id === id ? persisted : p));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to update project in database:', err);
      this.projects = this.projects.map((p) => (p.id === id ? previous : p));
      this.notifyListeners();
      throw err;
    }
  }

  public async publishProject(id: string): Promise<ProjectItem> {
    const previous = this.projects.find((p) => p.id === id);
    if (!previous) throw new Error(`Project with ID ${id} not found`);

    const updated: ProjectItem = {
      ...previous,
      status: 'published',
      published: true,
      publishedAt: new Date().toISOString(),
    };

    this.projects = this.projects.map((p) => (p.id === id ? updated : p));
    this.notifyListeners();

    try {
      const persisted = await api.publishProject(id);
      this.projects = this.projects.map((p) => (p.id === id ? persisted : p));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      this.projects = this.projects.map((p) => (p.id === id ? previous : p));
      this.notifyListeners();
      throw err;
    }
  }

  public async unpublishProject(id: string): Promise<ProjectItem> {
    const previous = this.projects.find((p) => p.id === id);
    if (!previous) throw new Error(`Project with ID ${id} not found`);

    const updated: ProjectItem = {
      ...previous,
      status: 'unpublished',
      published: false,
    };

    this.projects = this.projects.map((p) => (p.id === id ? updated : p));
    this.notifyListeners();

    try {
      const persisted = await api.unpublishProject(id);
      this.projects = this.projects.map((p) => (p.id === id ? persisted : p));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      this.projects = this.projects.map((p) => (p.id === id ? previous : p));
      this.notifyListeners();
      throw err;
    }
  }

  public async draftProject(id: string): Promise<ProjectItem> {
    const previous = this.projects.find((p) => p.id === id);
    if (!previous) throw new Error(`Project with ID ${id} not found`);

    const updated: ProjectItem = {
      ...previous,
      status: 'draft',
      published: false,
    };

    this.projects = this.projects.map((p) => (p.id === id ? updated : p));
    this.notifyListeners();

    try {
      const persisted = await api.draftProject(id);
      this.projects = this.projects.map((p) => (p.id === id ? persisted : p));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      this.projects = this.projects.map((p) => (p.id === id ? previous : p));
      this.notifyListeners();
      throw err;
    }
  }

  public async deleteProject(id: string, permanent = false): Promise<void> {
    const previous = [...this.projects];
    if (!permanent) {
      this.projects = this.projects.map((p) =>
        p.id === id ? { ...p, isDeleted: true, status: 'archived' as const } : p
      );
    } else {
      this.projects = this.projects.filter((p) => p.id !== id);
    }
    this.notifyListeners();

    try {
      await api.deleteProject(id, permanent);
      addAuditLog(
        'PROJECT_DELETE',
        `${permanent ? 'Permanently deleted' : 'Moved to trash (soft-delete)'} project ${id}`,
        'warning'
      );
    } catch (err) {
      console.error('[AdminStore] Failed to delete project from database:', err);
      this.projects = previous;
      this.notifyListeners();
      throw err;
    }
  }

  public async restoreProject(id: string): Promise<ProjectItem> {
    const previous = [...this.projects];
    this.projects = this.projects.map((p) =>
      p.id === id ? { ...p, isDeleted: false, status: 'published' as const } : p
    );
    this.notifyListeners();

    try {
      const restored = await api.restoreProject(id);
      this.projects = this.projects.map((p) => (p.id === id ? restored : p));
      this.notifyListeners();
      addAuditLog('PROJECT_RESTORE', `Restored project "${restored.title}" from trash`, 'info');
      return restored;
    } catch (err) {
      console.error('[AdminStore] Failed to restore project:', err);
      this.projects = previous;
      this.notifyListeners();
      throw err;
    }
  }

  public async reorderProjects(newOrder: ProjectItem[]): Promise<ProjectItem[]> {
    const previous = [...this.projects];
    this.projects = newOrder;
    this.notifyListeners();

    try {
      const persisted = await api.reorderProjects(newOrder);
      this.projects = persisted;
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to reorder projects in database:', err);
      this.projects = previous;
      this.notifyListeners();
      throw err;
    }
  }

  // --- WEBSITE CONTENT (DRAFT & PUBLISH) API ---
  public getWebsiteContent(): WebsiteContent {
    return { ...this.websiteContent };
  }

  public getPublishedContent(): WebsiteContent {
    return { ...this.publishedContent };
  }

  public getDraftContent(): WebsiteContent {
    return { ...this.draftContent };
  }

  public getPublishStatus(): { status: ContentPublishStatus; publishedAt: string | null; hasDraftChanges: boolean } {
    return {
      status: this.publishStatus,
      publishedAt: this.publishedAt,
      hasDraftChanges: this.hasDraftChanges,
    };
  }

  public async saveContentDraft(updates: Partial<WebsiteContent>): Promise<WebsiteContent> {
    const previous = { ...this.websiteContent };
    const merged = {
      ...this.websiteContent,
      ...updates,
      hero: { ...this.websiteContent.hero, ...(updates.hero || {}) },
      about: { ...this.websiteContent.about, ...(updates.about || {}) },
      contact: { ...this.websiteContent.contact, ...(updates.contact || {}) },
      marquee: { ...this.websiteContent.marquee, ...(updates.marquee || {}) },
      services: updates.services
        ? {
            heading: updates.services.heading ?? this.websiteContent.services?.heading ?? 'WHAT WE DO',
            subheading: updates.services.subheading ?? this.websiteContent.services?.subheading ?? '',
            items: updates.services.items ?? this.websiteContent.services?.items ?? [],
          }
        : this.websiteContent.services,
      characterLighting: {
        ...(this.websiteContent.characterLighting || initialWebsiteContent.characterLighting!),
        ...(updates.characterLighting || {}),
      },
    };

    this.draftContent = merged as unknown as WebsiteContent;
    this.websiteContent = merged as unknown as WebsiteContent;
    this.publishStatus = 'modified';
    this.hasDraftChanges = true;
    this.notifyListeners();

    try {
      const res = await api.saveSiteSettingsDraft(updates);
      this.draftContent = (res.draft || merged) as unknown as WebsiteContent;
      this.publishedContent = (res.published || this.publishedContent) as unknown as WebsiteContent;
      this.websiteContent = this.draftContent;
      this.publishStatus = res.status || 'modified';
      this.publishedAt = res.publishedAt || this.publishedAt;
      this.hasDraftChanges = Boolean(res.hasDraftChanges);
      this.notifyListeners();
      return this.draftContent;
    } catch (err) {
      console.error('[AdminStore] Failed to save draft to database:', err);
      this.websiteContent = previous;
      this.draftContent = previous;
      this.notifyListeners();
      throw err;
    }
  }

  public async publishContent(content?: Partial<WebsiteContent>): Promise<WebsiteContent> {
    const payload = content || this.websiteContent;
    try {
      const res = await api.publishSiteSettings(payload);
      this.publishedContent = (res.published || payload) as unknown as WebsiteContent;
      this.draftContent = this.publishedContent;
      this.websiteContent = this.publishedContent;
      this.publishStatus = 'published';
      this.publishedAt = res.publishedAt || new Date().toISOString();
      this.hasDraftChanges = false;
      this.notifyListeners();
      return this.publishedContent;
    } catch (err) {
      console.error('[AdminStore] Failed to publish website content to database:', err);
      throw err;
    }
  }

  public async revertContentDraft(): Promise<WebsiteContent> {
    try {
      const res = await api.revertSiteSettingsDraft();
      this.publishedContent = (res.published || initialWebsiteContent) as unknown as WebsiteContent;
      this.draftContent = this.publishedContent;
      this.websiteContent = this.publishedContent;
      this.publishStatus = 'published';
      this.publishedAt = res.publishedAt || this.publishedAt;
      this.hasDraftChanges = false;
      this.notifyListeners();
      return this.publishedContent;
    } catch (err) {
      console.error('[AdminStore] Failed to revert draft in database:', err);
      throw err;
    }
  }

  public async updateWebsiteContent(updates: Partial<WebsiteContent>): Promise<WebsiteContent> {
    return await this.saveContentDraft(updates);
  }

  public async saveWebsiteContent(content: WebsiteContent): Promise<WebsiteContent> {
    return await this.publishContent(content);
  }

  // --- 3D CHARACTER LIGHTING PRESETS API ---
  public getCharacterLighting(): CharacterLightingSettings {
    return (this.websiteContent.characterLighting || initialWebsiteContent.characterLighting!) as unknown as CharacterLightingSettings;
  }

  public async updateLightingPreset(
    presetId: CharacterLightingPresetId,
    customOptions?: Partial<CharacterLightingSettings>
  ): Promise<CharacterLightingSettings> {
    const currentLighting = this.getCharacterLighting();
    const newLighting: CharacterLightingSettings = {
      ...currentLighting,
      ...customOptions,
      activePreset: presetId,
    };
    await this.updateWebsiteContent({
      characterLighting: newLighting,
    });
    addAuditLog('CONTENT_UPDATE', `3D Character lighting preset set to "${presetId}"`, 'info');
    return newLighting;
  }

  // --- PUBLIC REVIEWS & RATINGS API ---
  public getReviews(): PublicReview[] {
    return [...this.reviews];
  }

  public getApprovedReviews(): PublicReview[] {
    return this.reviews.filter((r) => r.status === 'approved');
  }

  public getAverageRating(): { average: number; count: number; breakdown: Record<number, number> } {
    const approved = this.getApprovedReviews();
    if (approved.length === 0) return { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    const sum = approved.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / approved.length).toFixed(1));
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approved.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      breakdown[rounded] = (breakdown[rounded] || 0) + 1;
    });
    return { average, count: approved.length, breakdown };
  }

  public async addReview(review: Omit<PublicReview, 'id' | 'date'> & { date?: string }): Promise<PublicReview> {
    const tempId = `rev-${Date.now()}`;
    const newRev: PublicReview = {
      ...review,
      id: tempId,
      author: sanitizeInput(review.author || 'Verified Client', 80),
      role: sanitizeInput(review.role || 'Client', 80),
      company: sanitizeInput(review.company || 'Digital Studio', 80),
      comment: sanitizeInput(review.comment || '', 1000),
      date: review.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: review.status || 'approved',
      isFeatured: review.isFeatured ?? false,
    };
    this.reviews = [newRev, ...this.reviews];
    this.notifyListeners();

    try {
      const persisted = await api.createReview(newRev);
      this.reviews = this.reviews.map((r) => (r.id === tempId ? persisted : r));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to save review to database:', err);
      this.reviews = this.reviews.filter((r) => r.id !== tempId);
      this.notifyListeners();
      throw err;
    }
  }

  public async updateReview(id: string, updates: Partial<PublicReview>): Promise<PublicReview> {
    const previous = this.reviews.find((r) => r.id === id);
    if (!previous) throw new Error(`Review ${id} not found`);

    this.reviews = this.reviews.map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.notifyListeners();

    try {
      const persisted = await api.updateReview(id, updates);
      this.reviews = this.reviews.map((r) => (r.id === id ? persisted : r));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to update review in database:', err);
      this.reviews = this.reviews.map((r) => (r.id === id ? previous : r));
      this.notifyListeners();
      throw err;
    }
  }

  public async deleteReview(id: string, permanent = false): Promise<void> {
    const previous = [...this.reviews];
    if (!permanent) {
      this.reviews = this.reviews.map((r) =>
        r.id === id ? { ...r, isDeleted: true, status: 'archived' as const } : r
      );
    } else {
      this.reviews = this.reviews.filter((r) => r.id !== id);
    }
    this.notifyListeners();

    try {
      await api.deleteReview(id, permanent);
      addAuditLog('REVIEW_DELETE', `${permanent ? 'Permanently deleted' : 'Moved to trash'} review ${id}`, 'warning');
    } catch (err) {
      console.error('[AdminStore] Failed to delete review from database:', err);
      this.reviews = previous;
      this.notifyListeners();
      throw err;
    }
  }

  public async restoreReview(id: string): Promise<PublicReview> {
    const previous = [...this.reviews];
    this.reviews = this.reviews.map((r) =>
      r.id === id ? { ...r, isDeleted: false, status: 'approved' as const } : r
    );
    this.notifyListeners();

    try {
      const restored = await api.restoreReview(id);
      this.reviews = this.reviews.map((r) => (r.id === id ? restored : r));
      this.notifyListeners();
      addAuditLog('REVIEW_RESTORE', `Restored review by "${restored.author}" from trash`, 'info');
      return restored;
    } catch (err) {
      console.error('[AdminStore] Failed to restore review:', err);
      this.reviews = previous;
      this.notifyListeners();
      throw err;
    }
  }

  public async reorderReviews(newOrder: PublicReview[]): Promise<PublicReview[]> {
    const previous = [...this.reviews];
    this.reviews = newOrder.map((r, idx) => ({ ...r, displayOrder: idx }));
    this.notifyListeners();

    try {
      const persisted = await api.reorderReviews(newOrder);
      this.reviews = persisted;
      this.notifyListeners();
      addAuditLog('REVIEW_REORDER', `Reordered ${newOrder.length} reviews and testimonials`, 'info');
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to reorder reviews in database:', err);
      this.reviews = previous;
      this.notifyListeners();
      throw err;
    }
  }

  // --- PUBLIC MESSAGES / INQUIRIES API ---
  public getMessages(): PublicMessage[] {
    return [...this.messages];
  }

  public async addMessage(msg: Omit<PublicMessage, 'id' | 'date' | 'status'> & { date?: string }): Promise<PublicMessage> {
    const tempId = `msg-${Date.now()}`;
    const newMsg: PublicMessage = {
      ...msg,
      id: tempId,
      name: sanitizeInput(msg.name || 'Direct Visitor', 80),
      email: sanitizeEmail(msg.email || ''),
      company: sanitizeInput(msg.company || 'Private Client', 80),
      projectType: sanitizeInput(msg.projectType || 'AI Products', 120),
      budget: sanitizeInput(msg.budget || 'Custom Scope', 60),
      message: sanitizeInput(msg.message || '', 2000),
      date: msg.date || 'Just now',
      status: 'unread',
    };
    this.messages = [newMsg, ...this.messages];
    this.notifyListeners();

    try {
      const persisted = await api.createMessage(newMsg);
      this.messages = this.messages.map((m) => (m.id === tempId ? persisted : m));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to submit message to database:', err);
      this.messages = this.messages.filter((m) => m.id !== tempId);
      this.notifyListeners();
      throw err;
    }
  }

  public async updateMessageStatus(id: string, status: PublicMessage['status']): Promise<PublicMessage> {
    const previous = this.messages.find((m) => m.id === id);
    if (!previous) throw new Error(`Message ${id} not found`);

    this.messages = this.messages.map((m) => (m.id === id ? { ...m, status } : m));
    this.notifyListeners();

    try {
      const persisted = await api.updateMessageStatus(id, status);
      this.messages = this.messages.map((m) => (m.id === id ? persisted : m));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to update message status in database:', err);
      this.messages = this.messages.map((m) => (m.id === id ? previous : m));
      this.notifyListeners();
      throw err;
    }
  }

  public async deleteMessage(id: string, permanent = false): Promise<void> {
    const previous = [...this.messages];
    if (!permanent) {
      this.messages = this.messages.map((m) =>
        m.id === id ? { ...m, isDeleted: true, status: 'archived' as const } : m
      );
    } else {
      this.messages = this.messages.filter((m) => m.id !== id);
    }
    this.notifyListeners();

    try {
      await api.deleteMessage(id, permanent);
      addAuditLog('INQUIRY_DELETE', `${permanent ? 'Permanently deleted' : 'Moved to trash'} message ${id}`, 'info');
    } catch (err) {
      console.error('[AdminStore] Failed to delete message from database:', err);
      this.messages = previous;
      this.notifyListeners();
      throw err;
    }
  }

  public async restoreMessage(id: string): Promise<PublicMessage> {
    const previous = [...this.messages];
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, isDeleted: false, status: 'read' as const } : m
    );
    this.notifyListeners();

    try {
      const restored = await api.restoreMessage(id);
      this.messages = this.messages.map((m) => (m.id === id ? restored : m));
      this.notifyListeners();
      addAuditLog('INQUIRY_RESTORE', `Restored message from "${restored.name}" from trash`, 'info');
      return restored;
    } catch (err) {
      console.error('[AdminStore] Failed to restore message:', err);
      this.messages = previous;
      this.notifyListeners();
      throw err;
    }
  }

  // --- SAVED SCOPE QUOTES / ESTIMATOR PROPOSALS API ---
  public getSavedQuotes(): SavedScopeQuote[] {
    return [...this.savedQuotes];
  }

  public async addSavedQuote(quote: Omit<SavedScopeQuote, 'id' | 'createdAt'> & { createdAt?: string }): Promise<SavedScopeQuote> {
    const tempId = `sq-${Date.now()}`;
    const newQuote: SavedScopeQuote = {
      ...quote,
      id: tempId,
      clientName: sanitizeInput(quote.clientName || 'Unnamed Client', 80),
      clientEmail: quote.clientEmail ? sanitizeEmail(quote.clientEmail) : undefined,
      serviceCategory: quote.serviceCategory || '01 - UGC ADS',
      budgetRange: sanitizeInput(quote.budgetRange || '$5,000 – $10,000', 60),
      turnaroundTime: sanitizeInput(quote.turnaroundTime || '5 – 10 Business Days', 60),
      deliverables: quote.deliverables || [],
      notes: quote.notes ? sanitizeInput(quote.notes, 1000) : '',
      createdAt: quote.createdAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: quote.status || 'draft',
    };
    this.savedQuotes = [newQuote, ...this.savedQuotes];
    this.notifyListeners();

    try {
      const persisted = await api.createSavedQuote(newQuote);
      this.savedQuotes = this.savedQuotes.map((q) => (q.id === tempId ? persisted : q));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to save quote to database:', err);
      this.savedQuotes = this.savedQuotes.filter((q) => q.id !== tempId);
      this.notifyListeners();
      throw err;
    }
  }

  public async updateSavedQuote(id: string, updates: Partial<SavedScopeQuote>): Promise<SavedScopeQuote> {
    const previous = this.savedQuotes.find((q) => q.id === id);
    if (!previous) throw new Error(`Saved Quote ${id} not found`);

    this.savedQuotes = this.savedQuotes.map((q) => (q.id === id ? { ...q, ...updates } : q));
    this.notifyListeners();

    try {
      const persisted = await api.updateSavedQuote(id, updates);
      this.savedQuotes = this.savedQuotes.map((q) => (q.id === id ? persisted : q));
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to update quote in database:', err);
      this.savedQuotes = this.savedQuotes.map((q) => (q.id === id ? previous : q));
      this.notifyListeners();
      throw err;
    }
  }

  public async deleteSavedQuote(id: string, permanent = false): Promise<void> {
    const previous = [...this.savedQuotes];
    if (!permanent) {
      this.savedQuotes = this.savedQuotes.map((q) =>
        q.id === id ? { ...q, isDeleted: true, status: 'archived' as const } : q
      );
    } else {
      this.savedQuotes = this.savedQuotes.filter((q) => q.id !== id);
    }
    this.notifyListeners();

    try {
      await api.deleteSavedQuote(id, permanent);
      addAuditLog('QUOTE_DELETE', `${permanent ? 'Permanently deleted' : 'Moved to trash'} quote ${id}`, 'info');
    } catch (err) {
      console.error('[AdminStore] Failed to delete quote from database:', err);
      this.savedQuotes = previous;
      this.notifyListeners();
      throw err;
    }
  }

  public async restoreSavedQuote(id: string): Promise<SavedScopeQuote> {
    const previous = [...this.savedQuotes];
    this.savedQuotes = this.savedQuotes.map((q) =>
      q.id === id ? { ...q, isDeleted: false, status: 'draft' as const } : q
    );
    this.notifyListeners();

    try {
      const restored = await api.restoreSavedQuote(id);
      this.savedQuotes = this.savedQuotes.map((q) => (q.id === id ? restored : q));
      this.notifyListeners();
      addAuditLog('QUOTE_RESTORE', `Restored proposal quote for "${restored.clientName}" from trash`, 'info');
      return restored;
    } catch (err) {
      console.error('[AdminStore] Failed to restore quote:', err);
      this.savedQuotes = previous;
      this.notifyListeners();
      throw err;
    }
  }

  // --- SERVICES SAFE DELETION & RESTORATION ---
  public async softDeleteService(serviceNumber: string): Promise<void> {
    const services = this.websiteContent.services?.items || [];
    const updatedItems = services.map((s) =>
      s.number === serviceNumber ? { ...s, isDeleted: true, deletedAt: new Date().toISOString() } : s
    );
    await this.saveContentDraft({
      services: {
        heading: this.websiteContent.services?.heading || 'WHAT WE DO',
        subheading: this.websiteContent.services?.subheading || '',
        items: updatedItems,
      },
    });
    addAuditLog('SERVICE_DELETE', `Moved service #${serviceNumber} to trash in draft`, 'warning');
  }

  public async restoreService(serviceNumber: string): Promise<void> {
    const services = this.websiteContent.services?.items || [];
    const updatedItems = services.map((s) =>
      s.number === serviceNumber ? { ...s, isDeleted: false, deletedAt: null } : s
    );
    await this.saveContentDraft({
      services: {
        heading: this.websiteContent.services?.heading || 'WHAT WE DO',
        subheading: this.websiteContent.services?.subheading || '',
        items: updatedItems,
      },
    });
    addAuditLog('SERVICE_RESTORE', `Restored service #${serviceNumber} from trash in draft`, 'info');
  }

  public async reorderServices(newOrder: ServiceItem[]): Promise<void> {
    const updatedItems = newOrder.map((s, idx) => ({ ...s, displayOrder: idx }));
    await this.saveContentDraft({
      services: {
        heading: this.websiteContent.services?.heading || 'WHAT WE DO',
        subheading: this.websiteContent.services?.subheading || '',
        items: updatedItems,
      },
    });
    addAuditLog('SERVICE_REORDER', `Reordered ${newOrder.length} services/disciplines in draft`, 'info');
  }

  // --- ESTIMATOR CMS CONFIGURATION API ---
  public getEstimatorSettings(): EstimatorSettings {
    return { ...this.estimatorSettings };
  }

  public async updateEstimatorSettings(updates: Partial<EstimatorSettings>): Promise<EstimatorSettings> {
    const previous = { ...this.estimatorSettings };
    this.estimatorSettings = {
      ...this.estimatorSettings,
      ...updates,
      categories: {
        ...this.estimatorSettings.categories,
        ...(updates.categories || {}),
        ugcAds: {
          ...this.estimatorSettings.categories.ugcAds,
          ...(updates.categories?.ugcAds || {}),
        },
        aiVideo: {
          ...this.estimatorSettings.categories.aiVideo,
          ...(updates.categories?.aiVideo || {}),
        },
        webAutomation: {
          ...this.estimatorSettings.categories.webAutomation,
          ...(updates.categories?.webAutomation || {}),
        },
      },
    };
    addAuditLog('CONTENT_UPDATE', 'Interactive Scope Estimator settings & pricing rates updated', 'info');
    this.notifyListeners();

    try {
      const persisted = await api.updateEstimatorSettings(updates);
      this.estimatorSettings = persisted;
      this.notifyListeners();
      return persisted;
    } catch (err) {
      console.error('[AdminStore] Failed to update estimator settings in database:', err);
      this.estimatorSettings = previous;
      this.notifyListeners();
      throw err;
    }
  }

  public async resetEstimatorSettings(): Promise<void> {
    await this.updateEstimatorSettings(initialEstimatorSettings);
  }

  // --- RESET DEFAULTS ---
  // ===================== VERSION HISTORY =====================
  public async getVersions(entityType = 'all', limit = 50): Promise<any[]> {
    try {
      return await api.getVersions(entityType, limit);
    } catch (err) {
      console.warn('[AdminStore] Failed to fetch version history:', err);
      return [];
    }
  }

  public async restoreVersion(versionId: string): Promise<any> {
    try {
      const res = await api.restoreVersion(versionId);
      await this.fetchFromDatabase();
      addAuditLog('VERSION_RESTORE', `Restored content from snapshot version ID: ${versionId}`, 'warning');
      return res;
    } catch (err) {
      console.error('[AdminStore] Failed to restore version:', err);
      throw err;
    }
  }

  public async resetToDefaults(): Promise<void> {
    try {
      await api.resetToDefaults();
      await this.fetchFromDatabase();
      addAuditLog('DATA_RESET', 'Website content & database restored to factory defaults', 'critical');
    } catch (err) {
      console.error('[AdminStore] Failed to reset database to defaults:', err);
      throw err;
    }
  }
}

// Auto-initialize security subsystem
initializeSecurity();

export const adminStore = new AdminDataStore();

/**
 * Web Audio API synthesizer for studio tactile interaction sounds
 */
export function playStudioChime(type: 'click' | 'success' | 'alert' = 'click') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // AudioContext blocked or not supported in environment
  }
}
