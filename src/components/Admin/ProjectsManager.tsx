/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, X, Check, Image as ImageIcon, Sparkles, Video, Film, Play, Star } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { Project, PROJECT_CATEGORIES, ProjectVideo } from '../../utils/portfolio.ts';

const SAMPLE_IMAGES = [
  { label: 'Real Estate / Web UI', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'AI Video / Cinema', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'UGC Creator / Studio', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Digital Books / Publishing', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Creative Tech / Cyber', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
];

export const ProjectsManager: React.FC = () => {
  const { data, addProject, updateProject, deleteProject } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [tagInput, setTagInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const filteredProjects = data.projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'All' ? true : p.category.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleStartCreate = () => {
    const newId = `project-${Date.now()}`;
    const initial: Project = {
      id: newId,
      title: 'New Featured Project',
      category: 'Web Development',
      status: 'In Progress',
      description: 'Enter a compelling summary of this project and client impact.',
      year: new Date().getFullYear().toString(),
      span: 7,
      image: SAMPLE_IMAGES[0].url,
      tags: ['Modern UI', 'Creative Direction'],
      features: ['High performance code', 'Responsive design architecture'],
      workflow: 'React + TypeScript + Vite + Tailwind CSS',
      demoType: 'interactive-device',
    };
    setFormData(initial);
    setIsCreating(true);
    setEditingProject(null);
  };

  const handleStartEdit = (project: Project) => {
    setFormData({ ...project });
    setEditingProject(project);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) return;

    if (isCreating) {
      addProject(formData as Project);
    } else if (editingProject) {
      updateProject(editingProject.id, formData);
    }
    setEditingProject(null);
    setIsCreating(false);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const currentTags = formData.tags || [];
    if (!currentTags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...currentTags, trimmed] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((t) => t !== tagToRemove),
    });
  };

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    const currentFeatures = formData.features || [];
    setFormData({ ...formData, features: [...currentFeatures, trimmed] });
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData({
      ...formData,
      features: (formData.features || []).filter((_, i) => i !== idx),
    });
  };

  const handleAddGalleryImage = (urlToAdd?: string) => {
    const url = (urlToAdd || newGalleryUrl).trim();
    if (!url) return;
    const current = formData.galleryImages || [];
    if (!current.includes(url)) {
      setFormData({ ...formData, galleryImages: [...current, url] });
    }
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setFormData({
      ...formData,
      galleryImages: (formData.galleryImages || []).filter((_, i) => i !== idx),
    });
  };

  const handleSetAsCover = (imgUrl: string) => {
    setFormData({ ...formData, image: imgUrl });
  };

  const handleAddVideo = () => {
    const url = newVideoUrl.trim();
    if (!url) return;
    const title = newVideoTitle.trim() || `Video ${(formData.videoList || []).length + 1}`;
    const newVid: ProjectVideo = { title, url };
    const current = formData.videoList || [];
    setFormData({
      ...formData,
      videoList: [...current, newVid],
      videoUrl: formData.videoUrl || url,
    });
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const handleRemoveVideo = (idx: number) => {
    const updated = (formData.videoList || []).filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      videoList: updated,
      videoUrl: updated.length > 0 ? updated[0].url : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl liquid-glass">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="liquid-glass-input text-xs font-mono px-3.5 py-2 rounded-xl text-white placeholder-white/40 focus:outline-none w-48 sm:w-64"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="liquid-glass-input text-xs font-mono px-3 py-2 rounded-xl text-white focus:outline-none cursor-pointer bg-neutral-900"
          >
            {PROJECT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-neutral-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="liquid-glass-button bg-sky-500/25 border-sky-400/50 hover:bg-sky-500/35 text-white font-medium text-xs font-mono px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(56,189,248,0.3)] transition-all"
        >
          <Plus className="w-4 h-4 text-sky-300" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 border border-white/10 hover:border-white/25 transition-all group"
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-white/15 relative bg-black/40">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/75 text-white/90">
                  {project.span} Col
                </span>
              </div>

              <div className="flex flex-col min-w-0 flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300">
                      {project.category}
                    </span>
                    <span className="text-white/40 text-[10px] font-mono">• {project.year}</span>
                  </div>
                  <h4 className="text-base font-medium text-text-primary truncate">
                    {project.title}
                  </h4>
                  <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full liquid-glass-pill text-emerald-300 border-emerald-500/30">
                    {project.status}
                  </span>
                  {project.demoType && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                      {project.demoType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags preview & action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <div className="flex flex-wrap gap-1 max-w-[65%] truncate">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60"
                  >
                    #{tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="text-[9px] font-mono text-white/40">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(project)}
                  className="p-1.5 rounded-lg liquid-glass-pill hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(project.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 cursor-pointer transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center liquid-glass rounded-2xl text-muted text-sm font-mono">
          No projects found matching the criteria. Click "Add Project" to create one.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="liquid-glass-modal rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h4 className="text-lg font-medium text-white">Delete Project?</h4>
            <p className="text-xs text-muted">
              Are you sure you want to delete this project? This will remove it from the portfolio bento grid.
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
                  deleteProject(confirmDeleteId);
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

      {/* Add / Edit Project Modal */}
      {(isCreating || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <div className="liquid-glass-modal rounded-3xl max-w-4xl w-full p-5 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto scrollbar-none border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg sm:text-xl font-medium text-white">
                  {isCreating ? 'Create New Project' : `Edit: ${editingProject?.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProject(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Project Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                    placeholder="e.g. Sri Balaji Real Estate"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Category</label>
                  <select
                    value={formData.category || 'Web Development'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none cursor-pointer bg-neutral-900"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI Videos">AI Videos</option>
                    <option value="UGC Videos">UGC Videos</option>
                    <option value="E-books">E-books</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Status</label>
                  <select
                    value={formData.status || 'In Progress'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none cursor-pointer bg-neutral-900"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Prototype">Prototype</option>
                    <option value="Creative Production">Creative Production</option>
                    <option value="Workflow Automation">Workflow Automation</option>
                  </select>
                </div>

                {/* Year & Span */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-white/80 mb-1.5">Year</label>
                    <input
                      type="text"
                      value={formData.year || '2026'}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/80 mb-1.5">Bento Span</label>
                    <select
                      value={formData.span || 7}
                      onChange={(e) => setFormData({ ...formData, span: Number(e.target.value) as 7 | 5 })}
                      className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none cursor-pointer bg-neutral-900"
                    >
                      <option value={7}>7 Columns (Wide)</option>
                      <option value={5}>5 Columns (Standard)</option>
                    </select>
                  </div>
                </div>

                {/* Primary Cover Image */}
                <div className="md:col-span-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-white/90 flex items-center gap-1.5 font-semibold">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Primary Cover Image</span>
                    </label>
                    <span className="text-[10px] font-mono text-white/40">Displayed on main Bento grid</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  {/* Sample image quick-select */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-white/40 font-mono">Quick presets:</span>
                    {SAMPLE_IMAGES.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: sample.url })}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>

                  {/* Image preview */}
                  {formData.image && (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-white/15 relative">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = SAMPLE_IMAGES[0].url;
                        }}
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-emerald-400 border border-emerald-500/30">
                        Primary Cover
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Media Gallery (Multiple Images) */}
                <div className="md:col-span-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-white/90 flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Additional Gallery Images ({(formData.galleryImages || []).length})</span>
                    </label>
                    <span className="text-[10px] font-mono text-white/40">Add multiple screenshots or mockups</span>
                  </div>

                  {/* Add image row */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGalleryImage();
                        }
                      }}
                      className="flex-1 liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                      placeholder="Paste image URL and click Add to Gallery..."
                    />
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage()}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-medium transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Quick gallery presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-white/40 font-mono">Quick add:</span>
                    {SAMPLE_IMAGES.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => handleAddGalleryImage(sample.url)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        + {sample.label}
                      </button>
                    ))}
                  </div>

                  {/* Gallery Thumbnails Grid */}
                  {(formData.galleryImages || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {(formData.galleryImages || []).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-video rounded-xl overflow-hidden border border-white/15 bg-black/50"
                        >
                          <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-white/80">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="w-5 h-5 rounded-full bg-red-600/80 hover:bg-red-500 flex items-center justify-center text-white text-[10px] cursor-pointer"
                                title="Remove from gallery"
                              >
                                ×
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(imgUrl)}
                              className="w-full text-[9px] font-mono py-1 rounded bg-sky-500 hover:bg-sky-400 text-black font-semibold text-center cursor-pointer"
                            >
                              Set as Cover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Multiple Project Videos Hub */}
                <div className="md:col-span-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-white/90 flex items-center gap-1.5 font-semibold">
                      <Film className="w-3.5 h-3.5 text-sky-400" />
                      <span>Project Videos Hub ({(formData.videoList || []).length})</span>
                    </label>
                    <span className="text-[10px] font-mono text-white/40">MP4, Mux HLS .m3u8, Reels</span>
                  </div>

                  {/* Add Video Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      placeholder="Video Title (e.g. Hero Demo)"
                    />
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="liquid-glass-input rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none sm:col-span-1"
                      placeholder="Video URL (https://...mp4 or .m3u8)"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Video</span>
                    </button>
                  </div>

                  {/* List of Added Videos */}
                  {(formData.videoList || []).length > 0 && (
                    <div className="space-y-2 pt-1">
                      {(formData.videoList || []).map((vid, vIdx) => {
                        const isPrimary = formData.videoUrl === vid.url;
                        return (
                          <div
                            key={vIdx}
                            className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isPrimary
                                ? 'bg-sky-500/10 border-sky-400/30'
                                : 'bg-white/[0.02] border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-white font-medium truncate">{vid.title}</span>
                                  {isPrimary && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-300 border border-sky-400/30">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] font-mono text-white/40 truncate max-w-sm">{vid.url}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, videoUrl: vid.url })}
                                  className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                                >
                                  Set Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveVideo(vIdx)}
                                className="p-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-300 transition-colors cursor-pointer"
                                title="Delete video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Project Description</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl p-3 text-xs leading-relaxed text-white focus:outline-none"
                    placeholder="Describe the solution, tools, and results..."
                  />
                </div>

                {/* Interactive Demo Type */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Interactive Demo Type</label>
                  <select
                    value={formData.demoType || 'interactive-device'}
                    onChange={(e) => setFormData({ ...formData, demoType: e.target.value as any })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none cursor-pointer bg-neutral-900"
                  >
                    <option value="interactive-device">Device Frame (Web UI)</option>
                    <option value="video-reel">Video Reel (AI Commercials)</option>
                    <option value="ugc-player">UGC Vertical Player (TikTok/Reels)</option>
                    <option value="ebook-reader">E-book Publication Reader</option>
                    <option value="decision-tool">Decision Calculator Tool</option>
                  </select>
                </div>

                {/* Workflow Stack */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Workflow / Tech Stack</label>
                  <input
                    type="text"
                    value={formData.workflow || ''}
                    onChange={(e) => setFormData({ ...formData, workflow: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                    placeholder="e.g. Vite + React + Tailwind + GSAP"
                  />
                </div>

                {/* Tags Manager */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      placeholder="Add tag and press Enter..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-mono text-white cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/15"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-white/40 hover:text-white cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features List */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Key Deliverables & Features</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      placeholder="Add bullet point and press Enter..."
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-mono text-white cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(formData.features || []).map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90"
                      >
                        <span className="flex-1">• {feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-white/40 hover:text-red-400 cursor-pointer px-1.5"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProject(null);
                  }}
                  className="px-5 py-2.5 rounded-xl liquid-glass-pill text-xs font-mono text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-mono text-white font-medium cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
