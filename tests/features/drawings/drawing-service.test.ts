/**
 * Drawing Service - Test Suite
 *
 * Tests for drawing CRUD operations and layer/override management
 * via Supabase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawingService } from '@/features/drawings/drawing-service';
import type {
  Drawing,
  DrawingLayer,
  DrawingElement,
  DrawingOverride,
  DrawingType,
} from '@/types/drawing';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('DrawingService', () => {
  let service: DrawingService;

  const mockElement: DrawingElement = {
    id: 'elem-1',
    type: 'equipment',
    x: 100,
    y: 200,
    rotation: 0,
    properties: { equipmentId: 'eq-1' },
  };

  const mockLayer: DrawingLayer = {
    id: 'layer-1',
    name: 'AV Elements',
    type: 'av_elements',
    isLocked: false,
    isVisible: true,
    elements: [mockElement],
  };

  const mockOverride: DrawingOverride = {
    elementId: 'elem-1',
    field: 'x',
    originalValue: 100,
    newValue: 150,
    createdAt: '2026-01-18T00:00:00Z',
  };

  const _mockDrawing: Drawing = {
    id: 'drawing-1',
    roomId: 'room-1',
    type: 'electrical',
    layers: [mockLayer],
    overrides: [mockOverride],
    generatedAt: '2026-01-18T00:00:00Z',
  };

  const mockDbElement = {
    id: 'elem-1',
    type: 'equipment',
    x: 100,
    y: 200,
    rotation: 0,
    properties: { equipmentId: 'eq-1' },
  };

  const mockDbLayer = {
    id: 'layer-1',
    name: 'AV Elements',
    type: 'av_elements',
    is_locked: false,
    is_visible: true,
    elements: [mockDbElement],
  };

  const mockDbOverride = {
    element_id: 'elem-1',
    field: 'x',
    original_value: 100,
    new_value: 150,
    created_at: '2026-01-18T00:00:00Z',
  };

  const mockDbRow = {
    id: 'drawing-1',
    room_id: 'room-1',
    type: 'electrical',
    layers: [mockDbLayer],
    overrides: [mockDbOverride],
    generated_at: '2026-01-18T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DrawingService();
  });

  // ============================================================================
  // getAll Tests
  // ============================================================================

  describe('getAll', () => {
    it('fetches all drawings ordered by generated_at descending', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(supabase.from).toHaveBeenCalledWith('drawings');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(1);
      expect(result[0].roomId).toBe('room-1');
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
  // getByRoom Tests
  // ============================================================================

  describe('getByRoom', () => {
    it('fetches drawings by room ID', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [mockDbRow], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getByRoom('room-1');

      expect(mockEq).toHaveBeenCalledWith('room_id', 'room-1');
      expect(result).toHaveLength(1);
      expect(result[0].roomId).toBe('room-1');
    });

    it('returns empty array for room with no drawings', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getByRoom('room-empty');

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // getByType Tests
  // ============================================================================

  describe('getByType', () => {
    it('fetches drawings by type', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [mockDbRow], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getByType('electrical' as DrawingType);

      expect(mockEq).toHaveBeenCalledWith('type', 'electrical');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('electrical');
    });

    it('returns empty array when no drawings of type', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getByType('rack' as DrawingType);

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // getById Tests
  // ============================================================================

  describe('getById', () => {
    it('fetches drawing by id', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getById('drawing-1');

      expect(mockEq).toHaveBeenCalledWith('id', 'drawing-1');
      expect(result?.roomId).toBe('room-1');
    });

    it('returns null when drawing not found', async () => {
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

      await expect(service.getById('drawing-1')).rejects.toEqual({
        code: 'OTHER_ERROR',
        message: 'Database error',
      });
    });
  });

  // ============================================================================
  // create Tests
  // ============================================================================

  describe('create', () => {
    it('creates new drawing with room ID and type', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.create('room-1', 'electrical' as DrawingType);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          room_id: 'room-1',
          type: 'electrical',
          layers: [],
          overrides: [],
        })
      );
      expect(result.roomId).toBe('room-1');
      expect(result.type).toBe('electrical');
    });

    it('creates drawing with optional layers', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.create('room-1', 'electrical' as DrawingType, [mockLayer]);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          layers: expect.arrayContaining([
            expect.objectContaining({
              id: 'layer-1',
              is_locked: false,
              is_visible: true,
            }),
          ]),
        })
      );
    });

    it('throws error on create failure', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Insert failed'),
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(service.create('room-1', 'electrical' as DrawingType)).rejects.toThrow(
        'Insert failed'
      );
    });
  });

  // ============================================================================
  // update Tests
  // ============================================================================

  describe('update', () => {
    it('updates existing drawing type', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.update('drawing-1', { type: 'elevation' as DrawingType });

      expect(mockUpdate).toHaveBeenCalledWith({ type: 'elevation' });
      expect(mockEq).toHaveBeenCalledWith('id', 'drawing-1');
      expect(result.type).toBe('electrical'); // Returns mock data
    });

    it('updates drawing layers', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.update('drawing-1', { layers: [mockLayer] });

      expect(mockUpdate).toHaveBeenCalledWith({
        layers: expect.arrayContaining([
          expect.objectContaining({
            id: 'layer-1',
            is_locked: false,
            is_visible: true,
          }),
        ]),
      });
    });

    it('updates drawing overrides', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.update('drawing-1', { overrides: [mockOverride] });

      expect(mockUpdate).toHaveBeenCalledWith({
        overrides: expect.arrayContaining([
          expect.objectContaining({
            element_id: 'elem-1',
            original_value: 100,
            new_value: 150,
          }),
        ]),
      });
    });

    it('throws error on update failure', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(
        service.update('drawing-1', { type: 'elevation' as DrawingType })
      ).rejects.toThrow('Update failed');
    });
  });

  // ============================================================================
  // delete Tests
  // ============================================================================

  describe('delete', () => {
    it('deletes drawing by id', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.delete('drawing-1');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'drawing-1');
    });

    it('throws error on delete failure', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: new Error('Delete failed') });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(service.delete('drawing-1')).rejects.toThrow('Delete failed');
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

      expect(result[0].roomId).toBe('room-1');
      expect(result[0].generatedAt).toBe('2026-01-18T00:00:00Z');
    });

    it('maps layers from snake_case to camelCase', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].layers).toHaveLength(1);
      expect(result[0].layers[0].isLocked).toBe(false);
      expect(result[0].layers[0].isVisible).toBe(true);
    });

    it('maps overrides from snake_case to camelCase', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].overrides).toHaveLength(1);
      expect(result[0].overrides[0].elementId).toBe('elem-1');
      expect(result[0].overrides[0].originalValue).toBe(100);
      expect(result[0].overrides[0].newValue).toBe(150);
      expect(result[0].overrides[0].createdAt).toBe('2026-01-18T00:00:00Z');
    });

    it('maps layer elements correctly', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      const element = result[0].layers[0].elements[0];
      expect(element.id).toBe('elem-1');
      expect(element.type).toBe('equipment');
      expect(element.x).toBe(100);
      expect(element.y).toBe(200);
      expect(element.rotation).toBe(0);
      expect(element.properties).toEqual({ equipmentId: 'eq-1' });
    });

    it('handles empty layers array', async () => {
      const rowWithEmptyLayers = { ...mockDbRow, layers: [] };
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [rowWithEmptyLayers], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].layers).toEqual([]);
    });

    it('handles empty overrides array', async () => {
      const rowWithEmptyOverrides = { ...mockDbRow, overrides: [] };
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [rowWithEmptyOverrides], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].overrides).toEqual([]);
    });

    it('handles null layers (defaults to empty array)', async () => {
      const rowWithNullLayers = { ...mockDbRow, layers: null };
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [rowWithNullLayers], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].layers).toEqual([]);
    });

    it('handles null overrides (defaults to empty array)', async () => {
      const rowWithNullOverrides = { ...mockDbRow, overrides: null };
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [rowWithNullOverrides], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].overrides).toEqual([]);
    });
  });
});
