/**
 * RuleEditor Component
 *
 * Form for creating and editing rules with condition builder
 * and expression editor. Supports both create and edit modes.
 */

import { useState, useCallback, useId } from 'react';
import { Button } from '@/components/ui/Button';
import {
  RULE_ASPECTS,
  RULE_EXPRESSION_TYPES,
  RULE_DIMENSIONS,
} from '@/types/standards';
import type {
  Rule,
  RuleAspect,
  RuleExpressionType,
  RuleCondition,
  ConditionOperator,
} from '@/types/standards';
import type { CreateRuleInput } from '../standards-service';

// ============================================================================
// Types
// ============================================================================

interface RuleEditorProps {
  mode: 'create' | 'edit';
  rule?: Rule;
  onSubmit: (data: CreateRuleInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  aspect?: string;
  expressionType?: string;
  expression?: string;
  priority?: string;
  conditions?: string;
}

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

const ASPECT_LABELS: Record<RuleAspect, string> = {
  equipment_selection: 'Equipment Selection',
  quantities: 'Quantities',
  placement: 'Placement',
  configuration: 'Configuration',
  cabling: 'Cabling',
  commercial: 'Commercial',
};

const EXPRESSION_TYPE_LABELS: Record<RuleExpressionType, string> = {
  constraint: 'Constraint',
  formula: 'Formula',
  conditional: 'Conditional',
  range_match: 'Range Match',
  pattern: 'Pattern',
};

// ============================================================================
// Component
// ============================================================================

export function RuleEditor({
  mode,
  rule,
  onSubmit,
  onCancel,
  isLoading = false,
}: RuleEditorProps) {
  const formId = useId();

  // Form state
  const [name, setName] = useState(rule?.name ?? '');
  const [description, setDescription] = useState(rule?.description ?? '');
  const [aspect, setAspect] = useState<RuleAspect | ''>(rule?.aspect ?? '');
  const [expressionType, setExpressionType] = useState<RuleExpressionType | ''>(
    rule?.expressionType ?? ''
  );
  const [expression, setExpression] = useState(rule?.expression ?? '');
  const [priority, setPriority] = useState<number>(rule?.priority ?? 50);
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);
  const [conditions, setConditions] = useState<RuleCondition[]>(rule?.conditions ?? []);
  const [errors, setErrors] = useState<FormErrors>({});

