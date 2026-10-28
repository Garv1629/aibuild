/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Sparkles,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  FileText,
  Download,
  Check,
} from 'lucide-react';
import { Project } from '../utils/portfolio.ts';
import { Button } from './Button.tsx';

interface ProjectInteractiveDemoProps {
  project: Project;
}

export const ProjectInteractiveDemo: React.FC<ProjectInteractiveDemoProps> = ({ project }) => {
  if (project.demoType === 'video-reel') {
    return <VideoReelDemo project={project} />;
  }

  if (project.demoType === 'interactive-device') {
    return <InteractiveDeviceDemo project={project} />;
  }

  if (project.demoType === 'ugc-player') {
    return <UgcPlayerDemo project={project} />;
  }

  if (project.demoType === 'ebook-reader') {
    return <EbookReaderDemo project={project} />;
  }

  if (project.demoType === 'decision-tool') {
    return <DecisionToolDemo project={project} />;
  }

  return <MotionPhysicsDemo project={project} />;
};

// -------------------------------------------------------------
// 1. VIDEO REEL DEMO (AI Videos)
// -------------------------------------------------------------
const REEL_CONCEPTS = [
  {
    id: 'luxe',
    name: 'Luxury Chronograph',
    tag: '3D Product Commercial',
    aspect: '16:9',
    prompt:
      'Hyper-realistic macro dolly shot of obsidian titanium bezel, light refraction through sapphire crystal, cinematic volumetric mist, 8K photorealism.',
    fps: '60 FPS',
    resolution: '4K UHD',
  },
  {
    id: 'food',
    name: 'Artisan Espresso',
    tag: 'Food & Beverage Cinematic',
    aspect: '16:9',
    prompt:
      'Ultra slow-motion 1000fps capture of golden crema pouring into handcrafted ceramic cup, steam swirling in moody morning sunlight, cinematic depth of field.',
    fps: '60 FPS',
    resolution: '4K UHD',
  },
  {
    id: 'automotive',
    name: 'Future Mobility',
    tag: 'Concept Teaser',
    aspect: '16:9',
    prompt:
      'Aerodynamic electric concept vehicle gliding through foggy pine forest at dawn, seamless aerodynamic airflow lines, warm anamorphic flare.',
    fps: '60 FPS',
    resolution: '4K UHD',
  },
];

