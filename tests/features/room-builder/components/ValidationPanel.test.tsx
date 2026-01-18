/**
 * ValidationPanel Component - Test Suite
 *
 * Tests for the ValidationPanel component that displays validation errors,
 * warnings, and suggestions for room configurations.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValidationPanel } from '@/features/room-builder/components/ValidationPanel';
import type { ValidationItem } from '@/features/room-builder/components/ValidationPanel';

describe('ValidationPanel', () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders with test id', () => {
      render(<ValidationPanel items={[]} />);

      expect(screen.getByTestId('validation-panel')).toBeInTheDocument();
    });

    it('renders empty state when no items', () => {
      render(<ValidationPanel items={[]} />);

      expect(screen.getByText(/no issues/i)).toBeInTheDocument();
    });

    it('renders with custom empty message', () => {
      render(<ValidationPanel items={[]} emptyMessage="All checks passed" />);

      expect(screen.getByText('All checks passed')).toBeInTheDocument();
    });

    it('renders panel heading', () => {
      render(<ValidationPanel items={[]} title="Validation Results" />);

      expect(screen.getByRole('heading', { name: 'Validation Results' })).toBeInTheDocument();
    });

    it('uses default heading when no title provided', () => {
      render(<ValidationPanel items={[]} />);

      expect(screen.getByRole('heading', { name: 'Validation' })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Error Display Tests
  // ============================================================================

  describe('Error Display', () => {
    it('renders error items', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Room dimensions exceed limits' },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByText('Room dimensions exceed limits')).toBeInTheDocument();
    });

    it('renders multiple error items', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Invalid room width' },
        { id: 'err-2', type: 'error', message: 'Invalid room length' },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByText('Invalid room width')).toBeInTheDocument();
      expect(screen.getByText('Invalid room length')).toBeInTheDocument();
    });

    it('displays error icon for error items', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Test error' },
      ];

      render(<ValidationPanel items={items} />);

      const errorItem = screen.getByTestId('validation-item-err-1');
      expect(errorItem).toHaveClass('validation-panel__item--error');
    });

    it('displays error count in summary', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Error 1' },
        { id: 'err-2', type: 'error', message: 'Error 2' },
      ];

      render(<ValidationPanel items={items} showSummary />);

      expect(screen.getByText(/2 errors/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Warning Display Tests
  // ============================================================================

  describe('Warning Display', () => {
    it('renders warning items', () => {
      const items: ValidationItem[] = [
        { id: 'warn-1', type: 'warning', message: 'Equipment placement may obstruct traffic' },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByText('Equipment placement may obstruct traffic')).toBeInTheDocument();
    });

    it('displays warning icon for warning items', () => {
      const items: ValidationItem[] = [
        { id: 'warn-1', type: 'warning', message: 'Test warning' },
      ];

      render(<ValidationPanel items={items} />);

      const warningItem = screen.getByTestId('validation-item-warn-1');
      expect(warningItem).toHaveClass('validation-panel__item--warning');
    });

    it('displays warning count in summary', () => {
      const items: ValidationItem[] = [
        { id: 'warn-1', type: 'warning', message: 'Warning 1' },
        { id: 'warn-2', type: 'warning', message: 'Warning 2' },
        { id: 'warn-3', type: 'warning', message: 'Warning 3' },
      ];

      render(<ValidationPanel items={items} showSummary />);

      expect(screen.getByText(/3 warnings/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Suggestion Display Tests
  // ============================================================================

  describe('Suggestion Display', () => {
    it('renders suggestion items', () => {
      const items: ValidationItem[] = [
        { id: 'sug-1', type: 'suggestion', message: 'Consider adding more speakers' },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByText('Consider adding more speakers')).toBeInTheDocument();
    });

    it('displays suggestion icon for suggestion items', () => {
      const items: ValidationItem[] = [
        { id: 'sug-1', type: 'suggestion', message: 'Test suggestion' },
      ];

      render(<ValidationPanel items={items} />);

      const suggestionItem = screen.getByTestId('validation-item-sug-1');
      expect(suggestionItem).toHaveClass('validation-panel__item--suggestion');
    });

    it('displays suggestion count in summary', () => {
      const items: ValidationItem[] = [
        { id: 'sug-1', type: 'suggestion', message: 'Suggestion 1' },
      ];

      render(<ValidationPanel items={items} showSummary />);

      expect(screen.getByText(/1 suggestion/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Info Display Tests
  // ============================================================================

  describe('Info Display', () => {
    it('renders info items', () => {
      const items: ValidationItem[] = [
        { id: 'info-1', type: 'info', message: 'Room meets all requirements' },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByText('Room meets all requirements')).toBeInTheDocument();
    });

    it('displays info icon for info items', () => {
      const items: ValidationItem[] = [
        { id: 'info-1', type: 'info', message: 'Test info' },
      ];

      render(<ValidationPanel items={items} />);

      const infoItem = screen.getByTestId('validation-item-info-1');
      expect(infoItem).toHaveClass('validation-panel__item--info');
    });
  });

  // ============================================================================
  // Mixed Items Tests
  // ============================================================================

  describe('Mixed Items', () => {
    it('renders mixed item types', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Critical error' },
        { id: 'warn-1', type: 'warning', message: 'Important warning' },
        { id: 'sug-1', type: 'suggestion', message: 'Helpful suggestion' },
        { id: 'info-1', type: 'info', message: 'Informational note' },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByText('Critical error')).toBeInTheDocument();
      expect(screen.getByText('Important warning')).toBeInTheDocument();
      expect(screen.getByText('Helpful suggestion')).toBeInTheDocument();
      expect(screen.getByText('Informational note')).toBeInTheDocument();
    });

    it('sorts items by severity (errors first)', () => {
      const items: ValidationItem[] = [
        { id: 'sug-1', type: 'suggestion', message: 'Suggestion' },
        { id: 'err-1', type: 'error', message: 'Error' },
        { id: 'warn-1', type: 'warning', message: 'Warning' },
      ];

      render(<ValidationPanel items={items} />);

      const itemElements = screen.getAllByTestId(/^validation-item-/);
      expect(itemElements[0]).toHaveAttribute('data-testid', 'validation-item-err-1');
      expect(itemElements[1]).toHaveAttribute('data-testid', 'validation-item-warn-1');
      expect(itemElements[2]).toHaveAttribute('data-testid', 'validation-item-sug-1');
    });

    it('displays combined summary counts', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Error 1' },
        { id: 'err-2', type: 'error', message: 'Error 2' },
        { id: 'warn-1', type: 'warning', message: 'Warning 1' },
        { id: 'sug-1', type: 'suggestion', message: 'Suggestion 1' },
      ];

      render(<ValidationPanel items={items} showSummary />);

      expect(screen.getByText(/2 errors/i)).toBeInTheDocument();
      expect(screen.getByText(/1 warning/i)).toBeInTheDocument();
      expect(screen.getByText(/1 suggestion/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Item Details Tests
  // ============================================================================

  describe('Item Details', () => {
    it('renders item with details', () => {
      const items: ValidationItem[] = [
        {
          id: 'err-1',
          type: 'error',
          message: 'Equipment collision detected',
          details: 'Projector overlaps with display screen by 2 feet',
        },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByText('Projector overlaps with display screen by 2 feet')).toBeInTheDocument();
    });

    it('renders item with field reference', () => {
      const items: ValidationItem[] = [
        {
          id: 'err-1',
          type: 'error',
          message: 'Invalid dimension',
          field: 'width',
        },
      ];

      render(<ValidationPanel items={items} />);

      const item = screen.getByTestId('validation-item-err-1');
      expect(item).toHaveAttribute('data-field', 'width');
    });

    it('renders item with equipment reference', () => {
      const items: ValidationItem[] = [
        {
          id: 'warn-1',
          type: 'warning',
          message: 'Equipment out of bounds',
          equipmentId: 'eq-123',
        },
      ];

      render(<ValidationPanel items={items} />);

      const item = screen.getByTestId('validation-item-warn-1');
      expect(item).toHaveAttribute('data-equipment-id', 'eq-123');
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe('Interactions', () => {
    it('calls onItemClick when item is clicked', async () => {
      const user = userEvent.setup();
      const handleItemClick = vi.fn();
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Click me' },
      ];

      render(<ValidationPanel items={items} onItemClick={handleItemClick} />);

      await user.click(screen.getByTestId('validation-item-err-1'));

      expect(handleItemClick).toHaveBeenCalledWith(items[0]);
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const handleDismiss = vi.fn();
      const items: ValidationItem[] = [
        { id: 'warn-1', type: 'warning', message: 'Dismissable warning', dismissible: true },
      ];

      render(<ValidationPanel items={items} onDismiss={handleDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      expect(handleDismiss).toHaveBeenCalledWith('warn-1');
    });

    it('does not show dismiss button for non-dismissible items', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Cannot dismiss' },
      ];

      render(<ValidationPanel items={items} onDismiss={vi.fn()} />);

      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    it('allows dismissing suggestions by default', () => {
      const items: ValidationItem[] = [
        { id: 'sug-1', type: 'suggestion', message: 'Optional suggestion' },
      ];

      render(<ValidationPanel items={items} onDismiss={vi.fn()} allowDismissSuggestions />);

      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Collapsible Sections Tests
  // ============================================================================

  describe('Collapsible Sections', () => {
    it('renders collapsible error section', async () => {
      const user = userEvent.setup();
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Error message' },
      ];

      render(<ValidationPanel items={items} collapsible />);

      const errorSection = screen.getByRole('button', { name: /errors/i });
      expect(errorSection).toBeInTheDocument();

      await user.click(errorSection);
      // After collapse, item should be hidden
      expect(screen.queryByText('Error message')).not.toBeVisible();
    });

    it('renders collapsible warning section', () => {
      const items: ValidationItem[] = [
        { id: 'warn-1', type: 'warning', message: 'Warning message' },
      ];

      render(<ValidationPanel items={items} collapsible />);

      const warningSection = screen.getByRole('button', { name: /warnings/i });
      expect(warningSection).toBeInTheDocument();
    });

    it('renders collapsible suggestion section', () => {
      const items: ValidationItem[] = [
        { id: 'sug-1', type: 'suggestion', message: 'Suggestion message' },
      ];

      render(<ValidationPanel items={items} collapsible />);

      const suggestionSection = screen.getByRole('button', { name: /suggestions/i });
      expect(suggestionSection).toBeInTheDocument();
    });

    it('expands collapsed section on click', async () => {
      const user = userEvent.setup();
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Hidden error' },
      ];

      render(<ValidationPanel items={items} collapsible defaultCollapsed />);

      expect(screen.queryByText('Hidden error')).not.toBeVisible();

      const errorSection = screen.getByRole('button', { name: /errors/i });
      await user.click(errorSection);

      expect(screen.getByText('Hidden error')).toBeVisible();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible role', () => {
      render(<ValidationPanel items={[]} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(<ValidationPanel items={[]} />);

      expect(screen.getByRole('region', { name: /validation/i })).toBeInTheDocument();
    });

    it('uses semantic list for items', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Error' },
        { id: 'warn-1', type: 'warning', message: 'Warning' },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('announces item count to screen readers', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Error 1' },
        { id: 'err-2', type: 'error', message: 'Error 2' },
      ];

      render(<ValidationPanel items={items} />);

      expect(screen.getByRole('status')).toHaveTextContent(/2 issues/i);
    });

    it('uses appropriate ARIA attributes for error items', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Error message' },
      ];

      render(<ValidationPanel items={items} />);

      const item = screen.getByRole('listitem');
      expect(item).toHaveAttribute('aria-label', expect.stringContaining('error'));
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<ValidationPanel items={[]} isLoading />);

      expect(screen.getByText(/validating/i)).toBeInTheDocument();
    });

    it('hides items when loading', () => {
      const items: ValidationItem[] = [
        { id: 'err-1', type: 'error', message: 'Error' },
      ];

      render(<ValidationPanel items={items} isLoading />);

      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Styling Tests
  // ============================================================================

  describe('Styling', () => {
    it('applies compact variant class', () => {
      render(<ValidationPanel items={[]} variant="compact" />);

      expect(screen.getByTestId('validation-panel')).toHaveClass('validation-panel--compact');
    });

    it('applies inline variant class', () => {
      render(<ValidationPanel items={[]} variant="inline" />);

      expect(screen.getByTestId('validation-panel')).toHaveClass('validation-panel--inline');
    });

    it('applies custom className', () => {
      render(<ValidationPanel items={[]} className="custom-class" />);

      expect(screen.getByTestId('validation-panel')).toHaveClass('custom-class');
    });
  });
});
