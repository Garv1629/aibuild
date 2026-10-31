/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Build Studio — Production Supabase Client
 * Official @supabase/supabase-js client supporting publishable keys, session handling,
 * Row Level Security (RLS), PostgREST, and Cloud Storage.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const val = (import.meta.env as any)[key];
    if (val) return val;
  }
  if (typeof process !== 'undefined' && process.env) {
    const val = process.env[key];
    if (val) return val;
  }
  return '';
};

const rawUrl = getEnv('VITE_SUPABASE_URL').trim();
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY').trim();

export const isSupabaseConfigured: boolean = Boolean(
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
}

// Safe initial defaults when environment variables are not yet loaded
const clientUrl = isSupabaseConfigured ? supabaseConfig.url : 'https://api.supabase.co';
const clientKey = isSupabaseConfigured ? supabaseConfig.anonKey : 'sb-public-anon';

export const supabase: SupabaseClient = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

/**
 * Check if the live Supabase cloud database is reachable and configured
 */
export async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
    };
  }

  try {
    const { error } = await supabase.from('projects').select('id').limit(1);
    if (!error) {
      return {
        connected: true,
        message: 'Connected to live Supabase PostgreSQL database.',
      };
    } else {
      return {
        connected: false,
        message: `Database error: ${error.message}`,
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      message: `Network error connecting to Supabase: ${err?.message || 'Connection unreachable'}`,
    };
  }
}
