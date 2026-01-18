import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from './equipment-service';
import type { EquipmentCategory, EquipmentFormData } from '@/types/equipment';

/**
 * Query key factory for equipment queries
 * Provides consistent cache key structure for invalidation
 */
const EQUIPMENT_KEYS = {
  all: ['equipment'] as const,
  list: () => [...EQUIPMENT_KEYS.all, 'list'] as const,
  byCategory: (category: EquipmentCategory) =>
    [...EQUIPMENT_KEYS.all, 'category', category] as const,
  detail: (id: string) => [...EQUIPMENT_KEYS.all, 'detail', id] as const,
  search: (query: string) => [...EQUIPMENT_KEYS.all, 'search', query] as const,
};

/**
 * Fetch all equipment
 */
export function useEquipmentList() {
  return useQuery({
    queryKey: EQUIPMENT_KEYS.list(),
    queryFn: () => equipmentService.getAll(),
  });
}

/**
 * Fetch equipment by category
 */
export function useEquipmentByCategory(category: EquipmentCategory) {
  return useQuery({
    queryKey: EQUIPMENT_KEYS.byCategory(category),
    queryFn: () => equipmentService.getByCategory(category),
  });
}

/**
 * Fetch single equipment by ID
 * Disabled when id is empty
 */
export function useEquipment(id: string) {
  return useQuery({
    queryKey: EQUIPMENT_KEYS.detail(id),
    queryFn: () => equipmentService.getById(id),
    enabled: !!id,
  });
}

/**
 * Search equipment
 * Only executes when query is 2+ characters
 */
export function useEquipmentSearch(query: string) {
  return useQuery({
    queryKey: EQUIPMENT_KEYS.search(query),
    queryFn: () => equipmentService.search(query),
    enabled: query.length >= 2,
  });
}

/**
 * Create new equipment
 * Invalidates all equipment queries on success
 */
export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EquipmentFormData) => equipmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
    },
  });
}

/**
 * Update existing equipment
 * Invalidates all equipment queries and specific detail on success
 */
export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EquipmentFormData> }) =>
      equipmentService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.detail(id) });
    },
  });
}

/**
 * Delete equipment
 * Invalidates all equipment queries on success
 */
export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => equipmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
    },
  });
}
