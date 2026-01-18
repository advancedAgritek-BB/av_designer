/**
 * Equipment Form - Basic Information Section
 *
 * Handles manufacturer, model, SKU, category, subcategory, and description fields.
 */

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { EquipmentCategory } from '@/types/equipment';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_SUBCATEGORIES } from '@/types/equipment';
import type { FormErrors } from './equipment-form-types';

interface BasicInfoProps {
  formId: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory | '';
  subcategory: string;
  description: string;
  errors: FormErrors;
  isLoading: boolean;
  onManufacturerChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSkuChange: (value: string) => void;
  onCategoryChange: (value: EquipmentCategory | '') => void;
  onSubcategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export interface BasicInfoRef {
  focusManufacturer: () => void;
  focusModel: () => void;
  focusSku: () => void;
  focusCategory: () => void;
  focusSubcategory: () => void;
  focusDescription: () => void;
}

function getErrorId(formId: string, field: keyof FormErrors, errors: FormErrors) {
  return errors[field] ? `${formId}-${field}-error` : undefined;
}

export const EquipmentFormBasicInfo = forwardRef<BasicInfoRef, BasicInfoProps>(
  function EquipmentFormBasicInfo(
    {
      formId,
      manufacturer,
      model,
      sku,
      category,
      subcategory,
      description,
      errors,
      isLoading,
      onManufacturerChange,
      onModelChange,
      onSkuChange,
      onCategoryChange,
      onSubcategoryChange,
      onDescriptionChange,
    },
    ref
  ) {
    const manufacturerRef = useRef<HTMLInputElement>(null);
    const modelRef = useRef<HTMLInputElement>(null);
    const skuRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLSelectElement>(null);
    const subcategoryRef = useRef<HTMLSelectElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focusManufacturer: () => manufacturerRef.current?.focus(),
      focusModel: () => modelRef.current?.focus(),
      focusSku: () => skuRef.current?.focus(),
      focusCategory: () => categoryRef.current?.focus(),
      focusSubcategory: () => subcategoryRef.current?.focus(),
      focusDescription: () => descriptionRef.current?.focus(),
    }));

    const subcategories = category ? EQUIPMENT_SUBCATEGORIES[category] : [];

    return (
      <div className="equipment-form-section">
        <h3 className="equipment-form-section-title">Basic Information</h3>

        <div className="equipment-form-row">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-manufacturer`} className="label">
              Manufacturer{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              ref={manufacturerRef}
              id={`${formId}-manufacturer`}
              type="text"
              value={manufacturer}
              onChange={(e) => onManufacturerChange(e.target.value)}
              disabled={isLoading}
              aria-invalid={errors.manufacturer ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'manufacturer', errors)}
              className={`input ${errors.manufacturer ? 'input-error' : ''}`}
            />
            {errors.manufacturer && (
              <p
                id={getErrorId(formId, 'manufacturer', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.manufacturer}
              </p>
            )}
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-model`} className="label">
              Model{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              ref={modelRef}
              id={`${formId}-model`}
              type="text"
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              disabled={isLoading}
              aria-invalid={errors.model ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'model', errors)}
              className={`input ${errors.model ? 'input-error' : ''}`}
            />
            {errors.model && (
              <p
                id={getErrorId(formId, 'model', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.model}
              </p>
            )}
          </div>
        </div>

        <div className="equipment-form-row">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-sku`} className="label">
              SKU{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              ref={skuRef}
              id={`${formId}-sku`}
              type="text"
              value={sku}
              onChange={(e) => onSkuChange(e.target.value)}
              disabled={isLoading}
              aria-invalid={errors.sku ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'sku', errors)}
              className={`input ${errors.sku ? 'input-error' : ''}`}
            />
            {errors.sku && (
              <p
                id={getErrorId(formId, 'sku', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.sku}
              </p>
            )}
          </div>
        </div>

        <div className="equipment-form-row">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-category`} className="label">
              Category{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <select
              ref={categoryRef}
              id={`${formId}-category`}
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as EquipmentCategory | '')}
              disabled={isLoading}
              aria-invalid={errors.category ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'category', errors)}
              className={`input ${errors.category ? 'input-error' : ''}`}
            >
              <option value="">Select category...</option>
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p
                id={getErrorId(formId, 'category', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.category}
              </p>
            )}
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-subcategory`} className="label">
              Subcategory{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <select
              ref={subcategoryRef}
              id={`${formId}-subcategory`}
              value={subcategory}
              onChange={(e) => onSubcategoryChange(e.target.value)}
              disabled={isLoading || !category}
              aria-invalid={errors.subcategory ? 'true' : undefined}
              aria-describedby={getErrorId(formId, 'subcategory', errors)}
              className={`input ${errors.subcategory ? 'input-error' : ''}`}
            >
              <option value="">Select subcategory...</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            {errors.subcategory && (
              <p
                id={getErrorId(formId, 'subcategory', errors)}
                className="text-status-error text-xs mt-1"
              >
                {errors.subcategory}
              </p>
            )}
          </div>
        </div>

        <div className="equipment-form-field">
          <label htmlFor={`${formId}-description`} className="label">
            Description
          </label>
          <textarea
            ref={descriptionRef}
            id={`${formId}-description`}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="input"
          />
        </div>
      </div>
    );
  }
);
