/**
 * Equipment Form - Pricing Section
 *
 * Handles cost and MSRP fields.
 */

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { FormErrors } from './equipment-form-types';

interface PricingProps {
  formId: string;
  cost: number | '';
  msrp: number | '';
  errors: FormErrors;
  isLoading: boolean;
  onCostChange: (value: number | '') => void;
  onMsrpChange: (value: number | '') => void;
}

export interface PricingRef {
  focusCost: () => void;
  focusMsrp: () => void;
}

function getErrorId(formId: string, field: keyof FormErrors, errors: FormErrors) {
  return errors[field] ? `${formId}-${field}-error` : undefined;
}

export const EquipmentFormPricing = forwardRef<PricingRef, PricingProps>(
  function EquipmentFormPricing(
    { formId, cost, msrp, errors, isLoading, onCostChange, onMsrpChange },
    ref
  ) {
    const costRef = useRef<HTMLInputElement>(null);
    const msrpRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focusCost: () => costRef.current?.focus(),
      focusMsrp: () => msrpRef.current?.focus(),
    }));

    return (
      <div className="equipment-form-section">
        <h3 className="equipment-form-section-title">Pricing</h3>

        <div className="equipment-form-row">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-cost`} className="label">
              Cost
            </label>
            <input
              ref={costRef}
              id={`${formId}-cost`}
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                onCostChange(value);
              }}
              disabled={isLoading}
              aria-invalid={errors.cost ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'cost', errors)}
              className={`input ${errors.cost ? 'input-error' : ''}`}
            />
            {errors.cost && (
              <p
                id={getErrorId(formId, 'cost', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.cost}
              </p>
            )}
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-msrp`} className="label">
              MSRP
            </label>
            <input
              ref={msrpRef}
              id={`${formId}-msrp`}
              type="number"
              min="0"
              step="0.01"
              value={msrp}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                onMsrpChange(value);
              }}
              disabled={isLoading}
              aria-invalid={errors.msrp ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'msrp', errors)}
              className={`input ${errors.msrp ? 'input-error' : ''}`}
            />
            {errors.msrp && (
              <p
                id={getErrorId(formId, 'msrp', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.msrp}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);
