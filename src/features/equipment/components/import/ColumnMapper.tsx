/**
 * ColumnMapper Component
 *
 * Map CSV columns to equipment fields
 */

import { useState, useEffect } from 'react';
import type { ColumnMapping, DestinationField, VendorTemplate } from '@/types/equipment';
import { VENDOR_TEMPLATES } from '../../import-service';

interface ColumnMapperProps {
  headers: string[];
  sampleRows: Record<string, string>[];
  initialMappings?: ColumnMapping[];
  detectedTemplate?: VendorTemplate;
  distributorName: string;
  onDistributorChange: (name: string) => void;
  onMappingsChange: (mappings: ColumnMapping[]) => void;
}

const DESTINATION_OPTIONS: {
  value: DestinationField;
  label: string;
  required?: boolean;
}[] = [
  { value: 'manufacturer', label: 'Manufacturer', required: true },
  { value: 'model', label: 'Model', required: true },
  { value: 'sku', label: 'SKU', required: true },
  { value: 'category', label: 'Category', required: true },
  { value: 'subcategory', label: 'Subcategory', required: true },
  { value: 'description', label: 'Description' },
  { value: 'cost', label: 'Cost (Dealer)', required: true },
  { value: 'msrp', label: 'MSRP (List)', required: true },
  { value: 'map', label: 'MAP Price' },
  { value: 'contract', label: 'Contract Price' },
  { value: 'height', label: 'Height' },
  { value: 'width', label: 'Width' },
  { value: 'depth', label: 'Depth' },
  { value: 'weight', label: 'Weight' },
  { value: 'distributorSku', label: 'Distributor SKU' },
  { value: 'ignore', label: 'Ignore' },
];

const DISTRIBUTORS = [
  'WESCO/Anixter',
  'ADI Global',
  'TD Synnex',
  'Ingram Micro',
  'Jenne',
  'BlueStar',
  'Stampede',
  'Almo Pro AV',
  'D&H Distributing',
  'ScanSource',
  'Custom',
];

function buildInitialMappings(
  headers: string[],
  initialMappings?: ColumnMapping[]
): Record<string, DestinationField> {
  const initial: Record<string, DestinationField> = {};

  if (initialMappings) {
    initialMappings.forEach((m) => {
      initial[m.csvColumn] = m.destination;
    });
    return initial;
  }

  headers.forEach((header) => {
    const lower = header.toLowerCase();
    if (lower.includes('manufacturer') || lower === 'mfr' || lower === 'vendor') {
      initial[header] = 'manufacturer';
    } else if (lower.includes('model') || lower.includes('product name')) {
      initial[header] = 'model';
    } else if (
      lower.includes('sku') ||
      lower.includes('part number') ||
      lower === 'part #'
    ) {
      initial[header] = 'sku';
    } else if (lower === 'category') {
      initial[header] = 'category';
    } else if (lower === 'subcategory' || lower === 'sub-category') {
      initial[header] = 'subcategory';
    } else if (lower.includes('description') || lower === 'desc') {
      initial[header] = 'description';
    } else if (
      lower.includes('cost') ||
      lower.includes('dealer') ||
      lower.includes('unit price')
    ) {
      initial[header] = 'cost';
    } else if (lower.includes('msrp') || lower.includes('list')) {
      initial[header] = 'msrp';
    } else if (lower.includes('map')) {
      initial[header] = 'map';
    } else if (lower.includes('contract')) {
      initial[header] = 'contract';
    } else if (lower.includes('height')) {
      initial[header] = 'height';
    } else if (lower.includes('width')) {
      initial[header] = 'width';
    } else if (lower.includes('depth')) {
      initial[header] = 'depth';
    } else if (lower.includes('weight')) {
      initial[header] = 'weight';
    }
  });

  return initial;
}

