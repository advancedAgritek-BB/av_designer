# Real Data Integration Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

This design covers connecting the AV Designer frontend to the production Supabase database with:
- Schema alignment fixes (cents storage with dollar conversion)
- Migration sequencing (initial schema + auth schema together)
- CSV equipment import with column mapping and validation
- Multi-distributor pricing per equipment item
- Vendor templates for common AV distributors

---

## Key Decisions

| Aspect | Decision |
|--------|----------|
| Currency Storage | Cents in DB (integers), dollars in app (numbers) |
| Equipment Pricing | JSONB array of distributor prices per item |
| Seed Data | None - users import their own catalog |
| CSV Import | Column mapping UI with validation + inline editing |
| Duplicate Handling | Update existing by manufacturer + SKU match |
| Extra Fields | User chooses to map to specifications or ignore |

---

## Currency Utilities

**File:** `src/lib/currency.ts`

```typescript
/**
 * Convert cents (integer) to dollars (number)
 * 1999 cents → 19.99 dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars (number) to cents (integer)
 * 19.99 dollars → 1999 cents
 * Rounds to nearest cent to handle floating point
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format cents as currency string
 * 1999 → "$19.99"
 */
export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * Format dollars as currency string
 * 19.99 → "$19.99"
 */
export function formatDollars(dollars: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars);
}
```

---

## Updated Equipment Schema

**Equipment Table with Embedded Pricing**

```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core product identity
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  sku TEXT NOT NULL,  -- Manufacturer SKU

  -- Classification
  category equipment_category NOT NULL,
  subcategory TEXT NOT NULL,
  description TEXT DEFAULT '' NOT NULL,

  -- Physical specifications
  dimensions JSONB DEFAULT '{"height": 0, "width": 0, "depth": 0}'::jsonb NOT NULL,
  weight_lbs NUMERIC(10, 2) DEFAULT 0,

  -- Electrical specifications
  electrical JSONB DEFAULT '{}'::jsonb,

  -- Platform certifications
  platform_certifications TEXT[] DEFAULT '{}',

  -- Distributor pricing (array of pricing from different sources)
  pricing JSONB DEFAULT '[]'::jsonb NOT NULL,
  preferred_pricing_index INTEGER DEFAULT 0 NOT NULL,

  -- Additional specs from vendor sheets
  specifications JSONB DEFAULT '{}'::jsonb,

  -- Assets
  image_url TEXT,
  spec_sheet_url TEXT,

  -- Organization ownership
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Unique per manufacturer within org
  UNIQUE(organization_id, manufacturer, sku)
);

-- Index for distributor queries
CREATE INDEX idx_equipment_pricing_distributor
  ON equipment USING GIN (pricing jsonb_path_ops);
```

**Pricing JSONB Structure**

```typescript
interface DistributorPricing {
  distributor: string;      // "WESCO/Anixter", "ADI", etc.
  distributorSku: string;   // Distributor's part number
  costCents: number;        // Dealer cost in cents
  msrpCents: number;        // List price in cents
  mapCents?: number;        // Minimum advertised price (optional)
  contractCents?: number;   // Contract pricing (optional)
  lastUpdated: string;      // ISO timestamp
  notes?: string;           // Optional notes
}

// Example:
pricing: [
  {
    distributor: "WESCO/Anixter",
    distributorSku: "ANX-123456",
    costCents: 89900,
    msrpCents: 129900,
    lastUpdated: "2026-01-15T00:00:00Z"
  },
  {
    distributor: "ADI Global",
    distributorSku: "ADI-789012",
    costCents: 91500,
    msrpCents: 129900,
    lastUpdated: "2026-01-10T00:00:00Z"
  }
]
```

---

## Updated Equipment Types

**File:** `src/types/equipment.ts`

```typescript
export interface DistributorPricing {
  distributor: string;
  distributorSku: string;
  cost: number;          // Dollars (converted from cents)
  msrp: number;          // Dollars (converted from cents)
  map?: number;          // Dollars (optional)
  contract?: number;     // Dollars (optional)
  lastUpdated: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  dimensions: { height: number; width: number; depth: number };
  weight: number;
  electrical?: ElectricalSpecs;
  platformCertifications?: string[];
  specifications?: Record<string, unknown>;
  imageUrl?: string;
  specSheetUrl?: string;

  // Pricing
  pricing: DistributorPricing[];
  preferredPricingIndex: number;

  // Convenience (computed from preferred pricing)
  cost: number;
  msrp: number;

  // Metadata
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Service Layer Updates

**Updated Mapping Functions**

```typescript
import { centsToDollars, dollarsToCents } from '@/lib/currency';

