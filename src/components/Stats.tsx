/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext.tsx';

export const Stats: React.FC = () => {
  const { data } = usePortfolio();
  const stats = data.stats;
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 28,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 32,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section id="principles" className="relative z-10 py-12 sm:py-16 md:py-20 select-none">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        <motion.div
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.25, margin: '-30px' }}
          variants={containerVariants}
          className="liquid-glass liquid-glass-gloss rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl border border-white/15"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((stat) => (
              <motion.div
                key={stat.value}
                variants={cardVariants}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -3,
                        transition: { duration: 0.25, ease: 'easeOut' },
                      }
                }
                className="group flex flex-col items-center text-center p-4 sm:p-6 md:p-8 rounded-2xl transition-colors duration-300 hover:bg-white/[0.02]"
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
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
