/**
 * Projects List View
 *
 * Displays projects in a grid or list layout
 */
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types';

interface ProjectsListProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
  layout?: 'grid' | 'list';
}

export function ProjectsList({
  projects,
  onProjectClick,
  onProjectDelete,
  layout = 'grid',
}: ProjectsListProps) {
  if (layout === 'list') {
    return (
      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project)}
            onDelete={onProjectDelete ? () => onProjectDelete(project) : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project)}
          onDelete={onProjectDelete ? () => onProjectDelete(project) : undefined}
        />
      ))}
    </div>
  );
}
