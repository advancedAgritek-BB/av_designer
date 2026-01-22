/**
 * Standards Database Types
 *
 * Database row types (snake_case) and row mappers for transforming
 * between database format and frontend format (camelCase).
 */

import type { Json } from '@/lib/database.types';
import type { Standard, StandardNode, Rule } from '@/types/standards';

// ============================================================================
// Database Enum Types (from database.types.ts)
// ============================================================================

/** Database enum for rule_aspect */
type DbRuleAspect =
  | 'display_count'
  | 'microphone_coverage'
  | 'speaker_placement'
  | 'camera_angle'
  | 'cable_length'
  | 'rack_space'
  | 'power_requirements'
  | 'compatibility'
  | 'custom';

/** Database enum for rule_expression_type */
type DbRuleExpressionType = 'comparison' | 'range' | 'formula' | 'lookup' | 'custom';

/** Database enum for standard_node_type */
type DbStandardNodeType = 'category' | 'subcategory' | 'item';

// ============================================================================
// Database Row Types (snake_case, matches database.types.ts)
// ============================================================================

export interface StandardDbRow {
  id: string;
  node_id: string;
  rules: Json;
  created_at: string;
  updated_at: string;
}

export interface StandardNodeDbRow {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  type: DbStandardNodeType;
  sort_order: number;
}

export interface RuleDbRow {
  id: string;
  name: string;
  description: string;
  aspect: DbRuleAspect;
  expression_type: DbRuleExpressionType;
  conditions: Json;
  expression: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Aspect Mapping (DB enum <-> Frontend enum)
// ============================================================================

/** Map database aspect to frontend aspect */
function mapDbAspectToFrontend(
  dbAspect: DbRuleAspect
): 'equipment_selection' | 'quantities' | 'placement' | 'configuration' | 'cabling' | 'commercial' {
  // Map database aspects to closest frontend equivalents
  const mapping: Record<DbRuleAspect, ReturnType<typeof mapDbAspectToFrontend>> = {
    display_count: 'quantities',
    microphone_coverage: 'placement',
    speaker_placement: 'placement',
    camera_angle: 'placement',
    cable_length: 'cabling',
    rack_space: 'equipment_selection',
    power_requirements: 'configuration',
    compatibility: 'equipment_selection',
    custom: 'configuration',
  };
  return mapping[dbAspect];
}

/** Map frontend aspect to database aspect */
function mapFrontendAspectToDb(
  aspect: 'equipment_selection' | 'quantities' | 'placement' | 'configuration' | 'cabling' | 'commercial'
): DbRuleAspect {
  // Map frontend aspects to closest database equivalents
  const mapping: Record<string, DbRuleAspect> = {
    equipment_selection: 'compatibility',
    quantities: 'display_count',
    placement: 'speaker_placement',
    configuration: 'power_requirements',
    cabling: 'cable_length',
    commercial: 'custom',
  };
  return mapping[aspect] ?? 'custom';
}

/** Map database expression type to frontend expression type */
function mapDbExpressionTypeToFrontend(
  dbType: DbRuleExpressionType
): 'constraint' | 'formula' | 'conditional' | 'range_match' | 'pattern' {
  const mapping: Record<DbRuleExpressionType, ReturnType<typeof mapDbExpressionTypeToFrontend>> = {
    comparison: 'constraint',
    range: 'range_match',
    formula: 'formula',
    lookup: 'conditional',
    custom: 'pattern',
  };
  return mapping[dbType];
}

/** Map frontend expression type to database expression type */
function mapFrontendExpressionTypeToDb(
  type: 'constraint' | 'formula' | 'conditional' | 'range_match' | 'pattern'
): DbRuleExpressionType {
  const mapping: Record<string, DbRuleExpressionType> = {
    constraint: 'comparison',
    formula: 'formula',
    conditional: 'lookup',
    range_match: 'range',
    pattern: 'custom',
  };
  return mapping[type] ?? 'custom';
}

/** Map database node type to frontend node type */
function mapDbNodeTypeToFrontend(dbType: DbStandardNodeType): 'folder' | 'standard' {
  // 'item' maps to 'standard', others map to 'folder'
  return dbType === 'item' ? 'standard' : 'folder';
}

/** Map frontend node type to database node type */
export function mapFrontendNodeTypeToDb(type: 'folder' | 'standard'): DbStandardNodeType {
  return type === 'standard' ? 'item' : 'category';
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
    rules: Array.isArray(row.rules) ? (row.rules as unknown as Rule[]) : [],
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
    type: mapDbNodeTypeToFrontend(row.type),
    order: row.sort_order,
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
    aspect: mapDbAspectToFrontend(row.aspect),
    expressionType: mapDbExpressionTypeToFrontend(row.expression_type),
    conditions: Array.isArray(row.conditions) ? (row.conditions as unknown as Rule['conditions']) : [],
    expression: row.expression,
    priority: row.priority,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Export mapping functions for use in service
// ============================================================================

export { mapFrontendAspectToDb, mapFrontendExpressionTypeToDb };
