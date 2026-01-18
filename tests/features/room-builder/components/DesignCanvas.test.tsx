/**
 * DesignCanvas Component - Test Suite
 *
 * Tests for the room design canvas with zoom, pan, grid, and equipment placement.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesignCanvas } from '@/features/room-builder/components/DesignCanvas';
import type { Room, PlacedEquipment } from '@/types/room';
import type { Equipment } from '@/types/equipment';

const mockRoom: Room = {
  id: 'room-1',
  projectId: 'project-1',
  name: 'Conference Room A',
  roomType: 'conference',
  width: 20,
  length: 30,
  ceilingHeight: 10,
  platform: 'teams',
  ecosystem: 'poly',
  tier: 'standard',
  placedEquipment: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockPlacedEquipment: PlacedEquipment = {
  id: 'pe-1',
  equipmentId: 'eq-1',
  x: 10,
  y: 15,
  rotation: 0,
  mountType: 'ceiling',
};

const mockEquipment: Equipment = {
  id: 'eq-1',
  manufacturer: 'Poly',
  model: 'Studio X50',
  sku: 'POLY-X50',
  category: 'video',
  subcategory: 'cameras',
  description: 'Professional PTZ camera for conference rooms',
  cost: 2000,
  msrp: 2500,
  dimensions: {
    width: 0.5,
    height: 0.3,
    depth: 0.2,
  },
  weight: 2.5,
  electrical: {
    wattage: 50,
    btuOutput: 45,
  },
  platformCertifications: ['Teams', 'Zoom'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockRoomWithEquipment: Room = {
  ...mockRoom,
  placedEquipment: [mockPlacedEquipment],
};

describe('DesignCanvas Component', () => {
  const defaultProps = {
    room: mockRoom,
    equipmentMap: new Map<string, Equipment>(),
    selectedEquipmentId: null,
    onEquipmentSelect: vi.fn(),
    onEquipmentMove: vi.fn(),
    onEquipmentRotate: vi.fn(),
    onEquipmentDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================

  describe('Basic Rendering', () => {
    it('renders canvas container', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByTestId('design-canvas')).toBeInTheDocument();
    });

    it('renders with accessible role', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    it('renders room name as label', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByLabelText(/conference room a/i)).toBeInTheDocument();
    });

    it('renders grid by default', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByTestId('canvas-grid')).toBeInTheDocument();
    });

    it('renders room boundary', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByTestId('room-boundary')).toBeInTheDocument();
    });

    it('displays room dimensions', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByText(/20.*ft/i)).toBeInTheDocument();
      expect(screen.getByText(/30.*ft/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Zoom Controls Tests
  // ============================================================================

  describe('Zoom Controls', () => {
    it('renders zoom controls', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
    });

    it('displays current zoom level', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });

    it('zooms in when clicking zoom in button', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
      await user.click(zoomInBtn);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('110%');
    });

    it('zooms out when clicking zoom out button', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
      await user.click(zoomOutBtn);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('90%');
    });

    it('resets zoom to 100% when clicking reset', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
      await user.click(zoomInBtn);
      await user.click(zoomInBtn);

      const resetBtn = screen.getByRole('button', { name: /reset zoom/i });
      await user.click(resetBtn);

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });

    it('respects minimum zoom level', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });

      // Click many times to hit minimum
      for (let i = 0; i < 10; i++) {
        await user.click(zoomOutBtn);
      }

      // Should not go below minimum (e.g., 25%)
      const zoomText = screen.getByTestId('zoom-level').textContent;
      const zoomValue = parseInt(zoomText?.replace('%', '') || '0');
      expect(zoomValue).toBeGreaterThanOrEqual(25);
    });

    it('respects maximum zoom level', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });

      // Click many times to hit maximum
      for (let i = 0; i < 20; i++) {
        await user.click(zoomInBtn);
      }

      // Should not go above maximum (e.g., 400%)
      const zoomText = screen.getByTestId('zoom-level').textContent;
      const zoomValue = parseInt(zoomText?.replace('%', '') || '0');
      expect(zoomValue).toBeLessThanOrEqual(400);
    });
  });

  // ============================================================================
  // Pan Controls Tests
  // ============================================================================

  describe('Pan Controls', () => {
    it('renders pan/center button', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByRole('button', { name: /center/i })).toBeInTheDocument();
    });

    it('centers view when clicking center button', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const centerBtn = screen.getByRole('button', { name: /center/i });
      await user.click(centerBtn);

      // Canvas should be centered (position reset)
      expect(screen.getByTestId('design-canvas')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Grid Display Tests
  // ============================================================================

  describe('Grid Display', () => {
    it('can toggle grid visibility', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const toggleGridBtn = screen.getByRole('button', { name: /toggle grid/i });

      expect(screen.getByTestId('canvas-grid')).toBeInTheDocument();

      await user.click(toggleGridBtn);

      expect(screen.queryByTestId('canvas-grid')).not.toBeInTheDocument();
    });

    it('grid uses 1-foot spacing by default', () => {
      render(<DesignCanvas {...defaultProps} />);

      const grid = screen.getByTestId('canvas-grid');
      expect(grid).toHaveAttribute('data-spacing', '1');
    });
  });

  // ============================================================================
  // Equipment Placement Tests
  // ============================================================================

  describe('Equipment Placement', () => {
    const equipmentMap = new Map<string, Equipment>([['eq-1', mockEquipment]]);

    it('renders placed equipment', () => {
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
        />
      );

      expect(screen.getByTestId('placed-equipment-pe-1')).toBeInTheDocument();
    });

    it('displays equipment name on hover', async () => {
      const user = userEvent.setup();
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
        />
      );

      const equipment = screen.getByTestId('placed-equipment-pe-1');
      await user.hover(equipment);

      await waitFor(() => {
        expect(screen.getByText(/Poly Studio X50/i)).toBeInTheDocument();
      });
    });

    it('calls onEquipmentSelect when clicking equipment', async () => {
      const onEquipmentSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
          onEquipmentSelect={onEquipmentSelect}
        />
      );

      const equipment = screen.getByTestId('placed-equipment-pe-1');
      await user.click(equipment);

      expect(onEquipmentSelect).toHaveBeenCalledWith('pe-1');
    });

    it('highlights selected equipment', () => {
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
          selectedEquipmentId="pe-1"
        />
      );

      const equipment = screen.getByTestId('placed-equipment-pe-1');
      expect(equipment).toHaveClass('selected');
    });

    it('shows rotation handles when equipment is selected', () => {
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
          selectedEquipmentId="pe-1"
        />
      );

      expect(screen.getByTestId('rotation-handle-pe-1')).toBeInTheDocument();
    });

    it('renders equipment at correct position', () => {
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
        />
      );

      const equipment = screen.getByTestId('placed-equipment-pe-1');
      // Position should be based on x: 10, y: 15 scaled to canvas (20px per foot at 100% zoom)
      const style = equipment.style.transform;
      expect(style).toContain('translate');
      expect(style).toContain('200px'); // 10 * 20 = 200
      expect(style).toContain('300px'); // 15 * 20 = 300
    });

    it('renders equipment with correct rotation', () => {
      const rotatedEquipment: PlacedEquipment = {
        ...mockPlacedEquipment,
        rotation: 90,
      };
      const roomWithRotated: Room = {
        ...mockRoom,
        placedEquipment: [rotatedEquipment],
      };

      render(
        <DesignCanvas
          {...defaultProps}
          room={roomWithRotated}
          equipmentMap={equipmentMap}
        />
      );

      const equipment = screen.getByTestId('placed-equipment-pe-1');
      const style = equipment.style.transform;
      expect(style).toContain('rotate(90deg)');
    });
  });

  // ============================================================================
  // Equipment Drag and Drop Tests
  // ============================================================================

  describe('Equipment Drag and Drop', () => {
    const equipmentMap = new Map<string, Equipment>([['eq-1', mockEquipment]]);

    it('equipment is draggable', () => {
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
        />
      );

      const equipment = screen.getByTestId('placed-equipment-pe-1');
      expect(equipment).toHaveAttribute('draggable', 'true');
    });

    it('calls onEquipmentMove after drag ends', async () => {
      const onEquipmentMove = vi.fn();
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
          onEquipmentMove={onEquipmentMove}
        />
      );

      const equipment = screen.getByTestId('placed-equipment-pe-1');

      // Create a proper dataTransfer mock
      const dataTransfer = {
        setData: vi.fn(),
        getData: vi.fn(),
      };

      fireEvent.dragStart(equipment, { dataTransfer });
      fireEvent.drag(equipment);
      fireEvent.dragEnd(equipment, { clientX: 200, clientY: 200 });

      expect(onEquipmentMove).toHaveBeenCalledWith(
        'pe-1',
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    it('accepts dropped equipment from equipment palette', () => {
      const onEquipmentDrop = vi.fn();
      render(<DesignCanvas {...defaultProps} onEquipmentDrop={onEquipmentDrop} />);

      const canvas = screen.getByTestId('design-canvas');

      fireEvent.dragOver(canvas);
      fireEvent.drop(canvas, {
        dataTransfer: {
          getData: () => JSON.stringify({ equipmentId: 'eq-1' }),
        },
        clientX: 150,
        clientY: 150,
      });

      expect(onEquipmentDrop).toHaveBeenCalledWith(
        'eq-1',
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    it('shows drop indicator when dragging over canvas', async () => {
      render(<DesignCanvas {...defaultProps} />);

      const canvas = screen.getByTestId('design-canvas');

      fireEvent.dragEnter(canvas);
      fireEvent.dragOver(canvas);

      expect(canvas).toHaveClass('drop-target');
    });
  });

  // ============================================================================
  // Equipment Rotation Tests
  // ============================================================================

  describe('Equipment Rotation', () => {
    const equipmentMap = new Map<string, Equipment>([['eq-1', mockEquipment]]);

    it('calls onEquipmentRotate when using rotation handle', async () => {
      const onEquipmentRotate = vi.fn();
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
          selectedEquipmentId="pe-1"
          onEquipmentRotate={onEquipmentRotate}
        />
      );

      const rotationHandle = screen.getByTestId('rotation-handle-pe-1');

      fireEvent.mouseDown(rotationHandle);
      fireEvent.mouseMove(document, { clientX: 100, clientY: 0 });
      fireEvent.mouseUp(document);

      expect(onEquipmentRotate).toHaveBeenCalledWith('pe-1', expect.any(Number));
    });

    it('supports keyboard rotation when equipment selected', async () => {
      const onEquipmentRotate = vi.fn();
      const user = userEvent.setup();
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
          selectedEquipmentId="pe-1"
          onEquipmentRotate={onEquipmentRotate}
        />
      );

      const canvas = screen.getByTestId('design-canvas');
      canvas.focus();

      await user.keyboard('r');

      expect(onEquipmentRotate).toHaveBeenCalledWith('pe-1', 90);
    });
  });

  // ============================================================================
  // Room Boundary Tests
  // ============================================================================

  describe('Room Boundary', () => {
    it('renders room boundary with correct dimensions', () => {
      render(<DesignCanvas {...defaultProps} />);

      const boundary = screen.getByTestId('room-boundary');
      expect(boundary).toHaveAttribute('data-width', '20');
      expect(boundary).toHaveAttribute('data-length', '30');
    });

    it('shows dimension labels on boundary', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByText(/20.*ft/i)).toBeInTheDocument();
      expect(screen.getByText(/30.*ft/i)).toBeInTheDocument();
    });

    it('updates boundary when room dimensions change', () => {
      const { rerender } = render(<DesignCanvas {...defaultProps} />);

      const updatedRoom: Room = { ...mockRoom, width: 25, length: 35 };
      rerender(<DesignCanvas {...defaultProps} room={updatedRoom} />);

      const boundary = screen.getByTestId('room-boundary');
      expect(boundary).toHaveAttribute('data-width', '25');
      expect(boundary).toHaveAttribute('data-length', '35');
    });
  });

  // ============================================================================
  // Keyboard Navigation Tests
  // ============================================================================

  describe('Keyboard Navigation', () => {
    const equipmentMap = new Map<string, Equipment>([['eq-1', mockEquipment]]);

    it('supports arrow key panning', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const canvas = screen.getByTestId('design-canvas');
      canvas.focus();

      await user.keyboard('{ArrowUp}');
      await user.keyboard('{ArrowLeft}');

      // Canvas view should have moved
      expect(canvas).toBeInTheDocument();
    });

    it('supports Delete key to deselect equipment', async () => {
      const onEquipmentSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
          selectedEquipmentId="pe-1"
          onEquipmentSelect={onEquipmentSelect}
        />
      );

      const canvas = screen.getByTestId('design-canvas');
      canvas.focus();

      await user.keyboard('{Escape}');

      expect(onEquipmentSelect).toHaveBeenCalledWith(null);
    });

    it('supports Tab to cycle through equipment', async () => {
      const onEquipmentSelect = vi.fn();
      const multiEquipmentRoom: Room = {
        ...mockRoom,
        placedEquipment: [
          mockPlacedEquipment,
          { ...mockPlacedEquipment, id: 'pe-2', x: 5, y: 5 },
        ],
      };
      const user = userEvent.setup();
      render(
        <DesignCanvas
          {...defaultProps}
          room={multiEquipmentRoom}
          equipmentMap={equipmentMap}
          onEquipmentSelect={onEquipmentSelect}
        />
      );

      const canvas = screen.getByTestId('design-canvas');
      canvas.focus();

      await user.keyboard('{Tab}');

      expect(onEquipmentSelect).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA labels for controls', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /center/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle grid/i })).toBeInTheDocument();
    });

    it('equipment elements have accessible names', () => {
      const equipmentMap = new Map<string, Equipment>([['eq-1', mockEquipment]]);
      render(
        <DesignCanvas
          {...defaultProps}
          room={mockRoomWithEquipment}
          equipmentMap={equipmentMap}
        />
      );

      const equipment = screen.getByTestId('placed-equipment-pe-1');
      expect(equipment).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Poly Studio X50')
      );
    });

    it('canvas is focusable for keyboard interaction', () => {
      render(<DesignCanvas {...defaultProps} />);

      const canvas = screen.getByTestId('design-canvas');
      expect(canvas).toHaveAttribute('tabIndex', '0');
    });

    it('announces zoom level changes', async () => {
      const user = userEvent.setup();
      render(<DesignCanvas {...defaultProps} />);

      const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
      await user.click(zoomInBtn);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/zoom/i);
    });
  });

  // ============================================================================
  // Loading and Empty States Tests
  // ============================================================================

  describe('Loading and Empty States', () => {
    it('renders empty state message when no room provided', () => {
      render(<DesignCanvas {...defaultProps} room={undefined as unknown as Room} />);

      expect(screen.getByText(/no room selected/i)).toBeInTheDocument();
    });

    it('renders placeholder when room has no equipment', () => {
      render(<DesignCanvas {...defaultProps} />);

      expect(screen.getByText(/drag equipment/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================

  describe('Performance', () => {
    it('renders many equipment items efficiently', () => {
      const manyEquipment: PlacedEquipment[] = Array.from({ length: 50 }, (_, i) => ({
        id: `pe-${i}`,
        equipmentId: 'eq-1',
        x: (i % 10) * 2,
        y: Math.floor(i / 10) * 2,
        rotation: 0,
        mountType: 'floor' as const,
      }));
      const largeRoom: Room = {
        ...mockRoom,
        placedEquipment: manyEquipment,
      };
      const equipmentMap = new Map<string, Equipment>([['eq-1', mockEquipment]]);

      const startTime = performance.now();
      render(
        <DesignCanvas {...defaultProps} room={largeRoom} equipmentMap={equipmentMap} />
      );
      const endTime = performance.now();

      // Should render in reasonable time (< 500ms)
      expect(endTime - startTime).toBeLessThan(500);
      expect(screen.getAllByTestId(/placed-equipment-/)).toHaveLength(50);
    });
  });
});
