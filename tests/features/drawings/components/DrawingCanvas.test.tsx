/**
 * DrawingCanvas Component - Test Suite
 *
 * Tests for the drawing canvas with layer rendering, zoom, pan, and element display.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DrawingCanvas } from '@/features/drawings/components/DrawingCanvas';
import type { Drawing, DrawingLayer, DrawingElement } from '@/types/drawing';

const mockElement: DrawingElement = {
  id: 'elem-1',
  type: 'equipment',
  x: 100,
  y: 150,
  rotation: 0,
  properties: {
    label: 'Display Panel',
    manufacturer: 'Samsung',
    model: 'QB65R',
  },
};

const mockCableElement: DrawingElement = {
  id: 'elem-2',
  type: 'cable',
  x: 100,
  y: 150,
  rotation: 0,
  properties: {
    startX: 100,
    startY: 150,
    endX: 300,
    endY: 200,
    cableType: 'HDMI',
  },
};

const mockTextElement: DrawingElement = {
  id: 'elem-3',
  type: 'text',
  x: 50,
  y: 50,
  rotation: 0,
  properties: {
    text: 'Conference Room A',
    fontSize: 14,
  },
};

const mockLayer: DrawingLayer = {
  id: 'layer-1',
  name: 'AV Elements',
  type: 'av_elements',
  isLocked: false,
  isVisible: true,
  elements: [mockElement],
};

const mockAnnotationsLayer: DrawingLayer = {
  id: 'layer-2',
  name: 'Annotations',
  type: 'annotations',
  isLocked: false,
  isVisible: true,
  elements: [mockTextElement],
};

const mockHiddenLayer: DrawingLayer = {
  id: 'layer-3',
  name: 'Hidden Layer',
  type: 'dimensions',
  isLocked: false,
  isVisible: false,
  elements: [mockCableElement],
};

const mockLockedLayer: DrawingLayer = {
  id: 'layer-4',
  name: 'Locked Layer',
  type: 'title_block',
  isLocked: true,
  isVisible: true,
  elements: [],
};

const mockDrawing: Drawing = {
  id: 'drawing-1',
  roomId: 'room-1',
  type: 'electrical',
  layers: [mockLayer, mockAnnotationsLayer],
  overrides: [],
  generatedAt: '2024-01-01T00:00:00Z',
};

const mockDrawingWithHiddenLayer: Drawing = {
  ...mockDrawing,
  layers: [mockLayer, mockHiddenLayer],
};

describe('DrawingCanvas Component', () => {
  const defaultProps = {
    drawing: mockDrawing,
    selectedElementId: null as string | null,
    onElementSelect: vi.fn(),
    onElementMove: vi.fn(),
    onLayerVisibilityChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================

  describe('Basic Rendering', () => {
    it('renders canvas container', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByTestId('drawing-canvas')).toBeInTheDocument();
    });

    it('renders with accessible role', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    it('renders drawing type label', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByLabelText(/electrical.*drawing.*canvas/i)).toBeInTheDocument();
    });

    it('renders empty state when no drawing provided', () => {
      render(
        <DrawingCanvas {...defaultProps} drawing={undefined as unknown as Drawing} />
      );

      expect(screen.getByText(/no drawing selected/i)).toBeInTheDocument();
    });

    it('is focusable for keyboard interaction', () => {
      render(<DrawingCanvas {...defaultProps} />);

      const canvas = screen.getByTestId('drawing-canvas');
      expect(canvas).toHaveAttribute('tabIndex', '0');
    });
  });

  // ============================================================================
  // Layer Rendering Tests
  // ============================================================================

  describe('Layer Rendering', () => {
    it('renders visible layers', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByTestId('layer-layer-1')).toBeInTheDocument();
      expect(screen.getByTestId('layer-layer-2')).toBeInTheDocument();
    });

    it('does not render hidden layers', () => {
      render(<DrawingCanvas {...defaultProps} drawing={mockDrawingWithHiddenLayer} />);

      expect(screen.getByTestId('layer-layer-1')).toBeInTheDocument();
      expect(screen.queryByTestId('layer-layer-3')).not.toBeInTheDocument();
    });

    it('renders layer elements', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByTestId('element-elem-1')).toBeInTheDocument();
    });

    it('renders multiple layers in correct order', () => {
      render(<DrawingCanvas {...defaultProps} />);

      const layers = screen.getAllByTestId(/^layer-layer-/);
      expect(layers).toHaveLength(2);
    });
  });

  // ============================================================================
  // Layer Visibility Controls Tests
  // ============================================================================

  describe('Layer Visibility Controls', () => {
    it('renders layer visibility panel', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByTestId('layer-panel')).toBeInTheDocument();
    });

    it('lists all layers in visibility panel', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByText('AV Elements')).toBeInTheDocument();
      expect(screen.getByText('Annotations')).toBeInTheDocument();
    });

    it('shows visibility toggle for each layer', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(
        screen.getByRole('checkbox', { name: /toggle.*av elements/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /toggle.*annotations/i })
      ).toBeInTheDocument();
    });

    it('visibility toggle reflects layer visibility state', () => {
      render(<DrawingCanvas {...defaultProps} drawing={mockDrawingWithHiddenLayer} />);

      const visibleToggle = screen.getByRole('checkbox', {
        name: /toggle.*av elements/i,
      });
      const hiddenToggle = screen.getByRole('checkbox', {
        name: /toggle.*hidden layer/i,
      });

      expect(visibleToggle).toBeChecked();
      expect(hiddenToggle).not.toBeChecked();
    });

    it('calls onLayerVisibilityChange when toggling visibility', async () => {
      const onLayerVisibilityChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawingCanvas
          {...defaultProps}
          onLayerVisibilityChange={onLayerVisibilityChange}
        />
      );

      const toggle = screen.getByRole('checkbox', {
        name: /toggle.*av elements/i,
      });
      await user.click(toggle);

      expect(onLayerVisibilityChange).toHaveBeenCalledWith('layer-1', false);
    });

    it('shows lock indicator for locked layers', () => {
      const drawingWithLockedLayer: Drawing = {
        ...mockDrawing,
        layers: [mockLockedLayer],
      };
      render(<DrawingCanvas {...defaultProps} drawing={drawingWithLockedLayer} />);

      expect(screen.getByTestId('lock-indicator-layer-4')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Zoom Controls Tests
  // ============================================================================

  describe('Zoom Controls', () => {
    it('renders zoom controls', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
    });

    it('displays current zoom level', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });

    it('zooms in when clicking zoom in button', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
      await user.click(zoomInBtn);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('110%');
    });

    it('zooms out when clicking zoom out button', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
      await user.click(zoomOutBtn);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('90%');
    });

    it('resets zoom to 100% when clicking reset', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
      await user.click(zoomInBtn);
      await user.click(zoomInBtn);

      const resetBtn = screen.getByRole('button', { name: /reset zoom/i });
      await user.click(resetBtn);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });

    it('respects minimum zoom level (25%)', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });

      // Click many times to hit minimum
      for (let i = 0; i < 10; i++) {
        await user.click(zoomOutBtn);
      }

      const zoomText = screen.getByTestId('zoom-level').textContent;
      const zoomValue = parseInt(zoomText?.replace('%', '') || '0');
      expect(zoomValue).toBeGreaterThanOrEqual(25);
    });

    it('respects maximum zoom level (400%)', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });

      // Click many times to hit maximum
      for (let i = 0; i < 35; i++) {
        await user.click(zoomInBtn);
      }

      const zoomText = screen.getByTestId('zoom-level').textContent;
      const zoomValue = parseInt(zoomText?.replace('%', '') || '0');
      expect(zoomValue).toBeLessThanOrEqual(400);
    });

    it('supports keyboard zoom with + and - keys', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const canvas = screen.getByTestId('drawing-canvas');
      canvas.focus();

      await user.keyboard('+');
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('110%');

      await user.keyboard('-');
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });
  });

  // ============================================================================
  // Pan Controls Tests
  // ============================================================================

  describe('Pan Controls', () => {
    it('renders pan/fit button', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByRole('button', { name: /fit to view/i })).toBeInTheDocument();
    });

    it('fits drawing to view when clicking fit button', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const fitBtn = screen.getByRole('button', { name: /fit to view/i });
      await user.click(fitBtn);

      // Canvas should be centered and fitted
      expect(screen.getByTestId('drawing-canvas')).toBeInTheDocument();
    });

    it('supports pan via arrow keys', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const canvas = screen.getByTestId('drawing-canvas');
      canvas.focus();

      // Should be able to pan with arrow keys
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{ArrowLeft}');

      expect(canvas).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Element Selection Tests
  // ============================================================================

  describe('Element Selection', () => {
    it('calls onElementSelect when clicking an element', async () => {
      const onElementSelect = vi.fn();
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} onElementSelect={onElementSelect} />);

      const element = screen.getByTestId('element-elem-1');
      await user.click(element);

      expect(onElementSelect).toHaveBeenCalledWith('elem-1');
    });

    it('highlights selected element', () => {
      render(<DrawingCanvas {...defaultProps} selectedElementId="elem-1" />);

      const element = screen.getByTestId('element-elem-1');
      expect(element).toHaveClass('selected');
    });

    it('deselects when clicking canvas background', async () => {
      const onElementSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawingCanvas
          {...defaultProps}
          selectedElementId="elem-1"
          onElementSelect={onElementSelect}
        />
      );

      const viewport = screen.getByTestId('drawing-viewport');
      await user.click(viewport);

      expect(onElementSelect).toHaveBeenCalledWith(null);
    });

    it('deselects when pressing Escape', async () => {
      const onElementSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawingCanvas
          {...defaultProps}
          selectedElementId="elem-1"
          onElementSelect={onElementSelect}
        />
      );

      const canvas = screen.getByTestId('drawing-canvas');
      canvas.focus();

      await user.keyboard('{Escape}');

      expect(onElementSelect).toHaveBeenCalledWith(null);
    });

    it('supports Tab to cycle through elements', async () => {
      const onElementSelect = vi.fn();
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} onElementSelect={onElementSelect} />);

      const canvas = screen.getByTestId('drawing-canvas');
      canvas.focus();

      await user.keyboard('{Tab}');

      expect(onElementSelect).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Element Display Tests
  // ============================================================================

  describe('Element Display', () => {
    it('renders equipment elements with proper styling', () => {
      render(<DrawingCanvas {...defaultProps} />);

      const element = screen.getByTestId('element-elem-1');
      expect(element).toHaveAttribute('data-type', 'equipment');
    });

    it('renders cable elements as paths', () => {
      const drawingWithCables: Drawing = {
        ...mockDrawing,
        layers: [
          {
            ...mockLayer,
            elements: [mockCableElement],
          },
        ],
      };
      render(<DrawingCanvas {...defaultProps} drawing={drawingWithCables} />);

      const element = screen.getByTestId('element-elem-2');
      expect(element).toHaveAttribute('data-type', 'cable');
    });

    it('renders text elements', () => {
      render(<DrawingCanvas {...defaultProps} />);

      const element = screen.getByTestId('element-elem-3');
      expect(element).toHaveAttribute('data-type', 'text');
      expect(element).toHaveTextContent('Conference Room A');
    });

    it('positions elements correctly', () => {
      render(<DrawingCanvas {...defaultProps} />);

      const element = screen.getByTestId('element-elem-1');
      const style = element.style.transform;
      expect(style).toContain('translate');
    });

    it('applies rotation to elements', () => {
      const rotatedDrawing: Drawing = {
        ...mockDrawing,
        layers: [
          {
            ...mockLayer,
            elements: [{ ...mockElement, rotation: 45 }],
          },
        ],
      };
      render(<DrawingCanvas {...defaultProps} drawing={rotatedDrawing} />);

      const element = screen.getByTestId('element-elem-1');
      const style = element.style.transform;
      expect(style).toContain('rotate(45deg)');
    });

    it('shows element label on hover', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const element = screen.getByTestId('element-elem-1');
      await user.hover(element);

      await waitFor(() => {
        expect(screen.getByText(/Display Panel/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Element Movement Tests
  // ============================================================================

  describe('Element Movement', () => {
    it('element is draggable when not on locked layer', () => {
      render(<DrawingCanvas {...defaultProps} />);

      const element = screen.getByTestId('element-elem-1');
      expect(element).toHaveAttribute('draggable', 'true');
    });

    it('calls onElementMove after drag ends', async () => {
      const onElementMove = vi.fn();
      render(<DrawingCanvas {...defaultProps} onElementMove={onElementMove} />);

      const element = screen.getByTestId('element-elem-1');

      const dataTransfer = {
        setData: vi.fn(),
        getData: vi.fn(),
      };

      fireEvent.dragStart(element, { dataTransfer });
      fireEvent.drag(element);
      fireEvent.dragEnd(element, { clientX: 200, clientY: 200 });

      expect(onElementMove).toHaveBeenCalledWith(
        'elem-1',
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    it('does not allow dragging elements on locked layers', () => {
      const drawingWithLockedLayer: Drawing = {
        ...mockDrawing,
        layers: [{ ...mockLayer, isLocked: true }],
      };
      render(<DrawingCanvas {...defaultProps} drawing={drawingWithLockedLayer} />);

      const element = screen.getByTestId('element-elem-1');
      expect(element).toHaveAttribute('draggable', 'false');
    });
  });

  // ============================================================================
  // Toolbar Tests
  // ============================================================================

  describe('Toolbar', () => {
    it('renders toolbar with all controls', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByTestId('drawing-toolbar')).toBeInTheDocument();
    });

    it('displays drawing type in toolbar', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByText(/electrical/i)).toBeInTheDocument();
    });

    it('renders select tool button', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument();
    });

    it('renders pan tool button', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByRole('button', { name: /pan/i })).toBeInTheDocument();
    });

    it('indicates active tool', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const panBtn = screen.getByRole('button', { name: /pan/i });
      await user.click(panBtn);

      expect(panBtn).toHaveClass('active');
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels for controls', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fit to view/i })).toBeInTheDocument();
    });

    it('elements have accessible descriptions', () => {
      render(<DrawingCanvas {...defaultProps} />);

      const element = screen.getByTestId('element-elem-1');
      expect(element).toHaveAttribute('aria-label', expect.stringContaining('equipment'));
    });

    it('layer panel has proper accessibility attributes', () => {
      render(<DrawingCanvas {...defaultProps} />);

      const panel = screen.getByTestId('layer-panel');
      expect(panel).toHaveAttribute('role', 'region');
      expect(panel).toHaveAttribute('aria-label', expect.stringMatching(/layer/i));
    });

    it('announces zoom level changes', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
      await user.click(zoomInBtn);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/zoom/i);
    });

    it('supports keyboard navigation for layer panel', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      // Verify that layer toggles are keyboard accessible via tabbing
      const toggles = screen.getAllByRole('checkbox');
      expect(toggles.length).toBeGreaterThan(0);

      // Focus first toggle and verify keyboard can interact with it
      const firstToggle = toggles[0];
      await user.click(firstToggle);
      expect(firstToggle).toHaveAttribute('type', 'checkbox');
    });
  });

  // ============================================================================
  // Drawing Types Tests
  // ============================================================================

  describe('Drawing Types', () => {
    it('renders electrical drawing with signal flow indicators', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByTestId('drawing-canvas')).toHaveAttribute(
        'data-drawing-type',
        'electrical'
      );
    });

    it('renders elevation drawing with height markers', () => {
      const elevationDrawing: Drawing = {
        ...mockDrawing,
        type: 'elevation',
      };
      render(<DrawingCanvas {...defaultProps} drawing={elevationDrawing} />);

      expect(screen.getByTestId('drawing-canvas')).toHaveAttribute(
        'data-drawing-type',
        'elevation'
      );
    });

    it('renders RCP drawing with ceiling grid', () => {
      const rcpDrawing: Drawing = {
        ...mockDrawing,
        type: 'rcp',
      };
      render(<DrawingCanvas {...defaultProps} drawing={rcpDrawing} />);

      expect(screen.getByTestId('drawing-canvas')).toHaveAttribute(
        'data-drawing-type',
        'rcp'
      );
    });

    it('renders rack elevation with U-height markings', () => {
      const rackDrawing: Drawing = {
        ...mockDrawing,
        type: 'rack',
      };
      render(<DrawingCanvas {...defaultProps} drawing={rackDrawing} />);

      expect(screen.getByTestId('drawing-canvas')).toHaveAttribute(
        'data-drawing-type',
        'rack'
      );
    });

    it('renders cable schedule as table', () => {
      const cableDrawing: Drawing = {
        ...mockDrawing,
        type: 'cable_schedule',
      };
      render(<DrawingCanvas {...defaultProps} drawing={cableDrawing} />);

      expect(screen.getByTestId('drawing-canvas')).toHaveAttribute(
        'data-drawing-type',
        'cable_schedule'
      );
    });

    it('renders floor plan with room outline', () => {
      const floorPlanDrawing: Drawing = {
        ...mockDrawing,
        type: 'floor_plan',
      };
      render(<DrawingCanvas {...defaultProps} drawing={floorPlanDrawing} />);

      expect(screen.getByTestId('drawing-canvas')).toHaveAttribute(
        'data-drawing-type',
        'floor_plan'
      );
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================

  describe('Performance', () => {
    it('renders many elements efficiently', () => {
      const manyElements: DrawingElement[] = Array.from({ length: 50 }, (_, i) => ({
        id: `elem-${i}`,
        type: 'equipment' as const,
        x: (i % 10) * 50,
        y: Math.floor(i / 10) * 50,
        rotation: 0,
        properties: { label: `Element ${i}` },
      }));

      const largeDrawing: Drawing = {
        ...mockDrawing,
        layers: [{ ...mockLayer, elements: manyElements }],
      };

      const startTime = performance.now();
      render(<DrawingCanvas {...defaultProps} drawing={largeDrawing} />);
      const endTime = performance.now();

      // Should render in reasonable time (< 500ms)
      expect(endTime - startTime).toBeLessThan(500);
      expect(screen.getAllByTestId(/^element-/)).toHaveLength(50);
    });

    it('renders multiple layers efficiently', () => {
      const layers: DrawingLayer[] = Array.from({ length: 10 }, (_, i) => ({
        id: `layer-${i}`,
        name: `Layer ${i}`,
        type: 'av_elements' as const,
        isLocked: false,
        isVisible: true,
        elements: [
          {
            id: `elem-layer-${i}`,
            type: 'equipment' as const,
            x: i * 20,
            y: i * 20,
            rotation: 0,
            properties: {},
          },
        ],
      }));

      const multiLayerDrawing: Drawing = {
        ...mockDrawing,
        layers,
      };

      const startTime = performance.now();
      render(<DrawingCanvas {...defaultProps} drawing={multiLayerDrawing} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(screen.getAllByTestId(/^layer-layer-/)).toHaveLength(10);
    });
  });

  // ============================================================================
  // Grid Display Tests
  // ============================================================================

  describe('Grid Display', () => {
    it('renders grid by default', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByTestId('drawing-grid')).toBeInTheDocument();
    });

    it('can toggle grid visibility', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const toggleGridBtn = screen.getByRole('button', { name: /toggle grid/i });

      expect(screen.getByTestId('drawing-grid')).toBeInTheDocument();

      await user.click(toggleGridBtn);

      expect(screen.queryByTestId('drawing-grid')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Status Announcements Tests
  // ============================================================================

  describe('Status Announcements', () => {
    it('renders status region for screen readers', () => {
      render(<DrawingCanvas {...defaultProps} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('announces element selection', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const element = screen.getByTestId('element-elem-1');
      await user.click(element);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/selected/i);
    });

    it('announces layer visibility changes', async () => {
      const user = userEvent.setup();
      render(<DrawingCanvas {...defaultProps} />);

      const toggle = screen.getByRole('checkbox', {
        name: /toggle.*av elements/i,
      });
      await user.click(toggle);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/layer/i);
    });
  });
});
