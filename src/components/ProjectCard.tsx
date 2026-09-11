import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ProjectItem } from '../types';
import { LiveProjectButton } from './LiveProjectButton';
import { ProjectSeamlessShowcase } from './ProjectSeamlessShowcase';
import { Video, Sparkles, Repeat, ArrowUpRight, Film, ImageIcon, Maximize2 } from 'lucide-react';
import { isVideoMedia } from '../utils/mediaUpload';
import { resolveProjectAspectRatio } from '../services/adminStore';

export interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  totalCards: number;
  onSelectProject?: (project: ProjectItem) => void;
  className?: string;
}

interface CardMediaSlotProps {
  src?: string;
  alt: string;
  isProjectVertical?: boolean;
  slotLabel?: string;
  onClick?: () => void;
}

const CardMediaSlot: React.FC<CardMediaSlotProps> = ({ src, alt, isProjectVertical = false, slotLabel, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = src ? isVideoMedia(src) : false;

  const [isMediaVertical, setIsMediaVertical] = useState<boolean>(() => {
    if (!src) return isProjectVertical;
    const lower = src.toLowerCase();
    if (lower.includes('vertical') || lower.includes('reel') || lower.includes('tiktok') || lower.includes('9:16')) return true;
    if (lower.includes('16:9') || lower.includes('cinema') || lower.includes('landscape') || lower.includes('widescreen')) return false;
    return isProjectVertical;
  });

  useEffect(() => {
    if (!src) {
      setIsMediaVertical(isProjectVertical);
      return;
    }
    const lower = src.toLowerCase();
    if (lower.includes('vertical') || lower.includes('reel') || lower.includes('tiktok') || lower.includes('9:16')) {
      setIsMediaVertical(true);
    } else if (lower.includes('16:9') || lower.includes('cinema') || lower.includes('landscape') || lower.includes('widescreen')) {
      setIsMediaVertical(false);
    } else {
      setIsMediaVertical(isProjectVertical);
    }
  }, [src, isProjectVertical]);

  const handleVideoMeta = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.videoWidth > 0 && v.videoHeight > 0) {
      setIsMediaVertical(v.videoHeight > v.videoWidth * 1.05);
    }
  };

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setIsMediaVertical(img.naturalHeight > img.naturalWidth * 1.05);
    }
  };

  useEffect(() => {
    if (!isVideo) return;
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1, rootMargin: '60px 0px 60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideo, src]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`w-full aspect-[16/10] overflow-hidden rounded-[18px] sm:rounded-[24px] md:rounded-[28px] bg-[#181C1D] border border-[#E5E7EB]/80 hover:border-[#CBDCDE] group/slot shadow-xs relative flex items-center justify-center transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      {slotLabel && (
        <div className="absolute top-3 left-3 z-20 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[9px] font-mono uppercase tracking-wider text-white/90 shadow-2xs pointer-events-none flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#AFC7C5]" />
          <span>{slotLabel}</span>
        </div>
      )}

      {/* Hover Gallery Badge */}
      {onClick && (
        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-white opacity-0 group-hover/slot:opacity-100 transition-all duration-200 pointer-events-none shadow-md transform translate-y-1 group-hover/slot:translate-y-0">
          <Maximize2 className="w-3 h-3 text-[#D8A9A8]" />
          <span className="hidden sm:inline">Gallery</span>
        </div>
      )}

      {src && src.trim() ? (
        isVideo ? (
          <>
            {isMediaVertical && isProjectVertical && (
              <video
                src={src}
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
              />
            )}
            <video
              ref={videoRef}
              src={src}
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedMetadata={handleVideoMeta}
              className={`transition-transform duration-700 pointer-events-none select-none ${
                isMediaVertical && isProjectVertical
                  ? 'h-full max-h-full aspect-[9/16] object-contain rounded-[14px] sm:rounded-[18px] shadow-lg relative z-10 mx-auto'
                  : 'w-full h-full object-cover'
              } group-hover/slot:scale-[1.03] ease-out`}
            />
          </>
        ) : (
          <>
            {isMediaVertical && isProjectVertical && (
              <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
              />
            )}
            <img
              src={src}
              alt={alt}
              onLoad={handleImgLoad}
              className={`transition-transform duration-700 pointer-events-none select-none ${
                isMediaVertical && isProjectVertical
                  ? 'h-full max-h-full aspect-[9/16] object-contain rounded-[14px] sm:rounded-[18px] shadow-lg relative z-10 mx-auto'
                  : 'w-full h-full object-cover'
              } group-hover/slot:scale-[1.03] ease-out`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </>
        )
      ) : (
        <div className="w-full h-full bg-[#181C1D] flex flex-col items-center justify-center gap-1 text-[#596769] p-4 text-center">
          <ImageIcon className="w-5 h-5 opacity-40 text-[#AFC7C5]" />
          <span className="text-[10px] font-mono opacity-50 uppercase tracking-wider">Detail View</span>
        </div>
      )}

      {/* Subtle Hover Sheen Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/slot:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
    </div>
  );
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  totalCards: _totalCards,
  onSelectProject,
  className = '',
}) => {
  const [, setIsHovered] = useState(false);

  const totalVideos = (project.mediaItems || []).filter((m) => m.type === 'video').length || (project.videoUrl ? 1 : 0);
  const totalMedia = project.mediaItems && project.mediaItems.length > 0 ? project.mediaItems.length : 1;

  // Real-time aspect ratio that adapts dynamically according to media loaded
  const [activeRatio, setActiveRatio] = useState<'16:9' | '9:16'>(() => resolveProjectAspectRatio(project));

  useEffect(() => {
    setActiveRatio(resolveProjectAspectRatio(project));
  }, [project]);

  const isVertical = activeRatio === '9:16';
  const hasDetails = Boolean((project.col1Image1 && project.col1Image1.trim()) || (project.col1Image2 && project.col1Image2.trim()));

  return (
    <div
      className={`w-full max-w-6xl mx-auto flex items-center justify-center p-0 select-none ${className}`}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full rounded-[28px] sm:rounded-[40px] md:rounded-[48px] border border-[#E5E7EB]/90 hover:border-[#CBDCDE] bg-gradient-to-b from-white via-[#FCFDFD] to-[#F9FAFA] p-5 sm:p-7 md:p-8 flex flex-col justify-between shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.12)] transition-all duration-300 relative overflow-hidden group/card"
      >
        {/* Subtle Ambient Light Wash */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D8A9A8]/12 via-[#AFC7C5]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Top Header Row */}
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-[#E5E7EB]/80 relative z-10 shrink-0">
          <div className="flex items-start sm:items-center gap-3 sm:gap-6">
            {/* Large Editorial Number Indicator */}
            <span className="font-strong text-[#202526] leading-none select-none text-2xl xs:text-3xl sm:text-5xl md:text-6xl tracking-tight">
              {index < 9 ? `0${index + 1}` : `${index + 1}`}
            </span>

            {/* Category Pills & Titles */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-strong uppercase tracking-[0.08em] text-[#202526] bg-[#F4F5F4] border border-[#E5E7EB] flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] animate-pulse" />
                  {project.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-medium uppercase text-[#596769] bg-[#F4F5F4] border border-[#E5E7EB] flex items-center gap-1.5 shadow-2xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${isVertical ? 'bg-[#D8A9A8]' : 'bg-[#AFC7C5]'}`} />
                  <span>{isVertical ? '9:16 Vertical' : '16:9 Cinema'}</span>
                </span>
                {totalVideos > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-strong uppercase text-[#596769] bg-[#F4F5F4] border border-[#E5E7EB] flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-[#596769]" />
                    {totalVideos > 1 ? `${totalVideos} Videos` : 'Video Reel'}
                  </span>
                )}
                {totalMedia > 1 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-strong uppercase text-[#202526] bg-[#E7EBE9] border border-[#B8C1C0] hidden xs:inline-flex items-center gap-1">
                    <Repeat className="w-2.5 h-2.5 text-[#D8A9A8]" />
                    Continuous Loop
                  </span>
                )}
                {project.featured && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-strong uppercase text-[#202526] bg-[#CBDCDE]/50 border border-[#AFC7C5] hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#D8A9A8]" />
                    Featured
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-[#202526] font-praise font-normal uppercase tracking-tight text-lg xs:text-xl sm:text-2xl md:text-3xl leading-snug">
                  {project.title}
                </h3>
                {project.tagline && (
                  <p className="text-xs sm:text-[13px] text-[#596769] font-sans-clean leading-relaxed max-w-2xl line-clamp-2 mt-0.5">
                    {project.tagline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Live Project Button */}
          <div className="shrink-0 self-start sm:self-auto">
            <LiveProjectButton
              onClick={() => onSelectProject && onSelectProject(project)}
              showIcon={true}
              label={project.liveUrl ? 'Live Case Study' : 'View Project'}
            />
          </div>
        </div>

        {/* Bottom Two-Column Image & Showcase Grid */}
        <div className="pt-4 sm:pt-5 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 md:gap-6 items-start relative z-10">
          {/* Detail Views Column */}
          {hasDetails && (
            <div
              className={`${
                isVertical
                  ? 'md:col-span-5 lg:col-span-5 order-2 md:order-1 flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-3.5 sm:gap-4'
                  : 'md:col-span-5 lg:col-span-5 order-2 md:order-1 flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-3.5 sm:gap-4'
              }`}
            >
              <CardMediaSlot
                src={project.col1Image1}
                alt={`${project.title} detail 1`}
                isProjectVertical={isVertical}
                slotLabel={isVertical ? 'Detail 01' : 'Angle 01'}
                onClick={() => onSelectProject && onSelectProject(project)}
              />
              <CardMediaSlot
                src={project.col1Image2}
                alt={`${project.title} detail 2`}
                isProjectVertical={isVertical}
                slotLabel={isVertical ? 'Detail 02' : 'Angle 02'}
                onClick={() => onSelectProject && onSelectProject(project)}
              />
            </div>
          )}

          {/* Showcase Column */}
          <div
            className={`${
              !hasDetails
                ? 'md:col-span-12 max-w-5xl mx-auto w-full order-1'
                : isVertical
                ? 'md:col-span-7 lg:col-span-7 order-1 md:order-2'
                : 'md:col-span-7 lg:col-span-7 order-1 md:order-2'
            } w-full`}
          >
            <ProjectSeamlessShowcase
              project={project}
              onOpenDetails={() => onSelectProject && onSelectProject(project)}
              onRatioChange={setActiveRatio}
              className="w-full"
            />
          </div>
        </div>

        {/* Bottom Meta & Deliverables Bar */}
        <div className="pt-3.5 sm:pt-4 mt-3 sm:mt-4 border-t border-[#E5E7EB]/70 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          {/* Deliverables / Tech Stack */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E9B9C] mr-0.5">
              Deliverables:
            </span>
            {(project.techStack && project.techStack.length > 0
              ? project.techStack
              : ['React', 'AI Video', 'Direct UGC']
            ).map((tech, tIdx) => (
              <span
                key={tIdx}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#202526] bg-[#F4F5F4] border border-[#E5E7EB] shadow-2xs hover:bg-[#EAEAEA] transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Interactive Explore Case Study Link */}
          <button
            type="button"
            onClick={() => onSelectProject && onSelectProject(project)}
            className="text-[11px] font-label-small font-semibold uppercase tracking-wider text-[#202526] hover:text-[#D8A9A8] flex items-center gap-1.5 transition-colors cursor-pointer group/link ml-auto"
          >
            <span>Explore Case Study</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-[#596769] group-hover/link:text-[#D8A9A8]" />
          </button>
        </div>
      </div>
    </div>
  );
};
