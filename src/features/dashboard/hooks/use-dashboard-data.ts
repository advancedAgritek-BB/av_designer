/**
 * Dashboard Data Hook
 *
 * Aggregates data from multiple feature queries to provide
 * a unified dashboard state for the home page.
 */

import { useMemo } from 'react';
import { useProjectList } from '@/features/projects/use-projects';
import { useQuotesList } from '@/features/quoting/use-quotes';
import { useNotificationCount, useUnreadNotifications } from '@/features/notifications/use-notifications';
import { useAuthStore } from '@/features/auth/auth-store';
import type { Project, ProjectStatus } from '@/types';
import type { Quote, QuoteStatus } from '@/types/quote';
import type { Notification } from '@/features/notifications/notification-types';

// ============================================================================
// Types
// ============================================================================

/**
 * Summary statistics for the dashboard header cards
 */
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  totalQuotes: number;
  quotesValue: number;
  pendingApprovalCount: number;
  notificationCount: number;
}

/**
 * Quote pipeline item for the quote status visualization
 */
export interface QuotePipelineItem {
  status: QuoteStatus;
  count: number;
  totalValue: number;
  quotes: Quote[];
}

/**
 * Complete dashboard data structure
 */
export interface DashboardData {
  stats: DashboardStats;
  recentProjects: Project[];
  quotePipeline: QuotePipelineItem[];
  unreadNotifications: Notification[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// ============================================================================
// Constants
// ============================================================================

const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  'quoting',
  'client_review',
  'ordered',
  'in_progress',
];

const QUOTE_STATUS_ORDER: QuoteStatus[] = [
  'draft',
  'quoting',
  'client_review',
  'approved',
  'ordered',
];

const RECENT_PROJECTS_LIMIT = 5;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Count projects by their status
 */
function countProjectsByStatus(
  projects: Project[]
): Record<ProjectStatus, number> {
  const counts: Record<ProjectStatus, number> = {
    draft: 0,
    quoting: 0,
    client_review: 0,
    ordered: 0,
    in_progress: 0,
    on_hold: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const project of projects) {
    if (project.status in counts) {
      counts[project.status]++;
    }
  }

  return counts;
}

/**
 * Calculate total value of quotes
 */
function calculateQuotesValue(quotes: Quote[]): number {
  return quotes.reduce((total, quote) => total + (quote.totals?.total ?? 0), 0);
}

/**
 * Count quotes pending approval (client_review status)
 */
function countPendingApproval(quotes: Quote[]): number {
  return quotes.filter((quote) => quote.status === 'client_review').length;
}

/**
 * Group quotes by status for pipeline visualization
 */
function buildQuotePipeline(quotes: Quote[]): QuotePipelineItem[] {
  const pipelineMap = new Map<QuoteStatus, QuotePipelineItem>();

  // Initialize all statuses
  for (const status of QUOTE_STATUS_ORDER) {
    pipelineMap.set(status, {
      status,
      count: 0,
      totalValue: 0,
      quotes: [],
    });
  }

  // Aggregate quotes into pipeline
  for (const quote of quotes) {
    const item = pipelineMap.get(quote.status);
    if (item) {
      item.count++;
      item.totalValue += quote.totals?.total ?? 0;
      item.quotes.push(quote);
    }
  }

  // Return in status order
  return QUOTE_STATUS_ORDER.map((status) => pipelineMap.get(status)!);
}

/**
 * Get recent projects sorted by update time
 */
function getRecentProjects(
  projects: Project[],
  limit: number
): Project[] {
  return [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Aggregates data from projects, quotes, and notifications
 * to provide unified dashboard state.
 */
export function useDashboardData(): DashboardData {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? '';

  // Fetch data from feature hooks
  const projectsQuery = useProjectList();
  const quotesQuery = useQuotesList();
  const notificationCountQuery = useNotificationCount(userId);
  const unreadNotificationsQuery = useUnreadNotifications(userId);

  // Derive loading and error states
  const isLoading =
    projectsQuery.isLoading ||
    quotesQuery.isLoading ||
    notificationCountQuery.isLoading ||
    unreadNotificationsQuery.isLoading;

  const isError =
    projectsQuery.isError ||
    quotesQuery.isError ||
    notificationCountQuery.isError ||
    unreadNotificationsQuery.isError;

  const error =
    projectsQuery.error ||
    quotesQuery.error ||
    notificationCountQuery.error ||
    unreadNotificationsQuery.error;

  // Extract data with safe defaults
  const projects = projectsQuery.data ?? [];
  const quotes = quotesQuery.data ?? [];
  const notificationCount = notificationCountQuery.data ?? 0;
  const unreadNotifications = unreadNotificationsQuery.data ?? [];

  // Compute dashboard statistics
  const stats = useMemo<DashboardStats>(() => {
    const projectsByStatus = countProjectsByStatus(projects);
    const activeProjects = ACTIVE_PROJECT_STATUSES.reduce(
      (sum, status) => sum + projectsByStatus[status],
      0
    );

    return {
      totalProjects: projects.length,
      activeProjects,
      projectsByStatus,
      totalQuotes: quotes.length,
      quotesValue: calculateQuotesValue(quotes),
      pendingApprovalCount: countPendingApproval(quotes),
      notificationCount,
    };
  }, [projects, quotes, notificationCount]);

  // Compute recent projects
  const recentProjects = useMemo<Project[]>(
    () => getRecentProjects(projects, RECENT_PROJECTS_LIMIT),
    [projects]
  );

  // Compute quote pipeline
  const quotePipeline = useMemo<QuotePipelineItem[]>(
    () => buildQuotePipeline(quotes),
    [quotes]
  );

  return {
    stats,
    recentProjects,
    quotePipeline,
    unreadNotifications,
    isLoading,
    isError,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
  };
}
