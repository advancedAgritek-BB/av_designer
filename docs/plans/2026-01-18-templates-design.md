# Templates System Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

Comprehensive template system with:
- Four template types: Room, Equipment Package, Project, Quote
- Full ownership hierarchy: Personal → Team → Organization → System
- Two creation methods: From scratch or save existing as template
- Quick apply workflow with rename prompt
- Full version history with rollback capability
- Platform-specific built-in starter templates

---

## Template Types

### Type Summary

| Type | Contains | Use Case |
|------|----------|----------|
| **Room Template** | Room config + equipment placements + connections | Quick room setup |
| **Equipment Package** | Bundle of equipment items with quantities | Reusable kits |
| **Project Template** | Multiple room templates + client defaults + standards | Standard project starting point |
| **Quote Template** | Pricing structure, margins, labor rates, terms | Consistent quoting |

### Template Metadata (All Types)

| Field | Type | Description |
|-------|------|-------------|
| name | TEXT | Template name |
| description | TEXT | Detailed description |
| thumbnail_url | TEXT | Preview image |
| category_tags | TEXT[] | Filterable tags |
| scope | ENUM | personal, team, org, system |
| current_version | INTEGER | Current version number |
| forked_from_id | UUID | Source template if forked |

---

## Ownership Hierarchy

### Four Visibility Levels

| Level | Visible To | Can Edit | Can Delete |
|-------|------------|----------|------------|
| **Personal** | Creator only | Creator | Creator |
| **Team** | Team members | Team editors+ | Team admin |
| **Organization** | All org members | Org admins | Org admins |
| **System** | Everyone | Nobody (read-only) | Nobody |

### Promotion Flow

```
Personal → Team → Organization
    ↑         ↑         ↑
  Create   Promote   Promote
           (team     (org
           admin)    admin)
```

- Users create personal templates
- Team admins can promote personal → team
- Org admins can promote team → org
- System templates are seeded and immutable

### Template Forking

- Any user can fork a higher-level template to personal
- Fork creates independent copy they can modify
- Shows "Forked from: {original}" attribution
- Forked templates start at v1

---

## Data Model

### templates table

```sql
CREATE TABLE templates (
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

CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_scope ON templates(scope);
CREATE INDEX idx_templates_org_id ON templates(org_id);
CREATE INDEX idx_templates_owner_id ON templates(owner_id);
CREATE INDEX idx_templates_team_id ON templates(team_id);
CREATE INDEX idx_templates_tags ON templates USING GIN(category_tags);
```

### template_versions table

```sql
CREATE TABLE template_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, version)
);

CREATE INDEX idx_template_versions_template_id ON template_versions(template_id);
```

### Content JSONB Structure by Type

**Room Template Content**
```typescript
interface RoomTemplateContent {
  room_type: RoomType;
  width: number;
  length: number;
  ceiling_height: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: Tier;
  placed_equipment: PlacedEquipment[];
  connections: Connection[];
}
```

**Equipment Package Content**
```typescript
interface EquipmentPackageContent {
  category: string;
  items: {
    equipment_id: string;
    quantity: number;
    notes?: string;
  }[];
  total_estimated_cost: number;
}
```

**Project Template Content**
```typescript
interface ProjectTemplateContent {
  room_templates: {
    template_id: string;
    default_name: string;
    quantity: number;
  }[];
  client_defaults: {
    industry?: string;
    standards_profile?: string;
  };
  default_margins: {
    equipment: number;
    labor: number;
  };
}
```

**Quote Template Content**
```typescript
interface QuoteTemplateContent {
  sections: {
    name: string;
    category: string;
    default_margin: number;
  }[];
  default_margins: {
    equipment: number;
    labor: number;
  };
  labor_rates: {
    category: string;
    rate_per_hour: number;
  }[];
  tax_settings: {
    rate: number;
    applies_to: string[];
  };
  terms_text: string;
}
```

### RLS Policies

