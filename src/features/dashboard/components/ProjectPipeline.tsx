/**
 * Project Pipeline
 *
 * Visual breakdown of projects by status displayed as a horizontal
 * pipeline bar with legend items below.
 */

import type { ProjectStatusExtended } from '@/features/projects/project-types';

// ============================================================================
// Types
// ============================================================================

interface ProjectPipelineProps {
  projectsByStatus: Record<string, number>;
  onStatusClick: (status: ProjectStatusExtended) => void;
}

interface StatusConfig {
  label: string;
  color: string;
}

// ============================================================================
// Configuration
// ============================================================================

const STATUS_CONFIG: Record<ProjectStatusExtended, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'var(--color-text-tertiary)',
  },
  quoting: {
    label: 'Quoting',
    color: 'var(--color-status-warning)',
  },
  client_review: {
    label: 'Client Review',
    color: 'var(--color-accent-blue)',
  },
  ordered: {
    label: 'Ordered',
    color: 'var(--color-status-success)',
  },
  in_progress: {
    label: 'In Progress',
    color: 'var(--color-accent-blue)',
  },
  on_hold: {
    label: 'On Hold',
    color: 'var(--color-text-secondary)',
  },
  completed: {
    label: 'Completed',
    color: 'var(--color-status-success)',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'var(--color-status-error)',
  },
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

// ============================================================================
// Components
// ============================================================================

/**
 * Single segment in the pipeline bar
 */
interface PipelineSegmentProps {
  status: ProjectStatusExtended;
  count: number;
  percentage: number;
}

function PipelineSegment({ status, count, percentage }: PipelineSegmentProps) {
  if (count === 0) {
    return null;
  }

  const config = STATUS_CONFIG[status];

  return (
    <div
      className="pipeline-segment"
      style={{
        width: `${percentage}%`,
        backgroundColor: config.color,
      }}
      title={`${config.label}: ${count}`}
    />
  );
}

/**
 * Legend item showing status with count
 */
interface LegendItemProps {
  status: ProjectStatusExtended;
  count: number;
  onClick: () => void;
}

function LegendItem({ status, count, onClick }: LegendItemProps) {
  const config = STATUS_CONFIG[status];

  return (
    <button
      type="button"
      className="pipeline-legend-item"
      onClick={onClick}
    >
      <span
        className="pipeline-legend-dot"
        style={{ backgroundColor: config.color }}
      />
      <span className="pipeline-legend-label">{config.label}</span>
      <span className="pipeline-legend-count">{count}</span>
    </button>
  );
}

/**
 * Empty state when no projects exist
 */
function EmptyState() {
  return (
    <div className="pipeline-empty">
      <p className="pipeline-empty-text">No projects to display</p>
    </div>
  );
}

/**
 * Main pipeline component showing project distribution by status
 */
export function ProjectPipeline({
  projectsByStatus,
  onStatusClick,
}: ProjectPipelineProps) {
  const totalProjects = STATUS_ORDER.reduce(
    (sum, status) => sum + (projectsByStatus[status] ?? 0),
    0
  );

  if (totalProjects === 0) {
    return <EmptyState />;
  }

  const getPercentage = (count: number): number => {
    return (count / totalProjects) * 100;
  };

  return (
    <div className="pipeline-container">
      <div className="pipeline-bar">
        {STATUS_ORDER.map((status) => {
          const count = projectsByStatus[status] ?? 0;
          return (
            <PipelineSegment
              key={status}
              status={status}
              count={count}
              percentage={getPercentage(count)}
            />
          );
        })}
      </div>

      <div className="pipeline-legend">
        {STATUS_ORDER.map((status) => {
          const count = projectsByStatus[status] ?? 0;
          return (
            <LegendItem
              key={status}
              status={status}
              count={count}
              onClick={() => onStatusClick(status)}
            />
          );
        })}
      </div>
    </div>
  );
}
