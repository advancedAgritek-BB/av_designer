/**
 * RowEditor Component
 *
 * Inline editor for fixing row issues during import
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import {
  EQUIPMENT_CATEGORIES,
  type ParsedRow,
  type EquipmentCategory,
} from '@/types/equipment';

interface RowEditorProps {
  row: ParsedRow;
  onSave: (rowNumber: number, field: string, value: unknown) => void;
  onClose: () => void;
}

export function RowEditor({ row, onSave, onClose }: RowEditorProps) {
  const [formData, setFormData] = useState(row.data);

  // Reset form when row changes
  useEffect(() => {
    setFormData(row.data);
  }, [row]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save all changed fields
    Object.entries(formData).forEach(([field, value]) => {
      if (value !== row.data[field as keyof typeof row.data]) {
        onSave(row.rowNumber, field, value);
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-primary border border-border rounded-lg w-full max-w-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">Edit Row {row.rowNumber}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Errors Display */}
          {row.errors.length > 0 && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
              <p className="text-sm font-medium text-error mb-1">Errors to fix:</p>
              <ul className="text-sm text-error space-y-0.5">
                {row.errors.map((err, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{err.field}:</span> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label
                htmlFor="edit-manufacturer"
                className="block text-sm text-text-secondary mb-1"
              >
                Manufacturer *
              </label>
              <input
                id="edit-manufacturer"
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-model"
                className="block text-sm text-text-secondary mb-1"
              >
                Model *
              </label>
              <input
                id="edit-model"
                type="text"
                value={formData.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-sku"
                className="block text-sm text-text-secondary mb-1"
              >
                SKU *
              </label>
              <input
                id="edit-sku"
                type="text"
                value={formData.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-category"
                className="block text-sm text-text-secondary mb-1"
              >
                Category *
              </label>
              <select
                id="edit-category"
                value={formData.category || ''}
                onChange={(e) =>
                  handleChange('category', e.target.value as EquipmentCategory)
                }
                className="settings-select"
              >
                <option value="">Select...</option>
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-subcategory"
                className="block text-sm text-text-secondary mb-1"
              >
                Subcategory *
              </label>
              <input
                id="edit-subcategory"
                type="text"
                value={formData.subcategory || ''}
                onChange={(e) => handleChange('subcategory', e.target.value)}
                className="settings-input"
              />
            </div>

            <div className="col-span-2">
              <label
                htmlFor="edit-description"
                className="block text-sm text-text-secondary mb-1"
              >
                Description
              </label>
              <input
                id="edit-description"
                type="text"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-cost"
                className="block text-sm text-text-secondary mb-1"
              >
                Cost (Dealer) *
              </label>
              <input
                id="edit-cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost ?? ''}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-msrp"
                className="block text-sm text-text-secondary mb-1"
              >
                MSRP (List) *
              </label>
              <input
                id="edit-msrp"
                type="number"
                step="0.01"
                min="0"
                value={formData.msrp ?? ''}
                onChange={(e) => handleChange('msrp', parseFloat(e.target.value) || 0)}
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-map"
                className="block text-sm text-text-secondary mb-1"
              >
                MAP Price
              </label>
              <input
                id="edit-map"
                type="number"
                step="0.01"
                min="0"
                value={formData.map ?? ''}
                onChange={(e) =>
                  handleChange(
                    'map',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-contract"
                className="block text-sm text-text-secondary mb-1"
              >
                Contract Price
              </label>
              <input
                id="edit-contract"
                type="number"
                step="0.01"
                min="0"
                value={formData.contract ?? ''}
                onChange={(e) =>
                  handleChange(
                    'contract',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-weight"
                className="block text-sm text-text-secondary mb-1"
              >
                Weight (lbs)
              </label>
              <input
                id="edit-weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight ?? ''}
                onChange={(e) =>
                  handleChange(
                    'weight',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="settings-input"
              />
            </div>

            <div>
              <label
                htmlFor="edit-distributor-sku"
                className="block text-sm text-text-secondary mb-1"
              >
                Distributor SKU
              </label>
              <input
                id="edit-distributor-sku"
                type="text"
                value={formData.distributorSku || ''}
                onChange={(e) => handleChange('distributorSku', e.target.value)}
                className="settings-input"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
