/**
 * Import Store
 *
 * Zustand store for managing import wizard state.
 * This is session-based (not persisted) - refreshing clears the import.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ImportSession,
  ImportStep,
  ImportStatus,
  FileType,
  ParsedRow,
  ColumnMapping,
  ValidationResult,
  ImportSummary,
} from './import-types';
import { calculateImportSummary } from './import-types';

interface ImportState {
  /** Current import session (null if no import in progress) */
  session: ImportSession | null;

  /** Calculated summary (derived from session) */
  summary: ImportSummary | null;

  // ==========================================================================
  // Session Lifecycle Actions
  // ==========================================================================

  /** Start a new import session after file parsing */
  startSession: (params: {
    fileName: string;
    fileType: FileType;
    parsedRows: ParsedRow[];
    headers: string[];
  }) => void;

  /** Clear the current session */
  clearSession: () => void;

  // ==========================================================================
  // Step Navigation Actions
  // ==========================================================================

  /** Move to a specific step */
  setStep: (step: ImportStep) => void;

  /** Move to next step */
  nextStep: () => void;

  /** Move to previous step */
  prevStep: () => void;

  // ==========================================================================
  // Column Mapping Actions
  // ==========================================================================

  /** Set initial column mappings from header suggestions */
  setColumnMappings: (mappings: ColumnMapping[]) => void;

  /** Update a single column mapping */
  updateColumnMapping: (columnIndex: number, targetField: ColumnMapping['targetField']) => void;

  /** Apply a source template's mappings */
  applyTemplate: (templateId: string, mappings: ColumnMapping[]) => void;

  // ==========================================================================
  // Validation Actions
  // ==========================================================================

  /** Set validation results after validation completes */
  setValidationResults: (results: ValidationResult[]) => void;

  /** Toggle row exclusion */
  toggleRowExclusion: (rowNumber: number) => void;

  /** Exclude multiple rows */
  excludeRows: (rowNumbers: number[]) => void;

  /** Include all rows (clear exclusions) */
  includeAllRows: () => void;

  // ==========================================================================
  // Status Actions
  // ==========================================================================

  /** Update session status */
  setStatus: (status: ImportStatus) => void;

  /** Set error message */
  setError: (error: string | null) => void;
}

/** Step order for navigation */
const STEP_ORDER: ImportStep[] = [
  'upload',
  'template',
  'mapping',
  'preview',
  'confirm',
  'importing',
  'complete',
];

