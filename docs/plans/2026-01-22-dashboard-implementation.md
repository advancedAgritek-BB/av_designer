# Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the design system showcase HomePage with a functional dashboard displaying projects, quotes, tasks, notifications, and activity.

**Architecture:** Feature module at `src/features/dashboard/` with 8 small components, 1 aggregating hook, and dedicated CSS. Components use existing React Query hooks from projects, quotes, notifications, and workstreams features.

**Tech Stack:** React 19, TypeScript 5, React Query 5, Tailwind CSS 4, existing Supabase hooks

---

## Task 1: Create Dashboard Feature Structure

**Files:**
- Create: `src/features/dashboard/index.ts`
- Create: `src/features/dashboard/hooks/use-dashboard-data.ts`
- Create: `src/styles/features/dashboard.css`
- Modify: `src/styles/globals.css` (add import)

**Step 1: Create the feature index file**

```typescript
// src/features/dashboard/index.ts
export { useDashboardData } from './hooks/use-dashboard-data';
```

**Step 2: Create the dashboard data hook skeleton**

```typescript
// src/features/dashboard/hooks/use-dashboard-data.ts
/**
 * Dashboard Data Hook
 * Aggregates multiple queries for the dashboard
 */

import { useProjectList } from '@/features/projects/use-projects';
import { useQuotesList } from '@/features/quoting/use-quotes';
import {
  useNotificationCount,
  useUnreadNotifications,
} from '@/features/notifications/use-notifications';
import { useAuthStore } from '@/features/auth/auth-store';
import type { ProjectExtended } from '@/features/projects/project-types';
import type { Quote, QuoteStatus } from '@/types/quote';
import type { Notification } from '@/features/notifications/notification-types';

export interface DashboardStats {
  activeProjects: number;
  pendingQuotes: number;
  unreadNotifications: number;
  tasksDueThisWeek: number;
}

export interface QuotePipelineItem {
  status: QuoteStatus;
  count: number;
  value: number;
}

export interface DashboardData {
  stats: DashboardStats;
  projectsByStatus: Record<string, number>;
  quotePipeline: QuotePipelineItem[];
  recentProjects: ProjectExtended[];
  notifications: Notification[];
  isLoading: boolean;
  error: Error | null;
}

const ACTIVE_PROJECT_STATUSES = [
  'draft',
  'quoting',
  'client_review',
  'ordered',
  'in_progress',
];

const PENDING_QUOTE_STATUSES: QuoteStatus[] = ['draft', 'quoting', 'client_review'];

export function useDashboardData(): DashboardData {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? '';

  const projectsQuery = useProjectList();
  const quotesQuery = useQuotesList();
  const notificationCountQuery = useNotificationCount(userId);
  const notificationsQuery = useUnreadNotifications(userId);

  const projects = (projectsQuery.data ?? []) as ProjectExtended[];
  const quotes = (quotesQuery.data ?? []) as Quote[];
  const notifications = (notificationsQuery.data ?? []) as Notification[];

  // Calculate stats
  const activeProjects = projects.filter((p) =>
    ACTIVE_PROJECT_STATUSES.includes(p.status)
  ).length;

  const pendingQuotes = quotes.filter((q) =>
    PENDING_QUOTE_STATUSES.includes(q.status)
  ).length;

  // Group projects by status
  const projectsByStatus = projects.reduce(
    (acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Group quotes by status with values
  const quotesByStatus = quotes.reduce(
    (acc, quote) => {
      if (!acc[quote.status]) {
        acc[quote.status] = { count: 0, value: 0 };
      }
      acc[quote.status].count += 1;
      acc[quote.status].value += quote.totals.total;
      return acc;
    },
    {} as Record<QuoteStatus, { count: number; value: number }>
  );

  const quotePipeline: QuotePipelineItem[] = (
    ['draft', 'quoting', 'client_review', 'approved', 'ordered'] as QuoteStatus[]
  ).map((status) => ({
    status,
    count: quotesByStatus[status]?.count ?? 0,
    value: quotesByStatus[status]?.value ?? 0,
  }));

  // Recent projects (sorted by updatedAt, limit 6)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const stats: DashboardStats = {
    activeProjects,
    pendingQuotes,
    unreadNotifications: notificationCountQuery.data ?? 0,
    tasksDueThisWeek: 0, // Will be implemented with tasks query
  };

  const isLoading =
    projectsQuery.isLoading ||
    quotesQuery.isLoading ||
    notificationsQuery.isLoading;

  const error =
    projectsQuery.error || quotesQuery.error || notificationsQuery.error || null;

  return {
    stats,
    projectsByStatus,
    quotePipeline,
    recentProjects,
    notifications: notifications.slice(0, 5),
    isLoading,
    error,
  };
}
```

