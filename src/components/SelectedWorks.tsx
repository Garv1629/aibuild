/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Project,
  PROJECT_CATEGORIES,
  ProjectCategoryFilter,
  filterProjects,
} from '../utils/portfolio.ts';
import { usePortfolio } from '../context/PortfolioContext.tsx';

interface SelectedWorksProps {
  onSelectProject: (project: Project) => void;
  onViewAllWork: () => void;
}

export const SelectedWorks: React.FC<SelectedWorksProps> = ({
  onSelectProject,
  onViewAllWork,
}) => {
  const { data } = usePortfolio();
  const projects = data.projects;
  const [activeCategory, setActiveCategory] = useState<ProjectCategoryFilter>('All');
  const filteredProjects = filterProjects(projects, activeCategory);

  return (
    <section id="work" className="relative z-10 py-10 sm:py-14 md:py-16 select-none">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        {/* Header with Framer Motion whileInView */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-4 sm:gap-6"
        >
          <div>
            {/* Eyebrow: w-8 h-px bg-stroke + "Selected Work" text-xs text-muted uppercase tracking-[0.3em] */}
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="w-8 h-px bg-stroke" aria-hidden="true" />
              <span className="text-xs text-muted uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium font-mono">
                {data.siteTexts?.worksEyebrow || 'Selected Work'}
              </span>
            </div>

            {/* Heading: "Featured projects" — italic word in font-display italic */}
            <h2 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl text-text-primary tracking-tight font-normal">
              {data.siteTexts?.worksHeading || 'Featured'}{' '}
              <span className="font-display italic">{data.siteTexts?.worksHeadingItalic || 'projects'}</span>
            </h2>

            {/* Subtext */}
            <p className="text-xs sm:text-sm md:text-base text-muted max-w-lg mt-1.5 sm:mt-3 leading-relaxed">
              {data.siteTexts?.worksSubtext ||
                'Explore featured projects across Web Development, AI Videos, UGC Videos, and E-books developed through modern workflows and generative pipelines.'}
            </p>
          </div>
        </motion.div>

        {/* Category Filter Pills: Apple Liquid Glass Dock */}
        <div className="flex justify-start md:justify-center mb-6 sm:mb-10 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="liquid-glass liquid-glass-gloss rounded-full p-1 sm:p-1.5 flex items-center gap-1 sm:gap-1.5 shadow-2xl relative shrink-0"
          >
            {PROJECT_CATEGORIES.map((category) => {
              const count = filterProjects(projects, category).length;
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`group relative rounded-full text-xs font-mono px-3.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 select-none ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFilterPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500/40 via-blue-600/30 to-sky-500/40 border border-sky-300/60 shadow-[0_0_16px_rgba(56,189,248,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.6)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                  <span
                    className={`relative z-10 text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                      isActive
                        ? 'bg-sky-400/30 text-sky-100 border border-sky-300/40'
                        : 'bg-white/10 text-white/70 group-hover:bg-white/15 group-hover:text-white'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento Grid: 12-column grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => {
              const colSpanClass =
                activeCategory === 'All'
                  ? project.span === 7
                    ? 'md:col-span-7'
                    : 'md:col-span-5'
                  : filteredProjects.length === 1
                  ? 'md:col-span-12'
                  : 'md:col-span-6';

              return (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.45,
                    delay: (idx % 2) * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -6,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }}
                  onClick={() => onSelectProject(project)}
                  className={`group relative liquid-glass-card rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer min-h-[280px] xs:min-h-[320px] sm:min-h-[380px] md:min-h-[460px] flex flex-col justify-end p-3.5 xs:p-5 sm:p-6 md:p-8 ${colSpanClass}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`View project details for ${project.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectProject(project);
                    }
                  }}
                >
                {/* Background image with object-cover group-hover:scale-105 */}
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Halftone overlay */}
                <div
                  className="halftone-overlay absolute inset-0 opacity-15 mix-blend-multiply pointer-events-none"
                  aria-hidden="true"
                />

                {/* Base subtle dark gradient vignette */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition-opacity duration-300 md:group-hover:opacity-30 pointer-events-none"
                  aria-hidden="true"
                />

                {/* Liquid Glass Status pill in top left */}
                <div className="absolute top-3.5 xs:top-4 sm:top-6 left-3.5 xs:left-4 sm:left-6 z-10">
                  <span className="liquid-glass-pill text-[10px] xs:text-[11px] font-mono px-2.5 xs:px-3 py-0.5 xs:py-1 rounded-full text-white flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        project.status === 'In Progress'
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-emerald-400'
                      }`}
                    />
                    {project.status}
                  </span>
                </div>

                {/* Normal card meta - Apple visionOS Docked Liquid Glass Shelf */}
                <div className="relative z-10 liquid-glass liquid-glass-gloss rounded-xl sm:rounded-2xl p-3.5 xs:p-4 sm:p-5 transition-all duration-300 md:group-hover:opacity-15 flex flex-col gap-0.5 xs:gap-1 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] text-sky-300 uppercase tracking-[0.2em] font-medium font-mono">
                      {project.category}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/50">{project.year}</span>
                  </div>
                  <h3 className="text-base xs:text-lg sm:text-2xl md:text-3xl text-text-primary font-medium tracking-tight">
                    {project.title}
                  </h3>
                </div>

                {/* Liquid Glass Hover overlay: visionOS frosted backdrop (desktop only) */}
                <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-2xl flex-col justify-between p-5 sm:p-6 md:p-8 z-20 pointer-events-none border border-white/20 rounded-2xl sm:rounded-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)]">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-sky-300 uppercase tracking-[0.25em] font-mono font-medium">
                      {project.category}
                    </span>
                    <span className="text-xs font-mono text-muted">{project.status}</span>
                  </div>

                  <div className="flex flex-col gap-3.5 sm:gap-4">
                    <p className="text-xs sm:text-sm text-text-primary/95 max-w-md line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full liquid-glass-pill text-white/80 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Hover label: visionOS liquid glass pill */}
                    <div className="mt-1 sm:mt-2 inline-flex self-start">
                      <div className="liquid-glass-button bg-white/20 text-white px-5 py-2 rounded-full flex items-center gap-2 font-medium text-xs sm:text-sm shadow-lg">
                        <span>View —</span>
                        <span className="font-display italic text-sm sm:text-base tracking-tight">
                          {project.title}
                        </span>
                        <span className="text-xs">↗</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
);
};

