/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X, ArrowRight, AlertTriangle, RotateCw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';

interface LoadingScreenProps {
  onComplete: () => void;
}

export interface ServiceStage {
  id: string;
  num: string;
  shortLabel: string;
  fullTitle: string;
  phaseLabel: string;
  sub: string;
  detailText: string;
  startPct: number;
  endPct: number;
  image: string;
  // Spatial 3D perspective layout tuning for desktop
  desktopTransform: {
    xPct: number;
    yPct: number;
    scale: number;
    rotateY: number;
    rotateX: number;
    zIndex: number;
  };
}

const SERVICE_STAGES: ServiceStage[] = [
  {
    id: 'strategy',
    num: '01',
    shortLabel: 'STRATEGY',
    fullTitle: 'Strategy & Architecture',
    phaseLabel: 'STRATEGY & ARCHITECTURE',
    sub: 'Understanding your vision and crafting the optimal technical roadmap.',
    detailText: 'Analyzing project scope, user psychology and system architecture...',
    startPct: 0,
    endPct: 20,
    image: '/assets/panel-01-strategy.jpg',
    desktopTransform: {
      xPct: 46.5,
      yPct: 22,
      scale: 0.74,
      rotateY: -16,
      rotateX: 2,
      zIndex: 10,
    },
  },
  {
    id: 'creative',
    num: '02',
    shortLabel: 'CREATIVE',
    fullTitle: 'Creative & Visual Direction',
    phaseLabel: 'CREATIVE & VISUAL DIRECTION',
    sub: 'Visualizing ideas with bespoke, high-impact design and typography.',
    detailText: 'Designing identity systems, layouts and cinematic visual directions...',
    startPct: 20,
    endPct: 40,
    image: '/assets/panel-02-creative.jpg',
    desktopTransform: {
      xPct: 54.5,
      yPct: 20,
      scale: 0.82,
      rotateY: -14,
      rotateX: 2,
      zIndex: 11,
    },
  },
  {
    id: 'development',
    num: '03',
    shortLabel: 'DEVELOPMENT',
    fullTitle: 'Development & Integration',
    phaseLabel: 'DEVELOPMENT & INTEGRATION',
    sub: 'Building powerful, performant and scalable digital products.',
    detailText: 'Building and connecting everything together...',
    startPct: 40,
    endPct: 65,
    image: '/assets/panel-03-dev.jpg',
    desktopTransform: {
      xPct: 63.5,
      yPct: 18,
      scale: 0.92,
      rotateY: -12,
      rotateX: 1,
      zIndex: 12,
    },
  },
  {
    id: 'content',
    num: '04',
    shortLabel: 'CONTENT',
    fullTitle: 'Content & Media Engine',
    phaseLabel: 'CONTENT & OPTIMIZATION',
    sub: 'Synthesizing publication-grade copy, videos and interactive assets.',
    detailText: 'Fine-tuning media buffers, responsive motion and interactive assets...',
    startPct: 65,
    endPct: 85,
    image: '/assets/panel-04-content.jpg',
    desktopTransform: {
      xPct: 73.5,
      yPct: 15,
      scale: 1.04,
      rotateY: -10,
      rotateX: 0,
      zIndex: 13,
    },
  },
  {
    id: 'launch',
    num: '05',
    shortLabel: 'LAUNCH',
    fullTitle: 'Launch & Impact',
    phaseLabel: 'LAUNCH SEQUENCE & IMPACT',
    sub: 'Pre-flight orchestration, verification and worldwide deployment.',
    detailText: 'Executing pre-flight checks and transitioning into live showcase...',
    startPct: 85,
    endPct: 100,
    image: '/assets/panel-05-launch.jpg',
    desktopTransform: {
      xPct: 84.5,
      yPct: 11,
      scale: 1.18,
      rotateY: -7,
      rotateX: -1,
      zIndex: 14,
    },
  },
];

