import {
  ProjectItem,
  WebsiteContent,
  PublicReview,
  PublicMessage,
  AdminTab,
  ServiceItem,
  ServiceMediaItem,
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
import { setIndexedDbItem, getIndexedDbItem } from './indexedDbStore';
import { isVideoMedia } from '../utils/mediaUpload';

export const normalizeProjectCategory = (
  category: string
): 'UGC ADS' | 'AI VIDEOS' | 'WEBSITE BUILDING' | 'AUTOMATION' => {
  const c = (category || '').trim().toUpperCase();
  if (c.includes('UGC') || c.includes('CREATOR') || (c.includes('AD') && !c.includes('SQUAD'))) return 'UGC ADS';
  if (c.includes('VIDEO') || c.includes('FILM') || c.includes('CINEMA') || c.includes('MOTION')) return 'AI VIDEOS';
  if (c.includes('AUTO') || c.includes('AGENT') || c.includes('BOT') || c.includes('WORKFLOW') || c.includes('PIPELINE')) return 'AUTOMATION';
  return 'WEBSITE BUILDING';
};

export const resolveProjectAspectRatio = (project: Partial<ProjectItem>): '16:9' | '9:16' => {
  // 1. Explicit user override from Admin Settings
  if (project.aspectRatio === '9:16') return '9:16';
  if (project.aspectRatio === '16:9') return '16:9';

  // 2. Check active primary media item or videoUrl
  const firstMedia = (project.mediaItems || []).find((m) => m && m.url && m.url.trim().length > 0);
  if (firstMedia?.aspectRatio === '9:16') return '9:16';
  if (firstMedia?.aspectRatio === '16:9') return '16:9';

  const primaryUrl = (firstMedia?.url || project.videoUrl || project.col2Image || '').toLowerCase();
  const primaryTitle = (firstMedia?.title || '').toLowerCase();

  // Explicit vertical markers in media URL or title
  if (
    primaryUrl.includes('vertical') ||
    primaryUrl.includes('reel') ||
    primaryUrl.includes('tiktok') ||
    primaryUrl.includes('shorts') ||
    primaryUrl.includes('9:16') ||
    primaryUrl.includes('9-16') ||
    primaryTitle.includes('vertical') ||
    primaryTitle.includes('9:16') ||
    primaryUrl.includes('43666') ||
    primaryUrl.includes('41566')
  ) {
    return '9:16';
  }

  // Explicit 16:9 / cinema / landscape markers in media URL or title
  if (
    primaryUrl.includes('16:9') ||
    primaryUrl.includes('16-9') ||
    primaryUrl.includes('cinema') ||
    primaryUrl.includes('widescreen') ||
    primaryUrl.includes('landscape') ||
    primaryUrl.includes('horizontal') ||
    primaryTitle.includes('16:9') ||
    primaryTitle.includes('cinema') ||
    primaryTitle.includes('landscape') ||
    primaryUrl.includes('31910') ||
    primaryUrl.includes('31518') ||
    primaryUrl.includes('31911') ||
    primaryUrl.includes('41584')
  ) {
    return '16:9';
  }

  // If a video URL exists and is not marked vertical, it's standard 16:9
  if (primaryUrl && isVideoMedia(primaryUrl)) {
    return '16:9';
  }

  // 3. Fallback for unconfigured initial UGC ADS items only if no media exists
  const normCat = normalizeProjectCategory(project.category || '');
  if (normCat === 'UGC ADS' && !primaryUrl) {
    return '9:16';
  }

  return '16:9';
};

export const initialProjects: ProjectItem[] = [
  // 01: UGC ADS
  {
    id: 'ugc-01',
    number: '01',
    title: 'GlowLab Direct UGC',
    category: 'UGC ADS',
    tagline: 'High-converting TikTok & Instagram Reels UGC campaign with 8 dynamic hook variations and creator-led storytelling.',
    col1Image1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-ugc1-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
        poster: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=85',
        title: 'Direct Product Demo Hook',
      },
      {
        id: 'm-ugc1-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-doing-gymnastics-exercises-in-nature-41566-large.mp4',
        poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
        title: 'Dynamic Creator Lifestyle Reel',
      },
      {
        id: 'm-ugc1-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85',
        title: 'Verified Creator Showcase',
        duration: 4,
      },
    ],
    liveUrl: 'https://instagram.com',
    aspectRatio: '9:16',
    techStack: ['9:16 Vertical', '8 Hook Variations', '4.8x ROAS', 'Direct-Response Creative'],
    featured: true,
  },
  {
    id: 'ugc-02',
    number: '02',
    title: 'Apex Fit Creator Series',
    category: 'UGC ADS',
    aspectRatio: '9:16',
    tagline: 'Viral fitness & supplement UGC creator ad package engineered for Meta and TikTok paid performance channels.',
    col1Image1: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-doing-gymnastics-exercises-in-nature-41566-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-ugc2-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-doing-gymnastics-exercises-in-nature-41566-large.mp4',
        poster: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&q=85',
        title: 'High-Impact Workout Reel',
      },
      {
        id: 'm-ugc2-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
        poster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=85',
        title: 'Supplement Unboxing & Taste Test',
      },
      {
        id: 'm-ugc2-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1000&q=85',
        title: 'Athlete Performance Stills',
        duration: 4,
      },
    ],
    liveUrl: 'https://tiktok.com',
    techStack: ['Creator Production', 'TikTok Ads', 'Meta Reels', 'Ad-Ready Exports'],
    featured: true,
  },
  {
    id: 'ugc-03',
    number: '03',
    title: 'Velox Hydration Direct UGC',
    category: 'UGC ADS',
    tagline: 'High-velocity beverage & wellness TikTok UGC with multiple creator perspectives and direct conversion hooks.',
    col1Image1: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-ugc3-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
        poster: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1400&q=85',
        title: 'Electrolyte Dissolve Test Hook',
      },
      {
        id: 'm-ugc3-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-doing-gymnastics-exercises-in-nature-41566-large.mp4',
        poster: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1000&q=85',
        title: 'Morning Routine Direct Testimonial',
      },
      {
        id: 'm-ugc3-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=85',
        title: 'Packaging & Ingredients Close-up',
        duration: 4,
      },
    ],
    liveUrl: 'https://tiktok.com',
    techStack: ['9:16 Creator Video', 'Meta Ad Export', 'Direct Response', 'A/B Hook Variations'],
    featured: true,
  },
  {
    id: 'ugc-04',
    number: '04',
    title: 'Lumora Beauty Creator Ads',
    category: 'UGC ADS',
    tagline: 'Viral unboxing, before/after demonstration & creator testimonial package built for TikTok Spark Ads.',
    col1Image1: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-doing-gymnastics-exercises-in-nature-41566-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-ugc4-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
        poster: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85',
        title: 'Skin Glow Transformation Hook',
      },
      {
        id: 'm-ugc4-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-doing-gymnastics-exercises-in-nature-41566-large.mp4',
        poster: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=85',
        title: 'Outdoor Clean Beauty Routine',
      },
      {
        id: 'm-ugc4-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1000&q=85',
        title: 'Texture & Application Macro',
        duration: 4,
      },
    ],
    liveUrl: 'https://instagram.com',
    techStack: ['TikTok Spark Ads', 'Reels Hook Engine', 'Creator Network', 'UGC Scaling'],
    featured: true,
  },

  // 02: AI VIDEOS
  {
    id: 'aiv-01',
    number: '03',
    title: 'Aura Chrono AI Commercial',
    category: 'AI VIDEOS',
    tagline: 'Cinematic luxury timepiece commercial generated end-to-end with generative AI visual models and spatial audio.',
    col1Image1: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-aiv1-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
        poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
        title: 'Neural Mechanical Core',
      },
      {
        id: 'm-aiv1-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-tunnel-with-glowing-lines-41584-large.mp4',
        poster: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
        title: 'Temporal Warp Sequence',
      },
      {
        id: 'm-aiv1-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
        title: 'Watch Bezel & Sapphire Glass Polish',
        duration: 4,
      },
    ],
    liveUrl: 'https://vimeo.com',
    techStack: ['Gen-3 Visuals', '4K Master', 'Cinematic Sound Design', 'AI Commercial'],
    featured: true,
  },
  {
    id: 'aiv-02',
    number: '04',
    title: 'NeoCyber Spatial Film',
    category: 'AI VIDEOS',
    tagline: 'Photorealistic AI automotive & concept reveal film crafted with custom diffusion pipelines and hyper-real texturing.',
    col1Image1: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-tunnel-with-glowing-lines-41584-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-aiv2-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-tunnel-with-glowing-lines-41584-large.mp4',
        poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
        title: 'Hyperspeed Aerodynamic Flow',
      },
      {
        id: 'm-aiv2-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
        poster: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=85',
        title: 'Cockpit Telemetry Synthesis',
      },
      {
        id: 'm-aiv2-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=85',
        title: 'Cyberpunk Concept Silhouette',
        duration: 4,
      },
    ],
    liveUrl: 'https://youtube.com',
    techStack: ['Diffusion VFX', '16:9 & 9:16', 'Custom LoRA', 'Virtual Production'],
    featured: true,
  },

  // 03: WEBSITE BUILDING
  {
    id: 'web-01',
    number: '05',
    title: 'TrustAI Verification Hub',
    category: 'WEBSITE BUILDING',
    tagline: 'AI trust & verification platform engineered for high-security compliance and intelligent verification.',
    col1Image1: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-web1-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
        poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85',
        title: 'Interactive Analytics & Verification UI',
      },
      {
        id: 'm-web1-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
        poster: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=85',
        title: 'Distributed Identity Validation Mesh',
      },
      {
        id: 'm-web1-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=85',
        title: 'Zero-Trust Protocol Visualizer',
        duration: 4,
      },
    ],
    liveUrl: 'https://trustai.india.mesh.network',
    techStack: ['React', 'TypeScript', 'Tailwind', 'AI Verification API'],
    featured: true,
  },
  {
    id: 'web-02',
    number: '06',
    title: 'Luminex 3D Studio',
    category: 'WEBSITE BUILDING',
    tagline: 'Award-winning interactive brand experience with 3D WebGL scenes, fluid Lenis motion, and responsive performance.',
    col1Image1: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-web2-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
        poster: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=85',
        title: '3D WebGL Interactive Architecture',
      },
      {
        id: 'm-web2-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-tunnel-with-glowing-lines-41584-large.mp4',
        poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85',
        title: 'Dynamic Lighting & Spatial Shader Canvas',
      },
      {
        id: 'm-web2-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=85',
        title: 'Responsive Mobile Fluid Canvas',
        duration: 4,
      },
    ],
    liveUrl: 'https://motionsites.ai',
    techStack: ['Three.js', 'Next.js', 'Framer Motion', 'Sub-second CDN'],
    featured: true,
  },

  // 04: AUTOMATION
  {
    id: 'aut-01',
    number: '07',
    title: 'RentOS AI Autonomous Flow',
    category: 'AUTOMATION',
    tagline: 'AI-powered rental management platform with automated lease processing and tenant intelligence.',
    col1Image1: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-aut1-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
        poster: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
        title: 'Autonomous Multi-Agent Processing Pipeline',
      },
      {
        id: 'm-aut1-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
        poster: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85',
        title: 'Instant Automated Document Extraction',
      },
      {
        id: 'm-aut1-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=85',
        title: 'Tenant Intelligence Dashboard',
        duration: 4,
      },
    ],
    liveUrl: 'https://app.rentos.cloud',
    techStack: ['Full-Stack', 'Node.js', 'Vite', 'Agentic Automation'],
    featured: true,
  },
  {
    id: 'aut-02',
    number: '08',
    title: 'GovtJob Discovery Engine',
    category: 'AUTOMATION',
    tagline: 'Automated government-job discovery, eligibility analysis & intelligent application pipeline.',
    col1Image1: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=85',
    col1Image2: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85',
    col2Image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
    mediaType: 'video',
    mediaItems: [
      {
        id: 'm-aut2-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
        poster: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
        title: 'Automated Scraping & Eligibility Parser',
      },
      {
        id: 'm-aut2-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
        poster: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=85',
        title: 'Real-Time Notification & Auto-Dispatch',
      },
      {
        id: 'm-aut2-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85',
        title: 'Application Tracking Telemetry',
        duration: 4,
      },
    ],
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
        mediaItems: [
          {
            id: 'm-ugc-1',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
            poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
            title: 'Creator Product Demonstration',
          },
          {
            id: 'm-ugc-2',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-doing-gymnastics-exercises-in-nature-41566-large.mp4',
            poster: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
            title: 'Dynamic Social Hook Creative',
          },
          {
            id: 'm-ugc-3',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
            poster: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
            title: 'High-Conversion Ad Reel',
          },
        ],
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
        mediaItems: [
          {
            id: 'm-ai-1',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
            poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
            title: 'AI Neural Pulse Cinema',
          },
          {
            id: 'm-ai-2',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-tunnel-with-glowing-lines-41584-large.mp4',
            poster: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
            title: 'Hyperspeed Latent Space Tunnel',
          },
          {
            id: 'm-ai-3',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
            poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
            title: 'Generative Sci-Fi Sequences',
          },
        ],
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
        mediaItems: [
          {
            id: 'm-web-1',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
            poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
            title: 'Interactive Web Dashboard',
          },
          {
            id: 'm-web-2',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
            poster: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
            title: 'Cloud Edge Infrastructure',
          },
          {
            id: 'm-web-3',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
            poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
            title: 'Responsive 3D Motion Prototype',
          },
        ],
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
        mediaItems: [
          {
            id: 'm-auto-1',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
            poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
            title: 'Distributed Compute Pipeline',
          },
          {
            id: 'm-auto-2',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
            poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
            title: 'Autonomous Event Routing & Webhooks',
          },
          {
            id: 'm-auto-3',
            type: 'video',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
            poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
            title: '24/7 Agent Telemetry & Self-Healing',
          },
        ],
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
      // Clean up bloated legacy storage keys to maximize available browser storage
      try {
        localStorage.removeItem('ai_build_projects_v3');
        localStorage.removeItem('ai_build_projects_v2');
        localStorage.removeItem('ai_build_content_v2');
      } catch {}

      const localProjectsTs = Number(
        localStorage.getItem('ai_build_projects_v5_ts') ||
        localStorage.getItem('ai_build_projects_v4_ts') ||
        '0'
      );
      const storedProjects =
        localStorage.getItem('ai_build_projects_v5') ||
        localStorage.getItem('ai_build_projects_v4') ||
        localStorage.getItem('ai_build_projects_v3') ||
        localStorage.getItem('ai_build_projects_v2');
      if (storedProjects) {
        try {
          const parsed = JSON.parse(storedProjects) as ProjectItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map((p) => {
              const defaultProj = initialProjects.find((d) => d.id === p.id);
              const mediaItems =
                p.mediaItems && p.mediaItems.length > 0
                  ? p.mediaItems
                  : defaultProj?.mediaItems && defaultProj.mediaItems.length > 0
                  ? defaultProj.mediaItems
                  : [
                      ...(p.videoUrl ? [{ id: `m-${p.id}-v`, type: 'video' as const, url: p.videoUrl, poster: p.col2Image, title: p.title }] : []),
                      ...(p.col2Image ? [{ id: `m-${p.id}-img`, type: 'image' as const, url: p.col2Image, title: `${p.title} Showcase`, duration: 4 }] : []),
                    ];

              return {
                ...p,
                category: normalizeProjectCategory(p.category),
                aspectRatio: p.aspectRatio || 'auto',
                mediaItems,
              };
            });

            // Guarantee every single default project from initialProjects exists
            const existingIds = new Set(normalized.map((p) => p.id));
            const missingDefaults = initialProjects.filter((p) => !existingIds.has(p.id));

            this.projects = [...normalized, ...missingDefaults];
          } else {
            this.projects = initialProjects;
          }
        } catch {
          this.projects = initialProjects;
        }
      } else {
        this.projects = initialProjects;
      }

      const localContentTs = Number(
        localStorage.getItem('ai_build_content_v5_ts') ||
        localStorage.getItem('ai_build_content_v4_ts') ||
        '0'
      );
      const storedContent =
        localStorage.getItem('ai_build_content_v5') ||
        localStorage.getItem('ai_build_content_v4') ||
        localStorage.getItem('ai_build_content_v2');
      if (storedContent) {
        try {
          const parsed = JSON.parse(storedContent);
          this.websiteContent = {
            ...initialWebsiteContent,
            ...parsed,
            hero: {
              ...initialWebsiteContent.hero,
              ...(parsed.hero || {}),
            },
            about: {
              ...initialWebsiteContent.about,
              ...(parsed.about || {}),
            },
            contact: {
              ...initialWebsiteContent.contact,
              ...(parsed.contact || {}),
            },
            marquee: {
              ...initialWebsiteContent.marquee,
              ...(parsed.marquee || {}),
            },
            characterLighting: {
              ...initialWebsiteContent.characterLighting!,
              ...(parsed.characterLighting || {}),
            },
            services: (parsed.services && Array.isArray(parsed.services.items) && parsed.services.items.length > 0)
              ? {
                  heading: parsed.services.heading || initialWebsiteContent.services.heading,
                  subheading: parsed.services.subheading ?? initialWebsiteContent.services.subheading,
                  items: parsed.services.items,
                }
              : initialWebsiteContent.services,
          };
        } catch (e) {
          console.error('Failed to parse stored content:', e);
          this.websiteContent = initialWebsiteContent;
        }
      } else {
        this.websiteContent = initialWebsiteContent;
      }

      // Check IndexedDB asynchronously for durable media & large payloads
      if (typeof window !== 'undefined') {
        getIndexedDbItem<{ timestamp?: number; content?: WebsiteContent } | WebsiteContent>('ai_build_content_v5')
          .then((dbResult) => {
            if (!dbResult) return;
            const isWrapped = dbResult && typeof dbResult === 'object' && 'timestamp' in dbResult && 'content' in dbResult;
            const dbTs = isWrapped ? (dbResult as any).timestamp : 0;
            const dbContent = isWrapped ? (dbResult as any).content : (dbResult as WebsiteContent);

            if (
              dbTs >= localContentTs &&
              dbContent &&
              dbContent.services &&
              Array.isArray(dbContent.services.items) &&
              dbContent.services.items.length > 0
            ) {
              this.websiteContent = {
                ...this.websiteContent,
                ...dbContent,
              };
              this.notifyListenersOnly();
            }
          })
          .catch(() => {});

        getIndexedDbItem<{ timestamp?: number; projects?: ProjectItem[] } | ProjectItem[]>('ai_build_projects_v5')
          .then((dbResult) => {
            if (!dbResult) return;
            const isWrapped = dbResult && typeof dbResult === 'object' && 'timestamp' in dbResult && 'projects' in dbResult;
            const dbTs = isWrapped ? (dbResult as any).timestamp : 0;
            const dbProjects = isWrapped ? (dbResult as any).projects : (dbResult as ProjectItem[]);

            if (dbTs >= localProjectsTs && Array.isArray(dbProjects) && dbProjects.length > 0) {
              this.projects = dbProjects;
              this.notifyListenersOnly();
            }
          })
          .catch(() => {});
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
    const now = Date.now();

    // 1. Projects (isolated so content quota doesn't block projects)
    try {
      localStorage.setItem('ai_build_projects_v5', JSON.stringify(this.projects));
      localStorage.setItem('ai_build_projects_v5_ts', now.toString());
    } catch (err) {
      console.warn('localStorage projects save warning (might exceed quota), storing lightweight fallback:', err);
      try {
        // Strip heavy base64 strings (>50KB) from localStorage copy so metadata & URLs always persist
        const lightweight = this.projects.map((p) => ({
          ...p,
          mediaItems: (p.mediaItems || []).map((m) => ({
            ...m,
            url: m.url && m.url.startsWith('data:') && m.url.length > 50000 ? '' : m.url,
          })),
        }));
        localStorage.setItem('ai_build_projects_v5', JSON.stringify(lightweight));
        localStorage.setItem('ai_build_projects_v5_ts', now.toString());
      } catch (innerErr) {
        console.warn('Failed to write lightweight projects to localStorage:', innerErr);
      }
    }

    // 2. Website Content
    try {
      localStorage.setItem('ai_build_content_v5', JSON.stringify(this.websiteContent));
      localStorage.setItem('ai_build_content_v5_ts', now.toString());
    } catch (err) {
      console.warn('localStorage content save warning (might exceed quota):', err);
    }

    // 3. Reviews & Messages
    try {
      localStorage.setItem('ai_build_reviews_v2', JSON.stringify(this.reviews));
      localStorage.setItem('ai_build_messages_v2', JSON.stringify(this.messages));
    } catch {}

    // 4. Quotes & Estimator Settings
    try {
      localStorage.setItem('ai_build_quotes_v2', JSON.stringify(this.savedQuotes));
      localStorage.setItem('ai_build_estimator_settings_v2', JSON.stringify(this.estimatorSettings));
    } catch {}

    // Always mirror full unpruned datasets to IndexedDB for large media support & resilient offline persistence
    setIndexedDbItem('ai_build_content_v5', { timestamp: now, content: this.websiteContent }).catch(() => {});
    setIndexedDbItem('ai_build_projects_v5', { timestamp: now, projects: this.projects }).catch(() => {});
  }

  private notifyListenersOnly() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
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

  public saveWebsiteContent(content: WebsiteContent) {
    this.updateWebsiteContent(content);
    this.saveToStorage();
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

