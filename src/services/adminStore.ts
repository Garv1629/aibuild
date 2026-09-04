import {
  ProjectItem,
  WebsiteContent,
  PublicReview,
  PublicMessage,
  AdminTab,
  ServiceItem,
  SavedScopeQuote,
  EstimatorSettings,
  CharacterLightingPresetId,
  CharacterLightingSettings,
} from '../types';
import {
  sanitizeInput,
  sanitizeEmail,
  verifyOwnerPasscode,
  updateOwnerPasscode,
  addAuditLog,
  initializeSecurity,
} from './security';
import { DEFAULT_LIGHTING_PRESET } from '../utils/lightingPresets';

export const initialProjects: ProjectItem[] = [
  {
    id: '01',
    number: '01',
    title: 'TrustAI India',
    category: 'AI Platform',
    tagline: 'AI trust & verification platform engineered for high-security compliance and intelligent verification.',
    col1Image1: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
    mediaType: 'image',
    liveUrl: 'https://trustai.india.mesh.network',
    techStack: ['React', 'TypeScript', 'Tailwind', 'AI Verification API'],
    featured: true,
  },
  {
    id: '02',
    number: '02',
    title: 'RentOS AI',
    category: 'SaaS Product',
    tagline: 'AI-powered rental management platform with automated lease processing and tenant intelligence.',
    col1Image1: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
    mediaType: 'image',
    liveUrl: 'https://app.rentos.cloud',
    techStack: ['Full-Stack', 'Node.js', 'Vite', 'Agentic Automation'],
    featured: true,
  },
  {
    id: '03',
    number: '03',
    title: 'GovtJob Engine',
    category: 'Automation',
    tagline: 'Automated government-job discovery, eligibility analysis & intelligent application pipeline.',
    col1Image1: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
    mediaType: 'image',
    liveUrl: 'https://stage.govtjob.engine.gov',
    techStack: ['Next.js', 'AI Extraction', 'Workflow Engine'],
    featured: true,
  },
];

