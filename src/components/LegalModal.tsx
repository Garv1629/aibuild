import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { playStudioChime } from '../services/adminStore';

export type LegalTab = 'privacy' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Handle body scroll locking & Escape key hygiene
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="frosted-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-3xl max-h-[88dvh] overflow-y-auto frosted-modal-glass rounded-[28px] sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl text-[#202526] z-10 font-body"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close legal modal"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-[#CBDCDE] hover:bg-[#AFC7C5] text-[#202526] border border-[#B8C1C0] transition-colors cursor-pointer z-20 focus-visible:outline-2 focus-visible:outline-[#202526]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Header with Segmented Tabs */}
            <div className="mb-6 border-b border-[#E5E7EB] pb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-[0.08em] text-[#202526] font-bold bg-[#CBDCDE] border border-[#AFC7C5] inline-flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" /> Legal &amp; Transparency
                </span>
              </div>
              <h3
                id="legal-modal-title"
                className="font-heading font-normal uppercase tracking-tight text-2xl sm:text-3xl text-[#202526]"
              >
                {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <p className="text-xs sm:text-sm text-[#596769] mt-1 font-body font-normal">
                Last updated: October 2026 &bull; AI Build Studio (ai.build_)
              </p>

              {/* Segmented Switcher */}
              <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] max-w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('privacy');
                    playStudioChime('click');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'privacy'
                      ? 'bg-white text-[#202526] shadow-xs'
                      : 'text-[#596769] hover:text-[#202526]'
                  }`}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('terms');
                    playStudioChime('click');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'terms'
                      ? 'bg-white text-[#202526] shadow-xs'
                      : 'text-[#596769] hover:text-[#202526]'
                  }`}
                >
                  Terms &amp; Conditions
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-6 text-xs sm:text-sm text-[#596769] font-normal leading-relaxed">
              {activeTab === 'privacy' ? (
                <>
                  <section className="space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#202526] uppercase font-mono flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D8A9A8]" />
                      1. Information We Collect
                    </h4>
                    <p>
                      AI Build collects information strictly provided voluntarily by prospective clients and partners when submitting project briefs, testimonials, or requesting scope estimates. This data may include your name, email address, company name, project specifications, and estimated budget ranges.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#202526] uppercase font-mono flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D8A9A8]" />
                      2. How We Use &amp; Protect Your Data
                    </h4>
                    <p>
                      Your information is used exclusively to review project requirements, provide formal cost estimates, and communicate directly regarding bespoke creative and technical deliverables. Data is transmitted securely over TLS/HTTPS encryption and stored in authenticated, access-controlled databases. We do not sell, rent, or lease client data to third parties.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#202526] uppercase font-mono flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#D8A9A8]" />
                      3. Cookies &amp; Third-Party Tracking
                    </h4>
                    <p>
                      This website operates with a zero-commercial-tracker architecture. We do not deploy third-party advertising pixels (such as Meta Pixel or TikTok Tracker) or cross-site fingerprinting cookies. Storage tokens are utilized solely for essential functional operations, including active session validation and rate-limiting security.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#202526] uppercase font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D8A9A8]" />
                      4. Data Subject Rights &amp; Contact
                    </h4>
                    <p>
                      You may request the review, update, or complete deletion of your submitted project inquiries or testimonial records at any time by contacting our studio team at <span className="font-semibold text-[#202526]">hello@aibuild.studio</span>.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#202526] uppercase font-mono flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#D8A9A8]" />
                      1. Creative &amp; Engineering Services
                    </h4>
                    <p>
                      AI Build provides custom digital product design, UGC advertising campaigns, cinematic AI video production, full-stack web applications, and autonomous workflow engineering. All project milestones, deliverables, timelines, and payment structures are formalized through separate Master Services Agreements (MSA) or Statements of Work (SOW).
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#202526] uppercase font-mono flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D8A9A8]" />
                      2. Intellectual Property Rights
                    </h4>
                    <p>
                      Unless otherwise agreed in an active client contract, all preliminary website concepts, 3D interactive assets, proprietary character animations, and branding remain the intellectual property of AI Build Studio. Upon final payment for contracted client deliverables, full commercial rights to custom creative assets are transferred to the client.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#202526] uppercase font-mono flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#D8A9A8]" />
                      3. Scope Estimator &amp; Proposal Disclaimers
                    </h4>
                    <p>
                      Estimates generated via the interactive Cost Estimator are non-binding budgetary guidelines intended to assist planning. Formal project pricing and binding delivery timelines are established exclusively in written proposals following technical discovery.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#202526] uppercase font-mono flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D8A9A8]" />
                      4. Limitation of Liability
                    </h4>
                    <p>
                      While we strive for 100% uptime and state-of-the-art interactive performance, this website is provided on an &quot;as is&quot; basis without warranties of uninterrupted availability. Inquiries can be addressed to <span className="font-semibold text-[#202526]">hello@aibuild.studio</span>.
                    </p>
                  </section>
                </>
              )}
            </div>

            {/* Footer notice */}
            <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
              <span>AI Build Digital Product Studio</span>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary !px-5 !py-2 text-xs uppercase"
              >
                Close Window
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
