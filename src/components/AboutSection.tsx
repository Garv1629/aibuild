import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { FadeIn } from './FadeIn';
import { Magnet } from './Magnet';
import { Terminal, Code2, Cpu } from 'lucide-react';
import { WebsiteContent } from '../types';

interface AboutSectionProps {
  content?: WebsiteContent['about'];
}

interface ScrollRevealWordProps {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const ScrollRevealWord: React.FC<ScrollRevealWordProps> = ({ word, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <span className="inline-block relative mr-[0.28em] last:mr-0">
      <motion.span style={{ opacity }} className="inline-block will-change-[opacity]">
        {word}
      </motion.span>
    </span>
  );
};

export const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const paragraphRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const { scrollYProgress: bioProgress } = useScroll({
    target: paragraphRef,
    offset: ['start 0.88', 'center 0.38'],
  });

  // Parallax floating coordinates for the 4 corner 3D assets
  const yMoon = useTransform(scrollYProgress, [0, 1], [-40, 50]);
  const rotMoon = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  const yLego = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const rotLego = useTransform(scrollYProgress, [0, 1], [15, -15]);

  const yShape = useTransform(scrollYProgress, [0, 1], [-30, 45]);
  const rotShape = useTransform(scrollYProgress, [0, 1], [-10, 15]);

  const yGroup = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const rotGroup = useTransform(scrollYProgress, [0, 1], [8, -12]);

  const heading = content?.heading || 'About';
  const subPill = content?.subPill || 'Studio Philosophy & Mission';
  const bio =
    content?.bio ||
    'AI Build is an AI-first digital studio that combines modern frontend engineering, immersive web design, and agentic workflows to build high-converting products and memorable brand experiences for founders and teams worldwide.';

  const words = useMemo(() => bio.split(' '), [bio]);

  const pillars = content?.pillars || [
    { id: '1', title: 'Speed & Execution', subtitle: 'Rapid Prototype to Scale', icon: 'zap' },
    { id: '2', title: 'AI Engineering', subtitle: 'Agents, Models & Workflows', icon: 'cpu' },
    { id: '3', title: 'Interactive Polish', subtitle: '60fps Motion & 3D Polish', icon: 'sparkles' },
  ];

