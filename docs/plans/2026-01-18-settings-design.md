# Settings System Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

Full settings hub with:
- User profile and account management
- App preferences with dark/light theme toggle
- Per-context default profiles for projects/rooms
- Full ecosystem integrations (storage, calendar, CRM, accounting, vendors)
- Organization management with branding
- Billing and subscription management
- Security policies and audit logging
- Data management with GDPR compliance

---

## Settings Structure

### Main Sections

| Section | Tab | Access | Description |
|---------|-----|--------|-------------|
| **Account** | Account | All users | Profile, password, 2FA, connected accounts |
| **Preferences** | Preferences | All users | Theme, behavior, units, canvas settings |
| **Defaults** | Defaults | All users | Per-context default profiles |
| **Notifications** | Notifications | All users | Already designed separately |
| **Integrations** | Integrations | All users | External service connections |
| **Organization** | Organization | Admin, Owner | Org info, members, branding |
| **Billing** | Billing | Owner only | Plan, payment, invoices |
| **Security** | Security | Admin, Owner | Auth policies, API keys, audit log |
| **Data** | Data | All users | Export, import, cleanup, GDPR |

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Settings                                                    │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│ Account        │  [Selected section content]               │
│ Preferences    │                                            │
│ Defaults       │                                            │
│ Notifications  │                                            │
│ Integrations   │                                            │
│ ────────────── │                                            │
│ Organization   │  (Admin/Owner sections below divider)     │
│ Billing        │                                            │
│ Security       │                                            │
│ Data           │                                            │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

---

## Data Model

### user_preferences table

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

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
  last_used_profile_id UUID REFERENCES default_profiles(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

### default_profiles table

```sql
CREATE TABLE default_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  default_scale TEXT DEFAULT '1/4" = 1\'',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_default_profiles_user_id ON default_profiles(user_id);
```

### integrations table

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  provider TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('storage', 'calendar', 'crm', 'accounting', 'vendor')),

  is_connected BOOLEAN NOT NULL DEFAULT false,
  access_token TEXT,  -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,

  settings JSONB DEFAULT '{}',
  connected_account_email TEXT,
  connected_account_name TEXT,

  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, user_id, provider)
);

CREATE INDEX idx_integrations_org_id ON integrations(org_id);
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
```

### api_keys table

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),

  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,  -- Hashed, never store plain
  key_prefix TEXT NOT NULL, -- First 8 chars for display

  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
```

### audit_logs table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,

  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

### org_settings table

```sql
CREATE TABLE org_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

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

CREATE INDEX idx_org_settings_org_id ON org_settings(org_id);
```

### user_sessions table

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

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

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
```

### RLS Policies

```sql
-- user_preferences: users can only access their own
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (user_id = auth.uid());

-- default_profiles: users can only access their own
ALTER TABLE default_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own default profiles"
  ON default_profiles FOR ALL
  USING (user_id = auth.uid());

-- integrations: users can manage their own, admins can view org
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations"
  ON integrations FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view org integrations"
  ON integrations FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- api_keys: admins can manage
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API keys"
  ON api_keys FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- audit_logs: admins can view
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- org_settings: admins can manage
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org settings"
  ON org_settings FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update org settings"
  ON org_settings FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- user_sessions: users see own, admins see all org
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view org sessions"
  ON user_sessions FOR SELECT
  USING (
    user_id IN (
      SELECT om2.user_id FROM organization_members om1
      JOIN organization_members om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = auth.uid() AND om1.role IN ('admin', 'owner')
    )
  );
