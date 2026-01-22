-- 009_user_profile_backfill.sql
-- Backfill user profiles for existing auth.users rows and allow self-healing inserts.
-- Created: 2026-01-21

SET search_path = public, extensions;

-- =============================================================================
-- RLS POLICY: allow users to insert their own profile row
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- =============================================================================
-- BACKFILL: create public.users rows for existing auth.users (pre-migrations)
-- =============================================================================

INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
ON CONFLICT DO NOTHING;
