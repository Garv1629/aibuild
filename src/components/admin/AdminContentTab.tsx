import React, { useState, useEffect, useMemo } from 'react';
import { WebsiteContent } from '../../types';
import { adminStore } from '../../services/adminStore';
import { unsavedChanges } from '../../services/unsavedChanges';
import { MediaUploader } from './MediaUploader';
import { MultiMediaUploader } from './MultiMediaUploader';
import { ServiceMediaManager } from './ServiceMediaManager';
import { CharacterLightingStudio } from './CharacterLightingStudio';
import { LIGHTING_PRESET_LIST, DEFAULT_LIGHTING_PRESET } from '../../utils/lightingPresets';
import {
  Sparkles,
  Check,
  RotateCcw,
  Type,
  Image as ImageIcon,
  Info,
  Mail,
  Plus,
  Trash2,
  Sliders,
  Upload,
  Layers,
  Sun,
  Zap,
  X,
  AlertCircle,
  Loader2,
  Archive,
  AlertTriangle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from 'lucide-react';

const PORTRAIT_PRESETS = [
  {
    name: 'Original 3D Character',
    url: 'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png',
  },
  {
    name: 'Cyberpunk Shrug Boy',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Futuristic AI Avatar',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
];

interface AdminContentTabProps {
  content: WebsiteContent;
}

export const AdminContentTab: React.FC<AdminContentTabProps> = ({ content }) => {
  const [formData, setFormDataState] = useState<WebsiteContent>(content);
  const [savedBaseline, setSavedBaseline] = useState<WebsiteContent>(content);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'saving' | 'saved' | 'publishing' | 'published' | 'error' | null; text: string | null }>({ type: null, text: null });
  const [activeSubSection, setActiveSubSection] = useState<
    'hero' | 'lighting' | 'about' | 'services' | 'marquee' | 'contact'
  >('hero');
  const [servicesView, setServicesView] = useState<'active' | 'trash'>('active');
  const [deleteServiceModal, setDeleteServiceModal] = useState<{
    isOpen: boolean;
    serviceNumber: string | null;
    serviceTitle: string | null;
    permanent: boolean;
  }>({
    isOpen: false,
    serviceNumber: null,
    serviceTitle: null,
    permanent: false,
  });

  // Track store publish status
  const [publishStatus, setPublishStatus] = useState(() => adminStore.getPublishStatus());

  // Detect dirty state comparing formData with savedBaseline
  const isDirty = useMemo(() => {
    try {
      return JSON.stringify(formData) !== JSON.stringify(savedBaseline);
    } catch {
      return false;
    }
  }, [formData, savedBaseline]);

  // Synchronize unsavedChanges manager with current dirty state
  useEffect(() => {
    unsavedChanges.setDirty('content', isDirty, {
      label: 'Website Content & Media',
      onDiscard: () => {
        setFormDataState(savedBaseline);
      },
    });
    return () => {
      unsavedChanges.setDirty('content', false);
    };
  }, [isDirty, savedBaseline]);

  // Synchronize state when content prop changes or store updates
  useEffect(() => {
    setFormDataState(content);
    setSavedBaseline(content);
    setPublishStatus(adminStore.getPublishStatus());
    const unsub = adminStore.subscribe((state) => {
      if (state.draftContent) {
        setFormDataState(state.draftContent);
        setSavedBaseline(state.draftContent);
      }
      setPublishStatus({
        status: state.publishStatus || 'published',
        publishedAt: state.publishedAt || null,
        hasDraftChanges: Boolean(state.hasDraftChanges),
      });
    });
    return unsub;
  }, [content]);

  const setFormData = (
    nextOrUpdater: WebsiteContent | ((prev: WebsiteContent) => WebsiteContent)
  ) => {
    setFormDataState((prev) => {
      const next = typeof nextOrUpdater === 'function' ? nextOrUpdater(prev) : nextOrUpdater;
      return next;
    });
  };

  // 1. Save Draft (Persists draft to database without modifying public website)
  const handleSaveDraft = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setIsSavingDraft(true);
    setStatusMessage({ type: 'saving', text: 'Saving draft to Supabase database...' });
    try {
      await adminStore.saveContentDraft(formData);
      setSavedBaseline(formData);
      unsavedChanges.setDirty('content', false);
      setStatusMessage({ type: 'saved', text: 'Saved! Changes stored safely in Supabase (not yet live).' });
      setTimeout(() => setStatusMessage({ type: null, text: null }), 4000);
    } catch (err: any) {
      // NEVER discard edits on error — user edits remain in formData
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save draft. Your edits are preserved.' });
      alert(`Save Draft Error: ${err.message || 'Failed to save draft. Your edits are preserved.'}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // 2. Publish to Live (Pushes draft directly live to public website)
  const handlePublish = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setIsPublishing(true);
    setStatusMessage({ type: 'publishing', text: 'Publishing live to public website...' });
    try {
      await adminStore.publishContent(formData);
      setSavedBaseline(formData);
      unsavedChanges.setDirty('content', false);
      setStatusMessage({ type: 'published', text: 'Published! Public website is now displaying the latest changes.' });
      setTimeout(() => setStatusMessage({ type: null, text: null }), 4000);
    } catch (err: any) {
      // Keep formData preserved on error
      setStatusMessage({ type: 'error', text: err.message || 'Failed to publish changes. Your edits are preserved.' });
      alert(`Publish Error: ${err.message || 'Failed to publish changes. Your edits are preserved.'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // 3. Discard Draft / Revert to Live Published
  const handleRevertDraft = async () => {
    if (window.confirm('Discard all unpublished draft edits and revert to the currently live published version?')) {
      setIsReverting(true);
      try {
        const published = await adminStore.revertContentDraft();
        setFormDataState(published);
        setSavedBaseline(published);
        unsavedChanges.setDirty('content', false);
        setStatusMessage({ type: 'saved', text: 'Draft discarded. Reverted to live published content.' });
        setTimeout(() => setStatusMessage({ type: null, text: null }), 3000);
      } catch (err: any) {
        alert(`Revert Error: ${err.message || 'Failed to revert draft.'}`);
      } finally {
        setIsReverting(false);
      }
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all website text and media content to initial factory defaults?')) {
      try {
        await adminStore.resetToDefaults();
        const resetContent = adminStore.getWebsiteContent();
        setFormDataState(resetContent);
        setSavedBaseline(resetContent);
        unsavedChanges.setDirty('content', false);
        setStatusMessage({ type: 'published', text: 'Reset to factory defaults.' });
        setTimeout(() => setStatusMessage({ type: null, text: null }), 3000);
      } catch (err: any) {
        alert(`Reset Error: ${err.message || 'Failed to reset defaults.'}`);
      }
    }
  };

  // Pillar handlers
  const updatePillar = (index: number, field: string, value: string) => {
    const updated = [...formData.about.pillars];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      about: { ...formData.about, pillars: updated },
    });
  };

  const addPillar = () => {
    if (formData.about.pillars.length >= 4) return;
    const newPillar = {
      id: `${Date.now()}`,
      title: 'Scalability',
      subtitle: 'Global Edge Mesh',
      icon: 'sparkles' as const,
    };
    setFormData({
      ...formData,
      about: { ...formData.about, pillars: [...formData.about.pillars, newPillar] },
    });
  };

  const removePillar = (index: number) => {
    if (formData.about.pillars.length <= 1) return;
    const updated = formData.about.pillars.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      about: { ...formData.about, pillars: updated },
    });
  };

  // Service drag and drop reordering
  const [draggedServiceIndex, setDraggedServiceIndex] = useState<number | null>(null);
  const [dropTargetServiceIndex, setDropTargetServiceIndex] = useState<number | null>(null);

  const moveService = (index: number, direction: 'up' | 'down') => {
    const items = [...(formData.services?.items || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    setFormData({
      ...formData,
      services: {
        heading: formData.services?.heading || 'WHAT WE DO',
        subheading: formData.services?.subheading || '',
        items,
      },
    });
  };

  const handleDropService = (sourceOriginalIndex: number, targetOriginalIndex: number) => {
    if (sourceOriginalIndex === targetOriginalIndex) {
      setDraggedServiceIndex(null);
      setDropTargetServiceIndex(null);
      return;
    }

    const items = [...(formData.services?.items || [])];
    if (sourceOriginalIndex < 0 || sourceOriginalIndex >= items.length) return;
    if (targetOriginalIndex < 0 || targetOriginalIndex >= items.length) return;

    const [moved] = items.splice(sourceOriginalIndex, 1);
    items.splice(targetOriginalIndex, 0, moved);

    setDraggedServiceIndex(null);
    setDropTargetServiceIndex(null);
    setFormData({
      ...formData,
      services: {
        heading: formData.services?.heading || 'WHAT WE DO',
        subheading: formData.services?.subheading || '',
        items,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white/85 p-6 sm:p-7 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-label-small uppercase tracking-[0.14em] text-[#D8A9A8] font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Website Text, Direct Media Upload &amp; Brand Styling
          </div>
          <h2 className="text-2xl sm:text-3xl font-elegant font-normal text-[#202526] tracking-wide">
            Website Content &amp; Media Editor
          </h2>
          <p className="text-xs sm:text-[13px] text-[#596769] mt-1.5 max-w-xl leading-relaxed font-sans-clean">
            Live-edit Hero headline, subtexts, upload 3D character assets, configure studio philosophy, 3D floating corner geometry, and multi-upload marquee visuals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-sans-clean">
          {/* Status Badge */}
          {isSavingDraft || isPublishing ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-label-small uppercase tracking-wider font-semibold shadow-xs">
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>Saving to Supabase...</span>
            </div>
          ) : statusMessage.type === 'error' ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 border border-red-300 text-red-800 text-xs font-label-small uppercase tracking-wider font-semibold shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Save Failed (Edits Kept)</span>
            </div>
          ) : isDirty ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-label-small uppercase tracking-wider font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Unsaved changes</span>
            </div>
          ) : statusMessage.type === 'saved' ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-label-small uppercase tracking-wider font-semibold shadow-xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved (Draft)</span>
            </div>
          ) : statusMessage.type === 'published' || publishStatus.status === 'published' ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-label-small uppercase tracking-wider font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Published (Live)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-50 border border-stone-200 text-stone-700 text-xs font-label-small uppercase tracking-wider font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span>Saved</span>
            </div>
          )}

          {/* Discard Draft button if modified */}
          {(publishStatus.status === 'modified' || publishStatus.hasDraftChanges || isDirty) && (
            <button
              type="button"
              onClick={handleRevertDraft}
              disabled={isReverting}
              className="px-3.5 py-2.5 rounded-full border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-btn font-medium text-red-700 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Discard Draft
            </button>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#596769] hover:text-[#202526] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          {/* Save Draft Button - Active ONLY when dirty */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!isDirty || isSavingDraft || isPublishing}
            title={isDirty ? 'Save changes to Supabase draft' : 'No unsaved changes'}
            className={`px-5 py-2.5 rounded-full border text-xs font-btn font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all ${
              isDirty
                ? 'border-amber-400 bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300/60 shadow-md cursor-pointer hover:scale-105 active:scale-95'
                : 'border-stone-200 bg-stone-100 text-stone-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDirty ? 'text-white' : 'text-stone-400'}`} />
            <span>{isSavingDraft ? 'Saving Draft...' : isDirty ? 'Save Draft' : 'Saved'}</span>
          </button>

          {/* Publish to Live Button */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSavingDraft || isPublishing}
            className={`px-6 py-2.5 rounded-full text-xs font-btn font-semibold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 ${
              statusMessage.type === 'published'
                ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-400'
                : 'bg-[#202526] hover:bg-[#111314] text-white'
            }`}
          >
            <Check className={`w-4 h-4 ${statusMessage.type === 'published' ? 'text-white stroke-[3]' : 'text-[#D8A9A8]'}`} />
            <span>{isPublishing ? 'Publishing...' : statusMessage.type === 'published' ? 'Published Live! ✓' : 'Publish to Live'}</span>
          </button>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-4 rounded-2xl text-xs font-label-small font-medium uppercase tracking-wider flex items-center justify-between animate-fadeIn shadow-xs border ${
          statusMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : statusMessage.type === 'saving' || statusMessage.type === 'publishing'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" /> {statusMessage.text}
          </span>
          <button
            type="button"
            onClick={() => setStatusMessage({ type: null, text: null })}
            className="text-stone-500 hover:text-stone-800 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/80 border border-[#E5E7EB] rounded-2xl w-fit font-sans-clean shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubSection('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubSection === 'hero'
              ? 'bg-[#202526] text-white shadow-xs'
              : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
          }`}
        >
          <Type className="w-3.5 h-3.5" /> Hero Section &amp; Portrait
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('lighting')}
          className={`px-4 py-2 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubSection === 'lighting'
              ? 'bg-[#202526] text-white shadow-xs'
              : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-[#D8A9A8]" /> 3D Lighting Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('about')}
          className={`px-4 py-2 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubSection === 'about'
              ? 'bg-[#202526] text-white shadow-xs'
              : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
          }`}
        >
          <Info className="w-3.5 h-3.5" /> About, Bio &amp; 3D Assets
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('services')}
          className={`px-4 py-2 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubSection === 'services'
              ? 'bg-[#202526] text-white shadow-xs'
              : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> What We Do &amp; Services
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('marquee')}
          className={`px-4 py-2 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubSection === 'marquee'
              ? 'bg-[#202526] text-white shadow-xs'
              : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Marquee Gallery Photos/GIFs
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection('contact')}
          className={`px-4 py-2 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubSection === 'contact'
              ? 'bg-[#202526] text-white shadow-xs'
              : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" /> Contact Info &amp; CTA
        </button>
      </div>

      <div className="space-y-6 font-sans-clean">
        {/* HERO SECTION */}
        {activeSubSection === 'hero' && (
          <div className="bg-white/85 p-6 sm:p-8 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl space-y-6 shadow-sm">
            <h3 className="text-lg font-elegant font-normal text-[#202526] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
              <Type className="w-4 h-4 text-[#D8A9A8]" />
              Hero Section Text &amp; Central 3D Portrait
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Giant Hero Headline
                </label>
                <input
                  type="text"
                  required
                  value={formData.hero.headline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, headline: e.target.value },
                    })
                  }
                  placeholder="AI BUILD"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] font-bezoria tracking-wider focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Top Navbar Brand Badge
                </label>
                <input
                  type="text"
                  required
                  value={formData.hero.badgeText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, badgeText: e.target.value },
                    })
                  }
                  placeholder="ai.build_"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] font-label-small focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Bottom-Left Hero Sub-Headline
                </label>
                <textarea
                  rows={2}
                  value={formData.hero.subtext}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, subtext: e.target.value },
                    })
                  }
                  placeholder="AI-POWERED EXPERIENCES & DIGITAL PRODUCTS FROM IDEA TO LAUNCH"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] resize-none focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Small Hero Sub-Pill Tag
                </label>
                <input
                  type="text"
                  value={formData.hero.subBadge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, subBadge: e.target.value },
                    })
                  }
                  placeholder="Full-Stack & AI Agents"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>
            </div>

            {/* Central Portrait Direct Uploader */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-label-small font-medium text-[#202526] uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#D8A9A8]" />
                    Central Interactive Hero Portrait
                  </h4>
                  <p className="text-xs text-[#596769] mt-0.5">
                    Upload a transparent PNG, 3D character photo, or avatar that tilts dynamically with mouse movement on the hero.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2">
                  {PORTRAIT_PRESETS.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, portraitUrl: p.url },
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-white hover:bg-[#F3F4F6] text-[11px] font-label-small uppercase tracking-wider text-[#202526] border border-[#E5E7EB] transition-colors cursor-pointer shadow-xs"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <MediaUploader
                label="Upload Portrait Photo (PNG with transparency recommended)"
                acceptType="image"
                value={formData.hero.portraitUrl}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, portraitUrl: val },
                  })
                }
                helperText="Drag and drop or browse any image from your computer."
                previewHeight="h-44"
              />

              {/* Quick Lighting Preset Picker inside Hero */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider font-label-small font-semibold text-[#202526] flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-[#D8A9A8]" />
                    3D Character Lighting Preset
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveSubSection('lighting')}
                    className="text-[11px] text-[#D8A9A8] hover:text-[#202526] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Open Full Lighting Studio &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LIGHTING_PRESET_LIST.map((p) => {
                    const isSelected =
                      (formData.characterLighting?.activePreset || DEFAULT_LIGHTING_PRESET) === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            characterLighting: {
                              ...(formData.characterLighting || {
                                customIntensity: 1.0,
                                rimLightBoost: 1.0,
                                enableSpecularHotspot: true,
                                enableFresnelRim: true,
                              }),
                              activePreset: p.id,
                            },
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#202526] text-white border-[#202526] shadow-xs'
                            : 'bg-[#F9FAFB] hover:bg-white text-[#202526] border-[#E5E7EB]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: p.previewColors.key }}
                        />
                        <span className="text-xs font-medium truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D CHARACTER LIGHTING PRESETS & OPTICAL SHADERS */}
        {activeSubSection === 'lighting' && (
          <div className="bg-white/85 p-6 sm:p-8 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h3 className="text-lg font-elegant font-normal text-[#202526] uppercase tracking-wider flex items-center gap-2">
                <Sun className="w-5 h-5 text-[#D8A9A8]" />
                3D Character Lighting Presets &amp; Optical Shaders
              </h3>
              <span className="text-xs text-[#596769]">
                Live optical reflections &amp; Fresnel rim control
              </span>
            </div>

            <CharacterLightingStudio
              settings={formData.characterLighting}
              portraitUrl={formData.hero.portraitUrl}
              onChange={(updatedLighting) => {
                setFormData({
                  ...formData,
                  characterLighting: updatedLighting,
                });
              }}
            />
          </div>
        )}

        {/* ABOUT SECTION & 3D ASSETS */}
        {activeSubSection === 'about' && (
          <div className="bg-white/85 p-6 sm:p-8 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl space-y-6 shadow-sm">
            <h3 className="text-lg font-elegant font-normal text-[#202526] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
              <Info className="w-4 h-4 text-[#D8A9A8]" />
              About Studio, Mission Statement &amp; 3D Floating Assets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  About Section Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.about.heading}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, heading: e.target.value },
                    })
                  }
                  placeholder="About"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] font-elegant focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Sub-Pill Tagline
                </label>
                <input
                  type="text"
                  value={formData.about.subPill}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, subPill: e.target.value },
                    })
                  }
                  placeholder="Studio Philosophy & Mission"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                Main Mission Statement / Studio Bio (Character Animated on Scroll)
              </label>
              <textarea
                rows={4}
                required
                value={formData.about.bio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    about: { ...formData.about, bio: e.target.value },
                  })
                }
                placeholder="AI Build is an AI-first digital studio that combines modern frontend engineering..."
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] resize-none focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
              />
            </div>

            {/* Value Pillars Editor */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.14em] font-label-small font-medium text-[#202526]">
                  Studio Pillars / Capabilities (3 Cards)
                </label>
                {formData.about.pillars.length < 4 && (
                  <button
                    type="button"
                    onClick={addPillar}
                    className="text-xs font-btn font-medium uppercase tracking-wider text-[#202526] hover:text-[#D8A9A8] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D8A9A8]" /> Add Pillar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {formData.about.pillars.map((pillar, pIdx) => (
                  <div
                    key={pillar.id || pIdx}
                    className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3 relative group shadow-xs"
                  >
                    {formData.about.pillars.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePillar(pIdx)}
                        className="absolute top-2.5 right-2.5 p-1 text-[#596769] hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div>
                      <label className="block text-[10px] uppercase font-label-small tracking-wider text-[#596769] mb-1">
                        Pillar Title
                      </label>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => updatePillar(pIdx, 'title', e.target.value)}
                        className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#202526] font-praise tracking-wide focus:outline-none focus:border-[#D8A9A8]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-label-small tracking-wider text-[#596769] mb-1">
                        Subtitle / Focus
                      </label>
                      <input
                        type="text"
                        value={pillar.subtitle}
                        onChange={(e) => updatePillar(pIdx, 'subtitle', e.target.value)}
                        className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#596769] focus:outline-none focus:border-[#D8A9A8]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Decorative 3D Corner Assets with Direct Upload */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-4 shadow-xs">
              <h4 className="text-sm font-label-small font-medium text-[#202526] uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#D8A9A8]" />
                Surrounding 3D Floating Assets (Corners)
              </h4>
              <p className="text-xs text-[#596769]">
                Upload transparent 3D icons, illustrations, or geometry for each corner of the about section.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MediaUploader
                  label="Top-Left (Moon Icon) Photo"
                  acceptType="image"
                  value={formData.about.decorativeAssets.moonUrl}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      about: {
                        ...formData.about,
                        decorativeAssets: {
                          ...formData.about.decorativeAssets,
                          moonUrl: val,
                        },
                      },
                    })
                  }
                  previewHeight="h-24"
                />

                <MediaUploader
                  label="Top-Right (Lego Block) Photo"
                  acceptType="image"
                  value={formData.about.decorativeAssets.legoUrl}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      about: {
                        ...formData.about,
                        decorativeAssets: {
                          ...formData.about.decorativeAssets,
                          legoUrl: val,
                        },
                      },
                    })
                  }
                  previewHeight="h-24"
                />

                <MediaUploader
                  label="Bottom-Left (3D Shape) Photo"
                  acceptType="image"
                  value={formData.about.decorativeAssets.shapeUrl}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      about: {
                        ...formData.about,
                        decorativeAssets: {
                          ...formData.about.decorativeAssets,
                          shapeUrl: val,
                        },
                      },
                    })
                  }
                  previewHeight="h-24"
                />

                <MediaUploader
                  label="Bottom-Right (3D Group) Photo"
                  acceptType="image"
                  value={formData.about.decorativeAssets.groupUrl}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      about: {
                        ...formData.about,
                        decorativeAssets: {
                          ...formData.about.decorativeAssets,
                          groupUrl: val,
                        },
                      },
                    })
                  }
                  previewHeight="h-24"
                />
              </div>
            </div>
          </div>
        )}

        {/* MARQUEE CAROUSEL WITH MULTI-IMAGE UPLOADER */}
        {activeSubSection === 'marquee' && (
          <div className="bg-white/85 p-6 sm:p-8 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl space-y-6 shadow-sm">
            <h3 className="text-lg font-elegant font-normal text-[#202526] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
              <Upload className="w-4 h-4 text-[#D8A9A8]" />
              Marquee Dual-Scroll Showcase Visuals
            </h3>
            <p className="text-xs text-[#596769]">
              Drag and drop multiple photos, GIFs, or project preview clips to populate Row 1 and Row 2 of the marquee showcase.
            </p>

            <div className="space-y-6">
              <MultiMediaUploader
                label="Marquee Row 1 (Left-Scrolling Track)"
                images={formData.marquee.row1Images}
                onChange={(updated) =>
                  setFormData({
                    ...formData,
                    marquee: {
                      ...formData.marquee,
                      row1Images: updated,
                    },
                  })
                }
                helperText="Upload photos or animated GIFs for the top scrolling track."
              />

              <MultiMediaUploader
                label="Marquee Row 2 (Right-Scrolling Track)"
                images={formData.marquee.row2Images}
                onChange={(updated) =>
                  setFormData({
                    ...formData,
                    marquee: {
                      ...formData.marquee,
                      row2Images: updated,
                    },
                  })
                }
                helperText="Upload photos or animated GIFs for the bottom scrolling track."
              />
            </div>
          </div>
        )}

        {/* SERVICES / WHAT WE DO SECTION */}
        {activeSubSection === 'services' && (
          <div className="bg-white/85 p-6 sm:p-8 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <h3 className="text-lg font-elegant font-normal text-[#202526] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D8A9A8]" />
                  "What We Do" &amp; Core Services Manager
                </h3>
                <p className="text-xs text-[#596769] mt-0.5 font-sans-clean">
                  Edit titles, descriptions, video showcases, turnarounds, deliverables, and process flows for every discipline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const items = formData.services?.items || [];
                  const nextNum = `0${items.length + 1}`;
                  const newItem = {
                    number: nextNum,
                    title: 'NEW DISCIPLINE',
                    description: 'Description of the new service.',
                    tagline: 'High impact tagline for this discipline.',
                    videoUrl: '',
                    videoPoster: '',
                    mediaItems: [],
                    weCreate: ['Feature 1', 'Feature 2'],
                    process: ['Discovery', 'Execution', 'Delivery'],
                    turnaround: '3–7 days',
                    deliverables: ['High-res Exports', 'Source Assets'],
                  };
                  setFormData({
                    ...formData,
                    services: {
                      heading: formData.services?.heading || 'WHAT WE DO',
                      subheading: formData.services?.subheading || 'We create. We build. We automate.',
                      items: [...items, newItem],
                    },
                  });
                }}
                className="px-4 py-2.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-[#D8A9A8]" /> Add New Discipline
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Section Header Label
                </label>
                <input
                  type="text"
                  value={formData.services?.heading || 'WHAT WE DO'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      services: {
                        ...(formData.services || {
                          heading: 'WHAT WE DO',
                          subheading: '',
                          items: [],
                        }),
                        heading: e.target.value,
                      },
                    })
                  }
                  placeholder="WHAT WE DO"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] font-label-small focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Manifesto Subheading Statement
                </label>
                <input
                  type="text"
                  value={
                    formData.services?.subheading ||
                    'We build digital assets, experiences and systems using AI + design + technology.'
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      services: {
                        ...(formData.services || {
                          heading: 'WHAT WE DO',
                          subheading: '',
                          items: [],
                        }),
                        subheading: e.target.value,
                      },
                    })
                  }
                  placeholder="We create. We build. We automate."
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>
            </div>

            {/* List of Disciplines / Services */}
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 p-3 rounded-2xl border border-[#E5E7EB]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setServicesView('active')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
                      servicesView === 'active'
                        ? 'bg-[#202526] text-white shadow-xs'
                        : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
                    }`}
                  >
                    Active Disciplines ({(formData.services?.items || []).filter((s) => !s.isDeleted && !s.deletedAt).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setServicesView('trash')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      servicesView === 'trash'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'text-rose-700 hover:text-rose-800 hover:bg-rose-50'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Trash ({(formData.services?.items || []).filter((s) => Boolean(s.isDeleted) || Boolean(s.deletedAt)).length})
                  </button>
                </div>
                <span className="text-[11px] text-[#596769] font-sans-clean">
                  {servicesView === 'active' ? 'Items visible in live portfolio' : 'Deleted items hidden on public site'}
                </span>
              </div>

              {/* Service Items List */}
              <div className="space-y-6">
                {(formData.services?.items || [])
                  .filter((s) => (servicesView === 'trash' ? Boolean(s.isDeleted) || Boolean(s.deletedAt) : !s.isDeleted && !s.deletedAt))
                  .length === 0 ? (
                  <div className="p-12 text-center bg-[#F8F9FA] rounded-2xl border border-dashed border-[#E5E7EB] text-xs text-[#596769]">
                    {servicesView === 'trash' ? 'Trash is empty. Soft-deleted services will appear here for recovery.' : 'No active disciplines. Click "+ Add New Discipline" above to create one.'}
                  </div>
                ) : (
                  (formData.services?.items || [])
                    .map((item, originalIdx) => ({ item, originalIdx }))
                    .filter(({ item }) => (servicesView === 'trash' ? Boolean(item.isDeleted) || Boolean(item.deletedAt) : !item.isDeleted && !item.deletedAt))
                    .map(({ item, originalIdx }, displayIdx, listArr) => {
                      const isItemDeleted = Boolean(item.isDeleted) || Boolean(item.deletedAt);
                      const isBeingDragged = draggedServiceIndex === originalIdx;
                      const isDropTarget = dropTargetServiceIndex === originalIdx;
                      const canDrag = !isItemDeleted && servicesView !== 'trash';

                      return (
                        <div
                          key={item.number || originalIdx}
                          draggable={canDrag}
                          onDragStart={(e) => {
                            setDraggedServiceIndex(originalIdx);
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', String(originalIdx));
                          }}
                          onDragOver={(e) => {
                            if (draggedServiceIndex !== null && draggedServiceIndex !== originalIdx) {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              if (dropTargetServiceIndex !== originalIdx) {
                                setDropTargetServiceIndex(originalIdx);
                              }
                            }
                          }}
                          onDragLeave={() => {
                            if (dropTargetServiceIndex === originalIdx) {
                              setDropTargetServiceIndex(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedServiceIndex !== null) {
                              handleDropService(draggedServiceIndex, originalIdx);
                            }
                          }}
                          onDragEnd={() => {
                            setDraggedServiceIndex(null);
                            setDropTargetServiceIndex(null);
                          }}
                          className={`p-5 sm:p-7 rounded-2xl border space-y-5 shadow-xs relative group transition-all ${
                            isBeingDragged ? 'opacity-40 scale-[0.99] border-dashed border-[#202526]' : ''
                          } ${
                            isDropTarget ? 'ring-2 ring-[#202526] ring-offset-2 border-[#202526] bg-[#202526]/[0.02]' : ''
                          } ${
                            isItemDeleted ? 'bg-rose-50/40 border-rose-200' : 'bg-[#F8F9FA] border-[#E5E7EB]'
                          }`}
                        >
                          {/* Header bar of each service item */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                            <div className="flex items-center gap-3">
                              {/* Drag Handle */}
                              {canDrag && (
                                <div
                                  className="flex items-center justify-center p-1 -ml-1 rounded-lg text-stone-400 hover:text-[#202526] hover:bg-black/[0.04] cursor-grab active:cursor-grabbing transition-colors shrink-0 select-none group/handle"
                                  title="Drag to reorder this discipline"
                                >
                                  <GripVertical className="w-4 h-4 group-hover/handle:scale-110 transition-transform" />
                                </div>
                              )}

                              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D8A9A8] bg-[#202526] px-2.5 py-1 rounded-md">
                                #{item.number || `0${originalIdx + 1}`}
                              </span>
                              <h4 className="text-base font-semibold uppercase tracking-wider text-[#202526]">
                                {item.title || 'Untitled Discipline'}
                              </h4>
                              {isItemDeleted ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label-small uppercase tracking-wider font-semibold text-rose-800 bg-rose-100 border border-rose-300 flex items-center gap-1 shadow-xs">
                                  <Archive className="w-3 h-3 text-rose-600" /> In Trash (Hidden)
                                </span>
                              ) : (item.isHidden || item.status === 'hidden' || item.status === 'unpublished') ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label-small uppercase tracking-wider font-semibold text-amber-800 bg-amber-100 border border-amber-300 flex items-center gap-1 shadow-xs">
                                  <EyeOff className="w-3 h-3 text-amber-600" /> Hidden (Offline)
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Quick Move Up/Down */}
                              {canDrag && (
                                <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg p-0.5 mr-1 shadow-xs">
                                  <button
                                    type="button"
                                    disabled={displayIdx === 0}
                                    onClick={() => moveService(originalIdx, 'up')}
                                    className="p-1 rounded text-[#596769] hover:text-[#202526] hover:bg-black/[0.04] disabled:opacity-30 cursor-pointer transition-colors"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={displayIdx === listArr.length - 1}
                                    onClick={() => moveService(originalIdx, 'down')}
                                    className="p-1 rounded text-[#596769] hover:text-[#202526] hover:bg-black/[0.04] disabled:opacity-30 cursor-pointer transition-colors"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              {isItemDeleted ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...(formData.services?.items || [])];
                                      updated[originalIdx] = { ...updated[originalIdx], isDeleted: false, deletedAt: null };
                                      setFormData({
                                        ...formData,
                                        services: {
                                          heading: formData.services?.heading || 'WHAT WE DO',
                                          subheading: formData.services?.subheading || '',
                                          items: updated,
                                        },
                                      });
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-btn uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteServiceModal({
                                        isOpen: true,
                                        serviceNumber: item.number,
                                        serviceTitle: item.title,
                                        permanent: true,
                                      });
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-xs font-btn uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {/* Quick Published / Hidden Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...(formData.services?.items || [])];
                                      const isCurrentlyHidden = Boolean(
                                        updated[originalIdx].isHidden ||
                                          updated[originalIdx].status === 'hidden' ||
                                          updated[originalIdx].status === 'unpublished'
                                      );
                                      const nextHidden = !isCurrentlyHidden;
                                      updated[originalIdx] = {
                                        ...updated[originalIdx],
                                        isHidden: nextHidden,
                                        status: nextHidden ? 'hidden' : 'published',
                                      };
                                      setFormData({
                                        ...formData,
                                        services: {
                                          heading: formData.services?.heading || 'WHAT WE DO',
                                          subheading: formData.services?.subheading || '',
                                          items: updated,
                                        },
                                      });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-btn uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                                      item.isHidden || item.status === 'hidden' || item.status === 'unpublished'
                                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                                    }`}
                                    title={
                                      item.isHidden || item.status === 'hidden' || item.status === 'unpublished'
                                        ? 'Discipline is hidden from public site. Click to publish.'
                                        : 'Discipline is published live. Click to hide.'
                                    }
                                  >
                                    {item.isHidden || item.status === 'hidden' || item.status === 'unpublished' ? (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5 text-amber-600" /> Hidden
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-3.5 h-3.5 text-emerald-600" /> Published
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteServiceModal({
                                        isOpen: true,
                                        serviceNumber: item.number,
                                        serviceTitle: item.title,
                                        permanent: false,
                                      });
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-btn uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Move to Trash (Safe Delete)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                            {/* Number & Title */}
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] uppercase font-label-small font-medium text-[#596769] mb-1">
                                Number Badge
                              </label>
                              <input
                                type="text"
                                value={item.number}
                                onChange={(e) => {
                                  const updated = [...(formData.services?.items || [])];
                                  updated[originalIdx] = { ...updated[originalIdx], number: e.target.value };
                                  setFormData({
                                    ...formData,
                                    services: {
                                      heading: formData.services?.heading || 'WHAT WE DO',
                                      subheading: formData.services?.subheading || '',
                                      items: updated,
                                    },
                                  });
                                }}
                                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#202526] font-mono text-center font-bold focus:outline-none focus:border-[#D8A9A8]"
                              />
                            </div>

                            <div className="sm:col-span-5">
                              <label className="block text-[11px] uppercase font-label-small font-medium text-[#596769] mb-1">
                                Discipline Title
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...(formData.services?.items || [])];
                                  updated[originalIdx] = { ...updated[originalIdx], title: e.target.value };
                                  setFormData({
                                    ...formData,
                                    services: {
                                      heading: formData.services?.heading || 'WHAT WE DO',
                                      subheading: formData.services?.subheading || '',
                                      items: updated,
                                    },
                                  });
                                }}
                                placeholder="Discipline Title (e.g. UGC ADS)"
                                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#202526] font-bold uppercase tracking-wider focus:outline-none focus:border-[#D8A9A8]"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-[11px] uppercase font-label-small font-medium text-[#596769] mb-1">
                                Turnaround SLA
                              </label>
                              <input
                                type="text"
                                value={item.turnaround || ''}
                                onChange={(e) => {
                                  const updated = [...(formData.services?.items || [])];
                                  updated[originalIdx] = { ...updated[originalIdx], turnaround: e.target.value };
                                  setFormData({
                                    ...formData,
                                    services: {
                                      heading: formData.services?.heading || 'WHAT WE DO',
                                      subheading: formData.services?.subheading || '',
                                      items: updated,
                                    },
                                  });
                                }}
                                placeholder="e.g. 3–7 days"
                                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#202526] font-mono focus:outline-none focus:border-[#D8A9A8]"
                              />
                            </div>
                          </div>

                          {/* Tagline & Short Description */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] uppercase font-label-small font-medium text-[#596769] mb-1">
                                Tagline Statement
                              </label>
                              <input
                                type="text"
                                value={item.tagline || ''}
                                onChange={(e) => {
                                  const updated = [...(formData.services?.items || [])];
                                  updated[originalIdx] = { ...updated[originalIdx], tagline: e.target.value };
                                  setFormData({
                                    ...formData,
                                    services: {
                                      heading: formData.services?.heading || 'WHAT WE DO',
                                      subheading: formData.services?.subheading || '',
                                      items: updated,
                                    },
                                  });
                                }}
                                placeholder="Performance-driven content that feels native to the feed."
                                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#202526] focus:outline-none focus:border-[#D8A9A8]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] uppercase font-label-small font-medium text-[#596769] mb-1">
                                Short Overview Description
                              </label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => {
                                  const updated = [...(formData.services?.items || [])];
                                  updated[originalIdx] = { ...updated[originalIdx], description: e.target.value };
                                  setFormData({
                                    ...formData,
                                    services: {
                                      heading: formData.services?.heading || 'WHAT WE DO',
                                      subheading: formData.services?.subheading || '',
                                      items: updated,
                                    },
                                  });
                                }}
                                placeholder="Ads people actually want to watch."
                                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#596769] focus:outline-none focus:border-[#D8A9A8]"
                              />
                            </div>
                          </div>

                          {/* Extended Specs: We Create, Process, Deliverables */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div>
                              <label className="block text-[11px] uppercase font-label-small font-medium text-[#596769] mb-1">
                                We Create (Line Separated)
                              </label>
                              <textarea
                                rows={3}
                                value={(item.weCreate || []).join('\n')}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n').filter((l) => l.trim() !== '');
                                  const updated = [...(formData.services?.items || [])];
                                  updated[originalIdx] = { ...updated[originalIdx], weCreate: lines };
                                  setFormData({
                                    ...formData,
                                    services: {
                                      heading: formData.services?.heading || 'WHAT WE DO',
                                      subheading: formData.services?.subheading || '',
                                      items: updated,
                                    },
                                  });
                                }}
                                placeholder="Product UGC&#10;Creator-style ads&#10;Hook variations"
                                className="w-full bg-white border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#202526] font-sans-clean resize-none focus:outline-none focus:border-[#D8A9A8]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] uppercase font-label-small font-medium text-[#596769] mb-1">
                                Process Steps (Line Separated)
                              </label>
                              <textarea
                                rows={3}
                                value={(item.process || []).join('\n')}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n').filter((l) => l.trim() !== '');
                                  const updated = [...(formData.services?.items || [])];
                                  updated[originalIdx] = { ...updated[originalIdx], process: lines };
                                  setFormData({
                                    ...formData,
                                    services: {
                                      heading: formData.services?.heading || 'WHAT WE DO',
                                      subheading: formData.services?.subheading || '',
                                      items: updated,
                                    },
                                  });
                                }}
                                placeholder="Brief&#10;Concept&#10;Script&#10;Edit"
                                className="w-full bg-white border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#202526] font-sans-clean resize-none focus:outline-none focus:border-[#D8A9A8]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] uppercase font-label-small font-medium text-[#596769] mb-1">
                                Deliverables (Line Separated)
                              </label>
                              <textarea
                                rows={3}
                                value={(item.deliverables || []).join('\n')}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n').filter((l) => l.trim() !== '');
                                  const updated = [...(formData.services?.items || [])];
                                  updated[originalIdx] = { ...updated[originalIdx], deliverables: lines };
                                  setFormData({
                                    ...formData,
                                    services: {
                                      heading: formData.services?.heading || 'WHAT WE DO',
                                      subheading: formData.services?.subheading || '',
                                      items: updated,
                                    },
                                  });
                                }}
                                placeholder="9:16 vertical video&#10;Multiple hooks&#10;Ad-ready exports"
                                className="w-full bg-white border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#202526] font-sans-clean resize-none focus:outline-none focus:border-[#D8A9A8]"
                              />
                            </div>
                          </div>

                          {/* Multi-Media Continuous Reel Manager (Videos & Photos with zero-cut playback) */}
                          <ServiceMediaManager
                            disciplineTitle={item.title || 'Discipline'}
                            items={item.mediaItems || (item.videoUrl ? [{ id: `init-${originalIdx}`, url: item.videoUrl, type: 'video', poster: item.videoPoster, title: item.title }] : [])}
                            onChange={(mediaList) => {
                              const updated = [...(formData.services?.items || [])];
                              const firstVid = mediaList.find((m) => m.type === 'video');
                              const firstImg = mediaList.find((m) => m.type === 'image');
                              updated[originalIdx] = {
                                ...updated[originalIdx],
                                mediaItems: mediaList,
                                videoUrl: firstVid ? firstVid.url : (mediaList[0]?.url || ''),
                                videoPoster: firstImg ? firstImg.url : (firstVid?.poster || updated[originalIdx].videoPoster || ''),
                              };
                              setFormData({
                                ...formData,
                                services: {
                                  heading: formData.services?.heading || 'WHAT WE DO',
                                  subheading: formData.services?.subheading || '',
                                  items: updated,
                                },
                              });
                            }}
                          />
                        </div>
                      );
                    })
                )}
              </div>

              {/* Service Delete Confirmation Modal */}
              {deleteServiceModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                  <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-2xl space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-xl font-elegant text-[#202526]">
                        {deleteServiceModal.permanent ? 'Permanently Remove Discipline?' : 'Move Discipline to Trash?'}
                      </h3>
                      <p className="text-xs text-[#596769] mt-1.5 leading-relaxed font-sans-clean">
                        {deleteServiceModal.permanent ? (
                          <>
                            Are you sure you want to permanently remove{' '}
                            <strong className="text-[#202526]">&quot;{deleteServiceModal.serviceTitle || deleteServiceModal.serviceNumber}&quot;</strong>?
                            This action cannot be undone.
                          </>
                        ) : (
                          <>
                            Are you sure you want to move{' '}
                            <strong className="text-[#202526]">&quot;{deleteServiceModal.serviceTitle || deleteServiceModal.serviceNumber}&quot;</strong> to the Trash?
                            It will be hidden from the public website upon saving/publishing, but remains safely recoverable anytime from the Trash tab.
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setDeleteServiceModal({ isOpen: false, serviceNumber: null, serviceTitle: null, permanent: false })}
                        className="px-4 py-2 rounded-xl text-xs font-btn font-medium uppercase tracking-wider text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!deleteServiceModal.serviceNumber) return;
                          const num = deleteServiceModal.serviceNumber;
                          if (deleteServiceModal.permanent) {
                            const updated = (formData.services?.items || []).filter((s) => s.number !== num);
                            setFormData({
                              ...formData,
                              services: {
                                heading: formData.services?.heading || 'WHAT WE DO',
                                subheading: formData.services?.subheading || '',
                                items: updated,
                              },
                            });
                          } else {
                            const updated = (formData.services?.items || []).map((s) =>
                              s.number === num ? { ...s, isDeleted: true, deletedAt: new Date().toISOString() } : s
                            );
                            setFormData({
                              ...formData,
                              services: {
                                heading: formData.services?.heading || 'WHAT WE DO',
                                subheading: formData.services?.subheading || '',
                                items: updated,
                              },
                            });
                          }
                          setDeleteServiceModal({ isOpen: false, serviceNumber: null, serviceTitle: null, permanent: false });
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-btn font-semibold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-sm"
                      >
                        {deleteServiceModal.permanent ? 'Permanently Delete' : 'Move to Trash'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTACT & CTA */}
        {activeSubSection === 'contact' && (
          <div className="bg-white/85 p-6 sm:p-8 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl space-y-6 shadow-sm">
            <h3 className="text-lg font-elegant font-normal text-[#202526] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
              <Mail className="w-4 h-4 text-[#D8A9A8]" />
              Studio Contact Details &amp; Form Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Studio Inquiry Email (Shown in Contact Modal)
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value },
                    })
                  }
                  placeholder="hello@aibuild.studio"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Availability Status Badge
                </label>
                <input
                  type="text"
                  value={formData.contact.statusBadge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, statusBadge: e.target.value },
                    })
                  }
                  placeholder="Studio Accepting Q3/Q4 Projects"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Contact Modal Headline
                </label>
                <input
                  type="text"
                  value={formData.contact.ctaHeadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, ctaHeadline: e.target.value },
                    })
                  }
                  placeholder="Let's Build"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] font-elegant focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Contact Modal Subtext
                </label>
                <input
                  type="text"
                  value={formData.contact.ctaSubtext}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, ctaSubtext: e.target.value },
                    })
                  }
                  placeholder="Have an AI product, bespoke web experience, or automated system..."
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB] mt-6">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isPublishing}
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-[#CBDCDE] text-[#202526] hover:bg-[#F8F9FA] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || isSavingDraft}
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#202526] hover:bg-[#111314] text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5 text-[#D8A9A8]" />
            <span>{isPublishing ? 'Publishing Live...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
