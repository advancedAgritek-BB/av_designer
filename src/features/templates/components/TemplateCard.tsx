/**
 * Template Card Component
 *
 * Displays a template in a card format with actions
 */
import { Card, CardBody, Button } from '@/components/ui';
import type { Template, TemplateScope, TemplateType } from '../template-types';

interface TemplateCardProps {
  template: Template;
  onUse?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onFork?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onPromote?: (template: Template) => void;
  onArchive?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPromote?: boolean;
}

/**
 * Scope configuration for badges
 */
const SCOPE_CONFIG: Record<
  TemplateScope,
  { label: string; color: string; bgColor: string }
> = {
  personal: { label: 'Personal', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  team: { label: 'Team', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  org: { label: 'Organization', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  system: { label: 'System', color: 'text-text-tertiary', bgColor: 'bg-bg-tertiary' },
};

/**
 * Type configuration for labels
 */
const TYPE_CONFIG: Record<TemplateType, { label: string; icon: string }> = {
  room: { label: 'Room', icon: '🏠' },
  equipment_package: { label: 'Equipment', icon: '📦' },
  project: { label: 'Project', icon: '📁' },
  quote: { label: 'Quote', icon: '💰' },
};

/**
 * Scope Badge
 */
export function ScopeBadge({ scope }: { scope: TemplateScope }) {
  const config = SCOPE_CONFIG[scope];
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}

/**
 * Type Badge
 */
export function TypeBadge({ type }: { type: TemplateType }) {
  const config = TYPE_CONFIG[type];
  return (
    <span className="text-xs text-text-tertiary flex items-center gap-1">
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

export function TemplateCard({
  template,
  onUse,
  onEdit,
  onFork,
  onDuplicate,
  onPromote,
  onArchive,
  onDelete,
  canEdit = false,
  canDelete = false,
  canPromote = false,
}: TemplateCardProps) {
  const typeConfig = TYPE_CONFIG[template.type];

  return (
    <Card className="group hover:border-border-hover transition-colors">
      <CardBody className="p-4">
        {/* Thumbnail placeholder */}
        <div className="aspect-video bg-bg-tertiary rounded-md mb-3 flex items-center justify-center text-3xl">
          {template.thumbnailUrl ? (
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <span>{typeConfig.icon}</span>
          )}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-text-primary text-sm truncate flex-1">
            {template.name}
          </h3>
          <span className="text-xs text-text-tertiary tabular-nums shrink-0">
            v{template.currentVersion}
          </span>
        </div>

        {/* Description */}
        {template.description && (
          <p className="text-xs text-text-secondary line-clamp-2 mb-3">
            {template.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <ScopeBadge scope={template.scope} />
          {template.categoryTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary"
            >
              {tag}
            </span>
          ))}
          {template.categoryTags.length > 2 && (
            <span className="text-xs text-text-tertiary">
              +{template.categoryTags.length - 2}
            </span>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          {!template.isPublished && <span className="text-amber-400">Draft</span>}
          {template.forkedFromId && <span className="text-text-tertiary">Forked</span>}
        </div>

        {/* Actions - shown on hover */}
        <div className="flex flex-wrap items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {template.isPublished && onUse && (
            <Button variant="primary" size="sm" onClick={() => onUse(template)}>
              Use
            </Button>
          )}
          {canEdit && onEdit && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(template)}>
              Edit
            </Button>
          )}
          {template.scope !== 'personal' && onFork && (
            <Button variant="ghost" size="sm" onClick={() => onFork(template)}>
              Fork
            </Button>
          )}
          {canEdit && onDuplicate && (
            <Button variant="ghost" size="sm" onClick={() => onDuplicate(template)}>
              Duplicate
            </Button>
          )}
          {canPromote && onPromote && (
            <Button variant="ghost" size="sm" onClick={() => onPromote(template)}>
              Promote
            </Button>
          )}
          {canEdit && onArchive && (
            <Button variant="ghost" size="sm" onClick={() => onArchive(template)}>
              Archive
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(template)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export { SCOPE_CONFIG, TYPE_CONFIG };
