import React, { useState, useRef, useMemo } from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';
import { ProjectItem } from '../types';
import {
  Layers,
  Smartphone,
  Film,
  Globe,
  Workflow,
  LayoutGrid,
} from 'lucide-react';
import { useSmoothScroll } from './SmoothScrollProvider';
import { normalizeProjectCategory } from '../services/adminStore';

export type ProjectDiscipline = 'ALL' | 'UGC ADS' | 'AI VIDEOS' | 'WEBSITE BUILDING' | 'AUTOMATION';

export interface DisciplineMeta {
  id: 'UGC ADS' | 'AI VIDEOS' | 'WEBSITE BUILDING' | 'AUTOMATION';
  num: string;
  title: string;
  shortTitle: string;
  tagline: string;
  turnaround: string;
  deliverables: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DISCIPLINES_DATA: DisciplineMeta[] = [
  {
    id: 'UGC ADS',
    num: '01',
    title: 'UGC ADS',
    shortTitle: 'UGC Ads',
    tagline: 'High-converting TikTok, Meta & Reels creator ads with multiple hook variations and creator-led storytelling.',
    turnaround: '3–7 days',
    deliverables: '9:16 Vertical · Hook Variations · Direct-Response Exports',
    icon: Smartphone,
  },
  {
    id: 'AI VIDEOS',
    num: '02',
    title: 'AI VIDEOS',
    shortTitle: 'AI Videos',
    tagline: 'Cinematic visual campaigns, commercial films, and product reveals generated with AI video models.',
    turnaround: '3–10 days',
    deliverables: '4K Masters · 16:9 & 9:16 · Generative Diffusion & Sound',
    icon: Film,
  },
  {
    id: 'WEBSITE BUILDING',
    num: '03',
    title: 'WEBSITE BUILDING',
    shortTitle: 'Websites',
    tagline: 'Websites that make your brand look expensive with modern React, fluid 3D WebGL, and sub-second performance.',
    turnaround: '1–3 weeks',
    deliverables: 'Next.js / Vite · Three.js 3D · 99+ Lighthouse & CMS',
    icon: Globe,
  },
  {
    id: 'AUTOMATION',
    num: '04',
    title: 'AUTOMATION',
    shortTitle: 'Automation',
    tagline: 'Intelligent multi-agent systems and custom workflows that run your operations automatically.',
    turnaround: '5–14 days',
    deliverables: 'Autonomous Agents · API Pipelines · Zero-Touch Sync',
    icon: Workflow,
  },
];

interface ProjectsSectionProps {
  projects?: ProjectItem[];
  isLoading?: boolean;
  onSelectProject?: (project: ProjectItem) => void;
  onOpenContact?: (serviceType?: string) => void;
  onOpenEstimator?: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects = [],
  isLoading = false,
  onSelectProject,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProjectDiscipline>('UGC ADS');
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();

