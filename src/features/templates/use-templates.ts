/**
 * Template React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TemplateService } from './template-service';
import { applyTemplate } from './template-apply';
import { supabase } from '@/lib/supabase';
import type {
  TemplateType,
  TemplateFilters,
  CreateTemplateData,
  UpdateTemplateData,
  UpdateTemplateContentData,
  ForkTemplateData,
  PromoteTemplateData,
  ApplyTemplateData,
} from './template-types';

// ============================================================================
// Query Keys
// ============================================================================

export const TEMPLATE_KEYS = {
  all: ['templates'] as const,
  list: (filters?: TemplateFilters) => [...TEMPLATE_KEYS.all, 'list', filters] as const,
  byType: (type: TemplateType) => [...TEMPLATE_KEYS.all, 'type', type] as const,
  detail: (id: string) => [...TEMPLATE_KEYS.all, 'detail', id] as const,
  withVersion: (id: string) => [...TEMPLATE_KEYS.all, 'with-version', id] as const,
  versions: (templateId: string) =>
    [...TEMPLATE_KEYS.all, 'versions', templateId] as const,
  version: (templateId: string, version: number) =>
    [...TEMPLATE_KEYS.all, 'version', templateId, version] as const,
};

// ============================================================================
// Template Queries
// ============================================================================

/**
 * Fetch all templates with optional filters
 */
export function useTemplateList(filters?: TemplateFilters) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.list(filters),
    queryFn: () => TemplateService.getAll(filters),
  });
}

/**
 * Fetch templates by type
 */
export function useTemplatesByType(type: TemplateType) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.byType(type),
    queryFn: () => TemplateService.getByType(type),
    enabled: !!type,
  });
}

/**
 * Fetch a single template by ID
 */
export function useTemplate(id: string) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.detail(id),
    queryFn: () => TemplateService.getById(id),
    enabled: !!id,
  });
}

/**
 * Fetch a template with its current version content
 */
export function useTemplateWithVersion(id: string) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.withVersion(id),
    queryFn: () => TemplateService.getWithVersion(id),
    enabled: !!id,
  });
}

// ============================================================================
// Template Mutations
// ============================================================================

/**
 * Create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to create a template');
      }
      return TemplateService.create(data, authData.user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.byType(variables.type) });
    },
  });
}

/**
 * Update template metadata
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: UpdateTemplateData }) =>
      TemplateService.update(params.id, params.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.withVersion(id) });
    },
  });
}

/**
 * Update template content (creates new version)
 */
export function useUpdateTemplateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: UpdateTemplateContentData }) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to update a template');
      }
      return TemplateService.updateContent(params.id, params.data, authData.user.id);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.withVersion(id) });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.versions(id) });
    },
  });
}

/**
 * Delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TemplateService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
    },
  });
}

/**
 * Archive a template
 */
export function useArchiveTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TemplateService.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(id) });
    },
  });
}

/**
 * Publish a template
 */
export function usePublishTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TemplateService.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(id) });
    },
  });
}

/**
 * Fork a template to personal scope
 */
export function useForkTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sourceId: string;
      data: ForkTemplateData;
      orgId: string;
    }) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to fork a template');
      }
      return TemplateService.fork(
        params.sourceId,
        params.data,
        authData.user.id,
        params.orgId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
    },
  });
}

/**
 * Duplicate a template within the same scope
 */
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sourceId: string; name: string }) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to duplicate a template');
      }
      return TemplateService.duplicate(params.sourceId, params.name, authData.user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
    },
  });
}

/**
 * Promote a template to higher scope
 */
export function usePromoteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: PromoteTemplateData }) =>
      TemplateService.promote(params.id, params.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(id) });
    },
  });
}

/**
 * Apply a template to create the target entity
 */
export function useApplyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { templateId: string; data: ApplyTemplateData }) =>
      applyTemplate(params.templateId, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// ============================================================================
// Version Queries & Mutations
// ============================================================================

/**
 * Fetch all versions for a template
 */
export function useTemplateVersions(templateId: string) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.versions(templateId),
    queryFn: () => TemplateService.getVersions(templateId),
    enabled: !!templateId,
  });
}

/**
 * Fetch a specific version
 */
export function useTemplateVersion(templateId: string, version: number) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.version(templateId, version),
    queryFn: () => TemplateService.getVersion(templateId, version),
    enabled: !!templateId && version > 0,
  });
}

/**
 * Restore a previous version
 */
export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { templateId: string; version: number }) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to restore a version');
      }
      return TemplateService.restoreVersion(
        params.templateId,
        params.version,
        authData.user.id
      );
    },
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.withVersion(templateId) });
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.versions(templateId) });
    },
  });
}
