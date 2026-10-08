import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
  const [lenisState, setLenisState] = useState<Lenis | null>(null);

  useEffect(() => {
    const isTouchOrMobile =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);

    // On mobile devices, use pure native 120Hz/60Hz momentum scrolling without Lenis overhead
    if (isTouchOrMobile) {
      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        const anchor = target?.closest('a[href^="#"]');
        if (anchor) {
          const href = anchor.getAttribute('href');
          if (href && href.length > 1) {
            try {
              const targetElement = document.querySelector(href);
              if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
              }
            } catch {}
          }
        }
      };

      document.addEventListener('click', handleAnchorClick, { capture: true });
      return () => {
        document.removeEventListener('click', handleAnchorClick, { capture: true });
      };
    }

    // On desktop, initialize luxury butter-smooth Lenis scroll
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 0,
      infinite: false,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;
    setLenisState(lenis);

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.length > 1) {
          try {
            const targetElement = document.querySelector(href);
            if (targetElement) {
              e.preventDefault();
              lenis.scrollTo(targetElement as HTMLElement, {
                offset: 0,
                duration: 1.1,
              });
            }
          } catch {}
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
      globalLenis = null;
      setLenisState(null);
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
        lenis: lenisState,
        scrollTo,
        stop,
        start,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
};