  // Normalize project categories to ensure consistent matching
  const normalizedProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    return list
      .filter((p): p is ProjectItem => Boolean(p && typeof p === 'object'))
      .map((p) => ({
        ...p,
        category: normalizeProjectCategory(p.category),
      }));
  }, [projects]);

  // Counts per discipline
  const counts = useMemo(() => {
    return {
      'UGC ADS': normalizedProjects.filter((p) => p.category === 'UGC ADS').length,
      'AI VIDEOS': normalizedProjects.filter((p) => p.category === 'AI VIDEOS').length,
      'WEBSITE BUILDING': normalizedProjects.filter((p) => p.category === 'WEBSITE BUILDING').length,
      'AUTOMATION': normalizedProjects.filter((p) => p.category === 'AUTOMATION').length,
      ALL: normalizedProjects.length,
    };
  }, [normalizedProjects]);

  // Filtered projects for the active category
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'ALL') return normalizedProjects;
    return normalizedProjects.filter((p) => p.category === activeCategory);
  }, [normalizedProjects, activeCategory]);

  const totalCards = filteredProjects.length;

  // Switch category and smoothly scroll to top of projects section
  const handleSelectCategory = (cat: ProjectDiscipline) => {
    setActiveCategory(cat);
    if (sectionRef.current) {
      scrollTo(sectionRef.current, { offset: -20, duration: 0.8 });
    }
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full bg-[#FFFFFF] text-[#202526] px-4 sm:px-8 md:px-12 pt-8 sm:pt-14 pb-20 sm:pb-36 z-20"
    >
      {/* Top Header & Category Bar */}
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-4 pb-8 sm:pb-12 relative z-10">
        {/* Upper info row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-label-small uppercase tracking-[0.08em] text-[#202526] font-medium bg-[#F4F5F4] border border-[#E5E7EB] inline-flex items-center gap-2 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] animate-pulse" />
              <span>Selected Deployments</span>
            </div>

            <div className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-label-small uppercase tracking-[0.08em] text-[#596769] font-medium bg-[#F4F5F4] border border-[#E5E7EB] inline-flex items-center gap-1.5 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-[#202526]" />
              <span className="font-strong">{filteredProjects.length}</span>
              <span>Projects</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium text-[#596769] bg-[#F4F5F4] border border-[#E5E7EB]">
            <span>Active Category:</span>
            <span className="text-[#202526] font-bold">{activeCategory}</span>
          </div>
        </div>

        {/* Section Heading & Category Filter Bar */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal uppercase tracking-[-0.02em] text-[#202526] font-elegant">
              PROJECTS
            </h2>
            <p className="text-[#596769] text-xs sm:text-sm mt-1 max-w-lg font-sans-clean font-normal">
              Scroll down to explore case studies. Each project seamlessly stacks and overlaps as you scroll.
            </p>
          </div>

          {/* Interactive Category Selector Pill Bar */}
          <div className="p-1 sm:p-1.5 rounded-[24px] bg-white/95 backdrop-blur-xl border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {DISCIPLINES_DATA.map((disc) => {
              const Icon = disc.icon;
              const isActive = activeCategory === disc.id;
              const count = counts[disc.id] || 0;

              return (
                <button
                  key={disc.id}
                  type="button"
                  onClick={() => handleSelectCategory(disc.id)}
                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-[20px] flex items-center gap-2 transition-all duration-300 cursor-pointer shrink-0 text-left group ${
                    isActive ? 'bg-[#202526] text-white shadow-md' : 'text-[#596769] hover:text-[#202526]'
                  }`}
                >
                  <span className={`text-[10px] sm:text-xs font-mono font-medium ${isActive ? 'text-[#D8A9A8]' : 'text-[#71717A]'}`}>
                    {disc.num}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D8A9A8]' : 'text-[#596769]'}`} />
                  <span className="text-xs sm:text-sm font-label-small font-semibold uppercase tracking-wider whitespace-nowrap">
                    <span className="hidden sm:inline">{disc.title}</span>
                    <span className="sm:hidden">{disc.shortTitle}</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#F4F5F4] text-[#71717A]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* All Builds Button */}
            <button
              type="button"
              onClick={() => handleSelectCategory('ALL')}
              className={`relative px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-[20px] flex items-center gap-1.5 transition-all duration-300 cursor-pointer shrink-0 ${
                activeCategory === 'ALL'
                  ? 'bg-[#202526] text-white shadow-md'
                  : 'text-[#596769] hover:text-[#202526]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-xs font-label-small uppercase tracking-wider hidden md:inline">All</span>
              <span className="text-[10px] font-mono opacity-80">({counts.ALL})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Deck Stack Container: Fluid 120 FPS hardware-accelerated stacking */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col pt-2 sm:pt-4">
        {isLoading ? (
          <div>
            {[0, 1, 2].map((idx) => (
              <ProjectCardSkeleton key={idx} index={idx} totalCards={3} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="w-full p-12 text-center rounded-[32px] border border-[#E5E7EB] bg-white/70 backdrop-blur-md my-8">
            <p className="text-sm font-sans-clean text-[#596769]">
              No case studies found for this category yet.
            </p>
          </div>
        ) : (
          filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              totalCards={totalCards}
              onSelectProject={onSelectProject}
            />
          ))
        )}
      </div>
    </section>
  );
};

