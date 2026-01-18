/**
 * QuotePage Component
 *
 * Full quote page with expandable sections, inline editing,
 * live calculations, and export/print functionality.
 * Follows the dark theme design system.
 */

import { useState, useCallback } from 'react';
import type { Quote, QuoteSection, QuoteItem, QuoteStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface QuotePageProps {
  quote: Quote;
  isLoading?: boolean;
  onItemChange?: (itemId: string, changes: Partial<QuoteItem>) => void;
  onStatusChange?: (quoteId: string, newStatus: QuoteStatus) => void;
  onExport?: (quoteId: string) => void;
  onPrint?: (quoteId: string) => void;
  onAddItems?: () => void;
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

const NEXT_STATUS: Partial<Record<QuoteStatus, QuoteStatus>> = {
  draft: 'client_review',
  client_review: 'approved',
  approved: 'ordered',
};

const STATUS_ACTION_LABELS: Partial<Record<QuoteStatus, string>> = {
  draft: 'Send for Review',
  client_review: 'Approve',
  approved: 'Mark Ordered',
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

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// ============================================================================
// QuotePage Component
// ============================================================================

export function QuotePage({
  quote,
  isLoading = false,
  onItemChange,
  onStatusChange,
  onExport,
  onPrint,
  onAddItems,
}: QuotePageProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(quote.sections.map((s) => s.id))
  );

  const isEditable = quote.status !== 'approved' && quote.status !== 'ordered';

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: number) => {
      if (onItemChange && newQuantity >= 0) {
        onItemChange(itemId, { quantity: newQuantity });
      }
    },
    [onItemChange]
  );

  const handleMarginChange = useCallback(
    (itemId: string, newMargin: number) => {
      if (onItemChange) {
        onItemChange(itemId, { marginPercentage: newMargin });
      }
    },
    [onItemChange]
  );

  const handleAdvanceStatus = useCallback(() => {
    const nextStatus = NEXT_STATUS[quote.status];
    if (onStatusChange && nextStatus) {
      onStatusChange(quote.id, nextStatus);
    }
  }, [quote.id, quote.status, onStatusChange]);

  const handleExport = useCallback(() => {
    onExport?.(quote.id);
  }, [quote.id, onExport]);

  const handlePrint = useCallback(() => {
    onPrint?.(quote.id);
  }, [quote.id, onPrint]);

  if (isLoading) {
    return (
      <main className="quote-page quote-page-loading" role="main">
        <div className="quote-loading-state">Loading...</div>
      </main>
    );
  }

  const hasItems = quote.sections.length > 0;
  const canAdvance = NEXT_STATUS[quote.status] !== undefined;

  return (
    <main className="quote-page" role="main">
      {/* Header */}
      <header className="quote-page-header">
        <div className="quote-page-title-row">
          <h1 className="quote-page-title">
            <span className="quote-page-id">{quote.id}</span>
            <span className="quote-page-version">v{quote.version}</span>
          </h1>
          <span className={`quote-status quote-status-${quote.status}`}>
            {STATUS_LABELS[quote.status]}
          </span>
        </div>

        <div className="quote-page-meta">
          <span className="quote-page-room">Room: {quote.roomId}</span>
        </div>

        <div className="quote-page-actions">
          {canAdvance && (
            <button
              type="button"
              className="quote-action-btn quote-action-primary"
              onClick={handleAdvanceStatus}
              aria-label={STATUS_ACTION_LABELS[quote.status] || 'Advance status'}
            >
              {STATUS_ACTION_LABELS[quote.status] || 'Advance'}
            </button>
          )}
          <button
            type="button"
            className="quote-action-btn"
            onClick={handleExport}
            aria-label="Export quote"
          >
            <ExportIcon />
            Export
          </button>
          <button
            type="button"
            className="quote-action-btn"
            onClick={handlePrint}
            aria-label="Print quote"
          >
            <PrintIcon />
            Print
          </button>
        </div>
      </header>

      {/* Empty State */}
      {!hasItems && (
        <div className="quote-empty-state">
          <p>No items in this quote.</p>
          {onAddItems && (
            <button
              type="button"
              className="quote-action-btn quote-action-primary"
              onClick={onAddItems}
              aria-label="Add items"
            >
              Generate BOM
            </button>
          )}
        </div>
      )}

      {/* Sections */}
      {hasItems && (
        <div className="quote-sections">
          {quote.sections.map((section) => (
            <QuoteSectionComponent
              key={section.id}
              section={section}
              isExpanded={expandedSections.has(section.id)}
              isEditable={isEditable && !isLoading}
              onToggle={() => toggleSection(section.id)}
              onQuantityChange={handleQuantityChange}
              onMarginChange={handleMarginChange}
            />
          ))}
        </div>
      )}

      {/* Totals Summary */}
      {hasItems && (
        <div className="quote-totals">
          <table className="quote-totals-table" role="table">
            <tbody>
              <tr className="quote-totals-row">
                <th scope="row">Equipment</th>
                <td>{formatCurrency(quote.totals.equipment)}</td>
              </tr>
              <tr className="quote-totals-row">
                <th scope="row">Labor</th>
                <td>{formatCurrency(quote.totals.labor)}</td>
              </tr>
              <tr className="quote-totals-row quote-totals-subtotal">
                <th scope="row">Subtotal</th>
                <td>{formatCurrency(quote.totals.subtotal)}</td>
              </tr>
              <tr className="quote-totals-row">
                <th scope="row">Tax</th>
                <td>{formatCurrency(quote.totals.tax)}</td>
              </tr>
              <tr className="quote-totals-row quote-totals-grand">
                <th scope="row">Total</th>
                <td>{formatCurrency(quote.totals.total)}</td>
              </tr>
              <tr className="quote-totals-row quote-totals-margin">
                <th scope="row">Margin</th>
                <td>{formatPercentage(quote.totals.marginPercentage)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

// ============================================================================
// QuoteSection Component
// ============================================================================

interface QuoteSectionComponentProps {
  section: QuoteSection;
  isExpanded: boolean;
  isEditable: boolean;
  onToggle: () => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onMarginChange: (itemId: string, margin: number) => void;
}

function QuoteSectionComponent({
  section,
  isExpanded,
  isEditable,
  onToggle,
  onQuantityChange,
  onMarginChange,
}: QuoteSectionComponentProps) {
  return (
    <section
      className="quote-section"
      data-expanded={isExpanded ? 'true' : 'false'}
      aria-expanded={isExpanded}
    >
      <header className="quote-section-header">
        <button
          type="button"
          className="quote-section-toggle"
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          <ChevronIcon isOpen={isExpanded} />
        </button>
        <h2 className="quote-section-name">{section.name}</h2>
        <span className="quote-section-subtotal">{formatCurrency(section.subtotal)}</span>
      </header>

      {isExpanded && (
        <table className="quote-items-table" role="table">
          <thead>
            <tr>
              <th scope="col" role="columnheader">
                Item
              </th>
              <th scope="col" role="columnheader">
                Qty
              </th>
              <th scope="col" role="columnheader">
                Unit Price
              </th>
              <th scope="col" role="columnheader">
                Extended
              </th>
              <th scope="col" role="columnheader">
                Margin
              </th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <QuoteItemRow
                key={item.id}
                item={item}
                isEditable={isEditable}
                onQuantityChange={onQuantityChange}
                onMarginChange={onMarginChange}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// ============================================================================
// QuoteItemRow Component
// ============================================================================

interface QuoteItemRowProps {
  item: QuoteItem;
  isEditable: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onMarginChange: (itemId: string, margin: number) => void;
}

function QuoteItemRow({
  item,
  isEditable,
  onQuantityChange,
  onMarginChange,
}: QuoteItemRowProps) {
  return (
    <tr className="quote-item-row">
      <td className="quote-item-name">{item.name}</td>
      <td className="quote-item-qty">
        <input
          type="number"
          min="0"
          value={item.quantity}
          disabled={!isEditable}
          aria-label={`Quantity for ${item.name}`}
          onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value, 10) || 0)}
        />
      </td>
      <td className="quote-item-unit-price">{formatCurrency(item.unitPrice)}</td>
      <td className="quote-item-extended">{formatCurrency(item.extendedPrice)}</td>
      <td className="quote-item-margin">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={item.marginPercentage}
          disabled={!isEditable}
          aria-label={`Margin percentage for ${item.name}`}
          onChange={(e) => onMarginChange(item.id, parseFloat(e.target.value) || 0)}
        />
        <span className="quote-margin-symbol">%</span>
      </td>
    </tr>
  );
}

// ============================================================================
// Icon Components
// ============================================================================

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}
    >
      <polyline points="9 18 15 12 9 6" />
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

function PrintIcon() {
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
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
