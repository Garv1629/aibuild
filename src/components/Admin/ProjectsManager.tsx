/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  EyeOff,
  X,
  Check,
  Image as ImageIcon,
  Film,
  Play,
  ArrowUp,
  ArrowDown,
  Globe,
  CheckCircle2,
  Upload,
  AlertCircle,
  Loader2,
  GripVertical,
  FileUp,
  AlertTriangle,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { Project, PROJECT_CATEGORIES, ProjectVideo } from '../../utils/portfolio.ts';
import { uploadMediaFile } from '../../services/storage.ts';

// Allowed MIME types and size limits
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
]);

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB

interface StagedMediaFile {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  sizeBytes: number;
  status: 'ready' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
  isValid: boolean;
  target: 'gallery' | 'cover';
}

export const ProjectsManager: React.FC = () => {
  const { data, addProject, updateProject, deleteProject, reorderProjects, togglePublishProject, addMediaAsset } = usePortfolio();
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
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop state for upload dropzones
  const [isDraggingOverCover, setIsDraggingOverCover] = useState(false);
  const [isDraggingOverGallery, setIsDraggingOverGallery] = useState(false);

  // Pre-upload queue for files dropped / selected
  const [stagedFiles, setStagedFiles] = useState<StagedMediaFile[]>([]);

  // Drag-and-drop reordering states
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [dragOverImageIdx, setDragOverImageIdx] = useState<number | null>(null);
  const [draggedVideoIdx, setDraggedVideoIdx] = useState<number | null>(null);
  const [dragOverVideoIdx, setDragOverVideoIdx] = useState<number | null>(null);

  // Form states (The 6 core fields: Title, Category, Description, Cover Image, Gallery Images/Videos, Project URL)
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Sorted by explicit display order
  const projectsList = [...data.projects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const filteredProjects = projectsList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  // Cleanup object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      stagedFiles.forEach((f) => {
        try {
          URL.revokeObjectURL(f.previewUrl);
        } catch (e) {}
      });
    };
  }, [stagedFiles]);

  // File validation helper (checks format and size)
  const validateFile = (file: File): { isValid: boolean; error?: string; type: 'image' | 'video' } => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(file.name);
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name);

    if (!isVideo && !isImage) {
      return {
        isValid: false,
        error: `Unsupported format (${file.type || 'unknown'}). Please upload standard image or video files.`,
        type: 'image',
      };
    }

    const type: 'image' | 'video' = isVideo ? 'video' : 'image';
    const maxBytes = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxBytes) {
      const limitMb = isVideo ? 60 : 15;
      return {
        isValid: false,
        error: `File exceeds ${limitMb}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        type,
      };
    }

    return { isValid: true, type };
  };

  // Stage files into the pre-upload queue with instant preview
  const stageFiles = (files: FileList | File[], target: 'gallery' | 'cover' = 'gallery') => {
    setSaveError(null);
    const newItems: StagedMediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      const previewUrl = URL.createObjectURL(file);
      const id = `staged-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      newItems.push({
        id,
        file,
        previewUrl,
        type: validation.type,
        sizeBytes: file.size,
        status: validation.isValid ? 'ready' : 'error',
        progress: 0,
        errorMessage: validation.error,
        isValid: validation.isValid,
        target,
      });
    }

    setStagedFiles((prev) => [...prev, ...newItems]);
  };

  // Remove a single staged file before upload
  const handleRemoveStagedFile = (id: string) => {
    setStagedFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch (e) {}
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Clear entire pre-upload queue
  const handleClearStagedFiles = () => {
    stagedFiles.forEach((f) => {
      try {
        URL.revokeObjectURL(f.previewUrl);
      } catch (e) {}
    });
    setStagedFiles([]);
  };

  // Upload all valid staged files with individual progress feedback
  const handleUploadStagedFiles = async () => {
    const queue = stagedFiles.filter((f) => f.isValid && f.status !== 'success');
    if (queue.length === 0) return;

    setIsUploadingBatch(true);
    setSaveError(null);
    let successCount = 0;

    for (const item of queue) {
      // Mark as uploading with progress
      setStagedFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading', progress: 35 } : f))
      );

      const progressInterval = setInterval(() => {
        setStagedFiles((prev) =>
          prev.map((f) => {
            if (f.id === item.id && f.status === 'uploading' && f.progress < 90) {
              return { ...f, progress: f.progress + 20 };
            }
            return f;
          })
        );
      }, 150);

      try {
        const res = await uploadMediaFile(item.file, {
          title: `${formData.title || 'Project'} ${item.type === 'video' ? 'Video' : 'Gallery'}`,
          tags: [item.type === 'video' ? 'Project Video' : 'Gallery Image', formData.category || 'Portfolio'],
        });

        clearInterval(progressInterval);
        addMediaAsset(res.asset);
        successCount++;

        // Mark as success
        setStagedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'success', progress: 100 } : f))
        );

        // Add to project formData
        if (item.target === 'cover' || (!formData.image && item.type === 'image')) {
          setFormData((prev) => ({ ...prev, image: res.asset.url }));
        }

        if (item.type === 'image') {
          setFormData((prev) => {
            const existing = prev.galleryImages || [];
            return existing.includes(res.asset.url) ? prev : { ...prev, galleryImages: [...existing, res.asset.url] };
          });
        } else {
          const newVid: ProjectVideo = {
            title: item.file.name.replace(/\.[^/.]+$/, ''),
            url: res.asset.url,
          };
          setFormData((prev) => ({
            ...prev,
            videoList: [...(prev.videoList || []), newVid],
          }));
        }
      } catch (err: any) {
        clearInterval(progressInterval);
        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'error', errorMessage: err?.message || 'Upload failed' } : f
          )
        );
      }
    }

    setIsUploadingBatch(false);
    if (successCount > 0) {
      setUploadNotice(`Successfully uploaded ${successCount} file(s) to project media!`);
      setTimeout(() => {
        setUploadNotice(null);
        // Automatically prune successfully uploaded files from the staged queue after a moment
        setStagedFiles((prev) => prev.filter((f) => f.status !== 'success'));
      }, 2500);
    }
  };

  // Direct Cover File Upload / Drop Handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stageFiles([file], 'cover');
    if (coverFileInputRef.current) coverFileInputRef.current.value = '';
  };

  // Drag and Drop handlers for Cover dropzone
  const handleCoverDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverCover(true);
  };

  const handleCoverDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverCover(false);
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverCover(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      stageFiles(e.dataTransfer.files, 'cover');
    }
  };

  // Drag and Drop handlers for Gallery dropzone
  const handleGalleryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverGallery(true);
  };

  const handleGalleryDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverGallery(false);
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverGallery(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      stageFiles(e.dataTransfer.files, 'gallery');
    }
  };

  // Multi-photo Gallery Input Change Handler
  const handleGalleryFilesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    stageFiles(files, 'gallery');
    if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
  };

  // ----------------------------------------------------------------------------
  // Drag-and-Drop Reordering for Gallery Images
  // ----------------------------------------------------------------------------
  const handleImageDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedImageIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleImageDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverImageIdx !== idx) {
      setDragOverImageIdx(idx);
    }
  };

  const handleImageDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedImageIdx === null || draggedImageIdx === targetIdx) {
      setDraggedImageIdx(null);
      setDragOverImageIdx(null);
      return;
    }

    const current = [...(formData.galleryImages || [])];
    const [moved] = current.splice(draggedImageIdx, 1);
    current.splice(targetIdx, 0, moved);

    setFormData((prev) => ({ ...prev, galleryImages: current }));
    setDraggedImageIdx(null);
    setDragOverImageIdx(null);
  };

  const handleMoveGalleryImage = (idx: number, direction: 'up' | 'down') => {
    const current = [...(formData.galleryImages || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const [moved] = current.splice(idx, 1);
    current.splice(targetIdx, 0, moved);
    setFormData((prev) => ({ ...prev, galleryImages: current }));
  };

  // ----------------------------------------------------------------------------
  // Drag-and-Drop Reordering for Gallery Videos
  // ----------------------------------------------------------------------------
  const handleVideoDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedVideoIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleVideoDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverVideoIdx !== idx) {
      setDragOverVideoIdx(idx);
    }
  };

  const handleVideoDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedVideoIdx === null || draggedVideoIdx === targetIdx) {
      setDraggedVideoIdx(null);
      setDragOverVideoIdx(null);
      return;
    }

    const current = [...(formData.videoList || [])];
    const [moved] = current.splice(draggedVideoIdx, 1);
    current.splice(targetIdx, 0, moved);

    setFormData((prev) => ({ ...prev, videoList: current }));
    setDraggedVideoIdx(null);
    setDragOverVideoIdx(null);
  };

  const handleMoveVideo = (idx: number, direction: 'up' | 'down') => {
    const current = [...(formData.videoList || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const [moved] = current.splice(idx, 1);
    current.splice(targetIdx, 0, moved);
    setFormData((prev) => ({ ...prev, videoList: current }));
  };

  // Start Create Project
  const handleStartCreate = () => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
    setShowVideoPicker(false);
    handleClearStagedFiles();

    const newId = `project-${Date.now()}`;
    const initial: Project = {
      id: newId,
      title: 'New Portfolio Project',
      category: 'Web Development',
      description: '',
      image: '',
      galleryImages: [],
      videoList: [],
      projectUrl: '',
      isPublished: true,
      order: data.projects.length + 1,
    };
    setFormData(initial);
    setIsCreating(true);
    setEditingProject(null);
  };

  // Start Edit Project
  const handleStartEdit = (project: Project) => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
    setShowVideoPicker(false);
    handleClearStagedFiles();

    setFormData({
      ...project,
      galleryImages: project.galleryImages || [],
      videoList: project.videoList || [],
    });
    setEditingProject(project);
    setIsCreating(false);
  };

  // Save Project to Supabase
  const handleSave = async (publishState?: boolean) => {
    if (!formData.title?.trim()) {
      setSaveError('Please enter a project title.');
      return;
    }
    if (!formData.category) {
      setSaveError('Please select a service category.');
      return;
    }
    if (!formData.image?.trim()) {
      setSaveError('Please upload or provide a project cover image.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const finalPublished = typeof publishState === 'boolean' ? publishState : (formData.isPublished ?? true);
    const payload: Project = {
      ...(formData as Project),
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description?.trim() || '',
      image: formData.image.trim(),
      galleryImages: formData.galleryImages || [],
      videoList: formData.videoList || [],
      projectUrl: formData.projectUrl?.trim() || undefined,
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
      handleClearStagedFiles();
    }, 700);
  };

  const handleMoveProjectUp = (currentIdx: number) => {
    if (currentIdx > 0) {
      reorderProjects(currentIdx, currentIdx - 1);
    }
  };

  const handleMoveProjectDown = (currentIdx: number) => {
    if (currentIdx < projectsList.length - 1) {
      reorderProjects(currentIdx, currentIdx + 1);
    }
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
    });
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const handleRemoveVideo = (idx: number) => {
    const updated = (formData.videoList || []).filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      videoList: updated,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project, idx) => {
          const globalIdx = projectsList.findIndex((p) => p.id === project.id);
          const isPublished = project.isPublished !== false;
          const imageCount = (project.galleryImages || []).length;
          const videoCount = (project.videoList || []).length;

          return (
            <div
              key={project.id}
              className={`liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 border transition-all group ${
                isPublished ? 'border-white/10 hover:border-white/25' : 'border-amber-500/30 bg-amber-500/[0.02]'
              }`}
            >
              <div className="flex gap-4">
                {/* Cover Thumbnail with Reorder Controls */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-white/15 relative bg-black/40">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-1 left-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/75 text-white/80">
                      #{project.order || globalIdx + 1}
                    </span>
                  </div>

                  {/* Reorder Up / Down Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={globalIdx === 0}
                      onClick={() => handleMoveProjectUp(globalIdx)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all"
                      title="Move Project Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={globalIdx === projectsList.length - 1}
                      onClick={() => handleMoveProjectDown(globalIdx)}
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
                      <span className="text-xs font-mono uppercase tracking-wide text-sky-400">
                        {project.category}
                      </span>

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

                    <h4 className="text-base font-medium text-white truncate">
                      {project.title}
                    </h4>
                    {project.description && (
                      <p className="text-xs text-white/60 line-clamp-2 mt-1 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Media counts and live URL */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 flex items-center gap-1">
                      <ImageIcon className="w-2.5 h-2.5 text-sky-400" />
                      <span>{imageCount > 0 ? `+${imageCount} photos` : 'Cover only'}</span>
                    </span>

                    {videoCount > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 flex items-center gap-1">
                        <Film className="w-2.5 h-2.5 text-sky-400" />
                        <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
                      </span>
                    )}

                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 hover:text-sky-200 border border-sky-400/20 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>Project URL</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => handleStartEdit(project)}
                  className="px-3 py-1.5 rounded-xl liquid-glass-pill hover:bg-white/20 text-white cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-mono"
                  title="Edit Project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(project.id)}
                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 cursor-pointer transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center liquid-glass rounded-2xl text-white/60 text-sm font-mono">
          No projects found matching the criteria. Click "Add Project" to create one.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-modal rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-white/15">
            <h4 className="text-lg font-medium text-white">Delete Project?</h4>
            <p className="text-xs text-white/60 font-mono leading-relaxed">
              Are you sure you want to delete this project? This will permanently remove it from the portfolio.
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

      {/* Create / Edit Project Modal: Complete Drag & Drop Media Management */}
      {(isCreating || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="liquid-glass-modal rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-white/20 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white tracking-tight">
                  {isCreating ? 'Create Static Portfolio Project' : 'Edit Portfolio Project'}
                </h3>
                <p className="text-xs text-white/60 font-mono">
                  Drag and drop files to upload, preview before saving, and drag to reorder media.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProject(null);
                  handleClearStagedFiles();
                }}
                className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Project Title (required) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">
                    Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    placeholder="e.g. Sri Balaji Real Estate Platform"
                  />
                </div>

                {/* 2. Service Category (required) */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">
                    Service Category <span className="text-rose-400">*</span>
                  </label>
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

                {/* 6. Project URL (optional) */}
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-sky-400" />
                    <span>Project URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.projectUrl || ''}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    placeholder="https://client-site.com (optional)"
                  />
                </div>

                {/* 3. Project Description (optional) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-white/80 mb-1.5">
                    Project Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none leading-relaxed"
                    placeholder="Enter project summary, scope, deliverables, or background details..."
                  />
                </div>

                {/* 4. Cover Image / Banner (required with Drag & Drop) */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Cover Image / Banner</span>
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
                        <span>Browse Cover</span>
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

                  {/* Drag-and-Drop Cover Zone or Active Cover Preview */}
                  {formData.image ? (
                    <div
                      onDragOver={handleCoverDragOver}
                      onDragLeave={handleCoverDragLeave}
                      onDrop={handleCoverDrop}
                      className={`relative rounded-2xl overflow-hidden border p-2.5 flex items-center gap-3.5 group shadow-lg transition-all ${
                        isDraggingOverCover
                          ? 'border-sky-400 ring-2 ring-sky-400/60 bg-sky-500/10'
                          : 'border-white/20 bg-black/60'
                      }`}
                    >
                      <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-black/80 border border-white/15 shrink-0 relative">
                        <img
                          src={formData.image}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
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
                        <p className="text-[10px] font-mono text-white/40">
                          (Drop an image file here anytime to replace)
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
                      onDragOver={handleCoverDragOver}
                      onDragLeave={handleCoverDragLeave}
                      onDrop={handleCoverDrop}
                      onClick={() => coverFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all group ${
                        isDraggingOverCover
                          ? 'border-sky-400 bg-sky-500/15 shadow-[0_0_24px_rgba(56,189,248,0.3)] scale-[1.01]'
                          : 'border-white/20 hover:border-sky-400/60 bg-white/[0.02] hover:bg-sky-500/[0.04]'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 text-xs text-white/70">
                        <Upload className={`w-7 h-7 transition-transform ${isDraggingOverCover ? 'text-sky-300 scale-125' : 'text-sky-400 group-hover:scale-110'}`} />
                        <span className="font-medium text-white text-sm">
                          {isDraggingOverCover ? 'Drop cover image here' : 'Drag & drop cover photo here, or click to browse'}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">
                          PNG, JPG, WebP, SVG, AVIF (up to 15MB)
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

                {/* 5. Project Media Gallery: Drag & Drop Multi-file Upload Area */}
                <div className="md:col-span-2 space-y-4 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                        <FileUp className="w-4 h-4 text-sky-400" />
                        <span>Project Media Gallery &amp; Reordering</span>
                      </h5>
                      <p className="text-[11px] font-mono text-white/50">
                        Drag and drop multiple images and videos into the dropzone. Reorder items anytime by dragging.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        disabled={isUploadingBatch}
                        className="text-[11px] font-mono px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                        title="Browse files from your device"
                      >
                        <Upload className="w-3.5 h-3.5 text-sky-300" />
                        <span>Browse Media Files</span>
                      </button>

                      <input
                        type="file"
                        ref={galleryFileInputRef}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,video/quicktime,video/ogg"
                        multiple
                        className="hidden"
                        onChange={handleGalleryFilesInput}
                      />
                    </div>
                  </div>

                  {/* Interactive Drag & Drop Area */}
                  <div
                    onDragOver={handleGalleryDragOver}
                    onDragLeave={handleGalleryDragLeave}
                    onDrop={handleGalleryDrop}
                    onClick={() => galleryFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all group ${
                      isDraggingOverGallery
                        ? 'border-sky-400 bg-sky-500/20 shadow-[0_0_32px_rgba(56,189,248,0.35)] scale-[1.01]'
                        : 'border-white/20 hover:border-sky-400/60 bg-white/[0.02] hover:bg-sky-500/[0.04]'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-xs text-white/70">
                      <FileUp className={`w-8 h-8 transition-transform ${isDraggingOverGallery ? 'text-sky-300 scale-125 animate-bounce' : 'text-sky-400 group-hover:scale-110'}`} />
                      <div className="space-y-0.5">
                        <span className="font-medium text-white text-sm block">
                          {isDraggingOverGallery ? 'Release to drop media files' : 'Drag & drop multiple photos and videos here'}
                        </span>
                        <span className="text-[11px] font-mono text-sky-300/80">
                          or click to browse from device
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 pt-1">
                        Images (up to 15MB) • Videos MP4, WebM, MOV (up to 60MB)
                      </span>
                    </div>
                  </div>

                  {/* Pre-Upload Staged Queue Banner & Previews */}
                  {stagedFiles.length > 0 && (
                    <div className="p-4 rounded-2xl bg-black/60 border border-sky-400/30 space-y-3 animate-fadeIn">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                            <span>Staged for Upload ({stagedFiles.length})</span>
                          </span>
                          <span className="text-[10px] font-mono text-white/50">
                            (Preview before uploading to database)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleClearStagedFiles}
                            disabled={isUploadingBatch}
                            className="text-[10px] font-mono px-2.5 py-1 rounded-lg text-white/60 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            Clear All
                          </button>

                          <button
                            type="button"
                            onClick={handleUploadStagedFiles}
                            disabled={isUploadingBatch || !stagedFiles.some((f) => f.isValid && f.status !== 'success')}
                            className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium cursor-pointer shadow-[0_0_16px_rgba(56,189,248,0.4)] flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {isUploadingBatch ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-white" />
                            )}
                            <span>{isUploadingBatch ? 'Uploading Queue...' : `Upload ${stagedFiles.filter(f => f.isValid && f.status !== 'success').length} File(s)`}</span>
                          </button>
                        </div>
                      </div>

                      {/* Staged File Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {stagedFiles.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                              item.status === 'error'
                                ? 'border-red-500/40 bg-red-500/10'
                                : item.status === 'success'
                                ? 'border-emerald-500/40 bg-emerald-500/10'
                                : 'border-white/15 bg-white/[0.03]'
                            }`}
                          >
                            {/* Visual Thumbnail */}
                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/80 border border-white/10 shrink-0 relative flex items-center justify-center">
                              {item.type === 'video' ? (
                                <>
                                  <video src={item.previewUrl} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                                  <Play className="w-4 h-4 text-white absolute" />
                                </>
                              ) : (
                                <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                              )}
                            </div>

                            {/* Details and Upload Progress */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-medium text-white truncate max-w-[140px]" title={item.file.name}>
                                  {item.file.name}
                                </span>
                                <span className="text-[10px] font-mono text-white/50 shrink-0">
                                  {(item.sizeBytes / (1024 * 1024)).toFixed(1)}MB
                                </span>
                              </div>

                              {/* Progress bar or Status label */}
                              {item.status === 'uploading' && (
                                <div className="space-y-1">
                                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                      className="h-full bg-sky-400 rounded-full transition-all duration-300"
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] font-mono text-sky-300 block">
                                    Uploading... {item.progress}%
                                  </span>
                                </div>
                              )}

                              {item.status === 'ready' && (
                                <span className="text-[10px] font-mono text-sky-400 flex items-center gap-1">
                                  <span>Ready to upload</span>
                                  {item.target === 'cover' && <span className="text-emerald-400">• Set as Cover</span>}
                                </span>
                              )}

                              {item.status === 'success' && (
                                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Uploaded successfully</span>
                                </span>
                              )}

                              {item.status === 'error' && (
                                <span className="text-[10px] font-mono text-red-400 flex items-center gap-1 truncate" title={item.errorMessage}>
                                  <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                                  <span className="truncate">{item.errorMessage || 'Invalid file'}</span>
                                </span>
                              )}
                            </div>

                            {/* Remove action */}
                            <button
                              type="button"
                              onClick={() => handleRemoveStagedFile(item.id)}
                              disabled={item.status === 'uploading'}
                              className="p-1 rounded-lg text-white/40 hover:text-red-400 cursor-pointer transition-colors disabled:opacity-30 shrink-0"
                              title="Remove before upload"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section A: Gallery Images with Drag-and-Drop Reordering */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                        <span>Gallery Images ({(formData.galleryImages || []).length})</span>
                      </span>
                      <span className="text-[10px] font-mono text-white/50">
                        Tip: Drag and drop cards to reorder images
                      </span>
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
                        placeholder="Or paste external image URL to add..."
                      />
                      <button
                        type="button"
                        onClick={() => handleAddGalleryImage()}
                        className="px-3.5 py-1.5 rounded-xl liquid-glass-button text-xs font-mono text-white cursor-pointer hover:bg-white/15"
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Drag-and-Drop Reorderable Images Grid */}
                    {(formData.galleryImages || []).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5">
                        {(formData.galleryImages || []).map((imgUrl, idx) => {
                          const isBeingDragged = draggedImageIdx === idx;
                          const isDragTarget = dragOverImageIdx === idx;

                          return (
                            <div
                              key={`gallery-img-${idx}`}
                              draggable
                              onDragStart={(e) => handleImageDragStart(e, idx)}
                              onDragOver={(e) => handleImageDragOver(e, idx)}
                              onDrop={(e) => handleImageDrop(e, idx)}
                              onDragEnd={() => {
                                setDraggedImageIdx(null);
                                setDragOverImageIdx(null);
                              }}
                              className={`group relative aspect-video rounded-xl overflow-hidden border bg-black/50 transition-all cursor-grab active:cursor-grabbing select-none ${
                                isBeingDragged
                                  ? 'opacity-40 scale-95 border-sky-400 ring-2 ring-sky-400/50'
                                  : isDragTarget
                                  ? 'border-sky-400 ring-2 ring-sky-400/60 scale-105 shadow-[0_0_16px_rgba(56,189,248,0.4)]'
                                  : 'border-white/15 hover:border-white/35'
                              }`}
                              title="Drag and drop to reorder"
                            >
                              <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />

                              {/* Order Badge and Drag Grip Handle */}
                              <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/90 z-10 pointer-events-none">
                                <GripVertical className="w-3 h-3 text-sky-400" />
                                <span>#{idx + 1}</span>
                              </div>

                              {/* Hover controls: Reorder, Set Cover, Remove */}
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-20">
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, image: imgUrl })}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-white cursor-pointer transition-colors font-medium shadow"
                                >
                                  Set as Cover
                                </button>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveGalleryImage(idx, 'up')}
                                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 cursor-pointer"
                                    title="Move left"
                                  >
                                    <ArrowUp className="w-3 h-3 -rotate-90" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (formData.galleryImages || []).length - 1}
                                    onClick={() => handleMoveGalleryImage(idx, 'down')}
                                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 cursor-pointer"
                                    title="Move right"
                                  >
                                    <ArrowDown className="w-3 h-3 -rotate-90" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(idx)}
                                    className="p-1 rounded bg-red-600/80 hover:bg-red-500 text-white cursor-pointer"
                                    title="Remove image"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-[11px] font-mono text-white/40 border border-dashed border-white/10 rounded-xl">
                        No gallery images yet. Drop image files into the upload box above.
                      </div>
                    )}
                  </div>

                  {/* Section B: Gallery Videos with Drag-and-Drop Reordering */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-white/90 font-medium flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-sky-400" />
                        <span>Gallery Videos ({(formData.videoList || []).length})</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowVideoPicker(!showVideoPicker)}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-colors ${
                            showVideoPicker
                              ? 'bg-sky-500/30 text-sky-200 border-sky-400/50'
                              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/15'
                          }`}
                        >
                          <Film className="w-3 h-3 text-sky-400" />
                          <span>{showVideoPicker ? 'Hide Library' : 'Video Library'}</span>
                        </button>
                        <span className="text-[10px] font-mono text-white/50">
                          Drag rows to reorder
                        </span>
                      </div>
                    </div>

                    {/* Add Video by Title + URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        className="sm:col-span-4 liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none placeholder:text-white/30"
                        placeholder="Title (e.g. Platform Walkthrough)"
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
                        placeholder="Video URL (https://...mp4 or stream)"
                      />
                      <button
                        type="button"
                        onClick={handleAddVideo}
                        className="sm:col-span-2 px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-mono text-white cursor-pointer hover:bg-white/15"
                      >
                        Add Video
                      </button>
                    </div>

                    {/* Video Library Drawer */}
                    {showVideoPicker && (
                      <div className="p-3.5 rounded-2xl bg-black/75 border border-white/15 space-y-2.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                          <span>Click a video to add it to this project:</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                          {(data.mediaAssets || []).filter((m) => m.type === 'video').length === 0 ? (
                            <div className="col-span-full py-4 text-center text-xs text-white/50 font-mono">
                              No uploaded videos in library yet. Drop a video in the upload box above.
                            </div>
                          ) : (
                            (data.mediaAssets || []).filter((m) => m.type === 'video').map((media) => {
                              const isIncluded = (formData.videoList || []).some((v) => v.url === media.url);
                              return (
                                <button
                                  key={media.id}
                                  type="button"
                                  onClick={() => {
                                    if (!isIncluded) {
                                      setFormData({
                                        ...formData,
                                        videoList: [
                                          ...(formData.videoList || []),
                                          { title: media.title, url: media.url },
                                        ],
                                      });
                                    }
                                    setShowVideoPicker(false);
                                  }}
                                  className={`p-2 rounded-xl border cursor-pointer relative group text-left transition-all bg-white/[0.03] ${
                                    isIncluded
                                      ? 'border-emerald-500/50 bg-emerald-500/10'
                                      : 'border-white/15 hover:border-sky-400/70'
                                  }`}
                                >
                                  <div className="aspect-video rounded-lg overflow-hidden bg-black mb-1.5 flex items-center justify-center relative">
                                    <video src={media.url} preload="none" playsInline className="w-full h-full object-cover" muted />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <Play className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                  <div className="text-[11px] font-medium text-white truncate">{media.title}</div>
                                  <div className="text-[9px] font-mono text-white/50 truncate">
                                    {isIncluded ? '✓ In gallery' : 'Click to add'}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* Drag-and-Drop Reorderable Videos List */}
                    {(formData.videoList || []).length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {(formData.videoList || []).map((vid, idx) => {
                          const isBeingDragged = draggedVideoIdx === idx;
                          const isDragTarget = dragOverVideoIdx === idx;

                          return (
                            <div
                              key={`gallery-vid-${idx}`}
                              draggable
                              onDragStart={(e) => handleVideoDragStart(e, idx)}
                              onDragOver={(e) => handleVideoDragOver(e, idx)}
                              onDrop={(e) => handleVideoDrop(e, idx)}
                              onDragEnd={() => {
                                setDraggedVideoIdx(null);
                                setDragOverVideoIdx(null);
                              }}
                              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border text-xs cursor-grab active:cursor-grabbing select-none transition-all ${
                                isBeingDragged
                                  ? 'opacity-40 border-sky-400 bg-sky-500/10 scale-98'
                                  : isDragTarget
                                  ? 'border-sky-400 ring-2 ring-sky-400/50 bg-sky-500/15'
                                  : 'bg-white/5 border-white/10 hover:border-white/20'
                              }`}
                              title="Drag to reorder videos"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <GripVertical className="w-4 h-4 text-sky-400 shrink-0" />
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white/80 shrink-0">
                                  #{idx + 1}
                                </span>
                                <Film className="w-4 h-4 text-sky-400 shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-medium text-white truncate">{vid.title}</div>
                                  <div className="text-[10px] font-mono text-white/50 truncate max-w-xs">{vid.url}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveVideo(idx, 'up')}
                                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 cursor-pointer"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === (formData.videoList || []).length - 1}
                                  onClick={() => handleMoveVideo(idx, 'down')}
                                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 cursor-pointer"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-3 h-3" />
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
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-[11px] font-mono text-white/40 border border-dashed border-white/10 rounded-xl">
                        No videos added yet. Drop MP4/WebM files in the upload box above or enter video URL.
                      </div>
                    )}
                  </div>
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
                  disabled={isSaving || isUploadingBatch}
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProject(null);
                    handleClearStagedFiles();
                  }}
                  className="px-5 py-2.5 rounded-xl liquid-glass-pill text-xs font-mono text-white hover:bg-white/10 cursor-pointer transition-colors text-center disabled:opacity-50"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isSaving || isUploadingBatch}
                    onClick={() => handleSave(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    title="Save as Draft without displaying on public website"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving || isUploadingBatch}
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
