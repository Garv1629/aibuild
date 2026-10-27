/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProjectVideo {
  title: string;
  url: string;
  poster?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  status: 'In Progress' | 'Prototype' | 'Creative Production' | 'Workflow Automation';
  description: string;
  year: string;
  span: 7 | 5;
  image: string;
  galleryImages?: string[];
  tags: string[];
  features: string[];
  workflow: string;
  demoType?: 'interactive-device' | 'video-reel' | 'decision-tool' | 'motion-preview' | 'ugc-player' | 'ebook-reader';
  videoUrl?: string;
  video?: string;
  videoList?: ProjectVideo[];
}

export const PROJECT_CATEGORIES = [
  'All',
  'Web Development',
  'AI Videos',
  'UGC Videos',
  'E-books',
] as const;

export type ProjectCategoryFilter = (typeof PROJECT_CATEGORIES)[number];

export interface ServiceOffering {
  id: string;
  title: string;
  shortDesc: string;
  deliverables: string[];
  tools: string[];
  badge: string;
  statsLabel: string;
  statsValue: string;
  image?: string;
  galleryImages?: string[];
  videoUrl?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  slug: string;
  readTime: string;
  date: string;
  image: string;
  galleryImages?: string[];
  videoUrl?: string;
  excerpt: string;
  category: string;
}

export interface ExplorationItem {
  id: string;
  title: string;
  column: 1 | 2;
  rotation: number;
  image: string;
  galleryImages?: string[];
  video?: string;
  videoList?: ProjectVideo[];
  category: string;
  description: string;
}

export interface BrandPrincipleStat {
  value: string;
  label: string;
  sub: string;
}

export interface SiteTexts {
  // Hero Section
  heroEyebrow: string;
  heroHeadline: string;
  heroRolePrefix: string;
  heroCtaWorks: string;
  heroCtaContact: string;

  // Selected Works Section
  worksEyebrow: string;
  worksHeading: string;
  worksHeadingItalic: string;
  worksSubtext: string;
  worksButtonText: string;

  // Visual Explorations Section
  explorationsEyebrow: string;
  explorationsHeading: string;
  explorationsHeadingItalic: string;
  explorationsSubtext: string;
  explorationsGithubText: string;

  // Journal Section
  journalEyebrow: string;
  journalHeading: string;
  journalHeadingItalic: string;
  journalSubtext: string;
  journalButtonText: string;

  // Contact & Footer Section
  marqueeText: string;
  contactCardEyebrow: string;
  contactCardHeading: string;
  contactCardHeadingItalic: string;
  contactCardSubtext: string;
  contactCtaText: string;
  footerStatusBadge: string;
  footerTagline: string;
  footerSubtext: string;
  footerCopyright: string;

  // Navbar
  navAvailabilityText: string;
}

export const DEFAULT_SITE_TEXTS: SiteTexts = {
  heroEyebrow: 'AI-POWERED DIGITAL INNOVATION',
  heroHeadline: 'AI Build',
  heroRolePrefix: 'Ideas into reality through',
  heroCtaWorks: 'See Works',
  heroCtaContact: 'Reach out',

  worksEyebrow: 'Selected Work',
  worksHeading: 'Featured',
  worksHeadingItalic: 'projects',
  worksSubtext: 'Explore featured projects across Web Development, AI Videos, UGC Videos, and E-books developed through modern workflows and generative pipelines.',
  worksButtonText: 'View all work',

  explorationsEyebrow: 'Explorations',
  explorationsHeading: 'Visual',
  explorationsHeadingItalic: 'playground',
  explorationsSubtext: 'A curated gallery of live AI video experiments, high-converting UGC mockups, web interactions, and digital publication concepts.',
  explorationsGithubText: 'View GitHub',

  journalEyebrow: 'Journal & Insights',
  journalHeading: 'Recent',
  journalHeadingItalic: 'thoughts',
  journalSubtext: 'Articles and strategic breakdowns covering Web Development, AI Videos, viral UGC Videos, and digital E-book publishing.',
  journalButtonText: 'View all',

  marqueeText: 'BUILD SMARTER • CREATE FASTER • THINK BEYOND • ',
  contactCardEyebrow: 'Connect With AI Build',
  contactCardHeading: 'Have an Idea?',
  contactCardHeadingItalic: "Let's Build It.",
  contactCardSubtext: "Looking for high-performance Web Development, cinematic AI Videos, authentic viral UGC Videos, or publication-ready E-books? Let's build something exceptional together.",
  contactCtaText: 'Start a Conversation',
  footerStatusBadge: 'Accepting New Inquiries',
  footerTagline: 'Build Smarter. Create Faster. Think Beyond.',
  footerSubtext: 'Specializing in Web Development • AI Videos • UGC Videos • E-books. Concepts transformed into reality.',
  footerCopyright: '© 2026 AI Build. All rights reserved.',

  navAvailabilityText: 'Available for projects',
};

