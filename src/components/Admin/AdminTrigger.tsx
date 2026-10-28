/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Sliders, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { buttonVariants } from '../Button.tsx';

export const AdminTrigger: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <aside
      aria-label="Admin Studio Quick Access"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 xs:right-5 sm:bottom-7 sm:right-7 z-[9990] select-none animate-fadeIn pointer-events-auto"
    >
      <Link
        to={isAuthenticated ? '/admin' : '/admin/login'}
        className={buttonVariants({
          variant: 'secondary',
          size: 'sm',
          className: 'group relative shadow-2xl font-mono gap-2 border-accent/40 font-medium',
        })}
        title={isAuthenticated ? 'Open Dedicated Admin Studio (/admin)' : 'Sign In to Admin Portal (/admin/login)'}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        {isAuthenticated ? (
          <Sliders className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-500" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-white" />
        )}
        <span className="tracking-tight text-white font-semibold drop-shadow">
          {isAuthenticated ? '⚡ Edit Website' : 'Admin Login'}
        </span>
        <kbd className="hidden sm:inline-block text-2xs px-2 py-0.5 rounded bg-black/40 text-accent border border-white/20 font-mono">
          {isAuthenticated ? '/admin' : '/admin/login'}
        </kbd>
      </Link>
    </aside>
  );
};
