import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useEquipmentList,
  useEquipmentByCategory,
  useEquipment,
  useEquipmentSearch,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from '@/features/equipment/use-equipment';
import type { Equipment, EquipmentFormData } from '@/types/equipment';

// Mock the equipment service
vi.mock('@/features/equipment/equipment-service', () => ({
  equipmentService: {
    getAll: vi.fn(),
    getByCategory: vi.fn(),
    getById: vi.fn(),
    search: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { equipmentService } from '@/features/equipment/equipment-service';

const mockEquipment: Equipment = {
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

describe('Equipment React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEquipmentList', () => {
    it('fetches all equipment', async () => {
      vi.mocked(equipmentService.getAll).mockResolvedValue([mockEquipment]);

      const { result } = renderHook(() => useEquipmentList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].manufacturer).toBe('Shure');
      expect(equipmentService.getAll).toHaveBeenCalledTimes(1);
    });

    it('handles empty list', async () => {
      vi.mocked(equipmentService.getAll).mockResolvedValue([]);

      const { result } = renderHook(() => useEquipmentList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('handles error', async () => {
      vi.mocked(equipmentService.getAll).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEquipmentList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useEquipmentByCategory', () => {
    it('fetches equipment by category', async () => {
      vi.mocked(equipmentService.getByCategory).mockResolvedValue([mockEquipment]);

      const { result } = renderHook(() => useEquipmentByCategory('audio'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(equipmentService.getByCategory).toHaveBeenCalledWith('audio');
    });

    it('fetches different categories', async () => {
      vi.mocked(equipmentService.getByCategory).mockResolvedValue([]);

      const { result } = renderHook(() => useEquipmentByCategory('video'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(equipmentService.getByCategory).toHaveBeenCalledWith('video');
    });
  });

  describe('useEquipment', () => {
    it('fetches single equipment by id', async () => {
      vi.mocked(equipmentService.getById).mockResolvedValue(mockEquipment);

      const { result } = renderHook(() => useEquipment('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.manufacturer).toBe('Shure');
      expect(equipmentService.getById).toHaveBeenCalledWith('1');
    });

    it('returns null for non-existent equipment', async () => {
      vi.mocked(equipmentService.getById).mockResolvedValue(null);

      const { result } = renderHook(() => useEquipment('nonexistent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });

    it('is disabled when id is empty', async () => {
      const { result } = renderHook(() => useEquipment(''), {
        wrapper: createWrapper(),
      });

      // Should not call the service when id is empty
      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(equipmentService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useEquipmentSearch', () => {
    it('searches equipment', async () => {
      vi.mocked(equipmentService.search).mockResolvedValue([mockEquipment]);

      const { result } = renderHook(() => useEquipmentSearch('Shure'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(equipmentService.search).toHaveBeenCalledWith('Shure');
    });

    it('is disabled for short queries', async () => {
      const { result } = renderHook(() => useEquipmentSearch('S'), {
        wrapper: createWrapper(),
      });

      // Should not call service for queries less than 2 characters
      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(equipmentService.search).not.toHaveBeenCalled();
    });

    it('is enabled for queries with 2+ characters', async () => {
      vi.mocked(equipmentService.search).mockResolvedValue([]);

      const { result } = renderHook(() => useEquipmentSearch('Sh'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(equipmentService.search).toHaveBeenCalledWith('Sh');
    });
  });

  describe('useCreateEquipment', () => {
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

      vi.mocked(equipmentService.create).mockResolvedValue(mockEquipment);

      const { result } = renderHook(() => useCreateEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(formData);
      });

      expect(equipmentService.create).toHaveBeenCalledWith(formData);
    });

    it('handles create error', async () => {
      const formData: EquipmentFormData = {
        manufacturer: 'Test',
        model: 'Test',
        sku: 'TEST',
        category: 'audio',
        subcategory: 'microphones',
        description: 'Test',
        cost: 100,
        msrp: 150,
        dimensions: { height: 1, width: 1, depth: 1 },
        weight: 1,
      };

      vi.mocked(equipmentService.create).mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useCreateEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync(formData);
        } catch {
          // Expected - error is thrown
        }
      });

      // Wait for mutation state to settle
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useUpdateEquipment', () => {
    it('updates existing equipment', async () => {
      const updatedEquipment = { ...mockEquipment, cost: 2999 };
      vi.mocked(equipmentService.update).mockResolvedValue(updatedEquipment);

      const { result } = renderHook(() => useUpdateEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: '1', data: { cost: 2999 } });
      });

      expect(equipmentService.update).toHaveBeenCalledWith('1', { cost: 2999 });
    });
  });

  describe('useDeleteEquipment', () => {
    it('deletes equipment', async () => {
      vi.mocked(equipmentService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('1');
      });

      expect(equipmentService.delete).toHaveBeenCalledWith('1');
    });

    it('handles delete error', async () => {
      vi.mocked(equipmentService.delete).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteEquipment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync('1');
        } catch {
          // Expected - error is thrown
        }
      });

      // Wait for mutation state to settle
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
