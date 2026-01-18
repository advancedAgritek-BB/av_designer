/**
 * Standards Service Layer
 *
 * Provides CRUD operations and data access for standards, nodes, and rules.
 * Uses mappers from standards-db-types for snake_case/camelCase transformation.
 */

import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import type {
  Standard,
  StandardNode,
  Rule,
  RuleAspect,
  RuleCondition,
  RuleExpressionType,
} from '@/types/standards';
import {
  type StandardDbRow,
  type StandardNodeDbRow,
  type RuleDbRow,
  mapStandardRows,
  mapStandardRow,
  mapNodeRows,
  mapNodeRow,
  mapRuleRows,
  mapRuleRow,
} from './standards-db-types';

// ============================================================================
// Input Types for Create/Update
// ============================================================================

export interface CreateStandardInput {
  nodeId: string;
  rules: Rule[];
}

export interface UpdateStandardInput {
  nodeId?: string;
  rules?: Rule[];
}

export interface CreateNodeInput {
  name: string;
  parentId: string | null;
  type: 'folder' | 'standard';
  order: number;
}

export interface UpdateNodeInput {
  name?: string;
  parentId?: string | null;
  type?: 'folder' | 'standard';
  order?: number;
}

export interface CreateRuleInput {
  name: string;
  description: string;
  aspect: RuleAspect;
  expressionType: RuleExpressionType;
  conditions: RuleCondition[];
  expression: string;
  priority: number;
  isActive: boolean;
}

export interface UpdateRuleInput {
  name?: string;
  description?: string;
  aspect?: RuleAspect;
  expressionType?: RuleExpressionType;
  conditions?: RuleCondition[];
  expression?: string;
  priority?: number;
  isActive?: boolean;
}

// ============================================================================
// Service Class
// ============================================================================

/**
 * Service for standards, nodes, and rules CRUD operations via Supabase.
 */
export class StandardsService {
  private readonly standardsTable = 'standards';
  private readonly nodesTable = 'standard_nodes';
  private readonly rulesTable = 'rules';

  // ==========================================================================
  // Standards CRUD
  // ==========================================================================

  /**
   * Fetch all standards ordered by node_id.
   */
  async getStandards(): Promise<Standard[]> {
    const { data, error } = await supabase
      .from(this.standardsTable)
      .select('*')
      .order('node_id', { ascending: true });

    if (error) throw error;
    return mapStandardRows((data as StandardDbRow[] | null) ?? []);
  }

  /**
   * Fetch a single standard by ID.
   */
  async getStandardById(id: string): Promise<Standard | null> {
    const { data, error } = await supabase
      .from(this.standardsTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapStandardRow(data as StandardDbRow);
  }

  /**
   * Create a new standard.
   */
  async createStandard(input: CreateStandardInput): Promise<Standard> {
    const insertData = {
      node_id: input.nodeId,
      rules: input.rules as unknown as Json,
    };

    const { data, error } = await supabase
      .from(this.standardsTable)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return mapStandardRow(data as unknown as StandardDbRow);
  }

  /**
   * Update an existing standard.
   */
  async updateStandard(id: string, input: UpdateStandardInput): Promise<Standard> {
    const updateData: Record<string, unknown> = {};
    if (input.nodeId !== undefined) updateData.node_id = input.nodeId;
    if (input.rules !== undefined) updateData.rules = input.rules;

    const { data, error } = await supabase
      .from(this.standardsTable)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapStandardRow(data as StandardDbRow);
  }

  /**
   * Delete a standard by ID.
   */
  async deleteStandard(id: string): Promise<void> {
    const { error } = await supabase.from(this.standardsTable).delete().eq('id', id);
    if (error) throw error;
  }

  // ==========================================================================
  // Standard Nodes CRUD
  // ==========================================================================

  /**
   * Fetch all standard nodes ordered by name.
   */
  async getNodes(): Promise<StandardNode[]> {
    const { data, error } = await supabase
      .from(this.nodesTable)
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return mapNodeRows((data as StandardNodeDbRow[] | null) ?? []);
  }

  /**
   * Fetch a single node by ID.
   */
  async getNodeById(id: string): Promise<StandardNode | null> {
    const { data, error } = await supabase
      .from(this.nodesTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapNodeRow(data as StandardNodeDbRow);
  }

  /**
   * Fetch nodes by parent ID (null for root nodes).
   */
  async getNodesByParent(parentId: string | null): Promise<StandardNode[]> {
    let query = supabase.from(this.nodesTable).select('*');

    if (parentId === null) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query.order('order', { ascending: true });

    if (error) throw error;
    return mapNodeRows((data as unknown as StandardNodeDbRow[] | null) ?? []);
  }

  /**
   * Create a new node.
   */
  async createNode(input: CreateNodeInput): Promise<StandardNode> {
    const insertData: {
      name: string;
      parent_id: string | null;
      type: string;
      order: number;
    } = {
      name: input.name,
      parent_id: input.parentId,
      type: input.type,
      order: input.order,
    };

    const { data, error } = await supabase
      .from(this.nodesTable)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return mapNodeRow(data as unknown as StandardNodeDbRow);
  }

  /**
   * Update an existing node.
   */
  async updateNode(id: string, input: UpdateNodeInput): Promise<StandardNode> {
    const updateData: {
      name?: string;
      parent_id?: string | null;
      type?: string;
      order?: number;
    } = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.parentId !== undefined) updateData.parent_id = input.parentId;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.order !== undefined) updateData.order = input.order;

    const { data, error } = await supabase
      .from(this.nodesTable)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapNodeRow(data as unknown as StandardNodeDbRow);
  }