// High-end cinematic cubic bezier easing for smooth momentum & decelerated settling
function cinematicEase(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  // Continuous sub-pixel progress float (0.0 to 1.0)
  const [smoothProgress, setSmoothProgress] = useState<number>(0);
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [isFastForward, setIsFastForward] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPanelIndex, setHoveredPanelIndex] = useState<number | null>(null);
  const [pathLength, setPathLength] = useState<number>(600);
  const [beadCoord, setBeadCoord] = useState<{ x: number; y: number }>({ x: 390, y: 420 });
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  const prefersReducedMotion = useReducedMotion();
  const { isSyncing, syncError, revalidate } = usePortfolio();

  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);
  const completedRef = useRef<boolean>(false);
  const curveRef = useRef<SVGPathElement | null>(null);

  // Parallax inertia target vs current
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  // Normal cinematic timing: 3.8s normal, 450ms on fast forward
  const duration = isFastForward ? 450 : 3800;

  // Real preloading of crucial architectural assets & fonts
  useEffect(() => {
    let isMounted = true;
    const preloadList = [
      '/assets/cinematic-pathway-bg.jpg',
      '/assets/panel-01-strategy.jpg',
      '/assets/panel-02-creative.jpg',
      '/assets/panel-03-dev.jpg',
      '/assets/panel-04-content.jpg',
      '/assets/panel-05-launch.jpg',
    ];

    preloadList.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (!isMounted) return;
      });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Measure initial SVG curve length
  useEffect(() => {
    if (curveRef.current) {
      try {
        const total = curveRef.current.getTotalLength();
        if (total > 0) setPathLength(total);
      } catch (e) {}
    }
  }, []);

  // Capture sync errors from PortfolioContext
  useEffect(() => {
    if (syncError) {
      setHasError(true);
    }
  }, [syncError]);

  // Main 60fps/120fps continuous high-precision animation loop
  useEffect(() => {
    if (hasError) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      setTimeElapsed(elapsed);

      // Smooth mouse parallax lerp (fluid inertia)
      if (!prefersReducedMotion) {
        currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08;
        currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08;
        setMousePos({ x: currentMouseRef.current.x, y: currentMouseRef.current.y });
      }

      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = cinematicEase(rawProgress);

      setSmoothProgress(easedProgress);
      setDisplayCount(Math.min(100, Math.floor(easedProgress * 100)));

      // Continuous sub-pixel bead tracking along the vector curve
      if (curveRef.current) {
        try {
          const len = curveRef.current.getTotalLength();
          if (len > 0) {
            setPathLength(len);
            const point = curveRef.current.getPointAtLength(easedProgress * len);
            setBeadCoord({ x: point.x, y: point.y });
          }
        } catch (e) {
          setBeadCoord({
            x: 390 + easedProgress * 495,
            y: 420 + easedProgress * 100,
          });
        }
      }

      if (rawProgress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        if (!completedRef.current) {
          completedRef.current = true;
          setSmoothProgress(1);
          setDisplayCount(100);
          setTimeout(() => {
            onComplete();
          }, 420);
        }
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [duration, hasError, onComplete, prefersReducedMotion]);

  // Keyboard navigation: Escape cancels, Enter or Space fast-forwards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (!isFastForward) {
          setIsFastForward(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFastForward, onComplete]);

  // Subtle 3D mouse parallax target update
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      targetMouseRef.current = {
        x: (clientX / innerWidth - 0.5) * 14,
        y: (clientY / innerHeight - 0.5) * 10,
      };
    },
    [prefersReducedMotion]
  );

  // Active stage derived smoothly from continuous percentage
  const currentPct = smoothProgress * 100;
  const currentStageIndex = useMemo(() => {
    const idx = SERVICE_STAGES.findIndex((s) => currentPct >= s.startPct && currentPct < s.endPct);
    return idx === -1 ? SERVICE_STAGES.length - 1 : idx;
  }, [currentPct]);

  const activeStage = SERVICE_STAGES[currentStageIndex];

  // Estimated countdown time calculation (00:28 down to 00:00 smoothly)
  const remainingSeconds = useMemo(() => {
    const totalEstSeconds = 28;
    const rem = Math.max(0, Math.ceil(((100 - displayCount) / 100) * totalEstSeconds));
    const secStr = rem < 10 ? `0${rem}` : `${rem}`;
    return `00:${secStr}`;
  }, [displayCount]);

  const handleFastForward = () => {
    setIsFastForward(true);
  };

  const handleCancel = () => {
    onComplete();
  };

  const handleRetry = () => {
    setHasError(false);
    startTimeRef.current = null;
    setSmoothProgress(0);
    setDisplayCount(0);
    revalidate?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
      exit={{
        opacity: 0,
        scale: 1.035,
        filter: 'blur(6px)',
        transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
      }}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[9999] bg-[#06070a] text-[#f4f2eb] flex flex-col justify-between p-4 xs:p-6 sm:p-8 md:p-10 select-none overflow-hidden min-h-dvh max-h-dvh font-body"
      role="dialog"
      aria-label="AI Build — Services Pathway"
      aria-live="polite"
    >
      {/* ========================================================== */}
      {/* 1. CINEMATIC PERSPECTIVE ENVIRONMENT BACKDROP              */}
      {/* ========================================================== */}
      <div
        className="absolute inset-0 pointer-events-none -z-20 overflow-hidden transform-gpu"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(${1.045 - smoothProgress * 0.025})`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.08s ease-out',
        }}
      >
        {/* Master Architectural Environment Photo (Stone arch, sunrise mountain, wet terrace floor, floating spheres) */}
        <img
          src="/assets/cinematic-pathway-bg.jpg"
          alt="Architectural Pathway"
          className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08]"
          loading="eager"
        />

        {/* Ambient Vignette & Depth Gradients for pristine typographic and panel contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070a]/95 via-transparent to-[#06070a]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06070a]/90 via-transparent to-[#06070a]/95 pointer-events-none" />

        {/* Soft Volumetric Warm Ivory Dawn Light Shaft hitting the archway */}
        <div className="absolute top-[8%] left-[22%] w-[580px] h-[520px] bg-gradient-to-b from-[#f5e1b8]/15 via-[#e8c89a]/6 to-transparent blur-3xl pointer-events-none animate-atmospheric-breathe" />

        {/* Dynamic Electric-Blue Active Stage Floor Bloom on the wet reflective stone terrace */}
        <div
          className="absolute rounded-full bg-cyan-400/15 blur-[95px] pointer-events-none"
          style={{
            left: `${activeStage.desktopTransform.xPct}%`,
            top: '74%',
            width: '450px',
            height: '240px',
            transform: 'translate(-50%, -50%)',
            opacity: 0.35 + smoothProgress * 0.55,
            transition: 'left 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
          }}
        />
      </div>

      {/* ========================================================== */}
      {/* 2. TOP HEADER (BRAND IDENTITY + SYSTEM STATUS & TIME)       */}
      {/* ========================================================== */}
      <header className="w-full max-w-[1740px] mx-auto flex items-start justify-between relative z-30 shrink-0">
        {/* Upper-Left: Brand Identity */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl sm:text-3xl tracking-tight text-[#f4f2eb] font-normal">
              AI Build
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_10px_#00e5ff] animate-pulse inline-block" />
          </div>
          <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.28em] text-white/55 uppercase mt-1">
            CREATE • BUILD • SHOWCASE
          </p>
        </motion.div>

        {/* Upper-Right: System Status & Estimated Time */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="flex items-start gap-6 sm:gap-10 text-right"
        >
          {/* Status badge */}
          <div className="hidden xs:flex flex-col items-end">
            <span className="text-[8.5px] sm:text-[9.5px] font-mono tracking-[0.24em] text-white/45 uppercase flex items-center gap-1.5">
              <span className="text-[10px] text-cyan-400">◇</span> SYSTEM STATUS
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.18em] text-[#00e5ff] uppercase font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-ping" />
              {isSyncing ? 'SYNCHRONIZING REPO...' : 'INITIALIZING SERVICES...'}
            </span>
          </div>

          {/* Dynamic Estimated Time Countdown */}
          <div className="flex flex-col items-end min-w-[70px]">
            <span className="text-[8.5px] sm:text-[9.5px] font-mono tracking-[0.24em] text-white/45 uppercase">
              EST. TIME
            </span>
            <span className="font-display text-xl sm:text-2xl text-[#f4f2eb] tabular-nums tracking-wide font-normal mt-0.5">
              {remainingSeconds}
            </span>
          </div>
        </motion.div>
      </header>

      {/* ========================================================== */}
      {/* 3. MAIN STAGE: EDITORIAL HEADLINE + PERSPECTIVE PATHWAY     */}
      {/* ========================================================== */}
      <main className="relative z-20 w-full max-w-[1740px] mx-auto my-auto flex-1 flex flex-col justify-center py-2 sm:py-4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* -------------------------------------------------------- */}
          {/* LEFT SIDE: LARGE DRAMATIC EDITORIAL HEADLINE             */}
          {/* -------------------------------------------------------- */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center select-none z-30">
            {/* Section Tag */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] text-[#00e5ff] uppercase font-medium">
                / SERVICES ENGINE
              </span>
            </motion.div>

            {/* Monumental Editorial Headline with Staggered Mask Reveal */}
            <div className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[76px] leading-[0.97] tracking-tight text-[#f4f2eb] mb-6">
              <div className="overflow-hidden py-0.5">
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  Shaping
                </motion.div>
              </div>
              <div className="overflow-hidden py-0.5">
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="italic font-normal text-[#f7e6c4]"
                >
                  Ideas.
                </motion.div>
              </div>
              <div className="overflow-hidden py-0.5">
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                >
                  Building
                </motion.div>
              </div>
              <div className="overflow-hidden py-0.5">
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="italic font-normal text-[#f4f2eb]"
                >
                  Impact.
                </motion.div>
              </div>
            </div>

            {/* Lower-left Micro Manifesto */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.65, ease: 'easeOut' }}
              className="flex flex-col gap-1 font-mono text-[9px] sm:text-[10px] tracking-[0.26em] text-white/45 uppercase pt-2 border-l border-white/20 pl-3.5"
            >
              <span>DESIGNING</span>
              <span>DEVELOPING</span>
              <span>OPTIMIZING</span>
              <span>AND BRINGING</span>
              <span className="text-white/85">IDEAS TO LIFE.</span>
            </motion.div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* CENTER & RIGHT: PERSPECTIVE PATHWAY & 5 MONOLITH PANELS  */}
          {/* -------------------------------------------------------- */}
          <div className="lg:col-span-8 xl:col-span-8 relative w-full h-[320px] sm:h-[400px] md:h-[460px] lg:h-[510px] xl:h-[560px]">
            
            {/* Desktop Panoramic Perspective Layout */}
            <div className="hidden md:block absolute inset-0 perspective-[1400px] transform-style-preserve-3d overflow-visible">
              
              {/* 3.1 THE CONTINUOUS GLOWING CURVED PATHWAY SVG */}
              <svg
                viewBox="0 0 1000 600"
                className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Glowing neon path gradient: Warm ivory near archway (01) transitioning to electric-blue */}
                  <linearGradient id="neonPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f5e1b8" stopOpacity="0.45" />
                    <stop offset="30%" stopColor="#e8c89a" stopOpacity="0.75" />
                    <stop offset="70%" stopColor="#00e5ff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
                  </linearGradient>

                  {/* High-intensity blue glow filter for the traveling neon bead */}
                  <filter id="neonBeadGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Subdued Background Fiber Path along the stone terrace rim */}
                <path
                  d="M 390 420 C 470 415, 550 435, 630 460 C 710 488, 790 500, 885 520"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* The Dynamically Growing Laser Neon Beam with Smooth Dashoffset */}
                <path
                  ref={curveRef}
                  d="M 390 420 C 470 415, 550 435, 630 460 C 710 488, 790 500, 885 520"
                  fill="none"
                  stroke="url(#neonPathGrad)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={pathLength * (1 - smoothProgress)}
                  className="animate-laser-pulse"
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(0, 229, 255, 0.85)) drop-shadow(0 0 4px #00e5ff)',
                  }}
                />

                {/* Dynamic Glowing Blue Traveler Light Bead navigating with Sub-Pixel Precision */}
                <g transform={`translate(${beadCoord.x}, ${beadCoord.y})`}>
                  {/* Outer pulsating blue halo */}
                  <circle
                    r="14"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="1.5"
                    strokeOpacity="0.65"
                    className="animate-ping"
                  />
                  {/* Trailing comet wake glow */}
                  <circle
                    r="18"
                    fill="rgba(0, 229, 255, 0.18)"
                    className="blur-[2px]"
                  />
                  {/* Middle neon bloom */}
                  <circle
                    r="8"
                    fill="#00e5ff"
                    filter="url(#neonBeadGlow)"
                    className="opacity-95"
                  />
                  {/* Ultra-white luminous core */}
                  <circle r="3.5" fill="#ffffff" />
                </g>
              </svg>

              {/* 3.2 THE 5 ARCHITECTURAL TRANSLUCENT MONOLITH PANELS IN PERSPECTIVE */}
              {SERVICE_STAGES.map((stage, idx) => {
                const isCompleted = currentPct >= stage.endPct;
                const isActive = currentPct >= stage.startPct && currentPct < stage.endPct;
                const isHovered = hoveredPanelIndex === idx;

                const { xPct, yPct, scale, rotateY, rotateX, zIndex } = stage.desktopTransform;

                // Subtle weightless floating oscillation wave in spatial depth
                const floatOffset = prefersReducedMotion
                  ? 0
                  : Math.sin(timeElapsed * 0.0018 + idx * 1.1) * 4;

                // When active or hovered, slightly elevate panel forward
                const activeScaleMultiplier = isActive ? 1.05 : isHovered ? 1.02 : 1;
                const activeTranslateY = (isActive ? -8 : isHovered ? -4 : 0) + floatOffset;

                return (
                  <div
                    key={stage.id}
                    onMouseEnter={() => setHoveredPanelIndex(idx)}
                    onMouseLeave={() => setHoveredPanelIndex(null)}
                    style={{
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      zIndex: isActive ? 50 : isHovered ? 45 : zIndex,
                      transform: `translate3d(-50%, ${activeTranslateY}px, 0) scale(${scale * activeScaleMultiplier}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
                      transformOrigin: 'bottom center',
                      transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease, box-shadow 0.6s ease, opacity 0.5s ease',
                    }}
                    className={`absolute w-[165px] lg:w-[185px] xl:w-[205px] h-[280px] lg:h-[315px] xl:h-[355px] rounded-2xl flex flex-col justify-between p-3.5 sm:p-4 backdrop-blur-md cursor-pointer ${
                      isActive
                        ? 'border-2 border-[#00e5ff] bg-black/65 shadow-[0_0_38px_rgba(0,229,255,0.48),inset_0_0_22px_rgba(0,229,255,0.22)]'
                        : isCompleted
                        ? 'border border-white/25 bg-black/45 shadow-[0_8px_30px_rgba(0,0,0,0.6)] opacity-95 hover:opacity-100 hover:border-white/50'
                        : 'border border-white/10 bg-black/35 shadow-[0_8px_25px_rgba(0,0,0,0.5)] opacity-65 hover:opacity-90 hover:border-white/30'
                    }`}
                  >
                    {/* Active Corner Accents (Corner Neon Brackets matching reference Panel 05) */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="pointer-events-none"
                      >
                        <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00e5ff] rounded-tl-sm drop-shadow-[0_0_6px_#00e5ff]" />
                        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00e5ff] rounded-tr-sm drop-shadow-[0_0_6px_#00e5ff]" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00e5ff] rounded-bl-sm drop-shadow-[0_0_6px_#00e5ff]" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00e5ff] rounded-br-sm drop-shadow-[0_0_6px_#00e5ff]" />
                      </motion.div>
                    )}

                    {/* Top Bevel Highlight Sheen */}
                    <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

                    {/* Panel Header: Number + Service Title */}
                    <div className="flex flex-col z-10">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-display text-2xl lg:text-3xl tracking-tight transition-all duration-500 ${
                            isActive
                              ? 'text-[#00e5ff] font-normal drop-shadow-[0_0_12px_rgba(0,229,255,0.85)]'
                              : isCompleted
                              ? 'text-[#f5e1b8]'
                              : 'text-white/50'
                          }`}
                        >
                          {stage.num}
                        </span>

                        {/* Status node */}
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                            className="w-4 h-4 rounded-full border border-white/40 bg-white/10 flex items-center justify-center"
                          >
                            <Check className="w-2.5 h-2.5 text-white/90" />
                          </motion.div>
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] shadow-[0_0_12px_#00e5ff] animate-pulse" />
                        ) : null}
                      </div>

                      <span
                        className={`text-[9.5px] lg:text-[10.5px] font-mono tracking-[0.22em] uppercase mt-1 transition-colors duration-500 ${
                          isActive
                            ? 'text-[#f4f2eb] font-semibold'
                            : isCompleted
                            ? 'text-white/80'
                            : 'text-white/45'
                        }`}
                      >
                        {stage.shortLabel}
                      </span>
                    </div>

                    {/* Artwork Preview Window */}
                    <div className="relative w-full h-[155px] lg:h-[180px] xl:h-[205px] rounded-xl overflow-hidden my-auto border border-white/10 shadow-inner group">
                      <img
                        src={stage.image}
                        alt={stage.shortLabel}
                        style={{
                          transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease',
                        }}
                        className={`w-full h-full object-cover ${
                          isActive
                            ? 'scale-105 brightness-105 contrast-105'
                            : isHovered
                            ? 'scale-102 brightness-100'
                            : 'scale-100 brightness-90 grayscale-[15%]'
                        }`}
                      />
                      {/* Gradient shadow over artwork */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      {/* Active Panel Blue Wash Overlay */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/25 via-transparent to-transparent pointer-events-none mix-blend-screen transition-opacity duration-500" />
                      )}
                    </div>

                    {/* Panel Footer: Status / Detail */}
                    <div className="flex items-center justify-between text-[8.5px] lg:text-[9.5px] font-mono tracking-[0.16em] uppercase z-10">
                      <span className={isActive ? 'text-[#00e5ff] transition-colors duration-300' : 'text-white/40'}>
                        {isActive ? 'ACTIVE STAGE' : isCompleted ? 'RESOLVED' : 'PENDING'}
                      </span>
                      <span className="text-white/30">AI BUILD</span>
                    </div>
                  </div>
                );
              })}

              {/* 3.3 RIGHT SIDE STAGE TRACKER & RADAR DIAL */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
                className="hidden xl:flex absolute top-4 right-0 flex-col items-end gap-6 z-30 select-none"
              >
                {/* Stage Counter & Vertical Rail */}
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1.5 font-mono text-white/50 text-xs mb-3">
                    <span className="font-display text-lg text-[#f4f2eb]">05</span>
                    <span className="text-[9px] tracking-[0.2em] uppercase">SERVICES</span>
                  </div>

                  {/* Vertical Stage Checkpoints */}
                  <div className="flex flex-col gap-2 relative pr-4">
                    {/* Vertical Rail Line */}
                    <div className="absolute right-1 top-1 bottom-1 w-[1px] bg-white/15" />

                    {SERVICE_STAGES.map((s, i) => {
                      const isAct = currentStageIndex === i;
                      const isDone = currentPct >= s.endPct;
                      return (
                        <div key={s.id} className="flex items-center gap-2 justify-end relative">
                          <span
                            className={`text-[9px] font-mono tracking-[0.2em] uppercase transition-colors duration-400 ${
                              isAct
                                ? 'text-[#00e5ff] font-semibold'
                                : isDone
                                ? 'text-white/70'
                                : 'text-white/30'
                            }`}
                          >
                            {s.shortLabel}
                          </span>
                          {/* Pip on rail */}
                          <div
                            className={`w-2 h-2 rounded-full z-10 transition-all duration-400 ${
                              isAct
                                ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] scale-125'
                                : isDone
                                ? 'bg-white/60'
                                : 'bg-white/20'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Radar / Coordinate Reticle Dial Graphic */}
                <div className="flex flex-col items-end gap-2 pt-2">
                  <div className="relative w-16 h-16 rounded-full border border-white/15 flex items-center justify-center">
                    {/* Concentric rings */}
                    <div className="w-10 h-10 rounded-full border border-dashed border-white/20" />
                    <div className="w-3 h-3 rounded-full bg-[#00e5ff]/20 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                    </div>
                    {/* Rotating crosshair scanner */}
                    <div className="absolute inset-0 flex items-center justify-center animate-[spin_8s_linear_infinite]">
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff]/40 to-transparent" />
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[7.5px] font-mono tracking-[0.22em] text-white/40 uppercase">
                      TRANSFORMING <br /> IDEAS INTO SOLUTIONS
                    </p>
                    <p className="text-[7.5px] font-mono tracking-[0.24em] text-[#00e5ff] uppercase mt-0.5">
                      AI BUILD 2026
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mobile / Compact Responsive View (Clean vertical stage journey) */}
            <div className="md:hidden flex flex-col justify-center h-full gap-4">
              {/* Active Stage Large Showcase Card */}
              <div className="relative w-full rounded-2xl border-2 border-[#00e5ff] bg-black/65 p-4 backdrop-blur-md shadow-[0_0_25px_rgba(0,229,255,0.35)] overflow-hidden transition-all duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-3xl text-[#00e5ff] font-normal">
                    {activeStage.num}
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.22em] text-[#00e5ff] uppercase font-semibold">
                    {activeStage.shortLabel}
                  </span>
                </div>

                <div className="w-full h-36 rounded-xl overflow-hidden relative mb-2 border border-white/10">
                  <img
                    src={activeStage.image}
                    alt={activeStage.shortLabel}
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                </div>

                <p className="text-xs text-[#f4f2eb] font-sans font-medium line-clamp-1">
                  {activeStage.fullTitle}
                </p>
                <p className="text-[11px] text-white/50 font-sans line-clamp-1 mt-0.5">
                  {activeStage.sub}
                </p>
              </div>

              {/* 5-step horizontal mini pills */}
              <div className="grid grid-cols-5 gap-1.5">
                {SERVICE_STAGES.map((s) => {
                  const isAct = s.id === activeStage.id;
                  const isDone = currentPct >= s.endPct;
                  return (
                    <div
                      key={s.id}
                      className={`py-1.5 px-1 rounded-lg text-center font-mono text-[8px] tracking-wider uppercase border transition-all duration-300 ${
                        isAct
                          ? 'border-[#00e5ff] bg-[#00e5ff]/20 text-[#00e5ff] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                          : isDone
                          ? 'border-white/30 bg-white/10 text-white/80'
                          : 'border-white/10 bg-black/30 text-white/30'
                      }`}
                    >
                      {s.num}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ========================================================== */}
      {/* 4. BOTTOM TIMELINE, PERCENTAGE COUNTER & CONTROLS           */}
      {/* ========================================================== */}
      <footer className="w-full max-w-[1740px] mx-auto flex flex-col gap-3 relative z-30 pt-2 shrink-0 select-none">
        
        {/* Integrated Horizontal Timeline Row */}
        <div className="w-full flex items-center gap-4 sm:gap-6">
          
          {/* Big Editorial Serif Percentage on the Left */}
          <div className="flex items-baseline gap-2 shrink-0 min-w-[90px] sm:min-w-[125px]">
            <span className="font-display text-3xl sm:text-4xl md:text-5xl text-[#f4f2eb] font-normal tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {displayCount}%
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.24em] text-white/40 uppercase hidden sm:inline-block">
              LOAD
            </span>
          </div>

          {/* Connected Pathway Horizontal Timeline Track */}
          <div className="flex-1 flex flex-col gap-2">
            
            {/* The Glowing Shimmering Electric-Blue Track */}
            <div className="w-full h-[2.5px] bg-white/15 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full relative animate-shimmer-sweep"
                style={{
                  width: `${smoothProgress * 100}%`,
                  background: 'linear-gradient(90deg, #0284c7 0%, #00e5ff 45%, #38bdf8 70%, #ffffff 88%, #00e5ff 100%)',
                  backgroundSize: '200% 100%',
                  boxShadow: '0 0 16px rgba(0, 229, 255, 0.9), 0 0 6px #00e5ff',
                  transition: 'width 0.05s linear',
                }}
              />
            </div>

            {/* Stage Checkpoints */}
            <div className="hidden sm:flex items-center justify-between w-full pt-0.5">
              {SERVICE_STAGES.map((stage) => {
                const isCompleted = currentPct >= stage.endPct;
                const isActive = currentPct >= stage.startPct && currentPct < stage.endPct;

                return (
                  <div key={stage.id} className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono tracking-[0.16em] uppercase transition-colors duration-400 ${
                        isActive
                          ? 'text-[#00e5ff] font-semibold drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]'
                          : isCompleted
                          ? 'text-white/80'
                          : 'text-white/35'
                      }`}
                    >
                      {stage.num} {stage.shortLabel}
                    </span>

                    {/* Resolved checkmark or active node */}
                    {isCompleted ? (
                      <Check className="w-2.5 h-2.5 text-[#00e5ff] transition-transform duration-300 scale-100" />
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff] animate-ping" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lower Row: Status Details + Real Action Buttons */}
        <div className="w-full flex items-center justify-between pt-1">
          
          {/* Current Phase Message */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase hidden sm:inline">
                  CURRENT PHASE /
                </span>
                <span className="text-xs sm:text-sm font-mono tracking-[0.14em] text-[#f4f2eb] font-medium uppercase transition-all duration-400">
                  {isSyncing ? 'SYNCHRONIZING REPOSITORY DATA' : activeStage.phaseLabel}
                </span>
              </div>
              <span className="text-[10.5px] sm:text-xs font-sans text-white/50 line-clamp-1 transition-opacity duration-400">
                {isSyncing
                  ? 'Fetching portfolio projects and CMS records from cloud...'
                  : activeStage.detailText}
              </span>
            </div>
          </div>

          {/* Action Controls: Cancel & Fast Forward */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-white/35 text-[10.5px] sm:text-xs font-mono text-white/65 hover:text-white transition-all duration-300 flex items-center gap-1.5 cursor-pointer backdrop-blur-md focus-visible:ring-1 focus-visible:ring-[#00e5ff] focus-visible:outline-none"
              title="Cancel loading & enter site immediately (Esc)"
              aria-label="Cancel loading and enter website"
            >
              <X className="w-3 h-3 text-white/50" />
              <span>Cancel</span>
            </button>

            {/* Fast Forward Button */}
            <button
              type="button"
              onClick={handleFastForward}
              className="px-4 sm:px-5 py-1.5 rounded-full bg-[#07131e]/90 hover:bg-[#0c1f30] border border-[#00e5ff]/50 hover:border-[#00e5ff] text-[10.5px] sm:text-xs font-mono text-[#00e5ff] hover:text-white font-medium shadow-[0_0_16px_rgba(0,229,255,0.22)] hover:shadow-[0_0_24px_rgba(0,229,255,0.45)] transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 backdrop-blur-md focus-visible:ring-1 focus-visible:ring-[#00e5ff] focus-visible:outline-none"
              title="Fast forward loading sequence (Space or Enter)"
              aria-label="Fast forward loading sequence"
            >
              <span>Fast Forward</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00e5ff]" />
            </button>
          </div>
        </div>

        {/* Sync Error / Retry State Banner */}
        {hasError && (
          <div className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/[0.08] flex items-center justify-between text-2xs font-mono text-rose-300 mt-1 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Services synchronization stalled ({syncError || 'Network timeout'}).</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="px-3 py-1 rounded-lg border border-rose-500/40 hover:bg-rose-500/20 text-rose-200 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Retry synchronization"
            >
              <RotateCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </footer>
    </motion.div>
  );
};
