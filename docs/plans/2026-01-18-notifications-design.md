# Notifications System Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

Full activity stream notification system with:
- In-app notifications (real-time via Supabase Realtime)
- Immediate email notifications
- Per-event, per-channel user preferences
- Org admin configurable routing rules
- Ephemeral storage (cleared on dismiss)
- Cool gradient color scheme (indigo→cyan, pink→orange, violet→pink)

---

## Notification Categories & Events

### Categories

| Category | Events | Default Severity |
|----------|--------|------------------|
| **Quotes** | created, status_changed, approval_requested, approved, rejected, exported | varies |
| **Projects** | created, archived, client_assigned, deadline_approaching | varies |
| **Rooms** | created, design_completed, validation_failed, equipment_added, equipment_removed | varies |
| **Drawings** | generated, exported, regeneration_needed | info |
| **Equipment** | added, pricing_updated, discontinued, spec_sheet_updated | info |
| **Standards** | rule_added, rule_modified, rule_deactivated, compliance_alert | warning |
| **System** | app_update_available, sync_completed, sync_failed, storage_warning | varies |
| **Team** | user_invited, user_joined, user_role_changed, user_removed | info |

### Event Details

| Category | Event | Severity | Default In-App | Default Email |
|----------|-------|----------|----------------|---------------|
| quotes | created | info | ✓ | ✗ |
| quotes | status_changed | info | ✓ | ✓ |
| quotes | approval_requested | action_required | ✓ | ✓ |
| quotes | approved | info | ✓ | ✓ |
| quotes | rejected | warning | ✓ | ✓ |
| quotes | exported | info | ✓ | ✗ |
| projects | created | info | ✓ | ✗ |
| projects | archived | info | ✓ | ✗ |
| projects | client_assigned | info | ✓ | ✓ |
| projects | deadline_approaching | warning | ✓ | ✓ |
| rooms | created | info | ✓ | ✗ |
| rooms | design_completed | info | ✓ | ✓ |
| rooms | validation_failed | warning | ✓ | ✓ |
| rooms | equipment_added | info | ✓ | ✗ |
| rooms | equipment_removed | info | ✓ | ✗ |
| drawings | generated | info | ✓ | ✗ |
| drawings | exported | info | ✓ | ✗ |
| drawings | regeneration_needed | warning | ✓ | ✓ |
| equipment | added | info | ✓ | ✗ |
| equipment | pricing_updated | warning | ✓ | ✓ |
| equipment | discontinued | warning | ✓ | ✓ |
| equipment | spec_sheet_updated | info | ✓ | ✗ |
| standards | rule_added | info | ✓ | ✗ |
| standards | rule_modified | info | ✓ | ✗ |
| standards | rule_deactivated | warning | ✓ | ✓ |
| standards | compliance_alert | action_required | ✓ | ✓ |
| system | app_update_available | info | ✓ | ✓ |
| system | sync_completed | info | ✓ | ✗ |
| system | sync_failed | warning | ✓ | ✓ |
| system | storage_warning | warning | ✓ | ✓ |
| team | user_invited | info | ✓ | ✓ |
| team | user_joined | info | ✓ | ✗ |
| team | user_role_changed | info | ✓ | ✓ |
| team | user_removed | info | ✓ | ✓ |

---

## Data Model

### notifications table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'action_required')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### notification_preferences table

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category, event_type)
);

CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);
```

### org_notification_rules table

```sql
CREATE TABLE org_notification_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  recipient_rule TEXT NOT NULL CHECK (recipient_rule IN (
    'actor_only', 'project_team', 'role:editor', 'role:admin', 'role:owner', 'all_members'
  )),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, category, event_type)
);

CREATE INDEX idx_org_notification_rules_org_id ON org_notification_rules(org_id);
```

### RLS Policies

```sql
-- notifications: users can only see/modify their own
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);  -- Edge function uses service role

