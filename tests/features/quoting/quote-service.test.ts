/**
 * Quote Service - Test Suite
 *
 * Tests for quote CRUD operations and section/item management
 * via Supabase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuoteService } from '@/features/quoting/quote-service';
import type { Quote, QuoteSection, QuoteItem, QuoteTotals } from '@/types/quote';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('QuoteService', () => {
  let service: QuoteService;

  const mockItem: QuoteItem = {
    id: 'item-1',
    equipmentId: 'equip-123',
    quantity: 2,
    unitCost: 500,
    unitPrice: 750,
    margin: 250,
    total: 1500,
    status: 'quoting',
  };

  const mockSection: QuoteSection = {
    id: 'section-1',
    name: 'Video Equipment',
    category: 'video',
    items: [mockItem],
    subtotal: 1500,
  };

  const mockTotals: QuoteTotals = {
    equipment: 1500,
    labor: 500,
    subtotal: 2000,
    tax: 200,
    total: 2200,
    margin: 500,
    marginPercentage: 25,
  };

  const _mockQuote: Quote = {
    id: 'quote-1',
    projectId: 'proj-123',
    roomId: 'room-456',
    version: 1,
    status: 'draft',
    sections: [mockSection],
    totals: mockTotals,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  };

  // Database row format (snake_case)
  const mockDbItem = {
    id: 'item-1',
    equipment_id: 'equip-123',
    quantity: 2,
    unit_cost: 500,
    unit_price: 750,
    margin: 250,
    total: 1500,
    status: 'quoting',
  };

  const mockDbSection = {
    id: 'section-1',
    name: 'Video Equipment',
    category: 'video',
    items: [mockDbItem],
    subtotal: 1500,
  };

  const mockDbTotals = {
    equipment: 1500,
    labor: 500,
    subtotal: 2000,
    tax: 200,
    total: 2200,
    margin: 500,
    margin_percentage: 25,
  };

  const mockDbRow = {
    id: 'quote-1',
    project_id: 'proj-123',
    room_id: 'room-456',
    version: 1,
    status: 'draft',
    sections: [mockDbSection],
    totals: mockDbTotals,
    created_at: '2026-01-18T00:00:00Z',
    updated_at: '2026-01-18T00:00:00Z',
  };

  beforeEach(() => {
    service = new QuoteService();
    vi.clearAllMocks();
  });

  // ============================================================================
  // getAll Tests
  // ============================================================================

  describe('getAll', () => {
    it('should fetch all quotes ordered by updated_at descending', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      expect(supabase.from).toHaveBeenCalledWith('quotes');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('quote-1');
      expect(result[0].projectId).toBe('proj-123');
      expect(result[0].roomId).toBe('room-456');
    });

    it('should return empty array when no quotes', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('should handle null data', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      await expect(service.getAll()).rejects.toEqual({ message: 'DB error' });
    });
  });

  // ============================================================================
  // getByProject Tests
  // ============================================================================

  describe('getByProject', () => {
    it('should fetch quotes by project ID', async () => {
      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getByProject('proj-123');

      expect(mockEq).toHaveBeenCalledWith('project_id', 'proj-123');
      expect(result).toHaveLength(1);
      expect(result[0].projectId).toBe('proj-123');
    });

    it('should return empty array when no quotes for project', async () => {
      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getByProject('proj-nonexistent');

      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      await expect(service.getByProject('proj-123')).rejects.toEqual({ message: 'DB error' });
    });
  });

  // ============================================================================
  // getByRoom Tests
  // ============================================================================

  describe('getByRoom', () => {
    it('should fetch quotes by room ID', async () => {
      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getByRoom('room-456');

      expect(mockEq).toHaveBeenCalledWith('room_id', 'room-456');
      expect(result).toHaveLength(1);
      expect(result[0].roomId).toBe('room-456');
    });

    it('should return empty array when no quotes for room', async () => {
      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getByRoom('room-nonexistent');

      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      await expect(service.getByRoom('room-456')).rejects.toEqual({ message: 'DB error' });
    });
  });

  // ============================================================================
  // getById Tests
  // ============================================================================

  describe('getById', () => {
    it('should fetch quote by ID', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getById('quote-1');

      expect(mockEq).toHaveBeenCalledWith('id', 'quote-1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('quote-1');
      expect(result!.projectId).toBe('proj-123');
    });

    it('should return null when quote not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw on error', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      await expect(service.getById('quote-1')).rejects.toEqual({ message: 'DB error' });
    });
  });

  // ============================================================================
  // create Tests
  // ============================================================================

  describe('create', () => {
    const createInput = {
      projectId: 'proj-123',
      roomId: 'room-456',
      version: 1,
      status: 'draft' as const,
      sections: [mockSection],
      totals: mockTotals,
    };

    it('should create a quote', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as never);

      const result = await service.create(createInput);

      expect(mockInsert).toHaveBeenCalled();
      expect(result.projectId).toBe('proj-123');
      expect(result.roomId).toBe('room-456');
    });

    it('should throw on error', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as never);

      await expect(service.create(createInput)).rejects.toEqual({ message: 'DB error' });
    });
  });

  // ============================================================================
  // update Tests
  // ============================================================================

  describe('update', () => {
    const updateInput: Partial<Quote> = {
      status: 'quoting',
      version: 2,
    };

    it('should update a quote', async () => {
      const updatedDbRow = { ...mockDbRow, status: 'quoting', version: 2 };
      const mockSingle = vi.fn().mockResolvedValue({ data: updatedDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as never);

      const result = await service.update('quote-1', updateInput);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'quote-1');
      expect(result.status).toBe('quoting');
      expect(result.version).toBe(2);
    });

    it('should throw on error', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as never);

      await expect(service.update('quote-1', updateInput)).rejects.toEqual({ message: 'DB error' });
    });
  });

  // ============================================================================
  // delete Tests
  // ============================================================================

  describe('delete', () => {
    it('should delete a quote', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as never);

      await service.delete('quote-1');

      expect(supabase.from).toHaveBeenCalledWith('quotes');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'quote-1');
    });

    it('should throw on error', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: 'DB error' } });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as never);

      await expect(service.delete('quote-1')).rejects.toEqual({ message: 'DB error' });
    });
  });

  // ============================================================================
  // Row Mapping Tests
  // ============================================================================

  describe('row mapping', () => {
    it('should map snake_case to camelCase', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      expect(result[0].projectId).toBe('proj-123');
      expect(result[0].roomId).toBe('room-456');
      expect(result[0].createdAt).toBe('2026-01-18T00:00:00Z');
      expect(result[0].updatedAt).toBe('2026-01-18T00:00:00Z');
    });

    it('should map sections correctly', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      expect(result[0].sections).toHaveLength(1);
      expect(result[0].sections[0].id).toBe('section-1');
      expect(result[0].sections[0].name).toBe('Video Equipment');
      expect(result[0].sections[0].category).toBe('video');
    });

    it('should map items within sections correctly', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      const item = result[0].sections[0].items[0];
      expect(item.id).toBe('item-1');
      expect(item.equipmentId).toBe('equip-123');
      expect(item.unitCost).toBe(500);
      expect(item.unitPrice).toBe(750);
      expect(item.status).toBe('quoting');
    });

    it('should map totals correctly', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      expect(result[0].totals.equipment).toBe(1500);
      expect(result[0].totals.labor).toBe(500);
      expect(result[0].totals.marginPercentage).toBe(25);
    });

    it('should handle null sections', async () => {
      const rowWithNullSections = { ...mockDbRow, sections: null };
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [rowWithNullSections], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      expect(result[0].sections).toEqual([]);
    });

    it('should handle null totals with defaults', async () => {
      const rowWithNullTotals = { ...mockDbRow, totals: null };
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [rowWithNullTotals], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await service.getAll();

      expect(result[0].totals.equipment).toBe(0);
      expect(result[0].totals.labor).toBe(0);
      expect(result[0].totals.total).toBe(0);
    });
  });
});
