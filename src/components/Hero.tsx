/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import gsap from 'gsap';
import { usePortfolio } from '../context/PortfolioContext.tsx';

interface HeroProps {
  onSeeWorks: () => void;
  onReachOut: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSeeWorks, onReachOut }) => {
  const { data } = usePortfolio();
  const roles = data.roles;
  const heroDescription = data.heroDescription;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);

  const [roleIndex, setRoleIndex] = useState(0);

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

  // GSAP Entrance animation
  useEffect(() => {
    const activeGsap = (typeof window !== 'undefined' && (window as any).gsap) || gsap;
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

  // Auto-rotate through roles smoothly + allow direct clicking of any pill
  useEffect(() => {
    if (!roles || roles.length <= 1) return;
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [roles]);

  const handleSelectService = (idx: number) => {
    setRoleIndex(idx);
  };

  const activeRole = roles[roleIndex] || roles[0];

  return (
    <section
      id="hero"
      ref={heroContentRef}
      className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center text-center overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-10 px-4 sm:px-6"
      aria-label="AI Build Hero & Service Showcase"
    >
      {/* Background Video */}
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
        <div className="absolute inset-0 bg-black/45" />
        {/* Bottom fade: seamless blend into next sections */}
        <div className="h-28 sm:h-36 bg-gradient-to-t from-bg via-bg/80 to-transparent absolute bottom-0 left-0 right-0 pointer-events-none" />
      </div>

      {/* Top spacer */}
      <div className="w-full h-1 sm:h-2" />

      {/* Hero Content (centered, z-10) */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center my-auto py-2 sm:py-4">
        {/* Eyebrow */}
        <div className="blur-in inline-flex items-center gap-2 mb-3 sm:mb-6">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-sky-400 animate-pulse" />
          <p className="text-[10px] sm:text-xs text-muted uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium font-mono">
            {data.siteTexts?.heroEyebrow || 'AI-POWERED DIGITAL INNOVATION'}
          </p>
        </div>

        {/* Name */}
        <h1 className="name-reveal text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-2.5 sm:mb-5 selection:bg-white/20">
          {data.siteTexts?.heroHeadline || data.brandName || 'AI Build'}
        </h1>

        {/* Dynamic Role Line */}
        <div className="blur-in text-sm sm:text-xl md:text-2xl text-muted/90 font-light mb-2.5 sm:mb-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span>{data.siteTexts?.heroRolePrefix || 'Ideas into reality through'}</span>
          <span
            key={activeRole}
            className="font-display italic text-text-primary animate-role-fade-in inline-block min-w-[120px] sm:min-w-[190px] text-center px-1"
          >
            {activeRole}
          </span>
          <span>.</span>
        </div>

        {/* Description */}
        <p className="blur-in text-xs sm:text-sm md:text-base text-muted max-w-xl mb-3.5 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none px-2 sm:px-0">
          {heroDescription}
        </p>

        {/* 4 Offered Services Badges — Interactive */}
        <div className="blur-in flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mb-4 sm:mb-8 max-w-xl">
          {roles.map((role, idx) => {
            const isActive = roleIndex === idx;
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleSelectService(idx)}
                className={`text-[11px] sm:text-xs font-mono px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                  isActive
                    ? 'liquid-glass-pill-active text-sky-200 scale-105 font-medium'
                    : 'liquid-glass-pill text-muted hover:text-white hover:border-white/30'
                }`}
                aria-pressed={isActive}
                title={`Switch to ${role}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isActive ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-muted/40'
                  }`}
                />
                <span>{role}</span>
              </button>
            );
          })}
        </div>

        {/* CTA Buttons - Apple visionOS Liquid Glass Style */}
        <div className="blur-in inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          {/* "See Works": Solid Glass Button with White Sheen */}
          <button
            type="button"
            onClick={onSeeWorks}
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

      {/* Scroll down indicator */}
      <div className="relative z-10 flex flex-col items-center pb-1 sm:pb-2 select-none">
        <div className="w-px h-6 sm:h-8 bg-stroke relative overflow-hidden">
          <div className="w-full h-1/2 accent-gradient animate-scroll-down" />
        </div>
      </div>
    </section>
  );
};
