/**
 * ImportModal Component
 *
 * Main modal orchestrating the equipment CSV import flow
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui';
import { equipmentImportService, VENDOR_TEMPLATES } from '../../import-service';
import type {
  ColumnMapping,
  ImportConfig,
  ImportPreview,
  VendorTemplate,
} from '@/types/equipment';
import { FileUploader } from './FileUploader';
import { ColumnMapper } from './ColumnMapper';
import { ValidationPreview } from './ValidationPreview';
import { RowEditor } from './RowEditor';
import { ImportSummary } from './ImportSummary';
import { TemplateDownloader } from './TemplateDownloader';

type ImportStep = 'upload' | 'mapping' | 'validation' | 'summary' | 'complete';

interface ImportModalProps {
  organizationId: string;
  userId: string;
  onClose: () => void;
  onComplete: (results: { created: number; updated: number }) => void;
}

export function ImportModal({
  organizationId,
  userId,
  onClose,
  onComplete,
}: ImportModalProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<Record<string, string>[]>([]);
  const [detectedTemplate, setDetectedTemplate] = useState<VendorTemplate>();
  const [distributorName, setDistributorName] = useState('WESCO/Anixter');
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>();
  const [importResults, setImportResults] = useState<{
    created: number;
    updated: number;
    failed: { row: number; error: string }[];
  } | null>(null);

  // Step 1: Handle file upload
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    setError(undefined);

    try {
      const parsed = await equipmentImportService.parseCSV(selectedFile);
      setHeaders(parsed.headers);
      setSampleRows(parsed.sampleRows);
      setDetectedTemplate(parsed.detectedTemplate);

      if (parsed.suggestedMappings) {
        setColumnMappings(parsed.suggestedMappings);
      }

      if (parsed.detectedTemplate) {
        setDistributorName(parsed.detectedTemplate.name);
      }

      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Step 2: Handle mapping complete
  const handleMappingComplete = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const config: ImportConfig = {
        columnMappings,
        distributorName,
        duplicateHandling: 'update',
        organizationId,
      };

      const validationResult = await equipmentImportService.validate(file, config);
      setPreview(validationResult);
      setStep('validation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate data');
    } finally {
      setIsLoading(false);
    }
  }, [file, columnMappings, distributorName, organizationId]);

  // Step 3: Handle row edit
  const handleRowEdit = useCallback(
    (rowNumber: number, field: string, value: unknown) => {
      if (!preview) return;
      const updated = equipmentImportService.updateRow(preview, rowNumber, field, value);
      setPreview(updated);
    },
    [preview]
  );

  // Step 4: Handle import execution
  const handleImport = useCallback(async () => {
    if (!file || !preview) return;

    setIsImporting(true);
    setError(undefined);

    try {
      const config: ImportConfig = {
        columnMappings,
        distributorName,
        duplicateHandling: 'update',
        organizationId,
      };

      const results = await equipmentImportService.executeImport(config, preview, userId);
      setImportResults(results);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  }, [file, preview, columnMappings, distributorName, organizationId, userId]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = VENDOR_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setDistributorName(template.name);
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (step) {
      case 'upload':
        return 'Import Equipment';
      case 'mapping':
        return 'Map Columns';
      case 'validation':
        return 'Review Data';
      case 'summary':
        return 'Confirm Import';
      case 'complete':
        return 'Import Complete';
    }
  };

  // Find row being edited
  const rowToEdit = editingRow
    ? preview?.rows.find((r) => r.rowNumber === editingRow)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-primary border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{getStepTitle()}</h2>
            {step !== 'upload' && step !== 'complete' && (
              <p className="text-xs text-text-tertiary mt-0.5">
                Step {step === 'mapping' ? 2 : step === 'validation' ? 3 : 4} of 4
              </p>
            )}
          </div>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <FileUploader
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
                error={error}
              />
              <TemplateDownloader onSelectTemplate={handleTemplateSelect} />
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === 'mapping' && (
            <ColumnMapper
              key={`${headers.join('|')}-${detectedTemplate?.id ?? 'custom'}`}
              headers={headers}
              sampleRows={sampleRows}
              initialMappings={columnMappings}
              detectedTemplate={detectedTemplate}
              distributorName={distributorName}
              onDistributorChange={setDistributorName}
              onMappingsChange={setColumnMappings}
            />
          )}

          {/* Step 3: Validation */}
          {step === 'validation' && preview && (
            <ValidationPreview preview={preview} onEditRow={setEditingRow} />
          )}

          {/* Step 4: Summary */}
          {step === 'summary' && preview && (
            <ImportSummary
              preview={preview}
              distributorName={distributorName}
              onConfirm={handleImport}
              onBack={() => setStep('validation')}
              isImporting={isImporting}
            />
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && importResults && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-500/20 text-green-500 mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Import Complete!
              </h3>

              <div className="inline-flex gap-4 text-sm text-text-secondary mb-6">
                <span>
                  <span className="font-medium text-green-500">
                    {importResults.created}
                  </span>{' '}
                  created
                </span>
                <span>
                  <span className="font-medium text-blue-400">
                    {importResults.updated}
                  </span>{' '}
                  updated
                </span>
                {importResults.failed.length > 0 && (
                  <span>
                    <span className="font-medium text-error">
                      {importResults.failed.length}
                    </span>{' '}
                    failed
                  </span>
                )}
              </div>

              {importResults.failed.length > 0 && (
                <div className="max-w-md mx-auto mb-6 p-4 bg-error/5 rounded-lg border border-error/20 text-left">
                  <p className="text-sm font-medium text-error mb-2">Failed rows:</p>
                  <ul className="text-xs text-text-secondary space-y-1 max-h-32 overflow-y-auto">
                    {importResults.failed.map((f) => (
                      <li key={f.row}>
                        Row {f.row}: {f.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => {
                  onComplete(importResults);
                  onClose();
                }}
              >
                Done
              </Button>
            </div>
          )}
        </div>

        {/* Footer (for steps 2-3) */}
        {(step === 'mapping' || step === 'validation') && (
          <div className="p-4 border-t border-border flex items-center justify-between shrink-0">
            <Button
              variant="secondary"
              onClick={() => setStep(step === 'mapping' ? 'upload' : 'mapping')}
            >
              Back
            </Button>

            <Button
              onClick={() => {
                if (step === 'mapping') {
                  handleMappingComplete();
                } else if (step === 'validation') {
                  setStep('summary');
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        )}
      </div>

      {/* Row Editor Modal */}
      {rowToEdit && (
        <RowEditor
          row={rowToEdit}
          onSave={handleRowEdit}
          onClose={() => setEditingRow(null)}
        />
      )}
    </div>
  );
}
