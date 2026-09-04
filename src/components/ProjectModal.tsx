import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Monitor, Cpu, ExternalLink, Video } from 'lucide-react';
import { ProjectItem } from '../types';
import { ContactButton } from './ContactButton';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenContact?: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onOpenContact,
}) => {
  // Handle body scroll locking & Escape key hygiene
  React.useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const isVideo = project.mediaType === 'video' && Boolean(project.videoUrl);

  return (
    <AnimatePresence>
      <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Frosted Backdrop with Noise Grain */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="frosted-backdrop"
        />

        {/* Modal Window with Frosted Glassmorphism and Grain */}
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-5xl frosted-modal-glass rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 md:p-10 shadow-2xl text-[#202526] z-10 my-4 sm:my-8 max-h-[92dvh] overflow-y-auto overflow-x-hidden font-sans-clean"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-[#CBDCDE] hover:bg-[#AFC7C5] text-[#202526] border border-[#B8C1C0] transition-colors cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6 sm:mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[#202526] text-xs font-strong uppercase tracking-[0.08em] bg-[#CBDCDE] border border-[#AFC7C5] flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8]" />
                  {project.category}
                </span>
                <span className="text-xs uppercase tracking-widest text-[#596769] font-strong">
                  Project {project.number}
                </span>
                {isVideo && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-strong uppercase text-[#202526] bg-[#CBDCDE] border border-[#AFC7C5] flex items-center gap-1">
                    <Video className="w-3 h-3 text-[#596769]" /> Video Demo
                  </span>
                )}
              </div>
              <h3 className="font-praise font-normal text-3xl sm:text-5xl uppercase tracking-tight text-[#202526]">
                {project.title}
              </h3>
              <p className="text-sm sm:text-base text-[#596769] mt-2 max-w-2xl font-sans-clean font-normal">
                {project.tagline ||
                  project.description ||
                  'Social-first visual creative, automated content systems, and high-impact digital experiences.'}
              </p>
            </div>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-full bg-[#202526] hover:bg-[#596769] text-[#E7EBE9] text-xs uppercase tracking-[0.08em] font-btn font-medium flex items-center gap-2 transition-all shadow-md"
              >
                <span>Visit Live Application</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Video or Image Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-8 relative z-10">
            {/* Main Primary Media */}
            <div className="md:col-span-7 rounded-[28px] overflow-hidden bg-[#CBDCDE] border border-[#AFC7C5] shadow-md relative min-h-[300px]">
              {isVideo && project.videoUrl && project.videoUrl.trim() ? (
                <video
                  src={project.videoUrl}
                  poster={project.col2Image && project.col2Image.trim() ? project.col2Image : undefined}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-[28px]"
                />
              ) : project.col2Image && project.col2Image.trim() ? (
                <img
                  src={project.col2Image}
                  alt={`${project.title} master showcase`}
                  className="w-full h-[320px] sm:h-[420px] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-[320px] sm:h-[420px] bg-[#CBDCDE] flex items-center justify-center text-[#596769]" />
              )}
            </div>

            {/* Secondary Media Column */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="rounded-[28px] overflow-hidden bg-[#CBDCDE] border border-[#AFC7C5] shadow-md flex-1 min-h-[150px]">
                {project.col1Image1 && project.col1Image1.trim() ? (
                  <img
                    src={project.col1Image1}
                    alt={`${project.title} view 1`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-[#CBDCDE]" />
                )}
              </div>
              <div className="rounded-[28px] overflow-hidden bg-[#CBDCDE] border border-[#AFC7C5] shadow-md flex-1 min-h-[150px]">
                {project.col1Image2 && project.col1Image2.trim() ? (
                  <img
                    src={project.col1Image2}
                    alt={`${project.title} view 2`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-[#CBDCDE]" />
                )}
              </div>
            </div>
          </div>

          {/* Tags if present */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-mono uppercase text-[#596769] tracking-wider font-semibold">
                Tech Stack:
              </span>
              {project.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-3 py-1 rounded-full bg-[#CBDCDE] border border-[#AFC7C5] text-xs text-[#202526] font-mono font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Specs & Tech Stack Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-5 rounded-3xl bg-[#CBDCDE] border border-[#AFC7C5] mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] flex items-center justify-center shrink-0">
                <Monitor className="w-4 h-4 text-[#596769]" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#596769] tracking-wider font-bold">Design &amp; Motion</div>
                <div className="text-xs sm:text-sm font-semibold text-[#202526]">60fps Motion / Visuals</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-[#596769]" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#596769] tracking-wider font-bold">Architecture</div>
                <div className="text-xs sm:text-sm font-semibold text-[#202526]">Full-Stack &amp; Scalable</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-[#596769]" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#596769] tracking-wider font-bold">AI Engines</div>
                <div className="text-xs sm:text-sm font-semibold text-[#202526]">Generative &amp; Agents</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E7EBE9] border border-[#B8C1C0] flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#D8A9A8]" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#596769] tracking-wider font-bold">Turnaround</div>
                <div className="text-xs sm:text-sm font-semibold text-[#202526]">3–7 Days Delivery</div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#B8C1C0] relative z-10">
            <span className="text-xs text-[#596769] uppercase tracking-widest font-mono font-bold">
              Directed by AI Build (ai.build_)
            </span>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-[#B8C1C0] hover:bg-[#CBDCDE] text-xs font-bold uppercase tracking-[0.08em] text-[#202526] transition-all cursor-pointer"
              >
                Close View
              </button>
              <ContactButton
                label="Build With Us"
                onClick={() => {
                  onClose();
                  if (onOpenContact) onOpenContact();
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

