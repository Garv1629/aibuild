import React, { useState } from 'react';
import { ProjectItem } from '../../types';
import { adminStore } from '../../services/adminStore';
import { MediaUploader } from './MediaUploader';
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
    name: 'Quantum Circuits (Glowing Logic)',
    col2Image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
    col1Image1: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Spatial Neural Mesh (Abstract Gradient)',
    col2Image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-tunnel-with-glowing-lines-41584-large.mp4',
    col1Image1: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=85',
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

  const [formData, setFormData] = useState<Omit<ProjectItem, 'id'>>({
    number: '01',
    title: '',
    category: 'AI Platform',
    tagline: '',
    col1Image1: '',
    col1Image2: '',
    col2Image: '',
    videoUrl: '',
    mediaType: 'image',
    liveUrl: '',
    techStack: ['React', 'TypeScript', 'Tailwind', 'AI API'],
    featured: true,
  });

  const [techInput, setTechInput] = useState('');

  const openNewProject = () => {
    setEditingProject(null);
    const nextNum = projects.length + 1 < 10 ? `0${projects.length + 1}` : `${projects.length + 1}`;
    setFormData({
      number: nextNum,
      title: '',
      category: 'AI Platform',
      tagline: 'AI-assisted architecture, fluid web experience, and production-grade interface systems.',
      col1Image1: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=85',
      col1Image2: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=85',
      col2Image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85',
      videoUrl: '',
      mediaType: 'image',
      liveUrl: 'https://aibuild.studio',
      techStack: ['React', 'TypeScript', 'Tailwind', 'Agentic AI'],
      featured: true,
    });
    setTechInput('React, TypeScript, Tailwind, Agentic AI');
    setIsEditorOpen(true);
  };

  const openEditProject = (project: ProjectItem) => {
    setEditingProject(project);
    setFormData({
      number: project.number,
      title: project.title,
      category: project.category,
      tagline: project.tagline || '',
      col1Image1: project.col1Image1,
      col1Image2: project.col1Image2,
      col2Image: project.col2Image,
      videoUrl: project.videoUrl || '',
      mediaType: project.mediaType || (project.videoUrl ? 'video' : 'image'),
      liveUrl: project.liveUrl || '',
      techStack: project.techStack || ['React', 'TypeScript', 'Tailwind'],
      featured: project.featured ?? true,
    });
    setTechInput((project.techStack || ['React', 'TypeScript', 'Tailwind']).join(', '));
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTech = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const projectPayload = {
      ...formData,
      techStack: parsedTech.length > 0 ? parsedTech : ['React', 'TypeScript', 'Tailwind'],
    };

    if (editingProject) {
      adminStore.updateProject(editingProject.id, projectPayload);
    } else {
      adminStore.addProject(projectPayload);
    }
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from the website?`)) {
      adminStore.deleteProject(id);
    }
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    adminStore.reorderProjects(updated);
  };

  const applyPreset = (preset: (typeof PRESET_MEDIA)[0]) => {
    setFormData({
      ...formData,
      col2Image: preset.col2Image,
      col1Image1: preset.col1Image1,
      col1Image2: preset.col1Image2,
      videoUrl: preset.videoUrl,
      mediaType: preset.videoUrl ? 'video' : 'image',
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
          className="px-5 py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Case Study
        </button>
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <div className="p-16 text-center bg-white/60 rounded-[32px] border border-dashed border-[#E5E7EB] text-[#71717A] font-sans-clean text-sm">
            No projects added yet. Click &quot;Add Case Study&quot; above to publish your first studio masterpiece!
          </div>
        ) : (
          projects.map((project, idx) => (
            <div
              key={project.id}
              className="bg-white/85 border border-[#E5E7EB] hover:border-[#D8A9A8] rounded-[28px] p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group shadow-sm hover:shadow-xl"
            >
              {/* Left Info & Thumbnail */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
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
                    {project.videoUrl && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label-small uppercase tracking-wider text-[#202526] bg-[#D8A9A8]/20 border border-[#D8A9A8]/40 flex items-center gap-1">
                        <Video className="w-2.5 h-2.5 text-[#D8A9A8]" /> Motion Enabled
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
              <div className="flex items-center gap-2 self-end md:self-center">
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
                    disabled={idx === projects.length - 1}
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

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(project.id, project.title)}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xl"
            onClick={() => setIsEditorOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-white/95 border border-white/80 rounded-[36px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.2)] z-10 my-8 max-h-[90vh] overflow-y-auto font-sans-clean text-[#202526]">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
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

            <form onSubmit={handleSave} className="space-y-6">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="AI Platform">AI Platform</option>
                    <option value="SaaS Product">SaaS Product</option>
                    <option value="Automation">Intelligent Automation</option>
                    <option value="Spatial AI">Spatial AI &amp; 3D</option>
                    <option value="Digital Experience">Digital Experience</option>
                    <option value="Design System">Design System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Live Demo Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
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

              {/* MEDIA UPLOAD SECTION */}
              <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
                  <div>
                    <span className="text-sm font-label-small font-medium uppercase tracking-wider text-[#202526] flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#D8A9A8]" />
                      Direct Media Upload (Photos &amp; Videos)
                    </span>
                    <p className="text-xs text-[#596769] mt-0.5">
                      Upload video clips and high-resolution photos directly from your local computer.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-[#202526] font-label-small flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mediaType"
                        checked={formData.mediaType === 'image'}
                        onChange={() => setFormData({ ...formData, mediaType: 'image' })}
                      />
                      Photo Mode
                    </label>
                    <label className="text-xs text-[#202526] font-label-small flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mediaType"
                        checked={formData.mediaType === 'video'}
                        onChange={() => setFormData({ ...formData, mediaType: 'video' })}
                      />
                      Video Mode
                    </label>
                  </div>
                </div>

                {/* Main Showcase Media (Col 2) */}
                {formData.mediaType === 'video' ? (
                  <div className="space-y-4">
                    <MediaUploader
                      label="Upload Showcase Video Clip (Right Column Large Box)"
                      acceptType="video"
                      value={formData.videoUrl || ''}
                      onChange={(val) => setFormData({ ...formData, videoUrl: val, mediaType: 'video' })}
                      helperText="Drag & drop or browse MP4/WebM video from your device to auto-play in the card"
                    />

                    <MediaUploader
                      label="Upload Video Fallback / Poster Photo"
                      acceptType="image"
                      value={formData.col2Image}
                      onChange={(val) => setFormData({ ...formData, col2Image: val })}
                      helperText="Displays before video loads or on low-power devices"
                    />
                  </div>
                ) : (
                  <MediaUploader
                    label="Upload Main Showcase Photo (Right Column Large Box)"
                    acceptType="image"
                    value={formData.col2Image}
                    onChange={(val) => setFormData({ ...formData, col2Image: val, mediaType: 'image' })}
                    helperText="Drag & drop or choose high-res PNG, JPG, or WebP photo from your device"
                  />
                )}

                {/* Left Detail Images 1 and 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E7EB]">
                  <MediaUploader
                    label="Detail Photo 1 (Top Left)"
                    acceptType="image"
                    value={formData.col1Image1}
                    onChange={(val) => setFormData({ ...formData, col1Image1: val })}
                    helperText="Upload supporting project detail photo"
                  />

                  <MediaUploader
                    label="Detail Photo 2 (Bottom Left)"
                    acceptType="image"
                    value={formData.col1Image2}
                    onChange={(val) => setFormData({ ...formData, col1Image2: val })}
                    helperText="Upload secondary layout photo"
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#596769] hover:text-[#202526] uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  {editingProject ? 'Update Case Study' : 'Publish Case Study'}
                </button>
              </div>
            </form>
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
                  <img
                    src={previewProject.col1Image1}
                    alt="1"
                    className="w-full h-36 object-cover rounded-2xl border border-[#E5E7EB]"
                  />
                ) : (
                  <div className="w-full h-36 bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB]" />
                )}
                {previewProject.col1Image2 && previewProject.col1Image2.trim() ? (
                  <img
                    src={previewProject.col1Image2}
                    alt="2"
                    className="w-full h-44 object-cover rounded-2xl border border-[#E5E7EB]"
                  />
                ) : (
                  <div className="w-full h-44 bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB]" />
                )}
              </div>
              <div className="md:col-span-7">
                {previewProject.videoUrl && previewProject.videoUrl.trim() && previewProject.mediaType === 'video' ? (
                  <video
                    src={previewProject.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-[336px] object-cover rounded-2xl border border-[#E5E7EB]"
                  />
                ) : previewProject.col2Image && previewProject.col2Image.trim() ? (
                  <img
                    src={previewProject.col2Image}
                    alt="showcase"
                    className="w-full h-[336px] object-cover rounded-2xl border border-[#E5E7EB]"
                  />
                ) : (
                  <div className="w-full h-[336px] bg-[#F3F4F6] rounded-2xl border border-[#E5E7EB] flex items-center justify-center text-xs text-[#71717A]">
                    No Media
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[#596769] mt-4 leading-relaxed">{previewProject.tagline}</p>
          </div>
        </div>
      )}
    </div>
  );
};
