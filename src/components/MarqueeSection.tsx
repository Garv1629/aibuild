import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { WebsiteContent } from '../types';

const DEFAULT_ROW_1 = [
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/846875908ef902b78f44ff531e21b790d9f07a2a.png',
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/990faefba0435df1dc08354c462ea09b2e2d93e1.png',
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/9a4a7536d755c3c0a527c449339e1bf06a92ec27.png',
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/36a188f6ba3a6a9be777a83d73b0606d2bf61a6b.png',
];

const DEFAULT_ROW_2 = [
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/02a5c5cb63795155f9a6566c3c54432168923a10.png',
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/f52c1fcf81ec01c7784013143c7b6534caad6730.png',
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/9ca64d0dff35e184b2c15ea41b2e22c9535e69bf.png',
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/240c06152a514d76f0c727bbd56f5c8cb3122137.png',
];

interface MarqueeSectionProps {
  content?: WebsiteContent['marquee'];
}

export const MarqueeSection: React.FC<MarqueeSectionProps> = ({ content }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const row1X = useTransform(scrollYProgress, [0, 1], ['0px', '-120px']);
  const row2X = useTransform(scrollYProgress, [0, 1], ['-120px', '0px']);

  const validRow1 = (content?.row1Images || []).map((s) => s?.trim()).filter(Boolean) as string[];
  const validRow2 = (content?.row2Images || []).map((s) => s?.trim()).filter(Boolean) as string[];
  const row1 = validRow1.length > 0 ? validRow1 : DEFAULT_ROW_1;
  const row2 = validRow2.length > 0 ? validRow2 : DEFAULT_ROW_2;

  // Duplicate for smooth seamless loop
  const displayRow1 = [...row1, ...row1, ...row1];
  const displayRow2 = [...row2, ...row2, ...row2];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-24 bg-transparent overflow-hidden flex flex-col gap-6 select-none z-10"
    >
      {/* Subtle edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-[#FFFFFF] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-[#FFFFFF] to-transparent z-20 pointer-events-none" />

      {/* Row 1 - Leftward animation with scroll parallax */}
      <motion.div style={{ x: row1X }} className="w-full flex overflow-hidden">
        <div className="flex gap-6 animate-marquee shrink-0 items-center">
          {displayRow1.map((imgSrc, idx) => (
            <div
              key={`row1-${idx}`}
              className="relative w-64 sm:w-80 md:w-96 h-40 sm:h-48 md:h-56 rounded-3xl overflow-hidden bg-[#E7E9E8] border border-[#DDDCD7] shrink-0 group transition-all duration-300 hover:scale-[1.02] hover:border-[#596769] shadow-xs"
            >
              {imgSrc && imgSrc.trim() ? (
                <img
                  src={imgSrc}
                  alt="Studio Visual Asset"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <div className="absolute inset-0 bg-[#202526]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Row 2 - Rightward reverse animation with scroll parallax */}
      <motion.div style={{ x: row2X }} className="w-full flex overflow-hidden">
        <div className="flex gap-6 animate-marquee-reverse shrink-0 items-center">
          {displayRow2.map((imgSrc, idx) => (
            <div
              key={`row2-${idx}`}
              className="relative w-64 sm:w-80 md:w-96 h-40 sm:h-48 md:h-56 rounded-3xl overflow-hidden bg-[#E7E9E8] border border-[#DDDCD7] shrink-0 group transition-all duration-300 hover:scale-[1.02] hover:border-[#596769] shadow-xs"
            >
              {imgSrc && imgSrc.trim() ? (
                <img
                  src={imgSrc}
                  alt="Studio Visual Asset"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <div className="absolute inset-0 bg-[#202526]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};


