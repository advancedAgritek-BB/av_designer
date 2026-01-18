/**
 * Room Type Definitions - Test Suite
 *
 * Tests for room types, constants, and validation functions
 * used by the Room Builder feature.
 */

import { describe, it, expect } from 'vitest';
import {
  ROOM_TYPES,
  PLATFORMS,
  ECOSYSTEMS,
  QUALITY_TIERS,
  MOUNT_TYPES,
  isValidRoom,
  isValidPlacedEquipment,
  isValidRoomDimensions,
  createDefaultRoom,
  createDefaultPlacedEquipment,
  type Room,
  type PlacedEquipment,
  type RoomType,
  type Platform,
  type Ecosystem,
  type QualityTier,
  type MountType,
  type RoomDimensions,
} from '@/types/room';

// ============================================================================
// Constants Tests
// ============================================================================

describe('Room Type Constants', () => {
  describe('ROOM_TYPES', () => {
    it('should contain all expected room types', () => {
      expect(ROOM_TYPES).toContain('huddle');
      expect(ROOM_TYPES).toContain('conference');
      expect(ROOM_TYPES).toContain('training');
      expect(ROOM_TYPES).toContain('boardroom');
      expect(ROOM_TYPES).toContain('auditorium');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(ROOM_TYPES)).toBe(true);
      expect(ROOM_TYPES.length).toBeGreaterThan(0);
    });
  });

  describe('PLATFORMS', () => {
    it('should contain all expected collaboration platforms', () => {
      expect(PLATFORMS).toContain('teams');
      expect(PLATFORMS).toContain('zoom');
      expect(PLATFORMS).toContain('webex');
      expect(PLATFORMS).toContain('meet');
      expect(PLATFORMS).toContain('multi');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(PLATFORMS)).toBe(true);
      expect(PLATFORMS.length).toBeGreaterThan(0);
    });
  });

  describe('ECOSYSTEMS', () => {
    it('should contain all expected hardware ecosystems', () => {
      expect(ECOSYSTEMS).toContain('poly');
      expect(ECOSYSTEMS).toContain('logitech');
      expect(ECOSYSTEMS).toContain('cisco');
      expect(ECOSYSTEMS).toContain('crestron');
      expect(ECOSYSTEMS).toContain('biamp');
      expect(ECOSYSTEMS).toContain('qsc');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(ECOSYSTEMS)).toBe(true);
      expect(ECOSYSTEMS.length).toBeGreaterThan(0);
    });
  });

  describe('QUALITY_TIERS', () => {
    it('should contain all expected quality tiers', () => {
      expect(QUALITY_TIERS).toContain('budget');
      expect(QUALITY_TIERS).toContain('standard');
      expect(QUALITY_TIERS).toContain('premium');
      expect(QUALITY_TIERS).toContain('executive');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(QUALITY_TIERS)).toBe(true);
      expect(QUALITY_TIERS.length).toBe(4);
    });
  });

  describe('MOUNT_TYPES', () => {
    it('should contain all expected mount types', () => {
      expect(MOUNT_TYPES).toContain('floor');
      expect(MOUNT_TYPES).toContain('wall');
      expect(MOUNT_TYPES).toContain('ceiling');
      expect(MOUNT_TYPES).toContain('rack');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(MOUNT_TYPES)).toBe(true);
      expect(MOUNT_TYPES.length).toBe(4);
    });
  });
});

// ============================================================================
// Type Tests (Compile-time, demonstrated via valid usage)
// ============================================================================

describe('Room Types - Type Safety', () => {
  it('should allow valid RoomType values', () => {
    const roomType: RoomType = 'conference';
    expect(roomType).toBe('conference');
  });

  it('should allow valid Platform values', () => {
    const platform: Platform = 'teams';
    expect(platform).toBe('teams');
  });

  it('should allow valid Ecosystem values', () => {
    const ecosystem: Ecosystem = 'poly';
    expect(ecosystem).toBe('poly');
  });

  it('should allow valid QualityTier values', () => {
    const tier: QualityTier = 'premium';
    expect(tier).toBe('premium');
  });

  it('should allow valid MountType values', () => {
    const mount: MountType = 'ceiling';
    expect(mount).toBe('ceiling');
  });
});

// ============================================================================
// Room Dimensions Validation Tests
// ============================================================================

