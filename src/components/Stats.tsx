/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion, MotionValue } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { BrandPrincipleStat } from '../utils/portfolio.ts';

interface PrincipleColumnProps {
  stat: BrandPrincipleStat;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  nodeRange: [number, number];
  shouldReduceMotion: boolean;
}

const PrincipleColumn: React.FC<PrincipleColumnProps> = ({
  stat,
  index,
  progress,
  range,
  nodeRange,
  shouldReduceMotion,
}) => {
  const [start, end] = range;
  const [nodeStart, nodeEnd] = nodeRange;

  // STRICT HIDDEN INITIAL STATE: Opacity starts strictly at 0!
  const textOpacity = useTransform(progress, [start, end], [0, 1]);
  const textY = useTransform(progress, [start, end], [40, 0]);
  const textScale = useTransform(progress, [start, end], [0.92, 1]);
  const blurVal = useTransform(progress, [start, end], [10, 0]);
  const filter = useTransform(blurVal, (v) => (v <= 0.1 ? 'none' : `blur(${v.toFixed(1)}px)`));

  // Node glows and grows as the scroll line reaches this milestone
  const nodeGlow = useTransform(progress, [nodeStart, nodeEnd], [0.15, 1]);
  const nodeScale = useTransform(progress, [nodeStart, nodeEnd], [0.85, 1]);

  return (
    <div
      className="flex flex-col items-center text-center relative px-2 sm:px-4"
      data-stat-item={stat.value.toLowerCase()}
    >
      {/* Node / Milestone indicator aligned with the connecting line */}
      <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
        {/* Glowing outer circle */}
        <motion.div
          style={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: nodeGlow,
                  scale: nodeScale,
                }
          }
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-sky-400/50 bg-[#07090e] flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.45)] relative z-10"
        >
          {/* Inner pulsating core */}
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-200 shadow-[0_0_10px_rgba(56,189,248,1)]" />
        </motion.div>

        {/* Step number: 01, 02, 03 */}
        <motion.span
          style={shouldReduceMotion ? undefined : { opacity: nodeGlow }}
          className="absolute -bottom-5 text-2xs font-mono text-accent/80 tracking-widest uppercase font-semibold"
        >
          0{index + 1}
        </motion.span>
      </div>

      {/* Pure text block — STRICTLY HIDDEN (opacity 0) until scroll reaches range */}
      <motion.div
        style={
          shouldReduceMotion
            ? undefined
            : {
                opacity: textOpacity,
                y: textY,
                scale: textScale,
                filter,
                willChange: 'transform, opacity, filter',
              }
        }
        className="flex flex-col items-center mt-2"
      >
        {/* Large Serif Title */}
        <h3 className="text-3xl sm:text-5xl font-display text-white tracking-tight mb-2 sm:mb-3 drop-shadow-[0_2px_14px_rgba(255,255,255,0.25)] select-none">
          {stat.value}
        </h3>

        {/* Uppercase Mono Subtitle */}
        <div className="text-xs sm:text-sm font-semibold text-accent tracking-wider mb-2.5 font-mono uppercase">
          {stat.label}
        </div>

        {/* Descriptive body text */}
        <p className="text-xs sm:text-sm text-muted font-normal max-w-[280px] leading-relaxed">
          {stat.sub}
        </p>
      </motion.div>
    </div>
  );
};

interface MobilePrincipleCardProps {
  stat: BrandPrincipleStat;
  index: number;
  total: number;
  progress: MotionValue<number>;
  range: [number, number];
}

