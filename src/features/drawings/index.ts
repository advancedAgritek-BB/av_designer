/**
 * Drawings Feature Module
 *
 * Exports all drawings-related functionality including:
 * - Service layer for CRUD operations
 * - React Query hooks for data fetching
 * - Components for drawing canvas, toolbar, and page
 * - Re-exports of drawing types for convenience
 */

// ============================================================================
// Service Layer
// ============================================================================

export { DrawingService, drawingService } from './drawing-service';

// ============================================================================
// React Query Hooks
// ============================================================================

export {
  useDrawingsList,
  useDrawingsByRoom,
  useDrawingsByType,
  useDrawing,
  useCreateDrawing,
  useUpdateDrawing,
  useDeleteDrawing,
} from './use-drawings';

// ============================================================================
// Components
// ============================================================================

export { DrawingCanvas } from './components/DrawingCanvas';
export type { DrawingCanvasProps } from './components/DrawingCanvas';

export { DrawingToolbar } from './components/DrawingToolbar';
export type { DrawingToolbarProps } from './components/DrawingToolbar';

export { DrawingsPage } from './components/DrawingsPage';

// ============================================================================
// Re-exported Types (convenience exports from @/types/drawing)
// ============================================================================

export type {
  Drawing,
  DrawingLayer,
  DrawingElement,
  DrawingOverride,
  DrawingType,
  LayerType,
  ElementType,
} from '@/types/drawing';

export {
  DRAWING_TYPES,
  DRAWING_TYPE_LABELS,
  LAYER_TYPES,
  ELEMENT_TYPES,
  isValidDrawing,
  isValidDrawingLayer,
  isValidDrawingElement,
  isValidDrawingOverride,
  createDefaultDrawing,
  createDefaultDrawingLayer,
  createDefaultDrawingElement,
} from '@/types/drawing';
