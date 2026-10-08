import 'dotenv/config';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'cms-media';

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http'));
}

interface SupabaseRequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  prefer?: string;
}

async function supabaseFetch<T>(endpoint: string, options: SupabaseRequestOptions = {}): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...(options.prefer ? { 'Prefer': options.prefer } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const supabaseClient = {
  isConfigured: isSupabaseConfigured,

  // 1. Storage Operations
  async uploadMedia(
    fileBuffer: Buffer | Uint8Array,
    fileName: string,
    mimeType: string
  ): Promise<{ url: string; path: string }> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase credentials not configured.');
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${cleanName}`;
    const uploadUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${SUPABASE_BUCKET}/${storagePath}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Supabase storage upload failed: ${err}`);
    }

    // Public URL
    const publicUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${SUPABASE_BUCKET}/${storagePath}`;
    return { url: publicUrl, path: storagePath };
  },

  // 2. Table CRUD via PostgREST
  async getRows<T>(table: string, queryParams = ''): Promise<T[]> {
    return supabaseFetch<T[]>(`/rest/v1/${table}${queryParams ? `?${queryParams}` : ''}`);
  },

  async insertRow<T>(table: string, data: any): Promise<T> {
    const res = await supabaseFetch<T[]>(`/rest/v1/${table}`, {
      method: 'POST',
      body: data,
      prefer: 'return=representation',
    });
    return Array.isArray(res) ? res[0] : (res as any);
  },

  async upsertRow<T>(table: string, data: any, onConflict = 'id'): Promise<T> {
    const res = await supabaseFetch<T[]>(`/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: 'POST',
      body: data,
      prefer: 'resolution=merge-duplicates,return=representation',
    });
    return Array.isArray(res) ? res[0] : (res as any);
  },

  async updateRow<T>(table: string, id: string, data: any): Promise<T> {
    const res = await supabaseFetch<T[]>(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: data,
      prefer: 'return=representation',
    });
    return Array.isArray(res) ? res[0] : (res as any);
  },

  async deleteRow(table: string, id: string): Promise<boolean> {
    await supabaseFetch(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return true;
  },
};