-- notification_preferences: users can only see/modify their own
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- org_notification_rules: admins can manage, members can view
ALTER TABLE org_notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view rules"
  ON org_notification_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = org_notification_rules.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage rules"
  ON org_notification_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = org_notification_rules.org_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );
```

---

## Color Scheme

### Severity Gradients

| Severity | Gradient | CSS |
|----------|----------|-----|
| info | Indigo → Cyan | `linear-gradient(135deg, #6366F1, #06B6D4)` |
| warning | Pink → Orange | `linear-gradient(135deg, #F472B6, #FB923C)` |
| action_required | Violet → Pink | `linear-gradient(135deg, #8B5CF6, #EC4899)` |

### Application

| Element | Style |
|---------|-------|
| Left border | 3px solid with gradient |
| Category icons | Gradient fill |
| Unread badge | Indigo→cyan gradient background |
| Action required | Subtle gradient glow + pulse animation |

### CSS Variables

```css
:root {
  --notification-info-start: #6366F1;
  --notification-info-end: #06B6D4;
  --notification-warning-start: #F472B6;
  --notification-warning-end: #FB923C;
  --notification-action-start: #8B5CF6;
  --notification-action-end: #EC4899;
}
```

---

## In-App Notification UI

### Header Bell Icon

- Location: App header, left of user menu
- Badge: Unread count (max "99+")
- Click: Opens dropdown panel
- Animation: Subtle shake on new notification

### Notification Panel

```
┌─────────────────────────────────────────────────────┐
│ Notifications                    [Mark all read] X │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┃ [icon] Quote #1042 approved              2m ago │
│ ┃        Client approved the quote for...    [x]  │
│                                                     │
│ ┃ [icon] Room validation failed            15m ago│
│ ┃        "Conference Room A" has 2 errors    [x]  │
│                                                     │
│ ┃ [icon] New team member                    1h ago│
│ ┃        John Smith joined your org          [x]  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                   [Clear all]                       │
└─────────────────────────────────────────────────────┘
```

### Panel Specifications

| Property | Value |
|----------|-------|
| Max height | 400px |
| Width | 360px |
| Position | Anchored to bell icon |
| Grouping | By category (collapsible) |
| Scroll | Vertical overflow |

### Notification Item

| Element | Description |
|---------|-------------|
| Left border | 3px gradient based on severity |
| Icon | Category-specific, gradient colored |
| Title | Bold, single line, truncate with ellipsis |
| Message | Secondary text, max 2 lines |
| Timestamp | Relative ("2m ago", "1h ago", "Yesterday") |
| Dismiss | X button on hover |

### Interactions

| Action | Result |
|--------|--------|
| Click notification | Mark read + navigate to entity |
| Click X | Dismiss (delete from DB) |
| Click "Mark all read" | Update all is_read = true |
| Click "Clear all" | Delete all notifications |
| Click outside panel | Close panel |

### Empty State

- Checkmark icon
- "You're all caught up!"
- Subtle gradient background

---

## Email Notifications

### Delivery

| Setting | Value |
|---------|-------|
| Timing | Immediate on event |
| Provider | Supabase built-in (or Resend/SendGrid) |
| From address | `notifications@avdesigner.app` |
| Reply-to | `no-reply@avdesigner.app` |

### Template Structure

```html
┌─────────────────────────────────────────┐
│  [AV Designer Logo]                     │
├─────────────────────────────────────────┤
│                                         │
│  {Title}                                │
│                                         │
│  {Message with context}                 │
│                                         │
│  {Entity details table if applicable}   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │       [View in App]             │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│  Manage notification preferences        │
│  Unsubscribe from {category}            │
└─────────────────────────────────────────┘
```

### Subject Lines

| Category | Format | Example |
|----------|--------|---------|
| Quotes | "Quote #{number} - {event}" | "Quote #1042 - Approved" |
| Projects | "Project: {name} - {event}" | "Project: Office Remodel - Created" |
| Rooms | "Room '{name}' - {event}" | "Room 'Conf A' - Validation Failed" |
| Drawings | "Drawings for '{room}' - {event}" | "Drawings for 'Conf A' - Ready" |
| Equipment | "Equipment Update: {name}" | "Equipment Update: Poly Studio X50" |
| Standards | "Standards: {event}" | "Standards: Rule Modified" |
| System | "AV Designer: {event}" | "AV Designer: Update Available" |
| Team | "{org}: {event}" | "Acme Corp: New Member Joined" |

### Deep Links

- Button links to `avdesigner://entity/{type}/{id}`
- Desktop app handles protocol and navigates to entity
- Fallback: Web link if protocol handler fails

### Unsubscribe

- One-click unsubscribe link with signed token
- Updates `notification_preferences` for that category/event
- Confirmation page in app

---

## User Preferences UI

### Location

Settings → Notifications tab

### Layout

```
┌─────────────────────────────────────────────────────┐
│ Notification Preferences                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ▼ Quotes                                           │
│   ┌─────────────────────────────────────────────┐  │
│   │ Event              │ In-App │ Email │       │  │
│   ├────────────────────┼────────┼───────┤       │  │
│   │ Quote created      │  [✓]   │  [ ]  │       │  │
│   │ Status changed     │  [✓]   │  [✓]  │       │  │
│   │ Approval requested │  [✓]   │  [✓]  │  🔒   │  │
│   │ Approved           │  [✓]   │  [✓]  │       │  │
│   │ Rejected           │  [✓]   │  [✓]  │       │  │
│   │ Exported           │  [✓]   │  [ ]  │       │  │
│   └─────────────────────────────────────────────┘  │
│                                                     │
│ ▶ Projects                                         │
│ ▶ Rooms                                            │
│ ▶ Drawings                                         │
│ ▶ Equipment                                        │
│ ▶ Standards                                        │
│ ▶ System                                           │
│ ▶ Team                                             │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ [Reset to Defaults]                         │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Behavior

| Feature | Description |
|---------|-------------|
| Accordion | Categories expand/collapse |
| Toggle switches | For each channel per event |
| Auto-save | Changes save immediately |
| Locked events | 🔒 icon for action_required (in-app cannot be disabled) |
| Reset | Restores all to system defaults |

### Smart Defaults

| Severity | In-App Default | Email Default |
|----------|----------------|---------------|
| action_required | ON (locked) | ON |
| warning | ON | ON |
| info | ON | OFF |

---

## Org Admin Routing Rules

### Location

Settings → Organization → Notification Routing (Owner/Admin only)

### Recipient Rules

| Rule | Description |
|------|-------------|
| `actor_only` | Only the user who triggered or is directly affected |
| `project_team` | All users assigned to the project |
| `role:editor` | All users with Editor role or higher |
| `role:admin` | All users with Admin or Owner role |
| `role:owner` | Only organization Owner(s) |
| `all_members` | Everyone in the organization |

### Admin UI

```
┌─────────────────────────────────────────────────────┐
│ Notification Routing Rules                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Category: [Quotes ▼]                               │
│                                                     │
│ ┌─────────────────────────────────────────────┐    │
│ │ Event              │ Who Gets Notified      │    │
│ ├────────────────────┼────────────────────────┤    │
│ │ Quote created      │ [Project team ▼]       │    │
│ │ Status changed     │ [Project team ▼]       │    │
│ │ Approval requested │ [Admins only ▼]        │    │
│ │ Approved           │ [Project team ▼]       │    │
│ │ Rejected           │ [Project team ▼]       │    │
│ │ Exported           │ [Actor only ▼]         │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ ⓘ Users can still disable their own notifications  │
│   within these rules.                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Default Routing Rules

| Category | Event | Default Rule |
|----------|-------|--------------|
| quotes | created | project_team |
| quotes | status_changed | project_team |
| quotes | approval_requested | role:admin |
| quotes | approved | project_team |
| quotes | rejected | project_team |
| quotes | exported | actor_only |
| projects | created | role:admin |
| projects | archived | project_team |
| projects | client_assigned | project_team |
| projects | deadline_approaching | project_team |
| rooms | * | project_team |
| drawings | * | project_team |
| equipment | * | all_members |
| standards | * | role:admin |
| system | * | all_members |
| team | * | role:admin |

### Rule Hierarchy

1. Org routing rule determines eligible recipients
2. User's personal preferences filter what they receive
3. Result: Notification only sent if both allow it

---

## Technical Implementation

### Notification Creation Flow

```
User Action (e.g., approve quote)
        │
        ▼
Service Layer (quote-service.ts)
        │
        ├──► Update entity in Supabase
        │
        └──► Call notification Edge Function
                    │
                    ▼
            Edge Function: create-notification
                    │
                    ├──► Get org routing rules
                    │
                    ├──► Determine eligible recipients
                    │
                    ├──► Filter by user preferences
                    │
                    ├──► Insert notifications (batch)
                    │
                    └──► Send emails (parallel)
```

### Edge Function: create-notification

**Input Schema**

```typescript
interface CreateNotificationInput {
  org_id: string;
  category: NotificationCategory;
  event_type: string;
  severity: 'info' | 'warning' | 'action_required';
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  actor_id: string;
  project_id?: string;  // Required for project_team routing
  metadata?: Record<string, unknown>;  // Extra context for email
}
```

**Processing Steps**

1. Validate input
2. Fetch org routing rule for category/event
3. Resolve recipients based on rule:
   - `actor_only`: Return actor_id
   - `project_team`: Query project_members table
   - `role:*`: Query organization_members by role
   - `all_members`: Query all organization_members
4. For each recipient:
   - Check notification_preferences
   - If in_app_enabled: Insert to notifications table
   - If email_enabled: Queue email send
5. Send emails in parallel
6. Return success/failure counts

### Real-time Delivery

```typescript
// Frontend subscription
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Add to local state
      queryClient.setQueryData(['notifications'], (old) => [
        payload.new,
        ...old
      ]);
      // Show toast/bell animation
      showNotificationToast(payload.new);
    }
  )
  .subscribe();
```

### Service Integration Points

Each service needs to call notifications after mutations:

```typescript
// Example: quote-service.ts
async approveQuote(quoteId: string): Promise<Quote> {
  const quote = await this.updateQuote(quoteId, { status: 'approved' });

  // Trigger notification
  await supabase.functions.invoke('create-notification', {
    body: {
      org_id: quote.org_id,
      category: 'quotes',
      event_type: 'approved',
      severity: 'info',
      title: `Quote #${quote.number} approved`,
      message: `${quote.client_name} approved the quote for ${quote.project_name}`,
      entity_type: 'quote',
      entity_id: quote.id,
      actor_id: getCurrentUserId(),
      project_id: quote.project_id,
      metadata: {
        quote_number: quote.number,
        total: quote.totals.total
      }
    }
  });

  return quote;
}
```

---

## Frontend Components

### File Structure

```
src/features/notifications/
├── notification-service.ts      # CRUD operations
├── notification-types.ts        # Types and enums
├── use-notifications.ts         # React Query hooks
├── components/
│   ├── NotificationBell.tsx     # Header icon with badge
│   ├── NotificationPanel.tsx    # Dropdown panel
│   ├── NotificationItem.tsx     # Single notification row
│   ├── NotificationPreferences.tsx  # Settings section
│   └── OrgRoutingRules.tsx      # Admin routing config
└── index.ts                     # Public exports
```

### Types

```typescript
// notification-types.ts