```sql
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Personal: owner only
CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (
    scope = 'personal' AND owner_id = auth.uid()
  );

-- Team: team members
CREATE POLICY "Team members can view team templates"
  ON templates FOR SELECT
  USING (
    scope = 'team' AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Org: org members
CREATE POLICY "Org members can view org templates"
  ON templates FOR SELECT
  USING (
    scope = 'org' AND org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- System: everyone authenticated
CREATE POLICY "Anyone can view system templates"
  ON templates FOR SELECT
  USING (scope = 'system');

-- Edit policies
CREATE POLICY "Users can edit own personal templates"
  ON templates FOR UPDATE
  USING (scope = 'personal' AND owner_id = auth.uid());

CREATE POLICY "Team admins can edit team templates"
  ON templates FOR UPDATE
  USING (
    scope = 'team' AND team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Org admins can edit org templates"
  ON templates FOR UPDATE
  USING (
    scope = 'org' AND org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Insert policy
CREATE POLICY "Users can create templates in their org"
  ON templates FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Delete policies (similar to edit)
CREATE POLICY "Users can delete own personal templates"
  ON templates FOR DELETE
  USING (scope = 'personal' AND owner_id = auth.uid());

-- Version table policies
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of accessible templates"
  ON template_versions FOR SELECT
  USING (
    template_id IN (SELECT id FROM templates)  -- Relies on templates RLS
  );

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
```

---

## Built-in System Templates

### Room Templates

**By Room Type & Tier**

| Room Type | Budget | Standard | Premium | Executive |
|-----------|--------|----------|---------|-----------|
| Huddle (2-4) | ✓ | ✓ | ✓ | - |
| Conference (6-10) | ✓ | ✓ | ✓ | ✓ |
| Boardroom (12-20) | - | ✓ | ✓ | ✓ |
| Training (20+) | - | ✓ | ✓ | - |
| Auditorium | - | - | ✓ | ✓ |

**Platform Variants**

Each room template has variants for:
- Microsoft Teams Rooms
- Zoom Rooms
- Cisco Webex
- Google Meet
- Multi-platform (hybrid)

**Total Room Templates:** ~60 (12 base × 5 platforms)

### Equipment Packages

| Package | Tier | Contents |
|---------|------|----------|
| Huddle Kit | Budget | USB camera, speakerphone, basic display |
| Huddle Kit | Standard | Integrated bar, touch controller, display |
| Huddle Kit | Premium | PTZ camera, DSP, premium display |
| Conference Kit - Teams | Standard | Teams-certified bar, TC10 controller |
| Conference Kit - Teams | Premium | Poly Studio X70, TC10, dual displays |
| Conference Kit - Zoom | Standard | Zoom-certified components |
| Conference Kit - Zoom | Premium | Neat Bar Pro, Neat Pad |
| Boardroom Audio | Standard | Ceiling mics, basic DSP, speakers |
| Boardroom Audio | Premium | Beamforming array, Biamp DSP, distributed audio |
| Presentation Package | Standard | Wireless sharing device |
| Presentation Package | Premium | ClickShare, annotation display |
| Recording Package | Standard | Capture device, local recording |
| Recording Package | Premium | Streaming encoder, cloud integration |

**Total Equipment Packages:** ~15

### Project Templates

| Template | Description | Rooms Included |
|----------|-------------|----------------|
| Small Office | Startup/small business | 2 huddle, 1 conference |
| Corporate Floor | Standard office floor | 4 huddle, 2 conference, 1 boardroom |
| Executive Suite | Premium executive area | 2 premium conference, 1 exec boardroom |
| Training Center | Education/training facility | 4 training rooms, 1 auditorium |
| All-Hands Space | Large meeting capability | 1 auditorium, 2 boardroom |

**Total Project Templates:** 5

### Quote Templates

| Template | Equipment Margin | Labor Margin | Labor Rate |
|----------|------------------|--------------|------------|
| Standard Commercial | 25% | 35% | $85/hr |
| Enterprise | 20% | 30% | $95/hr |
| Budget-Conscious | 15% | 25% | $75/hr |
| Premium/Executive | 30% | 40% | $125/hr |
| Government/Education | 18% | 28% | $80/hr |

**Total Quote Templates:** 5

---

