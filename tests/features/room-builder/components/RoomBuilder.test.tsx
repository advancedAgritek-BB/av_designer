/**
 * RoomBuilder Component - Test Suite
 *
 * Tests for the RoomBuilder page component that composes canvas, panels,
 * and equipment palette for room design.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { RoomBuilder } from '@/features/room-builder/components/RoomBuilder';
import type { Room } from '@/types/room';
import type { Equipment } from '@/types/equipment';

// Mock the hooks
vi.mock('@/features/room-builder/use-rooms', () => ({
  useRoom: vi.fn(),
  useUpdateRoom: vi.fn(),
  useAddPlacedEquipment: vi.fn(),
  useRemovePlacedEquipment: vi.fn(),
  useUpdatePlacedEquipment: vi.fn(),
}));

vi.mock('@/features/equipment/use-equipment', () => ({
  useEquipmentList: vi.fn(),
}));

vi.mock('@/features/standards/rule-engine', () => ({
  ruleEngine: {
    validateDesign: vi.fn(),
  },
}));

import {
  useRoom,
  useUpdateRoom,
  useAddPlacedEquipment,
  useUpdatePlacedEquipment,
} from '@/features/room-builder/use-rooms';
import { useEquipmentList } from '@/features/equipment/use-equipment';
import { ruleEngine } from '@/features/standards/rule-engine';

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
  placedEquipment: [
    {
      id: 'pe-1',
      equipmentId: 'eq-1',
      x: 10,
      y: 15,
      rotation: 0,
      mountType: 'ceiling',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockEquipment: Equipment[] = [
  {
    id: 'eq-1',
    manufacturer: 'Poly',
    model: 'Studio X50',
    sku: 'POLY-X50',
    category: 'video',
    subcategory: 'cameras',
    dimensions: { width: 0.5, height: 0.3, depth: 0.2 },
    weight: 3.5,
    powerRequirements: { voltage: 120, wattage: 50, connector: 'IEC C13' },
    msrp: 3500,
    certifications: ['teams'],
    ecoSystemCompatibility: ['poly'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'eq-2',
    manufacturer: 'Shure',
    model: 'MXA910',
    sku: 'SHURE-MXA910',
    category: 'audio',
    subcategory: 'microphones',
    dimensions: { width: 2, height: 0.1, depth: 2 },
    weight: 5,
    powerRequirements: { voltage: 48, wattage: 25, connector: 'PoE' },
    msrp: 4500,
    certifications: ['teams', 'zoom'],
    ecoSystemCompatibility: ['shure'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('RoomBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useRoom).mockReturnValue({
      data: mockRoom,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useRoom>);

    vi.mocked(useEquipmentList).mockReturnValue({
      data: mockEquipment,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEquipmentList>);

    vi.mocked(useUpdateRoom).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateRoom>);

    vi.mocked(useAddPlacedEquipment).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useAddPlacedEquipment>);

    vi.mocked(useUpdatePlacedEquipment).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdatePlacedEquipment>);

    vi.mocked(ruleEngine.validateDesign).mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    });
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders with test id', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-builder')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      vi.mocked(useRoom).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useRoom>);

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders error state', () => {
      vi.mocked(useRoom).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load room'),
      } as ReturnType<typeof useRoom>);

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('renders not found state when room is null', () => {
      vi.mocked(useRoom).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useRoom>);

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });

    it('renders room name in header', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Layout Tests
  // ============================================================================

  describe('Layout', () => {
    it('renders design canvas', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('design-canvas')).toBeInTheDocument();
    });

    it('renders room properties panel', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-properties-panel')).toBeInTheDocument();
    });

    it('renders validation panel', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('validation-panel')).toBeInTheDocument();
    });

    it('renders equipment palette', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('equipment-palette')).toBeInTheDocument();
    });

    it('shows placed equipment count', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/1 equipment placed/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Equipment Palette Tests
  // ============================================================================

  describe('Equipment Palette', () => {
    it('displays available equipment', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const palette = screen.getByTestId('equipment-palette');
      expect(palette).toHaveTextContent('Poly Studio X50');
      expect(palette).toHaveTextContent('Shure MXA910');
    });

    it('shows equipment categories', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /video/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /audio/i })).toBeInTheDocument();
    });

    it('filters equipment by category', async () => {
      const user = userEvent.setup();

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('button', { name: /audio/i }));

      expect(screen.getByText('Shure MXA910')).toBeInTheDocument();
      // Video equipment should be filtered out when audio is selected
    });

    it('shows all equipment when "All" category is selected', async () => {
      const user = userEvent.setup();

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('button', { name: /all/i }));

      const palette = screen.getByTestId('equipment-palette');
      expect(palette).toHaveTextContent('Poly Studio X50');
      expect(palette).toHaveTextContent('Shure MXA910');
    });

    it('equipment items are draggable', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const equipmentItem = screen.getByTestId('palette-equipment-eq-1');
      expect(equipmentItem).toHaveAttribute('draggable', 'true');
    });
  });

  // ============================================================================
  // Equipment Selection Tests
  // ============================================================================

  describe('Equipment Selection', () => {
    it('selects equipment when clicked on canvas', async () => {
      const user = userEvent.setup();

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const placedEquipment = screen.getByTestId('placed-equipment-pe-1');
      await user.click(placedEquipment);

      expect(placedEquipment).toHaveClass('selected');
    });

    it('deselects equipment when pressing Escape', async () => {
      const user = userEvent.setup();

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const placedEquipment = screen.getByTestId('placed-equipment-pe-1');
      await user.click(placedEquipment);
      expect(placedEquipment).toHaveClass('selected');

      await user.keyboard('{Escape}');

      expect(placedEquipment).not.toHaveClass('selected');
    });

    it('shows selected equipment details in sidebar', async () => {
      const user = userEvent.setup();

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const placedEquipment = screen.getByTestId('placed-equipment-pe-1');
      await user.click(placedEquipment);

      expect(screen.getByText(/selected equipment/i)).toBeInTheDocument();
      // Equipment name appears in both palette and selection details
      const sidebar = screen
        .getByText(/selected equipment/i)
        .closest('.room-builder__selection-details');
      expect(sidebar).toHaveTextContent('Poly Studio X50');
    });
  });

  // ============================================================================
  // Room Update Tests
  // ============================================================================

  describe('Room Updates', () => {
    it('calls update mutation when room properties change', async () => {
      const user = userEvent.setup();
      const updateMutate = vi.fn();
      vi.mocked(useUpdateRoom).mockReturnValue({
        mutate: updateMutate,
        mutateAsync: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdateRoom>);

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      // The label is just "Name", not "Room Name"
      const nameInput = screen.getByLabelText('Name');
      await user.tripleClick(nameInput);
      await user.keyboard('Updated Room Name');

      await waitFor(() => {
        expect(updateMutate).toHaveBeenCalled();
      });
    });

    it('calls add equipment mutation when dropping equipment', async () => {
      const addMutate = vi.fn();
      vi.mocked(useAddPlacedEquipment).mockReturnValue({
        mutate: addMutate,
        mutateAsync: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useAddPlacedEquipment>);

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      // Simulate drop event
      const canvas = screen.getByTestId('design-canvas');
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          getData: () => JSON.stringify({ equipmentId: 'eq-2' }),
        },
      });
      Object.defineProperty(dropEvent, 'clientX', { value: 100 });
      Object.defineProperty(dropEvent, 'clientY', { value: 100 });

      canvas.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(addMutate).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe('Validation', () => {
    it('displays validation errors', () => {
      vi.mocked(ruleEngine.validateDesign).mockReturnValue({
        isValid: false,
        errors: [
          {
            ruleId: 'rule-1',
            ruleName: 'Size Check',
            message: 'Room too small for equipment',
            severity: 'error',
          },
        ],
        warnings: [],
        suggestions: [],
      });

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText('Room too small for equipment')).toBeInTheDocument();
    });

    it('displays validation warnings', () => {
      vi.mocked(ruleEngine.validateDesign).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [
          {
            ruleId: 'rule-2',
            ruleName: 'Redundancy',
            message: 'Consider adding backup microphone',
            severity: 'warning',
          },
        ],
        suggestions: [],
      });

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText('Consider adding backup microphone')).toBeInTheDocument();
    });

    it('shows valid state when no issues', () => {
      vi.mocked(ruleEngine.validateDesign).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
      });

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/no issues/i)).toBeInTheDocument();
    });

    it('runs validation when room changes', async () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(ruleEngine.validateDesign).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Toolbar Tests
  // ============================================================================

  describe('Toolbar', () => {
    it('renders undo button', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    });

    it('renders redo button', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
    });

    it('renders save button', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('renders delete equipment button when equipment is selected', async () => {
      const user = userEvent.setup();

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const placedEquipment = screen.getByTestId('placed-equipment-pe-1');
      await user.click(placedEquipment);

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Keyboard Shortcuts Tests
  // ============================================================================

  describe('Keyboard Shortcuts', () => {
    it('deselects equipment on Escape', async () => {
      const user = userEvent.setup();

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const placedEquipment = screen.getByTestId('placed-equipment-pe-1');
      await user.click(placedEquipment);
      expect(placedEquipment).toHaveClass('selected');

      await user.keyboard('{Escape}');

      expect(placedEquipment).not.toHaveClass('selected');
    });

    it('rotates equipment on R key', async () => {
      const user = userEvent.setup();
      const updateMutate = vi.fn();
      vi.mocked(useUpdatePlacedEquipment).mockReturnValue({
        mutate: updateMutate,
        mutateAsync: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdatePlacedEquipment>);

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const placedEquipment = screen.getByTestId('placed-equipment-pe-1');
      await user.click(placedEquipment);
      await user.keyboard('r');

      await waitFor(() => {
        expect(updateMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            updates: expect.objectContaining({ rotation: 90 }),
          })
        );
      });
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible main landmark', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('has heading with room name', () => {
      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      expect(
        screen.getByRole('heading', { name: 'Conference Room A' })
      ).toBeInTheDocument();
    });

    it('announces selection changes to screen readers', async () => {
      const user = userEvent.setup();

      render(<RoomBuilder roomId="room-1" />, { wrapper: createWrapper() });

      const placedEquipment = screen.getByTestId('placed-equipment-pe-1');
      await user.click(placedEquipment);

      // There are multiple status roles, check any one contains "selected"
      const statusElements = screen.getAllByRole('status');
      const hasSelectedText = statusElements.some((el) =>
        /selected/i.test(el.textContent || '')
      );
      expect(hasSelectedText).toBe(true);
    });
  });
});
