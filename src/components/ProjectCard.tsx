import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ProjectItem } from '../types';
import { LiveProjectButton } from './LiveProjectButton';
import {
  Video,
  ArrowUpRight,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from 'lucide-react';
import { isVideoMedia } from '../utils/mediaUpload';

export interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  totalCards?: number;
  onSelectProject?: (project: ProjectItem) => void;
  className?: string;
}

const ORDINAL_WORDS = [
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth',
  'Sixth',
  'Seventh',
  'Eighth',
  'Ninth',
  'Tenth',
  'Eleventh',
  'Twelfth',
  'Thirteenth',
  'Fourteenth',
  'Fifteenth',
];

// Curated high-fashion aesthetic editorial media fallbacks
const EDITORIAL_FALLBACKS = [
  {
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
    title: 'Product & Fragrance Aesthetics',
  },
  {
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
    title: 'Creative Palette & Material Study',
  },
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
    title: '3D Spatial Geometry & Form',
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
    title: 'Creator Portrait & Campaign Direction',
  },
  {
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
    title: 'Digital Interfaces & Floating Cards',
  },
  {
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
    title: 'Design Workshop & Collaboration',
  },
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
    title: 'Architecture & Surface Relief',
  },
  {
    url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    type: 'image' as const,
    title: 'Paper, Print & Editorial Stack',
  },
];

interface CollageCellProps {
  media: {
    url: string;
    type: 'video' | 'image';
    title?: string;
    poster?: string;
  };
  alt: string;
  className?: string;
  aspectClass?: string;
  onClick?: () => void;
  showOverlayLabel?: boolean;
  autoPlayWhenVisible?: boolean;
}

