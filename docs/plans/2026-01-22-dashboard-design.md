# Dashboard Design

**Date:** 2026-01-22
**Status:** Approved

---

## Overview

Replace the current HomePage (design system showcase) with a functional dashboard that provides operations tracking, business metrics, and quick actions for AV Designer users.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Quick Actions Bar                                       │
│  [+ New Project] [+ New Room] [Apply Template ▾] [🔍 Search]    │
├─────────────────────────────────┬───────────────────────────────┤
│  LEFT COLUMN (2/3 width)        │  RIGHT COLUMN (1/3 width)     │
│                                 │                               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐  │
│  │ Summary Stats Cards     │   │  │ Notifications           │  │
│  │ (4 cards in a row)      │   │  │ (unread count + list)   │  │
│  └─────────────────────────┘   │  └─────────────────────────┘  │
│                                 │                               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐  │
│  │ Project Pipeline        │   │  │ My Tasks                │  │
│  │ (status breakdown)      │   │  │ (assigned items)        │  │
│  └─────────────────────────┘   │  └─────────────────────────┘  │
│                                 │                               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐  │
│  │ Recent Activity Feed    │   │  │ Quote Pipeline          │  │
│  │ (timeline of events)    │   │  │ (status + values)       │  │
│  └─────────────────────────┘   │  └─────────────────────────┘  │
│                                 │                               │
│  ┌─────────────────────────┐   │                               │
│  │ Recent Projects         │   │                               │
│  │ (cards with status)     │   │                               │
│  └─────────────────────────┘   │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

Responsive: On smaller screens, right column stacks below left column.

---

## Components

### 1. Quick Actions Bar

Location: Top of dashboard

Elements:
- **New Project** button (primary) → navigates to `/projects?new=true`
- **New Room** button (secondary) → dropdown to select project, then create room
- **Apply Template** dropdown → lists recent templates (room, equipment, project)
- **Search** input → global search across projects, clients, equipment

### 2. Summary Stats Cards

Four cards in a horizontal row:

| Card | Data Source | Click Action |
|------|-------------|--------------|
| Active Projects | `useProjectList` filtered by active statuses | Navigate to `/projects` |
| Pending Quotes | `useQuotesList` filtered by draft/quoting/client_review | Navigate to `/projects` with quote filter |
| Unread Notifications | `useNotificationCount` (auto-refreshes 30s) | Scroll to notifications panel |
| Tasks Due | `useProjectTasks` filtered by assignee + due date | Scroll to tasks panel |

Card design:
- Large number prominently displayed
- Label below
- Subtle hover effect
- Click navigates or scrolls

### 3. Project Pipeline

Visual breakdown of projects by status.

Display: Horizontal stacked bar or segmented pills

Statuses (with existing pill colors):
- Draft (neutral)
- Quoting (yellow)
- Client Review (blue)
- Ordered (green)
- In Progress (blue)
- On Hold (gray)
- Completed (green)
- Cancelled (red)

Interactions:
- Hover shows count for segment
- Click filters to show those projects

Data: `useProjectList` grouped by status

### 4. Recent Activity Feed

Timeline of recent events across user's projects.

Display: Vertical list with timeline styling

Each item shows:
- Event type icon (create, update, status, task, comment, file, team)
- Description text
- Project name (linked)
- Relative timestamp ("2 hours ago")

Event types supported:
- `created` - Project/room/quote created
- `updated` - Entity updated
- `status_changed` - Status transition
- `task_created`, `task_completed`, `task_assigned`
- `comment_added`
- `file_uploaded`
- `team_member_added`

Limit: 10 most recent events
Data: `useProjectActivity` aggregated across projects

### 5. Notifications Panel

Header: "Notifications" with unread count badge

List of 5 most recent notifications:
- Category icon (project, quote, system, team)
- Title (bold)
- Brief message
- Relative timestamp
- Unread indicator dot (left side)

Actions:
- "Mark all read" link in header
- "View all" link at bottom
- Click notification → navigate to relevant item

Data: `useUnreadNotifications` with 30-second auto-refresh

### 6. My Tasks Panel

Header: "My Tasks" with count

List of assigned tasks:
- Checkbox (quick complete)
- Task title
- Project name (linked, smaller text)
- Status pill (pending, in_progress, blocked)
- Due date (red if overdue)

Actions:
- Checkbox marks task complete
- "View all" link at bottom

Data: `useProjectTasks` filtered by current user as assignee

### 7. Quote Pipeline Panel

Breakdown of quotes by status with monetary values.

Display: Vertical list with status rows

Each row:
- Status pill
- Quote count
- Total value (formatted currency)

