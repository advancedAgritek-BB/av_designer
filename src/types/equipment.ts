/**
 * Equipment Type Definitions
 *
 * Comprehensive types for the AV equipment database including
 * categories, subcategories, physical specifications, and validation.
 */

// Equipment Categories
export const EQUIPMENT_CATEGORIES = [
  'video',
  'audio',
  'control',
  'infrastructure',
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

// Equipment Subcategories by Category
export const EQUIPMENT_SUBCATEGORIES: Record<EquipmentCategory, string[]> = {
  video: ['displays', 'cameras', 'codecs', 'switchers', 'extenders'],
  audio: ['microphones', 'speakers', 'dsp', 'amplifiers', 'mixers'],
  control: ['processors', 'touch-panels', 'keypads', 'interfaces'],
  infrastructure: ['racks', 'mounts', 'cables', 'connectors', 'power'],
};

// Physical Dimensions
export interface Dimensions {
  height: number;
  width: number;
  depth: number;
}

// Electrical Specifications
export interface ElectricalSpecs {
  voltage?: number;
  wattage?: number;
  amperage?: number;
  poeClass?: string;
  btuOutput?: number;
}

// Full Equipment Item
export interface Equipment {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  cost: number;
  msrp: number;
  dimensions: Dimensions;
  weight: number;
  electrical?: ElectricalSpecs;
  platformCertifications?: string[];
  imageUrl?: string;
  specSheetUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Data for Creating/Editing Equipment (omits auto-generated fields)
export interface EquipmentFormData {
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  cost: number;
  msrp: number;
  dimensions: Dimensions;
  weight: number;
  electrical?: ElectricalSpecs;
  platformCertifications?: string[];
}

/**
 * Runtime validation for Equipment objects
 * Checks all required fields and their types
 */
export function isValidEquipment(data: unknown): data is Equipment {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const eq = data as Record<string, unknown>;

  // Check required string fields
  if (typeof eq.id !== 'string') return false;
  if (typeof eq.manufacturer !== 'string') return false;
  if (typeof eq.model !== 'string') return false;
  if (typeof eq.sku !== 'string') return false;
  if (typeof eq.subcategory !== 'string') return false;
  if (typeof eq.description !== 'string') return false;

  // Check category is valid
  if (
    typeof eq.category !== 'string' ||
    !EQUIPMENT_CATEGORIES.includes(eq.category as EquipmentCategory)
  ) {
    return false;
  }

  // Check numeric fields
  if (typeof eq.cost !== 'number') return false;
  if (typeof eq.msrp !== 'number') return false;
  if (typeof eq.weight !== 'number') return false;

  // Check dimensions object
  if (!eq.dimensions || typeof eq.dimensions !== 'object') return false;
  const dims = eq.dimensions as Record<string, unknown>;
  if (typeof dims.height !== 'number') return false;
  if (typeof dims.width !== 'number') return false;
  if (typeof dims.depth !== 'number') return false;

  return true;
}