const CollageCell: React.FC<CollageCellProps> = ({
  media,
  alt,
  className = '',
  aspectClass = '',
  onClick,
  showOverlayLabel = false,
  autoPlayWhenVisible = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = media.type === 'video' || isVideoMedia(media.url);
  const [isPlaying, setIsPlaying] = useState(autoPlayWhenVisible);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isVideo || !autoPlayWhenVisible) return;
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.2, rootMargin: '40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideo, media.url, autoPlayWhenVisible]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative w-full h-full min-h-0 rounded-md sm:rounded-lg overflow-hidden bg-[#181C1D] group/cell cursor-pointer select-none transition-transform duration-300 will-change-transform ${className} ${aspectClass}`}
    >
      {/* Background Media */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={media.url}
          poster={media.poster}
          playsInline
          autoPlay={autoPlayWhenVisible}
          muted={isMuted}
          loop
          preload={autoPlayWhenVisible ? 'auto' : 'metadata'}
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover/cell:scale-[1.03] ${
            isLoaded ? 'opacity-100' : 'opacity-85'
          }`}
        />
      ) : (
        <img
          src={media.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover/cell:scale-[1.03] ${
            isLoaded ? 'opacity-100' : 'opacity-85'
          }`}
        />
      )}

      {/* Subtle Dark Vignette on Hover */}
      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Media Type Badge */}
      {isVideo && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] uppercase font-mono tracking-wider text-white font-medium pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E53E3E] animate-pulse" />
          <span>Video</span>
        </div>
      )}

      {/* Floating Controls */}
      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200">
        {isVideo && (
          <>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              className="w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onClick}
          aria-label="Expand in lightbox"
          className="w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {showOverlayLabel && media.title && (
        <div className="absolute bottom-2 left-2 z-20 max-w-[80%] truncate px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-white/90 font-mono">
          {media.title}
        </div>
      )}
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
  const isEvenLayout = index % 2 === 0;
  const ordinalWord = ORDINAL_WORDS[index] || `Project ${index + 1}`;

  // Assemble resolved media items for this project
  const projectMediaList = useMemo(() => {
    const list: { url: string; type: 'video' | 'image'; title?: string; poster?: string }[] = [];
    const seenUrls = new Set<string>();

    const addMedia = (url?: string, type?: 'video' | 'image', title?: string, poster?: string) => {
      if (!url || typeof url !== 'string') return;
      const clean = url.trim();
      if (!clean || seenUrls.has(clean)) return;
      seenUrls.add(clean);
      const isVid = type === 'video' || isVideoMedia(clean);
      list.push({
        url: clean,
        type: isVid ? 'video' : 'image',
        title: title || project.title,
        poster,
      });
    };

    // 1. From mediaItems array
    if (Array.isArray(project.mediaItems)) {
      project.mediaItems.forEach((m) => {
        if (m && m.url) addMedia(m.url, m.type, m.title, m.poster);
      });
    }

    // 2. Main videoUrl
    if (project.videoUrl) {
      addMedia(project.videoUrl, 'video', `${project.title} Reel`);
    }

    // 3. Main image slots
    if (project.col2Image) {
      addMedia(project.col2Image, project.mediaType || 'image', `${project.title} Hero Visual`);
    }
    if (project.col1Image1) {
      addMedia(project.col1Image1, 'image', `${project.title} Detail 1`);
    }
    if (project.col1Image2) {
      addMedia(project.col1Image2, 'image', `${project.title} Detail 2`);
    }

    // 4. Blend curated high-fashion aesthetic companions if project has fewer than 6 assets
    let fallbackIdx = index % EDITORIAL_FALLBACKS.length;
    while (list.length < 6) {
      const fb = EDITORIAL_FALLBACKS[fallbackIdx % EDITORIAL_FALLBACKS.length];
      if (!seenUrls.has(fb.url)) {
        seenUrls.add(fb.url);
        list.push({
          url: fb.url,
          type: fb.type,
          title: fb.title,
        });
      }
      fallbackIdx++;
    }

    return list;
  }, [project, index]);

  const handleOpenModal = () => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  const projectTitleUpper = project.title ? project.title.toUpperCase() : 'PROJECT';
  const displayHeadline = projectTitleUpper.length > 20 ? 'PROJECT' : projectTitleUpper;
  const projectTagline =
    project.tagline ||
    project.description ||
    'My project marked the beginning of my design journey, exploring creativity, problem-solving, and digital product design.';

  // Editorial Text Card Component
  const EditorialTextCard = (
    <div className="w-full h-full min-h-0 rounded-lg bg-[#FAF7F2] p-4 sm:p-6 md:p-8 flex flex-col justify-between items-center text-center relative overflow-hidden select-none border border-[#E5E7EB] shadow-xs">
      {/* Subtle Top Decorative Numbering */}
      <div className="w-full flex items-center justify-between text-xs text-[#596769] font-mono uppercase tracking-widest pb-2 border-b border-[#E5E7EB]">
        <span>AI.BUILD // {index < 9 ? `0${index + 1}` : `${index + 1}`}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#F4F5F4] text-[#202526] border border-[#E5E7EB] font-medium font-sans-clean text-[10px] sm:text-[11px]">
          {project.category}
        </span>
      </div>

      {/* Main Typography Stack */}
      <div className="my-auto py-3 sm:py-4 flex flex-col items-center justify-center max-w-sm mx-auto">
        {/* Script Cursive Accent Word */}
        <span className="font-script text-3xl sm:text-4xl md:text-5xl text-[#8B1E1E] leading-none mb-0.5 block select-none transform -rotate-1">
          {ordinalWord}
        </span>

        {/* Bold Uppercase Project Title */}
        <h3 className="font-project-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#202526] leading-[0.92] mt-0 mb-2 select-none">
          {displayHeadline}
        </h3>

        {/* Subtitle / Narrative Description */}
        <p className="text-xs sm:text-sm md:text-[14px] text-[#4A5568] font-body leading-relaxed max-w-xs sm:max-w-sm text-center font-normal px-1 line-clamp-3">
          {projectTagline}
        </p>
      </div>

      {/* Action CTA Group */}
      <div className="w-full pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={handleOpenModal}
          aria-label={`Explore ${project.title} case study`}
          className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer transform hover:-translate-y-0.5"
        >
          <span>Explore</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
        </button>

        {project.liveUrl && (
          <LiveProjectButton
            href={project.liveUrl}
            label="Live"
            showIcon={true}
            target="_blank"
            rel="noopener noreferrer"
            ariaLabel={`Visit live application for ${project.title}`}
            className="!bg-white !border-[#E5E7EB] !text-[#202526] hover:!bg-[#F4F5F4] !min-h-[30px] !py-1 !px-3 text-xs"
          />
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`w-full max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-center p-0 select-none ${className}`}
    >
      {/* Clean Modern Outer Frame with neutral borders */}
      <div className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] p-2 sm:p-2.5 md:p-3 shadow-[0_12px_36px_-15px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.02)] hover:border-[#D1D5DB] transition-all duration-300 relative overflow-hidden">
        
        {/* =========================================================================
            1. MOBILE / TABLET VIEW (< lg screen): Stacked with Dedicated Media Grid
            ========================================================================= */}
        <div className="flex flex-col gap-2.5 lg:hidden w-full">
          {/* Mobile Text Card */}
          <div className="w-full min-h-[220px]">
            {EditorialTextCard}
          </div>

          {/* Mobile 3-Item Bento Media Showcase with Proper Aspect Ratios */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Top Primary Featured Media (Spans full width, 16:9 / 16:10 aspect ratio) */}
            <div className="col-span-2 aspect-[16/10] sm:aspect-[16/9] w-full min-h-[180px] sm:min-h-[240px]">
              <CollageCell
                media={projectMediaList[1] || projectMediaList[0]}
                alt={`${project.title} - Main Feature`}
                onClick={handleOpenModal}
                autoPlayWhenVisible={true}
              />
            </div>

            {/* Bottom Left Supporting Visual (Square / 4:3) */}
            <div className="col-span-1 aspect-[4/3] sm:aspect-square w-full min-h-[120px]">
              <CollageCell
                media={projectMediaList[0]}
                alt={`${project.title} - Visual 1`}
                onClick={handleOpenModal}
                autoPlayWhenVisible={false}
              />
            </div>

            {/* Bottom Right Supporting Visual (Square / 4:3) */}
            <div className="col-span-1 aspect-[4/3] sm:aspect-square w-full min-h-[120px]">
              <CollageCell
                media={projectMediaList[2] || projectMediaList[3]}
                alt={`${project.title} - Visual 2`}
                onClick={handleOpenModal}
                autoPlayWhenVisible={false}
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. DESKTOP VIEW (>= lg screen): 3-Column Asymmetric Bento Collage
            ========================================================================= */}
        <div className="hidden lg:block w-full">
          {isEvenLayout ? (
            <div className="grid grid-cols-12 gap-2 w-full items-stretch h-[400px] lg:h-[430px]">
              {/* Column 1: Left Editorial Text Box (5 cols) */}
              <div className="col-span-5 flex flex-col justify-stretch h-full min-h-0">
                {EditorialTextCard}
              </div>

              {/* Column 2: Center 3-Stack Media Collage (3 cols) */}
              <div className="col-span-3 grid grid-rows-12 gap-2 h-full min-h-0">
                {/* Center Top Cell: Product / Bottle / Detail (Row span 3) */}
                <div className="row-span-3 min-h-0">
                  <CollageCell
                    media={projectMediaList[0]}
                    alt={`${project.title} - Visual 1`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
                {/* Center Middle Cell: Main Campaign / Crafting Video (Row span 6) */}
                <div className="row-span-6 min-h-0">
                  <CollageCell
                    media={projectMediaList[1]}
                    alt={`${project.title} - Main Feature`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={true}
                  />
                </div>
                {/* Center Bottom Cell: Product Packaging / Accent (Row span 3) */}
                <div className="row-span-3 min-h-0">
                  <CollageCell
                    media={projectMediaList[2]}
                    alt={`${project.title} - Visual 2`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
              </div>

              {/* Column 3: Right 2-Stack Media Collage (4 cols) */}
              <div className="col-span-4 grid grid-rows-12 gap-2 h-full min-h-0">
                {/* Right Top Cell: 3D UI / Cards / Floating Sheets (Row span 5) */}
                <div className="row-span-5 min-h-0">
                  <CollageCell
                    media={projectMediaList[3]}
                    alt={`${project.title} - 3D Render & Interface`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
                {/* Right Bottom Cell: Creator / Portrait / Dynamic Video (Row span 7) */}
                <div className="row-span-7 min-h-0">
                  <CollageCell
                    media={projectMediaList[4]}
                    alt={`${project.title} - Campaign Live`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-2 w-full items-stretch h-[400px] lg:h-[430px]">
              {/* Column 1: Left 3-Stack Media Collage (3 cols) */}
              <div className="col-span-3 grid grid-rows-12 gap-2 h-full min-h-0">
                {/* Left Top Cell: Color Palette / Materials (Row span 3) */}
                <div className="row-span-3 min-h-0">
                  <CollageCell
                    media={projectMediaList[0]}
                    alt={`${project.title} - Swatches & Setup`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
                {/* Left Middle Cell: 3D Geometric Relief / Sculpture (Row span 6) */}
                <div className="row-span-6 min-h-0">
                  <CollageCell
                    media={projectMediaList[1]}
                    alt={`${project.title} - Sculpture & Relief`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={true}
                  />
                </div>
                {/* Left Bottom Cell: Texture / Clay Material (Row span 3) */}
                <div className="row-span-3 min-h-0">
                  <CollageCell
                    media={projectMediaList[2]}
                    alt={`${project.title} - Texture Detail`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
              </div>

              {/* Column 2: Center Editorial Text Box (5 cols) */}
              <div className="col-span-5 flex flex-col justify-stretch h-full min-h-0">
                {EditorialTextCard}
              </div>

              {/* Column 3: Right 3-Stack Media Collage (4 cols) */}
              <div className="col-span-4 grid grid-rows-12 gap-2 h-full min-h-0">
                {/* Right Top Cell: Identity / Cards / Stationery (Row span 3) */}
                <div className="row-span-3 min-h-0">
                  <CollageCell
                    media={projectMediaList[3]}
                    alt={`${project.title} - Brand Deliverables`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
                {/* Right Middle Cell: Collaboration / Team / Creator Workshop (Row span 6) */}
                <div className="row-span-6 min-h-0">
                  <CollageCell
                    media={projectMediaList[4]}
                    alt={`${project.title} - Collaborative Workshop`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
                {/* Right Bottom Cell: Print Stack / Publications (Row span 3) */}
                <div className="row-span-3 min-h-0">
                  <CollageCell
                    media={projectMediaList[5] || projectMediaList[0]}
                    alt={`${project.title} - Print Stack`}
                    onClick={handleOpenModal}
                    autoPlayWhenVisible={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

