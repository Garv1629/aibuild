import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Sparkles,
  Compass,
  Briefcase,
  Star,
  Layers,
  Calculator,
  ArrowUpRight,
  Mail,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { playStudioChime } from '../services/adminStore';
import { useSmoothScroll } from './SmoothScrollProvider';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenContact?: (projectType?: string, budget?: string, message?: string) => void;
  onOpenPrice?: () => void;
  onOpenEstimator?: () => void;
  onSecretAdminTrigger?: () => void;
  badgeText?: string;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onOpen,
  onClose,
  onOpenContact,
  onOpenPrice,
  onOpenEstimator,
  onSecretAdminTrigger,
  badgeText = 'ai.build_',
}) => {
  const { scrollTo } = useSmoothScroll();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNavClick = (sectionId: string) => {
    playStudioChime('click');
    onClose();
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        scrollTo(el, { duration: 1.2 });
      }
    }, 120);
  };

  const handleModalClick = (modalFn?: () => void) => {
    if (!modalFn) return;
    playStudioChime('click');
    onClose();
    setTimeout(() => {
      modalFn();
    }, 120);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    playStudioChime('click');
    if (navigator.clipboard) {
      navigator.clipboard.writeText('garvchauhan0161@gmail.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    if (!onSecretAdminTrigger) return;
    if (e.altKey || e.metaKey) {
      onClose();
      onSecretAdminTrigger();
      return;
    }

    clickCountRef.current += 1;
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      onClose();
      onSecretAdminTrigger();
    } else {
      clickTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1200);
    }
  };

  const navItems = [
    {
      id: 'nav-what-we-do',
      label: 'What We Do',
      subtitle: 'Intelligent Platforms & AI Video',
      icon: Sparkles,
      onClick: () => handleNavClick('services'),
      tag: '01',
    },
    {
      id: 'nav-pricing',
      label: 'Pricing & Tiers',
      subtitle: 'Transparent Rates & Retainers',
      icon: Layers,
      onClick: () => handleModalClick(onOpenPrice),
      tag: 'Plans',
      highlight: true,
    },
    {
      id: 'nav-experience',
      label: 'Experience & Stack',
      subtitle: 'Full-Stack Architecture & 3D',
      icon: Compass,
      onClick: () => handleNavClick('about'),
      tag: '02',
    },
    {
      id: 'nav-case-studies',
      label: 'Case Studies',
      subtitle: 'Production Web Apps & Systems',
      icon: Briefcase,
      onClick: () => handleNavClick('projects'),
      tag: '03',
    },
    {
      id: 'nav-reviews',
      label: 'Client Reviews',
      subtitle: '5.0 ★ Founder & Director Feedback',
      icon: Star,
      onClick: () => handleNavClick('reviews'),
      tag: '5.0',
    },
    {
      id: 'nav-scope-estimator',
      label: 'Scope Estimator',
      subtitle: 'Interactive Cost & Timeline Tool',
      icon: Calculator,
      onClick: () => handleModalClick(onOpenEstimator),
      tag: 'Live Calc',
      highlight: true,
    },
  ];

  return (
    <>
      {/* 1. Floating Mobile Hamburger Trigger Button */}
      <motion.button
        type="button"
        id="mobile-menu-hamburger-btn"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        onClick={() => {
          playStudioChime('click');
          if (isOpen) {
            onClose();
          } else {
            onOpen();
          }
        }}
        whileTap={{ scale: 0.92 }}
        className="fixed top-3 xs:top-4 right-2.5 xs:right-4 z-40 sm:hidden min-h-[34px] h-[34px] px-2.5 xs:px-3 rounded-full glass-pill flex items-center gap-1.5 cursor-pointer select-none transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white/90 backdrop-blur-xl border border-[#B8C1C0]/60 active:bg-[#CBDCDE]"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] shadow-[0_0_8px_rgba(216,169,168,0.8)] shrink-0" />
        <span className="font-btn text-[10px] xs:text-[11px] font-semibold uppercase tracking-wider text-[#202526]">
          {isOpen ? 'Close' : 'Menu'}
        </span>
        <div className="w-3.5 h-3.5 flex items-center justify-center text-[#202526] shrink-0">
          {isOpen ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Menu className="w-3.5 h-3.5" />
          )}
        </div>
      </motion.button>

      {/* 2. Slide-In Navigation Drawer & Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 sm:hidden flex justify-end" id="mobile-nav-drawer-root">
            {/* Backdrop with Blur */}
            <motion.div
              id="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              onClick={() => {
                playStudioChime('click');
                onClose();
              }}
              className="fixed inset-0 bg-[#202526]/55 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-In Drawer Panel */}
            <motion.aside
              id="mobile-drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 33 }}
              className="relative w-[86vw] max-w-[350px] h-[100dvh] bg-[#FFFFFF] border-l border-[#B8C1C0]/50 shadow-[-16px_0_40px_rgba(0,0,0,0.18)] flex flex-col justify-between overflow-y-auto overflow-x-hidden z-10 select-none"
            >
              {/* Top Drawer Header */}
              <div className="p-4 xs:p-5 border-b border-[#E7EBE9] flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md sticky top-0 z-20">
                {/* Brand Tag (Secret Admin on Triple Click) */}
                <div
                  id="mobile-drawer-brand"
                  onClick={handleBrandClick}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <span className="w-2 h-2 rounded-full bg-[#D8A9A8] shadow-[0_0_8px_rgba(216,169,168,0.8)]" />
                  <span className="font-bezoria text-sm uppercase tracking-wider text-[#202526]">
                    {badgeText}
                  </span>
                  <span className="text-[9px] font-mono text-[#596769] bg-[#E7EBE9] px-1.5 py-0.5 rounded-sm">
                    STUDIO
                  </span>
                </div>

                {/* Close Button */}
                <motion.button
                  type="button"
                  id="mobile-drawer-close-btn"
                  aria-label="Close navigation drawer"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    playStudioChime('click');
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full bg-[#E7EBE9] hover:bg-[#CBDCDE] text-[#202526] flex items-center justify-center cursor-pointer transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Status Banner */}
              <div className="px-4 xs:px-5 pt-3 shrink-0">
                <div className="p-2.5 rounded-xl bg-[#E7EBE9]/60 border border-[#B8C1C0]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D8A9A8] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D8A9A8]" />
                    </span>
                    <span className="font-btn text-[10px] uppercase tracking-wider text-[#202526] font-medium">
                      Accepting Q2/Q3 Projects
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-[#596769] uppercase tracking-wider">
                    Online
                  </span>
                </div>
              </div>

              {/* Primary Navigation Links */}
              <div className="px-3 xs:px-4 py-3 flex-1 flex flex-col gap-1.5 overflow-y-auto">
                <div className="px-2 pt-1 pb-0.5 text-[9px] uppercase font-bold tracking-[0.1em] text-[#596769]">
                  Navigation
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      id={item.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={item.onClick}
                      className={`w-full text-left p-2.5 xs:p-3 rounded-xl transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                        item.highlight
                          ? 'bg-[#CBDCDE]/25 hover:bg-[#CBDCDE]/50 border border-[#B8C1C0]/40'
                          : 'hover:bg-[#E7EBE9]/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-[#E7EBE9] flex items-center justify-center text-[#202526] group-hover:scale-105 transition-transform shrink-0">
                          <Icon className="w-4 h-4 text-[#202526]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-btn text-xs font-semibold uppercase tracking-wider text-[#202526]">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-[#596769] tracking-normal line-clamp-1">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.tag && (
                          <span className="text-[9px] font-medium font-mono uppercase px-1.5 py-0.5 rounded-full bg-[#E7EBE9] text-[#202526]/80">
                            {item.tag}
                          </span>
                        )}
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#596769] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Drawer Bottom Actions & Direct Contact */}
              <div className="p-4 xs:p-5 border-t border-[#E7EBE9] bg-[#FFFFFF] shrink-0 flex flex-col gap-3">
                {/* Primary CTA Button: Contact / Start a Project */}
                <motion.button
                  type="button"
                  id="mobile-drawer-contact-cta"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleModalClick(() => onOpenContact?.())}
                  className="w-full py-3.5 px-4 rounded-full bg-[#202526] hover:bg-[#596769] text-white flex items-center justify-between font-btn font-medium uppercase tracking-wider text-xs shadow-md cursor-pointer transition-colors"
                >
                  <span>Start A Project</span>
                  <div className="flex items-center gap-1.5 text-[#D8A9A8]">
                    <span className="text-[10px] font-mono">Let's Talk</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </motion.button>

                {/* Email Quick Action */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#E7EBE9]/50 border border-[#B8C1C0]/30 text-[11px]">
                  <a
                    href="mailto:garvchauhan0161@gmail.com"
                    className="flex items-center gap-2 text-[#202526] font-sans hover:underline truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#596769] shrink-0" />
                    <span className="truncate">garvchauhan0161@gmail.com</span>
                  </a>

                  <button
                    type="button"
                    id="mobile-drawer-copy-email-btn"
                    title="Copy Email"
                    onClick={handleCopyEmail}
                    className="p-1 rounded-md hover:bg-white text-[#596769] hover:text-[#202526] cursor-pointer transition-colors shrink-0"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[9px] text-[#596769] uppercase tracking-wider font-mono pt-1">
                  <span>AI Build Studio • 2026</span>
                  <span>Fast Turnaround</span>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
