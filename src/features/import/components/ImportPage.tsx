/**
 * Import Page
 *
 * Full-page wizard for importing equipment from pricing sheets.
 * Orchestrates the multi-step import flow.
 */

import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useImportStore, selectCanProceed } from '../import-store';
import { FileUploadStep } from './FileUploadStep';
import { TemplateStep } from './TemplateStep';
import { MappingStep } from './MappingStep';
import { PreviewStep } from './PreviewStep';
import { ConfirmStep } from './ConfirmStep';
import type { FileType, ImportStep, EquipmentField } from '../import-types';

// ============================================================================
// Constants
// ============================================================================

const STEPS: { key: ImportStep; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'template', label: 'Template' },
  { key: 'mapping', label: 'Mapping' },
  { key: 'preview', label: 'Preview' },
  { key: 'confirm', label: 'Confirm' },
];

// ============================================================================
// Component
// ============================================================================

export function ImportPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const session = useImportStore((state) => state.session);
  const excludedRows = useImportStore((state) => state.session?.excludedRows ?? new Set<number>());
  const validationResults = useImportStore((state) => state.session?.validationResults ?? []);
  const startSession = useImportStore((state) => state.startSession);
  const clearSession = useImportStore((state) => state.clearSession);
  const nextStep = useImportStore((state) => state.nextStep);
  const prevStep = useImportStore((state) => state.prevStep);
  const setColumnMappings = useImportStore((state) => state.setColumnMappings);

  const canProceed = useImportStore(selectCanProceed);

  const currentStep = session?.step ?? 'upload';
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Handle file selection and parsing
  const handleFileSelect = useCallback(
    async (file: File, fileType: FileType) => {
      setIsLoading(true);
      setError(null);

      try {
        // In Tauri, we need the file path. For now, we'll use a file picker approach.
        // The file object from the browser doesn't give us a path, so we need to handle this differently.
        // For web/demo mode, we can use FileReader to parse CSV directly.
        // For full Tauri mode, we'd use Tauri's file dialog.

        // For now, simulate with a placeholder - in production this would invoke Tauri
        // const parsed = await parseFile(file.path); // Tauri would provide the path

        // Placeholder: Create mock parsed data from the file
        // In production, this would be: const parsed = await parseFile(filePath);
        const mockHeaders = ['Manufacturer', 'Model', 'SKU', 'Cost', 'MSRP', 'Description'];
        const mockRows = [
          {
            rowNumber: 2,
            cells: ['Poly', 'Studio X50', '2200-86260-001', '2500.00', '3499.00', 'Video bar'],
          },
          {
            rowNumber: 3,
            cells: ['Crestron', 'DMPS-4K', 'DMPS-4K-350-C', '4200.00', '5999.00', 'Switcher'],
          },
        ];

        // Start the import session
        startSession({
          fileName: file.name,
          fileType,
          parsedRows: mockRows,
          headers: mockHeaders,
        });

        // Apply auto-detected header mappings
        // const suggestions = await detectHeaders(parsed);
        // For now, use placeholder suggestions
        const mappings = mockHeaders.map((header, index) => ({
          sourceColumn: index,
          sourceHeader: header,
          targetField: suggestField(header),
        }));

        setColumnMappings(mappings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
      } finally {
        setIsLoading(false);
      }
    },
    [startSession, setColumnMappings]
  );

  // Handle cancel/back to equipment
  const handleCancel = useCallback(() => {
    clearSession();
    navigate('/equipment');
  }, [clearSession, navigate]);

  // Handle step navigation
  const handleBack = useCallback(() => {
    if (currentStep === 'upload' || currentStep === 'template') {
      handleCancel();
    } else {
      prevStep();
    }
  }, [currentStep, prevStep, handleCancel]);

  const handleNext = useCallback(() => {
    nextStep();
  }, [nextStep]);

  // Handle final import execution
  const handleImport = useCallback(async () => {
    setIsImporting(true);
    try {
      // In production, this would invoke the actual import logic
      // For now, simulate with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Future: Execute import via Tauri/Supabase
      alert('Import execution will be implemented when connected to the database.');

      // Clear session and navigate back on success
      clearSession();
      navigate('/equipment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  }, [clearSession, navigate]);

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <FileUploadStep onFileSelect={handleFileSelect} isLoading={isLoading} error={error} />
        );

      case 'template':
        return session ? (
          <TemplateStep fileType={session.fileType} onContinue={handleNext} />
        ) : null;

      case 'mapping':
        return session ? (
          <MappingStep
            columnMappings={session.columnMappings}
            parsedRows={session.parsedRows}
          />
        ) : null;

      case 'preview':
        return session ? (
          <PreviewStep
            parsedRows={session.parsedRows}
            columnMappings={session.columnMappings}
            validationResults={validationResults}
            excludedRows={excludedRows}
          />
        ) : null;

      case 'confirm':
        return session ? (
          <ConfirmStep
            session={session}
            validationResults={validationResults}
            excludedRows={excludedRows}
            onImport={handleImport}
            isImporting={isImporting}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="import-wizard">
      {/* Header */}
      <div className="import-wizard__header">
        <Link to="/equipment" className="import-wizard__back">
          <BackIcon /> Back to Equipment
        </Link>
        <h1 className="import-wizard__title">Import Equipment</h1>
      </div>

      {/* Step Indicator */}
      {session && (
        <div className="step-indicator">
          {STEPS.map((step, index) => (
            <div key={step.key} className="step-indicator__step">
              {index > 0 && (
                <div
                  className={`step-indicator__connector ${
                    index <= currentStepIndex ? 'step-indicator__connector--complete' : ''
                  }`}
                />
              )}
              <div
                className={`step-indicator__dot ${
                  index < currentStepIndex
                    ? 'step-indicator__dot--complete'
                    : index === currentStepIndex
                      ? 'step-indicator__dot--current'
                      : ''
                }`}
              />
              <span className="step-indicator__label">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      <div className="import-wizard__content">
        <div className="import-wizard__step">{renderStepContent()}</div>
      </div>

      {/* Footer - ConfirmStep has its own import button */}
      {session && currentStep !== 'upload' && currentStep !== 'confirm' && (
        <div className="import-wizard__footer">
          <div className="import-wizard__footer-left">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          </div>
          <div className="import-wizard__footer-right">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleNext} disabled={!canProceed}>
              Continue
            </Button>
          </div>
        </div>
      )}
      {/* Simplified footer for confirm step */}
      {session && currentStep === 'confirm' && (
        <div className="import-wizard__footer">
          <div className="import-wizard__footer-left">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          </div>
          <div className="import-wizard__footer-right">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function suggestField(header: string): EquipmentField | null {
  const lower = header.toLowerCase().trim();
  if (['manufacturer', 'mfg', 'brand', 'vendor'].includes(lower)) return 'manufacturer';
  if (['model', 'model number'].includes(lower)) return 'model';
  if (['sku', 'part number', 'part #', 'pn'].includes(lower)) return 'sku';
  if (['cost', 'dealer cost', 'unit cost'].includes(lower)) return 'cost';
  if (['msrp', 'list price', 'list'].includes(lower)) return 'msrp';
  if (['description', 'desc'].includes(lower)) return 'description';
  if (['category', 'cat'].includes(lower)) return 'category';
  if (['subcategory', 'sub-category'].includes(lower)) return 'subcategory';
  return null;
}

// ============================================================================
// Icons
// ============================================================================

function BackIcon() {
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
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
