-- 012_source_templates.sql
-- Migration to add Source Templates for pricing sheet imports
-- Created: 2026-01-22

SET search_path = public, extensions;

-- =============================================================================
-- SOURCE TEMPLATES TABLE
-- =============================================================================
-- Stores column mapping configurations for repeat imports from the same sources
-- (e.g., "Synnex Price List", "Poly Direct Pricing")

CREATE TABLE public.source_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('xlsx', 'csv', 'pdf')),
  column_mappings JSONB NOT NULL DEFAULT '[]',
  -- column_mappings structure:
  -- [
  --   { "sourceColumn": 0, "sourceHeader": "MFG", "targetField": "manufacturer" },
  --   { "sourceColumn": 1, "sourceHeader": "Part Number", "targetField": "sku" },
  --   ...
  -- ]
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_source_templates_org ON public.source_templates(org_id);
CREATE INDEX idx_source_templates_name ON public.source_templates(org_id, name);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.source_templates ENABLE ROW LEVEL SECURITY;

-- Users can view templates for organizations they belong to
CREATE POLICY "Users can view org templates"
  ON public.source_templates FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert templates for organizations they belong to
CREATE POLICY "Users can create org templates"
  ON public.source_templates FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can update templates for organizations they belong to
CREATE POLICY "Users can update org templates"
  ON public.source_templates FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete templates for organizations they belong to
CREATE POLICY "Users can delete org templates"
  ON public.source_templates FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE TRIGGER source_templates_updated_at
  BEFORE UPDATE ON public.source_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
