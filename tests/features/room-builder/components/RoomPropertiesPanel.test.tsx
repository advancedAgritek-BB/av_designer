/**
 * RoomPropertiesPanel Component - Test Suite
 *
 * Tests for the room properties panel with dimension inputs and room configuration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomPropertiesPanel } from '@/features/room-builder/components/RoomPropertiesPanel';
import type { Room } from '@/types/room';

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

describe('RoomPropertiesPanel Component', () => {
  const defaultProps = {
    room: mockRoom,
    onUpdate: vi.fn(),
    validationErrors: [] as string[],
    validationWarnings: [] as string[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================

  describe('Basic Rendering', () => {
    it('renders panel container', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      expect(screen.getByTestId('room-properties-panel')).toBeInTheDocument();
    });

    it('renders with accessible heading', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /room properties/i })).toBeInTheDocument();
    });

    it('displays room name', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      expect(screen.getByDisplayValue('Conference Room A')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Dimension Inputs Tests
  // ============================================================================

  describe('Dimension Inputs', () => {
    it('renders width input with current value', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const widthInput = screen.getByLabelText(/width/i);
      expect(widthInput).toHaveValue(20);
    });

    it('renders length input with current value', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const lengthInput = screen.getByLabelText(/length/i);
      expect(lengthInput).toHaveValue(30);
    });

    it('renders ceiling height input with current value', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const heightInput = screen.getByLabelText(/ceiling height/i);
      expect(heightInput).toHaveValue(10);
    });

    it('updates width when changed', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const widthInput = screen.getByLabelText(/width/i);
      // Use triple click to select all, then type new value
      await user.tripleClick(widthInput);
      await user.keyboard('25');

      // Check that onUpdate was called with width property
      expect(onUpdate).toHaveBeenCalled();
      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('width');
      expect(typeof lastCall.width).toBe('number');
    });

    it('updates length when changed', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const lengthInput = screen.getByLabelText(/length/i);
      await user.tripleClick(lengthInput);
      await user.keyboard('35');

      expect(onUpdate).toHaveBeenCalled();
      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('length');
      expect(typeof lastCall.length).toBe('number');
    });

    it('updates ceiling height when changed', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const heightInput = screen.getByLabelText(/ceiling height/i);
      await user.tripleClick(heightInput);
      await user.keyboard('12');

      expect(onUpdate).toHaveBeenCalled();
      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('ceilingHeight');
      expect(typeof lastCall.ceilingHeight).toBe('number');
    });

    it('shows unit labels (ft)', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const ftLabels = screen.getAllByText(/ft/i);
      expect(ftLabels.length).toBeGreaterThanOrEqual(3);
    });

    it('prevents negative dimensions', () => {
      const onUpdate = vi.fn();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const widthInput = screen.getByLabelText(/width/i);
      expect(widthInput).toHaveAttribute('min', '1');
    });
  });

  // ============================================================================
  // Room Type Selector Tests
  // ============================================================================

  describe('Room Type Selector', () => {
    it('renders room type selector with current value', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const selector = screen.getByLabelText(/room type/i);
      expect(selector).toHaveValue('conference');
    });

    it('shows all room type options', async () => {
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} />);

      const selector = screen.getByLabelText(/room type/i);
      await user.click(selector);

      expect(screen.getByText(/huddle/i)).toBeInTheDocument();
      expect(screen.getByText(/conference/i)).toBeInTheDocument();
      expect(screen.getByText(/training/i)).toBeInTheDocument();
      expect(screen.getByText(/boardroom/i)).toBeInTheDocument();
      expect(screen.getByText(/auditorium/i)).toBeInTheDocument();
    });

    it('updates room type when changed', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const selector = screen.getByLabelText(/room type/i);
      await user.selectOptions(selector, 'training');

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ roomType: 'training' })
        );
      });
    });
  });

  // ============================================================================
  // Platform Selector Tests
  // ============================================================================

  describe('Platform Selector', () => {
    it('renders platform selector with current value', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const selector = screen.getByLabelText(/platform/i);
      expect(selector).toHaveValue('teams');
    });

    it('shows all platform options', async () => {
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} />);

      const selector = screen.getByLabelText(/platform/i);
      await user.click(selector);

      expect(screen.getByText(/teams/i)).toBeInTheDocument();
      expect(screen.getByText(/zoom/i)).toBeInTheDocument();
      expect(screen.getByText(/webex/i)).toBeInTheDocument();
      expect(screen.getByText(/meet/i)).toBeInTheDocument();
      expect(screen.getByText(/multi/i)).toBeInTheDocument();
    });

    it('updates platform when changed', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const selector = screen.getByLabelText(/platform/i);
      await user.selectOptions(selector, 'zoom');

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'zoom' })
        );
      });
    });
  });

  // ============================================================================
  // Ecosystem Selector Tests
  // ============================================================================

  describe('Ecosystem Selector', () => {
    it('renders ecosystem selector with current value', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const selector = screen.getByLabelText(/ecosystem/i);
      expect(selector).toHaveValue('poly');
    });

    it('shows all ecosystem options', async () => {
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} />);

      const selector = screen.getByLabelText(/ecosystem/i);
      await user.click(selector);

      expect(screen.getByText(/poly/i)).toBeInTheDocument();
      expect(screen.getByText(/logitech/i)).toBeInTheDocument();
      expect(screen.getByText(/cisco/i)).toBeInTheDocument();
      expect(screen.getByText(/crestron/i)).toBeInTheDocument();
      expect(screen.getByText(/biamp/i)).toBeInTheDocument();
      expect(screen.getByText(/qsc/i)).toBeInTheDocument();
    });

    it('updates ecosystem when changed', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const selector = screen.getByLabelText(/ecosystem/i);
      await user.selectOptions(selector, 'logitech');

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ ecosystem: 'logitech' })
        );
      });
    });
  });

  // ============================================================================
  // Tier Selector Tests
  // ============================================================================

  describe('Tier Selector', () => {
    it('renders tier selector with current value', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const selector = screen.getByLabelText(/tier|quality/i);
      expect(selector).toHaveValue('standard');
    });

    it('shows all tier options', async () => {
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} />);

      const selector = screen.getByLabelText(/tier|quality/i);
      await user.click(selector);

      expect(screen.getByText(/budget/i)).toBeInTheDocument();
      expect(screen.getByText(/standard/i)).toBeInTheDocument();
      expect(screen.getByText(/premium/i)).toBeInTheDocument();
      expect(screen.getByText(/executive/i)).toBeInTheDocument();
    });

    it('updates tier when changed', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const selector = screen.getByLabelText(/tier|quality/i);
      await user.selectOptions(selector, 'premium');

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ tier: 'premium' })
        );
      });
    });
  });

  // ============================================================================
  // Room Name Tests
  // ============================================================================

  describe('Room Name', () => {
    it('renders room name input with current value', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveValue('Conference Room A');
    });

    it('updates room name when changed', async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<RoomPropertiesPanel {...defaultProps} onUpdate={onUpdate} />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.tripleClick(nameInput);
      await user.keyboard('New Room Name');

      // Check that onUpdate was called with name property
      expect(onUpdate).toHaveBeenCalled();
      const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('name');
      expect(typeof lastCall.name).toBe('string');
    });
  });

  // ============================================================================
  // Validation Feedback Tests
  // ============================================================================

  describe('Validation Feedback', () => {
    it('displays validation errors', () => {
      render(
        <RoomPropertiesPanel
          {...defaultProps}
          validationErrors={['Room dimensions are too small']}
        />
      );

      expect(screen.getByText(/room dimensions are too small/i)).toBeInTheDocument();
    });

    it('displays multiple validation errors', () => {
      render(
        <RoomPropertiesPanel
          {...defaultProps}
          validationErrors={[
            'Room dimensions are too small',
            'Missing required equipment',
          ]}
        />
      );

      expect(screen.getByText(/room dimensions are too small/i)).toBeInTheDocument();
      expect(screen.getByText(/missing required equipment/i)).toBeInTheDocument();
    });

    it('displays validation warnings', () => {
      render(
        <RoomPropertiesPanel
          {...defaultProps}
          validationWarnings={['Consider adding more displays']}
        />
      );

      expect(screen.getByText(/consider adding more displays/i)).toBeInTheDocument();
    });

    it('shows error styling for validation errors', () => {
      render(
        <RoomPropertiesPanel
          {...defaultProps}
          validationErrors={['Error message']}
        />
      );

      const errorElement = screen.getByText(/error message/i);
      expect(errorElement.closest('[data-testid="validation-errors"]')).toBeInTheDocument();
    });

    it('shows warning styling for validation warnings', () => {
      render(
        <RoomPropertiesPanel
          {...defaultProps}
          validationWarnings={['Warning message']}
        />
      );

      const warningElement = screen.getByText(/warning message/i);
      expect(warningElement.closest('[data-testid="validation-warnings"]')).toBeInTheDocument();
    });

    it('hides validation section when no errors or warnings', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      expect(screen.queryByTestId('validation-errors')).not.toBeInTheDocument();
      expect(screen.queryByTestId('validation-warnings')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper labels for all inputs', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/length/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ceiling height/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/room type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/platform/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ecosystem/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tier|quality/i)).toBeInTheDocument();
    });

    it('uses semantic form elements', () => {
      render(<RoomPropertiesPanel {...defaultProps} />);

      expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByRole('spinbutton').length).toBeGreaterThanOrEqual(3);
      expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(4);
    });

    it('has proper aria-invalid for error state', () => {
      render(
        <RoomPropertiesPanel
          {...defaultProps}
          validationErrors={['Invalid width']}
        />
      );

      // Panel should indicate invalid state when there are errors
      expect(screen.getByTestId('room-properties-panel')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });
  });

  // ============================================================================
  // Empty/Loading States Tests
  // ============================================================================

  describe('Empty/Loading States', () => {
    it('renders empty state when no room provided', () => {
      render(
        <RoomPropertiesPanel
          {...defaultProps}
          room={undefined as unknown as Room}
        />
      );

      expect(screen.getByText(/no room selected/i)).toBeInTheDocument();
    });
  });
});