**Step 3: Create dashboard CSS file**

```css
/* src/styles/features/dashboard.css */
/**
 * Dashboard Styles
 */

.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-6);
  max-width: 1400px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-6);
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.stat-card:hover {
  border-color: var(--color-accent-gold);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

/* Pipeline */
.pipeline-bar {
  display: flex;
  height: 8px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.pipeline-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.pipeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  margin-top: var(--spacing-3);
}

.pipeline-legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.pipeline-legend-item:hover {
  color: var(--color-text-primary);
}

.pipeline-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

/* Panel styles */
.dashboard-panel {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
}

.panel-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.panel-badge {
  background: var(--color-accent-gold);
  color: var(--color-bg-primary);
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.panel-body {
  padding: var(--spacing-4);
}

.panel-footer {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.panel-link {
  font-size: var(--text-sm);
  color: var(--color-accent-gold);
  text-decoration: none;
}

.panel-link:hover {
  text-decoration: underline;
}

/* Notification item */
.notification-item {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-accent-gold);
  flex-shrink: 0;
  margin-top: 6px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-message {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

/* Quote pipeline row */
.quote-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.quote-row:last-child {
  border-bottom: none;
}

.quote-row:hover {
  background: var(--color-bg-tertiary);
  margin: 0 calc(-1 * var(--spacing-4));
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

.quote-row-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.quote-row-count {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.quote-row-value {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.quote-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-3);
  margin-top: var(--spacing-2);
  border-top: 1px solid var(--color-border);
  font-weight: 600;
}

/* Recent projects grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
}

@media (max-width: 1200px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}

.project-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.project-card:hover {
  border-color: var(--color-accent-gold);
}

.project-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.project-card-name {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-card-client {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-3);
}

.project-card-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

/* Activity feed */
.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.activity-text strong {
  font-weight: 500;
}

.activity-project {
  color: var(--color-accent-gold);
  text-decoration: none;
}

.activity-project:hover {
  text-decoration: underline;
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--spacing-8) var(--spacing-4);
  color: var(--color-text-secondary);
}

.empty-state-icon {
  font-size: var(--text-3xl);
  margin-bottom: var(--spacing-2);
  opacity: 0.5;
}

.empty-state-text {
  font-size: var(--text-sm);
}
```

**Step 4: Add CSS import to globals.css**

Add this import to `src/styles/globals.css` in the features section:

```css
@import './features/dashboard.css';
```

**Step 5: Commit**

```bash
git add src/features/dashboard/ src/styles/features/dashboard.css src/styles/globals.css
git commit -m "feat(dashboard): add feature structure, hook, and styles"
```

---

## Task 2: Create SummaryStatsCards Component

**Files:**
- Create: `src/features/dashboard/components/SummaryStatsCards.tsx`
- Modify: `src/features/dashboard/index.ts` (add export)

**Step 1: Create the component**

