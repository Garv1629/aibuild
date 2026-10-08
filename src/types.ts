export interface ServiceMediaItem {
  id: string;
  url: string;
  type: 'video' | 'image';
  poster?: string;
  title?: string;
  duration?: number; // duration in seconds for photos (default: 4s)
  aspectRatio?: 'auto' | '16:9' | '9:16';
}

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
  tagline?: string;
  videoUrl?: string;
  videoPoster?: string;
  mediaItems?: ServiceMediaItem[];
  weCreate?: string[];
  process?: string[];
  turnaround?: string;
  deliverables?: string[];
  displayOrder?: number;
  status?: 'published' | 'hidden' | 'draft' | 'unpublished' | 'archived';
  isHidden?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export type ContentPublishStatus = 'draft' | 'published' | 'modified';

export interface SiteSettingsAdminState {
  published: WebsiteContent;
  draft: WebsiteContent;
  current: WebsiteContent;
  status: ContentPublishStatus;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  hasDraftChanges: boolean;
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
  mediaItems?: ServiceMediaItem[];
  liveUrl?: string;
  description?: string;
  tags?: string[];
  techStack?: string[];
  featured?: boolean;
  aspectRatio?: 'auto' | '16:9' | '9:16';
  displayOrder?: number;
  status?: 'draft' | 'published' | 'unpublished' | 'hidden' | 'archived';
  published?: boolean;
  publishedAt?: string | null;
  isHidden?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
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
  status: 'approved' | 'pending' | 'rejected' | 'hidden' | 'archived';
  isFeatured: boolean;
  projectReferenced?: string;
  displayOrder?: number;
  isHidden?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
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
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
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
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'archived';
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface CmsVersionItem {
  id: string;
  versionNumber: number;
  entityType: 'site_content' | 'project' | 'review' | 'estimator' | 'services';
  entityId?: string;
  title: string;
  summary: string;
  content: any;
  author: string;
  createdAt: string;
}

export type AdminTab = 'projects' | 'content' | 'history' | 'reviews' | 'messages' | 'estimator' | 'security' | 'preview';
