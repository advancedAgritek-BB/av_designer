/**
 * Equipment Feature - Public API
 *
 * Re-exports all equipment-related components, hooks, and services
 * for use throughout the application.
 */

// Service
export { EquipmentService, equipmentService } from './equipment-service';

// Hooks
export {
  useEquipmentList,
  useEquipmentByCategory,
  useEquipment,
  useEquipmentSearch,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from './use-equipment';

// Components
export { EquipmentCard } from './components/EquipmentCard';
export { EquipmentList } from './components/EquipmentList';
export { EquipmentForm, type EquipmentFormProps } from './components/EquipmentForm';

// Re-export types from shared types module for convenience
export type {
  Equipment,
  EquipmentCategory,
  EquipmentFormData,
  Dimensions,
  ElectricalSpecs,
} from '@/types/equipment';

export {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_SUBCATEGORIES,
  isValidEquipment,
} from '@/types/equipment';
