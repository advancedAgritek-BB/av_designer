/**
 * Pricing Engine - Test Suite
 *
 * Tests for pricing calculations including margin, markup,
 * labor estimation, and tax calculations.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMargin,
  calculateMarkup,
  applyMarginPercentage,
  applyMarkupPercentage,
  calculateLabor,
  calculateTax,
  calculateQuoteTotals,
  type LaborConfig,
  type TaxConfig,
  type PricingResult as _PricingResult,
} from '@/features/quoting/pricing-engine';
import type { BOMItem } from '@/features/quoting/bom-generator';

// ============================================================================
// Test Data
// ============================================================================

const mockBOMItems: BOMItem[] = [
  {
    equipmentId: 'eq-1',
    manufacturer: 'Sony',
    model: 'BRC-X400',
    sku: 'BRC-X400',
    category: 'video',
    subcategory: 'camera',
    description: 'PTZ Camera',
    quantity: 2,
    unitCost: 3000,
    unitMsrp: 4500,
    totalCost: 6000,
    totalMsrp: 9000,
  },
  {
    equipmentId: 'eq-2',
    manufacturer: 'Shure',
    model: 'MXA920',
    sku: 'MXA920-S',
    category: 'audio',
    subcategory: 'microphone',
    description: 'Ceiling Mic',
    quantity: 1,
    unitCost: 2000,
    unitMsrp: 2999,
    totalCost: 2000,
    totalMsrp: 2999,
  },
  {
    equipmentId: 'eq-3',
    manufacturer: 'Crestron',
    model: 'CP4',
    sku: 'CP4',
    category: 'control',
    subcategory: 'processor',
    description: 'Control Processor',
    quantity: 1,
    unitCost: 1500,
    unitMsrp: 2200,
    totalCost: 1500,
    totalMsrp: 2200,
  },
];

// ============================================================================
// Margin and Markup Calculations
// ============================================================================

describe('calculateMargin', () => {
  it('should calculate margin from cost and price', () => {
    expect(calculateMargin(100, 150)).toBe(50);
  });

  it('should return 0 when price equals cost', () => {
    expect(calculateMargin(100, 100)).toBe(0);
  });

  it('should return negative margin when selling below cost', () => {
    expect(calculateMargin(100, 80)).toBe(-20);
  });

  it('should handle zero cost', () => {
    expect(calculateMargin(0, 50)).toBe(50);
  });

  it('should handle zero price', () => {
    expect(calculateMargin(100, 0)).toBe(-100);
  });
});

describe('calculateMarkup', () => {
  it('should calculate markup percentage from cost and price', () => {
    // Price 150, Cost 100 => markup is 50%
    expect(calculateMarkup(100, 150)).toBe(50);
  });

  it('should return 0 when price equals cost', () => {
    expect(calculateMarkup(100, 100)).toBe(0);
  });

  it('should handle 100% markup', () => {
    // Cost 100, Price 200 => 100% markup
    expect(calculateMarkup(100, 200)).toBe(100);
  });

  it('should handle zero cost (returns 0 to avoid division by zero)', () => {
    expect(calculateMarkup(0, 100)).toBe(0);
  });

  it('should return negative markup when selling below cost', () => {
    expect(calculateMarkup(100, 80)).toBe(-20);
  });
});

describe('applyMarginPercentage', () => {
  it('should apply margin percentage to cost', () => {
    // 25% margin means price = cost / (1 - 0.25) = cost / 0.75
    // Cost 100, 25% margin => price = 133.33
    const result = applyMarginPercentage(100, 25);
    expect(result).toBeCloseTo(133.33, 1);
  });

  it('should handle 0% margin (price equals cost)', () => {
    expect(applyMarginPercentage(100, 0)).toBe(100);
  });

  it('should handle 50% margin', () => {
    // Cost 100, 50% margin => price = 200
    expect(applyMarginPercentage(100, 50)).toBe(200);
  });

  it('should throw for 100% margin (infinite price)', () => {
    expect(() => applyMarginPercentage(100, 100)).toThrow();
  });

  it('should throw for margin > 100%', () => {
    expect(() => applyMarginPercentage(100, 110)).toThrow();
  });
});

describe('applyMarkupPercentage', () => {
  it('should apply markup percentage to cost', () => {
    // 50% markup means price = cost * 1.5
    expect(applyMarkupPercentage(100, 50)).toBe(150);
  });

  it('should handle 0% markup (price equals cost)', () => {
    expect(applyMarkupPercentage(100, 0)).toBe(100);
  });

  it('should handle 100% markup', () => {
    expect(applyMarkupPercentage(100, 100)).toBe(200);
  });

  it('should handle negative markup (selling below cost)', () => {
    expect(applyMarkupPercentage(100, -20)).toBe(80);
  });

  it('should handle zero cost', () => {
    expect(applyMarkupPercentage(0, 50)).toBe(0);
  });
});

// ============================================================================
// Labor Calculation
// ============================================================================

describe('calculateLabor', () => {
  const defaultConfig: LaborConfig = {
    hourlyRate: 150,
    hoursPerItem: {
      video: 2,
      audio: 1.5,
      control: 3,
      infrastructure: 1,
    },
    setupHours: 4,
    programmingHours: 8,
    testingHours: 2,
  };

  it('should calculate labor based on item counts', () => {
    const result = calculateLabor(mockBOMItems, defaultConfig);

    // video: 2 items * 2 hours = 4 hours
    // audio: 1 item * 1.5 hours = 1.5 hours
    // control: 1 item * 3 hours = 3 hours
    // setup: 4, programming: 8, testing: 2
    // Total: 4 + 1.5 + 3 + 4 + 8 + 2 = 22.5 hours
    // Cost: 22.5 * 150 = 3375
    expect(result.hours).toBeCloseTo(22.5, 1);
    expect(result.cost).toBe(3375);
  });

  it('should handle empty item list', () => {
    const result = calculateLabor([], defaultConfig);

    // Only fixed hours: setup + programming + testing = 14
    expect(result.hours).toBe(14);
    expect(result.cost).toBe(2100);
  });

  it('should use default hours for unknown categories', () => {
    const itemWithUnknownCategory: BOMItem = {
      ...mockBOMItems[0],
      category: 'unknown' as never,
      quantity: 1,
    };

    const config: LaborConfig = {
      ...defaultConfig,
      defaultHoursPerItem: 1,
    };

    const result = calculateLabor([itemWithUnknownCategory], config);

    // 1 item * 1 default hour + fixed hours
    expect(result.hours).toBe(15);
  });

  it('should scale with quantity', () => {
    const singleItem: BOMItem = { ...mockBOMItems[0], quantity: 1, totalCost: 3000 };
    const doubleItem: BOMItem = { ...mockBOMItems[0], quantity: 2, totalCost: 6000 };

    const singleResult = calculateLabor([singleItem], defaultConfig);
    const doubleResult = calculateLabor([doubleItem], defaultConfig);

    // Double quantity should add one more video item's hours
    expect(doubleResult.hours - singleResult.hours).toBe(2);
  });

  it('should handle custom hourly rate', () => {
    const config: LaborConfig = { ...defaultConfig, hourlyRate: 200 };
    const result = calculateLabor(mockBOMItems, config);

    expect(result.cost).toBe(result.hours * 200);
  });
});

// ============================================================================
// Tax Calculation
// ============================================================================

describe('calculateTax', () => {
  it('should calculate tax on equipment', () => {
    const config: TaxConfig = { rate: 8.5, applyToEquipment: true, applyToLabor: false };
    const result = calculateTax(10000, 5000, config);

    // 8.5% of 10000 = 850
    expect(result).toBe(850);
  });

  it('should calculate tax on labor', () => {
    const config: TaxConfig = { rate: 8.5, applyToEquipment: false, applyToLabor: true };
    const result = calculateTax(10000, 5000, config);

    // 8.5% of 5000 = 425
    expect(result).toBe(425);
  });

  it('should calculate tax on both equipment and labor', () => {
    const config: TaxConfig = { rate: 8.5, applyToEquipment: true, applyToLabor: true };
    const result = calculateTax(10000, 5000, config);

    // 8.5% of 15000 = 1275
    expect(result).toBe(1275);
  });

  it('should return 0 when nothing is taxable', () => {
    const config: TaxConfig = { rate: 8.5, applyToEquipment: false, applyToLabor: false };
    const result = calculateTax(10000, 5000, config);

    expect(result).toBe(0);
  });

  it('should handle 0% tax rate', () => {
    const config: TaxConfig = { rate: 0, applyToEquipment: true, applyToLabor: true };
    const result = calculateTax(10000, 5000, config);

    expect(result).toBe(0);
  });

  it('should round to two decimal places', () => {
    const config: TaxConfig = { rate: 7.25, applyToEquipment: true, applyToLabor: false };
    const result = calculateTax(9999, 0, config);

    // 7.25% of 9999 = 724.9275, should round to 724.93
    expect(result).toBe(724.93);
  });
});

// ============================================================================
// Quote Totals Calculation
// ============================================================================

describe('calculateQuoteTotals', () => {
  const laborConfig: LaborConfig = {
    hourlyRate: 150,
    hoursPerItem: {
      video: 2,
      audio: 1.5,
      control: 3,
      infrastructure: 1,
    },
    setupHours: 4,
    programmingHours: 8,
    testingHours: 2,
  };

  const taxConfig: TaxConfig = {
    rate: 8.5,
    applyToEquipment: true,
    applyToLabor: false,
  };

  it('should calculate complete quote totals', () => {
    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    expect(result.equipmentCost).toBeDefined();
    expect(result.equipmentPrice).toBeDefined();
    expect(result.laborCost).toBeDefined();
    expect(result.laborHours).toBeDefined();
    expect(result.subtotal).toBeDefined();
    expect(result.tax).toBeDefined();
    expect(result.total).toBeDefined();
    expect(result.margin).toBeDefined();
    expect(result.marginPercentage).toBeDefined();
  });

  it('should calculate equipment price with margin', () => {
    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    // Total equipment cost: 6000 + 2000 + 1500 = 9500
    expect(result.equipmentCost).toBe(9500);

    // With 25% margin: 9500 / 0.75 = 12666.67
    expect(result.equipmentPrice).toBeCloseTo(12666.67, 1);
  });

  it('should include labor in totals', () => {
    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    // Labor cost should be calculated
    expect(result.laborCost).toBeGreaterThan(0);
    expect(result.laborHours).toBeGreaterThan(0);
  });

  it('should calculate tax correctly', () => {
    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    // Tax is applied to equipment price only (per config)
    const expectedTax = Math.round(result.equipmentPrice * 0.085 * 100) / 100;
    expect(result.tax).toBe(expectedTax);
  });

  it('should calculate total as sum of components plus tax', () => {
    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    const expectedTotal = result.subtotal + result.tax;
    expect(result.total).toBeCloseTo(expectedTotal, 2);
  });

  it('should calculate margin correctly', () => {
    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    // Margin = price - cost (for equipment)
    const expectedMargin = result.equipmentPrice - result.equipmentCost;
    expect(result.margin).toBeCloseTo(expectedMargin, 2);
  });

  it('should handle empty BOM', () => {
    const result = calculateQuoteTotals([], 25, laborConfig, taxConfig);

    expect(result.equipmentCost).toBe(0);
    expect(result.equipmentPrice).toBe(0);
    // Labor should still have fixed hours
    expect(result.laborHours).toBe(14);
  });

  it('should handle 0% margin', () => {
    const result = calculateQuoteTotals(mockBOMItems, 0, laborConfig, taxConfig);

    expect(result.equipmentPrice).toBe(result.equipmentCost);
    expect(result.margin).toBe(0);
    expect(result.marginPercentage).toBe(0);
  });

  it('should return correct margin percentage', () => {
    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    expect(result.marginPercentage).toBe(25);
  });
});

// ============================================================================
// PricingResult Interface Tests
// ============================================================================

describe('PricingResult Interface', () => {
  it('should have all required properties', () => {
    const laborConfig: LaborConfig = {
      hourlyRate: 150,
      hoursPerItem: { video: 2, audio: 1.5, control: 3, infrastructure: 1 },
      setupHours: 4,
      programmingHours: 8,
      testingHours: 2,
    };

    const taxConfig: TaxConfig = {
      rate: 8.5,
      applyToEquipment: true,
      applyToLabor: false,
    };

    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    // Check all required properties exist
    expect(result).toHaveProperty('equipmentCost');
    expect(result).toHaveProperty('equipmentPrice');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('laborHours');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('tax');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('margin');
    expect(result).toHaveProperty('marginPercentage');
  });

  it('should have correct types for all properties', () => {
    const laborConfig: LaborConfig = {
      hourlyRate: 150,
      hoursPerItem: { video: 2, audio: 1.5, control: 3, infrastructure: 1 },
      setupHours: 4,
      programmingHours: 8,
      testingHours: 2,
    };

    const taxConfig: TaxConfig = {
      rate: 8.5,
      applyToEquipment: true,
      applyToLabor: false,
    };

    const result = calculateQuoteTotals(mockBOMItems, 25, laborConfig, taxConfig);

    expect(typeof result.equipmentCost).toBe('number');
    expect(typeof result.equipmentPrice).toBe('number');
    expect(typeof result.laborCost).toBe('number');
    expect(typeof result.laborHours).toBe('number');
    expect(typeof result.subtotal).toBe('number');
    expect(typeof result.tax).toBe('number');
    expect(typeof result.total).toBe('number');
    expect(typeof result.margin).toBe('number');
    expect(typeof result.marginPercentage).toBe('number');
  });
});
