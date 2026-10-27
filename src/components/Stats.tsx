/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext.tsx';

export const Stats: React.FC = () => {
  const { data } = usePortfolio();
  const stats = data.stats;

  return (
    <section className="relative z-10 py-12 sm:py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="liquid-glass liquid-glass-gloss rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl border border-white/15">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.12,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="flex flex-col items-center text-center p-4 sm:p-6 md:p-8"
              >
                <div className="text-4xl sm:text-5xl md:text-6xl font-display text-white tracking-tight mb-2 sm:mb-3 drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]">
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
        </div>
      </div>
    </section>
  );
};
