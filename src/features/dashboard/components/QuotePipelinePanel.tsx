/**
 * Quote Pipeline Panel
 *
 * Dashboard panel displaying quote status breakdown with monetary values.
 * Shows quotes grouped by status with count and total value for each status.
 */

import type { QuoteStatus } from '@/types/quote';
import type { QuotePipelineItem } from '../hooks/use-dashboard-data';

// ============================================================================
// Types
// ============================================================================

interface QuotePipelinePanelProps {
  pipeline: QuotePipelineItem[];
  onStatusClick: (status: QuoteStatus) => void;
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Draft',
  quoting: 'Quoting',
  client_review: 'Client Review',
  approved: 'Approved',
  ordered: 'Ordered',
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format a number as USD currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Get the CSS class for a status pill
 */
function getStatusPillClass(status: QuoteStatus): string {
  switch (status) {
    case 'draft':
      return 'pill';
    case 'quoting':
      return 'pill pill-quoting';
    case 'client_review':
      return 'pill pill-review';
    case 'approved':
      return 'pill pill-ordered';
    case 'ordered':
      return 'pill pill-progress';
    default:
      return 'pill';
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * Panel header with title and total quotes badge
 */
interface PanelHeaderProps {
  totalQuotes: number;
}

function PanelHeader({ totalQuotes }: PanelHeaderProps) {
  return (
    <div className="quote-pipeline-header">
      <h3 className="quote-pipeline-title">Quote Pipeline</h3>
      {totalQuotes > 0 && (
        <span className="quote-pipeline-badge">{totalQuotes}</span>
      )}
    </div>
  );
}

/**
 * Single row showing quote status with count and value
 */
interface StatusRowProps {
  item: QuotePipelineItem;
  onClick: () => void;
}

function StatusRow({ item, onClick }: StatusRowProps) {
  const label = STATUS_LABELS[item.status];
  const pillClass = getStatusPillClass(item.status);

  return (
    <button
      type="button"
      className="quote-pipeline-row"
      onClick={onClick}
    >
      <span className={pillClass}>{label}</span>
      <span className="quote-pipeline-count">({item.count})</span>
      <span className="quote-pipeline-value">{formatCurrency(item.totalValue)}</span>
    </button>
  );
}

/**
 * Total pipeline value display
 */
interface PipelineTotalProps {
  totalValue: number;
}

function PipelineTotal({ totalValue }: PipelineTotalProps) {
  return (
    <div className="quote-pipeline-total">
      <span className="quote-pipeline-total-label">Total Pipeline Value</span>
      <span className="quote-pipeline-total-value">{formatCurrency(totalValue)}</span>
    </div>
  );
}

/**
 * Empty state when no quotes exist
 */
function EmptyState() {
  return (
    <div className="quote-pipeline-empty">
      <p className="quote-pipeline-empty-text">No quotes in pipeline</p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Dashboard panel showing quote status breakdown with monetary values
 */
export function QuotePipelinePanel({
  pipeline,
  onStatusClick,
}: QuotePipelinePanelProps) {
  const totalQuotes = pipeline.reduce((sum, item) => sum + item.count, 0);
  const totalValue = pipeline.reduce((sum, item) => sum + item.totalValue, 0);

  if (totalQuotes === 0) {
    return (
      <div className="quote-pipeline-panel">
        <PanelHeader totalQuotes={0} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="quote-pipeline-panel">
      <PanelHeader totalQuotes={totalQuotes} />

      <div className="quote-pipeline-list">
        {pipeline.map((item) => (
          <StatusRow
            key={item.status}
            item={item}
            onClick={() => onStatusClick(item.status)}
          />
        ))}
      </div>

      <PipelineTotal totalValue={totalValue} />
    </div>
  );
}
