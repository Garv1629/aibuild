/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sliders } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenContact: () => void;
  showAdminButton?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenContact,
  showAdminButton = true,
}) => {
  const { data, setIsAdminOpen } = usePortfolio();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-4 md:pt-6 px-1.5 sm:px-4 pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto inline-flex items-center rounded-full liquid-glass-nav liquid-glass-gloss px-1.5 xs:px-2 sm:px-3 py-1 sm:py-1.5 transition-all duration-300 max-w-[calc(100vw-0.75rem)] shadow-2xl"
      >
        {/* 1. Logo: circle with accent gradient border. Inner liquid glass circle with "AB" */}
        <button
          type="button"
          onClick={() => onNavigate('hero')}
          className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full relative group transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer p-[1.5px] shrink-0"
          aria-label="AI Build Home"
        >
          <div className="absolute inset-0 rounded-full accent-gradient group-hover:rotate-180 transition-transform duration-700 ease-in-out pointer-events-none opacity-80" />
          <div className="w-full h-full bg-black/60 rounded-full flex items-center justify-center relative z-10 backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <span className="font-display italic text-[11px] sm:text-[13px] text-white font-normal leading-none select-none tracking-tight">
              AB
            </span>
          </div>
        </button>

        {/* 2. Divider */}
        <div className="w-px h-3.5 sm:h-5 bg-white/15 mx-0.5 xs:mx-1 sm:mx-1.5 hidden xs:block" aria-hidden="true" />

        {/* 3. Nav links: ["Home", "Work", "Journal", "Explorations", "Reviews"] */}
        <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('hero')}
            className={`text-[10px] xs:text-[11px] sm:text-xs md:text-sm rounded-full px-2 xs:px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap select-none shrink-0 ${
              activeSection === 'hero'
                ? 'liquid-glass-pill-active text-white font-medium'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => onNavigate('work')}
            className={`text-[10px] xs:text-[11px] sm:text-xs md:text-sm rounded-full px-2 xs:px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap select-none shrink-0 ${
              activeSection === 'work'
                ? 'liquid-glass-pill-active text-white font-medium'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Work
          </button>

          <button
            type="button"
            onClick={() => onNavigate('journal')}
            className={`text-[10px] xs:text-[11px] sm:text-xs md:text-sm rounded-full px-2 xs:px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap select-none shrink-0 ${
              activeSection === 'journal'
                ? 'liquid-glass-pill-active text-white font-medium'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Journal
          </button>

          <button
            type="button"
            onClick={() => onNavigate('explorations')}
            className={`text-[11px] sm:text-xs md:text-sm rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-all duration-200 cursor-pointer hidden md:block whitespace-nowrap select-none shrink-0 ${
              activeSection === 'explorations'
                ? 'liquid-glass-pill-active text-white font-medium'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Explorations
          </button>

          <button
            type="button"
            onClick={() => onNavigate('reviews')}
            className={`text-[11px] sm:text-xs md:text-sm rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-all duration-200 cursor-pointer hidden sm:block whitespace-nowrap select-none shrink-0 ${
              activeSection === 'reviews'
                ? 'liquid-glass-pill-active text-white font-medium'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Reviews
          </button>
        </div>

        {/* 4. Divider */}
        <div className="w-px h-4 sm:h-5 bg-white/20 mx-0.5 xs:mx-1 sm:mx-1.5 shrink-0" aria-hidden="true" />

        {/* 5. "Say hi" / Collaborate button */}
        <button
          type="button"
          onClick={onOpenContact}
          className="liquid-glass-button text-[10px] xs:text-[11px] sm:text-xs md:text-sm rounded-full px-2 xs:px-3 sm:px-3.5 py-1 sm:py-1.5 text-white font-medium flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shrink-0 whitespace-nowrap select-none"
          aria-label="Start a Conversation"
        >
          <span>Say hi</span>
          <span className="text-[9px] xs:text-[10px] sm:text-[11px] leading-none transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
        </button>

        {/* 6. Admin Studio button */}
        {showAdminButton && (
          <Link
            to="/admin"
            className="liquid-glass-pill text-[10px] xs:text-[11px] sm:text-xs rounded-full px-1.5 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 text-sky-300 hover:text-white border border-sky-400/40 hover:border-sky-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.25)] font-mono font-medium ml-0.5 whitespace-nowrap select-none"
            title="Open Admin Studio Dashboard (/admin)"
            aria-label="Admin Studio Dashboard"
          >
            <Sliders className="w-3 xs:w-3.5 h-3 xs:h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
      </nav>
    </header>
  );
};
