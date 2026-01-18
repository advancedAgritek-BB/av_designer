/**
 * BOM Generator - Test Suite
 *
 * Tests for generating Bill of Materials from room's placed equipment.
 * Includes grouping by category and quantity aggregation.
 */

import { describe, it, expect } from 'vitest';
import {
  generateBOM,
  groupByCategory,
  aggregateDuplicates,
  createBOMItem,
  type BOMItem,
  type PlacedEquipmentWithDetails,
} from '@/features/quoting/bom-generator';
import type { Equipment } from '@/types/equipment';
import type { PlacedEquipment } from '@/types/room';

// ============================================================================
// Test Data
// ============================================================================

const mockEquipment: Equipment[] = [
  {
    id: 'eq-1',
    manufacturer: 'Sony',
    model: 'BRC-X400',
    sku: 'BRC-X400',
    category: 'video',
    subcategory: 'camera',
    description: '4K PTZ Camera',
    cost: 3000,
    msrp: 4500,
    dimensions: { height: 150, width: 158, depth: 180 },
    weight: 2.1,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'eq-2',
    manufacturer: 'Shure',
    model: 'MXA920',
    sku: 'MXA920-S',
    category: 'audio',
    subcategory: 'microphone',
    description: 'Ceiling Array Microphone',
    cost: 2000,
    msrp: 2999,
    dimensions: { height: 44, width: 610, depth: 610 },
    weight: 2.7,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'eq-3',
    manufacturer: 'Crestron',
    model: 'CP4',
    sku: 'CP4',
    category: 'control',
    subcategory: 'processor',
    description: 'Control System Processor',
    cost: 1500,
    msrp: 2200,
    dimensions: { height: 44, width: 210, depth: 210 },
    weight: 0.9,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  },
];

const mockPlacedEquipment: PlacedEquipment[] = [
  {
    id: 'placed-1',
    equipmentId: 'eq-1',
    x: 100,
    y: 100,
    rotation: 0,
    mountType: 'ceiling',
  },
  {
    id: 'placed-2',
    equipmentId: 'eq-1', // Duplicate equipment
    x: 200,
    y: 100,
    rotation: 0,
    mountType: 'ceiling',
  },
  {
    id: 'placed-3',
    equipmentId: 'eq-2',
    x: 300,
    y: 200,
    rotation: 0,
    mountType: 'ceiling',
  },
  {
    id: 'placed-4',
    equipmentId: 'eq-3',
    x: 400,
    y: 300,
    rotation: 0,
    mountType: 'rack',
  },
];

// ============================================================================
// createBOMItem Tests
// ============================================================================

describe('createBOMItem', () => {
  it('should create BOM item from equipment with quantity 1', () => {
    const item = createBOMItem(mockEquipment[0], 1);

    expect(item.equipmentId).toBe('eq-1');
    expect(item.manufacturer).toBe('Sony');
    expect(item.model).toBe('BRC-X400');
    expect(item.sku).toBe('BRC-X400');
    expect(item.category).toBe('video');
    expect(item.subcategory).toBe('camera');
    expect(item.description).toBe('4K PTZ Camera');
    expect(item.quantity).toBe(1);
    expect(item.unitCost).toBe(3000);
    expect(item.unitMsrp).toBe(4500);
    expect(item.totalCost).toBe(3000);
    expect(item.totalMsrp).toBe(4500);
  });

  it('should calculate totals for quantity > 1', () => {
    const item = createBOMItem(mockEquipment[0], 3);

    expect(item.quantity).toBe(3);
    expect(item.unitCost).toBe(3000);
    expect(item.unitMsrp).toBe(4500);
    expect(item.totalCost).toBe(9000);
    expect(item.totalMsrp).toBe(13500);
  });

  it('should handle zero cost equipment', () => {
    const freeEquipment: Equipment = {
      ...mockEquipment[0],
      cost: 0,
      msrp: 0,
    };
    const item = createBOMItem(freeEquipment, 2);

    expect(item.totalCost).toBe(0);
    expect(item.totalMsrp).toBe(0);
  });
});

// ============================================================================
// aggregateDuplicates Tests
// ============================================================================