export const initialWebsiteContent: WebsiteContent = {
  hero: {
    headline: 'AI BUILD',
    subtext: 'AI-POWERED EXPERIENCES & DIGITAL PRODUCTS FROM IDEA TO LAUNCH',
    badgeText: 'ai.build_',
    subBadge: 'Full-Stack & AI Agents',
    portraitUrl: 'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png',
    portraitMediaType: 'image',
  },
  marquee: {
    row1Images: [
      'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
      'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
      'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
      'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
      'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
      'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
      'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
      'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
      'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
      'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
      'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
    ],
    row2Images: [
      'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
      'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
      'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
      'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
      'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
      'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
      'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
      'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
      'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
      'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif',
    ],
  },
  about: {
    heading: 'About',
    subPill: 'Studio Philosophy & Mission',
    bio: "AI Build is an AI-first digital studio that combines modern frontend engineering, bold design direction, and artificial intelligence to dramatically compress the distance between an ambitious idea and a production-ready digital product. Let's build something incredible together!",
    pillars: [
      {
        id: '1',
        title: 'AI Native',
        subtitle: 'Agentic Workflows',
        icon: 'cpu',
      },
      {
        id: '2',
        title: 'High Craft',
        subtitle: 'Tactile UI & Motion',
        icon: 'layers',
      },
      {
        id: '3',
        title: 'Velocity',
        subtitle: 'Idea to Launch',
        icon: 'zap',
      },
    ],
    decorativeAssets: {
      moonUrl: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png',
      legoUrl: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png',
      shapeUrl: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png',
      groupUrl: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png',
    },
  },
  services: {
    heading: 'WHAT WE DO',
    subheading: 'We create. We build. We automate.',
    items: [
      {
        number: '01',
        title: 'UGC ADS',
        description: 'Ads people actually want to watch.',
        tagline: 'Performance-driven content that feels native to the feed.',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
        videoPoster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        weCreate: [
          'Product UGC',
          'Creator-style ads',
          'Hook variations',
          'Product demonstrations',
          'Testimonial-style creatives',
          'Paid social creatives',
        ],
        process: [
          'Brief',
          'Concept',
          'Script',
          'Storyboard',
          'Generate / Shoot',
          'Edit',
          'Variations',
        ],
        turnaround: '3–7 days',
        deliverables: [
          '9:16 vertical video',
          'Multiple hooks',
          'Multiple versions',
          'Ad-ready exports',
        ],
      },
      {
        number: '02',
        title: 'AI VIDEOS',
        description: 'Cinematic content, generated at the speed of an idea.',
        tagline: 'From a single idea to cinematic visual content built with AI.',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
        videoPoster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
        weCreate: [
          'Product films',
          'Cinematic ads',
          'AI commercials',
          'Social videos',
          'Brand films',
          'Concept visuals',
          'Motion sequences',
        ],
        process: [
          'Concept',
          'Visual Direction',
          'Storyboard',
          'Generation',
          'Editing',
          'Sound',
          'Final Master',
        ],
        turnaround: '3–10 days',
        deliverables: [
          '4K / 1080p',
          '9:16 · 16:9 · 1:1',
          'Social + campaign formats',
        ],
      },
      {
        number: '03',
        title: 'WEBSITE BUILDING',
        description: 'Websites that make your brand look expensive.',
        tagline: 'High-performance interactive websites engineered with modern React, motion, and AI integrations.',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
        videoPoster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
        weCreate: [
          'Conversion landing pages',
          'Interactive Web3/AI web apps',
          'Custom headless CMS setups',
          'High-speed bespoke frontend',
          '3D & interactive animations',
          'Full-stack integrations',
        ],
        process: [
          'Discovery & Wireframing',
          'UI/UX Architecture',
          'Interactive Prototyping',
          'Production Codebase',
          'Speed & SEO Optimization',
          'Global CDN Deployment',
        ],
        turnaround: '1–3 weeks',
        deliverables: [
          'Production React / Next / Vite codebase',
          'Responsive mobile-first build',
          'Lighthouse 95+ performance',
          'Self-hosted CMS control',
        ],
      },
      {
        number: '04',
        title: 'AUTOMATIONS',
        description: 'Less repetitive work. More things getting done.',
        tagline: 'Intelligent multi-agent systems and custom workflows that run your operations automatically.',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
        videoPoster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
        weCreate: [
          'Autonomous agent workflows',
          'CRM & pipeline synchronization',
          'LLM content & lead pipelines',
          'Custom API webhooks',
          'Customer support AI bots',
          'Internal ops tooling',
        ],
        process: [
          'Workflow Audit',
          'Architecture Blueprint',
          'Agent & API Pipeline Build',
          'Testing & Edge-case Handling',
          'Deployment & Monitoring',
          'Knowledge Base Sync',
        ],
        turnaround: '5–14 days',
        deliverables: [
          'End-to-end automated pipelines',
          'Real-time telemetry & alerts',
          'Documentation & training',
          'Zero-downtime failovers',
        ],
      },
    ],
  },
  contact: {
    email: 'hello@aibuild.studio',
    statusBadge: 'Studio Accepting Q3/Q4 Projects',
    ctaHeadline: "Let's Build",
    ctaSubtext: 'Have an AI product, bespoke web experience, or automated system to engineer? Let’s talk.',
  },
  characterLighting: {
    activePreset: DEFAULT_LIGHTING_PRESET,
    customIntensity: 1.0,
    rimLightBoost: 1.0,
    enableSpecularHotspot: true,
    enableFresnelRim: true,
    enablePerformanceMode: true,
    performanceModeBehavior: 'adaptive',
  },
};

