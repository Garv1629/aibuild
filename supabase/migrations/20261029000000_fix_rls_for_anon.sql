-- ==============================================================================
-- AI BUILD STUDIO — SUPABASE RLS PERMISSIONS MIGRATION
-- ==============================================================================
-- Purpose:
-- Fix "new row violates row-level security policy for table 'projects'"
-- Allows the anon / publishable API key full write and read access so you can
-- create, edit, reorder, delete, and publish projects, journal entries,
-- visual explorations, services, reviews, site content, and media assets.
--
-- How to apply:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire script, and click "Run" (Ctrl+Enter)
-- ==============================================================================

-- 1. PROJECTS TABLE
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;

CREATE POLICY "Allow anon all on projects"
  ON public.projects
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 2. JOURNAL ENTRIES TABLE
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Admins have full access to journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Allow anon all on journal_entries" ON public.journal_entries;

CREATE POLICY "Allow anon all on journal_entries"
  ON public.journal_entries
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. EXPLORATIONS TABLE
ALTER TABLE IF EXISTS public.explorations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published explorations" ON public.explorations;
DROP POLICY IF EXISTS "Admins have full access to explorations" ON public.explorations;
DROP POLICY IF EXISTS "Allow anon all on explorations" ON public.explorations;

CREATE POLICY "Allow anon all on explorations"
  ON public.explorations
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. SERVICES TABLE
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view all services" ON public.services;
DROP POLICY IF EXISTS "Admins have full access to services" ON public.services;
DROP POLICY IF EXISTS "Allow anon all on services" ON public.services;

CREATE POLICY "Allow anon all on services"
  ON public.services
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. REVIEWS TABLE
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can submit pending reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow anon all on reviews" ON public.reviews;

CREATE POLICY "Allow anon all on reviews"
  ON public.reviews
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 6. SITE CONTENT TABLE
ALTER TABLE IF EXISTS public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;
DROP POLICY IF EXISTS "Allow anon all on site_content" ON public.site_content;

CREATE POLICY "Allow anon all on site_content"
  ON public.site_content
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 7. MEDIA ASSETS TABLE
ALTER TABLE IF EXISTS public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Admins have full access to media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Allow anon all on media_assets" ON public.media_assets;

CREATE POLICY "Allow anon all on media_assets"
  ON public.media_assets
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 8. ACTIVITY LOGS TABLE
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow anon all on activity_logs" ON public.activity_logs;

CREATE POLICY "Allow anon all on activity_logs"
  ON public.activity_logs
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 9. STORAGE (portfolio-media bucket)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    DROP POLICY IF EXISTS "Allow anon upload portfolio-media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow anon update portfolio-media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow anon delete portfolio-media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow anon select portfolio-media" ON storage.objects;

    CREATE POLICY "Allow anon select portfolio-media"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'portfolio-media');

    CREATE POLICY "Allow anon upload portfolio-media"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'portfolio-media');

    CREATE POLICY "Allow anon update portfolio-media"
      ON storage.objects FOR UPDATE
      TO anon, authenticated
      USING (bucket_id = 'portfolio-media');

    CREATE POLICY "Allow anon delete portfolio-media"
      ON storage.objects FOR DELETE
      TO anon, authenticated
      USING (bucket_id = 'portfolio-media');
  END IF;
END $$;

-- Optional Alternative: If you want to disable RLS entirely for simpler personal portfolio management:
-- ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.journal_entries DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.explorations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.site_content DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.media_assets DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
