/**
 * Quote Type Definitions
 *
 * Comprehensive types for the Quoting & BOM feature including
 * quotes, sections, items, and pricing calculations.
 */

// ============================================================================
// Quote Status Constants
// ============================================================================

export const QUOTE_STATUSES = Object.freeze([
  'draft',
  'quoting',
  'client_review',
  'approved',
  'ordered',
] as const);

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

// ============================================================================
// Item Status Constants
// ============================================================================

export const ITEM_STATUSES = Object.freeze([
  'quoting',
  'client_review',
  'ordered',
  'delivered',
  'installed',
] as const);

export type ItemStatus = (typeof ITEM_STATUSES)[number];

// ============================================================================
// Quote Totals Interface
// ============================================================================

export interface QuoteTotals {
  equipment: number;
  labor: number;
  subtotal: number;
  tax: number;
  total: number;
  margin: number;
  marginPercentage: number;
}

// ============================================================================
// Quote Item Interface
// ============================================================================

export interface QuoteItem {
  id: string;
  equipmentId: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  margin: number;
  total: number;
  status: ItemStatus;
  notes?: string;
}

// ============================================================================
// Quote Section Interface
// ============================================================================

export interface QuoteSection {
  id: string;
  name: string;
  category: string;
  items: QuoteItem[];
  subtotal: number;
}

// ============================================================================
// Quote Interface
// ============================================================================

export interface Quote {
  id: string;
  projectId: string;
  roomId: string;
  version: number;
  status: QuoteStatus;
  sections: QuoteSection[];
  totals: QuoteTotals;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Type guard for QuoteTotals
 */
export function isValidQuoteTotals(value: unknown): value is QuoteTotals {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;

  const obj = value as Record<string, unknown>;

  // Check required number fields exist and are non-negative
  const requiredFields = [
    'equipment',
    'labor',
    'subtotal',
    'tax',
    'total',
    'margin',
    'marginPercentage',
  ];

  for (const field of requiredFields) {
    if (!(field in obj)) return false;
    if (typeof obj[field] !== 'number') return false;
    // margin and marginPercentage can be negative (loss), others must be >= 0
    if (field !== 'margin' && field !== 'marginPercentage' && (obj[field] as number) < 0)
      return false;
  }

  return true;
}

/**
 * Type guard for QuoteItem
 */
export function isValidQuoteItem(value: unknown): value is QuoteItem {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;

  const obj = value as Record<string, unknown>;

  // Check id
  if (!('id' in obj) || typeof obj.id !== 'string' || obj.id === '') return false;

  // Check equipmentId
  if (
    !('equipmentId' in obj) ||
    typeof obj.equipmentId !== 'string' ||
    obj.equipmentId === ''
  )
    return false;

  // Check quantity (positive integer)
  if (!('quantity' in obj) || typeof obj.quantity !== 'number') return false;
  if (obj.quantity <= 0 || !Number.isInteger(obj.quantity)) return false;

  // Check unitCost (non-negative)
  if (!('unitCost' in obj) || typeof obj.unitCost !== 'number') return false;
  if ((obj.unitCost as number) < 0) return false;

  // Check unitPrice (non-negative)
  if (!('unitPrice' in obj) || typeof obj.unitPrice !== 'number') return false;
  if ((obj.unitPrice as number) < 0) return false;

  // Check margin (can be negative for loss leaders)
  if (!('margin' in obj) || typeof obj.margin !== 'number') return false;

  // Check total (non-negative)
  if (!('total' in obj) || typeof obj.total !== 'number') return false;
  if ((obj.total as number) < 0) return false;

  // Check status
  if (!('status' in obj) || typeof obj.status !== 'string') return false;
  if (!ITEM_STATUSES.includes(obj.status as ItemStatus)) return false;

  // Check optional notes
  if ('notes' in obj && obj.notes !== undefined) {
    if (typeof obj.notes !== 'string') return false;
  }

  return true;
}

/**
 * Type guard for QuoteSection
 */
export function isValidQuoteSection(value: unknown): value is QuoteSection {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;

  const obj = value as Record<string, unknown>;

  // Check id
  if (!('id' in obj) || typeof obj.id !== 'string' || obj.id === '') return false;

  // Check name
  if (!('name' in obj) || typeof obj.name !== 'string' || obj.name === '') return false;

  // Check category
  if (!('category' in obj) || typeof obj.category !== 'string' || obj.category === '')
    return false;

  // Check items array
  if (!('items' in obj) || !Array.isArray(obj.items)) return false;
  for (const item of obj.items) {
    if (!isValidQuoteItem(item)) return false;
  }

  // Check subtotal (non-negative)
  if (!('subtotal' in obj) || typeof obj.subtotal !== 'number') return false;
  if ((obj.subtotal as number) < 0) return false;

  return true;
}

/**
 * Type guard for Quote
 */
export function isValidQuote(value: unknown): value is Quote {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;

  const obj = value as Record<string, unknown>;

  // Check id
  if (!('id' in obj) || typeof obj.id !== 'string' || obj.id === '') return false;

  // Check projectId
  if (!('projectId' in obj) || typeof obj.projectId !== 'string' || obj.projectId === '')
    return false;

  // Check roomId
  if (!('roomId' in obj) || typeof obj.roomId !== 'string' || obj.roomId === '')
    return false;

  // Check version (positive integer)
  if (!('version' in obj) || typeof obj.version !== 'number') return false;
  if (obj.version <= 0 || !Number.isInteger(obj.version)) return false;

  // Check status
  if (!('status' in obj) || typeof obj.status !== 'string') return false;
  if (!QUOTE_STATUSES.includes(obj.status as QuoteStatus)) return false;

  // Check sections array
  if (!('sections' in obj) || !Array.isArray(obj.sections)) return false;
  for (const section of obj.sections) {
    if (!isValidQuoteSection(section)) return false;
  }

  // Check totals
  if (!('totals' in obj) || !isValidQuoteTotals(obj.totals)) return false;

  // Check createdAt
  if (!('createdAt' in obj) || typeof obj.createdAt !== 'string' || obj.createdAt === '')
    return false;

  // Check updatedAt
  if (!('updatedAt' in obj) || typeof obj.updatedAt !== 'string' || obj.updatedAt === '')
    return false;

  return true;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create default QuoteTotals with zero values
 */
export function createDefaultQuoteTotals(): QuoteTotals {
  return {
    equipment: 0,
    labor: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    margin: 0,
    marginPercentage: 0,
  };
}

/**
 * Generate a unique ID for quotes/sections/items
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create default QuoteItem with specified equipment ID
 */
export function createDefaultQuoteItem(equipmentId: string): QuoteItem {
  return {
    id: generateId(),
    equipmentId,
    quantity: 1,
    unitCost: 0,
    unitPrice: 0,
    margin: 0,
    total: 0,
    status: 'quoting',
  };
}

/**
 * Create default QuoteSection with specified name and category
 */
export function createDefaultQuoteSection(name: string, category: string): QuoteSection {
  return {
    id: generateId(),
    name,
    category,
    items: [],
    subtotal: 0,
  };
}

/**
 * Create default Quote with specified project and room IDs
 */
export function createDefaultQuote(projectId: string, roomId: string): Quote {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    projectId,
    roomId,
    version: 1,
    status: 'draft',
    sections: [],
    totals: createDefaultQuoteTotals(),
    createdAt: now,
    updatedAt: now,
  };
}
