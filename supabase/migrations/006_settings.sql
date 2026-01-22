-- 006_settings.sql
-- Settings System Tables
-- Includes: user preferences, default profiles, integrations, API keys, audit logs, org settings, sessions

SET search_path = public, extensions;

-- ============================================================================
-- User Preferences Table
-- ============================================================================

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Appearance
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),

  -- Behavior
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  auto_save BOOLEAN NOT NULL DEFAULT true,
  auto_save_interval INTEGER NOT NULL DEFAULT 30,
  confirm_deletions BOOLEAN NOT NULL DEFAULT true,

  -- Units & Formats
  measurement_unit TEXT NOT NULL DEFAULT 'imperial' CHECK (measurement_unit IN ('imperial', 'metric')),
  currency TEXT NOT NULL DEFAULT 'USD',
  date_format TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
  number_format TEXT NOT NULL DEFAULT '1,234.56',

  -- Canvas
  grid_snap BOOLEAN NOT NULL DEFAULT true,
  grid_size INTEGER NOT NULL DEFAULT 6,
  show_grid BOOLEAN NOT NULL DEFAULT true,
  default_zoom INTEGER NOT NULL DEFAULT 100,

  -- Defaults behavior
  default_profile_behavior TEXT NOT NULL DEFAULT 'ask'
    CHECK (default_profile_behavior IN ('always_default', 'ask', 'remember_last')),
  last_used_profile_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ============================================================================
-- Default Profiles Table
-- ============================================================================

CREATE TABLE public.default_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,

  -- Room defaults
  room_type TEXT,
  platform TEXT,
  ecosystem TEXT,
  tier TEXT,

  -- Quoting defaults
  equipment_margin DECIMAL(5,2) DEFAULT 25.00,
  labor_margin DECIMAL(5,2) DEFAULT 35.00,
  labor_rate DECIMAL(10,2) DEFAULT 85.00,
  tax_rate DECIMAL(5,2) DEFAULT 8.25,

  -- Equipment preferences
  preferred_brands TEXT[] DEFAULT '{}',

  -- Drawing defaults
  paper_size TEXT DEFAULT 'ARCH_D',
  title_block TEXT DEFAULT 'standard',
  default_scale TEXT DEFAULT '1/4" = 1''',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_default_profiles_user_id ON public.default_profiles(user_id);

-- Add foreign key constraint for last_used_profile_id after default_profiles table is created
ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_last_used_profile_id_fkey
  FOREIGN KEY (last_used_profile_id) REFERENCES public.default_profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- Integrations Table
-- ============================================================================

CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  provider TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('storage', 'calendar', 'crm', 'accounting', 'vendor')),

  is_connected BOOLEAN NOT NULL DEFAULT false,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  settings JSONB DEFAULT '{}',
  connected_account_email TEXT,
  connected_account_name TEXT,

  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, user_id, provider)
);

CREATE INDEX idx_integrations_org_id ON public.integrations(org_id);
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);

-- ============================================================================
-- API Keys Table
-- ============================================================================

CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),

  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,

  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org_id ON public.api_keys(org_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);

-- ============================================================================
-- Audit Logs Table
-- ============================================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,

  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_id ON public.audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- ============================================================================
-- Org Settings Table
-- ============================================================================

CREATE TABLE public.org_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Branding
  primary_color TEXT DEFAULT '#C9A227',
  secondary_color TEXT DEFAULT '#0D1421',
  footer_text TEXT,
  logo_on_quotes BOOLEAN NOT NULL DEFAULT true,
  logo_on_drawings BOOLEAN NOT NULL DEFAULT true,
  logo_on_pdfs BOOLEAN NOT NULL DEFAULT true,

  -- Security policies
  require_2fa BOOLEAN NOT NULL DEFAULT false,
  password_policy TEXT NOT NULL DEFAULT 'strong',
  session_timeout_days INTEGER NOT NULL DEFAULT 7,
  sso_only BOOLEAN NOT NULL DEFAULT false,
  allowed_sso_providers TEXT[] DEFAULT ARRAY['microsoft', 'google'],
  allowed_email_domains TEXT[] DEFAULT '{}',

  -- Data retention
  auto_archive_months INTEGER DEFAULT 12,
  delete_archived_after TEXT DEFAULT 'never',
  audit_log_retention_years INTEGER DEFAULT 2,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id)
);

CREATE INDEX idx_org_settings_org_id ON public.org_settings(org_id);

-- ============================================================================
-- User Sessions Table
-- ============================================================================

CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  device_info TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  location TEXT,

  is_current BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- user_preferences: users can only access their own
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (user_id = auth.uid());

-- default_profiles: users can only access their own
ALTER TABLE public.default_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own default profiles"
  ON public.default_profiles FOR ALL
  USING (user_id = auth.uid());

-- integrations: users can manage their own, admins can view org
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations"
  ON public.integrations FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view org integrations"
  ON public.integrations FOR SELECT
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'owner')
    )
  );

-- api_keys: admins can manage
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API keys"
  ON public.api_keys FOR ALL
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'owner')
    )
  );

-- audit_logs: admins can view
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'owner')
    )
  );

-- org_settings: members can view, admins can update
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org settings"
  ON public.org_settings FOR SELECT
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage org settings"
  ON public.org_settings FOR ALL
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'owner')
    )
  );

-- user_sessions: users see own, admins see all org
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON public.user_sessions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view org sessions"
  ON public.user_sessions FOR SELECT
  USING (
    user_id IN (
      SELECT om2.user_id FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = auth.uid() AND om1.role IN ('admin', 'owner')
    )
  );
