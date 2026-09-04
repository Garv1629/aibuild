import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, animate, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowUpRight,
  Move,
  Rotate3d,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sliders,
  Check,
  Compass,
  Magnet,
  Flame,
  Anchor,
  Navigation,
  Eye,
  EyeOff,
  Crosshair,
  Layers,
  Sun,
  Palette,
  Zap,
  Gauge,
} from 'lucide-react';
import { playStudioChime, adminStore } from '../services/adminStore';
import { CharacterLightingPresetId, CharacterLightingSettings } from '../types';
import { getLightingPreset, LIGHTING_PRESET_LIST } from '../utils/lightingPresets';

export type PerformanceModeOption = 'adaptive' | 'always' | 'off';

interface GlobalScrollCharacterProps {
  portraitUrl?: string;
  portraitMediaType?: 'image' | 'video';
  portraitVideoUrl?: string;
  performanceMode?: boolean | PerformanceModeOption;
  onOpenContact?: (serviceType?: string) => void;
}

export type ScrollMode = 'scroll' | 'stable';
export type CursorMode = 'subtle' | 'magnetic' | 'floating' | 'off';

export const GlobalScrollCharacter: React.FC<GlobalScrollCharacterProps> = ({
  portraitUrl = 'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png',
  portraitMediaType = 'image',
  portraitVideoUrl,
  performanceMode = 'adaptive',
  onOpenContact,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'services' | 'projects' | 'reviews' | 'footer'>('hero');
  const [currentZIndex, setCurrentZIndex] = useState<number>(30);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [userScaleMultiplier, setUserScaleMultiplier] = useState<number>(1.0);
  const [cursorTrackingMode, setCursorTrackingMode] = useState<CursorMode>('magnetic');
  const [scrollMode, setScrollMode] = useState<ScrollMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'stable' : 'scroll'
  );
  const [showControls, setShowControls] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHeroSection, setIsHeroSection] = useState(true);
  const [lightingSettings, setLightingSettings] = useState<CharacterLightingSettings>(
    adminStore.getCharacterLighting()
  );

  // Performance Mode (Adaptive LOD & reduced Ambient Occlusion during active scroll)
  const initialPerfMode: PerformanceModeOption =
    typeof performanceMode === 'boolean'
      ? performanceMode ? 'adaptive' : 'off'
      : performanceMode || lightingSettings.performanceModeBehavior || 'adaptive';

  const [perfMode, setPerfMode] = useState<PerformanceModeOption>(initialPerfMode);
  const [isActivelyScrolling, setIsActivelyScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollYRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const isTransitioningRef = useRef(false);

  // Sync with Admin Data Store for real-time lighting preset changes
  useEffect(() => {
    const unsub = adminStore.subscribe((state) => {
      if (state.websiteContent.characterLighting) {
        setLightingSettings(state.websiteContent.characterLighting);
      }
    });
    return unsub;
  }, []);

  const activePresetConfig = getLightingPreset(lightingSettings.activePreset);
  const intensityMultiplier = lightingSettings.customIntensity ?? 1.0;
  const rimBoost = lightingSettings.rimLightBoost ?? 1.0;

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamic 3D Studio Lighting & Specular Ray-Traced Sheen
  const [characterRef, setCharacterRef] = useState<HTMLDivElement | null>(null);
  const sheenX = useSpring(50, { stiffness: 120, damping: 24 });
  const sheenY = useSpring(35, { stiffness: 120, damping: 24 });
  const basePresetIntensity = activePresetConfig.baseIntensity * intensityMultiplier;
  const sheenOpacity = useSpring(0.45 * basePresetIntensity, { stiffness: 90, damping: 22 });
  const lightIntensity = useSpring(basePresetIntensity, { stiffness: 100, damping: 20 });
  const rimLightAngle = useSpring(45, { stiffness: 90, damping: 25 });

  const handleCharacterMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!characterRef) return;
    const rect = characterRef.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    sheenX.set(x);
    sheenY.set(y);
    sheenOpacity.set(0.9 * basePresetIntensity);
    lightIntensity.set(0.95 * basePresetIntensity);
  };

  const handleCharacterMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (!characterRef) return;
    const rect = characterRef.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    sheenX.set(x);
    sheenY.set(y);
    sheenOpacity.set(0.9 * basePresetIntensity);
    lightIntensity.set(0.95 * basePresetIntensity);
  };

  const handleCharacterMouseLeave = () => {
    setIsHovered(false);
    sheenOpacity.set(0.45 * basePresetIntensity);
    lightIntensity.set(basePresetIntensity);
  };

  // Ultra-responsive, low-latency spring physics for instant 3D cursor follow without delay
  const cursorSpringConfig = { stiffness: 260, damping: 26, mass: 0.35 };
  const cursorSpringX = useSpring(0, cursorSpringConfig);
  const cursorSpringY = useSpring(0, cursorSpringConfig);
  const cursorTiltX = useSpring(0, cursorSpringConfig);
  const cursorTiltY = useSpring(0, cursorSpringConfig);

  // Lifelike Eye/Head Micro-Focus Springs
  const focusSpringConfig = { stiffness: 220, damping: 22, mass: 0.35 };
  const focusTiltX = useSpring(0, focusSpringConfig);
  const focusTiltY = useSpring(0, focusSpringConfig);
  const focusIntensity = useSpring(0, { stiffness: 160, damping: 24 });

  // Mode Travel Animation System
  // stableTravelY represents the offset relative to viewport bottom.
  // When in 'scroll' mode: stableTravelY = 0 (fixed to viewport).
  // When in 'stable' mode: stableTravelY = -window.scrollY (anchored to hero section in document).
  const stableTravelY = useMotionValue(0);
  const modeTransitionWeight = useMotionValue(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 1
  ); // 1 = scroll mode, 0 = stable mode

  const isScrollingRef = useRef(false);
  const isHeroSectionRef = useRef(true);

  // Track window scroll efficiently without state thrashing
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      scrollPosRef.current = currentScroll;

      const isHero = currentScroll < 150;
      if (isHero !== isHeroSectionRef.current) {
        isHeroSectionRef.current = isHero;
        setIsHeroSection(isHero);
      }

      // Performance Mode: Mark actively scrolling only when state changes
      if (perfMode !== 'off') {
        if (!isScrollingRef.current) {
          isScrollingRef.current = true;
          setIsActivelyScrolling(true);
        }
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          setIsActivelyScrolling(false);
        }, 120);
      }

      // If in stable mode and not in active programmatic flight, lock 1:1 with hero section in document
      if (scrollMode === 'stable' && !isTransitioningRef.current) {
        stableTravelY.set(-currentScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollMode, stableTravelY, perfMode]);

  // Mode selection with seamless travel flight
  const handleSelectScrollMode = useCallback(
    (targetMode: ScrollMode) => {
      if (scrollMode === targetMode) return;
      playStudioChime('click');
      setScrollMode(targetMode);

      const currentScroll = window.scrollY;
      scrollPosRef.current = currentScroll;
      isTransitioningRef.current = true;

      if (targetMode === 'stable') {
        // Character & HUD travel from current viewport location to original Hero position (-currentScroll px)
        // The page itself DOES NOT SCROLL. Only the character & HUD move!
        animate(stableTravelY, -currentScroll, {
          duration: 0.95,
          ease: [0.16, 1, 0.3, 1],
          onComplete: () => {
            isTransitioningRef.current = false;
          },
        });
        animate(modeTransitionWeight, 0, {
          duration: 0.95,
          ease: [0.16, 1, 0.3, 1],
        });
      } else {
        // Character & HUD travel from Hero position back down into current viewport position (0 px)
        animate(stableTravelY, 0, {
          duration: 0.95,
          ease: [0.16, 1, 0.3, 1],
          onComplete: () => {
            isTransitioningRef.current = false;
          },
        });
        animate(modeTransitionWeight, 1, {
          duration: 0.95,
          ease: [0.16, 1, 0.3, 1],
        });
      }
    },
    [scrollMode, stableTravelY, modeTransitionWeight]
  );

  // Window-wide cursor tracking for real-time 3D responsiveness
  useEffect(() => {
    if (cursorTrackingMode === 'off') {
      cursorSpringX.set(0);
      cursorSpringY.set(0);
      cursorTiltX.set(0);
      cursorTiltY.set(0);
      return;
    }

    const handlePointerPos = (clientX: number, clientY: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Normalized coordinates from -1 to 1
      const normX = (clientX / width) * 2 - 1;
      const normY = (clientY / height) * 2 - 1;

      // Amplitude multipliers based on mode
      let moveAmpX = 36;
      let moveAmpY = 20;
      let tiltAmpX = 12;
      let tiltAmpY = 16;

      if (cursorTrackingMode === 'floating') {
        moveAmpX = 55;
        moveAmpY = 30;
        tiltAmpX = 16;
        tiltAmpY = 22;
      } else if (cursorTrackingMode === 'subtle') {
        moveAmpX = 18;
        moveAmpY = 10;
        tiltAmpX = 7;
        tiltAmpY = 9;
      }

      if (isMobile) {
        moveAmpX *= 0.35;
        moveAmpY *= 0.35;
        tiltAmpX *= 0.5;
        tiltAmpY *= 0.5;
      }

      cursorSpringX.set(normX * moveAmpX);
      cursorSpringY.set(normY * moveAmpY);
      cursorTiltY.set(normX * tiltAmpY);
      cursorTiltX.set(-normY * tiltAmpX);

      // Dynamic Studio Key & Rim Light calculations based on coordinates
      const lightPosX = Math.max(15, Math.min(85, 50 + normX * 38));
      const lightPosY = Math.max(10, Math.min(80, 40 + normY * 30));
      sheenX.set(lightPosX);
      sheenY.set(lightPosY);
      rimLightAngle.set(normX * 55);

      // Micro-Focus System towards active targets (throttled to avoid layout thrashing)
      const now = Date.now();
      if (now - lastScrollTimeRef.current > 140) {
        lastScrollTimeRef.current = now;
        const targetElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
        const interactiveEl = targetElement?.closest('button, a, [role="button"], .group, input, textarea') as HTMLElement | null;

        if (interactiveEl && characterRef) {
          const charRect = characterRef.getBoundingClientRect();
          const charCenterX = charRect.left + charRect.width / 2;
          const charCenterY = charRect.top + charRect.height / 2;

          const elRect = interactiveEl.getBoundingClientRect();
          const elCenterX = elRect.left + elRect.width / 2;
          const elCenterY = elRect.top + elRect.height / 2;

          const deltaX = (elCenterX - charCenterX) / (width * 0.5);
          const deltaY = (elCenterY - charCenterY) / (height * 0.5);

          const targetTiltY = Math.max(-8.5, Math.min(8.5, deltaX * 7.5));
          const targetTiltX = Math.max(-6.5, Math.min(6.5, -deltaY * 5.5));

          focusTiltY.set(targetTiltY);
          focusTiltX.set(targetTiltX);
          focusIntensity.set(1);
        } else {
          focusTiltY.set(0);
          focusTiltX.set(0);
          focusIntensity.set(0);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerPos(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        handlePointerPos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      cursorSpringX.set(0);
      cursorSpringY.set(0);
      cursorTiltX.set(0);
      cursorTiltY.set(0);
      focusTiltX.set(0);
      focusTiltY.set(0);
      focusIntensity.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [cursorSpringX, cursorSpringY, cursorTiltX, cursorTiltY, cursorTrackingMode, isMobile, characterRef, focusTiltX, focusTiltY, focusIntensity]);

  // Global Page Scroll - Direct 1:1 binding to eliminate all scroll delays & lagging
  const { scrollYProgress } = useScroll();
  const smoothScroll = scrollYProgress;

  // Dynamic Z-Index Layering
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (latest) => {
      if (scrollMode === 'stable') {
        setCurrentZIndex(30);
        return;
      }

      if (latest < 0.12) {
        setActiveSection('hero');
        setCurrentZIndex(30);
      } else if (latest < 0.35) {
        setActiveSection('about');
        setCurrentZIndex(12);
      } else if (latest < 0.60) {
        setActiveSection('services');
        setCurrentZIndex(35);
      } else if (latest < 0.76) {
        setActiveSection('projects');
        setCurrentZIndex(12);
      } else if (latest < 0.85) {
        setActiveSection('reviews');
        setCurrentZIndex(12);
      } else {
        setActiveSection('footer');
        setCurrentZIndex(40);
      }
    });
    return () => unsub();
  }, [scrollYProgress, scrollMode]);

  // Transform curves across section scroll
  const rawXDesktopScroll = useTransform(
    smoothScroll,
    [0, 0.10, 0.22, 0.35, 0.48, 0.60, 0.70, 0.78, 0.85, 1.0],
    [0, 0, -9, -9, 12, 12, -8, 6, 8, 8],
    { clamp: true }
  );

  const rawXMobileScroll = useTransform(
    smoothScroll,
    [0, 0.10, 0.22, 0.35, 0.48, 0.60, 0.70, 0.78, 0.85, 1.0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    { clamp: true }
  );

  const rawYScroll = useTransform(
    smoothScroll,
    [0, 0.12, 0.22, 0.45, 0.60, 0.70, 0.78, 0.85, 1.0],
    [0, 0, -15, -20, -18, -22, -12, 0, 0],
    { clamp: true }
  );

  const rawScaleDesktopScroll = useTransform(
    smoothScroll,
    [0, 0.12, 0.22, 0.45, 0.60, 0.70, 0.78, 0.85, 1.0],
    [1.0, 0.98, 0.76, 0.82, 0.80, 0.70, 0.72, 0.92, 0.92],
    { clamp: true }
  );

  const rawScaleMobileScroll = useTransform(
    smoothScroll,
    [0, 0.12, 0.22, 0.45, 0.60, 0.70, 0.78, 0.85, 1.0],
    [0.78, 0.72, 0.42, 0.45, 0.44, 0.40, 0.42, 0.52, 0.52],
    { clamp: true }
  );

  const rawRotateZScroll = useTransform(
    smoothScroll,
    [0, 0.12, 0.22, 0.45, 0.60, 0.70, 0.78, 0.85, 1.0],
    [0, 0, -3.0, 2.5, 1.5, -2.5, 2.0, 0, 0],
    { clamp: true }
  );

  const rawOrbitalYScroll = useTransform(
    smoothScroll,
    [0, 0.12, 0.22, 0.45, 0.60, 0.70, 0.78, 0.85, 1.0],
    [0, 0, 12, -12, -10, 10, -8, 0, 0],
    { clamp: true }
  );

  // Dynamic values combined with modeTransitionWeight and stableTravelY
  const dynamicX = useTransform(
    [isMobile ? rawXMobileScroll : rawXDesktopScroll, modeTransitionWeight],
    ([scrollXVal, weight]: number[]) => `${scrollXVal * weight}vw`
  );

  // Final Y position: stableTravelY (0 in scroll mode, -window.scrollY in stable mode) + dynamic section parallax
  const dynamicY = useTransform(
    [stableTravelY, rawYScroll, modeTransitionWeight],
    ([stableYVal, dynYVal, weight]: number[]) => `${stableYVal + dynYVal * weight}px`
  );

  const dynamicScale = useTransform(
    [isMobile ? rawScaleMobileScroll : rawScaleDesktopScroll, modeTransitionWeight],
    ([scrollScaleVal, weight]: number[]) => {
      const stableBaseScale = isMobile ? 0.68 : 1.0;
      return stableBaseScale + (scrollScaleVal - stableBaseScale) * weight;
    }
  );

  const dynamicRotateZ = useTransform(
    [rawRotateZScroll, modeTransitionWeight],
    ([scrollRotVal, weight]: number[]) => scrollRotVal * weight
  );

  const dynamicOrbitalY = useTransform(
    [rawOrbitalYScroll, modeTransitionWeight],
    ([orbitVal, weight]: number[]) => orbitVal * weight
  );

  // Combined 3D Rotation
  const finalTiltY = useTransform(
    [cursorTiltY, dynamicOrbitalY, focusTiltY],
    ([cursorY, orbitY, fY]: number[]) => cursorY + orbitY + fY
  );

  const finalTiltX = useTransform(
    [cursorTiltX, focusTiltX],
    ([cursorX, fX]: number[]) => cursorX + fX
  );

  // Lighting Shader Layer Transforms (declared unconditionally at top level)
  const keyLightBackground = useTransform(
    [sheenX, sheenY, lightIntensity],
    ([x, y, intensity]: number[]) =>
      `radial-gradient(ellipse 90% 80% at ${x}% ${y}%, ${activePresetConfig.keyLightRgba.replace('0.45', `${0.45 * intensity}`)} 0%, ${activePresetConfig.keyLightAccentRgba.replace('0.28', `${0.28 * intensity}`)} 35%, ${activePresetConfig.diffuseRgba} 65%, transparent 100%)`
  );

  const specularHotspotBackground = useTransform(
    [sheenX, sheenY, lightIntensity],
    ([x, y, intensity]: number[]) =>
      `radial-gradient(circle 160px at ${x}% ${y}%, ${activePresetConfig.keyLightRgba.replace('0.45', `${0.75 * intensity}`)} 0%, ${activePresetConfig.keyLightAccentRgba.replace('0.28', `${0.4 * intensity}`)} 40%, ${activePresetConfig.diffuseRgba} 70%, transparent 100%)`
  );

  const rimLightBackground = useTransform(
    [rimLightAngle],
    ([angle]: number[]) =>
      `linear-gradient(${angle + 90}deg, ${activePresetConfig.rimLightRgba.replace('0.45', `${0.45 * rimBoost}`)} 0%, ${activePresetConfig.rimLightAccentRgba.replace('0.2', `${0.2 * rimBoost}`)} 20%, transparent 40%, transparent 60%, ${activePresetConfig.rimLightAccentRgba.replace('0.2', `${0.25 * rimBoost}`)} 80%, ${activePresetConfig.rimLightRgba.replace('0.45', `${0.4 * rimBoost}`)} 100%)`
  );

  const diffuseGlowBackground = useTransform(
    [sheenX, sheenY],
    ([x, y]: number[]) =>
      `radial-gradient(circle 280px at ${x}% ${y}%, ${activePresetConfig.diffuseRgba} 0%, ${activePresetConfig.keyLightAccentRgba.replace('0.28', '0.15')} 50%, transparent 100%)`
  );

  // Section dialogues along the journey
  const sectionDialogues = {
    hero: {
      tag: 'Aria · 3D Studio Guide',
      text: 'Move cursor anywhere to steer 3D character • Floats smoothly with page scroll',
      action: 'Explore Experience',
    },
    about: {
      tag: 'Behind About Section',
      text: 'Gliding seamlessly behind studio philosophy & 3D elements',
      action: 'Our Philosophy',
    },
    services: {
      tag: 'Above What We Do',
      text: 'Surfacing above production engines: UGC, AI Films & Digital Platforms',
      action: 'View Pricing',
    },
    projects: {
      tag: 'Below Projects Deck',
      text: 'Floating below interactive deployment cards as you scroll',
      action: 'See Live Work',
    },
    reviews: {
      tag: 'Below Reviews Grid',
      text: 'Drifting below client ratings & verified 5.0 satisfaction badges',
      action: 'Read Testimonials',
    },
    footer: {
      tag: 'LET’S BUILD · Pinned & Ready',
      text: 'Positioned in front of LET’S BUILD. Have a project? Let’s engineer it.',
      action: 'Start a Project',
    },
  };

  const currentDialogue = sectionDialogues[activeSection];
  const isHero = activeSection === 'hero';
  const isLetsBuild = activeSection === 'footer';

  // Active Performance LOD State: True when actively scrolling or forced in Turbo mode
  const isReducedLODActive =
    perfMode === 'always' ||
    (perfMode === 'adaptive' && (isActivelyScrolling || isDragging));

  const hasCustomAdjustment =
    dragOffset.x !== 0 ||
    dragOffset.y !== 0 ||
    userScaleMultiplier !== 1.0 ||
    cursorTrackingMode !== 'magnetic' ||
    scrollMode !== 'scroll' ||
    perfMode !== 'adaptive';

  const handleResetAdjustments = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStudioChime('click');
    setDragOffset({ x: 0, y: 0 });
    setUserScaleMultiplier(1.0);
    setCursorTrackingMode('magnetic');
    setScrollMode('scroll');
    setPerfMode('adaptive');
    animate(stableTravelY, 0, { duration: 0.6 });
    animate(modeTransitionWeight, 1, { duration: 0.6 });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => {
            playStudioChime('click');
            setIsVisible(true);
          }}
          className="px-3 py-2 bg-white/95 backdrop-blur-md border border-[#E5E7EB] rounded-full shadow-lg text-xs font-medium text-[#202526] hover:bg-black/[0.05] flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-[#D8A9A8]" />
          <span>Show 3D Character</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 
        Floating Summon Pill:
        When the character is set to 'Stable' and docked up in the Hero section while the user has scrolled down,
        this subtle pill allows the user to summon the 3D character to their current section with 1 click.
      */}
      <AnimatePresence>
        {scrollMode === 'stable' && !isHeroSection && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-5 right-5 z-40"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectScrollMode('scroll')}
              className="px-4 py-2.5 bg-white/95 backdrop-blur-xl border border-[#E5E7EB] rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.12)] text-xs font-semibold text-[#202526] hover:bg-[#202526] hover:text-white flex items-center gap-2 cursor-pointer transition-colors duration-200 group"
            >
              <Navigation className="w-3.5 h-3.5 text-[#D8A9A8] group-hover:text-white transition-colors" />
              <span>Float 3D Character Here</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className="fixed inset-x-0 bottom-0 pointer-events-none flex justify-center items-end max-w-full overflow-visible"
        style={{
          perspective: isMobile ? undefined : 1600,
          zIndex: currentZIndex,
        }}
      >
        {/* 
          Unified Motion Coordinator:
          Contains BOTH the floating HUD (Mode Switcher, 3D Character Engine controls modal, Speech Bubble) AND the 3D Character.
          - In 'scroll' mode: Floats dynamically with viewport and page scroll.
          - In 'stable' mode: Positioned in the Hero section (Y = -window.scrollY), remaining fixed in document space!
          - Transition: When switching from 'scroll' to 'stable', the character and all its controls glide smoothly together back up to the Hero section without scrolling the page.
        */}
        <motion.div
          style={{
            x: dynamicX,
            y: dynamicY,
            scale: dynamicScale,
            rotateZ: dynamicRotateZ,
            transformOrigin: 'bottom center',
          }}
          className="relative flex flex-col items-center select-none will-change-transform pb-2 sm:pb-3"
        >
          {/* Cursor Parallax & Scale Container */}
          <motion.div
            style={{
              x: isDragging ? undefined : cursorSpringX,
              y: isDragging ? undefined : cursorSpringY,
              scale: userScaleMultiplier,
              transformOrigin: 'bottom center',
            }}
            className="relative flex flex-col items-center"
          >
            {/* Custom Drag Offset Wrapper */}
            <div
              style={{
                transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="relative flex flex-col items-center"
            >
              {/* FLOATING TOP HUD (Mode Switcher + Detailed 3D Engine Panel + Dialogue Bubble) */}
              <div className="flex flex-col items-center mb-2 z-40 relative pointer-events-auto">
                {/* 1. Floating Quick Mode Switcher Bar */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-white/95 backdrop-blur-2xl border border-[#E5E7EB] rounded-full p-0.5 sm:p-1 shadow-[0_12px_32px_rgba(0,0,0,0.1)] mb-1.5 sm:mb-2.5 transition-all duration-300">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSelectScrollMode('scroll')}
                    className={`relative px-2.5 xs:px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[9px] xs:text-[10px] sm:text-[11px] font-btn uppercase tracking-wider font-semibold flex items-center gap-1 sm:gap-1.5 transition-colors duration-200 cursor-pointer ${
                      scrollMode === 'scroll'
                        ? 'text-white'
                        : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
                    }`}
                  >
                    {scrollMode === 'scroll' && (
                      <motion.div
                        layoutId="active-scroll-mode"
                        className="absolute inset-0 bg-[#202526] rounded-full shadow-sm"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                    <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 relative z-10" />
                    <span className="relative z-10">
                      <span className="sm:hidden">Scroll</span>
                      <span className="hidden sm:inline">Move with Scroll</span>
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSelectScrollMode('stable')}
                    className={`relative px-2.5 xs:px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[9px] xs:text-[10px] sm:text-[11px] font-btn uppercase tracking-wider font-semibold flex items-center gap-1 sm:gap-1.5 transition-colors duration-200 cursor-pointer ${
                      scrollMode === 'stable'
                        ? 'text-white'
                        : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
                    }`}
                  >
                    {scrollMode === 'stable' && (
                      <motion.div
                        layoutId="active-scroll-mode"
                        className="absolute inset-0 bg-[#202526] rounded-full shadow-sm"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                    <Anchor className="w-2.5 h-2.5 sm:w-3 sm:h-3 relative z-10" />
                    <span className="relative z-10">Stable</span>
                  </motion.button>

                  <div className="h-3.5 sm:h-4 w-px bg-[#E5E7EB] mx-0.5" />

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playStudioChime('click');
                      setShowControls(!showControls);
                    }}
                    className={`p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer ${
                      showControls
                        ? 'bg-[#202526] text-white'
                        : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.05]'
                    }`}
                    title="Character Options & Controls"
                  >
                    <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </motion.button>
                </div>

                {/* 2. Section-Context Speech Bubble (Shown in Move with Scroll mode when outside hero) */}
                <AnimatePresence mode="wait">
                  {scrollMode === 'scroll' && !isHero && !showControls && (
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, y: 8, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.94 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="max-w-[calc(100vw-32px)] sm:max-w-[320px] frosted-dialogue-bubble rounded-2xl p-3 sm:p-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.08)] group hover:border-[#D8A9A8] transition-all duration-300 relative z-30 overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 relative z-10">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#D8A9A8] animate-pulse" />
                          <span className="text-[10px] font-label-small uppercase tracking-wider font-semibold text-[#202526]">
                            {currentDialogue.tag}
                          </span>
                        </div>

                        <div
                          onClick={() => {
                            playStudioChime('click');
                            if (onOpenContact) onOpenContact();
                          }}
                          className="flex items-center text-[10px] text-[#596769] hover:text-[#202526] font-medium transition-colors cursor-pointer"
                        >
                          <span>{currentDialogue.action}</span>
                          <ArrowUpRight className="w-3 h-3 ml-0.5" />
                        </div>
                      </div>

                      <p className="text-[11px] sm:text-xs text-[#596769] font-sans-clean leading-snug relative z-10">
                        {currentDialogue.text}
                      </p>

                      {/* Speech bubble tail */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-[#E5E7EB] rotate-45 z-10" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. Detailed 3D Character Engine Controls Modal - Rigidly locked to 3D character */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 12 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="w-[min(340px,calc(100vw-24px))] sm:w-[350px] max-w-[calc(100vw-24px)] bg-white/95 backdrop-blur-2xl border border-[#E5E7EB] rounded-2xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.18)] z-50 font-sans-clean text-xs space-y-3.5 mb-2 pointer-events-auto"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Rotate3d className="w-4 h-4 text-[#D8A9A8]" />
                          <span className="font-semibold text-[#202526] text-sm tracking-tight">3D Character Engine</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              playStudioChime('click');
                              setIsVisible(false);
                            }}
                            className="p-1 rounded-md hover:bg-black/[0.05] text-[#596769] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hide Character"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playStudioChime('click');
                              setShowControls(false);
                            }}
                            className="p-1 rounded-md hover:bg-black/[0.05] text-[#596769] hover:text-[#202526] transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Scroll Motion Mode */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#202526] flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#D8A9A8]" /> Scroll Motion Mode
                          </span>
                          <span className="text-[10px] text-[#596769] capitalize">
                            {scrollMode === 'scroll' ? 'Dynamic Float' : 'Stable (Hero)'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectScrollMode('scroll')}
                            className={`py-2.5 px-3 rounded-xl text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer border ${
                              scrollMode === 'scroll'
                                ? 'bg-[#202526] text-white border-[#202526] shadow-sm'
                                : 'bg-black/[0.02] text-[#596769] border-[#E5E7EB] hover:text-[#202526] hover:bg-black/[0.05]'
                            }`}
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Move with Scroll</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectScrollMode('stable')}
                            className={`py-2.5 px-3 rounded-xl text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer border ${
                              scrollMode === 'stable'
                                ? 'bg-[#202526] text-white border-[#202526] shadow-sm'
                                : 'bg-black/[0.02] text-[#596769] border-[#E5E7EB] hover:text-[#202526] hover:bg-black/[0.05]'
                            }`}
                          >
                            <Anchor className="w-3.5 h-3.5" />
                            <span>Stable (Hero)</span>
                          </button>
                        </div>
                      </div>

                      {/* Cursor 3D Movement */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#202526]">Cursor 3D Movement</span>
                          <span className="text-[10px] text-[#596769] capitalize">{cursorTrackingMode}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { id: 'subtle', label: 'Subtle', icon: Compass },
                            { id: 'magnetic', label: 'Magnetic', icon: Magnet },
                            { id: 'floating', label: 'Dynamic', icon: Flame },
                            { id: 'off', label: 'Off', icon: Crosshair },
                          ].map((mode) => {
                            const IconComponent = mode.icon;
                            return (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => {
                                  playStudioChime('click');
                                  setCursorTrackingMode(mode.id as CursorMode);
                                }}
                                className={`py-2 px-1 rounded-xl text-[10px] font-medium flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                                  cursorTrackingMode === mode.id
                                    ? 'bg-[#202526] text-white shadow-xs'
                                    : 'bg-black/[0.03] text-[#596769] hover:text-[#202526] hover:bg-black/[0.06]'
                                }`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                                <span>{mode.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Studio Lighting Presets */}
                      <div className="space-y-1.5 pt-1 border-t border-[#E5E7EB]/70">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#202526] flex items-center gap-1">
                            <Sun className="w-3 h-3 text-[#D8A9A8]" /> 3D Lighting Preset
                          </span>
                          <span className="text-[10px] text-[#596769] font-medium">
                            {activePresetConfig.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {LIGHTING_PRESET_LIST.map((preset) => {
                            const isSelected = lightingSettings.activePreset === preset.id;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  playStudioChime('click');
                                  adminStore.updateLightingPreset(preset.id);
                                }}
                                className={`p-2 rounded-xl text-[10px] font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer border text-left ${
                                  isSelected
                                    ? 'bg-[#202526] text-white border-[#202526] shadow-xs'
                                    : 'bg-black/[0.02] text-[#596769] border-[#E5E7EB] hover:text-[#202526] hover:bg-black/[0.05]'
                                }`}
                              >
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                                    style={{ backgroundColor: preset.previewColors.key }}
                                  />
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs -ml-1"
                                    style={{ backgroundColor: preset.previewColors.rim }}
                                  />
                                </div>
                                <div className="truncate">
                                  <span className="block truncate font-semibold leading-tight">
                                    {preset.name}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Performance Mode (Adaptive LOD & AO Reduction) */}
                      <div className="space-y-1.5 pt-1 border-t border-[#E5E7EB]/70">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#202526] flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[#D8A9A8]" /> Performance Mode (Adaptive LOD)
                          </span>
                          <span className="text-[10px] text-[#596769] font-mono capitalize">
                            {perfMode === 'adaptive'
                              ? 'Auto (On Scroll)'
                              : perfMode === 'always'
                              ? 'Always Turbo'
                              : 'Max Quality (Off)'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'adaptive', label: 'Adaptive', icon: Zap, sub: 'Scroll LOD' },
                            { id: 'always', label: 'Turbo LOD', icon: Gauge, sub: 'Ultra Fast' },
                            { id: 'off', label: 'Max FX', icon: Sparkles, sub: 'Full 4-Pass' },
                          ].map((item) => {
                            const IconComponent = item.icon;
                            const isSelected = perfMode === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  playStudioChime('click');
                                  setPerfMode(item.id as PerformanceModeOption);
                                }}
                                className={`py-2 px-1 rounded-xl text-[10px] font-medium flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#202526] text-white border-[#202526] shadow-xs'
                                    : 'bg-black/[0.02] text-[#596769] border-[#E5E7EB] hover:text-[#202526] hover:bg-black/[0.05]'
                                }`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                                <span className="font-semibold">{item.label}</span>
                                <span className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-[#8A9A9C]'}`}>
                                  {item.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Real-time Status Badge */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/[0.03] text-[10px] border border-black/[0.04]">
                          <span className="text-[#596769]">Live LOD Pipeline:</span>
                          <span
                            className={`font-mono font-semibold flex items-center gap-1.5 ${
                              isReducedLODActive ? 'text-amber-600' : 'text-emerald-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isReducedLODActive ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                              }`}
                            />
                            {isReducedLODActive
                              ? '⚡ Turbo LOD (AO Reduced • 60+ FPS)'
                              : '💎 Full Studio (All Passes Active)'}
                          </span>
                        </div>
                      </div>

                      {/* Scale Multiplier */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-[#202526]">Scale Multiplier</span>
                          <span className="font-semibold text-[#202526]">{userScaleMultiplier.toFixed(1)}x</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUserScaleMultiplier((prev) => Math.max(0.6, parseFloat((prev - 0.1).toFixed(1))))}
                            className="p-1.5 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-[#202526] cursor-pointer"
                          >
                            <Minimize2 className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="range"
                            min="0.6"
                            max="1.5"
                            step="0.05"
                            value={userScaleMultiplier}
                            onChange={(e) => setUserScaleMultiplier(parseFloat(e.target.value))}
                            className="flex-1 accent-[#202526] cursor-pointer h-1.5 bg-black/[0.1] rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setUserScaleMultiplier((prev) => Math.min(1.5, parseFloat((prev + 0.1).toFixed(1))))}
                            className="p-1.5 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-[#202526] cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Reset Button */}
                      {hasCustomAdjustment && (
                        <button
                          type="button"
                          onClick={handleResetAdjustments}
                          className="w-full py-2.5 rounded-xl border border-[#E5E7EB] hover:bg-rose-50 text-rose-600 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset All Settings</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 
                3D Interactive Character Body
                - 3D Viewport Tilt: Turns and leans in 3D facing the mouse
                - Draggable: Click and pull to reposition anywhere
              */}
              <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.15}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(_, info) => {
                  setIsDragging(false);
                  setDragOffset((prev) => ({
                    x: prev.x + info.offset.x,
                    y: prev.y + info.offset.y,
                  }));
                }}
                style={{
                  rotateY: finalTiltY,
                  rotateX: finalTiltX,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="relative pointer-events-auto cursor-grab active:cursor-grabbing group flex items-end justify-center will-change-transform"
                ref={setCharacterRef}
                onMouseMove={handleCharacterMouseMove}
                onMouseEnter={handleCharacterMouseEnter}
                onMouseLeave={handleCharacterMouseLeave}
                onClick={() => {
                  if (!isDragging && onOpenContact) {
                    onOpenContact();
                  }
                }}
              >
                {/* Dynamic Ground Shadow */}
                <motion.div
                  animate={{
                    scaleX: isDragging ? 0.75 : [1, 0.86, 0.96, 0.82, 0.94, 1],
                    scaleY: isDragging ? 0.75 : [1, 0.86, 0.96, 0.82, 0.94, 1],
                    opacity: isDragging ? 0.15 : isHovered ? 0.45 : [0.34, 0.2, 0.3, 0.17, 0.28, 0.34],
                  }}
                  transition={{
                    duration: 6.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[72%] h-8 rounded-[100%] bg-gradient-to-t from-[#202526]/40 via-[#202526]/20 to-transparent blur-[16px] pointer-events-none -z-10 will-change-transform"
                />

                {/* Ambient Multi-Layer Lighting Glow Aura */}
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] h-[92%] rounded-full blur-[85px] pointer-events-none transition-all duration-700 -z-20"
                  style={{
                    background: isHero
                      ? 'radial-gradient(circle, rgba(216,169,168,0.45) 0%, rgba(203,220,222,0.25) 60%, transparent 100%)'
                      : isLetsBuild
                      ? 'radial-gradient(circle, rgba(216,169,168,0.55) 0%, rgba(32,37,38,0.2) 65%, transparent 100%)'
                      : 'radial-gradient(circle, rgba(216,169,168,0.32) 0%, rgba(203,220,222,0.18) 55%, transparent 100%)',
                  }}
                />

                {/* Drag & Cursor Cue Overlay on Hover */}
                <AnimatePresence>
                  {isHovered && !isDragging && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1/4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[#202526] text-white text-[10px] font-label-small uppercase tracking-wider shadow-2xl flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-30 border border-white/10"
                    >
                      <Move className="w-3 h-3 text-[#D8A9A8] animate-bounce" />
                      <span>Cursor Steers 3D • Drag to Relocate</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Multi-Harmonic Floating Avatar Wrapper with Isolated Compositing */}
                <motion.div
                  animate={{
                    y: isDragging ? 0 : [0, -14, -3, -18, -5, 0],
                    rotateZ: isDragging ? 0 : [0, 0.75, -0.6, 0.5, -0.4, 0],
                    rotateX: isDragging ? 0 : [0, -1.2, 0.6, -1.4, 0.4, 0],
                  }}
                  transition={{
                    duration: 6.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    isolation: 'isolate',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  className="relative flex items-end justify-center will-change-transform overflow-visible select-none"
                >
                  {portraitMediaType === 'video' && portraitVideoUrl && portraitVideoUrl.trim() ? (
                    <video
                      src={portraitVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-[125px] xs:w-[150px] sm:w-[330px] md:w-[390px] lg:w-[440px] h-auto object-contain pointer-events-none max-h-[30vh] xs:max-h-[34vh] sm:max-h-[58vh] relative z-10 drop-shadow-[0_15px_30px_rgba(32,37,38,0.18)]"
                    />
                  ) : (
                    <img
                      src={
                        portraitUrl && portraitUrl.trim()
                          ? portraitUrl
                          : 'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png'
                      }
                      alt="AI Build 3D Studio Companion"
                      className="w-[125px] xs:w-[150px] sm:w-[330px] md:w-[390px] lg:w-[440px] h-auto object-contain pointer-events-none max-h-[30vh] xs:max-h-[34vh] sm:max-h-[58vh] relative z-10 block drop-shadow-[0_15px_30px_rgba(32,37,38,0.18)]"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Masked 3D Optical Lighting & Specular Shader Group - Strictly mapped to character silhouette */}
                  {portraitMediaType !== 'video' && (
                    <div
                      className="absolute inset-0 pointer-events-none z-20"
                      style={{
                        WebkitMaskImage: `url("${
                          portraitUrl && portraitUrl.trim()
                            ? portraitUrl
                            : 'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png'
                        }")`,
                        maskImage: `url("${
                          portraitUrl && portraitUrl.trim()
                            ? portraitUrl
                            : 'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png'
                        }")`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'bottom center',
                        maskPosition: 'bottom center',
                        isolation: 'isolate',
                      }}
                    >
                      {/* 
                        Adaptive Performance Mode LOD:
                        When actively scrolling or in Turbo mode, switch from 4 heavy multi-blend shader passes
                        to a single GPU-accelerated diffuse key gradient pass to eliminate any frame drops.
                      */}
                      {isReducedLODActive ? (
                        <div
                          style={{
                            background: `radial-gradient(ellipse 90% 80% at 50% 40%, ${activePresetConfig.keyLightRgba.replace('0.45', '0.24')} 0%, ${activePresetConfig.diffuseRgba} 70%, transparent 100%)`,
                            opacity: 0.65,
                          }}
                          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                        />
                      ) : (
                        <>
                          {/* 1. Dynamic Key Light & Ambient Studio Illumination (Soft Warm/Cool Studio Fill) */}
                          <motion.div
                            style={{
                              opacity: sheenOpacity,
                              background: keyLightBackground,
                              mixBlendMode: activePresetConfig.blendMode || 'soft-light',
                            }}
                            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                          />

                          {/* 2. Interactive Specular Hotspot Layer (Ray-traced Cursor Reflection) */}
                          {lightingSettings.enableSpecularHotspot !== false && (
                            <motion.div
                              style={{
                                opacity: sheenOpacity,
                                background: specularHotspotBackground,
                                mixBlendMode: 'overlay',
                              }}
                              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                            />
                          )}

                          {/* 3. Volumetric 3D Fresnel Rim Lighting on Edges */}
                          {lightingSettings.enableFresnelRim !== false && (
                            <motion.div
                              style={{
                                opacity: lightIntensity,
                                background: rimLightBackground,
                                mixBlendMode: 'screen',
                              }}
                              className="absolute inset-0 pointer-events-none"
                            />
                          )}

                          {/* 4. Secondary Soft Diffuse Glow Accent */}
                          <motion.div
                            style={{
                              opacity: sheenOpacity,
                              background: diffuseGlowBackground,
                              mixBlendMode: 'screen',
                            }}
                            className="absolute inset-0 pointer-events-none"
                          />
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};
