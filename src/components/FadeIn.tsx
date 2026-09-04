import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export type ClipRevealDirection =
  | 'horizontal-strip'
  | 'vertical-strip'
  | 'center-iris'
  | 'bottom-up'
  | 'none';

export interface FadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  as?: string;
  direction?: ClipRevealDirection;
  staggerIndex?: number;
  scaleInitial?: number;
  once?: boolean;
  viewportMargin?: string;
  viewportAmount?: number;
}

const MOTION_TAGS: Record<string, React.ElementType> = {
  div: motion.div,
  section: motion.section,
  p: motion.p,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  article: motion.article,
};

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.65,
  x = 0,
  y = 0,
  className = '',
  as = 'div',
  direction = 'none',
  staggerIndex = 0,
  scaleInitial = 0.985,
  once = true,
  viewportMargin = '0px 0px -20px 0px',
  viewportAmount = 0.08,
  ...props
}) => {
  const MotionComponent = MOTION_TAGS[as] || motion.div;

  const calculatedDelay = delay + staggerIndex * 0.06;
  const initialY = y !== 0 ? y : (direction === 'bottom-up' ? 24 : 16);

  return (
    <MotionComponent
      initial={{
        opacity: 0,
        x,
        y: initialY,
        scale: scaleInitial,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once, margin: viewportMargin, amount: viewportAmount }}
      transition={{
        duration,
        delay: calculatedDelay,
        ease: [0.22, 1, 0.36, 1], // Natural cubic out curve
      }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

