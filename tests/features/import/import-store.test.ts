import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useImportStore,
  selectStep,
  selectCanProceed,
  selectUnmappedRequiredFields,
} from '@/features/import/import-store';
import type { ValidationResult, ColumnMapping } from '@/features/import/import-types';

describe('Import Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useImportStore.setState({ session: null, summary: null });
  });

  describe('Session Lifecycle', () => {
    it('starts a new session with correct initial state', () => {
      const { startSession } = useImportStore.getState();

      act(() => {
        startSession({
          fileName: 'test.xlsx',
          fileType: 'xlsx',
          parsedRows: [
            { rowNumber: 2, cells: ['Poly', 'Studio X50', 'PX50', '2500'] },
          ],
          headers: ['Manufacturer', 'Model', 'SKU', 'Cost'],
        });
      });

      const { session } = useImportStore.getState();
      expect(session).not.toBeNull();
      expect(session?.fileName).toBe('test.xlsx');
      expect(session?.fileType).toBe('xlsx');
      expect(session?.step).toBe('template');
      expect(session?.status).toBe('mapping');
      expect(session?.parsedRows).toHaveLength(1);
      expect(session?.columnMappings).toHaveLength(4);
      expect(session?.excludedRows.size).toBe(0);
    });

    it('clears session', () => {
      const { startSession, clearSession } = useImportStore.getState();

      act(() => {
        startSession({
          fileName: 'test.xlsx',
          fileType: 'xlsx',
          parsedRows: [],
          headers: ['A', 'B'],
        });
      });

      expect(useImportStore.getState().session).not.toBeNull();

      act(() => {
        clearSession();
      });

      expect(useImportStore.getState().session).toBeNull();
    });
  });

  describe('Step Navigation', () => {
    beforeEach(() => {
      const { startSession } = useImportStore.getState();
      act(() => {
        startSession({
          fileName: 'test.xlsx',
          fileType: 'xlsx',
          parsedRows: [{ rowNumber: 2, cells: ['A', 'B'] }],
          headers: ['Col1', 'Col2'],
        });
      });
    });

    it('navigates to next step', () => {
      const { nextStep } = useImportStore.getState();

      expect(useImportStore.getState().session?.step).toBe('template');

      act(() => {
        nextStep();
      });

      expect(useImportStore.getState().session?.step).toBe('mapping');

      act(() => {
        nextStep();
      });

      expect(useImportStore.getState().session?.step).toBe('preview');
    });

    it('navigates to previous step', () => {
      const { nextStep, prevStep } = useImportStore.getState();

      act(() => {
        nextStep(); // template -> mapping
        nextStep(); // mapping -> preview
      });

      expect(useImportStore.getState().session?.step).toBe('preview');

      act(() => {
        prevStep();
      });

      expect(useImportStore.getState().session?.step).toBe('mapping');
    });

    it('does not go beyond first step', () => {
      const { prevStep } = useImportStore.getState();

      // Already at template (first step after upload)
      expect(useImportStore.getState().session?.step).toBe('template');

      act(() => {
        prevStep();
      });

      expect(useImportStore.getState().session?.step).toBe('upload');

      act(() => {
        prevStep();
      });

      // Should stay at upload
      expect(useImportStore.getState().session?.step).toBe('upload');
    });

    it('sets step directly', () => {
      const { setStep } = useImportStore.getState();

      act(() => {
        setStep('confirm');
      });

      expect(useImportStore.getState().session?.step).toBe('confirm');
    });
  });

  describe('Column Mapping', () => {
    beforeEach(() => {
      const { startSession } = useImportStore.getState();
      act(() => {
        startSession({
          fileName: 'test.xlsx',
          fileType: 'xlsx',
          parsedRows: [{ rowNumber: 2, cells: ['Poly', 'X50', 'PX50', '2500'] }],
          headers: ['Manufacturer', 'Model', 'SKU', 'Cost'],
        });
      });
    });

    it('initializes with unmapped columns', () => {
      const { session } = useImportStore.getState();

      expect(session?.columnMappings).toHaveLength(4);
      expect(session?.columnMappings.every((m) => m.targetField === null)).toBe(true);
    });

    it('updates a single column mapping', () => {
      const { updateColumnMapping } = useImportStore.getState();

      act(() => {
        updateColumnMapping(0, 'manufacturer');
      });

      const { session } = useImportStore.getState();
      expect(session?.columnMappings[0].targetField).toBe('manufacturer');
      expect(session?.columnMappings[1].targetField).toBeNull();
    });

    it('sets all column mappings at once', () => {
      const { setColumnMappings } = useImportStore.getState();
      const mappings: ColumnMapping[] = [
        { sourceColumn: 0, sourceHeader: 'Manufacturer', targetField: 'manufacturer' },
        { sourceColumn: 1, sourceHeader: 'Model', targetField: 'model' },
        { sourceColumn: 2, sourceHeader: 'SKU', targetField: 'sku' },
        { sourceColumn: 3, sourceHeader: 'Cost', targetField: 'cost' },
      ];

      act(() => {
        setColumnMappings(mappings);
      });

      const { session } = useImportStore.getState();
      expect(session?.columnMappings[0].targetField).toBe('manufacturer');
      expect(session?.columnMappings[1].targetField).toBe('model');
      expect(session?.columnMappings[2].targetField).toBe('sku');
      expect(session?.columnMappings[3].targetField).toBe('cost');
    });

    it('applies template mappings by matching headers', () => {
      const { applyTemplate } = useImportStore.getState();
      const templateMappings: ColumnMapping[] = [
        { sourceColumn: 0, sourceHeader: 'manufacturer', targetField: 'manufacturer' },
        { sourceColumn: 1, sourceHeader: 'model', targetField: 'model' },
      ];

      act(() => {
        applyTemplate('template-123', templateMappings);
      });

      const { session } = useImportStore.getState();
      expect(session?.sourceTemplateId).toBe('template-123');
      expect(session?.columnMappings[0].targetField).toBe('manufacturer');
      expect(session?.columnMappings[1].targetField).toBe('model');
      // Unmatched columns remain null
      expect(session?.columnMappings[2].targetField).toBeNull();
    });
  });

  describe('Row Exclusion', () => {
    beforeEach(() => {
      const { startSession, setValidationResults } = useImportStore.getState();
      act(() => {
        startSession({
          fileName: 'test.xlsx',
          fileType: 'xlsx',
          parsedRows: [
            { rowNumber: 2, cells: ['A', 'B'] },
            { rowNumber: 3, cells: ['C', 'D'] },
            { rowNumber: 4, cells: ['E', 'F'] },
          ],
          headers: ['Col1', 'Col2'],
        });
      });

      const results: ValidationResult[] = [
        { rowNumber: 2, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 3, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 4, status: 'invalid', matchType: null, existingEquipmentId: null, missingFields: ['sku'], errors: ['Missing SKU'] },
      ];

      act(() => {
        setValidationResults(results);
      });
    });

    it('toggles row exclusion', () => {
      const { toggleRowExclusion } = useImportStore.getState();

      act(() => {
        toggleRowExclusion(2);
      });

      expect(useImportStore.getState().session?.excludedRows.has(2)).toBe(true);

      act(() => {
        toggleRowExclusion(2);
      });

      expect(useImportStore.getState().session?.excludedRows.has(2)).toBe(false);
    });

    it('excludes multiple rows', () => {
      const { excludeRows } = useImportStore.getState();

      act(() => {
        excludeRows([2, 4]);
      });

      const { session } = useImportStore.getState();
      expect(session?.excludedRows.has(2)).toBe(true);
      expect(session?.excludedRows.has(4)).toBe(true);
      expect(session?.excludedRows.has(3)).toBe(false);
    });

    it('includes all rows', () => {
      const { excludeRows, includeAllRows } = useImportStore.getState();

      act(() => {
        excludeRows([2, 3, 4]);
      });

      expect(useImportStore.getState().session?.excludedRows.size).toBe(3);

      act(() => {
        includeAllRows();
      });

      expect(useImportStore.getState().session?.excludedRows.size).toBe(0);
    });
  });

  describe('Status Management', () => {
    beforeEach(() => {
      const { startSession } = useImportStore.getState();
      act(() => {
        startSession({
          fileName: 'test.xlsx',
          fileType: 'xlsx',
          parsedRows: [],
          headers: [],
        });
      });
    });

    it('updates status', () => {
      const { setStatus } = useImportStore.getState();

      act(() => {
        setStatus('importing');
      });

      expect(useImportStore.getState().session?.status).toBe('importing');
    });

    it('sets error and updates status to failed', () => {
      const { setError } = useImportStore.getState();

      act(() => {
        setError('Something went wrong');
      });

      const { session } = useImportStore.getState();
      expect(session?.error).toBe('Something went wrong');
      expect(session?.status).toBe('failed');
    });

    it('clears error', () => {
      const { setError, setStatus } = useImportStore.getState();

      act(() => {
        setError('Error');
        setStatus('importing');
        setError(null);
      });

      const { session } = useImportStore.getState();
      expect(session?.error).toBeNull();
      // Status remains importing when clearing error
      expect(session?.status).toBe('importing');
    });
  });

  describe('Selectors', () => {
    describe('selectStep', () => {
      it('returns null when no session', () => {
        const state = useImportStore.getState();
        expect(selectStep(state)).toBeNull();
      });

      it('returns current step', () => {
        const { startSession } = useImportStore.getState();
        act(() => {
          startSession({
            fileName: 'test.xlsx',
            fileType: 'xlsx',
            parsedRows: [],
            headers: [],
          });
        });

        const state = useImportStore.getState();
        expect(selectStep(state)).toBe('template');
      });
    });

    describe('selectCanProceed', () => {
      it('returns false when no session', () => {
        const state = useImportStore.getState();
        expect(selectCanProceed(state)).toBe(false);
      });

      it('returns true for template step (optional)', () => {
        const { startSession } = useImportStore.getState();
        act(() => {
          startSession({
            fileName: 'test.xlsx',
            fileType: 'xlsx',
            parsedRows: [{ rowNumber: 2, cells: ['A'] }],
            headers: ['Col1'],
          });
        });

        const state = useImportStore.getState();
        expect(selectCanProceed(state)).toBe(true);
      });

      it('returns false for mapping step without required fields', () => {
        const { startSession, nextStep } = useImportStore.getState();
        act(() => {
          startSession({
            fileName: 'test.xlsx',
            fileType: 'xlsx',
            parsedRows: [{ rowNumber: 2, cells: ['A'] }],
            headers: ['Col1'],
          });
          nextStep(); // Go to mapping
        });

        const state = useImportStore.getState();
        expect(selectCanProceed(state)).toBe(false);
      });

      it('returns true for mapping step with all required fields mapped', () => {
        const { startSession, nextStep, setColumnMappings } = useImportStore.getState();
        act(() => {
          startSession({
            fileName: 'test.xlsx',
            fileType: 'xlsx',
            parsedRows: [{ rowNumber: 2, cells: ['A', 'B', 'C', 'D'] }],
            headers: ['Manufacturer', 'Model', 'SKU', 'Cost'],
          });
          nextStep(); // Go to mapping
          setColumnMappings([
            { sourceColumn: 0, sourceHeader: 'Manufacturer', targetField: 'manufacturer' },
            { sourceColumn: 1, sourceHeader: 'Model', targetField: 'model' },
            { sourceColumn: 2, sourceHeader: 'SKU', targetField: 'sku' },
            { sourceColumn: 3, sourceHeader: 'Cost', targetField: 'cost' },
          ]);
        });

        const state = useImportStore.getState();
        expect(selectCanProceed(state)).toBe(true);
      });
    });

    describe('selectUnmappedRequiredFields', () => {
      it('returns empty array when no session', () => {
        const state = useImportStore.getState();
        expect(selectUnmappedRequiredFields(state)).toEqual([]);
      });

      it('returns all required fields when none mapped', () => {
        const { startSession } = useImportStore.getState();
        act(() => {
          startSession({
            fileName: 'test.xlsx',
            fileType: 'xlsx',
            parsedRows: [],
            headers: ['A', 'B', 'C', 'D'],
          });
        });

        const state = useImportStore.getState();
        expect(selectUnmappedRequiredFields(state)).toEqual([
          'manufacturer',
          'model',
          'sku',
          'cost',
        ]);
      });

      it('returns only unmapped required fields', () => {
        const { startSession, updateColumnMapping } = useImportStore.getState();
        act(() => {
          startSession({
            fileName: 'test.xlsx',
            fileType: 'xlsx',
            parsedRows: [],
            headers: ['A', 'B', 'C', 'D'],
          });
          updateColumnMapping(0, 'manufacturer');
          updateColumnMapping(1, 'model');
        });

        const state = useImportStore.getState();
        expect(selectUnmappedRequiredFields(state)).toEqual(['sku', 'cost']);
      });
    });
  });
});
