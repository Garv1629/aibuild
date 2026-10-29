-- ==============================================================================
-- AI BUILD PORTFOLIO — PHASE 1 SUPABASE POSTGRESQL SCHEMA & MIGRATIONS
-- ==============================================================================
-- Comprehensive schema with Row Level Security (RLS), full public read permissions
-- for published content, public review submission, admin-only write permissions,
-- and persistent storage bucket setup.
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'In Progress',
  description TEXT NOT NULL,
  year TEXT NOT NULL DEFAULT '2026',
  span INTEGER NOT NULL DEFAULT 7 CHECK (span IN (5, 7)),
  image TEXT NOT NULL,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  workflow TEXT NOT NULL,
  demo_type TEXT DEFAULT 'interactive-device',
  video_url TEXT,
  video TEXT,
  video_list JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  demo_url TEXT,
  github_url TEXT,
  client_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on category, published state, and display order
CREATE INDEX IF NOT EXISTS idx_projects_published_order ON public.projects (is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects (category);

-- 3. JOURNAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  read_time TEXT NOT NULL DEFAULT '4 min read',
  date TEXT NOT NULL DEFAULT 'Oct 2026',
  image TEXT NOT NULL,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  author TEXT DEFAULT 'AI Build Studio',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_journal_published_order ON public.journal_entries (is_published, display_order);

-- 4. EXPLORATIONS TABLE
CREATE TABLE IF NOT EXISTS public.explorations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  column_number INTEGER NOT NULL DEFAULT 1 CHECK (column_number IN (1, 2)),
  rotation NUMERIC NOT NULL DEFAULT 0,
  image TEXT NOT NULL,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  video TEXT,
  video_list JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_explorations_published_order ON public.explorations (is_published, display_order);

-- 5. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  short_desc TEXT NOT NULL,
  deliverables JSONB DEFAULT '[]'::jsonb,
  tools JSONB DEFAULT '[]'::jsonb,
  badge TEXT NOT NULL DEFAULT 'Core Studio Offering',
  stats_label TEXT NOT NULL,
  stats_value TEXT NOT NULL,
  image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. CLIENT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT,
  category TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  avatar TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews (status, created_at DESC);

-- 7. SITE CONTENT & BRAND SETTINGS TABLE (Singleton or Key/Value)
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by TEXT
);

-- 8. MEDIA ASSETS TABLE (Media Library)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  storage_path TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_media_type ON public.media_assets (type, created_at DESC);

-- 9. ACTIVITY AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  title TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  details TEXT
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Projects Policies:
-- Public can only read published projects
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

-- Authenticated admins have full CRUD access
CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (true);

-- 2. Journal Entries Policies:
CREATE POLICY "Public can view published journal entries"
  ON public.journal_entries FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to journal entries"
  ON public.journal_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Explorations Policies:
CREATE POLICY "Public can view published explorations"
  ON public.explorations FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to explorations"
  ON public.explorations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Services Policies:
CREATE POLICY "Public can view all services"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to services"
  ON public.services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Reviews Policies:
-- Public can view only approved reviews
CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR auth.role() = 'authenticated');

-- Public visitors can submit a new review (always set to pending & unverified)
CREATE POLICY "Public can submit pending reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (status = 'pending' AND verified = false);

-- Admins can update or delete reviews
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Site Content Policies:
CREATE POLICY "Public can view site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Media Assets Policies:
CREATE POLICY "Public can view media assets"
  ON public.media_assets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage media assets"
  ON public.media_assets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. Activity Logs Policies:
CREATE POLICY "Admins can view activity logs"
  ON public.activity_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================

-- Create 'portfolio-media' public storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Public Read Access
CREATE POLICY "Public media access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-media');

-- Storage Policy: Authenticated Admin Upload
CREATE POLICY "Admin upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio-media');

-- Storage Policy: Authenticated Admin Delete
CREATE POLICY "Admin delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio-media');

-- ==============================================================================
-- SEED DATA (Preserving All AI Build Portfolio Content)
-- ==============================================================================

