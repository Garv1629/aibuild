/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-[#07090e] text-text-primary font-body flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Liquid Glass Ambient Refraction Meshes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-600/10 to-transparent blur-[120px] pointer-events-none transform-gpu" />
        <div className="absolute -bottom-10 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-tl from-indigo-500/15 via-sky-600/10 to-transparent blur-[120px] pointer-events-none transform-gpu" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="liquid-glass-card rounded-3xl p-8 sm:p-12 border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(56,189,248,0.15)] backdrop-blur-2xl space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-400/20 to-blue-600/30 border border-sky-400/40 text-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.3)] mx-auto">
            <Compass className="w-8 h-8 text-sky-300 animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold block">
              404 — Page Not Found
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-medium text-white tracking-tight">
              Lost in Space
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-xs mx-auto leading-relaxed font-sans">
              The requested address does not exist or has been relocated within our studio directory.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-400 hover:via-blue-500 hover:to-sky-400 text-white font-medium text-xs font-mono shadow-[0_0_24px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        <p className="text-[11px] font-mono text-white/40">
          AI Build &bull; Web Development &bull; AI Videos &bull; UGC Videos &bull; E-books
        </p>
      </div>
    </div>
  );
};

