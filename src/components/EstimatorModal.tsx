import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  Sparkles,
  Video,
  Globe,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Layers,
  Volume2,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Sparkle,
} from 'lucide-react';
import { EstimatorSettings } from '../types';
import { adminStore, playStudioChime } from '../services/adminStore';

interface EstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: EstimatorSettings;
  onProceedToContact: (scopeData: {
    projectType: string;
    budget: string;
    timeline: string;
    summary: string;
  }) => void;
  onOpenContact?: () => void;
}

type ServiceCategory = 'ai-video' | 'ugc-ads' | 'web-automation';

export const EstimatorModal: React.FC<EstimatorModalProps> = ({
  isOpen,
  onClose,
  settings: propSettings,
  onProceedToContact,
  onOpenContact,
}) => {
  // Use passed settings or fallback to current store state
  const settings: EstimatorSettings = propSettings || adminStore.getEstimatorSettings();

  // Find the first enabled category
  const defaultCategory: ServiceCategory = useMemo(() => {
    if (settings.categories.aiVideo.enabled) return 'ai-video';
    if (settings.categories.ugcAds.enabled) return 'ugc-ads';
    if (settings.categories.webAutomation.enabled) return 'web-automation';
    return 'ai-video';
  }, [settings]);

  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(defaultCategory);
  const [copied, setCopied] = useState(false);

  // Handle body scroll locking & Escape key hygiene
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sync category if active one is disabled
  useEffect(() => {
    if (activeCategory === 'ai-video' && !settings.categories.aiVideo.enabled) {
      setActiveCategory(defaultCategory);
    } else if (activeCategory === 'ugc-ads' && !settings.categories.ugcAds.enabled) {
      setActiveCategory(defaultCategory);
    } else if (activeCategory === 'web-automation' && !settings.categories.webAutomation.enabled) {
      setActiveCategory(defaultCategory);
    }
  }, [settings, activeCategory, defaultCategory]);

  // --- 1. AI Video Configuration ---
  const [videoCount, setVideoCount] = useState<number>(() => settings.categories.aiVideo.defaultVideoCount || 2);
  const [videoLength, setVideoLength] = useState<'15s' | '30s' | '60s' | '90s+'>('30s');
  const [videoFidelity, setVideoFidelity] = useState<'cinematic' | 'hyper-3d'>('cinematic');
  const [includeSpatialAudio, setIncludeSpatialAudio] = useState<boolean>(true);
  const [includeVoiceClone, setIncludeVoiceClone] = useState<boolean>(true);

  // --- 2. UGC Ads Configuration ---
  const [ugcAdCount, setUgcAdCount] = useState<number>(() => settings.categories.ugcAds.defaultAdCount || 4);
  const [hookVariations, setHookVariations] = useState<number>(() => settings.categories.ugcAds.defaultHooks || 3);
  const [multiPlatformExports, setMultiPlatformExports] = useState<boolean>(true);
  const [talentLicensing, setTalentLicensing] = useState<'ai-persona' | 'real-creator'>('ai-persona');

  // --- 3. Web & Automation Configuration ---
  const [webScope, setWebScope] = useState<'landing' | 'full-app' | 'ai-pipeline'>('landing');
  const [has3DCanvas, setHas3DCanvas] = useState<boolean>(true);
  const [hasAdminCMS, setHasAdminCMS] = useState<boolean>(true);
  const [hasDatabaseAuth, setHasDatabaseAuth] = useState<boolean>(false);

  // --- Global Pace / Urgency ---
  const [turnaroundSpeed, setTurnaroundSpeed] = useState<'standard' | 'rush'>('standard');

  // Calculation Engine
  const estimate = useMemo(() => {
    let baseMin = 0;
    let baseMax = 0;
    let daysMin = 3;
    let daysMax = 7;
    const deliverables: string[] = [];

    const videoConfig = settings.categories.aiVideo;
    const ugcConfig = settings.categories.ugcAds;
    const webConfig = settings.categories.webAutomation;

    if (activeCategory === 'ai-video') {
      const lengthMult =
        videoLength === '15s' ? 0.8 : videoLength === '30s' ? 1.0 : videoLength === '60s' ? 1.4 : 1.9;
      const fidelityBase =
        videoFidelity === 'cinematic'
          ? (videoConfig.basePriceCinematic || 1400)
          : (videoConfig.basePriceHyper3D || 2200);

      baseMin = videoCount * fidelityBase * lengthMult;
      baseMax = baseMin * 1.35;

      if (includeSpatialAudio) {
        const rate = videoConfig.spatialAudioPricePerVideo || 350;
        baseMin += rate * videoCount;
        baseMax += (rate * 1.5) * videoCount;
        deliverables.push('Bespoke Spatial Audio & Foley Soundscape');
      }
      if (includeVoiceClone) {
        const rate = videoConfig.voiceClonePricePerVideo || 250;
        baseMin += rate * videoCount;
        baseMax += (rate * 1.6) * videoCount;
        deliverables.push('Neural Voice Clone & Multilingual Dubbing');
      }

      deliverables.unshift(
        `${videoCount}x ${videoLength} ${videoFidelity === 'hyper-3d' ? '3D NeRF / Simulation' : 'Cinematic AI'} Video Master(s)`
      );
      deliverables.push('Ad-Ready 4K Resolution & Multi-Aspect Exports');

      daysMin = Math.max(3, videoCount * 2);
      daysMax = Math.max(5, videoCount * 3 + (videoFidelity === 'hyper-3d' ? 3 : 0));
    } else if (activeCategory === 'ugc-ads') {
      const basePerAd =
        talentLicensing === 'ai-persona'
          ? (ugcConfig.basePriceAiPersona || 650)
          : (ugcConfig.basePriceRealCreator || 1100);
      const hookPrice = ugcConfig.hookVariationPrice || 180;
      baseMin = ugcAdCount * basePerAd + hookVariations * hookPrice;
      baseMax = baseMin * 1.3;

      deliverables.push(`${ugcAdCount}x High-Converting Performance UGC Creative(s)`);
      deliverables.push(`${hookVariations} Hook Variations per Ad Concept`);
      if (multiPlatformExports) {
        deliverables.push('9:16 (TikTok/Reels), 1:1 (Feed), 16:9 (YouTube) Exports');
      }
      deliverables.push(
        talentLicensing === 'ai-persona'
          ? 'Curated Photoreal AI Creator Personas'
          : 'Licensed Creator Talent & Usage Rights'
      );

      daysMin = Math.max(2, ugcAdCount * 1);
      daysMax = Math.max(4, ugcAdCount * 2);
    } else {
      // Web & Automations
      if (webScope === 'landing') {
        baseMin = webConfig.landingPagePriceMin || 3800;
        baseMax = webConfig.landingPagePriceMax || 6500;
        deliverables.push('Interactive Bespoke Landing Page with Fluid Motion');
        daysMin = 5;
        daysMax = 9;
      } else if (webScope === 'full-app') {
        baseMin = webConfig.fullAppPriceMin || 7500;
        baseMax = webConfig.fullAppPriceMax || 14000;
        deliverables.push('Full-Stack React Web Application with Scalable Architecture');
        daysMin = 10;
        daysMax = 18;
      } else {
        baseMin = webConfig.aiPipelinePriceMin || 9500;
        baseMax = webConfig.aiPipelinePriceMax || 18500;
        deliverables.push('Intelligent AI Agent Pipeline & Automated Workflows');
        daysMin = 12;
        daysMax = 22;
      }

      if (has3DCanvas) {
        const addon = webConfig.canvas3DAddonPrice || 1200;
        baseMin += addon;
        baseMax += addon * 1.8;
        deliverables.push('3D WebGL / Interactive Canvas Experience');
        daysMax += 2;
      }
      if (hasAdminCMS) {
        const addon = webConfig.adminCmsAddonPrice || 800;
        baseMin += addon;
        baseMax += addon * 1.8;
        deliverables.push('Custom Owner CMS & Media Management Suite');
      }
      if (hasDatabaseAuth) {
        const addon = webConfig.databaseAuthAddonPrice || 1100;
        baseMin += addon;
        baseMax += addon * 1.8;
        deliverables.push('Cloud Database & Secure Multi-Role Auth');
        daysMax += 3;
      }
    }

    if (turnaroundSpeed === 'rush') {
      const surcharge = (settings.rushSurchargePercentage || 25) / 100;
      baseMin *= 1 + surcharge;
      baseMax *= 1 + surcharge;
      daysMin = Math.max(2, Math.round(daysMin * 0.55));
      daysMax = Math.max(3, Math.round(daysMax * 0.6));
      deliverables.push(`⚡ Priority 48h-72h Rapid Turnaround Sprint (+${settings.rushSurchargePercentage || 25}%)`);
    }

    // Format output strings
    const formattedMin = `$${Math.round(baseMin / 50) * 50}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedMax = `$${Math.round(baseMax / 50) * 50}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const budgetRange = `${formattedMin} – ${formattedMax}`;
    const timeline = `${daysMin} – ${daysMax} Business Days`;

    const projectTypeName =
      activeCategory === 'ai-video'
        ? settings.categories.aiVideo.title
        : activeCategory === 'ugc-ads'
        ? settings.categories.ugcAds.title
        : settings.categories.webAutomation.title;

    return {
      formattedMin,
      formattedMax,
      budgetRange,
      timeline,
      deliverables,
      projectTypeName,
    };
  }, [
    activeCategory,
    videoCount,
    videoLength,
    videoFidelity,
    includeSpatialAudio,
    includeVoiceClone,
    ugcAdCount,
    hookVariations,
    multiPlatformExports,
    talentLicensing,
    webScope,
    has3DCanvas,
    hasAdminCMS,
    hasDatabaseAuth,
    turnaroundSpeed,
    settings,
  ]);

  const handleCopy = () => {
    const summaryText = `AI Build Scope Estimate\nDiscipline: ${estimate.projectTypeName}\nInvestment Range: ${estimate.budgetRange}\nEstimated Timeline: ${estimate.timeline}\nIncluded Deliverables:\n${estimate.deliverables.map((d) => `• ${d}`).join('\n')}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    playStudioChime('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceed = () => {
    playStudioChime('click');
    onProceedToContact({
      projectType: estimate.projectTypeName,
      budget: estimate.budgetRange,
      timeline: estimate.timeline,
      summary: `Configured Scope (${estimate.projectTypeName}): ${estimate.deliverables.join('; ')}`,
    });
    onClose();
  };

  const resetConfig = () => {
    playStudioChime('click');
    setVideoCount(settings.categories.aiVideo.defaultVideoCount || 2);
    setVideoLength('30s');
    setVideoFidelity('cinematic');
    setIncludeSpatialAudio(true);
    setIncludeVoiceClone(true);
    setUgcAdCount(settings.categories.ugcAds.defaultAdCount || 4);
    setHookVariations(settings.categories.ugcAds.defaultHooks || 3);
    setMultiPlatformExports(true);
    setTalentLicensing('ai-persona');
    setWebScope('landing');
    setHas3DCanvas(true);
    setHasAdminCMS(true);
    setHasDatabaseAuth(false);
    setTurnaroundSpeed('standard');
  };

  const isAnyCategoryEnabled =
    settings.categories.aiVideo.enabled ||
    settings.categories.ugcAds.enabled ||
    settings.categories.webAutomation.enabled;

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          {/* Frosted Backdrop with Noise Grain */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="frosted-backdrop"
          />

          {/* Modal Container with Frosted Glass and Grain */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 25 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl frosted-modal-glass rounded-[28px] sm:rounded-[36px] p-4 sm:p-7 md:p-9 shadow-2xl text-[#202526] z-10 my-4 max-h-[92dvh] overflow-y-auto overflow-x-hidden font-sans-clean"
          >
            {/* Top Bar / Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#B8C1C0]/60 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D8A9A8]/30 border border-[#D8A9A8] flex items-center justify-center text-[#202526]">
                  <Sliders className="w-4 h-4 text-[#202526]" />
                </div>
                <div>
                  <span className="text-[10px] font-label-small uppercase tracking-[0.08em] text-[#596769] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] animate-pulse" />
                    Real-time Scope Engine
                  </span>
                  <h3 className="font-elegant text-xl sm:text-2xl uppercase tracking-tight text-[#202526] leading-none">
                    {settings.modalTitle || 'AI Project Cost & Timeline Estimator'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {settings.isEnabled && isAnyCategoryEnabled && (
                  <button
                    type="button"
                    onClick={resetConfig}
                    title="Reset to defaults"
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E7EBE9] hover:bg-[#AFC7C5] text-[11px] font-mono uppercase tracking-wider text-[#596769] hover:text-[#202526] transition-colors border border-[#B8C1C0] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full bg-[#CBDCDE] hover:bg-[#AFC7C5] text-[#202526] border border-[#B8C1C0] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Offline / Bespoke Mode Banner if disabled in CMS */}
            {!settings.isEnabled || !isAnyCategoryEnabled ? (
              <div className="py-12 px-6 text-center space-y-5 relative z-10 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-3xl bg-[#D8A9A8]/20 border border-[#D8A9A8] flex items-center justify-center mx-auto text-[#202526]">
                  <Sparkles className="w-7 h-7 text-[#202526]" />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-label-small uppercase tracking-widest text-[#596769] font-semibold">
                    Studio Capacity Update
                  </span>
                  <h4 className="font-elegant text-2xl uppercase text-[#202526]">
                    Bespoke Creative Consultation
                  </h4>
                  <p className="text-xs sm:text-sm text-[#596769] font-body leading-relaxed">
                    {settings.modalSubtitle ||
                      'Interactive automated scoping is currently reserved for direct evaluation while our directors are engaged in custom client sprints. Share your brief directly for an expedited proposal.'}
                  </p>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenContact) {
                        onOpenContact();
                      } else {
                        onProceedToContact({
                          projectType: 'Bespoke AI Project',
                          budget: '$5,000 – $15,000',
                          timeline: '5 – 10 Business Days',
                          summary: 'Bespoke client consultation request.',
                        });
                      }
                      onClose();
                    }}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-[#E7EBE9] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4 text-[#D8A9A8]" />
                    <span>Request Bespoke Proposal</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#CBDCDE]/70 hover:bg-[#CBDCDE] text-[#202526] text-xs font-semibold uppercase tracking-wider border border-[#B8C1C0] cursor-pointer"
                  >
                    Back to Studio
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Service Category Selector Tabs (Filtered to enabled ones in CMS) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 my-5 relative z-10">
                  {settings.categories.aiVideo.enabled && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory('ai-video')}
                      className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl border text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        activeCategory === 'ai-video'
                          ? 'bg-[#202526] text-[#E7EBE9] border-[#202526] shadow-md'
                          : 'bg-[#CBDCDE]/70 text-[#202526] border-[#B8C1C0] hover:bg-[#CBDCDE]'
                      }`}
                    >
                      <Video className="w-4 h-4 shrink-0 text-[#D8A9A8]" />
                      <span className="truncate">{settings.categories.aiVideo.title}</span>
                    </button>
                  )}

                  {settings.categories.ugcAds.enabled && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory('ugc-ads')}
                      className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl border text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        activeCategory === 'ugc-ads'
                          ? 'bg-[#202526] text-[#E7EBE9] border-[#202526] shadow-md'
                          : 'bg-[#CBDCDE]/70 text-[#202526] border-[#B8C1C0] hover:bg-[#CBDCDE]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0 text-[#D8A9A8]" />
                      <span className="truncate">{settings.categories.ugcAds.title}</span>
                    </button>
                  )}

                  {settings.categories.webAutomation.enabled && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory('web-automation')}
                      className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl border text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        activeCategory === 'web-automation'
                          ? 'bg-[#202526] text-[#E7EBE9] border-[#202526] shadow-md'
                          : 'bg-[#CBDCDE]/70 text-[#202526] border-[#B8C1C0] hover:bg-[#CBDCDE]'
                      }`}
                    >
                      <Globe className="w-4 h-4 shrink-0 text-[#D8A9A8]" />
                      <span className="truncate">{settings.categories.webAutomation.title}</span>
                    </button>
                  )}
                </div>

                {/* Main Interactive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-start">
                  {/* Left Column: Interactive Sliders & Toggles (7 Cols) */}
                  <div className="lg:col-span-7 space-y-5 bg-[#CBDCDE]/50 border border-[#AFC7C5]/70 rounded-3xl p-5 sm:p-6">
                    {/* 1. Category-specific Controls */}
                    {activeCategory === 'ai-video' && (
                      <div className="space-y-4">
                        {/* Video Count Slider */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-[#202526]">
                              Number of Video Assets
                            </label>
                            <span className="text-sm font-mono font-bold bg-[#E7EBE9] px-3 py-0.5 rounded-full border border-[#B8C1C0] text-[#202526]">
                              {videoCount} {videoCount === 1 ? 'Film' : 'Films'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={settings.categories.aiVideo.minVideos || 1}
                            max={settings.categories.aiVideo.maxVideos || 8}
                            step="1"
                            value={videoCount}
                            onChange={(e) => setVideoCount(Number(e.target.value))}
                            className="w-full h-2 bg-[#AFC7C5] rounded-lg appearance-none cursor-pointer accent-[#202526]"
                          />
                          <div className="flex justify-between text-[10px] font-mono text-[#596769] mt-1">
                            <span>1 Single Hero</span>
                            <span>4 Campaign Stack</span>
                            <span>8 Full Suite</span>
                          </div>
                        </div>

                        {/* Duration Buttons */}
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-semibold text-[#202526] mb-2">
                            Target Duration per Master
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {(['15s', '30s', '60s', '90s+'] as const).map((len) => (
                              <button
                                key={len}
                                type="button"
                                onClick={() => setVideoLength(len)}
                                className={`py-2 rounded-xl border text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                                  videoLength === len
                                    ? 'bg-[#202526] text-[#E7EBE9] border-[#202526]'
                                    : 'bg-[#E7EBE9] text-[#202526] border-[#B8C1C0] hover:bg-[#AFC7C5]'
                                }`}
                              >
                                {len}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Fidelity Selector */}
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-semibold text-[#202526] mb-2">
                            Visual Fidelity Pipeline
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setVideoFidelity('cinematic')}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                videoFidelity === 'cinematic'
                                  ? 'bg-[#202526] text-[#E7EBE9] border-[#202526]'
                                  : 'bg-[#E7EBE9] text-[#202526] border-[#B8C1C0] hover:bg-[#AFC7C5]'
                              }`}
                            >
                              <div className="text-xs font-semibold uppercase">Cinematic AI Diffusion</div>
                              <div className="text-[11px] opacity-75 font-body">Photoreal motion, lighting &amp; atmospheric grade</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setVideoFidelity('hyper-3d')}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                videoFidelity === 'hyper-3d'
                                  ? 'bg-[#202526] text-[#E7EBE9] border-[#202526]'
                                  : 'bg-[#E7EBE9] text-[#202526] border-[#B8C1C0] hover:bg-[#AFC7C5]'
                              }`}
                            >
                              <div className="text-xs font-semibold uppercase">3D NeRF / Simulation</div>
                              <div className="text-[11px] opacity-75 font-body">Complex camera physics, 3D assets &amp; depth passes</div>
                            </button>
                          </div>
                        </div>

                        {/* Audio Addons */}
                        <div className="pt-2 border-t border-[#B8C1C0]/60 space-y-2">
                          <label className="block text-xs uppercase tracking-wider font-semibold text-[#202526]">
                            Audio &amp; Voice Engineering Addons
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeSpatialAudio}
                                onChange={(e) => setIncludeSpatialAudio(e.target.checked)}
                                className="w-4 h-4 accent-[#202526] rounded cursor-pointer"
                              />
                              <div className="text-xs">
                                <span className="font-semibold block">Spatial Soundscape</span>
                                <span className="text-[10px] text-[#596769]">
                                  +${settings.categories.aiVideo.spatialAudioPricePerVideo || 350}/video
                                </span>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeVoiceClone}
                                onChange={(e) => setIncludeVoiceClone(e.target.checked)}
                                className="w-4 h-4 accent-[#202526] rounded cursor-pointer"
                              />
                              <div className="text-xs">
                                <span className="font-semibold block">Neural Voice Clone</span>
                                <span className="text-[10px] text-[#596769]">
                                  +${settings.categories.aiVideo.voiceClonePricePerVideo || 250}/video
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeCategory === 'ugc-ads' && (
                      <div className="space-y-4">
                        {/* UGC Ad Count Slider */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-[#202526]">
                              Creative Performance Pack Size
                            </label>
                            <span className="text-sm font-mono font-bold bg-[#E7EBE9] px-3 py-0.5 rounded-full border border-[#B8C1C0] text-[#202526]">
                              {ugcAdCount} Creatives
                            </span>
                          </div>
                          <input
                            type="range"
                            min={settings.categories.ugcAds.minAds || 1}
                            max={settings.categories.ugcAds.maxAds || 12}
                            step="1"
                            value={ugcAdCount}
                            onChange={(e) => setUgcAdCount(Number(e.target.value))}
                            className="w-full h-2 bg-[#AFC7C5] rounded-lg appearance-none cursor-pointer accent-[#202526]"
                          />
                          <div className="flex justify-between text-[10px] font-mono text-[#596769] mt-1">
                            <span>1 Test Ad</span>
                            <span>4 Growth Sprint</span>
                            <span>12 Scale Engine</span>
                          </div>
                        </div>

                        {/* Hook Variations Slider */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-[#202526]">
                              Hook Variations per Creative
                            </label>
                            <span className="text-sm font-mono font-bold bg-[#E7EBE9] px-3 py-0.5 rounded-full border border-[#B8C1C0] text-[#202526]">
                              {hookVariations} Hooks / Ad (${settings.categories.ugcAds.hookVariationPrice || 180}/ea)
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="6"
                            step="1"
                            value={hookVariations}
                            onChange={(e) => setHookVariations(Number(e.target.value))}
                            className="w-full h-2 bg-[#AFC7C5] rounded-lg appearance-none cursor-pointer accent-[#202526]"
                          />
                          <div className="flex justify-between text-[10px] font-mono text-[#596769] mt-1">
                            <span>1 Static Hook</span>
                            <span>3 A/B/C Test Matrix</span>
                            <span>6 High-Velocity</span>
                          </div>
                        </div>

                        {/* Talent Licensing */}
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-semibold text-[#202526] mb-2">
                            Creator Persona &amp; Talent Source
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setTalentLicensing('ai-persona')}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                talentLicensing === 'ai-persona'
                                  ? 'bg-[#202526] text-[#E7EBE9] border-[#202526]'
                                  : 'bg-[#E7EBE9] text-[#202526] border-[#B8C1C0] hover:bg-[#AFC7C5]'
                              }`}
                            >
                              <div className="text-xs font-semibold uppercase">Custom AI Personas</div>
                              <div className="text-[11px] opacity-75 font-body">
                                Photoreal generative avatars (${settings.categories.ugcAds.basePriceAiPersona || 650}/ad)
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTalentLicensing('real-creator')}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                talentLicensing === 'real-creator'
                                  ? 'bg-[#202526] text-[#E7EBE9] border-[#202526]'
                                  : 'bg-[#E7EBE9] text-[#202526] border-[#B8C1C0] hover:bg-[#AFC7C5]'
                              }`}
                            >
                              <div className="text-xs font-semibold uppercase">Licensed Real Creators</div>
                              <div className="text-[11px] opacity-75 font-body">
                                Verified creator talent (${settings.categories.ugcAds.basePriceRealCreator || 1100}/ad)
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Platform Aspect Ratio Checkbox */}
                        <div className="pt-2 border-t border-[#B8C1C0]/60">
                          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={multiPlatformExports}
                              onChange={(e) => setMultiPlatformExports(e.target.checked)}
                              className="w-4 h-4 accent-[#202526] rounded cursor-pointer"
                            />
                            <div className="text-xs">
                              <span className="font-semibold block">Multi-Platform Asset Pack (9:16 + 1:1 + 16:9)</span>
                              <span className="text-[10px] text-[#596769]">Optimized for TikTok, Meta Ads &amp; YouTube Shorts</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {activeCategory === 'web-automation' && (
                      <div className="space-y-4">
                        {/* Scope Archetype */}
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-semibold text-[#202526] mb-2">
                            Project Archetype &amp; Architecture
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setWebScope('landing')}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                webScope === 'landing'
                                  ? 'bg-[#202526] text-[#E7EBE9] border-[#202526]'
                                  : 'bg-[#E7EBE9] text-[#202526] border-[#B8C1C0] hover:bg-[#AFC7C5]'
                              }`}
                            >
                              <div className="text-xs font-semibold uppercase">Landing Page</div>
                              <div className="text-[10px] opacity-75">
                                ${(settings.categories.webAutomation.landingPagePriceMin || 3800).toLocaleString()}+
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setWebScope('full-app')}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                webScope === 'full-app'
                                  ? 'bg-[#202526] text-[#E7EBE9] border-[#202526]'
                                  : 'bg-[#E7EBE9] text-[#202526] border-[#B8C1C0] hover:bg-[#AFC7C5]'
                              }`}
                            >
                              <div className="text-xs font-semibold uppercase">Full App</div>
                              <div className="text-[10px] opacity-75">
                                ${(settings.categories.webAutomation.fullAppPriceMin || 7500).toLocaleString()}+
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setWebScope('ai-pipeline')}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                webScope === 'ai-pipeline'
                                  ? 'bg-[#202526] text-[#E7EBE9] border-[#202526]'
                                  : 'bg-[#E7EBE9] text-[#202526] border-[#B8C1C0] hover:bg-[#AFC7C5]'
                              }`}
                            >
                              <div className="text-xs font-semibold uppercase">AI Pipeline</div>
                              <div className="text-[10px] opacity-75">
                                ${(settings.categories.webAutomation.aiPipelinePriceMin || 9500).toLocaleString()}+
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Modules */}
                        <div className="pt-2 border-t border-[#B8C1C0]/60 space-y-2">
                          <label className="block text-xs uppercase tracking-wider font-semibold text-[#202526]">
                            Interactive &amp; System Modules
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={has3DCanvas}
                                onChange={(e) => setHas3DCanvas(e.target.checked)}
                                className="w-4 h-4 accent-[#202526] rounded cursor-pointer"
                              />
                              <div className="text-xs">
                                <span className="font-semibold block">Interactive 3D WebGL / Particle Canvas</span>
                                <span className="text-[10px] text-[#596769]">
                                  +${(settings.categories.webAutomation.canvas3DAddonPrice || 1200).toLocaleString()} (fluid physics and dynamic lighting)
                                </span>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasAdminCMS}
                                onChange={(e) => setHasAdminCMS(e.target.checked)}
                                className="w-4 h-4 accent-[#202526] rounded cursor-pointer"
                              />
                              <div className="text-xs">
                                <span className="font-semibold block">Owner Management CMS Suite</span>
                                <span className="text-[10px] text-[#596769]">
                                  +${(settings.categories.webAutomation.adminCmsAddonPrice || 800).toLocaleString()} (media manager, project editor &amp; lead hub)
                                </span>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasDatabaseAuth}
                                onChange={(e) => setHasDatabaseAuth(e.target.checked)}
                                className="w-4 h-4 accent-[#202526] rounded cursor-pointer"
                              />
                              <div className="text-xs">
                                <span className="font-semibold block">Cloud Database &amp; Secure Multi-Role Auth</span>
                                <span className="text-[10px] text-[#596769]">
                                  +${(settings.categories.webAutomation.databaseAuthAddonPrice || 1100).toLocaleString()} (PostgreSQL / Firestore &amp; token sessions)
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Turnaround Pace Selector */}
                    <div className="pt-3 border-t border-[#B8C1C0]/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#202526] block">
                          Delivery Cadence
                        </span>
                        <span className="text-[11px] text-[#596769]">
                          {turnaroundSpeed === 'rush'
                            ? `⚡ Accelerated sprint (+${settings.rushSurchargePercentage || 25}%)`
                            : 'Standard studio timeline'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 p-1 bg-[#E7EBE9] rounded-full border border-[#B8C1C0]">
                        <button
                          type="button"
                          onClick={() => setTurnaroundSpeed('standard')}
                          className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                            turnaroundSpeed === 'standard'
                              ? 'bg-[#202526] text-[#E7EBE9]'
                              : 'text-[#596769] hover:text-[#202526]'
                          }`}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => setTurnaroundSpeed('rush')}
                          className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                            turnaroundSpeed === 'rush'
                              ? 'bg-[#D8A9A8] text-[#202526]'
                              : 'text-[#596769] hover:text-[#202526]'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>Rush Sprint (+{settings.rushSurchargePercentage || 25}%)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Output & Commercial Summary Card (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-[#202526] text-[#E7EBE9] rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
                      {/* Ambient Accent Glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8A9A8]/15 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center justify-between border-b border-[#596769]/50 pb-4">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#D8A9A8]">
                          Estimated Commercial Investment
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#AFC7C5]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{estimate.timeline}</span>
                        </div>
                      </div>

                      {/* Main Dynamic Price Display */}
                      <div>
                        <div className="font-elegant text-3xl sm:text-4xl text-[#E7EBE9] tracking-tight">
                          {estimate.budgetRange}
                        </div>
                        <span className="text-[11px] text-[#AFC7C5] block mt-1">
                          *USD pricing includes full commercial usage rights &amp; source transfer.
                        </span>
                      </div>

                      {/* Deliverables Checklist */}
                      <div className="space-y-2 pt-2 border-t border-[#596769]/50">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#D8A9A8] block">
                          Included Deliverables
                        </span>
                        <div className="space-y-1.5">
                          {estimate.deliverables.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-[#E7EBE9]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D8A9A8] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTAs */}
                      <div className="space-y-2.5 pt-2">
                        <button
                          type="button"
                          onClick={handleProceed}
                          className="w-full py-3.5 rounded-full bg-[#E7EBE9] hover:bg-white text-[#202526] text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-98"
                        >
                          <span>Lock In Scope &amp; Book Project</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={handleCopy}
                          className="w-full py-2.5 rounded-full bg-transparent hover:bg-white/10 text-[#AFC7C5] hover:text-[#E7EBE9] text-xs font-mono uppercase tracking-wider border border-[#596769]/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#D8A9A8]" />
                              <span>Scope Summary Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Scope Summary</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Studio Guarantee & Note */}
                    <div className="p-4 rounded-2xl bg-[#CBDCDE]/40 border border-[#AFC7C5]/60 text-xs text-[#596769] space-y-1">
                      <div className="font-semibold text-[#202526] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#202526]" />
                        <span>Studio Production Guarantee</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Quotes generated by this engine include 2 comprehensive revision rounds, ad-ready 4K master outputs, and continuous staging previews.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