type NotificationCategory =
  | 'quotes'
  | 'projects'
  | 'rooms'
  | 'drawings'
  | 'equipment'
  | 'standards'
  | 'system'
  | 'team';

type NotificationSeverity = 'info' | 'warning' | 'action_required';

type RecipientRule =
  | 'actor_only'
  | 'project_team'
  | 'role:editor'
  | 'role:admin'
  | 'role:owner'
  | 'all_members';

interface Notification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  event_type: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationPreference {
  id: string;
  user_id: string;
  category: NotificationCategory;
  event_type: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
}

interface OrgNotificationRule {
  id: string;
  org_id: string;
  category: NotificationCategory;
  event_type: string;
  recipient_rule: RecipientRule;
  created_by: string;
}
```

### Hooks

| Hook | Purpose |
|------|---------|
| `useNotifications()` | Fetch unread notifications |
| `useNotificationCount()` | Just the unread count |
| `useMarkAsRead(id)` | Mark single as read |
| `useMarkAllAsRead()` | Mark all as read |
| `useDismissNotification(id)` | Delete notification |
| `useDismissAllNotifications()` | Delete all |
| `useNotificationPreferences()` | Fetch user prefs |
| `useUpdatePreference()` | Update single pref |
| `useResetPreferences()` | Reset to defaults |
| `useOrgRoutingRules()` | Fetch org rules |
| `useUpdateRoutingRule()` | Update single rule |
| `useRealtimeNotifications()` | Subscribe to new |

### Component Specifications

**NotificationBell**
- Props: None (uses hooks internally)
- Renders: Bell icon + badge
- State: Panel open/closed

**NotificationPanel**
- Props: `isOpen`, `onClose`
- Renders: Notification list, actions
- Features: Virtual scroll for performance

**NotificationItem**
- Props: `notification`, `onMarkRead`, `onDismiss`, `onNavigate`
- Renders: Single notification row
- Features: Gradient border, hover states

**NotificationPreferences**
- Props: None
- Renders: Accordion with toggles
- Location: Settings page

**OrgRoutingRules**
- Props: None
- Renders: Category selector + rules table
- Location: Org settings (admin only)

---

## File Changes Required

### New Files

```
supabase/
├── migrations/
│   └── 003_notifications.sql           # Tables, RLS, indexes
└── functions/
    └── create-notification/
        └── index.ts                     # Edge function

