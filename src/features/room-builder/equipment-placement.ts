/**
 * Equipment Placement Logic
 *
 * Utilities for placing equipment in rooms including snap-to-grid,
 * collision detection, mount type constraints, and rotation helpers.
 */

import type { PlacedEquipment, Room } from '@/types/room';
import type { Equipment } from '@/types/equipment';

/**
 * Grid size in feet
 */
export const GRID_SIZE = 1;

/**
 * Wall proximity threshold for wall-mounted equipment (in feet)
 */
const WALL_PROXIMITY = 2;

/**
 * Corner threshold for rack placement (in feet)
 */
const CORNER_THRESHOLD = 3;

/**
 * Rotation snap increment (in degrees)
 */
const ROTATION_SNAP = 15;

// ============================================================================
// Snap to Grid
// ============================================================================

/**
 * Snaps a coordinate to the nearest grid line
 */
export function snapToGrid(value: number): number {
  const result = Math.round(value / GRID_SIZE) * GRID_SIZE;
  // Convert -0 to 0 for consistency
  return result === 0 ? 0 : result;
}

// ============================================================================
// Collision Detection
// ============================================================================

/**
 * Gets the bounding box of placed equipment, accounting for rotation
 */
function getBoundingBox(
  pe: PlacedEquipment,
  equipment: Equipment
): { x1: number; y1: number; x2: number; y2: number } {
  const { width, depth } = equipment.dimensions;

  // For 90 or 270 degree rotation, swap width and depth
  const effectiveWidth = pe.rotation === 90 || pe.rotation === 270 ? depth : width;
  const effectiveDepth = pe.rotation === 90 || pe.rotation === 270 ? width : depth;

  return {
    x1: pe.x,
    y1: pe.y,
    x2: pe.x + effectiveWidth,
    y2: pe.y + effectiveDepth,
  };
}

/**
 * Checks if two bounding boxes overlap
 */
function boxesOverlap(
  a: { x1: number; y1: number; x2: number; y2: number },
  b: { x1: number; y1: number; x2: number; y2: number }
): boolean {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}

/**
 * Detects collision between two placed equipment items
 *
 * Returns false if:
 * - Same equipment (same id)
 * - Different mount types (floor vs ceiling, etc.)
 */
export function detectCollision(
  pe1: PlacedEquipment,
  pe2: PlacedEquipment,
  eq1: Equipment,
  eq2: Equipment
): boolean {
  // Same equipment doesn't collide with itself
  if (pe1.id === pe2.id) {
    return false;
  }

  // Different mount types don't collide (floor vs ceiling)
  if (pe1.mountType !== pe2.mountType) {
    return false;
  }

  const box1 = getBoundingBox(pe1, eq1);
  const box2 = getBoundingBox(pe2, eq2);

  return boxesOverlap(box1, box2);
}

/**
 * Detects collisions between equipment and all existing equipment
 * Returns array of colliding equipment IDs
 */
export function detectCollisions(
  equipment: PlacedEquipment,
  existing: PlacedEquipment[],
  equipmentMap: Map<string, Equipment>
): string[] {
  const eq = equipmentMap.get(equipment.equipmentId);
  if (!eq) return [];

  const collisions: string[] = [];

  for (const pe of existing) {
    const otherEq = equipmentMap.get(pe.equipmentId);
    if (otherEq && detectCollision(equipment, pe, eq, otherEq)) {
      collisions.push(pe.id);
    }
  }

  return collisions;
}

// ============================================================================
// Bounds Checking
// ============================================================================

/**
 * Checks if equipment is fully within room bounds
 */
export function isWithinBounds(
  pe: PlacedEquipment,
  room: Room,
  equipment: Equipment
): boolean {
  const { width, depth } = equipment.dimensions;

  // For 90 or 270 degree rotation, swap width and depth
  const effectiveWidth = pe.rotation === 90 || pe.rotation === 270 ? depth : width;
  const effectiveDepth = pe.rotation === 90 || pe.rotation === 270 ? width : depth;

  return (
    pe.x >= 0 &&
    pe.y >= 0 &&
    pe.x + effectiveWidth <= room.width &&
    pe.y + effectiveDepth <= room.length
  );
}

// ============================================================================
// Mount Type Constraints
// ============================================================================

