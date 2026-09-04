import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Check, HeartHandshake, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { adminStore, playStudioChime } from '../services/adminStore';
import { processImageUpload } from '../utils/mediaUpload';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [comment, setComment] = useState('');
  const [avatar, setAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploadingAvatar(true);
      try {
        const optimized = await processImageUpload(e.target.files[0], 400, 400, 0.85);
        setAvatar(optimized);
      } catch {
        // Fallback
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    setTimeout(() => {
      adminStore.addReview({
        author: author || 'Verified Client',
        role: role || 'Client / Founder',
        company: company || 'Digital Studio',
        avatar,
        rating,
        comment,
        status: 'approved',
        isFeatured: false,
      });

      playStudioChime('success');
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D8A9A8', '#AFC7C5', '#202526', '#E7EBE9'],
        ticks: 180,
        gravity: 0.85,
        scalar: 0.85,
        disableForReducedMotion: true,
      });

      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setAuthor('');
        setRole('');
        setCompany('');
        setComment('');
        setRating(5);
        onClose();
      }, 2400);
    }, 400);
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
            onClick={onClose}
            className="frosted-backdrop"
          />

          {/* Modal Window with Frosted Glassmorphism and Grain */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto frosted-modal-glass rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-2xl text-[#202526] z-10 my-auto font-sans-clean"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-[#CBDCDE] hover:bg-[#AFC7C5] text-[#202526] border border-[#B8C1C0] transition-colors cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="py-10 text-center flex flex-col items-center justify-center gap-4 relative z-10"
              >
                {/* Checkmark Icon Container with Pulsing Ripple Rings */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute w-16 h-16 rounded-full bg-[#D8A9A8]/40 pointer-events-none"
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#AFC7C5] to-[#D8A9A8] p-[2px] shadow-lg relative z-10 flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full bg-[#E7EBE9] flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-[#202526]"
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
                          transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1], delay: 0.15 }}
                        />
                      </svg>
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-label-small uppercase tracking-wider text-[#202526] font-bold bg-[#CBDCDE] border border-[#AFC7C5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Review Published
                  </span>
                  <h4 className="font-elegant text-2xl uppercase tracking-tight text-[#202526]">
                    Feedback Registered
                  </h4>
                  <p className="text-xs sm:text-sm text-[#596769] max-w-sm">
                    Thank you for your feedback! Your review has been recorded and registered in our public showcase.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-[0.08em] text-[#202526] font-bold bg-[#CBDCDE] border border-[#AFC7C5] mb-2 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" /> Client Feedback
                  </span>
                  <h3 className="hero-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#202526]">
                    Rate Your Experience
                  </h3>
                  <p className="text-xs sm:text-sm text-[#596769] mt-1 font-normal">
                    Share your experience working with AI Build (ai.build_).
                  </p>
                </div>

                {/* Star Rating Selector */}
                <div className="p-4 rounded-2xl bg-[#CBDCDE] border border-[#AFC7C5] flex flex-col items-center justify-center gap-2">
                  <div className="text-xs uppercase tracking-wider text-[#596769] font-bold">
                    Overall Satisfaction
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(star)}
                        className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating ?? rating)
                              ? 'fill-[#202526] text-[#202526]'
                              : 'text-[#AFC7C5]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-mono text-[#202526] font-bold">
                    {rating === 5 && '★★★★★ Exceptional (5 / 5)'}
                    {rating === 4 && '★★★★☆ Great Experience (4 / 5)'}
                    {rating === 3 && '★★★☆☆ Good (3 / 5)'}
                    {rating === 2 && '★★☆☆☆ Needs Improvement (2 / 5)'}
                    {rating === 1 && '★☆☆☆☆ Poor (1 / 5)'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alexandre Renard"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-3.5 py-2 text-sm text-[#202526] placeholder:text-[#596769]/60 focus:outline-none focus:border-[#202526]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1">
                      Role &amp; Company
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Founder @ HyperQuant"
                      value={company ? `${role ? role + ' @ ' : ''}${company}` : role}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes('@')) {
                          const [r, c] = val.split('@');
                          setRole(r.trim());
                          setCompany(c.trim());
                        } else {
                          setRole(val);
                          setCompany('');
                        }
                      }}
                      className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-3.5 py-2 text-sm text-[#202526] placeholder:text-[#596769]/60 focus:outline-none focus:border-[#202526]"
                    />
                  </div>
                </div>

                {/* Avatar Photo Upload */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#CBDCDE] border border-[#AFC7C5]">
                  <div className="flex items-center gap-3">
                    {avatar && avatar.trim() ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-[#B8C1C0]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#AFC7C5] border border-[#B8C1C0] flex items-center justify-center text-xs font-semibold text-[#202526]">
                        {author ? author.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-[#202526]">Your Avatar Photo</div>
                      <div className="text-[10px] text-[#596769]">Upload picture from your device</div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-3 py-1.5 rounded-xl bg-[#E7EBE9] hover:bg-[#AFC7C5] text-[#202526] border border-[#B8C1C0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#596769]" />
                    {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#596769] mb-1">
                    Your Review &amp; Feedback
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us what you loved about our AI creative, visual direction, and turnaround speed..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-[#E7EBE9] border border-[#B8C1C0] rounded-xl px-3.5 py-2 text-sm text-[#202526] placeholder:text-[#596769]/60 resize-none focus:outline-none focus:border-[#202526]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-full border border-[#B8C1C0] text-xs uppercase font-semibold text-[#596769] hover:text-[#202526] hover:bg-[#CBDCDE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2.5 rounded-full bg-[#202526] hover:bg-[#596769] text-[#E7EBE9] text-xs font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5 shadow-md transition-all ${
                      isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <HeartHandshake className="w-4 h-4" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

