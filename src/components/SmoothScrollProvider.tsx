import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement | number, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

let globalLenis: Lenis | null = null;

export const getGlobalLenis = () => globalLenis;

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isTouchOrMobile =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);

    // 1. Initialize Lenis: smooth desktop wheel scroll, native momentum scroll on mobile
    const lenis = new Lenis({
      duration: isTouchOrMobile ? 0 : 0.6, // Native instant on mobile, smooth on desktop
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isTouchOrMobile,
      syncTouch: false,
      touchMultiplier: 0, // Never hijack native mobile touch scrolling
      infinite: false,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;

    // 2. RequestAnimationFrame Render Loop
    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    // 3. Intercept global hash anchor clicks for smooth glide transitions
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.length > 1) {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            e.preventDefault();
            lenis.scrollTo(targetElement as HTMLElement, {
              offset: 0,
              duration: 1.4,
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });

    // 4. Handle resize and dynamic content height changes
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
      globalLenis = null;
    };
  }, []);

  const scrollTo = (
    target: string | HTMLElement | number,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options?.offset ?? 0,
        duration: options?.duration ?? 1.4,
        immediate: options?.immediate ?? false,
      });
    } else {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const stop = () => lenisRef.current?.stop();
  const start = () => lenisRef.current?.start();

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisRef.current,
        scrollTo,
        stop,
        start,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
};