  /**
   * Delete a node by ID.
   */
  async deleteNode(id: string): Promise<void> {
    const { error } = await supabase.from(this.nodesTable).delete().eq('id', id);
    if (error) throw error;
  }

  // ==========================================================================
  // Rules CRUD
  // ==========================================================================

  /**
   * Fetch all rules ordered by priority (descending).
   */
  async getRules(): Promise<Rule[]> {
    const { data, error } = await supabase
      .from(this.rulesTable)
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;
    return mapRuleRows((data as RuleDbRow[] | null) ?? []);
  }

  /**
   * Fetch a single rule by ID.
   */
  async getRuleById(id: string): Promise<Rule | null> {
    const { data, error } = await supabase
      .from(this.rulesTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapRuleRow(data as RuleDbRow);
  }

  /**
   * Fetch rules by aspect.
   */
  async getRulesByAspect(aspect: RuleAspect): Promise<Rule[]> {
    const { data, error } = await supabase
      .from(this.rulesTable)
      .select('*')
      .eq('aspect', aspect)
      .order('priority', { ascending: false });

    if (error) throw error;
    return mapRuleRows((data as RuleDbRow[] | null) ?? []);
  }

  /**
   * Search rules by name or description.
   */
  async searchRules(query: string): Promise<Rule[]> {
    const { data, error } = await supabase
      .from(this.rulesTable)
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(50);

    if (error) throw error;
    return mapRuleRows((data as RuleDbRow[] | null) ?? []);
  }

  /**
   * Create a new rule.
   */
  async createRule(input: CreateRuleInput): Promise<Rule> {
    const insertData: {
      name: string;
      description: string;
      aspect: string;
      expression_type: string;
      conditions: Json;
      expression: string;
      priority: number;
      is_active: boolean;
    } = {
      name: input.name,
      description: input.description,
      aspect: input.aspect,
      expression_type: input.expressionType,
      conditions: input.conditions as unknown as Json,
      expression: input.expression,
      priority: input.priority,
      is_active: input.isActive,
    };

    const { data, error } = await supabase
      .from(this.rulesTable)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return mapRuleRow(data as unknown as RuleDbRow);
  }

  /**
   * Update an existing rule.
   */
  async updateRule(id: string, input: UpdateRuleInput): Promise<Rule> {
    const updateData: {
      name?: string;
      description?: string;
      aspect?: string;
      expression_type?: string;
      conditions?: Json;
      expression?: string;
      priority?: number;
      is_active?: boolean;
    } = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.aspect !== undefined) updateData.aspect = input.aspect;
    if (input.expressionType !== undefined)
      updateData.expression_type = input.expressionType;
    if (input.conditions !== undefined)
      updateData.conditions = input.conditions as unknown as Json;
    if (input.expression !== undefined) updateData.expression = input.expression;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { data, error } = await supabase
      .from(this.rulesTable)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapRuleRow(data as unknown as RuleDbRow);
  }

  /**
   * Delete a rule by ID.
   */
  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase.from(this.rulesTable).delete().eq('id', id);
    if (error) throw error;
  }
}

/**
 * Singleton instance of StandardsService.
 */
export const standardsService = new StandardsService();
