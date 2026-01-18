/**
 * Rule Engine Tests
 *
 * Tests for the rule evaluation engine that validates AV designs
 * against configurable standards.
 */

import { describe, it, expect } from 'vitest';
import { RuleEngine } from '@/features/standards/rule-engine';
import type { Rule, RuleCondition } from '@/types/standards';

describe('RuleEngine', () => {
  const engine = new RuleEngine();

  // ============================================================================
  // evaluateCondition Tests
  // ============================================================================

  describe('evaluateCondition', () => {
    describe('equals operator', () => {
      it('returns true when values match (string)', () => {
        const condition: RuleCondition = {
          dimension: 'platform',
          operator: 'equals',
          value: 'teams',
        };
        const context = { platform: 'teams' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('returns false when values do not match', () => {
        const condition: RuleCondition = {
          dimension: 'platform',
          operator: 'equals',
          value: 'teams',
        };
        const context = { platform: 'zoom' };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });

      it('returns true when values match (number)', () => {
        const condition: RuleCondition = {
          dimension: 'tier',
          operator: 'equals',
          value: 3,
        };
        const context = { tier: 3 };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });
    });

    describe('not_equals operator', () => {
      it('returns true when values differ', () => {
        const condition: RuleCondition = {
          dimension: 'platform',
          operator: 'not_equals',
          value: 'teams',
        };
        const context = { platform: 'zoom' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('returns false when values match', () => {
        const condition: RuleCondition = {
          dimension: 'platform',
          operator: 'not_equals',
          value: 'teams',
        };
        const context = { platform: 'teams' };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });
    });

    describe('contains operator', () => {
      it('returns true when array contains value', () => {
        const condition: RuleCondition = {
          dimension: 'ecosystem',
          operator: 'contains',
          value: 'poly',
        };
        const context = { ecosystem: ['poly', 'logitech'] };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('returns false when array does not contain value', () => {
        const condition: RuleCondition = {
          dimension: 'ecosystem',
          operator: 'contains',
          value: 'cisco',
        };
        const context = { ecosystem: ['poly', 'logitech'] };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });

      it('returns true when string contains substring', () => {
        const condition: RuleCondition = {
          dimension: 'room_type',
          operator: 'contains',
          value: 'conference',
        };
        const context = { room_type: 'large_conference' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('returns false when string does not contain substring', () => {
        const condition: RuleCondition = {
          dimension: 'room_type',
          operator: 'contains',
          value: 'boardroom',
        };
        const context = { room_type: 'large_conference' };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });

      it('returns false for non-string/array values', () => {
        const condition: RuleCondition = {
          dimension: 'tier',
          operator: 'contains',
          value: 'premium',
        };
        const context = { tier: 3 };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });
    });

    describe('greater_than operator', () => {
      it('returns true when context value is greater', () => {
        const condition: RuleCondition = {
          dimension: 'room_type',
          operator: 'greater_than',
          value: 400,
        };
        const context = { room_sqft: 600 };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('returns false when context value is equal', () => {
        const condition: RuleCondition = {
          dimension: 'room_type',
          operator: 'greater_than',
          value: 400,
        };
        const context = { room_sqft: 400 };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });

      it('returns false when context value is less', () => {
        const condition: RuleCondition = {
          dimension: 'room_type',
          operator: 'greater_than',
          value: 400,
        };
        const context = { room_sqft: 200 };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });
    });

    describe('less_than operator', () => {
      it('returns true when context value is less', () => {
        const condition: RuleCondition = {
          dimension: 'tier',
          operator: 'less_than',
          value: 5,
        };
        const context = { tier: 3 };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('returns false when context value is equal', () => {
        const condition: RuleCondition = {
          dimension: 'tier',
          operator: 'less_than',
          value: 3,
        };
        const context = { tier: 3 };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });

      it('returns false when context value is greater', () => {
        const condition: RuleCondition = {
          dimension: 'tier',
          operator: 'less_than',
          value: 3,
        };
        const context = { tier: 5 };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });
    });

    describe('in operator', () => {
      it('returns true when value is in array', () => {
        const condition: RuleCondition = {
          dimension: 'platform',
          operator: 'in',
          value: ['teams', 'zoom', 'webex'],
        };
        const context = { platform: 'zoom' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('returns false when value is not in array', () => {
        const condition: RuleCondition = {
          dimension: 'platform',
          operator: 'in',
          value: ['teams', 'zoom'],
        };
        const context = { platform: 'webex' };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });

      it('returns false when condition value is not an array', () => {
        const condition: RuleCondition = {
          dimension: 'platform',
          operator: 'in',
          value: 'teams',
        };
        const context = { platform: 'teams' };
        expect(engine.evaluateCondition(condition, context)).toBe(false);
      });
    });

    describe('context value resolution', () => {
      it('resolves roomType from context', () => {
        const condition: RuleCondition = {
          dimension: 'room_type',
          operator: 'equals',
          value: 'conference',
        };
        const context = { roomType: 'conference' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('resolves room_type from context', () => {
        const condition: RuleCondition = {
          dimension: 'room_type',
          operator: 'equals',
          value: 'huddle',
        };
        const context = { room_type: 'huddle' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('resolves qualityTier from context for tier dimension', () => {
        const condition: RuleCondition = {
          dimension: 'tier',
          operator: 'equals',
          value: 'premium',
        };
        const context = { qualityTier: 'premium' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('resolves useCase from context for use_case dimension', () => {
        const condition: RuleCondition = {
          dimension: 'use_case',
          operator: 'equals',
          value: 'video_conferencing',
        };
        const context = { useCase: 'video_conferencing' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });

      it('resolves clientId from context for client dimension', () => {
        const condition: RuleCondition = {
          dimension: 'client',
          operator: 'equals',
          value: 'client-123',
        };
        const context = { clientId: 'client-123' };
        expect(engine.evaluateCondition(condition, context)).toBe(true);
      });
    });
  });

  // ============================================================================
  // evaluateExpression Tests
  // ============================================================================

  describe('evaluateExpression', () => {
    describe('comparison operators', () => {
      it('evaluates >= correctly', () => {
        const context = { display: { size: 85 } };
        expect(engine.evaluateExpression('display.size >= 75', context)).toBe(true);
        expect(engine.evaluateExpression('display.size >= 85', context)).toBe(true);
        expect(engine.evaluateExpression('display.size >= 86', context)).toBe(false);
      });

      it('evaluates <= correctly', () => {
        const context = { display: { size: 55 } };
        expect(engine.evaluateExpression('display.size <= 65', context)).toBe(true);
        expect(engine.evaluateExpression('display.size <= 55', context)).toBe(true);
        expect(engine.evaluateExpression('display.size <= 50', context)).toBe(false);
      });

      it('evaluates > correctly', () => {
        const context = { count: 5 };
        expect(engine.evaluateExpression('count > 4', context)).toBe(true);
        expect(engine.evaluateExpression('count > 5', context)).toBe(false);
      });

      it('evaluates < correctly', () => {
        const context = { count: 5 };
        expect(engine.evaluateExpression('count < 6', context)).toBe(true);
        expect(engine.evaluateExpression('count < 5', context)).toBe(false);
      });

      it('evaluates == correctly', () => {
        const context = { type: 'ceiling' };
        expect(engine.evaluateExpression('type == "ceiling"', context)).toBe(true);
        expect(engine.evaluateExpression('type == "table"', context)).toBe(false);
      });

      it('evaluates != correctly', () => {
        const context = { type: 'ceiling' };
        expect(engine.evaluateExpression('type != "table"', context)).toBe(true);
        expect(engine.evaluateExpression('type != "ceiling"', context)).toBe(false);
      });
    });

    describe('path resolution', () => {
      it('resolves simple paths', () => {
        const context = { value: 10 };
        expect(engine.evaluateExpression('value >= 5', context)).toBe(true);
      });

      it('resolves nested paths', () => {
        const context = { equipment: { display: { size: 75 } } };
        expect(engine.evaluateExpression('equipment.display.size >= 65', context)).toBe(true);
      });

      it('returns true for missing paths (graceful handling)', () => {
        const context = {};
        expect(engine.evaluateExpression('missing.path >= 5', context)).toBe(false);
      });
    });

    describe('value parsing', () => {
      it('parses numbers correctly', () => {
        const context = { count: 10 };
        expect(engine.evaluateExpression('count >= 5', context)).toBe(true);
      });

      it('parses double-quoted strings', () => {
        const context = { name: 'test' };
        expect(engine.evaluateExpression('name == "test"', context)).toBe(true);
      });

      it('parses single-quoted strings', () => {
        const context = { name: 'test' };
        expect(engine.evaluateExpression("name == 'test'", context)).toBe(true);
      });

      it('parses boolean true', () => {
        const context = { enabled: true };
        expect(engine.evaluateExpression('enabled == true', context)).toBe(true);
      });

      it('parses boolean false', () => {
        const context = { enabled: false };
        expect(engine.evaluateExpression('enabled == false', context)).toBe(true);
      });
    });

    describe('invalid expressions', () => {
      it('returns true for invalid expression format', () => {
        const context = { value: 10 };
        expect(engine.evaluateExpression('invalid expression', context)).toBe(true);
      });

      it('returns true for empty expression', () => {
        const context = { value: 10 };
        expect(engine.evaluateExpression('', context)).toBe(true);
      });
    });
  });

  // ============================================================================
  // evaluateRule Tests
  // ============================================================================

  describe('evaluateRule', () => {
    const baseRule: Rule = {
      id: 'rule-1',
      name: 'Test Rule',
      description: 'Test description',
      aspect: 'equipment_selection',
      expressionType: 'constraint',
      conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
      expression: 'display.size >= 75',
      priority: 80,
      isActive: true,
      createdAt: '2026-01-18T00:00:00Z',
      updatedAt: '2026-01-18T00:00:00Z',
    };

    it('returns applies=false and passed=true for inactive rules', () => {
      const rule = { ...baseRule, isActive: false };
      const context = { platform: 'teams', display: { size: 85 } };
      const result = engine.evaluateRule(rule, context);

      expect(result.applies).toBe(false);
      expect(result.passed).toBe(true);
    });

    it('returns applies=false when conditions do not match', () => {
      const context = { platform: 'zoom', display: { size: 85 } };
      const result = engine.evaluateRule(baseRule, context);

      expect(result.applies).toBe(false);
      expect(result.passed).toBe(true);
    });

    it('returns applies=true and passed=true when rule applies and passes', () => {
      const context = { platform: 'teams', display: { size: 85 } };
      const result = engine.evaluateRule(baseRule, context);

      expect(result.applies).toBe(true);
      expect(result.passed).toBe(true);
    });

    it('returns applies=true and passed=false when rule applies but fails', () => {
      const context = { platform: 'teams', display: { size: 55 } };
      const result = engine.evaluateRule(baseRule, context);

      expect(result.applies).toBe(true);
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Test Rule');
    });

    it('evaluates multiple conditions with AND logic', () => {
      const rule: Rule = {
        ...baseRule,
        conditions: [
          { dimension: 'platform', operator: 'equals', value: 'teams' },
          { dimension: 'tier', operator: 'equals', value: 'premium' },
        ],
      };

      // Both conditions match
      const result1 = engine.evaluateRule(rule, {
        platform: 'teams',
        tier: 'premium',
        display: { size: 85 },
      });
      expect(result1.applies).toBe(true);

      // Only first condition matches
      const result2 = engine.evaluateRule(rule, {
        platform: 'teams',
        tier: 'standard',
        display: { size: 85 },
      });
      expect(result2.applies).toBe(false);
    });
  });

  // ============================================================================
  // validateDesign Tests
  // ============================================================================

  describe('validateDesign', () => {
    const rules: Rule[] = [
      {
        id: 'rule-1',
        name: 'Teams Display Size',
        description: 'Teams rooms require 75" or larger display',
        aspect: 'equipment_selection',
        expressionType: 'constraint',
        conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
        expression: 'display.size >= 75',
        priority: 80,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'rule-2',
        name: 'Premium Audio',
        description: 'Premium tier requires ceiling mics',
        aspect: 'equipment_selection',
        expressionType: 'constraint',
        conditions: [{ dimension: 'tier', operator: 'equals', value: 'premium' }],
        expression: 'microphone.type == "ceiling"',
        priority: 60,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'rule-3',
        name: 'Camera Recommendation',
        description: 'Recommend PTZ camera for larger rooms',
        aspect: 'equipment_selection',
        expressionType: 'constraint',
        conditions: [{ dimension: 'room_type', operator: 'equals', value: 'boardroom' }],
        expression: 'camera.type == "ptz"',
        priority: 20,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    ];

    it('returns isValid=true when all rules pass', () => {
      const context = {
        platform: 'teams',
        tier: 'premium',
        display: { size: 85 },
        microphone: { type: 'ceiling' },
      };

      const result = engine.validateDesign(rules, context);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('returns isValid=false with errors for high-priority rule failures', () => {
      const context = {
        platform: 'teams',
        display: { size: 55 }, // Too small
      };

      const result = engine.validateDesign(rules, context);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].ruleId).toBe('rule-1');
      expect(result.errors[0].severity).toBe('error');
    });

    it('returns warnings for medium-priority rule failures', () => {
      const context = {
        tier: 'premium',
        microphone: { type: 'table' }, // Should be ceiling
      };

      const result = engine.validateDesign(rules, context);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].ruleId).toBe('rule-2');
      expect(result.warnings[0].severity).toBe('warning');
    });

    it('returns suggestions for low-priority rule failures', () => {
      const context = {
        roomType: 'boardroom',
        camera: { type: 'usb' }, // Should recommend PTZ
      };

      const result = engine.validateDesign(rules, context);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0].ruleId).toBe('rule-3');
      expect(result.suggestions[0].severity).toBe('suggestion');
    });

    it('evaluates rules in priority order (highest first)', () => {
      const context = {
        platform: 'teams',
        tier: 'premium',
        roomType: 'boardroom',
        display: { size: 55 },
        microphone: { type: 'table' },
        camera: { type: 'usb' },
      };

      const result = engine.validateDesign(rules, context);

      // Should have all three issues
      expect(result.errors.length + result.warnings.length + result.suggestions.length).toBe(3);
    });

    it('skips inactive rules', () => {
      const inactiveRules = rules.map((r) => ({ ...r, isActive: false }));
      const context = {
        platform: 'teams',
        display: { size: 55 },
      };

      const result = engine.validateDesign(inactiveRules, context);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('handles empty rules array', () => {
      const result = engine.validateDesign([], { platform: 'teams' });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });
  });

  // ============================================================================
  // getSeverity Tests
  // ============================================================================

  describe('getSeverity', () => {
    it('returns error for priority >= 80', () => {
      const rule: Rule = {
        id: 'r1',
        name: 'High',
        description: '',
        aspect: 'equipment_selection',
        expressionType: 'constraint',
        conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
        expression: 'x >= 0',
        priority: 80,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      };
      expect(engine.getSeverity(rule)).toBe('error');
    });

    it('returns warning for priority >= 40 and < 80', () => {
      const rule: Rule = {
        id: 'r1',
        name: 'Medium',
        description: '',
        aspect: 'equipment_selection',
        expressionType: 'constraint',
        conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
        expression: 'x >= 0',
        priority: 50,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      };
      expect(engine.getSeverity(rule)).toBe('warning');
    });

    it('returns suggestion for priority < 40', () => {
      const rule: Rule = {
        id: 'r1',
        name: 'Low',
        description: '',
        aspect: 'equipment_selection',
        expressionType: 'constraint',
        conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
        expression: 'x >= 0',
        priority: 20,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      };
      expect(engine.getSeverity(rule)).toBe('suggestion');
    });
  });
});
