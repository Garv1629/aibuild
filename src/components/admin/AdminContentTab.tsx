import React, { useState, useEffect } from 'react';
import { WebsiteContent } from '../../types';
import { adminStore } from '../../services/adminStore';
import { MediaUploader } from './MediaUploader';
import { MultiMediaUploader } from './MultiMediaUploader';
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
  const [savedToast, setSavedToast] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<
    'hero' | 'lighting' | 'about' | 'services' | 'marquee' | 'contact'
  >('hero');

  // Synchronize state when content prop changes
  useEffect(() => {
    setFormDataState(content);
  }, [content]);

  // Real-time synchronization: updates local state AND publishes directly to adminStore
  // so any connected live preview or split-screen reflects keystrokes in real time
  const setFormData = (
    nextOrUpdater: WebsiteContent | ((prev: WebsiteContent) => WebsiteContent)
  ) => {
    setFormDataState((prev) => {
      const next = typeof nextOrUpdater === 'function' ? nextOrUpdater(prev) : nextOrUpdater;
      adminStore.updateWebsiteContent(next);
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminStore.updateWebsiteContent(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all website text and media content to initial factory defaults?')) {
      adminStore.resetToDefaults();
      setFormData(adminStore.getWebsiteContent());
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-label-small uppercase tracking-wider font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Live Sync</span>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#596769] hover:text-[#202526] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Check className="w-4 h-4" />
            Save Live Changes
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-label-small font-medium uppercase tracking-wider flex items-center justify-between animate-fadeIn shadow-xs">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" /> Changes applied! Website live preview updated with new content and uploaded assets.
          </span>
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

      <form onSubmit={handleSave} className="space-y-6 font-sans-clean">
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
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-[0.14em] font-label-small font-semibold text-[#202526]">
                  Disciplines / Services Stack ({formData.services?.items?.length || 0})
                </label>
              </div>

              <div className="space-y-6">
                {(formData.services?.items || []).map((item, idx) => (
                  <div
                    key={item.number || idx}
                    className="p-5 sm:p-7 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-5 shadow-xs relative group"
                  >
                    {/* Header bar of each service item */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D8A9A8] bg-[#202526] px-2.5 py-1 rounded-md">
                          #{item.number || `0${idx + 1}`}
                        </span>
                        <h4 className="text-base font-semibold uppercase tracking-wider text-[#202526]">
                          {item.title || 'Untitled Discipline'}
                        </h4>
                      </div>

                      {(formData.services?.items || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete discipline "${item.title || item.number}"?`)) {
                              const updated = (formData.services?.items || []).filter((_, i) => i !== idx);
                              setFormData({
                                ...formData,
                                services: {
                                  heading: formData.services?.heading || 'WHAT WE DO',
                                  subheading: formData.services?.subheading || '',
                                  items: updated,
                                },
                              });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-btn uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
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
                            updated[idx] = { ...updated[idx], number: e.target.value };
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
                            updated[idx] = { ...updated[idx], title: e.target.value };
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
                            updated[idx] = { ...updated[idx], turnaround: e.target.value };
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
                            updated[idx] = { ...updated[idx], tagline: e.target.value };
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
                            updated[idx] = { ...updated[idx], description: e.target.value };
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
                            updated[idx] = { ...updated[idx], weCreate: lines };
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
                            updated[idx] = { ...updated[idx], process: lines };
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
                            updated[idx] = { ...updated[idx], deliverables: lines };
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

                    {/* Direct Media Uploaders for Discipline Video Showcase & Poster */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E7EB]">
                      <MediaUploader
                        label="Discipline Showcase Video (.mp4 / .webm)"
                        acceptType="video"
                        value={item.videoUrl || ''}
                        onChange={(val) => {
                          const updated = [...(formData.services?.items || [])];
                          updated[idx] = { ...updated[idx], videoUrl: val };
                          setFormData({
                            ...formData,
                            services: {
                              heading: formData.services?.heading || 'WHAT WE DO',
                              subheading: formData.services?.subheading || '',
                              items: updated,
                            },
                          });
                        }}
                        helperText="Upload or link a showcase video for this discipline."
                        previewHeight="h-28"
                      />

                      <MediaUploader
                        label="Video Poster Image Thumbnail"
                        acceptType="image"
                        value={item.videoPoster || ''}
                        onChange={(val) => {
                          const updated = [...(formData.services?.items || [])];
                          updated[idx] = { ...updated[idx], videoPoster: val };
                          setFormData({
                            ...formData,
                            services: {
                              heading: formData.services?.heading || 'WHAT WE DO',
                              subheading: formData.services?.subheading || '',
                              items: updated,
                            },
                          });
                        }}
                        helperText="Thumbnail photo displayed before video plays."
                        previewHeight="h-28"
                      />
                    </div>
                  </div>
                ))}
              </div>
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
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" /> Save All Content Changes
          </button>
        </div>
      </form>
    </div>
  );
};
