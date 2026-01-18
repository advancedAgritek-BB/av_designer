/**
 * Drawing Type Definitions - Test Suite
 *
 * Tests for drawing types, constants, and validation functions
 * used by the Drawing Generation feature.
 */

import { describe, it, expect } from 'vitest';
import {
  DRAWING_TYPES,
  LAYER_TYPES,
  ELEMENT_TYPES,
  isValidDrawing,
  isValidDrawingLayer,
  isValidDrawingElement,
  isValidDrawingOverride,
  createDefaultDrawing,
  createDefaultDrawingLayer,
  createDefaultDrawingElement,
  type Drawing,
  type DrawingLayer,
  type DrawingElement,
  type DrawingOverride,
  type DrawingType,
  type LayerType,
  type ElementType,
} from '@/types/drawing';

// ============================================================================
// Constants Tests
// ============================================================================

describe('Drawing Type Constants', () => {
  describe('DRAWING_TYPES', () => {
    it('should contain all expected drawing types', () => {
      expect(DRAWING_TYPES).toContain('electrical');
      expect(DRAWING_TYPES).toContain('elevation');
      expect(DRAWING_TYPES).toContain('rcp');
      expect(DRAWING_TYPES).toContain('rack');
      expect(DRAWING_TYPES).toContain('cable_schedule');
      expect(DRAWING_TYPES).toContain('floor_plan');
    });

    it('should have exactly 6 drawing types', () => {
      expect(DRAWING_TYPES.length).toBe(6);
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(DRAWING_TYPES)).toBe(true);
      expect(Object.isFrozen(DRAWING_TYPES)).toBe(true);
    });
  });

  describe('LAYER_TYPES', () => {
    it('should contain all expected layer types', () => {
      expect(LAYER_TYPES).toContain('title_block');
      expect(LAYER_TYPES).toContain('architectural');
      expect(LAYER_TYPES).toContain('av_elements');
      expect(LAYER_TYPES).toContain('annotations');
      expect(LAYER_TYPES).toContain('dimensions');
    });

    it('should have exactly 5 layer types', () => {
      expect(LAYER_TYPES.length).toBe(5);
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(LAYER_TYPES)).toBe(true);
      expect(Object.isFrozen(LAYER_TYPES)).toBe(true);
    });
  });

  describe('ELEMENT_TYPES', () => {
    it('should contain all expected element types', () => {
      expect(ELEMENT_TYPES).toContain('equipment');
      expect(ELEMENT_TYPES).toContain('cable');
      expect(ELEMENT_TYPES).toContain('text');
      expect(ELEMENT_TYPES).toContain('dimension');
      expect(ELEMENT_TYPES).toContain('symbol');
    });

    it('should have exactly 5 element types', () => {
      expect(ELEMENT_TYPES.length).toBe(5);
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(ELEMENT_TYPES)).toBe(true);
      expect(Object.isFrozen(ELEMENT_TYPES)).toBe(true);
    });
  });
});

// ============================================================================
// Type Tests (Compile-time, demonstrated via valid usage)
// ============================================================================

describe('Drawing Types - Type Safety', () => {
  it('should allow valid DrawingType values', () => {
    const drawingType: DrawingType = 'electrical';
    expect(drawingType).toBe('electrical');
  });

  it('should allow valid LayerType values', () => {
    const layerType: LayerType = 'av_elements';
    expect(layerType).toBe('av_elements');
  });

  it('should allow valid ElementType values', () => {
    const elementType: ElementType = 'equipment';
    expect(elementType).toBe('equipment');
  });
});

// ============================================================================
// DrawingElement Validation Tests
// ============================================================================

