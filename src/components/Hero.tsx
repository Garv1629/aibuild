/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import gsap from 'gsap';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { SERVICES, getServiceIndexFromScroll } from '../utils/portfolio.ts';
import { Button } from './Button.tsx';

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

  // Background HLS video setup & Viewport Visibility observer to save mobile GPU/CPU
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsSource =
      'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        capLevelToPlayerSize: true,
        maxBufferLength: 4,
      });
      hls.loadSource(hlsSource);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSource;
      video.play().catch(() => {});
    }

    // Viewport IntersectionObserver: pauses video decoding when out of view
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
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

        // Dedicate 88% of the scroll distance to transitioning the 4 services,
        // and the remaining 12% as a buffer where the final service stays pinned and fully explored
        // before releasing to the next section.
        const activeProgress = Math.min(1, progress / 0.88);
        const index = getServiceIndexFromScroll(activeProgress, roles.length);
        setRoleIndex((prev) => (prev !== index ? index : prev));
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
  }, [roles.length]);

  // Direct clicking on any pill smoothly scrolls to that service's phase
  const handleSelectService = (idx: number) => {
    if (!containerRef.current) {
      setRoleIndex(idx);
      return;
    }
    const containerTop = window.scrollY + containerRef.current.getBoundingClientRect().top;
    const scrollableDistance = containerRef.current.offsetHeight - window.innerHeight;
    const targetFraction = ((idx + 0.5) / roles.length) * 0.88;
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

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-[240vh] sm:h-[380vh]"
      aria-label="AI Build Hero & Service Showcase"
    >
      {/* Sticky viewport frame pinned for the scroll track */}
      <div
        ref={heroContentRef}
        className="sticky top-0 w-full h-screen h-[100dvh] supports-[height:100svh]:h-[100svh] flex flex-col justify-between items-center text-center overflow-hidden pt-14 xs:pt-16 sm:pt-24 md:pt-28 pb-3 xs:pb-4 sm:pb-8 px-3 xs:px-4 sm:px-6"
      >
        {/* Background HLS Video */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 absolute opacity-70 transform-gpu"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Bottom fade: seamless blend into next sections */}
          <div className="h-24 sm:h-36 bg-gradient-to-t from-bg via-bg/80 to-transparent absolute bottom-0 left-0 right-0 pointer-events-none" />
        </div>

        {/* Top spacer */}
        <div className="w-full h-0.5 sm:h-2" />

        {/* Hero Content (centered, z-10) */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center my-auto py-1 xs:py-2 sm:py-4 w-full">
          {/* Brand Name */}
          <h1 className="name-reveal text-3xl sm:text-5xl md:text-7xl font-display italic leading-[0.92] sm:leading-[0.9] tracking-tight text-text-primary mb-1.5 xs:mb-2 sm:mb-5 selection:bg-white/20 break-words max-w-full">
            {data.siteTexts?.heroHeadline || data.brandName || 'AI Build'}
          </h1>

          {/* Dynamic Scroll-Driven Role Line: ONLY this text transitions with scroll */}
          <div className="blur-in text-sm sm:text-xl md:text-2xl text-muted font-light mb-2 xs:mb-2.5 sm:mb-5 flex flex-wrap items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 px-2">
            <span>{data.siteTexts?.heroRolePrefix || 'Ideas into reality through'}</span>
            <span
              key={activeRole}
              className="font-display italic text-text-primary animate-role-fade-in inline-block min-w-[110px] xs:min-w-[130px] sm:min-w-[210px] text-center px-1"
            >
              {activeRole}
            </span>
            <span>.</span>
          </div>

          {/* Common Information: Stays constant and common across all services while user scrolls */}
          <p className="blur-in text-sm sm:text-base text-muted max-w-xl mx-auto mb-3 xs:mb-4 sm:mb-7 leading-relaxed font-light text-center px-2 sm:px-4 selection:bg-white/20">
            {heroDescription ||
              'Transforming concepts into high-impact digital products through modern engineering, creative direction, and generative visual pipelines.'}
          </p>

          {/* 4 Offered Services Badges — Interactive & Synchronized to Scroll */}
          <div className="blur-in flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mb-3.5 xs:mb-4 sm:mb-6 max-w-xl px-1">
            {roles.map((role, idx) => {
              const isActive = roleIndex === idx;
              return (
                <Button
                  key={role}
                  variant="pill"
                  size="sm"
                  active={isActive}
                  onClick={() => handleSelectService(idx)}
                  className={`transition-all duration-300 ${isActive ? 'scale-105' : ''}`}
                  aria-pressed={isActive}
                  title={`Jump to ${role}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isActive ? 'bg-accent shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse' : 'bg-muted/40'
                    }`}
                  />
                  <span>{role}</span>
                </Button>
              );
            })}
          </div>

          {/* CTA Buttons - Consolidated Design System */}
          <div className="blur-in inline-flex flex-wrap items-center justify-center gap-2 xs:gap-2.5 sm:gap-4 w-full sm:w-auto px-2 sm:px-0">
            {/* "See Works": High-Contrast Primary Button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleSeeWorks}
              className="group"
            >
              <span>{data.siteTexts?.heroCtaWorks || 'See Works'}</span>
              <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
            </Button>

            {/* "Reach out...": VisionOS Liquid Glass Button */}
            <Button
              variant="glass"
              size="md"
              onClick={onReachOut}
            >
              <span>{data.siteTexts?.heroCtaContact || 'Reach out...'}</span>
              <span className="text-xs text-secondary">↗</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
