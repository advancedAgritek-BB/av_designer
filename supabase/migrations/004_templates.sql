-- 004_templates.sql
-- Templates System Schema
-- Creates templates and template_versions tables with RLS policies

SET search_path = public, extensions;

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('room', 'equipment_package', 'project', 'quote')),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  scope TEXT NOT NULL CHECK (scope IN ('personal', 'team', 'org', 'system')),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_tags TEXT[] DEFAULT '{}',
  current_version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  forked_from_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for templates
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_scope ON templates(scope);
CREATE INDEX idx_templates_org_id ON templates(org_id);
CREATE INDEX idx_templates_owner_id ON templates(owner_id);
CREATE INDEX idx_templates_team_id ON templates(team_id);
CREATE INDEX idx_templates_tags ON templates USING GIN(category_tags);
CREATE INDEX idx_templates_published ON templates(is_published) WHERE is_published = true;
CREATE INDEX idx_templates_not_archived ON templates(is_archived) WHERE is_archived = false;

-- Template versions table
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, version)
);

-- Indexes for template_versions
CREATE INDEX idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX idx_template_versions_version ON template_versions(template_id, version DESC);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;

-- Templates RLS Policies

-- SELECT: Personal templates - owner only
CREATE POLICY "Users can view own personal templates"
  ON templates FOR SELECT
  USING (
    scope = 'personal' AND owner_id = auth.uid()
  );

-- SELECT: Team templates - team members
CREATE POLICY "Team members can view team templates"
  ON templates FOR SELECT
  USING (
    scope = 'team' AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- SELECT: Org templates - org members
CREATE POLICY "Org members can view org templates"
  ON templates FOR SELECT
  USING (
    scope = 'org' AND org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- SELECT: System templates - everyone authenticated
CREATE POLICY "Anyone can view system templates"
  ON templates FOR SELECT
  USING (scope = 'system');

-- INSERT: Users can create templates in their org
CREATE POLICY "Users can create templates in their org"
  ON templates FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Personal templates - owner only
CREATE POLICY "Users can edit own personal templates"
  ON templates FOR UPDATE
  USING (scope = 'personal' AND owner_id = auth.uid());

-- UPDATE: Team templates - team admins
CREATE POLICY "Team admins can edit team templates"
  ON templates FOR UPDATE
  USING (
    scope = 'team' AND team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- UPDATE: Org templates - org admins
CREATE POLICY "Org admins can edit org templates"
  ON templates FOR UPDATE
  USING (
    scope = 'org' AND org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- DELETE: Personal templates - owner only
CREATE POLICY "Users can delete own personal templates"
  ON templates FOR DELETE
  USING (scope = 'personal' AND owner_id = auth.uid());

-- DELETE: Team templates - team admins
CREATE POLICY "Team admins can delete team templates"
  ON templates FOR DELETE
  USING (
    scope = 'team' AND team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- DELETE: Org templates - org admins
CREATE POLICY "Org admins can delete org templates"
  ON templates FOR DELETE
  USING (
    scope = 'org' AND org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Template Versions RLS Policies

-- SELECT: View versions of accessible templates
CREATE POLICY "Users can view versions of accessible templates"
  ON template_versions FOR SELECT
  USING (
    template_id IN (SELECT id FROM templates)
  );

-- INSERT: Create versions for editable templates
CREATE POLICY "Users can create versions for editable templates"
  ON template_versions FOR INSERT
  WITH CHECK (
    template_id IN (
      SELECT id FROM templates
      WHERE (scope = 'personal' AND owner_id = auth.uid())
         OR (scope = 'team' AND team_id IN (
              SELECT team_id FROM team_members
              WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'editor')
            ))
         OR (scope = 'org' AND org_id IN (
              SELECT org_id FROM organization_members
              WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
            ))
    )
  );

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for templates updated_at
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
