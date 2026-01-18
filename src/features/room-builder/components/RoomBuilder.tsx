/**
 * RoomBuilder Component
 *
 * Main page component for designing rooms with equipment placement.
 * Composes canvas, properties panel, validation panel, and equipment palette.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DesignCanvas } from './DesignCanvas';
import { RoomPropertiesPanel } from './RoomPropertiesPanel';
import { ValidationPanel, type ValidationItem } from './ValidationPanel';
import {
  useRoom,
  useUpdateRoom,
  useAddPlacedEquipment,
  useRemovePlacedEquipment,
  useUpdatePlacedEquipment,
} from '../use-rooms';
import { useEquipmentList } from '@/features/equipment/use-equipment';
import { ruleEngine } from '@/features/standards/rule-engine';
import type { RoomFormData, PlacedEquipment } from '@/types/room';
import type { Equipment } from '@/types/equipment';

interface RoomBuilderProps {
  roomId: string;
}

export function RoomBuilder({ roomId }: RoomBuilderProps) {
  const { data: room, isLoading, isError } = useRoom(roomId);
  const { data: equipmentList = [] } = useEquipmentList();
  const updateRoom = useUpdateRoom();
  const addPlacedEquipment = useAddPlacedEquipment();
  const removePlacedEquipment = useRemovePlacedEquipment();
  const updatePlacedEquipment = useUpdatePlacedEquipment();

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Create equipment map for quick lookups
  const equipmentMap = useMemo(() => {
    return new Map(equipmentList.map((eq) => [eq.id, eq]));
  }, [equipmentList]);

  // Get unique categories from equipment
  const categories = useMemo(() => {
    const cats = new Set(equipmentList.map((eq) => eq.category));
    return ['all', ...Array.from(cats)];
  }, [equipmentList]);

  // Filter equipment by selected category
  const filteredEquipment = useMemo(() => {
    if (selectedCategory === 'all') return equipmentList;
    return equipmentList.filter((eq) => eq.category === selectedCategory);
  }, [equipmentList, selectedCategory]);

  // Run validation when room changes
  // TODO: Fetch actual rules from standards service when integrated
  const validationResult = useMemo(() => {
    if (!room) return { isValid: true, errors: [], warnings: [], suggestions: [] };

    // Build context from room properties
    const context = {
      roomType: room.roomType,
      platform: room.platform,
      ecosystem: room.ecosystem,
      tier: room.tier,
      width: room.width,
      length: room.length,
      ceilingHeight: room.ceilingHeight,
      equipmentCount: room.placedEquipment.length,
    };

    // Validate against rules (empty for now, will be populated from standards service)
    return ruleEngine.validateDesign([], context);
  }, [room]);

  // Convert validation results to ValidationItem format
  const validationItems: ValidationItem[] = useMemo(() => {
    const items: ValidationItem[] = [];

    for (const error of validationResult.errors) {
      items.push({
        id: `error-${error.ruleId || items.length}`,
        type: 'error',
        message: error.message,
      });
    }

    for (const warning of validationResult.warnings) {
      items.push({
        id: `warning-${warning.ruleId || items.length}`,
        type: 'warning',
        message: warning.message,
      });
    }

    return items;
  }, [validationResult]);

  // Handle room property updates
  const handleRoomUpdate = useCallback(
    (data: Partial<RoomFormData>) => {
      if (!room) return;
      updateRoom.mutate({ id: room.id, data });
    },
    [room, updateRoom]
  );

  // Handle equipment selection
  const handleEquipmentSelect = useCallback(
    (id: string | null) => {
      setSelectedEquipmentId(id);
      if (id) {
        const equipment = equipmentMap.get(
          room?.placedEquipment.find((pe) => pe.id === id)?.equipmentId || ''
        );
        if (equipment) {
          setStatusMessage(`Selected: ${equipment.manufacturer} ${equipment.model}`);
        }
      } else {
        setStatusMessage('Selection cleared');
      }
    },
    [room, equipmentMap]
  );

  // Handle equipment move
  const handleEquipmentMove = useCallback(
    (id: string, position: { x: number; y: number }) => {
      if (!room) return;
      updatePlacedEquipment.mutate({
        roomId: room.id,
        placedEquipmentId: id,
        updates: { x: position.x, y: position.y },
      });
    },
    [room, updatePlacedEquipment]
  );

  // Handle equipment rotation
  const handleEquipmentRotate = useCallback(
    (id: string, rotation: number) => {
      if (!room) return;
      updatePlacedEquipment.mutate({
        roomId: room.id,
        placedEquipmentId: id,
        updates: { rotation },
      });
    },
    [room, updatePlacedEquipment]
  );

  // Handle dropping new equipment onto canvas
  const handleEquipmentDrop = useCallback(
    (equipmentId: string, position: { x: number; y: number }) => {
      if (!room) return;

      const newPlacedEquipment: PlacedEquipment = {
        id: `pe-${Date.now()}`,
        equipmentId,
        x: position.x,
        y: position.y,
        rotation: 0,
        mountType: 'floor',
      };

      addPlacedEquipment.mutate({
        roomId: room.id,
        equipment: newPlacedEquipment,
      });
    },
    [room, addPlacedEquipment]
  );

  // Handle deleting selected equipment
  const handleDeleteEquipment = useCallback(() => {
    if (!room || !selectedEquipmentId) return;
    removePlacedEquipment.mutate({
      roomId: room.id,
      placedEquipmentId: selectedEquipmentId,
    });
    setSelectedEquipmentId(null);
    setStatusMessage('Equipment deleted');
  }, [room, selectedEquipmentId, removePlacedEquipment]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedEquipmentId(null);
        setStatusMessage('Selection cleared');
      } else if (e.key === 'r' && selectedEquipmentId && room) {
        const equipment = room.placedEquipment.find(
          (pe) => pe.id === selectedEquipmentId
        );
        if (equipment) {
          const newRotation = (equipment.rotation + 90) % 360;
          updatePlacedEquipment.mutate({
            roomId: room.id,
            placedEquipmentId: selectedEquipmentId,
            updates: { rotation: newRotation },
          });
          setStatusMessage(`Rotated to ${newRotation}°`);
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEquipmentId) {
        handleDeleteEquipment();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEquipmentId, room, updatePlacedEquipment, handleDeleteEquipment]);

  // Handle palette equipment drag start
  const handlePaletteDragStart = (e: React.DragEvent, equipment: Equipment) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ equipmentId: equipment.id }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Get selected equipment details
  const selectedPlacedEquipment = room?.placedEquipment.find(
    (pe) => pe.id === selectedEquipmentId
  );
  const selectedEquipmentDetails = selectedPlacedEquipment
    ? equipmentMap.get(selectedPlacedEquipment.equipmentId)
    : null;

  if (isLoading) {
    return (
      <div data-testid="room-builder" className="room-builder room-builder--loading">
        <p>Loading room...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div data-testid="room-builder" className="room-builder room-builder--error">
        <p>Error loading room. Please try again.</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div data-testid="room-builder" className="room-builder room-builder--not-found">
        <p>Room not found.</p>
      </div>
    );
  }

  return (
    <main data-testid="room-builder" className="room-builder">
      {/* Screen reader status announcer */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Header */}
      <header className="room-builder__header">
        <h1 className="room-builder__title">{room.name}</h1>
        <div className="room-builder__toolbar">
          <button type="button" className="room-builder__btn" aria-label="Undo" disabled>
            Undo
          </button>
          <button type="button" className="room-builder__btn" aria-label="Redo" disabled>
            Redo
          </button>
          <button
            type="button"
            className="room-builder__btn room-builder__btn--primary"
            aria-label="Save"
          >
            Save
          </button>
          {selectedEquipmentId && (
            <button
              type="button"
              className="room-builder__btn room-builder__btn--danger"
              aria-label="Delete"
              onClick={handleDeleteEquipment}
            >
              Delete
            </button>
          )}
        </div>
      </header>

      {/* Main content area */}
      <div className="room-builder__content">
        {/* Equipment Palette (left sidebar) */}
        <aside data-testid="equipment-palette" className="room-builder__palette">
          <h2 className="room-builder__palette-title">Equipment</h2>

          {/* Category filters */}
          <div className="room-builder__categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`room-builder__category-btn ${
                  selectedCategory === category
                    ? 'room-builder__category-btn--active'
                    : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Equipment list */}
          <div className="room-builder__equipment-list">
            {filteredEquipment.map((equipment) => (
              <div
                key={equipment.id}
                data-testid={`palette-equipment-${equipment.id}`}
                className="room-builder__equipment-item"
                draggable
                onDragStart={(e) => handlePaletteDragStart(e, equipment)}
              >
                <span className="room-builder__equipment-name">
                  {equipment.manufacturer} {equipment.model}
                </span>
                <span className="room-builder__equipment-category">
                  {equipment.category}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Design Canvas (center) */}
        <section className="room-builder__canvas-area">
          <div className="room-builder__stats">
            <span>{room.placedEquipment.length} equipment placed</span>
          </div>
          <DesignCanvas
            room={room}
            equipmentMap={equipmentMap}
            selectedEquipmentId={selectedEquipmentId}
            onEquipmentSelect={handleEquipmentSelect}
            onEquipmentMove={handleEquipmentMove}
            onEquipmentRotate={handleEquipmentRotate}
            onEquipmentDrop={handleEquipmentDrop}
          />
        </section>

        {/* Right sidebar */}
        <aside className="room-builder__sidebar">
          {/* Room Properties */}
          <RoomPropertiesPanel room={room} onUpdate={handleRoomUpdate} />

          {/* Selected Equipment Details */}
          {selectedEquipmentDetails && (
            <div className="room-builder__selection-details">
              <h3 className="room-builder__selection-title">Selected Equipment</h3>
              <p className="room-builder__selection-name">
                {selectedEquipmentDetails.manufacturer} {selectedEquipmentDetails.model}
              </p>
              <p className="room-builder__selection-info">
                Position: ({selectedPlacedEquipment?.x.toFixed(1)},{' '}
                {selectedPlacedEquipment?.y.toFixed(1)})
              </p>
              <p className="room-builder__selection-info">
                Rotation: {selectedPlacedEquipment?.rotation}°
              </p>
            </div>
          )}

          {/* Validation Panel */}
          <ValidationPanel items={validationItems} title="Validation" showSummary />
        </aside>
      </div>
    </main>
  );
}
