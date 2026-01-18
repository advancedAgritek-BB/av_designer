/**
 * Pricing Engine
 *
 * Handles margin, markup, labor estimation, and tax calculations
 * for generating accurate quotes.
 */

import type { BOMItem } from './bom-generator';
import type { EquipmentCategory } from '@/types/equipment';

// ============================================================================
// Types
// ============================================================================

/**
 * Labor calculation configuration
 */
export interface LaborConfig {
  hourlyRate: number;
  hoursPerItem: Partial<Record<EquipmentCategory, number>>;
  defaultHoursPerItem?: number;
  setupHours: number;
  programmingHours: number;
  testingHours: number;
}

/**
 * Tax calculation configuration
 */
export interface TaxConfig {
  rate: number;
  applyToEquipment: boolean;
  applyToLabor: boolean;
}

/**
 * Labor calculation result
 */
export interface LaborResult {
  hours: number;
  cost: number;
}

/**
 * Complete pricing result
 */
export interface PricingResult {
  equipmentCost: number;
  equipmentPrice: number;
  laborCost: number;
  laborHours: number;
  subtotal: number;
  tax: number;
  total: number;
  margin: number;
  marginPercentage: number;
}

// ============================================================================
// Margin and Markup Calculations
// ============================================================================

/**
 * Calculate margin (profit) from cost and price
 * Margin = Price - Cost
 */
export function calculateMargin(cost: number, price: number): number {
  return price - cost;
}

/**
 * Calculate markup percentage from cost and price
 * Markup = ((Price - Cost) / Cost) * 100
 * Returns 0 if cost is 0 to avoid division by zero
 */
export function calculateMarkup(cost: number, price: number): number {
  if (cost === 0) return 0;
  return ((price - cost) / cost) * 100;
}

/**
 * Apply margin percentage to cost to get price
 * Price = Cost / (1 - MarginPercentage/100)
 *
 * @throws Error if margin percentage is >= 100 (would result in infinite price)
 */
export function applyMarginPercentage(cost: number, marginPercentage: number): number {
  if (marginPercentage >= 100) {
    throw new Error('Margin percentage must be less than 100%');
  }
  if (marginPercentage === 0) return cost;
  return cost / (1 - marginPercentage / 100);
}

/**
 * Apply markup percentage to cost to get price
 * Price = Cost * (1 + MarkupPercentage/100)
 */
export function applyMarkupPercentage(cost: number, markupPercentage: number): number {
  return cost * (1 + markupPercentage / 100);
}

// ============================================================================
// Labor Calculation
// ============================================================================

/**
 * Calculate labor hours and cost from BOM items
 *
 * Labor is calculated based on:
 * - Item-specific hours per category * quantity
 * - Fixed setup hours
 * - Fixed programming hours
 * - Fixed testing hours
 */
export function calculateLabor(items: BOMItem[], config: LaborConfig): LaborResult {
  // Calculate item-based hours
  let itemHours = 0;

  for (const item of items) {
    const hoursPerItem =
      config.hoursPerItem[item.category] ?? config.defaultHoursPerItem ?? 1;
    itemHours += hoursPerItem * item.quantity;
  }

  // Add fixed hours
  const totalHours =
    itemHours + config.setupHours + config.programmingHours + config.testingHours;

  return {
    hours: totalHours,
    cost: totalHours * config.hourlyRate,
  };
}

// ============================================================================
// Tax Calculation
// ============================================================================

/**
 * Calculate tax based on equipment and labor amounts
 *
 * @param equipmentTotal - Equipment price after margin
 * @param laborTotal - Labor cost
 * @param config - Tax configuration
 * @returns Tax amount rounded to 2 decimal places
 */
export function calculateTax(
  equipmentTotal: number,
  laborTotal: number,
  config: TaxConfig
): number {
  let taxableAmount = 0;

  if (config.applyToEquipment) {
    taxableAmount += equipmentTotal;
  }

  if (config.applyToLabor) {
    taxableAmount += laborTotal;
  }

  const tax = taxableAmount * (config.rate / 100);
  return Math.round(tax * 100) / 100;
}

// ============================================================================
// Quote Totals Calculation
// ============================================================================

/**
 * Calculate complete quote totals from BOM items
 *
 * @param items - BOM items to price
 * @param marginPercentage - Desired margin percentage (0-99)
 * @param laborConfig - Labor calculation configuration
 * @param taxConfig - Tax calculation configuration
 * @returns Complete pricing result
 */
export function calculateQuoteTotals(
  items: BOMItem[],
  marginPercentage: number,
  laborConfig: LaborConfig,
  taxConfig: TaxConfig
): PricingResult {
  // Calculate equipment cost (sum of all item costs)
  const equipmentCost = items.reduce((sum, item) => sum + item.totalCost, 0);

  // Apply margin to get equipment price
  const equipmentPrice =
    equipmentCost > 0 ? applyMarginPercentage(equipmentCost, marginPercentage) : 0;

  // Calculate labor
  const labor = calculateLabor(items, laborConfig);

  // Calculate subtotal (equipment price + labor cost)
  const subtotal = equipmentPrice + labor.cost;

  // Calculate tax
  const tax = calculateTax(equipmentPrice, labor.cost, taxConfig);

  // Calculate total
  const total = subtotal + tax;

  // Calculate margin (profit on equipment)
  const margin = equipmentPrice - equipmentCost;

  return {
    equipmentCost,
    equipmentPrice: Math.round(equipmentPrice * 100) / 100,
    laborCost: labor.cost,
    laborHours: labor.hours,
    subtotal: Math.round(subtotal * 100) / 100,
    tax,
    total: Math.round(total * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    marginPercentage,
  };
}
