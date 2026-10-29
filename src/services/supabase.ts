/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Build Studio — Supabase REST & Storage Client
 * Native, zero-dependency client with seamless offline / persistent fallback.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key] || '';
  }
  return '';
};

const rawUrl = getEnv('VITE_SUPABASE_URL').trim();
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('your-project-id') &&
  !rawKey.includes('your-anon-key')
);

export const supabaseConfig: SupabaseConfig = {
  url: rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''),
  anonKey: rawKey,
  isConfigured: isSupabaseConfigured,
};

export interface ConnectionStatus {
  connected: boolean;
  message: string;
  provider: 'supabase' | 'local';
}

/**
 * Safely check if a string is a 3-part JSON Web Token (Header.Payload.Signature)
 */
export function isValidJwt(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.trim().split('.');
  return parts.length === 3 && parts[0].length > 0 && parts[1].length > 0 && parts[2].length > 0;
}

/**
 * Check if the live Supabase cloud database is reachable
 */
export async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  if (!supabaseConfig.isConfigured) {
    return {
      connected: false,
      provider: 'local',
      message: 'Supabase credentials not configured in .env. Using secure persistent local storage.',
    };
  }

  try {
    const headers: Record<string, string> = {
      apikey: supabaseConfig.anonKey,
    };
    if (isValidJwt(supabaseConfig.anonKey)) {
      headers['Authorization'] = `Bearer ${supabaseConfig.anonKey}`;
    }

    const res = await fetch(`${supabaseConfig.url}/rest/v1/projects?select=id&limit=1`, {
      method: 'GET',
      headers,
    });

    if (res.ok) {
      return {
        connected: true,
        provider: 'supabase',
        message: 'Connected to live Supabase PostgreSQL database.',
      };
    } else {
      const errText = await res.text();
      return {
        connected: false,
        provider: 'local',
        message: `Supabase returned status ${res.status}: ${errText.slice(0, 100)}`,
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      provider: 'local',
      message: `Network failure connecting to Supabase: ${err?.message || 'Unknown error'}`,
    };
  }
}

/**
 * Lightweight Supabase PostgREST Client
 */
