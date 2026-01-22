/**
 * Summary Stats Cards
 * Displays key metrics at the top of the dashboard
 */

import type { DashboardStats } from '../hooks/use-dashboard-data';

// ============================================================================
// Types
// ============================================================================

type StatKey = 'activeProjects' | 'totalQuotes' | 'pendingApprovalCount' | 'notificationCount';

interface SummaryStatsCardsProps {
  stats: DashboardStats;
  onStatClick: (stat: StatKey) => void;
}

interface StatCardProps {
  value: number;
  label: string;
  onClick: () => void;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Individual stat card displaying a metric value and label
 */
function StatCard({ value, label, onClick }: StatCardProps) {
  return (
    <button type="button" className="stat-card" onClick={onClick}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </button>
  );
}

/**
 * Grid of summary statistics for the dashboard header
 */
export function SummaryStatsCards({ stats, onStatClick }: SummaryStatsCardsProps) {
  return (
    <div className="stats-grid">
      <StatCard
        value={stats.activeProjects}
        label="Active Projects"
        onClick={() => onStatClick('activeProjects')}
      />
      <StatCard
        value={stats.totalQuotes}
        label="Total Quotes"
        onClick={() => onStatClick('totalQuotes')}
      />
      <StatCard
        value={stats.pendingApprovalCount}
        label="Pending Approval"
        onClick={() => onStatClick('pendingApprovalCount')}
      />
      <StatCard
        value={stats.notificationCount}
        label="Notifications"
        onClick={() => onStatClick('notificationCount')}
      />
    </div>
  );
}
