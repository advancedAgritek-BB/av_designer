# Pricing Sheet Import - Design Document

**Created:** 2026-01-22
**Status:** Ready for Implementation

---

## Overview

A full-page import wizard that allows users to import equipment from pricing sheets (Excel, CSV, PDF) with flexible column mapping, automatic matching to existing equipment, and validation before commit.

---

## Requirements

| Requirement | Decision |
|-------------|----------|
| File formats | Excel (.xlsx), CSV, PDF (text + scanned) |
| Pricing sources | Mix of distributors and manufacturers |
| Data completeness | Varies by source - import partial, flag incomplete |
| Duplicate handling | Update all fields when match found |
| Match strategy | SKU with fallback to Manufacturer + Model |
| Pre-commit review | Always preview before importing |
| UI pattern | Full-page wizard |

---

## Architecture

**Approach:** Rust-First Processing

All file parsing happens in the Tauri/Rust backend:
- Excel/CSV parsed with `calamine` and `csv` crates
- PDF text extraction with `pdf-extract` crate
- OCR via local Tesseract binding (`tesseract-rs`)

Rationale:
- Keeps all parsing logic in one place (Rust)
- Works fully offline - important for desktop app
- Matches existing architecture (Rust backend for heavy processing)
- Tesseract can be bundled with the app

---

## Wizard Flow

### Step 1: File Selection
- Drag-drop zone or file picker
- Accepts `.xlsx`, `.csv`, `.pdf`
- Shows file name, size, detected format
- For PDFs: auto-detects if OCR is needed (checks for extractable text)

### Step 2: Source Template (Optional)
- Dropdown of saved source templates (e.g., "Synnex Price List", "Poly Direct")
- Option to start fresh with manual mapping
- Templates store column mappings for repeat imports

### Step 3: Column Mapping
- Shows first 5-10 rows of parsed data as preview table
- Dropdown above each column to map to equipment fields
- Required fields highlighted: Manufacturer, Model, SKU, Cost
- Optional fields: MSRP, Category, Description, Dimensions, Weight, etc.
- "Unmapped" option for columns to ignore
- Auto-mapping suggestion based on header names

### Step 4: Preview & Validation
- Full list of equipment to import
- Color-coded rows: green (new), blue (update existing), yellow (incomplete)
- Summary stats: "47 new, 12 updates, 8 incomplete"
- Click row to see field-by-field diff for updates
- Option to exclude specific rows

### Step 5: Confirm & Import
- Final summary
- Option to save mapping as template for this source
- Import button commits to database
- Progress indicator during import
- Success screen with link to equipment list

---

## Data Model

### Import Session (Frontend State)

```typescript
interface ImportSession {
  id: string;
  fileName: string;
  fileType: 'xlsx' | 'csv' | 'pdf';
  sourceTemplateId?: string;
  columnMappings: ColumnMapping[];
  parsedRows: ParsedRow[];
  validationResults: ValidationResult[];
  status: 'parsing' | 'mapping' | 'validating' | 'previewing' | 'importing' | 'complete' | 'failed';
  createdAt: string;
}

interface ColumnMapping {
  sourceColumn: number;      // Index in parsed data
  sourceHeader: string;      // Original header name
  targetField: EquipmentField | null;  // null = unmapped/ignored
}

type EquipmentField =
  | 'manufacturer' | 'model' | 'sku' | 'category' | 'subcategory'
  | 'description' | 'cost' | 'msrp' | 'height' | 'width' | 'depth'
  | 'weight' | 'voltage' | 'wattage' | 'certifications' | 'imageUrl';
```

### Parsed Data & Validation

```typescript
interface ParsedRow {
  rowNumber: number;
  cells: string[];           // Raw cell values
  equipment: Partial<Equipment>;  // Mapped to equipment fields
}

interface ValidationResult {
  rowNumber: number;
  status: 'valid' | 'incomplete' | 'invalid';
  matchType: 'new' | 'update_sku' | 'update_fallback' | null;
  existingEquipmentId?: string;
  missingFields: EquipmentField[];
  errors: string[];          // e.g., "Invalid cost format"
}
```

### Source Templates (Persisted)

```typescript
interface SourceTemplate {
  id: string;
  name: string;              // e.g., "Synnex AV Price List"
  columnMappings: ColumnMapping[];
  createdAt: string;
  updatedAt: string;
}
```

---

## Rust Backend

### Module Structure

```
src-tauri/src/import/
├── mod.rs           # Module exports, Tauri commands
├── parser.rs        # Unified parser interface
├── excel.rs         # Excel parsing with calamine
├── csv.rs           # CSV parsing
├── pdf.rs           # PDF text extraction + OCR
└── ocr.rs           # Tesseract integration
```

### Tauri Commands

```rust
#[tauri::command]
async fn parse_file(path: String) -> Result<ParsedFile, ImportError>

#[tauri::command]
async fn detect_headers(parsed: ParsedFile) -> Result<Vec<HeaderSuggestion>, ImportError>

#[tauri::command]
async fn validate_import(
    rows: Vec<ParsedRow>,
    mappings: Vec<ColumnMapping>
) -> Result<Vec<ValidationResult>, ImportError>

#[tauri::command]
async fn execute_import(
    rows: Vec<ParsedRow>,
    mappings: Vec<ColumnMapping>
) -> Result<ImportResult, ImportError>
```

### Crate Dependencies

| Crate | Purpose |
|-------|---------|
| `calamine` | Excel (.xlsx, .xls) parsing |
| `csv` | CSV parsing |
| `pdf-extract` | PDF text extraction |
| `tesseract-rs` | OCR for scanned PDFs |
| `image` | Image preprocessing before OCR |

