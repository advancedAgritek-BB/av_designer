/**
 * DrawingsPage Component - Test Suite
 *
 * Tests for the DrawingsPage component that composes canvas, toolbar,
 * and provides drawing type switching, generation, and export functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { DrawingsPage } from '@/features/drawings/components/DrawingsPage';
import type { Drawing } from '@/types/drawing';

// Mock the hooks
vi.mock('@/features/drawings/use-drawings', () => ({
  useDrawingsByRoom: vi.fn(),
  useDrawing: vi.fn(),
  useCreateDrawing: vi.fn(),
  useUpdateDrawing: vi.fn(),
  useDeleteDrawing: vi.fn(),
}));

// Mock Tauri commands
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import {
  useDrawingsByRoom,
  useDrawing,
  useCreateDrawing,
  useUpdateDrawing,
} from '@/features/drawings/use-drawings';
import { invoke } from '@tauri-apps/api/core';

const mockDrawing: Drawing = {
  id: 'drawing-1',
  roomId: 'room-1',
  type: 'electrical',
  layers: [
    {
      id: 'layer-1',
      name: 'AV Elements',
      type: 'av_elements',
      isLocked: false,
      isVisible: true,
      elements: [
        {
          id: 'elem-1',
          type: 'equipment',
          x: 100,
          y: 150,
          rotation: 0,
          properties: { label: 'Display Panel' },
        },
      ],
    },
    {
      id: 'layer-2',
      name: 'Annotations',
      type: 'annotations',
      isLocked: false,
      isVisible: true,
      elements: [],
    },
  ],
  overrides: [],
  generatedAt: '2024-01-01T00:00:00Z',
};

const mockElevationDrawing: Drawing = {
  ...mockDrawing,
  id: 'drawing-2',
  type: 'elevation',
};

const mockDrawings: Drawing[] = [mockDrawing, mockElevationDrawing];

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

describe('DrawingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useDrawingsByRoom).mockReturnValue({
      data: mockDrawings,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useDrawingsByRoom>);

    vi.mocked(useDrawing).mockReturnValue({
      data: mockDrawing,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useDrawing>);

    vi.mocked(useCreateDrawing).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateDrawing>);

    vi.mocked(useUpdateDrawing).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateDrawing>);

    vi.mocked(invoke).mockResolvedValue({ success: true });
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders with test id', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('drawings-page')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      vi.mocked(useDrawingsByRoom).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useDrawingsByRoom>);

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders error state', () => {
      vi.mocked(useDrawingsByRoom).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load drawings'),
      } as ReturnType<typeof useDrawingsByRoom>);

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('renders empty state when no drawings exist', () => {
      vi.mocked(useDrawingsByRoom).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useDrawingsByRoom>);

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/no drawings/i)).toBeInTheDocument();
    });

    it('renders page title', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/drawings/i);
    });
  });

  // ============================================================================
  // Layout Tests
  // ============================================================================

  describe('Layout', () => {
    it('renders drawing toolbar', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      // The DrawingToolbar component renders with role="toolbar"
      expect(
        screen.getByRole('toolbar', { name: /drawing toolbar/i })
      ).toBeInTheDocument();
    });

    it('renders drawing canvas', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('drawing-canvas')).toBeInTheDocument();
    });

    it('renders drawing list sidebar', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByTestId('drawings-list')).toBeInTheDocument();
    });

    it('displays available drawings in sidebar', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const sidebar = screen.getByTestId('drawings-list');
      expect(sidebar).toHaveTextContent(/electrical/i);
      expect(sidebar).toHaveTextContent(/elevation/i);
    });
  });

  // ============================================================================
  // Drawing Type Selection Tests
  // ============================================================================

  describe('Drawing Type Selection', () => {
    it('selects drawing from sidebar', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const drawingItem = screen.getByTestId('drawing-item-drawing-2');
      await user.click(drawingItem);

      expect(drawingItem).toHaveClass('active');
    });

    it('updates canvas when drawing is selected', async () => {
      const user = userEvent.setup();

      vi.mocked(useDrawing).mockReturnValue({
        data: mockElevationDrawing,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useDrawing>);

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const drawingItem = screen.getByTestId('drawing-item-drawing-2');
      await user.click(drawingItem);

      await waitFor(() => {
        expect(screen.getByTestId('drawing-canvas')).toHaveAttribute(
          'data-drawing-type',
          'elevation'
        );
      });
    });

    it('changes drawing type via toolbar selector', async () => {
      const user = userEvent.setup();
      const updateMutate = vi.fn();
      vi.mocked(useUpdateDrawing).mockReturnValue({
        mutate: updateMutate,
        mutateAsync: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdateDrawing>);

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const typeSelector = screen.getByTestId('drawing-type-selector');
      await user.selectOptions(typeSelector, 'rcp');

      await waitFor(() => {
        expect(updateMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'drawing-1',
            updates: expect.objectContaining({ type: 'rcp' }),
          })
        );
      });
    });
  });

  // ============================================================================
  // Drawing Generation Tests
  // ============================================================================

  describe('Drawing Generation', () => {
    it('renders generate button', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });

    it('calls generate drawing command when clicked', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const generateBtn = screen.getByRole('button', { name: /generate/i });
      await user.click(generateBtn);

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('generate_electrical', expect.any(Object));
      });
    });

    it('shows loading state during generation', async () => {
      const user = userEvent.setup();

      vi.mocked(invoke).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const generateBtn = screen.getByRole('button', { name: /generate/i });
      await user.click(generateBtn);

      expect(screen.getByText(/generating/i)).toBeInTheDocument();
    });

    it('creates new drawing when generate completes', async () => {
      const user = userEvent.setup();
      const createMutate = vi.fn();
      vi.mocked(useCreateDrawing).mockReturnValue({
        mutate: createMutate,
        mutateAsync: vi.fn().mockResolvedValue(mockDrawing),
        isPending: false,
      } as unknown as ReturnType<typeof useCreateDrawing>);

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      // First generate for a type that doesn't exist
      vi.mocked(useDrawingsByRoom).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useDrawingsByRoom>);

      const generateBtn = screen.getByRole('button', { name: /generate/i });
      await user.click(generateBtn);

      await waitFor(() => {
        expect(invoke).toHaveBeenCalled();
      });
    });

    it('shows error when generation fails', async () => {
      const user = userEvent.setup();

      vi.mocked(invoke).mockRejectedValue(new Error('Generation failed'));

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const generateBtn = screen.getByRole('button', { name: /generate/i });
      await user.click(generateBtn);

      await waitFor(() => {
        // Error is displayed in an alert role element
        expect(screen.getByRole('alert')).toHaveTextContent(/generation failed/i);
      });
    });
  });

  // ============================================================================
  // Layer Visibility Tests
  // ============================================================================

  describe('Layer Visibility', () => {
    it('toggles layer visibility via toolbar', async () => {
      const user = userEvent.setup();
      const updateMutate = vi.fn();
      vi.mocked(useUpdateDrawing).mockReturnValue({
        mutate: updateMutate,
        mutateAsync: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useUpdateDrawing>);

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const layerToggles = screen.getByTestId('layer-toggles');
      const firstLayerBtn = layerToggles.querySelector('button');
      if (firstLayerBtn) {
        await user.click(firstLayerBtn);
      }

      await waitFor(() => {
        expect(updateMutate).toHaveBeenCalled();
      });
    });

    it('reflects layer visibility state in canvas', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      // Verify layer is initially visible
      expect(screen.getByTestId('layer-layer-1')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Export Tests
  // ============================================================================

  describe('Export', () => {
    it('renders export button', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('calls export command when clicked', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const exportBtn = screen.getByRole('button', { name: /export/i });
      await user.click(exportBtn);

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('export_to_pdf', expect.any(Object));
      });
    });

    it('shows loading state during export', async () => {
      const user = userEvent.setup();

      vi.mocked(invoke).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const exportBtn = screen.getByRole('button', { name: /export/i });
      await user.click(exportBtn);

      expect(screen.getByRole('button', { name: /export/i })).toHaveAttribute(
        'aria-busy',
        'true'
      );
    });

    it('shows success message after export', async () => {
      const user = userEvent.setup();

      vi.mocked(invoke).mockResolvedValue({ path: '/path/to/export.pdf' });

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const exportBtn = screen.getByRole('button', { name: /export/i });
      await user.click(exportBtn);

      await waitFor(() => {
        expect(screen.getByText(/exported/i)).toBeInTheDocument();
      });
    });

    it('shows error when export fails', async () => {
      const user = userEvent.setup();

      vi.mocked(invoke).mockRejectedValue(new Error('Export failed'));

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const exportBtn = screen.getByRole('button', { name: /export/i });
      await user.click(exportBtn);

      await waitFor(() => {
        // Error is displayed in an alert role element
        expect(screen.getByRole('alert')).toHaveTextContent(/export failed/i);
      });
    });
  });

  // ============================================================================
  // Print Tests
  // ============================================================================

  describe('Print', () => {
    it('renders print button', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
    });

    it('triggers print dialog when clicked', async () => {
      const user = userEvent.setup();
      const mockPrint = vi.fn();
      window.print = mockPrint;

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const printBtn = screen.getByRole('button', { name: /print/i });
      await user.click(printBtn);

      expect(mockPrint).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Element Selection Tests
  // ============================================================================

  describe('Element Selection', () => {
    it('selects element when clicked on canvas', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const element = screen.getByTestId('element-elem-1');
      await user.click(element);

      expect(element).toHaveClass('selected');
    });

    it('shows selected element properties in panel', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const element = screen.getByTestId('element-elem-1');
      await user.click(element);

      await waitFor(() => {
        // The properties panel shows element properties including 'label' field
        const propertiesPanel = document.querySelector('.drawings-page__properties');
        expect(propertiesPanel).toBeInTheDocument();
        expect(propertiesPanel).toHaveTextContent('Display Panel');
      });
    });

    it('deselects element when pressing Escape', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const element = screen.getByTestId('element-elem-1');
      await user.click(element);
      expect(element).toHaveClass('selected');

      await user.keyboard('{Escape}');

      expect(element).not.toHaveClass('selected');
    });
  });

  // ============================================================================
  // Element Movement Tests
  // ============================================================================

  describe('Element Movement', () => {
    it('element is draggable', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const element = screen.getByTestId('element-elem-1');
      expect(element).toHaveAttribute('draggable', 'true');
    });
  });

  // ============================================================================
  // Keyboard Shortcuts Tests
  // ============================================================================

  describe('Keyboard Shortcuts', () => {
    it('zooms in with + key', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const canvas = screen.getByTestId('drawing-canvas');
      canvas.focus();

      await user.keyboard('+');

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('110%');
    });

    it('zooms out with - key', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const canvas = screen.getByTestId('drawing-canvas');
      canvas.focus();

      await user.keyboard('-');

      expect(screen.getByTestId('zoom-level')).toHaveTextContent('90%');
    });

    it('deselects element with Escape key', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const element = screen.getByTestId('element-elem-1');
      await user.click(element);

      await user.keyboard('{Escape}');

      expect(element).not.toHaveClass('selected');
    });
  });

  // ============================================================================
  // Create Drawing Tests
  // ============================================================================

  describe('Create Drawing', () => {
    it('renders create drawing button', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /new drawing/i })).toBeInTheDocument();
    });

    it('shows drawing type options when create button clicked', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const createBtn = screen.getByRole('button', { name: /new drawing/i });
      await user.click(createBtn);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('creates new drawing of selected type', async () => {
      const user = userEvent.setup();
      const createMutate = vi.fn();
      vi.mocked(useCreateDrawing).mockReturnValue({
        mutate: createMutate,
        mutateAsync: vi.fn(),
        isPending: false,
      } as unknown as ReturnType<typeof useCreateDrawing>);

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const createBtn = screen.getByRole('button', { name: /new drawing/i });
      await user.click(createBtn);

      const rcpOption = screen.getByRole('menuitem', { name: /reflected ceiling/i });
      await user.click(rcpOption);

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            roomId: 'room-1',
            type: 'rcp',
          })
        );
      });
    });
  });

  // ============================================================================
  // Delete Drawing Tests
  // ============================================================================

  describe('Delete Drawing', () => {
    it('shows delete button when drawing is selected', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const drawingItem = screen.getByTestId('drawing-item-drawing-1');
      await user.click(drawingItem);

      expect(screen.getByRole('button', { name: /delete drawing/i })).toBeInTheDocument();
    });

    it('shows confirmation before deleting', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const drawingItem = screen.getByTestId('drawing-item-drawing-1');
      await user.click(drawingItem);

      const deleteBtn = screen.getByRole('button', { name: /delete drawing/i });
      await user.click(deleteBtn);

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible main landmark', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('has heading with page title', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(
        screen.getByRole('heading', { level: 1, name: /drawings/i })
      ).toBeInTheDocument();
    });

    it('toolbar has proper role', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('announces status changes to screen readers', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const element = screen.getByTestId('element-elem-1');
      await user.click(element);

      const statusElements = screen.getAllByRole('status');
      const hasSelectedText = statusElements.some((el) =>
        /selected/i.test(el.textContent || '')
      );
      expect(hasSelectedText).toBe(true);
    });

    it('sidebar has accessible label', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const sidebar = screen.getByTestId('drawings-list');
      expect(sidebar).toHaveAttribute('role', 'region');
      expect(sidebar).toHaveAttribute('aria-label', expect.stringMatching(/drawings/i));
    });
  });

  // ============================================================================
  // Preview Mode Tests
  // ============================================================================

  describe('Preview Mode', () => {
    it('renders preview toggle button', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    });

    it('switches to preview mode when toggled', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const previewBtn = screen.getByRole('button', { name: /preview/i });
      await user.click(previewBtn);

      expect(screen.getByTestId('drawings-page')).toHaveClass('preview-mode');
    });

    it('hides editing controls in preview mode', async () => {
      const user = userEvent.setup();

      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      const previewBtn = screen.getByRole('button', { name: /preview/i });
      await user.click(previewBtn);

      // The DrawingToolbar should be hidden in preview mode
      expect(
        screen.queryByRole('toolbar', { name: /drawing toolbar/i })
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Drawing Statistics Tests
  // ============================================================================

  describe('Drawing Statistics', () => {
    it('displays element count', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/1 element/i)).toBeInTheDocument();
    });

    it('displays layer count', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      expect(screen.getByText(/2 layers/i)).toBeInTheDocument();
    });

    it('displays last generated timestamp', () => {
      render(<DrawingsPage roomId="room-1" />, { wrapper: createWrapper() });

      // Check for formatted date somewhere
      expect(screen.getByText(/generated/i)).toBeInTheDocument();
    });
  });
});
