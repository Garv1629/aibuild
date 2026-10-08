-- ==============================================================================
-- AI BUILD CMS — SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA & MIGRATIONS
-- ==============================================================================

-- 1. Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. SITE SETTINGS & HOMEPAGE CONTENT (DRAFT & PUBLISH)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  hero_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  marquee_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  about_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  services_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  character_lighting_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  draft_json JSONB DEFAULT NULL,
  publish_status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Safe migrations if table already exists
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS draft_json JSONB DEFAULT NULL;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS publish_status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- ==============================================================================
-- 3. PROJECTS / PORTFOLIO CATALOG (DRAFT, PUBLISH & SOFT DELETE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL DEFAULT '01',
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'UGC ADS',
  tagline TEXT NOT NULL DEFAULT '',
  col1_image1 TEXT NOT NULL DEFAULT '',
  col1_image2 TEXT NOT NULL DEFAULT '',
  col2_image TEXT NOT NULL DEFAULT '',
  video_url TEXT DEFAULT '',
  media_type TEXT DEFAULT 'image',
  media_items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  live_url TEXT DEFAULT '',
  tech_stack_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT true,
  aspect_ratio TEXT DEFAULT 'auto',
  display_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Safe migrations if table already exists
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deleted ON public.projects(is_deleted);

-- ==============================================================================
-- 4. REVIEWS & TESTIMONIALS (SOFT DELETE & REORDER)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Client',
  company TEXT NOT NULL DEFAULT 'Digital Studio',
  avatar TEXT NOT NULL DEFAULT '',
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  is_featured BOOLEAN DEFAULT false,
  project_referenced TEXT,
  display_order INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Safe migrations if table already exists
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON public.reviews(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_reviews_deleted ON public.reviews(is_deleted);

-- ==============================================================================
-- 5. MESSAGES & CLIENT INQUIRIES / LEADS (SOFT DELETE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  project_type TEXT NOT NULL DEFAULT 'AI Products',
  budget TEXT NOT NULL DEFAULT 'Custom Scope',
  message TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Safe migrations if table already exists
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON public.messages(is_deleted);

-- ==============================================================================
-- 6. SAVED SCOPE QUOTES / ESTIMATOR PROPOSALS (SOFT DELETE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_quotes (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT,
  service_category TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  turnaround_time TEXT NOT NULL,
  deliverables_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Safe migrations if table already exists
ALTER TABLE public.saved_quotes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.saved_quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.saved_quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON public.saved_quotes(is_deleted);

-- ==============================================================================
-- 7. ESTIMATOR SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.estimator_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_estimator',
  is_enabled BOOLEAN DEFAULT true,
  modal_title TEXT NOT NULL,
  modal_subtitle TEXT NOT NULL,
  rush_surcharge_percentage NUMERIC(5,2) DEFAULT 25.00,
  categories_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 8. SECURITY AUDIT LOGS & ADMIN AUTH
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS public.admin_auth (
  id TEXT PRIMARY KEY DEFAULT 'owner_auth',
  pin_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  lockout_until BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 9. CMS VERSION HISTORY (TIME-TRAVEL RESTORATION & AUDITING)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cms_versions (
  id TEXT PRIMARY KEY,
  version_number INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  author TEXT DEFAULT 'Executive Admin',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_cms_versions_entity ON public.cms_versions(entity_type, created_at DESC);

-- ==============================================================================
-- 10. SUPABASE STORAGE BUCKET CONFIGURATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket access policies
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "Service Role Full Access" ON storage.objects;
CREATE POLICY "Service Role Full Access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'cms-media');

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_versions ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read projects" ON public.projects;
CREATE POLICY "Public can read projects" ON public.projects FOR SELECT TO anon, authenticated USING (status = 'published' AND published = true AND (is_deleted IS NULL OR is_deleted = false));

DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (status = 'approved' AND (is_deleted IS NULL OR is_deleted = false));

DROP POLICY IF EXISTS "Public can read estimator settings" ON public.estimator_settings;
CREATE POLICY "Public can read estimator settings" ON public.estimator_settings FOR SELECT TO anon, authenticated USING (true);

-- Public insert policies
DROP POLICY IF EXISTS "Public can insert messages" ON public.messages;
CREATE POLICY "Public can insert messages" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert reviews" ON public.reviews;
CREATE POLICY "Public can insert reviews" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Service Role (Backend Server) full access policies
DROP POLICY IF EXISTS "Service role full access site_settings" ON public.site_settings;
CREATE POLICY "Service role full access site_settings" ON public.site_settings FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access projects" ON public.projects;
CREATE POLICY "Service role full access projects" ON public.projects FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access reviews" ON public.reviews;
CREATE POLICY "Service role full access reviews" ON public.reviews FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access messages" ON public.messages;
CREATE POLICY "Service role full access messages" ON public.messages FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access saved_quotes" ON public.saved_quotes;
CREATE POLICY "Service role full access saved_quotes" ON public.saved_quotes FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access estimator_settings" ON public.estimator_settings;
CREATE POLICY "Service role full access estimator_settings" ON public.estimator_settings FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access audit_logs" ON public.audit_logs;
CREATE POLICY "Service role full access audit_logs" ON public.audit_logs FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access admin_auth" ON public.admin_auth;
CREATE POLICY "Service role full access admin_auth" ON public.admin_auth FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role full access cms_versions" ON public.cms_versions;
CREATE POLICY "Service role full access cms_versions" ON public.cms_versions FOR ALL TO service_role USING (true);
