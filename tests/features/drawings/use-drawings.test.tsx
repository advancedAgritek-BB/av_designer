/**
 * Drawing React Query Hooks - Test Suite
 *
 * Tests for drawing data fetching and mutation hooks using React Query.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useDrawingsList,
  useDrawingsByRoom,
  useDrawingsByType,
  useDrawing,
  useCreateDrawing,
  useUpdateDrawing,
  useDeleteDrawing,
} from '@/features/drawings/use-drawings';
import type {
  Drawing,
  DrawingLayer,
  DrawingOverride,
  DrawingType,
} from '@/types/drawing';

// Mock the drawing service
vi.mock('@/features/drawings/drawing-service', () => ({
  drawingService: {
    getAll: vi.fn(),
    getByRoom: vi.fn(),
    getByType: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { drawingService } from '@/features/drawings/drawing-service';

const mockLayer: DrawingLayer = {
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
      y: 200,
      rotation: 0,
      properties: { equipmentId: 'eq-1' },
    },
  ],
};

const mockOverride: DrawingOverride = {
  elementId: 'elem-1',
  field: 'x',
  originalValue: 100,
  newValue: 150,
  createdAt: '2026-01-18T00:00:00Z',
};

const mockDrawing: Drawing = {
  id: 'drawing-1',
  roomId: 'room-1',
  type: 'electrical',
  layers: [mockLayer],
  overrides: [mockOverride],
  generatedAt: '2026-01-18T00:00:00Z',
};

const mockDrawing2: Drawing = {
  id: 'drawing-2',
  roomId: 'room-1',
  type: 'elevation',
  layers: [],
  overrides: [],
  generatedAt: '2026-01-18T01:00:00Z',
};

const mockDrawing3: Drawing = {
  id: 'drawing-3',
  roomId: 'room-2',
  type: 'electrical',
  layers: [],
  overrides: [],
  generatedAt: '2026-01-18T02:00:00Z',
};

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

describe('Drawing React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // useDrawingsList Tests
  // ============================================================================

  describe('useDrawingsList', () => {
    it('fetches all drawings', async () => {
      vi.mocked(drawingService.getAll).mockResolvedValue([mockDrawing, mockDrawing2]);

      const { result } = renderHook(() => useDrawingsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].id).toBe('drawing-1');
      expect(drawingService.getAll).toHaveBeenCalledTimes(1);
    });

    it('handles empty list', async () => {
      vi.mocked(drawingService.getAll).mockResolvedValue([]);

      const { result } = renderHook(() => useDrawingsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('handles error', async () => {
      vi.mocked(drawingService.getAll).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDrawingsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ============================================================================
  // useDrawingsByRoom Tests
  // ============================================================================

  describe('useDrawingsByRoom', () => {
    it('fetches drawings by room ID', async () => {
      vi.mocked(drawingService.getByRoom).mockResolvedValue([mockDrawing, mockDrawing2]);

      const { result } = renderHook(() => useDrawingsByRoom('room-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
      expect(drawingService.getByRoom).toHaveBeenCalledWith('room-1');
    });

    it('is disabled when room ID is empty', async () => {
      const { result } = renderHook(() => useDrawingsByRoom(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(drawingService.getByRoom).not.toHaveBeenCalled();
    });

    it('handles room with no drawings', async () => {
      vi.mocked(drawingService.getByRoom).mockResolvedValue([]);

      const { result } = renderHook(() => useDrawingsByRoom('room-empty'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
      expect(drawingService.getByRoom).toHaveBeenCalledWith('room-empty');
    });

    it('handles different room IDs', async () => {
      vi.mocked(drawingService.getByRoom).mockResolvedValue([mockDrawing3]);

      const { result } = renderHook(() => useDrawingsByRoom('room-2'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.[0].roomId).toBe('room-2');
      expect(drawingService.getByRoom).toHaveBeenCalledWith('room-2');
    });
  });

  // ============================================================================
  // useDrawingsByType Tests
  // ============================================================================

  describe('useDrawingsByType', () => {
    it('fetches drawings by type', async () => {
      vi.mocked(drawingService.getByType).mockResolvedValue([mockDrawing, mockDrawing3]);

      const { result } = renderHook(() => useDrawingsByType('electrical'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].type).toBe('electrical');
      expect(drawingService.getByType).toHaveBeenCalledWith('electrical');
    });

    it('is disabled when type is empty', async () => {
      const { result } = renderHook(() => useDrawingsByType('' as DrawingType), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(drawingService.getByType).not.toHaveBeenCalled();
    });

    it('handles type with no drawings', async () => {
      vi.mocked(drawingService.getByType).mockResolvedValue([]);

      const { result } = renderHook(() => useDrawingsByType('rack'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
      expect(drawingService.getByType).toHaveBeenCalledWith('rack');
    });

    it('fetches elevation drawings', async () => {
      vi.mocked(drawingService.getByType).mockResolvedValue([mockDrawing2]);

      const { result } = renderHook(() => useDrawingsByType('elevation'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.[0].type).toBe('elevation');
      expect(drawingService.getByType).toHaveBeenCalledWith('elevation');
    });
  });

  // ============================================================================
  // useDrawing Tests
  // ============================================================================

  describe('useDrawing', () => {
    it('fetches single drawing by id', async () => {
      vi.mocked(drawingService.getById).mockResolvedValue(mockDrawing);

      const { result } = renderHook(() => useDrawing('drawing-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe('drawing-1');
      expect(result.current.data?.type).toBe('electrical');
      expect(drawingService.getById).toHaveBeenCalledWith('drawing-1');
    });

    it('returns null for non-existent drawing', async () => {
      vi.mocked(drawingService.getById).mockResolvedValue(null);

      const { result } = renderHook(() => useDrawing('nonexistent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });

    it('is disabled when id is empty', async () => {
      const { result } = renderHook(() => useDrawing(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(drawingService.getById).not.toHaveBeenCalled();
    });

    it('includes layers and overrides', async () => {
      vi.mocked(drawingService.getById).mockResolvedValue(mockDrawing);

      const { result } = renderHook(() => useDrawing('drawing-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.layers).toHaveLength(1);
      expect(result.current.data?.layers[0].name).toBe('AV Elements');
      expect(result.current.data?.overrides).toHaveLength(1);
      expect(result.current.data?.overrides[0].elementId).toBe('elem-1');
    });
  });

  // ============================================================================
  // useCreateDrawing Tests
  // ============================================================================

  describe('useCreateDrawing', () => {
    it('creates new drawing with room ID and type', async () => {
      vi.mocked(drawingService.create).mockResolvedValue(mockDrawing);

      const { result } = renderHook(() => useCreateDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          roomId: 'room-1',
          type: 'electrical',
        });
      });

      expect(drawingService.create).toHaveBeenCalledWith('room-1', 'electrical', undefined);
    });

    it('creates drawing with optional layers', async () => {
      vi.mocked(drawingService.create).mockResolvedValue(mockDrawing);

      const { result } = renderHook(() => useCreateDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          roomId: 'room-1',
          type: 'electrical',
          layers: [mockLayer],
        });
      });

      expect(drawingService.create).toHaveBeenCalledWith('room-1', 'electrical', [mockLayer]);
    });

    it('handles create error', async () => {
      vi.mocked(drawingService.create).mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useCreateDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            roomId: 'room-1',
            type: 'electrical',
          });
        } catch {
          // Expected
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('returns created drawing', async () => {
      vi.mocked(drawingService.create).mockResolvedValue(mockDrawing);

      const { result } = renderHook(() => useCreateDrawing(), {
        wrapper: createWrapper(),
      });

      let createdDrawing: Drawing | undefined;
      await act(async () => {
        createdDrawing = await result.current.mutateAsync({
          roomId: 'room-1',
          type: 'electrical',
        });
      });

      expect(createdDrawing?.id).toBe('drawing-1');
      expect(createdDrawing?.roomId).toBe('room-1');
    });
  });

  // ============================================================================
  // useUpdateDrawing Tests
  // ============================================================================

  describe('useUpdateDrawing', () => {
    it('updates drawing type', async () => {
      const updatedDrawing = { ...mockDrawing, type: 'elevation' as const };
      vi.mocked(drawingService.update).mockResolvedValue(updatedDrawing);

      const { result } = renderHook(() => useUpdateDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'drawing-1',
          updates: { type: 'elevation' },
        });
      });

      expect(drawingService.update).toHaveBeenCalledWith('drawing-1', { type: 'elevation' });
    });

    it('updates drawing layers', async () => {
      const newLayer: DrawingLayer = {
        id: 'layer-2',
        name: 'Annotations',
        type: 'annotations',
        isLocked: false,
        isVisible: true,
        elements: [],
      };
      const updatedDrawing = { ...mockDrawing, layers: [mockLayer, newLayer] };
      vi.mocked(drawingService.update).mockResolvedValue(updatedDrawing);

      const { result } = renderHook(() => useUpdateDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'drawing-1',
          updates: { layers: [mockLayer, newLayer] },
        });
      });

      expect(drawingService.update).toHaveBeenCalledWith('drawing-1', {
        layers: [mockLayer, newLayer],
      });
    });

    it('updates drawing overrides', async () => {
      const newOverride: DrawingOverride = {
        elementId: 'elem-2',
        field: 'y',
        originalValue: 200,
        newValue: 250,
        createdAt: '2026-01-18T03:00:00Z',
      };
      const updatedDrawing = { ...mockDrawing, overrides: [mockOverride, newOverride] };
      vi.mocked(drawingService.update).mockResolvedValue(updatedDrawing);

      const { result } = renderHook(() => useUpdateDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'drawing-1',
          updates: { overrides: [mockOverride, newOverride] },
        });
      });

      expect(drawingService.update).toHaveBeenCalledWith('drawing-1', {
        overrides: [mockOverride, newOverride],
      });
    });

    it('handles update error', async () => {
      vi.mocked(drawingService.update).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useUpdateDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            id: 'drawing-1',
            updates: { type: 'elevation' },
          });
        } catch {
          // Expected
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('returns updated drawing', async () => {
      const updatedDrawing = { ...mockDrawing, type: 'rcp' as const };
      vi.mocked(drawingService.update).mockResolvedValue(updatedDrawing);

      const { result } = renderHook(() => useUpdateDrawing(), {
        wrapper: createWrapper(),
      });

      let resultDrawing: Drawing | undefined;
      await act(async () => {
        resultDrawing = await result.current.mutateAsync({
          id: 'drawing-1',
          updates: { type: 'rcp' },
        });
      });

      expect(resultDrawing?.type).toBe('rcp');
    });
  });

  // ============================================================================
  // useDeleteDrawing Tests
  // ============================================================================

  describe('useDeleteDrawing', () => {
    it('deletes drawing by id', async () => {
      vi.mocked(drawingService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('drawing-1');
      });

      expect(drawingService.delete).toHaveBeenCalledWith('drawing-1');
    });

    it('handles delete error', async () => {
      vi.mocked(drawingService.delete).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync('drawing-1');
        } catch {
          // Expected
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('handles deleting non-existent drawing', async () => {
      vi.mocked(drawingService.delete).mockRejectedValue(new Error('Drawing not found'));

      const { result } = renderHook(() => useDeleteDrawing(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync('nonexistent');
        } catch {
          // Expected
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(drawingService.delete).toHaveBeenCalledWith('nonexistent');
    });
  });
});