describe('isValidRoomDimensions', () => {
  it('should return true for valid dimensions', () => {
    const dims: RoomDimensions = {
      width: 20,
      length: 30,
      height: 10,
    };
    expect(isValidRoomDimensions(dims)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidRoomDimensions(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidRoomDimensions(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidRoomDimensions('string')).toBe(false);
    expect(isValidRoomDimensions(123)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isValidRoomDimensions([20, 30, 10])).toBe(false);
  });

  it('should return false for missing width', () => {
    expect(isValidRoomDimensions({ length: 30, height: 10 })).toBe(false);
  });

  it('should return false for missing length', () => {
    expect(isValidRoomDimensions({ width: 20, height: 10 })).toBe(false);
  });

  it('should return false for missing height', () => {
    expect(isValidRoomDimensions({ width: 20, length: 30 })).toBe(false);
  });

  it('should return false for non-number width', () => {
    expect(isValidRoomDimensions({ width: '20', length: 30, height: 10 })).toBe(false);
  });

  it('should return false for non-number length', () => {
    expect(isValidRoomDimensions({ width: 20, length: '30', height: 10 })).toBe(false);
  });

  it('should return false for non-number height', () => {
    expect(isValidRoomDimensions({ width: 20, length: 30, height: '10' })).toBe(false);
  });

  it('should return false for zero width', () => {
    expect(isValidRoomDimensions({ width: 0, length: 30, height: 10 })).toBe(false);
  });

  it('should return false for negative width', () => {
    expect(isValidRoomDimensions({ width: -20, length: 30, height: 10 })).toBe(false);
  });

  it('should return false for zero length', () => {
    expect(isValidRoomDimensions({ width: 20, length: 0, height: 10 })).toBe(false);
  });

  it('should return false for negative length', () => {
    expect(isValidRoomDimensions({ width: 20, length: -30, height: 10 })).toBe(false);
  });

  it('should return false for zero height', () => {
    expect(isValidRoomDimensions({ width: 20, length: 30, height: 0 })).toBe(false);
  });

  it('should return false for negative height', () => {
    expect(isValidRoomDimensions({ width: 20, length: 30, height: -10 })).toBe(false);
  });

  it('should accept decimal values', () => {
    expect(isValidRoomDimensions({ width: 20.5, length: 30.75, height: 10.25 })).toBe(true);
  });
});

// ============================================================================
// Placed Equipment Validation Tests
// ============================================================================

describe('isValidPlacedEquipment', () => {
  const validPlacedEquipment: PlacedEquipment = {
    id: 'pe-123',
    equipmentId: 'eq-456',
    x: 10,
    y: 20,
    rotation: 90,
    mountType: 'wall',
    configuration: {},
  };

  it('should return true for valid placed equipment', () => {
    expect(isValidPlacedEquipment(validPlacedEquipment)).toBe(true);
  });

  it('should return true without optional configuration', () => {
    const { configuration: _, ...withoutConfig } = validPlacedEquipment;
    expect(isValidPlacedEquipment(withoutConfig)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidPlacedEquipment(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidPlacedEquipment(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidPlacedEquipment('string')).toBe(false);
    expect(isValidPlacedEquipment(123)).toBe(false);
  });

  it('should return false for missing id', () => {
    const { id: _, ...withoutId } = validPlacedEquipment;
    expect(isValidPlacedEquipment(withoutId)).toBe(false);
  });

  it('should return false for non-string id', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, id: 123 })).toBe(false);
  });

  it('should return false for missing equipmentId', () => {
    const { equipmentId: _, ...withoutEqId } = validPlacedEquipment;
    expect(isValidPlacedEquipment(withoutEqId)).toBe(false);
  });

  it('should return false for non-string equipmentId', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, equipmentId: 456 })).toBe(false);
  });

  it('should return false for missing x', () => {
    const { x: _, ...withoutX } = validPlacedEquipment;
    expect(isValidPlacedEquipment(withoutX)).toBe(false);
  });

  it('should return false for non-number x', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, x: '10' })).toBe(false);
  });

  it('should return false for missing y', () => {
    const { y: _, ...withoutY } = validPlacedEquipment;
    expect(isValidPlacedEquipment(withoutY)).toBe(false);
  });

  it('should return false for non-number y', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, y: '20' })).toBe(false);
  });

  it('should return false for missing rotation', () => {
    const { rotation: _, ...withoutRotation } = validPlacedEquipment;
    expect(isValidPlacedEquipment(withoutRotation)).toBe(false);
  });

  it('should return false for non-number rotation', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, rotation: '90' })).toBe(false);
  });

  it('should return false for missing mountType', () => {
    const { mountType: _, ...withoutMount } = validPlacedEquipment;
    expect(isValidPlacedEquipment(withoutMount)).toBe(false);
  });

  it('should return false for invalid mountType', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, mountType: 'invalid' })).toBe(false);
  });

  it('should accept all valid mount types', () => {
    MOUNT_TYPES.forEach((mount) => {
      expect(isValidPlacedEquipment({ ...validPlacedEquipment, mountType: mount })).toBe(true);
    });
  });

  it('should accept zero x coordinate', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, x: 0 })).toBe(true);
  });

  it('should accept negative x coordinate', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, x: -10 })).toBe(true);
  });

  it('should accept zero rotation', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, rotation: 0 })).toBe(true);
  });

  it('should accept negative rotation', () => {
    expect(isValidPlacedEquipment({ ...validPlacedEquipment, rotation: -45 })).toBe(true);
  });
});

