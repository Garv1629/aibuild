import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none">
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className="w-full h-full bg-[#7A3E2E]"
      />
    </div>
  );
};

