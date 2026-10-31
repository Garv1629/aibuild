/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.ts';
import {
  OWNER_UUID,
  CONFIGURED_ADMIN_EMAIL as DEFAULT_ADMIN_EMAIL,
  isAuthorizedAdmin as verifyIsAuthorizedAdmin,
  AuthUser,
  AdminUser,
  AdminSession,
  AuthContextType,
} from './authTypes.ts';

export { OWNER_UUID };
export type { AuthUser, AdminUser, AdminSession, AuthContextType };

export const CONFIGURED_ADMIN_EMAIL = (
  (typeof import.meta !== 'undefined' && (import.meta.env as any)?.VITE_ADMIN_EMAIL) ||
  DEFAULT_ADMIN_EMAIL
).trim().toLowerCase();

export const isAuthorizedAdmin = (u: { id?: string; email?: string } | null | undefined): boolean => {
  return verifyIsAuthorizedAdmin(u);
};

const mapSupabaseSession = (
  currentSession: { user?: { id: string; email?: string } | null; access_token?: string; expires_at?: number } | null | undefined
): { authUser: AuthUser | null; authSession: AdminSession | null } => {
  if (!currentSession || !currentSession.user || !currentSession.user.id || !currentSession.access_token) {
    return { authUser: null, authSession: null };
  }

  const expiresAt = currentSession.expires_at
    ? currentSession.expires_at * 1000
    : Date.now() + 3600 * 1000;

  if (expiresAt <= Date.now()) {
    return { authUser: null, authSession: null };
  }

  const isOwner = verifyIsAuthorizedAdmin(currentSession.user);
  const authUser: AuthUser = {
    id: currentSession.user.id,
    email: currentSession.user.email || '',
    role: isOwner ? 'admin' : 'user',
    isAdmin: isOwner,
  };

  const authSession: AdminSession = {
    token: currentSession.access_token,
    expiresAt,
  };

  return { authUser, authSession };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and synchronize with real Supabase Auth session
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      if (isMounted) {
        setUser(null);
        setSession(null);
        setIsLoading(false);
      }
      return;
    }

    // Subscribe to auth state changes (INITIAL_SESSION, sign-in, token refresh, sign-out)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;

      if (currentSession && currentSession.user) {
        const { authUser, authSession } = mapSupabaseSession(currentSession);
        setUser(authUser);
        setSession(authSession);
      } else {
        setUser(null);
        setSession(null);
      }
      setIsLoading(false);
    });

    // Safety timeout: ensure loading state never hangs even if offline or network delays occur
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (
    emailInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both administrator email and password.' };
    }

    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase authentication is not configured. Real administrator credentials must be provisioned in your Supabase project dashboard (Auth -> Users).',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Invalid administrator credentials. Access restricted to authorized personnel.',
        };
      }

      if (data?.session && data?.user) {
        const isOwner = verifyIsAuthorizedAdmin(data.user);

        if (!isOwner) {
          // Reject non-owner account immediately from administrative session
          await supabase.auth.signOut().catch(() => {});
          setUser(null);
          setSession(null);
          return {
            success: false,
            error: 'Access denied. This account does not possess studio administrator authorization.',
          };
        }

        const { authUser, authSession } = mapSupabaseSession(data.session);
        if (authUser && authSession) {
          setUser(authUser);
          setSession(authSession);
          setIsLoading(false);
          return { success: true };
        }
      }

      return { success: false, error: 'Failed to retrieve active session from authentication provider.' };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'An unexpected authentication error occurred while connecting to Supabase.',
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsLoading(false);
    }
  };

  const isSessionValid = Boolean(user && session && session.expiresAt > Date.now());

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: isSessionValid,
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
