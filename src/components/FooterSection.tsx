import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FadeIn } from './FadeIn';
import { Magnet } from './Magnet';
import {
  ArrowUpRight,
  ArrowUp,
  Mail,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { WebsiteContent } from '../types';
import { playStudioChime } from '../services/adminStore';
import { useSmoothScroll } from './SmoothScrollProvider';

interface FooterSectionProps {
  contactContent?: WebsiteContent['contact'];
  onOpenContact?: (serviceType?: string) => void;
  onOpenPrice?: () => void;
  onOpenEstimator?: () => void;
  onSecretAdminTrigger?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  contactContent,
  onOpenContact,
  onOpenPrice,
  onOpenEstimator,
  onSecretAdminTrigger,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const email = contactContent?.email || 'hello@aibuild.studio';
  const statusBadge = contactContent?.statusBadge || 'Studio Accepting Q3/Q4 Projects';
  const ctaHeadline = contactContent?.ctaHeadline || "Let's Build";
  const ctaSubtext =
    contactContent?.ctaSubtext ||
    'Have an AI product, bespoke web experience, or automated system to engineer? Let’s talk.';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' UTC'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(email);
      }
      setCopiedEmail(true);
      playStudioChime('success');
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Fallback
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const { scrollTo } = useSmoothScroll();

  const scrollToTop = () => {
    scrollTo(0, { duration: 1.6 });
  };

  return (
    <footer
      id="contact"
      className="relative w-full bg-transparent text-[#202526] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 pt-14 sm:pt-28 md:pt-36 pb-12 sm:pb-16 px-4 sm:px-8 md:px-12 font-sans-clean overflow-hidden border-t border-[#E5E7EB]"
    >
      {/* Background Decorative Lighting Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#D8A9A8]/15 blur-[150px]" />
        <div className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#CBDCDE]/20 blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Massive CTA Area */}
        <div className="mb-14 sm:mb-28 border-b border-[#E5E7EB] pb-12 sm:pb-24">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 sm:gap-14">
            <div className="space-y-4 sm:space-y-6 max-w-2xl">
              <FadeIn delay={0} y={20}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-label-small uppercase tracking-[0.08em] text-[#202526] font-medium bg-white/90 border border-[#E5E7EB] shadow-xs backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D8A9A8] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D8A9A8]" />
                  </span>
                  <span>{statusBadge}</span>
                </div>
              </FadeIn>

              <FadeIn delay={0.1} y={30}>
                <h2 className="font-elegant font-normal uppercase tracking-[-0.02em] text-[#202526] leading-[0.98] text-2xl xs:text-4xl sm:text-6xl md:text-8xl lg:text-[110px] max-w-full break-words">
                  {ctaHeadline}
                </h2>
              </FadeIn>

              <FadeIn delay={0.2} y={20}>
                <p className="text-xs xs:text-sm sm:text-lg md:text-xl text-[#596769] font-sans-clean font-normal leading-relaxed">
                  {ctaSubtext}
                </p>
              </FadeIn>
            </div>

            {/* Right Action Trigger Buttons */}
            <FadeIn delay={0.25} y={30} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
              <Magnet strength={15}>
                <button
                  type="button"
                  onClick={() => onOpenContact && onOpenContact('01 - UGC ADS')}
                  className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-5 rounded-full bg-[#202526] hover:bg-[#111314] text-[#FFFFFF] font-btn font-medium text-xs sm:text-base uppercase tracking-[0.08em] flex items-center justify-center gap-2.5 shadow-[0_10px_30px_rgba(32,37,38,0.2)] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
              </Magnet>

              {onOpenEstimator && (
                <button
                  type="button"
                  onClick={onOpenEstimator}
                  className="w-full sm:w-auto px-5 py-3.5 sm:px-6 sm:py-5 rounded-full bg-[#D8A9A8] hover:bg-[#E2BEBD] text-[#202526] font-btn font-bold text-xs sm:text-base uppercase tracking-[0.08em] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#202526]" />
                  <span>Cost Estimator</span>
                </button>
              )}

              {onOpenPrice && (
                <button
                  type="button"
                  onClick={onOpenPrice}
                  className="w-full sm:w-auto px-5 py-3.5 sm:px-6 sm:py-5 rounded-full glass-pill hover:bg-white text-[#202526] font-btn font-medium text-xs sm:text-base uppercase tracking-[0.08em] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                >
                  <span>Pricing &amp; Plans</span>
                </button>
              )}
            </FadeIn>
          </div>

          {/* Interactive Direct Email Pill & Copy Button */}
          <FadeIn delay={0.3} y={25} className="mt-8 sm:mt-16">
            <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 p-1.5 sm:p-2.5 rounded-2xl sm:rounded-full glass-pill shadow-lg max-w-full overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-base font-strong text-[#202526]">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#596769]" />
                <span className="select-all tracking-tight font-normal">{email}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#202526] hover:bg-[#111314] text-[#FFFFFF] text-[11px] sm:text-xs font-btn font-medium uppercase tracking-[0.08em] flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#AFC7C5]" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Middle Navigation & Disciplines Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-10 md:gap-12 mb-16 sm:mb-20">
          {/* Col 1: Studio Info */}
          <FadeIn delay={0.1} y={20} className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-[#D8A9A8] shadow-[0_0_12px_rgba(216,169,168,0.7)] shrink-0" />
              <h3 className="font-bezoria text-2xl sm:text-3xl uppercase tracking-wider text-[#202526] font-normal">
                ai.build_
              </h3>
            </div>
            <p className="text-[#596769] text-sm sm:text-[15px] leading-relaxed font-sans-clean font-normal max-w-sm">
              AI-first design, engineering &amp; autonomous workflow studio crafting digital products worldwide.
            </p>
            <div className="pt-2 flex items-center gap-2.5 text-xs sm:text-sm font-strong text-[#596769]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Engine: {currentTime}</span>
            </div>
          </FadeIn>

          {/* Col 2: Navigation Links */}
          <FadeIn delay={0.15} y={20} className="space-y-4">
            <h4 className="font-label-small font-semibold text-xs sm:text-sm uppercase tracking-[0.18em] text-[#202526]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm sm:text-base font-sans-clean font-normal text-[#596769]">
              {[
                { id: 'hero', num: '01', label: 'Overview / Hero' },
                { id: 'about', num: '02', label: 'Studio Mission' },
                { id: 'services', num: '03', label: 'Services & What We Do' },
                { id: 'projects', num: '04', label: 'Selected Projects' },
                { id: 'reviews', num: '05', label: 'Client Reviews' },
              ].map((item) => (
                <li key={item.id}>
                  <motion.button
                    type="button"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      playStudioChime('click');
                      const el = document.getElementById(item.id);
                      if (el) {
                        scrollTo(el, { duration: 1.4, offset: -20 });
                      }
                    }}
                    className="w-full text-left py-1.5 px-2 -ml-2 rounded-xl hover:bg-white/80 hover:text-[#202526] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-[#E7EBE9] group-hover:bg-[#202526] group-hover:text-[#E7EBE9] text-[#596769] font-mono text-[11px] font-semibold flex items-center justify-center transition-all duration-200 shadow-2xs">
                        {item.num}
                      </span>
                      <span className="group-hover:translate-x-0.5 transition-transform text-[#596769] group-hover:text-[#202526]">
                        {item.label}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#D8A9A8]" />
                  </motion.button>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Col 3: Disciplines Quick Inquiry */}
          <FadeIn delay={0.2} y={20} className="space-y-4">
            <h4 className="font-label-small font-semibold text-xs sm:text-sm uppercase tracking-[0.18em] text-[#202526]">
              Disciplines
            </h4>
            <ul className="space-y-2 text-sm sm:text-base font-sans-clean font-normal text-[#596769]">
              {[
                { type: '01 - UGC ADS', num: '01', label: 'UGC Ads & Social Creatives' },
                { type: '02 - AI VIDEOS', num: '02', label: 'AI Video & Cinema' },
                { type: '03 - WEBSITE BUILDING', num: '03', label: 'Website Building & Apps' },
                { type: '04 - AUTOMATIONS', num: '04', label: 'Intelligent Automations' },
              ].map((item) => (
                <li key={item.type}>
                  <motion.button
                    type="button"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playStudioChime('click');
                      if (onOpenContact) {
                        onOpenContact(item.type);
                      }
                    }}
                    className="w-full text-left py-1.5 px-2 -ml-2 rounded-xl hover:bg-white/80 hover:text-[#202526] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-[#E7EBE9] group-hover:bg-[#D8A9A8] group-hover:text-[#202526] text-[#596769] font-mono text-[11px] font-semibold flex items-center justify-center transition-all duration-200 shadow-2xs">
                        {item.num}
                      </span>
                      <span className="group-hover:translate-x-0.5 transition-transform text-[#596769] group-hover:text-[#202526]">
                        {item.label}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#D8A9A8]" />
                  </motion.button>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Col 4: Platform Security */}
          <FadeIn delay={0.25} y={20} className="space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="font-label-small font-semibold text-xs sm:text-sm uppercase tracking-[0.18em] text-[#202526] mb-3.5">
                Security &amp; Studio
              </h4>
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-[#E5E7EB] space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-label-small font-semibold text-[#202526]">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#D8A9A8]" />
                  <span>Production Verified</span>
                </div>
                <p className="text-xs sm:text-sm text-[#596769] leading-relaxed font-sans-clean font-normal">
                  Zero-latency edge CDN with real-time CMS synchronization.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Bottom Bar with Copyright & Back to Top */}
        <div className="pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-label-small font-medium text-[#71717A]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} AI BUILD STUDIO. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 text-xs font-label-small uppercase tracking-[0.08em] text-[#596769] hover:text-[#202526] transition-colors cursor-pointer group"
            >
              <span>Back to Top</span>
              <div className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center group-hover:-translate-y-1 transition-transform shadow-xs">
                <ArrowUp className="w-3.5 h-3.5 text-[#202526]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
