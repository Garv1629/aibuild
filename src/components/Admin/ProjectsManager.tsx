/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  Video,
  Film,
  Play,
  ArrowUp,
  ArrowDown,
  Globe,
  Github,
  Link as LinkIcon,
  Filter,
  CheckCircle2,
  FolderKanban,
  Upload,
  AlertCircle,
  ExternalLink,
  Loader2,
  Layers,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Project, PROJECT_CATEGORIES, ProjectVideo } from '../../utils/portfolio.ts';
import { uploadMediaFile } from '../../services/storage.ts';

const SAMPLE_IMAGES = [
  { label: 'Real Estate / Web UI', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'AI Video / Cinema', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'UGC Creator / Studio', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Digital Books / Publishing', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Creative Tech / Cyber', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
];

export const ProjectsManager: React.FC = () => {
  const { data, addProject, updateProject, deleteProject, reorderProjects, togglePublishProject, addMediaAsset } = usePortfolio();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPublishStatus, setFilterPublishStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showVideoPicker, setShowVideoPicker] = useState(false);

  // File upload states & refs
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [tagInput, setTagInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Sorted by explicit display order
  const projectsList = [...data.projects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const filteredProjects = projectsList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'All' ? true : p.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesPublish =
      filterPublishStatus === 'all'
        ? true
        : filterPublishStatus === 'published'
        ? p.isPublished !== false
        : p.isPublished === false;
    return matchesSearch && matchesCategory && matchesPublish;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Cover Image Upload Handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setSaveError(null);
    setUploadNotice(null);
    try {
      const res = await uploadMediaFile(file, {
        title: `${formData.title || 'Project'} Cover`,
        tags: ['Project Cover', formData.category || 'Portfolio'],
        authToken: session?.token,
      });
      addMediaAsset(res.asset);
      setFormData((prev) => ({ ...prev, image: res.asset.url }));
      setUploadNotice(`Cover photo "${file.name}" uploaded successfully!`);
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to upload cover photo. Please check format/size.');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Video / Reel Upload Handler
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    setSaveError(null);
    setUploadNotice(null);
    try {
      const res = await uploadMediaFile(file, {
        title: `${formData.title || 'Project'} Reel`,
        tags: ['Project Video', formData.category || 'Portfolio'],
        authToken: session?.token,
      });
      addMediaAsset(res.asset);
      setFormData((prev) => ({
        ...prev,
        videoUrl: res.asset.url,
        video: res.asset.url,
      }));
      setUploadNotice(`Video file "${file.name}" uploaded successfully!`);
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to upload video file. Please check format/size.');
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  // Multi-photo Gallery Upload Handler
  const handleGalleryFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    setSaveError(null);
    setUploadNotice(null);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadMediaFile(file, {
          title: `${formData.title || 'Project'} Gallery ${i + 1}`,
          tags: ['Gallery Image', formData.category || 'Portfolio'],
          authToken: session?.token,
        });
        addMediaAsset(res.asset);
        uploadedUrls.push(res.asset.url);
      }
      const existing = formData.galleryImages || [];
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...existing, ...uploadedUrls],
      }));
      setUploadNotice(`${uploadedUrls.length} gallery photo(s) uploaded!`);
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to upload gallery photos.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleStartCreate = () => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
    setShowVideoPicker(false);
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
      galleryImages: [],
      videoList: [],
      workflow: 'React + TypeScript + Vite + Tailwind CSS',
      demoType: 'interactive-device',
      isPublished: true,
      order: data.projects.length + 1,
    };
    setFormData(initial);
    setIsCreating(true);
    setEditingProject(null);
  };

  const handleStartEdit = (project: Project) => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
    setShowVideoPicker(false);
    setFormData({
      ...project,
      galleryImages: project.galleryImages || [],
      videoList: project.videoList || [],
    });
    setEditingProject(project);
    setIsCreating(false);
  };

  const handleSave = async (publishState?: boolean) => {
    if (!formData.title?.trim()) {
      setSaveError('Please enter a project title.');
      return;
    }
    if (!formData.category) {
      setSaveError('Please select a project category.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    // Fallback for cover image if left blank
    const fallbackImage = SAMPLE_IMAGES.find((s) => s.label.toLowerCase().includes(formData.category?.toLowerCase() || ''))?.url || SAMPLE_IMAGES[0].url;
    const finalImage = formData.image?.trim() || fallbackImage;

    const finalPublished = typeof publishState === 'boolean' ? publishState : (formData.isPublished ?? true);
    const payload: Project = {
      ...(formData as Project),
      title: formData.title.trim(),
      image: finalImage,
      isPublished: finalPublished,
      updatedAt: new Date().toISOString(),
    };

    let result;
    if (isCreating) {
      result = await addProject(payload);
    } else if (editingProject) {
      result = await updateProject(editingProject.id, payload);
    }

    setIsSaving(false);
    if (result && !result.success) {
      setSaveError(result.error || 'Failed to save project. Please check database permissions.');
      return;
    }

    setSaveSuccess(finalPublished ? 'Project saved & published live!' : 'Project saved as private draft.');
    setTimeout(() => {
      setSaveSuccess(null);
      setEditingProject(null);
      setIsCreating(false);
    }, 700);
  };

  const handleMoveUp = (currentIdx: number) => {
    if (currentIdx > 0) {
      reorderProjects(currentIdx, currentIdx - 1);
    }
  };

  const handleMoveDown = (currentIdx: number) => {
    if (currentIdx < projectsList.length - 1) {
      reorderProjects(currentIdx, currentIdx + 1);
    }
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
    <div className="space-y-6 font-body">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl liquid-glass">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="liquid-glass-input text-xs font-mono px-3.5 py-2 rounded-xl text-white placeholder-white/40 focus:outline-none w-44 sm:w-56"
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

          <select
            value={filterPublishStatus}
            onChange={(e) => setFilterPublishStatus(e.target.value as any)}
            className="liquid-glass-input text-xs font-mono px-3 py-2 rounded-xl text-white focus:outline-none cursor-pointer bg-neutral-900"
          >
            <option value="all" className="bg-neutral-900 text-white">All Statuses</option>
            <option value="published" className="bg-neutral-900 text-white">Published Only</option>
            <option value="draft" className="bg-neutral-900 text-white">Drafts Only</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="liquid-glass-button bg-sky-500/25 border-sky-400/50 hover:bg-sky-500/35 text-white font-medium text-xs font-mono px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(56,189,248,0.3)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-sky-300" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredProjects.map((project, idx) => {
          const globalIdx = projectsList.findIndex((p) => p.id === project.id);
          const isPublished = project.isPublished !== false;

          return (
            <div
              key={project.id}
              className={`liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 border transition-all group ${
                isPublished ? 'border-white/10 hover:border-white/25' : 'border-amber-500/30 bg-amber-500/[0.02]'
              }`}
            >
              <div className="flex gap-4">
                {/* Media Thumbnail with Reorder Controls */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-white/15 relative bg-black/40">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/75 text-white/90">
                      {project.span} Col
                    </span>
                    <span className="absolute top-1 left-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/75 text-white/80">
                      #{project.order || globalIdx + 1}
                    </span>
                  </div>

                  {/* Reorder Up / Down Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={globalIdx === 0}
                      onClick={() => handleMoveUp(globalIdx)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all"
                      title="Move Project Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={globalIdx === projectsList.length - 1}
                      onClick={() => handleMoveDown(globalIdx)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all"
                      title="Move Project Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col min-w-0 flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wide text-accent">
                          {project.category}
                        </span>
                        <span className="text-secondary text-xs font-mono">• {project.year}</span>
                      </div>

                      {/* Publish / Draft Switcher Pill */}
                      <button
                        type="button"
                        onClick={() => togglePublishProject(project.id)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
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

                    <h4 className="text-base font-medium text-text-primary truncate">
                      {project.title}
                    </h4>
                    <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full liquid-glass-pill text-emerald-300 border-emerald-500/30">
                      {project.status}
                    </span>
                    {project.demoType && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                        {project.demoType}
                      </span>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 hover:text-sky-200 border border-sky-400/20 flex items-center gap-1"
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags preview & action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <div className="flex flex-wrap gap-1 max-w-[60%] truncate">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-secondary"
                    >
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs font-mono text-muted">
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
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center liquid-glass rounded-2xl text-muted text-sm font-mono">
          No projects found matching the criteria. Click "Add Project" to create one.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-modal rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-white/15">
            <h4 className="text-lg font-medium text-white">Delete Project?</h4>
            <p className="text-xs text-muted font-mono leading-relaxed">
              Are you sure you want to delete this project? This will remove it from the portfolio bento grid.
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
                  deleteProject(confirmDeleteId);
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

      {/* Create / Edit Project Modal */}
      {(isCreating || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="liquid-glass-modal rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-white/20 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white tracking-tight">
                  {isCreating ? 'Create New Showcase Project' : 'Edit Project Details'}
                </h3>
                <p className="text-xs text-muted font-mono">
                  Configure titles, categories, deliverables, media, and external URLs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProject(null);
                }}
                className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Project Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    placeholder="e.g. Sri Balaji Real Estate"
                  />
                </div>

                {/* Service Category */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Service Category</label>
                  <select
                    value={formData.category || 'Web Development'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none bg-neutral-900 cursor-pointer"
                  >
                    {PROJECT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Production Status</label>
                  <select
                    value={formData.status || 'In Progress'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none bg-neutral-900 cursor-pointer"
                  >
                    <option value="In Progress" className="bg-neutral-900 text-white">In Progress</option>
                    <option value="Prototype" className="bg-neutral-900 text-white">Prototype</option>
                    <option value="Creative Production" className="bg-neutral-900 text-white">Creative Production</option>
                    <option value="Workflow Automation" className="bg-neutral-900 text-white">Workflow Automation</option>
                  </select>
                </div>

                {/* Bento Grid Column Span */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Bento Span (Columns)</label>
                  <select
                    value={formData.span || 7}
                    onChange={(e) => setFormData({ ...formData, span: parseInt(e.target.value, 10) as 7 | 5 })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none bg-neutral-900 cursor-pointer"
                  >
                    <option value={7} className="bg-neutral-900 text-white">7 Col (Wide Hero Bento Card)</option>
                    <option value={5} className="bg-neutral-900 text-white">5 Col (Compact Secondary Card)</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Launch Year</label>
                  <input
                    type="text"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    placeholder="2026"
                  />
                </div>

                {/* Demo Type */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Interactive Demo Viewer</label>
                  <select
                    value={formData.demoType || 'interactive-device'}
                    onChange={(e) => setFormData({ ...formData, demoType: e.target.value as any })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none bg-neutral-900 cursor-pointer"
                  >
                    <option value="interactive-device" className="bg-neutral-900 text-white">Responsive Real Estate Device</option>
                    <option value="video-reel" className="bg-neutral-900 text-white">AI Video Showcase Reel</option>
                    <option value="ugc-player" className="bg-neutral-900 text-white">9:16 Vertical UGC Video Player</option>
                    <option value="ebook-reader" className="bg-neutral-900 text-white">3D Digital Publication Reader</option>
                    <option value="decision-tool" className="bg-neutral-900 text-white">Decision Calculator Tool</option>
                    <option value="motion-preview" className="bg-neutral-900 text-white">Motion Graphic Preview</option>
                  </select>
                </div>

                {/* Live Demo URL */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-sky-400" />
                    <span>Live Demo / Production URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.demoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                {/* GitHub Repository URL */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5 flex items-center gap-1.5">
                    <Github className="w-3 h-3 text-sky-400" />
                    <span>GitHub Repository URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    placeholder="https://github.com/..."
                  />
                </div>

                {/* Primary Cover Image & Upload */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Cover Photo / Banner</span>
                      <span className="text-rose-400">*</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(56,189,248,0.2)] disabled:opacity-50"
                        title="Upload photo directly from your device"
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
                        <span>{showMediaPicker ? 'Hide Library' : 'Choose from Library'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Cover Image Preview if present */}
                  {formData.image ? (
                    <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/60 p-2.5 flex items-center gap-3.5 group shadow-lg">
                      <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-black/80 border border-white/15 shrink-0 relative">
                        <img
                          src={formData.image}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = SAMPLE_IMAGES[0].url;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                            ✓ Active Cover Photo
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-white/70 truncate select-all" title={formData.image}>
                          {formData.image}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                          title="Replace with new photo"
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
                      className="border-2 border-dashed border-white/20 hover:border-sky-400/60 rounded-2xl p-4 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-sky-500/[0.04] group"
                    >
                      <div className="flex flex-col items-center gap-1.5 text-xs text-white/70">
                        <Upload className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-white">Click here to upload project cover photo</span>
                        <span className="text-[10px] font-mono text-white/40">
                          PNG, JPG, WebP, SVG, AVIF (up to 15MB) or enter URL below
                        </span>
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder:text-white/30"
                    placeholder="Or paste external image URL (e.g. https://images.unsplash.com/...)"
                  />

                  {/* Media Picker Drawer */}
                  {showMediaPicker && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-black/75 border border-white/15 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                        <span>Click an asset below to select as cover photo:</span>
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Upload New File</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {(data.mediaAssets || []).filter((m) => m.type === 'image').map((media) => {
                          const isCurrent = formData.image === media.url;
                          return (
                            <button
                              key={media.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, image: media.url });
                                setShowMediaPicker(false);
                              }}
                              className={`aspect-video rounded-xl overflow-hidden border cursor-pointer relative group text-left transition-all ${
                                isCurrent
                                  ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                                  : 'border-white/15 hover:border-sky-400/70'
                              }`}
                              title={media.title}
                            >
                              <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-mono transition-opacity">
                                {isCurrent ? 'Selected' : 'Use as Cover'}
                              </div>
                              {isCurrent && (
                                <span className="absolute top-1 right-1 p-0.5 rounded-full bg-sky-500 text-white shadow">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Video / Reel URL & Upload */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-sky-400" />
                      <span>Video / Reel Showcase (Optional MP4 / WebM / M3U8)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        disabled={isUploadingVideo}
                        className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(56,189,248,0.2)] disabled:opacity-50"
                        title="Upload MP4 or WebM video directly from your device"
                      >
                        {isUploadingVideo ? (
                          <Loader2 className="w-3 h-3 animate-spin text-sky-300" />
                        ) : (
                          <Upload className="w-3 h-3 text-sky-300" />
                        )}
                        <span>{isUploadingVideo ? 'Uploading...' : 'Upload Video File'}</span>
                      </button>

                      <input
                        type="file"
                        ref={videoFileInputRef}
                        accept="video/mp4,video/webm,video/quicktime,video/ogg"
                        className="hidden"
                        onChange={handleVideoFileUpload}
                      />

                      <button
                        type="button"
                        onClick={() => setShowVideoPicker(!showVideoPicker)}
                        className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors ${
                          showVideoPicker
                            ? 'bg-sky-500/30 text-sky-200 border-sky-400/50'
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/15'
                        }`}
                      >
                        <Film className="w-3 h-3 text-sky-400" />
                        <span>{showVideoPicker ? 'Hide Videos' : 'Video Library'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Video Preview if present */}
                  {formData.videoUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/60 p-2.5 flex items-center gap-3.5 group shadow-lg">
                      <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-black border border-white/15 shrink-0 relative flex items-center justify-center">
                        <video src={formData.videoUrl} preload="none" playsInline className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-5 h-5 text-sky-300 fill-sky-300/40" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30 font-medium">
                            ✓ Active Video Reel
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-white/70 truncate select-all" title={formData.videoUrl}>
                          {formData.videoUrl}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                          title="Replace with new video file"
                        >
                          <Upload className="w-3 h-3" />
                          <span className="hidden sm:inline text-[11px]">Replace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, videoUrl: '', video: '' })}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 cursor-pointer transition-colors"
                          title="Clear video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-sky-400/60 rounded-2xl p-4 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-sky-500/[0.04] group"
                    >
                      <div className="flex flex-col items-center gap-1.5 text-xs text-white/70">
                        <Video className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-white">Click here to upload MP4 or WebM video</span>
                        <span className="text-[10px] font-mono text-white/40">
                          Supports MP4, WebM, QuickTime MOV (up to 60MB) or enter URL below
                        </span>
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={formData.videoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value, video: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder:text-white/30"
                    placeholder="Or paste video/stream URL (e.g. https://stream.mux.com/... or https://.../reel.mp4)"
                  />

                  {/* Video Library Drawer */}
                  {showVideoPicker && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-black/75 border border-white/15 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                        <span>Select a video from your library:</span>
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          className="text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Upload New Video</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {(data.mediaAssets || []).filter((m) => m.type === 'video').length === 0 ? (
                          <div className="col-span-full py-4 text-center text-xs text-white/50 font-mono">
                            No uploaded videos in library yet. Click &quot;Upload Video File&quot; above to add one.
                          </div>
                        ) : (
                          (data.mediaAssets || []).filter((m) => m.type === 'video').map((media) => {
                            const isCurrent = formData.videoUrl === media.url;
                            return (
                              <button
                                key={media.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, videoUrl: media.url, video: media.url });
                                  setShowVideoPicker(false);
                                }}
                                className={`p-2 rounded-xl border cursor-pointer relative group text-left transition-all bg-white/[0.03] ${
                                  isCurrent
                                    ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                                    : 'border-white/15 hover:border-sky-400/70'
                                }`}
                              >
                                <div className="aspect-video rounded-lg overflow-hidden bg-black mb-1.5 flex items-center justify-center">
                                  <video src={media.url} preload="none" playsInline className="w-full h-full object-cover" muted />
                                </div>
                                <div className="text-[11px] font-medium text-white truncate">{media.title}</div>
                                <div className="text-[9px] font-mono text-white/50 truncate">{media.fileName}</div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Project Overview & Description</label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none leading-relaxed"
                    placeholder="Describe the objective, creative workflow, and client impact..."
                  />
                </div>

                {/* Workflow Tools */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Workflow & Tech Stack</label>
                  <input
                    type="text"
                    value={formData.workflow || ''}
                    onChange={(e) => setFormData({ ...formData, workflow: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    placeholder="e.g. Vite + React + GSAP + Tailwind CSS"
                  />
                </div>

                {/* Tags List */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Tags & Badges</label>
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

                {/* Project Photo Gallery (Multi-photo upload & URL) */}
                <div className="md:col-span-2 space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                        <span>Project Photo Gallery ({(formData.galleryImages || []).length} photos)</span>
                      </h5>
                      <p className="text-[11px] font-mono text-white/50">
                        Upload extra photos for this project. They appear in the interactive project modal and showcase.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        disabled={isUploadingGallery}
                        className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                        title="Upload multiple photos from your device"
                      >
                        {isUploadingGallery ? (
                          <Loader2 className="w-3 h-3 animate-spin text-sky-300" />
                        ) : (
                          <Upload className="w-3 h-3 text-sky-300" />
                        )}
                        <span>{isUploadingGallery ? 'Uploading Photos...' : 'Upload Photos'}</span>
                      </button>

                      <input
                        type="file"
                        ref={galleryFileInputRef}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif"
                        multiple
                        className="hidden"
                        onChange={handleGalleryFilesUpload}
                      />
                    </div>
                  </div>

                  {/* Add Image by URL */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGalleryImage();
                        }
                      }}
                      className="flex-1 liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none placeholder:text-white/30"
                      placeholder="Or paste image URL to add to gallery..."
                    />
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage()}
                      className="px-3.5 py-1.5 rounded-xl liquid-glass-button text-xs font-mono text-white cursor-pointer hover:bg-white/15"
                    >
                      Add Photo
                    </button>
                  </div>

                  {/* Gallery Thumbnails Grid */}
                  {(formData.galleryImages || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {(formData.galleryImages || []).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-video rounded-xl overflow-hidden border border-white/15 bg-black/40"
                        >
                          <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: imgUrl })}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-white cursor-pointer transition-colors font-medium shadow"
                            >
                              Set as Cover
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/80 hover:bg-red-500 text-white cursor-pointer transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Video Clips & Showcase Reels */}
                <div className="md:col-span-2 space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-sky-400" />
                        <span>Additional Video Clips & Reels ({(formData.videoList || []).length} clips)</span>
                      </h5>
                      <p className="text-[11px] font-mono text-white/50">
                        Add showcase clips, customer testimonials, or vertical UGC reels for this project.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      disabled={isUploadingVideo}
                      className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                      title="Upload video from device"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Video File</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="sm:col-span-4 liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none placeholder:text-white/30"
                      placeholder="Title (e.g. 4K Drone Footage)"
                    />
                    <input
                      type="text"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddVideo();
                        }
                      }}
                      className="sm:col-span-6 liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none placeholder:text-white/30"
                      placeholder="Video URL (https://...)"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="sm:col-span-2 px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-mono text-white cursor-pointer hover:bg-white/15"
                    >
                      Add Reel
                    </button>
                  </div>

                  {/* Video List Items */}
                  {(formData.videoList || []).length > 0 && (
                    <div className="space-y-2 pt-1">
                      {(formData.videoList || []).map((vid, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Film className="w-4 h-4 text-sky-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-white truncate">{vid.title}</div>
                              <div className="text-[10px] font-mono text-white/50 truncate max-w-xs">{vid.url}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, videoUrl: vid.url, video: vid.url })}
                              className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-mono cursor-pointer transition-colors"
                              title="Set as primary video reel"
                            >
                              Set Primary
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              className="p-1 rounded-lg text-white/40 hover:text-red-400 cursor-pointer"
                              title="Remove video"
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

              {/* Notification Banner */}
              {uploadNotice && (
                <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{uploadNotice}</span>
                </div>
              )}
              {saveError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              {/* Action Buttons: Save Draft vs Save & Publish */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProject(null);
                  }}
                  className="px-5 py-2.5 rounded-xl liquid-glass-pill text-xs font-mono text-white hover:bg-white/10 cursor-pointer transition-colors text-center disabled:opacity-50"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    title="Save as Draft without displaying on public website"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(true)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-xs font-mono text-white font-medium cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    title="Save and publish directly to live website"
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
