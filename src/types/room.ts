/**
 * Room Type Definitions
 *
 * Comprehensive types for the Room Builder feature including
 * room configuration, placed equipment, and validation.
 */

// ============================================================================
// Room Type Constants
// ============================================================================

export const ROOM_TYPES = [
  'huddle',
  'conference',
  'training',
  'boardroom',
  'auditorium',
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

// ============================================================================
// Platform Constants
// ============================================================================

export const PLATFORMS = ['teams', 'zoom', 'webex', 'meet', 'multi', 'none'] as const;

export type Platform = (typeof PLATFORMS)[number];

// ============================================================================
// Ecosystem Constants
// ============================================================================

export const ECOSYSTEMS = [
  'poly',
  'logitech',
  'cisco',
  'crestron',
  'biamp',
  'qsc',
  'mixed',
] as const;

export type Ecosystem = (typeof ECOSYSTEMS)[number];

// ============================================================================
// Quality Tier Constants
// ============================================================================

export const QUALITY_TIERS = ['budget', 'standard', 'premium', 'executive'] as const;

export type QualityTier = (typeof QUALITY_TIERS)[number];

// ============================================================================
// Mount Type Constants
// ============================================================================

export const MOUNT_TYPES = ['floor', 'wall', 'ceiling', 'rack'] as const;

export type MountType = (typeof MOUNT_TYPES)[number];

// ============================================================================
// Room Dimensions Interface
// ============================================================================

export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
}

// ============================================================================
// Placed Equipment Interface
// ============================================================================

export interface PlacedEquipment {
  id: string;
  equipmentId: string;
  x: number;
  y: number;
  rotation: number;
  mountType: MountType;
  configuration?: Record<string, unknown>;
}

// ============================================================================
// Room Interface
// ============================================================================

export interface Room {
  id: string;
  projectId: string;
  name: string;
  roomType: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: QualityTier;
  placedEquipment: PlacedEquipment[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Room Form Data (for create/edit forms)
// ============================================================================

export interface RoomFormData {
  name: string;
  roomType: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: QualityTier;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates RoomDimensions object
 */
export function isValidRoomDimensions(data: unknown): data is RoomDimensions {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const dims = data as Record<string, unknown>;

  if (typeof dims.width !== 'number' || dims.width <= 0) return false;
  if (typeof dims.length !== 'number' || dims.length <= 0) return false;
  if (typeof dims.height !== 'number' || dims.height <= 0) return false;

  return true;
}

/**
 * Validates PlacedEquipment object
 */
export function isValidPlacedEquipment(data: unknown): data is PlacedEquipment {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const pe = data as Record<string, unknown>;

  if (typeof pe.id !== 'string') return false;
  if (typeof pe.equipmentId !== 'string') return false;
  if (typeof pe.x !== 'number') return false;
  if (typeof pe.y !== 'number') return false;
  if (typeof pe.rotation !== 'number') return false;

  if (
    typeof pe.mountType !== 'string' ||
    !MOUNT_TYPES.includes(pe.mountType as MountType)
  ) {
    return false;
  }

  return true;
}

/**
 * Validates Room object
 */
export function isValidRoom(data: unknown): data is Room {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const room = data as Record<string, unknown>;

  // String fields
  if (typeof room.id !== 'string') return false;
  if (typeof room.projectId !== 'string') return false;
  if (typeof room.name !== 'string' || room.name === '') return false;

  // Room type
  if (
    typeof room.roomType !== 'string' ||
    !ROOM_TYPES.includes(room.roomType as RoomType)
  ) {
    return false;
  }

  // Dimensions
  if (typeof room.width !== 'number' || room.width <= 0) return false;
  if (typeof room.length !== 'number' || room.length <= 0) return false;
  if (typeof room.ceilingHeight !== 'number' || room.ceilingHeight <= 0) return false;

  // Platform
  if (
    typeof room.platform !== 'string' ||
    !PLATFORMS.includes(room.platform as Platform)
  ) {
    return false;
  }

  // Ecosystem
  if (
    typeof room.ecosystem !== 'string' ||
    !ECOSYSTEMS.includes(room.ecosystem as Ecosystem)
  ) {
    return false;
  }

  // Tier
  if (
    typeof room.tier !== 'string' ||
    !QUALITY_TIERS.includes(room.tier as QualityTier)
  ) {
    return false;
  }

  // Placed equipment array
  if (!Array.isArray(room.placedEquipment)) return false;
  for (const pe of room.placedEquipment) {
    if (!isValidPlacedEquipment(pe)) return false;
  }

  return true;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a new Room with default values
 */
export function createDefaultRoom(
  projectId: string,
  name: string,
  overrides?: Partial<RoomFormData>
): Room {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    projectId,
    name,
    roomType: overrides?.roomType ?? 'conference',
    width: overrides?.width ?? 20,
    length: overrides?.length ?? 20,
    ceilingHeight: overrides?.ceilingHeight ?? 10,
    platform: overrides?.platform ?? 'teams',
    ecosystem: overrides?.ecosystem ?? 'poly',
    tier: overrides?.tier ?? 'standard',
    placedEquipment: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates a new PlacedEquipment with default values
 */
export function createDefaultPlacedEquipment(
  equipmentId: string,
  overrides?: Partial<Omit<PlacedEquipment, 'id' | 'equipmentId'>>
): PlacedEquipment {
  return {
    id: crypto.randomUUID(),
    equipmentId,
    x: overrides?.x ?? 0,
    y: overrides?.y ?? 0,
    rotation: overrides?.rotation ?? 0,
    mountType: overrides?.mountType ?? 'floor',
    configuration: overrides?.configuration,
  };
}
