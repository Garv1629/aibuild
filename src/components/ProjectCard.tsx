import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { ProjectItem } from '../types';
import { LiveProjectButton } from './LiveProjectButton';
import { Play, Video, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  totalCards: number;
  onSelectProject?: (project: ProjectItem) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  totalCards,
  onSelectProject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, {
    once: false,
    amount: 0.2,
    margin: '-30px 0px -30px 0px',
  });

  const [, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isVideo = project.mediaType === 'video' && Boolean(project.videoUrl);

  return (
    <div
      ref={containerRef}
      style={{
        top: isMobile ? undefined : `calc(5rem + ${index * 20}px)`,
        zIndex: 10 + index,
      }}
      className="relative sm:sticky w-full max-w-6xl mx-auto min-h-0 sm:min-h-[540px] md:min-h-[620px] flex items-center justify-center p-0 mb-6 sm:mb-20 md:mb-32"
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 30,
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                scale: 1,
                y: 0,
              }
            : isMobile
            ? {
                opacity: 0.9,
                scale: 0.98,
                y: 10,
              }
            : {
                opacity: 0.35,
                scale: 0.96,
                y: 28,
              }
        }
        transition={{
          duration: 0.65,
          delay: Math.min(index * 0.04, 0.16),
          ease: [0.22, 1, 0.36, 1],
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full h-full rounded-[24px] sm:rounded-[40px] md:rounded-[48px] border border-[#E5E7EB] bg-white p-4 sm:p-7 md:p-9 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1),0_8px_20px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_35px_75px_-15px_rgba(0,0,0,0.15)] hover:border-[#CBDCDE] transition-colors duration-300 relative overflow-hidden group/card will-change-transform"
      >
        {/* Subtle Ambient Light Wash */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D8A9A8]/10 via-[#AFC7C5]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Top Header Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-6 border-b border-[#E5E7EB] relative z-10"
        >
          <div className="flex items-center gap-2.5 sm:gap-6">
            {/* Number Indicator with smooth entrance */}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 0.85, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-strong text-[#202526] leading-none select-none text-2xl xs:text-3xl sm:text-5xl md:text-6xl"
            >
              {project.number || `0${index + 1}`}
            </motion.span>

            {/* Category Pill and Title */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-strong uppercase tracking-[0.08em] text-[#202526] bg-[#F4F5F4] border border-[#E5E7EB] flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] animate-pulse" />
                  {project.category}
                </span>
                {isVideo && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-strong uppercase text-[#596769] bg-[#F4F5F4] border border-[#E5E7EB] flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-[#596769]" /> Video Demo
                  </span>
                )}
                {project.featured && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-strong uppercase text-[#202526] bg-[#CBDCDE]/50 border border-[#AFC7C5] hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#D8A9A8]" />
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-[#202526] font-praise font-normal uppercase tracking-tight text-base xs:text-lg sm:text-2xl md:text-3xl">
                {project.title}
              </h3>
            </div>
          </div>

          {/* Ghost Live Project Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <LiveProjectButton
              onClick={() => onSelectProject && onSelectProject(project)}
            />
          </motion.div>
        </motion.div>

        {/* Bottom Two-Column Image Grid */}
        <div className="pt-3 sm:pt-6 grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-4 md:gap-5 items-stretch relative z-10 flex-1 min-h-0">
          {/* Left Column (5 cols) - Two Detail Views (side-by-side on mobile, stacked on desktop) */}
          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-2.5 sm:gap-4 h-full order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex-1 overflow-hidden rounded-[16px] sm:rounded-[28px] md:rounded-[36px] bg-[#202526] border border-[#E5E7EB] group shadow-xs relative min-h-[90px] sm:min-h-[140px]"
            >
              {project.col1Image1 && project.col1Image1.trim() ? (
                <img
                  src={project.col1Image1}
                  alt={`${project.title} detail 1`}
                  className="w-full h-full object-cover rounded-[16px] sm:rounded-[28px] md:rounded-[36px] group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none select-none"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-[#202526] rounded-[16px] sm:rounded-[28px] md:rounded-[36px]" />
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex-1 overflow-hidden rounded-[16px] sm:rounded-[28px] md:rounded-[36px] bg-[#202526] border border-[#E5E7EB] group shadow-xs relative min-h-[90px] sm:min-h-[160px]"
            >
              {project.col1Image2 && project.col1Image2.trim() ? (
                <img
                  src={project.col1Image2}
                  alt={`${project.title} detail 2`}
                  className="w-full h-full object-cover rounded-[16px] sm:rounded-[28px] md:rounded-[36px] group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none select-none"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-[#202526] rounded-[16px] sm:rounded-[28px] md:rounded-[36px]" />
              )}
            </motion.div>
          </div>

          {/* Right Column (7 cols) - Video or High-Res Image (Top on mobile for maximum engagement) */}
          <div className="md:col-span-7 h-full flex min-h-[170px] sm:min-h-[220px] md:min-h-[260px] order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full overflow-hidden rounded-[20px] sm:rounded-[28px] md:rounded-[36px] bg-[#202526] border border-[#E5E7EB] group shadow-xs relative"
            >
              {isVideo && project.videoUrl && project.videoUrl.trim() ? (
                <div className="w-full h-full relative">
                  <video
                    src={project.videoUrl}
                    poster={project.col2Image && project.col2Image.trim() ? project.col2Image : undefined}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover rounded-[20px] sm:rounded-[28px] md:rounded-[36px] group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase text-[#202526] bg-white/90 border border-[#E5E7EB] flex items-center gap-1.5 z-20 shadow-xs backdrop-blur-xs">
                    <Play className="w-2.5 h-2.5 text-[#202526] fill-[#202526]" /> Loop
                  </div>
                </div>
              ) : project.col2Image && project.col2Image.trim() ? (
                <img
                  src={project.col2Image}
                  alt={`${project.title} showcase`}
                  className="w-full h-full object-cover rounded-[20px] sm:rounded-[28px] md:rounded-[36px] group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none select-none"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-[#202526] rounded-[20px] sm:rounded-[28px] md:rounded-[36px]" />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