INSERT INTO public.projects (id, title, category, status, description, year, span, image, tags, features, workflow, demo_type, demo_url, github_url, is_published, display_order)
VALUES
  (
    'sri-balaji-real-estate',
    'Sri Balaji Real Estate',
    'Web Development',
    'In Progress',
    'A modern real estate website concept designed to showcase property listings through a responsive interface, contemporary visual design, smooth animations, and user-friendly navigation.',
    '2026',
    7,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    '["Responsive UI", "Property Showcase", "Vibe Coding", "Animated Elements"]'::jsonb,
    '["Responsive website architecture and navigation", "Modern UI and visual hierarchy", "Animated interface elements and filtering", "Property-focused presentation layout", "AI-assisted and vibe-coded development workflow"]'::jsonb,
    'Vite + React + GSAP + Tailwind CSS development workflow',
    'interactive-device',
    'https://sribalajirealestate.in',
    'https://github.com/Garv1629/real-estate-web',
    true,
    1
  ),
  (
    'cinematic-ai-studio',
    'AI Video & Advertising Studio',
    'AI Videos',
    'Creative Production',
    'A collection of AI-assisted creative experiments exploring product commercials, cinematic 3D product visuals, promotional scripts, and short-form video storytelling.',
    '2026',
    5,
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    '["Product Commercials", "AI Video Generation", "Cinematic B-Roll", "Storyboards"]'::jsonb,
    '["Fashion and luxury apparel commercial concepts", "Food and beverages slow-motion advertising", "Beauty and skincare promotional visuals", "Technology and AI product video experiments", "Prompt-driven camera motion and color grading"]'::jsonb,
    'Runway Gen-3 + Luma Dream Machine + Premiere Pro editing',
    'video-reel',
    'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
    NULL,
    true,
    2
  ),
  (
    'ugc-viral-creative-lab',
    'UGC Video Campaign Lab',
    'UGC Videos',
    'Creative Production',
    'Authentic user-generated content style ad creatives engineered for viral distribution on TikTok, Instagram Reels, and YouTube Shorts with proven 3-second hook structures.',
    '2026',
    5,
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    '["TikTok & Reels Ads", "Viral 3s Hooks", "Authentic UGC Style", "Unboxing & Demos"]'::jsonb,
    '["Problem-agitate-solution hook variations", "Authentic consumer testimonial pacing", "Dynamic on-screen captions and sound design", "High-CTR product unboxing and lifestyle demonstrations", "Multi-variant asset batches for paid ad testing"]'::jsonb,
    'Mobile vertical capture + CapCut Pro + AI Voice pacing',
    'ugc-player',
    NULL,
    NULL,
    true,
    3
  ),
  (
    'digital-mastery-ebooks',
    'Digital Publications & E-books',
    'E-books',
    'Prototype',
    'Bespoke digital book publishing, interactive PDF & ePub guides, high-converting lead magnets, and launch-ready 3D visual mockups for modern educators and brands.',
    '2026',
    7,
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    '["Interactive PDF/ePub", "Editorial Layout", "3D Book Covers", "Lead Magnets"]'::jsonb,
    '["Editorial typography systems and balanced grids", "Interactive table of contents and clickable resources", "High-impact 3D digital book covers and mockup kits", "Infographic data design and illustrative diagrams", "Optimized distribution formatting for mobile and tablets"]'::jsonb,
    'Adobe InDesign + Figma + Interactive PDF compilation',
    'ebook-reader',
    NULL,
    NULL,
    true,
    4
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Journal Entries
INSERT INTO public.journal_entries (id, title, slug, read_time, date, image, excerpt, category, is_published, display_order)
VALUES
  (
    'web-dev-vibe-coding',
    'Vibe Coding & Web Development: Moving from concept to working UI',
    'vibe-coding-web-development',
    '5 min read',
    'Oct 2026',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    'How prompt engineering, human-in-the-loop refinement, and iterative component assembly transform early sketches into responsive digital experiences.',
    'Web Development',
    true,
    1
  ),
  (
    'ai-videos-craft',
    'Cinematic AI Videos: Exploring generative tools and visual direction',
    'cinematic-ai-videos-craft',
    '4 min read',
    'Sep 2026',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    'Developing cinematic product visuals, camera motion choreography, and high-resolution commercial mockups with emerging generative video pipelines.',
    'AI Videos',
    true,
    2
  ),
  (
    'ugc-videos-growth',
    'The Architecture of Viral UGC Videos: Hooks, pacing, and retention',
    'architecture-viral-ugc-videos',
    '4 min read',
    'Aug 2026',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
    'Analyzing why authentic user-generated content outperforms polished commercials on TikTok and Reels, and how to craft 3-second hooks that convert.',
    'UGC Videos',
    true,
    3
  ),
  (
    'ebooks-publishing-design',
    'High-Impact E-books: Editorial typography and digital publishing',
    'high-impact-ebooks-publishing-design',
    '3 min read',
    'Jul 2026',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'Principles of digital publication design: from responsive editorial layouts and interactive PDF tables of contents to 3D launch mockup kits.',
    'E-books',
    true,
    4
  )
ON CONFLICT (id) DO NOTHING;

-- Seed 4 Core Services
INSERT INTO public.services (id, title, short_desc, deliverables, tools, badge, stats_label, stats_value, display_order)
VALUES
  (
    'web-development',
    'Web Development',
    'Modern, high-performance web applications, responsive real estate portals, animated landing pages, and clean interactive user experiences.',
    '["Responsive Website & Web App Development", "High-Converting Landing Pages & Portfolios", "Interactive Real Estate Showcase Portals", "Vibe Coding & Rapid Prototyping", "Fluid Animations (GSAP & Framer Motion)", "Mobile-First Touch & Gestural Optimization"]'::jsonb,
    '["React", "TypeScript", "Vite", "Tailwind CSS", "GSAP", "Supabase", "Cursor", "Claude"]'::jsonb,
    'Full-Stack Architecture',
    'Interface Performance',
    '99.9%',
    1
  ),
  (
    'ai-videos',
    'AI Videos & Cinematic Production',
    'High-resolution cinematic product commercials, generative 3D visual mockups, promotional scripts, and stylized video storytelling.',
    '["Generative Product Commercials & Teasers", "Cinematic Visuals & Photorealistic B-Roll", "Social Media Video Ad Campaigns", "Creative Storyboarding & Concept Directing", "Sound Design & High-End Visual Effects"]'::jsonb,
    '["Runway Gen-3", "Luma Dream Machine", "Midjourney", "Premiere Pro", "After Effects", "Topaz AI"]'::jsonb,
    'Generative Visuals',
    'Production Speedup',
    '10x Faster',
    2
  ),
  (
    'ugc-videos',
    'Viral UGC Videos',
    'Authentic user-generated content video creatives engineered for viral distribution on TikTok, Instagram Reels, and YouTube Shorts.',
    '["Viral 3-Second Problem/Solution Hooks", "Authentic Consumer Lifestyle Testimonials", "High-CTR Product Demos & Unboxings", "Dynamic Captions & Sound Design", "Multi-Variant Batches for Paid Ads (A/B)"]'::jsonb,
    '["CapCut Pro", "TikTok Creative Center", "AI Voice Pacing", "Mobile Vertical Capture"]'::jsonb,
    'Direct-Response Creative',
    'Average Watch Retention',
    '+65%',
    3
  ),
  (
    'ebooks',
    'Digital Publications & E-books',
    'Bespoke digital book publishing, interactive PDF & ePub guides, high-converting lead magnets, and launch-ready 3D visual mockups.',
    '["Complete Digital E-book Layout & Typography", "Interactive PDF with Clickable Resources", "High-Converting Lead Magnet Blueprints", "Launch-Ready 3D Digital Book Covers", "Comprehensive Infographic & Diagram Design"]'::jsonb,
    '["Adobe InDesign", "Figma", "Canva Pro", "Interactive PDF Engine", "3D Boxshot Tools"]'::jsonb,
    'Editorial Systems',
    'Reader Completion Rate',
    '94%',
    4
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Explorations
INSERT INTO public.explorations (id, title, column_number, rotation, image, category, description, is_published, display_order)
VALUES
  (
    'exp-real-estate-3d',
    'Architectural Spatial Viewer',
    1,
    -1.5,
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'Web Development',
    'Real-time interactive floor plan inspection with spatial lighting and room dimension measurements.',
    true,
    1
  ),
  (
    'exp-cinematic-reel',
    'Generative Commercial Reel',
    2,
    2.0,
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    'AI Videos',
    'Prompt-directed luxury perfume bottle reveal with synchronized volumetric lighting and slow-motion liquid.',
    true,
    2
  ),
  (
    'exp-ugc-hook-matrix',
    '3-Second Hook Variant Engine',
    1,
    1.2,
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    'UGC Videos',
    'Dynamic multi-split video asset testing 6 parallel visual hook openings for high-converting TikTok ads.',
    true,
    3
  ),
  (
    'exp-editorial-spread',
    'Swiss Modernist Publication Grid',
    2,
    -2.0,
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'E-books',
    'Experimental asymmetric editorial layout exploring modern serif headlines against modular data sidebars.',
    true,
    4
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Client Reviews
INSERT INTO public.reviews (id, name, role, company, category, rating, content, date, verified, status)
VALUES
  (
    'rev-1',
    'Rajesh Balaji',
    'Founder & Principal Director',
    'Sri Balaji Real Estate',
    'Web Development',
    5,
    'AI Build brought our property showcase to life. The speed, design aesthetic, and responsiveness exceeded our expectations completely.',
    'Oct 2026',
    true,
    'approved'
  ),
  (
    'rev-2',
    'Marcus Vance',
    'Creative Director',
    'Vance Brand Agency',
    'AI Videos',
    5,
    'The AI product commercials developed for our footwear client had cinematic fidelity that rivaled conventional $50k video shoots.',
    'Sep 2026',
    true,
    'approved'
  ),
  (
    'rev-3',
    'Sophia Chen',
    'Growth Marketing Lead',
    'Luxe Aura Cosmetics',
    'UGC Videos',
    5,
    'Our TikTok ROAS doubled after deploying the UGC hook variants created by AI Build. The 3-second pacing was remarkably effective.',
    'Aug 2026',
    true,
    'approved'
  ),
  (
    'rev-4',
    'Elena Rostova',
    'Author & Educator',
    'Digital Product Academy',
    'E-books',
    5,
    'The editorial design, interactive table of contents, and 3D cover mockups gave our digital guide instant prestige and high conversions.',
    'Jul 2026',
    true,
    'approved'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Site Content & Brand Configuration
INSERT INTO public.site_content (key, content, updated_at)
VALUES
  (
    'brand_settings',
    '{
      "brandName": "AI Build",
      "brandTagline": "Build Smarter. Create Faster. Think Beyond.",
      "githubUrl": "https://github.com/Garv1629",
      "email": "aibuild1629@gmail.com",
      "linkedinUrl": "https://linkedin.com",
      "heroDescription": "Specializing in Web Development, AI Videos, UGC Videos, and E-books. AI Build transforms concepts into high-impact digital products through modern code, creative direction, and generative media.",
      "roles": ["Web Development", "AI Videos", "UGC Videos", "E-books"]
    }'::jsonb,
    timezone('utc'::text, now())
  ),
  (
    'site_texts',
    '{
      "heroEyebrow": "AI-POWERED DIGITAL INNOVATION",
      "heroHeadline": "AI Build",
      "heroRolePrefix": "Ideas into reality through",
      "heroCtaWorks": "See Works",
      "heroCtaContact": "Reach out",
      "worksEyebrow": "Selected Work",
      "worksHeading": "Featured",
      "worksHeadingItalic": "projects",
      "worksSubtext": "Explore featured projects across Web Development, AI Videos, UGC Videos, and E-books developed through modern workflows and generative pipelines.",
      "worksButtonText": "View all work",
      "explorationsEyebrow": "Explorations",
      "explorationsHeading": "Visual",
      "explorationsHeadingItalic": "playground",
      "explorationsSubtext": "A curated gallery of live AI video experiments, high-converting UGC mockups, web interactions, and digital publication concepts.",
      "explorationsGithubText": "View GitHub",
      "journalEyebrow": "Journal & Insights",
      "journalHeading": "Recent",
      "journalHeadingItalic": "thoughts",
      "journalSubtext": "Articles and strategic breakdowns covering Web Development, AI Videos, viral UGC Videos, and digital E-book publishing.",
      "journalButtonText": "View all",
      "marqueeText": "BUILD SMARTER • CREATE FASTER • THINK BEYOND • ",
      "contactCardEyebrow": "Connect With AI Build",
      "contactCardHeading": "Have an Idea?",
      "contactCardHeadingItalic": "Let''s Build It.",
      "contactCardSubtext": "Looking for high-performance Web Development, cinematic AI Videos, authentic viral UGC Videos, or publication-ready E-books? Let''s build something exceptional together.",
      "contactCtaText": "Start a Conversation",
      "footerStatusBadge": "Accepting New Inquiries",
      "footerTagline": "Build Smarter. Create Faster. Think Beyond.",
      "footerSubtext": "Specializing in Web Development • AI Videos • UGC Videos • E-books. Concepts transformed into reality.",
      "footerCopyright": "© 2026 AI Build. All rights reserved.",
      "navAvailabilityText": "Available for projects"
    }'::jsonb,
    timezone('utc'::text, now())
  ),
  (
    'stats',
    '[
      {"value": "50+", "label": "Web Applications & Portals", "sub": "Shipped with high-performance responsive code"},
      {"value": "120+", "label": "AI & UGC Video Creatives", "sub": "Engineered for high CTR and viral distribution"},
      {"value": "35+", "label": "Digital E-books & Guides", "sub": "Designed with publication-grade editorial layouts"},
      {"value": "99.8%", "label": "Client Satisfaction Rate", "sub": "Consistently rated 5-stars across all deliverables"}
    ]'::jsonb,
    timezone('utc'::text, now())
  )
ON CONFLICT (key) DO NOTHING;