  // Validation
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!expression.trim()) {
      newErrors.expression = 'Expression is required';
    }

    if (!aspect) {
      newErrors.aspect = 'Aspect is required';
    }

    if (!expressionType) {
      newErrors.expressionType = 'Expression type is required';
    }

    if (priority < 0 || priority > 100) {
      newErrors.priority = 'Priority must be between 0 and 100';
    }

    if (conditions.length === 0) {
      newErrors.conditions = 'At least one condition is required';
    }

    return newErrors;
  }, [name, expression, aspect, expressionType, priority, conditions]);

  // Handlers
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateForm();
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      onSubmit({
        name: name.trim(),
        description: description.trim(),
        aspect: aspect as RuleAspect,
        expressionType: expressionType as RuleExpressionType,
        expression: expression.trim(),
        priority,
        isActive,
        conditions,
      });
    },
    [name, description, aspect, expressionType, expression, priority, isActive, conditions, validateForm, onSubmit]
  );

  const handleAddCondition = useCallback(() => {
    setConditions((prev) => [
      ...prev,
      { dimension: 'platform', operator: 'equals', value: '' },
    ]);
    // Clear conditions error when adding
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.conditions;
      return newErrors;
    });
  }, []);

  const handleRemoveCondition = useCallback((index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleConditionChange = useCallback(
    (index: number, field: keyof RuleCondition, value: string) => {
      setConditions((prev) =>
        prev.map((condition, i) =>
          i === index ? { ...condition, [field]: value } : condition
        )
      );
    },
    []
  );

  const title = mode === 'create' ? 'Create Rule' : 'Edit Rule';
  const submitText = mode === 'create' ? 'Create' : 'Save';
  const loadingText = mode === 'create' ? 'Creating...' : 'Saving...';

  return (
    <form
      id={formId}
      aria-label={`${title} form`}
      className="rule-editor"
      onSubmit={handleSubmit}
    >
      <h2 className="rule-editor-title">{title}</h2>

      {/* Basic Fields */}
      <div className="rule-editor-section">
        {/* Name */}
        <div className="form-field">
          <label htmlFor={`${formId}-name`} className="form-label">
            Name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          />
          {errors.name && (
            <span id={`${formId}-name-error`} className="form-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="form-field">
          <label htmlFor={`${formId}-description`} className="form-label">
            Description
          </label>
          <textarea
            id={`${formId}-description`}
            className="form-input form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* Aspect */}
        <div className="form-field">
          <label htmlFor={`${formId}-aspect`} className="form-label">
            Aspect
          </label>
          <select
            id={`${formId}-aspect`}
            className={`form-select ${errors.aspect ? 'form-input-error' : ''}`}
            value={aspect}
            onChange={(e) => setAspect(e.target.value as RuleAspect)}
            aria-invalid={!!errors.aspect}
            aria-describedby={errors.aspect ? `${formId}-aspect-error` : undefined}
          >
            <option value="">Select aspect...</option>
            {RULE_ASPECTS.map((a) => (
              <option key={a} value={a}>
                {ASPECT_LABELS[a]}
              </option>
            ))}
          </select>
          {errors.aspect && (
            <span id={`${formId}-aspect-error`} className="form-error" role="alert">
              {errors.aspect}
            </span>
          )}
        </div>

        {/* Expression Type */}
        <div className="form-field">
          <label htmlFor={`${formId}-expression-type`} className="form-label">
            Expression Type
          </label>
          <select
            id={`${formId}-expression-type`}
            className={`form-select ${errors.expressionType ? 'form-input-error' : ''}`}
            value={expressionType}
            onChange={(e) => setExpressionType(e.target.value as RuleExpressionType)}
            aria-invalid={!!errors.expressionType}
            aria-describedby={errors.expressionType ? `${formId}-expression-type-error` : undefined}
          >
            <option value="">Select type...</option>
            {RULE_EXPRESSION_TYPES.map((t) => (
              <option key={t} value={t}>
                {EXPRESSION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {errors.expressionType && (
            <span id={`${formId}-expression-type-error`} className="form-error" role="alert">
              {errors.expressionType}
            </span>
          )}
        </div>

        {/* Priority */}
        <div className="form-field">
          <label htmlFor={`${formId}-priority`} className="form-label">
            Priority (0-100)
          </label>
          <input
            id={`${formId}-priority`}
            type="number"
            className={`form-input ${errors.priority ? 'form-input-error' : ''}`}
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
            min={0}
            max={100}
            aria-invalid={!!errors.priority}
            aria-describedby={errors.priority ? `${formId}-priority-error` : undefined}
          />
          {errors.priority && (
            <span id={`${formId}-priority-error`} className="form-error" role="alert">
              {errors.priority}
            </span>
          )}
        </div>

        {/* Active Toggle */}
        <div className="form-field form-field-checkbox">
          <input
            id={`${formId}-active`}
            type="checkbox"
            className="form-checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor={`${formId}-active`} className="form-label-inline">
            Active
          </label>
        </div>
      </div>

      {/* Conditions Builder */}
      <div className="rule-editor-section">
        <div className="rule-editor-section-header">
          <h3 className="rule-editor-section-title">Conditions</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddCondition}
          >
            Add Condition
          </Button>
        </div>

        {errors.conditions && (
          <span className="form-error" role="alert">
            {errors.conditions}
          </span>
        )}

        <div className="rule-editor-conditions">
          {conditions.map((condition, index) => (
            <ConditionRow
              key={index}
              formId={formId}
              index={index}
              condition={condition}
              onChange={handleConditionChange}
              onRemove={handleRemoveCondition}
            />
          ))}
        </div>
      </div>

      {/* Expression Editor */}
      <div className="rule-editor-section">
        <h3 className="rule-editor-section-title">Expression</h3>
        <div className="form-field">
          <label htmlFor={`${formId}-expression`} className="form-label">
            Expression
          </label>
          <textarea
            id={`${formId}-expression`}
            className={`form-input form-textarea form-textarea-code ${errors.expression ? 'form-input-error' : ''}`}
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            rows={3}
            placeholder="e.g., display.size >= 75"
            aria-invalid={!!errors.expression}
            aria-describedby={errors.expression ? `${formId}-expression-error` : undefined}
          />
          {errors.expression && (
            <span id={`${formId}-expression-error`} className="form-error" role="alert">
              {errors.expression}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="rule-editor-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? loadingText : submitText}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// Condition Row Component
// ============================================================================

interface ConditionRowProps {
  formId: string;
  index: number;
  condition: RuleCondition;
  onChange: (index: number, field: keyof RuleCondition, value: string) => void;
  onRemove: (index: number) => void;
}

function ConditionRow({ formId, index, condition, onChange, onRemove }: ConditionRowProps) {
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
