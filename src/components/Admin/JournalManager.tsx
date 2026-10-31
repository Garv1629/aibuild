/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  BookOpen,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  EyeOff,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { JournalEntry, PROJECT_CATEGORIES } from '../../utils/portfolio.ts';
import { uploadMediaFile } from '../../services/storage.ts';

export const JournalManager: React.FC = () => {
  const { data, addJournalEntry, updateJournalEntry, deleteJournalEntry, reorderJournal, togglePublishJournal, addMediaAsset } = usePortfolio();
  const { session } = useAuth();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<JournalEntry>>({});
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setSaveError(null);
    setUploadNotice(null);
    try {
      const res = await uploadMediaFile(file, {
        title: `${formData.title || 'Article'} Cover`,
        tags: ['Journal Cover', formData.category || 'Editorial'],
      });
      addMediaAsset(res.asset);
      setFormData((prev) => ({ ...prev, image: res.asset.url }));
      setUploadNotice(`Cover photo "${file.name}" uploaded successfully!`);
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const entriesList = [...data.journalEntries].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const handleStartCreate = () => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
    const newId = `journal-${Date.now()}`;
    const initial: JournalEntry = {
      id: newId,
      title: 'New Editorial Insight & Creative Exploration',
      slug: `editorial-insight-${Date.now().toString(36)}`,
      readTime: '4 min read',
      date: 'Oct 2026',
      image: '',
      excerpt: 'Exploring modern workflows, digital product design, and creative generation frameworks.',
      category: 'Web Development',
      isPublished: true,
      order: data.journalEntries.length + 1,
      author: 'AI Build Studio',
    };
    setFormData(initial);
    setIsCreating(true);
    setEditingEntry(null);
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
    setFormData({ ...entry });
    setEditingEntry(entry);
    setIsCreating(false);
  };

  const handleSave = async (publishState?: boolean) => {
    if (!formData.title?.trim()) {
      setSaveError('Please enter an article title.');
      return;
    }
    if (!formData.category) {
      setSaveError('Please select a category.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const finalPublished = typeof publishState === 'boolean' ? publishState : (formData.isPublished ?? true);
    const payload: JournalEntry = {
      ...(formData as JournalEntry),
      title: formData.title.trim(),
      isPublished: finalPublished,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      updatedAt: new Date().toISOString(),
    };

    let result;
    if (isCreating) {
      result = await addJournalEntry(payload);
    } else if (editingEntry) {
      result = await updateJournalEntry(editingEntry.id, payload);
    }

    setIsSaving(false);
    if (result && !result.success) {
      setSaveError(result.error || 'Failed to save article to database.');
      return;
    }

    setSaveSuccess(finalPublished ? 'Article published live!' : 'Article saved as private draft.');
    setTimeout(() => {
      setSaveSuccess(null);
      setEditingEntry(null);
      setIsCreating(false);
    }, 700);
  };

  const handleMoveUp = (idx: number) => {
    if (idx > 0) reorderJournal(idx, idx - 1);
  };

  const handleMoveDown = (idx: number) => {
    if (idx < entriesList.length - 1) reorderJournal(idx, idx + 1);
  };

  return (
    <div className="space-y-6 font-body">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl liquid-glass">
        <div>
          <h4 className="text-sm font-medium text-white">Journal Thoughts & Articles</h4>
          <p className="text-xs text-muted font-mono">
            Manage articles, technical writeups, and case studies featured on the website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="liquid-glass-button bg-sky-500/25 border-sky-400/50 hover:bg-sky-500/35 text-white font-medium text-xs font-mono px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(56,189,248,0.3)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-sky-300" />
          <span>Add Article</span>
        </button>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-3">
        {entriesList.map((entry, idx) => {
          const isPublished = entry.isPublished !== false;

          return (
            <div
              key={entry.id}
              className={`liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all group ${
                isPublished ? 'border-white/10 hover:border-white/25' : 'border-amber-500/30 bg-amber-500/[0.02]'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Reorder and Sequence controls */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-[10px] font-mono text-white/40">#{idx + 1}</span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === entriesList.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/15 relative bg-black/40">
                  <img
                    src={entry.image}
                    alt={entry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300">
                      {entry.category}
                    </span>
                    <span className="text-white/40 text-xs font-mono">•</span>
                    <span className="text-[11px] font-mono text-white/50 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400/60" />
                      <span>{entry.readTime}</span>
                    </span>

                    {/* Publish / Draft Switcher Pill */}
                    <button
                      type="button"
                      onClick={() => togglePublishJournal(entry.id)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 cursor-pointer transition-all ml-1 ${
                        isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                      title="Click to toggle publish status"
                    >
                      {isPublished ? <CheckCircle2 className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </div>

                  <h5 className="text-sm sm:text-base font-medium text-white truncate group-hover:text-sky-300 transition-colors">
                    {entry.title}
                  </h5>
                  <p className="text-xs text-muted line-clamp-1 mt-0.5 font-mono">
                    {entry.excerpt}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(entry)}
                  className="p-2 rounded-xl liquid-glass-pill hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Edit Article"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(entry.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 cursor-pointer transition-colors"
                  title="Delete Article"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {entriesList.length === 0 && (
        <div className="p-12 text-center liquid-glass rounded-2xl text-muted text-xs font-mono">
          No journal entries available. Click "Add Article" to publish insights.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-modal rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-white/15">
            <h4 className="text-base font-semibold text-white">Delete Journal Entry?</h4>
            <p className="text-xs text-muted font-mono leading-relaxed">
              Are you sure you want to permanently delete this article?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-mono text-white cursor-pointer hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteJournalEntry(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono text-white font-medium cursor-pointer shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {(isCreating || editingEntry) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-modal rounded-3xl max-w-xl w-full p-5 sm:p-7 border border-white/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {isCreating ? 'Write New Journal Entry' : 'Edit Journal Article'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingEntry(null);
                }}
                className="p-1.5 rounded-xl text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Article Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  placeholder="e.g. Modern Web Architecture with React & GSAP"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Service Category</label>
                  <select
                    value={formData.category || 'Web Development'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none bg-neutral-900"
                  >
                    {PROJECT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime || ''}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    placeholder="4 min read"
                  />
                </div>
              </div>

              {/* Cover Image & Upload */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Article Cover Photo</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                      title="Upload photo from device"
                    >
                      {isUploadingCover ? (
                        <Loader2 className="w-3 h-3 animate-spin text-sky-300" />
                      ) : (
                        <Upload className="w-3 h-3 text-sky-300" />
                      )}
                      <span>{isUploadingCover ? 'Uploading...' : 'Upload Photo'}</span>
                    </button>

                    <input
                      type="file"
                      ref={coverFileInputRef}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif"
                      className="hidden"
                      onChange={handleCoverFileUpload}
                    />

                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(!showMediaPicker)}
                      className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors ${
                        showMediaPicker
                          ? 'bg-sky-500/30 text-sky-200 border-sky-400/50'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/15'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3 text-sky-400" />
                      <span>{showMediaPicker ? 'Hide Library' : 'Choose Library'}</span>
                    </button>
                  </div>
                </div>

                {formData.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/60 p-2.5 flex items-center gap-3.5 group shadow-lg">
                    <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-black/80 border border-white/15 shrink-0 relative">
                      <img src={formData.image} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                        ✓ Active Cover Photo
                      </span>
                      <p className="text-[11px] font-mono text-white/70 truncate select-all">{formData.image}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        title="Replace photo"
                      >
                        <Upload className="w-3 h-3" />
                        <span className="hidden sm:inline text-[11px]">Replace</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 cursor-pointer transition-colors"
                        title="Clear photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-sky-400/60 rounded-2xl p-3 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-sky-500/[0.04]"
                  >
                    <div className="flex flex-col items-center gap-1 text-xs text-white/70">
                      <Upload className="w-5 h-5 text-sky-400" />
                      <span className="font-medium text-white">Click here to upload article cover image</span>
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder:text-white/30"
                  placeholder="Or paste external image URL..."
                />

                {showMediaPicker && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-black/75 border border-white/15 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                      <span>Click an asset to set as cover image:</span>
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Upload New File</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                      {(data.mediaAssets || []).filter((m) => m.type === 'image').map((media) => (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: media.url });
                            setShowMediaPicker(false);
                          }}
                          className={`aspect-video rounded-lg overflow-hidden border cursor-pointer relative group text-left ${
                            formData.image === media.url
                              ? 'border-sky-400 ring-2 ring-sky-400/50'
                              : 'border-white/15 hover:border-sky-400/70'
                          }`}
                        >
                          <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-mono transition-opacity">
                            Select
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Excerpt Summary</label>
                <textarea
                  rows={3}
                  required
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none leading-relaxed"
                  placeholder="Summarize the core takeaways and strategy breakdown..."
                />
              </div>

              {/* Notification Banner */}
              {saveError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              {/* Action Buttons: Save Draft vs Save & Publish */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsCreating(false);
                    setEditingEntry(null);
                  }}
                  className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-mono text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(false)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(true)}
                    className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-xs font-mono text-white font-medium flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
