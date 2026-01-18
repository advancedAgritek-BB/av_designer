/**
 * DrawingToolbar Component - Test Suite
 *
 * Tests for the drawing toolbar with type selector, layer toggles, export and print.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DrawingToolbar } from '@/features/drawings/components/DrawingToolbar';
import type { DrawingType, DrawingLayer } from '@/types/drawing';

const mockLayers: DrawingLayer[] = [
  {
    id: 'layer-1',
    name: 'AV Elements',
    type: 'av_elements',
    isLocked: false,
    isVisible: true,
    elements: [],
  },
  {
    id: 'layer-2',
    name: 'Annotations',
    type: 'annotations',
    isLocked: false,
    isVisible: true,
    elements: [],
  },
  {
    id: 'layer-3',
    name: 'Dimensions',
    type: 'dimensions',
    isLocked: true,
    isVisible: false,
    elements: [],
  },
];

describe('DrawingToolbar Component', () => {
  const defaultProps = {
    currentType: 'electrical' as DrawingType,
    layers: mockLayers,
    onTypeChange: vi.fn(),
    onLayerVisibilityChange: vi.fn(),
    onExport: vi.fn(),
    onPrint: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================

  describe('Basic Rendering', () => {
    it('renders toolbar container', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByTestId('drawing-toolbar')).toBeInTheDocument();
    });

    it('renders with proper accessible role', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByLabelText(/drawing toolbar/i)).toBeInTheDocument();
    });

    it('renders when no layers provided', () => {
      render(<DrawingToolbar {...defaultProps} layers={[]} />);

      expect(screen.getByTestId('drawing-toolbar')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Drawing Type Selector Tests
  // ============================================================================

  describe('Drawing Type Selector', () => {
    it('renders drawing type selector', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByTestId('drawing-type-selector')).toBeInTheDocument();
    });

    it('displays current drawing type', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByText(/electrical/i)).toBeInTheDocument();
    });

    it('renders dropdown with all drawing types', async () => {
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} />);

      const selector = screen.getByTestId('drawing-type-selector');
      await user.click(selector);

      expect(
        screen.getByRole('option', { name: /electrical line diagram/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /room elevation/i })).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /reflected ceiling plan/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /rack elevation/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /cable schedule/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /floor plan/i })).toBeInTheDocument();
    });

    it('calls onTypeChange when type is selected', async () => {
      const onTypeChange = vi.fn();
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} onTypeChange={onTypeChange} />);

      const selector = screen.getByTestId('drawing-type-selector');
      await user.selectOptions(selector, 'elevation');

      expect(onTypeChange).toHaveBeenCalledWith('elevation');
    });

    it('highlights current type in dropdown', () => {
      render(<DrawingToolbar {...defaultProps} currentType="rcp" />);

      const selector = screen.getByTestId('drawing-type-selector') as HTMLSelectElement;
      expect(selector.value).toBe('rcp');
    });

    it('has accessible label for type selector', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByLabelText(/drawing type/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Layer Visibility Toggles Tests
  // ============================================================================

  describe('Layer Visibility Toggles', () => {
    it('renders layer toggle section', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByTestId('layer-toggles')).toBeInTheDocument();
    });

    it('renders toggle button for each layer', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const toggles = screen.getByTestId('layer-toggles');
      expect(
        within(toggles).getByRole('button', { name: /av elements/i })
      ).toBeInTheDocument();
      expect(
        within(toggles).getByRole('button', { name: /annotations/i })
      ).toBeInTheDocument();
      expect(
        within(toggles).getByRole('button', { name: /dimensions/i })
      ).toBeInTheDocument();
    });

    it('indicates visible layers with active state', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const avButton = screen.getByRole('button', { name: /av elements/i });
      const dimButton = screen.getByRole('button', { name: /dimensions/i });

      expect(avButton).toHaveClass('active');
      expect(dimButton).not.toHaveClass('active');
    });

    it('calls onLayerVisibilityChange when toggle is clicked', async () => {
      const onLayerVisibilityChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawingToolbar
          {...defaultProps}
          onLayerVisibilityChange={onLayerVisibilityChange}
        />
      );

      const avButton = screen.getByRole('button', { name: /av elements/i });
      await user.click(avButton);

      expect(onLayerVisibilityChange).toHaveBeenCalledWith('layer-1', false);
    });

    it('toggles layer visibility correctly', async () => {
      const onLayerVisibilityChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawingToolbar
          {...defaultProps}
          onLayerVisibilityChange={onLayerVisibilityChange}
        />
      );

      // Click hidden layer to show it
      const dimButton = screen.getByRole('button', { name: /dimensions/i });
      await user.click(dimButton);

      expect(onLayerVisibilityChange).toHaveBeenCalledWith('layer-3', true);
    });

    it('shows visibility icon for each layer', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const toggles = screen.getByTestId('layer-toggles');
      const buttons = within(toggles).getAllByRole('button');

      buttons.forEach((button) => {
        expect(
          button.querySelector('[data-testid*="visibility-icon"]')
        ).toBeInTheDocument();
      });
    });

    it('displays layer names as tooltip', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const avButton = screen.getByRole('button', { name: /av elements/i });
      expect(avButton).toHaveAttribute('title', 'AV Elements');
    });

    it('shows lock indicator for locked layers', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const dimButton = screen.getByRole('button', { name: /dimensions/i });
      expect(within(dimButton).getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('handles no layers gracefully', () => {
      render(<DrawingToolbar {...defaultProps} layers={[]} />);

      const toggles = screen.getByTestId('layer-toggles');
      expect(toggles).toHaveTextContent(/no layers/i);
    });
  });

  // ============================================================================
  // Export Button Tests
  // ============================================================================

  describe('Export Button', () => {
    it('renders export button', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('calls onExport when clicked', async () => {
      const onExport = vi.fn();
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} onExport={onExport} />);

      const exportBtn = screen.getByRole('button', { name: /export/i });
      await user.click(exportBtn);

      expect(onExport).toHaveBeenCalledTimes(1);
    });

    it('has accessible label', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(exportBtn).toHaveAccessibleName(/export/i);
    });

    it('shows export icon', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(within(exportBtn).getByTestId('export-icon')).toBeInTheDocument();
    });

    it('can be disabled when exporting', () => {
      render(<DrawingToolbar {...defaultProps} isExporting={true} />);

      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(exportBtn).toBeDisabled();
    });

    it('shows loading state when exporting', () => {
      render(<DrawingToolbar {...defaultProps} isExporting={true} />);

      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(exportBtn).toHaveAttribute('aria-busy', 'true');
    });
  });

  // ============================================================================
  // Print Button Tests
  // ============================================================================

  describe('Print Button', () => {
    it('renders print button', () => {
      render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
    });

    it('calls onPrint when clicked', async () => {
      const onPrint = vi.fn();
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} onPrint={onPrint} />);

      const printBtn = screen.getByRole('button', { name: /print/i });
      await user.click(printBtn);

      expect(onPrint).toHaveBeenCalledTimes(1);
    });

    it('has accessible label', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const printBtn = screen.getByRole('button', { name: /print/i });
      expect(printBtn).toHaveAccessibleName(/print/i);
    });

    it('shows print icon', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const printBtn = screen.getByRole('button', { name: /print/i });
      expect(within(printBtn).getByTestId('print-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Divider Tests
  // ============================================================================

  describe('Section Dividers', () => {
    it('renders dividers between sections', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const dividers = screen.getAllByTestId('toolbar-divider');
      expect(dividers.length).toBeGreaterThanOrEqual(2);
    });

    it('dividers are decorative', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const dividers = screen.getAllByTestId('toolbar-divider');
      dividers.forEach((divider) => {
        expect(divider).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  // ============================================================================
  // Keyboard Navigation Tests
  // ============================================================================

  describe('Keyboard Navigation', () => {
    it('all controls are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} />);

      // Tab through all interactive elements
      await user.tab();
      expect(screen.getByTestId('drawing-type-selector')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /av elements/i })).toHaveFocus();
    });

    it('type selector responds to keyboard input', async () => {
      const onTypeChange = vi.fn();
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} onTypeChange={onTypeChange} />);

      const selector = screen.getByTestId('drawing-type-selector');
      selector.focus();
      await user.keyboard('{ArrowDown}');

      expect(selector).toHaveFocus();
    });

    it('layer toggles respond to Enter key', async () => {
      const onLayerVisibilityChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawingToolbar
          {...defaultProps}
          onLayerVisibilityChange={onLayerVisibilityChange}
        />
      );

      const avButton = screen.getByRole('button', { name: /av elements/i });
      avButton.focus();
      await user.keyboard('{Enter}');

      expect(onLayerVisibilityChange).toHaveBeenCalledWith('layer-1', false);
    });

    it('layer toggles respond to Space key', async () => {
      const onLayerVisibilityChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawingToolbar
          {...defaultProps}
          onLayerVisibilityChange={onLayerVisibilityChange}
        />
      );

      const avButton = screen.getByRole('button', { name: /av elements/i });
      avButton.focus();
      await user.keyboard(' ');

      expect(onLayerVisibilityChange).toHaveBeenCalledWith('layer-1', false);
    });
  });

  // ============================================================================
  // Responsive Behavior Tests
  // ============================================================================

  describe('Responsive Behavior', () => {
    it('renders compact mode on small screens', () => {
      render(<DrawingToolbar {...defaultProps} compact={true} />);

      expect(screen.getByTestId('drawing-toolbar')).toHaveClass(
        'drawing-toolbar--compact'
      );
    });

    it('shows only icons in compact mode', () => {
      render(<DrawingToolbar {...defaultProps} compact={true} />);

      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(exportBtn).not.toHaveTextContent(/export/i);
    });

    it('maintains full labels in expanded mode', () => {
      render(<DrawingToolbar {...defaultProps} compact={false} />);

      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(exportBtn).toHaveTextContent(/export/i);
    });
  });

  // ============================================================================
  // Drawing Type Display Labels Tests
  // ============================================================================

  describe('Drawing Type Display Labels', () => {
    it('displays friendly labels for drawing types', async () => {
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} />);

      const selector = screen.getByTestId('drawing-type-selector');
      await user.click(selector);

      expect(
        screen.getByRole('option', { name: /electrical line diagram/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /room elevation/i })).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /reflected ceiling plan/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /rack elevation/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /cable schedule/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /floor plan/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Status Announcements Tests
  // ============================================================================

  describe('Status Announcements', () => {
    it('announces type changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} />);

      const selector = screen.getByTestId('drawing-type-selector');
      await user.selectOptions(selector, 'elevation');

      expect(screen.getByRole('status')).toHaveTextContent(/elevation/i);
    });

    it('announces layer visibility changes', async () => {
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} />);

      const avButton = screen.getByRole('button', { name: /av elements/i });
      await user.click(avButton);

      expect(screen.getByRole('status')).toHaveTextContent(/av elements/i);
    });
  });

  // ============================================================================
  // Tooltip Tests
  // ============================================================================

  describe('Tooltips', () => {
    it('export button has tooltip', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(exportBtn).toHaveAttribute('title');
    });

    it('print button has tooltip', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const printBtn = screen.getByRole('button', { name: /print/i });
      expect(printBtn).toHaveAttribute('title');
    });

    it('layer toggle buttons have tooltips with layer names', () => {
      render(<DrawingToolbar {...defaultProps} />);

      const avButton = screen.getByRole('button', { name: /av elements/i });
      expect(avButton).toHaveAttribute('title', 'AV Elements');

      const annButton = screen.getByRole('button', { name: /annotations/i });
      expect(annButton).toHaveAttribute('title', 'Annotations');
    });
  });

  // ============================================================================
  // Edge Cases Tests
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles rapid type changes', async () => {
      const onTypeChange = vi.fn();
      const user = userEvent.setup();
      render(<DrawingToolbar {...defaultProps} onTypeChange={onTypeChange} />);

      const selector = screen.getByTestId('drawing-type-selector');

      await user.selectOptions(selector, 'elevation');
      await user.selectOptions(selector, 'rcp');
      await user.selectOptions(selector, 'rack');

      expect(onTypeChange).toHaveBeenCalledTimes(3);
    });

    it('handles rapid layer toggle clicks', async () => {
      const onLayerVisibilityChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawingToolbar
          {...defaultProps}
          onLayerVisibilityChange={onLayerVisibilityChange}
        />
      );

      const avButton = screen.getByRole('button', { name: /av elements/i });

      await user.click(avButton);
      await user.click(avButton);
      await user.click(avButton);

      expect(onLayerVisibilityChange).toHaveBeenCalledTimes(3);
    });

    it('handles undefined callbacks gracefully', () => {
      expect(() => {
        render(
          <DrawingToolbar
            {...defaultProps}
            onTypeChange={undefined as unknown as typeof defaultProps.onTypeChange}
          />
        );
      }).not.toThrow();
    });
  });

  // ============================================================================
  // Props Update Tests
  // ============================================================================

  describe('Props Updates', () => {
    it('updates when currentType prop changes', () => {
      const { rerender } = render(
        <DrawingToolbar {...defaultProps} currentType="electrical" />
      );

      expect(screen.getByTestId('drawing-type-selector')).toHaveValue('electrical');

      rerender(<DrawingToolbar {...defaultProps} currentType="elevation" />);

      expect(screen.getByTestId('drawing-type-selector')).toHaveValue('elevation');
    });

    it('updates layer toggles when layers prop changes', () => {
      const { rerender } = render(<DrawingToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /av elements/i })).toHaveClass('active');

      const updatedLayers = [
        { ...mockLayers[0], isVisible: false },
        mockLayers[1],
        mockLayers[2],
      ];

      rerender(<DrawingToolbar {...defaultProps} layers={updatedLayers} />);

      expect(screen.getByRole('button', { name: /av elements/i })).not.toHaveClass(
        'active'
      );
    });
  });
});