/** Generate a unique session ID */
function generateSessionId(): string {
  return `import-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Create initial column mappings from headers (all unmapped) */
function createInitialMappings(headers: string[]): ColumnMapping[] {
  return headers.map((header, index) => ({
    sourceColumn: index,
    sourceHeader: header,
    targetField: null,
  }));
}

export const useImportStore = create<ImportState>()(
  devtools(
    (set, get) => ({
      session: null,
      summary: null,

      // ========================================================================
      // Session Lifecycle
      // ========================================================================

      startSession: ({ fileName, fileType, parsedRows, headers }) => {
        const session: ImportSession = {
          id: generateSessionId(),
          fileName,
          fileType,
          sourceTemplateId: null,
          columnMappings: createInitialMappings(headers),
          parsedRows,
          validationResults: [],
          status: 'mapping',
          step: 'template',
          excludedRows: new Set(),
          createdAt: new Date().toISOString(),
          error: null,
        };

        set({ session, summary: null }, false, 'startSession');
      },

      clearSession: () => {
        set({ session: null, summary: null }, false, 'clearSession');
      },

      // ========================================================================
      // Step Navigation
      // ========================================================================

      setStep: (step) => {
        const { session } = get();
        if (!session) return;

        set(
          { session: { ...session, step } },
          false,
          'setStep'
        );
      },

      nextStep: () => {
        const { session } = get();
        if (!session) return;

        const currentIndex = STEP_ORDER.indexOf(session.step);
        if (currentIndex < STEP_ORDER.length - 1) {
          const nextStep = STEP_ORDER[currentIndex + 1];
          set(
            { session: { ...session, step: nextStep } },
            false,
            'nextStep'
          );
        }
      },

      prevStep: () => {
        const { session } = get();
        if (!session) return;

        const currentIndex = STEP_ORDER.indexOf(session.step);
        if (currentIndex > 0) {
          const prevStep = STEP_ORDER[currentIndex - 1];
          set(
            { session: { ...session, step: prevStep } },
            false,
            'prevStep'
          );
        }
      },

      // ========================================================================
      // Column Mapping
      // ========================================================================

      setColumnMappings: (mappings) => {
        const { session } = get();
        if (!session) return;

        set(
          { session: { ...session, columnMappings: mappings } },
          false,
          'setColumnMappings'
        );
      },

      updateColumnMapping: (columnIndex, targetField) => {
        const { session } = get();
        if (!session) return;

        const updatedMappings = session.columnMappings.map((mapping) =>
          mapping.sourceColumn === columnIndex
            ? { ...mapping, targetField }
            : mapping
        );

        set(
          { session: { ...session, columnMappings: updatedMappings } },
          false,
          'updateColumnMapping'
        );
      },

      applyTemplate: (templateId, mappings) => {
        const { session } = get();
        if (!session) return;

        // Merge template mappings with existing (template takes precedence)
        const mergedMappings = session.columnMappings.map((existing) => {
          const templateMapping = mappings.find(
            (m) =>
              m.sourceHeader.toLowerCase() === existing.sourceHeader.toLowerCase()
          );
          return templateMapping
            ? { ...existing, targetField: templateMapping.targetField }
            : existing;
        });

        set(
          {
            session: {
              ...session,
              sourceTemplateId: templateId,
              columnMappings: mergedMappings,
            },
          },
          false,
          'applyTemplate'
        );
      },

      // ========================================================================
      // Validation
      // ========================================================================

      setValidationResults: (results) => {
        const { session } = get();
        if (!session) return;

        const summary = calculateImportSummary(results, session.excludedRows);

        set(
          {
            session: { ...session, validationResults: results, status: 'previewing' },
            summary,
          },
          false,
          'setValidationResults'
        );
      },

      toggleRowExclusion: (rowNumber) => {
        const { session } = get();
        if (!session) return;

        const newExcludedRows = new Set(session.excludedRows);
        if (newExcludedRows.has(rowNumber)) {
          newExcludedRows.delete(rowNumber);
        } else {
          newExcludedRows.add(rowNumber);
        }

        const summary = calculateImportSummary(session.validationResults, newExcludedRows);

        set(
          {
            session: { ...session, excludedRows: newExcludedRows },
            summary,
          },
          false,
          'toggleRowExclusion'
        );
      },

      excludeRows: (rowNumbers) => {
        const { session } = get();
        if (!session) return;

        const newExcludedRows = new Set([...session.excludedRows, ...rowNumbers]);
        const summary = calculateImportSummary(session.validationResults, newExcludedRows);

        set(
          {
            session: { ...session, excludedRows: newExcludedRows },
            summary,
          },
          false,
          'excludeRows'
        );
      },

      includeAllRows: () => {
        const { session } = get();
        if (!session) return;

        const newExcludedRows = new Set<number>();
        const summary = calculateImportSummary(session.validationResults, newExcludedRows);

        set(
          {
            session: { ...session, excludedRows: newExcludedRows },
            summary,
          },
          false,
          'includeAllRows'
        );
      },

      // ========================================================================
      // Status
      // ========================================================================

      setStatus: (status) => {
        const { session } = get();
        if (!session) return;

        set(
          { session: { ...session, status } },
          false,
          'setStatus'
        );
      },

      setError: (error) => {
        const { session } = get();
        if (!session) return;

        set(
          { session: { ...session, error, status: error ? 'failed' : session.status } },
          false,
          'setError'
        );
      },
    }),
    { name: 'ImportStore' }
  )
);

// =============================================================================
// Selectors
// =============================================================================

/** Select current step */
export const selectStep = (state: ImportState): ImportStep | null =>
  state.session?.step ?? null;

/** Select whether we can proceed to next step */
export const selectCanProceed = (state: ImportState): boolean => {
  const { session, summary } = state;
  if (!session) return false;

  switch (session.step) {
    case 'upload':
      return session.parsedRows.length > 0;
    case 'template':
      return true; // Template is optional
    case 'mapping':
      // Must have manufacturer, model, sku, cost mapped
      const requiredFields = ['manufacturer', 'model', 'sku', 'cost'];
      const mappedFields = session.columnMappings
        .filter((m) => m.targetField !== null)
        .map((m) => m.targetField);
      return requiredFields.every((f) => mappedFields.includes(f as ColumnMapping['targetField']));
    case 'preview':
      // Must have at least one valid row to import
      return summary !== null && (summary.toCreate + summary.toUpdate) > 0;
    case 'confirm':
      return true;
    default:
      return false;
  }
};

/** Select required fields that are not yet mapped */
export const selectUnmappedRequiredFields = (state: ImportState): string[] => {
  const { session } = state;
  if (!session) return [];

  const requiredFields = ['manufacturer', 'model', 'sku', 'cost'];
  const mappedFields = session.columnMappings
    .filter((m) => m.targetField !== null)
    .map((m) => m.targetField);

  return requiredFields.filter((f) => !mappedFields.includes(f as ColumnMapping['targetField']));
};
