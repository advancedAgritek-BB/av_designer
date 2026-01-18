/**
 * ConditionRow Component
 *
 * Single row in the condition builder for rules.
 * Displays dimension, operator, and value fields with remove button.
 */

import { Button } from '@/components/ui/Button';
import { RULE_DIMENSIONS } from '@/types/standards';
import type { RuleCondition, ConditionOperator } from '@/types/standards';

// ============================================================================
// Types
// ============================================================================

export interface ConditionRowProps {
  formId: string;
  index: number;
  condition: RuleCondition;
  onChange: (index: number, field: keyof RuleCondition, value: string) => void;
  onRemove: (index: number) => void;
}

// ============================================================================
// Constants
// ============================================================================

const CONDITION_OPERATORS: ConditionOperator[] = [
  'equals',
  'not_equals',
  'contains',
  'greater_than',
  'less_than',
  'in',
];

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'Equals',
  not_equals: 'Not Equals',
  contains: 'Contains',
  greater_than: 'Greater Than',
  less_than: 'Less Than',
  in: 'In',
};

// ============================================================================
// Component
// ============================================================================

export function ConditionRow({
  formId,
  index,
  condition,
  onChange,
  onRemove,
}: ConditionRowProps) {
  return (
    <div className="condition-row">
      {/* Dimension */}
      <div className="form-field condition-field">
        <label htmlFor={`${formId}-condition-${index}-dimension`} className="form-label">
          Dimension
        </label>
        <select
          id={`${formId}-condition-${index}-dimension`}
          className="form-select"
          value={condition.dimension}
          onChange={(e) => onChange(index, 'dimension', e.target.value)}
        >
          {RULE_DIMENSIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Operator */}
      <div className="form-field condition-field">
        <label htmlFor={`${formId}-condition-${index}-operator`} className="form-label">
          Operator
        </label>
        <select
          id={`${formId}-condition-${index}-operator`}
          className="form-select"
          value={condition.operator}
          onChange={(e) => onChange(index, 'operator', e.target.value)}
        >
          {CONDITION_OPERATORS.map((op) => (
            <option key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </option>
          ))}
        </select>
      </div>

      {/* Value */}
      <div className="form-field condition-field condition-value">
        <label htmlFor={`${formId}-condition-${index}-value`} className="form-label">
          Value
        </label>
        <input
          id={`${formId}-condition-${index}-value`}
          type="text"
          className="form-input"
          value={condition.value as string}
          onChange={(e) => onChange(index, 'value', e.target.value)}
          placeholder="Enter value..."
        />
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        aria-label="Remove condition"
        className="condition-remove"
      >
        <RemoveIcon />
      </Button>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function RemoveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
