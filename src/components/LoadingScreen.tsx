/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCounter, LOADING_WORDS } from '../utils/portfolio.ts';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const duration = 2700;
  const requestRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * 100);
      setCount(currentCount);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        if (!completedRef.current) {
          completedRef.current = true;
          setCount(100);
          setTimeout(() => {
            onComplete();
          }, 400);
        }
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [duration, onComplete]);

  // Center rotating words cycling every 900ms
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % LOADING_WORDS.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-6 sm:p-10 md:p-16 select-none overflow-hidden"
      role="dialog"
      aria-label="Loading AI Build portfolio"
    >
      {/* Top row */}
      <div className="flex items-center justify-between w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <span className="w-2 h-2 rounded-full accent-gradient animate-pulse" />
          <span className="text-xs text-muted uppercase tracking-[0.3em] font-medium">
            AI BUILD
          </span>
        </motion.div>

        <button
          type="button"
          onClick={() => onComplete()}
          className="text-[11px] text-muted hover:text-text-primary tracking-widest uppercase transition-colors px-3 py-1 rounded-full border border-stroke hover:border-white/30 cursor-pointer"
          aria-label="Skip intro animation"
        >
          Skip ↗
        </button>
      </div>

      {/* Center rotating words cycling every 900ms: ["Build Smarter", "Create Faster", "Think Beyond"] */}
      <div className="flex items-center justify-center h-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display italic text-text-primary/90 tracking-tight text-center"
          >
            {LOADING_WORDS[wordIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section with counter and progress bar */}
      <div className="w-full flex flex-col items-end gap-6">
        <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums tracking-tighter leading-none">
          {formatCounter(count)}
        </div>

        <div className="w-full h-[3px] bg-stroke/50 rounded-full overflow-hidden relative">
          <div
            className="h-full accent-gradient rounded-full origin-left transition-transform duration-75 ease-out"
            style={{
              transform: `scaleX(${count / 100})`,
              boxShadow: '0 0 12px rgba(137, 170, 204, 0.45)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
