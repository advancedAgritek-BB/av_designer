/**
 * Rule Evaluation Engine
 *
 * Evaluates AV design configurations against standards-based rules.
 * Supports condition matching, expression evaluation, and validation results.
 */

import type {
  Rule,
  RuleCondition,
  RuleDimension,
  ValidationResult,
  ValidationIssue,
  IssueSeverity,
} from '@/types/standards';

/**
 * Context object containing design attributes for rule evaluation.
 */
export interface RuleContext {
  [key: string]: unknown;
}

/**
 * Result of evaluating a single rule against a context.
 */
export interface RuleEvaluationResult {
  applies: boolean;
  passed: boolean;
  message?: string;
}

/**
 * Engine for evaluating rules against design contexts.
 */
export class RuleEngine {
  /**
   * Evaluate a single condition against the context.
   */
  evaluateCondition(condition: RuleCondition, context: RuleContext): boolean {
    const contextValue = this.getContextValue(condition.dimension, context);

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;

      case 'not_equals':
        return contextValue !== condition.value;

      case 'contains':
        if (Array.isArray(contextValue)) {
          return contextValue.includes(condition.value);
        }
        if (typeof contextValue === 'string') {
          return contextValue.includes(String(condition.value));
        }
        return false;

      case 'greater_than':
        return Number(contextValue) > Number(condition.value);

      case 'less_than':
        return Number(contextValue) < Number(condition.value);

      case 'in':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(contextValue as string);
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Evaluate an expression string against the context.
   * Format: "field.subfield operator value"
   */
  evaluateExpression(expression: string, context: RuleContext): boolean {
    if (!expression) {
      return true;
    }

    // Parse expression: path operator value
    const match = expression.match(/^(\w+(?:\.\w+)*)\s*(>=|<=|>|<|==|!=)\s*(.+)$/);

    if (!match) {
      // Invalid expression format, return true (pass)
      return true;
    }

    const [, path, operator, rawValue] = match;
    const contextValue = this.resolvePath(path, context);
    const value = this.parseValue(rawValue);

    // Handle missing context values
    if (contextValue === undefined) {
      return false;
    }

    switch (operator) {
      case '>=':
        return Number(contextValue) >= Number(value);
      case '<=':
        return Number(contextValue) <= Number(value);
      case '>':
        return Number(contextValue) > Number(value);
      case '<':
        return Number(contextValue) < Number(value);
      case '==':
        return contextValue === value;
      case '!=':
        return contextValue !== value;
      default:
        return true;
    }
  }

  /**
   * Evaluate a complete rule against the context.
   */
  evaluateRule(rule: Rule, context: RuleContext): RuleEvaluationResult {
    if (!rule.isActive) {
      return { applies: false, passed: true };
    }

    // Check if all conditions match (rule applies to this context)
    const applies = rule.conditions.every((condition) =>
      this.evaluateCondition(condition, context)
    );

    if (!applies) {
      return { applies: false, passed: true };
    }

    // Evaluate the expression
    const passed = this.evaluateExpression(rule.expression, context);

    return {
      applies: true,
      passed,
      message: passed ? undefined : `Rule "${rule.name}" failed: ${rule.description}`,
    };
  }

  /**
   * Validate a design against a set of rules.
   */
  validateDesign(rules: Rule[], context: RuleContext): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const suggestions: ValidationIssue[] = [];

    // Sort rules by priority (higher priority rules evaluated first)
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const result = this.evaluateRule(rule, context);

      if (result.applies && !result.passed) {
        const severity = this.getSeverity(rule);
        const issue: ValidationIssue = {
          ruleId: rule.id,
          ruleName: rule.name,
          message: result.message || rule.description,
          severity,
        };

        switch (severity) {
          case 'error':
            errors.push(issue);
            break;
          case 'warning':
            warnings.push(issue);
            break;
          case 'suggestion':
            suggestions.push(issue);
            break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Get the severity level for a rule based on its priority.
   */
  getSeverity(rule: Rule): IssueSeverity {
    if (rule.priority >= 80) return 'error';
    if (rule.priority >= 40) return 'warning';
    return 'suggestion';
  }

  /**
   * Get a value from the context based on the dimension.
   * Handles various naming conventions (camelCase, snake_case).
   */
  private getContextValue(dimension: RuleDimension, context: RuleContext): unknown {
    switch (dimension) {
      case 'room_type':
        return context.roomType ?? context.room_type ?? context.room_sqft;
      case 'platform':
        return context.platform;
      case 'ecosystem':
        return context.ecosystem;
      case 'tier':
        return context.tier ?? context.qualityTier;
      case 'use_case':
        return context.useCase ?? context.use_case;
      case 'client':
        return context.clientId ?? context.client;
      default:
        return context[dimension];
    }
  }

  /**
   * Resolve a dot-notation path in the context.
   */
  private resolvePath(path: string, context: RuleContext): unknown {
    return path.split('.').reduce<unknown>((obj, key) => {
      if (obj && typeof obj === 'object' && key in obj) {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, context);
  }

  /**
   * Parse a value from the expression string.
   */
  private parseValue(value: string): unknown {
    const trimmed = value.trim();

    // Try to parse as number
    const num = Number(trimmed);
    if (!isNaN(num)) return num;

    // Remove quotes for string values
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }

    // Boolean values
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    return trimmed;
  }
}

/**
 * Singleton instance of the rule engine.
 */
export const ruleEngine = new RuleEngine();
