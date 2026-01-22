/**
 * Type Definitions for Database JSON Columns
 *
 * These types define the structure of JSONB columns stored in Supabase tables.
 * They are used by database mappers to safely convert between database JSON
 * and application domain types.
 */

import type {
  MountingType,
  RoomType,
  CollaborationPlatform,
  HardwareEcosystem,
  QualityTier,
} from './index';

// ============================================================================
// Placed Equipment (rooms.placed_equipment JSONB column)
// ============================================================================

export interface PlacedEquipmentJson {
  id: string;
  equipmentId: string;
  x: number;
  y: number;
  z?: number;
  rotation: number;
  mountType: MountingType;
  label?: string;
  notes?: string;
}

// ============================================================================
// Drawing Types (drawings.layers and drawings.overrides JSONB columns)
// ============================================================================

export type LayerType = 'architectural' | 'av_equipment' | 'annotations' | 'dimensions' | 'notes';

export type ElementType = 'equipment' | 'cable' | 'symbol' | 'text' | 'dimension';

export interface DrawingLayerJson {
  id: string;
  name: string;
  type: LayerType;
  isLocked: boolean;
  isVisible: boolean;
  elements: DrawingElementJson[];
}

export interface DrawingElementJson {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, unknown>;
}

export interface DrawingOverrideJson {
  elementId: string;
  property: string;
  value: unknown;
}

// ============================================================================
// Template Content (templates.content JSONB column)
// ============================================================================

export interface RoomTemplateContentJson {
  roomType: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: CollaborationPlatform;
  ecosystem: HardwareEcosystem;
  tier: QualityTier;
  equipment: PlacedEquipmentJson[];
  connections?: ConnectionJson[];
}

export interface ConnectionJson {
  id: string;
  sourceId: string;
  sourcePort: string;
  targetId: string;
  targetPort: string;
  cableType: string;
  cableLength?: number;
  label?: string;
}

export interface EquipmentPackageContentJson {
  equipment: Array<{
    equipmentId: string;
    quantity: number;
  }>;
}

export interface ProjectTemplateContentJson {
  rooms: Array<{
    templateId: string;
    quantity: number;
  }>;
}

export interface QuoteTemplateContentJson {
  sections: Array<{
    name: string;
    category: string;
  }>;
  defaultMargin: number;
}

// ============================================================================
// Equipment Specs (equipment.dimensions and equipment.electrical JSONB columns)
// ============================================================================

export interface DimensionsJson {
  width: number;
  height: number;
  depth: number;
}

export interface ElectricalJson {
  voltage?: number;
  amperage?: number;
  wattage?: number;
  connector?: string;
}

// ============================================================================
// Rules (rules.conditions JSONB column)
// ============================================================================

export type RuleOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';

export interface RuleConditionJson {
  field: string;
  operator: RuleOperator;
  value: unknown;
}

// ============================================================================
// Notification Preferences (user_profiles.preferences JSONB column)
// ============================================================================

export interface NotificationPreferencesJson {
  email: boolean;
  push: boolean;
  inApp: boolean;
  digest: 'none' | 'daily' | 'weekly';
}

// ============================================================================
// Organization Settings (organizations.settings JSONB column)
// ============================================================================

export interface OrganizationSettingsJson {
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultMargin: number;
  quoteValidityDays: number;
}
