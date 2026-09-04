import React, { useState, useEffect, useRef } from 'react';
import { adminStore, AdminStoreState } from '../../services/adminStore';
import { ProjectItem } from '../../types';
import { HeroSection } from '../HeroSection';
import { MarqueeSection } from '../MarqueeSection';
import { AboutSection } from '../AboutSection';
import { ServicesSection } from '../ServicesSection';
import { ProjectsSection } from '../ProjectsSection';
import { ReviewsSection } from '../ReviewsSection';
import { FooterSection } from '../FooterSection';
import { ContactModal } from '../ContactModal';
import { PriceModal } from '../PriceModal';
import { EstimatorModal } from '../EstimatorModal';
import { ProjectModal } from '../ProjectModal';
import {
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Eye,
  Sliders,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export type PreviewDeviceMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';

interface AdminPreviewSectionProps {
  onExitToLive?: () => void;
  isDocked?: boolean;
}

export const AdminPreviewSection: React.FC<AdminPreviewSectionProps> = ({
  onExitToLive,
  isDocked = false,
}) => {
  const [storeState, setStoreState] = useState<AdminStoreState>(adminStore.getState());
  const [deviceMode, setDeviceMode] = useState<PreviewDeviceMode>(isDocked ? 'mobile' : 'desktop');
  const [zoomScale, setZoomScale] = useState<number>(isDocked ? 0.9 : 1);
  const [activeSection, setActiveSection] = useState<string>('all');

  // Interactive preview modals
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Pre-filled contact state
  const [contactProjectType, setContactProjectType] = useState<string>('01 - UGC ADS');
  const [contactInitialBudget, setContactInitialBudget] = useState<string>('');
  const [contactInitialMessage, setContactInitialMessage] = useState<string>('');

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time updates from adminStore
  useEffect(() => {
    const unsub = adminStore.subscribe((state) => {
      setStoreState({ ...state });
    });
    return () => unsub();
  }, []);

  const handleOpenContact = (projectType?: string, budget?: string, message?: string) => {
    if (projectType) setContactProjectType(projectType);
    if (budget !== undefined) setContactInitialBudget(budget);
    if (message !== undefined) setContactInitialMessage(message);
    setIsContactOpen(true);
  };

  const handleOpenPrice = () => setIsPriceOpen(true);
  const handleOpenEstimator = () => setIsEstimatorOpen(true);
  const handleSelectProject = (project: ProjectItem) => setSelectedProject(project);

  const handleScrollTo = (sectionId: string) => {
    setActiveSection(sectionId);
    if (!previewContainerRef.current) return;

    if (sectionId === 'all' || sectionId === 'hero') {
      previewContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetEl = previewContainerRef.current.querySelector(`#${sectionId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const resetPreviewScroll = () => {
    if (previewContainerRef.current) {
      previewContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('all');
    }
  };

  // Section items for deep-linking
  const SECTIONS = [
    { id: 'all', label: 'All' },
    { id: 'hero', label: 'Hero' },
    { id: 'marquee', label: 'Marquee' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projects' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'footer', label: 'Footer' },
  ];

  return (
    <div className={`w-full flex flex-col ${isDocked ? 'h-full min-h-[600px]' : 'space-y-6'}`}>
      {/* 1. Header Toolbar */}
      <div className="bg-white/90 p-4 sm:p-5 rounded-[28px] border border-[#E5E7EB] backdrop-blur-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: Real-Time Synced Badge & Device Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-label-small uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Real-Time Synced</span>
          </div>

          {/* Device Selectors */}
          <div className="flex items-center p-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-full">
            <button
              type="button"
              onClick={() => {
                setDeviceMode('desktop');
                setZoomScale(1);
              }}
              title="Desktop (Fluid 100%)"
              className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-label-small flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-white text-[#202526] shadow-xs font-medium'
                  : 'text-[#596769] hover:text-[#202526]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            {!isDocked && (
              <button
                type="button"
                onClick={() => {
                  setDeviceMode('laptop');
                  setZoomScale(1);
                }}
                title="Laptop (1280px)"
                className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-label-small flex items-center gap-1.5 transition-all cursor-pointer ${
                  deviceMode === 'laptop'
                    ? 'bg-white text-[#202526] shadow-xs font-medium'
                    : 'text-[#596769] hover:text-[#202526]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Laptop</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setDeviceMode('tablet');
                setZoomScale(isDocked ? 0.75 : 0.9);
              }}
              title="Tablet (768px iPad)"
              className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-label-small flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceMode === 'tablet'
                  ? 'bg-white text-[#202526] shadow-xs font-medium'
                  : 'text-[#596769] hover:text-[#202526]'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDeviceMode('mobile');
                setZoomScale(1);
              }}
              title="Mobile (390px iPhone)"
              className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-label-small flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-white text-[#202526] shadow-xs font-medium'
                  : 'text-[#596769] hover:text-[#202526]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Zoom Controller */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-full text-xs font-label-small">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(0.5, +(prev - 0.1).toFixed(1)))}
              className="p-1 text-[#596769] hover:text-[#202526] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-medium w-9 text-center text-[#202526]">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(1.2, +(prev + 0.1).toFixed(1)))}
              className="p-1 text-[#596769] hover:text-[#202526] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Section Jump Navigation & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Jump Buttons */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-white border border-[#E5E7EB] rounded-full overflow-x-auto max-w-md">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleScrollTo(sec.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-label-small uppercase tracking-wider transition-all cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-[#202526] text-white font-medium'
                    : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetPreviewScroll}
            className="p-2 rounded-full bg-white hover:bg-[#F3F4F6] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] transition-colors cursor-pointer shadow-xs"
            title="Scroll to Top"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onExitToLive && (
            <button
              type="button"
              onClick={onExitToLive}
              className="px-3.5 py-1.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Exit to Live Site</span>
              <ExternalLink className="w-3 h-3 text-[#D8A9A8]" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Device Viewport Frame Wrapper */}
      <div
        className={`w-full flex-1 flex items-center justify-center p-2 sm:p-6 bg-[#EEF0F2] rounded-[32px] border border-[#E5E7EB] overflow-hidden min-h-[600px] shadow-inner relative`}
      >
        {/* Subtle Background Canvas Grid */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* 3. Scaled Device Canvas Container */}
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
          className="w-full flex justify-center py-4"
        >
          {/* MOBILE DEVICE MOCKUP (iPhone 15/16 Pro Frame) */}
          {deviceMode === 'mobile' && (
            <div className="w-[390px] h-[820px] rounded-[52px] bg-[#1A1A1A] p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col relative border-4 border-[#3A3A3C] shrink-0">
              {/* Dynamic Island Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-[#111] border border-[#222]" />
                <span className="w-2 h-2 rounded-full bg-[#0a3518] shadow-[0_0_4px_#22c55e]" />
              </div>

              {/* Side Volume & Power Visual Ridges */}
              <div className="absolute -left-[7px] top-24 w-[3px] h-10 bg-[#555] rounded-l-sm" />
              <div className="absolute -left-[7px] top-38 w-[3px] h-12 bg-[#555] rounded-l-sm" />
              <div className="absolute -right-[7px] top-28 w-[3px] h-16 bg-[#555] rounded-r-sm" />

              {/* Internal Screen Viewport */}
              <div
                ref={previewContainerRef}
                className="w-full h-full bg-[#FFFFFF] rounded-[42px] overflow-y-auto overflow-x-hidden relative no-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
              >
                {/* Simulated iOS Status Bar */}
                <div className="sticky top-0 z-30 w-full pt-2 px-6 flex items-center justify-between text-[11px] font-semibold text-[#202526] pointer-events-none bg-white/70 backdrop-blur-md">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <div className="w-5 h-2.5 rounded-[4px] border border-[#202526] p-0.5 flex items-center">
                      <div className="w-full h-full bg-[#202526] rounded-[2px]" />
                    </div>
                  </div>
                </div>

                {/* Rendered Live Website Elements */}
                <div className="w-full flex flex-col select-none">
                  <HeroSection
                    content={storeState.websiteContent.hero}
                    onOpenContact={handleOpenContact}
                    onOpenPrice={handleOpenPrice}
                    onOpenEstimator={handleOpenEstimator}
                  />
                  <MarqueeSection content={storeState.websiteContent.marquee} />
                  <AboutSection content={storeState.websiteContent.about} />
                  <ServicesSection
                    content={storeState.websiteContent.services}
                    onOpenContact={handleOpenContact}
                    onOpenEstimator={handleOpenEstimator}
                  />
                  <ProjectsSection
                    projects={storeState.projects}
                    isLoading={false}
                    onSelectProject={handleSelectProject}
                  />
                  <ReviewsSection reviews={storeState.reviews} />
                  <FooterSection
                    contactContent={storeState.websiteContent.contact}
                    onOpenContact={handleOpenContact}
                    onOpenPrice={handleOpenPrice}
                    onOpenEstimator={handleOpenEstimator}
                  />
                </div>

                {/* Simulated Home Indicator Bar */}
                <div className="sticky bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#202526]/40 rounded-full pointer-events-none" />
              </div>
            </div>
          )}

          {/* TABLET DEVICE MOCKUP (iPad Frame) */}
          {deviceMode === 'tablet' && (
            <div className="w-[768px] h-[980px] rounded-[44px] bg-[#1E1E1E] p-4 shadow-[0_30px_70px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col relative border-4 border-[#333] shrink-0">
              {/* Front Camera */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0d0d0d] border border-[#222] z-40" />

              {/* Internal Screen Viewport */}
              <div
                ref={previewContainerRef}
                className="w-full h-full bg-[#FFFFFF] rounded-[32px] overflow-y-auto overflow-x-hidden relative"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="w-full flex flex-col select-none">
                  <HeroSection
                    content={storeState.websiteContent.hero}
                    onOpenContact={handleOpenContact}
                    onOpenPrice={handleOpenPrice}
                    onOpenEstimator={handleOpenEstimator}
                  />
                  <MarqueeSection content={storeState.websiteContent.marquee} />
                  <AboutSection content={storeState.websiteContent.about} />
                  <ServicesSection
                    content={storeState.websiteContent.services}
                    onOpenContact={handleOpenContact}
                    onOpenEstimator={handleOpenEstimator}
                  />
                  <ProjectsSection
                    projects={storeState.projects}
                    isLoading={false}
                    onSelectProject={handleSelectProject}
                  />
                  <ReviewsSection reviews={storeState.reviews} />
                  <FooterSection
                    contactContent={storeState.websiteContent.contact}
                    onOpenContact={handleOpenContact}
                    onOpenPrice={handleOpenPrice}
                    onOpenEstimator={handleOpenEstimator}
                  />
                </div>
              </div>
            </div>
          )}

          {/* LAPTOP DEVICE MOCKUP (1280px Container with Browser Header) */}
          {deviceMode === 'laptop' && (
            <div className="w-full max-w-[1280px] h-[850px] rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col border border-[#E5E7EB] overflow-hidden shrink-0">
              {/* Sleek Browser Top Bar */}
              <div className="w-full bg-[#F3F4F6] px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between text-xs text-[#596769]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#10B981]/80 inline-block" />
                  </div>
                  <span className="ml-3 text-[11px] font-label-small font-medium text-[#71717A]">
                    ai.build_ studio (Live Edge Preview)
                  </span>
                </div>

                <div className="flex-1 max-w-sm mx-4 px-3 py-1 rounded-md bg-white border border-[#E5E7EB] text-[11px] text-[#202526] font-mono flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-1 text-[#10B981]">
                    <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                    https://ai.build/preview
                  </span>
                  <span className="text-[#9CA3AF] text-[10px]">Real-Time Synced</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-small uppercase text-[10px]">
                    1280px Fluid
                  </span>
                </div>
              </div>

              {/* Internal Screen Viewport */}
              <div
                ref={previewContainerRef}
                className="w-full flex-1 bg-[#FFFFFF] overflow-y-auto overflow-x-hidden relative"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="w-full flex flex-col select-none">
                  <HeroSection
                    content={storeState.websiteContent.hero}
                    onOpenContact={handleOpenContact}
                    onOpenPrice={handleOpenPrice}
                    onOpenEstimator={handleOpenEstimator}
                  />
                  <MarqueeSection content={storeState.websiteContent.marquee} />
                  <AboutSection content={storeState.websiteContent.about} />
                  <ServicesSection
                    content={storeState.websiteContent.services}
                    onOpenContact={handleOpenContact}
                    onOpenEstimator={handleOpenEstimator}
                  />
                  <ProjectsSection
                    projects={storeState.projects}
                    isLoading={false}
                    onSelectProject={handleSelectProject}
                  />
                  <ReviewsSection reviews={storeState.reviews} />
                  <FooterSection
                    contactContent={storeState.websiteContent.contact}
                    onOpenContact={handleOpenContact}
                    onOpenPrice={handleOpenPrice}
                    onOpenEstimator={handleOpenEstimator}
                  />
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP FULL FLUID MODE */}
          {deviceMode === 'desktop' && (
            <div className="w-full h-[880px] rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col border border-[#E5E7EB] overflow-hidden shrink-0">
              {/* Browser Header Bar */}
              <div className="w-full bg-[#F8F9FA] px-4 py-2 border-b border-[#E5E7EB] flex items-center justify-between text-xs text-[#596769]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="ml-2 font-label-small text-[11px] text-[#202526] font-medium">
                    Live Production Canvas &bull; Full Responsive Desktop
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-time Changes Active</span>
                </div>
              </div>

              {/* Internal Screen Viewport */}
              <div
                ref={previewContainerRef}
                className="w-full flex-1 bg-[#FFFFFF] overflow-y-auto overflow-x-hidden relative"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="w-full flex flex-col select-none">
                  <HeroSection
                    content={storeState.websiteContent.hero}
                    onOpenContact={handleOpenContact}
                    onOpenPrice={handleOpenPrice}
                    onOpenEstimator={handleOpenEstimator}
                  />
                  <MarqueeSection content={storeState.websiteContent.marquee} />
                  <AboutSection content={storeState.websiteContent.about} />
                  <ServicesSection
                    content={storeState.websiteContent.services}
                    onOpenContact={handleOpenContact}
                    onOpenEstimator={handleOpenEstimator}
                  />
                  <ProjectsSection
                    projects={storeState.projects}
                    isLoading={false}
                    onSelectProject={handleSelectProject}
                  />
                  <ReviewsSection reviews={storeState.reviews} />
                  <FooterSection
                    contactContent={storeState.websiteContent.contact}
                    onOpenContact={handleOpenContact}
                    onOpenPrice={handleOpenPrice}
                    onOpenEstimator={handleOpenEstimator}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Modals inside preview so clicks work */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        contactContent={storeState.websiteContent.contact}
        initialProjectType={contactProjectType}
        initialBudget={contactInitialBudget}
        initialMessage={contactInitialMessage}
      />

      <PriceModal isOpen={isPriceOpen} onClose={() => setIsPriceOpen(false)} />

      <EstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
        onProceedToContact={(scopeData) => {
          setIsEstimatorOpen(false);
          handleOpenContact(
            scopeData.projectType,
            scopeData.budget,
            `Scope Summary:\n\n${scopeData.summary}`
          );
        }}
        estimatorSettings={storeState.estimatorSettings}
      />

      <ProjectModal
        isOpen={Boolean(selectedProject)}
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenContact={handleOpenContact}
      />
    </div>
  );
};
