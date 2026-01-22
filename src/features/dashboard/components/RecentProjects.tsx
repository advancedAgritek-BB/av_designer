/**
 * Recent Projects
 *
 * Dashboard component displaying a responsive grid of recently updated
 * project cards with status, client info, and navigation.
 */

import { Link, useNavigate } from 'react-router-dom';
import type { Project, ProjectStatus } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface RecentProjectsProps {
  projects: Project[];
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get the appropriate CSS class for a project status pill
 */
function getStatusPillClass(status: ProjectStatus): string {
  return `dashboard-status-pill dashboard-status-${status}`;
}

/**
 * Format a status enum value to a human-readable label
 */
function formatStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    draft: 'Draft',
    quoting: 'Quoting',
    client_review: 'Client Review',
    ordered: 'Ordered',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return labels[status];
}

/**
 * Format a date string as relative time (e.g., "5m ago", "2h ago", "3d ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
}

// ============================================================================
// Components
// ============================================================================

/**
 * Individual project card in the grid
 */
interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button type="button" className="recent-project-card" onClick={onClick}>
      <div className="recent-project-card-header">
        <h4 className="recent-project-card-name">{project.name}</h4>
        <span className={getStatusPillClass(project.status)}>
          {formatStatusLabel(project.status)}
        </span>
      </div>
      <div className="recent-project-card-body">
        <span className="recent-project-card-client">
          {project.clientName || 'No client'}
        </span>
      </div>
      <div className="recent-project-card-footer">
        <span className="recent-project-card-updated">
          Updated {formatRelativeTime(project.updatedAt)}
        </span>
      </div>
    </button>
  );
}

/**
 * Empty state when no projects exist
 */
function EmptyState() {
  return (
    <div className="dashboard-empty-state">
      <div className="dashboard-empty-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="dashboard-empty-title">No recent projects</h3>
      <p className="dashboard-empty-description">
        Projects you work on will appear here for quick access.
      </p>
    </div>
  );
}

/**
 * Panel header with title and link to all projects
 */
function PanelHeader() {
  return (
    <div className="dashboard-panel-header">
      <h3 className="dashboard-panel-title">Recent Projects</h3>
      <Link to="/projects" className="dashboard-panel-link">
        View all
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Dashboard panel showing a grid of recently updated projects
 */
export function RecentProjects({ projects }: RecentProjectsProps) {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="dashboard-panel">
      <PanelHeader />

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="recent-projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
