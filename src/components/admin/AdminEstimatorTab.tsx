import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sliders,
  Sparkles,
  Video,
  Globe,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Layers,
  Volume2,
  FileText,
  BookmarkPlus,
  Send,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Users,
  Search,
  CheckCheck,
  Settings2,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Save,
  HelpCircle,
  AlertCircle,
  Tag,
  Percent,
} from 'lucide-react';
import { adminStore, AdminStoreState, playStudioChime } from '../../services/adminStore';
import { SavedScopeQuote, PublicMessage, EstimatorSettings } from '../../types';

type ServiceCategory = 'ai-video' | 'ugc-ads' | 'web-automation';

interface AdminEstimatorTabProps {
  savedQuotes: SavedScopeQuote[];
  messages: PublicMessage[];
  estimatorSettings?: EstimatorSettings;
}

export const AdminEstimatorTab: React.FC<AdminEstimatorTabProps> = ({
  savedQuotes,
  messages,
  estimatorSettings: propSettings,
}) => {
  const [activeSubView, setActiveSubView] = useState<'calculator' | 'saved-quotes' | 'cms-config'>('calculator');
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('ai-video');
  const [copiedProposal, setCopiedProposal] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  // Editable CMS Settings form state initialized from store
  const [settingsForm, setSettingsForm] = useState<EstimatorSettings>(() => {
    return propSettings || adminStore.getEstimatorSettings();
  });

  // Sync if prop updates
  useEffect(() => {
    if (propSettings) {
      setSettingsForm(propSettings);
    }
  }, [propSettings]);

  // Client Targeting Info for customized quotes
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // --- 1. AI Video Configuration ---
  const [videoCount, setVideoCount] = useState<number>(3);
  const [videoLength, setVideoLength] = useState<'15s' | '30s' | '60s' | '90s+'>('30s');
  const [videoFidelity, setVideoFidelity] = useState<'cinematic' | 'hyper-3d'>('cinematic');
  const [includeSpatialAudio, setIncludeSpatialAudio] = useState<boolean>(true);
  const [includeVoiceClone, setIncludeVoiceClone] = useState<boolean>(true);

  // --- 2. UGC Ads Configuration ---
  const [ugcAdCount, setUgcAdCount] = useState<number>(4);
  const [hookVariations, setHookVariations] = useState<number>(3);
  const [multiPlatformExports, setMultiPlatformExports] = useState<boolean>(true);
  const [talentLicensing, setTalentLicensing] = useState<'ai-persona' | 'real-creator'>('ai-persona');

  // --- 3. Web & Automation Configuration ---
  const [webScope, setWebScope] = useState<'landing' | 'full-app' | 'ai-pipeline'>('full-app');
  const [has3DCanvas, setHas3DCanvas] = useState<boolean>(true);
  const [hasAdminCMS, setHasAdminCMS] = useState<boolean>(true);
  const [hasDatabaseAuth, setHasDatabaseAuth] = useState<boolean>(true);

  // --- Global Pace / Urgency ---
  const [turnaroundSpeed, setTurnaroundSpeed] = useState<'standard' | 'rush'>('standard');

  // Search & Filter for Saved Quotes
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'declined'>('all');

  // Handle selecting an incoming lead to auto-populate quote
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = messages.find((m) => m.id === leadId);
    if (lead) {
      setClientName(lead.name);
      setClientEmail(lead.email);
      setClientNotes(`Lead inquiry: "${lead.message.slice(0, 150)}${lead.message.length > 150 ? '...' : ''}"`);

      // Match category
      if (lead.projectType.toLowerCase().includes('ugc')) {
        setActiveCategory('ugc-ads');
      } else if (lead.projectType.toLowerCase().includes('video')) {
        setActiveCategory('ai-video');
      } else {
        setActiveCategory('web-automation');
      }
      playStudioChime('click');
    }
  };

  // Calculation Engine based on dynamic CMS configured rates
  const estimate = useMemo(() => {
    let baseMin = 0;
    let baseMax = 0;
    let daysMin = 3;
    let daysMax = 7;
    const deliverables: string[] = [];
    const lineItems: Array<{ item: string; cost: string }> = [];

    const videoConfig = settingsForm.categories.aiVideo;
    const ugcConfig = settingsForm.categories.ugcAds;
    const webConfig = settingsForm.categories.webAutomation;

    if (activeCategory === 'ai-video') {
      const lengthMult =
        videoLength === '15s' ? 0.8 : videoLength === '30s' ? 1.0 : videoLength === '60s' ? 1.4 : 1.9;
      const fidelityBase =
        videoFidelity === 'cinematic'
          ? (videoConfig.basePriceCinematic || 1400)
          : (videoConfig.basePriceHyper3D || 2200);

      const videoCost = videoCount * fidelityBase * lengthMult;
      baseMin = videoCost;
      baseMax = baseMin * 1.35;

      lineItems.push({
        item: `${videoCount}x ${videoLength} ${videoFidelity === 'hyper-3d' ? '3D Simulation' : 'Cinematic AI'} Masters`,
        cost: `$${Math.round(videoCost).toLocaleString()}`,
      });

      if (includeSpatialAudio) {
        const audioRate = videoConfig.spatialAudioPricePerVideo || 350;
        const audioCost = audioRate * videoCount;
        baseMin += audioCost;
        baseMax += (audioRate * 1.5) * videoCount;
        deliverables.push('Bespoke Spatial Audio & Foley Soundscape');
        lineItems.push({
          item: `Spatial Audio Design (${videoCount} tracks)`,
          cost: `$${audioCost.toLocaleString()}`,
        });
      }
      if (includeVoiceClone) {
        const cloneRate = videoConfig.voiceClonePricePerVideo || 250;
        const cloneCost = cloneRate * videoCount;
        baseMin += cloneCost;
        baseMax += (cloneRate * 1.6) * videoCount;
        deliverables.push('Neural Voice Clone & Multilingual Dubbing');
        lineItems.push({
          item: `Neural Voice Clone & Multi-Accent Dubbing`,
          cost: `$${cloneCost.toLocaleString()}`,
        });
      }

      deliverables.unshift(
        `${videoCount}x ${videoLength} ${videoFidelity === 'hyper-3d' ? '3D Simulation' : 'Cinematic AI'} Video Master(s)`
      );
      deliverables.push('Ad-Ready 4K Resolution & Multi-Aspect Exports (9:16, 16:9, 1:1)');

      daysMin = Math.max(3, videoCount * 2);
      daysMax = Math.max(5, videoCount * 3 + (videoFidelity === 'hyper-3d' ? 3 : 0));
    } else if (activeCategory === 'ugc-ads') {
      const basePerAd =
        talentLicensing === 'ai-persona'
          ? (ugcConfig.basePriceAiPersona || 650)
          : (ugcConfig.basePriceRealCreator || 1100);
      const baseAdCost = ugcAdCount * basePerAd;
      const hookRate = ugcConfig.hookVariationPrice || 180;
      const hookCost = hookVariations * hookRate;
      baseMin = baseAdCost + hookCost;
      baseMax = baseMin * 1.3;

      lineItems.push({
        item: `${ugcAdCount}x High-Converting Performance UGC Creative(s)`,
        cost: `$${baseAdCost.toLocaleString()}`,
      });
      lineItems.push({
        item: `${hookVariations} Hook Variations per Ad Concept`,
        cost: `$${hookCost.toLocaleString()}`,
      });

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
        lineItems.push({ item: 'Bespoke Responsive Landing Architecture', cost: `$${baseMin.toLocaleString()}` });
        daysMin = 5;
        daysMax = 9;
      } else if (webScope === 'full-app') {
        baseMin = webConfig.fullAppPriceMin || 7500;
        baseMax = webConfig.fullAppPriceMax || 14000;
        deliverables.push('Full-Stack React Web Application with Scalable Architecture');
        lineItems.push({ item: 'Full-Stack React & Node Application Engine', cost: `$${baseMin.toLocaleString()}` });
        daysMin = 10;
        daysMax = 18;
      } else {
        baseMin = webConfig.aiPipelinePriceMin || 9500;
        baseMax = webConfig.aiPipelinePriceMax || 18500;
        deliverables.push('Intelligent AI Agent Pipeline & Automated Workflows');
        lineItems.push({ item: 'Autonomous Multi-Agent Orchestration Engine', cost: `$${baseMin.toLocaleString()}` });
        daysMin = 12;
        daysMax = 22;
      }

      if (has3DCanvas) {
        const addon = webConfig.canvas3DAddonPrice || 1200;
        baseMin += addon;
        baseMax += addon * 1.8;
        deliverables.push('3D WebGL / Interactive Canvas Experience');
        lineItems.push({ item: 'Interactive 3D Canvas / Dynamic Particle Matrix', cost: `$${addon.toLocaleString()}` });
        daysMax += 2;
      }
      if (hasAdminCMS) {
        const addon = webConfig.adminCmsAddonPrice || 800;
        baseMin += addon;
        baseMax += addon * 1.8;
        deliverables.push('Custom Owner CMS & Media Management Suite');
        lineItems.push({ item: 'Executive Admin CMS & Media Management Vault', cost: `$${addon.toLocaleString()}` });
      }
      if (hasDatabaseAuth) {
        const addon = webConfig.databaseAuthAddonPrice || 1100;
        baseMin += addon;
        baseMax += addon * 1.8;
        deliverables.push('Cloud Database & Secure Multi-Role Auth');
        lineItems.push({ item: 'Cloud Database Architecture & Encrypted Session Auth', cost: `$${addon.toLocaleString()}` });
        daysMax += 3;
      }
    }

    if (turnaroundSpeed === 'rush') {
      const rushMult = 1 + (settingsForm.rushSurchargePercentage || 25) / 100;
      baseMin *= rushMult;
      baseMax *= rushMult;
      daysMin = Math.max(2, Math.round(daysMin * 0.55));
      daysMax = Math.max(3, Math.round(daysMax * 0.6));
      deliverables.push(`⚡ Priority 48h-72h Rapid Turnaround Sprint (+${settingsForm.rushSurchargePercentage || 25}%)`);
      lineItems.push({ item: `Priority Sprint Acceleration (${settingsForm.rushSurchargePercentage || 25}% Surcharge)`, cost: `+${settingsForm.rushSurchargePercentage || 25}%` });
    }

    // Format strings
    const formattedMin = `$${Math.round(baseMin / 50) * 50}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedMax = `$${Math.round(baseMax / 50) * 50}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const budgetRange = `${formattedMin} – ${formattedMax}`;
    const timeline = `${daysMin} – ${daysMax} Business Days`;

    const categoryName: SavedScopeQuote['serviceCategory'] =
      activeCategory === 'ai-video'
        ? '02 - AI VIDEOS'
        : activeCategory === 'ugc-ads'
        ? '01 - UGC ADS'
        : '03 - WEBSITE & AUTOMATIONS';

    return {
      formattedMin,
      formattedMax,
      budgetRange,
      timeline,
      deliverables,
      lineItems,
      categoryName,
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
    settingsForm,
  ]);

  // Generate formal client proposal markdown
  const formattedProposal = useMemo(() => {
    const clientHeader = clientName ? `Prepared for: ${clientName}${clientEmail ? ` (${clientEmail})` : ''}` : 'Prepared for: Valued Studio Client';
    const lines = [
      `==================================================`,
      `AI BUILD STUDIO — OFFICIAL COMMERCIAL PROPOSAL`,
      `==================================================`,
      ``,
      `${clientHeader}`,
      `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      `Discipline: ${estimate.categoryName}`,
      `Estimated Investment Range: ${estimate.budgetRange} USD`,
      `Target Delivery Schedule: ${estimate.timeline}`,
      turnaroundSpeed === 'rush' ? `Priority Tier: ⚡ Accelerated Rush Production` : `Priority Tier: Standard Studio Cadence`,
      ``,
      `--------------------------------------------------`,
      `CORE DELIVERABLES & TECHNICAL SPECIFICATIONS`,
      `--------------------------------------------------`,
      ...estimate.deliverables.map((d, i) => ` [✓] ${i + 1}. ${d}`),
      ``,
      `--------------------------------------------------`,
      `COMMERCIAL LINE ITEM BREAKDOWN`,
      `--------------------------------------------------`,
      ...estimate.lineItems.map((li) => ` • ${li.item.padEnd(50, ' ')} : ${li.cost}`),
      ``,
      clientNotes ? `--------------------------------------------------\nCLIENT SPECIFIC DIRECTIVES & CONTEXT\n--------------------------------------------------\n${clientNotes}\n` : '',
      `--------------------------------------------------`,
      `STUDIO GUARANTEE & SERVICE TERMS`,
      `--------------------------------------------------`,
      `• 100% Commercial Usage Rights & Full Source Code / Raw Asset Transfer`,
      `• 2 Comprehensive Revision Rounds Included on All Creative Deliverables`,
      `• Production-ready 4K / High-Fidelity Master Files Delivered via Private Cloud Storage`,
      ``,
      `Studio Contact: ai.build.studio@gmail.com`,
      `Executive Link: https://ai.build/`,
      `==================================================`,
    ];
    return lines.filter(Boolean).join('\n');
  }, [estimate, clientName, clientEmail, clientNotes, turnaroundSpeed]);

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(formattedProposal);
    setCopiedProposal(true);
    playStudioChime('success');
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  const handleCopySummary = () => {
    const summary = `AI Build Scope Quote | ${estimate.categoryName}\nBudget: ${estimate.budgetRange}\nTimeline: ${estimate.timeline}\nDeliverables:\n${estimate.deliverables.map((d) => `• ${d}`).join('\n')}`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    playStudioChime('success');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleSaveToArchive = () => {
    const finalClientName = clientName.trim() || 'Private Client';
    adminStore.addSavedQuote({
      clientName: finalClientName,
      clientEmail: clientEmail.trim() || undefined,
      serviceCategory: estimate.categoryName,
      budgetRange: estimate.budgetRange,
      turnaroundTime: estimate.timeline,
      deliverables: estimate.deliverables,
      notes: clientNotes.trim() || undefined,
      status: 'draft',
    });
    setSaveSuccess(true);
    playStudioChime('success');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteSavedQuote = (id: string, name: string) => {
    if (window.confirm(`Delete saved quote for "${name}"?`)) {
      adminStore.deleteSavedQuote(id);
      playStudioChime('alert');
    }
  };

  const handleUpdateQuoteStatus = (id: string, newStatus: SavedScopeQuote['status']) => {
    adminStore.updateSavedQuote(id, { status: newStatus });
    playStudioChime('click');
  };

  // --- CMS CONFIGURATION ACTIONS ---
  const handleSaveSettings = () => {
    adminStore.updateEstimatorSettings(settingsForm);
    setConfigSaveSuccess(true);
    playStudioChime('success');
    setTimeout(() => setConfigSaveSuccess(false), 3000);
  };

  const handleResetSettingsToDefault = () => {
    if (window.confirm('Reset all scope estimator pricing and discipline settings to factory defaults?')) {
      adminStore.resetEstimatorSettings();
      setSettingsForm(adminStore.getEstimatorSettings());
      playStudioChime('alert');
    }
  };

  // Filtered saved quotes
  const filteredSavedQuotes = savedQuotes.filter((quote) => {
    const matchesSearch =
      quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.clientEmail && quote.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (quote.notes && quote.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Bar with Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${settingsForm.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs uppercase tracking-[0.16em] text-[#71717A] font-label-small font-medium">
              Studio Commercial Engine &bull; {settingsForm.isEnabled ? 'Public Estimator Active' : 'Estimator Offline/Bespoke Mode'}
            </span>
          </div>
          <h2 className="font-bezoria text-2xl sm:text-3xl text-[#202526] uppercase font-normal tracking-wide">
            Scope Estimator &amp; Pricing CMS
          </h2>
          <p className="text-xs sm:text-sm text-[#596769] font-body mt-1 max-w-2xl">
            Simulate commercial project costs, generate custom client proposals, and configure real-time base rates &amp; service option visibility for public visitors.
          </p>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-[#E5E7EB] rounded-full shadow-xs self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              setActiveSubView('calculator');
              playStudioChime('click');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubView === 'calculator'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-[#F3F4F6]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubView('saved-quotes');
              playStudioChime('click');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubView === 'saved-quotes'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-[#F3F4F6]'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Quote Vault</span>
            <span className={`text-[10px] font-strong px-1.5 py-0.2 rounded-full ${activeSubView === 'saved-quotes' ? 'bg-[#D8A9A8] text-[#202526]' : 'bg-[#E5E7EB] text-[#596769]'}`}>
              {savedQuotes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubView('cms-config');
              playStudioChime('click');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubView === 'cms-config'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-[#F3F4F6]'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>CMS Rate Config</span>
            <span className={`w-2 h-2 rounded-full ${settingsForm.isEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </button>
        </div>
      </div>

      {activeSubView === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Scope Builder (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Lead Auto-Fill Dropdown */}
            {messages.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-label-small uppercase tracking-wider text-[#596769] font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#D8A9A8]" />
                    <span>Auto-Populate from Incoming Lead</span>
                  </label>
                  {selectedLeadId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadId('');
                        setClientName('');
                        setClientEmail('');
                        setClientNotes('');
                      }}
                      className="text-[11px] text-[#71717A] hover:text-[#202526] underline cursor-pointer"
                    >
                      Clear Lead Info
                    </button>
                  )}
                </div>
                <select
                  value={selectedLeadId}
                  onChange={(e) => handleSelectLead(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526] focus:outline-none focus:border-[#202526] cursor-pointer"
                >
                  <option value="">-- Select an inquiry to build a tailored proposal --</option>
                  {messages.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.company || m.email}) &bull; {m.projectType} &bull; [{m.budget}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Client Target Details Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
              <h3 className="font-bezoria text-base uppercase text-[#202526] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D8A9A8]" />
                <span>1. Client &amp; Proposal Target</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                    Client / Brand Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Acme Corp / Sarah Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526] focus:outline-none focus:border-[#202526]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                    Client Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526] focus:outline-none focus:border-[#202526]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Custom Project Directives / Brief Notes
                </label>
                <textarea
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Key campaign themes, target platforms, custom integrations..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526] focus:outline-none focus:border-[#202526]"
                />
              </div>
            </div>

            {/* Service Discipline Category Selector */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bezoria text-base uppercase text-[#202526] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D8A9A8]" />
                  <span>2. Service Discipline</span>
                </h3>
                <span className="text-[11px] text-[#71717A]">
                  Rates synced with CMS Config
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('ai-video');
                    playStudioChime('click');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    activeCategory === 'ai-video'
                      ? 'bg-[#202526] text-white border-[#202526] shadow-sm'
                      : 'bg-[#F9FAFB] text-[#202526] border-[#E5E7EB] hover:border-[#CBDCDE]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Video className={`w-4 h-4 ${activeCategory === 'ai-video' ? 'text-[#D8A9A8]' : 'text-[#596769]'}`} />
                    {!settingsForm.categories.aiVideo.enabled && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-label-small block uppercase opacity-70">
                      {settingsForm.categories.aiVideo.number}
                    </span>
                    <span className="text-xs font-strong uppercase tracking-wide truncate block">
                      {settingsForm.categories.aiVideo.title}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('ugc-ads');
                    playStudioChime('click');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    activeCategory === 'ugc-ads'
                      ? 'bg-[#202526] text-white border-[#202526] shadow-sm'
                      : 'bg-[#F9FAFB] text-[#202526] border-[#E5E7EB] hover:border-[#CBDCDE]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Sparkles className={`w-4 h-4 ${activeCategory === 'ugc-ads' ? 'text-[#D8A9A8]' : 'text-[#596769]'}`} />
                    {!settingsForm.categories.ugcAds.enabled && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-label-small block uppercase opacity-70">
                      {settingsForm.categories.ugcAds.number}
                    </span>
                    <span className="text-xs font-strong uppercase tracking-wide truncate block">
                      {settingsForm.categories.ugcAds.title}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('web-automation');
                    playStudioChime('click');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    activeCategory === 'web-automation'
                      ? 'bg-[#202526] text-white border-[#202526] shadow-sm'
                      : 'bg-[#F9FAFB] text-[#202526] border-[#E5E7EB] hover:border-[#CBDCDE]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Globe className={`w-4 h-4 ${activeCategory === 'web-automation' ? 'text-[#D8A9A8]' : 'text-[#596769]'}`} />
                    {!settingsForm.categories.webAutomation.enabled && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-label-small block uppercase opacity-70">
                      {settingsForm.categories.webAutomation.number}
                    </span>
                    <span className="text-xs font-strong uppercase tracking-wide truncate block">
                      {settingsForm.categories.webAutomation.title}
                    </span>
                  </div>
                </button>
              </div>

              {/* Dynamic Controls based on selected category */}
              <div className="pt-2 space-y-5">
                {activeCategory === 'ai-video' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs font-label-small uppercase text-[#596769] mb-2">
                        <span>Video Masters Count</span>
                        <span className="text-[#202526] font-strong text-sm">{videoCount} Video(s)</span>
                      </div>
                      <input
                        type="range"
                        min={settingsForm.categories.aiVideo.minVideos || 1}
                        max={settingsForm.categories.aiVideo.maxVideos || 10}
                        value={videoCount}
                        onChange={(e) => setVideoCount(parseInt(e.target.value))}
                        className="w-full accent-[#202526] cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                          Duration Tier
                        </label>
                        <select
                          value={videoLength}
                          onChange={(e) => setVideoLength(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                        >
                          <option value="15s">15 Seconds (Shorts / Teaser)</option>
                          <option value="30s">30 Seconds (Standard Commercial)</option>
                          <option value="60s">60 Seconds (Full Product Film)</option>
                          <option value="90s+">90s+ (Cinematic Showcase)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                          Fidelity Engine
                        </label>
                        <select
                          value={videoFidelity}
                          onChange={(e) => setVideoFidelity(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                        >
                          <option value="cinematic">
                            Cinematic AI Diffusion (${(settingsForm.categories.aiVideo.basePriceCinematic || 1400).toLocaleString()})
                          </option>
                          <option value="hyper-3d">
                            Hyper-Real 3D Simulation (${(settingsForm.categories.aiVideo.basePriceHyper3D || 2200).toLocaleString()})
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs text-[#202526] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={includeSpatialAudio}
                          onChange={(e) => setIncludeSpatialAudio(e.target.checked)}
                          className="rounded accent-[#202526] cursor-pointer"
                        />
                        <span className="font-medium">
                          Spatial Audio &amp; Foley (+${settingsForm.categories.aiVideo.spatialAudioPricePerVideo || 350}/video)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-[#202526] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={includeVoiceClone}
                          onChange={(e) => setIncludeVoiceClone(e.target.checked)}
                          className="rounded accent-[#202526] cursor-pointer"
                        />
                        <span className="font-medium">
                          Neural Voice Cloning (+${settingsForm.categories.aiVideo.voiceClonePricePerVideo || 250}/video)
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {activeCategory === 'ugc-ads' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center text-xs font-label-small uppercase text-[#596769] mb-2">
                          <span>Ad Creative Count</span>
                          <span className="text-[#202526] font-strong">{ugcAdCount} Creatives</span>
                        </div>
                        <input
                          type="range"
                          min={settingsForm.categories.ugcAds.minAds || 1}
                          max={settingsForm.categories.ugcAds.maxAds || 12}
                          value={ugcAdCount}
                          onChange={(e) => setUgcAdCount(parseInt(e.target.value))}
                          className="w-full accent-[#202526] cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs font-label-small uppercase text-[#596769] mb-2">
                          <span>Hooks per Concept</span>
                          <span className="text-[#202526] font-strong">{hookVariations} Hooks</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          value={hookVariations}
                          onChange={(e) => setHookVariations(parseInt(e.target.value))}
                          className="w-full accent-[#202526] cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                          Talent Licensing Tier
                        </label>
                        <select
                          value={talentLicensing}
                          onChange={(e) => setTalentLicensing(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                        >
                          <option value="ai-persona">
                            Photoreal AI Persona (${(settingsForm.categories.ugcAds.basePriceAiPersona || 650).toLocaleString()}/ad)
                          </option>
                          <option value="real-creator">
                            Licensed Real Creator (${(settingsForm.categories.ugcAds.basePriceRealCreator || 1100).toLocaleString()}/ad)
                          </option>
                        </select>
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 text-xs text-[#202526] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={multiPlatformExports}
                            onChange={(e) => setMultiPlatformExports(e.target.checked)}
                            className="rounded accent-[#202526] cursor-pointer"
                          />
                          <span className="font-medium">Multi-Aspect Exports (9:16, 1:1, 16:9)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === 'web-automation' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                        Web &amp; System Archetype
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setWebScope('landing')}
                          className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                            webScope === 'landing'
                              ? 'bg-[#202526] text-white border-[#202526]'
                              : 'bg-[#F9FAFB] text-[#202526] border-[#E5E7EB]'
                          }`}
                        >
                          <span className="font-strong block">Landing Page</span>
                          <span className="text-[10px] opacity-70">
                            From ${(settingsForm.categories.webAutomation.landingPagePriceMin || 3800).toLocaleString()}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWebScope('full-app')}
                          className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                            webScope === 'full-app'
                              ? 'bg-[#202526] text-white border-[#202526]'
                              : 'bg-[#F9FAFB] text-[#202526] border-[#E5E7EB]'
                          }`}
                        >
                          <span className="font-strong block">Full Web App</span>
                          <span className="text-[10px] opacity-70">
                            From ${(settingsForm.categories.webAutomation.fullAppPriceMin || 7500).toLocaleString()}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWebScope('ai-pipeline')}
                          className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                            webScope === 'ai-pipeline'
                              ? 'bg-[#202526] text-white border-[#202526]'
                              : 'bg-[#F9FAFB] text-[#202526] border-[#E5E7EB]'
                          }`}
                        >
                          <span className="font-strong block">AI Pipeline</span>
                          <span className="text-[10px] opacity-70">
                            From ${(settingsForm.categories.webAutomation.aiPipelinePriceMin || 9500).toLocaleString()}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <label className="flex items-center gap-2 text-xs text-[#202526] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={has3DCanvas}
                          onChange={(e) => setHas3DCanvas(e.target.checked)}
                          className="rounded accent-[#202526] cursor-pointer"
                        />
                        <span>3D Canvas (+${(settingsForm.categories.webAutomation.canvas3DAddonPrice || 1200).toLocaleString()})</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-[#202526] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasAdminCMS}
                          onChange={(e) => setHasAdminCMS(e.target.checked)}
                          className="rounded accent-[#202526] cursor-pointer"
                        />
                        <span>Owner CMS (+${(settingsForm.categories.webAutomation.adminCmsAddonPrice || 800).toLocaleString()})</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-[#202526] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasDatabaseAuth}
                          onChange={(e) => setHasDatabaseAuth(e.target.checked)}
                          className="rounded accent-[#202526] cursor-pointer"
                        />
                        <span>Cloud Auth (+${(settingsForm.categories.webAutomation.databaseAuthAddonPrice || 1100).toLocaleString()})</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Turnaround Pace Switcher */}
              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <span className="text-xs font-label-small uppercase text-[#596769] block">
                    Production Speed / Urgency
                  </span>
                  <span className="text-xs text-[#71717A]">
                    {turnaroundSpeed === 'rush'
                      ? `⚡ 48h-72h Sprint (+${settingsForm.rushSurchargePercentage || 25}% surcharge)`
                      : 'Standard Studio Turnaround'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full">
                  <button
                    type="button"
                    onClick={() => setTurnaroundSpeed('standard')}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                      turnaroundSpeed === 'standard' ? 'bg-[#202526] text-white' : 'text-[#596769]'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurnaroundSpeed('rush')}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                      turnaroundSpeed === 'rush' ? 'bg-[#D8A9A8] text-[#202526] font-strong' : 'text-[#596769]'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Rush Sprint (+{settingsForm.rushSurchargePercentage || 25}%)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Output & Proposal Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Pricing Summary Card */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#202526] shadow-md space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#CBDCDE]/40 text-[#202526] text-[11px] font-label-small uppercase tracking-wider font-medium">
                  {estimate.categoryName}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#596769] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#D8A9A8]" />
                  <span>{estimate.timeline}</span>
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-[#71717A] font-label-small block mb-1">
                  Estimated Investment
                </span>
                <div className="font-bezoria text-3xl sm:text-4xl text-[#202526] tracking-tight">
                  {estimate.budgetRange}
                </div>
                <p className="text-[11px] text-[#71717A] mt-1 font-body">
                  *Includes full source transfer, production master files, and 2 complete revision rounds.
                </p>
              </div>

              {/* Deliverables Checklist */}
              <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                <span className="text-xs font-label-small uppercase text-[#596769] block font-medium">
                  Configured Deliverables
                </span>
                <div className="space-y-1.5">
                  {estimate.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#202526]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSaveToArchive}
                  className="w-full py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span>Saved to Quote Vault!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 text-[#D8A9A8]" />
                      <span>Save Quote to Vault</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyProposal}
                    className="py-2.5 px-3 rounded-full bg-white hover:bg-[#F3F4F6] text-[#202526] text-xs font-label-small font-medium uppercase tracking-wider border border-[#E5E7EB] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedProposal ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5 text-[#596769]" />
                        <span>Copy Proposal</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="py-2.5 px-3 rounded-full bg-white hover:bg-[#F3F4F6] text-[#202526] text-xs font-label-small font-medium uppercase tracking-wider border border-[#E5E7EB] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#596769]" />
                        <span>Quick Summary</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Formatted Markdown Proposal Preview */}
            <div className="p-5 rounded-3xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-label-small uppercase text-[#596769] font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#D8A9A8]" />
                  <span>Commercial Proposal Output</span>
                </span>
                <span className="text-[10px] text-[#71717A] font-mono">Markdown Format</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] font-mono text-[11px] text-[#202526] max-h-56 overflow-y-auto leading-relaxed whitespace-pre-wrap selection:bg-[#D8A9A8]">
                {formattedProposal}
              </div>
            </div>
          </div>
        </div>
      ) : activeSubView === 'saved-quotes' ? (
        /* Saved Quotes Vault View */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search quotes by client, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526] focus:outline-none focus:border-[#202526]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(['all', 'draft', 'sent', 'accepted', 'declined'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-label-small uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-[#202526] text-white shadow-xs'
                      : 'bg-[#F9FAFB] text-[#596769] hover:text-[#202526]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Quotes List Table / Cards */}
          {filteredSavedQuotes.length === 0 ? (
            <div className="text-center py-16 p-8 bg-white border border-[#E5E7EB] rounded-3xl space-y-3">
              <BookmarkPlus className="w-10 h-10 text-[#71717A] mx-auto opacity-40" />
              <h4 className="font-bezoria text-lg text-[#202526] uppercase">No Saved Quotes Found</h4>
              <p className="text-xs text-[#596769] max-w-md mx-auto">
                Use the Interactive Calculator to configure a custom scope and click "Save Quote to Vault" to create your first client estimate.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubView('calculator')}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#202526] text-white text-xs font-btn uppercase tracking-wider cursor-pointer"
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSavedQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-5 rounded-3xl bg-white border border-[#E5E7EB] hover:border-[#202526]/40 transition-all shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-strong text-base text-[#202526]">{quote.clientName}</h4>
                          <span className="text-[10px] text-[#71717A] font-mono">&bull; {quote.createdAt}</span>
                        </div>
                        {quote.clientEmail && (
                          <span className="text-xs text-[#596769] font-body block">{quote.clientEmail}</span>
                        )}
                      </div>

                      {/* Status Selector */}
                      <select
                        value={quote.status}
                        onChange={(e) => handleUpdateQuoteStatus(quote.id, e.target.value as any)}
                        className={`text-xs px-2.5 py-1 rounded-full font-label-small uppercase font-medium border cursor-pointer ${
                          quote.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : quote.status === 'sent'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : quote.status === 'declined'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent to Client</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#596769] font-label-small uppercase">Category:</span>
                        <span className="text-[#202526] font-strong">{quote.serviceCategory}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#596769] font-label-small uppercase">Estimate:</span>
                        <span className="text-[#202526] font-strong text-sm">{quote.budgetRange}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#596769] font-label-small uppercase">Turnaround:</span>
                        <span className="text-[#202526] font-medium">{quote.turnaroundTime}</span>
                      </div>
                    </div>

                    {quote.notes && (
                      <p className="text-xs text-[#596769] italic bg-white p-2 rounded-xl border border-[#E5E7EB]">
                        &ldquo;{quote.notes}&rdquo;
                      </p>
                    )}

                    {/* Deliverables snippet */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-label-small uppercase text-[#71717A] block">
                        Included Deliverables ({quote.deliverables.length}):
                      </span>
                      <div className="space-y-0.5">
                        {quote.deliverables.slice(0, 3).map((d, i) => (
                          <div key={i} className="text-xs text-[#202526] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
                            <span className="truncate">{d}</span>
                          </div>
                        ))}
                        {quote.deliverables.length > 3 && (
                          <span className="text-[10px] text-[#71717A] pl-3 block">
                            +{quote.deliverables.length - 3} more items...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `AI Build Scope Quote for ${quote.clientName}\nCategory: ${quote.serviceCategory}\nEstimate: ${quote.budgetRange}\nTimeline: ${quote.turnaroundTime}\nDeliverables:\n${quote.deliverables.map((d) => `• ${d}`).join('\n')}${quote.notes ? `\nNotes: ${quote.notes}` : ''}`;
                        navigator.clipboard.writeText(text);
                        playStudioChime('success');
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#202526] text-xs font-label-small uppercase tracking-wider border border-[#E5E7EB] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#596769]" />
                      <span>Copy Quote</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSavedQuote(quote.id, quote.clientName)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-[#71717A] hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Quote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CMS Estimator Configuration & Rate Management Section */
        <div className="space-y-8">
          {/* Status & Save Feedback Bar */}
          {configSaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  Estimator settings and pricing rate card successfully saved &amp; deployed live!
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono opacity-80">Live Synchronized</span>
            </div>
          )}

          {/* Master Modal & Global Settings Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div>
                <h3 className="font-bezoria text-lg uppercase text-[#202526] flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-[#D8A9A8]" />
                  <span>1. Master Estimator Modal Controls</span>
                </h3>
                <p className="text-xs text-[#596769] mt-0.5">
                  Configure whether the public interactive simulator is accessible to visitors or restricted to bespoke consultations.
                </p>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center gap-3 p-2 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] self-start sm:self-auto">
                <span className="text-xs font-label-small uppercase text-[#596769] font-medium">
                  {settingsForm.isEnabled ? 'Public Simulator: Active' : 'Public Simulator: Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsForm((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
                    playStudioChime('click');
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    settingsForm.isEnabled ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                  title={settingsForm.isEnabled ? 'Click to disable' : 'Click to enable'}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Modal Header Title
                </label>
                <input
                  type="text"
                  value={settingsForm.modalTitle}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, modalTitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526] focus:outline-none focus:border-[#202526]"
                />
              </div>

              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5 flex items-center justify-between">
                  <span>Priority Rush Sprint Surcharge</span>
                  <span className="text-xs text-[#202526] font-mono font-bold">+{settingsForm.rushSurchargePercentage}%</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={settingsForm.rushSurchargePercentage}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, rushSurchargePercentage: parseInt(e.target.value) || 25 }))
                    }
                    className="w-full accent-[#202526] cursor-pointer"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Modal Subtitle &amp; Instructions Description
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.modalSubtitle}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, modalSubtitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526] focus:outline-none focus:border-[#202526]"
                />
              </div>
            </div>
          </div>

          {/* Discipline 1: 01 UGC Ads Configuration */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#202526]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[#202526]">
                      {settingsForm.categories.ugcAds.number}
                    </span>
                    <h3 className="font-bezoria text-base uppercase text-[#202526]">
                      {settingsForm.categories.ugcAds.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#596769] mt-0.5">
                    Performance TikTok, Reels, and YouTube Shorts UGC video creation rates.
                  </p>
                </div>
              </div>

              {/* Category Visibility Toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-label-small uppercase text-[#596769]">
                  {settingsForm.categories.ugcAds.enabled ? 'Discipline Visible' : 'Discipline Hidden'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        ugcAds: { ...prev.categories.ugcAds, enabled: !prev.categories.ugcAds.enabled },
                      },
                    }))
                  }
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    settingsForm.categories.ugcAds.enabled ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  AI Persona Base Price ($/ad)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={settingsForm.categories.ugcAds.basePriceAiPersona}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          ugcAds: {
                            ...prev.categories.ugcAds,
                            basePriceAiPersona: parseInt(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Real Creator Base Price ($/ad)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="200"
                    step="50"
                    value={settingsForm.categories.ugcAds.basePriceRealCreator}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          ugcAds: {
                            ...prev.categories.ugcAds,
                            basePriceRealCreator: parseInt(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Hook Variation Addon ($/hook)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="50"
                    step="25"
                    value={settingsForm.categories.ugcAds.hookVariationPrice}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          ugcAds: {
                            ...prev.categories.ugcAds,
                            hookVariationPrice: parseInt(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Discipline 2: 02 AI Videos Configuration */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center">
                  <Video className="w-4 h-4 text-[#202526]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[#202526]">
                      {settingsForm.categories.aiVideo.number}
                    </span>
                    <h3 className="font-bezoria text-base uppercase text-[#202526]">
                      {settingsForm.categories.aiVideo.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#596769] mt-0.5">
                    Cinematic AI diffusion, 3D NeRF product simulation, spatial audio &amp; voice cloning rates.
                  </p>
                </div>
              </div>

              {/* Category Visibility Toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-label-small uppercase text-[#596769]">
                  {settingsForm.categories.aiVideo.enabled ? 'Discipline Visible' : 'Discipline Hidden'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        aiVideo: { ...prev.categories.aiVideo, enabled: !prev.categories.aiVideo.enabled },
                      },
                    }))
                  }
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    settingsForm.categories.aiVideo.enabled ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Cinematic AI Master ($/video)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="300"
                    step="100"
                    value={settingsForm.categories.aiVideo.basePriceCinematic}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          aiVideo: {
                            ...prev.categories.aiVideo,
                            basePriceCinematic: parseInt(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Hyper-3D Simulation ($/video)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={settingsForm.categories.aiVideo.basePriceHyper3D}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          aiVideo: {
                            ...prev.categories.aiVideo,
                            basePriceHyper3D: parseInt(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Spatial Audio Addon ($/video)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={settingsForm.categories.aiVideo.spatialAudioPricePerVideo}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          aiVideo: {
                            ...prev.categories.aiVideo,
                            spatialAudioPricePerVideo: parseInt(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label-small uppercase text-[#596769] mb-1.5">
                  Voice Cloning Addon ($/video)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="50"
                    step="25"
                    value={settingsForm.categories.aiVideo.voiceClonePricePerVideo}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          aiVideo: {
                            ...prev.categories.aiVideo,
                            voiceClonePricePerVideo: parseInt(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Discipline 3: 03 Web Platforms & Automation Configuration */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#202526]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[#202526]">
                      {settingsForm.categories.webAutomation.number}
                    </span>
                    <h3 className="font-bezoria text-base uppercase text-[#202526]">
                      {settingsForm.categories.webAutomation.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#596769] mt-0.5">
                    Landing pages, full-stack React platforms, AI agent pipelines, 3D WebGL and database add-on rates.
                  </p>
                </div>
              </div>

              {/* Category Visibility Toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-label-small uppercase text-[#596769]">
                  {settingsForm.categories.webAutomation.enabled ? 'Discipline Visible' : 'Discipline Hidden'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        webAutomation: {
                          ...prev.categories.webAutomation,
                          enabled: !prev.categories.webAutomation.enabled,
                        },
                      },
                    }))
                  }
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    settingsForm.categories.webAutomation.enabled ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-label-small uppercase text-[#596769] font-medium block">
                Base Archetype Pricing Ranges (Min &amp; Max USD)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Landing Page */}
                <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
                  <span className="text-xs font-strong text-[#202526] block">Landing Page</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-label-small uppercase text-[#71717A] block mb-1">Min ($)</label>
                      <input
                        type="number"
                        step="100"
                        value={settingsForm.categories.webAutomation.landingPagePriceMin}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              webAutomation: {
                                ...prev.categories.webAutomation,
                                landingPagePriceMin: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#202526]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-label-small uppercase text-[#71717A] block mb-1">Max ($)</label>
                      <input
                        type="number"
                        step="100"
                        value={settingsForm.categories.webAutomation.landingPagePriceMax}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              webAutomation: {
                                ...prev.categories.webAutomation,
                                landingPagePriceMax: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#202526]"
                      />
                    </div>
                  </div>
                </div>

                {/* Full Web App */}
                <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
                  <span className="text-xs font-strong text-[#202526] block">Full Web App</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-label-small uppercase text-[#71717A] block mb-1">Min ($)</label>
                      <input
                        type="number"
                        step="250"
                        value={settingsForm.categories.webAutomation.fullAppPriceMin}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              webAutomation: {
                                ...prev.categories.webAutomation,
                                fullAppPriceMin: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#202526]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-label-small uppercase text-[#71717A] block mb-1">Max ($)</label>
                      <input
                        type="number"
                        step="250"
                        value={settingsForm.categories.webAutomation.fullAppPriceMax}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              webAutomation: {
                                ...prev.categories.webAutomation,
                                fullAppPriceMax: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#202526]"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Pipeline */}
                <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
                  <span className="text-xs font-strong text-[#202526] block">AI Pipeline Engine</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-label-small uppercase text-[#71717A] block mb-1">Min ($)</label>
                      <input
                        type="number"
                        step="250"
                        value={settingsForm.categories.webAutomation.aiPipelinePriceMin}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              webAutomation: {
                                ...prev.categories.webAutomation,
                                aiPipelinePriceMin: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#202526]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-label-small uppercase text-[#71717A] block mb-1">Max ($)</label>
                      <input
                        type="number"
                        step="250"
                        value={settingsForm.categories.webAutomation.aiPipelinePriceMax}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              webAutomation: {
                                ...prev.categories.webAutomation,
                                aiPipelinePriceMax: parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#202526]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Addons for Web */}
              <div className="pt-2">
                <span className="text-xs font-label-small uppercase text-[#596769] font-medium block mb-2">
                  Technical Add-On Rates
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#596769] mb-1">3D Canvas Experience ($)</label>
                    <input
                      type="number"
                      step="100"
                      value={settingsForm.categories.webAutomation.canvas3DAddonPrice}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          categories: {
                            ...prev.categories,
                            webAutomation: {
                              ...prev.categories.webAutomation,
                              canvas3DAddonPrice: parseInt(e.target.value) || 0,
                            },
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#596769] mb-1">Executive CMS ($)</label>
                    <input
                      type="number"
                      step="100"
                      value={settingsForm.categories.webAutomation.adminCmsAddonPrice}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          categories: {
                            ...prev.categories,
                            webAutomation: {
                              ...prev.categories.webAutomation,
                              adminCmsAddonPrice: parseInt(e.target.value) || 0,
                            },
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#596769] mb-1">Cloud DB &amp; Auth ($)</label>
                    <input
                      type="number"
                      step="100"
                      value={settingsForm.categories.webAutomation.databaseAuthAddonPrice}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          categories: {
                            ...prev.categories,
                            webAutomation: {
                              ...prev.categories.webAutomation,
                              databaseAuthAddonPrice: parseInt(e.target.value) || 0,
                            },
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#202526]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky CMS Action Bar */}
          <div className="p-5 rounded-3xl bg-white border-2 border-[#202526] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D8A9A8]/30 flex items-center justify-center">
                <Save className="w-4 h-4 text-[#202526]" />
              </div>
              <div>
                <span className="text-xs font-strong text-[#202526] block">
                  Publish Estimator Rate Card Changes
                </span>
                <span className="text-[11px] text-[#596769]">
                  Updates live calculations across both public visitor view and admin proposal builder.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetSettingsToDefault}
                className="px-4 py-2.5 rounded-full bg-white hover:bg-red-50 text-red-600 text-xs font-label-small uppercase tracking-wider border border-red-200 transition-all cursor-pointer"
              >
                Reset Defaults
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveSettings();
                  setActiveSubView('calculator');
                }}
                className="px-4 py-2.5 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202526] text-xs font-label-small uppercase tracking-wider border border-[#E5E7EB] transition-all cursor-pointer"
              >
                Save &amp; Test
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                {configSaveSuccess ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#D8A9A8]" />
                    <span>Save CMS Rates</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
