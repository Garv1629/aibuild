import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ProjectItem, ServiceMediaItem } from '../types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Film,
  Repeat,
} from 'lucide-react';
import { isVideoMedia } from '../utils/mediaUpload';
import { resolveProjectAspectRatio } from '../services/adminStore';

interface ProjectSeamlessShowcaseProps {
  project: ProjectItem;
  onOpenDetails?: () => void;
  className?: string;
  showControls?: boolean;
  onRatioChange?: (ratio: '16:9' | '9:16') => void;
}

interface SlotState {
  item: ServiceMediaItem | null;
  index: number;
}

export const ProjectSeamlessShowcase: React.FC<ProjectSeamlessShowcaseProps> = ({
  project,
  onOpenDetails,
  className = '',
  showControls = true,
  onRatioChange,
}) => {
  // Normalize media items: prioritize project.mediaItems, or build fallback playlist from legacy fields
  const mediaList: ServiceMediaItem[] = useMemo(() => {
    if (project.mediaItems && project.mediaItems.length > 0) {
      const valid = project.mediaItems.filter((m) => m && m.url && m.url.trim().length > 0);
      if (valid.length > 0) return valid;
    }

    const fallback: ServiceMediaItem[] = [];
    if (project.videoUrl && project.videoUrl.trim()) {
      fallback.push({
        id: `p-vid-${project.id}`,
        type: 'video',
        url: project.videoUrl.trim(),
        poster: project.col2Image && project.col2Image.trim() ? project.col2Image.trim() : undefined,
        title: `${project.title} Video`,
      });
    }

    if (project.col2Image && project.col2Image.trim()) {
      const url = project.col2Image.trim();
      const isVid = isVideoMedia(url);
      fallback.push({
        id: `p-img2-${project.id}`,
        type: isVid ? 'video' : 'image',
        url,
        title: `${project.title} Showcase`,
        duration: isVid ? undefined : 4,
      });
    }

    if (project.col1Image1 && project.col1Image1.trim()) {
      const url = project.col1Image1.trim();
      const isVid = isVideoMedia(url);
      fallback.push({
        id: `p-img1-${project.id}`,
        type: isVid ? 'video' : 'image',
        url,
        title: `${project.title} Detail 1`,
        duration: isVid ? undefined : 4,
      });
    }

    if (project.col1Image2 && project.col1Image2.trim()) {
      const url = project.col1Image2.trim();
      const isVid = isVideoMedia(url);
      fallback.push({
        id: `p-img3-${project.id}`,
        type: isVid ? 'video' : 'image',
        url,
        title: `${project.title} Detail 2`,
        duration: isVid ? undefined : 4,
      });
    }

    return fallback;
  }, [project.mediaItems, project.videoUrl, project.col2Image, project.col1Image1, project.col1Image2, project.id, project.title]);

  const totalItems = mediaList.length;

  // Deck State: Dual A/B Video and Image Layers for zero-cut continuous playback
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [itemProgress, setItemProgress] = useState<number>(0);
  const [isInView, setIsInView] = useState<boolean>(true);

  // A/B Slots
  const [slot0, setSlot0] = useState<SlotState>(() => ({
    item: mediaList[0] || null,
    index: 0,
  }));
  const [slot1, setSlot1] = useState<SlotState>(() => ({
    item: mediaList[1] || mediaList[0] || null,
    index: totalItems > 1 ? 1 : 0,
  }));

  // Video element references
  const videoRef0 = useRef<HTMLVideoElement | null>(null);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const photoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const photoProgressRafRef = useRef<number | null>(null);
  const photoStartTimeRef = useRef<number>(0);
  const isHandoffInProgressRef = useRef<boolean>(false);

  // Detected aspect ratios for loaded media items
  const [detectedRatios, setDetectedRatios] = useState<Record<string, '16:9' | '9:16'>>({});

  const projectDefaultRatio = useMemo(() => resolveProjectAspectRatio(project), [project]);

  const getItemRatio = useCallback((item: ServiceMediaItem | null): '16:9' | '9:16' => {
    if (!item) return projectDefaultRatio;
    if (detectedRatios[item.url]) return detectedRatios[item.url];
    if (item.aspectRatio && (item.aspectRatio === '9:16' || item.aspectRatio === '16:9')) {
      return item.aspectRatio;
    }
    const urlLower = (item.url || '').toLowerCase();
    if (
      urlLower.includes('vertical') ||
      urlLower.includes('reel') ||
      urlLower.includes('tiktok') ||
      urlLower.includes('shorts')
    ) {
      return '9:16';
    }
    return projectDefaultRatio;
  }, [detectedRatios, projectDefaultRatio]);

  const handleMediaMetadata = useCallback((url: string, w: number, h: number) => {
    if (w > 0 && h > 0) {
      const isVertical = h > w * 1.05;
      const detected = isVertical ? '9:16' : '16:9';
      setDetectedRatios((prev) => (prev[url] === detected ? prev : { ...prev, [url]: detected }));
    }
  }, []);

  // Synchronize when project or media list changes
  useEffect(() => {
    setCurrentIndex(0);
    setActiveSlot(0);
    setItemProgress(0);
    setSlot0({ item: mediaList[0] || null, index: 0 });
    setSlot1({ item: mediaList[1] || mediaList[0] || null, index: totalItems > 1 ? 1 : 0 });
  }, [mediaList, totalItems]);

  // Synchronize activeRatio to parent callback whenever current media ratio is resolved
  const currentMedia = mediaList[currentIndex];
  const activeRatio = getItemRatio(currentMedia);
  const isVertical = activeRatio === '9:16';

  useEffect(() => {
    onRatioChange?.(activeRatio);
  }, [activeRatio, onRatioChange]);

  // Viewport Intersection Observer: Pause heavy playback when outside screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pre-buffer standby video deck
  const prepareStandbySlot = useCallback(
    (standbySlotNum: 0 | 1, targetItem: ServiceMediaItem | undefined) => {
      if (!targetItem || targetItem.type !== 'video') return;
      const standbyVideo = standbySlotNum === 0 ? videoRef0.current : videoRef1.current;
      if (!standbyVideo) return;

      if (standbyVideo.src !== targetItem.url) {
        standbyVideo.src = targetItem.url;
      }
      standbyVideo.preload = 'auto';
      standbyVideo.currentTime = 0;
      standbyVideo.muted = true;
      standbyVideo.load();
    },
    []
  );

  // Seamless zero-cut handoff engine
  const executeHandoff = useCallback(
    (targetIndex: number) => {
      if (totalItems <= 1) return;
      if (isHandoffInProgressRef.current) return;
      isHandoffInProgressRef.current = true;

      const nextIndex = (targetIndex + totalItems) % totalItems;
      const nextItem = mediaList[nextIndex];
      const nextSlotNum: 0 | 1 = activeSlot === 0 ? 1 : 0;
      const retiringSlotNum: 0 | 1 = activeSlot;

      if (nextSlotNum === 0) {
        setSlot0({ item: nextItem, index: nextIndex });
      } else {
        setSlot1({ item: nextItem, index: nextIndex });
      }

      const nextVideo = nextSlotNum === 0 ? videoRef0.current : videoRef1.current;
      const retiringVideo = retiringSlotNum === 0 ? videoRef0.current : videoRef1.current;

      // Start incoming video immediately prior to crossfade
      if (nextVideo && nextItem?.type === 'video') {
        nextVideo.muted = isMuted;
        if (isPlaying && isInView) {
          const playPromise = nextVideo.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              nextVideo.muted = true;
              nextVideo.play().catch(() => {});
            });
          }
        }
      }

      // Hardware-accelerated 600ms crossfade
      setActiveSlot(nextSlotNum);
      setCurrentIndex(nextIndex);
      setItemProgress(0);

      setTimeout(() => {
        if (retiringVideo) {
          retiringVideo.pause();
        }

        const subsequentIndex = (nextIndex + 1) % totalItems;
        const subsequentItem = mediaList[subsequentIndex];

        if (retiringSlotNum === 0) {
          setSlot0({ item: subsequentItem, index: subsequentIndex });
          prepareStandbySlot(0, subsequentItem);
        } else {
          setSlot1({ item: subsequentItem, index: subsequentIndex });
          prepareStandbySlot(1, subsequentItem);
        }

        isHandoffInProgressRef.current = false;
      }, 650);
    },
    [totalItems, isMuted, isPlaying, isInView, activeSlot, mediaList, prepareStandbySlot]
  );

  const handleNext = useCallback(() => {
    executeHandoff(currentIndex + 1);
  }, [executeHandoff, currentIndex]);

  const handlePrev = useCallback(() => {
    executeHandoff(currentIndex - 1);
  }, [executeHandoff, currentIndex]);

  // Video playback listeners
  useEffect(() => {
    const activeVideo = activeSlot === 0 ? videoRef0.current : videoRef1.current;
    const inactiveVideo = activeSlot === 0 ? videoRef1.current : videoRef0.current;

    if (isPlaying && isInView) {
      inactiveVideo?.pause();
      activeVideo?.play().catch(() => {});
    } else {
      activeVideo?.pause();
      inactiveVideo?.pause();
    }
  }, [isPlaying, isInView, activeSlot]);

  // Photo duration timer & progress bar
  useEffect(() => {
    if (photoTimerRef.current) {
      clearTimeout(photoTimerRef.current);
      photoTimerRef.current = null;
    }
    if (photoProgressRafRef.current) {
      cancelAnimationFrame(photoProgressRafRef.current);
      photoProgressRafRef.current = null;
    }

    const currentItem = mediaList[currentIndex];
    if (!currentItem || currentItem.type !== 'image' || totalItems <= 1 || !isPlaying || !isInView) {
      return;
    }

    const durationSeconds = currentItem.duration || 4;
    const durationMs = durationSeconds * 1000;
    photoStartTimeRef.current = performance.now();

    const updateProgress = () => {
      const elapsed = performance.now() - photoStartTimeRef.current;
      const prog = Math.min(elapsed / durationMs, 1);
      setItemProgress(prog);

      if (prog < 1) {
        photoProgressRafRef.current = requestAnimationFrame(updateProgress);
      }
    };

    photoProgressRafRef.current = requestAnimationFrame(updateProgress);

    photoTimerRef.current = setTimeout(() => {
      executeHandoff(currentIndex + 1);
    }, durationMs);

    return () => {
      if (photoTimerRef.current) clearTimeout(photoTimerRef.current);
      if (photoProgressRafRef.current) cancelAnimationFrame(photoProgressRafRef.current);
    };
  }, [currentIndex, isPlaying, isInView, totalItems, mediaList, executeHandoff]);

  // Video time update listener
  const handleTimeUpdate = (slotNum: 0 | 1) => () => {
    if (slotNum !== activeSlot) return;
    const video = slotNum === 0 ? videoRef0.current : videoRef1.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;

    const progress = video.currentTime / video.duration;
    setItemProgress(progress);

    // If within last 400ms of playback, ensure next clip is preloaded
    if (video.duration - video.currentTime < 0.45 && !isHandoffInProgressRef.current && totalItems > 1) {
      const nextIdx = (currentIndex + 1) % totalItems;
      const standbySlotNum: 0 | 1 = activeSlot === 0 ? 1 : 0;
      prepareStandbySlot(standbySlotNum, mediaList[nextIdx]);
    }
  };

  // Video ended listener
  const handleVideoEnded = (slotNum: 0 | 1) => () => {
    if (slotNum !== activeSlot) return;
    if (totalItems > 1) {
      executeHandoff(currentIndex + 1);
    } else {
      const video = slotNum === 0 ? videoRef0.current : videoRef1.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (videoRef0.current) videoRef0.current.muted = nextMuted;
      if (videoRef1.current) videoRef1.current.muted = nextMuted;
      return nextMuted;
    });
  };

  const renderSlot = (
    slot: SlotState,
    slotNum: 0 | 1,
    ref: React.RefObject<HTMLVideoElement | null>
  ) => {
    if (!slot.item) return null;
    const isActive = activeSlot === slotNum;
    const ratio = getItemRatio(slot.item);
    const isVertical = ratio === '9:16';

    return (
      <div
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-in-out ${
          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        }`}
      >
        {/* Ambient blurred backdrop for 9:16 vertical media so widescreen canvas glows with matching colors without cropping */}
        {isVertical && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-0">
            {slot.item.type === 'video' ? (
              <video
                src={slot.item.url}
                muted
                loop
                playsInline
                className="w-full h-full object-cover blur-2xl opacity-35 scale-115 pointer-events-none"
              />
            ) : (
              <img
                src={slot.item.url}
                alt=""
                className="w-full h-full object-cover blur-2xl opacity-35 scale-115 pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {slot.item.type === 'video' ? (
          <video
            ref={ref}
            src={slot.item.url}
            poster={slot.item.poster}
            autoPlay={isActive && isPlaying && isInView}
            muted={isMuted}
            loop={totalItems === 1}
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              handleMediaMetadata(slot.item?.url || '', e.currentTarget.videoWidth, e.currentTarget.videoHeight);
            }}
            onTimeUpdate={handleTimeUpdate(slotNum)}
            onEnded={handleVideoEnded(slotNum)}
            className={`transition-transform duration-700 relative z-10 group-hover/card:scale-[1.02] ${
              isVertical
                ? 'h-full max-h-full aspect-[9/16] object-contain rounded-[18px] sm:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 mx-auto'
                : 'w-full h-full object-cover'
            }`}
          />
        ) : (
          <div className={`relative z-10 ${isVertical ? 'h-full flex items-center justify-center' : 'w-full h-full overflow-hidden'}`}>
            <img
              src={slot.item.url}
              alt={slot.item.title || project.title}
              onLoad={(e) => {
                handleMediaMetadata(slot.item?.url || '', e.currentTarget.naturalWidth, e.currentTarget.naturalHeight);
              }}
              className={`transition-transform ${
                isActive ? 'duration-[6000ms] scale-105' : 'duration-700 scale-100'
              } group-hover/card:scale-105 ease-out ${
                isVertical
                  ? 'h-full max-h-full aspect-[9/16] object-contain rounded-[18px] sm:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 mx-auto'
                  : 'w-full h-full object-cover'
              }`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onClick={onOpenDetails}
      className={`group/showcase relative w-full ${
        isVertical
          ? 'aspect-[9/16] max-h-[580px] min-h-[360px] sm:min-h-[440px] md:min-h-[500px] mx-auto'
          : 'aspect-[16/9] min-h-[220px] sm:min-h-[280px] md:min-h-[340px]'
      } rounded-[20px] sm:rounded-[24px] md:rounded-[32px] overflow-hidden bg-[#181C1D] border border-[#E5E7EB] shadow-xs cursor-pointer select-none ${className}`}
    >
      {/* Empty State */}
      {totalItems === 0 && (
        <div className="w-full h-full bg-[#181C1D] flex flex-col items-center justify-center text-[#596769] text-xs font-mono p-4 text-center">
          <Film className="w-6 h-6 mb-2 text-[#D8A9A8] opacity-60" />
          <span>{project.title}</span>
        </div>
      )}

      {/* Dual Layer A/B Zero-Cut Video & Image Decks */}
      {renderSlot(slot0, 0, videoRef0)}
      {renderSlot(slot1, 1, videoRef1)}

      {/* Aspect Ratio Badge */}
      <div className="absolute bottom-2.5 left-3.5 z-30 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium text-white/90 bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1 shadow-xs pointer-events-none">
        <span className={`w-1.5 h-1.5 rounded-full ${isVertical ? 'bg-[#D8A9A8]' : 'bg-[#AFC7C5]'}`} />
        <span>{isVertical ? '9:16 Vertical' : '16:9 Cinema'}</span>
      </div>

      {/* Vignette Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#181C1D]/80 via-transparent to-[#181C1D]/40 pointer-events-none z-20" />

      {/* Top Segmented Story Progress Bars */}
      {totalItems > 1 && (
        <div className="absolute top-2.5 left-3.5 right-3.5 z-30 flex items-center gap-1.5 pointer-events-auto">
          {mediaList.map((item, idx) => {
            const isPast = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const widthPct = isPast ? 100 : isCurrent ? itemProgress * 100 : 0;

            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  executeHandoff(idx);
                }}
                className="flex-1 h-1 rounded-full bg-white/30 hover:bg-white/60 backdrop-blur-md overflow-hidden cursor-pointer p-0 transition-all focus:outline-none"
                title={`Jump to clip ${idx + 1}: ${item.title || item.type.toUpperCase()}`}
              >
                <div
                  className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${widthPct}%` }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Top Controls Bar */}
      {showControls && (
        <div
          className={`absolute ${
            totalItems > 1 ? 'top-6' : 'top-3'
          } left-3.5 right-3.5 z-30 flex items-center justify-between pointer-events-none transition-all`}
        >
          {/* Index & Type Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E5E7EB] text-[10px] font-mono font-bold tracking-[0.08em] text-[#202526] uppercase shadow-xs pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] animate-pulse" />
            <span>{currentMedia?.type === 'video' ? 'VIDEO' : 'PHOTO'}</span>
            {totalItems > 1 && (
              <span className="text-[#596769] font-medium border-l border-[#E5E7EB] pl-1.5 ml-0.5 flex items-center gap-1">
                <Repeat className="w-2.5 h-2.5 text-[#202526] opacity-70" />
                <span>
                  {currentIndex + 1}/{totalItems}
                </span>
              </span>
            )}
          </div>

          {/* Action Buttons: Prev, Next, Play/Pause, Audio */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {totalItems > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#202526] flex items-center justify-center transition-all cursor-pointer border border-[#E5E7EB] shadow-xs hover:scale-105 active:scale-95"
                  title="Previous Clip"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#202526] flex items-center justify-center transition-all cursor-pointer border border-[#E5E7EB] shadow-xs hover:scale-105 active:scale-95"
                  title="Next Clip"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#202526] flex items-center justify-center transition-all cursor-pointer border border-[#E5E7EB] shadow-xs hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-[#202526]" />
              )}
            </button>

            {currentMedia?.type === 'video' && (
              <button
                type="button"
                onClick={toggleMute}
                className="w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#202526] flex items-center justify-center transition-all cursor-pointer border border-[#E5E7EB] shadow-xs hover:scale-105 active:scale-95"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Title & Dot Indicators */}
      {totalItems > 1 && (
        <div className="absolute bottom-3 left-3.5 right-3.5 z-30 flex items-center justify-between pointer-events-none transition-all">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-sans-clean flex items-center gap-2 pointer-events-auto max-w-[70%] truncate shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] shrink-0 animate-pulse" />
            <span className="truncate">{currentMedia?.title || `${project.title} - Clip ${currentIndex + 1}`}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full pointer-events-auto shadow-sm">
            {mediaList.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  executeHandoff(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70 w-1.5'
                }`}
                title={`Clip ${idx + 1}: ${item.title || item.type}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
