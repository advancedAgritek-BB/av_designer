/**
 * Source Templates React Query Hooks
 *
 * Provides React Query hooks for managing source templates
 * (saved column mappings for repeat imports).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSourceTemplates,
  getSourceTemplate,
  createSourceTemplate,
  updateSourceTemplate,
  deleteSourceTemplate,
} from './import-service';
import type { SourceTemplateCreate, SourceTemplateUpdate } from './import-types';

// =============================================================================
// Query Key Factory
// =============================================================================

const SOURCE_TEMPLATE_KEYS = {
  all: ['sourceTemplates'] as const,
  list: (orgId: string) => [...SOURCE_TEMPLATE_KEYS.all, 'list', orgId] as const,
  detail: (id: string) => [...SOURCE_TEMPLATE_KEYS.all, 'detail', id] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all source templates for an organization
 */
export function useSourceTemplates(orgId: string) {
  return useQuery({
    queryKey: SOURCE_TEMPLATE_KEYS.list(orgId),
    queryFn: () => getSourceTemplates(orgId),
    enabled: !!orgId,
  });
}

/**
 * Fetch a single source template by ID
 */
export function useSourceTemplate(id: string) {
  return useQuery({
    queryKey: SOURCE_TEMPLATE_KEYS.detail(id),
    queryFn: () => getSourceTemplate(id),
    enabled: !!id,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new source template
 * Invalidates the list query for the template's organization on success
 */
export function useCreateSourceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SourceTemplateCreate) => createSourceTemplate(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: SOURCE_TEMPLATE_KEYS.list(result.orgId),
      });
    },
  });
}

/**
 * Update an existing source template
 * Invalidates both the list and detail queries on success
 */
export function useUpdateSourceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SourceTemplateUpdate }) =>
      updateSourceTemplate(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: SOURCE_TEMPLATE_KEYS.list(result.orgId),
      });
      queryClient.invalidateQueries({
        queryKey: SOURCE_TEMPLATE_KEYS.detail(result.id),
      });
    },
  });
}

/**
 * Delete a source template
 * Invalidates all source template queries on success
 */
export function useDeleteSourceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSourceTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SOURCE_TEMPLATE_KEYS.all,
      });
    },
  });
}
