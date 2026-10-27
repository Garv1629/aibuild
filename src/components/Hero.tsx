/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import gsap from 'gsap';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { SERVICES } from '../utils/portfolio.ts';

const getActiveGsap = () => {
  if (typeof window !== 'undefined' && (window as any).gsap) {
    return (window as any).gsap;
  }
  return gsap;
};

interface HeroProps {
  onSeeWorks: () => void;
  onReachOut: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSeeWorks, onReachOut }) => {
  const { data } = usePortfolio();
  const roles = data.roles && data.roles.length > 0 ? data.roles : ['Web Development', 'AI Videos', 'UGC Videos', 'E-books'];
  const heroDescription = data.heroDescription;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);

  const [roleIndex, setRoleIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Background HLS video setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsSource =
      'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(hlsSource);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSource;
      video.play().catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  // GSAP Entrance animation on first load
  useEffect(() => {
    const activeGsap = getActiveGsap();
    if (!activeGsap || !activeGsap.context) return;

    try {
      const ctx = activeGsap.context(() => {
        const tl = activeGsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
          '.name-reveal',
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
        );

        tl.fromTo(
          '.blur-in',
          { opacity: 0, filter: 'blur(10px)', y: 20 },
          {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 1.0,
            stagger: 0.08,
            delay: 0.2,
          },
          '-=0.9'
        );
      }, heroContentRef);

      return () => ctx.revert();
    } catch (e) {
      console.warn('Hero entrance GSAP animation error:', e);
    }
  }, []);

  // Native scroll-driven pinned layout:
  // Section stays pinned using CSS position: sticky while scrolling through all 4 services
  // ZERO timers, ZERO auto-play, 100% synchronized with user scroll.
  useEffect(() => {
    let ticking = false;

    const computeProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      if (scrollableDistance > 0) {
        // Scrolled distance within this pinned container
        const scrolled = Math.max(0, -rect.top);
        const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
        setScrollProgress(progress);

        // Map progress to each of the 4 services (0..roles.length-1)
        const total = roles.length;
        const index = Math.min(total - 1, Math.floor(progress * total));
        setRoleIndex(index);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          computeProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    computeProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [roles]);

  // Direct clicking on any pill smoothly scrolls to that service's phase
  const handleSelectService = (idx: number) => {
    if (!containerRef.current) {
      setRoleIndex(idx);
      return;
    }
    const containerTop = window.scrollY + containerRef.current.getBoundingClientRect().top;
    const scrollableDistance = containerRef.current.offsetHeight - window.innerHeight;
    const targetFraction = (idx + 0.5) / roles.length;
    const targetY = containerTop + targetFraction * scrollableDistance;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // Clicking "See Works" scrolls past the pinned container to the next section
  const handleSeeWorks = () => {
    const workEl = document.getElementById('work');
    if (workEl) {
      workEl.scrollIntoView({ behavior: 'smooth' });
    } else if (containerRef.current) {
      const containerTop = window.scrollY + containerRef.current.getBoundingClientRect().top;
      const targetY = containerTop + containerRef.current.offsetHeight + 10;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      onSeeWorks();
    }
  };

  // Active service details from CMS or curated list
  const currentService = data.services?.[roleIndex] || SERVICES[roleIndex] || SERVICES[0];
  const activeRole = roles[roleIndex] || currentService?.title || 'Web Development';
  const activeDesc = currentService?.shortDesc || heroDescription;
  const activeBadge = currentService?.badge || 'Digital Innovation';
  const activeStats = currentService?.statsValue || 'Production Grade';

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full"
      style={{ height: '360vh' }}
      aria-label="AI Build Hero & Service Showcase"
    >
      {/* Sticky viewport frame pinned for the entire 360vh scroll track */}
      <div
        ref={heroContentRef}
        className="sticky top-0 w-full h-screen h-[100dvh] flex flex-col justify-between items-center text-center overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 px-4 sm:px-6"
      >
        {/* Background HLS Video */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 absolute opacity-70"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Bottom fade: seamless blend into next sections */}
          <div className="h-28 sm:h-36 bg-gradient-to-t from-bg via-bg/80 to-transparent absolute bottom-0 left-0 right-0 pointer-events-none" />
        </div>

        {/* Top spacer */}
        <div className="w-full h-1 sm:h-2" />

        {/* Hero Content (centered, z-10) */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center my-auto py-2 sm:py-4">
          {/* Service Dynamic Eyebrow Badge */}
          <div
            key={activeRole + '-badge'}
            className="blur-in inline-flex items-center gap-2 mb-2 sm:mb-4 animate-role-fade-in"
          >
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-sky-400 animate-pulse" />
            <p className="text-[10px] sm:text-xs text-sky-300 uppercase tracking-[0.22em] sm:tracking-[0.28em] font-medium font-mono">
              AI-POWERED DIGITAL INNOVATION • {activeBadge}
            </p>
          </div>

          {/* Brand Name */}
          <h1 className="name-reveal text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-2.5 sm:mb-5 selection:bg-white/20">
            {data.siteTexts?.heroHeadline || data.brandName || 'AI Build'}
          </h1>

          {/* Dynamic Scroll-Driven Role Line */}
          <div className="blur-in text-sm sm:text-xl md:text-2xl text-muted/90 font-light mb-2.5 sm:mb-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span>{data.siteTexts?.heroRolePrefix || 'Ideas into reality through'}</span>
            <span
              key={activeRole}
              className="font-display italic text-text-primary animate-role-fade-in inline-block min-w-[140px] sm:min-w-[210px] text-center px-1"
            >
              {activeRole}
            </span>
            <span>.</span>
          </div>

          {/* Dynamic Service Description */}
          <p
            key={activeRole + '-desc'}
            className="blur-in text-xs sm:text-sm md:text-base text-muted max-w-xl mb-3 sm:mb-5 leading-relaxed line-clamp-3 sm:line-clamp-none px-2 sm:px-0 animate-role-fade-in"
          >
            {activeDesc}
          </p>

          {/* 4 Offered Services Badges — Interactive & Synchronized to Scroll */}
          <div className="blur-in flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mb-5 sm:mb-7 max-w-xl">
            {roles.map((role, idx) => {
              const isActive = roleIndex === idx;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectService(idx)}
                  className={`text-[11px] sm:text-xs font-mono px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                    isActive
                      ? 'liquid-glass-pill-active text-sky-200 scale-105 font-medium shadow-[0_0_16px_rgba(56,189,248,0.4)]'
                      : 'liquid-glass-pill text-muted hover:text-white hover:border-white/30'
                  }`}
                  aria-pressed={isActive}
                  title={`Jump to ${role}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isActive ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse' : 'bg-muted/40'
                    }`}
                  />
                  <span>{role}</span>
                </button>
              );
            })}
          </div>

          {/* CTA Buttons - Apple visionOS Liquid Glass Style */}
          <div className="blur-in inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            {/* "See Works": Solid Glass Button */}
            <button
              type="button"
              onClick={handleSeeWorks}
              className="relative group rounded-full text-xs sm:text-sm font-medium px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-black hover:bg-white/90 active:scale-95 transition-all duration-300 cursor-pointer shadow-[0_12px_28px_-6px_rgba(255,255,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center gap-2"
            >
              <span>{data.siteTexts?.heroCtaWorks || 'See Works'}</span>
              <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
            </button>

            {/* "Reach out...": VisionOS Liquid Glass Button */}
            <button
              type="button"
              onClick={onReachOut}
              className="liquid-glass-button rounded-full text-xs sm:text-sm font-medium px-6 sm:px-8 py-3 sm:py-3.5 text-white active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>{data.siteTexts?.heroCtaContact || 'Reach out...'}</span>
              <span className="text-xs text-white/70">↗</span>
            </button>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="relative z-10 flex flex-col items-center pb-1 sm:pb-2 select-none">
          <span className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase tracking-[0.25em] mb-1.5">
            SCROLL
          </span>
          <div className="w-px h-6 sm:h-8 bg-stroke relative overflow-hidden">
            <div className="w-full h-1/2 accent-gradient animate-scroll-down" />
          </div>
        </div>
      </div>
    </section>
  );
};