private mapPricingFromDb(dbPricing: DbPricing[]): DistributorPricing[] {
  return dbPricing.map(p => ({
    distributor: p.distributor,
    distributorSku: p.distributor_sku,
    cost: centsToDollars(p.cost_cents),
    msrp: centsToDollars(p.msrp_cents),
    map: p.map_cents ? centsToDollars(p.map_cents) : undefined,
    contract: p.contract_cents ? centsToDollars(p.contract_cents) : undefined,
    lastUpdated: p.last_updated,
    notes: p.notes,
  }));
}

private mapPricingToDb(pricing: DistributorPricing[]): DbPricing[] {
  return pricing.map(p => ({
    distributor: p.distributor,
    distributor_sku: p.distributorSku,
    cost_cents: dollarsToCents(p.cost),
    msrp_cents: dollarsToCents(p.msrp),
    map_cents: p.map ? dollarsToCents(p.map) : null,
    contract_cents: p.contract ? dollarsToCents(p.contract) : null,
    last_updated: p.lastUpdated,
    notes: p.notes ?? null,
  }));
}

private mapRow(row: EquipmentDbRow): Equipment {
  const pricing = this.mapPricingFromDb(row.pricing || []);
  const preferred = pricing[row.preferred_pricing_index] || pricing[0];

  return {
    id: row.id,
    manufacturer: row.manufacturer,
    model: row.model,
    sku: row.sku,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    dimensions: row.dimensions,
    weight: row.weight_lbs,
    electrical: row.electrical ?? undefined,
    platformCertifications: row.platform_certifications ?? undefined,
    specifications: row.specifications ?? undefined,
    imageUrl: row.image_url ?? undefined,
    specSheetUrl: row.spec_sheet_url ?? undefined,
    pricing,
    preferredPricingIndex: row.preferred_pricing_index,
    cost: preferred?.cost ?? 0,
    msrp: preferred?.msrp ?? 0,
    organizationId: row.organization_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

**New Service Methods**

```typescript
// Add or update pricing for a distributor
async addPricing(equipmentId: string, pricing: DistributorPricing): Promise<Equipment>

// Remove pricing from a distributor
async removePricing(equipmentId: string, distributor: string): Promise<Equipment>

// Set preferred pricing source
async setPreferredPricing(equipmentId: string, index: number): Promise<Equipment>

// Find equipment by distributor
async getByDistributor(distributor: string): Promise<Equipment[]>
```

---

## CSV Import Feature

### Import Flow

```
1. Upload CSV
      │
      ▼
2. Column Mapping
   - Select distributor name
   - Map CSV columns to equipment fields
   - Map extra columns to specifications or ignore
   - Preview first rows
      │
      ▼
3. Validation & Preview
   - Show all parsed rows
   - Display errors, warnings, info
   - Allow inline editing to fix issues
   - Filter by status
      │
      ▼
4. Review & Confirm
   - Summary: new items, updates, warnings, errors
   - Checkbox confirmation
      │
      ▼
5. Import Complete
   - Success count
   - Failed rows with errors
```

### Import Service Types

```typescript
export interface ColumnMapping {
  csvColumn: string;
  destination:
    | 'manufacturer' | 'model' | 'sku' | 'category' | 'subcategory'
    | 'description' | 'cost' | 'msrp' | 'map' | 'contract'
    | 'height' | 'width' | 'depth' | 'weight'
    | 'distributor' | 'distributorSku'
    | `specifications.${string}`
    | 'ignore';
}

export interface ImportConfig {
  columnMappings: ColumnMapping[];
  distributorName: string;
  duplicateHandling: 'update';
  organizationId: string;
}

export interface ValidationResult {
  row: number;
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  value: unknown;
}

export interface ParsedRow {
  rowNumber: number;
  data: Partial<EquipmentImportData>;
  errors: ValidationResult[];
  warnings: ValidationResult[];
  status: 'valid' | 'warning' | 'error';
  existingEquipmentId?: string;
  action: 'create' | 'update';
}

export interface ImportPreview {
  rows: ParsedRow[];
  summary: {
    total: number;
    valid: number;
    warnings: number;
    errors: number;
    toCreate: number;
    toUpdate: number;
  };
}
```

### Import Service Methods

```typescript
class EquipmentImportService {
  // Step 1: Parse CSV and detect columns
  async parseCSV(file: File): Promise<{
    headers: string[];
    sampleRows: Record<string, string>[];
    suggestedMappings?: ColumnMapping[];
  }>

  // Step 2: Validate all rows with current mapping
  async validate(file: File, config: ImportConfig): Promise<ImportPreview>

  // Step 3: Update a row's data (inline editing)
  updateRow(
    preview: ImportPreview,
    rowNumber: number,
    field: string,
    value: unknown
  ): ImportPreview

  // Step 4: Execute import
  async executeImport(
    file: File,
    config: ImportConfig,
    preview: ImportPreview
  ): Promise<{
    created: number;
    updated: number;
    failed: { row: number; error: string }[];
  }>
}
```

### Validation Rules

| Field | Validation |
|-------|------------|
| manufacturer | Required, non-empty string |
| model | Required, non-empty string |
| sku | Required, unique within import + existing catalog |
| category | Required, must be: video, audio, control, infrastructure |
| subcategory | Required, non-empty string |
| cost | Required, positive number |
| msrp | Required, positive number, >= cost |
| dimensions | Optional, positive numbers if provided |
| weight | Optional, positive number if provided |

### Duplicate Detection

```typescript
async function findExistingEquipment(
  orgId: string,
  manufacturer: string,
  sku: string
): Promise<Equipment | null> {
  const { data } = await supabase
    .from('equipment')
    .select('*')
    .eq('organization_id', orgId)
    .eq('manufacturer', manufacturer)
    .eq('sku', sku)
    .single();

  return data ? mapRow(data) : null;
}
```

When duplicate found:
- Mark row as "update" action
- Show info: "Existing item - will update pricing from {distributor}"
- On import: merge new pricing into existing pricing array

---

## Vendor Templates

### Available Templates

| Type | Templates |
|------|-----------|
| **Distributors** | WESCO/Anixter, ADI Global, Synnex/TD Synnex, Ingram Micro, Jenne, BlueStar, Stampede, Almo Pro AV |
| **Manufacturers** | Poly/HP, Logitech, Crestron, Biamp, Shure, QSC, Extron |
| **Generic** | Universal fallback format |

### Template Storage

```
public/
└── import-templates/
    ├── generic.csv
    ├── wesco-anixter.csv
    ├── adi-global.csv
    ├── synnex.csv
    ├── ingram-micro.csv
    ├── jenne.csv
    ├── bluestar.csv
    ├── stampede.csv
    ├── almo.csv
    ├── poly.csv
    ├── logitech.csv
    ├── crestron.csv
    ├── biamp.csv
    ├── shure.csv
    ├── qsc.csv
    └── extron.csv
```

### Auto-Detection

When user uploads CSV, attempt to match column headers to known vendor patterns:
- If match found: Pre-fill column mapping
- If no match: Start with empty mapping

---

## Import UI Components

**New Components** (`src/features/equipment/components/import/`)

| Component | Description |
|-----------|-------------|
| ImportModal | Main modal orchestrating the import flow |
| FileUploader | Drag-drop CSV upload with file validation |
| ColumnMapper | Map CSV columns to equipment fields |
| ValidationPreview | Show parsed rows with errors/warnings |
| RowEditor | Inline edit a single row to fix issues |
| ImportSummary | Final review before committing import |
| TemplateDownloader | Download vendor template CSVs |

### Step 1: Upload File

```
┌────────────────────────────────────────────────────┐
│                                                    │
│     Drag and drop your CSV file here              │
│              or click to browse                   │
│                                                    │
└────────────────────────────────────────────────────┘

Or download a template:
[WESCO] [ADI] [Synnex] [Ingram] [Generic] [More ▼]
```

### Step 2: Map Columns

```
Distributor: [WESCO/Anixter        ▼]

CSV Column          →  Equipment Field
──────────────────────────────────────────────────
"Manufacturer"      →  [manufacturer        ▼]
"Part Number"       →  [sku                 ▼]
"Description"       →  [model               ▼]
"Category Code"     →  [category            ▼]
"Dealer Cost"       →  [cost                ▼]
"List Price"        →  [msrp                ▼]
"Weight (lbs)"      →  [weight              ▼]
"Custom Field 1"    →  [specifications.custom ▼]
"Internal Notes"    →  [ignore              ▼]

Preview (first 3 rows):
┌────────────────────────────────────────────────────┐
│ Poly | Studio X50 | PLY-X50 | video | $899 | $1299 │
│ Poly | Studio X70 | PLY-X70 | video | $1899| $2499 │
│ Logi | Rally Bar  | LOG-RB  | video | $2999| $3999 │
└────────────────────────────────────────────────────┘
```

### Step 3: Review & Fix

```
✓ 142 valid   ⚠ 3 warnings   ✗ 2 errors

Filter: [All ▼]  Search: [________________]

┌────────────────────────────────────────────────────┐
│ # │ Manufacturer │ Model    │ SKU     │ Status    │
│───┼──────────────┼──────────┼─────────┼───────────│
│ 1 │ Poly         │ X50      │ PLY-X50 │ ✓ Valid   │
│ 2 │ Poly         │ X70      │ PLY-X70 │ ℹ Update  │
│ 3 │ Logitech     │ Rally    │         │ ✗ No SKU  │ ← [Edit]
│ 4 │ Crestron     │ UC-ENG   │ UC-123  │ ⚠ No desc │
└────────────────────────────────────────────────────┘
```

### Step 4: Confirm

```
Ready to import 145 items from WESCO/Anixter

┌────────────────────────────────────────────────────┐
│  📦  132 new items will be created                 │
│  🔄  13 existing items will be updated             │
│  ⚠️  3 items with warnings (will import)           │
│  ❌  2 items with errors (will skip)               │
└────────────────────────────────────────────────────┘

☑ I understand this will update pricing for
  existing items from this distributor

              [Cancel]  [Import 145 Items]
```

---

## Migration Sequencing

### Migration Files

```
supabase/migrations/
├── 001_initial_schema.sql      # Modified - remove cost_cents/msrp_cents
├── 002_authentication.sql      # From auth design
└── 003_equipment_pricing.sql   # New pricing structure
```

### Migration 001 Modifications

Remove:
- `cost_cents` and `msrp_cents` columns
- Equipment seed data

Keep:
- All table structures
- Indexes, RLS policies, triggers
- Seed data for `standard_nodes` and `rules`

### Migration 002: Authentication

From auth design:
- Organizations table
- Organization members table
- Invitations table
- User profiles table
- Add `organization_id` to projects, equipment, standards, rules
- RLS policy updates

### Migration 003: Equipment Pricing

```sql
-- Add pricing array and preferred index
ALTER TABLE equipment
  ADD COLUMN pricing JSONB DEFAULT '[]'::jsonb NOT NULL,
  ADD COLUMN preferred_pricing_index INTEGER DEFAULT 0 NOT NULL;

-- Add GIN index for distributor queries
CREATE INDEX idx_equipment_pricing_distributor
  ON equipment USING GIN (pricing jsonb_path_ops);

-- Update unique constraint to be per-organization
ALTER TABLE equipment
  DROP CONSTRAINT IF EXISTS equipment_sku_key,
  ADD CONSTRAINT equipment_org_manufacturer_sku_unique
    UNIQUE(organization_id, manufacturer, sku);
```

### Deployment Order

```
1. Backup production database (pg_dump)
      │
      ▼
2. Apply 001_initial_schema.sql (modified)
      │
      ▼
3. Apply 002_authentication.sql
      │
      ▼
4. Apply 003_equipment_pricing.sql
      │
      ▼
5. Verify schema in Supabase Dashboard
      │
      ▼
6. Deploy updated frontend with new services
      │
      ▼
7. Test end-to-end flows
```

### Rollback Plan

1. Restore from pg_dump backup
2. Deploy previous frontend version
3. Investigate and fix issues
4. Re-attempt deployment

---

## File Structure

### New Files

```
src/
├── lib/
│   └── currency.ts                    # Conversion utilities
├── features/
│   └── equipment/
│       ├── equipment-service.ts       # Updated with pricing
│       ├── import-service.ts          # CSV import logic
│       ├── components/
│       │   └── import/
│       │       ├── ImportModal.tsx
│       │       ├── FileUploader.tsx
│       │       ├── ColumnMapper.tsx
│       │       ├── ValidationPreview.tsx
│       │       ├── RowEditor.tsx
│       │       ├── ImportSummary.tsx
│       │       ├── TemplateDownloader.tsx
│       │       └── index.ts
│       └── index.ts
├── types/
│   └── equipment.ts                   # Updated types
└── styles/
    └── features/
        └── equipment-import.css

public/
└── import-templates/
    ├── generic.csv
    ├── wesco-anixter.csv
    ├── adi-global.csv
    ├── synnex.csv
    ├── ingram-micro.csv
    ├── jenne.csv
    ├── bluestar.csv
    ├── stampede.csv
    ├── almo.csv
    ├── poly.csv
    ├── logitech.csv
    ├── crestron.csv
    ├── biamp.csv
    ├── shure.csv
    ├── qsc.csv
    └── extron.csv

supabase/
└── migrations/
    ├── 001_initial_schema.sql         # Modified
    ├── 002_authentication.sql         # From auth design
    └── 003_equipment_pricing.sql      # New
```

---

## Testing Strategy

### Unit Tests

- Currency conversion functions
- Import service validation logic
- Pricing mapping functions
- Duplicate detection logic

### Integration Tests

- CSV parsing with various formats
- Import flow end-to-end
- Equipment CRUD with pricing
- Distributor queries

### E2E Tests

- Upload CSV, map columns, validate, import
- View equipment with multiple distributor prices
- Switch preferred pricing
- Update pricing via re-import