// ============================================================================
// Room Validation Tests
// ============================================================================

describe('isValidRoom', () => {
  const validRoom: Room = {
    id: 'room-123',
    projectId: 'project-456',
    name: 'Conference Room A',
    roomType: 'conference',
    width: 20,
    length: 30,
    ceilingHeight: 10,
    platform: 'teams',
    ecosystem: 'poly',
    tier: 'standard',
    placedEquipment: [],
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  };

  it('should return true for valid room', () => {
    expect(isValidRoom(validRoom)).toBe(true);
  });

  it('should return true for room with placed equipment', () => {
    const roomWithEquipment: Room = {
      ...validRoom,
      placedEquipment: [
        {
          id: 'pe-1',
          equipmentId: 'eq-1',
          x: 5,
          y: 10,
          rotation: 0,
          mountType: 'ceiling',
        },
      ],
    };
    expect(isValidRoom(roomWithEquipment)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidRoom(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidRoom(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidRoom('string')).toBe(false);
    expect(isValidRoom(123)).toBe(false);
  });

  it('should return false for missing id', () => {
    const { id: _, ...withoutId } = validRoom;
    expect(isValidRoom(withoutId)).toBe(false);
  });

  it('should return false for non-string id', () => {
    expect(isValidRoom({ ...validRoom, id: 123 })).toBe(false);
  });

  it('should return false for missing projectId', () => {
    const { projectId: _, ...withoutProjectId } = validRoom;
    expect(isValidRoom(withoutProjectId)).toBe(false);
  });

  it('should return false for non-string projectId', () => {
    expect(isValidRoom({ ...validRoom, projectId: 456 })).toBe(false);
  });

  it('should return false for missing name', () => {
    const { name: _, ...withoutName } = validRoom;
    expect(isValidRoom(withoutName)).toBe(false);
  });

  it('should return false for non-string name', () => {
    expect(isValidRoom({ ...validRoom, name: 123 })).toBe(false);
  });

  it('should return false for empty name', () => {
    expect(isValidRoom({ ...validRoom, name: '' })).toBe(false);
  });

  it('should return false for missing roomType', () => {
    const { roomType: _, ...withoutType } = validRoom;
    expect(isValidRoom(withoutType)).toBe(false);
  });

  it('should return false for invalid roomType', () => {
    expect(isValidRoom({ ...validRoom, roomType: 'invalid' })).toBe(false);
  });

  it('should accept all valid room types', () => {
    ROOM_TYPES.forEach((type) => {
      expect(isValidRoom({ ...validRoom, roomType: type })).toBe(true);
    });
  });

  it('should return false for missing width', () => {
    const { width: _, ...withoutWidth } = validRoom;
    expect(isValidRoom(withoutWidth)).toBe(false);
  });

  it('should return false for non-positive width', () => {
    expect(isValidRoom({ ...validRoom, width: 0 })).toBe(false);
    expect(isValidRoom({ ...validRoom, width: -10 })).toBe(false);
  });

  it('should return false for missing length', () => {
    const { length: _, ...withoutLength } = validRoom;
    expect(isValidRoom(withoutLength)).toBe(false);
  });

  it('should return false for non-positive length', () => {
    expect(isValidRoom({ ...validRoom, length: 0 })).toBe(false);
    expect(isValidRoom({ ...validRoom, length: -10 })).toBe(false);
  });

  it('should return false for missing ceilingHeight', () => {
    const { ceilingHeight: _, ...withoutHeight } = validRoom;
    expect(isValidRoom(withoutHeight)).toBe(false);
  });

  it('should return false for non-positive ceilingHeight', () => {
    expect(isValidRoom({ ...validRoom, ceilingHeight: 0 })).toBe(false);
    expect(isValidRoom({ ...validRoom, ceilingHeight: -10 })).toBe(false);
  });

  it('should return false for missing platform', () => {
    const { platform: _, ...withoutPlatform } = validRoom;
    expect(isValidRoom(withoutPlatform)).toBe(false);
  });

  it('should return false for invalid platform', () => {
    expect(isValidRoom({ ...validRoom, platform: 'invalid' })).toBe(false);
  });

  it('should accept all valid platforms', () => {
    PLATFORMS.forEach((platform) => {
      expect(isValidRoom({ ...validRoom, platform })).toBe(true);
    });
  });

  it('should return false for missing ecosystem', () => {
    const { ecosystem: _, ...withoutEcosystem } = validRoom;
    expect(isValidRoom(withoutEcosystem)).toBe(false);
  });

  it('should return false for invalid ecosystem', () => {
    expect(isValidRoom({ ...validRoom, ecosystem: 'invalid' })).toBe(false);
  });

  it('should accept all valid ecosystems', () => {
    ECOSYSTEMS.forEach((ecosystem) => {
      expect(isValidRoom({ ...validRoom, ecosystem })).toBe(true);
    });
  });

  it('should return false for missing tier', () => {
    const { tier: _, ...withoutTier } = validRoom;
    expect(isValidRoom(withoutTier)).toBe(false);
  });

  it('should return false for invalid tier', () => {
    expect(isValidRoom({ ...validRoom, tier: 'invalid' })).toBe(false);
  });

  it('should accept all valid tiers', () => {
    QUALITY_TIERS.forEach((tier) => {
      expect(isValidRoom({ ...validRoom, tier })).toBe(true);
    });
  });

  it('should return false for missing placedEquipment', () => {
    const { placedEquipment: _, ...withoutEquipment } = validRoom;
    expect(isValidRoom(withoutEquipment)).toBe(false);
  });

  it('should return false for non-array placedEquipment', () => {
    expect(isValidRoom({ ...validRoom, placedEquipment: 'invalid' })).toBe(false);
    expect(isValidRoom({ ...validRoom, placedEquipment: {} })).toBe(false);
  });

  it('should return false for invalid placed equipment in array', () => {
    expect(isValidRoom({ ...validRoom, placedEquipment: [{ invalid: true }] })).toBe(false);
  });
});

// ============================================================================
// Factory Function Tests
// ============================================================================

describe('createDefaultRoom', () => {
  it('should create a room with default values', () => {
    const room = createDefaultRoom('project-123', 'Test Room');
    expect(room.projectId).toBe('project-123');
    expect(room.name).toBe('Test Room');
    expect(room.id).toBeDefined();
    expect(room.roomType).toBe('conference');
    expect(room.platform).toBe('teams');
    expect(room.ecosystem).toBe('poly');
    expect(room.tier).toBe('standard');
    expect(room.width).toBe(20);
    expect(room.length).toBe(20);
    expect(room.ceilingHeight).toBe(10);
    expect(room.placedEquipment).toEqual([]);
    expect(room.createdAt).toBeDefined();
    expect(room.updatedAt).toBeDefined();
  });

  it('should create unique ids for each room', () => {
    const room1 = createDefaultRoom('p-1', 'Room 1');
    const room2 = createDefaultRoom('p-1', 'Room 2');
    expect(room1.id).not.toBe(room2.id);
  });

  it('should allow overriding defaults', () => {
    const room = createDefaultRoom('p-1', 'Custom Room', {
      roomType: 'boardroom',
      platform: 'zoom',
      ecosystem: 'logitech',
      tier: 'executive',
      width: 40,
      length: 60,
      ceilingHeight: 14,
    });
    expect(room.roomType).toBe('boardroom');
    expect(room.platform).toBe('zoom');
    expect(room.ecosystem).toBe('logitech');
    expect(room.tier).toBe('executive');
    expect(room.width).toBe(40);
    expect(room.length).toBe(60);
    expect(room.ceilingHeight).toBe(14);
  });

  it('should create valid room according to isValidRoom', () => {
    const room = createDefaultRoom('p-1', 'Valid Room');
    expect(isValidRoom(room)).toBe(true);
  });
});

describe('createDefaultPlacedEquipment', () => {
  it('should create placed equipment with default values', () => {
    const placed = createDefaultPlacedEquipment('eq-123');
    expect(placed.equipmentId).toBe('eq-123');
    expect(placed.id).toBeDefined();
    expect(placed.x).toBe(0);
    expect(placed.y).toBe(0);
    expect(placed.rotation).toBe(0);
    expect(placed.mountType).toBe('floor');
  });

  it('should create unique ids for each placement', () => {
    const placed1 = createDefaultPlacedEquipment('eq-1');
    const placed2 = createDefaultPlacedEquipment('eq-1');
    expect(placed1.id).not.toBe(placed2.id);
  });

  it('should allow overriding defaults', () => {
    const placed = createDefaultPlacedEquipment('eq-123', {
      x: 10,
      y: 20,
      rotation: 90,
      mountType: 'ceiling',
      configuration: { setting: 'value' },
    });
    expect(placed.x).toBe(10);
    expect(placed.y).toBe(20);
    expect(placed.rotation).toBe(90);
    expect(placed.mountType).toBe('ceiling');
    expect(placed.configuration).toEqual({ setting: 'value' });
  });

  it('should create valid placed equipment according to isValidPlacedEquipment', () => {
    const placed = createDefaultPlacedEquipment('eq-123');
    expect(isValidPlacedEquipment(placed)).toBe(true);
  });
});
