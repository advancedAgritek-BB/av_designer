/**
 * Import Service
 *
 * Wraps Tauri commands for file parsing and provides
 * Supabase operations for source templates.
 */

import { invoke } from '@tauri-apps/api/core';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import type {
  ParsedFile,
  ParsedRow,
  ColumnMapping,
  HeaderSuggestion,
  ValidationResult,
  SourceTemplate,
  SourceTemplateCreate,
  SourceTemplateUpdate,
} from './import-types';
import { isImportError, getImportErrorMessage } from './import-types';

// =============================================================================
// Tauri Command Wrappers
// =============================================================================

/**
 * Parse a file using the Rust backend
 *
 * @param filePath - Absolute path to the file
 * @returns Parsed file data with headers and rows
 * @throws Error if parsing fails
 */
export async function parseFile(filePath: string): Promise<ParsedFile> {
  try {
    const result = await invoke<ParsedFile>('parse_import_file', { path: filePath });
    return result;
  } catch (error) {
    if (isImportError(error)) {
      throw new Error(getImportErrorMessage(error));
    }
    throw new Error(`Failed to parse file: ${String(error)}`);
  }
}

/**
 * Detect header mappings using auto-suggestion
 *
 * @param parsed - Parsed file from parseFile
 * @returns Array of header suggestions with confidence scores
 */
export async function detectHeaders(parsed: ParsedFile): Promise<HeaderSuggestion[]> {
  try {
    const result = await invoke<HeaderSuggestion[]>('detect_headers', { parsed });
    return result;
  } catch (error) {
    if (isImportError(error)) {
      throw new Error(getImportErrorMessage(error));
    }
    throw new Error(`Failed to detect headers: ${String(error)}`);
  }
}

/**
 * Validate import rows against column mappings
 *
 * @param rows - Parsed rows
 * @param mappings - Column mappings
 * @returns Validation results for each row
 */
export async function validateRows(
  rows: ParsedRow[],
  mappings: ColumnMapping[]
): Promise<ValidationResult[]> {
  try {
    const result = await invoke<ValidationResult[]>('validate_import_rows', {
      rows,
      mappings,
    });
    return result;
  } catch (error) {
    if (isImportError(error)) {
      throw new Error(getImportErrorMessage(error));
    }
    throw new Error(`Failed to validate rows: ${String(error)}`);
  }
}

// =============================================================================
// Source Templates (Supabase)
// =============================================================================

/**
 * Map database row to SourceTemplate
 */
function mapTemplateFromDb(row: Record<string, unknown>): SourceTemplate {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    name: row.name as string,
    description: row.description as string | null,
    fileType: row.file_type as SourceTemplate['fileType'],
    columnMappings: (row.column_mappings as ColumnMapping[]) || [],
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Get all source templates for an organization
 */
export async function getSourceTemplates(orgId: string): Promise<SourceTemplate[]> {
  const { data, error } = await supabase
    .from('source_templates')
    .select('*')
    .eq('org_id', orgId)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch source templates: ${error.message}`);
  }

  return (data || []).map(mapTemplateFromDb);
}

/**
 * Get a single source template by ID
 */
export async function getSourceTemplate(id: string): Promise<SourceTemplate | null> {
  const { data, error } = await supabase
    .from('source_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch source template: ${error.message}`);
  }

  return data ? mapTemplateFromDb(data) : null;
}

/**
 * Create a new source template
 */
export async function createSourceTemplate(
  template: SourceTemplateCreate
): Promise<SourceTemplate> {
  const { data, error } = await supabase
    .from('source_templates')
    .insert({
      org_id: template.orgId,
      name: template.name,
      description: template.description,
      file_type: template.fileType,
      column_mappings: template.columnMappings as unknown as Json,
      created_by: template.createdBy,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create source template: ${error.message}`);
  }

  return mapTemplateFromDb(data);
}

/**
 * Update an existing source template
 */
export async function updateSourceTemplate(
  id: string,
  updates: SourceTemplateUpdate
): Promise<SourceTemplate> {
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.fileType !== undefined) updateData.file_type = updates.fileType;
  if (updates.columnMappings !== undefined)
    updateData.column_mappings = updates.columnMappings as unknown as Json;

  const { data, error } = await supabase
    .from('source_templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update source template: ${error.message}`);
  }

  return mapTemplateFromDb(data);
}

/**
 * Delete a source template
 */
export async function deleteSourceTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('source_templates').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete source template: ${error.message}`);
  }
}

// =============================================================================
// Import Service Singleton
// =============================================================================

export const importService = {
  // Tauri commands
  parseFile,
  detectHeaders,
  validateRows,

  // Source templates
  getSourceTemplates,
  getSourceTemplate,
  createSourceTemplate,
  updateSourceTemplate,
  deleteSourceTemplate,
};
