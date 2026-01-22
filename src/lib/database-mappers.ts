/**
 * Database Mappers
 *
 * Type-safe functions for converting between Supabase JSON columns
 * and application domain types.
 */

import type { Json } from './database.types';
import type {
  DrawingLayer,
  DrawingElement,
  RuleCondition,
  Position,
} from '../types';
import type {
  PlacedEquipmentJson,
  DrawingLayerJson,
  DrawingElementJson,
  DrawingOverrideJson,
  RuleConditionJson,
  DimensionsJson,
  ElectricalJson,
} from '../types/database-json';

// ============================================================================
// Placed Equipment Mappers
// ============================================================================

interface SimplePlacedEquipment {
  id: string;
  equipmentId: string;
  position: Position;
  rotation: number;
  mountType: string;
  label?: string;
  notes?: string;
}

export function mapJsonToPlacedEquipment(json: Json): SimplePlacedEquipment[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as unknown as PlacedEquipmentJson[]).map((item) => ({
    id: item.id,
    equipmentId: item.equipmentId,
    position: {
      x: item.x,
      y: item.y,
      z: item.z,
    },
    rotation: item.rotation,
    mountType: item.mountType,
    label: item.label,
    notes: item.notes,
  }));
}

export function mapPlacedEquipmentToJson(equipment: SimplePlacedEquipment[]): Json {
  return equipment.map((item) => ({
    id: item.id,
    equipmentId: item.equipmentId,
    x: item.position.x,
    y: item.position.y,
    z: item.position.z,
    rotation: item.rotation,
    mountType: item.mountType,
    label: item.label,
    notes: item.notes,
  })) as unknown as Json;
}

// ============================================================================
// Drawing Layer Mappers
// ============================================================================

export function mapJsonToDrawingLayers(json: Json): DrawingLayer[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as unknown as DrawingLayerJson[]).map((layer) => ({
    id: layer.id,
    name: layer.name,
    type: layer.type as DrawingLayer['type'],
    isLocked: layer.isLocked,
    isVisible: layer.isVisible,
    elements: layer.elements.map(mapJsonElementToElement),
  }));
}

function mapJsonElementToElement(el: DrawingElementJson): DrawingElement {
  return {
    id: el.id,
    type: el.type as DrawingElement['type'],
    position: {
      x: el.x,
      y: el.y,
    },
    properties: el.properties,
  };
}

export function mapDrawingLayersToJson(layers: DrawingLayer[]): Json {
  return layers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    type: layer.type,
    isLocked: layer.isLocked,
    isVisible: layer.isVisible,
    elements: layer.elements.map((el) => ({
      id: el.id,
      type: el.type,
      x: el.position.x,
      y: el.position.y,
      rotation: 0,
      properties: el.properties,
    })),
  })) as unknown as Json;
}

// ============================================================================
// Drawing Override Mappers
// ============================================================================

export interface DrawingOverride {
  elementId: string;
  property: string;
  value: unknown;
}

export function mapJsonToDrawingOverrides(json: Json): DrawingOverride[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as unknown as DrawingOverrideJson[]).map((override) => ({
    elementId: override.elementId,
    property: override.property,
    value: override.value,
  }));
}

export function mapDrawingOverridesToJson(overrides: DrawingOverride[]): Json {
  return overrides.map((override) => ({
    elementId: override.elementId,
    property: override.property,
    value: override.value,
  })) as unknown as Json;
}

// ============================================================================
// Rule Condition Mappers
// ============================================================================

export function mapJsonToRuleConditions(json: Json): RuleCondition[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as unknown as RuleConditionJson[]).map((cond) => ({
    field: cond.field,
    operator: cond.operator,
    value: cond.value,
  }));
}

export function mapRuleConditionsToJson(conditions: RuleCondition[]): Json {
  return conditions.map((cond) => ({
    field: cond.field,
    operator: cond.operator,
    value: cond.value,
  })) as unknown as Json;
}

// ============================================================================
// Equipment Dimension Mappers
// ============================================================================

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export function mapJsonToDimensions(json: Json): Dimensions {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return { width: 0, height: 0, depth: 0 };
  }
  const dims = json as unknown as DimensionsJson;
  return {
    width: dims.width ?? 0,
    height: dims.height ?? 0,
    depth: dims.depth ?? 0,
  };
}

export function mapDimensionsToJson(dimensions: Dimensions): Json {
  return {
    width: dimensions.width,
    height: dimensions.height,
    depth: dimensions.depth,
  } as unknown as Json;
}

// ============================================================================
// Electrical Specs Mappers
// ============================================================================

export interface ElectricalSpecs {
  voltage?: number;
  amperage?: number;
  wattage?: number;
  connector?: string;
}

export function mapJsonToElectrical(json: Json): ElectricalSpecs | undefined {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return undefined;

  const elec = json as unknown as ElectricalJson;
  return {
    voltage: elec.voltage,
    amperage: elec.amperage,
    wattage: elec.wattage,
    connector: elec.connector,
  };
}

export function mapElectricalToJson(electrical: ElectricalSpecs | undefined): Json | null {
  if (!electrical) return null;
  return {
    voltage: electrical.voltage,
    amperage: electrical.amperage,
    wattage: electrical.wattage,
    connector: electrical.connector,
  } as unknown as Json;
}
