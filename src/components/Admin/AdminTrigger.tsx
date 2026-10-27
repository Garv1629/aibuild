/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Sliders } from 'lucide-react';

export const AdminTrigger: React.FC = () => {
  return (
    <aside
      aria-label="Admin Studio Quick Access"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 xs:right-5 sm:bottom-7 sm:right-7 z-[9990] select-none animate-fadeIn pointer-events-auto"
    >
      <Link
        to="/admin"
        className="group relative rounded-full px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 flex items-center gap-1.5 xs:gap-2.5 text-[11px] xs:text-xs sm:text-sm font-mono text-white bg-gradient-to-r from-sky-500/90 via-blue-600/90 to-sky-500/90 border border-sky-300/80 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_24px_rgba(56,189,248,0.6)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.9),0_0_35px_rgba(56,189,248,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer font-medium"
        title="Open Dedicated Admin Studio (/admin)"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <Sliders className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-500" />
        <span className="tracking-tight text-white font-semibold drop-shadow">⚡ Edit Website</span>
        <kbd className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-black/40 text-sky-200 border border-white/20 font-mono">
          /admin
        </kbd>
      </Link>
    </aside>
  );
};
