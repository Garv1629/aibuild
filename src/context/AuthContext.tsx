/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.ts';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface AdminSession {
  token: string;
  expiresAt: number;
  provider: 'supabase' | 'local';
}

interface AuthContextType {
  user: AdminUser | null;
  session: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'ai_build_admin_auth_v1';

// Default Admin credentials from environment or secure defaults
const getEnv = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key] || fallback;
  }
  return fallback;
};

const DEFAULT_ADMIN_EMAIL = getEnv('VITE_ADMIN_EMAIL', 'aibuild1629@gmail.com').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = getEnv('VITE_ADMIN_PASSWORD', 'YourSecureAdminPassword2026!');

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage/sessionStorage on mount
  useEffect(() => {
    try {
      let saved = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.session && parsed.session.expiresAt > Date.now()) {
          setUser(parsed.user);
          setSession(parsed.session);
        } else {
          // Session expired
          localStorage.removeItem(AUTH_STORAGE_KEY);
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    emailInput: string,
    passwordInput: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanPassword) {
      setIsLoading(false);
      return { success: false, error: 'Please enter both administrator email and password.' };
    }

    // 1. If Supabase is configured, authenticate with Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data?.session) {
          const authUser: AdminUser = {
            id: data.user?.id || 'admin-supabase',
            email: cleanEmail,
            role: 'admin',
          };
          const authSession: AdminSession = {
            token: data.session.access_token,
            expiresAt: Date.now() + (data.session.expires_in || 3600) * 1000,
            provider: 'supabase',
          };

          setUser(authUser);
          setSession(authSession);

          const payload = JSON.stringify({ user: authUser, session: authSession });
          if (rememberMe) {
            localStorage.setItem(AUTH_STORAGE_KEY, payload);
          } else {
            sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
          }

          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase auth failed, evaluating administrator fallback:', err);
      }
    }

    // 2. Secure Local Fallback Authentication
    // Verify against configured administrator credentials
    const matchesEmail =
      cleanEmail === DEFAULT_ADMIN_EMAIL ||
      cleanEmail === 'aibuild1629@gmail.com' ||
      cleanEmail === 'admin@aibuild.studio';
    const matchesPassword = cleanPassword === DEFAULT_ADMIN_PASSWORD;

    if (matchesEmail && matchesPassword) {
      const authUser: AdminUser = {
        id: 'admin-local-primary',
        email: cleanEmail,
        role: 'admin',
      };
      const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const authSession: AdminSession = {
        token: `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        expiresAt: Date.now() + durationMs,
        provider: 'local',
      };

      setUser(authUser);
      setSession(authSession);

      const payload = JSON.stringify({ user: authUser, session: authSession });
      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, payload);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
      }

      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid administrator credentials. Access is restricted to authorized personnel only.',
    };
  };

  const logout = async () => {
    if (session?.provider === 'supabase' && session.token) {
      await supabase.auth.signOut(session.token).catch(() => {});
    }

    setUser(null);
    setSession(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: Boolean(user && session && session.expiresAt > Date.now()),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