export const initialReviews: PublicReview[] = [
  {
    id: 'rev-1',
    author: 'Alexandre Renard',
    role: 'Founder & CEO',
    company: 'HyperQuant AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'The speed and visual fidelity produced by AI Build is extraordinary. They turned our complex AI risk engine concept into a jaw-dropping web product in under 3 weeks.',
    date: 'August 24, 2026',
    status: 'approved',
    isFeatured: true,
    projectReferenced: 'TrustAI India',
  },
  {
    id: 'rev-2',
    author: 'Elena Rostova',
    role: 'Head of Product',
    company: 'Vanguard Zurich',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'Flawless execution! The tactile feel, buttery smooth scroll physics, and custom design tokens exceeded every internal benchmark. Our clients love the portal.',
    date: 'August 18, 2026',
    status: 'approved',
    isFeatured: true,
    projectReferenced: 'RentOS AI',
  },
  {
    id: 'rev-3',
    author: 'Kenji Takahashi',
    role: 'Engineering Director',
    company: 'NeoTokyo Mesh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'Outstanding technical rigor. Their agentic pipeline and custom UI components delivered production-grade reliability on Day 1.',
    date: 'August 12, 2026',
    status: 'approved',
    isFeatured: true,
    projectReferenced: 'GovtJob Engine',
  },
  {
    id: 'rev-4',
    author: 'Sophia Chen',
    role: 'Design Principal',
    company: 'Aetheria Labs',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'True craftsmanship. The typography pairings and dark mode atmospheric glow make the entire product feel like luxury high-fashion hardware.',
    date: 'August 05, 2026',
    status: 'approved',
    isFeatured: true,
  },
  {
    id: 'rev-5',
    author: 'Marcus Vance',
    role: 'Managing Director',
    company: 'Summit Capital',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 4,
    comment: 'Very impressive turn-around time and crisp UI interactions. Looking forward to our next AI ecosystem launch with them.',
    date: 'July 29, 2026',
    status: 'approved',
    isFeatured: false,
  },
];

export const initialMessages: PublicMessage[] = [
  {
    id: 'msg-1',
    name: 'Siddharth Rao',
    email: 'siddharth@hyperquant.ai',
    company: 'HyperQuant Technologies',
    projectType: '01 - AI Products & Autonomous Agents',
    budget: '$25,000 - $50,000+',
    message: 'We require a real-time autonomous financial agent with multi-modal voice processing and automated risk auditing.',
    date: 'Today at 10:45 AM',
    status: 'unread',
  },
  {
    id: 'msg-2',
    name: 'Marcus Vance',
    email: 'marcus@vanguardcapital.ch',
    company: 'Vanguard Private Equity Zurich',
    projectType: '03 - Intelligent Web & Mobile Ecosystems',
    budget: '$50,000+',
    message: 'Need a top-tier bespoke investor portal with institutional security, interactive charts, and live biometric signature flow.',
    date: 'Yesterday at 3:20 PM',
    status: 'read',
  },
  {
    id: 'msg-3',
    name: 'Clara Dupond',
    email: 'clara@lumiere-paris.fr',
    company: 'Lumière Studio Paris',
    projectType: '02 - Bespoke Digital Experiences',
    budget: '$15,000 - $25,000',
    message: 'Looking for a high-end luxury e-commerce experience with fluid motion, custom 3D web shaders, and seamless checkout.',
    date: 'Aug 28, 2026',
    status: 'replied',
  },
  {
    id: 'msg-4',
    name: 'Sarah Jenkins',
    email: 'sarah@beaconhealth.co',
    company: 'Beacon Health USA',
    projectType: '01 - AI Products & Autonomous Agents',
    budget: '$50,000+',
    message: 'HIPAA-compliant medical triage conversational assistant with real-time patient queue orchestration.',
    date: 'Aug 25, 2026',
    status: 'read',
  },
];

export const initialSavedQuotes: SavedScopeQuote[] = [
  {
    id: 'sq-101',
    clientName: 'Sarah Jenkins',
    clientEmail: 's.jenkins@nexusfintech.io',
    serviceCategory: '02 - AI VIDEOS',
    budgetRange: '$4,800 – $6,400',
    turnaroundTime: '6 – 9 Business Days',
    deliverables: [
      '3x 30s Cinematic AI Video Master(s)',
      'Bespoke Spatial Audio & Foley Soundscape',
      'Neural Voice Clone & Multilingual Dubbing',
      'Ad-Ready 4K Resolution & Multi-Aspect Exports',
    ],
    notes: 'For Series A launch campaign trailer across TikTok & YouTube.',
    createdAt: 'Aug 29, 2026',
    status: 'sent',
  },
  {
    id: 'sq-102',
    clientName: 'Marcus Vance',
    clientEmail: 'marcus@lumina.design',
    serviceCategory: '03 - WEBSITE & AUTOMATIONS',
    budgetRange: '$12,500 – $18,000',
    turnaroundTime: '12 – 18 Business Days',
    deliverables: [
      'Full-Stack React Web Application with Scalable Architecture',
      '3D WebGL / Interactive Canvas Experience',
      'Custom Owner CMS & Media Management Suite',
      'Cloud Database & Secure Multi-Role Auth',
    ],
    notes: 'Bespoke immersive portfolio and customer self-service portal.',
    createdAt: 'Aug 27, 2026',
    status: 'accepted',
  },
];

