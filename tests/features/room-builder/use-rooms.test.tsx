/**
 * Room React Query Hooks - Test Suite
 *
 * Tests for room data fetching and mutation hooks using React Query.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useRoomsList,
  useRoomsByProject,
  useRoom,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useAddPlacedEquipment,
  useRemovePlacedEquipment,
  useUpdatePlacedEquipment,
} from '@/features/room-builder/use-rooms';
import type { Room, RoomFormData, PlacedEquipment } from '@/types/room';

// Mock the room service
vi.mock('@/features/room-builder/room-service', () => ({
  roomService: {
    getAll: vi.fn(),
    getByProject: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addPlacedEquipment: vi.fn(),
    removePlacedEquipment: vi.fn(),
    updatePlacedEquipment: vi.fn(),
  },
}));

import { roomService } from '@/features/room-builder/room-service';

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

const mockRoomWithEquipment: Room = {
  ...mockRoom,
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

describe('Room React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // useRoomsList Tests
  // ============================================================================

  describe('useRoomsList', () => {
    it('fetches all rooms', async () => {
      vi.mocked(roomService.getAll).mockResolvedValue([mockRoom]);

      const { result } = renderHook(() => useRoomsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].name).toBe('Conference Room A');
      expect(roomService.getAll).toHaveBeenCalledTimes(1);
    });

    it('handles empty list', async () => {
      vi.mocked(roomService.getAll).mockResolvedValue([]);

      const { result } = renderHook(() => useRoomsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('handles error', async () => {
      vi.mocked(roomService.getAll).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useRoomsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ============================================================================
  // useRoomsByProject Tests
  // ============================================================================

  describe('useRoomsByProject', () => {
    it('fetches rooms by project ID', async () => {
      vi.mocked(roomService.getByProject).mockResolvedValue([mockRoom]);

      const { result } = renderHook(() => useRoomsByProject('project-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(roomService.getByProject).toHaveBeenCalledWith('project-1');
    });

    it('is disabled when project ID is empty', async () => {
      const { result } = renderHook(() => useRoomsByProject(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(roomService.getByProject).not.toHaveBeenCalled();
    });

    it('handles different project IDs', async () => {
      vi.mocked(roomService.getByProject).mockResolvedValue([]);

      const { result } = renderHook(() => useRoomsByProject('project-2'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(roomService.getByProject).toHaveBeenCalledWith('project-2');
    });
  });

  // ============================================================================
  // useRoom Tests
  // ============================================================================

  describe('useRoom', () => {
    it('fetches single room by id', async () => {
      vi.mocked(roomService.getById).mockResolvedValue(mockRoom);

      const { result } = renderHook(() => useRoom('room-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.name).toBe('Conference Room A');
      expect(roomService.getById).toHaveBeenCalledWith('room-1');
    });

    it('returns null for non-existent room', async () => {
      vi.mocked(roomService.getById).mockResolvedValue(null);

      const { result } = renderHook(() => useRoom('nonexistent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });

    it('is disabled when id is empty', async () => {
      const { result } = renderHook(() => useRoom(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(roomService.getById).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // useCreateRoom Tests
  // ============================================================================

  describe('useCreateRoom', () => {
    it('creates new room', async () => {
      const formData: RoomFormData = {
        name: 'Conference Room A',
        roomType: 'conference',
        width: 20,
        length: 30,
        ceilingHeight: 10,
        platform: 'teams',
        ecosystem: 'poly',
        tier: 'standard',
      };

      vi.mocked(roomService.create).mockResolvedValue(mockRoom);

      const { result } = renderHook(() => useCreateRoom(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ projectId: 'project-1', data: formData });
      });

      expect(roomService.create).toHaveBeenCalledWith('project-1', formData);
    });

    it('handles create error', async () => {
      const formData: RoomFormData = {
        name: 'Test Room',
        roomType: 'huddle',
        width: 10,
        length: 10,
        ceilingHeight: 8,
        platform: 'zoom',
        ecosystem: 'logitech',
        tier: 'budget',
      };

      vi.mocked(roomService.create).mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useCreateRoom(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ projectId: 'project-1', data: formData });
        } catch {
          // Expected
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useUpdateRoom Tests
  // ============================================================================

  describe('useUpdateRoom', () => {
    it('updates existing room', async () => {
      const updatedRoom = { ...mockRoom, name: 'Updated Room' };
      vi.mocked(roomService.update).mockResolvedValue(updatedRoom);

      const { result } = renderHook(() => useUpdateRoom(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'room-1',
          data: { name: 'Updated Room' },
        });
      });

      expect(roomService.update).toHaveBeenCalledWith('room-1', { name: 'Updated Room' });
    });

    it('updates room dimensions', async () => {
      const updatedRoom = { ...mockRoom, width: 25, length: 35 };
      vi.mocked(roomService.update).mockResolvedValue(updatedRoom);

      const { result } = renderHook(() => useUpdateRoom(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'room-1',
          data: { width: 25, length: 35 },
        });
      });

      expect(roomService.update).toHaveBeenCalledWith('room-1', {
        width: 25,
        length: 35,
      });
    });
  });

  // ============================================================================
  // useDeleteRoom Tests
  // ============================================================================

  describe('useDeleteRoom', () => {
    it('deletes room', async () => {
      vi.mocked(roomService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteRoom(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('room-1');
      });

      expect(roomService.delete).toHaveBeenCalledWith('room-1');
    });

    it('handles delete error', async () => {
      vi.mocked(roomService.delete).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteRoom(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync('room-1');
        } catch {
          // Expected
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useAddPlacedEquipment Tests
  // ============================================================================

  describe('useAddPlacedEquipment', () => {
    it('adds equipment to room', async () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'ceiling',
      };

      vi.mocked(roomService.addPlacedEquipment).mockResolvedValue(mockRoomWithEquipment);

      const { result } = renderHook(() => useAddPlacedEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ roomId: 'room-1', equipment });
      });

      expect(roomService.addPlacedEquipment).toHaveBeenCalledWith('room-1', equipment);
    });

    it('handles add error', async () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'ceiling',
      };

      vi.mocked(roomService.addPlacedEquipment).mockRejectedValue(
        new Error('Room not found')
      );

      const { result } = renderHook(() => useAddPlacedEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ roomId: 'nonexistent', equipment });
        } catch {
          // Expected
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useRemovePlacedEquipment Tests
  // ============================================================================

  describe('useRemovePlacedEquipment', () => {
    it('removes equipment from room', async () => {
      vi.mocked(roomService.removePlacedEquipment).mockResolvedValue(mockRoom);

      const { result } = renderHook(() => useRemovePlacedEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ roomId: 'room-1', placedEquipmentId: 'pe-1' });
      });

      expect(roomService.removePlacedEquipment).toHaveBeenCalledWith('room-1', 'pe-1');
    });

    it('handles remove error for non-existent equipment', async () => {
      vi.mocked(roomService.removePlacedEquipment).mockRejectedValue(
        new Error('Placed equipment not found')
      );

      const { result } = renderHook(() => useRemovePlacedEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            roomId: 'room-1',
            placedEquipmentId: 'nonexistent',
          });
        } catch {
          // Expected
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useUpdatePlacedEquipment Tests
  // ============================================================================

  describe('useUpdatePlacedEquipment', () => {
    it('updates equipment position in room', async () => {
      const updatedRoom = {
        ...mockRoomWithEquipment,
        placedEquipment: [
          {
            id: 'pe-1',
            equipmentId: 'eq-1',
            x: 25,
            y: 30,
            rotation: 90,
            mountType: 'ceiling' as const,
          },
        ],
      };

      vi.mocked(roomService.updatePlacedEquipment).mockResolvedValue(updatedRoom);

      const { result } = renderHook(() => useUpdatePlacedEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          roomId: 'room-1',
          placedEquipmentId: 'pe-1',
          updates: { x: 25, y: 30, rotation: 90 },
        });
      });

      expect(roomService.updatePlacedEquipment).toHaveBeenCalledWith('room-1', 'pe-1', {
        x: 25,
        y: 30,
        rotation: 90,
      });
    });

    it('updates only mount type', async () => {
      const updatedRoom = {
        ...mockRoomWithEquipment,
        placedEquipment: [
          {
            ...mockRoomWithEquipment.placedEquipment[0],
            mountType: 'wall' as const,
          },
        ],
      };

      vi.mocked(roomService.updatePlacedEquipment).mockResolvedValue(updatedRoom);

      const { result } = renderHook(() => useUpdatePlacedEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          roomId: 'room-1',
          placedEquipmentId: 'pe-1',
          updates: { mountType: 'wall' },
        });
      });

      expect(roomService.updatePlacedEquipment).toHaveBeenCalledWith('room-1', 'pe-1', {
        mountType: 'wall',
      });
    });
  });
});
