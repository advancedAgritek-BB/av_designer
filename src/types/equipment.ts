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

// =============================================================================
// Import Types
// =============================================================================

export type DestinationField =
  | 'manufacturer'
  | 'model'
  | 'sku'
  | 'category'
  | 'subcategory'
  | 'description'
  | 'cost'
  | 'msrp'
  | 'map'
  | 'contract'
  | 'distributorSku'
  | 'height'
  | 'width'
  | 'depth'
  | 'weight'
  | 'ignore'
  | `specifications.${string}`;

export interface ColumnMapping {
  csvColumn: string;
  destination: DestinationField;
}

export interface VendorTemplate {
  id: string;
  name: string;
  type: 'distributor' | 'manufacturer' | 'generic';
  filename: string;
  headerPatterns: string[];
  suggestedMappings: ColumnMapping[];
}

export interface ImportConfig {
  organizationId: string;
  distributorName: string;
  columnMappings: ColumnMapping[];
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

export interface ValidationResult {
  row: number;
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  value?: unknown;
}

export interface EquipmentImportData {
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description?: string;
  cost: number;
  msrp: number;
  map?: number;
  contract?: number;
  distributorSku?: string;
  distributor?: string;
  height?: number;
  width?: number;
  depth?: number;
  weight?: number;
  specifications?: Record<string, string>;
}

export interface ParsedRow {
  rowNumber: number;
  data: Partial<EquipmentImportData>;
  errors: ValidationResult[];
  warnings: ValidationResult[];
  status: 'valid' | 'warning' | 'error';
  existingEquipmentId?: string;
  action: 'create' | 'update';
}

export interface ImportPreview {
  rows: ParsedRow[];
  summary: {
    total: number;
    valid: number;
    warnings: number;
    errors: number;
    toCreate: number;
    toUpdate: number;
  };
}

export interface ImportRecord {
  id: string;
  organizationId: string;
  userId: string;
  filename: string;
  distributor: string;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  errors: { row: number; error: string }[];
  columnMapping: Record<string, string>;
  startedAt: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface DistributorPricing {
  distributor: string;
  distributorSku: string;
  cost: number;
  msrp: number;
  map?: number;
  contract?: number;
  lastUpdated: string;
}

// =============================================================================
// Validation
// =============================================================================

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
