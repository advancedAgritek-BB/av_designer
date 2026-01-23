import { describe, it, expect } from 'vitest';
import {
  calculateImportSummary,
  isImportError,
  getImportErrorMessage,
} from '@/features/import/import-types';
import type { ValidationResult, ImportError } from '@/features/import/import-types';

describe('Import Types', () => {
  describe('calculateImportSummary', () => {
    it('returns zero counts for empty results', () => {
      const summary = calculateImportSummary([], new Set());
      expect(summary).toEqual({
        total: 0,
        toCreate: 0,
        toUpdate: 0,
        incomplete: 0,
        invalid: 0,
        excluded: 0,
      });
    });

    it('counts new items correctly', () => {
      const results: ValidationResult[] = [
        { rowNumber: 1, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 2, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 3, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
      ];

      const summary = calculateImportSummary(results, new Set());
      expect(summary.total).toBe(3);
      expect(summary.toCreate).toBe(3);
      expect(summary.toUpdate).toBe(0);
    });

    it('counts updates correctly', () => {
      const results: ValidationResult[] = [
        { rowNumber: 1, status: 'valid', matchType: 'update_sku', existingEquipmentId: 'eq-1', missingFields: [], errors: [] },
        { rowNumber: 2, status: 'valid', matchType: 'update_fallback', existingEquipmentId: 'eq-2', missingFields: [], errors: [] },
        { rowNumber: 3, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
      ];

      const summary = calculateImportSummary(results, new Set());
      expect(summary.toCreate).toBe(1);
      expect(summary.toUpdate).toBe(2);
    });

    it('counts incomplete rows', () => {
      const results: ValidationResult[] = [
        { rowNumber: 1, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 2, status: 'incomplete', matchType: null, existingEquipmentId: null, missingFields: ['sku'], errors: [] },
        { rowNumber: 3, status: 'incomplete', matchType: null, existingEquipmentId: null, missingFields: ['cost'], errors: [] },
      ];

      const summary = calculateImportSummary(results, new Set());
      expect(summary.incomplete).toBe(2);
    });

    it('counts invalid rows', () => {
      const results: ValidationResult[] = [
        { rowNumber: 1, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 2, status: 'invalid', matchType: null, existingEquipmentId: null, missingFields: [], errors: ['Bad format'] },
      ];

      const summary = calculateImportSummary(results, new Set());
      expect(summary.invalid).toBe(1);
    });

    it('excludes rows from counts', () => {
      const results: ValidationResult[] = [
        { rowNumber: 1, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 2, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 3, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
      ];

      const excluded = new Set([1, 3]);
      const summary = calculateImportSummary(results, excluded);

      expect(summary.total).toBe(3);
      expect(summary.excluded).toBe(2);
      expect(summary.toCreate).toBe(1); // Only row 2
    });

    it('handles mixed statuses', () => {
      const results: ValidationResult[] = [
        { rowNumber: 1, status: 'valid', matchType: 'new', existingEquipmentId: null, missingFields: [], errors: [] },
        { rowNumber: 2, status: 'valid', matchType: 'update_sku', existingEquipmentId: 'eq-1', missingFields: [], errors: [] },
        { rowNumber: 3, status: 'incomplete', matchType: null, existingEquipmentId: null, missingFields: ['cost'], errors: [] },
        { rowNumber: 4, status: 'invalid', matchType: null, existingEquipmentId: null, missingFields: [], errors: ['Bad data'] },
      ];

      const excluded = new Set([3]);
      const summary = calculateImportSummary(results, excluded);

      expect(summary.total).toBe(4);
      expect(summary.toCreate).toBe(1);
      expect(summary.toUpdate).toBe(1);
      expect(summary.incomplete).toBe(0); // Excluded
      expect(summary.invalid).toBe(1);
      expect(summary.excluded).toBe(1);
    });
  });

  describe('isImportError', () => {
    it('returns false for null', () => {
      expect(isImportError(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isImportError(undefined)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isImportError('string')).toBe(false);
      expect(isImportError(123)).toBe(false);
    });

    it('returns false for object without type', () => {
      expect(isImportError({ message: 'error' })).toBe(false);
    });

    it('returns false for unknown error type', () => {
      expect(isImportError({ type: 'UnknownError' })).toBe(false);
    });

    it('returns true for valid error types', () => {
      expect(isImportError({ type: 'FileNotFound', message: 'Not found' })).toBe(true);
      expect(isImportError({ type: 'ReadError', message: 'Cannot read' })).toBe(true);
      expect(isImportError({ type: 'ParseError', message: 'Parse failed' })).toBe(true);
      expect(isImportError({ type: 'UnsupportedFormat', message: 'Bad format' })).toBe(true);
      expect(isImportError({ type: 'EmptyFile' })).toBe(true);
      expect(isImportError({ type: 'PasswordProtected' })).toBe(true);
      expect(isImportError({ type: 'ValidationError', message: 'Invalid' })).toBe(true);
    });
  });

  describe('getImportErrorMessage', () => {
    it('formats FileNotFound error', () => {
      const error: ImportError = { type: 'FileNotFound', message: '/path/to/file.xlsx' };
      expect(getImportErrorMessage(error)).toBe('File not found: /path/to/file.xlsx');
    });

    it('formats ReadError', () => {
      const error: ImportError = { type: 'ReadError', message: 'Permission denied' };
      expect(getImportErrorMessage(error)).toBe('Failed to read file: Permission denied');
    });

    it('formats ParseError', () => {
      const error: ImportError = { type: 'ParseError', message: 'Invalid cell at B5' };
      expect(getImportErrorMessage(error)).toBe('Failed to parse file: Invalid cell at B5');
    });

    it('formats UnsupportedFormat', () => {
      const error: ImportError = { type: 'UnsupportedFormat', message: 'DOC files not supported' };
      expect(getImportErrorMessage(error)).toBe('DOC files not supported');
    });

    it('formats EmptyFile', () => {
      const error: ImportError = { type: 'EmptyFile' };
      expect(getImportErrorMessage(error)).toBe('The file is empty or contains no data.');
    });

    it('formats PasswordProtected', () => {
      const error: ImportError = { type: 'PasswordProtected' };
      expect(getImportErrorMessage(error)).toBe(
        'This file is password protected. Please remove the password and try again.'
      );
    });

    it('formats ValidationError', () => {
      const error: ImportError = { type: 'ValidationError', message: 'Missing required field' };
      expect(getImportErrorMessage(error)).toBe('Validation error: Missing required field');
    });
  });
});
