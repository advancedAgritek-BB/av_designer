/**
 * Room Builder Feature
 *
 * Exports all room builder components, hooks, services, and utilities.
 */

// Components
export { DesignCanvas } from './components/DesignCanvas';
export { RoomPropertiesPanel } from './components/RoomPropertiesPanel';
export {
  ValidationPanel,
  type ValidationItem,
  type ValidationItemType,
} from './components/ValidationPanel';
export { RoomBuilder } from './components/RoomBuilder';

// Hooks
export {
  useRoomsList,
  useRoomsByProject,
  useRoom,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useAddPlacedEquipment,
  useRemovePlacedEquipment,
  useUpdatePlacedEquipment,
} from './use-rooms';

// Service
export { roomService, RoomService } from './room-service';

// Utilities
export {
  GRID_SIZE,
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
  type PlacementValidationResult,
} from './equipment-placement';
