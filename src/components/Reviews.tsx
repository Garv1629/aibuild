/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, CheckCircle2, Quote, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Review } from '../utils/portfolio.ts';

interface ReviewsProps {
  onOpenReviewModal: () => void;
}

const CATEGORIES = ['All', 'Web Development', 'AI Videos', 'UGC Videos', 'E-books'] as const;

export const Reviews: React.FC<ReviewsProps> = ({ onOpenReviewModal }) => {
  const { data } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Only show verified & approved reviews to public visitors
  const reviewsList = (data.reviews || []).filter((r) => r.status !== 'pending');

  const filteredReviews = selectedCategory === 'All'
    ? reviewsList
    : reviewsList.filter((r) => r.category === selectedCategory);

  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : '5.0';

  return (
    <section id="reviews" className="py-16 sm:py-32 px-3 xs:px-4 sm:px-6 md:px-12 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-subtle text-[11px] font-mono text-sky-400 uppercase tracking-widest mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Client Voices & Feedback</span>
            </div>
            
            <h2 className="text-2xl xs:text-3xl sm:text-5xl font-display font-light text-white tracking-tight leading-tight">
              What partners say <br />
              <span className="italic font-normal bg-gradient-to-r from-sky-400 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                about our craft.
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-muted max-w-lg leading-relaxed font-sans">
              Real reviews from founders, brands, and creators who trusted us with Web Development, AI Productions, UGC, and Publications.
            </p>
          </div>

          {/* Action & Stats Summary */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Rating pill */}
            <div className="liquid-glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10 shadow-lg">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-5 h-5 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span className="font-display font-medium text-lg text-white">{averageRating}</span>
              </div>
              <div className="h-6 w-px bg-white/15" />
              <div className="text-left font-mono text-[11px] text-muted">
                <div className="text-white font-medium">{reviewsList.length} Reviews</div>
                <div>100% Verified</div>
              </div>
            </div>

            {/* Submit Review Button */}
            <button
              type="button"
              onClick={onOpenReviewModal}
              className="liquid-glass-button rounded-2xl px-5 py-3 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.25)] min-h-[44px]"
              aria-label="Add your review"
            >
              <Plus className="w-4 h-4 text-sky-300" />
              <span>Leave a Review</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none touch-pan-x">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All'
              ? reviewsList.length
              : reviewsList.filter((r) => r.category === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-mono rounded-full px-4 py-2 sm:py-1.5 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
                  isActive
                    ? 'liquid-glass-pill-active text-white border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'liquid-glass text-muted hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-sky-500/30 text-sky-200' : 'bg-white/10 text-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="liquid-glass rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-7 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 group relative overflow-hidden shadow-xl"
              >
                {/* Subtle top corner gradient glow */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-xl pointer-events-none" />

                <div>
                  {/* Top row: stars and category tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full liquid-glass-subtle text-sky-300 border border-sky-400/20">
                      {review.category}
                    </span>
                  </div>

                  {/* Quote icon & Review Content */}
                  <div className="relative mb-6">
                    <Quote className="w-6 h-6 text-white/10 absolute -top-1 -left-2 -scale-x-100 pointer-events-none" />
                    <p className="text-sm text-text-primary/90 leading-relaxed font-sans relative z-10 pl-2">
                      "{review.content}"
                    </p>
                  </div>
                </div>

                {/* Reviewer Details Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar Initials Circle */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400/30 to-indigo-600/30 border border-white/20 flex items-center justify-center shrink-0 text-xs font-medium text-white shadow-inner">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        review.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-white truncate">
                          {review.name}
                        </span>
                        {review.verified !== false && (
                          <span title="Verified Client">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted truncate font-mono">
                        {review.role}{review.company ? ` • ${review.company}` : ''}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-muted/70 shrink-0">
                    {review.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* "Add Your Review" Interactive Invitation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onOpenReviewModal}
            className="liquid-glass-subtle rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center text-center border border-dashed border-white/20 hover:border-sky-400/50 hover:bg-white/[0.04] transition-all cursor-pointer group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full liquid-glass-pill flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-sky-400 transition-all text-sky-400 shadow-lg">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-medium text-white group-hover:text-sky-300 transition-colors">
              Worked with us?
            </h4>
            <p className="text-xs text-muted mt-1 max-w-[200px]">
              Add your review and join our verified testimonials wall.
            </p>
            <span className="mt-3 font-mono text-[11px] text-sky-400 underline underline-offset-4 opacity-80 group-hover:opacity-100">
              Submit Review →
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