/**
 * Checks if equipment is in a valid position for its mount type
 */
export function isValidMountPosition(pe: PlacedEquipment, room: Room): boolean {
  switch (pe.mountType) {
    case 'floor':
      // Floor mount can go anywhere in the room
      return true;

    case 'ceiling':
      // Ceiling mount can go anywhere in the room
      return true;

    case 'wall':
      // Wall mount must be near a wall
      return (
        pe.x <= WALL_PROXIMITY ||
        pe.x >= room.width - WALL_PROXIMITY ||
        pe.y <= WALL_PROXIMITY ||
        pe.y >= room.length - WALL_PROXIMITY
      );

    case 'rack':
      // Rack mount must be in a corner
      return (
        (pe.x <= CORNER_THRESHOLD || pe.x >= room.width - CORNER_THRESHOLD) &&
        (pe.y <= CORNER_THRESHOLD || pe.y >= room.length - CORNER_THRESHOLD)
      );

    default:
      return true;
  }
}

// ============================================================================
// Rotation Helpers
// ============================================================================

/**
 * Normalizes rotation angle to 0-359 range
 */
export function normalizeRotation(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  // Convert -0 to 0 for consistency
  return normalized === 0 ? 0 : normalized;
}

/**
 * Rotates by a given amount, snapping to increment
 */
export function rotateBy(currentRotation: number, delta: number): number {
  const newRotation = currentRotation + delta;
  const snapped = Math.round(newRotation / ROTATION_SNAP) * ROTATION_SNAP;
  return normalizeRotation(snapped);
}

// ============================================================================
// Alignment Helpers
// ============================================================================

type WallSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * Aligns position to specified wall or nearest wall
 */
export function alignToWall(
  position: { x: number; y: number },
  room: Room,
  wall?: WallSide
): { x: number; y: number } {
  const { x, y } = position;

  if (wall) {
    switch (wall) {
      case 'left':
        return { x: 0, y };
      case 'right':
        return { x: room.width, y };
      case 'top':
        return { x, y: 0 };
      case 'bottom':
        return { x, y: room.length };
    }
  }

  // Find nearest wall
  const distLeft = x;
  const distRight = room.width - x;
  const distTop = y;
  const distBottom = room.length - y;

  const minDist = Math.min(distLeft, distRight, distTop, distBottom);

  if (minDist === distLeft) {
    return { x: 0, y };
  } else if (minDist === distRight) {
    return { x: room.width, y };
  } else if (minDist === distTop) {
    return { x, y: 0 };
  } else {
    return { x, y: room.length };
  }
}

// ============================================================================
// Placement Calculation
// ============================================================================

/**
 * Calculates the final placement position, applying snap-to-grid
 * and optional centering offset
 */
export function calculatePlacementPosition(
  dropPosition: { x: number; y: number },
  equipment?: Equipment,
  centerOnDrop = false
): { x: number; y: number } {
  let { x, y } = dropPosition;

  // Apply centering offset if equipment provided
  if (equipment && centerOnDrop) {
    x -= equipment.dimensions.width / 2;
    y -= equipment.dimensions.depth / 2;
  }

  // Snap to grid
  return {
    x: snapToGrid(x),
    y: snapToGrid(y),
  };
}

// ============================================================================
// Validation
// ============================================================================

export interface PlacementValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates equipment placement, checking bounds, mount type, and collisions
 */
export function validatePlacement(
  equipment: PlacedEquipment,
  room: Room,
  existingEquipment: PlacedEquipment[],
  equipmentMap: Map<string, Equipment>
): PlacementValidationResult {
  const errors: string[] = [];
  const eq = equipmentMap.get(equipment.equipmentId);

  if (!eq) {
    errors.push('Equipment not found in equipment map');
    return { isValid: false, errors };
  }

  // Check bounds
  if (!isWithinBounds(equipment, room, eq)) {
    errors.push('Equipment is outside room bounds');
  }

  // Check mount type constraints
  if (!isValidMountPosition(equipment, room)) {
    errors.push(`Invalid mount position for ${equipment.mountType} mount`);
  }

  // Check collisions
  const collisions = detectCollisions(equipment, existingEquipment, equipmentMap);
  if (collisions.length > 0) {
    errors.push(`Collides with existing equipment: ${collisions.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
