/**
 * BOM Generator
 *
 * Generates Bill of Materials from room's placed equipment,
 * including grouping by category and quantity aggregation.
 */

import type { Equipment, EquipmentCategory } from '@/types/equipment';
import type { PlacedEquipment } from '@/types/room';

// ============================================================================
// Types
// ============================================================================

/**
 * BOM line item with aggregated quantity and pricing
 */
export interface BOMItem {
  equipmentId: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  quantity: number;
  unitCost: number;
  unitMsrp: number;
  totalCost: number;
  totalMsrp: number;
}

/**
 * BOM grouped by category
 */
export type BOMByCategory = Partial<Record<EquipmentCategory, BOMItem[]>>;

/**
 * BOM totals summary
 */
export interface BOMTotals {
  totalCost: number;
  totalMsrp: number;
  itemCount: number;
  uniqueItemCount: number;
}

/**
 * Complete BOM result
 */
export interface BOMResult {
  items: BOMItem[];
  byCategory: BOMByCategory;
  totals: BOMTotals;
}

/**
 * Placed equipment with associated equipment details
 */
export interface PlacedEquipmentWithDetails {
  placedEquipment: PlacedEquipment;
  equipment: Equipment;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a BOM item from equipment with specified quantity
 */
export function createBOMItem(equipment: Equipment, quantity: number): BOMItem {
  return {
    equipmentId: equipment.id,
    manufacturer: equipment.manufacturer,
    model: equipment.model,
    sku: equipment.sku,
    category: equipment.category,
    subcategory: equipment.subcategory,
    description: equipment.description,
    quantity,
    unitCost: equipment.cost,
    unitMsrp: equipment.msrp,
    totalCost: equipment.cost * quantity,
    totalMsrp: equipment.msrp * quantity,
  };
}

// ============================================================================
// Aggregation Functions
// ============================================================================

/**
 * Aggregate placed equipment by equipment ID, combining duplicates
 */
export function aggregateDuplicates(items: PlacedEquipmentWithDetails[]): BOMItem[] {
  if (items.length === 0) return [];

  // Group by equipment ID
  const grouped = new Map<string, { equipment: Equipment; count: number }>();

  for (const item of items) {
    const existing = grouped.get(item.equipment.id);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(item.equipment.id, { equipment: item.equipment, count: 1 });
    }
  }

  // Convert to BOM items
  return Array.from(grouped.values()).map(({ equipment, count }) =>
    createBOMItem(equipment, count)
  );
}

/**
 * Group BOM items by equipment category
 */
export function groupByCategory(items: BOMItem[]): BOMByCategory {
  if (items.length === 0) return {};

  const grouped: BOMByCategory = {};

  for (const item of items) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category]!.push(item);
  }

  return grouped;
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate complete BOM from placed equipment
 *
 * @param placedEquipment - Array of equipment placements in the room
 * @param equipmentCatalog - Array of available equipment with full details
 * @returns Complete BOM with items, categorization, and totals
 */
export function generateBOM(
  placedEquipment: PlacedEquipment[],
  equipmentCatalog: Equipment[]
): BOMResult {
  // Handle empty input
  if (placedEquipment.length === 0) {
    return {
      items: [],
      byCategory: {},
      totals: {
        totalCost: 0,
        totalMsrp: 0,
        itemCount: 0,
        uniqueItemCount: 0,
      },
    };
  }

  // Create lookup map for equipment
  const equipmentMap = new Map<string, Equipment>();
  for (const eq of equipmentCatalog) {
    equipmentMap.set(eq.id, eq);
  }

  // Match placed equipment with details, filtering out unknown equipment
  const itemsWithDetails: PlacedEquipmentWithDetails[] = [];
  for (const placed of placedEquipment) {
    const equipment = equipmentMap.get(placed.equipmentId);
    if (equipment) {
      itemsWithDetails.push({ placedEquipment: placed, equipment });
    }
  }

  // Aggregate duplicates
  const aggregatedItems = aggregateDuplicates(itemsWithDetails);

  // Sort items by category, then manufacturer, then model
  const sortedItems = aggregatedItems.sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) return categoryCompare;

    const manufacturerCompare = a.manufacturer.localeCompare(b.manufacturer);
    if (manufacturerCompare !== 0) return manufacturerCompare;

    return a.model.localeCompare(b.model);
  });

  // Group by category
  const byCategory = groupByCategory(sortedItems);

  // Calculate totals
  const totals: BOMTotals = {
    totalCost: sortedItems.reduce((sum, item) => sum + item.totalCost, 0),
    totalMsrp: sortedItems.reduce((sum, item) => sum + item.totalMsrp, 0),
    itemCount: sortedItems.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItemCount: sortedItems.length,
  };

  return {
    items: sortedItems,
    byCategory,
    totals,
  };
}
