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
import { ContactFooter } from '../components/ContactFooter.tsx';
import {
  ProjectModal,
  ArticleModal,
  ExplorationModal,
  ConversationModal,
} from '../components/Modals.tsx';
import { AdminTrigger } from '../components/Admin/AdminTrigger.tsx';
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

  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<JournalEntry | null>(null);
  const [selectedExploration, setSelectedExploration] = useState<ExplorationItem | null>(null);
  const [isConversationOpen, setIsConversationOpen] = useState(false);

  // Monitor scroll position to update active navbar state
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const workEl = document.getElementById('work');
      const journalEl = document.getElementById('journal');
      const explorationsEl = document.getElementById('explorations');
      const contactEl = document.getElementById('contact');

      if (contactEl && scrollPos >= contactEl.offsetTop) {
        setActiveSection('contact');
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
    <div className="min-h-screen bg-bg text-text-primary font-body antialiased selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      {/* Liquid Glass Ambient Refraction Meshes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-600/20 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] -right-[10%] w-[500px] sm:w-[750px] h-[500px] sm:h-[750px] rounded-full bg-gradient-to-bl from-indigo-500/25 via-purple-600/20 to-transparent blur-[130px] pointer-events-none" />
        <div className="absolute top-[55%] left-[15%] w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] rounded-full bg-gradient-to-r from-sky-500/22 via-blue-500/15 to-transparent blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] rounded-full bg-gradient-to-tl from-teal-400/25 via-sky-600/20 to-transparent blur-[120px] pointer-events-none" />
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
        showAdminButton={!isPreview}
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

      {/* Subtle Admin Panel Quick Trigger (hidden inside preview iframe) */}
      {!isInsideIframe && <AdminTrigger />}
    </div>
  );
};