export const initialEstimatorSettings: EstimatorSettings = {
  isEnabled: true,
  modalTitle: 'Scope Estimator & Pricing Simulator',
  modalSubtitle: 'Configure your project deliverables, assets, fidelity, and timeline to receive an instant commercial scope estimate.',
  rushSurchargePercentage: 25,
  categories: {
    ugcAds: {
      enabled: true,
      title: 'UGC Performance Ads',
      number: '01',
      basePriceAiPersona: 650,
      basePriceRealCreator: 1100,
      hookVariationPrice: 180,
      minAds: 1,
      maxAds: 12,
      defaultAdCount: 4,
      defaultHooks: 3,
    },
    aiVideo: {
      enabled: true,
      title: 'Cinematic AI & 3D Video',
      number: '02',
      basePriceCinematic: 1400,
      basePriceHyper3D: 2200,
      spatialAudioPricePerVideo: 350,
      voiceClonePricePerVideo: 250,
      minVideos: 1,
      maxVideos: 10,
      defaultVideoCount: 2,
    },
    webAutomation: {
      enabled: true,
      title: 'Web Platforms & AI Automation',
      number: '03',
      landingPagePriceMin: 3800,
      landingPagePriceMax: 6500,
      fullAppPriceMin: 7500,
      fullAppPriceMax: 14000,
      aiPipelinePriceMin: 9500,
      aiPipelinePriceMax: 18500,
      canvas3DAddonPrice: 1200,
      adminCmsAddonPrice: 800,
      databaseAuthAddonPrice: 1100,
    },
  },
};

export interface AdminStoreState {
  projects: ProjectItem[];
  websiteContent: WebsiteContent;
  reviews: PublicReview[];
  messages: PublicMessage[];
  savedQuotes: SavedScopeQuote[];
  estimatorSettings: EstimatorSettings;
}

class AdminDataStore {
  private projects: ProjectItem[] = [];
  private websiteContent: WebsiteContent = initialWebsiteContent;
  private reviews: PublicReview[] = [];
  private messages: PublicMessage[] = [];
  private savedQuotes: SavedScopeQuote[] = [];
  private estimatorSettings: EstimatorSettings = initialEstimatorSettings;
  private listeners: Array<(state: AdminStoreState) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  public getState(): AdminStoreState {
    return {
      projects: this.projects,
      websiteContent: this.websiteContent,
      reviews: this.reviews,
      messages: this.messages,
      savedQuotes: this.savedQuotes,
      estimatorSettings: this.estimatorSettings,
    };
  }

