import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from './room-service';
import type { RoomFormData, PlacedEquipment } from '@/types/room';

/**
 * Query key factory for room queries
 * Provides consistent cache key structure for invalidation
 */
const ROOM_KEYS = {
  all: ['rooms'] as const,
  list: () => [...ROOM_KEYS.all, 'list'] as const,
  byProject: (projectId: string) => [...ROOM_KEYS.all, 'project', projectId] as const,
  detail: (id: string) => [...ROOM_KEYS.all, 'detail', id] as const,
};

/**
 * Fetch all rooms
 */
export function useRoomsList() {
  return useQuery({
    queryKey: ROOM_KEYS.list(),
    queryFn: () => roomService.getAll(),
  });
}

/**
 * Fetch rooms by project ID
 * Disabled when projectId is empty
 */
export function useRoomsByProject(projectId: string) {
  return useQuery({
    queryKey: ROOM_KEYS.byProject(projectId),
    queryFn: () => roomService.getByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Fetch single room by ID
 * Disabled when id is empty
 */
export function useRoom(id: string) {
  return useQuery({
    queryKey: ROOM_KEYS.detail(id),
    queryFn: () => roomService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create new room
 * Invalidates all room queries on success
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: RoomFormData }) =>
      roomService.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
    },
  });
}

/**
 * Update existing room
 * Invalidates all room queries and specific detail on success
 */
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoomFormData> }) =>
      roomService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(id) });
    },
  });
}

/**
 * Delete room
 * Invalidates all room queries on success
 */
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roomService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
    },
  });
}

/**
 * Add placed equipment to room
 * Invalidates room queries on success
 */
export function useAddPlacedEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, equipment }: { roomId: string; equipment: PlacedEquipment }) =>
      roomService.addPlacedEquipment(roomId, equipment),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(roomId) });
    },
  });
}

/**
 * Remove placed equipment from room
 * Invalidates room queries on success
 */
export function useRemovePlacedEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      placedEquipmentId,
    }: {
      roomId: string;
      placedEquipmentId: string;
    }) => roomService.removePlacedEquipment(roomId, placedEquipmentId),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(roomId) });
    },
  });
}

/**
 * Update placed equipment position/rotation in room
 * Invalidates room queries on success
 */
export function useUpdatePlacedEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      placedEquipmentId,
      updates,
    }: {
      roomId: string;
      placedEquipmentId: string;
      updates: Partial<Omit<PlacedEquipment, 'id' | 'equipmentId'>>;
    }) => roomService.updatePlacedEquipment(roomId, placedEquipmentId, updates),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(roomId) });
    },
  });
}
