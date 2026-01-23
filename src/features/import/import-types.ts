/**
 * Import Types
 *
 * Types for the pricing sheet import wizard that interfaces with the
 * Rust backend for file parsing (Excel, CSV, PDF).
 */

// =============================================================================
// File Types
// =============================================================================

export type FileType = 'xlsx' | 'csv' | 'pdf';

// =============================================================================
// Parsed Data (from Rust backend)
// =============================================================================

/**
 * Represents a parsed file ready for column mapping
 */
export interface ParsedFile {
  /** Original filename */
  fileName: string;
  /** Detected file type */
  fileType: FileType;
  /** Header row (if detected) */
  headers: string[];
  /** Data rows (raw cell values as strings) */
  rows: ParsedRow[];
  /** Total row count (may differ from rows.length if truncated) */
  totalRows: number;
  /** Whether the file was truncated due to size limits */
  truncated: boolean;
}

/**
 * A single parsed row of data
 */
export interface ParsedRow {
  /** Original row number in the source file (1-indexed) */
  rowNumber: number;
  /** Cell values as strings */
  cells: string[];
}

// =============================================================================
// Column Mapping
// =============================================================================

/**
 * Equipment fields that can be mapped from source columns
 */
export type EquipmentField =
  | 'manufacturer'
  | 'model'
  | 'sku'
  | 'category'
  | 'subcategory'
  | 'description'
  | 'cost'
  | 'msrp'
  | 'height'
  | 'width'
  | 'depth'
  | 'weight'
  | 'voltage'
  | 'wattage'
  | 'certifications'
  | 'imageUrl';

/**
 * Column mapping from source to equipment field
 */
export interface ColumnMapping {
  /** Index of the source column */
  sourceColumn: number;
  /** Original header name from source */
  sourceHeader: string;
  /** Target equipment field (null if unmapped) */
  targetField: EquipmentField | null;
}

/**
 * Suggested mapping for a header (auto-detected)
 */