export function ColumnMapper({
  headers,
  sampleRows,
  initialMappings,
  detectedTemplate,
  distributorName,
  onDistributorChange,
  onMappingsChange,
}: ColumnMapperProps) {
  const [mappings, setMappings] = useState<Record<string, DestinationField>>(() =>
    buildInitialMappings(headers, initialMappings)
  );
  const [customDistributor, setCustomDistributor] = useState('');

  // Notify parent when mappings change
  useEffect(() => {
    const columnMappings: ColumnMapping[] = headers.map((header) => ({
      csvColumn: header,
      destination: mappings[header] || 'ignore',
    }));
    onMappingsChange(columnMappings);
  }, [mappings, headers, onMappingsChange]);

  const handleMappingChange = (csvColumn: string, destination: DestinationField) => {
    setMappings((prev) => ({ ...prev, [csvColumn]: destination }));
  };

  const handleDistributorSelect = (value: string) => {
    if (value === 'Custom') {
      onDistributorChange(customDistributor || 'Custom Import');
    } else {
      onDistributorChange(value);
    }
  };

  // Check which required fields are mapped
  const mappedFields = new Set(Object.values(mappings));
  const requiredFields = DESTINATION_OPTIONS.filter((o) => o.required).map(
    (o) => o.value
  );
  const missingRequired = requiredFields.filter((f) => !mappedFields.has(f));

  return (
    <div className="column-mapper">
      {/* Distributor Selection */}
      <div className="column-mapper__distributor">
        <label className="block text-sm text-text-secondary mb-2">Distributor</label>
        <div className="flex gap-2">
          <select
            value={DISTRIBUTORS.includes(distributorName) ? distributorName : 'Custom'}
            onChange={(e) => handleDistributorSelect(e.target.value)}
            className="settings-select flex-1"
          >
            {DISTRIBUTORS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {(!DISTRIBUTORS.includes(distributorName) ||
            DISTRIBUTORS.includes(distributorName) === false) && (
            <input
              type="text"
              value={customDistributor}
              onChange={(e) => {
                setCustomDistributor(e.target.value);
                onDistributorChange(e.target.value);
              }}
              placeholder="Enter distributor name"
              className="settings-input flex-1"
            />
          )}
        </div>

        {detectedTemplate && (
          <p className="text-xs text-green-500 mt-1">
            Detected format: {detectedTemplate.name}
          </p>
        )}
      </div>

      {/* Missing Required Fields Warning */}
      {missingRequired.length > 0 && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg mt-4">
          <p className="text-sm text-warning">
            Missing required fields: {missingRequired.join(', ')}
          </p>
        </div>
      )}

      {/* Column Mapping Table */}
      <div className="column-mapper__table mt-4">
        <div className="text-xs text-text-tertiary font-medium grid grid-cols-3 gap-4 pb-2 border-b border-border">
          <span>CSV Column</span>
          <span>Maps To</span>
          <span>Sample Value</span>
        </div>

        <div className="divide-y divide-border/50">
          {headers.map((header) => (
            <div key={header} className="grid grid-cols-3 gap-4 py-2 items-center">
              <span
                className="text-sm text-text-primary font-mono truncate"
                title={header}
              >
                {header}
              </span>

              <select
                value={mappings[header] || 'ignore'}
                onChange={(e) =>
                  handleMappingChange(header, e.target.value as DestinationField)
                }
                className="settings-select text-sm"
              >
                {DESTINATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                    {opt.required ? ' *' : ''}
                  </option>
                ))}
                <optgroup label="Specifications">
                  <option value={`specifications.${header}`}>
                    Add to specifications
                  </option>
                </optgroup>
              </select>

              <span
                className="text-sm text-text-tertiary truncate"
                title={sampleRows[0]?.[header]}
              >
                {sampleRows[0]?.[header] || '-'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Table */}
      {sampleRows.length > 0 && (
        <div className="column-mapper__preview mt-6">
          <h4 className="text-sm font-medium text-text-primary mb-2">
            Preview (first {sampleRows.length} rows)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-bg-tertiary">
                  {requiredFields.map((field) => (
                    <th
                      key={field}
                      className="px-2 py-1 text-left font-medium text-text-secondary"
                    >
                      {DESTINATION_OPTIONS.find((o) => o.value === field)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-border/30">
                    {requiredFields.map((field) => {
                      const csvColumn = Object.entries(mappings).find(
                        ([, dest]) => dest === field
                      )?.[0];
                      const value = csvColumn ? row[csvColumn] : '-';
                      return (
                        <td
                          key={field}
                          className="px-2 py-1 text-text-primary truncate max-w-32"
                        >
                          {value || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Quick Select */}
      <div className="column-mapper__templates mt-6">
        <p className="text-xs text-text-tertiary mb-2">Quick apply template:</p>
        <div className="flex flex-wrap gap-2">
          {VENDOR_TEMPLATES.filter((t) => t.type !== 'generic').map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                const newMappings: Record<string, DestinationField> = {};
                template.suggestedMappings.forEach((m) => {
                  // Find matching header (case-insensitive)
                  const matchingHeader = headers.find(
                    (h) => h.toLowerCase() === m.csvColumn.toLowerCase()
                  );
                  if (matchingHeader) {
                    newMappings[matchingHeader] = m.destination;
                  }
                });
                setMappings(newMappings);
                onDistributorChange(template.name);
              }}
              className="px-2 py-1 text-xs bg-bg-tertiary hover:bg-bg-secondary text-text-secondary rounded border border-border"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
