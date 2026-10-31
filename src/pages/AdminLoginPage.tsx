/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, Cloud, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { isSupabaseConfigured } from '../services/supabase.ts';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely resolve the intended destination, preventing redirect loops back to /admin/login
  const getSafeDestination = (): string => {
    const rawFrom = (location.state as any)?.from;
    const path = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname;
    if (
      path &&
      typeof path === 'string' &&
      path.startsWith('/admin') &&
      path !== '/admin/login' &&
      !path.startsWith('/admin/login')
    ) {
      return path;
    }
    return '/admin';
  };

  // If already authenticated and verified as owner, redirect to /admin
  React.useEffect(() => {
    // Do not interfere if user is actively submitting the login form
    if (isSubmitting) return;

    if (!isLoading && isAuthenticated) {
      if (user?.isAdmin) {
        navigate(getSafeDestination(), { replace: true });
      } else {
        setError('Access denied. Your signed-in account is not authorized to access the studio admin workspace.');
      }
    }
  }, [isAuthenticated, user?.isAdmin, isLoading, isSubmitting, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Direct transition to the Admin Dashboard without intermediate redirects
        navigate(getSafeDestination(), { replace: true });
        return;
      } else {
        setError(result.error || 'Failed to authenticate. Please check your administrator credentials.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected authentication error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#07090e] text-text-primary font-body flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Liquid Glass Ambient Refraction Meshes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-600/10 to-transparent blur-[120px] pointer-events-none transform-gpu" />
        <div className="absolute -bottom-10 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-tl from-teal-400/15 via-sky-600/10 to-transparent blur-[120px] pointer-events-none transform-gpu" />
      </div>

      {/* Main Glass Login Card */}
      <div className="relative z-10 max-w-md w-full animate-fadeIn">
        {/* Top return link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to AI Build Public Website</span>
          </Link>
        </div>

        <div className="liquid-glass-card liquid-glass-gloss rounded-3xl p-6 sm:p-8 border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(56,189,248,0.15)] backdrop-blur-2xl space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-display italic text-lg shadow-[0_0_20px_rgba(56,189,248,0.6)] mb-2">
              AB
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
                Studio Security Gateway
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed font-sans">
              Authenticate with your provisioned administrator account to manage portfolio projects, services, media, and site content.
            </p>
          </div>

          {/* Authentication System Status Badge */}
          <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px] font-mono">
            <span className="text-white/60">Authentication System:</span>
            {isSupabaseConfigured ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Auth Cloud</span>
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Configuration Required</span>
              </span>
            )}
          </div>

          {/* Missing Configuration Notice if applicable */}
          {!isSupabaseConfigured && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-1 animate-fadeIn">
              <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Deployment Blocker</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) must be configured in environment variables to authenticate. Create your administrator account under Supabase Auth &rarr; Users.
              </p>
            </div>
          )}

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-mono space-y-2.5 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
              {isAuthenticated && !user?.isAdmin && (
                <div className="pt-2 border-t border-red-500/20 flex items-center justify-between">
                  <span className="text-[11px] text-red-300/80 truncate max-w-[200px]" title={user?.email}>
                    Signed in as {user?.email}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/25 hover:bg-red-500/40 text-red-200 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-xs font-mono text-white/70 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Administrator Email</span>
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aibuild1629@gmail.com"
                className="w-full liquid-glass-input text-xs font-mono px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-sky-400/60 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-xs font-mono text-white/70 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full liquid-glass-input text-xs font-mono px-4 py-3 pr-10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-sky-400/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isSupabaseConfigured}
              className="w-full liquid-glass-button bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-400 hover:via-blue-500 hover:to-sky-400 text-white font-medium text-xs font-mono py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_rgba(56,189,248,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-white/10 text-center space-y-1">
            <p className="text-[10px] font-mono text-white/40 leading-relaxed">
              Protected Studio System. Real Supabase authentication enforced. Unauthorized access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
