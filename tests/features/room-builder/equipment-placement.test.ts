/**
 * Equipment Placement Logic - Test Suite
 *
 * Tests for snap-to-grid, collision detection, mount type constraints,
 * and rotation/alignment helpers for placing equipment in rooms.
 */

import { describe, it, expect } from 'vitest';
import {
  snapToGrid,
  detectCollision,
  detectCollisions,
  isWithinBounds,
  isValidMountPosition,
  normalizeRotation,
  rotateBy,
  alignToWall,
  calculatePlacementPosition,
  validatePlacement,
  GRID_SIZE,
} from '@/features/room-builder/equipment-placement';
import type { PlacedEquipment, Room } from '@/types/room';
import type { Equipment } from '@/types/equipment';

const mockEquipment: Equipment = {
  id: 'eq-1',
  manufacturer: 'Poly',
  model: 'Studio X50',
  sku: 'POLY-X50',
  category: 'video',
  subcategory: 'cameras',
  description: 'Professional camera',
  cost: 2000,
  msrp: 2500,
  dimensions: {
    width: 1,
    height: 0.5,
    depth: 0.5,
  },
  weight: 2.5,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockRoom: Room = {
  id: 'room-1',
  projectId: 'project-1',
  name: 'Conference Room A',
  roomType: 'conference',
  width: 20,
  length: 30,
  ceilingHeight: 10,
  platform: 'teams',
  ecosystem: 'poly',
  tier: 'standard',
  placedEquipment: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Equipment Placement Logic', () => {
  // ============================================================================
  // Snap to Grid Tests
  // ============================================================================

  describe('snapToGrid', () => {
    it('snaps to nearest grid line', () => {
      expect(snapToGrid(0.3)).toBe(0);
      expect(snapToGrid(0.6)).toBe(1);
      expect(snapToGrid(1.2)).toBe(1);
      expect(snapToGrid(1.5)).toBe(2);
    });

    it('handles negative coordinates', () => {
      expect(snapToGrid(-0.3)).toBe(0);
      expect(snapToGrid(-0.6)).toBe(-1);
      expect(snapToGrid(-1.2)).toBe(-1);
    });

    it('handles exact grid values', () => {
      expect(snapToGrid(0)).toBe(0);
      expect(snapToGrid(1)).toBe(1);
      expect(snapToGrid(5)).toBe(5);
    });

    it('handles position objects', () => {
      const position = { x: 1.3, y: 2.7 };
      const snapped = {
        x: snapToGrid(position.x),
        y: snapToGrid(position.y),
      };
      expect(snapped).toEqual({ x: 1, y: 3 });
    });

    it('uses correct grid size', () => {
      expect(GRID_SIZE).toBe(1); // 1-foot grid
    });
  });

  // ============================================================================
  // Collision Detection Tests
  // ============================================================================

  describe('detectCollision', () => {
    it('detects overlapping equipment', () => {
      // Equipment dimensions: width=1, depth=0.5
      // pe1: x=10-11, y=10-10.5
      // pe2: x=10.3-11.3, y=10.2-10.7 (overlaps)
      const pe1: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 10,
        rotation: 0,
        mountType: 'floor',
      };
      const pe2: PlacedEquipment = {
        id: 'pe-2',
        equipmentId: 'eq-1',
        x: 10.3,
        y: 10.2,
        rotation: 0,
        mountType: 'floor',
      };

      expect(detectCollision(pe1, pe2, mockEquipment, mockEquipment)).toBe(true);
    });

    it('allows non-overlapping equipment', () => {
      const pe1: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 5,
        y: 5,
        rotation: 0,
        mountType: 'floor',
      };
      const pe2: PlacedEquipment = {
        id: 'pe-2',
        equipmentId: 'eq-1',
        x: 10,
        y: 10,
        rotation: 0,
        mountType: 'floor',
      };

      expect(detectCollision(pe1, pe2, mockEquipment, mockEquipment)).toBe(false);
    });

    it('handles edge-touching equipment (no collision)', () => {
      const pe1: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 5,
        y: 5,
        rotation: 0,
        mountType: 'floor',
      };
      const pe2: PlacedEquipment = {
        id: 'pe-2',
        equipmentId: 'eq-1',
        x: 6,
        y: 5,
        rotation: 0,
        mountType: 'floor',
      };

      // Equipment is 1ft wide, so placing at x=5 and x=6 should just touch
      expect(detectCollision(pe1, pe2, mockEquipment, mockEquipment)).toBe(false);
    });

    it('ignores collision between same equipment', () => {
      const pe: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 10,
        rotation: 0,
        mountType: 'floor',
      };

      expect(detectCollision(pe, pe, mockEquipment, mockEquipment)).toBe(false);
    });

    it('considers equipment on different mount types as non-colliding', () => {
      const pe1: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 10,
        rotation: 0,
        mountType: 'floor',
      };
      const pe2: PlacedEquipment = {
        id: 'pe-2',
        equipmentId: 'eq-1',
        x: 10,
        y: 10,
        rotation: 0,
        mountType: 'ceiling',
      };

      expect(detectCollision(pe1, pe2, mockEquipment, mockEquipment)).toBe(false);
    });
  });

  describe('detectCollisions', () => {
    it('returns empty array when no collisions', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-new',
        equipmentId: 'eq-1',
        x: 15,
        y: 15,
        rotation: 0,
        mountType: 'floor',
      };
      const existing: PlacedEquipment[] = [
        { id: 'pe-1', equipmentId: 'eq-1', x: 5, y: 5, rotation: 0, mountType: 'floor' },
      ];
      const equipmentMap = new Map([['eq-1', mockEquipment]]);

      expect(detectCollisions(equipment, existing, equipmentMap)).toEqual([]);
    });

    it('returns colliding equipment IDs', () => {
      // Equipment dimensions: width=1, depth=0.5
      // pe-1: x=5-6, y=5-5.5
      // pe-new: x=5.3-6.3, y=5.2-5.7 (overlaps with pe-1)
      const equipment: PlacedEquipment = {
        id: 'pe-new',
        equipmentId: 'eq-1',
        x: 5.3,
        y: 5.2,
        rotation: 0,
        mountType: 'floor',
      };
      const existing: PlacedEquipment[] = [
        { id: 'pe-1', equipmentId: 'eq-1', x: 5, y: 5, rotation: 0, mountType: 'floor' },
        { id: 'pe-2', equipmentId: 'eq-1', x: 20, y: 20, rotation: 0, mountType: 'floor' },
      ];
      const equipmentMap = new Map([['eq-1', mockEquipment]]);

      const collisions = detectCollisions(equipment, existing, equipmentMap);
      expect(collisions).toContain('pe-1');
      expect(collisions).not.toContain('pe-2');
    });
  });

  // ============================================================================
  // Bounds Checking Tests
  // ============================================================================

  describe('isWithinBounds', () => {
    it('returns true when equipment is fully within room', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'floor',
      };

      expect(isWithinBounds(equipment, mockRoom, mockEquipment)).toBe(true);
    });

    it('returns false when equipment extends past left edge', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: -1,
        y: 15,
        rotation: 0,
        mountType: 'floor',
      };

      expect(isWithinBounds(equipment, mockRoom, mockEquipment)).toBe(false);
    });

    it('returns false when equipment extends past right edge', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 20,
        y: 15,
        rotation: 0,
        mountType: 'floor',
      };

      expect(isWithinBounds(equipment, mockRoom, mockEquipment)).toBe(false);
    });

    it('returns false when equipment extends past top edge', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: -1,
        rotation: 0,
        mountType: 'floor',
      };

      expect(isWithinBounds(equipment, mockRoom, mockEquipment)).toBe(false);
    });

    it('returns false when equipment extends past bottom edge', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 30,
        rotation: 0,
        mountType: 'floor',
      };

      expect(isWithinBounds(equipment, mockRoom, mockEquipment)).toBe(false);
    });

    it('handles rotated equipment bounds correctly', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 0,
        y: 15,
        rotation: 90,
        mountType: 'floor',
      };

      // At 90deg rotation, width and depth swap
      expect(isWithinBounds(equipment, mockRoom, mockEquipment)).toBe(true);
    });
  });

  // ============================================================================
  // Mount Type Constraints Tests
  // ============================================================================

  describe('isValidMountPosition', () => {
    it('allows floor mount anywhere in room interior', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'floor',
      };

      expect(isValidMountPosition(equipment, mockRoom)).toBe(true);
    });

    it('requires wall mount to be near a wall', () => {
      const nearWall: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 0,
        y: 15,
        rotation: 0,
        mountType: 'wall',
      };
      const notNearWall: PlacedEquipment = {
        id: 'pe-2',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'wall',
      };

      expect(isValidMountPosition(nearWall, mockRoom)).toBe(true);
      expect(isValidMountPosition(notNearWall, mockRoom)).toBe(false);
    });

    it('allows ceiling mount anywhere in room', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'ceiling',
      };

      expect(isValidMountPosition(equipment, mockRoom)).toBe(true);
    });

    it('requires rack mount to be in designated area (corner)', () => {
      const inCorner: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 0,
        y: 0,
        rotation: 0,
        mountType: 'rack',
      };
      const notInCorner: PlacedEquipment = {
        id: 'pe-2',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'rack',
      };

      expect(isValidMountPosition(inCorner, mockRoom)).toBe(true);
      expect(isValidMountPosition(notInCorner, mockRoom)).toBe(false);
    });
  });

  // ============================================================================
  // Rotation Tests
  // ============================================================================

  describe('normalizeRotation', () => {
    it('normalizes positive angles to 0-359 range', () => {
      expect(normalizeRotation(0)).toBe(0);
      expect(normalizeRotation(90)).toBe(90);
      expect(normalizeRotation(180)).toBe(180);
      expect(normalizeRotation(270)).toBe(270);
      expect(normalizeRotation(360)).toBe(0);
      expect(normalizeRotation(450)).toBe(90);
    });

    it('normalizes negative angles to 0-359 range', () => {
      expect(normalizeRotation(-90)).toBe(270);
      expect(normalizeRotation(-180)).toBe(180);
      expect(normalizeRotation(-270)).toBe(90);
      expect(normalizeRotation(-360)).toBe(0);
    });
  });

  describe('rotateBy', () => {
    it('adds rotation correctly', () => {
      expect(rotateBy(0, 90)).toBe(90);
      expect(rotateBy(90, 90)).toBe(180);
      expect(rotateBy(270, 90)).toBe(0);
    });

    it('handles negative rotation', () => {
      expect(rotateBy(90, -90)).toBe(0);
      expect(rotateBy(0, -90)).toBe(270);
    });

    it('snaps to 15-degree increments', () => {
      // rotateBy(0, 10) rounds 10 to nearest 15 = 15
      expect(rotateBy(0, 10)).toBe(15);
      expect(rotateBy(0, 15)).toBe(15);
      // 22 rounds to 15 (closer to 15 than 30)
      expect(rotateBy(0, 22)).toBe(15);
      // 23 rounds to 30 (closer to 30 than 15)
      expect(rotateBy(0, 23)).toBe(30);
    });
  });

  // ============================================================================
  // Alignment Tests
  // ============================================================================

  describe('alignToWall', () => {
    it('aligns to left wall', () => {
      const result = alignToWall({ x: 2, y: 15 }, mockRoom, 'left');
      expect(result.x).toBe(0);
      expect(result.y).toBe(15);
    });

    it('aligns to right wall', () => {
      const result = alignToWall({ x: 15, y: 15 }, mockRoom, 'right');
      expect(result.x).toBe(20);
      expect(result.y).toBe(15);
    });

    it('aligns to top wall', () => {
      const result = alignToWall({ x: 10, y: 5 }, mockRoom, 'top');
      expect(result.x).toBe(10);
      expect(result.y).toBe(0);
    });

    it('aligns to bottom wall', () => {
      const result = alignToWall({ x: 10, y: 25 }, mockRoom, 'bottom');
      expect(result.x).toBe(10);
      expect(result.y).toBe(30);
    });

    it('aligns to nearest wall when not specified', () => {
      // Near left wall
      const nearLeft = alignToWall({ x: 2, y: 15 }, mockRoom);
      expect(nearLeft.x).toBe(0);

      // Near right wall
      const nearRight = alignToWall({ x: 18, y: 15 }, mockRoom);
      expect(nearRight.x).toBe(20);

      // Near top wall
      const nearTop = alignToWall({ x: 10, y: 2 }, mockRoom);
      expect(nearTop.y).toBe(0);

      // Near bottom wall
      const nearBottom = alignToWall({ x: 10, y: 28 }, mockRoom);
      expect(nearBottom.y).toBe(30);
    });
  });

  // ============================================================================
  // Placement Calculation Tests
  // ============================================================================

  describe('calculatePlacementPosition', () => {
    it('snaps dropped position to grid', () => {
      const result = calculatePlacementPosition({ x: 10.3, y: 15.7 });
      expect(result).toEqual({ x: 10, y: 16 });
    });

    it('applies offset for centering then snaps to grid', () => {
      // mockEquipment.dimensions: width=1, depth=0.5
      // Centering: x = 10 - 0.5 = 9.5, y = 15 - 0.25 = 14.75
      // Snap to grid: x = 10 (rounds 9.5), y = 15 (rounds 14.75)
      const result = calculatePlacementPosition(
        { x: 10, y: 15 },
        mockEquipment,
        true
      );
      expect(result.x).toBe(10);
      expect(result.y).toBe(15);
    });
  });

  // ============================================================================
  // Validate Placement Tests
  // ============================================================================

  describe('validatePlacement', () => {
    it('returns valid for correct placement', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'floor',
      };
      const equipmentMap = new Map([['eq-1', mockEquipment]]);

      const result = validatePlacement(equipment, mockRoom, [], equipmentMap);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns errors for out of bounds', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: -5,
        y: 15,
        rotation: 0,
        mountType: 'floor',
      };
      const equipmentMap = new Map([['eq-1', mockEquipment]]);

      const result = validatePlacement(equipment, mockRoom, [], equipmentMap);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Equipment is outside room bounds');
    });

    it('returns errors for invalid mount position', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-1',
        equipmentId: 'eq-1',
        x: 10,
        y: 15,
        rotation: 0,
        mountType: 'wall',
      };
      const equipmentMap = new Map([['eq-1', mockEquipment]]);

      const result = validatePlacement(equipment, mockRoom, [], equipmentMap);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid mount position for wall mount');
    });

    it('returns errors for collisions', () => {
      // Equipment dimensions: width=1, depth=0.5
      // pe-1: x=10-11, y=15-15.5
      // pe-new: x=10.3-11.3, y=15.2-15.7 (overlaps with pe-1)
      const equipment: PlacedEquipment = {
        id: 'pe-new',
        equipmentId: 'eq-1',
        x: 10.3,
        y: 15.2,
        rotation: 0,
        mountType: 'floor',
      };
      const existing: PlacedEquipment[] = [
        { id: 'pe-1', equipmentId: 'eq-1', x: 10, y: 15, rotation: 0, mountType: 'floor' },
      ];
      const equipmentMap = new Map([['eq-1', mockEquipment]]);

      const result = validatePlacement(equipment, mockRoom, existing, equipmentMap);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Collides with'))).toBe(true);
    });

    it('accumulates multiple errors', () => {
      const equipment: PlacedEquipment = {
        id: 'pe-new',
        equipmentId: 'eq-1',
        x: -5,
        y: 15,
        rotation: 0,
        mountType: 'rack',
      };
      const equipmentMap = new Map([['eq-1', mockEquipment]]);

      const result = validatePlacement(equipment, mockRoom, [], equipmentMap);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});
