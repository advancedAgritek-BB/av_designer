/**
 * DesignCanvas Component
 *
 * Interactive canvas for room design with zoom, pan, grid, and equipment placement.
 */

import { useState, useCallback, useRef } from 'react';
import type { Room } from '@/types/room';
import type { Equipment } from '@/types/equipment';

interface DesignCanvasProps {
  room: Room;
  equipmentMap: Map<string, Equipment>;
  selectedEquipmentId: string | null;
  onEquipmentSelect: (id: string | null) => void;
  onEquipmentMove: (id: string, position: { x: number; y: number }) => void;
  onEquipmentRotate: (id: string, rotation: number) => void;
  onEquipmentDrop: (equipmentId: string, position: { x: number; y: number }) => void;
}

const MIN_ZOOM = 25;
const MAX_ZOOM = 400;
const ZOOM_STEP = 10;
const GRID_SPACING = 1; // 1 foot grid
const PIXELS_PER_FOOT = 20; // Scale: 20 pixels = 1 foot

function getEquipmentDisplayName(equipment: Equipment): string {
  return `${equipment.manufacturer} ${equipment.model}`;
}

export function DesignCanvas({
  room,
  equipmentMap,
  selectedEquipmentId,
  onEquipmentSelect,
  onEquipmentMove,
  onEquipmentRotate,
  onEquipmentDrop,
}: DesignCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.min(prev + ZOOM_STEP, MAX_ZOOM);
      setStatusMessage(`Zoom: ${newZoom}%`);
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
      setStatusMessage(`Zoom: ${newZoom}%`);
      return newZoom;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
    setStatusMessage('Zoom: 100%');
  }, []);

  const handleCenter = useCallback(() => {
    // Reset pan position (handled by CSS transform)
    setStatusMessage('View centered');
  }, []);

  const handleToggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!room) return;
      if (e.key === 'Escape' && selectedEquipmentId) {
        onEquipmentSelect(null);
      } else if (e.key === 'r' && selectedEquipmentId) {
        const equipment = room.placedEquipment.find(
          (pe) => pe.id === selectedEquipmentId
        );
        if (equipment) {
          onEquipmentRotate(selectedEquipmentId, (equipment.rotation + 90) % 360);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (room.placedEquipment.length > 0) {
          const currentIndex = room.placedEquipment.findIndex(
            (pe) => pe.id === selectedEquipmentId
          );
          const nextIndex = (currentIndex + 1) % room.placedEquipment.length;
          onEquipmentSelect(room.placedEquipment[nextIndex].id);
        }
      }
    },
    [room, selectedEquipmentId, onEquipmentSelect, onEquipmentRotate]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.equipmentId && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / (PIXELS_PER_FOOT * (zoom / 100));
          const y = (e.clientY - rect.top) / (PIXELS_PER_FOOT * (zoom / 100));
          onEquipmentDrop(data.equipmentId, { x, y });
        }
      } catch {
        // Invalid drop data
      }
    },
    [zoom, onEquipmentDrop]
  );

  const handleEquipmentDragStart = useCallback(
    (e: React.DragEvent, equipmentId: string) => {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      e.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ placedEquipmentId: equipmentId })
      );
    },
    []
  );

  const handleEquipmentDragEnd = useCallback(
    (e: React.DragEvent, equipmentId: string) => {
      if (canvasRef.current && dragStartPos.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / (PIXELS_PER_FOOT * (zoom / 100));
        const y = (e.clientY - rect.top) / (PIXELS_PER_FOOT * (zoom / 100));
        onEquipmentMove(equipmentId, { x, y });
      }
      dragStartPos.current = null;
    },
    [zoom, onEquipmentMove]
  );

  const handleRotationMouseDown = useCallback(
    (e: React.MouseEvent, equipmentId: string) => {
      if (!room) return;
      e.preventDefault();
      e.stopPropagation();

      const equipment = room.placedEquipment.find((pe) => pe.id === equipmentId);
      if (!equipment || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.left + equipment.x * PIXELS_PER_FOOT * (zoom / 100);
      const centerY = rect.top + equipment.y * PIXELS_PER_FOOT * (zoom / 100);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - centerX;
        const dy = moveEvent.clientY - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        angle = Math.round(angle / 15) * 15; // Snap to 15-degree increments
        if (angle < 0) angle += 360;
        onEquipmentRotate(equipmentId, angle);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [room, zoom, onEquipmentRotate]
  );

  // Handle empty room state
  if (!room) {
    return (
      <div
        data-testid="design-canvas"
        role="application"
        aria-label="Room design canvas"
        className="design-canvas design-canvas--empty"
        tabIndex={0}
      >
        <p className="design-canvas__empty-message">No room selected</p>
      </div>
    );
  }

  const scale = zoom / 100;
  const canvasWidth = room.width * PIXELS_PER_FOOT * scale;
  const canvasHeight = room.length * PIXELS_PER_FOOT * scale;

  return (
    <div
      ref={canvasRef}
      data-testid="design-canvas"
      role="application"
      aria-label={`Room design canvas for ${room.name}`}
      className={`design-canvas ${isDragOver ? 'drop-target' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Status announcer for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Toolbar */}
      <div className="design-canvas__toolbar">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={handleZoomIn}
          className="design-canvas__btn"
        >
          +
        </button>
        <span data-testid="zoom-level" className="design-canvas__zoom-level">
          {zoom}%
        </span>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={handleZoomOut}
          className="design-canvas__btn"
        >
          -
        </button>
        <button
          type="button"
          aria-label="Reset zoom"
          onClick={handleZoomReset}
          className="design-canvas__btn"
        >
          100%
        </button>
        <button
          type="button"
          aria-label="Center view"
          onClick={handleCenter}
          className="design-canvas__btn"
        >
          Center
        </button>
        <button
          type="button"
          aria-label="Toggle grid"
          onClick={handleToggleGrid}
          className="design-canvas__btn"
        >
          Grid
        </button>
      </div>

      {/* Canvas area */}
      <div className="design-canvas__viewport">
        {/* Inner container for centering */}
        <div
          className="design-canvas__inner"
          style={{
            minWidth: canvasWidth + 80,
            minHeight: canvasHeight + 80,
          }}
        >
          {/* Grid */}
          {showGrid && (
            <div
              data-testid="canvas-grid"
              data-spacing={GRID_SPACING}
              className="design-canvas__grid"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                backgroundSize: `${PIXELS_PER_FOOT * scale}px ${PIXELS_PER_FOOT * scale}px`,
                '--grid-size': `${PIXELS_PER_FOOT * scale}px`,
              } as React.CSSProperties}
            />
          )}

          {/* Room Boundary */}
          <div
            data-testid="room-boundary"
            data-width={room.width}
            data-length={room.length}
            className="design-canvas__boundary"
            style={{
              width: canvasWidth,
              height: canvasHeight,
            }}
          >
          {/* Dimension labels */}
          <span className="design-canvas__dimension design-canvas__dimension--width">
            {room.width} ft
          </span>
          <span className="design-canvas__dimension design-canvas__dimension--length">
            {room.length} ft
          </span>
        </div>

        {/* Placed Equipment */}
        {room.placedEquipment.map((pe) => {
          const equipment = equipmentMap.get(pe.equipmentId);
          const isSelected = selectedEquipmentId === pe.id;
          const displayName = equipment
            ? getEquipmentDisplayName(equipment)
            : 'Equipment';

          return (
            <div
              key={pe.id}
              data-testid={`placed-equipment-${pe.id}`}
              draggable
              aria-label={`${displayName} at position ${pe.x}, ${pe.y}`}
              className={`design-canvas__equipment ${isSelected ? 'selected' : ''}`}
              style={{
                transform: `translate(${pe.x * PIXELS_PER_FOOT * scale}px, ${pe.y * PIXELS_PER_FOOT * scale}px) rotate(${pe.rotation}deg)`,
                width: equipment
                  ? equipment.dimensions.width * PIXELS_PER_FOOT * scale
                  : 20,
                height: equipment
                  ? equipment.dimensions.depth * PIXELS_PER_FOOT * scale
                  : 20,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEquipmentSelect(pe.id);
              }}
              onDragStart={(e) => handleEquipmentDragStart(e, pe.id)}
              onDragEnd={(e) => handleEquipmentDragEnd(e, pe.id)}
              title={displayName}
            >
              {equipment && (
                <span className="design-canvas__equipment-label">{displayName}</span>
              )}

              {/* Rotation handle */}
              {isSelected && (
                <div
                  data-testid={`rotation-handle-${pe.id}`}
                  className="design-canvas__rotation-handle"
                  onMouseDown={(e) => handleRotationMouseDown(e, pe.id)}
                />
              )}
            </div>
          );
        })}

          {/* Empty state placeholder */}
          {room.placedEquipment.length === 0 && (
            <div className="design-canvas__placeholder">
              <p>Drag equipment from the palette to place it in the room</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
