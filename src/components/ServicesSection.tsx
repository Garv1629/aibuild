import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { FadeIn } from './FadeIn';
import { ServiceItem } from '../types';
import {
  ArrowUpRight,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Workflow,
  X,
} from 'lucide-react';

interface ServicesSectionProps {
  content?: {
    heading: string;
    subheading: string;
    items: ServiceItem[];
  };
  onOpenContact?: (serviceType?: string) => void;
  onOpenEstimator?: () => void;
}

const defaultServicesData: ServiceItem[] = [
  {
    number: '01',
    title: 'UGC ADS',
    description: 'Social-first creative that sells.',
    tagline: 'Performance-driven content that feels native to the feed.',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
    videoPoster:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    weCreate: [
      'Product UGC',
      'Creator-style ads',
      'Hook variations',
      'Product demonstrations',
      'Testimonial-style creatives',
      'Paid social creatives',
    ],
    process: [
      'Brief',
      'Concept',
      'Script',
      'Storyboard',
      'Generate / Shoot',
      'Edit',
      'Variations',
    ],
    turnaround: '3–7 days',
    deliverables: [
      '9:16 vertical video',
      'Multiple hooks',
      'Multiple versions',
      'Ad-ready exports',
    ],
  },
  {
    number: '02',
    title: 'AI VIDEOS',
    description: 'Cinematic visuals built with AI.',
    tagline: 'From a single idea to cinematic visual content built with AI.',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
    videoPoster:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    weCreate: [
      'Product films',
      'Cinematic ads',
      'AI commercials',
      'Social videos',
      'Brand films',
      'Concept visuals',
      'Motion sequences',
    ],
    process: [
      'Concept',
      'Visual Direction',
      'Storyboard',
      'Generation',
      'Editing',
      'Sound',
      'Final Master',
    ],
    turnaround: '3–10 days',
    deliverables: [
      '4K / 1080p',
      '9:16 · 16:9 · 1:1',
      'Social + campaign formats',
    ],
  },
  {
    number: '03',
    title: 'WEBSITE BUILDING',
    description: 'Premium websites built to perform.',
    tagline:
      'Websites that make your brand look expensive.',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
    videoPoster:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    weCreate: [
      'Conversion landing pages',
      'Interactive Web3/AI web apps',
      'Custom headless CMS setups',
      'High-speed bespoke frontend',
      '3D & interactive animations',
      'Full-stack integrations',
    ],
    process: [
      'Discovery & Wireframing',
      'UI/UX Architecture',
      'Interactive Prototyping',
      'Production Codebase',
      'Speed & SEO Optimization',
      'Global CDN Deployment',
    ],
    turnaround: '1–3 weeks',
    deliverables: [
      'Production React / Next / Vite codebase',
      'Responsive mobile-first build',
      'Lighthouse 95+ performance',
      'Self-hosted CMS control',
    ],
  },
  {
    number: '04',
    title: 'AUTOMATIONS',
    description: 'Intelligent systems that run the work.',
    tagline:
      'Less repetitive work. More things getting done.',
    videoUrl:
      'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
    videoPoster:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
    weCreate: [
      'Autonomous agent workflows',
      'CRM & pipeline synchronization',
      'LLM content & lead pipelines',
      'Custom API webhooks',
      'Customer support AI bots',
      'Internal ops tooling',
    ],
    process: [
      'Workflow Audit',
      'Architecture Blueprint',
      'Agent & API Pipeline Build',
      'Testing & Edge-case Handling',
      'Deployment & Monitoring',
      'Knowledge Base Sync',
    ],
    turnaround: '5–14 days',
    deliverables: [
      'End-to-end automated pipelines',
      'Real-time telemetry & alerts',
      'Documentation & training',
      'Zero-downtime failovers',
    ],
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.16, delayChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.985,
    y: 15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

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

const disciplineStyles: Record<string, DisciplineStyle> = {
  '01': {
    // 01 UGC ADS - Glassmorphic Surface
    bg: 'bg-white/60 backdrop-blur-2xl',
    border: 'border-white/80 hover:border-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]',
    text: 'text-[#202526]',
    textMuted: 'text-[#596769]',
    pillBg: 'bg-white/70 backdrop-blur-md',
    pillBorder: 'border-white/90',
    accent: 'bg-[#D8A9A8]',
    btnBg: 'bg-[#202526]',
    btnText: 'text-[#FFFFFF]',
    btnHover: 'hover:bg-[#111314]',
    specBg: 'bg-white/50 backdrop-blur-lg',
    specBorder: 'border-white/70',
    specText: 'text-[#202526]',
    specMuted: 'text-[#596769]',
    specCardBg: 'bg-white/70 backdrop-blur-md',
    specCardBorder: 'border-white/80',
  },
  '02': {
    // 02 AI VIDEOS - Glassmorphic Surface
    bg: 'bg-white/60 backdrop-blur-2xl',
    border: 'border-white/80 hover:border-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]',
    text: 'text-[#202526]',
    textMuted: 'text-[#596769]',
    pillBg: 'bg-white/70 backdrop-blur-md',
    pillBorder: 'border-white/90',
    accent: 'bg-[#596769]',
    btnBg: 'bg-[#202526]',
    btnText: 'text-[#FFFFFF]',
    btnHover: 'hover:bg-[#111314]',
    specBg: 'bg-white/50 backdrop-blur-lg',
    specBorder: 'border-white/70',
    specText: 'text-[#202526]',
    specMuted: 'text-[#596769]',
    specCardBg: 'bg-white/70 backdrop-blur-md',
    specCardBorder: 'border-white/80',
  },
  '03': {
    // 03 WEBSITE BUILDING - Glassmorphic Surface
    bg: 'bg-white/60 backdrop-blur-2xl',
    border: 'border-white/80 hover:border-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]',
    text: 'text-[#202526]',
    textMuted: 'text-[#596769]',
    pillBg: 'bg-white/70 backdrop-blur-md',
    pillBorder: 'border-white/90',
    accent: 'bg-[#202526]',
    btnBg: 'bg-[#202526]',
    btnText: 'text-[#FFFFFF]',
    btnHover: 'hover:bg-[#111314]',
    specBg: 'bg-white/50 backdrop-blur-lg',
    specBorder: 'border-white/70',
    specText: 'text-[#202526]',
    specMuted: 'text-[#596769]',
    specCardBg: 'bg-white/70 backdrop-blur-md',
    specCardBorder: 'border-white/80',
  },
  '04': {
    // 04 AUTOMATIONS - Glassmorphic Surface
    bg: 'bg-white/60 backdrop-blur-2xl',
    border: 'border-white/80 hover:border-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]',
    text: 'text-[#202526]',
    textMuted: 'text-[#596769]',
    pillBg: 'bg-white/70 backdrop-blur-md',
    pillBorder: 'border-white/90',
    accent: 'bg-[#D8A9A8]',
    btnBg: 'bg-[#202526]',
    btnText: 'text-[#FFFFFF]',
    btnHover: 'hover:bg-[#111314]',
    specBg: 'bg-white/50 backdrop-blur-lg',
    specBorder: 'border-white/70',
    specText: 'text-[#202526]',
    specMuted: 'text-[#596769]',
    specCardBg: 'bg-white/70 backdrop-blur-md',
    specCardBorder: 'border-white/80',
  },
};

// Video preview card component inside dusted material frame
const ServiceVideoCard: React.FC<{
  service: ServiceItem;
  badgeLabel: string;
  style: DisciplineStyle;
  onOpenDetails: () => void;
}> = ({ service, badgeLabel, style, onOpenDetails }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
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
      onClick={onOpenDetails}
      className={`group/video relative w-full h-[240px] sm:h-[280px] md:h-[320px] rounded-3xl overflow-hidden bg-[#202526] border ${style.border} shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.01]`}
    >
      {/* Video Element */}
      {service.videoUrl && service.videoUrl.trim() ? (
        <video
          ref={videoRef}
          src={service.videoUrl}
          poster={service.videoPoster && service.videoPoster.trim() ? service.videoPoster : undefined}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105"
        />
      ) : service.videoPoster && service.videoPoster.trim() ? (
        <img
          src={service.videoPoster}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-[#202526] flex items-center justify-center text-[#596769] text-xs font-mono">
          {service.title}
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#202526]/80 via-transparent to-[#202526]/30 pointer-events-none" />

      {/* Top Header Badge */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EBE9]/90 backdrop-blur-md border border-[#B8C1C0] text-[11px] font-mono font-bold tracking-[0.08em] text-[#202526] uppercase shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
          <span>{badgeLabel}</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {service.videoUrl && (
            <>
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#202526]/80 hover:bg-[#596769] text-[#E7EBE9] flex items-center justify-center transition-all cursor-pointer border border-[#B8C1C0]/30 shadow-sm"
                title={isPlaying ? 'Pause Preview' : 'Play Preview'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-[#E7EBE9]" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#202526]/80 hover:bg-[#596769] text-[#E7EBE9] flex items-center justify-center transition-all cursor-pointer border border-[#B8C1C0]/30 shadow-sm"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Information Pill */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-3 text-[#E7EBE9] pointer-events-none">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[#CBDCDE] block font-semibold">
            {service.turnaround ? `Turnaround: ${service.turnaround}` : 'Production Ready'}
          </span>
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#E7EBE9]">
            {service.title} Showcase
          </p>
        </div>

        <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#E7EBE9] hover:bg-[#CBDCDE] text-[#202526] border border-[#B8C1C0] text-[11px] font-mono font-bold tracking-[0.08em] uppercase flex items-center gap-1 transition-all shadow-sm">
          <span>Specs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  content,
  onOpenContact,
  onOpenEstimator,
}) => {
  const heading = content?.heading || 'WHAT WE DO';
  const services =
    content?.items && content.items.length > 0 ? content.items : defaultServicesData;

  const [expandedNumbers, setExpandedNumbers] = useState<string[]>([]);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [isHowWeWorkOpen, setIsHowWeWorkOpen] = useState(false);

  const toggleExpand = (num: string) => {
    setExpandedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const getVideoBadgeLabel = (num: string) => {
    switch (num) {
      case '01':
        return 'UGC REEL';
      case '02':
        return 'AI CINEMA';
      case '03':
        return 'WEBSITE VIDEO';
      case '04':
        return 'SYSTEM VIDEO';
      default:
        return 'VIDEO';
    }
  };

  return (
    <section
      id="services"
      className="relative w-full bg-transparent text-[#202526] py-20 sm:py-28 md:py-36 z-10 select-none overflow-hidden font-body"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 relative z-10">
        {/* Top Header Section */}
        <div className="mb-10 sm:mb-20 md:mb-24">
          <div className="flex items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-[#DDDCD7]">
            <FadeIn delay={0} y={15}>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D8A9A8]" />
                <h2 className="text-xs sm:text-sm font-label-small tracking-[0.15em] uppercase text-[#202526]">
                  {heading}
                </h2>
              </div>
            </FadeIn>

            <FadeIn delay={0.05} y={15} className="flex items-center gap-3">
              {onOpenEstimator && (
                <button
                  type="button"
                  onClick={onOpenEstimator}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/70 hover:bg-[#202526] text-[#202526] hover:text-[#E7EBE9] border border-[#B8C1C0] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#D8A9A8] animate-pulse" />
                  <span>Estimate Project Scope</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenContact && onOpenContact('01 - UGC ADS')}
                className="group flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#202526] text-[#FFFFFF] hover:bg-[#596769] transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer font-btn"
                title="Start a project / Inquire"
                aria-label="Inquire about our services"
              >
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </FadeIn>
          </div>

          {/* Subheading Statement */}
          <FadeIn delay={0.1} y={25}>
            <p className="mt-6 sm:mt-12 text-xl xs:text-2xl sm:text-4xl md:text-5xl font-normal leading-snug text-[#202526] tracking-[-0.02em] font-elegant max-w-4xl">
              We create. We build. We automate.
            </p>
          </FadeIn>
        </div>

        {/* 4 Multi-Surface Disciplines Cards */}
        <div className="space-y-4 sm:space-y-8">
          {services.map((service) => {
            const isExpanded = expandedNumbers.includes(service.number);
            const isHovered = hoveredService === service.number;
            const style = disciplineStyles[service.number] || disciplineStyles['01'];

            return (
              <motion.div
                key={service.number}
                initial={{
                  opacity: 0,
                  y: 35,
                  scale: 0.985,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                viewport={{ once: true, margin: '0px 0px -40px 0px', amount: 0.08 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setHoveredService(service.number)}
                onMouseLeave={() => setHoveredService(null)}
                className={`p-4 xs:p-6 sm:p-9 md:p-12 rounded-[24px] sm:rounded-[40px] ${style.bg} border ${style.border} ${style.text} shadow-md transition-all duration-300 group/item`}
              >
                {/* 2-Column Responsive Layout for each Discipline */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center">
                  {/* Left Column: Number, Title, Description, Arrow Button */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-6">
                    <div className="flex items-start gap-3 sm:gap-6">
                      <span className="font-strong text-2xl sm:text-4xl md:text-5xl shrink-0 tracking-tight opacity-70">
                        {service.number}
                      </span>

                      <div className="space-y-1.5 sm:space-y-2.5 flex-1">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-normal uppercase tracking-[-0.02em] font-heading">
                            {service.title}
                          </h3>
                          <span
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${style.accent} transition-all duration-300 ${
                              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                            }`}
                          />
                        </div>

                        <p className={`text-xs xs:text-sm sm:text-base md:text-xl ${style.textMuted} font-sans-clean font-normal leading-relaxed`}>
                          {service.tagline || service.description}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Arrow Button & Specs Trigger */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pl-0 sm:pl-14">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenContact &&
                          onOpenContact(`${service.number} - ${service.title}`)
                        }
                        className={`group/arrow inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full ${style.btnBg} ${style.btnText} ${style.btnHover} text-xs sm:text-sm font-btn font-medium uppercase tracking-[0.08em] transition-all duration-200 cursor-pointer shadow-sm`}
                      >
                        <span>Start {service.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/arrow:translate-x-1" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpand(service.number)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-label-small font-medium ${style.pillBg} ${style.border} border text-[#202526] hover:bg-[#E7EBE9]/90 transition-colors cursor-pointer shadow-sm`}
                      >
                        <span>{isExpanded ? 'Hide Specs' : 'View Specs'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: [VIDEO] Showcase Card */}
                  <div className="lg:col-span-6">
                    <ServiceVideoCard
                      service={service}
                      style={style}
                      badgeLabel={getVideoBadgeLabel(service.number)}
                      onOpenDetails={() => toggleExpand(service.number)}
                    />
                  </div>
                </div>

                {/* Expandable Specifications Blueprint inside Material canvas */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.99 }}
                      animate={{
                        opacity: 1,
                        height: 'auto',
                        scale: 1,
                        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        scale: 0.99,
                        transition: { duration: 0.3, ease: 'easeInOut' },
                      }}
                      className="overflow-hidden"
                    >
                      <div className={`${style.specBg} ${style.specText} p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-[28px] mt-5 sm:mt-8 shadow-lg border ${style.specBorder} relative`}>
                        {/* Top Header & Tagline */}
                        <div className={`pb-4 sm:pb-6 border-b ${style.specBorder} flex flex-col md:flex-row md:items-end justify-between gap-4`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                              <span className={`w-2 h-2 rounded-full ${style.accent}`} />
                              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.08em] font-bold opacity-80">
                                Discipline // {service.number}
                              </span>
                            </div>
                            <h4 className="text-lg xs:text-xl sm:text-3xl font-black uppercase tracking-tight">
                              {service.title} Specifications
                            </h4>
                            <p className={`mt-1 text-xs sm:text-base ${style.specMuted} font-normal max-w-2xl`}>
                              {service.tagline || service.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onOpenContact &&
                              onOpenContact(`${service.number} - ${service.title}`)
                            }
                            className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-full ${style.btnBg} ${style.btnText} ${style.btnHover} font-bold text-xs uppercase tracking-[0.08em] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-105 active:scale-95`}
                          >
                            <span>Inquire for {service.title}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Grid Breakdown: WE CREATE / PROCESS / TURNAROUND & DELIVERABLES */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6">
                          {/* Column 1: WE CREATE (4 Cols) */}
                          <div className="lg:col-span-4 space-y-3">
                            <div className={`flex items-center gap-2 pb-2 border-b ${style.specBorder}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
                              <h5 className="text-xs font-mono font-bold uppercase tracking-[0.15em] opacity-80">
                                WE CREATE
                              </h5>
                            </div>

                            <ul className="space-y-2.5">
                              {(service.weCreate || []).map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2.5 text-xs sm:text-sm"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#596769] shrink-0" />
                                  <span className="font-medium">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Column 2: PROCESS FLOW (5 Cols) */}
                          <div className="lg:col-span-5 space-y-3">
                            <div className={`flex items-center gap-2 pb-2 border-b ${style.specBorder}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#AFC7C5]" />
                              <h5 className="text-xs font-mono font-bold uppercase tracking-[0.15em] opacity-80">
                                PROCESS
                              </h5>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {(service.process || []).map((step, idx, arr) => (
                                <React.Fragment key={idx}>
                                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${style.specCardBg} border ${style.specCardBorder} shadow-xs`}>
                                    <span className="text-[10px] font-mono font-bold opacity-75">
                                      0{idx + 1}
                                    </span>
                                    <span className="text-xs font-semibold">
                                      {step}
                                    </span>
                                  </div>
                                  {idx < arr.length - 1 && (
                                    <ArrowRight className="w-3 h-3 opacity-60 shrink-0" />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>

                          {/* Column 3: TURNAROUND & DELIVERABLE (3 Cols) */}
                          <div className="lg:col-span-3 space-y-4">
                            {/* Turnaround Block */}
                            <div className={`p-4 rounded-2xl ${style.specCardBg} border ${style.specCardBorder}`}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Clock className="w-3.5 h-3.5 opacity-80" />
                                <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] opacity-80">
                                  TURNAROUND
                                </h5>
                              </div>
                              <p className="text-lg sm:text-xl font-bold font-mono">
                                {service.turnaround || '3–7 days'}
                              </p>
                            </div>

                            {/* Deliverable Block */}
                            <div className="space-y-2">
                              <div className={`flex items-center gap-2 pb-1.5 border-b ${style.specBorder}`}>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#596769]" />
                                <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] opacity-80">
                                  DELIVERABLE
                                </h5>
                              </div>

                              <ul className="space-y-1.5 text-xs font-mono">
                                {(service.deliverables || []).map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <span className="text-[#596769]">&bull;</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Call to Action: HOW WE WORK → */}
        <div className="mt-16 sm:mt-24 pt-12 border-t border-[#DDDCD7] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D8A9A8]" />
            <p className="text-sm sm:text-base text-[#596769] font-mono font-medium">
              High-Velocity Production &bull; Engineered for Scale
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsHowWeWorkOpen(true)}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#202526] text-[#FFFFFF] hover:bg-[#596769] transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer font-bold text-sm sm:text-base uppercase tracking-[0.08em]"
          >
            <span>HOW WE WORK</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* HOW WE WORK Modal */}
      <AnimatePresence>
        {isHowWeWorkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHowWeWorkOpen(false)}
              className="fixed inset-0 bg-[#202526]/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#F5F2EC] text-[#202526] rounded-3xl p-6 sm:p-10 border border-[#DDDCD7] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto z-10 my-auto"
            >
              <div className="flex items-center justify-between pb-6 border-b border-[#DDDCD7] mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EDEAE4] text-[#202526] flex items-center justify-center border border-[#DDDCD7]">
                    <Workflow className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#202526]">
                      HOW WE WORK
                    </h3>
                    <p className="text-xs sm:text-sm text-[#596769]">
                      Our streamlined 5-step studio delivery pipeline
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHowWeWorkOpen(false)}
                  className="w-10 h-10 rounded-full bg-[#EDEAE4] hover:bg-[#DDDCD7] flex items-center justify-center text-[#202526] transition-colors cursor-pointer border border-[#DDDCD7]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 5-Step Pipeline Breakdown */}
              <div className="space-y-4">
                {[
                  {
                    step: '01',
                    title: 'Discovery & Creative Brief',
                    desc: 'We align on goals, target channels, visual identity, hooks, and campaign KPIs.',
                  },
                  {
                    step: '02',
                    title: 'Rapid Architecture & Scripting',
                    desc: 'Concept drafts, script variations, UI wireframes, or agent pipeline blueprints delivered within 24–48 hours.',
                  },
                  {
                    step: '03',
                    title: 'AI + High-Craft Generation',
                    desc: 'Video rendering, creator asset capture, frontend engineering, and workflow automation building in parallel.',
                  },
                  {
                    step: '04',
                    title: 'Iterative Polish & QA',
                    desc: 'Sound design, color grading, Lighthouse 95+ performance audits, and edge-case testing.',
                  },
                  {
                    step: '05',
                    title: 'Master Handover & Scale',
                    desc: 'Ad-ready exports, production deployment, and automated telemetry alerts configured for scale.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-[#EDEAE4] border border-[#DDDCD7] hover:border-[#596769] transition-colors shadow-xs"
                  >
                    <span className="text-xl sm:text-2xl font-mono font-bold text-[#596769]">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-[#202526] uppercase tracking-wide">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[#596769] mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#DDDCD7] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-mono text-[#596769] uppercase font-semibold">
                  Ready to launch your project?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsHowWeWorkOpen(false);
                    onOpenContact && onOpenContact();
                  }}
                  className="px-6 py-3 rounded-full bg-[#202526] hover:bg-[#596769] text-[#FFFFFF] font-semibold text-xs uppercase tracking-[0.08em] transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span>Start A Project</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

