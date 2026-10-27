/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] pointer-events-none select-none bg-stroke/20"
      aria-hidden="true"
      data-testid="scroll-progress-bar"
    >
      <motion.div
        className="h-full w-full accent-gradient origin-left"
        style={{
          scaleX,
          boxShadow: '0 0 10px rgba(137, 170, 204, 0.65), 0 0 2px rgba(137, 170, 204, 0.9)',
        }}
      />
    </div>
  );
};
