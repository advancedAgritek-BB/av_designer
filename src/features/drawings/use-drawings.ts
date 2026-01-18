import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { drawingService } from './drawing-service';
import type { DrawingType, DrawingLayer, DrawingOverride } from '@/types/drawing';

/**
 * Query key factory for drawing queries
 * Provides consistent cache key structure for invalidation
 */
const DRAWING_KEYS = {
  all: ['drawings'] as const,
  list: () => [...DRAWING_KEYS.all, 'list'] as const,
  byRoom: (roomId: string) => [...DRAWING_KEYS.all, 'room', roomId] as const,
  byType: (type: DrawingType) => [...DRAWING_KEYS.all, 'type', type] as const,
  detail: (id: string) => [...DRAWING_KEYS.all, 'detail', id] as const,
};

/**
 * Fetch all drawings
 */
export function useDrawingsList() {
  return useQuery({
    queryKey: DRAWING_KEYS.list(),
    queryFn: () => drawingService.getAll(),
  });
}

/**
 * Fetch drawings by room ID
 * Disabled when roomId is empty
 */
export function useDrawingsByRoom(roomId: string) {
  return useQuery({
    queryKey: DRAWING_KEYS.byRoom(roomId),
    queryFn: () => drawingService.getByRoom(roomId),
    enabled: !!roomId,
  });
}

/**
 * Fetch drawings by type
 * Disabled when type is empty
 */
export function useDrawingsByType(type: DrawingType) {
  return useQuery({
    queryKey: DRAWING_KEYS.byType(type),
    queryFn: () => drawingService.getByType(type),
    enabled: !!type,
  });
}

/**
 * Fetch single drawing by ID
 * Disabled when id is empty
 */
export function useDrawing(id: string) {
  return useQuery({
    queryKey: DRAWING_KEYS.detail(id),
    queryFn: () => drawingService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create new drawing
 * Invalidates all drawing queries on success
 */
export function useCreateDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      type,
      layers,
    }: {
      roomId: string;
      type: DrawingType;
      layers?: DrawingLayer[];
    }) => drawingService.create(roomId, type, layers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRAWING_KEYS.all });
    },
  });
}

/**
 * Update existing drawing
 * Invalidates all drawing queries and specific detail on success
 */
export function useUpdateDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        type: DrawingType;
        layers: DrawingLayer[];
        overrides: DrawingOverride[];
      }>;
    }) => drawingService.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DRAWING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DRAWING_KEYS.detail(id) });
    },
  });
}

/**
 * Delete drawing
 * Invalidates all drawing queries on success
 */
export function useDeleteDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => drawingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRAWING_KEYS.all });
    },
  });
}