```typescript
// src/features/dashboard/components/SummaryStatsCards.tsx
/**
 * Summary Stats Cards
 * Displays 4 key metrics at the top of the dashboard
 */

import type { DashboardStats } from '../hooks/use-dashboard-data';

interface SummaryStatsCardsProps {
  stats: DashboardStats;
  onStatClick: (stat: keyof DashboardStats) => void;
}

interface StatCardProps {
  value: number;
  label: string;
  onClick: () => void;
}

function StatCard({ value, label, onClick }: StatCardProps) {
  return (
    <button type="button" className="stat-card" onClick={onClick}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </button>
  );
}

export function SummaryStatsCards({ stats, onStatClick }: SummaryStatsCardsProps) {
  return (
    <div className="stats-grid">
      <StatCard
        value={stats.activeProjects}
        label="Active Projects"
        onClick={() => onStatClick('activeProjects')}
      />
      <StatCard
        value={stats.pendingQuotes}
        label="Pending Quotes"
        onClick={() => onStatClick('pendingQuotes')}
      />
      <StatCard
        value={stats.unreadNotifications}
        label="Notifications"
        onClick={() => onStatClick('unreadNotifications')}
      />
      <StatCard
        value={stats.tasksDueThisWeek}
        label="Tasks Due"
        onClick={() => onStatClick('tasksDueThisWeek')}
      />
    </div>
  );
}
```

**Step 2: Update index.ts**

```typescript
// src/features/dashboard/index.ts
export { useDashboardData } from './hooks/use-dashboard-data';
export { SummaryStatsCards } from './components/SummaryStatsCards';
```

**Step 3: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat(dashboard): add SummaryStatsCards component"
```

---

## Task 3: Create ProjectPipeline Component

**Files:**
- Create: `src/features/dashboard/components/ProjectPipeline.tsx`
- Modify: `src/features/dashboard/index.ts` (add export)

**Step 1: Create the component**

```typescript
// src/features/dashboard/components/ProjectPipeline.tsx
/**
 * Project Pipeline
 * Visual breakdown of projects by status
 */

import type { ProjectStatusExtended } from '@/features/projects/project-types';

interface ProjectPipelineProps {
  projectsByStatus: Record<string, number>;
  onStatusClick: (status: ProjectStatusExtended) => void;
}

const STATUS_CONFIG: Record<
  ProjectStatusExtended,
  { label: string; color: string }
> = {
  draft: { label: 'Draft', color: 'var(--color-text-tertiary)' },
  quoting: { label: 'Quoting', color: 'var(--color-status-warning)' },
  client_review: { label: 'Client Review', color: 'var(--color-accent-blue)' },
  ordered: { label: 'Ordered', color: 'var(--color-status-success)' },
  in_progress: { label: 'In Progress', color: 'var(--color-accent-blue)' },
  on_hold: { label: 'On Hold', color: 'var(--color-text-secondary)' },
  completed: { label: 'Completed', color: 'var(--color-status-success)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-status-error)' },
};

const STATUS_ORDER: ProjectStatusExtended[] = [
  'draft',
  'quoting',
  'client_review',
  'ordered',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
];

