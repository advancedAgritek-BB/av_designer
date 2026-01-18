/**
 * Standards Database Types
 *
 * Database row types (snake_case) and row mappers for transforming
 * between database format and frontend format (camelCase).
 */

import type {
  Standard,
  StandardNode,
  Rule,
  RuleAspect,
  RuleCondition,
  RuleExpressionType,
} from '@/types/standards';

// ============================================================================
// Database Row Types (snake_case)
// ============================================================================

export interface StandardDbRow {
  id: string;
  node_id: string;
  rules: Rule[];
  created_at: string;
  updated_at: string;
}

export interface StandardNodeDbRow {
  id: string;
  name: string;
  parent_id: string | null;
  type: 'folder' | 'standard';
  order: number;
}

export interface RuleDbRow {
  id: string;
  name: string;
  description: string;
  aspect: RuleAspect;
  expression_type: RuleExpressionType;
  conditions: RuleCondition[];
  expression: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Row Mappers (snake_case -> camelCase)
// ============================================================================

export function mapStandardRows(rows: StandardDbRow[]): Standard[] {
  return rows.map((row) => mapStandardRow(row));
}

export function mapStandardRow(row: StandardDbRow): Standard {
  return {
    id: row.id,
    nodeId: row.node_id,
    rules: row.rules,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNodeRows(rows: StandardNodeDbRow[]): StandardNode[] {
  return rows.map((row) => mapNodeRow(row));
}

export function mapNodeRow(row: StandardNodeDbRow): StandardNode {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    type: row.type,
    order: row.order,
  };
}

export function mapRuleRows(rows: RuleDbRow[]): Rule[] {
  return rows.map((row) => mapRuleRow(row));
}

export function mapRuleRow(row: RuleDbRow): Rule {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    aspect: row.aspect,
    expressionType: row.expression_type,
    conditions: row.conditions,
    expression: row.expression,
    priority: row.priority,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
