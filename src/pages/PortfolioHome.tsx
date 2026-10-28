/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ScrollProgressBar } from '../components/ScrollProgressBar.tsx';
import { LoadingScreen } from '../components/LoadingScreen.tsx';
import { Navbar } from '../components/Navbar.tsx';
import { Hero } from '../components/Hero.tsx';
import { SelectedWorks } from '../components/SelectedWorks.tsx';
import { Journal } from '../components/Journal.tsx';
import { Explorations } from '../components/Explorations.tsx';
import { Stats } from '../components/Stats.tsx';
import { Reviews } from '../components/Reviews.tsx';
import { ContactFooter } from '../components/ContactFooter.tsx';
import {
  ProjectModal,
  ArticleModal,
  ExplorationModal,
  ConversationModal,
  ReviewSubmissionModal,
} from '../components/Modals.tsx';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Project, JournalEntry, ExplorationItem } from '../utils/portfolio.ts';

interface PortfolioHomeProps {
  isPreview?: boolean;
}

export const PortfolioHome: React.FC<PortfolioHomeProps> = ({ isPreview = false }) => {
  const isInsideIframe = typeof window !== 'undefined' && (isPreview || window.self !== window.top);

  const [isLoading, setIsLoading] = useState(() => {
    if (isPreview) return false;
    if (typeof window !== 'undefined') {
      const search = window.location.search.toLowerCase();
      if (
        isInsideIframe ||
        search.includes('skip-intro') ||
        search.includes('autostart') ||
        search.includes('preview')
      ) {
        return false;
      }
    }
    return true;
  });

  const { addReview } = usePortfolio();
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<JournalEntry | null>(null);
  const [selectedExploration, setSelectedExploration] = useState<ExplorationItem | null>(null);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Monitor scroll position to update active navbar state
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const workEl = document.getElementById('work');
      const journalEl = document.getElementById('journal');
      const explorationsEl = document.getElementById('explorations');
      const reviewsEl = document.getElementById('reviews');
      const contactEl = document.getElementById('contact');

      if (contactEl && scrollPos >= contactEl.offsetTop) {
        setActiveSection('contact');
      } else if (reviewsEl && scrollPos >= reviewsEl.offsetTop) {
        setActiveSection('reviews');
      } else if (explorationsEl && scrollPos >= explorationsEl.offsetTop) {
        setActiveSection('explorations');
      } else if (journalEl && scrollPos >= journalEl.offsetTop) {
        setActiveSection('journal');
      } else if (workEl && scrollPos >= workEl.offsetTop) {
        setActiveSection('work');
      } else {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-body antialiased selection:bg-white/20 selection:text-white relative overflow-x-clip">
      {/* Liquid Glass Ambient Refraction Meshes (Mobile GPU Optimized) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] w-[380px] sm:w-[850px] h-[380px] sm:h-[850px] rounded-full bg-gradient-to-br from-cyan-400/25 via-blue-600/15 to-transparent blur-[60px] sm:blur-[120px] pointer-events-none transform-gpu" />
        <div className="hidden sm:block absolute top-[30%] -right-[10%] w-[500px] sm:w-[750px] h-[500px] sm:h-[750px] rounded-full bg-gradient-to-bl from-indigo-500/20 via-purple-600/15 to-transparent blur-[120px] pointer-events-none transform-gpu" />
        <div className="hidden sm:block absolute top-[55%] left-[15%] w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] rounded-full bg-gradient-to-r from-sky-500/18 via-blue-500/12 to-transparent blur-[120px] pointer-events-none transform-gpu" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[340px] sm:w-[800px] h-[340px] sm:h-[800px] rounded-full bg-gradient-to-tl from-teal-400/20 via-sky-600/15 to-transparent blur-[60px] sm:blur-[120px] pointer-events-none transform-gpu" />
      </div>

      {/* Top scroll progress bar */}
      <ScrollProgressBar />

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* Floating Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenContact={() => setIsConversationOpen(true)}
      />

      <main>
        {/* Hero Section */}
        <Hero
          onSeeWorks={() => handleNavigate('work')}
          onReachOut={() => setIsConversationOpen(true)}
        />

        {/* Selected Works */}
        <SelectedWorks
          onSelectProject={(project) => setSelectedProject(project)}
          onViewAllWork={() => handleNavigate('work')}
        />

        {/* Journal Section */}
        <Journal
          onSelectArticle={(article) => setSelectedArticle(article)}
          onViewAllThoughts={() => handleNavigate('journal')}
        />

        {/* Explorations Section */}
        <Explorations
          onSelectExploration={(item) => setSelectedExploration(item)}
        />

        {/* Stats */}
        <Stats />

        {/* Client Reviews Section */}
        <Reviews
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
        />

        {/* Contact / Footer */}
        <ContactFooter
          onStartConversation={() => setIsConversationOpen(true)}
        />
      </main>

      {/* Interactive Modals */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onStartConversation={() => setIsConversationOpen(true)}
      />

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <ExplorationModal
        item={selectedExploration}
        onClose={() => setSelectedExploration(null)}
      />

      <ConversationModal
        isOpen={isConversationOpen}
        onClose={() => setIsConversationOpen(false)}
      />

      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitReview={addReview}
      />
    </div>
  );
};
