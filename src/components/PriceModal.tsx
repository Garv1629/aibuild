import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowUpRight } from 'lucide-react';
import { ContactButton } from './ContactButton';

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: () => void;
  onOpenEstimator?: () => void;
}

const pricingTiers = [
  {
    name: 'UGC Ads',
    number: '01',
    price: '$1,500–$5,000+',
    description: 'Social-first creative that sells. Performance-driven content native to the feed.',
    features: [
      'Product UGC & Creator-style ads',
      'Hook variations & product demonstrations',
      '9:16 vertical video & ad-ready exports',
      'Turnaround: 3–7 days',
    ],
  },
  {
    name: 'AI Videos',
    number: '02',
    price: '$3,000–$10,000+',
    popular: true,
    description: 'Cinematic visual content built with AI from concept to sound and final master.',
    features: [
      'Product films, cinematic ads & brand films',
      'Visual direction & AI generation',
      '4K/1080p in 9:16, 16:9, 1:1 formats',
      'Turnaround: 3–10 days',
    ],
  },
  {
    name: 'Websites & Automations',
    number: '03',
    price: '$5,000–$25,000+',
    description: 'Premium websites built to perform and intelligent automated systems that run the work.',
    features: [
      'Bespoke motion frontend & responsive layout',
      'Intelligent automated workflows & pipelines',
      'FastAPI / Database / Model integrations',
      'Full deployment & dedicated support',
    ],
  },
];

export const PriceModal: React.FC<PriceModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  onOpenEstimator,
}) => {
  // Handle body scroll locking & Escape key hygiene
  React.useEffect(() => {
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
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Frosted Backdrop with Noise Grain */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="frosted-backdrop"
          />

          {/* Modal Container with Frosted Glassmorphism and Grain */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-5xl max-h-[90dvh] overflow-y-auto frosted-modal-glass rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 md:p-10 shadow-2xl text-[#202526] z-10 my-auto font-sans-clean"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-[#CBDCDE] hover:bg-[#AFC7C5] text-[#202526] border border-[#B8C1C0] transition-colors cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-label-small uppercase tracking-[0.08em] text-[#202526] font-medium bg-[#CBDCDE] border border-[#AFC7C5] mb-2 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
                Transparent Studio Rates
              </div>
              <h3 className="font-elegant font-normal text-3xl sm:text-5xl uppercase tracking-tight text-[#202526] mt-1">
                Pricing &amp; Packages
              </h3>
              <p className="text-sm sm:text-base text-[#596769] mt-2 font-sans-clean font-normal">
                Tailored creative production packages designed for high-impact brand statements.
              </p>

              {onOpenEstimator && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEstimator();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#202526] hover:bg-[#343D3F] text-[#E7EBE9] text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-102"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#D8A9A8] animate-pulse" />
                    <span>Open Interactive Scope &amp; Cost Estimator</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D8A9A8]" />
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.number}
                  className={`relative rounded-3xl p-6 flex flex-col justify-between border transition-all duration-300 ${
                    tier.popular
                      ? 'bg-[#CBDCDE] border-[#596769] shadow-md'
                      : 'bg-[#CBDCDE] border-[#AFC7C5] hover:border-[#596769]'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#202526] text-[#E7EBE9] text-[10px] uppercase font-label-small tracking-[0.08em] shadow-xs">
                      Most Requested
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-strong text-xs text-[#596769]">0{tier.number}</span>
                      <span className="text-2xl font-strong text-[#202526]">{tier.price}</span>
                    </div>

                    <h4 className="font-praise font-normal text-lg uppercase tracking-wide text-[#202526] mb-2">
                      {tier.name}
                    </h4>
                    <p className="text-xs text-[#596769] leading-relaxed mb-6 font-sans-clean font-normal">
                      {tier.description}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-[#AFC7C5]/60 mb-6">
                      {tier.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#202526] font-sans-clean font-normal">
                          <Check className="w-3.5 h-3.5 text-[#596769] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onSelectPlan) onSelectPlan();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-[#B8C1C0] bg-[#E7EBE9] text-[#202526] hover:bg-[#202526] hover:text-[#E7EBE9] font-btn font-medium text-xs uppercase tracking-[0.08em] transition-all cursor-pointer shadow-xs"
                  >
                    <span>Inquire Package</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Custom quote CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#CBDCDE] border border-[#AFC7C5] relative z-10 shadow-xs">
              <div className="text-center sm:text-left">
                <h5 className="text-sm font-bold uppercase tracking-wide text-[#202526]">
                  Need a customized milestone schedule or enterprise contract?
                </h5>
                <p className="text-xs text-[#596769] mt-0.5 font-normal">
                  AI Build partners with forward-thinking startups, luxury brands, and product visionaries.
                </p>
              </div>
              <ContactButton
                label="Custom Proposal"
                onClick={() => {
                  onClose();
                  if (onSelectPlan) onSelectPlan();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

