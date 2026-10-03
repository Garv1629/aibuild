import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import { Star, Plus, Award } from 'lucide-react';
import { PublicReview } from '../types';
import { ReviewModal } from './ReviewModal';

interface ReviewsSectionProps {
  reviews: PublicReview[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const count = approvedReviews.length;
  const avg =
    count > 0
      ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 5.0;

  return (
    <section
      id="reviews"
      className="relative w-full bg-transparent text-[#202526] rounded-t-3xl -mt-10 sm:-mt-12 md:-mt-14 z-20 px-4 sm:px-8 md:px-12 pt-14 sm:pt-28 md:pt-32 pb-16 sm:pb-32 font-body"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with Title & Overall Rating Badge */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8 sm:mb-12 border-b border-[#E5E7EB] pb-6 sm:pb-8">
          <div>
            <FadeIn delay={0} y={20}>
              <div className="px-3.5 py-1.5 rounded-full text-xs font-label-small uppercase tracking-[0.08em] text-[#202526] font-medium bg-white/90 border border-[#E5E7EB] inline-flex items-center gap-2 mb-3 sm:mb-4 shadow-xs backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
                Verified Client Testimonials
              </div>
            </FadeIn>

            <FadeIn delay={0.1} y={30}>
              <h2 className="font-heading font-normal leading-tight tracking-[-0.02em] text-[#202526] text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                Reviews &amp; Ratings
              </h2>
            </FadeIn>
          </div>

          {/* Right Rating Metric Card & Write Review Button */}
          <FadeIn delay={0.2} y={30} className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-[#E5E7EB] flex items-center justify-between sm:justify-start gap-3 sm:gap-4 shadow-xs backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-[#202526]">{avg}</div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-0.5 text-[#596769]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${
                        s <= Math.round(avg) ? 'fill-[#596769] text-[#596769]' : 'text-[#E5E7EB]'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs uppercase font-mono text-[#596769] tracking-[0.08em] font-medium">
                  {count} Verified Reviews
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="btn-primary min-h-[44px] justify-center"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Write a Review</span>
            </button>
          </FadeIn>
        </div>

        {/* Reviews Masonry / Responsive Balanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
          {approvedReviews.map((rev, index) => {
            const isFiveCardLayout = approvedReviews.length === 5;
            const colSpanClass = isFiveCardLayout
              ? index === 3
                ? 'lg:col-span-2 lg:col-start-2'
                : index === 4
                ? 'lg:col-span-2 md:col-span-2 md:max-w-md md:mx-auto lg:max-w-none w-full'
                : 'lg:col-span-2'
              : 'lg:col-span-2';

            return (
              <FadeIn key={rev.id} delay={0.1 + index * 0.08} y={30} className={colSpanClass}>
                <div className="h-full glass-panel glass-panel-hover rounded-2xl p-4 sm:p-7 flex flex-col justify-between group hover:-translate-y-1">
                  <div>
                    {/* Top Row: Stars and Featured Badge */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1 text-[#202526]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${
                              s <= rev.rating ? 'fill-[#202526] text-[#202526]' : 'text-[#E5E7EB]'
                            }`}
                          />
                        ))}
                      </div>
                      {rev.isFeatured && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-[#202526] glass-pill flex items-center gap-1 shadow-xs">
                          <Award className="w-3 h-3 text-[#D8A9A8]" /> Featured
                        </span>
                      )}
                    </div>

                    {/* Comment Quote */}
                    <p className="text-xs xs:text-sm sm:text-base text-[#202526] font-body font-normal leading-relaxed mb-4 sm:mb-6">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  {/* Author Info Card */}
                  <div className="pt-3 sm:pt-4 border-t border-white/80 flex items-center gap-2.5 sm:gap-3">
                    {rev.avatar && rev.avatar.trim() ? (
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        width={40}
                        height={40}
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-white shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#CBDCDE] border border-white shadow-xs flex items-center justify-center text-xs font-bold text-[#202526]">
                        {rev.author ? rev.author.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <p className="text-xs sm:text-sm font-heading font-normal text-[#202526] tracking-wide">
                        {rev.author}
                      </p>
                      <p className="text-xs sm:text-sm text-[#596769] font-body font-normal">
                        {rev.role} &bull; <span className="text-[#202526] font-bold">{rev.company}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </section>
  );
};

