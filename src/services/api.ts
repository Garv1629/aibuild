import {
  ProjectItem,
  WebsiteContent,
  PublicReview,
  PublicMessage,
  SavedScopeQuote,
  EstimatorSettings,
  SiteSettingsAdminState,
  ContentPublishStatus,
} from '../types';

// Helper for session token
function getAuthHeader(): Record<string, string> {
  try {
    if (typeof window !== 'undefined') {
      const token =
        window.sessionStorage?.getItem('ai_build_owner_token') ||
        window.localStorage?.getItem('ai_build_owner_token');
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    }
  } catch {}
  return {};
}

// In-flight GET request deduplication map to prevent redundant concurrent network calls
const inFlightRequests = new Map<string, Promise<any>>();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = isGet ? `${endpoint}:${JSON.stringify(getAuthHeader())}` : null;

  if (isGet && cacheKey && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options.headers || {}),
      };

      const response = await fetch(endpoint, {
        cache: options.cache || 'no-store',
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMessage = errData.error;
          } else if (errData && errData.message) {
            errorMessage = errData.message;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data !== undefined ? data.data : data;
    } finally {
      if (isGet && cacheKey) {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (isGet && cacheKey) {
    inFlightRequests.set(cacheKey, promise);
  }

  return promise;
}

export const api = {
  // 1. Health
  checkHealth: async () => {
    return request<{ status: string; database: string }>('/api/health');
  },

  // 2. Site Settings / Content (Draft & Publish)
  getSiteSettings: async (): Promise<WebsiteContent> => {
    return request<WebsiteContent>('/api/site-settings');
  },

  getSiteSettingsAdmin: async (): Promise<SiteSettingsAdminState> => {
    return request<SiteSettingsAdminState>('/api/site-settings?admin=true');
  },

  saveSiteSettingsDraft: async (content: Partial<WebsiteContent>): Promise<SiteSettingsAdminState> => {
    return request<SiteSettingsAdminState>('/api/site-settings/draft', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  },

  publishSiteSettings: async (content?: Partial<WebsiteContent>): Promise<SiteSettingsAdminState> => {
    return request<SiteSettingsAdminState>('/api/site-settings/publish', {
      method: 'POST',
      body: JSON.stringify(content || {}),
    });
  },

  revertSiteSettingsDraft: async (): Promise<SiteSettingsAdminState> => {
    return request<SiteSettingsAdminState>('/api/site-settings/revert', {
      method: 'POST',
    });
  },

  updateSiteSettings: async (content: Partial<WebsiteContent>): Promise<WebsiteContent> => {
    return request<WebsiteContent>('/api/site-settings', {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  },

  // 3. Projects (Draft & Publish)
  getProjects: async (includeAll = false, includeDeleted = false): Promise<ProjectItem[]> => {
    return request<ProjectItem[]>(`/api/projects?all=${includeAll ? 'true' : 'false'}&include_deleted=${includeDeleted ? 'true' : 'false'}`);
  },

  getProjectById: async (id: string): Promise<ProjectItem> => {
    return request<ProjectItem>(`/api/projects/${id}`);
  },

  createProject: async (project: Omit<ProjectItem, 'id'> | Partial<ProjectItem>): Promise<ProjectItem> => {
    return request<ProjectItem>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  updateProject: async (id: string, updates: Partial<ProjectItem>): Promise<ProjectItem> => {
    return request<ProjectItem>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  publishProject: async (id: string): Promise<ProjectItem> => {
    return request<ProjectItem>(`/api/projects/${id}/publish`, {
      method: 'POST',
    });
  },

  unpublishProject: async (id: string): Promise<ProjectItem> => {
    return request<ProjectItem>(`/api/projects/${id}/unpublish`, {
      method: 'POST',
    });
  },

  draftProject: async (id: string): Promise<ProjectItem> => {
    return request<ProjectItem>(`/api/projects/${id}/draft`, {
      method: 'POST',
    });
  },

  restoreProject: async (id: string): Promise<ProjectItem> => {
    return request<ProjectItem>(`/api/projects/${id}/restore`, {
      method: 'POST',
    });
  },

  deleteProject: async (id: string, permanent = false): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/api/projects/${id}?permanent=${permanent ? 'true' : 'false'}`, {
      method: 'DELETE',
    });
  },

  reorderProjects: async (projects: ProjectItem[] | string[]): Promise<ProjectItem[]> => {
    return request<ProjectItem[]>('/api/projects/reorder', {
      method: 'POST',
      body: JSON.stringify({ projects }),
    });
  },

  // 4. Reviews
  getReviews: async (includeAll = false, includeDeleted = false): Promise<PublicReview[]> => {
    return request<PublicReview[]>(`/api/reviews?all=${includeAll ? 'true' : 'false'}&include_deleted=${includeDeleted ? 'true' : 'false'}`);
  },

  createReview: async (review: Partial<PublicReview>): Promise<PublicReview> => {
    return request<PublicReview>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  updateReview: async (id: string, updates: Partial<PublicReview>): Promise<PublicReview> => {
    return request<PublicReview>(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  reorderReviews: async (reviews: PublicReview[] | string[]): Promise<PublicReview[]> => {
    return request<PublicReview[]>('/api/reviews/reorder', {
      method: 'POST',
      body: JSON.stringify({ reviews }),
    });
  },

  restoreReview: async (id: string): Promise<PublicReview> => {
    return request<PublicReview>(`/api/reviews/${id}/restore`, {
      method: 'POST',
    });
  },

  deleteReview: async (id: string, permanent = false): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/api/reviews/${id}?permanent=${permanent ? 'true' : 'false'}`, {
      method: 'DELETE',
    });
  },

  // 5. Messages / Inquiries
  getMessages: async (includeDeleted = false): Promise<PublicMessage[]> => {
    return request<PublicMessage[]>(`/api/messages?include_deleted=${includeDeleted ? 'true' : 'false'}`);
  },

  createMessage: async (msg: Partial<PublicMessage>): Promise<PublicMessage> => {
    return request<PublicMessage>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(msg),
    });
  },

  updateMessageStatus: async (id: string, status: PublicMessage['status']): Promise<PublicMessage> => {
    return request<PublicMessage>(`/api/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  restoreMessage: async (id: string): Promise<PublicMessage> => {
    return request<PublicMessage>(`/api/messages/${id}/restore`, {
      method: 'POST',
    });
  },

  deleteMessage: async (id: string, permanent = false): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/api/messages/${id}?permanent=${permanent ? 'true' : 'false'}`, {
      method: 'DELETE',
    });
  },

  // 6. Saved Quotes
  getSavedQuotes: async (includeDeleted = false): Promise<SavedScopeQuote[]> => {
    return request<SavedScopeQuote[]>(`/api/quotes?include_deleted=${includeDeleted ? 'true' : 'false'}`);
  },

  createSavedQuote: async (quote: Partial<SavedScopeQuote>): Promise<SavedScopeQuote> => {
    return request<SavedScopeQuote>('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(quote),
    });
  },

  updateSavedQuote: async (id: string, updates: Partial<SavedScopeQuote>): Promise<SavedScopeQuote> => {
    return request<SavedScopeQuote>(`/api/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  restoreSavedQuote: async (id: string): Promise<SavedScopeQuote> => {
    return request<SavedScopeQuote>(`/api/quotes/${id}/restore`, {
      method: 'POST',
    });
  },

  deleteSavedQuote: async (id: string, permanent = false): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/api/quotes/${id}?permanent=${permanent ? 'true' : 'false'}`, {
      method: 'DELETE',
    });
  },

  // 7. Estimator Settings
  getEstimatorSettings: async (): Promise<EstimatorSettings> => {
    return request<EstimatorSettings>('/api/estimator-settings');
  },

  updateEstimatorSettings: async (settings: Partial<EstimatorSettings>): Promise<EstimatorSettings> => {
    return request<EstimatorSettings>('/api/estimator-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // 8. Auth & Security
  verifyOwnerPin: async (pin: string): Promise<{
    success: boolean;
    message: string;
    token?: string;
    expiresAt?: number;
    lockoutRemainingMs?: number;
  }> => {
    return request<{
      success: boolean;
      message: string;
      token?: string;
      expiresAt?: number;
      lockoutRemainingMs?: number;
    }>('/api/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  updateOwnerPin: async (currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>('/api/auth/update-pin', {
      method: 'POST',
      body: JSON.stringify({ currentPin, newPin }),
    });
  },

  getAuditLogs: async (limit = 100): Promise<{ success: boolean; logs: any[] }> => {
    return request<{ success: boolean; logs: any[] }>(`/api/auth/audit-logs?limit=${limit}`);
  },

  addAuditLog: async (action: string, details: string, severity = 'info'): Promise<any> => {
    return request<any>('/api/auth/audit-logs', {
      method: 'POST',
      body: JSON.stringify({ action, details, severity }),
    });
  },

  // 9. Media Upload (Supabase Storage / Persistent File Storage)
  uploadMedia: async (
    fileData: string,
    fileName: string,
    mimeType?: string
  ): Promise<{ success: boolean; url: string; storage: string; path: string }> => {
    return request<{ success: boolean; url: string; storage: string; path: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ fileData, fileName, mimeType }),
    });
  },

  // 10. Version History
  getVersions: async (entityType = 'all', limit = 50): Promise<any[]> => {
    return request<any[]>(`/api/versions?entity_type=${entityType}&limit=${limit}`);
  },

  getVersion: async (id: string): Promise<any> => {
    return request<any>(`/api/versions/${id}`);
  },

  restoreVersion: async (id: string, author?: string): Promise<any> => {
    return request<any>(`/api/versions/${id}/restore`, {
      method: 'POST',
      body: JSON.stringify({ author }),
    });
  },

  // 11. Reset to Factory Defaults
  resetToDefaults: async (): Promise<any> => {
    return request<any>('/api/reset-defaults', {
      method: 'POST',
    });
  },
};

export default api;

