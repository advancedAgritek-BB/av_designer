/**
 * Equipment Form - Electrical Specifications Section
 *
 * Collapsible section for voltage, wattage, amperage, PoE class, and BTU output.
 */

import { useState } from 'react';
import type { ElectricalSpecs } from '@/types/equipment';

interface ElectricalProps {
  formId: string;
  electrical: ElectricalSpecs;
  isLoading: boolean;
  onChange: (specs: ElectricalSpecs) => void;
}

export function EquipmentFormElectrical({
  formId,
  electrical,
  isLoading,
  onChange,
}: ElectricalProps) {
  const [expanded, setExpanded] = useState(false);

  const updateField = (
    field: keyof ElectricalSpecs,
    value: number | string | undefined
  ) => {
    onChange({ ...electrical, [field]: value });
  };

  return (
    <div className="equipment-form-section">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="equipment-form-collapse-button"
        aria-expanded={expanded}
        aria-controls={`${formId}-electrical-section`}
      >
        <span>Electrical Specifications</span>
        <ChevronIcon expanded={expanded} />
      </button>

      {expanded && (
        <div
          id={`${formId}-electrical-section`}
          className="equipment-form-collapse-content"
        >
          <div className="equipment-form-row">
            <div className="equipment-form-field">
              <label htmlFor={`${formId}-voltage`} className="label">
                Voltage (V)
              </label>
              <input
                id={`${formId}-voltage`}
                type="number"
                min="0"
                step="1"
                value={electrical.voltage ?? ''}
                onChange={(e) => {
                  const value =
                    e.target.value === '' ? undefined : parseInt(e.target.value);
                  updateField('voltage', value);
                }}
                disabled={isLoading}
                className="input"
              />
            </div>

            <div className="equipment-form-field">
              <label htmlFor={`${formId}-wattage`} className="label">
                Wattage (W)
              </label>
              <input
                id={`${formId}-wattage`}
                type="number"
                min="0"
                step="0.1"
                value={electrical.wattage ?? ''}
                onChange={(e) => {
                  const value =
                    e.target.value === '' ? undefined : parseFloat(e.target.value);
                  updateField('wattage', value);
                }}
                disabled={isLoading}
                className="input"
              />
            </div>
          </div>

          <div className="equipment-form-row">
            <div className="equipment-form-field">
              <label htmlFor={`${formId}-amperage`} className="label">
                Amperage (A)
              </label>
              <input
                id={`${formId}-amperage`}
                type="number"
                min="0"
                step="0.1"
                value={electrical.amperage ?? ''}
                onChange={(e) => {
                  const value =
                    e.target.value === '' ? undefined : parseFloat(e.target.value);
                  updateField('amperage', value);
                }}
                disabled={isLoading}
                className="input"
              />
            </div>

            <div className="equipment-form-field">
              <label htmlFor={`${formId}-poe-class`} className="label">
                PoE Class
              </label>
              <input
                id={`${formId}-poe-class`}
                type="text"
                value={electrical.poeClass ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value;
                  updateField('poeClass', value);
                }}
                disabled={isLoading}
                className="input"
              />
            </div>
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-btu`} className="label">
              BTU Output
            </label>
            <input
              id={`${formId}-btu`}
              type="number"
              min="0"
              step="1"
              value={electrical.btuOutput ?? ''}
              onChange={(e) => {
                const value =
                  e.target.value === '' ? undefined : parseInt(e.target.value);
                updateField('btuOutput', value);
              }}
              disabled={isLoading}
              className="input"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
