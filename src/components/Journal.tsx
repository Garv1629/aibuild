/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { JournalEntry } from '../utils/portfolio.ts';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Button, buttonVariants } from './Button.tsx';

interface JournalProps {
  onSelectArticle: (entry: JournalEntry) => void;
  onViewAllThoughts: () => void;
}

export const Journal: React.FC<JournalProps> = ({
  onSelectArticle,
  onViewAllThoughts,
}) => {
  const { data } = usePortfolio();
  const isInsideAdminPreview = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const journalEntries = (data.journalEntries || [])
    .filter((j) => isInsideAdminPreview || j.isPublished !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return (
    <section id="journal" className="relative z-10 py-12 sm:py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        {/* Header pattern: eyebrow + "Recent thoughts" + subtext + "View all" button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 sm:gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="w-8 h-px bg-stroke" aria-hidden="true" />
              <span className="text-xs text-muted uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium font-mono">
                {data.siteTexts?.journalEyebrow || 'Journal & Insights'}
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-5xl text-text-primary tracking-tight font-normal">
              {data.siteTexts?.journalHeading || 'Recent'}{' '}
              <span className="font-display italic">{data.siteTexts?.journalHeadingItalic || 'thoughts'}</span>
            </h2>

            <p className="text-sm sm:text-base text-muted max-w-lg mt-1.5 sm:mt-3 leading-relaxed">
              {data.siteTexts?.journalSubtext ||
                'Articles and strategic breakdowns covering Web Development, AI Videos, viral UGC Videos, and digital E-book publishing.'}
            </p>
          </div>

          <div className="hidden md:inline-flex shrink-0">
            <Button
              variant="glass"
              size="sm"
              onClick={onViewAllThoughts}
              className="uppercase tracking-wider group"
            >
              <span>{data.siteTexts?.journalButtonText || 'View all'}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Button>
          </div>
        </motion.div>

        {/* journal entries displayed as Apple Liquid Glass horizontal pills */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {journalEntries.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{
                duration: 0.6,
                delay: idx * 0.08,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onClick={() => onSelectArticle(entry)}
              tabIndex={0}
              role="button"
              aria-label={`Read article: ${entry.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectArticle(entry);
                }
              }}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 p-3 xs:p-3.5 sm:p-4 sm:pr-8 liquid-glass liquid-glass-gloss rounded-2xl sm:rounded-full transition-all duration-300 cursor-pointer hover:border-white/30 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.45)] hover:scale-[1.01]"
            >
              {/* Left side: Thumbnail + Title */}
              <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover:border-white/40 transition-colors">
                  <img
                    src={entry.image}
                    alt={entry.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-2xs text-accent uppercase tracking-[0.2em] font-mono sm:hidden mb-1">
                    {entry.category} • {entry.date}
                  </span>
                  <h3 className="text-sm sm:text-lg md:text-xl text-text-primary font-medium tracking-tight line-clamp-2 sm:line-clamp-1 group-hover:text-white transition-colors">
                    {entry.title}
                  </h3>
                </div>
              </div>

              {/* Right side: Read time + Date + Arrow */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 pt-1 sm:pt-0 border-t border-white/10 sm:border-0">
                <div className="flex sm:flex items-center gap-3 sm:gap-4 text-xs font-mono text-muted">
                  <span className="liquid-glass-pill px-3 py-1 rounded-full text-secondary">
                    {entry.readTime}
                  </span>
                  <span className="hidden sm:inline text-muted group-hover:text-white transition-colors">{entry.date}</span>
                </div>

                <div className={buttonVariants({ variant: 'icon', size: 'sm', className: 'text-white shadow-md' })}>
                  <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="flex md:hidden justify-center mt-8">
          <Button
            variant="glass"
            size="md"
            onClick={onViewAllThoughts}
            className="uppercase tracking-wider"
          >
            <span>View all thoughts</span>
            <span>→</span>
          </Button>
        </div>
      </div>
    </section>
  );
};
