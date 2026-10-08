import React, { useState, useEffect, useMemo } from 'react';
import { ProjectItem, ServiceMediaItem } from '../../types';
import { adminStore } from '../../services/adminStore';
import { unsavedChanges } from '../../services/unsavedChanges';
import { MediaUploader } from './MediaUploader';
import { ProjectMediaManager } from './ProjectMediaManager';
import { ProjectSeamlessShowcase } from '../ProjectSeamlessShowcase';
import { isVideoMedia } from '../../utils/mediaUpload';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Sparkles,
  Check,
  X,
  Eye,
  Film,
  ArrowUp,
  ArrowDown,
  Upload,
  Repeat,
  RotateCcw,
  AlertTriangle,
  Archive,
  RefreshCw,
  GripVertical,
} from 'lucide-react';

// Curated high-res media presets to quickly test/apply
const PRESET_MEDIA = [
  {
    name: 'Cyber Core (3D Video/Visual)',
    col2Image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
    col1Image1: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Neural Server (Data Center)',
    col2Image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
    col1Image1: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Direct UGC Hook (Mobile 9:16)',
    col2Image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
    col1Image1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Aesthetic Spatial (Luxury Film)',
    col2Image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
    col1Image1: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=85',
  },
];

interface AdminProjectsTabProps {
  projects: ProjectItem[];
}