Rows:
- Draft: X quotes ($XX,XXX)
- Quoting: X quotes ($XX,XXX)
- Client Review: X quotes ($XX,XXX)
- Approved: X quotes ($XX,XXX)
- Ordered: X quotes ($XX,XXX)

Footer: Total pipeline value

Interactions:
- Click row → navigate to quotes filtered by status

Data: `useQuotesList` with aggregation by status

### 8. Recent Projects

Grid of project cards.

Layout:
- 3 columns on large screens
- 2 columns on medium
- 1 column on mobile

Card content:
- Project name (linked to detail)
- Client name
- Status pill
- Room count badge
- Last updated timestamp
- Quick action: "Open Latest Room" (if rooms exist)

Limit: 6 most recent
Footer: "View All Projects" link

Data: `useProjectList` sorted by `updated_at` desc, limit 6

---

## File Structure

```
src/
├── pages/
│   └── HomePage.tsx              # Replace with dashboard composition
├── features/
│   └── dashboard/                # New feature module
│       ├── components/
│       │   ├── QuickActionsBar.tsx      (~120 lines)
│       │   ├── SummaryStatsCards.tsx    (~150 lines)
│       │   ├── ProjectPipeline.tsx      (~100 lines)
│       │   ├── ActivityFeed.tsx         (~150 lines)
│       │   ├── NotificationsPanel.tsx   (~130 lines)
│       │   ├── MyTasksPanel.tsx         (~140 lines)
│       │   ├── QuotePipelinePanel.tsx   (~120 lines)
│       │   └── RecentProjects.tsx       (~130 lines)
│       ├── hooks/
│       │   └── use-dashboard-data.ts    (~80 lines) - aggregates queries
│       └── index.ts
└── styles/
    └── features/
        └── dashboard.css                (~200 lines)
```

---

## Data Hooks

### use-dashboard-data.ts

Aggregates multiple queries for dashboard:

```typescript
interface DashboardData {
  stats: {
    activeProjects: number;
    pendingQuotes: number;
    unreadNotifications: number;
    tasksDueThisWeek: number;
  };
  projectsByStatus: Record<ProjectStatus, number>;
  quotesByStatus: Record<QuoteStatus, { count: number; value: number }>;
  recentActivity: ActivityEvent[];
  recentProjects: Project[];
  myTasks: Task[];
  notifications: Notification[];
  isLoading: boolean;
  error: Error | null;
}

function useDashboardData(): DashboardData
```

Uses parallel queries with React Query's `useQueries` for optimal loading.

---

## Styling Approach

Follow existing design system:
- Use Tailwind CSS classes
- Dark theme colors from `primitives.css`
- Card component for panels
- Existing pill styles for statuses
- Consistent spacing (gap-4, gap-6)

New styles in `dashboard.css`:
- `.dashboard-grid` - main layout grid
- `.dashboard-stats` - stats card row
- `.dashboard-panel` - right column panels
- `.activity-item` - activity feed items
- `.pipeline-segment` - pipeline bar segments

---

## Implementation Order

1. Create `src/features/dashboard/` structure
2. Implement `use-dashboard-data.ts` hook
3. Build components in order:
   - SummaryStatsCards (simplest, establishes pattern)
   - RecentProjects (reuses existing patterns)
   - ProjectPipeline
   - QuotePipelinePanel
   - NotificationsPanel
   - MyTasksPanel
   - ActivityFeed
   - QuickActionsBar
4. Create `dashboard.css` styles
5. Compose in HomePage.tsx
6. Test with mock data, then real data

---

## Dependencies

Existing hooks to use:
- `useProjectList` from `src/features/projects/`
- `useQuotesList` from `src/features/quoting/`
- `useNotifications`, `useNotificationCount` from `src/features/notifications/`
- `useProjectTasks` from `src/features/projects/`
- `useProjectActivity` from `src/features/projects/`

Existing components to reuse:
- `Card`, `CardHeader`, `CardBody` from `src/components/ui/`
- `Button` from `src/components/ui/`
- Status pills from design system
- `Input` for search

---

## Acceptance Criteria

- [ ] Dashboard loads without errors
- [ ] All 4 summary stats display correct counts
- [ ] Project pipeline shows accurate status breakdown
- [ ] Activity feed shows recent events with correct formatting
- [ ] Notifications panel shows unread items with auto-refresh
- [ ] My Tasks panel shows assigned tasks with quick complete
- [ ] Quote pipeline shows status breakdown with values
- [ ] Recent projects displays 6 most recent with status
- [ ] Quick actions navigate to correct destinations
- [ ] Responsive layout works on all screen sizes
- [ ] Loading states shown while data fetches
- [ ] Empty states shown when no data
- [ ] Error states handled gracefully