const VideoReelDemo: React.FC<{ project: Project }> = ({ project }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '9/16'>('16/9');
  const [selectedConcept, setSelectedConcept] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !project.videoUrl) return;

    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(project.videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = project.videoUrl;
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [project.videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const concept = REEL_CONCEPTS[selectedConcept];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl liquid-glass text-xs font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-text-primary font-medium">Interactive AI Video Player</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-muted mr-1">Aspect:</span>
          <Button
            variant="outline"
            size="sm"
            active={aspectRatio === '16/9'}
            onClick={() => setAspectRatio('16/9')}
          >
            16:9 Landscape
          </Button>
          <Button
            variant="outline"
            size="sm"
            active={aspectRatio === '9/16'}
            onClick={() => setAspectRatio('9/16')}
          >
            9:16 Vertical
          </Button>
        </div>
      </div>

      <div className="flex justify-center items-center liquid-glass-subtle rounded-3xl p-3 sm:p-6 border border-white/10">
        <div
          className={`relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl transition-all duration-500 bg-black ${
            aspectRatio === '16/9'
              ? 'w-full max-w-2xl aspect-[16/9]'
              : 'w-full max-w-[280px] aspect-[9/16]'
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
            <span className="liquid-glass-pill text-2xs font-mono px-2.5 py-0.5 rounded-full text-white">
              {concept.resolution}
            </span>
            <span className="liquid-glass-pill text-2xs font-mono px-2.5 py-0.5 rounded-full text-success border-success/40">
              {concept.fps}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-4 pointer-events-none">
            <div className="pointer-events-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="icon"
                  size="sm"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="icon"
                  size="sm"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </Button>
              </div>

              <span className="text-xs font-mono text-white drop-shadow-md">
                {concept.name} • {concept.tag}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card space-y-3">
        <span className="text-xs font-mono text-muted uppercase tracking-wider block">
          Select AI Commercial Concept &amp; Cinematic Prompt
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {REEL_CONCEPTS.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedConcept(idx)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedConcept === idx
                  ? 'border-accent/60 bg-sky-950/40 shadow-[0_0_15px_rgba(78,133,191,0.25)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <div className="text-xs font-medium text-text-primary">{c.name}</div>
              <div className="text-2xs font-mono text-muted mt-0.5">{c.tag}</div>
            </button>
          ))}
        </div>
        <div className="p-3.5 rounded-xl liquid-glass-subtle text-xs font-mono space-y-1">
          <span className="text-accent font-semibold">Generative Camera &amp; Lighting Prompt:</span>
          <p className="text-muted leading-relaxed italic">&quot;{concept.prompt}&quot;</p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. UGC VIDEO DEMO (UGC Videos)
// -------------------------------------------------------------
const UGC_CONCEPTS = [
  {
    id: 'skincare',
    title: 'Skincare Barrier Serum',
    hook: '"Stop using 10 skincare steps. This 1 serum fixed my skin in 7 days."',
    hookType: 'Problem-Solution Hook',
    likes: '142.8K',
    comments: '1,842',
    shares: '12.4K',
    retention: '88% at 3s',
    ctr: '4.9% CTR',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tech',
    title: 'Minimalist MagSafe Wallet',
    hook: '"I tossed my bulky leather wallet for this. Look what happens when I tap it."',
    hookType: 'Curiosity & Demo Hook',
    likes: '286.1K',
    comments: '3,210',
    shares: '34.8K',
    retention: '92% at 3s',
    ctr: '5.6% CTR',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'apparel',
    title: 'Thermal Tech Hoodie',
    hook: '"The internet said this was the coziest hoodie on Earth. Let’s test the ice bowl."',
    hookType: 'Extreme Test Hook',
    likes: '94.5K',
    comments: '890',
    shares: '8.2K',
    retention: '85% at 3s',
    ctr: '4.2% CTR',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
  },
];

const UgcPlayerDemo: React.FC<{ project: Project }> = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const concept = UGC_CONCEPTS[selectedIdx];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl liquid-glass text-xs font-mono">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-success" />
          <span className="text-text-primary font-medium">UGC Video Ad &amp; Social Hook Simulator</span>
        </div>

        <div className="flex items-center gap-2 text-muted">
          <span className="text-success font-semibold">{concept.retention}</span>
          <span>•</span>
          <span className="text-accent font-semibold">{concept.ctr}</span>
        </div>
      </div>

      {/* Vertical Mobile Simulator */}
      <div className="flex justify-center items-center liquid-glass-subtle rounded-3xl p-4 sm:p-6 border border-white/10">
        <div className="relative w-full max-w-[290px] aspect-[9/16] rounded-[32px] overflow-hidden border-4 border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.85)] bg-black">
          {/* Simulated Video Frame */}
          <img
            src={concept.image}
            alt={concept.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPlaying ? 'opacity-90' : 'opacity-60'
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

          {/* Top Bar */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <span className="liquid-glass-pill text-2xs font-mono px-2.5 py-0.5 rounded-full text-white">
              9:16 UGC Format
            </span>
            <span className="liquid-glass-pill text-2xs font-mono px-2.5 py-0.5 rounded-full text-success border-success/30">
              High Converting
            </span>
          </div>

          {/* Right Floating Actions (TikTok/Reels style) with Liquid Glass */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3.5 z-10">
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center liquid-glass-pill transition-transform group-hover:scale-110 ${
                  isLiked ? 'bg-error/80 text-white border-error' : 'text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-2xs font-mono text-white font-medium drop-shadow-md">
                {isLiked ? '142.9K' : concept.likes}
              </span>
            </button>

            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full text-white flex items-center justify-center liquid-glass-pill">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-2xs font-mono text-white font-medium drop-shadow-md">
                {concept.comments}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full text-white flex items-center justify-center liquid-glass-pill">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-2xs font-mono text-white font-medium drop-shadow-md">
                {concept.shares}
              </span>
            </div>
          </div>

          {/* Bottom Captions & Hook Overlay */}
          <div className="absolute bottom-4 inset-x-4 pr-14 z-10 space-y-2">
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-accent/80 text-bg text-2xs font-mono font-bold uppercase tracking-wider">
              {concept.hookType}
            </div>

            <p className="text-xs text-white font-medium leading-snug drop-shadow-md">
              {concept.hook}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? 'Pause Preview' : 'Play Preview'}
              </Button>
              <span className="text-2xs font-mono text-secondary">
                AI Build UGC Studio
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UGC Concept Switcher */}
      <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card space-y-3">
        <span className="text-xs font-mono text-muted uppercase tracking-wider block">
          Select UGC Creative Format &amp; Hook Architecture
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {UGC_CONCEPTS.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedIdx(idx);
                setIsLiked(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedIdx === idx
                  ? 'border-success/60 bg-emerald-950/40 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <div className="text-xs font-medium text-text-primary">{c.title}</div>
              <div className="text-2xs font-mono text-success mt-0.5">{c.hookType}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. E-BOOK READER DEMO (E-books)
// -------------------------------------------------------------
const EBOOK_CHAPTERS = [
  {
    num: '01',
    title: 'The AI Revolution in Digital Products',
    pages: 'Pages 1-18',
    summary:
      'Foundational principles of generative media, market positioning for modern founders, and establishing product-market alignment.',
    highlight:
      'Modern digital brands thrive not by doing more manual hours, but by combining prompt engineering, aesthetic curation, and automated pipelines.',
  },
  {
    num: '02',
    title: 'Building High-Converting UGC & Video Funnels',
    pages: 'Pages 19-42',
    summary:
      'Exact 3-second hook frameworks, script blueprints, video pacing calibrations, and multi-variant creative split testing.',
    highlight:
      'The first 3 seconds dictate 85% of ad spend efficiency. Hook with visceral curiosity or immediate counter-intuitive problem identification.',
  },
  {
    num: '03',
    title: 'Rapid Web Prototyping & Vibe Coding',
    pages: 'Pages 43-68',
    summary:
      'Turning mental models into functional React & Tailwind interfaces within hours using AI-driven iterative synthesis.',
    highlight:
      'Vibe coding bridges taste and code. When the feedback loop is instantaneous, creative experimentation outpaces traditional development 10x.',
  },
  {
    num: '04',
    title: 'Publishing & Monetizing High-Value Guides',
    pages: 'Pages 69-96',
    summary:
      'Editorial typography, interactive PDF/ePub formatting, pricing tier strategy, and high-converting launch mockup suites.',
    highlight:
      'A great digital publication looks and feels tangible. Typographic restraint, whitespace, and sharp 3D cover assets build immediate perceived authority.',
  },
];

const EbookReaderDemo: React.FC<{ project: Project }> = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [downloaded, setDownloaded] = useState(false);

  const chapter = EBOOK_CHAPTERS[activeChapter];

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl liquid-glass text-xs font-mono">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <span className="text-text-primary font-medium">Interactive Digital Publication Reader</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted text-xs">Font:</span>
          <Button
            variant="outline"
            size="sm"
            active={fontSize === 'normal'}
            onClick={() => setFontSize('normal')}
          >
            Aa
          </Button>
          <Button
            variant="outline"
            size="sm"
            active={fontSize === 'large'}
            onClick={() => setFontSize('large')}
          >
            Aa+
          </Button>
        </div>
      </div>

      {/* Reader Layout: Two columns (TOC + Page Preview) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Table of Contents Column */}
        <div className="md:col-span-5 space-y-2 p-4 rounded-2xl liquid-glass-card">
          <span className="text-xs font-mono text-muted uppercase tracking-wider block mb-2">
            Table of Contents (96 Pages)
          </span>

          <div className="space-y-1.5">
            {EBOOK_CHAPTERS.map((ch, idx) => (
              <button
                key={ch.num}
                type="button"
                onClick={() => setActiveChapter(idx)}
                className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  activeChapter === idx
                    ? 'border border-accent/50 bg-sky-950/40 shadow-[0_0_12px_rgba(78,133,191,0.25)]'
                    : 'border border-transparent hover:bg-white/[0.05] text-muted'
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-text-primary">
                    <span className="font-mono text-accent mr-1.5">{ch.num}.</span>
                    {ch.title}
                  </div>
                  <div className="text-2xs font-mono text-muted mt-0.5">{ch.pages}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-stroke/70 mt-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleDownload}
              className="w-full text-xs font-mono uppercase tracking-wider"
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span>Sample PDF Prepared ✓</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Chapter</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Page Preview Column */}
        <div className="md:col-span-7 p-6 rounded-2xl liquid-glass-card flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stroke/60 pb-3">
              <span className="text-xs font-mono text-accent uppercase tracking-widest">
                Chapter {chapter.num} • {chapter.pages}
              </span>
              <span className="text-2xs font-mono text-muted">AI Build Digital Guide</span>
            </div>

            <h4 className="text-xl sm:text-2xl font-display italic text-text-primary leading-snug">
              {chapter.title}
            </h4>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {chapter.summary}
            </p>

            {/* Editorial Highlight Quote Box */}
            <div className="p-4 rounded-xl liquid-glass-subtle border-l-2 border-accent space-y-1">
              <span className="text-2xs font-mono text-muted uppercase tracking-wider block">
                Key Takeaway
              </span>
              <p
                className={`italic font-display text-text-primary ${
                  fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                }`}
              >
                &ldquo;{chapter.highlight}&rdquo;
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-stroke/60 flex items-center justify-between text-xs font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span>Interactive PDF / ePub Format</span>
            </span>
            <span>3D Cover &amp; Mockups Included</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. INTERACTIVE DEVICE DEMO (Web Development)
// -------------------------------------------------------------
const REAL_ESTATE_PROPERTIES = [
  {
    id: 1,
    title: 'The Azure Horizon Villa',
    category: 'Villas',
    price: '$2,850,000',
    specs: '5 Bed • 6 Bath • 5,400 sqft',
    location: 'Emerald Hills, CA',
    tag: 'Architectural Feature',
  },
  {
    id: 2,
    title: 'The Glasshouse Penthouse',
    category: 'Penthouses',
    price: '$3,400,000',
    specs: '4 Bed • 4.5 Bath • 4,100 sqft',
    location: 'Downtown Skyline',
    tag: 'Panoramic Deck',
  },
  {
    id: 3,
    title: 'Oakwood Sanctuary',
    category: 'Green Acres',
    price: '$1,950,000',
    specs: '4 Bed • 3 Bath • 3,800 sqft',
    location: 'Rolling Pines',
    tag: 'Eco Smart Home',
  },
];

const InteractiveDeviceDemo: React.FC<{ project: Project }> = () => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedFilter, setSelectedFilter] = useState<
    'All' | 'Villas' | 'Penthouses' | 'Green Acres'
  >('All');
  const [inquirySent, setInquirySent] = useState<number | null>(null);

  const filteredProperties =
    selectedFilter === 'All'
      ? REAL_ESTATE_PROPERTIES
      : REAL_ESTATE_PROPERTIES.filter((p) => p.category === selectedFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl liquid-glass text-xs font-mono">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-accent" />
          <span className="text-text-primary font-medium">Responsive Viewport Simulator</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            active={device === 'desktop'}
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            active={device === 'mobile'}
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-center items-center liquid-glass-subtle rounded-3xl p-3 sm:p-6 border border-white/10">
        <div
          className={`w-full transition-all duration-500 liquid-glass-modal rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col ${
            device === 'desktop' ? 'max-w-2xl' : 'max-w-[340px]'
          }`}
        >
          <div className="px-4 py-2.5 bg-black/40 border-b border-stroke/70 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
            </div>

            <div className="flex-1 text-center">
              <span className="text-xs font-mono text-muted liquid-glass-pill px-3 py-1 rounded-full inline-block max-w-[200px] truncate">
                sribalajirealestate.in/estates
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4 max-h-[360px] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stroke/50 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Sri Balaji Real Estate
                </h4>
                <p className="text-xs text-muted">
                  Premium Estates &amp; Residential Plots
                </p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-2xs font-mono">
                {(['All', 'Villas', 'Penthouses', 'Green Acres'] as const).map((cat) => (
                  <Button
                    key={cat}
                    variant="outline"
                    size="sm"
                    active={selectedFilter === cat}
                    onClick={() => setSelectedFilter(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="p-3.5 rounded-xl liquid-glass-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-primary">
                        {prop.title}
                      </span>
                      <span className="text-2xs font-mono px-2 py-0.2 rounded-full liquid-glass-pill text-success border-success/20">
                        {prop.tag}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-muted">
                      {prop.specs} • {prop.location}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-accent font-mono">
                      {prop.price}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setInquirySent(prop.id)}
                    >
                      {inquirySent === prop.id ? 'Inquiry Sent ✓' : 'Book Tour'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. DECISION TOOL DEMO (AI Applications)
// -------------------------------------------------------------
const DecisionToolDemo: React.FC<{ project: Project }> = () => {
  const [budget, setBudget] = useState(2400);
  const [commuteMax, setCommuteMax] = useState(25);
  const [petFriendly, setPetFriendly] = useState(true);
  const [inUnitWasher, setInUnitWasher] = useState(true);

  const score = Math.min(
    99,
    Math.round(
      65 +
        (budget > 2000 ? 15 : 5) +
        (commuteMax > 20 ? 10 : 0) +
        (petFriendly ? 5 : 0) +
        (inUnitWasher ? 5 : 0)
    )
  );

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-text-primary font-medium">
            <Sliders className="w-4 h-4 text-accent" />
            <span>Decision Matrix Simulator</span>
          </div>
          <span className="text-muted">Dynamic Scoring</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted">Target Budget:</span>
              <span className="text-accent font-semibold">${budget}/mo</span>
            </div>
            <input
              type="range"
              min="1200"
              max="4500"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted">Max Commute:</span>
              <span className="text-accent font-semibold">{commuteMax} mins</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={commuteMax}
              onChange={(e) => setCommuteMax(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stroke/70 text-xs font-mono">
          <Button
            variant="outline"
            size="sm"
            active={petFriendly}
            onClick={() => setPetFriendly(!petFriendly)}
          >
            <span>Pet Friendly</span>
            <span className={petFriendly ? 'text-accent font-bold' : 'text-muted'}>
              {petFriendly ? 'ON' : 'OFF'}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            active={inUnitWasher}
            onClick={() => setInUnitWasher(!inUnitWasher)}
          >
            <span>In-Unit Laundry</span>
            <span className={inUnitWasher ? 'text-accent font-bold' : 'text-muted'}>
              {inUnitWasher ? 'ON' : 'OFF'}
            </span>
          </Button>
        </div>
      </div>

      <div className="p-5 rounded-2xl liquid-glass-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            AI Tradeoff Analysis &amp; Match Rating
          </span>
          <span className="text-xs font-mono text-success flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Match
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl liquid-glass-subtle">
          <div>
            <div className="text-sm font-medium text-text-primary">
              Recommended Unit: Midtown Solar Loft
            </div>
            <div className="text-xs font-mono text-muted mt-0.5">
              ${Math.min(budget, 2250)}/mo • {Math.min(commuteMax, 18)} min commute
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs font-mono text-muted">Confidence</div>
              <div className="text-lg font-mono font-bold text-accent">{score}%</div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-accent/40 liquid-glass-pill flex items-center justify-center font-mono text-xs font-semibold text-text-primary">
              A+
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. MOTION PHYSICS DEMO
// -------------------------------------------------------------
const MotionPhysicsDemo: React.FC<{ project: Project }> = () => {
  const [stiffness, setStiffness] = useState(300);
  const [damping, setDamping] = useState(20);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-text-primary font-medium">
            <Sliders className="w-4 h-4 text-accent" />
            <span>Interactive Spring Physics Inspector</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetKey((k) => k + 1)}
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Card</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted">Spring Stiffness:</span>
              <span className="text-accent font-semibold">{stiffness}</span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="20"
              value={stiffness}
              onChange={(e) => setStiffness(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted">Spring Damping:</span>
              <span className="text-accent font-semibold">{damping}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="h-64 rounded-3xl liquid-glass-subtle border border-white/10 flex items-center justify-center p-6 relative overflow-hidden">
        <span className="absolute top-4 left-4 text-2xs font-mono text-muted uppercase tracking-wider">
          Drag card to test spring return physics
        </span>

        <motion.div
          key={resetKey}
          drag
          dragConstraints={{ left: -120, right: 120, top: -70, bottom: 70 }}
          dragElastic={0.2}
          dragTransition={{ bounceStiffness: stiffness, bounceDamping: damping }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-5 rounded-2xl liquid-glass-modal shadow-[0_20px_50px_rgba(0,0,0,0.85)] cursor-grab active:cursor-grabbing w-64 text-center select-none"
        >
          <div className="text-xs font-mono text-muted uppercase tracking-wider mb-1">
            Dynamic Kinetic Element
          </div>
          <div className="text-base font-medium text-text-primary">
            AI Build Interactive Card
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs font-mono text-accent">
            Stiffness: {stiffness} • Damping: {damping}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
