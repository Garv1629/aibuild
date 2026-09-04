import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ContactButton } from './ContactButton';
import { WebsiteContent } from '../types';
import { useSmoothScroll } from './SmoothScrollProvider';

interface HeroSectionProps {
  content?: WebsiteContent['hero'];
  onOpenContact?: () => void;
  onOpenPrice?: () => void;
  onOpenEstimator?: () => void;
  onSecretAdminTrigger?: () => void;
  onOpenMobileNav?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  content,
  onOpenContact,
  onOpenPrice,
  onOpenEstimator,
  onSecretAdminTrigger,
  onOpenMobileNav,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  const handleBrandClick = (e: React.MouseEvent) => {
    if (!onSecretAdminTrigger) return;
    
    // Alt/Option/Cmd click immediately triggers secret admin
    if (e.altKey || e.metaKey) {
      onSecretAdminTrigger();
      return;
    }

    // Triple-click within 1.2s triggers secret admin
    clickCountRef.current += 1;
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      onSecretAdminTrigger();
    } else {
      clickTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1200);
    }
  };

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const headline = content?.headline || 'AI BUILD';
  const subtext = content?.subtext || 'AI-POWERED EXPERIENCES & DIGITAL PRODUCTS FROM IDEA TO LAUNCH';
  const badgeText = content?.badgeText || 'ai.build_';
  const subBadge = content?.subBadge || 'Full-Stack & AI Agents';

  const { scrollTo } = useSmoothScroll();

  // Scroll parallax transforms
  const headingY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.1]);
  const bottomBarOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const bottomBarY = useTransform(scrollYProgress, [0, 0.45], [0, 35]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      scrollTo(el, { duration: 1.4 });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full min-h-[480px] xs:min-h-[520px] sm:min-h-[660px] min-h-[100dvh] bg-transparent flex flex-col justify-between overflow-hidden select-none max-w-full py-2 sm:py-0"
    >
      {/* 1. Navbar with Dusted Material architectural Pill */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full flex items-center justify-between px-2.5 xs:px-3.5 sm:px-8 md:px-12 pt-2 xs:pt-3 sm:pt-6 md:pt-8 z-30 relative gap-1.5 sm:gap-4 max-w-full"
      >
        {/* Brand Mark (Secret Owner Trigger on Triple-Click / Alt-Click) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            onClick={handleBrandClick}
            className="px-2.5 xs:px-3 sm:px-3.5 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[38px] rounded-full glass-pill flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none transition-all duration-300 hover:scale-105"
          >
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D8A9A8] shadow-[0_0_8px_rgba(216,169,168,0.8)]" />
            <span className="font-bezoria text-[11px] xs:text-xs sm:text-sm uppercase tracking-wider text-[#202526] font-normal">
              {badgeText}
            </span>
          </div>
        </div>

        {/* Center Floating Menu (Tablet & Desktop) */}
        <div className="hidden sm:flex rounded-full px-3.5 py-1.5 items-center gap-1.5 md:gap-3 glass-pill shadow-[0_8px_32px_rgba(0,0,0,0.06)] font-nav shrink-0">
          <button
            type="button"
            onClick={() => scrollToSection('services')}
            className="px-2.5 sm:px-3 py-1.5 min-h-[36px] flex items-center justify-center rounded-full text-xs sm:text-sm font-medium uppercase tracking-[0.06em] text-[#202526]/85 hover:text-[#FFFFFF] hover:bg-[#202526] transition-all duration-300 cursor-pointer hover:shadow-xs shrink-0 whitespace-nowrap"
          >
            What We Do
          </button>
          <button
            type="button"
            onClick={onOpenPrice ? onOpenPrice : () => scrollToSection('services')}
            className="px-2.5 sm:px-3 py-1.5 min-h-[36px] flex items-center justify-center rounded-full text-xs sm:text-sm font-medium uppercase tracking-[0.06em] text-[#202526]/85 hover:text-[#FFFFFF] hover:bg-[#202526] transition-all duration-300 cursor-pointer hover:shadow-xs shrink-0 whitespace-nowrap"
          >
            Price
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('about')}
            className="px-2.5 sm:px-3 py-1.5 min-h-[36px] items-center justify-center rounded-full text-xs sm:text-sm font-medium uppercase tracking-[0.06em] text-[#202526]/85 hover:text-[#FFFFFF] hover:bg-[#202526] transition-all duration-300 cursor-pointer hover:shadow-xs shrink-0 whitespace-nowrap"
          >
            Experience
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('projects')}
            className="hidden md:inline-flex px-3 py-1.5 min-h-[36px] items-center justify-center rounded-full text-xs sm:text-sm font-medium uppercase tracking-[0.06em] text-[#202526]/85 hover:text-[#FFFFFF] hover:bg-[#202526] transition-all duration-300 cursor-pointer hover:shadow-xs shrink-0 whitespace-nowrap"
          >
            Case Studies
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('reviews')}
            className="hidden lg:inline-flex px-3 py-1.5 min-h-[36px] items-center justify-center rounded-full text-xs sm:text-sm font-medium uppercase tracking-[0.06em] text-[#202526]/85 hover:text-[#FFFFFF] hover:bg-[#202526] transition-all duration-300 cursor-pointer hover:shadow-xs shrink-0 whitespace-nowrap"
          >
            Reviews
          </button>
          <button
            type="button"
            onClick={onOpenContact ? onOpenContact : () => scrollToSection('about')}
            className="px-2.5 sm:px-3 py-1.5 min-h-[36px] flex items-center justify-center rounded-full text-xs sm:text-sm font-medium uppercase tracking-[0.06em] text-[#202526]/85 hover:text-[#FFFFFF] hover:bg-[#202526] transition-all duration-300 cursor-pointer hover:shadow-xs shrink-0 whitespace-nowrap"
          >
            Contact
          </button>
        </div>

        {/* Right Studio Badge & Scope Estimator on Desktop */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {onOpenEstimator && (
            <button
              type="button"
              onClick={onOpenEstimator}
              className="px-3.5 py-1.5 min-h-[38px] rounded-full glass-pill hover:bg-[#202526] hover:text-[#FFFFFF] text-[#202526] text-xs font-semibold uppercase tracking-[0.08em] font-label-small flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-xs group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] group-hover:scale-125 transition-transform" />
              <span>Scope Estimator</span>
            </button>
          )}
          <div className="px-3 py-1.5 min-h-[38px] rounded-full glass-pill flex items-center gap-1.5 text-xs text-[#596769] uppercase tracking-[0.08em] font-label-small">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] animate-pulse" />
            <span>Studio Edition</span>
          </div>
        </div>

        {/* Mobile Right Spacer for Fixed Hamburger Menu Button Alignment */}
        <div className="sm:hidden w-12 h-8 shrink-0 pointer-events-none" aria-hidden="true" />
      </motion.nav>

      {/* 2. Hero Heading with Scroll Parallax */}
      <motion.div
        style={{ y: headingY, opacity: headingOpacity }}
        className="w-full flex flex-col items-center justify-center my-auto py-4 z-0 pointer-events-none px-2 max-w-full overflow-hidden"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="hero-heading font-bezoria font-normal uppercase tracking-[-0.03em] leading-[0.98] w-full text-center text-[26px] xs:text-[34px] sm:text-6xl md:text-8xl lg:text-[14vw] max-w-full px-2 break-words text-[#202526]"
        >
          {headline}
        </motion.h1>
      </motion.div>

      {/* 3. Bottom bar with scroll fade-out - intentionally designed mobile layout */}
      <motion.div
        style={{ opacity: bottomBarOpacity, y: bottomBarY }}
        className="w-full flex flex-row items-end justify-between gap-1.5 xs:gap-3 pb-3 xs:pb-4 sm:pb-8 md:pb-10 px-2.5 xs:px-4 sm:px-8 md:px-12 z-20 relative max-w-full"
      >
        {/* Left tagline inside Glassmorphic Material Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-panel p-2 xs:p-2.5 sm:p-4 rounded-xl sm:rounded-2xl max-w-[140px] xs:max-w-[190px] sm:max-w-[280px] md:max-w-[340px] shrink min-w-0"
        >
          <div className="flex items-center gap-1 mb-0.5 sm:mb-1 text-[8px] xs:text-[9px] sm:text-[10px] text-[#596769] font-label-small uppercase tracking-[0.08em] font-medium truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] shrink-0" />
            <span className="truncate">{subBadge}</span>
          </div>
          <p className="text-[#202526] font-medium font-sans-clean tracking-normal leading-tight xs:leading-snug text-[9px] xs:text-[11px] sm:text-xs md:text-sm line-clamp-2 xs:line-clamp-none">
            {subtext}
          </p>
        </motion.div>

        {/* Right Contact button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="shrink-0 flex justify-end"
        >
          <ContactButton onClick={onOpenContact} />
        </motion.div>
      </motion.div>
    </section>
  );
};


