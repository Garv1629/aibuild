/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Compass, Video, Image as ImageIcon, Film } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { ExplorationItem, ProjectVideo } from '../../utils/portfolio.ts';

const SAMPLE_EXPLORATION_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
];

export const ExplorationsManager: React.FC = () => {
  const { data, addExploration, updateExploration, deleteExploration } = usePortfolio();
  const [editingItem, setEditingItem] = useState<ExplorationItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExplorationItem>>({});

  const [galleryInput, setGalleryInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const handleStartCreate = () => {
    const newId = `exp-${Date.now()}`;
    const initial: ExplorationItem = {
      id: newId,
      title: 'New Visual Experiment',
      category: 'AI Videos',
      column: 1,
      rotation: 2,
      image: SAMPLE_EXPLORATION_IMAGES[1],
      description: 'Cinematic visual experiment exploring lighting, physics, and fluid camera choreography.',
      galleryImages: [],
      videoList: [],
    };
    setFormData(initial);
    setIsCreating(true);
    setEditingItem(null);
  };

  const handleStartEdit = (item: ExplorationItem) => {
    setFormData({
      ...item,
      galleryImages: item.galleryImages || [],
      videoList: item.videoList || [],
    });
    setEditingItem(item);
    setIsCreating(false);
  };

  const handleAddGalleryImage = (urlToAdd?: string) => {
    const url = urlToAdd || galleryInput.trim();
    if (!url) return;
    const current = formData.galleryImages || [];
    if (!current.includes(url)) {
      setFormData({
        ...formData,
        galleryImages: [...current, url],
      });
    }
    if (!urlToAdd) setGalleryInput('');
  };

  const handleRemoveGalleryImage = (urlToRemove: string) => {
    const current = formData.galleryImages || [];
    setFormData({
      ...formData,
      galleryImages: current.filter((u) => u !== urlToRemove),
    });
  };

  const handleSetPrimaryCover = (url: string) => {
    setFormData({ ...formData, image: url });
  };

  const handleAddVideo = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    const title = videoTitleInput.trim() || `Reel ${(formData.videoList?.length || 0) + 1}`;
    const current = formData.videoList || [];
    const newVideo: ProjectVideo = { title, url };
    setFormData({
      ...formData,
      video: formData.video || url,
      videoList: [...current, newVideo],
    });
    setVideoTitleInput('');
    setVideoUrlInput('');
  };

  const handleRemoveVideo = (index: number) => {
    const current = formData.videoList || [];
    const updated = current.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      videoList: updated,
      video: updated[0]?.url || '',
    });
  };

  const handleSetPrimaryVideo = (videoObj: ProjectVideo) => {
    setFormData({ ...formData, video: videoObj.url });
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      if (isCreating) {
        await addExploration(formData as ExplorationItem);
      } else if (editingItem) {
        await updateExploration(editingItem.id, formData);
      }
      setEditingItem(null);
      setIsCreating(false);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save exploration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl liquid-glass">
        <div>
          <h4 className="text-sm font-medium text-white">Visual Playground & Explorations</h4>
          <p className="text-xs text-muted">Manage items displayed in the Parallax Visual Playground gallery.</p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="liquid-glass-button bg-sky-500/25 border-sky-400/50 hover:bg-sky-500/35 text-white font-medium text-xs font-mono px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(56,189,248,0.3)] transition-all"
        >
          <Plus className="w-4 h-4 text-sky-300" />
          <span>Add Exploration</span>
        </button>
      </div>

      {/* Explorations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.explorations.map((item) => (
          <div
            key={item.id}
            className="liquid-glass-card rounded-2xl p-4 flex flex-col justify-between gap-3 border border-white/10 hover:border-white/25 transition-all group"
          >
            <div>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/15 relative bg-black/40 mb-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/70 text-sky-300">
                    Col {item.column}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-white/70">
                    {item.rotation}°
                  </span>
                </div>
                {item.video && (
                  <span className="absolute bottom-2 right-2 p-1 rounded-full bg-sky-500/80 text-white">
                    <Video className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-mono uppercase tracking-wide text-accent">
                  {item.category}
                </span>
              </div>
              <h3 className="text-sm font-medium text-text-primary line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleStartEdit(item)}
                className="p-1.5 rounded-lg liquid-glass-pill hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="Edit Exploration"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(item.id)}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 cursor-pointer transition-colors"
                title="Delete Exploration"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="liquid-glass-modal rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h4 className="text-lg font-medium text-white">Delete Exploration?</h4>
            <p className="text-xs text-muted">
              Are you sure you want to remove this item from the playground?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-mono text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExploration(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono text-white font-medium cursor-pointer shadow-lg transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Exploration Modal */}
      {(isCreating || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <div className="liquid-glass-modal rounded-3xl max-w-xl w-full p-5 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto scrollbar-none border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg sm:text-xl font-medium text-white">
                  {isCreating ? 'Create Playground Item' : `Edit: ${editingItem?.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  placeholder="e.g. Luxury AI Commercials"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Category</label>
                  <select
                    value={formData.category || 'Web Development'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer bg-neutral-900"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI Videos">AI Videos</option>
                    <option value="UGC Videos">UGC Videos</option>
                    <option value="E-books">E-books</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Parallax Column</label>
                  <select
                    value={formData.column || 1}
                    onChange={(e) => setFormData({ ...formData, column: Number(e.target.value) as 1 | 2 })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer bg-neutral-900"
                  >
                    <option value={1}>Column 1 (Left)</option>
                    <option value={2}>Column 2 (Right)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Tilt Rotation (°)</label>
                  <input
                    type="number"
                    min="-8"
                    max="8"
                    step="1"
                    value={formData.rotation ?? 0}
                    onChange={(e) => setFormData({ ...formData, rotation: Number(e.target.value) })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Multi-Image Management */}
              <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-white/90 flex items-center gap-1.5 font-semibold">
                    <ImageIcon className="w-4 h-4 text-sky-400" />
                    <span>Multi-Image Gallery &amp; Covers</span>
                  </label>
                  <span className="text-[10px] font-mono text-muted">
                    {(formData.galleryImages?.length || 0) + (formData.image ? 1 : 0)} Image(s)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">Primary Cover Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Additional Gallery Images */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="block text-[11px] font-mono text-muted">Add Additional Images to Gallery</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      placeholder="Paste image URL..."
                      className="flex-1 liquid-glass-input rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage()}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/25 border border-sky-400/40 text-sky-200 text-xs font-mono hover:bg-sky-500/40 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Sample Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-muted">
                    <span>Quick presets:</span>
                    {SAMPLE_EXPLORATION_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddGalleryImage(preset)}
                        className="px-2 py-0.5 rounded-md liquid-glass-pill hover:bg-white/20 text-white/80 cursor-pointer"
                      >
                        + Sample {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Gallery Thumbnails */}
                  {formData.galleryImages && formData.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {formData.galleryImages.map((imgUrl, i) => (
                        <div
                          key={i}
                          className="group relative aspect-video rounded-lg overflow-hidden border border-white/15 bg-black/40"
                        >
                          <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryCover(imgUrl)}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500 text-white hover:bg-sky-400 cursor-pointer"
                            >
                              Set Primary
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(imgUrl)}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/80 text-white hover:bg-rose-500 cursor-pointer flex items-center gap-0.5"
                            >
                              <X className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Video Management */}
              <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-white/90 flex items-center gap-1.5 font-semibold">
                    <Film className="w-4 h-4 text-purple-400" />
                    <span>Multiple Videos &amp; Reels Hub</span>
                  </label>
                  <span className="text-[10px] font-mono text-muted">
                    {(formData.videoList?.length || 0) + (formData.video ? 1 : 0)} Video(s)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">Primary Video URL (Direct MP4 / Stream)</label>
                  <input
                    type="url"
                    value={formData.video || ''}
                    onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                    placeholder="https://assets.mixkit.co/...mp4"
                  />
                </div>

                {/* Additional Videos */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="block text-[11px] font-mono text-muted">Add Additional Video Clip</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={videoTitleInput}
                      onChange={(e) => setVideoTitleInput(e.target.value)}
                      placeholder="Video label (e.g. 4K Render Reel)..."
                      className="liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="Video MP4 URL..."
                        className="flex-1 liquid-glass-input rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddVideo}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/25 border border-purple-400/40 text-purple-200 text-xs font-mono hover:bg-purple-500/40 cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Added Videos */}
                  {formData.videoList && formData.videoList.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {formData.videoList.map((vid, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-white font-medium truncate">{vid.title}</span>
                            <span className="text-[10px] text-muted truncate max-w-[140px]">{vid.url}</span>
                            {formData.video === vid.url && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 shrink-0">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {formData.video !== vid.url && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryVideo(vid)}
                                className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                              >
                                Set Main
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl p-3 text-xs leading-relaxed text-white focus:outline-none"
                  placeholder="Describe visual concept and tools used..."
                />
              </div>

              {saveError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  {saveError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsCreating(false);
                    setEditingItem(null);
                  }}
                  className="px-5 py-2.5 rounded-xl liquid-glass-pill text-xs font-mono text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-mono text-white font-medium cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Exploration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