```

---

## Account Settings

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Account                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────┐                                                │
│ │ [Avatar]│  [Change photo]                                │
│ └─────────┘                                                │
│                                                             │
│ Full Name        [Brandon Burnette__________]              │
│ Email            brandon@example.com  [Change email]       │
│ Phone            [+1 555-123-4567___________] (optional)   │
│ Job Title        [AV Designer_______________] (optional)   │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Password         ••••••••••••  [Change password]           │
│ Two-Factor Auth  Disabled      [Enable 2FA]                │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Connected Accounts                                         │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🔷 Microsoft    Connected as brandon@work.com  [Disconnect] │
│ │ 🔴 Google       Not connected                  [Connect]    │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                         [Save Changes]     │
└─────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Required | Editable | Notes |
|-------|----------|----------|-------|
| Avatar | No | Yes | Upload or gravatar |
| Full Name | Yes | Yes | Display name |
| Email | Yes | Yes | Requires verification |
| Phone | No | Yes | For account recovery |
| Job Title | No | Yes | Shown on exports |
| Password | Yes* | Yes | *If not using SSO only |
| 2FA | No | Yes | TOTP setup |
| Connected Accounts | No | Yes | SSO providers |

### Change Email Flow

1. User enters new email
2. Verification email sent to new address
3. User clicks verification link
4. Email updated after verification

### Change Password Flow

1. User enters current password
2. User enters new password + confirmation
3. Password strength validated
4. All other sessions invalidated

### Enable 2FA Flow

1. User clicks "Enable 2FA"
2. QR code displayed for authenticator app
3. User enters verification code
4. Backup codes generated and displayed
5. 2FA enabled

---

## Preferences Settings

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Preferences                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ APPEARANCE                                                  │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Theme            (•) Dark  ( ) Light  ( ) System           │
│                                                             │
│ ┌──────────────────┐  ┌──────────────────┐                │
│ │ [Dark preview]   │  │ [Light preview]  │                │
│ └──────────────────┘  └──────────────────┘                │
│                                                             │
│ BEHAVIOR                                                    │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Sidebar              (•) Expanded  ( ) Collapsed           │
│ Auto-save            [✓] Save changes automatically        │
│ Auto-save interval   [30 seconds ▼]                        │
│ Confirm deletions    [✓] Ask before deleting items         │
│                                                             │
│ UNITS & FORMATS                                            │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Measurement          (•) Imperial (ft, in)  ( ) Metric (m) │
│ Currency             [USD - US Dollar ▼]                   │
│ Date format          [MM/DD/YYYY ▼]                        │
│ Number format        [1,234.56 ▼]                          │
│                                                             │
│ CANVAS & DRAWING                                           │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Grid snap            [✓] Snap to grid                      │
│ Grid size            [6 inches ▼]                          │
│ Show grid            [✓] Display grid lines                │
│ Default zoom         [100% ▼]                              │
│                                                             │
│                                         [Save Changes]     │
└─────────────────────────────────────────────────────────────┘
```

### Preference Categories

| Category | Settings |
|----------|----------|
| Appearance | Theme (dark/light/system) |
| Behavior | Sidebar default, auto-save, auto-save interval, confirmations |
| Units & Formats | Measurement (imperial/metric), currency, date format, number format |
| Canvas | Grid snap, grid size, show grid, default zoom |

### Theme Options

| Option | Behavior |
|--------|----------|
| Dark | Always use dark theme |
| Light | Always use light theme |
| System | Follow OS preference |

### Auto-save Intervals

- 15 seconds
- 30 seconds (default)
- 1 minute
- 5 minutes
- Disabled

---

## Defaults Settings (Per-Context)

### Default Profiles List

```
┌─────────────────────────────────────────────────────────────┐
│ Defaults                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Default Profiles                          [+ New Profile]  │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ⭐ Standard (default)                        [Edit]  │   │
│ │    Teams • Standard tier • 25% margin               │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 🏢 Enterprise Clients                        [Edit]  │   │
│ │    Multi-platform • Premium tier • 20% margin       │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 💰 Budget Projects                           [Edit]  │   │
│ │    Zoom • Budget tier • 15% margin                  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ When creating new projects:                                │
│ ( ) Always use default profile                             │
│ (•) Ask which profile to use                               │
│ ( ) Remember last used profile                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Default Profile Editor

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Default Profile: Standard                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Profile Name     [Standard______________________]          │
│ ☑ Set as default profile                                   │
│                                                             │
│ ROOM DEFAULTS                                              │
│ ─────────────────────────────────────────────────────────  │
│ Room Type        [Conference ▼]                            │
│ Platform         [Microsoft Teams ▼]                       │
│ Ecosystem        [Poly ▼]                                  │
│ Tier             [Standard ▼]                              │
│                                                             │
│ QUOTING DEFAULTS                                           │
│ ─────────────────────────────────────────────────────────  │
│ Equipment Margin [25__] %                                  │
│ Labor Margin     [35__] %                                  │
│ Labor Rate       [$85_] /hr                                │
│ Tax Rate         [8.25] %                                  │
│                                                             │
│ EQUIPMENT PREFERENCES                                      │
│ ─────────────────────────────────────────────────────────  │
│ Preferred Brands [Poly] [Crestron] [Samsung] [+ Add]      │
│                                                             │
│ DRAWING DEFAULTS                                           │
│ ─────────────────────────────────────────────────────────  │
│ Paper Size       [ARCH D (24x36) ▼]                        │
│ Title Block      [Standard ▼]                              │
│ Scale            [1/4" = 1' ▼]                             │
│                                                             │
│ [Cancel]                         [Delete] [Save Profile]  │
└─────────────────────────────────────────────────────────────┘
```

