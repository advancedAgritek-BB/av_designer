/**
 * Drawing Type Definitions
 *
 * Comprehensive types for the Drawing Generation feature including
 * drawing types, layers, elements, and manual overrides.
 */

// ============================================================================
// Drawing Type Constants
// ============================================================================

export const DRAWING_TYPES = Object.freeze([
  'electrical',
  'elevation',
  'rcp',
  'rack',
  'cable_schedule',
  'floor_plan',
] as const);

export type DrawingType = (typeof DRAWING_TYPES)[number];

// ============================================================================
// Layer Type Constants
// ============================================================================

export const LAYER_TYPES = Object.freeze([
  'title_block',
  'architectural',
  'av_elements',
  'annotations',
  'dimensions',
] as const);

export type LayerType = (typeof LAYER_TYPES)[number];

// ============================================================================
// Element Type Constants
// ============================================================================

export const ELEMENT_TYPES = Object.freeze([
  'equipment',
  'cable',
  'text',
  'dimension',
  'symbol',
] as const);

export type ElementType = (typeof ELEMENT_TYPES)[number];

// ============================================================================
// Drawing Element Interface
// ============================================================================

export interface DrawingElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, unknown>;
}

// ============================================================================
// Drawing Layer Interface
// ============================================================================

export interface DrawingLayer {
  id: string;
  name: string;
  type: LayerType;
  isLocked: boolean;
  isVisible: boolean;
  elements: DrawingElement[];
}

// ============================================================================
// Drawing Override Interface
// ============================================================================

export interface DrawingOverride {
  elementId: string;
  field: string;
  originalValue: unknown;
  newValue: unknown;
  createdAt: string;
}

// ============================================================================
// Drawing Interface
// ============================================================================

export interface Drawing {
  id: string;
  roomId: string;
  type: DrawingType;
  layers: DrawingLayer[];
  overrides: DrawingOverride[];
  generatedAt: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates DrawingElement object
 */
export function isValidDrawingElement(data: unknown): data is DrawingElement {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const elem = data as Record<string, unknown>;

  // Required string: id
  if (typeof elem.id !== 'string' || elem.id === '') return false;

  // Type must be valid
  if (
    typeof elem.type !== 'string' ||
    !ELEMENT_TYPES.includes(elem.type as ElementType)
  ) {
    return false;
  }

  // Position coordinates
  if (typeof elem.x !== 'number') return false;
  if (typeof elem.y !== 'number') return false;
  if (typeof elem.rotation !== 'number') return false;

  // Properties must be an object (not null, not array)
  if (
    elem.properties === null ||
    typeof elem.properties !== 'object' ||
    Array.isArray(elem.properties)
  ) {
    return false;
  }

  return true;
}

/**
 * Validates DrawingLayer object
 */
export function isValidDrawingLayer(data: unknown): data is DrawingLayer {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const layer = data as Record<string, unknown>;

  // Required strings
  if (typeof layer.id !== 'string' || layer.id === '') return false;
  if (typeof layer.name !== 'string' || layer.name === '') return false;

  // Type must be valid
  if (typeof layer.type !== 'string' || !LAYER_TYPES.includes(layer.type as LayerType)) {
    return false;
  }

  // Boolean flags
  if (typeof layer.isLocked !== 'boolean') return false;
  if (typeof layer.isVisible !== 'boolean') return false;

  // Elements array
  if (!Array.isArray(layer.elements)) return false;
  for (const element of layer.elements) {
    if (!isValidDrawingElement(element)) return false;
  }

  return true;
}

/**
 * Validates DrawingOverride object
 */
export function isValidDrawingOverride(data: unknown): data is DrawingOverride {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const override = data as Record<string, unknown>;

  // Required strings
  if (typeof override.elementId !== 'string' || override.elementId === '') return false;
  if (typeof override.field !== 'string' || override.field === '') return false;
  if (typeof override.createdAt !== 'string' || override.createdAt === '') return false;

  // originalValue and newValue can be any type (including null)
  // They are implicitly valid as they exist via the object check

  return true;
}

/**
 * Validates Drawing object
 */
export function isValidDrawing(data: unknown): data is Drawing {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const drawing = data as Record<string, unknown>;

  // Required strings
  if (typeof drawing.id !== 'string' || drawing.id === '') return false;
  if (typeof drawing.roomId !== 'string' || drawing.roomId === '') return false;
  if (typeof drawing.generatedAt !== 'string' || drawing.generatedAt === '') return false;

  // Type must be valid
  if (
    typeof drawing.type !== 'string' ||
    !DRAWING_TYPES.includes(drawing.type as DrawingType)
  ) {
    return false;
  }

  // Layers array
  if (!Array.isArray(drawing.layers)) return false;
  for (const layer of drawing.layers) {
    if (!isValidDrawingLayer(layer)) return false;
  }

  // Overrides array
  if (!Array.isArray(drawing.overrides)) return false;
  for (const override of drawing.overrides) {
    if (!isValidDrawingOverride(override)) return false;
  }

  return true;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a new DrawingElement with default values
 */
export function createDefaultDrawingElement(
  overrides?: Partial<DrawingElement>
): DrawingElement {
  return {
    id: overrides?.id ?? crypto.randomUUID(),
    type: overrides?.type ?? 'equipment',
    x: overrides?.x ?? 0,
    y: overrides?.y ?? 0,
    rotation: overrides?.rotation ?? 0,
    properties: overrides?.properties ?? {},
  };
}

/**
 * Creates a new DrawingLayer with default values
 */
export function createDefaultDrawingLayer(
  overrides?: Partial<DrawingLayer>
): DrawingLayer {
  return {
    id: overrides?.id ?? crypto.randomUUID(),
    name: overrides?.name ?? 'New Layer',
    type: overrides?.type ?? 'av_elements',
    isLocked: overrides?.isLocked ?? false,
    isVisible: overrides?.isVisible ?? true,
    elements: overrides?.elements ?? [],
  };
}

/**
 * Creates a new Drawing with default values
 */
export function createDefaultDrawing(
  roomId: string,
  overrides?: Partial<Omit<Drawing, 'id' | 'roomId' | 'generatedAt'>>
): Drawing {
  return {
    id: crypto.randomUUID(),
    roomId,
    type: overrides?.type ?? 'electrical',
    layers: overrides?.layers ?? [],
    overrides: overrides?.overrides ?? [],
    generatedAt: new Date().toISOString(),
  };
}
