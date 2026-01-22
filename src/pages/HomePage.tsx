/**
 * Home Page - Dashboard
 *
 * Main dashboard view with stats, projects, quotes, and activity.
 * Integrates all dashboard components into a unified layout.
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
import type { ProjectStatusExtended } from '@/features/projects/project-types';
import type { QuoteStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

/**
 * Stat keys matching the SummaryStatsCards component expectations
 */
type StatKey = 'activeProjects' | 'totalQuotes' | 'pendingApprovalCount' | 'notificationCount';

// ============================================================================
// Component
// ============================================================================

export function HomePage() {
  const navigate = useNavigate();
  const {
    stats,
    quotePipeline,
    recentProjects,
    unreadNotifications,
    isLoading,
  } = useDashboardData();

  /**
   * Handle clicks on summary stat cards to navigate to relevant views
   */
  const handleStatClick = (stat: StatKey) => {
    switch (stat) {
      case 'activeProjects':
        navigate('/projects');
        break;
      case 'totalQuotes':
      case 'pendingApprovalCount':
        navigate('/projects?filter=quotes');
        break;
      case 'notificationCount':
        document.getElementById('notifications-panel')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        navigate('/projects');
    }
  };

  /**
   * Handle clicks on project pipeline status to filter projects
   */
  const handleProjectStatusClick = (status: ProjectStatusExtended) => {
    navigate(`/projects?status=${status}`);
  };

  /**
   * Handle clicks on quote pipeline status to filter projects by quote status
   */
  const handleQuoteStatusClick = (status: QuoteStatus) => {
    navigate(`/projects?quoteStatus=${status}`);
  };

  if (isLoading) {
    return (
      <div className="dashboard" data-testid="home-page">
        <div className="dashboard-loading">
          <span className="text-text-secondary">Loading dashboard...</span>
        </div>
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
            projectsByStatus={stats.projectsByStatus}
            onStatusClick={handleProjectStatusClick}
          />
          <RecentProjects projects={recentProjects} />
        </div>

        <div className="dashboard-sidebar">
          <div id="notifications-panel">
            <NotificationsPanel
              notifications={unreadNotifications}
              unreadCount={stats.notificationCount}
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
