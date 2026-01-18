/**
 * Standards Type Tests
 *
 * Tests for the standards type definitions including rule dimensions,
 * expression types, aspects, and validation interfaces.
 */

import { describe, it, expect } from 'vitest';
import type {
  Rule,
  RuleCondition,
  RuleExpressionType,
  RuleAspect,
  Standard,
  StandardNode,
  ValidationResult,
  ValidationIssue,
} from '@/types/standards';
import {
  RULE_DIMENSIONS,
  RULE_EXPRESSION_TYPES,
  RULE_ASPECTS,
  DIMENSION_PRIORITY,
  isValidRule,
  isValidRuleCondition,
} from '@/types/standards';

describe('Standards Types', () => {
  describe('RULE_DIMENSIONS', () => {
    it('contains all required dimensions', () => {
      expect(RULE_DIMENSIONS).toContain('room_type');
      expect(RULE_DIMENSIONS).toContain('platform');
      expect(RULE_DIMENSIONS).toContain('ecosystem');
      expect(RULE_DIMENSIONS).toContain('tier');
      expect(RULE_DIMENSIONS).toContain('use_case');
      expect(RULE_DIMENSIONS).toContain('client');
    });

    it('has exactly 6 dimensions', () => {
      expect(RULE_DIMENSIONS).toHaveLength(6);
    });

    it('is typed as readonly', () => {
      // TypeScript enforces readonly at compile time via 'as const'
      // We verify the array structure is correct
      const firstDimension: 'room_type' = RULE_DIMENSIONS[0];
      expect(firstDimension).toBe('room_type');
    });
  });

  describe('RULE_EXPRESSION_TYPES', () => {
    it('contains all required expression types', () => {
      expect(RULE_EXPRESSION_TYPES).toContain('constraint');
      expect(RULE_EXPRESSION_TYPES).toContain('formula');
      expect(RULE_EXPRESSION_TYPES).toContain('conditional');
      expect(RULE_EXPRESSION_TYPES).toContain('range_match');
      expect(RULE_EXPRESSION_TYPES).toContain('pattern');
    });

    it('has exactly 5 expression types', () => {
      expect(RULE_EXPRESSION_TYPES).toHaveLength(5);
    });

    it('is typed as readonly', () => {
      // TypeScript enforces readonly at compile time via 'as const'
      const firstType: 'constraint' = RULE_EXPRESSION_TYPES[0];
      expect(firstType).toBe('constraint');
    });
  });

  describe('RULE_ASPECTS', () => {
    it('contains all required aspects', () => {
      expect(RULE_ASPECTS).toContain('equipment_selection');
      expect(RULE_ASPECTS).toContain('quantities');
      expect(RULE_ASPECTS).toContain('placement');
      expect(RULE_ASPECTS).toContain('configuration');
      expect(RULE_ASPECTS).toContain('cabling');
      expect(RULE_ASPECTS).toContain('commercial');
    });

    it('has exactly 6 aspects', () => {
      expect(RULE_ASPECTS).toHaveLength(6);
    });

    it('is typed as readonly', () => {
      // TypeScript enforces readonly at compile time via 'as const'
      const firstAspect: 'equipment_selection' = RULE_ASPECTS[0];
      expect(firstAspect).toBe('equipment_selection');
    });
  });

  describe('DIMENSION_PRIORITY', () => {
    it('has priority for all dimensions', () => {
      expect(DIMENSION_PRIORITY).toHaveProperty('room_type');
      expect(DIMENSION_PRIORITY).toHaveProperty('platform');
      expect(DIMENSION_PRIORITY).toHaveProperty('ecosystem');
      expect(DIMENSION_PRIORITY).toHaveProperty('tier');
      expect(DIMENSION_PRIORITY).toHaveProperty('use_case');
      expect(DIMENSION_PRIORITY).toHaveProperty('client');
    });

    it('has client as highest priority (6)', () => {
      expect(DIMENSION_PRIORITY.client).toBe(6);
    });

    it('has room_type as lowest priority (1)', () => {
      expect(DIMENSION_PRIORITY.room_type).toBe(1);
    });

    it('has correct priority order', () => {
      // Client > Platform > Ecosystem > Tier > Use Case > Room Type
      expect(DIMENSION_PRIORITY.client).toBeGreaterThan(DIMENSION_PRIORITY.platform);
      expect(DIMENSION_PRIORITY.platform).toBeGreaterThan(DIMENSION_PRIORITY.ecosystem);
      expect(DIMENSION_PRIORITY.ecosystem).toBeGreaterThan(DIMENSION_PRIORITY.tier);
      expect(DIMENSION_PRIORITY.tier).toBeGreaterThan(DIMENSION_PRIORITY.use_case);
      expect(DIMENSION_PRIORITY.use_case).toBeGreaterThan(DIMENSION_PRIORITY.room_type);
    });
  });

  describe('RuleCondition type', () => {
    it('allows valid condition structure', () => {
      const condition: RuleCondition = {
        dimension: 'platform',
        operator: 'equals',
        value: 'teams',
      };

      expect(condition.dimension).toBe('platform');
      expect(condition.operator).toBe('equals');
      expect(condition.value).toBe('teams');
    });

    it('supports all operators', () => {
      const operators: RuleCondition['operator'][] = [
        'equals',
        'not_equals',
        'contains',
        'greater_than',
        'less_than',
        'in',
      ];

      operators.forEach((op) => {
        const condition: RuleCondition = {
          dimension: 'tier',
          operator: op,
          value: 'test',
        };
        expect(condition.operator).toBe(op);
      });
    });

    it('supports number values', () => {
      const condition: RuleCondition = {
        dimension: 'room_type',
        operator: 'greater_than',
        value: 400,
      };
      expect(condition.value).toBe(400);
    });

    it('supports array values for in operator', () => {
      const condition: RuleCondition = {
        dimension: 'platform',
        operator: 'in',
        value: ['teams', 'zoom', 'webex'],
      };
      expect(condition.value).toEqual(['teams', 'zoom', 'webex']);
    });
  });

  describe('Rule type', () => {
    it('allows valid rule structure', () => {
      const rule: Rule = {
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

      expect(rule.id).toBe('rule-1');
      expect(rule.aspect).toBe('equipment_selection');
      expect(rule.conditions).toHaveLength(1);
    });

    it('supports multiple conditions', () => {
      const rule: Rule = {
        id: 'rule-2',
        name: 'Premium Boardroom Audio',
        description: 'Premium tier boardrooms require ceiling mics',
        aspect: 'equipment_selection',
        expressionType: 'constraint',
        conditions: [
          { dimension: 'tier', operator: 'equals', value: 'premium' },
          { dimension: 'room_type', operator: 'equals', value: 'boardroom' },
        ],
        expression: 'microphones.type == "ceiling"',
        priority: 75,
        isActive: true,
        createdAt: '2026-01-18T00:00:00Z',
        updatedAt: '2026-01-18T00:00:00Z',
      };

      expect(rule.conditions).toHaveLength(2);
    });
  });

  describe('StandardNode type', () => {
    it('allows folder type', () => {
      const node: StandardNode = {
        id: 'node-1',
        name: 'Platform Standards',
        parentId: null,
        type: 'folder',
        order: 1,
      };

      expect(node.type).toBe('folder');
      expect(node.parentId).toBeNull();
    });

    it('allows standard type with parent', () => {
      const node: StandardNode = {
        id: 'node-2',
        name: 'Teams Standard',
        parentId: 'node-1',
        type: 'standard',
        order: 1,
      };

      expect(node.type).toBe('standard');
      expect(node.parentId).toBe('node-1');
    });
  });

  describe('Standard type', () => {
    it('allows valid standard structure', () => {
      const standard: Standard = {
        id: 'std-1',
        nodeId: 'node-2',
        rules: [],
        createdAt: '2026-01-18T00:00:00Z',
        updatedAt: '2026-01-18T00:00:00Z',
      };

      expect(standard.nodeId).toBe('node-2');
      expect(standard.rules).toEqual([]);
    });
  });

  describe('ValidationResult type', () => {
    it('allows valid result structure', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
      };

      expect(result.isValid).toBe(true);
    });

    it('allows result with issues', () => {
      const issue: ValidationIssue = {
        ruleId: 'rule-1',
        ruleName: 'Teams Display Size',
        message: 'Display is too small',
        severity: 'error',
        equipmentId: 'eq-123',
        field: 'size',
        suggestedFix: 'Select a 75" or larger display',
      };

      const result: ValidationResult = {
        isValid: false,
        errors: [issue],
        warnings: [],
        suggestions: [],
      };

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].severity).toBe('error');
    });
  });

  describe('ValidationIssue type', () => {
    it('allows minimal issue structure', () => {
      const issue: ValidationIssue = {
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        message: 'Something is wrong',
        severity: 'warning',
      };

      expect(issue.ruleId).toBe('rule-1');
      expect(issue.equipmentId).toBeUndefined();
    });

    it('supports all severity levels', () => {
      const severities: ValidationIssue['severity'][] = ['error', 'warning', 'suggestion'];

      severities.forEach((sev) => {
        const issue: ValidationIssue = {
          ruleId: 'rule-1',
          ruleName: 'Test',
          message: 'Test message',
          severity: sev,
        };
        expect(issue.severity).toBe(sev);
      });
    });
  });

  describe('isValidRuleCondition', () => {
    it('returns true for valid condition', () => {
      const condition: RuleCondition = {
        dimension: 'platform',
        operator: 'equals',
        value: 'teams',
      };
      expect(isValidRuleCondition(condition)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidRuleCondition(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidRuleCondition(undefined)).toBe(false);
    });

    it('returns false for missing dimension', () => {
      const condition = {
        operator: 'equals',
        value: 'teams',
      };
      expect(isValidRuleCondition(condition)).toBe(false);
    });

    it('returns false for invalid dimension', () => {
      const condition = {
        dimension: 'invalid_dimension',
        operator: 'equals',
        value: 'teams',
      };
      expect(isValidRuleCondition(condition)).toBe(false);
    });

    it('returns false for missing operator', () => {
      const condition = {
        dimension: 'platform',
        value: 'teams',
      };
      expect(isValidRuleCondition(condition)).toBe(false);
    });

    it('returns false for invalid operator', () => {
      const condition = {
        dimension: 'platform',
        operator: 'invalid_op',
        value: 'teams',
      };
      expect(isValidRuleCondition(condition)).toBe(false);
    });

    it('returns false for missing value', () => {
      const condition = {
        dimension: 'platform',
        operator: 'equals',
      };
      expect(isValidRuleCondition(condition)).toBe(false);
    });
  });

  describe('isValidRule', () => {
    const validRule: Rule = {
      id: 'rule-1',
      name: 'Test Rule',
      description: 'A test rule',
      aspect: 'equipment_selection',
      expressionType: 'constraint',
      conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
      expression: 'test == true',
      priority: 50,
      isActive: true,
      createdAt: '2026-01-18T00:00:00Z',
      updatedAt: '2026-01-18T00:00:00Z',
    };

    it('returns true for valid rule', () => {
      expect(isValidRule(validRule)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidRule(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidRule(undefined)).toBe(false);
    });

    it('returns false for missing id', () => {
      const rule = { ...validRule, id: '' };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns false for missing name', () => {
      const rule = { ...validRule, name: '' };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns false for invalid aspect', () => {
      const rule = { ...validRule, aspect: 'invalid_aspect' as RuleAspect };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns false for invalid expression type', () => {
      const rule = { ...validRule, expressionType: 'invalid_type' as RuleExpressionType };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns false for empty conditions array', () => {
      const rule = { ...validRule, conditions: [] };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns false for invalid condition in array', () => {
      const rule = {
        ...validRule,
        conditions: [{ dimension: 'invalid', operator: 'equals', value: 'test' }],
      };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns false for missing expression', () => {
      const rule = { ...validRule, expression: '' };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns false for priority out of range (negative)', () => {
      const rule = { ...validRule, priority: -1 };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns false for priority out of range (over 100)', () => {
      const rule = { ...validRule, priority: 101 };
      expect(isValidRule(rule)).toBe(false);
    });

    it('returns true for priority at boundaries', () => {
      expect(isValidRule({ ...validRule, priority: 0 })).toBe(true);
      expect(isValidRule({ ...validRule, priority: 100 })).toBe(true);
    });
  });
});