export function ProjectPipeline({
  projectsByStatus,
  onStatusClick,
}: ProjectPipelineProps) {
  const total = Object.values(projectsByStatus).reduce((sum, count) => sum + count, 0);

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <span className="panel-title">Project Pipeline</span>
        <span className="panel-badge">{total} total</span>
      </div>
      <div className="panel-body">
        {total > 0 ? (
          <>
            <div className="pipeline-bar">
              {STATUS_ORDER.map((status) => {
                const count = projectsByStatus[status] || 0;
                if (count === 0) return null;
                const width = (count / total) * 100;
                return (
                  <div
                    key={status}
                    className="pipeline-segment"
                    style={{
                      width: `${width}%`,
                      backgroundColor: STATUS_CONFIG[status].color,
                    }}
                    title={`${STATUS_CONFIG[status].label}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="pipeline-legend">
              {STATUS_ORDER.map((status) => {
                const count = projectsByStatus[status] || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={status}
                    type="button"
                    className="pipeline-legend-item"
                    onClick={() => onStatusClick(status)}
                  >
                    <span
                      className="pipeline-dot"
                      style={{ backgroundColor: STATUS_CONFIG[status].color }}
                    />
                    <span>
                      {STATUS_CONFIG[status].label} ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-text">No projects yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Update index.ts**

```typescript
// src/features/dashboard/index.ts
export { useDashboardData } from './hooks/use-dashboard-data';
export { SummaryStatsCards } from './components/SummaryStatsCards';
export { ProjectPipeline } from './components/ProjectPipeline';
```

**Step 3: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat(dashboard): add ProjectPipeline component"
```

---

## Task 4: Create NotificationsPanel Component

**Files:**
- Create: `src/features/dashboard/components/NotificationsPanel.tsx`
- Modify: `src/features/dashboard/index.ts` (add export)

**Step 1: Create the component**

```typescript
// src/features/dashboard/components/NotificationsPanel.tsx
/**
 * Notifications Panel
 * Shows recent unread notifications
 */

import { Link } from 'react-router-dom';
import { useMarkAllAsRead } from '@/features/notifications/use-notifications';
import { useAuthStore } from '@/features/auth/auth-store';
import type { Notification } from '@/features/notifications/notification-types';

interface NotificationsPanelProps {
  notifications: Notification[];
  unreadCount: number;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationsPanel({
  notifications,
  unreadCount,
}: NotificationsPanelProps) {
  const user = useAuthStore((state) => state.user);
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAllRead = () => {
    if (user?.id) {
      markAllAsRead.mutate(user.id);
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <span className="panel-title">Notifications</span>
        {unreadCount > 0 && <span className="panel-badge">{unreadCount}</span>}
      </div>
      <div className="panel-body">
        {notifications.length > 0 ? (
          <>
            {unreadCount > 0 && (
              <button
                type="button"
                className="panel-link"
                onClick={handleMarkAllRead}
                style={{ display: 'block', marginBottom: 'var(--spacing-3)' }}
              >
                Mark all as read
              </button>
            )}
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                {!notification.readAt && <div className="notification-dot" />}
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                </div>
                <span className="notification-time">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
            ))}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-text">No notifications</div>
          </div>
        )}
      </div>
      <div className="panel-footer">
        <Link to="/settings" className="panel-link">
          View all notifications
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Update index.ts**

```typescript
// src/features/dashboard/index.ts
export { useDashboardData } from './hooks/use-dashboard-data';
export { SummaryStatsCards } from './components/SummaryStatsCards';
export { ProjectPipeline } from './components/ProjectPipeline';
export { NotificationsPanel } from './components/NotificationsPanel';
```

**Step 3: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat(dashboard): add NotificationsPanel component"
```

---

## Task 5: Create QuotePipelinePanel Component

**Files:**
- Create: `src/features/dashboard/components/QuotePipelinePanel.tsx`
- Modify: `src/features/dashboard/index.ts` (add export)

**Step 1: Create the component**

```typescript
// src/features/dashboard/components/QuotePipelinePanel.tsx
/**
 * Quote Pipeline Panel
 * Shows quote status breakdown with values
 */

import type { QuoteStatus } from '@/types/quote';
import type { QuotePipelineItem } from '../hooks/use-dashboard-data';

interface QuotePipelinePanelProps {
  pipeline: QuotePipelineItem[];
  onStatusClick: (status: QuoteStatus) => void;
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Draft',
  quoting: 'Quoting',
  client_review: 'Client Review',
  approved: 'Approved',
  ordered: 'Ordered',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusPillClass(status: QuoteStatus): string {
  switch (status) {
    case 'draft':
      return 'pill';
    case 'quoting':
      return 'pill pill-quoting';
    case 'client_review':
      return 'pill pill-review';
    case 'approved':
      return 'pill pill-ordered';
    case 'ordered':
      return 'pill pill-progress';
    default:
      return 'pill';
  }
}

export function QuotePipelinePanel({
  pipeline,
  onStatusClick,
}: QuotePipelinePanelProps) {
  const totalValue = pipeline.reduce((sum, item) => sum + item.value, 0);
  const totalCount = pipeline.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <span className="panel-title">Quote Pipeline</span>
        <span className="panel-badge">{totalCount} quotes</span>
      </div>
      <div className="panel-body">
        {totalCount > 0 ? (
          <>
            {pipeline.map((item) => (
              <button
                key={item.status}
                type="button"
                className="quote-row"
                onClick={() => onStatusClick(item.status)}
              >
                <div className="quote-row-label">
                  <span className={getStatusPillClass(item.status)}>
                    {STATUS_LABELS[item.status]}
                  </span>
                  <span className="quote-row-count">({item.count})</span>
                </div>
                <span className="quote-row-value">{formatCurrency(item.value)}</span>
              </button>
            ))}
            <div className="quote-total">
              <span>Total Pipeline</span>
              <span>{formatCurrency(totalValue)}</span>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-text">No quotes yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Update index.ts**

```typescript
// src/features/dashboard/index.ts
export { useDashboardData } from './hooks/use-dashboard-data';
export { SummaryStatsCards } from './components/SummaryStatsCards';
export { ProjectPipeline } from './components/ProjectPipeline';
export { NotificationsPanel } from './components/NotificationsPanel';
export { QuotePipelinePanel } from './components/QuotePipelinePanel';
```

**Step 3: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat(dashboard): add QuotePipelinePanel component"
```

---

## Task 6: Create RecentProjects Component

**Files:**
- Create: `src/features/dashboard/components/RecentProjects.tsx`
- Modify: `src/features/dashboard/index.ts` (add export)

**Step 1: Create the component**

```typescript
// src/features/dashboard/components/RecentProjects.tsx
/**
 * Recent Projects
 * Grid of recently updated project cards
 */

import { Link, useNavigate } from 'react-router-dom';
import type { ProjectExtended, ProjectStatusExtended } from '@/features/projects/project-types';

interface RecentProjectsProps {
  projects: ProjectExtended[];
}

function getStatusPillClass(status: ProjectStatusExtended): string {
  switch (status) {
    case 'quoting':
      return 'pill pill-quoting';
    case 'client_review':
      return 'pill pill-review';
    case 'ordered':
      return 'pill pill-ordered';
    case 'in_progress':
      return 'pill pill-progress';
    case 'on_hold':
      return 'pill pill-hold';
    case 'completed':
      return 'pill pill-ordered';
    case 'cancelled':
      return 'pill';
    default:
      return 'pill';
  }
}

function formatStatusLabel(status: ProjectStatusExtended): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="panel-header" style={{ padding: 0, border: 'none', marginBottom: 'var(--spacing-4)' }}>
        <span className="panel-title">Recent Projects</span>
        <Link to="/projects" className="panel-link">
          View all
        </Link>
      </div>
      {projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-card-header">
                <span className="project-card-name">{project.name}</span>
                <span className={getStatusPillClass(project.status)}>
                  {formatStatusLabel(project.status)}
                </span>
              </div>
              <div className="project-card-client">{project.clientName || 'No client'}</div>
              <div className="project-card-footer">
                <span className="project-card-time">
                  Updated {formatRelativeTime(project.updatedAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-text">No projects yet</div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Update index.ts**

```typescript
// src/features/dashboard/index.ts
export { useDashboardData } from './hooks/use-dashboard-data';
export { SummaryStatsCards } from './components/SummaryStatsCards';
export { ProjectPipeline } from './components/ProjectPipeline';
export { NotificationsPanel } from './components/NotificationsPanel';
export { QuotePipelinePanel } from './components/QuotePipelinePanel';
export { RecentProjects } from './components/RecentProjects';
```

**Step 3: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat(dashboard): add RecentProjects component"
```

---

## Task 7: Create QuickActionsBar Component

**Files:**
- Create: `src/features/dashboard/components/QuickActionsBar.tsx`
- Modify: `src/features/dashboard/index.ts` (add export)

**Step 1: Create the component**

```typescript
// src/features/dashboard/components/QuickActionsBar.tsx
/**
 * Quick Actions Bar
 * Top bar with create buttons and search
 */

import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';

interface QuickActionsBarProps {
  onSearchChange?: (query: string) => void;
}

export function QuickActionsBar({ onSearchChange }: QuickActionsBarProps) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-header">
      <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
      <div className="dashboard-actions">
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/projects?new=true')}
        >
          + New Project
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/rooms/new')}
        >
          + New Room
        </Button>
        <div style={{ width: 200 }}>
          <Input
            placeholder="Search..."
            size="sm"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update index.ts**

```typescript
// src/features/dashboard/index.ts
export { useDashboardData } from './hooks/use-dashboard-data';
export { SummaryStatsCards } from './components/SummaryStatsCards';
export { ProjectPipeline } from './components/ProjectPipeline';
export { NotificationsPanel } from './components/NotificationsPanel';
export { QuotePipelinePanel } from './components/QuotePipelinePanel';
export { RecentProjects } from './components/RecentProjects';
export { QuickActionsBar } from './components/QuickActionsBar';
```

**Step 3: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat(dashboard): add QuickActionsBar component"
```

---

## Task 8: Update HomePage to Use Dashboard Components

**Files:**
- Modify: `src/pages/HomePage.tsx`

**Step 1: Replace HomePage content**

```typescript
// src/pages/HomePage.tsx
/**
 * Home Page - Dashboard
 *
 * Main dashboard view with stats, projects, quotes, and activity
 */

import { useNavigate } from 'react-router-dom';
import {
  useDashboardData,
  QuickActionsBar,
  SummaryStatsCards,
  ProjectPipeline,
  NotificationsPanel,
  QuotePipelinePanel,
  RecentProjects,
} from '@/features/dashboard';
import type { DashboardStats } from '@/features/dashboard/hooks/use-dashboard-data';
import type { ProjectStatusExtended } from '@/features/projects/project-types';
import type { QuoteStatus } from '@/types/quote';

export function HomePage() {
  const navigate = useNavigate();
  const {
    stats,
    projectsByStatus,
    quotePipeline,
    recentProjects,
    notifications,
    isLoading,
  } = useDashboardData();

  const handleStatClick = (stat: keyof DashboardStats) => {
    switch (stat) {
      case 'activeProjects':
        navigate('/projects');
        break;
      case 'pendingQuotes':
        navigate('/projects?filter=quotes');
        break;
      case 'unreadNotifications':
        // Scroll to notifications panel or open modal
        document.getElementById('notifications-panel')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'tasksDueThisWeek':
        navigate('/projects?filter=tasks');
        break;
    }
  };

  const handleProjectStatusClick = (status: ProjectStatusExtended) => {
    navigate(`/projects?status=${status}`);
  };

  const handleQuoteStatusClick = (status: QuoteStatus) => {
    navigate(`/projects?quoteStatus=${status}`);
  };

  if (isLoading) {
    return (
      <div className="dashboard" data-testid="home-page">
        <div className="text-text-secondary">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard" data-testid="home-page">
      <QuickActionsBar />

      <SummaryStatsCards stats={stats} onStatClick={handleStatClick} />

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <ProjectPipeline
            projectsByStatus={projectsByStatus}
            onStatusClick={handleProjectStatusClick}
          />
          <RecentProjects projects={recentProjects} />
        </div>

        <div className="dashboard-sidebar">
          <div id="notifications-panel">
            <NotificationsPanel
              notifications={notifications}
              unreadCount={stats.unreadNotifications}
            />
          </div>
          <QuotePipelinePanel
            pipeline={quotePipeline}
            onStatusClick={handleQuoteStatusClick}
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(dashboard): integrate dashboard components into HomePage"
```

---

## Task 9: Final Integration and Testing

**Step 1: Run type check**

```bash
npm run typecheck
```

Expected: No type errors

**Step 2: Run linter**

```bash
npm run lint
```

Expected: No lint errors

**Step 3: Run tests**

```bash
npm run test
```

Expected: All existing tests pass

**Step 4: Start dev server and verify**

```bash
npm run dev
```

Manual verification:
- Dashboard loads without errors
- Stats cards show counts
- Project pipeline shows status breakdown
- Notifications panel shows unread items
- Quote pipeline shows status and values
- Recent projects grid displays correctly
- Click actions navigate appropriately
- Responsive layout works at different sizes

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(dashboard): complete dashboard implementation"
```

---

## Summary

| Task | Component | Lines |
|------|-----------|-------|
| 1 | Feature structure + hook + CSS | ~280 |
| 2 | SummaryStatsCards | ~45 |
| 3 | ProjectPipeline | ~95 |
| 4 | NotificationsPanel | ~85 |
| 5 | QuotePipelinePanel | ~80 |
| 6 | RecentProjects | ~85 |
| 7 | QuickActionsBar | ~40 |
| 8 | HomePage integration | ~75 |
| 9 | Testing & verification | - |

**Total new code:** ~785 lines across 9 files
