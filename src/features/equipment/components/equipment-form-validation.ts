/**
 * Equipment Form Validation
 *
 * Field-level and form-level validation logic for the equipment form.
 */

import type { FormErrors, FormState } from './equipment-form-types';

/**
 * Validate a single form field
 */
export function validateField(
  field: keyof FormErrors,
  value: unknown
): string | undefined {
  switch (field) {
    case 'manufacturer':
      return !value || (value as string).trim() === ''
        ? 'Manufacturer is required'
        : undefined;
    case 'model':
      return !value || (value as string).trim() === '' ? 'Model is required' : undefined;
    case 'sku':
      return !value || (value as string).trim() === '' ? 'SKU is required' : undefined;
    case 'category':
      return !value ? 'Category is required' : undefined;
    case 'subcategory':
      return !value ? 'Subcategory is required' : undefined;
    case 'description':
      return undefined; // Optional field
    case 'cost':
      if (value !== '' && typeof value === 'number' && value < 0) {
        return 'Cost must be a positive number';
      }
      return undefined;
    case 'msrp':
      if (value !== '' && typeof value === 'number' && value < 0) {
        return 'MSRP must be a positive number';
      }
      return undefined;
    case 'height':
      if (typeof value === 'number' && value < 0) {
        return 'Height must be a positive number';
      }
      return undefined;
    case 'width':
      if (typeof value === 'number' && value < 0) {
        return 'Width must be a positive number';
      }
      return undefined;
    case 'depth':
      if (typeof value === 'number' && value < 0) {
        return 'Depth must be a positive number';
      }
      return undefined;
    case 'weight':
      if (value !== '' && typeof value === 'number' && value < 0) {
        return 'Weight must be a positive number';
      }
      return undefined;
    default:
      return undefined;
  }
}

/**
 * Validate all form fields and return errors object
 */
export function validateForm(state: FormState): FormErrors {
  const errors: FormErrors = {};

  const manufacturerError = validateField('manufacturer', state.manufacturer);
  if (manufacturerError) errors.manufacturer = manufacturerError;

  const modelError = validateField('model', state.model);
  if (modelError) errors.model = modelError;

  const skuError = validateField('sku', state.sku);
  if (skuError) errors.sku = skuError;

  const categoryError = validateField('category', state.category);
  if (categoryError) errors.category = categoryError;

  const subcategoryError = validateField('subcategory', state.subcategory);
  if (subcategoryError) errors.subcategory = subcategoryError;

  const costError = validateField('cost', state.cost);
  if (costError) errors.cost = costError;

  const msrpError = validateField('msrp', state.msrp);
  if (msrpError) errors.msrp = msrpError;

  const heightError = validateField('height', state.dimensions.height);
  if (heightError) errors.height = heightError;

  const widthError = validateField('width', state.dimensions.width);
  if (widthError) errors.width = widthError;

  const depthError = validateField('depth', state.dimensions.depth);
  if (depthError) errors.depth = depthError;

  const weightError = validateField('weight', state.weight);
  if (weightError) errors.weight = weightError;

  return errors;
}

/**
 * Order of fields for focus management when validation fails
 */
export const FIELD_FOCUS_ORDER: (keyof FormErrors)[] = [
  'manufacturer',
  'model',
  'sku',
  'category',
  'subcategory',
  'description',
  'cost',
  'msrp',
  'height',
  'width',
  'depth',
  'weight',
];
