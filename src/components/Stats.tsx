/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion, MotionValue } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { BrandPrincipleStat } from '../utils/portfolio.ts';

interface StatCardProps {
  stat: BrandPrincipleStat;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  shouldReduceMotion: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  stat,
  index,
  progress,
  range,
  shouldReduceMotion,
}) => {
  const [start, end] = range;

  // Continuous scroll-linked transforms strictly tied to scroll progress
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [36, 0]);
  const scale = useTransform(progress, [start, end], [0.94, 1]);
  const blurVal = useTransform(progress, [start, end], [8, 0]);
  const filter = useTransform(blurVal, (val) => (val <= 0.05 ? 'none' : `blur(${val.toFixed(1)}px)`));

  return (
    <motion.div
      style={
        shouldReduceMotion
          ? undefined
          : {
              opacity,
              y,
              scale,
              filter,
              willChange: 'transform, opacity, filter',
            }
      }
      className="flex flex-col items-center text-center p-4 sm:p-6 md:p-8 rounded-2xl transition-colors duration-300 hover:bg-white/[0.02] group"
      data-stat-card={stat.value.toLowerCase()}
      data-start-progress={start}
      data-end-progress={end}
    >
      <div className="text-4xl sm:text-5xl md:text-6xl font-display text-white tracking-tight mb-2 sm:mb-3 drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)] group-hover:scale-[1.01] transition-transform duration-300">
        {stat.value}
      </div>
      <div className="text-xs sm:text-sm font-semibold text-sky-300 tracking-wider mb-1.5 font-mono uppercase">
        {stat.label}
      </div>
      <div className="text-xs sm:text-sm text-muted font-normal max-w-[260px] leading-relaxed">
        {stat.sub}
      </div>
    </motion.div>
  );
};

export const Stats: React.FC = () => {
  const { data } = usePortfolio();
  const stats = data.stats;
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement | null>(null);

  // Normalized scroll progress of the pinned section: 0 (entry) to 1 (exit)
  const scrollProgress = useMotionValue(0);

  // Dynamic coordination of sequential reveal ranges for the cards:
  // Innovation (Card 1) -> Execution (Card 2) -> Experience (Card 3)
  const cardRanges = useMemo(() => {
    const count = stats.length || 3;
    const startOffset = 0.02;
    const endOffset = 0.85;
    const activeSpan = endOffset - startOffset;
    const cardSpan = activeSpan / (count * 0.7 + 0.3);
    const step = (activeSpan - cardSpan) / Math.max(1, count - 1);

    return stats.map((_, i) => {
      const cardStart = Number((startOffset + i * step).toFixed(3));
      const cardEnd = Number(Math.min(endOffset, cardStart + cardSpan).toFixed(3));
      return [cardStart, cardEnd] as [number, number];
    });
  }, [stats.length]);

  // Reliable scroll-progress tracking using requestAnimationFrame and actual scroll position.
  // 100% synchronized with user scroll distance:
  // - Halts instantly when scrolling stops
  // - Reverses smoothly when scrolling backward
  // - Zero timeouts, zero intervals, zero autoplay
  useEffect(() => {
    if (shouldReduceMotion) return;

    let ticking = false;

    const computeProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      if (scrollableDistance > 0) {
        const scrolled = Math.max(0, -rect.top);
        const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
        scrollProgress.set(progress);
      } else {
        scrollProgress.set(1);
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
  }, [shouldReduceMotion, scrollProgress]);

  // Reduced motion fallback: standard static section without scroll-linked pinning
  if (shouldReduceMotion) {
    return (
      <section id="principles" className="relative z-10 py-12 sm:py-16 md:py-20 select-none">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
          <div className="liquid-glass liquid-glass-gloss rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl border border-white/15">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((stat, idx) => (
                <StatCard
                  key={stat.value}
                  stat={stat}
                  index={idx}
                  progress={scrollProgress}
                  range={[0, 1]}
                  shouldReduceMotion={true}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="principles"
      ref={containerRef}
      className="relative z-10 h-[230vh] select-none"
    >
      {/* Sticky viewport frame: remains pinned while user scrubs through the cards */}
      <div className="sticky top-0 w-full h-screen h-[100dvh] flex items-center justify-center overflow-hidden py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16 pointer-events-none">
        <div className="max-w-[1200px] w-full mx-auto pointer-events-auto">
          <div className="liquid-glass liquid-glass-gloss rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl border border-white/15">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((stat, idx) => (
                <StatCard
                  key={stat.value}
                  stat={stat}
                  index={idx}
                  progress={scrollProgress}
                  range={cardRanges[idx] || [0, 1]}
                  shouldReduceMotion={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
