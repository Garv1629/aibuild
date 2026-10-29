/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExplorationItem } from '../utils/portfolio.ts';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { buttonVariants } from './Button.tsx';

// Safe plugin registration helper
const getActiveGsap = () => {
  if (typeof window !== 'undefined' && (window as any).gsap) {
    return (window as any).gsap;
  }
  return gsap;
};

const getActiveScrollTrigger = () => {
  if (typeof window !== 'undefined' && (window as any).ScrollTrigger) {
    return (window as any).ScrollTrigger;
  }
  return ScrollTrigger;
};

interface ExplorationsProps {
  onSelectExploration: (item: ExplorationItem) => void;
}

export const Explorations: React.FC<ExplorationsProps> = ({
  onSelectExploration,
}) => {
  const { data } = usePortfolio();
  const explorations = data.explorations;
  const githubUrl = data.githubUrl;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const col1Ref = useRef<HTMLDivElement | null>(null);
  const col2Ref = useRef<HTMLDivElement | null>(null);
  const pinnedContentRef = useRef<HTMLDivElement | null>(null);
  const columnsContainerRef = useRef<HTMLDivElement | null>(null);

  const col1Items = explorations.filter((item) => item.column === 1);
  const col2Items = explorations.filter((item) => item.column === 2);
  const maxItemsInCol = Math.max(col1Items.length, col2Items.length, 1);

  // Dynamic height calculation so center text stays pinned until all background cards finish scrolling
  const [dynamicHeight, setDynamicHeight] = useState<number>(() => {
    return Math.max(maxItemsInCol * 520 + 750, 2400);
  });

  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsLargeScreen(e.matches);
    setIsLargeScreen(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Measure background columns height dynamically whenever explorations change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measureHeight = () => {
      if (!columnsContainerRef.current) return;
      const colHeight = columnsContainerRef.current.offsetHeight;
      if (colHeight > 0) {
        // Required height: columns height + col2 downward parallax (260px) + full viewport height so last card completely scrolls out + exit buffer
        const vh = window.innerHeight;
        const requiredHeight = colHeight + 350 + vh;
        const minHeight = vh * 2.4;
        const finalHeight = Math.max(requiredHeight, minHeight);
        setDynamicHeight(finalHeight);

        const activeScrollTrigger = getActiveScrollTrigger();
        if (activeScrollTrigger && activeScrollTrigger.refresh) {
          activeScrollTrigger.refresh();
        }
      }
    };

    const timer = setTimeout(measureHeight, 150);

    const ro = new ResizeObserver(() => {
      measureHeight();
    });

    if (columnsContainerRef.current) {
      ro.observe(columnsContainerRef.current);
    }
    window.addEventListener('resize', measureHeight);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', measureHeight);
    };
  }, [explorations, isLargeScreen]);

  useEffect(() => {
    const activeGsap = getActiveGsap();
    const activeScrollTrigger = getActiveScrollTrigger();

    if (!activeGsap || !activeGsap.matchMedia) return;

    try {
      if (activeGsap.registerPlugin && activeScrollTrigger) {
        activeGsap.registerPlugin(activeScrollTrigger);
      }

      const mm = activeGsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        if (!containerRef.current) return;

        // Parallax movement on column 1 & column 2 on desktop screens
        if (col1Ref.current) {
          activeGsap.to(col1Ref.current, {
            y: -240,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          });
        }

        if (col2Ref.current) {
          activeGsap.to(col2Ref.current, {
            y: 260,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          });
        }
      });

      return () => {
        mm.revert();
      };
    } catch (e) {
      console.warn('Explorations GSAP animation error:', e);
    }
  }, [explorations, isLargeScreen, dynamicHeight]);

  return (
    <section
      id="explorations"
      ref={containerRef}
      style={{
        minHeight: isLargeScreen && dynamicHeight ? `${dynamicHeight}px` : undefined,
      }}
      className="relative z-10 py-12 lg:py-0 overflow-x-clip"
      aria-label="Explorations and Visual Experiments"
    >
      {/* Ambient background depth lights */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[700px] h-[300px] sm:h-[500px] bg-sky-900/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* MOBILE / TABLET LAYOUT (< 1024px): In-flow header + responsive grid */}
      <div className="block lg:hidden max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 mb-8 sm:mb-12">
        <div className="text-center max-w-xl mx-auto flex flex-col items-center">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <span className="w-8 h-px bg-stroke" aria-hidden="true" />
            <span className="text-xs text-accent uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium font-mono">
              {data.siteTexts?.explorationsEyebrow || 'Explorations'}
            </span>
            <span className="w-8 h-px bg-stroke" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-5xl text-text-primary tracking-tight font-normal mb-2.5 sm:mb-3">
            {data.siteTexts?.explorationsHeading || 'Visual'}{' '}
            <span className="font-display italic">{data.siteTexts?.explorationsHeadingItalic || 'playground'}</span>
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted max-w-md mx-auto mb-6 leading-relaxed">
            {data.siteTexts?.explorationsSubtext ||
              'A curated gallery of live AI video experiments, high-converting UGC mockups, web interactions, and digital publication concepts.'}
          </p>

          {/* GitHub button - Standardized Secondary Button */}
          <div className="mb-8">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'secondary', size: 'md' })}
            >
              <span>{data.siteTexts?.explorationsGithubText || 'Explore on GitHub'}</span>
              <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          </div>
        </div>

        {/* Mobile / Tablet Cards Grid: Liquid Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {explorations.map((item) => (
            <div
              key={`mobile-${item.id}`}
              onClick={() => onSelectExploration(item)}
              className="group aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden liquid-glass-card cursor-pointer shadow-xl shadow-black/60 transition-all duration-300 hover:scale-[1.02] relative"
              tabIndex={0}
              role="article"
              aria-label={`Exploration: ${item.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectExploration(item);
                }
              }}
            >
              {item.video ? (
                <video
                  src={item.video}
                  poster={item.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}

              {/* Format Badge */}
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-2xs font-mono tracking-wider flex items-center gap-1.5 text-secondary">
                {item.video ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-accent font-semibold">VIDEO</span>
                  </>
                ) : (
                  <span>IMAGE</span>
                )}
                <span className="text-muted">•</span>
                <span>{item.category.toUpperCase()}</span>
              </div>

              {/* Gradient Scrim & Info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 z-20">
                <span className="text-2xs font-mono text-accent uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-white text-sm sm:text-base font-medium leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP LAYOUT (>= 1024px): Pinned Center Text */}
      <div
        ref={pinnedContentRef}
        className="hidden lg:flex sticky top-0 h-screen z-30 flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-none"
      >
        <div className="relative max-w-xl mx-auto flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-stroke" aria-hidden="true" />
            <span className="text-xs text-accent uppercase tracking-[0.3em] font-medium font-mono">
              {data.siteTexts?.explorationsEyebrow || 'Explorations'}
            </span>
            <span className="w-8 h-px bg-stroke" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl md:text-7xl text-text-primary tracking-tight font-normal mb-4 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            {data.siteTexts?.explorationsHeading || 'Visual'}{' '}
            <span className="font-display italic">{data.siteTexts?.explorationsHeadingItalic || 'playground'}</span>
          </h2>

          {/* Description */}
          <p className="text-sm md:text-base text-muted max-w-md mx-auto mb-7 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            {data.siteTexts?.explorationsSubtext ||
              'A curated gallery of live AI video experiments, high-converting UGC mockups, web interactions, and digital publication concepts.'}
          </p>

          {/* GitHub button (verified link) - Apple Liquid Glass */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: 'glass',
                size: 'md',
                className: 'group shadow-xl',
              })}
              aria-label="Explore AI Build projects on GitHub"
            >
              <span>{data.siteTexts?.explorationsGithubText || 'Explore on GitHub'}</span>
              <span className="text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
        </div>
      </div>

      {/* DESKTOP BACKGROUND LAYER (>= 1024px): Parallax Columns */}
      {isLargeScreen && (
        <div
          ref={columnsContainerRef}
          className="hidden lg:block relative z-10 max-w-[1400px] mx-auto px-6 sm:px-12 -mt-[100vh] pointer-events-none"
        >
          <div className="grid grid-cols-2 gap-6 sm:gap-16 md:gap-32 lg:gap-48">
            {/* Column 1 (Left Flank) */}
            <div ref={col1Ref} className="flex flex-col gap-24 sm:gap-36 md:gap-48 items-start">
              {col1Items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectExploration(item)}
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                  className="pointer-events-auto group aspect-square w-full max-w-[320px] rounded-2xl overflow-hidden liquid-glass-card cursor-pointer shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-0 hover:z-20 relative"
                  tabIndex={0}
                  role="article"
                  aria-label={`Exploration: ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectExploration(item);
                    }
                  }}
                >
                  {/* Media Container: Live Looping Video or Image */}
                  {item.video ? (
                    <video
                      src={item.video}
                      poster={item.image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  {/* Media Format Badge */}
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-2xs font-mono tracking-wider flex items-center gap-1.5 text-secondary">
                    {item.video ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-accent font-semibold">VIDEO</span>
                      </>
                    ) : (
                      <span>IMAGE</span>
                    )}
                    <span className="text-muted">•</span>
                    <span>{item.category.toUpperCase()}</span>
                  </div>

                  {/* Halftone & dark hover scrim */}
                  <div className="halftone-overlay absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5 z-20">
                    <span className="text-xs font-mono text-accent uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-white text-base sm:text-lg font-medium leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 (Right Flank) */}
            <div ref={col2Ref} className="flex flex-col gap-24 sm:gap-36 md:gap-48 items-end pt-32 sm:pt-52">
              {col2Items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectExploration(item)}
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                  className="pointer-events-auto group aspect-square w-full max-w-[320px] rounded-2xl overflow-hidden liquid-glass-card cursor-pointer shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-0 hover:z-20 relative"
                  tabIndex={0}
                  role="article"
                  aria-label={`Exploration: ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectExploration(item);
                    }
                  }}
                >
                  {/* Media Container: Live Looping Video or Image */}
                  {item.video ? (
                    <video
                      src={item.video}
                      poster={item.image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  {/* Media Format Badge */}
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-2xs font-mono tracking-wider flex items-center gap-1.5 text-secondary">
                    {item.video ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-accent font-semibold">VIDEO</span>
                      </>
                    ) : (
                      <span>IMAGE</span>
                    )}
                    <span className="text-muted">•</span>
                    <span>{item.category.toUpperCase()}</span>
                  </div>

                  {/* Halftone & dark hover scrim */}
                  <div className="halftone-overlay absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5 z-20">
                    <span className="text-xs font-mono text-accent uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-white text-base sm:text-lg font-medium leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