const MobilePrincipleCard: React.FC<MobilePrincipleCardProps> = ({
  stat,
  index,
  total,
  progress,
  range,
}) => {
  const [start, end] = range;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const nextStart = isLast ? 1.0 : start + 0.3;

  const opacity = useTransform(
    progress,
    isFirst
      ? [0, end, nextStart - 0.05, nextStart + 0.05]
      : isLast
      ? [start, end]
      : [start, end, nextStart - 0.05, nextStart + 0.05],
    isFirst
      ? [1, 1, 1, 0]
      : isLast
      ? [0, 1]
      : [0, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    isFirst
      ? [0, end, nextStart - 0.05, nextStart + 0.05]
      : isLast
      ? [start, end]
      : [start, end, nextStart - 0.05, nextStart + 0.05],
    isFirst
      ? [0, 0, 0, -15]
      : isLast
      ? [20, 0]
      : [20, 0, 0, -15]
  );

  return (
    <motion.div
      style={{
        opacity,
        y,
        willChange: 'transform, opacity',
      }}
      className="absolute inset-x-0 flex flex-col items-center text-center px-2 pointer-events-none"
    >
      <h3 className="text-3xl font-display text-white tracking-tight mb-2 select-none drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]">
        {stat.value}
      </h3>
      <div className="text-xs font-semibold text-accent tracking-wider mb-2 font-mono uppercase">
        {stat.label}
      </div>
      <p className="text-xs text-muted font-normal max-w-[280px] leading-relaxed">
        {stat.sub}
      </p>
    </motion.div>
  );
};

export const Stats: React.FC = () => {
  const { data } = usePortfolio();
  const stats = data.stats;
  const count = stats.length || 4;
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement | null>(null);

  // Normalized scroll progress of the pinned section: 0 (entry) to 1 (exit)
  const scrollProgress = useMotionValue(0);

  // Progressive connecting line: extends smoothly from Col 1 to Col 4
  const lineProgress = useTransform(scrollProgress, [0.05, 0.85], [0, 1]);

  // Sequential reveal ranges for text:
  const textRanges = useMemo(() => {
    const step = 0.8 / count;
    return Array.from({ length: count }, (_, i) => [
      0.04 + i * step,
      0.04 + i * step + step * 0.72,
    ]) as [number, number][];
  }, [count]);

  // Node arrival ranges:
  const nodeRanges = useMemo(() => {
    const step = 0.8 / count;
    return Array.from({ length: count }, (_, i) => [
      0.02 + i * step,
      0.02 + i * step + step * 0.52,
    ]) as [number, number][];
  }, [count]);

  // Scroll tracking loop
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

  // Fallback for reduced motion
  if (shouldReduceMotion) {
    return (
      <section id="principles" className="relative z-10 py-16 sm:py-24 select-none">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12 md:mb-16">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.12em] sm:tracking-[0.18em] text-accent font-medium mb-1.5 sm:mb-2">
              Foundational Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-normal text-text-primary tracking-tight">
              Driven by purpose &amp; <span className="font-display italic">precision</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, idx) => (
              <PrincipleColumn
                key={stat.value}
                stat={stat}
                index={idx}
                progress={scrollProgress}
                range={[0, 1]}
                nodeRange={[0, 1]}
                shouldReduceMotion={true}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="principles"
      ref={containerRef}
      className="relative z-10 h-[190vh] md:h-[240vh] select-none"
      aria-label="Core Studio Principles"
    >
      {/* Sticky viewport frame: remains pinned while scroll advances the connecting line */}
      <div className="sticky top-0 w-full h-screen h-[100dvh] supports-[height:100svh]:h-[100svh] flex items-center justify-center overflow-hidden py-6 sm:py-12 md:py-16 px-3 sm:px-6 md:px-10 lg:px-16 pointer-events-none">
        <div className="max-w-[1280px] w-full mx-auto pointer-events-auto flex flex-col items-center">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12 md:mb-16">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.12em] sm:tracking-[0.18em] text-accent font-medium mb-1.5 sm:mb-2">
              Foundational Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-normal text-text-primary tracking-tight">
              Driven by purpose &amp; <span className="font-display italic">precision</span>
            </h2>
          </div>

          {/* MOBILE VIEW (< md): Single centered active principle with a sleek top milestone connector */}
          <div className="flex md:hidden flex-col items-center w-full px-2 max-w-sm">
            {/* Top Horizontal Milestone Stepper */}
            <div className="relative w-full max-w-[320px] h-12 flex items-center justify-between mb-6">
              {/* Background track line */}
              <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-white/10 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                <motion.div
                  className="h-full w-full bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 origin-left shadow-[0_0_14px_rgba(56,189,248,1)]"
                  style={{ scaleX: lineProgress }}
                />
              </div>

              {/* Milestone Nodes: 01, 02, 03, 04 */}
              {stats.map((stat, idx) => (
                <div key={stat.value} className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border border-sky-400/50 bg-[#07090e] flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.45)]">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-200" />
                  </div>
                  <span className="text-2xs font-mono text-accent tracking-widest mt-1">
                    0{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Principle Cards: revealed cleanly in single viewport without squishing */}
            <div className="relative w-full min-h-[190px] flex items-center justify-center">
              {stats.map((stat, idx) => (
                <MobilePrincipleCard
                  key={stat.value}
                  stat={stat}
                  index={idx}
                  total={stats.length}
                  progress={scrollProgress}
                  range={textRanges[idx] || [0, 1]}
                />
              ))}
            </div>
          </div>

          {/* DESKTOP VIEW (>= md): All 4 Columns in a Single Lane with Connecting Line */}
          <div className="hidden md:grid md:grid-cols-4 gap-6 lg:gap-8 w-full relative">
            
            {/* The horizontal connecting line: runs directly from center of Col 1 to center of Col 4 */}
            <div
              className="absolute top-5 h-[2px] bg-white/10 -translate-y-1/2 z-0 rounded-full overflow-hidden"
              style={{
                left: `${100 / (2 * count)}%`,
                right: `${100 / (2 * count)}%`,
              }}
            >
              {/* Scroll-driven active glowing fill */}
              <motion.div
                className="h-full w-full bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 origin-left shadow-[0_0_18px_rgba(56,189,248,1)]"
                style={{ scaleX: lineProgress }}
              />
            </div>

            {/* 4 Principles Columns in a single lane */}
            {stats.map((stat, idx) => (
              <PrincipleColumn
                key={stat.value}
                stat={stat}
                index={idx}
                progress={scrollProgress}
                range={textRanges[idx] || [0, 1]}
                nodeRange={nodeRanges[idx] || [0, 1]}
                shouldReduceMotion={false}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};



