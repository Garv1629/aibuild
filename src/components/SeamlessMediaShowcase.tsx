import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ServiceItem, ServiceMediaItem } from '../types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Film,
  Repeat,
} from 'lucide-react';

interface DisciplineStyle {
  bg: string;
  border: string;
  text: string;
  textMuted: string;
  pillBg: string;
  pillBorder: string;
  accent: string;
  btnBg: string;
  btnText: string;
  btnHover: string;
  specBg: string;
  specBorder: string;
  specText: string;
  specMuted: string;
  specCardBg: string;
  specCardBorder: string;
}

interface SeamlessMediaShowcaseProps {
  service: ServiceItem;
  badgeLabel: string;
  style: DisciplineStyle;
  onOpenDetails: () => void;
}

interface SlotState {
  item: ServiceMediaItem | null;
  index: number;
}

export const SeamlessMediaShowcase: React.FC<SeamlessMediaShowcaseProps> = ({
  service,
  badgeLabel,
  style,
  onOpenDetails,
}) => {
  // Normalize media items: prioritize service.mediaItems, fallback to legacy videoUrl / videoPoster
  const mediaList: ServiceMediaItem[] = React.useMemo(() => {
    if (service.mediaItems && service.mediaItems.length > 0) {
      const valid = service.mediaItems.filter((m) => m && m.url && m.url.trim().length > 0);
      if (valid.length > 0) return valid;
    }
    const fallbackList: ServiceMediaItem[] = [];
    if (service.videoUrl && service.videoUrl.trim()) {
      fallbackList.push({
        id: 'fallback-vid',
        type: 'video',
        url: service.videoUrl.trim(),
        poster: service.videoPoster?.trim(),
        title: service.title,
      });
    }
    if (service.videoPoster && service.videoPoster.trim() && !service.videoUrl) {
      fallbackList.push({
        id: 'fallback-img',
        type: 'image',
        url: service.videoPoster.trim(),
        title: service.title,
        duration: 4,
      });
    }
    return fallbackList;
  }, [service.mediaItems, service.videoUrl, service.videoPoster, service.title]);

  const totalItems = mediaList.length;

  // Track active index in media playlist
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(true);

  // Real-time normalized playback progress for current item (0 to 1)
  const [itemProgress, setItemProgress] = useState(0);

  // Dual-slot A/B deck architecture for TRUE zero-cut continuous playback:
  // activeSlot (0 or 1) is currently visible and playing.
  // The standby slot is kept loaded and buffered with the upcoming item in the background.
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [slot0, setSlot0] = useState<SlotState>({
    item: mediaList[0] || null,
    index: 0,
  });
  const [slot1, setSlot1] = useState<SlotState>({
    item: mediaList[1] || mediaList[0] || null,
    index: totalItems > 1 ? 1 : 0,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef0 = useRef<HTMLVideoElement | null>(null);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const photoTimerRef = useRef<number | null>(null);
  const photoProgressRafRef = useRef<number | null>(null);
  const isHandoffInProgressRef = useRef(false);

  // IntersectionObserver: stop background decoding when scrolled off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio > 0.05);
      },
      { threshold: [0.05, 0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Synchronize when mediaList changes (e.g., from Admin update)
  useEffect(() => {
    setCurrentIndex(0);
    setActiveSlot(0);
    setSlot0({ item: mediaList[0] || null, index: 0 });
    setSlot1({
      item: mediaList.length > 1 ? mediaList[1] : mediaList[0] || null,
      index: mediaList.length > 1 ? 1 : 0,
    });
    setItemProgress(0);
    isHandoffInProgressRef.current = false;
  }, [mediaList]);

  // Pre-buffer standby video element whenever standby item changes
  const prepareStandbySlot = useCallback(
    (standbySlotNum: 0 | 1, nextMedia: ServiceMediaItem | null) => {
      if (!nextMedia) return;
      const standbyVideo = standbySlotNum === 0 ? videoRef0.current : videoRef1.current;
      if (standbyVideo && nextMedia.type === 'video') {
        standbyVideo.muted = true; // Always muted while in background to avoid any audio bleed
        standbyVideo.currentTime = 0;
        standbyVideo.load();
      }
    },
    []
  );

  // Seamless handoff to the next or specific clip with zero cut / zero black frame
  const executeHandoff = useCallback(
    (targetIndex: number) => {
      if (totalItems <= 1) return;
      if (isHandoffInProgressRef.current) return;
      isHandoffInProgressRef.current = true;

      const nextIndex = (targetIndex + totalItems) % totalItems;
      const nextItem = mediaList[nextIndex];
      const nextSlotNum: 0 | 1 = activeSlot === 0 ? 1 : 0;
      const retiringSlotNum: 0 | 1 = activeSlot;

      // Ensure standby slot has the correct target item
      if (nextSlotNum === 0) {
        setSlot0({ item: nextItem, index: nextIndex });
      } else {
        setSlot1({ item: nextItem, index: nextIndex });
      }

      const nextVideo = nextSlotNum === 0 ? videoRef0.current : videoRef1.current;
      const retiringVideo = retiringSlotNum === 0 ? videoRef0.current : videoRef1.current;

      // Start playback of incoming video instantly before cross-dissolving
      if (nextVideo && nextItem?.type === 'video') {
        nextVideo.muted = isMuted;
        if (isPlaying && isInView) {
          const playPromise = nextVideo.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Retry on muted fallback if browser autoplay policy blocks
              nextVideo.muted = true;
              nextVideo.play().catch(() => {});
            });
          }
        }
      }

      // Smooth hardware-accelerated crossfade
      setActiveSlot(nextSlotNum);
      setCurrentIndex(nextIndex);
      setItemProgress(0);

      // Once the crossfade duration (600ms) completes:
      // 1. Pause retiring video to conserve CPU/GPU
      // 2. Preload the subsequent clip in queue into the retired slot
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

  // Handle active video element play/pause state
  useEffect(() => {
    const activeVideo = activeSlot === 0 ? videoRef0.current : videoRef1.current;
    if (!activeVideo) return;

    if (isPlaying && isInView) {
      activeVideo.play().catch(() => {});
    } else {
      activeVideo.pause();
    }
  }, [isPlaying, isInView, activeSlot]);

  // Handle photo item timer & progress bar
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
    if (!currentItem || currentItem.type !== 'image' || !isPlaying || !isInView) {
      return;
    }

    if (totalItems <= 1) {
      setItemProgress(1);
      return;
    }

    const durationSec = currentItem.duration || 4;
    const durationMs = durationSec * 1000;
    const startTime = performance.now();

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setItemProgress(progress);

      if (progress < 1) {
        photoProgressRafRef.current = requestAnimationFrame(updateProgress);
      }
    };
    photoProgressRafRef.current = requestAnimationFrame(updateProgress);

    photoTimerRef.current = window.setTimeout(() => {
      handleNext();
    }, durationMs);

    return () => {
      if (photoTimerRef.current) clearTimeout(photoTimerRef.current);
      if (photoProgressRafRef.current) cancelAnimationFrame(photoProgressRafRef.current);
    };
  }, [currentIndex, isPlaying, isInView, totalItems, mediaList, handleNext]);

  // Active video timeupdate: track real-time progress and trigger seamless handoff before ending
  const handleTimeUpdate = (slotNum: 0 | 1) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (activeSlot !== slotNum) return;
    const video = e.currentTarget;
    if (video.duration && video.duration > 0) {
      const progress = video.currentTime / video.duration;
      setItemProgress(progress);

      // Trigger seamless handoff ~0.55s before clip end for ZERO cut, seamless overlap
      if (totalItems > 1 && video.duration - video.currentTime <= 0.55 && !isHandoffInProgressRef.current) {
        handleNext();
      }
    }
  };

  // Fallback if video reaches literal end
  const handleVideoEnded = (slotNum: 0 | 1) => () => {
    if (activeSlot !== slotNum) return;
    if (totalItems > 1) {
      handleNext();
    } else {
      // Loop single video seamlessly
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
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef0.current) videoRef0.current.muted = nextMute;
    if (videoRef1.current) videoRef1.current.muted = nextMute;
  };

  // Render a media deck slot (0 or 1)
  const renderMediaSlot = (
    slot: SlotState,
    slotNum: 0 | 1,
    videoRef: React.RefObject<HTMLVideoElement | null>
  ) => {
    if (!slot.item) return null;
    const isActive = activeSlot === slotNum;
    const isVideo = slot.item.type === 'video';

    return (
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-600 ease-in-out pointer-events-none ${
          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={slot.item.url}
            poster={slot.item.poster}
            autoPlay={isActive && isPlaying && isInView}
            muted={isMuted}
            loop={totalItems === 1}
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate(slotNum)}
            onEnded={handleVideoEnded(slotNum)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105"
          />
        ) : (
          <div className="w-full h-full overflow-hidden">
            <img
              src={slot.item.url}
              alt={slot.item.title || service.title}
              className={`w-full h-full object-cover transition-transform ${
                isActive ? 'duration-[6000ms] scale-105' : 'duration-700 scale-100'
              } group-hover/video:scale-110 ease-out`}
            />
          </div>
        )}
      </div>
    );
  };

  const currentMedia = mediaList[currentIndex];
  const totalVideos = mediaList.filter((m) => m.type === 'video').length;

  return (
    <div
      ref={containerRef}
      onClick={onOpenDetails}
      className={`group/video relative w-full h-[240px] sm:h-[280px] md:h-[320px] rounded-3xl overflow-hidden bg-[#181C1D] border ${style.border} shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.01] select-none`}
    >
      {/* Empty State Fallback */}
      {totalItems === 0 && (
        <div className="w-full h-full bg-[#181C1D] flex flex-col items-center justify-center text-[#596769] text-xs font-mono p-4 text-center">
          <Film className="w-6 h-6 mb-2 text-[#D8A9A8] opacity-60" />
          <span>{service.title} Showcase</span>
        </div>
      )}

      {/* Dual Layer A/B Zero-Cut Video & Image Decks */}
      {renderMediaSlot(slot0, 0, videoRef0)}
      {renderMediaSlot(slot1, 1, videoRef1)}

      {/* Vignette Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#181C1D]/90 via-transparent to-[#181C1D]/50 pointer-events-none z-20" />

      {/* Top Header: Segmented Story Progress Bars (if multiple clips) */}
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
                className="flex-1 h-1 rounded-full bg-white/25 hover:bg-white/50 backdrop-blur-md overflow-hidden cursor-pointer p-0 transition-all focus:outline-none"
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

      {/* Top Bar Badges & Playback Controls */}
      <div
        className={`absolute ${
          totalItems > 1 ? 'top-6' : 'top-3.5'
        } left-3.5 right-3.5 z-30 flex items-center justify-between pointer-events-none transition-all`}
      >
        {/* Continuous Playback Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EBE9]/90 backdrop-blur-md border border-[#B8C1C0] text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.08em] text-[#202526] uppercase shadow-sm pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] animate-pulse" />
          <span>{badgeLabel}</span>
          {totalItems > 1 && (
            <span className="text-[#596769] font-medium border-l border-[#B8C1C0] pl-1.5 ml-0.5 flex items-center gap-1">
              <Repeat className="w-2.5 h-2.5 text-[#202526] opacity-70" />
              <span>
                {currentIndex + 1}/{totalItems}
              </span>
            </span>
          )}
        </div>

        {/* Action Controls: Prev, Next, Play/Pause, Audio */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Navigation Arrows */}
          {totalItems > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#202526]/80 hover:bg-[#596769] text-[#E7EBE9] flex items-center justify-center transition-all cursor-pointer border border-[#B8C1C0]/30 shadow-sm"
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
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#202526]/80 hover:bg-[#596769] text-[#E7EBE9] flex items-center justify-center transition-all cursor-pointer border border-[#B8C1C0]/30 shadow-sm"
                title="Next Clip"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#202526]/80 hover:bg-[#596769] text-[#E7EBE9] flex items-center justify-center transition-all cursor-pointer border border-[#B8C1C0]/30 shadow-sm"
            title={isPlaying ? 'Pause Playback' : 'Resume Playback'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-[#E7EBE9]" />
            )}
          </button>

          {/* Audio Mute / Unmute */}
          {currentMedia?.type === 'video' && (
            <button
              type="button"
              onClick={toggleMute}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#202526]/80 hover:bg-[#596769] text-[#E7EBE9] flex items-center justify-center transition-all cursor-pointer border border-[#B8C1C0]/30 shadow-sm"
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

      {/* Bottom Specs Action Button */}
      <div className="absolute bottom-3.5 right-3.5 z-30 flex items-center justify-end pointer-events-none">
        <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#E7EBE9] hover:bg-[#CBDCDE] text-[#202526] border border-[#B8C1C0] text-[11px] font-mono font-bold tracking-[0.08em] uppercase flex items-center gap-1 transition-all shadow-sm">
          <span>Specs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
