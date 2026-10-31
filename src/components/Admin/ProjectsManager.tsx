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
  ChevronDown,
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

const DEFAULT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=90',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90',
];

export const ProjectsManager: React.FC = () => {
  const { data, addProject, updateProject, deleteProject, reorderProjects, togglePublishProject, addMediaAsset } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPublishStatus, setFilterPublishStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Sorted by explicit display order
  const projectsList = [...data.projects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  // Modal / Panel open state: defaults to true so Project Manager is immediately open
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(() => {
    return projectsList[0] || null;
  });
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState<number>(0);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);

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

  // Drag-and-drop reordering states for gallery
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [dragOverImageIdx, setDragOverImageIdx] = useState<number | null>(null);

  // Form states strictly restricted to the 6 core fields:
  // 1. Project Title (required)
  // 2. Service Category (required)
  // 3. Project URL (optional)
  // 4. Description (optional)
  // 5. Cover Image (required)
  // 6. Multiple Media Gallery (images and videos)
  const [formData, setFormData] = useState<Partial<Project>>(() => {
    const initialProj = projectsList[0];
    if (initialProj) {
      return {
        ...initialProj,
        galleryImages: (initialProj.galleryImages && initialProj.galleryImages.length > 0)
          ? initialProj.galleryImages
          : DEFAULT_FALLBACK_IMAGES,
        videoList: initialProj.videoList || [
          {
            title: 'Platform Walkthrough',
            url: 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
          },
        ],
      };
    }
    return {
      title: 'Sri Balaji Real Estate Platform',
      category: 'Web Development',
      projectUrl: 'https://sribalajirealestate.in',
      description:
        'A comprehensive real estate platform showcasing luxury residential and commercial properties. Features advanced search filters, map integration, user profiles, and inquiry forms for seamless agent connectivity.',
      image: DEFAULT_FALLBACK_IMAGES[0],
      galleryImages: DEFAULT_FALLBACK_IMAGES,
      videoList: [
        {
          title: 'Platform Walkthrough',
          url: 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
        },
      ],
      isPublished: true,
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Keep editingProject in sync if projects load asynchronously
  useEffect(() => {
    if (!editingProject && !isCreating && projectsList.length > 0) {
      const first = projectsList[0];
      setEditingProject(first);
      setFormData({
        ...first,
        galleryImages: (first.galleryImages && first.galleryImages.length > 0)
          ? first.galleryImages
          : DEFAULT_FALLBACK_IMAGES,
        videoList: first.videoList || [
          {
            title: 'Platform Walkthrough',
            url: 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
          },
        ],
      });
    }
  }, [projectsList.length]);

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

  // Upload queued files directly with progress feedback
  const uploadAndAttachFiles = async (files: FileList | File[], target: 'gallery' | 'cover' = 'gallery') => {
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

    // Begin upload for all valid items immediately
    const validQueue = newItems.filter((item) => item.isValid);
    if (validQueue.length === 0) return;

    if (target === 'cover') {
      setIsUploadingCover(true);
    } else {
      setIsUploadingBatch(true);
    }

    let successCount = 0;

    for (const item of validQueue) {
      setStagedFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading', progress: 30 } : f))
      );

      const progressInterval = setInterval(() => {
        setStagedFiles((prev) =>
          prev.map((f) => {
            if (f.id === item.id && f.status === 'uploading' && f.progress < 85) {
              return { ...f, progress: f.progress + 20 };
            }
            return f;
          })
        );
      }, 150);

      try {
        const res = await uploadMediaFile(item.file, {
          title: `${formData.title || 'Project'} ${item.type === 'video' ? 'Video' : 'Media'}`,
          tags: [item.type === 'video' ? 'Project Video' : 'Gallery Image', formData.category || 'Portfolio'],
        });

        clearInterval(progressInterval);
        addMediaAsset(res.asset);
        successCount++;

        setStagedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'success', progress: 100 } : f))
        );

        if (target === 'cover' || (!formData.image && item.type === 'image')) {
          setFormData((prev) => ({ ...prev, image: res.asset.url }));
        }

        if (item.type === 'image') {
          setFormData((prev) => {
            const current = prev.galleryImages || [];
            return current.includes(res.asset.url) ? prev : { ...prev, galleryImages: [res.asset.url, ...current] };
          });
        } else {
          const newVid: ProjectVideo = {
            title: item.file.name.replace(/\.[^/.]+$/, ''),
            url: res.asset.url,
          };
          setFormData((prev) => ({
            ...prev,
            videoList: [newVid, ...(prev.videoList || [])],
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

    setIsUploadingCover(false);
    setIsUploadingBatch(false);

    if (successCount > 0) {
      setUploadNotice(`Uploaded ${successCount} file(s) to project media.`);
      setTimeout(() => {
        setUploadNotice(null);
        setStagedFiles((prev) => prev.filter((f) => f.status !== 'success'));
      }, 2500);
    }
  };

  // Direct Cover File Upload / Drop Handler
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAndAttachFiles([file], 'cover');
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
      uploadAndAttachFiles(e.dataTransfer.files, 'cover');
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
      uploadAndAttachFiles(e.dataTransfer.files, 'gallery');
    }
  };

  const handleGalleryFilesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    uploadAndAttachFiles(files, 'gallery');
    if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
  };

  // Drag-and-Drop Reordering for Gallery Images
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

    const current = [...(formData.galleryImages || DEFAULT_FALLBACK_IMAGES)];
    const [moved] = current.splice(draggedImageIdx, 1);
    current.splice(targetIdx, 0, moved);

    setFormData((prev) => ({ ...prev, galleryImages: current }));
    setSelectedGalleryIdx(targetIdx);
    setDraggedImageIdx(null);
    setDragOverImageIdx(null);
  };

  // Select project from switcher or overview
  const handleSelectProject = (project: Project) => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
    setEditingProject(project);
    setIsCreating(false);
    setIsPanelOpen(true);
    setSelectedGalleryIdx(0);

    setFormData({
      ...project,
      galleryImages: (project.galleryImages && project.galleryImages.length > 0)
        ? project.galleryImages
        : DEFAULT_FALLBACK_IMAGES,
      videoList: project.videoList || [
        {
          title: 'Platform Walkthrough',
          url: 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
        },
      ],
    });
  };

  // Start Create New Project
  const handleStartCreate = () => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
    setIsCreating(true);
    setEditingProject(null);
    setIsPanelOpen(true);
    setSelectedGalleryIdx(0);

    const newId = `project-${Date.now()}`;
    const initial: Project = {
      id: newId,
      title: 'New Portfolio Project',
      category: 'Web Development',
      description: '',
      image: DEFAULT_FALLBACK_IMAGES[0],
      galleryImages: DEFAULT_FALLBACK_IMAGES,
      videoList: [],
      projectUrl: '',
      isPublished: true,
      order: data.projects.length + 1,
    };
    setFormData(initial);
  };

  // Cancel action
  const handleCancel = () => {
    if (editingProject) {
      setFormData({
        ...editingProject,
        galleryImages: editingProject.galleryImages || DEFAULT_FALLBACK_IMAGES,
        videoList: editingProject.videoList || [],
      });
    }
    setSaveError(null);
    setSaveSuccess(null);
    setUploadNotice(null);
    setShowMediaPicker(false);
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
      setSaveError('Please provide a project cover image.');
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
      galleryImages: formData.galleryImages || DEFAULT_FALLBACK_IMAGES,
      videoList: formData.videoList || [],
      projectUrl: formData.projectUrl?.trim() || undefined,
      isPublished: finalPublished,
      updatedAt: new Date().toISOString(),
    };

    let result;
    if (isCreating || !editingProject) {
      result = await addProject(payload);
      if (result?.success && result.project) {
        setEditingProject(result.project);
        setIsCreating(false);
      }
    } else {
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
    }, 2000);
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

  const currentGalleryImages = (formData.galleryImages && formData.galleryImages.length > 0)
    ? formData.galleryImages
    : DEFAULT_FALLBACK_IMAGES;

  const displayCards = currentGalleryImages.slice(0, 3);
  while (displayCards.length < 3) {
    displayCards.push(DEFAULT_FALLBACK_IMAGES[displayCards.length % DEFAULT_FALLBACK_IMAGES.length]);
  }

  return (
    <div className="space-y-6 font-body">
      {/* ------------------------------------------------------------------------- */}
      {/* 1. PROJECT MANAGER PANEL (Exact match to reference screenshot) */}
      {/* ------------------------------------------------------------------------- */}
      {isPanelOpen && (
        <div className="w-full max-w-5xl mx-auto rounded-3xl bg-[#090e1a]/95 border border-cyan-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(34,211,238,0.12)] p-6 sm:p-8 backdrop-blur-xl transition-all relative">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                Project Manager
              </h2>

              {/* Project Quick Switcher */}
              {projectsList.length > 1 && (
                <div className="relative">
                  <select
                    value={formData.id || ''}
                    onChange={(e) => {
                      const proj = projectsList.find((p) => p.id === e.target.value);
                      if (proj) handleSelectProject(proj);
                    }}
                    className="text-xs font-mono bg-[#0d1322] border border-cyan-500/30 text-cyan-300 rounded-lg px-2.5 py-1 pr-6 cursor-pointer focus:outline-none focus:border-cyan-400"
                  >
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-cyan-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartCreate}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30 flex items-center gap-1 cursor-pointer transition-colors"
                title="Create New Project"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Project</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Project Manager"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="mt-6 space-y-5"
          >
            {/* ROW 1: 3-column Grid (Title, Category, URL) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Project Title */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-white/90 mb-2 block">
                  1. Project Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Sri Balaji Real Estate Platform"
                  className="w-full bg-[#0d1322] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                />
              </div>

              {/* 2. Service Category */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-white/90 mb-2 block">
                  2. Service Category
                </label>
                <div className="relative">
                  <select
                    value={formData.category || 'Web Development'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0d1322] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all cursor-pointer appearance-none pr-9"
                  >
                    {PROJECT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-white/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 3. Project URL */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-white/90 mb-2 block">
                  3. Project URL
                </label>
                <input
                  type="url"
                  value={formData.projectUrl || ''}
                  onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                  placeholder="https://sribalajirealestate.in"
                  className="w-full bg-[#0d1322] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                />
              </div>
            </div>

            {/* ROW 2: 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* LEFT COLUMN: Description + Drag & Drop Upload Zone */}
              <div className="flex flex-col justify-between space-y-4">
                {/* 4. Description */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-white/90 mb-2 block">
                    4. Description
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="A comprehensive real estate platform showcasing luxury residential and commercial properties. Features advanced search filters, map integration, user profiles, and inquiry forms for seamless agent connectivity."
                    className="w-full bg-[#0d1322] border border-[#1e293b] rounded-xl p-3.5 text-xs sm:text-sm text-white/90 placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all leading-relaxed resize-none h-[135px]"
                  />
                </div>

                {/* 6. Multiple Media Gallery - Large Drag-and-drop Upload Zone */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-white/90 mb-2 block">
                    6. Multiple Media Gallery
                  </label>
                  <div
                    onDragOver={handleGalleryDragOver}
                    onDragLeave={handleGalleryDragLeave}
                    onDrop={handleGalleryDrop}
                    onClick={() => galleryFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[135px] group ${
                      isDraggingOverGallery
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.25)]'
                        : 'border-[#1f2d47] hover:border-cyan-400/60 bg-[#0d1322]/40 hover:bg-cyan-500/[0.02]'
                    }`}
                  >
                    <Upload
                      className={`w-6 h-6 mb-2 transition-transform ${
                        isDraggingOverGallery ? 'text-cyan-300 scale-110' : 'text-white/60 group-hover:text-cyan-400'
                      }`}
                    />
                    <span className="text-sm font-medium text-white block">
                      Drag-and-drop Files
                    </span>
                    <span className="text-xs text-white/40 block mt-0.5 font-mono">
                      Drag and drop file upload
                    </span>

                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,video/quicktime,video/ogg"
                      className="hidden"
                      onChange={handleGalleryFilesInput}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Cover Image Banner + Multiple Media Previews */}
              <div className="flex flex-col justify-between space-y-4">
                {/* 5. Cover Image Banner */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-white/90 mb-2 block">
                    5. Cover Image Banner
                  </label>
                  <div
                    onDragOver={handleCoverDragOver}
                    onDragLeave={handleCoverDragLeave}
                    onDrop={handleCoverDrop}
                    className={`border-2 border-dashed rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 h-[135px] transition-all ${
                      isDraggingOverCover
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-[#1f2d47] bg-[#0d1322]/40'
                    }`}
                  >
                    {/* Cover Thumbnail */}
                    <div
                      onClick={() => setPreviewLightboxUrl(formData.image || DEFAULT_FALLBACK_IMAGES[0])}
                      className="w-36 sm:w-44 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black/60 relative group cursor-pointer"
                      title="Click to view full-resolution image"
                    >
                      <img
                        src={formData.image || DEFAULT_FALLBACK_IMAGES[0]}
                        alt="Cover preview"
                        loading="eager"
                        decoding="sync"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-cyan-300 border border-cyan-400/30">
                          View
                        </span>
                      </div>
                    </div>

                    {/* "or" separator */}
                    <span className="text-xs text-white/40 font-mono shrink-0">or</span>

                    {/* Action buttons stacked */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="w-32 sm:w-36 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1c273e] border border-[#223049] text-xs text-white font-medium text-center cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isUploadingCover ? 'Uploading...' : 'Browse Cover'}
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
                        className={`w-32 sm:w-36 py-2 rounded-xl border text-xs font-medium text-center cursor-pointer transition-colors shadow-sm ${
                          showMediaPicker
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                            : 'bg-[#141c2c] hover:bg-[#1c273e] text-white border-[#223049]'
                        }`}
                      >
                        Choose from Library
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. Multiple Media Gallery - 3 Cards + Video Preview */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-white/90 mb-2 block">
                    6. Multiple Media Gallery
                  </label>

                  {/* 3 Images Cards Row */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {displayCards.map((imgUrl, idx) => {
                      const isFirst = idx === 0;
                      return (
                        <div
                          key={`gallery-card-${idx}`}
                          draggable
                          onDragStart={(e) => handleImageDragStart(e, idx)}
                          onDragOver={(e) => handleImageDragOver(e, idx)}
                          onDrop={(e) => handleImageDrop(e, idx)}
                          onClick={() => {
                            setSelectedGalleryIdx(idx);
                            setFormData((prev) => ({ ...prev, image: imgUrl }));
                          }}
                          onDoubleClick={() => setPreviewLightboxUrl(imgUrl)}
                          className={`rounded-xl p-1.5 relative flex items-center gap-1.5 select-none transition-all cursor-pointer ${
                            idx === selectedGalleryIdx || isFirst
                              ? 'border border-cyan-400 ring-1 ring-cyan-400/50 bg-[#0d1322] shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                              : 'border border-[#1e293b] bg-[#0d1322] hover:border-white/20'
                          }`}
                          title="Click to preview cover, double-click to view full resolution, drag to reorder"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-white/40 shrink-0 cursor-grab active:cursor-grabbing" />
                          <div className="w-full h-16 sm:h-20 rounded-lg overflow-hidden border border-white/10 bg-black/60 relative">
                            <img
                              src={imgUrl}
                              alt={`Gallery item ${idx + 1}`}
                              loading="eager"
                              decoding="sync"
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          </div>
                          <span
                            className={`text-[9px] font-mono px-1 rounded absolute top-2 right-2 ${
                              idx === 0
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold'
                                : 'bg-black/70 text-white/80 border border-white/10'
                            }`}
                          >
                            #{idx === 0 ? '1' : idx === 1 ? '1' : '2'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Video Preview Card with Centered Play Button */}
                  <div
                    onClick={() => {
                      if (formData.videoList && formData.videoList.length > 0) {
                        window.open(formData.videoList[0].url, '_blank');
                      }
                    }}
                    className="mt-2.5 h-16 sm:h-20 rounded-xl overflow-hidden relative border border-[#1e293b] bg-black/60 group cursor-pointer flex items-center justify-center transition-all hover:border-cyan-400/50"
                    title={formData.videoList?.[0]?.title || 'Watch Project Video'}
                  >
                    <img
                      src={formData.image || DEFAULT_FALLBACK_IMAGES[0]}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                    />
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 pl-0.5 absolute">
                      <Play className="w-3.5 h-3.5 text-black fill-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pre-Upload Staged Queue Progress Banner */}
            {stagedFiles.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-black/60 border border-cyan-400/30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-mono text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>Uploading project media queue ({stagedFiles.length} item(s))...</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStagedFiles([])}
                    className="text-[10px] text-white/40 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stagedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 text-xs"
                    >
                      <div className="w-10 h-8 rounded overflow-hidden bg-black shrink-0">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-sky-950 text-cyan-300 text-[10px]">
                            MP4
                          </div>
                        ) : (
                          <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-mono text-white truncate">{item.file.name}</div>
                        <div className="text-[9px] font-mono text-cyan-400">
                          {item.status === 'uploading'
                            ? `Uploading ${item.progress}%`
                            : item.status === 'success'
                            ? 'Uploaded ✓'
                            : item.errorMessage || 'Ready'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Picker Drawer */}
            {showMediaPicker && (
              <div className="p-4 rounded-2xl bg-[#0b101c] border border-cyan-500/30 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-white/80">
                  <span>Click any asset to use as Cover photo or add to Gallery:</span>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {(data.mediaAssets || []).filter((m) => m.type === 'image').length === 0 ? (
                    <div className="col-span-full py-4 text-center text-xs text-white/40 font-mono">
                      No images in media library yet. Drop files in the upload box above.
                    </div>
                  ) : (
                    (data.mediaAssets || []).filter((m) => m.type === 'image').map((media) => {
                      const isCover = formData.image === media.url;
                      return (
                        <div
                          key={media.id}
                          className={`aspect-video rounded-xl overflow-hidden border relative group ${
                            isCover ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-white/15'
                          }`}
                        >
                          <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, image: media.url }));
                                setShowMediaPicker(false);
                              }}
                              className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-400 text-black font-semibold"
                            >
                              Set Cover
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  galleryImages: [media.url, ...(prev.galleryImages || [])],
                                }));
                              }}
                              className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/20 text-white"
                            >
                              + Gallery
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Notification toasts */}
            {uploadNotice && (
              <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
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

            {/* FOOTER BAR: Cancel | Save Draft | Save & Publish */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#1b253b] mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs sm:text-sm text-white/60 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(false)}
                className="px-5 py-2.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253c] border border-[#223049] text-xs sm:text-sm text-white/90 font-medium cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(true)}
                className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs sm:text-sm cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-black" />
                <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* 2. PROJECTS OVERVIEW LIST (Allows browsing, reordering & editing all projects) */}
      {/* ------------------------------------------------------------------------- */}
      <div className="space-y-4 pt-4">
        {/* Top bar */}
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

          <div className="flex items-center gap-2">
            {!isPanelOpen && (
              <button
                type="button"
                onClick={() => setIsPanelOpen(true)}
                className="liquid-glass-button text-xs font-mono px-3 py-2 rounded-xl text-cyan-300 hover:text-cyan-200 border border-cyan-400/30 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Project Manager</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStartCreate}
              className="liquid-glass-button bg-cyan-500/25 border-cyan-400/50 hover:bg-cyan-500/35 text-white font-medium text-xs font-mono px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(34,211,238,0.3)] transition-all shrink-0"
            >
              <Plus className="w-4 h-4 text-cyan-300" />
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project, idx) => {
            const globalIdx = projectsList.findIndex((p) => p.id === project.id);
            const isPublished = project.isPublished !== false;
            const imageCount = (project.galleryImages || []).length;
            const videoCount = (project.videoList || []).length;
            const isCurrentActive = formData.id === project.id && isPanelOpen;

            return (
              <div
                key={project.id}
                className={`liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 border transition-all group ${
                  isCurrentActive
                    ? 'border-cyan-400/60 ring-1 ring-cyan-400/30 bg-cyan-950/[0.08]'
                    : isPublished
                    ? 'border-white/10 hover:border-white/25'
                    : 'border-amber-500/30 bg-amber-500/[0.02]'
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
                        <span className="text-xs font-mono uppercase tracking-wide text-cyan-400">
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
                        <ImageIcon className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{imageCount > 0 ? `+${imageCount} photos` : 'Cover only'}</span>
                      </span>

                      {videoCount > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 flex items-center gap-1">
                          <Film className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
                        </span>
                      )}

                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 border border-cyan-400/20 flex items-center gap-1"
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
                    onClick={() => handleSelectProject(project)}
                    className="px-3 py-1.5 rounded-xl liquid-glass-pill hover:bg-white/20 text-white cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-mono"
                    title="Open in Project Manager"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit in Manager</span>
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
      </div>

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
      {/* High-Resolution Fullscreen Image Lightbox */}
      {previewLightboxUrl && (
        <div
          onClick={() => setPreviewLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-black">
            <button
              type="button"
              onClick={() => setPreviewLightboxUrl(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/75 text-white/80 hover:text-white border border-white/20 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewLightboxUrl}
              alt="Full resolution preview"
              className="w-full h-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
