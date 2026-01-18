/**
 * ValidationPanel Component
 *
 * Displays validation errors, warnings, and suggestions for room configurations.
 * Supports collapsible sections, item dismissal, and various display variants.
 */

import { useState, useMemo } from 'react';

export type ValidationItemType = 'error' | 'warning' | 'suggestion' | 'info';

export interface ValidationItem {
  id: string;
  type: ValidationItemType;
  message: string;
  details?: string;
  field?: string;
  equipmentId?: string;
  dismissible?: boolean;
}

interface ValidationPanelProps {
  items: ValidationItem[];
  title?: string;
  emptyMessage?: string;
  showSummary?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  allowDismissSuggestions?: boolean;
  onItemClick?: (item: ValidationItem) => void;
  onDismiss?: (itemId: string) => void;
}

const TYPE_PRIORITY: Record<ValidationItemType, number> = {
  error: 0,
  warning: 1,
  suggestion: 2,
  info: 3,
};

const TYPE_LABELS: Record<ValidationItemType, string> = {
  error: 'Errors',
  warning: 'Warnings',
  suggestion: 'Suggestions',
  info: 'Info',
};

export function ValidationPanel({
  items,
  title = 'Validation',
  emptyMessage = 'No issues found',
  showSummary = false,
  collapsible = false,
  defaultCollapsed = false,
  isLoading = false,
  variant = 'default',
  className = '',
  allowDismissSuggestions = false,
  onItemClick,
  onDismiss,
}: ValidationPanelProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<ValidationItemType>>(
    () => {
      if (defaultCollapsed) {
        return new Set([
          'error',
          'warning',
          'suggestion',
          'info',
        ] as ValidationItemType[]);
      }
      return new Set();
    }
  );

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]);
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups: Record<ValidationItemType, ValidationItem[]> = {
      error: [],
      warning: [],
      suggestion: [],
      info: [],
    };

    for (const item of sortedItems) {
      groups[item.type].push(item);
    }

    return groups;
  }, [sortedItems]);

  const counts = useMemo(
    () => ({
      errors: groupedItems.error.length,
      warnings: groupedItems.warning.length,
      suggestions: groupedItems.suggestion.length,
      info: groupedItems.info.length,
      total: items.length,
    }),
    [groupedItems, items.length]
  );

  const toggleSection = (type: ValidationItemType) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleItemClick = (item: ValidationItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleDismiss = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(itemId);
    }
  };

  const canDismiss = (item: ValidationItem): boolean => {
    if (item.dismissible) return true;
    if (allowDismissSuggestions && item.type === 'suggestion') return true;
    return false;
  };

  const variantClass = variant !== 'default' ? `validation-panel--${variant}` : '';
  const panelClasses = ['validation-panel', variantClass, className]
    .filter(Boolean)
    .join(' ');

  const renderItem = (item: ValidationItem) => (
    <li
      key={item.id}
      data-testid={`validation-item-${item.id}`}
      data-field={item.field}
      data-equipment-id={item.equipmentId}
      className={`validation-panel__item validation-panel__item--${item.type}`}
      aria-label={`${item.type}: ${item.message}`}
      onClick={() => handleItemClick(item)}
    >
      <span className="validation-panel__item-icon" aria-hidden="true">
        {item.type === 'error' && '✕'}
        {item.type === 'warning' && '⚠'}
        {item.type === 'suggestion' && '💡'}
        {item.type === 'info' && 'ℹ'}
      </span>
      <div className="validation-panel__item-content">
        <span className="validation-panel__item-message">{item.message}</span>
        {item.details && (
          <span className="validation-panel__item-details">{item.details}</span>
        )}
      </div>
      {canDismiss(item) && onDismiss && (
        <button
          type="button"
          className="validation-panel__dismiss-btn"
          aria-label="Dismiss"
          onClick={(e) => handleDismiss(e, item.id)}
        >
          ×
        </button>
      )}
    </li>
  );

  const renderSection = (type: ValidationItemType, sectionItems: ValidationItem[]) => {
    if (sectionItems.length === 0) return null;

    const isCollapsed = collapsedSections.has(type);
    const label = TYPE_LABELS[type];

    if (collapsible) {
      return (
        <div
          key={type}
          className={`validation-panel__section validation-panel__section--${type}`}
        >
          <button
            type="button"
            className="validation-panel__section-header"
            aria-expanded={!isCollapsed}
            onClick={() => toggleSection(type)}
          >
            <span className="validation-panel__section-label">
              {label} ({sectionItems.length})
            </span>
            <span className="validation-panel__section-toggle" aria-hidden="true">
              {isCollapsed ? '▸' : '▾'}
            </span>
          </button>
          <ul
            className="validation-panel__list"
            style={{ display: isCollapsed ? 'none' : undefined }}
          >
            {sectionItems.map(renderItem)}
          </ul>
        </div>
      );
    }

    return sectionItems.map(renderItem);
  };

  const renderSummary = () => {
    const parts: string[] = [];
    if (counts.errors > 0) {
      parts.push(`${counts.errors} error${counts.errors !== 1 ? 's' : ''}`);
    }
    if (counts.warnings > 0) {
      parts.push(`${counts.warnings} warning${counts.warnings !== 1 ? 's' : ''}`);
    }
    if (counts.suggestions > 0) {
      parts.push(
        `${counts.suggestions} suggestion${counts.suggestions !== 1 ? 's' : ''}`
      );
    }

    if (parts.length === 0) return null;

    return <div className="validation-panel__summary">{parts.join(', ')}</div>;
  };

  return (
    <div
      data-testid="validation-panel"
      role="region"
      aria-label={title}
      className={panelClasses}
    >
      <h3 className="validation-panel__heading">{title}</h3>

      {/* Screen reader announcement */}
      <div role="status" className="sr-only">
        {counts.total} issues found
      </div>

      {isLoading ? (
        <div className="validation-panel__loading">
          <span>Validating...</span>
        </div>
      ) : items.length === 0 ? (
        <p className="validation-panel__empty">{emptyMessage}</p>
      ) : (
        <>
          {showSummary && renderSummary()}

          {collapsible ? (
            <>
              {renderSection('error', groupedItems.error)}
              {renderSection('warning', groupedItems.warning)}
              {renderSection('suggestion', groupedItems.suggestion)}
              {renderSection('info', groupedItems.info)}
            </>
          ) : (
            <ul className="validation-panel__list" role="list">
              {sortedItems.map(renderItem)}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