### Profile Selection Behavior

| Setting | Behavior |
|---------|----------|
| Always use default | Applies starred profile automatically |
| Ask which profile | Shows profile picker dialog |
| Remember last used | Applies most recently used profile |

### Profile Fields

| Section | Fields |
|---------|--------|
| Room Defaults | Room type, platform, ecosystem, tier |
| Quoting Defaults | Equipment margin, labor margin, labor rate, tax rate |
| Equipment | Preferred brands list |
| Drawing Defaults | Paper size, title block template, scale |

---

## Integrations Settings

### Integration Categories

| Category | Providers | Sync Features |
|----------|-----------|---------------|
| Cloud Storage | Google Drive, Dropbox, OneDrive | Export destination, backup |
| Calendar | Google Calendar, Outlook | Deadlines, install dates, milestones |
| CRM | Salesforce, HubSpot | Client sync, opportunity tracking |
| Accounting | QuickBooks, Xero | Quote → Invoice, payment tracking |
| Vendor Portals | WESCO/Anixter, ADI, Snap One | Pricing updates, availability |

### Integrations Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Integrations                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CLOUD STORAGE                                              │
│ ─────────────────────────────────────────────────────────  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📁 Google Drive        Connected ✓         [Manage] │   │
│ │    Exports to: /AV Designer/Projects               │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 📁 Dropbox             Not connected      [Connect] │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 📁 OneDrive            Not connected      [Connect] │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ CALENDAR                                                   │
│ ─────────────────────────────────────────────────────────  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📅 Google Calendar     Not connected      [Connect] │   │
│ │ 📅 Outlook Calendar    Connected ✓         [Manage] │   │
│ │    Syncing: Project deadlines, install dates        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ CRM                                                        │
│ ─────────────────────────────────────────────────────────  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 💼 Salesforce          Not connected      [Connect] │   │
│ │ 💼 HubSpot             Not connected      [Connect] │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ACCOUNTING                                                 │
│ ─────────────────────────────────────────────────────────  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📊 QuickBooks          Connected ✓         [Manage] │   │
│ │    Auto-sync approved quotes as invoices            │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 📊 Xero                Not connected      [Connect] │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ VENDOR PORTALS                                             │
│ ─────────────────────────────────────────────────────────  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🏭 WESCO/Anixter       Connected ✓         [Manage] │   │
│ │    Auto-update pricing weekly                       │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 🏭 ADI                 Not connected      [Connect] │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 🏭 Snap One            Not connected      [Connect] │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Integration Settings Modal

```
┌─────────────────────────────────────────────────────────────┐
│ QuickBooks Integration                                 [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Status: Connected ✓                                        │
│ Account: Acme AV Solutions                                 │
│ Connected: Jan 10, 2026                                    │
│                                                             │
│ SYNC SETTINGS                                              │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ [✓] Create invoice when quote approved                     │
│ [✓] Sync client contacts                                   │
│ [ ] Sync payments back to AV Designer                      │
│                                                             │
│ Invoice defaults:                                          │
│   Due date         [Net 30 ▼]                              │
│   Tax mapping      [Auto-detect ▼]                         │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ [Disconnect]                              [Save Settings]  │
└─────────────────────────────────────────────────────────────┘
```

### OAuth Connection Flow