src/features/notifications/
├── notification-service.ts             # ~100 lines
├── notification-types.ts               # ~60 lines
├── use-notifications.ts                # ~150 lines
├── components/
│   ├── NotificationBell.tsx            # ~80 lines
│   ├── NotificationPanel.tsx           # ~150 lines
│   ├── NotificationItem.tsx            # ~100 lines
│   ├── NotificationPreferences.tsx     # ~200 lines
│   └── OrgRoutingRules.tsx             # ~180 lines
└── index.ts                            # ~20 lines

src/styles/features/
└── notifications.css                    # ~150 lines
```

### Modified Files

```
src/components/layout/Header.tsx        # Add NotificationBell
src/pages/SettingsPage.tsx              # Add Notifications tab
src/features/quoting/quote-service.ts   # Add notification calls
src/features/room-builder/room-service.ts
src/features/drawings/drawing-service.ts
src/features/equipment/equipment-service.ts
src/features/standards/standards-service.ts
```

---

## Testing

### Estimated Test Count: ~150 tests

| File | Tests |
|------|-------|
| notification-service.test.ts | 20 |
| notification-types.test.ts | 15 |
| use-notifications.test.tsx | 25 |
| NotificationBell.test.tsx | 20 |
| NotificationPanel.test.tsx | 25 |
| NotificationItem.test.tsx | 20 |
| NotificationPreferences.test.tsx | 30 |
| OrgRoutingRules.test.tsx | 25 |

### Test Categories

- Service: CRUD operations, error handling
- Hooks: Query states, mutations, realtime
- Components: Rendering, interactions, accessibility
- Integration: End-to-end notification flow

---

## Implementation Order

1. **Database**: Migration with tables, RLS, indexes
2. **Types**: notification-types.ts
3. **Edge Function**: create-notification
4. **Service**: notification-service.ts
5. **Hooks**: use-notifications.ts
6. **Components**: Bell → Panel → Item → Preferences → Routing
7. **Integration**: Add notification calls to existing services
8. **Styles**: notifications.css
9. **Tests**: All test files