describe('aggregateDuplicates', () => {
  it('should aggregate items with same equipment ID', () => {
    const items: PlacedEquipmentWithDetails[] = [
      { placedEquipment: mockPlacedEquipment[0], equipment: mockEquipment[0] },
      { placedEquipment: mockPlacedEquipment[1], equipment: mockEquipment[0] },
    ];

    const result = aggregateDuplicates(items);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(2);
    expect(result[0].equipmentId).toBe('eq-1');
  });

  it('should not aggregate different equipment', () => {
    const items: PlacedEquipmentWithDetails[] = [
      { placedEquipment: mockPlacedEquipment[0], equipment: mockEquipment[0] },
      { placedEquipment: mockPlacedEquipment[2], equipment: mockEquipment[1] },
    ];

    const result = aggregateDuplicates(items);

    expect(result).toHaveLength(2);
    expect(result[0].quantity).toBe(1);
    expect(result[1].quantity).toBe(1);
  });

  it('should return empty array for empty input', () => {
    const result = aggregateDuplicates([]);

    expect(result).toEqual([]);
  });

  it('should handle single item', () => {
    const items: PlacedEquipmentWithDetails[] = [
      { placedEquipment: mockPlacedEquipment[0], equipment: mockEquipment[0] },
    ];

    const result = aggregateDuplicates(items);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(1);
  });

  it('should aggregate multiple duplicates correctly', () => {
    const camera = mockEquipment[0];
    const items: PlacedEquipmentWithDetails[] = [
      { placedEquipment: { ...mockPlacedEquipment[0], id: 'p1' }, equipment: camera },
      { placedEquipment: { ...mockPlacedEquipment[0], id: 'p2' }, equipment: camera },
      { placedEquipment: { ...mockPlacedEquipment[0], id: 'p3' }, equipment: camera },
      { placedEquipment: { ...mockPlacedEquipment[0], id: 'p4' }, equipment: camera },
    ];

    const result = aggregateDuplicates(items);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(4);
    expect(result[0].totalCost).toBe(12000); // 4 * 3000
    expect(result[0].totalMsrp).toBe(18000); // 4 * 4500
  });
});

// ============================================================================
// groupByCategory Tests
// ============================================================================

describe('groupByCategory', () => {
  it('should group BOM items by category', () => {
    const items: BOMItem[] = [
      createBOMItem(mockEquipment[0], 2), // video
      createBOMItem(mockEquipment[1], 1), // audio
      createBOMItem(mockEquipment[2], 1), // control
    ];

    const result = groupByCategory(items);

    expect(result).toHaveProperty('video');
    expect(result).toHaveProperty('audio');
    expect(result).toHaveProperty('control');
    expect(result.video).toHaveLength(1);
    expect(result.audio).toHaveLength(1);
    expect(result.control).toHaveLength(1);
  });

  it('should group multiple items of same category', () => {
    const audioEquipment: Equipment = {
      ...mockEquipment[1],
      id: 'eq-4',
      model: 'Different Mic',
    };
    const items: BOMItem[] = [
      createBOMItem(mockEquipment[1], 1), // audio
      createBOMItem(audioEquipment, 2), // audio
    ];

    const result = groupByCategory(items);

    expect(result).toHaveProperty('audio');
    expect(result.audio).toHaveLength(2);
    expect(result.audio[0].quantity).toBe(1);
    expect(result.audio[1].quantity).toBe(2);
  });

  it('should return empty object for empty input', () => {
    const result = groupByCategory([]);

    expect(result).toEqual({});
  });

  it('should preserve item order within category', () => {
    const items: BOMItem[] = [
      { ...createBOMItem(mockEquipment[0], 1), sku: 'AAA' },
      { ...createBOMItem(mockEquipment[0], 1), sku: 'BBB' },
      { ...createBOMItem(mockEquipment[0], 1), sku: 'CCC' },
    ];

    const result = groupByCategory(items);

    expect(result.video[0].sku).toBe('AAA');
    expect(result.video[1].sku).toBe('BBB');
    expect(result.video[2].sku).toBe('CCC');
  });
});

// ============================================================================
// generateBOM Tests
// ============================================================================

