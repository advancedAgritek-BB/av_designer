/**
 * Confirm Step
 *
 * Final confirmation step for the import wizard.
 * Shows import summary and option to save column mappings as a template.
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/auth-store';
import { useCreateSourceTemplate } from '../use-source-templates';
import type { ImportSession, ValidationResult } from '../import-types';

// ============================================================================
// Types
// ============================================================================

interface ConfirmStepProps {
  session: ImportSession;
  validationResults: ValidationResult[];
  excludedRows: Set<number>;
  onImport: () => void;
  isImporting: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ConfirmStep({
  session,
  validationResults,
  excludedRows,
  onImport,
  isImporting,
}: ConfirmStepProps) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateError, setTemplateError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const createTemplate = useCreateSourceTemplate();

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalRows = session.parsedRows.length;
    const excludedCount = excludedRows.size;
    const includedRows = totalRows - excludedCount;

    const toCreate = validationResults.filter(
      (r) => r.matchType === 'new' && !excludedRows.has(r.rowNumber)
    ).length;

    const toUpdate = validationResults.filter(
      (r) => (r.matchType === 'update_sku' || r.matchType === 'update_fallback') && !excludedRows.has(r.rowNumber)
    ).length;

    const invalidCount = validationResults.filter(
      (r) => r.status === 'invalid' && !excludedRows.has(r.rowNumber)
    ).length;

    const incompleteCount = validationResults.filter(
      (r) => r.status === 'incomplete' && !excludedRows.has(r.rowNumber)
    ).length;

    return {
      totalRows,
      excludedCount,
      includedRows,
      toCreate,
      toUpdate,
      invalidCount,
      incompleteCount,
    };
  }, [session.parsedRows.length, validationResults, excludedRows]);

  // Get mapped columns for summary
  const mappedColumns = useMemo(
    () => session.columnMappings.filter((m) => m.targetField !== null),
    [session.columnMappings]
  );

  const handleSaveTemplateChange = useCallback((checked: boolean) => {
    setSaveAsTemplate(checked);
    if (checked && !templateName) {
      // Suggest a name based on the file
      const baseName = session.fileName.replace(/\.[^/.]+$/, '');
      setTemplateName(`${baseName} Template`);
    }
  }, [session.fileName, templateName]);

  const handleImport = useCallback(async () => {
    // If saving as template, create it first
    if (saveAsTemplate && templateName.trim()) {
      try {
        setTemplateError(null);
        const orgId = user?.id ?? ''; // In production, get from org context

        await createTemplate.mutateAsync({
          orgId,
          name: templateName.trim(),
          description: templateDescription.trim() || null,
          fileType: session.fileType,
          columnMappings: session.columnMappings,
          createdBy: user?.id ?? null,
        });
      } catch (err) {
        setTemplateError(err instanceof Error ? err.message : 'Failed to save template');
        return; // Don't proceed with import if template save failed
      }
    }

    onImport();
  }, [
    saveAsTemplate,
    templateName,
    templateDescription,
    session.fileType,
    session.columnMappings,
    user?.id,
    createTemplate,
    onImport,
  ]);

  const canImport = stats.includedRows > 0 && stats.invalidCount === 0;

  return (
    <div className="confirm-step">
      {/* Import Summary */}
      <div className="confirm-step__summary">
        <h3 className="confirm-step__section-title">Import Summary</h3>

        <div className="confirm-step__row">
          <span className="confirm-step__label">File</span>
          <span className="confirm-step__value">{session.fileName}</span>
        </div>

        <div className="confirm-step__row">
          <span className="confirm-step__label">File Type</span>
          <span className="confirm-step__value">{session.fileType.toUpperCase()}</span>
        </div>

        <div className="confirm-step__row">
          <span className="confirm-step__label">Total Rows</span>
          <span className="confirm-step__value">{stats.totalRows}</span>
        </div>

        {stats.excludedCount > 0 && (
          <div className="confirm-step__row">
            <span className="confirm-step__label">Excluded Rows</span>
            <span className="confirm-step__value confirm-step__value--muted">
              {stats.excludedCount}
            </span>
          </div>
        )}

        <div className="confirm-step__row">
          <span className="confirm-step__label">Rows to Import</span>
          <span className="confirm-step__value confirm-step__value--highlight">
            {stats.includedRows}
          </span>
        </div>

        <div className="confirm-step__row">
          <span className="confirm-step__label">New Equipment</span>
          <span className="confirm-step__value confirm-step__value--success">{stats.toCreate}</span>
        </div>

        <div className="confirm-step__row">
          <span className="confirm-step__label">Updates</span>
          <span className="confirm-step__value">{stats.toUpdate}</span>
        </div>

        {stats.incompleteCount > 0 && (
          <div className="confirm-step__row">
            <span className="confirm-step__label">Incomplete</span>
            <span className="confirm-step__value confirm-step__value--warning">
              {stats.incompleteCount}
            </span>
          </div>
        )}

        {stats.invalidCount > 0 && (
          <div className="confirm-step__row">
            <span className="confirm-step__label">Invalid (will skip)</span>
            <span className="confirm-step__value confirm-step__value--error">
              {stats.invalidCount}
            </span>
          </div>
        )}
      </div>

      {/* Column Mappings Summary */}
      <div className="confirm-step__mappings">
        <h3 className="confirm-step__section-title">Column Mappings</h3>
        <div className="confirm-step__mapping-list">
          {mappedColumns.map((mapping) => (
            <div key={mapping.sourceColumn} className="confirm-step__mapping-item">
              <span className="confirm-step__mapping-source">{mapping.sourceHeader}</span>
              <ArrowIcon />
              <span className="confirm-step__mapping-target">{mapping.targetField}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save as Template Option */}
      <div className="confirm-step__save-template">
        <label className="confirm-step__checkbox-label">
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => handleSaveTemplateChange(e.target.checked)}
          />
          <span>Save column mappings as a template for future imports</span>
        </label>

        {saveAsTemplate && (
          <div className="confirm-step__template-fields">
            <div className="confirm-step__field">
              <label htmlFor="template-name" className="confirm-step__field-label">
                Template Name *
              </label>
              <input
                id="template-name"
                type="text"
                className="confirm-step__field-input"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Poly Price List"
              />
            </div>

            <div className="confirm-step__field">
              <label htmlFor="template-description" className="confirm-step__field-label">
                Description (optional)
              </label>
              <textarea
                id="template-description"
                className="confirm-step__field-textarea"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="e.g., Column mappings for quarterly Poly price updates"
                rows={2}
              />
            </div>

            {templateError && (
              <div className="confirm-step__template-error">{templateError}</div>
            )}
          </div>
        )}
      </div>

      {/* Error Notice */}
      {stats.invalidCount > 0 && (
        <div className="confirm-step__notice confirm-step__notice--warning">
          <WarningIcon />
          <span>
            {stats.invalidCount} row{stats.invalidCount !== 1 ? 's' : ''} with errors will be skipped.
            Go back to Preview to exclude them or fix the source file.
          </span>
        </div>
      )}

      {/* Cannot Import Notice */}
      {!canImport && stats.includedRows === 0 && (
        <div className="confirm-step__notice confirm-step__notice--error">
          <ErrorIcon />
          <span>No rows to import. Please go back and include at least one row.</span>
        </div>
      )}

      {/* Import Button */}
      <div className="confirm-step__actions">
        <button
          type="button"
          className="confirm-step__import-btn"
          onClick={handleImport}
          disabled={!canImport || isImporting || (saveAsTemplate && !templateName.trim())}
        >
          {isImporting ? (
            <>
              <Spinner /> Importing...
            </>
          ) : (
            <>Import {stats.includedRows} Equipment Items</>
          )}
        </button>
      </div>
    </div>
  );
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
      className="confirm-step__arrow-icon"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="confirm-step__spinner"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}
