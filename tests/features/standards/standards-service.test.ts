/**
 * Standards Service Tests
 *
 * Tests for the standards service layer that manages
 * CRUD operations and data access for standards and rules.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StandardsService, standardsService } from '@/features/standards/standards-service';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('StandardsService', () => {
  let service: StandardsService;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockEq: ReturnType<typeof vi.fn>;
  let mockIs: ReturnType<typeof vi.fn>;
  let mockOrder: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;
  let mockOr: ReturnType<typeof vi.fn>;
  let mockLimit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StandardsService();

    // Set up mock chain
    mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
    mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
    mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    mockIs = vi.fn().mockReturnValue({ order: mockOrder });
    mockEq = vi.fn().mockReturnValue({
      order: mockOrder,
      single: mockSingle,
      select: vi.fn().mockReturnValue({ single: mockSingle }),
    });
    mockSelect = vi.fn().mockReturnValue({
      order: mockOrder,
      eq: mockEq,
      is: mockIs,
      or: mockOr,
      single: mockSingle,
    });
    mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: mockSingle }),
    });
    mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: mockSingle }),
      }),
    });
    mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);
  });

  // ============================================================================
  // Standards CRUD Tests
  // ============================================================================

  describe('getStandards', () => {
    it('fetches all standards ordered by name', async () => {
      const mockStandards = [
        { id: 'std-1', node_id: 'node-1', rules: [], created_at: '', updated_at: '' },
        { id: 'std-2', node_id: 'node-2', rules: [], created_at: '', updated_at: '' },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockStandards, error: null });

      const result = await service.getStandards();

      expect(mockFrom).toHaveBeenCalledWith('standards');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(2);
      expect(result[0].nodeId).toBe('node-1');
    });

    it('throws error when fetch fails', async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.getStandards()).rejects.toEqual({ message: 'Database error' });
    });
  });

  describe('getStandardById', () => {
    it('fetches a single standard by ID', async () => {
      const mockStandard = {
        id: 'std-1',
        node_id: 'node-1',
        rules: [],
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T00:00:00Z',
      };
      mockSingle.mockResolvedValueOnce({ data: mockStandard, error: null });

      const result = await service.getStandardById('std-1');

      expect(mockFrom).toHaveBeenCalledWith('standards');
      expect(mockEq).toHaveBeenCalledWith('id', 'std-1');
      expect(result?.id).toBe('std-1');
    });

    it('returns null when standard not found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const result = await service.getStandardById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createStandard', () => {
    it('creates a new standard', async () => {
      const newStandard = {
        nodeId: 'node-1',
        rules: [],
      };
      const mockCreated = {
        id: 'std-new',
        node_id: 'node-1',
        rules: [],
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T00:00:00Z',
      };
      mockSingle.mockResolvedValueOnce({ data: mockCreated, error: null });

      const result = await service.createStandard(newStandard);

      expect(mockFrom).toHaveBeenCalledWith('standards');
      expect(mockInsert).toHaveBeenCalledWith({
        node_id: 'node-1',
        rules: [],
      });
      expect(result.id).toBe('std-new');
    });

    it('throws error when creation fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(service.createStandard({ nodeId: 'node-1', rules: [] })).rejects.toEqual({
        message: 'Insert failed',
      });
    });
  });

  describe('updateStandard', () => {
    it('updates an existing standard', async () => {
      const mockUpdated = {
        id: 'std-1',
        node_id: 'node-2',
        rules: [],
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T01:00:00Z',
      };
      const mockEqUpdate = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValueOnce({ data: mockUpdated, error: null }),
        }),
      });
      mockUpdate.mockReturnValue({ eq: mockEqUpdate });

      const result = await service.updateStandard('std-1', { nodeId: 'node-2' });

      expect(mockFrom).toHaveBeenCalledWith('standards');
      expect(mockUpdate).toHaveBeenCalledWith({ node_id: 'node-2' });
      expect(result.nodeId).toBe('node-2');
    });
  });

  describe('deleteStandard', () => {
    it('deletes a standard', async () => {
      await service.deleteStandard('std-1');

      expect(mockFrom).toHaveBeenCalledWith('standards');
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Standard Nodes Tests
  // ============================================================================

  describe('getNodes', () => {
    it('fetches all standard nodes ordered by name', async () => {
      const mockNodes = [
        { id: 'node-1', name: 'Platform', parent_id: null, type: 'folder', order: 1 },
        { id: 'node-2', name: 'Teams', parent_id: 'node-1', type: 'standard', order: 1 },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockNodes, error: null });

      const result = await service.getNodes();

      expect(mockFrom).toHaveBeenCalledWith('standard_nodes');
      expect(result).toHaveLength(2);
      expect(result[0].parentId).toBeNull();
      expect(result[1].parentId).toBe('node-1');
    });
  });

  describe('getNodesByParent', () => {
    it('fetches child nodes by parent ID', async () => {
      const mockNodes = [
        { id: 'node-2', name: 'Teams', parent_id: 'node-1', type: 'standard', order: 1 },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockNodes, error: null });

      const result = await service.getNodesByParent('node-1');

      expect(mockEq).toHaveBeenCalledWith('parent_id', 'node-1');
      expect(result).toHaveLength(1);
    });

    it('fetches root nodes when parent is null', async () => {
      const mockNodes = [
        { id: 'node-1', name: 'Platform', parent_id: null, type: 'folder', order: 1 },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockNodes, error: null });

      const result = await service.getNodesByParent(null);

      expect(mockIs).toHaveBeenCalledWith('parent_id', null);
      expect(result).toHaveLength(1);
    });
  });

  describe('createNode', () => {
    it('creates a new standard node', async () => {
      const newNode = {
        name: 'Zoom Standards',
        parentId: 'node-1',
        type: 'folder' as const,
        order: 2,
      };
      const mockCreated = {
        id: 'node-new',
        name: 'Zoom Standards',
        parent_id: 'node-1',
        type: 'folder',
        order: 2,
      };
      mockSingle.mockResolvedValueOnce({ data: mockCreated, error: null });

      const result = await service.createNode(newNode);

      expect(mockFrom).toHaveBeenCalledWith('standard_nodes');
      expect(result.id).toBe('node-new');
      expect(result.parentId).toBe('node-1');
    });
  });

  describe('updateNode', () => {
    it('updates an existing node', async () => {
      const mockUpdated = {
        id: 'node-1',
        name: 'Updated Name',
        parent_id: null,
        type: 'folder',
        order: 1,
      };
      const mockEqUpdate = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValueOnce({ data: mockUpdated, error: null }),
        }),
      });
      mockUpdate.mockReturnValue({ eq: mockEqUpdate });

      const result = await service.updateNode('node-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('deleteNode', () => {
    it('deletes a node', async () => {
      await service.deleteNode('node-1');

      expect(mockFrom).toHaveBeenCalledWith('standard_nodes');
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Rules Tests
  // ============================================================================

  describe('getRules', () => {
    it('fetches all rules', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'Teams Display',
          description: 'Display rule',
          aspect: 'equipment_selection',
          expression_type: 'constraint',
          conditions: [],
          expression: 'x >= 0',
          priority: 80,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockRules, error: null });

      const result = await service.getRules();

      expect(mockFrom).toHaveBeenCalledWith('rules');
      expect(result).toHaveLength(1);
      expect(result[0].expressionType).toBe('constraint');
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('getRulesByAspect', () => {
    it('fetches rules by aspect', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'Teams Display',
          description: 'Display rule',
          aspect: 'equipment_selection',
          expression_type: 'constraint',
          conditions: [],
          expression: 'x >= 0',
          priority: 80,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
      ];
      mockOrder.mockResolvedValueOnce({ data: mockRules, error: null });

      const result = await service.getRulesByAspect('equipment_selection');

      expect(mockEq).toHaveBeenCalledWith('aspect', 'equipment_selection');
      expect(result).toHaveLength(1);
    });
  });

  describe('searchRules', () => {
    it('searches rules by name or description', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'Teams Display',
          description: 'Display rule',
          aspect: 'equipment_selection',
          expression_type: 'constraint',
          conditions: [],
          expression: 'x >= 0',
          priority: 80,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
      ];
      mockLimit.mockResolvedValueOnce({ data: mockRules, error: null });

      const result = await service.searchRules('display');

      expect(mockOr).toHaveBeenCalledWith(
        'name.ilike.%display%,description.ilike.%display%'
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('createRule', () => {
    it('creates a new rule', async () => {
      const newRule = {
        name: 'New Rule',
        description: 'Test',
        aspect: 'equipment_selection' as const,
        expressionType: 'constraint' as const,
        conditions: [{ dimension: 'platform' as const, operator: 'equals' as const, value: 'teams' }],
        expression: 'x >= 0',
        priority: 50,
        isActive: true,
      };
      const mockCreated = {
        id: 'rule-new',
        name: 'New Rule',
        description: 'Test',
        aspect: 'equipment_selection',
        expression_type: 'constraint',
        conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
        expression: 'x >= 0',
        priority: 50,
        is_active: true,
        created_at: '',
        updated_at: '',
      };
      mockSingle.mockResolvedValueOnce({ data: mockCreated, error: null });

      const result = await service.createRule(newRule);

      expect(mockFrom).toHaveBeenCalledWith('rules');
      expect(result.id).toBe('rule-new');
    });
  });

  describe('updateRule', () => {
    it('updates an existing rule', async () => {
      const mockUpdated = {
        id: 'rule-1',
        name: 'Updated Rule',
        description: 'Test',
        aspect: 'equipment_selection',
        expression_type: 'constraint',
        conditions: [],
        expression: 'x >= 0',
        priority: 80,
        is_active: true,
        created_at: '',
        updated_at: '',
      };
      const mockEqUpdate = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValueOnce({ data: mockUpdated, error: null }),
        }),
      });
      mockUpdate.mockReturnValue({ eq: mockEqUpdate });

      const result = await service.updateRule('rule-1', { name: 'Updated Rule' });

      expect(result.name).toBe('Updated Rule');
    });
  });

  describe('deleteRule', () => {
    it('deletes a rule', async () => {
      await service.deleteRule('rule-1');

      expect(mockFrom).toHaveBeenCalledWith('rules');
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Row Mapping Tests
  // ============================================================================

  describe('row mapping', () => {
    it('maps snake_case to camelCase for standards', async () => {
      const mockStandard = {
        id: 'std-1',
        node_id: 'node-1',
        rules: [],
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T01:00:00Z',
      };
      mockSingle.mockResolvedValueOnce({ data: mockStandard, error: null });

      const result = await service.getStandardById('std-1');

      expect(result?.nodeId).toBe('node-1');
      expect(result?.createdAt).toBe('2026-01-18T00:00:00Z');
      expect(result?.updatedAt).toBe('2026-01-18T01:00:00Z');
    });

    it('maps snake_case to camelCase for rules', async () => {
      const mockRule = {
        id: 'rule-1',
        name: 'Test',
        description: 'Desc',
        aspect: 'equipment_selection',
        expression_type: 'constraint',
        conditions: [],
        expression: 'x >= 0',
        priority: 50,
        is_active: true,
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T01:00:00Z',
      };
      mockSingle.mockResolvedValueOnce({ data: mockRule, error: null });

      const result = await service.getRuleById('rule-1');

      expect(result?.expressionType).toBe('constraint');
      expect(result?.isActive).toBe(true);
      expect(result?.createdAt).toBe('2026-01-18T00:00:00Z');
    });

    it('maps snake_case to camelCase for nodes', async () => {
      const mockNode = {
        id: 'node-1',
        name: 'Test',
        parent_id: 'parent-1',
        type: 'folder',
        order: 1,
      };
      mockSingle.mockResolvedValueOnce({ data: mockNode, error: null });

      const result = await service.getNodeById('node-1');

      expect(result?.parentId).toBe('parent-1');
    });
  });

  // ============================================================================
  // Singleton Instance Tests
  // ============================================================================

  describe('standardsService singleton', () => {
    it('exports a singleton instance', () => {
      expect(standardsService).toBeInstanceOf(StandardsService);
    });
  });
});
