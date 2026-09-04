export interface ServiceItem {
  number: string;
  title: string;
  description: string;
  tagline?: string;
  videoUrl?: string;
  videoPoster?: string;
  weCreate?: string[];
  process?: string[];
  turnaround?: string;
  deliverables?: string[];
}

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  category: string;
  tagline: string;
  col1Image1: string;
  col1Image2: string;
  col2Image: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  liveUrl?: string;
  techStack?: string[];
  featured?: boolean;
}

export interface WebsiteContent {
  hero: {
    headline: string;
    subtext: string;
    badgeText: string;
    subBadge: string;
    portraitUrl: string;
    portraitMediaType: 'image' | 'video';
    portraitVideoUrl?: string;
  };
  marquee: {
    row1Images: string[];
    row2Images: string[];
  };
  about: {
    heading: string;
    subPill: string;
    bio: string;
    pillars: Array<{
      id: string;
      title: string;
      subtitle: string;
      icon: 'cpu' | 'layers' | 'zap' | 'sparkles';
    }>;
    decorativeAssets: {
      moonUrl: string;
      legoUrl: string;
      shapeUrl: string;
      groupUrl: string;
    };
  };
  services: {
    heading: string;
    subheading: string;
    items: ServiceItem[];
  };
  contact: {
    email: string;
    statusBadge: string;
    ctaHeadline: string;
    ctaSubtext: string;
  };
  characterLighting?: CharacterLightingSettings;
}

export type CharacterLightingPresetId =
  | 'studio-soft'
  | 'cinematic-dramatic'
  | 'morning-light'
  | 'neon-cyber';

export interface CharacterLightingPreset {
  id: CharacterLightingPresetId;
  name: string;
  badge: string;
  description: string;
  previewColors: {
    key: string;
    rim: string;
    ambient: string;
  };
  keyLightRgba: string;
  keyLightAccentRgba: string;
  rimLightRgba: string;
  rimLightAccentRgba: string;
  diffuseRgba: string;
  baseIntensity: number;
  rimIntensity: number;
  blendMode: 'overlay' | 'soft-light' | 'screen' | 'color-dodge';
}

export interface CharacterLightingSettings {
  activePreset: CharacterLightingPresetId;
  customIntensity?: number;
  rimLightBoost?: number;
  enableSpecularHotspot?: boolean;
  enableFresnelRim?: boolean;
  enablePerformanceMode?: boolean;
  performanceModeBehavior?: 'adaptive' | 'always' | 'off';
}

export interface PublicReview {
  id: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  isFeatured: boolean;
  projectReferenced?: string;
}

export interface PublicMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
}

export interface EstimatorCategoryUgcAds {
  enabled: boolean;
  title: string;
  number: string;
  basePriceAiPersona: number;
  basePriceRealCreator: number;
  hookVariationPrice: number;
  minAds: number;
  maxAds: number;
  defaultAdCount: number;
  defaultHooks: number;
}

export interface EstimatorCategoryAiVideo {
  enabled: boolean;
  title: string;
  number: string;
  basePriceCinematic: number;
  basePriceHyper3D: number;
  spatialAudioPricePerVideo: number;
  voiceClonePricePerVideo: number;
  minVideos: number;
  maxVideos: number;
  defaultVideoCount: number;
}

export interface EstimatorCategoryWebAutomation {
  enabled: boolean;
  title: string;
  number: string;
  landingPagePriceMin: number;
  landingPagePriceMax: number;
  fullAppPriceMin: number;
  fullAppPriceMax: number;
  aiPipelinePriceMin: number;
  aiPipelinePriceMax: number;
  canvas3DAddonPrice: number;
  adminCmsAddonPrice: number;
  databaseAuthAddonPrice: number;
}

export interface EstimatorSettings {
  isEnabled: boolean; // Master enable/disable toggle for interactive scope estimator
  modalTitle: string;
  modalSubtitle: string;
  rushSurchargePercentage: number; // e.g. 25 (%)
  categories: {
    ugcAds: EstimatorCategoryUgcAds;
    aiVideo: EstimatorCategoryAiVideo;
    webAutomation: EstimatorCategoryWebAutomation;
  };
}

export interface SavedScopeQuote {
  id: string;
  clientName: string;
  clientEmail?: string;
  serviceCategory: '01 - UGC ADS' | '02 - AI VIDEOS' | '03 - WEBSITE & AUTOMATIONS';
  budgetRange: string;
  turnaroundTime: string;
  deliverables: string[];
  notes?: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
}

export type AdminTab = 'projects' | 'content' | 'reviews' | 'messages' | 'estimator' | 'security' | 'preview';
