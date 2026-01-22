-- 007_equipment_pricing.sql
-- Migration for multi-distributor pricing and organization scoping
-- Created: 2026-01-19

SET search_path = public, extensions;

-- =============================================================================
-- ADD ORGANIZATION_ID TO EQUIPMENT
-- =============================================================================

-- Add organization_id column (nullable initially for migration)
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create index for org queries
CREATE INDEX IF NOT EXISTS idx_equipment_organization ON public.equipment(organization_id);

-- =============================================================================
-- ADD MULTI-DISTRIBUTOR PRICING
-- =============================================================================

-- Add pricing array column (JSONB array of distributor prices)
-- Structure: [{ distributor, distributor_sku, cost_cents, msrp_cents, map_cents, contract_cents, last_updated, notes }]
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '[]'::jsonb NOT NULL;

-- Add preferred pricing index (which distributor's pricing to use by default)
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS preferred_pricing_index INTEGER DEFAULT 0 NOT NULL;

-- Create GIN index for efficient distributor queries on pricing JSONB
CREATE INDEX IF NOT EXISTS idx_equipment_pricing_distributor
  ON public.equipment USING GIN (pricing jsonb_path_ops);

-- =============================================================================
-- UPDATE UNIQUE CONSTRAINTS
-- =============================================================================

-- Drop old unique constraint on sku (was globally unique)
ALTER TABLE public.equipment
  DROP CONSTRAINT IF EXISTS equipment_sku_key;

-- Add new unique constraint per organization (manufacturer + sku must be unique within org)
-- This allows different organizations to have their own catalog
ALTER TABLE public.equipment
  ADD CONSTRAINT equipment_org_manufacturer_sku_unique
  UNIQUE(organization_id, manufacturer, sku);

-- =============================================================================
-- MIGRATE EXISTING PRICING DATA
-- =============================================================================

-- Move existing cost_cents and msrp_cents to the pricing array as "Legacy" distributor
UPDATE public.equipment
SET pricing = jsonb_build_array(
  jsonb_build_object(
    'distributor', 'Legacy Import',
    'distributor_sku', sku,
    'cost_cents', cost_cents,
    'msrp_cents', msrp_cents,
    'last_updated', NOW()
  )
)
WHERE (cost_cents > 0 OR msrp_cents > 0)
  AND (pricing = '[]'::jsonb OR pricing IS NULL);

-- =============================================================================
-- ROW LEVEL SECURITY FOR EQUIPMENT
-- =============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can create equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can update equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can delete equipment" ON public.equipment;

-- Enable RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- View: Users can view equipment from their organization or shared (null org)
CREATE POLICY "Users can view equipment"
  ON public.equipment FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Create: Members can create equipment for their org
CREATE POLICY "Members can create equipment"
  ON public.equipment FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Update: Members can update equipment in their org
CREATE POLICY "Members can update equipment"
  ON public.equipment FOR UPDATE
  USING (
    organization_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Delete: Admins can delete equipment in their org
CREATE POLICY "Admins can delete equipment"
  ON public.equipment FOR DELETE
  USING (
    organization_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- IMPORT HISTORY TABLE
-- =============================================================================

-- Track CSV imports for audit and rollback purposes
CREATE TABLE IF NOT EXISTS public.equipment_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),

  -- Import metadata
  filename TEXT NOT NULL,
  distributor TEXT NOT NULL,

  -- Results
  total_rows INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,

  -- Error details (for failed rows)
  errors JSONB DEFAULT '[]'::jsonb,

  -- Column mapping used
  column_mapping JSONB NOT NULL DEFAULT '{}',

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_equipment_imports_org ON public.equipment_imports(organization_id);
CREATE INDEX idx_equipment_imports_user ON public.equipment_imports(user_id);
CREATE INDEX idx_equipment_imports_status ON public.equipment_imports(status);

-- RLS for import history
ALTER TABLE public.equipment_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org imports"
  ON public.equipment_imports FOR SELECT
  USING (
    organization_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create imports for their org"
  ON public.equipment_imports FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own imports"
  ON public.equipment_imports FOR UPDATE
  USING (user_id = auth.uid());
