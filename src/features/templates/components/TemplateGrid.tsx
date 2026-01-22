/**
 * Template Grid Component
 *
 * Displays templates grouped by scope
 */
import { TemplateCard } from './TemplateCard';
import type { Template, TemplateScope } from '../template-types';

interface TemplateGridProps {
  templates: Template[];
  onUse?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onFork?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onPromote?: (template: Template) => void;
  onArchive?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  currentUserId?: string;
  currentTeamId?: string | null;
  currentOrgId?: string | null;
  isLoading?: boolean;
  emptyMessage?: string;
  groupByScope?: boolean;
}

/**
 * Section header for grouped templates
 */
function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
        {title}
      </h3>
      <span className="text-xs text-text-tertiary tabular-nums">({count})</span>
    </div>
  );
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-4 animate-pulse">
          <div className="aspect-video bg-bg-tertiary rounded-md mb-3" />
          <div className="h-4 w-3/4 bg-bg-tertiary rounded mb-2" />
          <div className="h-3 w-1/2 bg-bg-tertiary rounded mb-3" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-bg-tertiary rounded-full" />
            <div className="h-5 w-16 bg-bg-tertiary rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 mb-4 rounded-full bg-bg-tertiary flex items-center justify-center text-2xl">
        📋
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">No templates</h3>
      <p className="text-text-secondary max-w-sm text-pretty">{message}</p>
    </div>
  );
}

export function TemplateGrid({
  templates,
  onUse,
  onEdit,
  onFork,
  onDuplicate,
  onPromote,
  onArchive,
  onDelete,
  currentUserId,
  currentTeamId,
  currentOrgId,
  isLoading = false,
  emptyMessage = 'No templates found. Create one to get started.',
  groupByScope = true,
}: TemplateGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (templates.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  // Helper to check if user can edit a template
  const canEditTemplate = (template: Template): boolean => {
    if (template.scope === 'system') return false;
    if (template.scope === 'personal') {
      return template.ownerId === currentUserId;
    }
    return !!currentUserId;
  };

  // Helper to check if user can delete a template
  const canDeleteTemplate = (template: Template): boolean => canEditTemplate(template);

  const canPromoteTemplate = (template: Template): boolean => {
    if (!currentUserId) return false;
    if (template.scope === 'personal') return !!currentTeamId || !!currentOrgId;
    if (template.scope === 'team') return !!currentOrgId;
    return false;
  };

  // Render a grid of templates
  const renderGrid = (templateList: Template[]) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templateList.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onUse={onUse}
          onEdit={onEdit}
          onFork={onFork}
          onDuplicate={onDuplicate}
          onPromote={onPromote}
          onArchive={onArchive}
          onDelete={onDelete}
          canEdit={canEditTemplate(template)}
          canDelete={canDeleteTemplate(template)}
          canPromote={canPromoteTemplate(template)}
        />
      ))}
    </div>
  );

  // If not grouping by scope, just render a flat grid
  if (!groupByScope) {
    return renderGrid(templates);
  }

  // Group templates by scope
  const scopeOrder: TemplateScope[] = ['personal', 'team', 'org', 'system'];
  const scopeLabels: Record<TemplateScope, string> = {
    personal: 'My Templates',
    team: 'Team Templates',
    org: 'Organization Templates',
    system: 'System Templates',
  };

  const groupedTemplates = scopeOrder.reduce(
    (acc, scope) => {
      const filtered = templates.filter((t) => t.scope === scope);
      if (filtered.length > 0) {
        acc[scope] = filtered;
      }
      return acc;
    },
    {} as Record<TemplateScope, Template[]>
  );

  return (
    <div className="space-y-8">
      {scopeOrder.map((scope) => {
        const scopeTemplates = groupedTemplates[scope];
        if (!scopeTemplates || scopeTemplates.length === 0) return null;

        return (
          <section key={scope}>
            <SectionHeader title={scopeLabels[scope]} count={scopeTemplates.length} />
            {renderGrid(scopeTemplates)}
          </section>
        );
      })}
    </div>
  );
}
