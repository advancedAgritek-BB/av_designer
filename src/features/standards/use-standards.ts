/**
 * Standards React Query Hooks
 *
 * Provides data fetching and mutation hooks for standards, nodes, and rules.
 * Uses React Query for caching, background updates, and optimistic UI.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  standardsService,
  type CreateStandardInput,
  type UpdateStandardInput,
  type CreateNodeInput,
  type UpdateNodeInput,
  type CreateRuleInput,
  type UpdateRuleInput,
} from './standards-service';
import type { RuleAspect } from '@/types/standards';

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Query key factory for standards-related queries.
 * Provides consistent cache key structure for invalidation.
 */
const STANDARDS_KEYS = {
  all: ['standards'] as const,
  standards: () => [...STANDARDS_KEYS.all, 'standards'] as const,
  standard: (id: string) => [...STANDARDS_KEYS.all, 'standard', id] as const,
  nodes: () => [...STANDARDS_KEYS.all, 'nodes'] as const,
  node: (id: string) => [...STANDARDS_KEYS.all, 'node', id] as const,
  nodesByParent: (parentId: string | null) =>
    [...STANDARDS_KEYS.all, 'nodes', 'parent', parentId ?? 'root'] as const,
  rules: () => [...STANDARDS_KEYS.all, 'rules'] as const,
  rule: (id: string) => [...STANDARDS_KEYS.all, 'rule', id] as const,
  rulesByAspect: (aspect: RuleAspect) =>
    [...STANDARDS_KEYS.all, 'rules', 'aspect', aspect] as const,
  rulesSearch: (query: string) =>
    [...STANDARDS_KEYS.all, 'rules', 'search', query] as const,
};

// ============================================================================
// Standards Hooks
// ============================================================================

/**
 * Fetch all standards.
 */
export function useStandardsList() {
  return useQuery({
    queryKey: STANDARDS_KEYS.standards(),
    queryFn: () => standardsService.getStandards(),
  });
}

/**
 * Fetch single standard by ID.
 * Disabled when id is empty.
 */
export function useStandard(id: string) {
  return useQuery({
    queryKey: STANDARDS_KEYS.standard(id),
    queryFn: () => standardsService.getStandardById(id),
    enabled: !!id,
  });
}

/**
 * Create new standard.
 * Invalidates all standards queries on success.
 */
export function useCreateStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStandardInput) => standardsService.createStandard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.standards() });
    },
  });
}

/**
 * Update existing standard.
 * Invalidates standards list and specific standard on success.
 */
export function useUpdateStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStandardInput }) =>
      standardsService.updateStandard(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.standards() });
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.standard(id) });
    },
  });
}

/**
 * Delete standard.
 * Invalidates all standards queries on success.
 */
export function useDeleteStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => standardsService.deleteStandard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.standards() });
    },
  });
}

// ============================================================================
// Nodes Hooks
// ============================================================================

/**
 * Fetch all standard nodes.
 */
export function useNodesList() {
  return useQuery({
    queryKey: STANDARDS_KEYS.nodes(),
    queryFn: () => standardsService.getNodes(),
  });
}

/**
 * Fetch single node by ID.
 * Disabled when id is empty.
 */
export function useNode(id: string) {
  return useQuery({
    queryKey: STANDARDS_KEYS.node(id),
    queryFn: () => standardsService.getNodeById(id),
    enabled: !!id,
  });
}

/**
 * Fetch nodes by parent ID.
 * Pass null to fetch root nodes.
 */
export function useNodesByParent(parentId: string | null) {
  return useQuery({
    queryKey: STANDARDS_KEYS.nodesByParent(parentId),
    queryFn: () => standardsService.getNodesByParent(parentId),
  });
}

/**
 * Create new node.
 * Invalidates all nodes queries on success.
 */
export function useCreateNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNodeInput) => standardsService.createNode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.nodes() });
    },
  });
}

/**
 * Update existing node.
 * Invalidates all nodes queries on success.
 */
export function useUpdateNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNodeInput }) =>
      standardsService.updateNode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.nodes() });
    },
  });
}

/**
 * Delete node.
 * Invalidates all nodes queries on success.
 */
export function useDeleteNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => standardsService.deleteNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.nodes() });
    },
  });
}

// ============================================================================
// Rules Hooks
// ============================================================================

/**
 * Fetch all rules.
 */
export function useRulesList() {
  return useQuery({
    queryKey: STANDARDS_KEYS.rules(),
    queryFn: () => standardsService.getRules(),
  });
}

/**
 * Fetch single rule by ID.
 * Disabled when id is empty.
 */
export function useRule(id: string) {
  return useQuery({
    queryKey: STANDARDS_KEYS.rule(id),
    queryFn: () => standardsService.getRuleById(id),
    enabled: !!id,
  });
}

/**
 * Fetch rules by aspect.
 */
export function useRulesByAspect(aspect: RuleAspect) {
  return useQuery({
    queryKey: STANDARDS_KEYS.rulesByAspect(aspect),
    queryFn: () => standardsService.getRulesByAspect(aspect),
  });
}

/**
 * Search rules by name or description.
 * Only executes when query is 2+ characters.
 */
export function useRulesSearch(query: string) {
  return useQuery({
    queryKey: STANDARDS_KEYS.rulesSearch(query),
    queryFn: () => standardsService.searchRules(query),
    enabled: query.length >= 2,
  });
}

/**
 * Create new rule.
 * Invalidates all rules queries on success.
 */
export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRuleInput) => standardsService.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.rules() });
    },
  });
}

/**
 * Update existing rule.
 * Invalidates all rules queries on success.
 */
export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRuleInput }) =>
      standardsService.updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.rules() });
    },
  });
}

/**
 * Delete rule.
 * Invalidates all rules queries on success.
 */
export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => standardsService.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDARDS_KEYS.rules() });
    },
  });
}
