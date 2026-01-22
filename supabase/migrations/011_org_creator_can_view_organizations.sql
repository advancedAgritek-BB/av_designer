-- 011_org_creator_can_view_organizations.sql
-- Allow organization creators to read their org row before membership exists.
-- This enables INSERT ... RETURNING (PostgREST "return=representation") during org bootstrap.
-- Created: 2026-01-22

SET search_path = public, extensions;

DROP POLICY IF EXISTS "Org creators can view organizations" ON public.organizations;

CREATE POLICY "Org creators can view organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

