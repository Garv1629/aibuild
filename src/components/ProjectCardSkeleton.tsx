import React from 'react';

interface ProjectCardSkeletonProps {
  index?: number;
  totalCards?: number;
}

export const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({
  index = 0,
}) => {
  return (
    <div
      style={{
        top: `calc(5rem + ${index * 20}px)`,
        zIndex: 10 + index,
      }}
      className="sticky w-full max-w-6xl mx-auto min-h-[540px] sm:min-h-[580px] md:min-h-[620px] flex items-center justify-center p-0 mb-16 sm:mb-24 md:mb-32"
    >
      <div
        className="w-full h-full rounded-[28px] sm:rounded-[40px] md:rounded-[48px] border border-[#E5E7EB] bg-white p-5 sm:p-7 md:p-9 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden"
      >
        {/* Top Header Row Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-[#E5E7EB] relative z-10">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Number placeholder */}
            <div className="shimmer-effect w-14 sm:w-20 h-10 sm:h-14 rounded-2xl bg-[#E5E7EB]" />

            {/* Category & Title placeholders */}
            <div className="flex flex-col gap-2">
              <div className="shimmer-effect w-28 h-5 rounded-full bg-[#E5E7EB] flex items-center px-3 gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
              </div>
              <div className="shimmer-effect w-40 sm:w-64 h-6 sm:h-8 rounded-xl bg-[#E5E7EB]" />
            </div>
          </div>

          {/* Button placeholder */}
          <div className="shimmer-effect w-28 sm:w-32 h-10 rounded-full bg-[#E5E7EB]" />
        </div>

        {/* Bottom Two-Column Image Grid Skeleton */}
        <div className="pt-4 sm:pt-6 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-5 items-stretch relative z-10 flex-1 min-h-0">
          {/* Left Column (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3 sm:gap-4 h-full">
            <div
              className="shimmer-effect w-full flex-1 rounded-[20px] sm:rounded-[28px] md:rounded-[36px] bg-[#E5E7EB] relative min-h-[100px] sm:min-h-[140px]"
            ></div>
            <div
              className="shimmer-effect w-full flex-1 rounded-[20px] sm:rounded-[28px] md:rounded-[36px] bg-[#E5E7EB] relative min-h-[120px] sm:min-h-[160px]"
            ></div>
          </div>

          {/* Right Column (7 cols) */}
          <div className="md:col-span-7 h-full flex min-h-[180px] sm:min-h-[260px]">
            <div className="shimmer-effect w-full h-full rounded-[20px] sm:rounded-[28px] md:rounded-[36px] bg-[#E5E7EB] relative" />
          </div>
        </div>
      </div>
    </div>
  );
};


