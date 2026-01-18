/**
 * QuoteCard Component
 *
 * Displays a quote summary card with status, totals, margin,
 * and action buttons. Follows the dark theme design system.
 */

import type { Quote, QuoteStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface QuoteCardProps {
  quote: Quote;
  isSelected?: boolean;
  showDetails?: boolean;
  variant?: 'default' | 'compact';
  onClick?: () => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onExport?: (id: string) => void;
}

// ============================================================================
// Status Label Mapping
// ============================================================================

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Draft',
  quoting: 'Quoting',
  client_review: 'Client Review',
  approved: 'Approved',
  ordered: 'Ordered',
};

// ============================================================================
// Formatting Helpers
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Updated just now';
  if (hours < 24) return `Updated ${hours}h ago`;
  if (days < 7) return `Updated ${days}d ago`;

  return `Updated ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

// ============================================================================
// QuoteCard Component
// ============================================================================

export function QuoteCard({
  quote,
  isSelected = false,
  showDetails = false,
  variant = 'default',
  onClick,
  onEdit,
  onDuplicate,
  onExport,
}: QuoteCardProps) {
  const isInteractive = !!onClick;
  const hasActions = !!(onEdit || onDuplicate || onExport);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.();
    }
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.(quote.id);
  };

  const handleDuplicateClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDuplicate?.(quote.id);
  };

  const handleExportClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onExport?.(quote.id);
  };

  const marginIndicator = quote.totals.marginPercentage >= 0 ? '' : '-';
  const marginClass =
    quote.totals.marginPercentage >= 20
      ? 'quote-margin-high'
      : quote.totals.marginPercentage >= 0
        ? 'quote-margin-normal'
        : 'quote-margin-low';

  return (
    <article
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={`Quote ${quote.id}, version ${quote.version}, ${STATUS_LABELS[quote.status]}, total ${formatCurrency(quote.totals.total)}`}
      aria-selected={isSelected}
      data-variant={variant === 'compact' ? 'compact' : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`quote-card ${isSelected ? 'quote-card-selected' : ''} ${isInteractive ? 'quote-card-interactive' : ''} ${variant === 'compact' ? 'quote-card-compact' : ''}`}
    >
      {/* Header Row */}
      <div className="quote-card-header">
        <div className="quote-card-meta">
          <span className="quote-card-id">{quote.id}</span>
          <span className="quote-card-version">v{quote.version}</span>
        </div>
        <span className={`quote-status quote-status-${quote.status}`}>
          {STATUS_LABELS[quote.status]}
        </span>
      </div>

      {/* Room Info */}
      <div className="quote-card-room">
        <RoomIcon />
        <span>{quote.roomId}</span>
      </div>

      {/* Main Total */}
      <div className="quote-card-total">
        <span className="quote-total-amount">{formatCurrency(quote.totals.total)}</span>
        <span className={`quote-margin ${marginClass}`}>
          {marginIndicator}
          {Math.abs(quote.totals.marginPercentage)}% margin
        </span>
      </div>

      {/* Detailed Breakdown (optional) */}
      {showDetails && (
        <div className="quote-card-details">
          <div className="quote-detail-row">
            <span className="quote-detail-label">Equipment</span>
            <span className="quote-detail-value">
              {formatCurrency(quote.totals.equipment)}
            </span>
          </div>
          <div className="quote-detail-row">
            <span className="quote-detail-label">Labor</span>
            <span className="quote-detail-value">
              {formatCurrency(quote.totals.labor)}
            </span>
          </div>
          <div className="quote-detail-row">
            <span className="quote-detail-label">Tax</span>
            <span className="quote-detail-value">{formatCurrency(quote.totals.tax)}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="quote-card-footer">
        <span className="quote-card-updated">{formatDate(quote.updatedAt)}</span>

        {/* Action Buttons */}
        {hasActions && (
          <div className="quote-card-actions">
            {onEdit && (
              <button
                type="button"
                aria-label="Edit quote"
                className="quote-action-btn"
                onClick={handleEditClick}
              >
                <EditIcon />
              </button>
            )}
            {onDuplicate && (
              <button
                type="button"
                aria-label="Duplicate quote"
                className="quote-action-btn"
                onClick={handleDuplicateClick}
              >
                <DuplicateIcon />
              </button>
            )}
            {onExport && (
              <button
                type="button"
                aria-label="Export quote"
                className="quote-action-btn"
                onClick={handleExportClick}
              >
                <ExportIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// Icon Components
// ============================================================================

function RoomIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M3 9h6" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
