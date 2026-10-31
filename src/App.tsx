/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PortfolioHome } from './pages/PortfolioHome.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { AdminLoginPage } from './pages/AdminLoginPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-6 font-mono">
          <div className="max-w-xl w-full p-6 bg-red-950/80 border border-red-500/40 rounded-2xl shadow-2xl space-y-4">
            <h2 className="text-lg font-semibold text-error">Application Error</h2>
            <p className="text-xs text-red-200/90 whitespace-pre-wrap leading-relaxed">
              {this.state.error?.message || 'An unknown render error occurred.'}
            </p>
            {this.state.error?.stack && (
              <pre className="text-2xs text-white/50 max-h-48 overflow-auto p-3 bg-black/60 rounded-xl">
                {this.state.error.stack}
              </pre>
            )}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('ai_build_portfolio_cms_v1');
                  } catch (e) { }
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs text-white font-medium cursor-pointer transition-colors"
              >
                Clear Cache & Reload
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white font-medium cursor-pointer transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Global Invisible Admin Shortcut Listener:
 * Press Ctrl+Shift+A (or Cmd+Shift+A on Mac) or Alt+A anywhere on the site
 * to instantly toggle or navigate to the Admin Portal (/admin) without any visible buttons.
 */
function AdminShortcutListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in a form input or textarea
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (isInput) return;

      const key = e.key ? e.key.toLowerCase() : '';
      const isCtrlShiftA = (e.ctrlKey || e.metaKey) && e.shiftKey && key === 'a';
      const isAltA = e.altKey && !e.ctrlKey && !e.metaKey && key === 'a';

      if (isCtrlShiftA || isAltA) {
        e.preventDefault();
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) {
          navigate('/');
        } else {
          navigate('/admin');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AdminShortcutListener />
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/adminlogin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/signin" element={<Navigate to="/admin/login" replace />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:tab"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<PortfolioHome />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
