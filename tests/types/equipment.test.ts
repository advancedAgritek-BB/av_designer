import { describe, it, expect } from 'vitest';
import type {
  Equipment,
  EquipmentCategory,
  EquipmentFormData,
  Dimensions,
  ElectricalSpecs,
} from '@/types/equipment';
import {
  isValidEquipment,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_SUBCATEGORIES,
} from '@/types/equipment';

describe('Equipment Types', () => {
  describe('EQUIPMENT_CATEGORIES', () => {
    it('includes video category', () => {
      expect(EQUIPMENT_CATEGORIES).toContain('video');
    });

    it('includes audio category', () => {
      expect(EQUIPMENT_CATEGORIES).toContain('audio');
    });

    it('includes control category', () => {
      expect(EQUIPMENT_CATEGORIES).toContain('control');
    });

    it('includes infrastructure category', () => {
      expect(EQUIPMENT_CATEGORIES).toContain('infrastructure');
    });

    it('has exactly 4 categories', () => {
      expect(EQUIPMENT_CATEGORIES).toHaveLength(4);
    });
  });

  describe('EQUIPMENT_SUBCATEGORIES', () => {
    it('has subcategories for video', () => {
      expect(EQUIPMENT_SUBCATEGORIES.video).toContain('displays');
      expect(EQUIPMENT_SUBCATEGORIES.video).toContain('cameras');
      expect(EQUIPMENT_SUBCATEGORIES.video).toContain('codecs');
      expect(EQUIPMENT_SUBCATEGORIES.video).toContain('switchers');
      expect(EQUIPMENT_SUBCATEGORIES.video).toContain('extenders');
    });

    it('has subcategories for audio', () => {
      expect(EQUIPMENT_SUBCATEGORIES.audio).toContain('microphones');
      expect(EQUIPMENT_SUBCATEGORIES.audio).toContain('speakers');
      expect(EQUIPMENT_SUBCATEGORIES.audio).toContain('dsp');
      expect(EQUIPMENT_SUBCATEGORIES.audio).toContain('amplifiers');
      expect(EQUIPMENT_SUBCATEGORIES.audio).toContain('mixers');
    });

    it('has subcategories for control', () => {
      expect(EQUIPMENT_SUBCATEGORIES.control).toContain('processors');
      expect(EQUIPMENT_SUBCATEGORIES.control).toContain('touch-panels');
      expect(EQUIPMENT_SUBCATEGORIES.control).toContain('keypads');
      expect(EQUIPMENT_SUBCATEGORIES.control).toContain('interfaces');
    });

    it('has subcategories for infrastructure', () => {
      expect(EQUIPMENT_SUBCATEGORIES.infrastructure).toContain('racks');
      expect(EQUIPMENT_SUBCATEGORIES.infrastructure).toContain('mounts');
      expect(EQUIPMENT_SUBCATEGORIES.infrastructure).toContain('cables');
      expect(EQUIPMENT_SUBCATEGORIES.infrastructure).toContain('connectors');
      expect(EQUIPMENT_SUBCATEGORIES.infrastructure).toContain('power');
    });
  });

  describe('isValidEquipment', () => {
    const validEquipment: Equipment = {
      id: '1',
      manufacturer: 'Shure',
      model: 'MXA920',
      sku: 'MXA920-S',
      category: 'audio',
      subcategory: 'microphones',
      description: 'Ceiling array microphone',
      cost: 2847,
      msrp: 3500,
      dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
      weight: 6.2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('returns true for valid equipment', () => {
      expect(isValidEquipment(validEquipment)).toBe(true);
    });

    it('returns true for equipment with optional fields', () => {
      const equipmentWithOptional: Equipment = {
        ...validEquipment,
        electrical: {
          voltage: 120,
          wattage: 15,
          poeClass: 'Class 3',
        },
        platformCertifications: ['teams', 'zoom'],
        imageUrl: 'https://example.com/image.png',
        specSheetUrl: 'https://example.com/spec.pdf',
      };
      expect(isValidEquipment(equipmentWithOptional)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidEquipment(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidEquipment(undefined)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isValidEquipment('string')).toBe(false);
      expect(isValidEquipment(123)).toBe(false);
      expect(isValidEquipment([])).toBe(false);
    });

    it('returns false when id is missing', () => {
      const { id: _id, ...withoutId } = validEquipment;
      expect(isValidEquipment(withoutId)).toBe(false);
    });

    it('returns false when manufacturer is missing', () => {
      const { manufacturer: _manufacturer, ...withoutManufacturer } = validEquipment;
      expect(isValidEquipment(withoutManufacturer)).toBe(false);
    });

    it('returns false when model is missing', () => {
      const { model: _model, ...withoutModel } = validEquipment;
      expect(isValidEquipment(withoutModel)).toBe(false);
    });

    it('returns false when sku is missing', () => {
      const { sku: _sku, ...withoutSku } = validEquipment;
      expect(isValidEquipment(withoutSku)).toBe(false);
    });

    it('returns false when category is invalid', () => {
      const invalidCategory = { ...validEquipment, category: 'invalid' };
      expect(isValidEquipment(invalidCategory)).toBe(false);
    });

    it('returns false when subcategory is missing', () => {
      const { subcategory: _subcategory, ...withoutSubcategory } = validEquipment;
      expect(isValidEquipment(withoutSubcategory)).toBe(false);
    });

    it('returns false when cost is not a number', () => {
      const invalidCost = { ...validEquipment, cost: 'expensive' };
      expect(isValidEquipment(invalidCost)).toBe(false);
    });

    it('returns false when msrp is not a number', () => {
      const invalidMsrp = { ...validEquipment, msrp: 'high' };
      expect(isValidEquipment(invalidMsrp)).toBe(false);
    });

    it('returns false when dimensions is missing', () => {
      const { dimensions: _dimensions, ...withoutDimensions } = validEquipment;
      expect(isValidEquipment(withoutDimensions)).toBe(false);
    });

    it('returns false when dimensions.height is not a number', () => {
      const invalidDimensions = {
        ...validEquipment,
        dimensions: { height: 'tall', width: 23.5, depth: 23.5 },
      };
      expect(isValidEquipment(invalidDimensions)).toBe(false);
    });

    it('returns false when dimensions.width is not a number', () => {
      const invalidDimensions = {
        ...validEquipment,
        dimensions: { height: 2.5, width: 'wide', depth: 23.5 },
      };
      expect(isValidEquipment(invalidDimensions)).toBe(false);
    });

    it('returns false when dimensions.depth is not a number', () => {
      const invalidDimensions = {
        ...validEquipment,
        dimensions: { height: 2.5, width: 23.5, depth: 'deep' },
      };
      expect(isValidEquipment(invalidDimensions)).toBe(false);
    });

    it('returns false when weight is not a number', () => {
      const invalidWeight = { ...validEquipment, weight: 'heavy' };
      expect(isValidEquipment(invalidWeight)).toBe(false);
    });
  });

  describe('Type compilation checks', () => {
    it('Equipment type compiles with required fields', () => {
      const equipment: Equipment = {
        id: '1',
        manufacturer: 'Poly',
        model: 'Studio X50',
        sku: 'STUDIO-X50',
        category: 'video',
        subcategory: 'codecs',
        description: 'All-in-one video bar',
        cost: 3499,
        msrp: 4599,
        dimensions: { height: 3.5, width: 24, depth: 4.5 },
        weight: 8.5,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(equipment.id).toBe('1');
    });

    it('EquipmentCategory type accepts valid categories', () => {
      const videoCategory: EquipmentCategory = 'video';
      const audioCategory: EquipmentCategory = 'audio';
      const controlCategory: EquipmentCategory = 'control';
      const infraCategory: EquipmentCategory = 'infrastructure';
      expect(videoCategory).toBe('video');
      expect(audioCategory).toBe('audio');
      expect(controlCategory).toBe('control');
      expect(infraCategory).toBe('infrastructure');
    });

    it('Dimensions type has required fields', () => {
      const dims: Dimensions = { height: 10, width: 20, depth: 5 };
      expect(dims.height).toBe(10);
      expect(dims.width).toBe(20);
      expect(dims.depth).toBe(5);
    });

    it('ElectricalSpecs type has optional fields', () => {
      const specs: ElectricalSpecs = {
        voltage: 120,
        wattage: 50,
      };
      expect(specs.voltage).toBe(120);
      expect(specs.wattage).toBe(50);
      expect(specs.amperage).toBeUndefined();
    });

    it('EquipmentFormData omits id and timestamps', () => {
      const formData: EquipmentFormData = {
        manufacturer: 'QSC',
        model: 'Core 110f',
        sku: 'CORE110F',
        category: 'audio',
        subcategory: 'dsp',
        description: 'Audio DSP processor',
        cost: 2500,
        msrp: 3200,
        dimensions: { height: 1.75, width: 17, depth: 12 },
        weight: 5.2,
      };
      expect(formData.manufacturer).toBe('QSC');
      // @ts-expect-error - id should not exist on EquipmentFormData
      expect(formData.id).toBeUndefined();
    });
  });
});
