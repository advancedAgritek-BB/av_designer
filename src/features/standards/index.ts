/**
 * Standards Feature - Public API
 *
 * Re-exports all standards-related components, hooks, services,
 * and utilities for use throughout the application.
 */

// Service
export {
  StandardsService,
  standardsService,
  type CreateStandardInput,
  type UpdateStandardInput,
  type CreateNodeInput,
  type UpdateNodeInput,
  type CreateRuleInput,
  type UpdateRuleInput,
} from './standards-service';

// Rule Engine
export { RuleEngine, ruleEngine } from './rule-engine';

// Hooks
export {
  useStandardsList,
  useStandard,
  useNodesList,
  useNode,
  useNodesByParent,
  useRulesList,
  useRule,
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
} from './use-standards';

// Components
export { StandardsList } from './components/StandardsList';
export { RuleEditor } from './components/RuleEditor';

// Re-export types from shared types module for convenience
export type {
  Rule,
  RuleCondition,
  RuleAspect,
  RuleExpressionType,
  RuleDimension,
  ConditionOperator,
  Standard,
  StandardNode,
  StandardsHierarchy,
  ValidationResult,
  ValidationIssue,
  IssueSeverity,
} from '@/types/standards';

export {
  RULE_DIMENSIONS,
  RULE_EXPRESSION_TYPES,
  RULE_ASPECTS,
  DIMENSION_PRIORITY,
  isValidRule,
  isValidRuleCondition,
} from '@/types/standards';
