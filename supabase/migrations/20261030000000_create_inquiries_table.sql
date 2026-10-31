-- ==============================================================================
-- AI BUILD PORTFOLIO — INQUIRIES & LEAD MANAGEMENT PRODUCTION SCHEMA
-- ==============================================================================
-- Authoritative Studio Owner UUID: 8426bca9-cb3b-47a2-997b-f362634ea46d
-- Purpose:
-- 1. Create dedicated, secure table for client contact inquiries and project requests.
-- 2. Strict Row Level Security (RLS):
--    - Public / Anonymous visitors can INSERT valid new inquiries only.
--    - Public / Anonymous visitors CANNOT read, update, or delete any inquiries.
--    - Anonymous visitors cannot tamper with status or inject internal notes.
--    - Only the authoritative studio owner (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d')
--      can SELECT, UPDATE status, manage internal notes, or DELETE inquiry records.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY DEFAULT ('inq-' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
  name TEXT NOT NULL,
  email TEXT,
  service_type TEXT NOT NULL DEFAULT 'Web Development',
  idea_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'archived')),
  notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes for administrative filtering and sorting
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Revoke all existing policies if any to prevent duplicate or conflicting rules
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Public visitors can insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins have full access to inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow anon insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "AI Build owner manages inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Owner manages inquiries" ON public.inquiries;

-- Policy 1: Public visitors (anon and authenticated) can insert valid new inquiries only
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND (notes IS NULL OR trim(notes) = '')
    AND length(trim(name)) > 0
    AND length(trim(idea_description)) > 0
  );

-- Policy 2: Only the authoritative studio owner can read, update, or delete inquiries
CREATE POLICY "AI Build owner manages inquiries"
  ON public.inquiries FOR ALL
  TO authenticated
  USING (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid)
  WITH CHECK (auth.uid() = '8426bca9-cb3b-47a2-997b-f362634ea46d'::uuid);

-- Explicit table permissions (defense-in-depth)
GRANT ALL ON TABLE public.inquiries TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.inquiries TO authenticated;
GRANT INSERT ON TABLE public.inquiries TO anon;
