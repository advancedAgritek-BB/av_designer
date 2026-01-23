/**
 * Import Feature
 *
 * Provides equipment import wizard functionality using Rust backend
 * for parsing Excel, CSV, and PDF pricing sheets.
 */

// Types
export type {
  FileType,
  ParsedFile,
  ParsedRow,
  EquipmentField,
  ColumnMapping,
  HeaderSuggestion,
  ValidationStatus,
  MatchType,
  ValidationResult,
  SourceTemplate,
  SourceTemplateCreate,
  SourceTemplateUpdate,
  ImportStep,
  ImportStatus,
  ImportSession,
  ImportResult,
  ImportRowError,
  ImportSummary,
  ImportError,
} from './import-types';

// Utilities
export {
  calculateImportSummary,
  isImportError,
  getImportErrorMessage,
} from './import-types';

// Store
export {
  useImportStore,
  selectStep,
  selectCanProceed,
  selectUnmappedRequiredFields,
} from './import-store';

// Service
export {
  importService,
  parseFile,
  detectHeaders,
  validateRows,
  getSourceTemplates,
  getSourceTemplate,
  createSourceTemplate,
  updateSourceTemplate,
  deleteSourceTemplate,
} from './import-service';

// Hooks
export {
  useSourceTemplates,
  useSourceTemplate,
  useCreateSourceTemplate,
  useUpdateSourceTemplate,
  useDeleteSourceTemplate,
} from './use-source-templates';

// Components
export { ImportPage } from './components/ImportPage';
export { FileUploadStep } from './components/FileUploadStep';
export { TemplateStep } from './components/TemplateStep';
export { MappingStep } from './components/MappingStep';
export { PreviewStep } from './components/PreviewStep';
export { ConfirmStep } from './components/ConfirmStep';
export { ImportProgress } from './components/ImportProgress';
