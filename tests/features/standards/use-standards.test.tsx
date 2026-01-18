/**
 * Standards React Query Hooks Tests
 *
 * Tests for the React Query hooks that manage
 * standards, nodes, and rules data fetching and mutations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useStandardsList,
  useStandard,
  useNodesList,
  useNodesByParent,
  useRulesList,
  useRulesByAspect,
  useRulesSearch,
  useCreateStandard,
  useUpdateStandard,
  useDeleteStandard,
  useCreateNode,
  useUpdateNode,
  useDeleteNode,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
} from '@/features/standards/use-standards';
import type { Standard, StandardNode, Rule, RuleAspect } from '@/types/standards';
import type {
  CreateStandardInput,
  UpdateStandardInput,
  CreateNodeInput,
  UpdateNodeInput,
  CreateRuleInput,
  UpdateRuleInput,
} from '@/features/standards/standards-service';

// Mock the standards service
vi.mock('@/features/standards/standards-service', () => ({
  standardsService: {
    getStandards: vi.fn(),
    getStandardById: vi.fn(),
    createStandard: vi.fn(),
    updateStandard: vi.fn(),
    deleteStandard: vi.fn(),
    getNodes: vi.fn(),
    getNodeById: vi.fn(),
    getNodesByParent: vi.fn(),
    createNode: vi.fn(),
    updateNode: vi.fn(),
    deleteNode: vi.fn(),
    getRules: vi.fn(),
    getRuleById: vi.fn(),
    getRulesByAspect: vi.fn(),
    searchRules: vi.fn(),
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
  },
}));

import { standardsService } from '@/features/standards/standards-service';

const mockRule: Rule = {
  id: 'rule-1',
  name: 'Teams Display Size',
  description: 'Require 75" display for Teams rooms',
  aspect: 'equipment_selection',
  expressionType: 'constraint',
  conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
  expression: 'display.size >= 75',
  priority: 80,
  isActive: true,
  createdAt: '2026-01-18T00:00:00Z',
  updatedAt: '2026-01-18T00:00:00Z',
};

const mockNode: StandardNode = {
  id: 'node-1',
  name: 'Platform Standards',
  parentId: null,
  type: 'folder',
  order: 1,
};

const mockStandard: Standard = {
  id: 'std-1',
  nodeId: 'node-2',
  rules: [mockRule],
  createdAt: '2026-01-18T00:00:00Z',
  updatedAt: '2026-01-18T00:00:00Z',
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

describe('Standards React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Standards Hooks
  // ============================================================================

  describe('useStandardsList', () => {
    it('fetches all standards', async () => {
      vi.mocked(standardsService.getStandards).mockResolvedValue([mockStandard]);

      const { result } = renderHook(() => useStandardsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].nodeId).toBe('node-2');
      expect(standardsService.getStandards).toHaveBeenCalledTimes(1);
    });

    it('handles empty list', async () => {
      vi.mocked(standardsService.getStandards).mockResolvedValue([]);

      const { result } = renderHook(() => useStandardsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('handles error', async () => {
      vi.mocked(standardsService.getStandards).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useStandardsList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useStandard', () => {
    it('fetches single standard by id', async () => {
      vi.mocked(standardsService.getStandardById).mockResolvedValue(mockStandard);

      const { result } = renderHook(() => useStandard('std-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.nodeId).toBe('node-2');
      expect(standardsService.getStandardById).toHaveBeenCalledWith('std-1');
    });

    it('returns null for non-existent standard', async () => {
      vi.mocked(standardsService.getStandardById).mockResolvedValue(null);

      const { result } = renderHook(() => useStandard('nonexistent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });

    it('is disabled when id is empty', async () => {
      const { result } = renderHook(() => useStandard(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(standardsService.getStandardById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateStandard', () => {
    it('creates new standard', async () => {
      const input: CreateStandardInput = {
        nodeId: 'node-2',
        rules: [mockRule],
      };

      vi.mocked(standardsService.createStandard).mockResolvedValue(mockStandard);

      const { result } = renderHook(() => useCreateStandard(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(input);
      });

      expect(standardsService.createStandard).toHaveBeenCalledWith(input);
    });
  });

  describe('useUpdateStandard', () => {
    it('updates existing standard', async () => {
      const input: UpdateStandardInput = { rules: [] };
      vi.mocked(standardsService.updateStandard).mockResolvedValue({
        ...mockStandard,
        rules: [],
      });

      const { result } = renderHook(() => useUpdateStandard(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 'std-1', data: input });
      });

      expect(standardsService.updateStandard).toHaveBeenCalledWith('std-1', input);
    });
  });

  describe('useDeleteStandard', () => {
    it('deletes standard', async () => {
      vi.mocked(standardsService.deleteStandard).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteStandard(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('std-1');
      });

      expect(standardsService.deleteStandard).toHaveBeenCalledWith('std-1');
    });
  });

  // ============================================================================
  // Nodes Hooks
  // ============================================================================

  describe('useNodesList', () => {
    it('fetches all nodes', async () => {
      vi.mocked(standardsService.getNodes).mockResolvedValue([mockNode]);

      const { result } = renderHook(() => useNodesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].name).toBe('Platform Standards');
      expect(standardsService.getNodes).toHaveBeenCalledTimes(1);
    });

    it('handles empty list', async () => {
      vi.mocked(standardsService.getNodes).mockResolvedValue([]);

      const { result } = renderHook(() => useNodesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useNodesByParent', () => {
    it('fetches nodes by parent id', async () => {
      const childNode: StandardNode = { ...mockNode, id: 'node-2', parentId: 'node-1' };
      vi.mocked(standardsService.getNodesByParent).mockResolvedValue([childNode]);

      const { result } = renderHook(() => useNodesByParent('node-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(standardsService.getNodesByParent).toHaveBeenCalledWith('node-1');
    });

    it('fetches root nodes when parent is null', async () => {
      vi.mocked(standardsService.getNodesByParent).mockResolvedValue([mockNode]);

      const { result } = renderHook(() => useNodesByParent(null), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(standardsService.getNodesByParent).toHaveBeenCalledWith(null);
    });
  });

  describe('useCreateNode', () => {
    it('creates new node', async () => {
      const input: CreateNodeInput = {
        name: 'Zoom Standards',
        parentId: 'node-1',
        type: 'folder',
        order: 2,
      };

      vi.mocked(standardsService.createNode).mockResolvedValue({
        id: 'node-new',
        ...input,
      });

      const { result } = renderHook(() => useCreateNode(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(input);
      });

      expect(standardsService.createNode).toHaveBeenCalledWith(input);
    });
  });

  describe('useUpdateNode', () => {
    it('updates existing node', async () => {
      const input: UpdateNodeInput = { name: 'Updated Name' };
      vi.mocked(standardsService.updateNode).mockResolvedValue({
        ...mockNode,
        name: 'Updated Name',
      });

      const { result } = renderHook(() => useUpdateNode(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 'node-1', data: input });
      });

      expect(standardsService.updateNode).toHaveBeenCalledWith('node-1', input);
    });
  });

  describe('useDeleteNode', () => {
    it('deletes node', async () => {
      vi.mocked(standardsService.deleteNode).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteNode(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('node-1');
      });

      expect(standardsService.deleteNode).toHaveBeenCalledWith('node-1');
    });
  });

  // ============================================================================
  // Rules Hooks
  // ============================================================================

  describe('useRulesList', () => {
    it('fetches all rules', async () => {
      vi.mocked(standardsService.getRules).mockResolvedValue([mockRule]);

      const { result } = renderHook(() => useRulesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].name).toBe('Teams Display Size');
      expect(standardsService.getRules).toHaveBeenCalledTimes(1);
    });

    it('handles empty list', async () => {
      vi.mocked(standardsService.getRules).mockResolvedValue([]);

      const { result } = renderHook(() => useRulesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('handles error', async () => {
      vi.mocked(standardsService.getRules).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useRulesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useRulesByAspect', () => {
    it('fetches rules by aspect', async () => {
      vi.mocked(standardsService.getRulesByAspect).mockResolvedValue([mockRule]);

      const { result } = renderHook(() => useRulesByAspect('equipment_selection'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(standardsService.getRulesByAspect).toHaveBeenCalledWith(
        'equipment_selection'
      );
    });

    it('fetches different aspects', async () => {
      vi.mocked(standardsService.getRulesByAspect).mockResolvedValue([]);

      const { result } = renderHook(() => useRulesByAspect('quantities'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(standardsService.getRulesByAspect).toHaveBeenCalledWith('quantities');
    });
  });

  describe('useRulesSearch', () => {
    it('searches rules', async () => {
      vi.mocked(standardsService.searchRules).mockResolvedValue([mockRule]);

      const { result } = renderHook(() => useRulesSearch('Teams'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(standardsService.searchRules).toHaveBeenCalledWith('Teams');
    });

    it('is disabled for short queries', async () => {
      const { result } = renderHook(() => useRulesSearch('T'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(standardsService.searchRules).not.toHaveBeenCalled();
    });

    it('is enabled for queries with 2+ characters', async () => {
      vi.mocked(standardsService.searchRules).mockResolvedValue([]);

      const { result } = renderHook(() => useRulesSearch('Te'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(standardsService.searchRules).toHaveBeenCalledWith('Te');
    });
  });

  describe('useCreateRule', () => {
    it('creates new rule', async () => {
      const input: CreateRuleInput = {
        name: 'New Rule',
        description: 'A new rule',
        aspect: 'equipment_selection' as RuleAspect,
        expressionType: 'constraint',
        conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
        expression: 'test == true',
        priority: 50,
        isActive: true,
      };

      vi.mocked(standardsService.createRule).mockResolvedValue({
        ...mockRule,
        ...input,
        id: 'rule-new',
        createdAt: '2026-01-18T00:00:00Z',
        updatedAt: '2026-01-18T00:00:00Z',
      });

      const { result } = renderHook(() => useCreateRule(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(input);
      });

      expect(standardsService.createRule).toHaveBeenCalledWith(input);
    });
  });

  describe('useUpdateRule', () => {
    it('updates existing rule', async () => {
      const input: UpdateRuleInput = { priority: 90 };
      vi.mocked(standardsService.updateRule).mockResolvedValue({
        ...mockRule,
        priority: 90,
      });

      const { result } = renderHook(() => useUpdateRule(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 'rule-1', data: input });
      });

      expect(standardsService.updateRule).toHaveBeenCalledWith('rule-1', input);
    });
  });

  describe('useDeleteRule', () => {
    it('deletes rule', async () => {
      vi.mocked(standardsService.deleteRule).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteRule(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('rule-1');
      });

      expect(standardsService.deleteRule).toHaveBeenCalledWith('rule-1');
    });

    it('handles delete error', async () => {
      vi.mocked(standardsService.deleteRule).mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useDeleteRule(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync('rule-1');
        } catch {
          // Expected - error is thrown
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