export const AdminProjectsTab: React.FC<AdminProjectsTabProps> = ({ projects }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [previewProject, setPreviewProject] = useState<ProjectItem | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [savedProjectName, setSavedProjectName] = useState('');
  const [toastMessage, setToastMessage] = useState('Project Saved Live! ✓');

  const defaultNewProject: Omit<ProjectItem, 'id'> = {
    number: '01',
    title: '',
    category: 'UGC ADS',
    tagline: '',
    col1Image1: '',
    col1Image2: '',
    col2Image: '',
    videoUrl: '',
    mediaType: 'image',
    mediaItems: [],
    liveUrl: '',
    techStack: ['React', 'TypeScript', 'Tailwind', 'AI API'],
    featured: true,
    aspectRatio: 'auto',
    status: 'published',
  };

  const [formData, setFormData] = useState<Omit<ProjectItem, 'id'>>(defaultNewProject);
  const [initialModalBaseline, setInitialModalBaseline] = useState<Omit<ProjectItem, 'id'>>(defaultNewProject);
  const [techInput, setTechInput] = useState('');

  // Dirty detection for project editor modal
  const isModalDirty = useMemo(() => {
    if (!isEditorOpen) return false;
    try {
      return JSON.stringify(formData) !== JSON.stringify(initialModalBaseline);
    } catch {
      return false;
    }
  }, [isEditorOpen, formData, initialModalBaseline]);

  // Synchronize unsaved changes manager with project modal dirty state
  useEffect(() => {
    if (isEditorOpen && isModalDirty) {
      unsavedChanges.setDirty('project-editor', true, {
        label: `Project: ${formData.title.trim() || 'Untitled Project'}`,
        onDiscard: () => {
          setIsEditorOpen(false);
          unsavedChanges.setDirty('project-editor', false);
        },
      });
    } else {
      unsavedChanges.setDirty('project-editor', false);
    }
    return () => {
      unsavedChanges.setDirty('project-editor', false);
    };
  }, [isEditorOpen, isModalDirty, formData.title]);

  const handleCloseModal = () => {
    if (isModalDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes in this project.\n\nAre you sure you want to close and discard your edits?'
      );
      if (!confirmed) return;
    }
    setIsEditorOpen(false);
    unsavedChanges.setDirty('project-editor', false);
  };

  const openNewProject = () => {
    setEditingProject(null);
    const nextNum = projects.length + 1 < 10 ? `0${projects.length + 1}` : `${projects.length + 1}`;
    const newProjectData: Omit<ProjectItem, 'id'> = {
      number: nextNum,
      title: '',
      category: 'UGC ADS',
      tagline: 'AI-assisted architecture, fluid web experience, and production-grade interface systems.',
      col1Image1: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=85',
      col1Image2: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=85',
      col2Image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85',
      videoUrl: '',
      mediaType: 'image',
      mediaItems: [
        {
          id: `pimg-new-1`,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85',
          title: 'Initial Showcase Visual',
          duration: 4,
        },
      ],
      liveUrl: 'https://aibuild.studio',
      techStack: ['React', 'TypeScript', 'Tailwind', 'Agentic AI'],
      featured: true,
      aspectRatio: 'auto',
      status: 'published',
    };
    setFormData(newProjectData);
    setInitialModalBaseline(newProjectData);
    setTechInput('React, TypeScript, Tailwind, Agentic AI');
    setIsEditorOpen(true);
  };

  const openEditProject = (project: ProjectItem) => {
    setEditingProject(project);

    // Pre-populate playlist with existing media if project.mediaItems is empty
    const initialItems: ServiceMediaItem[] =
      project.mediaItems && project.mediaItems.length > 0
        ? project.mediaItems
        : [
            ...(project.videoUrl && project.videoUrl.trim()
              ? [
                  {
                    id: `pvid-${project.id}-1`,
                    type: 'video' as const,
                    url: project.videoUrl.trim(),
                    poster: project.col2Image?.trim(),
                    title: `${project.title} Video Clip`,
                  },
                ]
              : []),
            ...(project.col2Image && project.col2Image.trim()
              ? [
                  {
                    id: `pimg-${project.id}-1`,
                    type: 'image' as const,
                    url: project.col2Image.trim(),
                    title: `${project.title} Main Visual`,
                    duration: 4,
                  },
                ]
              : []),
            ...(project.col1Image1 && project.col1Image1.trim()
              ? [
                  {
                    id: `pimg-${project.id}-2`,
                    type: 'image' as const,
                    url: project.col1Image1.trim(),
                    title: `${project.title} Detail Photo 1`,
                    duration: 4,
                  },
                ]
              : []),
            ...(project.col1Image2 && project.col1Image2.trim()
              ? [
                  {
                    id: `pimg-${project.id}-3`,
                    type: 'image' as const,
                    url: project.col1Image2.trim(),
                    title: `${project.title} Detail Photo 2`,
                    duration: 4,
                  },
                ]
              : []),
          ];

    const projectData: Omit<ProjectItem, 'id'> = {
      number: project.number,
      title: project.title,
      category: project.category,
      tagline: project.tagline || '',
      col1Image1: project.col1Image1,
      col1Image2: project.col1Image2,
      col2Image: project.col2Image,
      videoUrl: project.videoUrl || '',
      mediaType: project.mediaType || (project.videoUrl ? 'video' : 'image'),
      mediaItems: initialItems,
      liveUrl: project.liveUrl || '',
      techStack: project.techStack || ['React', 'TypeScript', 'Tailwind'],
      featured: project.featured ?? true,
      aspectRatio: project.aspectRatio || 'auto',
      status: project.status || 'published',
    };

    setFormData(projectData);
    setInitialModalBaseline(projectData);
    setTechInput((project.techStack || ['React', 'TypeScript', 'Tailwind']).join(', '));
    setIsEditorOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (overrideStatus?: 'published' | 'draft' | 'unpublished', e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (!formData.title.trim()) {
      alert('Please enter a project title before saving.');
      return;
    }
    const parsedTech = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const firstVideo = (formData.mediaItems || []).find((m) => m.type === 'video');
    const firstImage = (formData.mediaItems || []).find((m) => m.type === 'image');
    const targetStatus = overrideStatus || formData.status || 'published';

    const projectPayload: Omit<ProjectItem, 'id'> = {
      ...formData,
      status: targetStatus,
      published: targetStatus === 'published',
      mediaItems: formData.mediaItems || [],
      videoUrl: firstVideo ? firstVideo.url : '',
      col2Image: firstImage ? firstImage.url : (firstVideo?.poster || formData.col2Image),
      mediaType: firstVideo ? 'video' : 'image',
      techStack: parsedTech.length > 0 ? parsedTech : ['React', 'TypeScript', 'Tailwind'],
    };

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingProject) {
        await adminStore.updateProject(editingProject.id, projectPayload);
      } else {
        await adminStore.addProject(projectPayload);
      }

      setSavedProjectName(formData.title || 'Project');
      setToastMessage(targetStatus === 'published' ? 'Project Published Live! ✓' : 'Project Draft Saved! ✓');
      setSaveToast(true);
      unsavedChanges.setDirty('project-editor', false);
      setIsEditorOpen(false);
      setTimeout(() => setSaveToast(false), 4000);
    } catch (err: any) {
      // NEVER silently discard edits — modal remains open and inputs preserved
      setErrorMessage(err.message || 'Unable to save project to database. Your edits are kept intact.');
      alert(`Save Error: ${err.message || 'Unable to save project to database. Your edits are kept intact.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick action helpers
  const handleQuickPublish = async (project: ProjectItem) => {
    try {
      await adminStore.publishProject(project.id);
      setSavedProjectName(project.title);
      setToastMessage('Project Published Live! ✓');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (err: any) {
      alert(`Publish Error: ${err.message || 'Unable to publish project.'}`);
    }
  };

  const handleQuickUnpublish = async (project: ProjectItem) => {
    try {
      await adminStore.unpublishProject(project.id);
      setSavedProjectName(project.title);
      setToastMessage('Project Unpublished (Removed from Live Site)');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (err: any) {
      alert(`Unpublish Error: ${err.message || 'Unable to unpublish project.'}`);
    }
  };

  const handleQuickDraft = async (project: ProjectItem) => {
    try {
      await adminStore.draftProject(project.id);
      setSavedProjectName(project.title);
      setToastMessage('Project set to Draft mode');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (err: any) {
      alert(`Draft Error: ${err.message || 'Unable to set project to draft.'}`);
    }
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; project: ProjectItem | null; permanent: boolean }>({
    isOpen: false,
    project: null,
    permanent: false,
  });

  const activeProjects = useMemo(() => {
    return projects.filter((p) => !p.isDeleted && p.status !== 'archived');
  }, [projects]);

  const trashProjects = useMemo(() => {
    return projects.filter((p) => Boolean(p.isDeleted) || p.status === 'archived');
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let list: ProjectItem[] = [];
    if (statusFilter === 'trash') {
      list = trashProjects;
    } else if (statusFilter === 'published') {
      list = activeProjects.filter((p) => p.status === 'published');
    } else if (statusFilter === 'draft') {
      list = activeProjects.filter((p) => p.status === 'draft' || p.status === 'unpublished');
    } else {
      list = activeProjects;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tagline && p.tagline.toLowerCase().includes(q)) ||
          (p.techStack && p.techStack.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [statusFilter, activeProjects, trashProjects, searchQuery]);

  const handleConfirmDelete = async () => {
    if (!deleteModal.project) return;
    const { id, title } = deleteModal.project;
    const isPermanent = deleteModal.permanent;

    try {
      await adminStore.deleteProject(id, isPermanent);
      setDeleteModal({ isOpen: false, project: null, permanent: false });
      setSavedProjectName(title);
      setToastMessage(isPermanent ? 'Project Permanently Removed ✕' : 'Moved to Trash (Safe Delete) 🗑');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 4000);
    } catch (err: any) {
      alert(`Delete Error: ${err.message || 'Unable to complete deletion.'}`);
    }
  };

  const handleRestore = async (project: ProjectItem) => {
    try {
      await adminStore.restoreProject(project.id);
      setSavedProjectName(project.title);
      setToastMessage('Project Restored to Showcase! ✓');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 4000);
    } catch (err: any) {
      alert(`Restore Error: ${err.message || 'Unable to restore project.'}`);
    }
  };

  const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);
  const [dropTargetProjectIndex, setDropTargetProjectIndex] = useState<number | null>(null);

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredProjects.length) return;
    const updated = [...projects];
    const sourceProject = filteredProjects[index];
    const destProject = filteredProjects[targetIndex];
    const sIdx = updated.findIndex((p) => p.id === sourceProject.id);
    const dIdx = updated.findIndex((p) => p.id === destProject.id);
    if (sIdx === -1 || dIdx === -1) return;

    const temp = updated[sIdx];
    updated[sIdx] = updated[dIdx];
    updated[dIdx] = temp;
    adminStore.reorderProjects(updated);
  };

  const handleDropProject = (targetIndex: number) => {
    if (draggedProjectIndex === null || draggedProjectIndex === targetIndex) {
      setDraggedProjectIndex(null);
      setDropTargetProjectIndex(null);
      return;
    }

    const sourceProject = filteredProjects[draggedProjectIndex];
    const targetProject = filteredProjects[targetIndex];
    if (!sourceProject || !targetProject) return;

    const updated = [...projects];
    const sIdx = updated.findIndex((p) => p.id === sourceProject.id);
    const tIdx = updated.findIndex((p) => p.id === targetProject.id);
    if (sIdx === -1 || tIdx === -1) return;

    const [moved] = updated.splice(sIdx, 1);
    updated.splice(tIdx, 0, moved);

    setDraggedProjectIndex(null);
    setDropTargetProjectIndex(null);
    adminStore.reorderProjects(updated);
  };

  const applyPreset = (preset: (typeof PRESET_MEDIA)[0]) => {
    const presetMediaItems: ServiceMediaItem[] = [];
    if (preset.videoUrl) {
      presetMediaItems.push({
        id: `m-prev-${Date.now()}-1`,
        type: 'video',
        url: preset.videoUrl,
        poster: preset.col2Image,
        title: `${preset.name} Video Clip`,
      });
    }
    if (preset.col2Image) {
      presetMediaItems.push({
        id: `m-preimg-${Date.now()}-2`,
        type: 'image',
        url: preset.col2Image,
        title: `${preset.name} Main Showcase`,
        duration: 4,
      });
    }
    if (preset.col1Image1) {
      presetMediaItems.push({
        id: `m-preimg-${Date.now()}-3`,
        type: 'image',
        url: preset.col1Image1,
        title: `${preset.name} Detail Visual`,
        duration: 4,
      });
    }

    setFormData({
      ...formData,
      col2Image: preset.col2Image,
      col1Image1: preset.col1Image1,
      col1Image2: preset.col1Image2,
      videoUrl: preset.videoUrl,
      mediaType: preset.videoUrl ? 'video' : 'image',
      mediaItems: presetMediaItems,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white/85 p-6 sm:p-7 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-label-small uppercase tracking-[0.14em] text-[#D8A9A8] font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Portfolio &amp; Dynamic Media Assets
          </div>
          <h2 className="text-2xl sm:text-3xl font-elegant font-normal text-[#202526] tracking-wide">
            Projects &amp; Case Studies
          </h2>
          <p className="text-xs sm:text-[13px] text-[#596769] mt-1.5 max-w-xl leading-relaxed">
            Upload videos, high-resolution imagery, modify project metadata, and reorder showcase hierarchy for the live website.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewProject}
          className="px-5 py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Case Study
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/80 p-3 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            All Active ({activeProjects.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            Published ({activeProjects.filter((p) => p.status === 'published').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            Drafts ({activeProjects.filter((p) => p.status === 'draft' || p.status === 'unpublished').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('trash')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'trash'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-700 hover:text-rose-800 hover:bg-rose-50'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            Trash ({trashProjects.length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search projects by title, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3.5 py-1.5 text-xs text-[#202526] placeholder:text-[#596769]/50 focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="p-16 text-center bg-white/60 rounded-[32px] border border-dashed border-[#E5E7EB] text-[#71717A] font-sans-clean text-sm">
            {statusFilter === 'trash' ? (
              <div className="space-y-1">
                <p className="font-medium text-[#202526]">Trash is empty</p>
                <p className="text-xs text-[#596769]">No soft-deleted projects found. Deleted items are kept safely here for recovery.</p>
              </div>
            ) : (
              'No projects match the selected filter. Click "Add Case Study" above to create one!'
            )}
          </div>
        ) : (
          filteredProjects.map((project, idx) => {
            const isItemDeleted = Boolean(project.isDeleted) || project.status === 'archived';
            const isBeingDragged = draggedProjectIndex === idx;
            const isDropTarget = dropTargetProjectIndex === idx;
            const canDrag = !isItemDeleted && statusFilter !== 'trash' && !searchQuery.trim();

            return (
              <div
                key={project.id}
                draggable={canDrag}
                onDragStart={(e) => {
                  setDraggedProjectIndex(idx);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', project.id);
                }}
                onDragOver={(e) => {
                  if (draggedProjectIndex !== null && draggedProjectIndex !== idx) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dropTargetProjectIndex !== idx) {
                      setDropTargetProjectIndex(idx);
                    }
                  }
                }}
                onDragLeave={() => {
                  if (dropTargetProjectIndex === idx) {
                    setDropTargetProjectIndex(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropProject(idx);
                }}
                onDragEnd={() => {
                  setDraggedProjectIndex(null);
                  setDropTargetProjectIndex(null);
                }}
                className={`border rounded-[28px] p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group shadow-sm hover:shadow-xl relative ${
                  isBeingDragged ? 'opacity-40 scale-[0.98] border-dashed border-[#202526]' : ''
                } ${
                  isDropTarget ? 'ring-2 ring-[#202526] ring-offset-2 border-[#202526] bg-[#202526]/[0.02]' : ''
                } ${
                  isItemDeleted
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : 'bg-white/85 border-[#E5E7EB] hover:border-[#D8A9A8]'
                }`}
              >
                {/* Left Info & Thumbnail */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 w-full sm:w-auto">
                  {/* Drag Handle */}
                  {canDrag && (
                    <div
                      className="hidden sm:flex flex-col items-center justify-center p-2 rounded-xl text-stone-400 hover:text-[#202526] hover:bg-black/[0.04] cursor-grab active:cursor-grabbing transition-colors shrink-0 select-none group/handle"
                      title="Drag to reorder this project"
                    >
                      <GripVertical className="w-5 h-5 group-hover/handle:scale-110 transition-transform" />
                      <span className="text-[9px] font-mono font-bold text-[#596769]">#{idx + 1}</span>
                    </div>
                  )}

                  {/* Visual Thumbnail */}
                  <div className="relative w-full sm:w-44 h-30 rounded-2xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shrink-0 group-hover:border-[#D8A9A8] transition-colors shadow-inner">
                    {project.videoUrl && project.videoUrl.trim() && project.mediaType === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={project.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-label-small uppercase tracking-wider text-[#D8A9A8] flex items-center gap-1 border border-white/20">
                          <Film className="w-2.5 h-2.5" /> Video
                        </div>
                      </div>
                    ) : project.col2Image && project.col2Image.trim() ? (
                      <img
                        src={project.col2Image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#E5E7EB] flex items-center justify-center text-[10px] text-[#71717A] uppercase font-mono">
                        No Media
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-strong font-normal text-[#202526] border border-[#E5E7EB] shadow-xs">
                      {project.number}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-xs font-label-small uppercase tracking-wider font-medium text-[#202526] bg-white border border-[#E5E7EB] shadow-xs">
                        {project.category}
                      </span>

                      {/* Status Badge */}
                      {isItemDeleted ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label-small uppercase tracking-wider font-semibold text-rose-800 bg-rose-100 border border-rose-300 flex items-center gap-1.5 shadow-xs">
                          <Archive className="w-3 h-3 text-rose-600" /> In Trash (Hidden Publicly)
                        </span>
                      ) : project.status === 'draft' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label-small uppercase tracking-wider font-semibold text-amber-800 bg-amber-50 border border-amber-200 flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Draft
                        </span>
                      ) : project.status === 'unpublished' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label-small uppercase tracking-wider font-semibold text-stone-600 bg-stone-100 border border-stone-200 flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" /> Unpublished
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label-small uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Published (Live)
                        </span>
                      )}

                      {project.videoUrl && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label-small uppercase tracking-wider text-[#202526] bg-[#D8A9A8]/20 border border-[#D8A9A8]/40 flex items-center gap-1">
                          <Video className="w-2.5 h-2.5 text-[#D8A9A8]" /> Motion Enabled
                        </span>
                      )}
                      {project.mediaItems && project.mediaItems.length > 1 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label-small uppercase tracking-wider text-[#202526] bg-[#E7EBE9] border border-[#B8C1C0] flex items-center gap-1">
                          <Repeat className="w-2.5 h-2.5 text-[#D8A9A8]" />
                          {project.mediaItems.length} Clips Continuous
                        </span>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-label-small text-[#596769] hover:text-[#202526] flex items-center gap-1 transition-colors uppercase tracking-wider"
                        >
                          <ExternalLink className="w-3 h-3 text-[#D8A9A8]" /> Live Demo
                        </a>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-praise font-normal text-[#202526] tracking-wide group-hover:text-[#D8A9A8] transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-[#596769] line-clamp-2 max-w-2xl font-sans-clean leading-relaxed">
                      {project.tagline || 'Bespoke AI product and frontend experience.'}
                    </p>

                    {/* Tech stack pills */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md bg-[#F3F4F6] text-[11px] text-[#596769] font-strong border border-[#E5E7EB]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Controls & Ordering */}
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  {isItemDeleted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRestore(project)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-btn font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                        title="Restore this project back to active status"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteModal({ isOpen: true, project, permanent: true })}
                        className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-btn font-semibold uppercase tracking-wider flex items-center gap-1 border border-rose-300 transition-colors cursor-pointer"
                        title="Permanently remove project from database"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-700" /> Delete Forever
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Quick Status Toggle Button */}
                      {project.status !== 'published' ? (
                        <button
                          type="button"
                          onClick={() => handleQuickPublish(project)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-btn font-semibold uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                          title="Make project live on public website"
                        >
                          <Check className="w-3.5 h-3.5 text-white" /> Publish
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickUnpublish(project)}
                          className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-btn font-medium uppercase tracking-wider border border-stone-200 transition-colors cursor-pointer"
                          title="Unpublish (hide from public site)"
                        >
                          Unpublish
                        </button>
                      )}

                      {/* Reorder Buttons */}
                      <div className="flex items-center bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl p-1 shadow-inner">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveProject(idx, 'up')}
                          className="p-1.5 rounded-lg text-[#596769] hover:text-[#202526] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredProjects.length - 1}
                          onClick={() => moveProject(idx, 'down')}
                          className="p-1.5 rounded-lg text-[#596769] hover:text-[#202526] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewProject(project)}
                        className="p-2.5 rounded-xl bg-white hover:bg-[#F3F4F6] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] transition-colors cursor-pointer shadow-xs"
                        title="Quick Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditProject(project)}
                        className="px-3.5 py-2.5 rounded-xl bg-[#202526] hover:bg-[#111314] text-white transition-all text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#D8A9A8]" /> Edit
                      </button>

                      {/* Soft Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ isOpen: true, project, permanent: false })}
                        className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                        title="Move to Trash (Safe Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-elegant text-[#202526]">
                {deleteModal.permanent ? 'Permanently Delete Project?' : 'Move Project to Trash?'}
              </h3>
              <p className="text-xs text-[#596769] mt-1.5 leading-relaxed font-sans-clean">
                {deleteModal.permanent ? (
                  <>
                    Are you sure you want to permanently delete{' '}
                    <strong className="text-[#202526]">&quot;{deleteModal.project.title}&quot;</strong>? This
                    action cannot be undone and will permanently remove this record from the database.
                  </>
                ) : (
                  <>
                    Are you sure you want to move{' '}
                    <strong className="text-[#202526]">&quot;{deleteModal.project.title}&quot;</strong> to the Trash?
                    It will immediately disappear from the public website, but remains safely recoverable in the Trash tab anytime.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, project: null, permanent: false })}
                className="px-4 py-2 rounded-xl text-xs font-btn font-medium uppercase tracking-wider text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-btn font-semibold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-sm"
              >
                {deleteModal.permanent ? 'Permanently Delete' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xl"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-3xl bg-white/95 border border-white/80 rounded-[36px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.2)] z-10 my-8 max-h-[90vh] overflow-y-auto font-sans-clean text-[#202526]">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#71717A] hover:text-[#202526] border border-[#E5E7EB] cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-label-small uppercase tracking-[0.14em] text-[#D8A9A8] font-medium flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                {editingProject ? 'Studio Showcase Revision' : 'New Project Publication'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-elegant font-normal text-[#202526] mt-1.5">
                {editingProject ? `Edit: ${editingProject.title}` : 'Publish New Case Study'}
              </h3>
            </div>

            {/* Presets Bar */}
            <div className="mb-6 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
              <div className="text-xs font-label-small font-medium text-[#202526] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D8A9A8]" />
                1-Click Preset Layout Fillers
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_MEDIA.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#D8A9A8] text-left transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="text-xs font-medium text-[#202526] group-hover:text-[#D8A9A8] truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-[#71717A] font-label-small uppercase mt-0.5">Apply Assets</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Number / Index
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="01"
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] font-strong focus:border-[#D8A9A8] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. TrustAI Platform"
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] font-sans-clean focus:border-[#D8A9A8] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="UGC ADS">01 - UGC ADS</option>
                    <option value="AI VIDEOS">02 - AI VIDEOS</option>
                    <option value="WEBSITE BUILDING">03 - WEBSITE BUILDING</option>
                    <option value="AUTOMATION">04 - AUTOMATION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Aspect Ratio
                  </label>
                  <select
                    value={formData.aspectRatio || 'auto'}
                    onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value as 'auto' | '16:9' | '9:16' })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="auto">Auto (Match Media)</option>
                    <option value="9:16">9:16 Vertical (TikTok/Reels)</option>
                    <option value="16:9">16:9 Cinema (Landscape)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Live Demo Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, liveUrl: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] font-sans-clean focus:border-[#D8A9A8] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Tagline / Brief Description
                </label>
                <textarea
                  rows={2}
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Bespoke AI verification platform engineered for high velocity..."
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] resize-none focus:border-[#D8A9A8] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* CONTINUOUS MULTI-MEDIA ZERO-CUT PLAYLIST MANAGER */}
              <ProjectMediaManager
                projectTitle={formData.title}
                items={formData.mediaItems || []}
                onChange={(newItems) => {
                  const firstVideo = newItems.find((m) => m.type === 'video');
                  const firstImage = newItems.find((m) => m.type === 'image');
                  setFormData((prev) => ({
                    ...prev,
                    mediaItems: newItems,
                    videoUrl: firstVideo ? firstVideo.url : '',
                    col2Image: firstImage ? firstImage.url : (firstVideo?.poster || prev.col2Image),
                    mediaType: firstVideo ? 'video' : 'image',
                  }));
                }}
              />

              {/* Supporting Detail Images */}
              <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-4">
                <div className="border-b border-[#E5E7EB] pb-3">
                  <span className="text-sm font-label-small font-medium uppercase tracking-wider text-[#202526] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#D8A9A8]" />
                    Supporting Detail Views (Left Column in Card)
                  </span>
                  <p className="text-xs text-[#596769] mt-0.5">
                    Upload detail shots for the two smaller companion boxes on the left side of the project card.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MediaUploader
                    label="Detail Media 1 (Video or Image - Top Left)"
                    acceptType="both"
                    value={formData.col1Image1}
                    onChange={(val) => setFormData({ ...formData, col1Image1: val })}
                    helperText="Upload video (MP4/WebM) or image. You can replace images with videos and vice versa."
                  />

                  <MediaUploader
                    label="Detail Media 2 (Video or Image - Bottom Left)"
                    acceptType="both"
                    value={formData.col1Image2}
                    onChange={(val) => setFormData({ ...formData, col1Image2: val })}
                    helperText="Upload video (MP4/WebM) or image. You can replace images with videos and vice versa."
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Tech Stack Specifications (Comma-separated)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React, TypeScript, Motion, Tailwind, Agentic AI"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* Publish Status Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Publish Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'published' })}
                    className={`p-3 rounded-2xl border text-xs font-btn uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formData.status === 'published'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs ring-1 ring-emerald-300'
                        : 'bg-white border-[#E5E7EB] text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Published (Live)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'draft' })}
                    className={`p-3 rounded-2xl border text-xs font-btn uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formData.status === 'draft'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs ring-1 ring-amber-300'
                        : 'bg-white border-[#E5E7EB] text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Draft (Pending)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'unpublished' })}
                    className={`p-3 rounded-2xl border text-xs font-btn uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formData.status === 'unpublished'
                        ? 'bg-stone-100 border-stone-300 text-stone-800 font-bold shadow-xs ring-1 ring-stone-300'
                        : 'bg-white border-[#E5E7EB] text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-stone-400" /> Unpublished
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#596769] hover:text-[#202526] uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSave('draft', e)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-btn font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:border-stone-400 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isSaving && formData.status === 'draft' ? 'Saving Draft...' : 'Save as Draft'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSave('published', e)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-semibold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-[#D8A9A8]" />
                  <span>{isSaving && formData.status === 'published' ? 'Publishing...' : editingProject ? 'Update & Publish Live' : 'Publish Case Study Live'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans-clean">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xl"
            onClick={() => setPreviewProject(null)}
          />
          <div className="relative w-full max-w-4xl bg-white/95 border border-white/80 rounded-[36px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.2)] z-10 my-8 text-[#202526]">
            <button
              type="button"
              onClick={() => setPreviewProject(null)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#71717A] hover:text-[#202526] border border-[#E5E7EB] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl sm:text-4xl font-strong font-normal text-[#D8A9A8]">{previewProject.number}</span>
              <div>
                <span className="text-xs uppercase text-[#596769] font-label-small">
                  {previewProject.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-praise font-normal text-[#202526]">{previewProject.title}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 flex flex-col gap-4">
                {previewProject.col1Image1 && previewProject.col1Image1.trim() ? (
                  isVideoMedia(previewProject.col1Image1) ? (
                    <video
                      src={previewProject.col1Image1}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-36 object-cover rounded-2xl border border-[#E5E7EB]"
                    />
                  ) : (
                    <img
                      src={previewProject.col1Image1}
                      alt="1"
                      className="w-full h-36 object-cover rounded-2xl border border-[#E5E7EB]"
                    />
                  )
                ) : (
                  <div className="w-full h-36 bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB]" />
                )}
                {previewProject.col1Image2 && previewProject.col1Image2.trim() ? (
                  isVideoMedia(previewProject.col1Image2) ? (
                    <video
                      src={previewProject.col1Image2}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-44 object-cover rounded-2xl border border-[#E5E7EB]"
                    />
                  ) : (
                    <img
                      src={previewProject.col1Image2}
                      alt="2"
                      className="w-full h-44 object-cover rounded-2xl border border-[#E5E7EB]"
                    />
                  )
                ) : (
                  <div className="w-full h-44 bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB]" />
                )}
              </div>
              <div className="md:col-span-7">
                <ProjectSeamlessShowcase
                  project={previewProject}
                  className="w-full rounded-2xl"
                />
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[#596769] mt-4 leading-relaxed">{previewProject.tagline}</p>
          </div>
        </div>
      )}

      {/* Global Fixed Floating Notification for Project Save */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm sm:max-w-md p-4 rounded-2xl bg-[#202526] text-white border-2 border-emerald-500/60 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              {toastMessage}
            </p>
            <p className="text-[11px] text-[#CBDCDE] font-sans-clean mt-0.5">
              &quot;{savedProjectName}&quot; updated in database catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSaveToast(false)}
            className="text-[#CBDCDE] hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
