/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Check,
  Globe,
  Mail,
  Github,
  Linkedin,
  Award,
  Type,
  MessageSquare,
  Compass,
  BookOpen,
  Layers,
  Send,
  EyeOff,
  Phone,
  MapPin,
  Twitter,
  Instagram,
  Sparkles,
  Zap,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { BrandPrincipleStat, SiteTexts, DEFAULT_SITE_TEXTS } from '../../utils/portfolio.ts';

type ContentSubTab = 'hero' | 'about' | 'sections' | 'contact';

export const BrandSettingsManager: React.FC = () => {
  const { data, updateGeneralSettings, updateStat, updateSiteTexts, publishAllChanges } = usePortfolio();

  const [activeSubTab, setActiveSubTab] = useState<ContentSubTab>('hero');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [publishedToast, setPublishedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [brandForm, setBrandForm] = useState({
    brandName: data.brandName,
    brandTagline: data.brandTagline,
    heroDescription: data.heroDescription,
    githubUrl: data.githubUrl,
    email: data.email || 'aibuild1629@gmail.com',
    linkedinUrl: data.linkedinUrl,
  });

  const [siteTextsForm, setSiteTextsForm] = useState<SiteTexts>({
    ...DEFAULT_SITE_TEXTS,
    ...(data.siteTexts || {}),
  });

  const [statsList, setStatsList] = useState<BrandPrincipleStat[]>([...data.stats]);

  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (isDirtyRef.current) return;
    setBrandForm({
      brandName: data.brandName,
      brandTagline: data.brandTagline,
      heroDescription: data.heroDescription,
      githubUrl: data.githubUrl,
      email: data.email || 'aibuild1629@gmail.com',
      linkedinUrl: data.linkedinUrl,
    });
    setSiteTextsForm({
      ...DEFAULT_SITE_TEXTS,
      ...(data.siteTexts || {}),
    });
    setStatsList([...data.stats]);
  }, [data]);

  const handleSave = async (publishImmediately = false) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await updateGeneralSettings(brandForm);
      await updateSiteTexts(siteTextsForm);
      await Promise.all(statsList.map((stat, idx) => updateStat(idx, stat)));

      isDirtyRef.current = false;

      if (publishImmediately) {
        await publishAllChanges();
        setPublishedToast(true);
        setTimeout(() => setPublishedToast(false), 2500);
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save brand settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBrandChange = (field: keyof typeof brandForm, val: string) => {
    isDirtyRef.current = true;
    setBrandForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleStatChange = (idx: number, field: keyof BrandPrincipleStat, val: string) => {
    isDirtyRef.current = true;
    const updated = [...statsList];
    updated[idx] = { ...updated[idx], [field]: val };
    setStatsList(updated);
  };

  const handleTextChange = (field: keyof SiteTexts, val: string) => {
    isDirtyRef.current = true;
    setSiteTextsForm((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  return (
    <div className="space-y-6 font-body">
      {/* Top action bar */}
      <div className="p-4 sm:p-5 rounded-3xl liquid-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-white">Website Content & Section Management</h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Live CMS
            </span>
          </div>
          <p className="text-xs text-muted font-mono mt-0.5">
            Customize hero headlines, brand narrative, principle stats, section titles, and contact information.
          </p>
        </div>

        {/* Global Save Draft & Publish Controls */}
        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>Draft Saved!</span>
            </span>
          )}

          {publishedToast && (
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Published Live!</span>
            </span>
          )}

          {saveError && (
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
              {saveError}
            </span>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="px-4 py-2 rounded-xl liquid-glass-pill hover:bg-white/15 text-white text-xs font-mono cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Save changes to draft storage"
          >
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-mono font-semibold cursor-pointer shadow-[0_0_16px_rgba(56,189,248,0.35)] flex items-center gap-1.5 disabled:opacity-50"
            title="Save and publish directly to live website"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/10 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('hero')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'hero'
              ? 'liquid-glass-pill-active text-white font-medium shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Hero & Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('about')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'about'
              ? 'liquid-glass-pill-active text-white font-medium shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-sky-400" />
          <span>About & Brand Principles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sections')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'sections'
              ? 'liquid-glass-pill-active text-white font-medium shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-sky-400" />
          <span>Section Headings & Accents</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('contact')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'contact'
              ? 'liquid-glass-pill-active text-white font-medium shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-sky-400" />
          <span>Contact & Social Links</span>
        </button>
      </div>

      {/* Form Content Based on Subtab */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(true); }} className="space-y-6">
        {/* Tab 1: Hero & Identity */}
        {activeSubTab === 'hero' && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/10 space-y-5 animate-fadeIn">
            <h5 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Hero Section & Brand Identity</span>
            </h5>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  required
                  value={brandForm.brandName}
                  onChange={(e) => handleBrandChange('brandName', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Brand Tagline</label>
                <input
                  type="text"
                  required
                  value={brandForm.brandTagline}
                  onChange={(e) => handleBrandChange('brandTagline', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Hero Top Eyebrow</label>
                <input
                  type="text"
                  value={siteTextsForm.heroEyebrow}
                  onChange={(e) => handleTextChange('heroEyebrow', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  placeholder="AI-POWERED DIGITAL INNOVATION"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Hero Main Headline</label>
                <input
                  type="text"
                  value={siteTextsForm.heroHeadline}
                  onChange={(e) => handleTextChange('heroHeadline', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  placeholder="AI Build"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Hero Role Prefix</label>
                <input
                  type="text"
                  value={siteTextsForm.heroRolePrefix}
                  onChange={(e) => handleTextChange('heroRolePrefix', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  placeholder="Ideas into reality through"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Navbar Availability Badge</label>
                <input
                  type="text"
                  value={siteTextsForm.navAvailabilityText}
                  onChange={(e) => handleTextChange('navAvailabilityText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  placeholder="Available for projects"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-white/80 mb-1.5">Hero Description</label>
                <textarea
                  rows={3}
                  value={brandForm.heroDescription}
                  onChange={(e) => handleBrandChange('heroDescription', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={siteTextsForm.heroCtaWorks}
                  onChange={(e) => handleTextChange('heroCtaWorks', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  placeholder="See Works"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Secondary CTA Button Label</label>
                <input
                  type="text"
                  value={siteTextsForm.heroCtaContact}
                  onChange={(e) => handleTextChange('heroCtaContact', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                  placeholder="Reach out"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: About & Brand Principles */}
        {activeSubTab === 'about' && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/10 space-y-6 animate-fadeIn">
            <h5 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>3 Core Brand Principles & Stats</span>
            </h5>

            <div className="space-y-4">
              {statsList.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
                    Principle Card #{idx + 1}
                  </span>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1">Pillar Value / Headline</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/70 mb-1">Sub-headline / Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="xl:col-span-2">
                      <label className="block text-xs font-mono text-white/70 mb-1">Narrative Description</label>
                      <textarea
                        rows={2}
                        value={stat.sub}
                        onChange={(e) => handleStatChange(idx, 'sub', e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Section Headings */}
        {activeSubTab === 'sections' && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/10 space-y-6 animate-fadeIn">
            <h5 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>Public Section Headings & Accents</span>
            </h5>

            <div className="space-y-6">
              {/* Selected Works Headings */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-xs font-mono text-sky-300 font-semibold">Selected Works Section</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Eyebrow</label>
                    <input
                      type="text"
                      value={siteTextsForm.worksEyebrow}
                      onChange={(e) => handleTextChange('worksEyebrow', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Heading</label>
                    <input
                      type="text"
                      value={siteTextsForm.worksHeading}
                      onChange={(e) => handleTextChange('worksHeading', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Italic Accent Word</label>
                    <input
                      type="text"
                      value={siteTextsForm.worksHeadingItalic}
                      onChange={(e) => handleTextChange('worksHeadingItalic', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-display italic"
                    />
                  </div>
                  <div className="sm:col-span-2 xl:col-span-3">
                    <label className="block text-xs font-mono text-white/70 mb-1">Subtext</label>
                    <textarea
                      rows={2}
                      value={siteTextsForm.worksSubtext}
                      onChange={(e) => handleTextChange('worksSubtext', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Explorations Headings */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-xs font-mono text-sky-300 font-semibold">Visual Playground / Explorations</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Eyebrow</label>
                    <input
                      type="text"
                      value={siteTextsForm.explorationsEyebrow}
                      onChange={(e) => handleTextChange('explorationsEyebrow', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Heading</label>
                    <input
                      type="text"
                      value={siteTextsForm.explorationsHeading}
                      onChange={(e) => handleTextChange('explorationsHeading', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Italic Accent Word</label>
                    <input
                      type="text"
                      value={siteTextsForm.explorationsHeadingItalic}
                      onChange={(e) => handleTextChange('explorationsHeadingItalic', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-display italic"
                    />
                  </div>
                  <div className="sm:col-span-2 xl:col-span-3">
                    <label className="block text-xs font-mono text-white/70 mb-1">Subtext</label>
                    <textarea
                      rows={2}
                      value={siteTextsForm.explorationsSubtext}
                      onChange={(e) => handleTextChange('explorationsSubtext', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Journal Headings */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-xs font-mono text-sky-300 font-semibold">Journal & Thoughts Section</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Eyebrow</label>
                    <input
                      type="text"
                      value={siteTextsForm.journalEyebrow}
                      onChange={(e) => handleTextChange('journalEyebrow', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Heading</label>
                    <input
                      type="text"
                      value={siteTextsForm.journalHeading}
                      onChange={(e) => handleTextChange('journalHeading', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">Italic Accent Word</label>
                    <input
                      type="text"
                      value={siteTextsForm.journalHeadingItalic}
                      onChange={(e) => handleTextChange('journalHeadingItalic', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-display italic"
                    />
                  </div>
                  <div className="sm:col-span-2 xl:col-span-3">
                    <label className="block text-xs font-mono text-white/70 mb-1">Subtext</label>
                    <textarea
                      rows={2}
                      value={siteTextsForm.journalSubtext}
                      onChange={(e) => handleTextChange('journalSubtext', e.target.value)}
                      className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Contact & Social Links */}
        {activeSubTab === 'contact' && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/10 space-y-5 animate-fadeIn">
            <h5 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Contact Card, Social Links & Footer</span>
            </h5>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Contact Card Eyebrow</label>
                <input
                  type="text"
                  value={siteTextsForm.contactCardEyebrow}
                  onChange={(e) => handleTextChange('contactCardEyebrow', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Contact CTA Button Label</label>
                <input
                  type="text"
                  value={siteTextsForm.contactCtaText}
                  onChange={(e) => handleTextChange('contactCtaText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Contact Card Heading</label>
                <input
                  type="text"
                  value={siteTextsForm.contactCardHeading}
                  onChange={(e) => handleTextChange('contactCardHeading', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Heading Italic Accent</label>
                <input
                  type="text"
                  value={siteTextsForm.contactCardHeadingItalic}
                  onChange={(e) => handleTextChange('contactCardHeadingItalic', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-display italic"
                />
              </div>

              <div className="xl:col-span-2">
                <label className="block text-xs font-mono text-white/80 mb-1.5">Contact Card Subtext</label>
                <textarea
                  rows={2}
                  value={siteTextsForm.contactCardSubtext}
                  onChange={(e) => handleTextChange('contactCardSubtext', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Marquee Loop Banner Text</label>
                <input
                  type="text"
                  value={siteTextsForm.marqueeText}
                  onChange={(e) => handleTextChange('marqueeText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Footer Status Badge</label>
                <input
                  type="text"
                  value={siteTextsForm.footerStatusBadge}
                  onChange={(e) => handleTextChange('footerStatusBadge', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-sky-400" />
                  <span>Public Inquiry Email</span>
                </label>
                <input
                  type="email"
                  value={brandForm.email}
                  onChange={(e) => handleBrandChange('email', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5 flex items-center gap-1.5">
                  <Github className="w-3 h-3 text-sky-400" />
                  <span>GitHub Profile / Repo URL</span>
                </label>
                <input
                  type="url"
                  value={brandForm.githubUrl}
                  onChange={(e) => handleBrandChange('githubUrl', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5 flex items-center gap-1.5">
                  <Linkedin className="w-3 h-3 text-sky-400" />
                  <span>LinkedIn Profile URL</span>
                </label>
                <input
                  type="url"
                  value={brandForm.linkedinUrl}
                  onChange={(e) => handleBrandChange('linkedinUrl', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Footer Copyright Line</label>
                <input
                  type="text"
                  value={siteTextsForm.footerCopyright}
                  onChange={(e) => handleTextChange('footerCopyright', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-5 py-2.5 rounded-xl liquid-glass-pill text-xs font-mono text-white hover:bg-white/10"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-xs font-mono text-white font-medium shadow-[0_0_20px_rgba(56,189,248,0.4)] flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Save & Publish Live</span>
          </button>
        </div>
      </form>
    </div>
  );
};