### OCR Strategy

1. Attempt text extraction with `pdf-extract`
2. If text is sparse (<50 chars per page), trigger OCR
3. Convert PDF pages to images
4. Run Tesseract with table detection hints
5. Structure output back into rows/columns

---

## Frontend Components

### Module Structure

```
src/features/import/
├── import-service.ts        # Tauri command wrappers
├── use-import.ts            # React hooks for import state
├── components/
│   ├── ImportPage.tsx       # Main page orchestrator
│   ├── FileUploadStep.tsx   # Drag-drop, file selection
│   ├── TemplateStep.tsx     # Source template picker
│   ├── MappingStep.tsx      # Column mapping interface
│   ├── PreviewStep.tsx      # Validation results, row preview
│   ├── ConfirmStep.tsx      # Final summary, import trigger
│   ├── MappingTable.tsx     # Reusable mapping grid
│   ├── RowDiffModal.tsx     # Side-by-side diff for updates
│   └── ImportProgress.tsx   # Progress bar during import
└── index.ts                 # Public exports
```

### Component Responsibilities

| Component | Purpose |
|-----------|---------|
| ImportPage | Wizard state machine, step navigation, breadcrumb progress |
| FileUploadStep | File input, format detection, triggers Rust parsing |
| TemplateStep | Load/select saved templates, skip if starting fresh |
| MappingStep | Column dropdowns, auto-suggest, preview table |
| PreviewStep | Validation summary, filterable row list, exclude toggles |
| ConfirmStep | Stats, save template option, execute import |

### State Management

**Zustand store** for wizard state (not persisted):
- Current step
- Parsed file data
- Column mappings
- Validation results
- Selected/excluded rows

**React Query** for:
- Source templates (CRUD, persisted to Supabase)
- Equipment matching lookups during validation

---

## Database Schema

### Source Templates Table

```sql
CREATE TABLE source_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('xlsx', 'csv', 'pdf')),
  column_mappings JSONB NOT NULL,  -- Array of {sourceColumn, sourceHeader, targetField}
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_source_templates_org ON source_templates(org_id);
```

### RLS Policies

- Users can only see templates for their organization
- Templates are shared within an organization (any member can use/edit)

---

## UI Design

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Equipment          Import Equipment              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ○────────○────────○────────○────────○                      │
│  Upload   Template  Mapping  Preview  Confirm               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [ Step Content ]                         │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                              [ Back ]  [ Continue ]         │
└─────────────────────────────────────────────────────────────┘
```

### Key UI Elements

| Element | Style |
|---------|-------|
| Step indicator | Connected dots, gold for complete, blue for current, gray for pending |
| Drag-drop zone | Dashed border, `#1E2A3E` background, hover state with gold border |
| Mapping dropdowns | Existing Input component styled as select |
| Preview table | Zebra striping with `#151D2E` / `#1A2435` alternating |
| Status badges | Green "New", Blue "Update", Yellow "Incomplete" using pill classes |
| Diff view | Side-by-side with red/green highlighting for changed values |

### New CSS File

`src/styles/features/import.css` - wizard steps, mapping table, preview grid

---

## Error Handling

### File Parsing Errors

| Scenario | Handling |
|----------|----------|
| Corrupt/unreadable file | Show error on upload step, allow retry with different file |
| Password-protected Excel | Detect and prompt "This file is password protected" |
| Empty file | "No data found in file" message |
| PDF with no extractable content | Trigger OCR automatically, show "Processing scanned document..." |
| OCR fails | "Could not read scanned document. Try a clearer scan or different format." |

### Mapping & Validation Errors

| Scenario | Handling |
|----------|----------|
| Required field unmapped | Block Continue, highlight missing: "Manufacturer, Model, SKU, and Cost are required" |
| Invalid data format | Flag row as invalid, show specific error: "Row 15: Cost 'TBD' is not a number" |
| Duplicate rows in file | Warn but allow: "Rows 12 and 45 have the same SKU" |
| All rows invalid | Block import, show summary of issues |

### Import Errors

| Scenario | Handling |
|----------|----------|
| Network failure mid-import | Transaction rollback, show retry option |
| Partial failure | Report which rows succeeded/failed, option to retry failed rows |

### Large File Handling

- Files > 1000 rows: Show progress during parsing
- Files > 5000 rows: Parse in chunks, stream to preview
- Memory limit: Cap at 10,000 rows per import, suggest splitting file

---

## Routing

New route: `/equipment/import`

Add to `src/routes.ts`:
```typescript
EQUIPMENT_IMPORT: '/equipment/import'
```

Navigation: Button on EquipmentPage header "Import Equipment" → navigates to import wizard

---

## Implementation Order

1. **Database migration** - source_templates table
2. **Rust parsing module** - Excel and CSV first, PDF later
3. **Frontend types** - ImportSession, ColumnMapping, ValidationResult
4. **Zustand store** - Import wizard state
5. **Service layer** - Tauri command wrappers
6. **Components** - Build wizard steps in order
7. **Source templates** - CRUD with React Query
8. **PDF + OCR** - Add after core flow works
9. **Testing** - Unit tests for parsing, integration tests for wizard

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| File formats? | Excel, CSV, PDF |
| Handle incomplete data? | Import partial, flag for review |
| Match strategy? | SKU with fallback to manufacturer + model |
| Update or skip existing? | Update all fields |
| Preview before commit? | Always |
| UI pattern? | Full-page wizard |
| Import history table? | No, just templates |
