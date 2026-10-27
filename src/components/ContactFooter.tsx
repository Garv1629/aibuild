/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Hls from 'hls.js';
import { ArrowUpRight, Github, Sliders } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';

interface ContactFooterProps {
  onStartConversation: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  onStartConversation,
}) => {
  const { data, setIsAdminOpen } = usePortfolio();
  const brandName = data.brandName;
  const brandTagline = data.brandTagline;
  const githubUrl = data.githubUrl;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  // Background HLS video flipped vertically with IntersectionObserver to avoid background CPU load
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsSource =
      'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        capLevelToPlayerSize: true,
        maxBufferLength: 4,
      });
      hls.loadSource(hlsSource);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Paused initially until observed in viewport
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSource;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  // GSAP Marquee: "BUILD SMARTER • CREATE FASTER • THINK BEYOND • "
  useEffect(() => {
    if (!marqueeRef.current) return;
    const activeGsap = (typeof window !== 'undefined' && (window as any).gsap) || gsap;
    if (!activeGsap || !activeGsap.to) return;

    try {
      const anim = activeGsap.to(marqueeRef.current, {
        xPercent: -50,
        duration: 35,
        ease: 'none',
        repeat: -1,
      });

      return () => {
        anim?.kill?.();
      };
    } catch (e) {
      console.warn('Marquee GSAP animation error:', e);
    }
  }, []);

  const marqueeItem = data.siteTexts?.marqueeText || 'BUILD SMARTER • CREATE FASTER • THINK BEYOND • ';
  const marqueeText = Array(8).fill(marqueeItem).join('');

  return (
    <footer
      id="contact"
      className="relative bg-bg pt-12 sm:pt-20 md:pt-24 pb-[max(2rem,env(safe-area-inset-bottom,0px)+1.5rem)] sm:pb-12 overflow-hidden border-t border-stroke/70"
    >
      {/* Background Video: Flipped vertically */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 absolute scale-y-[-1] opacity-35"
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 flex flex-col items-center">
        {/* GSAP Marquee Banner */}
        <div className="w-full overflow-hidden mb-10 sm:mb-16 md:mb-20 py-2.5 sm:py-4 border-t border-b border-stroke/70 select-none">
          <div
            ref={marqueeRef}
            className="flex whitespace-nowrap text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.25em] sm:tracking-[0.35em] text-muted/70 uppercase"
          >
            <span className="shrink-0">{marqueeText}</span>
            <span className="shrink-0">{marqueeText}</span>
          </div>
        </div>

        {/* Centered Contact Box - Apple Liquid Glass Floating Card */}
        <div className="relative max-w-3xl w-full mx-auto mb-12 sm:mb-16 md:mb-20">
          {/* Ambient Liquid Glow Behind Card */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[280px] xs:w-[420px] sm:w-[550px] h-[240px] sm:h-[340px] rounded-full bg-gradient-to-r from-cyan-400/35 via-blue-600/30 to-indigo-500/35 blur-3xl pointer-events-none -z-10" />

          <div className="liquid-glass-card liquid-glass-gloss liquid-sheen-shine p-5 xs:p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-4xl text-center flex flex-col items-center w-full">
            <span className="liquid-glass-pill text-[10px] sm:text-xs text-muted uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium font-mono px-3.5 py-1 rounded-full mb-3.5 sm:mb-5">
              {data.siteTexts?.contactCardEyebrow || 'Connect With AI Build'}
            </span>

            <h2 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-display text-text-primary tracking-tight mb-3 sm:mb-6">
              {data.siteTexts?.contactCardHeading || 'Have an Idea?'} <br />
              <span className="font-display italic bg-gradient-to-r from-sky-200 via-white to-blue-300 bg-clip-text text-transparent">
                {data.siteTexts?.contactCardHeadingItalic || "Let's Build It."}
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-muted max-w-lg mx-auto mb-5 sm:mb-8 leading-relaxed px-1 sm:px-0">
              {data.siteTexts?.contactCardSubtext ||
                "Looking for high-performance Web Development, cinematic AI Videos, authentic viral UGC Videos, or publication-ready E-books? Let's build something exceptional together."}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto">
              {/* Start a Conversation button */}
              <button
                type="button"
                onClick={onStartConversation}
                className="w-full sm:w-auto liquid-glass-button text-xs sm:text-sm font-medium px-6 sm:px-9 py-3 sm:py-4 rounded-full text-white flex items-center justify-center gap-2 sm:gap-3 cursor-pointer group"
              >
                <span>{data.siteTexts?.contactCtaText || 'Start a Conversation'}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              {/* GitHub button (strictly verified link) */}
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto liquid-glass-pill text-xs sm:text-sm font-medium px-5 sm:px-6 py-3 sm:py-4 rounded-full text-muted hover:text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-white/30"
                aria-label={`View ${brandName} GitHub repository`}
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="w-full pt-8 sm:pt-10 border-t border-stroke/70 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span className="text-xs sm:text-sm font-medium text-text-primary tracking-tight">
              {brandName} — {data.siteTexts?.footerTagline || brandTagline}
            </span>
            <p className="text-[11px] sm:text-xs text-muted max-w-md">
              {data.siteTexts?.footerSubtext ||
                'Specializing in Web Development • AI Videos • UGC Videos • E-books. Concepts transformed into reality.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono text-muted/80">
            <div className="liquid-glass-pill flex items-center gap-2 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{data.siteTexts?.footerStatusBadge || 'Accepting New Inquiries'}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-white/5"
              title="Open Admin Studio"
            >
              <Sliders className="w-3 h-3" />
              <span>Admin Studio</span>
            </button>

            <span>{data.siteTexts?.footerCopyright || `© ${brandName}. All rights reserved.`}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