  const deco = {
    moonUrl:
      (content?.decorativeAssets?.moonUrl && content.decorativeAssets.moonUrl.trim()) ||
      'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Group_1048.81459873.png',
    legoUrl:
      (content?.decorativeAssets?.legoUrl && content.decorativeAssets.legoUrl.trim()) ||
      'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Group_1049.81459874.png',
    shapeUrl:
      (content?.decorativeAssets?.shapeUrl && content.decorativeAssets.shapeUrl.trim()) ||
      'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Vector.81459875.png',
    groupUrl:
      (content?.decorativeAssets?.groupUrl && content.decorativeAssets.groupUrl.trim()) ||
      'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Group_1050.81459876.png',
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full bg-transparent text-[#202526] px-4 sm:px-8 md:px-12 py-16 sm:py-32 md:py-40 overflow-hidden select-none z-20"
    >
      {/* 4 Surrounding Floating 3D Assets with Scroll Parallax & Magnet (hidden on mobile to prevent overlapping content) */}
      {/* 1. Top Left - Moon */}
      {deco.moonUrl && (
        <motion.div
          style={{ y: yMoon, rotate: rotMoon }}
          className="hidden sm:block absolute top-12 left-4 sm:left-10 z-10 pointer-events-auto"
        >
          <Magnet padding={100} strength={3} activeTransition="transform 0.25s ease-out">
            <img
              src={deco.moonUrl}
              alt="3D Decorative Moon"
              className="w-14 sm:w-20 md:w-28 h-auto object-contain drop-shadow-[0_10px_20px_rgba(32,37,38,0.15)] pointer-events-none"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </Magnet>
        </motion.div>
      )}

      {/* 2. Top Right - Lego / Block */}
      {deco.legoUrl && (
        <motion.div
          style={{ y: yLego, rotate: rotLego }}
          className="hidden sm:block absolute top-12 right-4 sm:right-10 z-10 pointer-events-auto"
        >
          <Magnet padding={100} strength={3} activeTransition="transform 0.25s ease-out">
            <img
              src={deco.legoUrl}
              alt="3D Decorative Block"
              className="w-14 sm:w-20 md:w-28 h-auto object-contain drop-shadow-[0_10px_20px_rgba(32,37,38,0.15)] pointer-events-none"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </Magnet>
        </motion.div>
      )}

      {/* 3. Bottom Left - Vector shape */}
      {deco.shapeUrl && (
        <motion.div
          style={{ y: yShape, rotate: rotShape }}
          className="hidden sm:block absolute bottom-12 left-4 sm:left-10 z-10 pointer-events-auto"
        >
          <Magnet padding={100} strength={3} activeTransition="transform 0.25s ease-out">
            <img
              src={deco.shapeUrl}
              alt="3D Decorative Shape"
              className="w-12 sm:w-16 md:w-24 h-auto object-contain drop-shadow-[0_10px_20px_rgba(32,37,38,0.15)] pointer-events-none"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </Magnet>
        </motion.div>
      )}

      {/* 4. Bottom Right - 3D group */}
      {deco.groupUrl && (
        <motion.div
          style={{ y: yGroup, rotate: rotGroup }}
          className="hidden sm:block absolute bottom-12 right-4 sm:right-10 z-10 pointer-events-auto"
        >
          <Magnet padding={100} strength={3} activeTransition="transform 0.25s ease-out">
            <img
              src={deco.groupUrl}
              alt="3D Decorative Group"
              className="w-14 sm:w-20 md:w-28 h-auto object-contain drop-shadow-[0_10px_20px_rgba(32,37,38,0.15)] pointer-events-none"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </Magnet>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-20">
        {/* Section Heading Tag */}
        <FadeIn delay={0} y={20}>
          <div className="px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-label-small uppercase tracking-[0.08em] text-[#202526] font-medium glass-pill inline-flex items-center gap-2 mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
            {subPill}
          </div>
        </FadeIn>

        {/* Section Title */}
        <FadeIn delay={0.1} y={30}>
          <h2 className="font-elegant font-normal uppercase leading-tight tracking-[-0.02em] mb-6 sm:mb-12 text-[#202526] text-2xl xs:text-3xl sm:text-5xl md:text-7xl lg:text-[100px]">
            {heading}
          </h2>
        </FadeIn>

        {/* Studio Bio / Mission Paragraph with Progressive Scroll Word Highlight */}
        <div ref={paragraphRef} className="max-w-3xl mb-10 sm:mb-16">
          <p className="font-sans-clean font-normal text-[#202526] leading-relaxed text-center flex flex-wrap justify-center text-sm xs:text-base sm:text-xl md:text-2xl">
            {words.map((word, i) => {
              const step = 0.88 / words.length;
              const start = i * step;
              const end = Math.min(1, start + step * 1.6);
              return (
                <ScrollRevealWord
                  key={`${word}-${i}`}
                  word={word}
                  progress={bioProgress}
                  range={[start, end]}
                />
              );
            })}
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 text-left">
          {pillars.map((pillar, idx) => (
            <FadeIn key={pillar.id || idx} delay={0.3 + idx * 0.1} y={30}>
              <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl glass-panel glass-panel-hover h-full flex flex-col justify-between group">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl glass-pill flex items-center justify-center text-[#202526] group-hover:scale-110 transition-transform duration-300">
                    {idx === 0 && <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    {idx === 1 && <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    {idx === 2 && <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                  <span className="font-strong text-xs text-[#596769]">0{idx + 1}</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-strong text-[#202526] uppercase tracking-wider mb-1">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#596769] font-sans-clean font-normal leading-relaxed">
                    {pillar.subtitle}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};


