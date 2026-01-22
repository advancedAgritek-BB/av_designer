/**
 * Equipment Package Template Editor
 */
import { Button, Input } from '@/components/ui';
import { useEquipmentList } from '@/features/equipment/use-equipment';
import type { EquipmentPackageContent, EquipmentPackageItem } from '../template-types';

interface PackageEditorProps {
  value: EquipmentPackageContent;
  onChange: (value: EquipmentPackageContent) => void;
}

export function PackageEditor({ value, onChange }: PackageEditorProps) {
  const { data: equipmentList = [] } = useEquipmentList();

  const update = (updates: Partial<EquipmentPackageContent>) => {
    onChange({ ...value, ...updates });
  };

  const updateItem = (index: number, updates: Partial<EquipmentPackageItem>) => {
    const next = value.items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    update({ items: next });
  };

  const addItem = () => {
    update({ items: [...value.items, { equipmentId: '', quantity: 1 }] });
  };

  const removeItem = (index: number) => {
    update({ items: value.items.filter((_, i) => i !== index) });
  };

  const handleRecalculate = () => {
    const total = value.items.reduce((sum, item) => {
      const equipment = equipmentList.find((eq) => eq.id === item.equipmentId);
      const price = equipment?.msrp ?? equipment?.cost ?? 0;
      return sum + price * item.quantity;
    }, 0);
    update({ totalEstimatedCost: Math.round(total * 100) / 100 });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Package Details</h3>
        <Input
          label="Category"
          value={value.category}
          onChange={(e) => update({ category: e.target.value })}
          placeholder="e.g., Huddle Room Kit"
        />
        <div className="flex items-end gap-3">
          <Input
            label="Total Estimated Cost"
            type="number"
            value={value.totalEstimatedCost}
            onChange={(e) => update({ totalEstimatedCost: Number(e.target.value) || 0 })}
          />
          <Button variant="secondary" type="button" onClick={handleRecalculate}>
            Recalculate
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-secondary">Items</h3>
          <Button variant="secondary" size="sm" type="button" onClick={addItem}>
            Add Item
          </Button>
        </div>

        {value.items.length === 0 && (
          <p className="text-xs text-text-tertiary">Add equipment to the package.</p>
        )}

        <div className="space-y-3">
          {value.items.map((item, index) => (
            <div
              key={`${item.equipmentId}-${index}`}
              className="grid gap-3 md:grid-cols-5"
            >
              <div className="md:col-span-2">
                <label className="label" htmlFor={`package-equipment-${index}`}>
                  Equipment
                </label>
                <input
                  id={`package-equipment-${index}`}
                  className="input"
                  list="package-equipment-options"
                  value={item.equipmentId}
                  onChange={(e) => updateItem(index, { equipmentId: e.target.value })}
                  placeholder="Equipment ID"
                />
              </div>
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, { quantity: Number(e.target.value) || 1 })
                }
              />
              <Input
                label="Notes"
                value={item.notes || ''}
                onChange={(e) => updateItem(index, { notes: e.target.value })}
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => removeItem(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <datalist id="package-equipment-options">
          {equipmentList.map((equipment) => (
            <option
              key={equipment.id}
              value={equipment.id}
              label={`${equipment.manufacturer} ${equipment.model}`}
            />
          ))}
        </datalist>
      </section>
    </div>
  );
}
