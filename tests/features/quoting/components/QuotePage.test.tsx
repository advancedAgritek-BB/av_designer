/**
 * QuotePage Component - Test Suite
 *
 * Tests for the full quote page with sections, items,
 * inline editing, live calculations, and export functionality.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuotePage } from '@/features/quoting/components/QuotePage';
import type { Quote, QuoteTotals, QuoteSection, QuoteItem } from '@/types/quote';

// ============================================================================
// Test Utilities
// ============================================================================

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// ============================================================================
// Test Data
// ============================================================================

const mockItem1: QuoteItem = {
  id: 'item-1',
  equipmentId: 'eq-1',
  name: 'Sony 75" Display',
  category: 'video',
  quantity: 2,
  unitCost: 2500,
  unitPrice: 3000,
  extendedCost: 5000,
  extendedPrice: 6000,
  margin: 1000,
  marginPercentage: 16.67,
  status: 'included',
};

const mockItem2: QuoteItem = {
  id: 'item-2',
  equipmentId: 'eq-2',
  name: 'Crestron Control Processor',
  category: 'control',
  quantity: 1,
  unitCost: 3000,
  unitPrice: 3600,
  extendedCost: 3000,
  extendedPrice: 3600,
  margin: 600,
  marginPercentage: 16.67,
  status: 'included',
};

const mockItem3: QuoteItem = {
  id: 'item-3',
  equipmentId: 'eq-3',
  name: 'Shure Microphone',
  category: 'audio',
  quantity: 4,
  unitCost: 500,
  unitPrice: 600,
  extendedCost: 2000,
  extendedPrice: 2400,
  margin: 400,
  marginPercentage: 16.67,
  status: 'included',
};

const mockVideoSection: QuoteSection = {
  id: 'section-video',
  name: 'Video Equipment',
  category: 'video',
  items: [mockItem1],
  subtotal: 6000,
};

const mockControlSection: QuoteSection = {
  id: 'section-control',
  name: 'Control Systems',
  category: 'control',
  items: [mockItem2],
  subtotal: 3600,
};

const mockAudioSection: QuoteSection = {
  id: 'section-audio',
  name: 'Audio Equipment',
  category: 'audio',
  items: [mockItem3],
  subtotal: 2400,
};

const mockTotals: QuoteTotals = {
  equipment: 10000,
  labor: 3000,
  subtotal: 13000,
  tax: 1105,
  total: 14105,
  margin: 2000,
  marginPercentage: 15.38,
};

const mockQuote: Quote = {
  id: 'quote-123',
  projectId: 'proj-456',
  roomId: 'room-789',
  version: 1,
  status: 'draft',
  sections: [mockVideoSection, mockControlSection, mockAudioSection],
  totals: mockTotals,
  createdAt: '2026-01-18T00:00:00Z',
  updatedAt: '2026-01-18T12:00:00Z',
};

// ============================================================================
// Basic Rendering Tests
// ============================================================================

describe('QuotePage - Basic Rendering', () => {
  it('should render quote page', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display quote ID in header', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/quote-123/i)).toBeInTheDocument();
  });

  it('should display version number', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/v1/i)).toBeInTheDocument();
  });

  it('should display quote status', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('should display room ID', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/room-789/i)).toBeInTheDocument();
  });

  it('should render all sections', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/video equipment/i)).toBeInTheDocument();
    expect(screen.getByText(/control systems/i)).toBeInTheDocument();
    expect(screen.getByText(/audio equipment/i)).toBeInTheDocument();
  });
});

// ============================================================================
// Section Display Tests
// ============================================================================

describe('QuotePage - Section Display', () => {
  it('should display section names', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/video equipment/i)).toBeInTheDocument();
    expect(screen.getByText(/control systems/i)).toBeInTheDocument();
    expect(screen.getByText(/audio equipment/i)).toBeInTheDocument();
  });

  it('should display section subtotals', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Section subtotals appear in headers with class quote-section-subtotal
    const subtotals = screen.getAllByText(/\$6,000|\$3,600|\$2,400/);
    expect(subtotals.length).toBeGreaterThanOrEqual(3);
  });

  it('should have expand/collapse buttons for sections', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i });
    expect(expandButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('should collapse section when button clicked', async () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Find collapse button for first section
    const collapseButtons = screen.getAllByRole('button', { name: /collapse/i });
    fireEvent.click(collapseButtons[0]);

    await waitFor(() => {
      // Item should be hidden when collapsed
      const videoSection = screen.getByText(/video equipment/i).closest('section');
      expect(videoSection).toHaveAttribute('data-expanded', 'false');
    });
  });

  it('should expand section when button clicked', async () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Collapse first, then expand
    const collapseButtons = screen.getAllByRole('button', { name: /collapse/i });
    fireEvent.click(collapseButtons[0]);

    await waitFor(() => {
      const expandButton = screen.getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
    });

    await waitFor(() => {
      const videoSection = screen.getByText(/video equipment/i).closest('section');
      expect(videoSection).toHaveAttribute('data-expanded', 'true');
    });
  });
});

// ============================================================================
// Item Display Tests
// ============================================================================

describe('QuotePage - Item Display', () => {
  it('should display item names', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/Sony 75" Display/)).toBeInTheDocument();
    expect(screen.getByText(/Crestron Control Processor/)).toBeInTheDocument();
    expect(screen.getByText(/Shure Microphone/)).toBeInTheDocument();
  });

  it('should display item quantities', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Display has qty 2, processor has 1, mic has 4
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4')).toBeInTheDocument();
  });

  it('should display item unit prices', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Unit prices appear in the items table - $3,000 is the display unit price
    const priceElements = screen.getAllByText(/\$3,000/);
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should display item extended prices', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Extended prices appear in both section subtotals and item rows
    const extendedPrices = screen.getAllByText(/\$6,000|\$3,600|\$2,400/);
    expect(extendedPrices.length).toBeGreaterThanOrEqual(3);
  });

  it('should display item margin percentage', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // All items have 16.67% margin - displayed in margin input fields
    const marginInputs = screen.getAllByDisplayValue('16.67');
    expect(marginInputs.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// Inline Editing Tests
// ============================================================================

describe('QuotePage - Inline Editing', () => {
  it('should have editable quantity field', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const qtyInput = screen.getByDisplayValue('2');
    expect(qtyInput).toHaveAttribute('type', 'number');
  });

  it('should call onItemChange when quantity changed', async () => {
    const handleItemChange = vi.fn();
    renderWithProviders(<QuotePage quote={mockQuote} onItemChange={handleItemChange} />);

    const qtyInput = screen.getByDisplayValue('2');
    fireEvent.change(qtyInput, { target: { value: '3' } });

    await waitFor(() => {
      expect(handleItemChange).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({ quantity: 3 })
      );
    });
  });

  it('should have editable margin field', () => {
    const handleItemChange = vi.fn();
    renderWithProviders(<QuotePage quote={mockQuote} onItemChange={handleItemChange} />);

    // Look for margin input fields by aria-label
    const marginInput = screen.getByLabelText(/margin percentage for Sony/i);
    expect(marginInput).toBeInTheDocument();
  });

  it('should call onItemChange when margin changed', async () => {
    const handleItemChange = vi.fn();
    renderWithProviders(<QuotePage quote={mockQuote} onItemChange={handleItemChange} />);

    const marginInputs = screen.getAllByRole('spinbutton');
    const marginInput = marginInputs.find((input) =>
      input.getAttribute('aria-label')?.includes('margin')
    );

    if (marginInput) {
      fireEvent.change(marginInput, { target: { value: '25' } });

      await waitFor(() => {
        expect(handleItemChange).toHaveBeenCalled();
      });
    }
  });

  it('should prevent negative quantities', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const qtyInput = screen.getByDisplayValue('2');
    expect(qtyInput).toHaveAttribute('min', '0');
  });
});

// ============================================================================
// Totals Display Tests
// ============================================================================

describe('QuotePage - Totals Display', () => {
  it('should display equipment subtotal', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Equipment total: $10,000 in the totals section
    const totals = document.querySelector('.quote-totals');
    expect(totals).toHaveTextContent('Equipment');
    expect(totals).toHaveTextContent('$10,000');
  });

  it('should display labor total', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Labor in the totals section
    const totals = document.querySelector('.quote-totals');
    expect(totals).toHaveTextContent('Labor');
    expect(totals).toHaveTextContent('$3,000');
  });

  it('should display subtotal', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/\$13,000/)).toBeInTheDocument();
  });

  it('should display tax', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/tax/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,105/)).toBeInTheDocument();
  });

  it('should display grand total', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/\$14,105/)).toBeInTheDocument();
  });

  it('should display overall margin percentage', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    expect(screen.getByText(/15\.38%/)).toBeInTheDocument();
  });
});

// ============================================================================
// Export/Print Tests
// ============================================================================

describe('QuotePage - Export/Print', () => {
  it('should render export button', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('should render print button', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const printButton = screen.getByRole('button', { name: /print/i });
    expect(printButton).toBeInTheDocument();
  });

  it('should call onExport when export button clicked', () => {
    const handleExport = vi.fn();
    renderWithProviders(<QuotePage quote={mockQuote} onExport={handleExport} />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    expect(handleExport).toHaveBeenCalledWith(mockQuote.id);
  });

  it('should call onPrint when print button clicked', () => {
    const handlePrint = vi.fn();
    renderWithProviders(<QuotePage quote={mockQuote} onPrint={handlePrint} />);

    const printButton = screen.getByRole('button', { name: /print/i });
    fireEvent.click(printButton);

    expect(handlePrint).toHaveBeenCalledWith(mockQuote.id);
  });
});

// ============================================================================
// Status Workflow Tests
// ============================================================================

describe('QuotePage - Status Workflow', () => {
  it('should show status badge', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const statusBadge = screen.getByText(/draft/i);
    expect(statusBadge).toHaveClass('quote-status-draft');
  });

  it('should render status change button for draft', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const advanceButton = screen.getByRole('button', {
      name: /send for review|advance/i,
    });
    expect(advanceButton).toBeInTheDocument();
  });

  it('should call onStatusChange when advance clicked', () => {
    const handleStatusChange = vi.fn();
    renderWithProviders(
      <QuotePage quote={mockQuote} onStatusChange={handleStatusChange} />
    );

    const advanceButton = screen.getByRole('button', {
      name: /send for review|advance/i,
    });
    fireEvent.click(advanceButton);

    expect(handleStatusChange).toHaveBeenCalledWith(mockQuote.id, 'client_review');
  });

  it('should show approve button for client_review status', () => {
    const reviewQuote = { ...mockQuote, status: 'client_review' as const };
    renderWithProviders(<QuotePage quote={reviewQuote} />);

    const approveButton = screen.getByRole('button', { name: /approve/i });
    expect(approveButton).toBeInTheDocument();
  });

  it('should disable editing when status is approved', () => {
    const approvedQuote = { ...mockQuote, status: 'approved' as const };
    renderWithProviders(<QuotePage quote={approvedQuote} />);

    // All quantity inputs should be disabled
    const qtyInputs = screen.getAllByRole('spinbutton');
    qtyInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('QuotePage - Accessibility', () => {
  it('should have accessible heading structure', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should have labeled form fields', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach((input) => {
      expect(input).toHaveAccessibleName();
    });
  });

  it('should have accessible table structure', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    const tables = screen.getAllByRole('table');
    expect(tables.length).toBeGreaterThanOrEqual(1);
  });

  it('should have column headers', () => {
    renderWithProviders(<QuotePage quote={mockQuote} />);

    // Multiple tables have column headers - use getAllBy
    const itemHeaders = screen.getAllByRole('columnheader', { name: /item/i });
    const qtyHeaders = screen.getAllByRole('columnheader', { name: /qty/i });
    const priceHeaders = screen.getAllByRole('columnheader', { name: /price/i });

    expect(itemHeaders.length).toBeGreaterThanOrEqual(1);
    expect(qtyHeaders.length).toBeGreaterThanOrEqual(1);
    expect(priceHeaders.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// Empty State Tests
// ============================================================================

describe('QuotePage - Empty State', () => {
  it('should show empty message when quote has no sections', () => {
    const emptyQuote = { ...mockQuote, sections: [] };
    renderWithProviders(<QuotePage quote={emptyQuote} />);

    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });

  it('should show add items button when empty and onAddItems provided', () => {
    const emptyQuote = { ...mockQuote, sections: [] };
    const handleAddItems = vi.fn();
    renderWithProviders(<QuotePage quote={emptyQuote} onAddItems={handleAddItems} />);

    const addButton = screen.getByRole('button', { name: /add|generate/i });
    expect(addButton).toBeInTheDocument();
  });
});

// ============================================================================
// Loading State Tests
// ============================================================================

describe('QuotePage - Loading State', () => {
  it('should show loading state when isLoading is true', () => {
    renderWithProviders(<QuotePage quote={mockQuote} isLoading />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should disable inputs when loading', () => {
    renderWithProviders(<QuotePage quote={mockQuote} isLoading />);

    const inputs = screen.queryAllByRole('spinbutton');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