export const BRAND_NAME = 'AI Build';
export const BRAND_TAGLINE = 'Build Smarter. Create Faster. Think Beyond.';
export const GITHUB_URL = 'https://github.com/Garv1629';

// The 4 core services explicitly provided by AI Build
export const ROLES = [
  'Web Development',
  'AI Videos',
  'UGC Videos',
  'E-books',
] as const;

export const SERVICES: ServiceOffering[] = [
  {
    id: 'web-development',
    title: 'Web Development',
    shortDesc:
      'Modern, high-performance web applications, responsive real estate portals, animated landing pages, and clean interactive user experiences.',
    deliverables: [
      'Responsive Website & Web App Development',
      'High-Converting Landing Pages & Portfolios',
      'Real Estate & Business Showcase Portals',
      'Interactive Micro-Animations & Framer Motion Effects',
      'Performance Optimization & Technical SEO',
    ],
    tools: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Next.js', 'GSAP'],
    badge: 'Code & Architecture',
    statsLabel: 'Tech Stack',
    statsValue: 'React + TS + Vite',
  },
  {
    id: 'ai-videos',
    title: 'AI Videos',
    shortDesc:
      'Cinematic AI commercial production, text-to-video / image-to-video generation, and visually arresting brand storytelling.',
    deliverables: [
      'Cinematic Product Commercials & 4K Teasers',
      'AI-Generated Visual Effects & Atmospheric B-Roll',
      'Prompt Engineering & Creative Visual Direction',
      'High-Resolution Fashion, Food & Tech Concepts',
      'Sound Design, Motion Editing & Color Grading',
    ],
    tools: ['Runway Gen-3', 'Sora / Luma', 'Midjourney', 'Premiere Pro', 'After Effects'],
    badge: 'Generative Cinema',
    statsLabel: 'Resolution',
    statsValue: '4K / 60 FPS',
  },
  {
    id: 'ugc-videos',
    title: 'UGC Videos',
    shortDesc:
      'Authentic, viral-ready user-generated content style video ads tailored for TikTok, Instagram Reels, and YouTube Shorts.',
    deliverables: [
      'High-Converting UGC Ad Creatives & Concepts',
      'Scroll-Stopping 3-Second Hooks & Dynamic Pacing',
      'Product Reviews, Unboxings & Problem-Solution Demos',
      'Platform-Optimized 9:16 Vertical Video Formats',
      'Dynamic Captions, Trending Audio & Split Testing Assets',
    ],
    tools: ['CapCut Pro', 'Mobile Rigging', 'AI Voice & Avatars', 'Meta & TikTok Ads'],
    badge: 'Viral Engagement',
    statsLabel: 'Formats',
    statsValue: '9:16 Vertical Ads',
  },
  {
    id: 'e-books',
    title: 'E-books',
    shortDesc:
      'Publication-ready digital guides, educational masterclasses, high-converting lead magnets, and bespoke editorial layouts.',
    deliverables: [
      'Editorial Book Layout & Typographic Architecture',
      'Interactive PDF & ePub Multi-Device Formats',
      'High-Impact 3D Book Covers & Launch Mockup Kits',
      'Educational Manuals, Infographics & Frameworks',
      'Lead Magnet Architecture to Drive Audience Growth',
    ],
    tools: ['Adobe InDesign', 'Figma', 'Illustrator', 'Canva Pro', 'Typography Systems'],
    badge: 'Editorial & Publishing',
    statsLabel: 'Deliverable',
    statsValue: 'Interactive PDF / ePub',
  },
];

export const LOADING_WORDS = ['Build Smarter', 'Create Faster', 'Think Beyond'] as const;

export function formatCounter(count: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(count)));
  return String(clamped).padStart(3, '0');
}

export function getNextIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

export function getRoleForIndex(index: number): string {
  const safeIndex = ((index % ROLES.length) + ROLES.length) % ROLES.length;
  return ROLES[safeIndex];
}

export function calculateScrollProgress(scrollY: number, maxScroll: number): number {
  if (maxScroll <= 0) return 0;
  return Math.max(0, Math.min(1, scrollY / maxScroll));
}

/**
 * Maps a normalized scroll progress (0..1) within a pinned container
 * to one of the total services (0..totalServices-1).
 */
export function getServiceIndexFromScroll(progress: number, totalServices: number): number {
  if (totalServices <= 1) return 0;
  if (progress <= 0) return 0;
  if (progress >= 1) return totalServices - 1;
  const raw = Math.floor(progress * totalServices);
  return Math.max(0, Math.min(raw, totalServices - 1));
}