  private loadFromStorage() {
    try {
      const storedProjects = localStorage.getItem('ai_build_projects_v2');
      this.projects = storedProjects ? JSON.parse(storedProjects) : initialProjects;

      const storedContent = localStorage.getItem('ai_build_content_v2');
      if (storedContent) {
        const parsed = JSON.parse(storedContent);
        const mergedServicesItems = (parsed.services?.items || initialWebsiteContent.services.items).map(
          (item: ServiceItem, idx: number) => {
            const defaultItem: ServiceItem | undefined = initialWebsiteContent.services.items[idx];
            return {
              ...defaultItem,
              ...item,
              weCreate: item.weCreate || defaultItem?.weCreate,
              process: item.process || defaultItem?.process,
              turnaround: item.turnaround || defaultItem?.turnaround,
              deliverables: item.deliverables || defaultItem?.deliverables,
              tagline: item.tagline || defaultItem?.tagline,
            };
          }
        );

        this.websiteContent = {
          ...initialWebsiteContent,
          ...parsed,
          services: {
            heading: parsed.services?.heading || initialWebsiteContent.services.heading,
            subheading: parsed.services?.subheading || initialWebsiteContent.services.subheading,
            items: mergedServicesItems,
          },
        };
      } else {
        this.websiteContent = initialWebsiteContent;
      }

      const storedReviews = localStorage.getItem('ai_build_reviews_v2');
      this.reviews = storedReviews ? JSON.parse(storedReviews) : initialReviews;

      const storedMessages = localStorage.getItem('ai_build_messages_v2');
      this.messages = storedMessages ? JSON.parse(storedMessages) : initialMessages;

      const storedQuotes = localStorage.getItem('ai_build_quotes_v2');
      this.savedQuotes = storedQuotes ? JSON.parse(storedQuotes) : initialSavedQuotes;

      const storedEstimatorSettings = localStorage.getItem('ai_build_estimator_settings_v2');
      if (storedEstimatorSettings) {
        const parsedSettings = JSON.parse(storedEstimatorSettings);
        this.estimatorSettings = {
          ...initialEstimatorSettings,
          ...parsedSettings,
          categories: {
            ugcAds: {
              ...initialEstimatorSettings.categories.ugcAds,
              ...(parsedSettings.categories?.ugcAds || {}),
            },
            aiVideo: {
              ...initialEstimatorSettings.categories.aiVideo,
              ...(parsedSettings.categories?.aiVideo || {}),
            },
            webAutomation: {
              ...initialEstimatorSettings.categories.webAutomation,
              ...(parsedSettings.categories?.webAutomation || {}),
            },
          },
        };
      } else {
        this.estimatorSettings = initialEstimatorSettings;
      }
    } catch {
      this.projects = initialProjects;
      this.websiteContent = initialWebsiteContent;
      this.reviews = initialReviews;
      this.messages = initialMessages;
      this.savedQuotes = initialSavedQuotes;
      this.estimatorSettings = initialEstimatorSettings;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('ai_build_projects_v2', JSON.stringify(this.projects));
      localStorage.setItem('ai_build_content_v2', JSON.stringify(this.websiteContent));
      localStorage.setItem('ai_build_reviews_v2', JSON.stringify(this.reviews));
      localStorage.setItem('ai_build_messages_v2', JSON.stringify(this.messages));
      localStorage.setItem('ai_build_quotes_v2', JSON.stringify(this.savedQuotes));
      localStorage.setItem('ai_build_estimator_settings_v2', JSON.stringify(this.estimatorSettings));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  private notify() {
    this.saveToStorage();
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  public subscribe(listener: (state: AdminStoreState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // --- OWNER SECURITY & AUTH ENGINE ---
  public async validateOwnerPin(enteredPin: string): Promise<boolean> {
    return await verifyOwnerPasscode(enteredPin);
  }

  public async setOwnerPin(currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
    return await updateOwnerPasscode(currentPin, newPin);
  }

  // --- PROJECTS API ---
  public getProjects(): ProjectItem[] {
    return [...this.projects];
  }

  public addProject(project: Omit<ProjectItem, 'id'> | ProjectItem) {
    const id = 'id' in project && project.id ? project.id : `proj-${Date.now()}`;
    const newProject: ProjectItem = {
      ...project,
      id,
      number: project.number || `0${this.projects.length + 1}`,
      tagline: project.tagline || 'Engineered with bespoke AI architecture & fluid motion.',
    };
    this.projects = [newProject, ...this.projects];
    this.notify();
    return newProject;
  }

  public updateProject(id: string, updates: Partial<ProjectItem>) {
    this.projects = this.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.notify();
  }

  public deleteProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.notify();
  }

  public reorderProjects(newOrder: ProjectItem[]) {
    this.projects = newOrder;
    this.notify();
  }

  // --- WEBSITE CONTENT API ---
  public getWebsiteContent(): WebsiteContent {
    return { ...this.websiteContent };
  }

  public updateWebsiteContent(updates: Partial<WebsiteContent>) {
    this.websiteContent = {
      ...this.websiteContent,
      ...updates,
      hero: { ...this.websiteContent.hero, ...(updates.hero || {}) },
      about: { ...this.websiteContent.about, ...(updates.about || {}) },
      contact: { ...this.websiteContent.contact, ...(updates.contact || {}) },
      marquee: { ...this.websiteContent.marquee, ...(updates.marquee || {}) },
      services: updates.services
        ? {
            heading: updates.services.heading ?? this.websiteContent.services?.heading ?? 'WHAT WE DO',
            subheading: updates.services.subheading ?? this.websiteContent.services?.subheading ?? '',
            items: updates.services.items ?? this.websiteContent.services?.items ?? [],
          }
        : this.websiteContent.services,
      characterLighting: {
        ...(this.websiteContent.characterLighting || initialWebsiteContent.characterLighting!),
        ...(updates.characterLighting || {}),
      },
    };
    this.notify();
  }

  // --- 3D CHARACTER LIGHTING PRESETS API ---
  public getCharacterLighting(): CharacterLightingSettings {
    return this.websiteContent.characterLighting || initialWebsiteContent.characterLighting!;
  }

  public updateLightingPreset(
    presetId: CharacterLightingPresetId,
    customOptions?: Partial<CharacterLightingSettings>
  ) {
    const currentLighting = this.getCharacterLighting();
    const newLighting: CharacterLightingSettings = {
      ...currentLighting,
      ...customOptions,
      activePreset: presetId,
    };
    this.updateWebsiteContent({
      characterLighting: newLighting,
    });
    addAuditLog('CONTENT_UPDATE', `3D Character lighting preset set to "${presetId}"`, 'info');
    return newLighting;
  }

  // --- PUBLIC REVIEWS & RATINGS API ---
  public getReviews(): PublicReview[] {
    return [...this.reviews];
  }

  public getApprovedReviews(): PublicReview[] {
    return this.reviews.filter((r) => r.status === 'approved');
  }

  public getAverageRating(): { average: number; count: number; breakdown: Record<number, number> } {
    const approved = this.getApprovedReviews();
    if (approved.length === 0) return { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    const sum = approved.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / approved.length).toFixed(1));
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approved.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      breakdown[rounded] = (breakdown[rounded] || 0) + 1;
    });
    return { average, count: approved.length, breakdown };
  }

  public addReview(review: Omit<PublicReview, 'id' | 'date'> & { date?: string }) {
    const newRev: PublicReview = {
      ...review,
      id: `rev-${Date.now()}`,
      author: sanitizeInput(review.author || 'Verified Client', 80),
      role: sanitizeInput(review.role || 'Client', 80),
      company: sanitizeInput(review.company || 'Digital Studio', 80),
      comment: sanitizeInput(review.comment || '', 1000),
      date: review.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: review.status || 'approved',
      isFeatured: review.isFeatured ?? false,
    };
    this.reviews = [newRev, ...this.reviews];
    this.notify();
    return newRev;
  }

  public updateReview(id: string, updates: Partial<PublicReview>) {
    this.reviews = this.reviews.map((r) =>
      r.id === id
        ? {
            ...r,
            ...updates,
            author: updates.author ? sanitizeInput(updates.author, 80) : r.author,
            role: updates.role ? sanitizeInput(updates.role, 80) : r.role,
            company: updates.company ? sanitizeInput(updates.company, 80) : r.company,
            comment: updates.comment ? sanitizeInput(updates.comment, 1000) : r.comment,
          }
        : r
    );
    this.notify();
  }

  public deleteReview(id: string) {
    this.reviews = this.reviews.filter((r) => r.id !== id);
    this.notify();
  }

  // --- PUBLIC MESSAGES / INQUIRIES API ---
  public getMessages(): PublicMessage[] {
    return [...this.messages];
  }

  public addMessage(msg: Omit<PublicMessage, 'id' | 'date' | 'status'> & { date?: string }) {
    const newMsg: PublicMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      name: sanitizeInput(msg.name || 'Direct Visitor', 80),
      email: sanitizeEmail(msg.email || ''),
      company: sanitizeInput(msg.company || 'Private Client', 80),
      projectType: sanitizeInput(msg.projectType || 'AI Products', 120),
      budget: sanitizeInput(msg.budget || 'Custom Scope', 60),
      message: sanitizeInput(msg.message || '', 2000),
      date: msg.date || 'Just now',
      status: 'unread',
    };
    this.messages = [newMsg, ...this.messages];
    this.notify();
    return newMsg;
  }

