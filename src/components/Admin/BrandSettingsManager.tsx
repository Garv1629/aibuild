/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sliders, Check, Globe, Mail, Github, Linkedin, Award, Type, MessageSquare, Compass, BookOpen, Layers } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { BrandPrincipleStat, SiteTexts, DEFAULT_SITE_TEXTS } from '../../utils/portfolio.ts';

export const BrandSettingsManager: React.FC = () => {
  const { data, updateGeneralSettings, updateStat, updateSiteTexts } = usePortfolio();

  const [brandForm, setBrandForm] = useState({
    brandName: data.brandName,
    brandTagline: data.brandTagline,
    heroDescription: data.heroDescription,
    githubUrl: data.githubUrl,
    email: data.email,
    linkedinUrl: data.linkedinUrl,
  });

  const [siteTextsForm, setSiteTextsForm] = useState<SiteTexts>({
    ...DEFAULT_SITE_TEXTS,
    ...(data.siteTexts || {}),
  });

  const [statsList, setStatsList] = useState<BrandPrincipleStat[]>([...data.stats]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setBrandForm({
      brandName: data.brandName,
      brandTagline: data.brandTagline,
      heroDescription: data.heroDescription,
      githubUrl: data.githubUrl,
      email: data.email,
      linkedinUrl: data.linkedinUrl,
    });
    setSiteTextsForm({
      ...DEFAULT_SITE_TEXTS,
      ...(data.siteTexts || {}),
    });
    setStatsList([...data.stats]);
  }, [data]);

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    updateGeneralSettings(brandForm);
    updateSiteTexts(siteTextsForm);

    statsList.forEach((st, idx) => {
      updateStat(idx, st);
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleStatChange = (idx: number, field: keyof BrandPrincipleStat, val: string) => {
    const updated = [...statsList];
    updated[idx] = { ...updated[idx], [field]: val };
    setStatsList(updated);
  };

  const handleTextChange = (field: keyof SiteTexts, val: string) => {
    setSiteTextsForm((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="p-4 rounded-2xl liquid-glass flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium text-white">Brand & General Identity Settings</h4>
          <p className="text-xs text-muted">
            Configure site-wide brand names, hero taglines, social links, and brand principle stats.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
            <Check className="w-3.5 h-3.5" />
            Brand Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveBrand} className="space-y-6">
        {/* Identity & Hero Section */}
        <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/15 space-y-5">
          <h5 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Brand & Hero Details</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">Brand Name</label>
              <input
                type="text"
                required
                value={brandForm.brandName}
                onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">Brand Tagline</label>
              <input
                type="text"
                required
                value={brandForm.brandTagline}
                onChange={(e) => setBrandForm({ ...brandForm, brandTagline: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-white/80 mb-1.5">Hero Lead Description</label>
              <textarea
                rows={3}
                required
                value={brandForm.heroDescription}
                onChange={(e) => setBrandForm({ ...brandForm, heroDescription: e.target.value })}
                className="w-full liquid-glass-input rounded-xl p-3 text-xs leading-relaxed text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/15 space-y-5">
          <h5 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Contact & Social Links</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">Email Address</label>
              <input
                type="email"
                value={brandForm.email}
                onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                placeholder="you@domain.com"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">GitHub Profile URL</label>
              <input
                type="url"
                value={brandForm.githubUrl}
                onChange={(e) => setBrandForm({ ...brandForm, githubUrl: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">LinkedIn Profile URL</label>
              <input
                type="url"
                value={brandForm.linkedinUrl}
                onChange={(e) => setBrandForm({ ...brandForm, linkedinUrl: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </div>

        {/* Brand Principles / Stats Section */}
        <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/15 space-y-5">
          <h5 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>3 Brand Principles (Stats Strip)</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statsList.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-white/70 mb-1">Pillar {idx + 1} Word</label>
                  <input
                    type="text"
                    required
                    value={stat.value}
                    onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                    className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none font-display italic"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/70 mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    value={stat.label}
                    onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                    className="w-full liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-sky-300 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/70 mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={stat.sub}
                    onChange={(e) => handleStatChange(idx, 'sub', e.target.value)}
                    className="w-full liquid-glass-input rounded-xl p-2.5 text-xs text-white/80 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: SITE-WIDE HEADINGS & TEXT COPY */}
        <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/15 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
            <h5 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>Full Website Text & Copy Editor</span>
            </h5>
            <span className="text-[10px] font-mono text-emerald-400">All text fields are 100% editable</span>
          </div>

          {/* 1. Hero Section Texts */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <span className="text-xs font-mono text-sky-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>1. Hero Section Copy</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Eyebrow Badge Text</label>
                <input
                  type="text"
                  value={siteTextsForm.heroEyebrow}
                  onChange={(e) => handleTextChange('heroEyebrow', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Hero Main Title</label>
                <input
                  type="text"
                  value={siteTextsForm.heroHeadline}
                  onChange={(e) => handleTextChange('heroHeadline', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-sm font-display italic text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Dynamic Role Prefix</label>
                <input
                  type="text"
                  value={siteTextsForm.heroRolePrefix}
                  onChange={(e) => handleTextChange('heroRolePrefix', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-white/70 mb-1">Primary CTA Button</label>
                  <input
                    type="text"
                    value={siteTextsForm.heroCtaWorks}
                    onChange={(e) => handleTextChange('heroCtaWorks', e.target.value)}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-white/70 mb-1">Secondary CTA Button</label>
                  <input
                    type="text"
                    value={siteTextsForm.heroCtaContact}
                    onChange={(e) => handleTextChange('heroCtaContact', e.target.value)}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Selected Works Section Texts */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <span className="text-xs font-mono text-sky-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>2. Selected Works Header Copy</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Eyebrow</label>
                <input
                  type="text"
                  value={siteTextsForm.worksEyebrow}
                  onChange={(e) => handleTextChange('worksEyebrow', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Heading (Main word)</label>
                <input
                  type="text"
                  value={siteTextsForm.worksHeading}
                  onChange={(e) => handleTextChange('worksHeading', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Heading (Italic accent word)</label>
                <input
                  type="text"
                  value={siteTextsForm.worksHeadingItalic}
                  onChange={(e) => handleTextChange('worksHeadingItalic', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none font-display italic"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono text-white/70 mb-1">Section Subtext</label>
                <textarea
                  rows={2}
                  value={siteTextsForm.worksSubtext}
                  onChange={(e) => handleTextChange('worksSubtext', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">View All Button Label</label>
                <input
                  type="text"
                  value={siteTextsForm.worksButtonText}
                  onChange={(e) => handleTextChange('worksButtonText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Visual Explorations Section Texts */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <span className="text-xs font-mono text-sky-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>3. Visual Explorations Copy</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Eyebrow</label>
                <input
                  type="text"
                  value={siteTextsForm.explorationsEyebrow}
                  onChange={(e) => handleTextChange('explorationsEyebrow', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Heading</label>
                <input
                  type="text"
                  value={siteTextsForm.explorationsHeading}
                  onChange={(e) => handleTextChange('explorationsHeading', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Heading Accent Word</label>
                <input
                  type="text"
                  value={siteTextsForm.explorationsHeadingItalic}
                  onChange={(e) => handleTextChange('explorationsHeadingItalic', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none font-display italic"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono text-white/70 mb-1">Section Subtext</label>
                <textarea
                  rows={2}
                  value={siteTextsForm.explorationsSubtext}
                  onChange={(e) => handleTextChange('explorationsSubtext', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">GitHub Button Label</label>
                <input
                  type="text"
                  value={siteTextsForm.explorationsGithubText}
                  onChange={(e) => handleTextChange('explorationsGithubText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Journal Section Texts */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <span className="text-xs font-mono text-sky-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>4. Journal & Articles Copy</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Eyebrow</label>
                <input
                  type="text"
                  value={siteTextsForm.journalEyebrow}
                  onChange={(e) => handleTextChange('journalEyebrow', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Heading</label>
                <input
                  type="text"
                  value={siteTextsForm.journalHeading}
                  onChange={(e) => handleTextChange('journalHeading', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Heading Accent Word</label>
                <input
                  type="text"
                  value={siteTextsForm.journalHeadingItalic}
                  onChange={(e) => handleTextChange('journalHeadingItalic', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none font-display italic"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono text-white/70 mb-1">Section Subtext</label>
                <textarea
                  rows={2}
                  value={siteTextsForm.journalSubtext}
                  onChange={(e) => handleTextChange('journalSubtext', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">View All Button Label</label>
                <input
                  type="text"
                  value={siteTextsForm.journalButtonText}
                  onChange={(e) => handleTextChange('journalButtonText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. Footer, Marquee & Navigation Texts */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <span className="text-xs font-mono text-sky-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>5. Marquee Banner & Contact Footer Copy</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono text-white/70 mb-1">
                  Marquee Ticker Banner Text (Repeated continuously across screen)
                </label>
                <input
                  type="text"
                  value={siteTextsForm.marqueeText}
                  onChange={(e) => handleTextChange('marqueeText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-sky-200 focus:outline-none"
                  placeholder="BUILD SMARTER • CREATE FASTER • THINK BEYOND • "
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Contact Card Eyebrow</label>
                <input
                  type="text"
                  value={siteTextsForm.contactCardEyebrow}
                  onChange={(e) => handleTextChange('contactCardEyebrow', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Contact CTA Button Label</label>
                <input
                  type="text"
                  value={siteTextsForm.contactCtaText}
                  onChange={(e) => handleTextChange('contactCtaText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Contact Big Title</label>
                <input
                  type="text"
                  value={siteTextsForm.contactCardHeading}
                  onChange={(e) => handleTextChange('contactCardHeading', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Contact Big Title (Italic)</label>
                <input
                  type="text"
                  value={siteTextsForm.contactCardHeadingItalic}
                  onChange={(e) => handleTextChange('contactCardHeadingItalic', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none font-display italic"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono text-white/70 mb-1">Contact Card Subtitle</label>
                <textarea
                  rows={2}
                  value={siteTextsForm.contactCardSubtext}
                  onChange={(e) => handleTextChange('contactCardSubtext', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Availability Status Badge</label>
                <input
                  type="text"
                  value={siteTextsForm.footerStatusBadge}
                  onChange={(e) => handleTextChange('footerStatusBadge', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Navbar Badge Text</label>
                <input
                  type="text"
                  value={siteTextsForm.navAvailabilityText}
                  onChange={(e) => handleTextChange('navAvailabilityText', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Footer Tagline</label>
                <input
                  type="text"
                  value={siteTextsForm.footerTagline}
                  onChange={(e) => handleTextChange('footerTagline', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/70 mb-1">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={siteTextsForm.footerCopyright}
                  onChange={(e) => handleTextChange('footerCopyright', e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 pb-6">
          <button
            type="submit"
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-mono text-white font-semibold cursor-pointer shadow-[0_0_24px_rgba(56,189,248,0.45)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save All Brand &amp; Site Texts</span>
          </button>
        </div>
      </form>
    </div>
  );
};
