/**
 * Equipment Form - Physical Specifications Section
 *
 * Handles dimensions (height, width, depth) and weight fields.
 */

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Dimensions } from '@/types/equipment';
import type { FormErrors } from './equipment-form-types';

interface PhysicalSpecsProps {
  formId: string;
  dimensions: Dimensions;
  weight: number | '';
  errors: FormErrors;
  isLoading: boolean;
  onDimensionChange: (dimension: keyof Dimensions, value: number) => void;
  onWeightChange: (value: number | '') => void;
}

export interface PhysicalSpecsRef {
  focusHeight: () => void;
  focusWidth: () => void;
  focusDepth: () => void;
  focusWeight: () => void;
}

function getErrorId(formId: string, field: keyof FormErrors, errors: FormErrors) {
  return errors[field] ? `${formId}-${field}-error` : undefined;
}

export const EquipmentFormPhysicalSpecs = forwardRef<
  PhysicalSpecsRef,
  PhysicalSpecsProps
>(function EquipmentFormPhysicalSpecs(
  { formId, dimensions, weight, errors, isLoading, onDimensionChange, onWeightChange },
  ref
) {
  const heightRef = useRef<HTMLInputElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);
  const depthRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusHeight: () => heightRef.current?.focus(),
    focusWidth: () => widthRef.current?.focus(),
    focusDepth: () => depthRef.current?.focus(),
    focusWeight: () => weightRef.current?.focus(),
  }));

  return (
    <div className="equipment-form-section">
      <h3 className="equipment-form-section-title">Physical Specifications</h3>

      <fieldset
        className="equipment-form-fieldset"
        role="group"
        aria-labelledby={`${formId}-dimensions-legend`}
      >
        <legend id={`${formId}-dimensions-legend`} className="label mb-2">
          Dimensions (inches)
        </legend>
        <div className="equipment-form-row equipment-form-row-3">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-height`} className="label text-xs">
              Height
            </label>
            <input
              ref={heightRef}
              id={`${formId}-height`}
              type="number"
              min="0"
              step="0.1"
              value={dimensions.height}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onDimensionChange('height', value);
              }}
              disabled={isLoading}
              aria-invalid={errors.height ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'height', errors)}
              className={`input ${errors.height ? 'input-error' : ''}`}
            />
            {errors.height && (
              <p
                id={getErrorId(formId, 'height', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.height}
              </p>
            )}
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-width`} className="label text-xs">
              Width
            </label>
            <input
              ref={widthRef}
              id={`${formId}-width`}
              type="number"
              min="0"
              step="0.1"
              value={dimensions.width}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onDimensionChange('width', value);
              }}
              disabled={isLoading}
              aria-invalid={errors.width ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'width', errors)}
              className={`input ${errors.width ? 'input-error' : ''}`}
            />
            {errors.width && (
              <p
                id={getErrorId(formId, 'width', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.width}
              </p>
            )}
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-depth`} className="label text-xs">
              Depth
            </label>
            <input
              ref={depthRef}
              id={`${formId}-depth`}
              type="number"
              min="0"
              step="0.1"
              value={dimensions.depth}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onDimensionChange('depth', value);
              }}
              disabled={isLoading}
              aria-invalid={errors.depth ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'depth', errors)}
              className={`input ${errors.depth ? 'input-error' : ''}`}
            />
            {errors.depth && (
              <p
                id={getErrorId(formId, 'depth', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.depth}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <div className="equipment-form-field mt-4">
        <label htmlFor={`${formId}-weight`} className="label">
          Weight (lbs)
        </label>
        <input
          ref={weightRef}
          id={`${formId}-weight`}
          type="number"
          min="0"
          step="0.1"
          value={weight}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : parseFloat(e.target.value);
            onWeightChange(value);
          }}
          disabled={isLoading}
          aria-invalid={errors.weight ? 'true' : undefined}
          aria-describedby={getErrorId(formId, 'weight', errors)}
          className={`input ${errors.weight ? 'input-error' : ''}`}
        />
        {errors.weight && (
          <p
            id={getErrorId(formId, 'weight', errors)}
            className="text-status-error text-xs mt-1"
          >
            {errors.weight}
          </p>
        )}
      </div>
    </div>
  );
});
