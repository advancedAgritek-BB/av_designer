/**
 * Projects Kanban View
 *
 * Displays projects organized by status in a kanban board layout
 */
import { useMemo } from 'react';
import { ProjectCard, STATUS_CONFIG } from './ProjectCard';
import type { Project, ProjectStatus } from '@/types';

interface ProjectsKanbanProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
}

/**
 * Kanban column order
 */
const KANBAN_COLUMNS: ProjectStatus[] = [
  'quoting',
  'client_review',
  'ordered',
  'in_progress',
  'on_hold',
  'completed',
];

/**
 * Single kanban column
 */
function KanbanColumn({
  status,
  projects,
  onProjectClick,
  onProjectDelete,
}: {
  status: ProjectStatus;
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
}) {
  const config = STATUS_CONFIG[status] || {
    label: status.replace('_', ' '),
    className: 'bg-bg-tertiary text-text-secondary',
  };

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`text-xs px-2 py-0.5 rounded-full ${config.className}`}>
          {config.label}
        </span>
        <span className="text-xs text-text-tertiary tabular-nums">{projects.length}</span>
      </div>

      {/* Column Content */}
      <div className="flex-1 space-y-2 min-h-[200px] p-2 bg-bg-secondary/30 rounded-lg border border-border/50">
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-xs text-text-tertiary">
            No projects
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              variant="compact"
              onClick={() => onProjectClick(project)}
              onDelete={onProjectDelete ? () => onProjectDelete(project) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function ProjectsKanban({
  projects,
  onProjectClick,
  onProjectDelete,
}: ProjectsKanbanProps) {
  // Group projects by status
  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {};

    // Initialize all columns
    for (const status of KANBAN_COLUMNS) {
      grouped[status] = [];
    }

    // Group projects
    for (const project of projects) {
      const status = project.status;
      if (grouped[status]) {
        grouped[status].push(project);
      } else {
        // Handle draft or unknown statuses - put in quoting
        grouped['quoting'].push(project);
      }
    }

    return grouped;
  }, [projects]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          projects={projectsByStatus[status]}
          onProjectClick={onProjectClick}
          onProjectDelete={onProjectDelete}
        />
      ))}
    </div>
  );
}