1. User clicks [Connect]
2. Redirect to provider OAuth page
3. User authorizes AV Designer
4. Redirect back with auth code
5. Exchange code for tokens
6. Store encrypted tokens
7. Show connection success

---

## Organization Settings (Admin Only)

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Organization                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ GENERAL                                                    │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────┐                                                │
│ │ [Logo]  │  [Change logo]                                 │
│ └─────────┘                                                │
│                                                             │
│ Organization Name  [Acme AV Solutions___________]          │
│ Website            [https://acmeav.com__________]          │
│ Phone              [+1 555-123-4567_____________]          │
│ Address            [123 Main St, Suite 100______]          │
│                    [San Francisco, CA 94105_____]          │
│                                                             │
│ MEMBERS                                           [Invite] │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Name              Email              Role    Status │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Brandon Burnette  brandon@acme.com   Owner   Active │   │
│ │ Sarah Chen        sarah@acme.com     Admin   Active │   │
│ │ John Smith        john@acme.com      Editor  Active │   │
│ │ Jane Doe          jane@acme.com      Viewer  Pending│   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ BRANDING (for exports)                                     │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Primary Color      [#C9A227] 🎨                            │
│ Secondary Color    [#0D1421] 🎨                            │
│ Footer Text        [© 2026 Acme AV Solutions___]          │
│ Include logo on    [✓] Quotes  [✓] Drawings  [✓] PDFs    │
│                                                             │
│                                         [Save Changes]     │
└─────────────────────────────────────────────────────────────┘
```

### Member Management

| Action | Available To | Description |
|--------|--------------|-------------|
| Invite | Admin, Owner | Send email invitation |
| Change Role | Owner (all), Admin (non-owners) | Modify permissions |
| Remove | Owner (all), Admin (non-owners) | Revoke access |
| Resend Invite | Admin, Owner | For pending members |
| Transfer Ownership | Owner only | Make someone else owner |

### Member Roles

| Role | Permissions |
|------|-------------|
| Viewer | Read-only access to assigned projects |
| Editor | Create/edit projects, rooms, quotes |
| Admin | Above + manage members, org settings |
| Owner | Full access including billing, deletion |

### Branding Settings

| Setting | Used In |
|---------|---------|
| Logo | PDF headers, quote exports, email templates |
| Primary Color | Accent color in exports |
| Secondary Color | Background elements in exports |
| Footer Text | PDF footers, quote footers |

---

## Billing Settings (Owner Only)

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Billing                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CURRENT PLAN                                               │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🏢 Team Plan                          [Change Plan] │   │
│ │                                                     │   │
│ │ $49/month • Billed annually ($588/year)            │   │
│ │ Next billing date: Feb 18, 2026                    │   │
│ │                                                     │   │
│ │ Includes:                                          │   │
│ │ • Up to 10 team members                           │   │
│ │ • Unlimited projects                               │   │
│ │ • All integrations                                 │   │
│ │ • Priority support                                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ USAGE                                                      │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Team Members       4 of 10 used        ████░░░░░░ 40%     │
│ Storage            2.3 GB of 50 GB     █░░░░░░░░░ 5%      │
│ Projects           47 active                               │
│                                                             │
│ PAYMENT METHOD                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 💳 Visa ending in 4242           Expires 12/27     │   │
│ │                              [Update] [Remove]     │   │
│ └─────────────────────────────────────────────────────┘   │
│ [+ Add payment method]                                     │
│                                                             │
│ BILLING HISTORY                                            │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Date        Description          Amount    Status   │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Jan 18      Team Plan (Annual)   $588.00   Paid ✓  │   │
│ │ Jan 17      Pro Plan (Monthly)   $29.00    Paid ✓  │   │
│ │ Dec 17      Pro Plan (Monthly)   $29.00    Paid ✓  │   │
│ └─────────────────────────────────────────────────────┘   │
│ [View all invoices]                                        │
│                                                             │
│ BILLING CONTACT                                            │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Email invoices to  [billing@acmeav.com__________]          │
│ Company name       [Acme AV Solutions, Inc.______]         │
│ Tax ID             [12-3456789__________________]          │
│                                                             │
│                                         [Save Changes]     │
└─────────────────────────────────────────────────────────────┘
```

### Billing Features

| Feature | Description |
|---------|-------------|
| Plan management | View current plan, upgrade/downgrade |
| Usage tracking | Members, storage, projects |
| Payment methods | Add/remove cards, set default |
| Invoice history | View and download past invoices |
| Billing contact | Separate email for invoices |

---

## Security Settings (Admin Only)

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Security                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ AUTHENTICATION POLICIES                                    │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Require 2FA           [ ] Require all members to enable 2FA│
│ Password policy       [Strong ▼]                           │
│                       (Min 12 chars, upper, lower, number) │
│ Session timeout       [7 days ▼]                           │
│ Allow SSO only        [ ] Disable email/password login     │
│                                                             │
│ ALLOWED SSO PROVIDERS                                      │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ [✓] Microsoft (Azure AD)                                   │
│ [✓] Google Workspace                                       │
│                                                             │
│ Domain restriction    [ ] Only allow emails from:          │
│                       [acmeav.com, acme.io_________]       │
│                                                             │
│ API ACCESS                                                 │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ API Keys                              [+ Create Key] │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Name           Created      Last Used    Actions    │   │
│ │ CI/CD Key      Jan 10       Jan 18       [Revoke]   │   │
│ │ Zapier         Jan 15       Never        [Revoke]   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ AUDIT LOG                                                  │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Time           User           Action                │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ 2m ago         Sarah Chen     Exported quote #1042  │   │
│ │ 15m ago        John Smith     Created project       │   │
│ │ 1h ago         Brandon B.     Invited jane@acme.com │   │
│ │ 2h ago         Sarah Chen     Updated room design   │   │
│ │ 3h ago         Brandon B.     Changed billing plan  │   │
│ └─────────────────────────────────────────────────────┘   │
│ [View full audit log]                                      │
│                                                             │
│ ACTIVE SESSIONS                                            │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ User           Device           Location   Actions  │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ Brandon B.     macOS • Chrome   SF, CA     Current  │   │
│ │ Brandon B.     Windows • App    SF, CA     [Revoke] │   │
│ │ Sarah Chen     macOS • App      NYC, NY    [Revoke] │   │
│ └─────────────────────────────────────────────────────┘   │
│ [Revoke all sessions]                                      │
│                                                             │
│                                         [Save Changes]     │
└─────────────────────────────────────────────────────────────┘
```

### Password Policies

| Policy | Requirements |
|--------|--------------|
| Basic | Min 8 characters |
| Standard | Min 10 chars, upper + lower + number |
| Strong | Min 12 chars, upper + lower + number + special |

### Security Features

| Feature | Description |
|---------|-------------|
| 2FA requirement | Force all members to enable 2FA |
| Password policy | Set minimum password strength |
| Session timeout | Auto-logout after inactivity |
| SSO-only mode | Disable email/password login |
| SSO providers | Control which providers are allowed |
| Domain restriction | Only allow specific email domains |
| API keys | Create/revoke keys for integrations |
| Audit log | Track all user actions |
| Session management | View and revoke active sessions |

### Audit Log Events

| Category | Events Logged |
|----------|---------------|
| Auth | Login, logout, password change, 2FA change |
| Projects | Create, update, delete, archive |
| Quotes | Create, approve, reject, export |
| Members | Invite, join, role change, remove |
| Settings | Any settings change |
| Billing | Plan change, payment method change |

---

## Data Settings

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Data                                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ EXPORT                                                     │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Export all my data                                         │
│ Download all your projects, quotes, and settings           │
│ [Export My Data]                                           │
│                                                             │
│ Export organization data (Admin only)                      │
│ Download all org data including all members' projects      │
│ [Export Organization Data]                                 │
│                                                             │
│ IMPORT                                                     │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Import from backup                                         │
│ Restore projects from a previous export file               │
│ [Import from File]                                         │
│                                                             │
│ Import from other systems                                  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📦 D-Tools SI        [Import]                       │   │
│ │ 📦 AutoCAD DWG       [Import]                       │   │
│ │ 📦 CSV/Excel         [Import]                       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ STORAGE & CLEANUP                                          │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Local cache          1.2 GB              [Clear Cache]     │
│ Offline data         340 MB              [Manage]          │
│                                                             │
│ Archived projects    12 projects                           │
│                      [View Archived] [Delete All Archived] │
│                                                             │
│ DATA RETENTION (Admin only)                                │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Auto-archive projects after   [12 months ▼] of inactivity │
│ Delete archived projects      [Never ▼]                    │
│ Audit log retention           [2 years ▼]                  │
│                                                             │
│ PRIVACY & GDPR                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Download my personal data                                  │
│ Get a copy of all data associated with your account        │
│ [Request Data Export]                                      │
│                                                             │
│ Delete my account                                          │
│ Permanently delete your account and all associated data    │
│ [Delete My Account]                                        │
│                                                             │
│ Delete organization (Owner only)                           │
│ Permanently delete the organization and all data           │
│ [Delete Organization]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Features

| Feature | Access | Description |
|---------|--------|-------------|
| Export my data | All users | Download personal projects, quotes, settings |
| Export org data | Admin | Download all organization data |
| Import from backup | All users | Restore from AV Designer export file |
| Import from D-Tools | All users | Import D-Tools SI projects |
| Import from AutoCAD | All users | Import DWG files |
| Import from CSV | All users | Import equipment lists |
| Clear cache | All users | Free up local storage |
| Manage offline data | All users | Configure offline sync |
| Archive management | All users | View/delete archived projects |
| Data retention | Admin | Configure auto-archive, deletion policies |
| GDPR data export | All users | Request personal data copy |
| Delete account | All users | Self-service account deletion |
| Delete organization | Owner | Full organization deletion |

### Export Formats

| Export Type | Format | Contents |
|-------------|--------|----------|
| Personal data | ZIP | Projects (JSON), quotes (JSON), settings (JSON), attachments |
| Organization data | ZIP | All members' data, templates, standards |
| GDPR export | ZIP | Account info, activity history, all personal data |

### Data Retention Options

| Setting | Options |
|---------|---------|
| Auto-archive after | 6 months, 12 months, 18 months, 24 months, Never |
| Delete archived | 6 months, 12 months, 24 months, Never |
| Audit log retention | 1 year, 2 years, 5 years, Forever |

### Delete Account Flow

1. User clicks "Delete My Account"
2. Confirmation modal with consequences listed
3. User types "DELETE" to confirm
4. 14-day grace period (can cancel)
5. After grace period: permanent deletion

### Delete Organization Flow

1. Owner clicks "Delete Organization"
2. Warning: All members will lose access
3. Owner must type organization name to confirm
4. 30-day grace period (can cancel)
5. After grace period: permanent deletion

---

## Frontend Components

### File Structure

```
src/features/settings/
├── settings-service.ts            # API calls
├── settings-types.ts              # Types
├── use-settings.ts                # React Query hooks
├── components/
│   ├── SettingsPage.tsx           # Shell with sidebar nav
│   ├── AccountSettings.tsx        # Profile, password, 2FA
│   ├── PreferencesSettings.tsx    # Theme, behavior, units
│   ├── DefaultsSettings.tsx       # Default profiles list
│   ├── DefaultProfileEditor.tsx   # Profile editor modal
│   ├── IntegrationsSettings.tsx   # Integration list
│   ├── IntegrationModal.tsx       # Connection settings
│   ├── OrganizationSettings.tsx   # Org info, branding
│   ├── MemberManagement.tsx       # Member list, invites
│   ├── BillingSettings.tsx        # Plan, payment, invoices
│   ├── SecuritySettings.tsx       # Auth policies, API keys
│   ├── AuditLogPanel.tsx          # Audit log viewer
│   ├── SessionsPanel.tsx          # Active sessions
│   ├── DataSettings.tsx           # Export, import, cleanup
│   └── DeleteAccountModal.tsx     # Deletion confirmation
└── index.ts
```

### Hooks

| Hook | Purpose |
|------|---------|
| `useUserPreferences()` | Fetch/update user preferences |
| `useDefaultProfiles()` | Fetch user's default profiles |
| `useDefaultProfile(id)` | Fetch single profile |
| `useCreateDefaultProfile()` | Create new profile |
| `useUpdateDefaultProfile()` | Update profile |
| `useDeleteDefaultProfile()` | Delete profile |
| `useIntegrations()` | Fetch connected integrations |
| `useConnectIntegration()` | Initiate OAuth flow |
| `useDisconnectIntegration()` | Remove integration |
| `useOrgSettings()` | Fetch org settings |
| `useUpdateOrgSettings()` | Update org settings |
| `useOrgMembers()` | Fetch org members |
| `useInviteMember()` | Send invite |
| `useRemoveMember()` | Remove member |
| `useUpdateMemberRole()` | Change role |
| `useApiKeys()` | Fetch API keys |
| `useCreateApiKey()` | Create new key |
| `useRevokeApiKey()` | Revoke key |
| `useAuditLog()` | Fetch audit logs |
| `useSessions()` | Fetch active sessions |
| `useRevokeSession()` | Revoke session |
| `useExportData()` | Trigger data export |
| `useDeleteAccount()` | Delete account |

---

## File Changes Required

### New Files

```
supabase/migrations/
└── 005_settings.sql                # All settings tables

src/features/settings/
├── settings-service.ts             # ~150 lines
├── settings-types.ts               # ~120 lines
├── use-settings.ts                 # ~200 lines
├── components/
│   ├── SettingsPage.tsx            # ~100 lines
│   ├── AccountSettings.tsx         # ~180 lines
│   ├── PreferencesSettings.tsx     # ~200 lines
│   ├── DefaultsSettings.tsx        # ~250 lines
│   ├── DefaultProfileEditor.tsx    # ~200 lines
│   ├── IntegrationsSettings.tsx    # ~220 lines
│   ├── IntegrationModal.tsx        # ~150 lines
│   ├── OrganizationSettings.tsx    # ~250 lines
│   ├── MemberManagement.tsx        # ~180 lines
│   ├── BillingSettings.tsx         # ~220 lines
│   ├── SecuritySettings.tsx        # ~250 lines
│   ├── AuditLogPanel.tsx           # ~120 lines
│   ├── SessionsPanel.tsx           # ~100 lines
│   ├── DataSettings.tsx            # ~200 lines
│   └── DeleteAccountModal.tsx      # ~100 lines
└── index.ts                        # ~30 lines

src/styles/features/
└── settings.css                     # ~250 lines

src/styles/
└── theme-light.css                  # ~100 lines (light theme)
```

### Modified Files

```
src/pages/SettingsPage.tsx           # Replace placeholder
src/stores/app-store.ts              # Add theme state
src/styles/theme.css                 # Refactor for theme switching
src/App.tsx                          # Apply theme class to root
```

---

## Testing

### Estimated Test Count: ~220 tests

| File | Tests |
|------|-------|
| settings-service.test.ts | 25 |
| settings-types.test.ts | 15 |
| use-settings.test.tsx | 30 |
| SettingsPage.test.tsx | 15 |
| AccountSettings.test.tsx | 25 |
| PreferencesSettings.test.tsx | 20 |
| DefaultsSettings.test.tsx | 20 |
| DefaultProfileEditor.test.tsx | 15 |
| IntegrationsSettings.test.tsx | 15 |
| IntegrationModal.test.tsx | 10 |
| OrganizationSettings.test.tsx | 20 |
| MemberManagement.test.tsx | 15 |
| BillingSettings.test.tsx | 15 |
| SecuritySettings.test.tsx | 20 |
| AuditLogPanel.test.tsx | 10 |
| SessionsPanel.test.tsx | 10 |
| DataSettings.test.tsx | 15 |
| DeleteAccountModal.test.tsx | 10 |

---

## Implementation Order

1. **Database**: Migration with all settings tables
2. **Types**: settings-types.ts
3. **Service**: settings-service.ts
4. **Hooks**: use-settings.ts
5. **Theme**: Light theme CSS, theme switching logic
6. **Settings Page Shell**: SettingsPage.tsx with navigation
7. **User Settings**: Account → Preferences → Defaults
8. **Integrations**: IntegrationsSettings + IntegrationModal
9. **Org Settings**: OrganizationSettings + MemberManagement
10. **Admin Settings**: Billing → Security → AuditLog
11. **Data Settings**: DataSettings + DeleteAccountModal
12. **Styles**: settings.css
13. **Tests**: All test files
