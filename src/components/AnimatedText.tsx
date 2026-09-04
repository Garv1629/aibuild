import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

interface CharProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Character: React.FC<CharProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  if (children === ' ') {
    return <span>&nbsp;</span>;
  }

  return (
    <span className="relative inline-block">
      <span className="opacity-0">{children}</span>
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 select-none"
      >
        {children}
      </motion.span>
    </span>
  );
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const characters = text.split('');
  const total = characters.length;

  return (
    <p
      ref={containerRef}
      className={`text-[#D7E2EA] font-medium text-center leading-relaxed max-w-[560px] mx-auto text-base sm:text-lg md:text-[1.35rem] flex flex-wrap justify-center ${className}`}
      style={{
        fontSize: 'clamp(1rem, 2vw, 1.35rem)',
      }}
    >
      {characters.map((char, index) => {
        // Compute staggered range for each character
        const step = 1 / total;
        const start = index * step;
        const end = Math.min(1, start + step * 2.5);

        return (
          <Character
            key={index}
            progress={scrollYProgress}
            range={[start, end]}
          >
            {char}
          </Character>
        );
      })}
    </p>
  );
};
