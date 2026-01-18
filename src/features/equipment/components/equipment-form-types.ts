/**
 * Equipment Form Types
 *
 * Type definitions and constants used by the equipment form component and its sections.
 */

import type {
  Equipment,
  EquipmentCategory,
  EquipmentFormData,
  ElectricalSpecs,
  Dimensions,
} from '@/types/equipment';

export type FormMode = 'create' | 'edit';

export interface EquipmentFormProps {
  mode: FormMode;
  equipment?: Equipment;
  onSubmit: (data: EquipmentFormData, id?: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface FormErrors {
  manufacturer?: string;
  model?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  cost?: string;
  msrp?: string;
  height?: string;
  width?: string;
  depth?: string;
  weight?: string;
}

export interface FormState {
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory | '';
  subcategory: string;
  description: string;
  cost: number | '';
  msrp: number | '';
  dimensions: Dimensions;
  weight: number | '';
  electrical: ElectricalSpecs;
  certifications: string;
}

export const EMPTY_DIMENSIONS: Dimensions = {
  height: 0,
  width: 0,
  depth: 0,
};

export const EMPTY_ELECTRICAL: ElectricalSpecs = {};

/**
 * Compute initial form state from mode and equipment props
 */
export function getInitialState(mode: FormMode, equipment?: Equipment): FormState {
  if (mode === 'edit' && equipment) {
    return {
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      sku: equipment.sku,
      category: equipment.category as EquipmentCategory | '',
      subcategory: equipment.subcategory,
      description: equipment.description,
      cost: equipment.cost as number | '',
      msrp: equipment.msrp as number | '',
      dimensions: equipment.dimensions,
      weight: equipment.weight as number | '',
      electrical: equipment.electrical ?? EMPTY_ELECTRICAL,
      certifications: equipment.platformCertifications?.join(', ') ?? '',
    };
  }
  return {
    manufacturer: '',
    model: '',
    sku: '',
    category: '' as EquipmentCategory | '',
    subcategory: '',
    description: '',
    cost: '' as number | '',
    msrp: '' as number | '',
    dimensions: EMPTY_DIMENSIONS,
    weight: '' as number | '',
    electrical: EMPTY_ELECTRICAL,
    certifications: '',
  };
}
