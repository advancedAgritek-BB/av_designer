/**
 * Room Service - Test Suite
 *
 * Tests for room CRUD operations and placed equipment management
 * via Supabase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomService } from '@/features/room-builder/room-service';
import type { Room, RoomFormData, PlacedEquipment } from '@/types/room';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('RoomService', () => {
  let service: RoomService;

  const _mockRoom: Room = {
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

  const mockDbRow = {
    id: 'room-1',
    project_id: 'project-1',
    name: 'Conference Room A',
    room_type: 'conference',
    width: 20,
    length: 30,
    ceiling_height: 10,
    platform: 'teams',
    ecosystem: 'poly',
    tier: 'standard',
    placed_equipment: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockDbRowWithEquipment = {
    ...mockDbRow,
    placed_equipment: [
      {
        id: 'pe-1',
        equipment_id: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mount_type: 'ceiling',
        configuration: { zoom_level: 2 },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RoomService();
  });

  // ============================================================================
  // getAll Tests
  // ============================================================================

  describe('getAll', () => {
    it('fetches all rooms ordered by name', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(supabase.from).toHaveBeenCalledWith('rooms');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Conference Room A');
    });

    it('returns empty array when no data', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('throws error on database error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(service.getAll()).rejects.toThrow('DB Error');
    });
  });

  // ============================================================================
  // getByProject Tests
  // ============================================================================

  describe('getByProject', () => {
    it('fetches rooms by project ID', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [mockDbRow], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getByProject('project-1');

      expect(mockEq).toHaveBeenCalledWith('project_id', 'project-1');
      expect(result).toHaveLength(1);
      expect(result[0].projectId).toBe('project-1');
    });

    it('returns empty array for project with no rooms', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getByProject('project-empty');

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // getById Tests
  // ============================================================================

  describe('getById', () => {
    it('fetches room by id', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getById('room-1');

      expect(mockEq).toHaveBeenCalledWith('id', 'room-1');
      expect(result?.name).toBe('Conference Room A');
    });

    it('returns null when room not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('throws error on other database errors', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database error' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(service.getById('room-1')).rejects.toEqual({
        code: 'OTHER_ERROR',
        message: 'Database error',
      });
    });
  });

  // ============================================================================
  // create Tests
  // ============================================================================

  describe('create', () => {
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

      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.create('project-1', formData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: 'project-1',
          name: 'Conference Room A',
          room_type: 'conference',
          ceiling_height: 10,
        })
      );
      expect(result.name).toBe('Conference Room A');
    });

    it('throws error on create failure', async () => {
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

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Insert failed'),
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(service.create('project-1', formData)).rejects.toThrow(
        'Insert failed'
      );
    });
  });

  // ============================================================================
  // update Tests
  // ============================================================================

  describe('update', () => {
    it('updates existing room', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.update('room-1', { name: 'Updated Room' });

      expect(mockUpdate).toHaveBeenCalledWith({ name: 'Updated Room' });
      expect(mockEq).toHaveBeenCalledWith('id', 'room-1');
      expect(result.name).toBe('Conference Room A');
    });

    it('only updates provided fields', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.update('room-1', { width: 25, length: 35 });

      expect(mockUpdate).toHaveBeenCalledWith({ width: 25, length: 35 });
    });

    it('maps camelCase to snake_case on update', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.update('room-1', { roomType: 'boardroom', ceilingHeight: 12 });

      expect(mockUpdate).toHaveBeenCalledWith({
        room_type: 'boardroom',
        ceiling_height: 12,
      });
    });
  });

  // ============================================================================
  // delete Tests
  // ============================================================================

  describe('delete', () => {
    it('deletes room by id', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.delete('room-1');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'room-1');
    });

    it('throws error on delete failure', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: new Error('Delete failed') });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(service.delete('room-1')).rejects.toThrow('Delete failed');
    });
  });

  // ============================================================================
  // addPlacedEquipment Tests
  // ============================================================================

  describe('addPlacedEquipment', () => {
    it('adds equipment to room', async () => {
      const placedEquipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'ceiling',
      };

      // First call fetches current room
      const mockSingleGet = vi.fn().mockResolvedValue({
        data: mockDbRow,
        error: null,
      });
      const mockEqGet = vi.fn().mockReturnValue({ single: mockSingleGet });
      const mockSelectGet = vi.fn().mockReturnValue({ eq: mockEqGet });

      // Second call updates room
      const mockSingleUpdate = vi.fn().mockResolvedValue({
        data: mockDbRowWithEquipment,
        error: null,
      });
      const mockSelectUpdate = vi.fn().mockReturnValue({ single: mockSingleUpdate });
      const mockEqUpdate = vi.fn().mockReturnValue({ select: mockSelectUpdate });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return { select: mockSelectGet } as unknown as ReturnType<typeof supabase.from>;
        }
        return { update: mockUpdate } as unknown as ReturnType<typeof supabase.from>;
      });

      const result = await service.addPlacedEquipment('room-1', placedEquipment);

      expect(result.placedEquipment).toHaveLength(1);
      expect(result.placedEquipment[0].equipmentId).toBe('eq-1');
    });

    it('throws error if room not found', async () => {
      const placedEquipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'ceiling',
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(
        service.addPlacedEquipment('nonexistent', placedEquipment)
      ).rejects.toThrow('Room not found');
    });
  });

  // ============================================================================
  // removePlacedEquipment Tests
  // ============================================================================

  describe('removePlacedEquipment', () => {
    it('removes equipment from room', async () => {
      // First call fetches current room with equipment
      const mockSingleGet = vi.fn().mockResolvedValue({
        data: mockDbRowWithEquipment,
        error: null,
      });
      const mockEqGet = vi.fn().mockReturnValue({ single: mockSingleGet });
      const mockSelectGet = vi.fn().mockReturnValue({ eq: mockEqGet });

      // Second call updates room without the equipment
      const mockSingleUpdate = vi.fn().mockResolvedValue({
        data: { ...mockDbRow, placed_equipment: [] },
        error: null,
      });
      const mockSelectUpdate = vi.fn().mockReturnValue({ single: mockSingleUpdate });
      const mockEqUpdate = vi.fn().mockReturnValue({ select: mockSelectUpdate });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return { select: mockSelectGet } as unknown as ReturnType<typeof supabase.from>;
        }
        return { update: mockUpdate } as unknown as ReturnType<typeof supabase.from>;
      });

      const result = await service.removePlacedEquipment('room-1', 'pe-1');

      expect(result.placedEquipment).toHaveLength(0);
    });

    it('throws error if room not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(service.removePlacedEquipment('nonexistent', 'pe-1')).rejects.toThrow(
        'Room not found'
      );
    });

    it('throws error if equipment not found in room', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockDbRow, // Empty placed_equipment
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(
        service.removePlacedEquipment('room-1', 'nonexistent')
      ).rejects.toThrow('Placed equipment not found');
    });
  });

  // ============================================================================
  // updatePlacedEquipment Tests
  // ============================================================================

  describe('updatePlacedEquipment', () => {
    it('updates equipment position in room', async () => {
      // First call fetches current room with equipment
      const mockSingleGet = vi.fn().mockResolvedValue({
        data: mockDbRowWithEquipment,
        error: null,
      });
      const mockEqGet = vi.fn().mockReturnValue({ single: mockSingleGet });
      const mockSelectGet = vi.fn().mockReturnValue({ eq: mockEqGet });

      // Second call updates room with new position
      const updatedDbRow = {
        ...mockDbRowWithEquipment,
        placed_equipment: [
          {
            id: 'pe-1',
            equipment_id: 'eq-1',
            x: 25,
            y: 30,
            rotation: 90,
            mount_type: 'ceiling',
            configuration: { zoom_level: 2 },
          },
        ],
      };
      const mockSingleUpdate = vi.fn().mockResolvedValue({
        data: updatedDbRow,
        error: null,
      });
      const mockSelectUpdate = vi.fn().mockReturnValue({ single: mockSingleUpdate });
      const mockEqUpdate = vi.fn().mockReturnValue({ select: mockSelectUpdate });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return { select: mockSelectGet } as unknown as ReturnType<typeof supabase.from>;
        }
        return { update: mockUpdate } as unknown as ReturnType<typeof supabase.from>;
      });

      const result = await service.updatePlacedEquipment('room-1', 'pe-1', {
        x: 25,
        y: 30,
        rotation: 90,
      });

      expect(result.placedEquipment[0].x).toBe(25);
      expect(result.placedEquipment[0].y).toBe(30);
      expect(result.placedEquipment[0].rotation).toBe(90);
    });
  });

  // ============================================================================
  // Row Mapping Tests
  // ============================================================================

  describe('row mapping', () => {
    it('maps snake_case db columns to camelCase properties', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].projectId).toBe('project-1');
      expect(result[0].roomType).toBe('conference');
      expect(result[0].ceilingHeight).toBe(10);
      expect(result[0].createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result[0].updatedAt).toBe('2024-01-01T00:00:00Z');
    });

    it('maps placed equipment from snake_case to camelCase', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRowWithEquipment], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].placedEquipment).toHaveLength(1);
      expect(result[0].placedEquipment[0].equipmentId).toBe('eq-1');
      expect(result[0].placedEquipment[0].mountType).toBe('ceiling');
    });
  });
});