describe('isValidDrawingElement', () => {
  const validElement: DrawingElement = {
    id: 'elem-1',
    type: 'equipment',
    x: 100,
    y: 200,
    rotation: 0,
    properties: { equipmentId: 'equip-123' },
  };

  it('should return true for valid drawing element', () => {
    expect(isValidDrawingElement(validElement)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidDrawingElement(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidDrawingElement(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidDrawingElement('string')).toBe(false);
    expect(isValidDrawingElement(123)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isValidDrawingElement([validElement])).toBe(false);
  });

  it('should return false for missing id', () => {
    const { id: _, ...rest } = validElement;
    expect(isValidDrawingElement(rest)).toBe(false);
  });

  it('should return false for empty id', () => {
    expect(isValidDrawingElement({ ...validElement, id: '' })).toBe(false);
  });

  it('should return false for missing type', () => {
    const { type: _, ...rest } = validElement;
    expect(isValidDrawingElement(rest)).toBe(false);
  });

  it('should return false for invalid type', () => {
    expect(isValidDrawingElement({ ...validElement, type: 'invalid' })).toBe(false);
  });

  it('should return false for missing x', () => {
    const { x: _, ...rest } = validElement;
    expect(isValidDrawingElement(rest)).toBe(false);
  });

  it('should return false for non-number x', () => {
    expect(isValidDrawingElement({ ...validElement, x: '100' })).toBe(false);
  });

  it('should return false for missing y', () => {
    const { y: _, ...rest } = validElement;
    expect(isValidDrawingElement(rest)).toBe(false);
  });

  it('should return false for non-number y', () => {
    expect(isValidDrawingElement({ ...validElement, y: '200' })).toBe(false);
  });

  it('should return false for missing rotation', () => {
    const { rotation: _, ...rest } = validElement;
    expect(isValidDrawingElement(rest)).toBe(false);
  });

  it('should return false for non-number rotation', () => {
    expect(isValidDrawingElement({ ...validElement, rotation: '0' })).toBe(false);
  });

  it('should return false for missing properties', () => {
    const { properties: _, ...rest } = validElement;
    expect(isValidDrawingElement(rest)).toBe(false);
  });

  it('should return false for non-object properties', () => {
    expect(isValidDrawingElement({ ...validElement, properties: 'invalid' })).toBe(false);
    expect(isValidDrawingElement({ ...validElement, properties: null })).toBe(false);
  });

  it('should allow negative x and y coordinates', () => {
    expect(isValidDrawingElement({ ...validElement, x: -50, y: -100 })).toBe(true);
  });

  it('should allow rotation values 0-359', () => {
    expect(isValidDrawingElement({ ...validElement, rotation: 0 })).toBe(true);
    expect(isValidDrawingElement({ ...validElement, rotation: 90 })).toBe(true);
    expect(isValidDrawingElement({ ...validElement, rotation: 359 })).toBe(true);
  });

  it('should allow empty properties object', () => {
    expect(isValidDrawingElement({ ...validElement, properties: {} })).toBe(true);
  });
});

// ============================================================================
// DrawingLayer Validation Tests
// ============================================================================

describe('isValidDrawingLayer', () => {
  const validElement: DrawingElement = {
    id: 'elem-1',
    type: 'equipment',
    x: 100,
    y: 200,
    rotation: 0,
    properties: {},
  };

  const validLayer: DrawingLayer = {
    id: 'layer-1',
    name: 'AV Elements',
    type: 'av_elements',
    isLocked: false,
    isVisible: true,
    elements: [validElement],
  };

  it('should return true for valid drawing layer', () => {
    expect(isValidDrawingLayer(validLayer)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidDrawingLayer(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidDrawingLayer(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidDrawingLayer('string')).toBe(false);
    expect(isValidDrawingLayer(123)).toBe(false);
  });

  it('should return false for missing id', () => {
    const { id: _, ...rest } = validLayer;
    expect(isValidDrawingLayer(rest)).toBe(false);
  });

  it('should return false for empty id', () => {
    expect(isValidDrawingLayer({ ...validLayer, id: '' })).toBe(false);
  });

  it('should return false for missing name', () => {
    const { name: _, ...rest } = validLayer;
    expect(isValidDrawingLayer(rest)).toBe(false);
  });

  it('should return false for empty name', () => {
    expect(isValidDrawingLayer({ ...validLayer, name: '' })).toBe(false);
  });

  it('should return false for missing type', () => {
    const { type: _, ...rest } = validLayer;
    expect(isValidDrawingLayer(rest)).toBe(false);
  });

  it('should return false for invalid type', () => {
    expect(isValidDrawingLayer({ ...validLayer, type: 'invalid' })).toBe(false);
  });

  it('should return false for missing isLocked', () => {
    const { isLocked: _, ...rest } = validLayer;
    expect(isValidDrawingLayer(rest)).toBe(false);
  });

  it('should return false for non-boolean isLocked', () => {
    expect(isValidDrawingLayer({ ...validLayer, isLocked: 'false' })).toBe(false);
    expect(isValidDrawingLayer({ ...validLayer, isLocked: 0 })).toBe(false);
  });

  it('should return false for missing isVisible', () => {
    const { isVisible: _, ...rest } = validLayer;
    expect(isValidDrawingLayer(rest)).toBe(false);
  });

  it('should return false for non-boolean isVisible', () => {
    expect(isValidDrawingLayer({ ...validLayer, isVisible: 'true' })).toBe(false);
    expect(isValidDrawingLayer({ ...validLayer, isVisible: 1 })).toBe(false);
  });

  it('should return false for missing elements', () => {
    const { elements: _, ...rest } = validLayer;
    expect(isValidDrawingLayer(rest)).toBe(false);
  });

  it('should return false for non-array elements', () => {
    expect(isValidDrawingLayer({ ...validLayer, elements: 'invalid' })).toBe(false);
    expect(isValidDrawingLayer({ ...validLayer, elements: {} })).toBe(false);
  });

  it('should allow empty elements array', () => {
    expect(isValidDrawingLayer({ ...validLayer, elements: [] })).toBe(true);
  });

  it('should return false for invalid element in elements array', () => {
    const invalidElement = { id: '', type: 'invalid' };
    expect(isValidDrawingLayer({ ...validLayer, elements: [invalidElement] })).toBe(false);
  });

  it('should return true for layer with multiple valid elements', () => {
    const element2: DrawingElement = {
      id: 'elem-2',
      type: 'text',
      x: 50,
      y: 50,
      rotation: 0,
      properties: { content: 'Label' },
    };
    expect(isValidDrawingLayer({ ...validLayer, elements: [validElement, element2] })).toBe(true);
  });
});

// ============================================================================
// DrawingOverride Validation Tests
// ============================================================================

describe('isValidDrawingOverride', () => {
  const validOverride: DrawingOverride = {
    elementId: 'elem-1',
    field: 'x',
    originalValue: 100,
    newValue: 150,
    createdAt: '2026-01-18T00:00:00Z',
  };

  it('should return true for valid drawing override', () => {
    expect(isValidDrawingOverride(validOverride)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidDrawingOverride(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidDrawingOverride(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidDrawingOverride('string')).toBe(false);
    expect(isValidDrawingOverride(123)).toBe(false);
  });

  it('should return false for missing elementId', () => {
    const { elementId: _, ...rest } = validOverride;
    expect(isValidDrawingOverride(rest)).toBe(false);
  });

  it('should return false for empty elementId', () => {
    expect(isValidDrawingOverride({ ...validOverride, elementId: '' })).toBe(false);
  });

  it('should return false for missing field', () => {
    const { field: _, ...rest } = validOverride;
    expect(isValidDrawingOverride(rest)).toBe(false);
  });

  it('should return false for empty field', () => {
    expect(isValidDrawingOverride({ ...validOverride, field: '' })).toBe(false);
  });

  it('should return false for missing createdAt', () => {
    const { createdAt: _, ...rest } = validOverride;
    expect(isValidDrawingOverride(rest)).toBe(false);
  });

  it('should return false for empty createdAt', () => {
    expect(isValidDrawingOverride({ ...validOverride, createdAt: '' })).toBe(false);
  });

  it('should allow null originalValue', () => {
    expect(isValidDrawingOverride({ ...validOverride, originalValue: null })).toBe(true);
  });

  it('should allow null newValue', () => {
    expect(isValidDrawingOverride({ ...validOverride, newValue: null })).toBe(true);
  });

  it('should allow string values', () => {
    expect(
      isValidDrawingOverride({
        ...validOverride,
        originalValue: 'old',
        newValue: 'new',
      })
    ).toBe(true);
  });

  it('should allow object values', () => {
    expect(
      isValidDrawingOverride({
        ...validOverride,
        originalValue: { nested: true },
        newValue: { nested: false },
      })
    ).toBe(true);
  });
});

// ============================================================================
// Drawing Validation Tests
// ============================================================================

describe('isValidDrawing', () => {
  const validElement: DrawingElement = {
    id: 'elem-1',
    type: 'equipment',
    x: 100,
    y: 200,
    rotation: 0,
    properties: {},
  };

  const validLayer: DrawingLayer = {
    id: 'layer-1',
    name: 'AV Elements',
    type: 'av_elements',
    isLocked: false,
    isVisible: true,
    elements: [validElement],
  };

  const validOverride: DrawingOverride = {
    elementId: 'elem-1',
    field: 'x',
    originalValue: 100,
    newValue: 150,
    createdAt: '2026-01-18T00:00:00Z',
  };

  const validDrawing: Drawing = {
    id: 'drawing-1',
    roomId: 'room-123',
    type: 'electrical',
    layers: [validLayer],
    overrides: [validOverride],
    generatedAt: '2026-01-18T00:00:00Z',
  };

  it('should return true for valid drawing', () => {
    expect(isValidDrawing(validDrawing)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidDrawing(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidDrawing(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidDrawing('string')).toBe(false);
    expect(isValidDrawing(123)).toBe(false);
  });

  it('should return false for missing id', () => {
    const { id: _, ...rest } = validDrawing;
    expect(isValidDrawing(rest)).toBe(false);
  });

  it('should return false for empty id', () => {
    expect(isValidDrawing({ ...validDrawing, id: '' })).toBe(false);
  });

  it('should return false for missing roomId', () => {
    const { roomId: _, ...rest } = validDrawing;
    expect(isValidDrawing(rest)).toBe(false);
  });

  it('should return false for empty roomId', () => {
    expect(isValidDrawing({ ...validDrawing, roomId: '' })).toBe(false);
  });

  it('should return false for missing type', () => {
    const { type: _, ...rest } = validDrawing;
    expect(isValidDrawing(rest)).toBe(false);
  });

  it('should return false for invalid type', () => {
    expect(isValidDrawing({ ...validDrawing, type: 'invalid' })).toBe(false);
  });

  it('should return false for missing layers', () => {
    const { layers: _, ...rest } = validDrawing;
    expect(isValidDrawing(rest)).toBe(false);
  });

  it('should return false for non-array layers', () => {
    expect(isValidDrawing({ ...validDrawing, layers: 'invalid' })).toBe(false);
    expect(isValidDrawing({ ...validDrawing, layers: {} })).toBe(false);
  });

  it('should allow empty layers array', () => {
    expect(isValidDrawing({ ...validDrawing, layers: [] })).toBe(true);
  });

  it('should return false for invalid layer in layers array', () => {
    const invalidLayer = { id: '', name: '' };
    expect(isValidDrawing({ ...validDrawing, layers: [invalidLayer] })).toBe(false);
  });

  it('should return false for missing overrides', () => {
    const { overrides: _, ...rest } = validDrawing;
    expect(isValidDrawing(rest)).toBe(false);
  });

  it('should return false for non-array overrides', () => {
    expect(isValidDrawing({ ...validDrawing, overrides: 'invalid' })).toBe(false);
    expect(isValidDrawing({ ...validDrawing, overrides: {} })).toBe(false);
  });

  it('should allow empty overrides array', () => {
    expect(isValidDrawing({ ...validDrawing, overrides: [] })).toBe(true);
  });

  it('should return false for invalid override in overrides array', () => {
    const invalidOverride = { elementId: '' };
    expect(isValidDrawing({ ...validDrawing, overrides: [invalidOverride] })).toBe(false);
  });

  it('should return false for missing generatedAt', () => {
    const { generatedAt: _, ...rest } = validDrawing;
    expect(isValidDrawing(rest)).toBe(false);
  });

  it('should return false for empty generatedAt', () => {
    expect(isValidDrawing({ ...validDrawing, generatedAt: '' })).toBe(false);
  });

  it('should validate all drawing types', () => {
    expect(isValidDrawing({ ...validDrawing, type: 'electrical' })).toBe(true);
    expect(isValidDrawing({ ...validDrawing, type: 'elevation' })).toBe(true);
    expect(isValidDrawing({ ...validDrawing, type: 'rcp' })).toBe(true);
    expect(isValidDrawing({ ...validDrawing, type: 'rack' })).toBe(true);
    expect(isValidDrawing({ ...validDrawing, type: 'cable_schedule' })).toBe(true);
    expect(isValidDrawing({ ...validDrawing, type: 'floor_plan' })).toBe(true);
  });
});

// ============================================================================
// Default Factory Function Tests
// ============================================================================

describe('createDefaultDrawingElement', () => {
  it('should create element with default values', () => {
    const element = createDefaultDrawingElement();
    expect(element.id).toBeDefined();
    expect(element.id.length).toBeGreaterThan(0);
    expect(element.type).toBe('equipment');
    expect(element.x).toBe(0);
    expect(element.y).toBe(0);
    expect(element.rotation).toBe(0);
    expect(element.properties).toEqual({});
  });

  it('should create valid element', () => {
    const element = createDefaultDrawingElement();
    expect(isValidDrawingElement(element)).toBe(true);
  });

  it('should create unique ids', () => {
    const element1 = createDefaultDrawingElement();
    const element2 = createDefaultDrawingElement();
    expect(element1.id).not.toBe(element2.id);
  });

  it('should allow overriding default values', () => {
    const element = createDefaultDrawingElement({
      type: 'text',
      x: 50,
      y: 100,
      rotation: 45,
      properties: { content: 'Label' },
    });
    expect(element.type).toBe('text');
    expect(element.x).toBe(50);
    expect(element.y).toBe(100);
    expect(element.rotation).toBe(45);
    expect(element.properties).toEqual({ content: 'Label' });
  });

  it('should allow overriding id', () => {
    const element = createDefaultDrawingElement({ id: 'custom-id' });
    expect(element.id).toBe('custom-id');
  });
});

describe('createDefaultDrawingLayer', () => {
  it('should create layer with default values', () => {
    const layer = createDefaultDrawingLayer();
    expect(layer.id).toBeDefined();
    expect(layer.id.length).toBeGreaterThan(0);
    expect(layer.name).toBe('New Layer');
    expect(layer.type).toBe('av_elements');
    expect(layer.isLocked).toBe(false);
    expect(layer.isVisible).toBe(true);
    expect(layer.elements).toEqual([]);
  });

  it('should create valid layer', () => {
    const layer = createDefaultDrawingLayer();
    expect(isValidDrawingLayer(layer)).toBe(true);
  });

  it('should create unique ids', () => {
    const layer1 = createDefaultDrawingLayer();
    const layer2 = createDefaultDrawingLayer();
    expect(layer1.id).not.toBe(layer2.id);
  });

  it('should allow overriding default values', () => {
    const element = createDefaultDrawingElement();
    const layer = createDefaultDrawingLayer({
      name: 'Custom Layer',
      type: 'annotations',
      isLocked: true,
      isVisible: false,
      elements: [element],
    });
    expect(layer.name).toBe('Custom Layer');
    expect(layer.type).toBe('annotations');
    expect(layer.isLocked).toBe(true);
    expect(layer.isVisible).toBe(false);
    expect(layer.elements).toHaveLength(1);
  });
});

describe('createDefaultDrawing', () => {
  it('should create drawing with default values', () => {
    const drawing = createDefaultDrawing('room-123');
    expect(drawing.id).toBeDefined();
    expect(drawing.id.length).toBeGreaterThan(0);
    expect(drawing.roomId).toBe('room-123');
    expect(drawing.type).toBe('electrical');
    expect(drawing.layers).toEqual([]);
    expect(drawing.overrides).toEqual([]);
    expect(drawing.generatedAt).toBeDefined();
  });

  it('should create valid drawing', () => {
    const drawing = createDefaultDrawing('room-123');
    expect(isValidDrawing(drawing)).toBe(true);
  });

  it('should create unique ids', () => {
    const drawing1 = createDefaultDrawing('room-1');
    const drawing2 = createDefaultDrawing('room-2');
    expect(drawing1.id).not.toBe(drawing2.id);
  });

  it('should allow overriding default values', () => {
    const layer = createDefaultDrawingLayer();
    const drawing = createDefaultDrawing('room-123', {
      type: 'floor_plan',
      layers: [layer],
    });
    expect(drawing.type).toBe('floor_plan');
    expect(drawing.layers).toHaveLength(1);
  });

  it('should set generatedAt to current timestamp', () => {
    const before = new Date().toISOString();
    const drawing = createDefaultDrawing('room-123');
    const after = new Date().toISOString();
    expect(drawing.generatedAt >= before).toBe(true);
    expect(drawing.generatedAt <= after).toBe(true);
  });
});

// ============================================================================
// Edge Cases and Integration Tests
// ============================================================================

describe('Drawing Types - Edge Cases', () => {
  it('should handle deeply nested element properties', () => {
    const element: DrawingElement = {
      id: 'elem-1',
      type: 'equipment',
      x: 0,
      y: 0,
      rotation: 0,
      properties: {
        equipment: {
          id: 'equip-1',
          specs: {
            power: { voltage: 120, amperage: 5 },
          },
        },
      },
    };
    expect(isValidDrawingElement(element)).toBe(true);
  });

  it('should handle maximum rotation value', () => {
    const element = createDefaultDrawingElement({ rotation: 359 });
    expect(isValidDrawingElement(element)).toBe(true);
  });

  it('should handle drawings with many layers', () => {
    const layers = Array.from({ length: 10 }, (_, i) =>
      createDefaultDrawingLayer({ name: `Layer ${i + 1}` })
    );
    const drawing = createDefaultDrawing('room-123', { layers });
    expect(isValidDrawing(drawing)).toBe(true);
    expect(drawing.layers).toHaveLength(10);
  });

  it('should handle layers with many elements', () => {
    const elements = Array.from({ length: 50 }, () => createDefaultDrawingElement());
    const layer = createDefaultDrawingLayer({ elements });
    expect(isValidDrawingLayer(layer)).toBe(true);
    expect(layer.elements).toHaveLength(50);
  });

  it('should handle drawings with many overrides', () => {
    const overrides: DrawingOverride[] = Array.from({ length: 20 }, (_, i) => ({
      elementId: `elem-${i}`,
      field: 'x',
      originalValue: i * 10,
      newValue: i * 10 + 5,
      createdAt: new Date().toISOString(),
    }));
    const drawing = createDefaultDrawing('room-123', { overrides });
    expect(isValidDrawing(drawing)).toBe(true);
    expect(drawing.overrides).toHaveLength(20);
  });
});