## Templates Page UI

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Templates                                    [+ New Template ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌──────────┬──────────┬──────────┬──────────┐                  │
│ │  Rooms   │ Packages │ Projects │  Quotes  │  ← Type tabs     │
│ └──────────┴──────────┴──────────┴──────────┘                  │
│                                                                 │
│ Scope: [All ▼]  Platform: [All ▼]  Tier: [All ▼]  🔍 Search   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ MY TEMPLATES                                                ││
│ ├─────────────────────────────────────────────────────────────┤│
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐                        ││
│ │ │ [thumb] │ │ [thumb] │ │ [thumb] │                        ││
│ │ │ Name    │ │ Name    │ │ Name    │                        ││
│ │ │ v1.2 👤 │ │ v2.0 👤 │ │ v1.0 👤 │                        ││
│ │ └─────────┘ └─────────┘ └─────────┘                        ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ TEAM TEMPLATES                                              ││
│ ├─────────────────────────────────────────────────────────────┤│
│ │ ┌─────────┐ ┌─────────┐                                    ││
│ │ │ [thumb] │ │ [thumb] │                                    ││
│ │ │ Name 👥 │ │ Name 👥 │                                    ││
│ │ └─────────┘ └─────────┘                                    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ORGANIZATION TEMPLATES                                      ││
│ ├─────────────────────────────────────────────────────────────┤│
│ │ ┌─────────┐ ┌─────────┐                                    ││
│ │ │ [thumb] │ │ [thumb] │                                    ││
│ │ │ Name 🏢 │ │ Name 🏢 │                                    ││
│ │ └─────────┘ └─────────┘                                    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ SYSTEM TEMPLATES                                            ││
│ ├─────────────────────────────────────────────────────────────┤│
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           ││
│ │ │ [thumb] │ │ [thumb] │ │ [thumb] │ │ [thumb] │  ...      ││
│ │ │ Name ⚙️ │ │ Name ⚙️ │ │ Name ⚙️ │ │ Name ⚙️ │           ││
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘           ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Template Card

| Element | Description |
|---------|-------------|
| Thumbnail | Auto-generated preview or custom image |
| Name | Template name (truncated if long) |
| Version badge | "v1.2" in corner |
| Scope icon | 👤 personal, 👥 team, 🏢 org, ⚙️ system |
| Platform badge | Teams/Zoom/Webex/Meet if applicable |
| Tier badge | Budget/Standard/Premium/Executive if applicable |
| Hover actions | Use, Edit, Fork, ⋮ more menu |

### Card Actions Menu

| Action | Available For | Description |
|--------|---------------|-------------|
| Use | All published | Apply template |
| Edit | Editable templates | Open in editor |
| Fork | Team, Org, System | Copy to personal |
| Promote | Personal (team admin), Team (org admin) | Increase scope |
| Duplicate | Own templates | Create copy at same scope |
| Archive | Own templates | Soft delete |
| Delete | Own templates | Permanent delete |

### Filters

| Filter | Options |
|--------|---------|
| Scope | All, My Templates, Team, Organization, System |
| Platform | All, Teams, Zoom, Webex, Meet, Multi-platform |
| Tier | All, Budget, Standard, Premium, Executive |
| Search | Name, description, tags |

---

## Template Creation

### Flow 1: Create from Scratch

**Step 1: Select Type**
```
[+ New Template] dropdown:
├─ New Room Template
├─ New Equipment Package
├─ New Project Template
└─ New Quote Template
```

**Step 2: Template Editor**
```
┌─────────────────────────────────────────────────────────────┐
│ New Room Template                              [Save Draft] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name: [_______________________]                             │
│ Description: [_______________________]                      │
│ Tags: [huddle] [teams] [+ add]                             │
│ Scope: (•) Personal  ( ) Team  ( ) Organization            │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ [Type-specific configuration UI - see below]               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Cancel]                        [Save as Draft] [Publish]  │
└─────────────────────────────────────────────────────────────┘
```

**Type-Specific Editors**

| Type | Editor UI |
|------|-----------|
| Room | Mini room builder canvas with equipment palette |
| Equipment Package | Equipment selector with quantity inputs |
| Project | Room template selector with quantities and defaults |
| Quote | Margin/labor/tax configuration form |

### Flow 2: Save Existing as Template

From Room Builder, Quote Page, Project Page:

```
[⋮ Actions] → "Save as Template"
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ Save as Template                                │
├─────────────────────────────────────────────────┤
│                                                 │
│ Template Name: [Conference Room A_________]    │
│ Description: [Standard Teams room setup___]    │
│ Tags: [conference] [teams] [+ add]             │
│                                                 │
│ Scope: (•) Personal  ( ) Team  ( ) Org         │
│                                                 │
│ Include in template:                           │
│ ☑ Room configuration (type, dimensions)       │
│ ☑ Equipment placements                         │
│ ☑ Connections/cabling                          │
│ ☐ Custom notes                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│ [Cancel]                    [Create Template]  │
└─────────────────────────────────────────────────┘
```

### Draft vs Published

| State | Visibility | Can Apply | Can Edit |
|-------|------------|-----------|----------|
| Draft | Creator only | No | Yes |
| Published | Per scope rules | Yes | Creates new version |

---

## Applying Templates

### Quick Apply Flow

```
Template Card → [Use] button
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ Use Template: "Huddle Room - Teams - Standard" │
├─────────────────────────────────────────────────┤
│                                                 │
│ Name: [Huddle Room 1__________________]        │
│                                                 │
│ Project: [Select project... ▼]                 │
│          ├─ Office Renovation                  │
│          ├─ New HQ Build                       │
│          └─ + Create new project               │
│                                                 │
├─────────────────────────────────────────────────┤
│ [Cancel]                    [Create & Open]    │
└─────────────────────────────────────────────────┘
```

### Apply Behavior by Type

| Template Type | Creates | Then Opens |
|---------------|---------|------------|
| Room | New room in selected project | Room Builder |
| Equipment Package | Adds items to current room | Room Builder |
| Project | New project with all rooms | Project page |
| Quote | New quote for selected room | Quote page |

### Equipment Package Apply (Special Case)

When applying to an existing room:

```
┌─────────────────────────────────────────────────┐
│ Add "Huddle Kit - Premium" to room?            │
├─────────────────────────────────────────────────┤
│                                                 │
│ This will add:                                 │
│ • 1× Poly Studio X50                           │
│ • 1× Poly TC10 Controller                      │
│ • 1× Samsung 55" Display                       │
│                                                 │
│ Placement: (•) Auto-place  ( ) Add to palette │
│                                                 │
├─────────────────────────────────────────────────┤
│ [Cancel]                              [Add]    │
└─────────────────────────────────────────────────┘
```

---

## Version History

### Version History Panel

```
┌─────────────────────────────────────────────────┐
│ Version History                            [X] │
├─────────────────────────────────────────────────┤
│                                                 │
│ ● v3 (current)                      Jan 18, 2026│
│   ├─ "Added ceiling mic array"                 │
│   └─ by Sarah Chen                             │
│                                                 │
│ ○ v2                                Jan 15, 2026│
│   ├─ "Upgraded to premium display"             │
│   ├─ by Sarah Chen                             │
│   └─ [View] [Restore]                          │
│                                                 │
│ ○ v1                                Jan 10, 2026│
│   ├─ "Initial version"                         │
│   ├─ by John Smith                             │
│   └─ [View] [Restore]                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Version Actions

| Action | Behavior |
|--------|----------|
| View | Opens read-only preview of that version |
| Restore | Creates new version with old content |
| Compare | Side-by-side diff (future enhancement) |

### Auto-versioning Rules

| Event | Creates New Version |
|-------|---------------------|
| Publish draft | Yes (v1) |
| Edit published template content | Yes |
| Minor metadata change (name, tags) | No |
| Restore previous version | Yes |

### Change Summary Prompt

Required when saving content changes:

```
┌─────────────────────────────────────────────────┐
│ Save Changes                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ What changed? (required)                       │
│ [Swapped camera for PTZ model_____________]   │
│                                                 │
├─────────────────────────────────────────────────┤
│ [Cancel]                        [Save as v4]   │
└─────────────────────────────────────────────────┘
```

---

## Frontend Components

### File Structure

```
src/features/templates/
├── template-service.ts          # CRUD, versioning, fork, promote
├── template-types.ts            # Types and enums
├── use-templates.ts             # React Query hooks
├── components/
│   ├── TemplatesPage.tsx        # Main page with tabs and filters
│   ├── TemplateCard.tsx         # Grid card with actions
│   ├── TemplateGrid.tsx         # Grouped grid by scope
│   ├── TemplateEditor.tsx       # Create/edit shell
│   ├── RoomTemplateEditor.tsx   # Room-specific editor
│   ├── PackageEditor.tsx        # Equipment package editor
│   ├── ProjectTemplateEditor.tsx# Project template editor
│   ├── QuoteTemplateEditor.tsx  # Quote template editor
│   ├── ApplyTemplateModal.tsx   # Quick apply dialog
│   ├── SaveAsTemplateModal.tsx  # Save existing as template
│   ├── VersionHistoryPanel.tsx  # Version list with rollback
│   └── TemplateFilters.tsx      # Scope, platform, tier filters
└── index.ts                     # Public exports
```

### Types

```typescript
// template-types.ts

type TemplateType = 'room' | 'equipment_package' | 'project' | 'quote';
type TemplateScope = 'personal' | 'team' | 'org' | 'system';

interface Template {
  id: string;
  type: TemplateType;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  scope: TemplateScope;
  owner_id: string | null;
  team_id: string | null;
  org_id: string;
  category_tags: string[];
  current_version: number;
  is_published: boolean;
  is_archived: boolean;
  forked_from_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TemplateVersion {
  id: string;
  template_id: string;
  version: number;
  content: RoomTemplateContent | EquipmentPackageContent | ProjectTemplateContent | QuoteTemplateContent;
  change_summary: string | null;
  created_by: string;
  created_at: string;
}

interface TemplateWithVersion extends Template {
  content: TemplateVersion['content'];
}
```

### Hooks

| Hook | Purpose |
|------|---------|
| `useTemplates(type, filters)` | Fetch templates by type with filters |
| `useTemplate(id)` | Fetch single template with current version |
| `useTemplateVersions(id)` | Fetch version history |
| `useCreateTemplate()` | Create new template |
| `useUpdateTemplate()` | Update template (creates version) |
| `usePublishTemplate()` | Publish draft template |
| `useDeleteTemplate()` | Delete template |
| `useArchiveTemplate()` | Archive template |
| `useForkTemplate()` | Fork to personal |
| `usePromoteTemplate()` | Promote scope |
| `useApplyTemplate()` | Apply template to create entity |
| `useRestoreVersion()` | Restore previous version |

### Integration Points

| Location | Integration |
|----------|-------------|
| Room Builder | "Save as Template" in actions menu |
| Quote Page | "Save as Template" in actions menu |
| Project Page | "Save as Template" in actions menu |
| New Room dialog | "Start from template" option |
| New Project dialog | "Start from template" option |
| New Quote dialog | "Start from template" option |

---

## File Changes Required

### New Files

```
supabase/migrations/
└── 004_templates.sql               # Tables, RLS, indexes, seed data

src/features/templates/
├── template-service.ts             # ~150 lines
├── template-types.ts               # ~100 lines
├── use-templates.ts                # ~180 lines
├── components/
│   ├── TemplatesPage.tsx           # ~200 lines
│   ├── TemplateCard.tsx            # ~100 lines
│   ├── TemplateGrid.tsx            # ~80 lines
│   ├── TemplateEditor.tsx          # ~120 lines
│   ├── RoomTemplateEditor.tsx      # ~250 lines
│   ├── PackageEditor.tsx           # ~200 lines
│   ├── ProjectTemplateEditor.tsx   # ~200 lines
│   ├── QuoteTemplateEditor.tsx     # ~180 lines
│   ├── ApplyTemplateModal.tsx      # ~100 lines
│   ├── SaveAsTemplateModal.tsx     # ~120 lines
│   ├── VersionHistoryPanel.tsx     # ~100 lines
│   └── TemplateFilters.tsx         # ~80 lines
└── index.ts                        # ~25 lines

src/styles/features/
└── templates.css                    # ~200 lines
```

### Modified Files

```
src/pages/TemplatesPage.tsx              # Replace placeholder with real component
src/features/room-builder/components/    # Add "Save as Template" action
src/features/quoting/components/         # Add "Save as Template" action
src/pages/ProjectsPage.tsx               # Add "Start from template" option
```

---

## Testing

### Estimated Test Count: ~200 tests

| File | Tests |
|------|-------|
| template-service.test.ts | 25 |
| template-types.test.ts | 20 |
| use-templates.test.tsx | 30 |
| TemplatesPage.test.tsx | 25 |
| TemplateCard.test.tsx | 20 |
| TemplateGrid.test.tsx | 15 |
| TemplateEditor.test.tsx | 15 |
| RoomTemplateEditor.test.tsx | 20 |
| PackageEditor.test.tsx | 15 |
| ProjectTemplateEditor.test.tsx | 15 |
| QuoteTemplateEditor.test.tsx | 15 |
| ApplyTemplateModal.test.tsx | 15 |
| SaveAsTemplateModal.test.tsx | 15 |
| VersionHistoryPanel.test.tsx | 15 |
| TemplateFilters.test.tsx | 10 |

### Test Categories

- Service: CRUD, versioning, fork, promote operations
- Types: Validation, content structure
- Hooks: Query states, mutations, caching
- Components: Rendering, interactions, accessibility
- Integration: End-to-end template workflows

---

## Implementation Order

1. **Database**: Migration with tables, RLS, indexes
2. **Types**: template-types.ts
3. **Seed Data**: System templates
4. **Service**: template-service.ts
5. **Hooks**: use-templates.ts
6. **Components**: TemplatesPage → Card → Grid → Filters
7. **Editors**: TemplateEditor → type-specific editors
8. **Modals**: ApplyTemplateModal, SaveAsTemplateModal
9. **Version History**: VersionHistoryPanel
10. **Integration**: Add "Save as Template" to existing pages
11. **Styles**: templates.css
12. **Tests**: All test files
