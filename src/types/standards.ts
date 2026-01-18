/**
 * Standards Engine Type Definitions
 *
 * Types for the multi-dimensional rule system that validates
 * AV designs against configurable standards.
 */

// ============================================================================
// Rule Dimensions
// ============================================================================

/**
 * Dimensions for rule filtering and conflict resolution.
 * Order determines priority: Client > Platform > Ecosystem > Tier > Use Case > Room Type
 */
export const RULE_DIMENSIONS = [
  'room_type',
  'platform',
  'ecosystem',
  'tier',
  'use_case',
  'client',
] as const;

export type RuleDimension = (typeof RULE_DIMENSIONS)[number];

/**
 * Priority values for dimension-based conflict resolution.
 * Higher values take precedence when rules conflict.
 */
export const DIMENSION_PRIORITY: Record<RuleDimension, number> = {
  room_type: 1,
  use_case: 2,
  tier: 3,
  ecosystem: 4,
  platform: 5,
  client: 6,
};

// ============================================================================
// Rule Expression Types
// ============================================================================

/**
 * Types of rule expressions supported by the engine.
 */
export const RULE_EXPRESSION_TYPES = [
  'constraint', // Simple comparison (field >= value)
  'formula', // Mathematical formula
  'conditional', // If-then-else logic
  'range_match', // Value within range
  'pattern', // Regex or pattern matching
] as const;

export type RuleExpressionType = (typeof RULE_EXPRESSION_TYPES)[number];

// ============================================================================
// Rule Aspects
// ============================================================================

/**
 * Aspects of AV design that rules can govern.
 */
export const RULE_ASPECTS = [
  'equipment_selection', // Which equipment to use
  'quantities', // How many of each item
  'placement', // Where equipment goes
  'configuration', // How equipment is configured
  'cabling', // Cable types and routing
  'commercial', // Pricing and commercial terms
] as const;

export type RuleAspect = (typeof RULE_ASPECTS)[number];

// ============================================================================
// Rule Condition
// ============================================================================

/**
 * Operators for rule conditions.
 */
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'in';

/**
 * A single condition that determines if a rule applies.
 */
export interface RuleCondition {
  dimension: RuleDimension;
  operator: ConditionOperator;
  value: string | number | string[];
}

// ============================================================================
// Rule
// ============================================================================

/**
 * A rule that validates some aspect of an AV design.
 */
export interface Rule {
  id: string;
  name: string;
  description: string;
  aspect: RuleAspect;
  expressionType: RuleExpressionType;
  conditions: RuleCondition[];
  expression: string;
  priority: number; // 0-100, higher = more important
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Standard Hierarchy
// ============================================================================

/**
 * A node in the standards hierarchy tree.
 * Can be either a folder (container) or a standard (leaf with rules).
 */
export interface StandardNode {
  id: string;
  name: string;
  parentId: string | null;
  type: 'folder' | 'standard';
  order: number;
}

/**
 * A collection of rules under a specific standard node.
 */
export interface Standard {
  id: string;
  nodeId: string;
  rules: Rule[];
  createdAt: string;
  updatedAt: string;
}

/**
 * The complete standards hierarchy.
 */
export interface StandardsHierarchy {
  nodes: StandardNode[];
  standards: Map<string, Standard>;
}

// ============================================================================
// Validation Results
// ============================================================================

/**
 * Severity level for validation issues.
 */
export type IssueSeverity = 'error' | 'warning' | 'suggestion';

/**
 * A single issue identified during validation.
 */
export interface ValidationIssue {
  ruleId: string;
  ruleName: string;
  message: string;
  severity: IssueSeverity;
  equipmentId?: string;
  field?: string;
  suggestedFix?: string;
}

/**
 * Complete result of validating a design against standards.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
}

// ============================================================================
// Validation Functions
// ============================================================================

const VALID_OPERATORS: ConditionOperator[] = [
  'equals',
  'not_equals',
  'contains',
  'greater_than',
  'less_than',
  'in',
];

/**
 * Validates a rule condition structure.
 */
export function isValidRuleCondition(condition: unknown): condition is RuleCondition {
  if (!condition || typeof condition !== 'object') {
    return false;
  }

  const cond = condition as Record<string, unknown>;

  // Check dimension
  if (typeof cond.dimension !== 'string') {
    return false;
  }
  if (!RULE_DIMENSIONS.includes(cond.dimension as RuleDimension)) {
    return false;
  }

  // Check operator
  if (typeof cond.operator !== 'string') {
    return false;
  }
  if (!VALID_OPERATORS.includes(cond.operator as ConditionOperator)) {
    return false;
  }

  // Check value
  if (cond.value === undefined || cond.value === null) {
    return false;
  }

  return true;
}

/**
 * Validates a complete rule structure.
 */
export function isValidRule(rule: unknown): rule is Rule {
  if (!rule || typeof rule !== 'object') {
    return false;
  }

  const r = rule as Record<string, unknown>;

  // Required string fields
  if (!r.id || typeof r.id !== 'string') {
    return false;
  }
  if (!r.name || typeof r.name !== 'string') {
    return false;
  }
  if (!r.expression || typeof r.expression !== 'string') {
    return false;
  }

  // Aspect validation
  if (!RULE_ASPECTS.includes(r.aspect as RuleAspect)) {
    return false;
  }

  // Expression type validation
  if (!RULE_EXPRESSION_TYPES.includes(r.expressionType as RuleExpressionType)) {
    return false;
  }

  // Conditions validation
  if (!Array.isArray(r.conditions) || r.conditions.length === 0) {
    return false;
  }
  for (const condition of r.conditions) {
    if (!isValidRuleCondition(condition)) {
      return false;
    }
  }

  // Priority validation (0-100)
  if (typeof r.priority !== 'number' || r.priority < 0 || r.priority > 100) {
    return false;
  }

  return true;
}
