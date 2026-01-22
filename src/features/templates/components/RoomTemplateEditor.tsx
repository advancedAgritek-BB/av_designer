/**
 * Room Template Editor
 */
import { Button, Input } from '@/components/ui';
import { useEquipmentList } from '@/features/equipment/use-equipment';
import type {
  RoomTemplateContent,
  PlacedEquipmentItem,
  ConnectionItem,
} from '../template-types';
import { ROOM_TYPES, PLATFORMS, ECOSYSTEMS, QUALITY_TIERS } from '@/types/room';

interface RoomTemplateEditorProps {
  value: RoomTemplateContent;
  onChange: (value: RoomTemplateContent) => void;
}

export function RoomTemplateEditor({ value, onChange }: RoomTemplateEditorProps) {
  const { data: equipmentList = [] } = useEquipmentList();

  const update = (updates: Partial<RoomTemplateContent>) => {
    onChange({ ...value, ...updates });
  };

  const updatePlacedEquipment = (
    index: number,
    updates: Partial<PlacedEquipmentItem>
  ) => {
    const next = value.placedEquipment.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    update({ placedEquipment: next });
  };

  const addPlacedEquipment = () => {
    update({
      placedEquipment: [
        ...value.placedEquipment,
        { equipmentId: '', position: { x: 1, y: 1 }, rotation: 0 },
      ],
    });
  };

  const removePlacedEquipment = (index: number) => {
    update({
      placedEquipment: value.placedEquipment.filter((_, i) => i !== index),
    });
  };

  const updateConnection = (index: number, updates: Partial<ConnectionItem>) => {
    const next = value.connections.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    update({ connections: next });
  };

  const addConnection = () => {
    update({
      connections: [
        ...value.connections,
        { fromEquipmentId: '', fromPort: '', toEquipmentId: '', toPort: '' },
      ],
    });
  };

  const removeConnection = (index: number) => {
    update({
      connections: value.connections.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Room Configuration</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="input-wrapper">
            <label className="label" htmlFor="room-template-type">
              Room Type
            </label>
            <select
              id="room-template-type"
              value={value.roomType}
              onChange={(e) =>
                update({ roomType: e.target.value as RoomTemplateContent['roomType'] })
              }
              className="input"
            >
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper">
            <label className="label" htmlFor="room-template-platform">
              Platform
            </label>
            <select
              id="room-template-platform"
              value={value.platform}
              onChange={(e) =>
                update({ platform: e.target.value as RoomTemplateContent['platform'] })
              }
              className="input"
            >
              {PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="input-wrapper">
            <label className="label" htmlFor="room-template-ecosystem">
              Ecosystem
            </label>
            <select
              id="room-template-ecosystem"
              value={value.ecosystem}
              onChange={(e) =>
                update({ ecosystem: e.target.value as RoomTemplateContent['ecosystem'] })
              }
              className="input"
            >
              {ECOSYSTEMS.map((ecosystem) => (
                <option key={ecosystem} value={ecosystem}>
                  {ecosystem}
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper">
            <label className="label" htmlFor="room-template-tier">
              Tier
            </label>
            <select
              id="room-template-tier"
              value={value.tier}
              onChange={(e) =>
                update({ tier: e.target.value as RoomTemplateContent['tier'] })
              }
              className="input"
            >
              {QUALITY_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Width (ft)"
            type="number"
            min="1"
            value={value.width}
            onChange={(e) => update({ width: Number(e.target.value) || 0 })}
          />
          <Input
            label="Length (ft)"
            type="number"
            min="1"
            value={value.length}
            onChange={(e) => update({ length: Number(e.target.value) || 0 })}
          />
          <Input
            label="Ceiling Height (ft)"
            type="number"
            min="1"
            value={value.ceilingHeight}
            onChange={(e) => update({ ceilingHeight: Number(e.target.value) || 0 })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-secondary">Placed Equipment</h3>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={addPlacedEquipment}
          >
            Add Equipment
          </Button>
        </div>

        {value.placedEquipment.length === 0 && (
          <p className="text-xs text-text-tertiary">No equipment placements yet.</p>
        )}

        <div className="space-y-3">
          {value.placedEquipment.map((item, index) => (
            <div
              key={`${item.equipmentId}-${index}`}
              className="grid gap-3 md:grid-cols-6 items-end"
            >
              <div className="md:col-span-2">
                <label className="label" htmlFor={`equipment-id-${index}`}>
                  Equipment
                </label>
                <input
                  id={`equipment-id-${index}`}
                  className="input"
                  list="room-template-equipment"
                  value={item.equipmentId}
                  onChange={(e) =>
                    updatePlacedEquipment(index, { equipmentId: e.target.value })
                  }
                  placeholder="Equipment ID"
                />
              </div>
              <Input
                label="X"
                type="number"
                value={item.position.x}
                onChange={(e) =>
                  updatePlacedEquipment(index, {
                    position: { ...item.position, x: Number(e.target.value) || 0 },
                  })
                }
              />
              <Input
                label="Y"
                type="number"
                value={item.position.y}
                onChange={(e) =>
                  updatePlacedEquipment(index, {
                    position: { ...item.position, y: Number(e.target.value) || 0 },
                  })
                }
              />
              <Input
                label="Rotation"
                type="number"
                value={item.rotation}
                onChange={(e) =>
                  updatePlacedEquipment(index, { rotation: Number(e.target.value) || 0 })
                }
              />
              <div>
                <label className="label" htmlFor={`equipment-label-${index}`}>
                  Label
                </label>
                <input
                  id={`equipment-label-${index}`}
                  className="input"
                  value={item.label || ''}
                  onChange={(e) =>
                    updatePlacedEquipment(index, { label: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => removePlacedEquipment(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <datalist id="room-template-equipment">
          {equipmentList.map((equipment) => (
            <option
              key={equipment.id}
              value={equipment.id}
              label={`${equipment.manufacturer} ${equipment.model}`}
            />
          ))}
        </datalist>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-secondary">Connections</h3>
          <Button variant="secondary" size="sm" type="button" onClick={addConnection}>
            Add Connection
          </Button>
        </div>

        {value.connections.length === 0 && (
          <p className="text-xs text-text-tertiary">No connection rules defined.</p>
        )}

        <div className="space-y-3">
          {value.connections.map((item, index) => (
            <div
              key={`${item.fromEquipmentId}-${index}`}
              className="grid gap-3 md:grid-cols-5"
            >
              <Input
                label="From Equipment"
                value={item.fromEquipmentId}
                onChange={(e) =>
                  updateConnection(index, { fromEquipmentId: e.target.value })
                }
              />
              <Input
                label="From Port"
                value={item.fromPort}
                onChange={(e) => updateConnection(index, { fromPort: e.target.value })}
              />
              <Input
                label="To Equipment"
                value={item.toEquipmentId}
                onChange={(e) =>
                  updateConnection(index, { toEquipmentId: e.target.value })
                }
              />
              <Input
                label="To Port"
                value={item.toPort}
                onChange={(e) => updateConnection(index, { toPort: e.target.value })}
              />
              <div className="flex items-end gap-2">
                <Input
                  label="Cable Type"
                  value={item.cableType || ''}
                  onChange={(e) => updateConnection(index, { cableType: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => removeConnection(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
