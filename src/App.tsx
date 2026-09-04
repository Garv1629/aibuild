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
import { ContactModal } from './components/ContactModal';
import { PriceModal } from './components/PriceModal';
import { ProjectModal } from './components/ProjectModal';
import { EstimatorModal } from './components/EstimatorModal';
import { MobileNavDrawer } from './components/MobileNavDrawer';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { ProjectItem } from './types';
import { adminStore, AdminStoreState } from './services/adminStore';
import { isSessionActive } from './services/security';

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Pre-filled contact state from Scope Estimator or Cards
  const [contactProjectType, setContactProjectType] = useState<string>('01 - UGC ADS');
  const [contactInitialBudget, setContactInitialBudget] = useState<string>('');
  const [contactInitialMessage, setContactInitialMessage] = useState<string>('');

  // Admin CMS state
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [storeState, setStoreState] = useState<AdminStoreState>(adminStore.getState());

  const typedBufferRef = useRef<string>('');

  useEffect(() => {
    // Initial soft hydration animation
    const timer = setTimeout(() => {
      setIsLoadingProjects(false);
    }, 450);

    const unsub = adminStore.subscribe((state) => {
      setStoreState(state);
    });

    // Check URL parameters for owner direct trigger: ?admin, ?owner, #admin
    try {
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const hasAdminQuery = urlParams.has('admin') || urlParams.has('owner');
        const hasAdminHash = window.location.hash === '#admin' || window.location.hash === '#owner';
        if (hasAdminQuery || hasAdminHash) {
          // Scrub URL parameters for security
          try {
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title || '', window.location.pathname);
            }
          } catch {
            // Ignored in restricted iframes
          }
          handleTriggerAdmin();
        }
      }
    } catch {
      // Ignored in non-standard browsers
    }

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
    if (!isSessionActive()) {
      setIsAuthenticated(false);
    }
  };

  // If in Admin Dashboard view, render the CMS
  if (isAdminViewOpen) {
    return <AdminDashboard onExit={handleExitAdmin} />;
  }

  return (
    <SmoothScrollProvider>
      <main
        className="relative w-full max-w-[100vw] overflow-x-hidden bg-[#FFFFFF] text-[#202526] font-['Manrope',sans-serif] min-h-screen selection:bg-[#D8A9A8] selection:text-[#202526]"
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
          onSecretAdminTrigger={handleTriggerAdmin}
          badgeText={storeState.websiteContent.hero?.badgeText || 'ai.build_'}
        />

        {/* 1. Hero Section (z-10) */}
        <HeroSection
          content={storeState.websiteContent.hero}
          onOpenContact={handleOpenContact}
          onOpenPrice={handleOpenPrice}
          onOpenEstimator={handleOpenEstimator}
          onSecretAdminTrigger={handleTriggerAdmin}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* 2. Marquee Section (z-10) */}
        <MarqueeSection content={storeState.websiteContent.marquee} />

        {/* 3. About Section (z-20 - Character travels BEHIND) */}
        <AboutSection content={storeState.websiteContent.about} />

        {/* 4. Services Section (z-10 - Character travels ABOVE What We Do) */}
        <ServicesSection
          content={storeState.websiteContent.services}
          onOpenContact={handleOpenContact}
          onOpenEstimator={handleOpenEstimator}
        />

        {/* 5. Projects Section (z-20 - Character travels BELOW project card stack) */}
        <ProjectsSection
          projects={storeState.projects}
          isLoading={isLoadingProjects}
          onSelectProject={handleSelectProject}
        />

        {/* 6. Public Reviews & Ratings Section (z-20 - Character travels BELOW reviews) */}
        <ReviewsSection reviews={storeState.reviews} />

        {/* 7. Studio Footer & Massive CTA Section (z-10 - Character DOCKS & STICKS at LET'S BUILD) */}
        <FooterSection
          contactContent={storeState.websiteContent.contact}
          onOpenContact={handleOpenContact}
          onOpenPrice={handleOpenPrice}
          onOpenEstimator={handleOpenEstimator}
          onSecretAdminTrigger={handleTriggerAdmin}
        />

        {/* Global 3D Character Travelling Companion across every section */}
        <GlobalScrollCharacter
          portraitUrl={storeState.websiteContent.hero.portraitUrl}
          portraitMediaType={storeState.websiteContent.hero.portraitMediaType}
          portraitVideoUrl={storeState.websiteContent.hero.portraitVideoUrl}
          onOpenContact={handleOpenContact}
        />

        {/* Modals & Dialogs */}
        <ContactModal
          isOpen={isContactOpen}
          onClose={handleCloseContact}
          contactContent={storeState.websiteContent.contact}
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

        {/* Admin Auth Modal (Secret Owner Authentication) */}
        <AdminAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      </main>
    </SmoothScrollProvider>
  );
}
