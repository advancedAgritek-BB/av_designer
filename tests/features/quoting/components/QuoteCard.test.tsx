/**
 * QuoteCard Component - Test Suite
 *
 * Tests for the quote summary card displaying status, totals,
 * margin, and action buttons.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteCard } from '@/features/quoting/components/QuoteCard';
import type { Quote, QuoteTotals, QuoteSection } from '@/types/quote';

// ============================================================================
// Test Data
// ============================================================================

const mockTotals: QuoteTotals = {
  equipment: 10000,
  labor: 3000,
  subtotal: 13000,
  tax: 1105,
  total: 14105,
  margin: 2500,
  marginPercentage: 25,
};

const mockSection: QuoteSection = {
  id: 'section-1',
  name: 'Video Equipment',
  category: 'video',
  items: [],
  subtotal: 10000,
};

const mockQuote: Quote = {
  id: 'quote-1',
  projectId: 'proj-123',
  roomId: 'room-456',
  version: 1,
  status: 'draft',
  sections: [mockSection],
  totals: mockTotals,
  createdAt: '2026-01-18T00:00:00Z',
  updatedAt: '2026-01-18T12:00:00Z',
};

// ============================================================================
// Basic Rendering Tests
// ============================================================================

describe('QuoteCard - Basic Rendering', () => {
  it('should render quote card', () => {
    render(<QuoteCard quote={mockQuote} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('should display quote ID', () => {
    render(<QuoteCard quote={mockQuote} />);

    expect(screen.getByText(/quote-1/i)).toBeInTheDocument();
  });

  it('should display version number', () => {
    render(<QuoteCard quote={mockQuote} />);

    expect(screen.getByText(/v1/i)).toBeInTheDocument();
  });

  it('should display room ID', () => {
    render(<QuoteCard quote={mockQuote} />);

    expect(screen.getByText(/room-456/i)).toBeInTheDocument();
  });

  it('should display total amount formatted as currency', () => {
    render(<QuoteCard quote={mockQuote} />);

    // $14,105
    expect(screen.getByText(/\$14,105/)).toBeInTheDocument();
  });

  it('should display margin percentage', () => {
    render(<QuoteCard quote={mockQuote} />);

    expect(screen.getByText(/25%/)).toBeInTheDocument();
  });

  it('should display last updated date', () => {
    render(<QuoteCard quote={mockQuote} />);

    // Should show some form of date/time
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });
});

// ============================================================================
// Status Display Tests
// ============================================================================

describe('QuoteCard - Status Display', () => {
  it('should display draft status', () => {
    render(<QuoteCard quote={mockQuote} />);

    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('should display quoting status', () => {
    const quotingQuote = { ...mockQuote, status: 'quoting' as const };
    render(<QuoteCard quote={quotingQuote} />);

    expect(screen.getByText(/quoting/i)).toBeInTheDocument();
  });

  it('should display client review status', () => {
    const reviewQuote = { ...mockQuote, status: 'client_review' as const };
    render(<QuoteCard quote={reviewQuote} />);

    expect(screen.getByText(/client review/i)).toBeInTheDocument();
  });

  it('should display approved status', () => {
    const approvedQuote = { ...mockQuote, status: 'approved' as const };
    render(<QuoteCard quote={approvedQuote} />);

    expect(screen.getByText(/approved/i)).toBeInTheDocument();
  });

  it('should display ordered status', () => {
    const orderedQuote = { ...mockQuote, status: 'ordered' as const };
    render(<QuoteCard quote={orderedQuote} />);

    expect(screen.getByText(/ordered/i)).toBeInTheDocument();
  });

  it('should apply correct status styling', () => {
    render(<QuoteCard quote={mockQuote} />);

    const statusPill = screen.getByText(/draft/i);
    expect(statusPill).toHaveClass('quote-status-draft');
  });
});

// ============================================================================
// Selection State Tests
// ============================================================================

describe('QuoteCard - Selection State', () => {
  it('should not be selected by default', () => {
    render(<QuoteCard quote={mockQuote} />);

    const card = screen.getByRole('article');
    expect(card).not.toHaveAttribute('aria-selected', 'true');
  });

  it('should show selected state when isSelected is true', () => {
    render(<QuoteCard quote={mockQuote} isSelected />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-selected', 'true');
  });

  it('should apply selected class when selected', () => {
    render(<QuoteCard quote={mockQuote} isSelected />);

    const card = screen.getByRole('article');
    expect(card).toHaveClass('quote-card-selected');
  });
});

// ============================================================================
// Interaction Tests
// ============================================================================

describe('QuoteCard - Interactions', () => {
  it('should call onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<QuoteCard quote={mockQuote} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be interactive (role=button) when onClick provided', () => {
    const handleClick = vi.fn();
    render(<QuoteCard quote={mockQuote} onClick={handleClick} />);

    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
  });

  it('should not have button role when not interactive', () => {
    render(<QuoteCard quote={mockQuote} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('should trigger onClick on Enter key', () => {
    const handleClick = vi.fn();
    render(<QuoteCard quote={mockQuote} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger onClick on Space key', () => {
    const handleClick = vi.fn();
    render(<QuoteCard quote={mockQuote} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be focusable when interactive', () => {
    render(<QuoteCard quote={mockQuote} onClick={() => {}} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});

// ============================================================================
// Action Button Tests
// ============================================================================

describe('QuoteCard - Action Buttons', () => {
  it('should render edit button when onEdit is provided', () => {
    const handleEdit = vi.fn();
    render(<QuoteCard quote={mockQuote} onEdit={handleEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const handleEdit = vi.fn();
    render(<QuoteCard quote={mockQuote} onEdit={handleEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledWith(mockQuote.id);
  });

  it('should stop propagation when edit button is clicked', () => {
    const handleClick = vi.fn();
    const handleEdit = vi.fn();
    render(<QuoteCard quote={mockQuote} onClick={handleClick} onEdit={handleEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render duplicate button when onDuplicate is provided', () => {
    const handleDuplicate = vi.fn();
    render(<QuoteCard quote={mockQuote} onDuplicate={handleDuplicate} />);

    const duplicateButton = screen.getByRole('button', { name: /duplicate/i });
    expect(duplicateButton).toBeInTheDocument();
  });

  it('should call onDuplicate when duplicate button is clicked', () => {
    const handleDuplicate = vi.fn();
    render(<QuoteCard quote={mockQuote} onDuplicate={handleDuplicate} />);

    const duplicateButton = screen.getByRole('button', { name: /duplicate/i });
    fireEvent.click(duplicateButton);

    expect(handleDuplicate).toHaveBeenCalledWith(mockQuote.id);
  });

  it('should render export button when onExport is provided', () => {
    const handleExport = vi.fn();
    render(<QuoteCard quote={mockQuote} onExport={handleExport} />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('should call onExport when export button is clicked', () => {
    const handleExport = vi.fn();
    render(<QuoteCard quote={mockQuote} onExport={handleExport} />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    expect(handleExport).toHaveBeenCalledWith(mockQuote.id);
  });

  it('should not render action buttons when no handlers provided', () => {
    render(<QuoteCard quote={mockQuote} />);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /duplicate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
  });
});

// ============================================================================
// Totals Display Tests
// ============================================================================

describe('QuoteCard - Totals Display', () => {
  it('should display equipment total', () => {
    render(<QuoteCard quote={mockQuote} showDetails />);

    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
    expect(screen.getByText(/\$10,000/)).toBeInTheDocument();
  });

  it('should display labor total', () => {
    render(<QuoteCard quote={mockQuote} showDetails />);

    expect(screen.getByText(/labor/i)).toBeInTheDocument();
    expect(screen.getByText(/\$3,000/)).toBeInTheDocument();
  });

  it('should display tax', () => {
    render(<QuoteCard quote={mockQuote} showDetails />);

    expect(screen.getByText(/tax/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,105/)).toBeInTheDocument();
  });

  it('should not show details by default', () => {
    render(<QuoteCard quote={mockQuote} />);

    // Should show total but not breakdown
    expect(screen.getByText(/\$14,105/)).toBeInTheDocument();
    expect(screen.queryByText(/equipment/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// Variant Tests
// ============================================================================

describe('QuoteCard - Variants', () => {
  it('should render default variant by default', () => {
    render(<QuoteCard quote={mockQuote} />);

    const card = screen.getByRole('article');
    expect(card).not.toHaveAttribute('data-variant', 'compact');
  });

  it('should render compact variant when specified', () => {
    render(<QuoteCard quote={mockQuote} variant="compact" />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('data-variant', 'compact');
  });

  it('should apply compact class in compact variant', () => {
    render(<QuoteCard quote={mockQuote} variant="compact" />);

    const card = screen.getByRole('article');
    expect(card).toHaveClass('quote-card-compact');
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('QuoteCard - Accessibility', () => {
  it('should have accessible name', () => {
    render(<QuoteCard quote={mockQuote} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAccessibleName();
  });

  it('should use aria-label with quote info', () => {
    render(<QuoteCard quote={mockQuote} />);

    const card = screen.getByRole('article');
    expect(card.getAttribute('aria-label')).toContain('quote-1');
  });

  it('should have proper button labels for action buttons', () => {
    render(
      <QuoteCard
        quote={mockQuote}
        onEdit={() => {}}
        onDuplicate={() => {}}
        onExport={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /edit/i })).toHaveAccessibleName();
    expect(screen.getByRole('button', { name: /duplicate/i })).toHaveAccessibleName();
    expect(screen.getByRole('button', { name: /export/i })).toHaveAccessibleName();
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('QuoteCard - Edge Cases', () => {
  it('should handle zero totals', () => {
    const zeroQuote: Quote = {
      ...mockQuote,
      totals: {
        equipment: 0,
        labor: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        margin: 0,
        marginPercentage: 0,
      },
    };

    render(<QuoteCard quote={zeroQuote} />);

    expect(screen.getByText(/\$0/)).toBeInTheDocument();
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it('should handle large totals', () => {
    const largeQuote: Quote = {
      ...mockQuote,
      totals: {
        ...mockTotals,
        total: 1500000,
      },
    };

    render(<QuoteCard quote={largeQuote} />);

    expect(screen.getByText(/\$1,500,000/)).toBeInTheDocument();
  });

  it('should handle negative margin (loss)', () => {
    const lossQuote: Quote = {
      ...mockQuote,
      totals: {
        ...mockTotals,
        margin: -500,
        marginPercentage: -5,
      },
    };

    render(<QuoteCard quote={lossQuote} />);

    expect(screen.getByText(/-5%/)).toBeInTheDocument();
  });

  it('should handle multiple versions', () => {
    const multiVersionQuote = { ...mockQuote, version: 5 };
    render(<QuoteCard quote={multiVersionQuote} />);

    expect(screen.getByText(/v5/i)).toBeInTheDocument();
  });
});
