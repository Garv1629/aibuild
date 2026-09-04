import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Copy, Check, Sparkles, Send, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ContactButton } from './ContactButton';
import { adminStore, playStudioChime } from '../services/adminStore';
import { WebsiteContent } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactContent?: WebsiteContent['contact'];
  initialProjectType?: string;
  initialBudget?: string;
  initialMessage?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contactContent,
  initialProjectType,
  initialBudget,
  initialMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    projectType: string;
    budget: string;
  } | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    budget: initialBudget || '$25,000 - $50,000+',
    message: initialMessage || '',
    projectType: initialProjectType || '01 - UGC ADS',
  });

  // Handle body scroll locking & Escape key hygiene
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (sent) {
          handleResetAndClose();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, sent, onClose]);

  React.useEffect(() => {
    if (initialProjectType || initialBudget || initialMessage) {
      setFormState((prev) => ({
        ...prev,
        projectType: initialProjectType || prev.projectType,
        budget: initialBudget || prev.budget,
        message: initialMessage || prev.message,
      }));
    }
  }, [initialProjectType, initialBudget, initialMessage]);

  const email = contactContent?.email || 'hello@aibuild.studio';
  const ctaHeadline = contactContent?.ctaHeadline || "Let's Build";
  const ctaSubtext =
    contactContent?.ctaSubtext ||
    'Have an AI product, bespoke web experience, or automated system to engineer? Let\'s talk.';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    playStudioChime('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerPositiveFeedbackConfetti = () => {
    // Subtle, sophisticated studio confetti burst using brand color palette
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.55 },
      colors: ['#D8A9A8', '#AFC7C5', '#202526', '#E7EBE9', '#8EADAE'],
      ticks: 180,
      gravity: 0.85,
      scalar: 0.9,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true,
    });

    // Secondary dual micro-burst for dimensional depth
    setTimeout(() => {
      confetti({
        particleCount: 22,
        angle: 60,
        spread: 45,
        origin: { x: 0.35, y: 0.6 },
        colors: ['#D8A9A8', '#AFC7C5', '#E7EBE9'],
        ticks: 150,
        gravity: 0.9,
        scalar: 0.75,
        shapes: ['circle'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 22,
        angle: 120,
        spread: 45,
        origin: { x: 0.65, y: 0.6 },
        colors: ['#D8A9A8', '#AFC7C5', '#E7EBE9'],
        ticks: 150,
        gravity: 0.9,
        scalar: 0.75,
        shapes: ['circle'],
        disableForReducedMotion: true,
      });
    }, 120);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Store submission summary for animated success card
      setSubmittedData({
        name: formState.name || 'Client',
        projectType: formState.projectType,
        budget: formState.budget,
      });

      // Register message in real-time admin store
      adminStore.addMessage({
        name: formState.name || 'Direct Visitor',
        email: formState.email,
        company: formState.company || 'Private Client',
        projectType: formState.projectType,
        budget: formState.budget,
        message: formState.message,
      });

      // Play pleasant studio chime & trigger confetti
      playStudioChime('success');
      triggerPositiveFeedbackConfetti();

      setIsSubmitting(false);
      setSent(true);
    }, 450);
  };

  const handleResetAndClose = () => {
    setSent(false);
    setFormState({
      name: '',
      email: '',
      company: '',
      budget: '$25,000 - $50,000+',
      message: '',
      projectType: '01 - UGC ADS',
    });
    setSubmittedData(null);
    onClose();
  };

  const handleSendAnother = () => {
    setSent(false);
    setFormState({
      name: '',
      email: '',
      company: '',
      budget: '$25,000 - $50,000+',
      message: '',
      projectType: '01 - UGC ADS',
    });
    setSubmittedData(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Frosted Backdrop with Noise Grain */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={sent ? handleResetAndClose : onClose}
            className="frosted-backdrop"
          />

          {/* Modal Card with Frosted Glassmorphism and Grain */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-xl max-h-[90dvh] overflow-y-auto frosted-modal-glass rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 md:p-10 shadow-2xl text-[#202526] z-10 my-auto font-sans-clean"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={sent ? handleResetAndClose : onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-[#CBDCDE] hover:bg-[#AFC7C5] text-[#202526] border border-[#B8C1C0] transition-colors cursor-pointer z-20"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Success State with Subtle Animated Check-Mark & Positive Feedback */}
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="py-6 sm:py-8 text-center flex flex-col items-center justify-center gap-5 relative z-10"
              >
                {/* Checkmark Icon Container with Pulsing Ripple Rings */}
                <div className="relative flex items-center justify-center">
                  {/* Outer Ripple Wave 1 */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                    className="absolute w-20 h-20 rounded-full bg-[#D8A9A8]/40 pointer-events-none"
                  />
                  {/* Outer Ripple Wave 2 */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0.6 }}
                    animate={{ scale: 1.35, opacity: 0 }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: 0.4,
                      ease: 'easeOut',
                    }}
                    className="absolute w-20 h-20 rounded-full bg-[#AFC7C5]/50 pointer-events-none"
                  />

                  {/* Main Central Checkmark Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 22,
                      delay: 0.05,
                    }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#AFC7C5] to-[#D8A9A8] p-[2px] shadow-lg relative z-10 flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full bg-[#E7EBE9] flex items-center justify-center">
                      {/* Animated SVG Path Check-Mark */}
                      <svg
                        className="w-10 h-10 text-[#202526]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <motion.path
                          d="M20 6L9 17l-5-5"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{
                            duration: 0.55,
                            ease: [0.65, 0, 0.35, 1],
                            delay: 0.2,
                          }}
                        />
                      </svg>
                    </div>
                  </motion.div>
                </div>

                {/* Feedback Text & Status Tags */}
                <div className="space-y-2 max-w-md">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.35 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-label-small uppercase tracking-[0.08em] text-[#202526] font-bold bg-[#CBDCDE] border border-[#AFC7C5]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Transmission Confirmed</span>
                  </motion.div>

                  <motion.h4
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.35 }}
                    className="font-elegant text-2xl sm:text-3xl uppercase tracking-tight text-[#202526]"
                  >
                    Message Dispatched
                  </motion.h4>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.35 }}
                    className="text-xs sm:text-sm text-[#596769] leading-relaxed"
                  >
                    Thank you{submittedData?.name ? `, ${submittedData.name}` : ''}! Your brief has been routed directly to the studio directors. We will analyze your scope and respond within 24 hours.
                  </motion.p>
                </div>

                {/* Submitted Scope Overview Badge */}
                {submittedData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="w-full bg-[#CBDCDE]/60 border border-[#AFC7C5] rounded-2xl p-3 sm:p-4 text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-mono text-[#596769] block">Scope Selected</span>
                      <span className="font-semibold text-[#202526]">{submittedData.projectType}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-[#596769] block">Target Budget</span>
                      <span className="font-semibold font-mono text-[#202526]">{submittedData.budget}</span>
                    </div>
                  </motion.div>
                )}

                {/* Positive Feedback Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                  className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
                >
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-[#E7EBE9] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5 text-[#D8A9A8]" />
                    <span>Done &amp; Return to Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendAnother}
                    className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#E7EBE9] hover:bg-[#CBDCDE] text-[#596769] hover:text-[#202526] text-xs font-semibold uppercase tracking-wider border border-[#B8C1C0] transition-colors cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6 relative z-10">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-label-small uppercase tracking-[0.08em] text-[#202526] font-bold bg-[#CBDCDE] border border-[#AFC7C5] mb-2 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" /> AI Build (ai.build_)
                  </span>
                  <h3 className="hero-heading font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#202526]">
                    {ctaHeadline}
                  </h3>
                  <p className="text-sm sm:text-base text-[#596769] mt-1 font-normal">
                    {ctaSubtext}
                  </p>
                </div>

                {/* Quick Email Copy Bar */}
                <div className="flex items-center justify-between bg-[#CBDCDE] border border-[#AFC7C5] rounded-2xl p-3 sm:p-4 mb-6 relative z-10">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#596769]" />
                    </div>
                    <span className="text-xs sm:text-sm font-mono truncate text-[#202526] font-semibold">
                      {email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg bg-[#E7EBE9] hover:bg-[#AFC7C5] transition-all shrink-0 cursor-pointer text-[#202526] border border-[#B8C1C0]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#596769]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1.5">
                        Your Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Alex Mercer"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-4 py-2.5 text-sm text-[#202526] placeholder:text-[#596769]/60 focus:outline-none focus:border-[#202526] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1.5">
                        Your Email
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="alex@company.com"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-4 py-2.5 text-sm text-[#202526] placeholder:text-[#596769]/60 focus:outline-none focus:border-[#202526] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1.5">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Acme AI"
                        value={formState.company}
                        onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                        className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-4 py-2.5 text-sm text-[#202526] placeholder:text-[#596769]/60 focus:outline-none focus:border-[#202526] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1.5">
                        Target Budget
                      </label>
                      <select
                        value={formState.budget}
                        onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                        className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#202526] transition-colors"
                      >
                        <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                        <option value="$25,000 - $50,000+">$25,000 - $50,000+</option>
                        <option value="$50,000 - $100,000+">$50,000 - $100,000+</option>
                        <option value="Enterprise Custom">Enterprise Custom</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1.5">
                      Service Scope
                    </label>
                    <select
                      value={formState.projectType}
                      onChange={(e) => setFormState({ ...formState, projectType: e.target.value })}
                      className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#202526] transition-colors"
                    >
                      <option value="01 - UGC ADS">01 - UGC ADS (Social-first creative)</option>
                      <option value="02 - AI VIDEOS">02 - AI VIDEOS (Cinematic visuals built with AI)</option>
                      <option value="03 - WEBSITE BUILDING">03 - WEBSITE BUILDING (Premium websites built to perform)</option>
                      <option value="04 - AUTOMATIONS">04 - AUTOMATIONS (Intelligent systems)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1.5">
                      Project Brief
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell AI Build about your product vision, timeline, and goals..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-4 py-2.5 text-sm text-[#202526] placeholder:text-[#596769]/60 focus:outline-none focus:border-[#202526] transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <ContactButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Transmitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </ContactButton>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