describe('generateBOM', () => {
  it('should generate BOM from placed equipment', () => {
    const result = generateBOM(mockPlacedEquipment, mockEquipment);

    expect(result.items).toBeDefined();
    expect(result.byCategory).toBeDefined();
    expect(result.totals).toBeDefined();
  });

  it('should aggregate duplicate equipment', () => {
    const result = generateBOM(mockPlacedEquipment, mockEquipment);

    // eq-1 is placed twice, should be aggregated
    const cameraItem = result.items.find((i) => i.equipmentId === 'eq-1');
    expect(cameraItem).toBeDefined();
    expect(cameraItem!.quantity).toBe(2);
  });

  it('should group items by category', () => {
    const result = generateBOM(mockPlacedEquipment, mockEquipment);

    expect(result.byCategory).toHaveProperty('video');
    expect(result.byCategory).toHaveProperty('audio');
    expect(result.byCategory).toHaveProperty('control');
  });

  it('should calculate correct totals', () => {
    const result = generateBOM(mockPlacedEquipment, mockEquipment);

    // 2 cameras (3000 each) + 1 mic (2000) + 1 control (1500) = 9500
    expect(result.totals.totalCost).toBe(9500);
    // 2 cameras (4500 each) + 1 mic (2999) + 1 control (2200) = 14199
    expect(result.totals.totalMsrp).toBe(14199);
    expect(result.totals.itemCount).toBe(4);
    expect(result.totals.uniqueItemCount).toBe(3);
  });

  it('should return empty BOM for no placed equipment', () => {
    const result = generateBOM([], mockEquipment);

    expect(result.items).toEqual([]);
    expect(result.byCategory).toEqual({});
    expect(result.totals.totalCost).toBe(0);
    expect(result.totals.totalMsrp).toBe(0);
    expect(result.totals.itemCount).toBe(0);
    expect(result.totals.uniqueItemCount).toBe(0);
  });

  it('should skip placed equipment without matching equipment details', () => {
    const unknownPlacement: PlacedEquipment = {
      id: 'placed-unknown',
      equipmentId: 'eq-unknown',
      x: 0,
      y: 0,
      rotation: 0,
      mountType: 'floor',
    };

    const result = generateBOM([unknownPlacement], mockEquipment);

    expect(result.items).toEqual([]);
    expect(result.totals.itemCount).toBe(0);
  });

  it('should handle mixed valid and invalid placements', () => {
    const placementsWithUnknown: PlacedEquipment[] = [
      mockPlacedEquipment[0], // Valid
      {
        id: 'placed-unknown',
        equipmentId: 'eq-unknown',
        x: 0,
        y: 0,
        rotation: 0,
        mountType: 'floor',
      }, // Invalid
    ];

    const result = generateBOM(placementsWithUnknown, mockEquipment);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].equipmentId).toBe('eq-1');
    expect(result.totals.itemCount).toBe(1);
  });

  it('should sort items by category then manufacturer then model', () => {
    // Create equipment in unsorted order
    const equipment: Equipment[] = [
      { ...mockEquipment[0], id: 'c1', category: 'control', manufacturer: 'Crestron', model: 'ZZZ' },
      { ...mockEquipment[0], id: 'a1', category: 'audio', manufacturer: 'Shure', model: 'AAA' },
      { ...mockEquipment[0], id: 'v1', category: 'video', manufacturer: 'Sony', model: 'BBB' },
      { ...mockEquipment[0], id: 'a2', category: 'audio', manufacturer: 'Biamp', model: 'CCC' },
    ];

    const placements: PlacedEquipment[] = equipment.map((eq, i) => ({
      id: `p${i}`,
      equipmentId: eq.id,
      x: i * 100,
      y: 0,
      rotation: 0,
      mountType: 'floor',
    }));

    const result = generateBOM(placements, equipment);

    // Should be sorted by category (audio, control, video) then manufacturer
    expect(result.items[0].category).toBe('audio');
    expect(result.items[0].manufacturer).toBe('Biamp'); // B comes before S
    expect(result.items[1].category).toBe('audio');
    expect(result.items[1].manufacturer).toBe('Shure');
    expect(result.items[2].category).toBe('control');
    expect(result.items[3].category).toBe('video');
  });
});

// ============================================================================
// BOMItem Interface Tests
// ============================================================================

describe('BOMItem Interface', () => {
  it('should have all required properties', () => {
    const item = createBOMItem(mockEquipment[0], 1);

    // Required properties
    expect(item).toHaveProperty('equipmentId');
    expect(item).toHaveProperty('manufacturer');
    expect(item).toHaveProperty('model');
    expect(item).toHaveProperty('sku');
    expect(item).toHaveProperty('category');
    expect(item).toHaveProperty('subcategory');
    expect(item).toHaveProperty('description');
    expect(item).toHaveProperty('quantity');
    expect(item).toHaveProperty('unitCost');
    expect(item).toHaveProperty('unitMsrp');
    expect(item).toHaveProperty('totalCost');
    expect(item).toHaveProperty('totalMsrp');
  });

  it('should have correct types for all properties', () => {
    const item = createBOMItem(mockEquipment[0], 1);

    expect(typeof item.equipmentId).toBe('string');
    expect(typeof item.manufacturer).toBe('string');
    expect(typeof item.model).toBe('string');
    expect(typeof item.sku).toBe('string');
    expect(typeof item.category).toBe('string');
    expect(typeof item.subcategory).toBe('string');
    expect(typeof item.description).toBe('string');
    expect(typeof item.quantity).toBe('number');
    expect(typeof item.unitCost).toBe('number');
    expect(typeof item.unitMsrp).toBe('number');
    expect(typeof item.totalCost).toBe('number');
    expect(typeof item.totalMsrp).toBe('number');
  });
});