  public updateMessageStatus(id: string, status: PublicMessage['status']) {
    this.messages = this.messages.map((m) => (m.id === id ? { ...m, status } : m));
    this.notify();
  }

  public deleteMessage(id: string) {
    this.messages = this.messages.filter((m) => m.id !== id);
    this.notify();
  }

  // --- SAVED SCOPE QUOTES / ESTIMATOR PROPOSALS API ---
  public getSavedQuotes(): SavedScopeQuote[] {
    return [...this.savedQuotes];
  }

  public addSavedQuote(quote: Omit<SavedScopeQuote, 'id' | 'createdAt'> & { createdAt?: string }) {
    const newQuote: SavedScopeQuote = {
      ...quote,
      id: `sq-${Date.now()}`,
      clientName: sanitizeInput(quote.clientName || 'Unnamed Client', 80),
      clientEmail: quote.clientEmail ? sanitizeEmail(quote.clientEmail) : undefined,
      serviceCategory: quote.serviceCategory || '01 - UGC ADS',
      budgetRange: sanitizeInput(quote.budgetRange || '$5,000 – $10,000', 60),
      turnaroundTime: sanitizeInput(quote.turnaroundTime || '5 – 10 Business Days', 60),
      deliverables: quote.deliverables || [],
      notes: quote.notes ? sanitizeInput(quote.notes, 1000) : '',
      createdAt: quote.createdAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: quote.status || 'draft',
    };
    this.savedQuotes = [newQuote, ...this.savedQuotes];
    this.notify();
    return newQuote;
  }