export const supabase = {
  isConfigured: isSupabaseConfigured,
  url: supabaseConfig.url,

  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      if (!isSupabaseConfigured) {
        return { data: null, error: new Error('Supabase is not configured.') };
      }
      try {
        const res = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseConfig.anonKey,
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: new Error(data.error_description || data.msg || 'Auth error') };
        }
        return { data: { session: data, user: data.user }, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },

    async signOut(accessToken?: string) {
      if (!isSupabaseConfigured || !isValidJwt(accessToken)) return { error: null };
      try {
        await fetch(`${supabaseConfig.url}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            apikey: supabaseConfig.anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    },

    async getUser(accessToken: string) {
      if (!isSupabaseConfigured || !isValidJwt(accessToken)) return { data: null, error: null };
      try {
        const res = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
          method: 'GET',
          headers: {
            apikey: supabaseConfig.anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) return { data: null, error: new Error('Invalid token') };
        const data = await res.json();
        return { data: { user: data }, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
  },

  from(table: string) {
    const getHeaders = (token?: string, extraPrefer?: string) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: supabaseConfig.anonKey,
        Prefer: extraPrefer || 'return=representation',
      };
      if (isValidJwt(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (isValidJwt(supabaseConfig.anonKey)) {
        headers['Authorization'] = `Bearer ${supabaseConfig.anonKey}`;
      }
      return headers;
    };

    return {
      async select(columns = '*', queryParams = '', token?: string) {
        if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') };
        try {
          let url = `${supabaseConfig.url}/rest/v1/${table}?select=${encodeURIComponent(columns)}`;
          if (queryParams) {
            url += (queryParams.startsWith('&') ? '' : '&') + queryParams;
          }
          const res = await fetch(url, {
            method: 'GET',
            headers: getHeaders(token),
          });
          const data = await res.json();
          if (!res.ok) return { data: null, error: new Error(data.message || 'Error fetching data') };
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },

      async insert(record: Record<string, any> | Array<Record<string, any>>, token?: string) {
        if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') };
        try {
          const res = await fetch(`${supabaseConfig.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(record),
          });
          const data = await res.json();
          if (!res.ok) return { data: null, error: new Error(data.message || 'Error inserting record') };
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },

      async upsert(record: Record<string, any> | Array<Record<string, any>>, onConflict = 'id', token?: string) {
        if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') };
        try {
          const res = await fetch(`${supabaseConfig.url}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
            method: 'POST',
            headers: getHeaders(token, 'resolution=merge-duplicates,return=representation'),
            body: JSON.stringify(record),
          });
          const data = await res.json();
          if (!res.ok) return { data: null, error: new Error(data.message || 'Error upserting record') };
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },

      async update(id: string, updates: Record<string, any>, token?: string) {
        if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') };
        try {
          const res = await fetch(`${supabaseConfig.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: getHeaders(token),
            body: JSON.stringify(updates),
          });
          const data = await res.json();
          if (!res.ok) return { data: null, error: new Error(data.message || 'Error updating record') };
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },

      async delete(id: string, token?: string) {
        if (!isSupabaseConfigured) return { error: new Error('Supabase not configured') };
        try {
          const res = await fetch(`${supabaseConfig.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: getHeaders(token),
          });
          if (!res.ok) {
            const data = await res.json();
            return { error: new Error(data.message || 'Error deleting record') };
          }
          return { error: null };
        } catch (err: any) {
          return { error: err };
        }
      },
    };
  },

  storage: {
    from(bucketName: string) {
      return {
        getPublicUrl(path: string) {
          const cleanPath = path.replace(/^\/+/, '');
          return {
            data: {
              publicUrl: `${supabaseConfig.url}/storage/v1/object/public/${bucketName}/${cleanPath}`,
            },
          };
        },

        async upload(path: string, file: File | Blob, token?: string) {
          if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase Storage not configured') };
          try {
            const cleanPath = path.replace(/^\/+/, '');
            const headers: Record<string, string> = {
              apikey: supabaseConfig.anonKey,
              'Content-Type': file.type || 'application/octet-stream',
            };
            if (isValidJwt(token)) {
              headers['Authorization'] = `Bearer ${token}`;
            } else if (isValidJwt(supabaseConfig.anonKey)) {
              headers['Authorization'] = `Bearer ${supabaseConfig.anonKey}`;
            }

            const res = await fetch(`${supabaseConfig.url}/storage/v1/object/${bucketName}/${cleanPath}`, {
              method: 'POST',
              headers,
              body: file,
            });
            const data = await res.json();
            if (!res.ok) return { data: null, error: new Error(data.message || 'Upload failed') };
            const publicUrl = `${supabaseConfig.url}/storage/v1/object/public/${bucketName}/${cleanPath}`;
            return { data: { path: cleanPath, publicUrl }, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },

        async remove(paths: string[], token?: string) {
          if (!isSupabaseConfigured) return { error: new Error('Supabase Storage not configured') };
          try {
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              apikey: supabaseConfig.anonKey,
            };
            if (isValidJwt(token)) {
              headers['Authorization'] = `Bearer ${token}`;
            } else if (isValidJwt(supabaseConfig.anonKey)) {
              headers['Authorization'] = `Bearer ${supabaseConfig.anonKey}`;
            }

            const res = await fetch(`${supabaseConfig.url}/storage/v1/object/${bucketName}`, {
              method: 'DELETE',
              headers,
              body: JSON.stringify({ prefixes: paths }),
            });
            if (!res.ok) {
              const data = await res.json();
              return { error: new Error(data.message || 'Delete failed') };
            }
            return { error: null };
          } catch (err: any) {
            return { error: err };
          }
        },
      };
    },
  },
};
