/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Authoritative Supabase Owner UUID.
 * Only this UUID possesses studio administrator privileges.
 */
export const OWNER_UUID: string = '8426bca9-cb3b-47a2-997b-f362634ea46d';

/**
 * Authoritative Studio Administrator Email.
 */
export const CONFIGURED_ADMIN_EMAIL: string = 'aibuild1629@gmail.com';

export const isAuthorizedAdmin = (
  u: { id?: string; email?: string } | null | undefined
): boolean => {
  if (!u || !u.id) return false;
  // Strict UUID-only authorization: email must NEVER independently grant admin access
  return u.id === OWNER_UUID;
};


export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  isAdmin: boolean;
}

export type AdminUser = AuthUser;

export interface AdminSession {
  token: string;
  expiresAt: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}