  public updateSavedQuote(id: string, updates: Partial<SavedScopeQuote>) {
    this.savedQuotes = this.savedQuotes.map((q) =>
      q.id === id
        ? {
            ...q,
            ...updates,
            clientName: updates.clientName ? sanitizeInput(updates.clientName, 80) : q.clientName,
            clientEmail: updates.clientEmail ? sanitizeEmail(updates.clientEmail) : q.clientEmail,
            notes: updates.notes !== undefined ? sanitizeInput(updates.notes, 1000) : q.notes,
          }
        : q
    );
    this.notify();
  }

  public deleteSavedQuote(id: string) {
    this.savedQuotes = this.savedQuotes.filter((q) => q.id !== id);
    this.notify();
  }

  // --- ESTIMATOR CMS CONFIGURATION API ---
  public getEstimatorSettings(): EstimatorSettings {
    return { ...this.estimatorSettings };
  }

  public updateEstimatorSettings(updates: Partial<EstimatorSettings>) {
    this.estimatorSettings = {
      ...this.estimatorSettings,
      ...updates,
      categories: {
        ...this.estimatorSettings.categories,
        ...(updates.categories || {}),
        ugcAds: {
          ...this.estimatorSettings.categories.ugcAds,
          ...(updates.categories?.ugcAds || {}),
        },
        aiVideo: {
          ...this.estimatorSettings.categories.aiVideo,
          ...(updates.categories?.aiVideo || {}),
        },
        webAutomation: {
          ...this.estimatorSettings.categories.webAutomation,
          ...(updates.categories?.webAutomation || {}),
        },
      },
    };
    addAuditLog('CONTENT_UPDATE', 'Interactive Scope Estimator settings & pricing rates updated', 'info');
    this.notify();
  }

  public resetEstimatorSettings() {
    this.estimatorSettings = initialEstimatorSettings;
    addAuditLog('CONTENT_UPDATE', 'Scope Estimator settings restored to default rates', 'warning');
    this.notify();
  }

  // --- RESET DEFAULTS ---
  public resetToDefaults() {
    this.projects = initialProjects;
    this.websiteContent = initialWebsiteContent;
    this.reviews = initialReviews;
    this.messages = initialMessages;
    this.savedQuotes = initialSavedQuotes;
    this.estimatorSettings = initialEstimatorSettings;
    addAuditLog('DATA_RESET', 'Website content & database restored to factory defaults', 'critical');
    this.notify();
  }
}

// Auto-initialize security subsystem
initializeSecurity();

export const adminStore = new AdminDataStore();

/**
 * Web Audio API synthesizer for studio tactile interaction sounds
 */
export function playStudioChime(type: 'click' | 'success' | 'alert' = 'click') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // AudioContext blocked or not supported in environment
  }
}

