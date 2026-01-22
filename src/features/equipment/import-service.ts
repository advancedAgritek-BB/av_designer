/**
 * Equipment Import Service
 *
 * Handles CSV parsing, validation, column mapping, and import execution.
 */

import { supabase } from '@/lib/supabase';
import { parseToDollars } from '@/lib/currency';
import type { Database, Json } from '@/lib/database.types';
import { equipmentService } from './equipment-service';
import {
  EQUIPMENT_CATEGORIES,
  type ColumnMapping,
  type ImportConfig,
  type ValidationResult,
  type ParsedRow,
  type ImportPreview,
  type ImportRecord,
  type EquipmentImportData,
  type EquipmentFormData,
  type DistributorPricing,
  type VendorTemplate,
  type EquipmentCategory,
} from '@/types/equipment';

type EquipmentImportInsert = Database['public']['Tables']['equipment_imports']['Insert'];
type EquipmentImportUpdate = Database['public']['Tables']['equipment_imports']['Update'];

/**
 * Known vendor templates with header patterns for auto-detection
 */
export const VENDOR_TEMPLATES: VendorTemplate[] = [
  {
    id: 'wesco',
    name: 'WESCO/Anixter',
    type: 'distributor',
    filename: 'wesco-anixter.csv',
    headerPatterns: ['Manufacturer', 'Part Number', 'Dealer Cost', 'List Price'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Part Number', destination: 'sku' },
      { csvColumn: 'Description', destination: 'model' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'List Price', destination: 'msrp' },
    ],
  },
  {
    id: 'adi',
    name: 'ADI Global',
    type: 'distributor',
    filename: 'adi-global.csv',
    headerPatterns: ['MFR', 'SKU', 'Cost', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'MFR', destination: 'manufacturer' },
      { csvColumn: 'SKU', destination: 'sku' },
      { csvColumn: 'Product Name', destination: 'model' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'synnex',
    name: 'TD Synnex',
    type: 'distributor',
    filename: 'synnex.csv',
    headerPatterns: ['Vendor', 'Synnex SKU', 'Unit Cost'],
    suggestedMappings: [
      { csvColumn: 'Vendor', destination: 'manufacturer' },
      { csvColumn: 'Vendor Part #', destination: 'sku' },
      { csvColumn: 'Description', destination: 'model' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Synnex SKU', destination: 'distributorSku' },
      { csvColumn: 'Unit Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'ingram',
    name: 'Ingram Micro',
    type: 'distributor',
    filename: 'ingram-micro.csv',
    headerPatterns: ['Vendor Name', 'Ingram Part Number', 'Customer Price'],
    suggestedMappings: [
      { csvColumn: 'Vendor Name', destination: 'manufacturer' },
      { csvColumn: 'Vendor Part Number', destination: 'sku' },
      { csvColumn: 'Product Description', destination: 'model' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Ingram Part Number', destination: 'distributorSku' },
      { csvColumn: 'Customer Price', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'jenne',
    name: 'Jenne',
    type: 'distributor',
    filename: 'jenne.csv',
    headerPatterns: ['Jenne SKU', 'Part Number', 'Cost'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Part Number', destination: 'sku' },
      { csvColumn: 'Description', destination: 'model' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Jenne SKU', destination: 'distributorSku' },
      { csvColumn: 'Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'bluestar',
    name: 'BlueStar',
    type: 'distributor',
    filename: 'bluestar.csv',
    headerPatterns: ['Item Description', 'Dealer Price', 'List Price'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Part Number', destination: 'sku' },
      { csvColumn: 'Item Description', destination: 'model' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Dealer Price', destination: 'cost' },
      { csvColumn: 'List Price', destination: 'msrp' },
    ],
  },
  {
    id: 'stampede',
    name: 'Stampede',
    type: 'distributor',
    filename: 'stampede.csv',
    headerPatterns: ['Part #', 'Dealer Cost', 'List Price'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Part #', destination: 'sku' },
      { csvColumn: 'Description', destination: 'model' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'List Price', destination: 'msrp' },
    ],
  },
  {
    id: 'almo',
    name: 'Almo Pro AV',
    type: 'distributor',
    filename: 'almo.csv',
    headerPatterns: ['Item', 'Cost', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Item', destination: 'sku' },
      { csvColumn: 'Description', destination: 'model' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
      { csvColumn: 'MAP', destination: 'map' },
    ],
  },
  {
    id: 'poly',
    name: 'Poly/HP',
    type: 'manufacturer',
    filename: 'poly.csv',
    headerPatterns: ['Manufacturer', 'Model', 'SKU', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Model', destination: 'model' },
      { csvColumn: 'SKU', destination: 'sku' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Description', destination: 'description' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'logitech',
    name: 'Logitech',
    type: 'manufacturer',
    filename: 'logitech.csv',
    headerPatterns: ['Manufacturer', 'Model', 'SKU', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Model', destination: 'model' },
      { csvColumn: 'SKU', destination: 'sku' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Description', destination: 'description' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'crestron',
    name: 'Crestron',
    type: 'manufacturer',
    filename: 'crestron.csv',
    headerPatterns: ['Manufacturer', 'Model', 'SKU', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Model', destination: 'model' },
      { csvColumn: 'SKU', destination: 'sku' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Description', destination: 'description' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'biamp',
    name: 'Biamp',
    type: 'manufacturer',
    filename: 'biamp.csv',
    headerPatterns: ['Manufacturer', 'Model', 'SKU', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Model', destination: 'model' },
      { csvColumn: 'SKU', destination: 'sku' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Description', destination: 'description' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'shure',
    name: 'Shure',
    type: 'manufacturer',
    filename: 'shure.csv',
    headerPatterns: ['Manufacturer', 'Model', 'SKU', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Model', destination: 'model' },
      { csvColumn: 'SKU', destination: 'sku' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Description', destination: 'description' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'qsc',
    name: 'QSC',
    type: 'manufacturer',
    filename: 'qsc.csv',
    headerPatterns: ['Manufacturer', 'Model', 'SKU', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Model', destination: 'model' },
      { csvColumn: 'SKU', destination: 'sku' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Description', destination: 'description' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'extron',
    name: 'Extron',
    type: 'manufacturer',
    filename: 'extron.csv',
    headerPatterns: ['Manufacturer', 'Model', 'SKU', 'MSRP'],
    suggestedMappings: [
      { csvColumn: 'Manufacturer', destination: 'manufacturer' },
      { csvColumn: 'Model', destination: 'model' },
      { csvColumn: 'SKU', destination: 'sku' },
      { csvColumn: 'Category', destination: 'category' },
      { csvColumn: 'Subcategory', destination: 'subcategory' },
      { csvColumn: 'Description', destination: 'description' },
      { csvColumn: 'Dealer Cost', destination: 'cost' },
      { csvColumn: 'MSRP', destination: 'msrp' },
    ],
  },
  {
    id: 'generic',
    name: 'Generic',
    type: 'generic',
    filename: 'generic.csv',
    headerPatterns: [],
    suggestedMappings: [
      { csvColumn: 'manufacturer', destination: 'manufacturer' },
      { csvColumn: 'model', destination: 'model' },
      { csvColumn: 'sku', destination: 'sku' },
      { csvColumn: 'category', destination: 'category' },
      { csvColumn: 'subcategory', destination: 'subcategory' },
      { csvColumn: 'description', destination: 'description' },
      { csvColumn: 'cost', destination: 'cost' },
      { csvColumn: 'msrp', destination: 'msrp' },
    ],
  },
];

/**
 * Category name mappings for flexible matching
 */
const CATEGORY_MAPPINGS: Record<string, EquipmentCategory> = {
  video: 'video',
  display: 'video',
  displays: 'video',
  camera: 'video',
  cameras: 'video',
  codec: 'video',
  codecs: 'video',
  audio: 'audio',
  microphone: 'audio',
  microphones: 'audio',
  speaker: 'audio',
  speakers: 'audio',
  dsp: 'audio',
  amplifier: 'audio',
  amplifiers: 'audio',
  control: 'control',
  processor: 'control',
  processors: 'control',
  panel: 'control',
  panels: 'control',
  infrastructure: 'infrastructure',
  rack: 'infrastructure',
  racks: 'infrastructure',
  cable: 'infrastructure',
  cables: 'infrastructure',
  mount: 'infrastructure',
  mounts: 'infrastructure',
};

/**
 * Parse CSV text to array of records
 */
function parseCSVText(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Normalize category string to valid EquipmentCategory
 */
function normalizeCategory(value: string): EquipmentCategory | null {
  const lower = value.toLowerCase().trim();
  return CATEGORY_MAPPINGS[lower] || null;
}

export class EquipmentImportService {
  /**
   * Parse CSV file and detect columns
   */
  async parseCSV(file: File): Promise<{
    headers: string[];
    sampleRows: Record<string, string>[];
    suggestedMappings?: ColumnMapping[];
    detectedTemplate?: VendorTemplate;
  }> {
    const text = await file.text();
    const { headers, rows } = parseCSVText(text);

    // Take first 5 rows as sample
    const sampleRows = rows.slice(0, 5);

    // Try to detect vendor template
    const detectedTemplate = this.detectTemplate(headers);

    return {
      headers,
      sampleRows,
      suggestedMappings: detectedTemplate?.suggestedMappings,
      detectedTemplate,
    };
  }

  /**
   * Detect vendor template based on headers
   */
  private detectTemplate(headers: string[]): VendorTemplate | undefined {
    const headerSet = new Set(headers.map((h) => h.toLowerCase()));

    for (const template of VENDOR_TEMPLATES) {
      if (template.headerPatterns.length === 0) continue;

      const matches = template.headerPatterns.filter((pattern) =>
        headerSet.has(pattern.toLowerCase())
      );

      // If more than half of the patterns match, consider it a match
      if (matches.length >= template.headerPatterns.length / 2) {
        return template;
      }
    }

    return undefined;
  }

  /**
   * Validate all rows with current mapping
   */
  async validate(file: File, config: ImportConfig): Promise<ImportPreview> {
    const text = await file.text();
    const { rows } = parseCSVText(text);

    const parsedRows: ParsedRow[] = [];
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let toCreate = 0;
    let toUpdate = 0;

    for (let i = 0; i < rows.length; i++) {
      const parsed = await this.parseAndValidateRow(rows[i], i + 2, config);
      parsedRows.push(parsed);

      if (parsed.status === 'valid') validCount++;
      else if (parsed.status === 'warning') warningCount++;
      else errorCount++;

      if (parsed.action === 'create') toCreate++;
      else toUpdate++;
    }

    return {
      rows: parsedRows,
      summary: {
        total: rows.length,
        valid: validCount,
        warnings: warningCount,
        errors: errorCount,
        toCreate,
        toUpdate,
      },
    };
  }

  /**
   * Parse and validate a single row
   */
  private async parseAndValidateRow(
    row: Record<string, string>,
    rowNumber: number,
    config: ImportConfig
  ): Promise<ParsedRow> {
    const errors: ValidationResult[] = [];
    const warnings: ValidationResult[] = [];
    const data: Partial<EquipmentImportData> = {};

    // Apply column mappings
    for (const mapping of config.columnMappings) {
      if (mapping.destination === 'ignore') continue;

      const value = row[mapping.csvColumn];
      if (value === undefined || value === '') continue;

      if (mapping.destination.startsWith('specifications.')) {
        const specKey = mapping.destination.replace('specifications.', '');
        data.specifications = data.specifications || {};
        data.specifications[specKey] = value;
      } else {
        this.setFieldValue(data, mapping.destination, value, rowNumber, errors, warnings);
      }
    }

    // Set distributor from config
    data.distributor = config.distributorName;

    // Validate required fields
    this.validateRequiredFields(data, rowNumber, errors);

    // Check for existing equipment
    let existingEquipmentId: string | undefined;
    let action: 'create' | 'update' = 'create';

    if (data.manufacturer && data.sku) {
      const existing = await equipmentService.findByManufacturerSku(
        config.organizationId,
        data.manufacturer,
        data.sku
      );
      if (existing) {
        existingEquipmentId = existing.id;
        action = 'update';
        warnings.push({
          row: rowNumber,
          severity: 'info',
          field: 'sku',
          message: `Existing item found - will update pricing from ${config.distributorName}`,
          value: data.sku,
        });
      }
    }

    const status =
      errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid';

    return {
      rowNumber,
      data,
      errors,
      warnings,
      status,
      existingEquipmentId,
      action,
    };
  }

  /**
   * Set a field value with type conversion
   */
  private setFieldValue(
    data: Partial<EquipmentImportData>,
    field: string,
    value: string,
    rowNumber: number,
    errors: ValidationResult[],
    warnings: ValidationResult[]
  ): void {
    switch (field) {
      case 'manufacturer':
      case 'model':
      case 'sku':
      case 'description':
      case 'distributorSku':
        (data as Record<string, unknown>)[field] = value;
        break;

      case 'category': {
        const category = normalizeCategory(value);
        if (category) {
          data.category = category;
        } else {
          errors.push({
            row: rowNumber,
            severity: 'error',
            field: 'category',
            message: `Invalid category: ${value}. Must be one of: ${EQUIPMENT_CATEGORIES.join(', ')}`,
            value,
          });
        }
        break;
      }

      case 'subcategory':
        data.subcategory = value;
        break;

      case 'cost':
      case 'msrp':
      case 'map':
      case 'contract': {
        const numValue = parseToDollars(value);
        if (numValue < 0) {
          errors.push({
            row: rowNumber,
            severity: 'error',
            field,
            message: `${field} must be a positive number`,
            value,
          });
        } else {
          (data as Record<string, unknown>)[field] = numValue;
        }
        break;
      }

      case 'height':
      case 'width':
      case 'depth':
      case 'weight': {
        const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
        if (isNaN(numValue) || numValue < 0) {
          warnings.push({
            row: rowNumber,
            severity: 'warning',
            field,
            message: `Invalid ${field} value, will be set to 0`,
            value,
          });
          (data as Record<string, unknown>)[field] = 0;
        } else {
          (data as Record<string, unknown>)[field] = numValue;
        }
        break;
      }
    }
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(
    data: Partial<EquipmentImportData>,
    rowNumber: number,
    errors: ValidationResult[]
  ): void {
    const requiredFields: (keyof EquipmentImportData)[] = [
      'manufacturer',
      'model',
      'sku',
      'category',
      'subcategory',
      'cost',
      'msrp',
    ];

    for (const field of requiredFields) {
      const value = data[field];
      if (value === undefined || value === null || value === '') {
        errors.push({
          row: rowNumber,
          severity: 'error',
          field,
          message: `${field} is required`,
          value,
        });
      }
    }

    // Validate msrp >= cost
    if (data.cost !== undefined && data.msrp !== undefined && data.msrp < data.cost) {
      errors.push({
        row: rowNumber,
        severity: 'error',
        field: 'msrp',
        message: 'MSRP must be greater than or equal to cost',
        value: data.msrp,
      });
    }
  }

  /**
   * Update a row's data (for inline editing)
   */
  updateRow(
    preview: ImportPreview,
    rowNumber: number,
    field: string,
    value: unknown
  ): ImportPreview {
    const rowIndex = preview.rows.findIndex((r) => r.rowNumber === rowNumber);
    if (rowIndex < 0) return preview;

    const updatedRows = [...preview.rows];
    const row = { ...updatedRows[rowIndex] };
    row.data = { ...row.data, [field]: value };

    // Re-validate the row
    row.errors = [];
    row.warnings = [];
    this.validateRequiredFields(row.data, rowNumber, row.errors);
    row.status =
      row.errors.length > 0 ? 'error' : row.warnings.length > 0 ? 'warning' : 'valid';

    updatedRows[rowIndex] = row;

    // Recalculate summary
    const summary = {
      total: updatedRows.length,
      valid: updatedRows.filter((r) => r.status === 'valid').length,
      warnings: updatedRows.filter((r) => r.status === 'warning').length,
      errors: updatedRows.filter((r) => r.status === 'error').length,
      toCreate: updatedRows.filter((r) => r.action === 'create').length,
      toUpdate: updatedRows.filter((r) => r.action === 'update').length,
    };

    return { rows: updatedRows, summary };
  }

  /**
   * Execute the import
   */
  async executeImport(
    config: ImportConfig,
    preview: ImportPreview,
    userId: string
  ): Promise<{
    created: number;
    updated: number;
    failed: { row: number; error: string }[];
    importId: string;
  }> {
    // Create import record
    const insertData: EquipmentImportInsert = {
      organization_id: config.organizationId,
      user_id: userId,
      filename: 'csv-import',
      distributor: config.distributorName,
      total_rows: preview.summary.total,
      column_mapping: Object.fromEntries(
        config.columnMappings.map((m) => [m.csvColumn, m.destination])
      ) as Json,
      status: 'in_progress',
    };

    const { data: importRecord, error: importError } = await supabase
      .from('equipment_imports')
      .insert(insertData)
      .select()
      .single();

    if (importError) throw importError;

    const importId = (importRecord as { id: string }).id;
    let created = 0;
    let updated = 0;
    const failed: { row: number; error: string }[] = [];

    // Process only valid and warning rows (skip errors)
    const rowsToProcess = preview.rows.filter((r) => r.status !== 'error');

    for (const row of rowsToProcess) {
      try {
        const formData = this.toEquipmentFormData(row.data);
        const pricing = this.toDistributorPricing(row.data, config.distributorName);

        if (row.existingEquipmentId) {
          // Update existing
          await equipmentService.addPricing(row.existingEquipmentId, pricing);
          await equipmentService.update(row.existingEquipmentId, formData);
          updated++;
        } else {
          // Create new
          await equipmentService.create(formData, config.organizationId, pricing);
          created++;
        }
      } catch (error) {
        failed.push({
          row: row.rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update import record with results
    const updateData: EquipmentImportUpdate = {
      created_count: created,
      updated_count: updated,
      error_count: failed.length,
      errors: failed as Json,
      completed_at: new Date().toISOString(),
      status: failed.length === rowsToProcess.length ? 'failed' : 'completed',
    };

    await supabase.from('equipment_imports').update(updateData).eq('id', importId);

    return { created, updated, failed, importId };
  }

  /**
   * Convert parsed data to EquipmentFormData
   */
  private toEquipmentFormData(data: Partial<EquipmentImportData>): EquipmentFormData {
    return {
      manufacturer: data.manufacturer || '',
      model: data.model || '',
      sku: data.sku || '',
      category: data.category || 'video',
      subcategory: data.subcategory || '',
      description: data.description || '',
      cost: data.cost || 0,
      msrp: data.msrp || 0,
      dimensions: {
        height: data.height || 0,
        width: data.width || 0,
        depth: data.depth || 0,
      },
      weight: data.weight || 0,
    };
  }

  /**
   * Convert parsed data to DistributorPricing
   */
  private toDistributorPricing(
    data: Partial<EquipmentImportData>,
    distributorName: string
  ): DistributorPricing {
    return {
      distributor: distributorName,
      distributorSku: data.distributorSku || data.sku || '',
      cost: data.cost || 0,
      msrp: data.msrp || 0,
      map: data.map,
      contract: data.contract,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get import history for an organization
   */
  async getImportHistory(organizationId: string): Promise<ImportRecord[]> {
    const { data, error } = await supabase
      .from('equipment_imports')
      .select('*')
      .eq('organization_id', organizationId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    interface ImportDbRow {
      id: string;
      organization_id: string;
      user_id: string;
      filename: string;
      distributor: string;
      total_rows: number;
      created_count: number;
      updated_count: number;
      error_count: number;
      errors: unknown;
      column_mapping: unknown;
      started_at: string;
      completed_at: string | null;
      status: string;
    }

    return ((data || []) as ImportDbRow[]).map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      filename: row.filename,
      distributor: row.distributor,
      totalRows: row.total_rows,
      createdCount: row.created_count,
      updatedCount: row.updated_count,
      errorCount: row.error_count,
      errors: (row.errors as { row: number; error: string }[]) || [],
      columnMapping: (row.column_mapping as Record<string, string>) || {},
      startedAt: row.started_at,
      completedAt: row.completed_at ?? undefined,
      status: row.status as ImportRecord['status'],
    }));
  }
}

/**
 * Singleton instance
 */
export const equipmentImportService = new EquipmentImportService();
