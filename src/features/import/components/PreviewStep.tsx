/**
 * Preview Step
 *
 * Validation preview for the import wizard.
 * Shows validation results and allows users to exclude rows with errors.
 */

import { useCallback, useMemo } from 'react';
import { useImportStore } from '../import-store';
import type { ValidationResult, ParsedRow, ColumnMapping, EquipmentField } from '../import-types';

// ============================================================================
// Types
// ============================================================================

interface PreviewStepProps {
  parsedRows: ParsedRow[];
  columnMappings: ColumnMapping[];
  validationResults: ValidationResult[];
  excludedRows: Set<number>;
}

// ============================================================================
// Constants
// ============================================================================

const FIELD_LABELS: Record<EquipmentField, string> = {
  manufacturer: 'Manufacturer',
  model: 'Model',
  sku: 'SKU',
  cost: 'Cost',
  msrp: 'MSRP',
  description: 'Description',
  category: 'Category',
  subcategory: 'Subcategory',
  height: 'Height',
  width: 'Width',
  depth: 'Depth',
  weight: 'Weight',
  voltage: 'Voltage',
  wattage: 'Wattage',
  certifications: 'Certifications',
  imageUrl: 'Image URL',
};

// ============================================================================
// Component
// ============================================================================

export function PreviewStep({
  parsedRows,
  columnMappings,
  validationResults,
  excludedRows,
}: PreviewStepProps) {
  const toggleRowExclusion = useImportStore((state) => state.toggleRowExclusion);
  const excludeRows = useImportStore((state) => state.excludeRows);
  const includeAllRows = useImportStore((state) => state.includeAllRows);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = parsedRows.length;
    const excluded = excludedRows.size;
    const included = total - excluded;

    const validRows = validationResults.filter(
      (r) => r.status === 'valid' && !excludedRows.has(r.rowNumber)
    ).length;

    const incompleteRows = validationResults.filter(
      (r) => r.status === 'incomplete' && !excludedRows.has(r.rowNumber)
    ).length;

    const invalidRows = validationResults.filter(
      (r) => r.status === 'invalid' && !excludedRows.has(r.rowNumber)
    ).length;

    // Count rows that would create new items vs update existing
    const toCreate = validationResults.filter(
      (r) => r.matchType === 'new' && !excludedRows.has(r.rowNumber)
    ).length;

    const toUpdate = validationResults.filter(
      (r) => (r.matchType === 'update_sku' || r.matchType === 'update_fallback') && !excludedRows.has(r.rowNumber)
    ).length;

    return {
      total,
      included,
      excluded,
      validRows,
      incompleteRows,
      invalidRows,
      toCreate,
      toUpdate,
    };
  }, [parsedRows, validationResults, excludedRows]);

  // Get rows that have errors for quick exclusion
  const invalidRowNumbers = useMemo(
    () => validationResults.filter((r) => r.status === 'invalid').map((r) => r.rowNumber),
    [validationResults]
  );

  const handleExcludeInvalid = useCallback(() => {
    excludeRows(invalidRowNumbers);
  }, [excludeRows, invalidRowNumbers]);

  const handleIncludeAll = useCallback(() => {
    includeAllRows();
  }, [includeAllRows]);

  // Get mapped columns for display
  const mappedColumns = useMemo(
    () => columnMappings.filter((m) => m.targetField !== null),
    [columnMappings]
  );

  return (
    <div className="preview-step">
      {/* Summary Stats */}
      <div className="preview-step__summary">
        <div className="preview-step__stat">
          <div className="preview-step__stat-value">{stats.total}</div>
          <div className="preview-step__stat-label">Total Rows</div>
        </div>
        <div className="preview-step__stat">
          <div className="preview-step__stat-value preview-step__stat-value--success">
            {stats.toCreate}
          </div>
          <div className="preview-step__stat-label">To Create</div>
        </div>
        <div className="preview-step__stat">
          <div className="preview-step__stat-value">{stats.toUpdate}</div>
          <div className="preview-step__stat-label">To Update</div>
        </div>
        <div className="preview-step__stat">
          <div className="preview-step__stat-value preview-step__stat-value--warning">
            {stats.incompleteRows}
          </div>
          <div className="preview-step__stat-label">Incomplete</div>
        </div>
        <div className="preview-step__stat">
          <div className="preview-step__stat-value preview-step__stat-value--error">
            {stats.invalidRows}
          </div>
          <div className="preview-step__stat-label">Invalid</div>
        </div>
        <div className="preview-step__stat">
          <div className="preview-step__stat-value preview-step__stat-value--muted">
            {stats.excluded}
          </div>
          <div className="preview-step__stat-label">Excluded</div>
        </div>
      </div>

      {/* Quick Actions */}
      {(stats.invalidRows > 0 || stats.excluded > 0) && (
        <div className="preview-step__actions">
          {stats.invalidRows > 0 && (
            <button
              type="button"
              className="preview-step__action-btn"
              onClick={handleExcludeInvalid}
            >
              Exclude Invalid ({invalidRowNumbers.length})
            </button>
          )}
          {stats.excluded > 0 && (
            <button
              type="button"
              className="preview-step__action-btn preview-step__action-btn--secondary"
              onClick={handleIncludeAll}
            >
              Include All ({stats.excluded} excluded)
            </button>
          )}
        </div>
      )}

      {/* Validation Table */}
      <div className="preview-step__table-wrapper">
        <table className="preview-step__table">
          <thead>
            <tr>
              <th className="preview-step__th-checkbox">
                <span className="sr-only">Include</span>
              </th>
              <th className="preview-step__th-status">Status</th>
              <th className="preview-step__th-row">#</th>
              {mappedColumns.map((col) => (
                <th key={col.sourceColumn}>
                  {col.targetField ? FIELD_LABELS[col.targetField] : col.sourceHeader}
                </th>
              ))}
              <th className="preview-step__th-issues">Issues</th>
            </tr>
          </thead>
          <tbody>
            {validationResults.map((result) => {
              const row = parsedRows.find((r) => r.rowNumber === result.rowNumber);
              const isExcluded = excludedRows.has(result.rowNumber);

              return (
                <tr
                  key={result.rowNumber}
                  className={`preview-step__row preview-step__row--${result.status} ${
                    isExcluded ? 'preview-step__row--excluded' : ''
                  }`}
                >
                  <td className="preview-step__td-checkbox">
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={() => toggleRowExclusion(result.rowNumber)}
                      aria-label={`Include row ${result.rowNumber}`}
                    />
                  </td>
                  <td className="preview-step__td-status">
                    <StatusBadge status={result.status} matchType={result.matchType} />
                  </td>
                  <td className="preview-step__td-row">{result.rowNumber}</td>
                  {mappedColumns.map((col) => {
                    const cellValue = row?.cells[col.sourceColumn] ?? '';
                    // Check if this field is missing
                    const isMissing = col.targetField && result.missingFields.includes(col.targetField);

                    return (
                      <td
                        key={col.sourceColumn}
                        className={isMissing ? 'preview-step__td--error' : ''}
                        title={isMissing ? `Missing required field: ${col.targetField}` : undefined}
                      >
                        {truncateCell(cellValue)}
                      </td>
                    );
                  })}
                  <td className="preview-step__td-issues">
                    {(result.errors.length > 0 || result.missingFields.length > 0) ? (
                      <span className="preview-step__issues-text">
                        {[
                          ...result.errors,
                          ...result.missingFields.map((f) => `Missing: ${FIELD_LABELS[f]}`),
                        ].join('; ')}
                      </span>
                    ) : (
                      <span className="preview-step__issues-none">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note about validation */}
      {validationResults.length === 0 && (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            padding: 'var(--spacing-6)',
          }}
        >
          Validation will run when connected to the database.
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface StatusBadgeProps {
  status: ValidationResult['status'];
  matchType: ValidationResult['matchType'];
}

function StatusBadge({ status, matchType }: StatusBadgeProps) {
  const getLabel = () => {
    if (status === 'invalid') return 'Invalid';
    if (status === 'incomplete') return 'Incomplete';
    if (matchType === 'new') return 'New';
    if (matchType === 'update_sku' || matchType === 'update_fallback') return 'Update';
    return 'Valid';
  };

  return (
    <span className={`preview-step__badge preview-step__badge--${status}`}>{getLabel()}</span>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function truncateCell(value: string, maxLength = 30): string {
  if (value.length <= maxLength) return value;
  return value.substring(0, maxLength - 3) + '...';
}