export function filterProjects(projects: Project[], category: string): Project[] {
  if (!category || category === 'All') return projects;
  if (category === 'Web Development') {
    return projects.filter(
      (p) =>
        p.category.toLowerCase().includes('web') ||
        p.category.toLowerCase().includes('real estate')
    );
  }
  if (category === 'AI Videos') {
    return projects.filter(
      (p) =>
        p.category.toLowerCase().includes('ai video') ||
        p.category.toLowerCase().includes('commercial')
    );
  }
  if (category === 'UGC Videos') {
    return projects.filter(
      (p) =>
        p.category.toLowerCase().includes('ugc') ||
        p.category.toLowerCase().includes('social')
    );
  }
  if (category === 'E-books') {
    return projects.filter(
      (p) =>
        p.category.toLowerCase().includes('e-book') ||
        p.category.toLowerCase().includes('ebook') ||
        p.category.toLowerCase().includes('book') ||
        p.category.toLowerCase().includes('guide')
    );
  }
  return projects.filter((p) =>
    p.category.toLowerCase().includes(category.toLowerCase())
  );
}

// 4 Featured Projects mapped into the exact 7/5/5/7 Bento Grid, spotlighting each of the 4 services:
// 1. Web Development (span: 7)
// 2. AI Videos (span: 5)
// 3. UGC Videos (span: 5)
// 4. E-books (span: 7)
export const PROJECTS: Project[] = [
  {
    id: 'sri-balaji-real-estate',
    title: 'Sri Balaji Real Estate',
    category: 'Web Development',
    status: 'In Progress',
    description:
      'A modern real estate website concept designed to showcase property listings through a responsive interface, contemporary visual design, smooth animations, and user-friendly navigation.',
    year: '2026',
    span: 7,
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Responsive UI', 'Property Showcase', 'Vibe Coding', 'Animated Elements'],
    features: [
      'Responsive website architecture and navigation',
      'Modern UI and visual hierarchy',
      'Animated interface elements and filtering',
      'Property-focused presentation layout',
      'AI-assisted and vibe-coded development workflow',
    ],
    workflow: 'Vite + React + GSAP + Tailwind CSS development workflow',
    demoType: 'interactive-device',
  },
  {
    id: 'cinematic-ai-studio',
    title: 'AI Video & Advertising Studio',
    category: 'AI Videos',
    status: 'Creative Production',
    description:
      'A collection of AI-assisted creative experiments exploring product commercials, cinematic 3D product visuals, promotional scripts, and short-form video storytelling.',
    year: '2026',
    span: 5,
    image:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Product Commercials', 'AI Video Generation', 'Cinematic B-Roll', 'Storyboards'],
    features: [
      'Fashion and luxury apparel commercial concepts',
      'Food and beverages slow-motion advertising',
      'Beauty and skincare promotional visuals',
      'Technology and AI product video experiments',
      'Prompt-driven camera motion and color grading',
    ],
    workflow: 'Runway Gen-3 + Luma Dream Machine + Premiere Pro editing',
    demoType: 'video-reel',
    videoUrl: 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
  },
  {
    id: 'ugc-viral-creative-lab',
    title: 'UGC Video Campaign Lab',
    category: 'UGC Videos',
    status: 'Creative Production',
    description:
      'Authentic user-generated content style ad creatives engineered for viral distribution on TikTok, Instagram Reels, and YouTube Shorts with proven 3-second hook structures.',
    year: '2026',
    span: 5,
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    tags: ['TikTok & Reels Ads', 'Viral 3s Hooks', 'Authentic UGC Style', 'Unboxing & Demos'],
    features: [
      'Problem-agitate-solution hook variations',
      'Authentic consumer testimonial pacing',
      'Dynamic on-screen captions and sound design',
      'High-CTR product unboxing and lifestyle demonstrations',
      'Multi-variant asset batches for paid ad testing',
    ],
    workflow: 'Mobile vertical capture + CapCut Pro + AI Voice pacing',
    demoType: 'ugc-player',
  },
  {
    id: 'digital-mastery-ebooks',
    title: 'Digital Publications & E-books',
    category: 'E-books',
    status: 'Prototype',
    description:
      'Bespoke digital book publishing, interactive PDF & ePub guides, high-converting lead magnets, and launch-ready 3D visual mockups for modern educators and brands.',
    year: '2026',
    span: 7,
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Interactive PDF/ePub', 'Editorial Layout', '3D Book Covers', 'Lead Magnets'],
    features: [
      'Editorial typography systems and balanced grids',
      'Interactive table of contents and clickable resources',
      'High-impact 3D digital book covers and mockup kits',
      'Infographic data design and illustrative diagrams',
      'Optimized distribution formatting for mobile and tablets',
    ],
    workflow: 'Adobe InDesign + Figma + Interactive PDF compilation',
    demoType: 'ebook-reader',
  },
];

