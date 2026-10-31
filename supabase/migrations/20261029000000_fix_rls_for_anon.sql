-- ==============================================================================
-- AI BUILD STUDIO — PRODUCTION ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Authoritative Studio Owner UUID: 8426bca9-cb3b-47a2-997b-f362634ea46d
-- Strict Production Security Enforcement:
-- 1. Anonymous / public visitors can ONLY read published content and submit pending reviews.
-- 2. Services, site content, and media assets are publicly readable portfolio catalog items.
-- 3. Only the authoritative studio owner (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d')
--    can create, update, delete, or publish content, view drafts, manage reviews, or upload/delete media.
-- 4. Generic 'TO authenticated USING (true)' administrative policies are strictly revoked.
-- ==============================================================================

-- 1. PROJECTS TABLE
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admins have full access to projects" ON public.projects;
DROP POLICY IF EXISTS "AI Build owner manages projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;

-- Public can view published projects; owner can view all (including unpublished drafts)
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  USING (is_published = true OR auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- Only authoritative studio owner has write access
CREATE POLICY "AI Build owner manages projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- 2. JOURNAL ENTRIES TABLE
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on journal_entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Admins have full access to journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "AI Build owner manages journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Public can view published journal entries" ON public.journal_entries;

CREATE POLICY "Public can view published journal entries"
  ON public.journal_entries FOR SELECT
  USING (is_published = true OR auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

CREATE POLICY "AI Build owner manages journal entries"
  ON public.journal_entries FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- 3. EXPLORATIONS TABLE
ALTER TABLE IF EXISTS public.explorations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on explorations" ON public.explorations;
DROP POLICY IF EXISTS "Admins have full access to explorations" ON public.explorations;
DROP POLICY IF EXISTS "AI Build owner manages explorations" ON public.explorations;
DROP POLICY IF EXISTS "Public can view published explorations" ON public.explorations;

CREATE POLICY "Public can view published explorations"
  ON public.explorations FOR SELECT
  USING (is_published = true OR auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

CREATE POLICY "AI Build owner manages explorations"
  ON public.explorations FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- 4. SERVICES TABLE
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on services" ON public.services;
DROP POLICY IF EXISTS "Admins have full access to services" ON public.services;
DROP POLICY IF EXISTS "AI Build owner manages services" ON public.services;
DROP POLICY IF EXISTS "Public can view all services" ON public.services;

-- Public can view active service offerings
CREATE POLICY "Public can view all services"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "AI Build owner manages services"
  ON public.services FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- 5. REVIEWS TABLE
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "AI Build owner manages reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can submit pending reviews" ON public.reviews;

-- Public can read approved client reviews; owner can read all (including pending)
CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- Public visitors can submit only pending reviews without self-verification
CREATE POLICY "Public can submit pending reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (status = 'pending' AND (verified = false OR verified IS NULL));

CREATE POLICY "AI Build owner manages reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- 6. SITE CONTENT TABLE
ALTER TABLE IF EXISTS public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on site_content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;
DROP POLICY IF EXISTS "AI Build owner manages site content" ON public.site_content;
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;

-- Public can view site content configuration
CREATE POLICY "Public can view site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "AI Build owner manages site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- 7. MEDIA ASSETS TABLE
ALTER TABLE IF EXISTS public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on media_assets" ON public.media_assets;
DROP POLICY IF EXISTS "Admins have full access to media assets" ON public.media_assets;
DROP POLICY IF EXISTS "AI Build owner manages media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Public can view media assets" ON public.media_assets;

-- Public can view portfolio media assets index
CREATE POLICY "Public can view media assets"
  ON public.media_assets FOR SELECT
  USING (true);

CREATE POLICY "AI Build owner manages media assets"
  ON public.media_assets FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- 8. ACTIVITY LOGS TABLE
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins have full access to activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "AI Build owner manages activity logs" ON public.activity_logs;

-- Activity logs are strictly owner-only (no public reads)
CREATE POLICY "AI Build owner manages activity logs"
  ON public.activity_logs FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- 9. SUPABASE STORAGE (portfolio-media bucket)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    DROP POLICY IF EXISTS "Allow anon upload portfolio-media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow anon update portfolio-media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow anon delete portfolio-media" ON storage.objects;
    DROP POLICY IF EXISTS "Allow anon select portfolio-media" ON storage.objects;
    DROP POLICY IF EXISTS "Public media access" ON storage.objects;
    DROP POLICY IF EXISTS "Admin upload media" ON storage.objects;
    DROP POLICY IF EXISTS "Admin update media" ON storage.objects;
    DROP POLICY IF EXISTS "Admin delete media" ON storage.objects;
    DROP POLICY IF EXISTS "AI Build owner uploads media" ON storage.objects;
    DROP POLICY IF EXISTS "AI Build owner updates media" ON storage.objects;
    DROP POLICY IF EXISTS "AI Build owner deletes media" ON storage.objects;

    -- Public can read images/videos in public portfolio-media bucket
    CREATE POLICY "Public media access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'portfolio-media');

    -- Only authoritative studio owner can upload media
    CREATE POLICY "AI Build owner uploads media"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'portfolio-media' AND auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

    -- Only authoritative studio owner can update media
    CREATE POLICY "AI Build owner updates media"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'portfolio-media' AND auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

    -- Only authoritative studio owner can delete media
    CREATE POLICY "AI Build owner deletes media"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'portfolio-media' AND auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);
  END IF;
END $$;
