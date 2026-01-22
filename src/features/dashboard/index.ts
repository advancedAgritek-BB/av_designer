/**
 * Dashboard Feature Module
 *
 * Exports the dashboard data aggregation hook and components for the home page.
 */

export { useDashboardData } from './hooks/use-dashboard-data';
export { SummaryStatsCards } from './components/SummaryStatsCards';
export { ProjectPipeline } from './components/ProjectPipeline';
export { NotificationsPanel } from './components/NotificationsPanel';
export { QuotePipelinePanel } from './components/QuotePipelinePanel';
export { RecentProjects } from './components/RecentProjects';
export type { DashboardStats, QuotePipelineItem, DashboardData } from './hooks/use-dashboard-data';