export interface HeaderSuggestion {
  /** Column index */
  columnIndex: number;
  /** Original header text */
  header: string;
  /** Suggested equipment field */
  suggestedField: EquipmentField | null;
  /** Confidence score (0.0 - 1.0) */
  confidence: number;
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validation status for a row
 */
export type ValidationStatus = 'valid' | 'incomplete' | 'invalid';

/**
 * How an existing equipment record was matched
 */
export type MatchType = 'new' | 'update_sku' | 'update_fallback';

/**
 * Validation result for a single row
 */
export interface ValidationResult {
  /** Row number from source */
  rowNumber: number;
  /** Validation status */
  status: ValidationStatus;
  /** Match type if updating existing equipment */
  matchType: MatchType | null;
  /** ID of existing equipment if matched */
  existingEquipmentId: string | null;
  /** Fields that are missing but required */
  missingFields: EquipmentField[];
  /** Error messages */
  errors: string[];
}

// =============================================================================
// Source Templates (persisted)
// =============================================================================

/**
 * Source template for saving column mappings for repeat imports
 */
export interface SourceTemplate {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  fileType: FileType;
  columnMappings: ColumnMapping[];
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SourceTemplateCreate = Omit<SourceTemplate, 'id' | 'createdAt' | 'updatedAt'>;
export type SourceTemplateUpdate = Partial<Omit<SourceTemplate, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>>;

// =============================================================================
// Import Session (frontend state)
// =============================================================================

/**
 * Import wizard step
 */
export type ImportStep =
  | 'upload'
  | 'template'
  | 'mapping'
  | 'preview'
  | 'confirm'
  | 'importing'
  | 'complete';

/**
 * Import session status
 */
export type ImportStatus =
  | 'parsing'
  | 'mapping'
  | 'validating'
  | 'previewing'
  | 'importing'
  | 'complete'
  | 'failed';

/**
 * Import session state (held in Zustand store)
 */
export interface ImportSession {
  /** Session ID */
  id: string;
  /** Original filename */
  fileName: string;
  /** Detected file type */
  fileType: FileType;
  /** Selected source template ID */
  sourceTemplateId: string | null;
  /** Column mappings */
  columnMappings: ColumnMapping[];
  /** Parsed rows from Rust */
  parsedRows: ParsedRow[];
  /** Validation results */
  validationResults: ValidationResult[];
  /** Current status */
  status: ImportStatus;
  /** Current step */
  step: ImportStep;
  /** Row IDs excluded from import */
  excludedRows: Set<number>;
  /** Timestamp */
  createdAt: string;
  /** Error message if failed */
  error: string | null;
}

// =============================================================================
// Import Results
// =============================================================================

/**
 * Final import result
 */
export interface ImportResult {
  /** Number of equipment records created */
  created: number;
  /** Number of equipment records updated */
  updated: number;
  /** Number of rows skipped due to errors */
  skipped: number;
  /** Detailed errors */
  errors: ImportRowError[];
}

/**
 * Error for a specific row during import execution
 */
export interface ImportRowError {
  /** Row number from source */
  rowNumber: number;
  /** Error message */
  error: string;
}

// =============================================================================
// Summary Statistics
// =============================================================================

/**
 * Summary of import preview
 */
export interface ImportSummary {
  /** Total rows parsed */
  total: number;
  /** Rows that will be created as new equipment */
  toCreate: number;
  /** Rows that will update existing equipment */
  toUpdate: number;
  /** Rows with incomplete data (missing required fields) */
  incomplete: number;
  /** Rows with validation errors */
  invalid: number;
  /** Rows excluded by user */
  excluded: number;
}

/**
 * Calculate summary from validation results and exclusions
 */
export function calculateImportSummary(
  results: ValidationResult[],
  excludedRows: Set<number>
): ImportSummary {
  const included = results.filter((r) => !excludedRows.has(r.rowNumber));

  return {
    total: results.length,
    toCreate: included.filter((r) => r.status === 'valid' && r.matchType === 'new').length,
    toUpdate: included.filter(
      (r) =>
        r.status === 'valid' &&
        (r.matchType === 'update_sku' || r.matchType === 'update_fallback')
    ).length,
    incomplete: included.filter((r) => r.status === 'incomplete').length,
    invalid: included.filter((r) => r.status === 'invalid').length,
    excluded: excludedRows.size,
  };
}

// =============================================================================
// Tauri Command Response Types
// =============================================================================

/**
 * Error response from Rust import commands
 */
export type ImportError =
  | { type: 'FileNotFound'; message: string }
  | { type: 'ReadError'; message: string }
  | { type: 'ParseError'; message: string }
  | { type: 'UnsupportedFormat'; message: string }
  | { type: 'EmptyFile' }
  | { type: 'PasswordProtected' }
  | { type: 'ValidationError'; message: string };

/**
 * Check if a value is an ImportError
 */
export function isImportError(value: unknown): value is ImportError {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.type === 'string' &&
    [
      'FileNotFound',
      'ReadError',
      'ParseError',
      'UnsupportedFormat',
      'EmptyFile',
      'PasswordProtected',
      'ValidationError',
    ].includes(obj.type)
  );
}

/**
 * Get human-readable error message from ImportError
 */
export function getImportErrorMessage(error: ImportError): string {
  switch (error.type) {
    case 'FileNotFound':
      return `File not found: ${error.message}`;
    case 'ReadError':
      return `Failed to read file: ${error.message}`;
    case 'ParseError':
      return `Failed to parse file: ${error.message}`;
    case 'UnsupportedFormat':
      return error.message;
    case 'EmptyFile':
      return 'The file is empty or contains no data.';
    case 'PasswordProtected':
      return 'This file is password protected. Please remove the password and try again.';
    case 'ValidationError':
      return `Validation error: ${error.message}`;
  }
}