// 4 Journal Entries aligned with the 4 offered services
export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'web-dev-vibe-coding',
    title: 'Vibe Coding & Web Development: Moving from concept to working UI',
    slug: 'vibe-coding-web-development',
    readTime: '5 min read',
    date: 'Oct 2026',
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    excerpt:
      'How prompt engineering, human-in-the-loop refinement, and iterative component assembly transform early sketches into responsive digital experiences.',
    category: 'Web Development',
  },
  {
    id: 'ai-videos-craft',
    title: 'Cinematic AI Videos: Exploring generative tools and visual direction',
    slug: 'cinematic-ai-videos-craft',
    readTime: '4 min read',
    date: 'Sep 2026',
    image:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    excerpt:
      'Developing cinematic product visuals, camera motion choreography, and high-resolution commercial mockups with emerging generative video pipelines.',
    category: 'AI Videos',
  },
  {
    id: 'ugc-videos-growth',
    title: 'The Architecture of Viral UGC Videos: Hooks, pacing, and retention',
    slug: 'architecture-viral-ugc-videos',
    readTime: '4 min read',
    date: 'Aug 2026',
    image:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
    excerpt:
      'Analyzing why authentic user-generated content outperforms polished commercials on TikTok and Reels, and how to craft 3-second hooks that convert.',
    category: 'UGC Videos',
  },
  {
    id: 'ebooks-publishing-design',
    title: 'High-Impact E-books: Editorial typography and digital publishing',
    slug: 'high-impact-ebooks-publishing-design',
    readTime: '3 min read',
    date: 'Jul 2026',
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    excerpt:
      'Principles of digital publication design: from responsive editorial layouts and interactive PDF tables of contents to 3D launch mockup kits.',
    category: 'E-books',
  },
];

// 6 Explorations mapped into the Parallax columns covering the 4 services with background video and image media
export const EXPLORATIONS: ExplorationItem[] = [
  {
    id: 'exp-web-dev',
    title: 'Real Estate & SaaS Web Portals',
    column: 1,
    rotation: -4,
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80',
    video:
      'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31912-large.mp4',
    category: 'Web Development',
    description:
      'Interactive web interfaces, luxury real estate filter layouts, responsive grids, and fluid motion micro-interactions.',
  },
  {
    id: 'exp-ai-video-luxury',
    title: 'Fashion & Luxury AI Commercials',
    column: 2,
    rotation: 3,
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
    video:
      'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-bright-fashion-outfit-42533-large.mp4',
    category: 'AI Videos',
    description:
      'Cinematic apparel visual concepts exploring dynamic textile physics, studio lighting, and high-fashion editorial pacing.',
  },
  {
    id: 'exp-ugc-beauty',
    title: 'Skincare & Beauty UGC Ads',
    column: 1,
    rotation: -2,
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
    video:
      'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-in-vertical-position-42777-large.mp4',
    category: 'UGC Videos',
    description:
      'Authentic user-generated style concepts emphasizing natural skin textures, clean product packaging, and organic lifestyle lighting.',
  },
  {
    id: 'exp-ebook-digital',
    title: 'Digital Guides & Publication Covers',
    column: 2,
    rotation: 5,
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
    category: 'E-books',
    description:
      'Three-dimensional digital book cover mockups and kinetic typography animations for digital product launches and educational guides.',
  },
  {
    id: 'exp-ai-video-tech',
    title: 'Technology & AI Product Visuals',
    column: 1,
    rotation: 3,
    image:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80',
    video:
      'https://assets.mixkit.co/videos/preview/mixkit-futuristic-holographic-data-screen-41712-large.mp4',
    category: 'AI Videos',
    description:
      'Futuristic hardware concepts, holographic interface projections, and neural network visualization aesthetics.',
  },
  {
    id: 'exp-ugc-unboxing',
    title: 'Consumer Gadgets UGC Unboxing',
    column: 2,
    rotation: -4,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80',
    category: 'UGC Videos',
    description:
      'Fast-paced TikTok and Reels style unboxing videos, hands-on demonstrations, and high-converting problem-solution hooks.',
  },
];

// 3 Core Brand Principles
export const STATS: BrandPrincipleStat[] = [
  {
    value: 'Innovation',
    label: 'Practical AI Exploration',
    sub: 'Exploring cutting-edge web engineering and generative media models.',
  },
  {
    value: 'Execution',
    label: 'Concepts Into Reality',
    sub: 'Transforming ideas into working web apps, viral video creatives, and published e-books.',
  },
  {
    value: 'Experience',
    label: 'Human-Centered Craft',
    sub: 'Delivering responsive, aesthetically elevated, and high-converting digital assets.',
  },
];
