import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquipmentService } from '@/features/equipment/equipment-service';
import type { Equipment, EquipmentFormData } from '@/types/equipment';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('EquipmentService', () => {
  let service: EquipmentService;

  const _mockEquipment: Equipment = {
    id: '1',
    manufacturer: 'Shure',
    model: 'MXA920',
    sku: 'MXA920-S',
    category: 'audio',
    subcategory: 'microphones',
    description: 'Ceiling array microphone',
    cost: 2847,
    msrp: 3500,
    dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
    weight: 6.2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockDbRow = {
    id: '1',
    manufacturer: 'Shure',
    model: 'MXA920',
    sku: 'MXA920-S',
    category: 'audio',
    subcategory: 'microphones',
    description: 'Ceiling array microphone',
    cost: 2847,
    msrp: 3500,
    dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
    weight: 6.2,
    electrical: null,
    platform_certifications: null,
    image_url: null,
    spec_sheet_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EquipmentService();
  });

  describe('getAll', () => {
    it('fetches all equipment', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(supabase.from).toHaveBeenCalledWith('equipment');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(1);
      expect(result[0].manufacturer).toBe('Shure');
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

  describe('getByCategory', () => {
    it('fetches equipment by category', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [mockDbRow], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getByCategory('audio');

      expect(mockEq).toHaveBeenCalledWith('category', 'audio');
      expect(result).toHaveLength(1);
    });

    it('returns empty array for category with no equipment', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getByCategory('video');

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('fetches equipment by id', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getById('1');

      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result?.manufacturer).toBe('Shure');
    });

    it('returns null when equipment not found', async () => {
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

      await expect(service.getById('1')).rejects.toEqual({
        code: 'OTHER_ERROR',
        message: 'Database error',
      });
    });
  });

  describe('search', () => {
    it('searches equipment by query', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [mockDbRow], error: null });
      const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ or: mockOr });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.search('Shure');

      expect(mockOr).toHaveBeenCalledWith(
        'manufacturer.ilike.%Shure%,model.ilike.%Shure%,description.ilike.%Shure%'
      );
      expect(result).toHaveLength(1);
    });

    it('limits search results to 50', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [mockDbRow], error: null });
      const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ or: mockOr });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.search('test');

      expect(mockLimit).toHaveBeenCalledWith(50);
    });
  });

  describe('create', () => {
    it('creates new equipment', async () => {
      const formData: EquipmentFormData = {
        manufacturer: 'Shure',
        model: 'MXA920',
        sku: 'MXA920-S',
        category: 'audio',
        subcategory: 'microphones',
        description: 'Ceiling array microphone',
        cost: 2847,
        msrp: 3500,
        dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
        weight: 6.2,
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.create(formData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          manufacturer: 'Shure',
          model: 'MXA920',
        })
      );
      expect(result.manufacturer).toBe('Shure');
    });

    it('maps platformCertifications to snake_case', async () => {
      const formData: EquipmentFormData = {
        manufacturer: 'Poly',
        model: 'Studio X50',
        sku: 'STUDIOX50',
        category: 'video',
        subcategory: 'codecs',
        description: 'Video bar',
        cost: 3499,
        msrp: 4599,
        dimensions: { height: 3.5, width: 24, depth: 4.5 },
        weight: 8.5,
        platformCertifications: ['teams', 'zoom'],
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.create(formData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          platform_certifications: ['teams', 'zoom'],
        })
      );
    });
  });

  describe('update', () => {
    it('updates existing equipment', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      // cost is passed as dollars, service converts to cents
      const result = await service.update('1', { cost: 2999 });

      // Service should convert dollars to cents
      expect(mockUpdate).toHaveBeenCalledWith({ cost_cents: 299900 });
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result.manufacturer).toBe('Shure');
    });

    it('only updates provided fields', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.update('1', { manufacturer: 'NewBrand', model: 'NewModel' });

      expect(mockUpdate).toHaveBeenCalledWith({
        manufacturer: 'NewBrand',
        model: 'NewModel',
      });
    });

    it('maps platformCertifications to snake_case on update', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.update('1', {
        platformCertifications: ['teams', 'zoom', 'webex'],
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        platform_certifications: ['teams', 'zoom', 'webex'],
      });
    });
  });

  describe('delete', () => {
    it('deletes equipment by id', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as unknown as ReturnType<typeof supabase.from>);

      await service.delete('1');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('throws error on delete failure', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: new Error('Delete failed') });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(service.delete('1')).rejects.toThrow('Delete failed');
    });
  });

  describe('row mapping', () => {
    it('maps snake_case db columns to camelCase properties', async () => {
      const dbRowWithAllFields = {
        ...mockDbRow,
        platform_certifications: ['teams', 'zoom'],
        image_url: 'https://example.com/image.png',
        spec_sheet_url: 'https://example.com/spec.pdf',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      };

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [dbRowWithAllFields], error: null }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await service.getAll();

      expect(result[0].platformCertifications).toEqual(['teams', 'zoom']);
      expect(result[0].imageUrl).toBe('https://example.com/image.png');
      expect(result[0].specSheetUrl).toBe('https://example.com/spec.pdf');
      expect(result[0].createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result[0].updatedAt).toBe('2024-01-15T00:00:00Z');
    });
  });
});
