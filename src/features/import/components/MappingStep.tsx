/**
 * Mapping Step
 *
 * Column mapping interface for the import wizard.
 * Allows users to map source columns to equipment fields.
 */

import { useCallback } from 'react';
import { useImportStore, selectUnmappedRequiredFields } from '../import-store';
import type { ColumnMapping, EquipmentField, ParsedRow } from '../import-types';

// ============================================================================
// Types
// ============================================================================

interface MappingStepProps {
  columnMappings: ColumnMapping[];
  parsedRows: ParsedRow[];
  previewRowCount?: number;
}

// ============================================================================
// Constants
// ============================================================================

const FIELD_OPTIONS: { value: EquipmentField | ''; label: string; required?: boolean }[] = [
  { value: '', label: '-- Ignore --' },
  { value: 'manufacturer', label: 'Manufacturer', required: true },
  { value: 'model', label: 'Model', required: true },
  { value: 'sku', label: 'SKU', required: true },
  { value: 'cost', label: 'Cost', required: true },
  { value: 'msrp', label: 'MSRP' },
  { value: 'description', label: 'Description' },
  { value: 'category', label: 'Category' },
  { value: 'subcategory', label: 'Subcategory' },
  { value: 'height', label: 'Height' },
  { value: 'width', label: 'Width' },
  { value: 'depth', label: 'Depth' },
  { value: 'weight', label: 'Weight' },
  { value: 'voltage', label: 'Voltage' },
  { value: 'wattage', label: 'Wattage' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'imageUrl', label: 'Image URL' },
];

// ============================================================================
// Component
// ============================================================================

export function MappingStep({
  columnMappings,
  parsedRows,
  previewRowCount = 5,
}: MappingStepProps) {
  const updateColumnMapping = useImportStore((state) => state.updateColumnMapping);
  const unmappedRequired = useImportStore(selectUnmappedRequiredFields);

  const handleMappingChange = useCallback(
    (columnIndex: number, value: string) => {
      const targetField = value === '' ? null : (value as EquipmentField);
      updateColumnMapping(columnIndex, targetField);
    },
    [updateColumnMapping]
  );

  // Get fields that are already mapped (to disable duplicates)
  const mappedFields = new Set(
    columnMappings.filter((m) => m.targetField !== null).map((m) => m.targetField)
  );

  const previewRows = parsedRows.slice(0, previewRowCount);

  return (
    <div className="mapping-step">
      {/* Header */}
      <div className="mapping-step__preview-header">
        <h2 className="mapping-step__title">Map Columns to Equipment Fields</h2>
        {unmappedRequired.length > 0 ? (
          <span className="mapping-step__required mapping-step__required-missing">
            Missing required: {unmappedRequired.join(', ')}
          </span>
        ) : (
          <span className="mapping-step__required" style={{ color: 'var(--color-status-success)' }}>
            All required fields mapped
          </span>
        )}
      </div>

      {/* Instructions */}
      <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
        Select which equipment field each column should map to. Required fields are marked with *.
      </p>

      {/* Mapping Table */}
      <div className="mapping-step__table-wrapper">
        <table className="mapping-step__table">
          <thead>
            <tr>
              {columnMappings.map((mapping) => (
                <th key={mapping.sourceColumn}>
                  <div className="mapping-step__header-cell">
                    <span className="mapping-step__header-name">{mapping.sourceHeader}</span>
                    <select
                      className="mapping-step__header-select"
                      value={mapping.targetField ?? ''}
                      onChange={(e) => handleMappingChange(mapping.sourceColumn, e.target.value)}
                      aria-label={`Map ${mapping.sourceHeader} column`}
                    >
                      {FIELD_OPTIONS.map((option) => {
                        // Disable if already mapped to another column (unless it's this column's current value)
                        const isDisabled =
                          option.value !== '' &&
                          mappedFields.has(option.value) &&
                          mapping.targetField !== option.value;

                        return (
                          <option
                            key={option.value}
                            value={option.value}
                            disabled={isDisabled}
                          >
                            {option.label}
                            {option.required ? ' *' : ''}
                            {isDisabled ? ' (mapped)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row) => (
              <tr key={row.rowNumber}>
                {row.cells.map((cell, idx) => (
                  <td key={idx}>
                    {cell ? (
                      <span title={cell}>{truncateCell(cell)}</span>
                    ) : (
                      <span style={{ opacity: 0.3 }}>—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row count indicator */}
      {parsedRows.length > previewRowCount && (
        <p
          style={{
            marginTop: 'var(--spacing-2)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          Showing {previewRowCount} of {parsedRows.length} rows
        </p>
      )}

      {/* Mapping Summary */}
      <div
        style={{
          marginTop: 'var(--spacing-6)',
          padding: 'var(--spacing-4)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            marginBottom: 'var(--spacing-3)',
            color: 'var(--color-text-primary)',
          }}
        >
          Mapping Summary
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          {columnMappings
            .filter((m) => m.targetField !== null)
            .map((mapping) => (
              <div
                key={mapping.sourceColumn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {mapping.sourceHeader}
                </span>
                <ArrowIcon />
                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {FIELD_OPTIONS.find((o) => o.value === mapping.targetField)?.label}
                </span>
              </div>
            ))}
          {columnMappings.every((m) => m.targetField === null) && (
            <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
              No columns mapped yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function truncateCell(value: string, maxLength = 40): string {
  if (value.length <= maxLength) return value;
  return value.substring(0, maxLength - 3) + '...';
}

// ============================================================================
// Icons
// ============================================================================

function ArrowIcon() {
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
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
