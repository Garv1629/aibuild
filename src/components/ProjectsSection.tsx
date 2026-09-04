import React from 'react';
import { motion } from 'motion/react';
import { ProjectCard } from './ProjectCard';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';
import { ProjectItem } from '../types';
import { Layers, Sparkles } from 'lucide-react';
import { FadeIn } from './FadeIn';

interface ProjectsSectionProps {
  projects?: ProjectItem[];
  isLoading?: boolean;
  onSelectProject?: (project: ProjectItem) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects = [],
  isLoading = false,
  onSelectProject,
}) => {
  const displayProjects = projects.length > 0 ? projects : [];
  const totalCards = displayProjects.length;

  return (
    <section
      id="projects"
      className="relative w-full bg-transparent rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-20 text-[#202526] px-4 sm:px-8 md:px-12 pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-32"
    >
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-4 pb-10 sm:pb-14 relative z-10">
        <FadeIn delay={0.05} direction="bottom-up" y={15}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-full text-xs font-label-small uppercase tracking-[0.08em] text-[#202526] font-medium bg-[#F4F5F4] border border-[#E5E7EB] inline-flex items-center gap-2 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8A9A8] animate-pulse" />
                <span>Selected Deployments</span>
              </div>

              <div className="px-3 py-1.5 rounded-full text-xs font-label-small uppercase tracking-[0.08em] text-[#596769] font-medium bg-[#F4F5F4] border border-[#E5E7EB] inline-flex items-center gap-1.5 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-[#202526]" />
                <span className="font-strong">{totalCards}</span>
                <span>Verified Builds</span>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} direction="bottom-up" y={20}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal uppercase tracking-[-0.02em] text-[#202526] font-elegant">
                PROJECTS
              </h2>
              <p className="text-[#596769] text-xs sm:text-sm mt-1 max-w-lg font-sans-clean font-normal">
                Scroll to explore and stack full-stack systems, AI agents, and bespoke production deployments.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Cards Deck Stack Container: Fluid 120 FPS hardware-accelerated stacking */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col">
        {isLoading ? (
          <div>
            {[0, 1, 2].map((idx) => (
              <ProjectCardSkeleton key={idx} index={idx} totalCards={3} />
            ))}
          </div>
        ) : (
          <div>
            {displayProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                totalCards={totalCards}
                onSelectProject={onSelectProject}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
