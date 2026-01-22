/**
 * Projects Page
 *
 * Lists all projects with Kanban and List views
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectList } from '@/features/projects';
import { ProjectsList, ProjectsKanban } from '@/features/projects';
import { Button } from '@/components/ui';
import type { Project } from '@/types';

type ViewMode = 'list' | 'kanban';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const { data: projects = [], isLoading, isError } = useProjectList();

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  if (isLoading) {
    return (
      <main role="main" data-testid="projects-page" className="space-y-6">
        <h1 className="text-2xl font-semibold text-text-primary">Projects</h1>
        <div className="text-text-secondary">Loading projects...</div>
      </main>
    );
  }

  if (isError) {
    return (
      <main role="main" data-testid="projects-page" className="space-y-6">
        <h1 className="text-2xl font-semibold text-text-primary">Projects</h1>
        <div className="text-status-error">Error loading projects. Please try again.</div>
      </main>
    );
  }

  return (
    <main role="main" data-testid="projects-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Projects</h1>
          <p className="text-text-secondary mt-1">Manage your AV design projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md overflow-hidden border border-border-default">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'kanban'
                  ? 'bg-bg-elevated text-text-primary'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'list'
                  ? 'bg-bg-elevated text-text-primary'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <Button variant="primary">+ New Project</Button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <ProjectsKanban projects={projects} onProjectClick={handleProjectClick} />
      ) : (
        <ProjectsList projects={projects} onProjectClick={handleProjectClick} />
      )}
    </main>
  );
}
