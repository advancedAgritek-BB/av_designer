/**
 * Project Card Component
 *
 * Displays a project summary in card format for list/kanban views
 */
import { Card, CardBody } from '@/components/ui';
import type { Project, ProjectStatus } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete?: () => void;
  variant?: 'default' | 'compact';
}

/**
 * Status configuration for visual display
 */
const STATUS_CONFIG: Record<
  ProjectStatus | string,
  { label: string; className: string }
> = {
  draft: { label: 'Draft', className: 'bg-bg-tertiary text-text-secondary' },
  quoting: { label: 'Quoting', className: 'bg-blue-500/20 text-blue-400' },
  client_review: { label: 'Review', className: 'bg-purple-500/20 text-purple-400' },
  ordered: { label: 'Ordered', className: 'bg-green-500/20 text-green-400' },
  in_progress: { label: 'In Progress', className: 'bg-amber-500/20 text-amber-400' },
  on_hold: { label: 'On Hold', className: 'bg-orange-500/20 text-orange-400' },
  completed: { label: 'Completed', className: 'bg-emerald-500/20 text-emerald-400' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/20 text-red-400' },
};

/**
 * Status pill component
 */
function StatusPill({ status }: { status: ProjectStatus | string }) {
  const config = STATUS_CONFIG[status] || {
    label: status.replace('_', ' '),
    className: 'bg-bg-tertiary text-text-secondary',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}

export function ProjectCard({
  project,
  onClick,
  onDelete,
  variant = 'default',
}: ProjectCardProps) {
  const formattedDate = new Date(project.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className="p-3 bg-bg-secondary border border-border rounded-lg hover:border-white/20 transition-colors cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm text-text-primary font-medium truncate group-hover:text-accent-gold transition-colors">
              {project.name}
            </h4>
            <p className="text-xs text-text-tertiary mt-0.5 truncate">
              {project.clientName}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-tertiary tabular-nums">{formattedDate}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:border-white/20 transition-colors cursor-pointer group">
      <CardBody>
        <div onClick={onClick}>
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-text-primary font-medium group-hover:text-accent-gold transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-sm text-text-secondary mt-0.5 truncate">
                {project.clientName}
              </p>
            </div>
            <StatusPill status={project.status} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <span className="text-xs text-text-tertiary tabular-nums">
            Updated {formattedDate}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-xs text-text-tertiary hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Delete ${project.name}`}
            >
              Delete
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export { StatusPill, STATUS_CONFIG };
