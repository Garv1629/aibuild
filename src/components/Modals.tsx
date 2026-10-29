/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Send, ArrowRight, Play, Film, Image as ImageIcon, Star, Sparkles } from 'lucide-react';
import { Project, JournalEntry, ExplorationItem, SERVICES, Review } from '../utils/portfolio.ts';
import { ProjectInteractiveDemo } from './ProjectInteractiveDemo.tsx';
import { Button } from './Button.tsx';
import { EmailContactPill } from './EmailContactPill.tsx';
import { usePortfolio } from '../context/PortfolioContext.tsx';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onStartConversation: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onStartConversation,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'workflow'>('overview');
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video'; title?: string }>({
    url: '',
    type: 'image',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      setActiveTab('overview');
      setActiveMedia({ url: project.image, type: 'image', title: 'Main Cover' });
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl max-h-[92dvh] supports-[height:100dvh]:max-h-[90dvh] overflow-y-auto liquid-glass-modal rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 md:p-10 text-text-primary"
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
          >
            <Button
              variant="icon"
              size="md"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 z-20"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3 font-mono text-xs pr-8">
              <span className="liquid-glass-pill px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-text-primary flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    project.status === 'In Progress'
                      ? 'bg-warning animate-pulse'
                      : 'bg-success'
                  }`}
                />
                {project.status}
              </span>
              <span className="text-muted">•</span>
              <span className="text-muted uppercase tracking-wider">
                {project.category}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-5xl font-display text-text-primary mb-4 sm:mb-6 pr-8 leading-tight">
              {project.title}
            </h3>

            {/* Modal Navigation Tabs - Liquid Glass Segmented Pill */}
            <div
              role="tablist"
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl liquid-glass mb-4 sm:mb-6 overflow-x-auto scrollbar-none touch-pan-x"
            >
              <Button
                variant="pill"
                size="sm"
                active={activeTab === 'overview'}
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className="flex-1 min-w-[85px] sm:min-w-[100px] text-center whitespace-nowrap"
              >
                Overview
              </Button>

              <Button
                variant="pill"
                size="sm"
                active={activeTab === 'demo'}
                role="tab"
                aria-selected={activeTab === 'demo'}
                onClick={() => setActiveTab('demo')}
                className="flex-1 min-w-[130px] sm:min-w-[140px] whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span>Demo &amp; Reel</span>
              </Button>

              <Button
                variant="pill"
                size="sm"
                active={activeTab === 'workflow'}
                role="tab"
                aria-selected={activeTab === 'workflow'}
                onClick={() => setActiveTab('workflow')}
                className="flex-1 min-w-[90px] sm:min-w-[100px] text-center whitespace-nowrap"
              >
                Workflow
              </Button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-stroke relative bg-black">
                  {activeMedia.type === 'video' ? (
                    <video
                      key={activeMedia.url}
                      src={activeMedia.url}
                      autoPlay
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      key={activeMedia.url}
                      src={activeMedia.url || project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  )}
                  <div className="halftone-overlay absolute inset-0 opacity-20 pointer-events-none" />
                </div>

                {/* Media Switcher Bar (if project has gallery images or video list) */}
                {((project.galleryImages && project.galleryImages.length > 0) ||
                  (project.videoList && project.videoList.length > 0) ||
                  project.video) && (
                  <div className="space-y-2 p-3 rounded-2xl liquid-glass border border-white/10">
                    <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
                      <span>Project Media Gallery &amp; Video Clips</span>
                      <span className="text-accent">Click to preview</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {/* Main Cover */}
                      <button
                        type="button"
                        onClick={() => setActiveMedia({ url: project.image, type: 'image', title: 'Cover' })}
                        className={`relative aspect-video w-20 sm:w-24 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-all ${
                          activeMedia.url === project.image && activeMedia.type === 'image'
                            ? 'border-accent ring-2 ring-accent/50 scale-105'
                            : 'border-white/20 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={project.image} alt="Cover" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 text-2xs font-mono px-1 py-0.2 rounded bg-black/80 text-white">Cover</span>
                      </button>

                      {/* Additional Gallery Images */}
                      {project.galleryImages?.map((imgUrl, i) => (
                        <button
                          key={`img-${i}`}
                          type="button"
                          onClick={() => setActiveMedia({ url: imgUrl, type: 'image', title: `Gallery ${i + 1}` })}
                          className={`relative aspect-video w-20 sm:w-24 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-all ${
                            activeMedia.url === imgUrl && activeMedia.type === 'image'
                              ? 'border-accent ring-2 ring-accent/50 scale-105'
                              : 'border-white/20 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 text-2xs font-mono px-1 py-0.2 rounded bg-black/80 text-white">Img {i + 1}</span>
                        </button>
                      ))}

                      {/* Video clips */}
                      {project.video && !project.videoList?.some(v => v.url === project.video) && (
                        <button
                          type="button"
                          onClick={() => setActiveMedia({ url: project.video!, type: 'video', title: 'Main Reel' })}
                          className={`relative aspect-video w-20 sm:w-24 rounded-lg overflow-hidden border shrink-0 cursor-pointer bg-neutral-900 transition-all flex items-center justify-center ${
                            activeMedia.url === project.video && activeMedia.type === 'video'
                              ? 'border-accent ring-2 ring-accent/50 scale-105'
                              : 'border-white/20 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Play className="w-5 h-5 text-accent" />
                          <span className="absolute bottom-1 left-1 text-2xs font-mono px-1 py-0.2 rounded bg-accent/80 text-white">Video</span>
                        </button>
                      )}

                      {project.videoList?.map((vid, i) => (
                        <button
                          key={`vid-${i}`}
                          type="button"
                          onClick={() => setActiveMedia({ url: vid.url, type: 'video', title: vid.title })}
                          className={`relative aspect-video w-20 sm:w-24 rounded-lg overflow-hidden border shrink-0 cursor-pointer bg-neutral-900 transition-all flex items-center justify-center ${
                            activeMedia.url === vid.url && activeMedia.type === 'video'
                              ? 'border-accent ring-2 ring-accent/50 scale-105'
                              : 'border-white/20 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Play className="w-5 h-5 text-accent" />
                          <span className="absolute bottom-1 left-1 text-2xs font-mono px-1 py-0.2 rounded bg-accent/80 text-white truncate max-w-[80px]">
                            {vid.title || `Reel ${i + 1}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-muted leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Key Features */}
                <div className="space-y-3 p-5 rounded-2xl liquid-glass-subtle">
                  <span className="text-xs font-mono text-muted uppercase tracking-wider block mb-2">
                    Key Features &amp; Capabilities
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {project.features.map((feat) => (
                      <div
                        key={feat}
                        className="flex items-start gap-2 text-xs sm:text-sm text-text-primary"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Interactive Demo */}
            {activeTab === 'demo' && (
              <ProjectInteractiveDemo project={project} />
            )}

            {/* Tab 3: Workflow & Tech */}
            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl liquid-glass-subtle space-y-4">
                  <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                    Execution Pipeline: {project.workflow}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl liquid-glass-card space-y-1.5">
                      <div className="font-mono text-accent font-semibold">01. Conception</div>
                      <p className="text-muted leading-relaxed">
                        Prompt engineering, requirement synthesis, and architecture framing.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl liquid-glass-card space-y-1.5">
                      <div className="font-mono text-accent font-semibold">02. Development</div>
                      <p className="text-muted leading-relaxed">
                        Vibe coding, rapid prototyping, component assembly, and micro-interactions.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl liquid-glass-card space-y-1.5">
                      <div className="font-mono text-accent font-semibold">03. Production</div>
                      <p className="text-muted leading-relaxed">
                        Performance audits, responsiveness verification, and dark mode contrast calibration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl liquid-glass-subtle space-y-3">
                  <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                    Technologies &amp; Tools Used
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono tracking-normal px-3 py-1 rounded-full liquid-glass-pill text-text-primary max-w-full break-words"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-stroke/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <span className="text-xs font-mono text-muted">
                Workflow: {project.workflow}
              </span>

              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                {activeTab !== 'demo' && (
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setActiveTab('demo')}
                    className="flex-1 sm:flex-none text-center"
                  >
                    Open Live Demo →
                  </Button>
                )}

                <Button
                  variant="glass"
                  size="md"
                  onClick={() => {
                    onClose();
                    onStartConversation();
                  }}
                  className="flex-1 sm:flex-none uppercase tracking-wider font-sans"
                >
                  <span>Discuss Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ArticleModalProps {
  article: JournalEntry | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (article) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [article, onClose]);

  return (
    <AnimatePresence>
      {article && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-2xl max-h-[92dvh] supports-[height:100dvh]:max-h-[88dvh] overflow-y-auto liquid-glass-modal rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 md:p-10 shadow-2xl text-text-primary"
            role="dialog"
            aria-modal="true"
            aria-label={article.title}
          >
            <Button
              variant="icon"
              size="md"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 z-20"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs uppercase tracking-widest text-muted font-mono mb-3 sm:mb-4 pr-8">
              <span className="liquid-glass-pill px-3 py-1 rounded-full text-text-primary">{article.category}</span>
              <span>•</span>
              <span>{article.readTime}</span>
              <span>•</span>
              <span>{article.date}</span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-display text-text-primary mb-4 sm:mb-6 leading-tight pr-8">
              {article.title}
            </h3>

            <div className="w-full h-44 sm:h-60 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 border border-stroke relative">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="halftone-overlay absolute inset-0 opacity-20 pointer-events-none" />
            </div>

            <p className="text-sm sm:text-base text-muted leading-relaxed mb-3 sm:mb-4">
              {article.excerpt}
            </p>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              At AI Build, every experiment is an opportunity to learn, test, solve a problem, and turn ideas into practical digital solutions. We combine prompt engineering, visual design, and rapid prototyping to explore new frontiers in digital craft.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ExplorationModalProps {
  item: ExplorationItem | null;
  onClose: () => void;
}

export const ExplorationModal: React.FC<ExplorationModalProps> = ({ item, onClose }) => {
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video'; title?: string }>({
    url: '',
    type: 'image',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (item) {
      if (item.video) {
        setActiveMedia({ url: item.video, type: 'video', title: 'Main Reel' });
      } else {
        setActiveMedia({ url: item.image, type: 'image', title: 'Main Image' });
      }
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 max-w-2xl w-full max-h-[92dvh] supports-[height:100dvh]:max-h-[88dvh] overflow-y-auto liquid-glass-modal rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
          >
            <Button
              variant="icon"
              size="md"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 z-20"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="w-full aspect-video sm:aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 border border-stroke/70 relative bg-black">
              {activeMedia.type === 'video' ? (
                <video
                  key={activeMedia.url}
                  src={activeMedia.url}
                  poster={item.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  key={activeMedia.url}
                  src={activeMedia.url || item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              )}
              <div className="halftone-overlay absolute inset-0 opacity-20 pointer-events-none" />
            </div>

            {/* Media Switcher Bar for Exploration */}
            {((item.galleryImages && item.galleryImages.length > 0) ||
              (item.videoList && item.videoList.length > 0) ||
              (item.video && item.image)) && (
              <div className="mb-4 p-2.5 rounded-xl liquid-glass border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-2xs font-mono text-muted px-1">
                  <span>Exploration Media Gallery</span>
                  <span className="text-accent">Click to switch</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {/* Image */}
                  <button
                    type="button"
                    onClick={() => setActiveMedia({ url: item.image, type: 'image', title: 'Cover' })}
                    className={`relative aspect-video w-18 h-12 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-all ${
                      activeMedia.url === item.image && activeMedia.type === 'image'
                        ? 'border-accent ring-2 ring-accent/50 scale-105'
                        : 'border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={item.image} alt="Cover" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 left-0.5 text-2xs font-mono px-1 rounded bg-black/80 text-white">Img</span>
                  </button>

                  {/* Additional Gallery */}
                  {item.galleryImages?.map((imgUrl, i) => (
                    <button
                      key={`exp-img-${i}`}
                      type="button"
                      onClick={() => setActiveMedia({ url: imgUrl, type: 'image', title: `Gallery ${i + 1}` })}
                      className={`relative aspect-video w-18 h-12 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-all ${
                        activeMedia.url === imgUrl && activeMedia.type === 'image'
                          ? 'border-accent ring-2 ring-accent/50 scale-105'
                          : 'border-white/20 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 left-0.5 text-2xs font-mono px-1 rounded bg-black/80 text-white">Img {i + 1}</span>
                    </button>
                  ))}

                  {/* Primary Video */}
                  {item.video && !item.videoList?.some(v => v.url === item.video) && (
                    <button
                      type="button"
                      onClick={() => setActiveMedia({ url: item.video!, type: 'video', title: 'Main Reel' })}
                      className={`relative aspect-video w-18 h-12 rounded-lg overflow-hidden border shrink-0 cursor-pointer bg-neutral-900 transition-all flex items-center justify-center ${
                        activeMedia.url === item.video && activeMedia.type === 'video'
                          ? 'border-accent ring-2 ring-accent/50 scale-105'
                          : 'border-white/20 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Play className="w-4 h-4 text-accent" />
                      <span className="absolute bottom-0.5 left-0.5 text-2xs font-mono px-1 rounded bg-accent/80 text-white">Video</span>
                    </button>
                  )}

                  {/* Additional Video clips */}
                  {item.videoList?.map((vid, i) => (
                    <button
                      key={`exp-vid-${i}`}
                      type="button"
                      onClick={() => setActiveMedia({ url: vid.url, type: 'video', title: vid.title })}
                      className={`relative aspect-video w-18 h-12 rounded-lg overflow-hidden border shrink-0 cursor-pointer bg-neutral-900 transition-all flex items-center justify-center ${
                        activeMedia.url === vid.url && activeMedia.type === 'video'
                          ? 'border-accent ring-2 ring-accent/50 scale-105'
                          : 'border-white/20 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Play className="w-4 h-4 text-accent" />
                      <span className="absolute bottom-0.5 left-0.5 text-2xs font-mono px-1 rounded bg-accent/80 text-white truncate max-w-[60px]">
                        {vid.title || `Vid ${i + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                  {item.category}
                </span>
                <h3 className="text-lg sm:text-xl font-display text-text-primary mt-0.5">
                  {item.title}
                </h3>
              </div>
              <span className="liquid-glass-pill px-2.5 py-1 rounded-full text-xs font-mono text-muted">
                Rotation {item.rotation}°
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationModal: React.FC<ConversationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addInquiry } = usePortfolio();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceType: 'Web Development',
    ideaDescription: '',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.ideaDescription.trim()) return;
    setIsSubmitting(true);
    try {
      await addInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        serviceType: formData.serviceType,
        ideaDescription: formData.ideaDescription.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setFormData({
          name: '',
          email: '',
          serviceType: 'Web Development',
          ideaDescription: '',
        });
      }, 2500);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-lg max-h-[92dvh] supports-[height:100dvh]:max-h-[88dvh] overflow-y-auto liquid-glass-modal rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 shadow-2xl text-text-primary"
            role="dialog"
            aria-modal="true"
            aria-label="Start a conversation with AI Build"
          >
            <Button
              variant="icon"
              size="md"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 z-20"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>

            {submitted ? (
              <div className="py-8 sm:py-10 text-center flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-success mb-4" />
                <h3 className="text-xl sm:text-2xl font-display text-text-primary mb-2">
                  Conversation Initiated!
                </h3>
                <p className="text-xs sm:text-sm text-muted max-w-xs">
                  Thank you for sharing your project concept. AI Build will review your notes and connect with you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                <div className="pr-8">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted block mb-1">
                    Connect
                  </span>
                  <h3 className="text-xl sm:text-3xl font-display text-text-primary mb-1 sm:mb-2">
                    Start a Conversation
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-2.5">
                    Have an idea, prototype, or creative project? Send a note below or reach us directly:
                  </p>
                  <div className="mb-2">
                    <EmailContactPill variant="modal" />
                  </div>
                </div>

                <div>
                  <label htmlFor="user-name" className="text-xs font-mono text-muted block mb-1">
                    Your Name
                  </label>
                  <input
                    id="user-name"
                    required
                    type="text"
                    placeholder="e.g. Alex Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-base sm:text-sm text-text-primary placeholder:text-muted focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="user-email" className="text-xs font-mono text-muted block mb-1">
                    Your Email (Optional)
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-base sm:text-sm text-text-primary placeholder:text-muted focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="service-type" className="text-xs font-mono text-muted block mb-1">
                    Service Required
                  </label>
                  <select
                    id="service-type"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-base sm:text-sm text-text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="Web Development" className="bg-[#12141a] text-white">Web Development (Apps, Landing Pages, Portals)</option>
                    <option value="AI Videos" className="bg-[#12141a] text-white">AI Videos (Cinematic Ads, 4K Commercials)</option>
                    <option value="UGC Videos" className="bg-[#12141a] text-white">UGC Videos (Viral TikTok/Reels Formats)</option>
                    <option value="E-books" className="bg-[#12141a] text-white">E-books (Digital Guides, Publication Layouts)</option>
                  </select>

                  {/* Dynamic Service Deliverables Hint */}
                  {(() => {
                    const match = SERVICES.find((s) => s.title === formData.serviceType);
                    if (!match) return null;
                    return (
                      <div className="mt-2 p-2.5 sm:p-3 rounded-xl liquid-glass-subtle space-y-1 text-xs">
                        <div className="flex items-center justify-between text-xs font-mono text-accent">
                          <span>{match.badge}</span>
                          <span className="text-muted">{match.statsValue}</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed font-sans">
                          {match.shortDesc}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label htmlFor="idea-desc" className="text-xs font-mono text-muted block mb-1">
                    Describe Your Idea or Goal
                  </label>
                  <textarea
                    id="idea-desc"
                    required
                    rows={3}
                    placeholder="Tell us what you are looking to build or experiment with..."
                    value={formData.ideaDescription}
                    onChange={(e) => setFormData({ ...formData, ideaDescription: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-base sm:text-sm text-text-primary placeholder:text-muted focus:outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="glass"
                  size="md"
                  className="w-full uppercase tracking-wider mt-2 py-3.5 sm:py-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<'Web Development' | 'AI Videos' | 'UGC Videos' | 'E-books'>('Web Development');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setIsSubmitted(false);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    onSubmitReview({
      name: name.trim(),
      role: role.trim() || 'Client',
      company: company.trim() || undefined,
      category,
      rating,
      content: content.trim(),
      verified: false,
      status: 'pending',
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setName('');
      setRole('');
      setCompany('');
      setContent('');
      setRating(5);
      setIsSubmitted(false);
    }, 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg max-h-[92dvh] supports-[height:100dvh]:max-h-[88dvh] overflow-y-auto liquid-glass-modal rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 text-text-primary"
            role="dialog"
            aria-modal="true"
            aria-label="Submit Review"
          >
            <Button
              variant="icon"
              size="md"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 z-20"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-accent">
              <Sparkles className="w-3.5 h-3.5 text-warning" />
              <span>TESTIMONIAL & FEEDBACK</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-display text-text-primary mb-2">
              Share Your Experience
            </h3>
            <p className="text-xs sm:text-sm text-muted mb-6 font-sans">
              Help future partners understand the quality, speed, and creative impact of working with AI Build.
            </p>

            {isSubmitted ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto animate-bounce" />
                <h4 className="text-lg font-medium text-white">Submitted for Verification!</h4>
                <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
                  Thank you for your feedback! Your review has been sent to our verification panel and will be published live once verified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                {/* Rating Stars Picker */}
                <div>
                  <label className="text-xs font-mono text-muted block mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-2 cursor-pointer transition-transform hover:scale-125 active:scale-125 focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled
                                ? 'text-warning fill-warning drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                : 'text-muted hover:text-white'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="font-mono text-xs text-warning ml-2">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reviewer-name" className="text-xs font-mono text-muted block mb-1">
                      Your Name *
                    </label>
                    <input
                      id="reviewer-name"
                      required
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="reviewer-role" className="text-xs font-mono text-muted block mb-1">
                      Role / Title
                    </label>
                    <input
                      id="reviewer-role"
                      type="text"
                      placeholder="e.g. Product Lead / Founder"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reviewer-company" className="text-xs font-mono text-muted block mb-1">
                      Company / Brand (Optional)
                    </label>
                    <input
                      id="reviewer-company"
                      type="text"
                      placeholder="e.g. Nova Media"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="review-category" className="text-xs font-mono text-muted block mb-1">
                      Service Delivered
                    </label>
                    <select
                      id="review-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-text-primary focus:outline-none cursor-pointer"
                    >
                      <option value="Web Development" className="bg-[#12141a] text-white">Web Development</option>
                      <option value="AI Videos" className="bg-[#12141a] text-white">AI Videos</option>
                      <option value="UGC Videos" className="bg-[#12141a] text-white">UGC Videos</option>
                      <option value="E-books" className="bg-[#12141a] text-white">E-books</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="review-content" className="text-xs font-mono text-muted block mb-1">
                    Your Review / Feedback *
                  </label>
                  <textarea
                    id="review-content"
                    required
                    rows={4}
                    placeholder="Share how AI Build assisted your vision, delivery speeds, communication, or final quality..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-muted focus:outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="glass"
                  size="md"
                  className="w-full uppercase tracking-wider mt-4 py-3.5 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                >
                  <Sparkles className="w-4 h-4 text-warning" />
                  <span>Submit Client Review</span>
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

