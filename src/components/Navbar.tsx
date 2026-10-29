/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Sparkles, FolderGit2, Compass, BookOpen, MessageSquare } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Button } from './Button.tsx';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenContact,
}) => {
  const { data } = usePortfolio();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { id: 'hero', label: 'Home', num: '01', desc: 'Overview & Pillars', icon: Sparkles },
    { id: 'work', label: 'Work', fullLabel: 'Selected Works', num: '02', desc: 'Featured Projects & Systems', icon: FolderGit2 },
    { id: 'explorations', label: 'Explorations', fullLabel: 'Visual Playground', num: '03', desc: '3D & AI Video Experiments', icon: Compass },
    { id: 'journal', label: 'Journal', fullLabel: 'Journal & Insights', num: '04', desc: 'Articles & Perspectives', icon: BookOpen },
    { id: 'reviews', label: 'Reviews', fullLabel: 'Client Reviews', num: '05', desc: '5.0 ★ Client Feedback', icon: MessageSquare },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-[max(0.6rem,env(safe-area-inset-top))] sm:pt-4 md:pt-6 px-3 sm:px-4 pointer-events-none">
        <nav
          aria-label="Main Navigation"
          className="pointer-events-auto flex items-center justify-between w-full max-w-[94%] md:max-w-max md:justify-center rounded-full liquid-glass-nav liquid-glass-gloss px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-300 shadow-2xl gap-2 sm:gap-3"
        >
          {/* 1. Brand Logo & Name */}
          <button
            type="button"
            onClick={() => onNavigate('hero')}
            className="flex items-center gap-2 group shrink-0 cursor-pointer text-left select-none"
            aria-label="AI Build Home"
          >
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 p-[1.5px] rounded-full accent-gradient group-hover:rotate-180 transition-transform duration-700 ease-in-out shrink-0">
              <div className="w-full h-full bg-black/70 rounded-full flex items-center justify-center relative z-10 backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <span className="font-display italic text-xs text-white font-normal leading-none select-none tracking-tight">
                  AB
                </span>
              </div>
            </div>
            <span className="font-display font-semibold text-xs sm:text-sm text-white tracking-tight">
              {data.brandName || 'AI Build'}
            </span>
          </button>

          {/* 2. Desktop Nav Links (>= md) */}
          <div className="hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="w-px h-4 sm:h-5 bg-white/15 mx-1" aria-hidden="true" />
            {navLinks.map((link) => (
              <Button
                key={link.id}
                variant="pill"
                size="sm"
                active={activeSection === link.id}
                onClick={() => onNavigate(link.id)}
                className="whitespace-nowrap"
              >
                {link.label}
              </Button>
            ))}
          </div>

          {/* 3. Right Actions: Say hi + Mobile Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden md:block w-px h-5 bg-white/20 mx-0.5" aria-hidden="true" />
            <Button
              variant="glass"
              size="sm"
              onClick={onOpenContact}
              className="group whitespace-nowrap text-2xs sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5"
              aria-label="Start a Conversation"
            >
              <span>Say hi</span>
              <span className="text-2xs sm:text-xs leading-none transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
            </Button>

            {/* Mobile Menu Hamburger Toggle (< md) */}
            <Button
              variant="icon"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden shrink-0 w-8 h-8 rounded-full"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-sky-300" />
              ) : (
                <Menu className="w-4 h-4 text-white" />
              )}
            </Button>
          </div>
        </nav>
      </header>

      {/* Luxury Mobile Navigation Overlay / Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] md:hidden bg-black/90 backdrop-blur-2xl flex flex-col justify-between p-5 xs:p-6 overflow-y-auto"
          >
            {/* Top Bar inside Mobile Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full accent-gradient p-[1.5px] flex items-center justify-center">
                  <div className="w-full h-full bg-black/80 rounded-full flex items-center justify-center">
                    <span className="font-display italic text-xs text-white">AB</span>
                  </div>
                </div>
                <div>
                  <span className="font-display font-medium text-white text-base tracking-tight block">
                    {data.brandName || 'AI Build'}
                  </span>
                  <span className="text-2xs font-mono text-accent block">Studio Navigation</span>
                </div>
              </div>

              <Button
                variant="icon"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            {/* Navigation Links with large touch targets */}
            <div className="flex flex-col gap-2 my-auto py-6">
              {navLinks.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 ${
                      isActive
                        ? 'liquid-glass border-sky-400/40 text-white shadow-[0_0_24px_rgba(56,189,248,0.25)]'
                        : 'hover:bg-white/5 text-muted hover:text-white active:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-white/60'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-base font-display flex items-center gap-2 ${
                          isActive ? 'text-white font-medium' : 'text-white/85'
                        }`}>
                          <span>{item.fullLabel || item.label}</span>
                          <span className="text-2xs font-mono text-accent/80 font-normal">{item.num}</span>
                        </div>
                        <div className="text-2xs font-mono text-muted">{item.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-accent translate-x-1' : 'text-white/30'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions inside Mobile Drawer */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3 shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] min-h-[46px]"
              >
                <span>Start a Conversation</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="flex items-center justify-between text-2xs font-mono text-muted px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Available for Q2 Projects</span>
                </span>
                {data.githubUrl && (
                  <a
                    href={data.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-300 hover:text-white underline underline-offset-4"
                  >
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
