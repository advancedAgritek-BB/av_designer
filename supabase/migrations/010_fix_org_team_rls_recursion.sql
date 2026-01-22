-- 010_fix_org_team_rls_recursion.sql
-- Fix infinite recursion in organization/team RLS policies by using SECURITY DEFINER helpers.
-- Created: 2026-01-21

-- =============================================================================
-- Helpers (SECURITY DEFINER)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_org_member(check_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.org_id = check_org_id
      AND om.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(check_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.org_id = check_org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = check_team_id
      AND tm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_admin(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = check_team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_org_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_team_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_team_admin(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_admin(uuid) TO anon, authenticated;

-- =============================================================================
-- Drop Broken Policies (avoid recursion)
-- =============================================================================

DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

DROP POLICY IF EXISTS "Members can view org members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins can manage org members" ON public.organization_members;

DROP POLICY IF EXISTS "Org members can view teams" ON public.teams;
DROP POLICY IF EXISTS "Org admins can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team admins can update teams" ON public.teams;

DROP POLICY IF EXISTS "Team members can view members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON public.team_members;

-- =============================================================================
-- Organizations Policies
-- =============================================================================

CREATE POLICY "Org members can view organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (public.is_org_member(id));

CREATE POLICY "Org admins can update organizations"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.is_org_admin(id));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- =============================================================================
-- Organization Members Policies
-- =============================================================================

CREATE POLICY "Org members can view organization members"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "Org creators can bootstrap membership"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND EXISTS (
      SELECT 1
      FROM public.organizations o
      WHERE o.id = org_id
        AND o.created_by = auth.uid()
    )
  );

CREATE POLICY "Org admins can insert organization members"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_admin(org_id));

CREATE POLICY "Org admins can update organization members"
  ON public.organization_members FOR UPDATE
  TO authenticated
  USING (public.is_org_admin(org_id))
  WITH CHECK (public.is_org_admin(org_id));

CREATE POLICY "Org admins can delete organization members"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (public.is_org_admin(org_id));

-- =============================================================================
-- Teams Policies
-- =============================================================================

CREATE POLICY "Org members can view teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "Org admins can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_admin(org_id) AND created_by = auth.uid());

CREATE POLICY "Team admins can update teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (public.is_team_admin(id));

-- =============================================================================
-- Team Members Policies
-- =============================================================================

CREATE POLICY "Team members can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (public.is_team_member(team_id));

CREATE POLICY "Team creators can bootstrap membership"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = team_id
        AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Team admins can insert team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_admin(team_id));

CREATE POLICY "Team admins can update team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (public.is_team_admin(team_id))
  WITH CHECK (public.is_team_admin(team_id));

CREATE POLICY "Team admins can delete team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (public.is_team_admin(team_id));

