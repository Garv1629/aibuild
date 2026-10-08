import React, { useState, useEffect, useRef } from 'react';
import { HeroSection } from './components/HeroSection';
import { MarqueeSection } from './components/MarqueeSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { FooterSection } from './components/FooterSection';
import { GlobalScrollCharacter } from './components/GlobalScrollCharacter';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { InteractiveCursorGrid } from './components/InteractiveCursorGrid';
import { MobileNavDrawer } from './components/MobileNavDrawer';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { ProjectItem } from './types';
import { adminStore, AdminStoreState } from './services/adminStore';
import { isSessionActive } from './services/security';

// Lazy-loaded modals and CMS dashboard to optimize initial bundle, FCP, LCP and TBT
const ContactModal = React.lazy(() => import('./components/ContactModal').then((m) => ({ default: m.ContactModal })));
const PriceModal = React.lazy(() => import('./components/PriceModal').then((m) => ({ default: m.PriceModal })));
const ProjectModal = React.lazy(() => import('./components/ProjectModal').then((m) => ({ default: m.ProjectModal })));
const EstimatorModal = React.lazy(() => import('./components/EstimatorModal').then((m) => ({ default: m.EstimatorModal })));
const LegalModal = React.lazy(() => import('./components/LegalModal').then((m) => ({ default: m.LegalModal })));
const AdminAuthModal = React.lazy(() => import('./components/admin/AdminAuthModal').then((m) => ({ default: m.AdminAuthModal })));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
import type { LegalTab } from './components/LegalModal';
export type { LegalTab };

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Pre-filled contact state from Scope Estimator or Cards
  const [contactProjectType, setContactProjectType] = useState<string>('01 - UGC ADS');
  const [contactInitialBudget, setContactInitialBudget] = useState<string>('');
  const [contactInitialMessage, setContactInitialMessage] = useState<string>('');

  // Admin CMS state
  const [isAdminViewOpen, setIsAdminViewOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const hasAdminHash = window.location.hash === '#admin' || window.location.hash === '#owner';
        const hasAdminQuery = window.location.search.includes('admin') || window.location.search.includes('owner');
        const isStored = (
          window.sessionStorage?.getItem('ai_build_admin_view') === 'true' ||
          window.localStorage?.getItem('ai_build_admin_view') === 'true'
        );
        return (hasAdminHash || hasAdminQuery || isStored) && isSessionActive();
      }
    } catch {}
    return false;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const hasAdminHash = window.location.hash === '#admin' || window.location.hash === '#owner';
        const hasAdminQuery = window.location.search.includes('admin') || window.location.search.includes('owner');
        return (hasAdminHash || hasAdminQuery) && !isSessionActive();
      }
    } catch {}
    return false;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && isSessionActive();
    } catch {
      return false;
    }
  });
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [storeState, setStoreState] = useState<AdminStoreState>(adminStore.getState());

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (isAdminViewOpen) {
          window.sessionStorage?.setItem('ai_build_admin_view', 'true');
          window.localStorage?.setItem('ai_build_admin_view', 'true');
          if (window.location.hash !== '#admin') {
            window.location.hash = '#admin';
          }
        } else {
          window.sessionStorage?.removeItem('ai_build_admin_view');
          window.localStorage?.removeItem('ai_build_admin_view');
          if (window.location.hash === '#admin' || window.location.hash === '#owner') {
            window.history.replaceState({}, document.title || '', window.location.pathname);
          }
        }
      }
    } catch {}
  }, [isAdminViewOpen]);

  const typedBufferRef = useRef<string>('');

  useEffect(() => {
    // Initial soft hydration animation
    const timer = setTimeout(() => {
      setIsLoadingProjects(false);
    }, 450);

    const unsub = adminStore.subscribe((state) => {
      setStoreState(state);
    });

    // Check URL parameters / hash for owner direct trigger
    try {
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const hasAdminQuery = urlParams.has('admin') || urlParams.has('owner');
        const hasAdminHash = window.location.hash === '#admin' || window.location.hash === '#owner';
        if (hasAdminQuery || hasAdminHash) {
          if (isSessionActive()) {
            setIsAuthenticated(true);
            setIsAdminViewOpen(true);
          } else {
            handleTriggerAdmin();
          }
        }
      }
    } catch {}

    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.hash === '#owner') {
        if (isSessionActive()) {
          setIsAuthenticated(true);
          setIsAdminViewOpen(true);
        } else {
          handleTriggerAdmin();
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // 1. Explicit Key Shortcut: Ctrl/Cmd + Shift + A or Ctrl/Cmd + Shift + E
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        handleTriggerAdmin();
        return;
      }

      // 2. Secret Word Trigger: typing "admin" or "owner" anywhere on page
      if (!isInput && e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        typedBufferRef.current = (typedBufferRef.current + e.key.toLowerCase()).slice(-10);
        if (typedBufferRef.current.endsWith('admin') || typedBufferRef.current.endsWith('owner')) {
          typedBufferRef.current = '';
          handleTriggerAdmin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      unsub();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isAuthenticated]);

  const handleOpenContact = (projectType?: string, budget?: string, message?: string) => {
    if (projectType) {
      setContactProjectType(projectType);
    }
    if (budget !== undefined) {
      setContactInitialBudget(budget);
    }
    if (message !== undefined) {
      setContactInitialMessage(message);
    }
    setIsContactOpen(true);
  };
  const handleCloseContact = () => setIsContactOpen(false);

  const handleOpenPrice = () => setIsPriceOpen(true);
  const handleClosePrice = () => setIsPriceOpen(false);

  const handleOpenEstimator = () => setIsEstimatorOpen(true);
  const handleCloseEstimator = () => setIsEstimatorOpen(false);

  const handleProceedFromEstimator = (scopeData: {
    projectType: string;
    budget: string;
    timeline: string;
    summary: string;
  }) => {
    setIsEstimatorOpen(false);
    handleOpenContact(
      scopeData.projectType,
      scopeData.budget,
      `Hello AI Build team,\n\nI have calculated our target project scope using the interactive estimator:\n\n${scopeData.summary}\n\nWe look forward to discussing milestone scheduling and project kickoff!`
    );
  };

  const handleOpenLegal = (tab: LegalTab = 'privacy') => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  const handleSelectProject = (project: ProjectItem) => setSelectedProject(project);
  const handleCloseProject = () => setSelectedProject(null);

  const handleTriggerAdmin = () => {
    if (isAuthenticated && isSessionActive()) {
      setIsAdminViewOpen(true);
    } else {
      setIsAuthenticated(false);
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    setIsAdminViewOpen(true);
  };

  const handleExitAdmin = () => {
    setIsAdminViewOpen(false);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('ai_build_admin_view');
      }
    } catch {}
    if (!isSessionActive()) {
      setIsAuthenticated(false);
    }
  };

  // If in Admin Dashboard view, render the CMS
  if (isAdminViewOpen) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center text-[#202526] font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D8A9A8] animate-ping" />
              <span>Loading Studio CMS...</span>
            </div>
          </div>
        }
      >
        <AdminDashboard onExit={handleExitAdmin} />
      </React.Suspense>
    );
  }

  return (
    <SmoothScrollProvider>
      <a href="#main-content" className="skip-to-content-link">
        Skip to main content
      </a>
      <main
        id="main-content"
        className="relative w-full max-w-[100vw] overflow-x-hidden bg-[#FFFFFF] text-[#202526] font-body min-h-screen selection:bg-[#D8A9A8] selection:text-[#202526]"
      >
        <ScrollProgressBar />

        {/* Global Interactive Cursor Hole Grid Canvas */}
        <InteractiveCursorGrid gridSize={48} holeRadius={160} pushStrength={70} />

        {/* Background Soft Material Ambient Variation */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Soft dust material lighting variation */}
          <div className="absolute -top-[15%] -right-[10%] w-[650px] h-[650px] rounded-full bg-[#CBDCDE]/30 blur-[140px]" />
          <div className="absolute top-[45%] -left-[15%] w-[600px] h-[600px] rounded-full bg-[#AFC7C5]/20 blur-[150px]" />
          <div className="absolute top-[80%] right-[5%] w-[550px] h-[550px] rounded-full bg-[#D8A9A8]/20 blur-[160px]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Mobile Navigation Drawer & Fixed Hamburger Trigger Button */}
        <MobileNavDrawer
          isOpen={isMobileNavOpen}
          onOpen={() => setIsMobileNavOpen(true)}
          onClose={() => setIsMobileNavOpen(false)}
          onOpenContact={handleOpenContact}
          onOpenPrice={handleOpenPrice}
          onOpenEstimator={handleOpenEstimator}
          onOpenLegal={handleOpenLegal}
          onSecretAdminTrigger={handleTriggerAdmin}
          badgeText={storeState.websiteContent.hero?.badgeText || 'ai.build_'}
          contactEmail={(storeState.publishedContent || storeState.websiteContent)?.contact?.email || 'hello@aibuild.studio'}
        />

        {/* 1. Hero Section (z-10) */}
        <HeroSection
          content={(storeState.publishedContent || storeState.websiteContent)?.hero}
          onOpenContact={handleOpenContact}
          onOpenPrice={handleOpenPrice}
          onOpenEstimator={handleOpenEstimator}
          onSecretAdminTrigger={handleTriggerAdmin}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* 2. Marquee Section (z-10) */}
        <MarqueeSection content={(storeState.publishedContent || storeState.websiteContent)?.marquee} />

        {/* 3. About Section (z-20 - Character travels BEHIND) */}
        <AboutSection content={(storeState.publishedContent || storeState.websiteContent)?.about} />

        {/* 4. Services Section (z-10 - Character travels ABOVE What We Do) */}
        <ServicesSection
          content={(storeState.publishedContent || storeState.websiteContent)?.services}
          onOpenContact={handleOpenContact}
          onOpenEstimator={handleOpenEstimator}
        />

        {/* 5. Projects Section (z-20 - Character travels BELOW project card stack - Published Only) */}
        <ProjectsSection
          projects={storeState.projects.filter((p) => (p.status || 'published') === 'published')}
          isLoading={isLoadingProjects}
          onSelectProject={handleSelectProject}
          onOpenContact={handleOpenContact}
          onOpenEstimator={handleOpenEstimator}
        />

        {/* 6. Public Reviews & Ratings Section (z-20 - Character travels BELOW reviews) */}
        <ReviewsSection reviews={storeState.reviews} />

        {/* 7. Studio Footer & Massive CTA Section (z-10 - Character DOCKS & STICKS at LET'S BUILD) */}
        <FooterSection
          contactContent={(storeState.publishedContent || storeState.websiteContent)?.contact}
          onOpenContact={handleOpenContact}
          onOpenPrice={handleOpenPrice}
          onOpenEstimator={handleOpenEstimator}
          onOpenLegal={handleOpenLegal}
          onSecretAdminTrigger={handleTriggerAdmin}
        />

        {/* Global 3D Character Travelling Companion across every section */}
        <GlobalScrollCharacter
          portraitUrl={(storeState.publishedContent || storeState.websiteContent)?.hero?.portraitUrl}
          portraitMediaType={(storeState.publishedContent || storeState.websiteContent)?.hero?.portraitMediaType}
          portraitVideoUrl={(storeState.publishedContent || storeState.websiteContent)?.hero?.portraitVideoUrl}
          onOpenContact={handleOpenContact}
        />

        {/* Lazy-Loaded Modals & Dialogs (Loaded on interaction) */}
        <React.Suspense fallback={null}>
          <ContactModal
            isOpen={isContactOpen}
            onClose={handleCloseContact}
            contactContent={(storeState.publishedContent || storeState.websiteContent)?.contact}
            initialProjectType={contactProjectType}
            initialBudget={contactInitialBudget}
            initialMessage={contactInitialMessage}
          />

          <PriceModal
            isOpen={isPriceOpen}
            onClose={handleClosePrice}
            onSelectPlan={handleOpenContact}
            onOpenEstimator={handleOpenEstimator}
          />

          <EstimatorModal
            isOpen={isEstimatorOpen}
            onClose={handleCloseEstimator}
            settings={storeState.estimatorSettings}
            onProceedToContact={handleProceedFromEstimator}
            onOpenContact={() => handleOpenContact()}
          />

          <ProjectModal
            project={selectedProject}
            onClose={handleCloseProject}
            onOpenContact={handleOpenContact}
          />

          {/* Legal Transparency & Privacy Modal */}
          <LegalModal
            isOpen={isLegalOpen}
            onClose={() => setIsLegalOpen(false)}
            initialTab={legalTab}
          />

          {/* Admin Auth Modal (Secret Owner Authentication) */}
          <AdminAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthenticated={handleAuthenticated}
          />
        </React.Suspense>
      </main>
    </SmoothScrollProvider>
  );
}
