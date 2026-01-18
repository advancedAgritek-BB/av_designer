# PDF Export Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

Complete PDF export system using printpdf (Rust) with:
- All six drawing types supported
- Three export modes: single, batch, combined package
- Full title block template system (presets + custom SVG)
- Architectural scales + auto-fit + NTS
- System font selection with embedding
- Print-optimized with PDF bookmarks
- Configurable package contents

---

## Key Decisions

| Aspect | Decision |
|--------|----------|
| PDF Library | printpdf (Rust native) |
| Drawing Types | All 6 (Electrical, Elevation, RCP, Rack, Cable Schedule, Floor Plan) |
| Export Modes | Single, Batch (separate files), Combined Package (multi-page) |
| Title Block | 4 presets + custom SVG upload, user-configurable size |
| Scales | Auto-fit, architectural, metric, custom, NTS |
| Fonts | System font selection with PDF embedding |
| Package Contents | User-selectable (cover, drawings, BOM, cable schedule, notes) |
| Output | Local save with "Save As" + cloud upload option |

---

## Export Modes

| Mode | Output | Use Case |
|------|--------|----------|
| Single Drawing | One PDF file | Quick export of specific drawing |
| Batch Export | Multiple PDF files | All drawings as separate files |
| Combined Package | One multi-page PDF | Complete documentation set |

---

## Title Block Template System

### Predefined Layouts

| Layout | Description | Best For |
|--------|-------------|----------|
| Standard AV | Full block with project, drawing, revision, signatures | General use |
| Minimal | Compact single-row block | Simple drawings, quick prints |
| Engineering | Full block with approval workflow, stamp areas | Formal submittals |
| Client-facing | Clean, branded layout | Presentations, proposals |

### Title Block Configuration

```typescript
interface TitleBlockConfig {
  // Template selection
  template: 'standard' | 'minimal' | 'engineering' | 'client' | 'custom';
  customTemplateSvg?: string;

  // Sizing (user-defined)
  width: number;        // in inches
  height: number;       // in inches
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

  // Organization defaults
  companyName: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  website?: string;
}
```

### Size Presets

| Preset | Dimensions | Notes |
|--------|------------|-------|
| Small | 4" × 0.75" | Compact, for small drawings |
| Standard | 5" × 1.0" | Default for most uses |
| Large | 6" × 1.5" | Full info, Arch D sheets |
| Custom | User-defined | Any size within page bounds |

### SVG Template Tokens

| Token | Replaced With |
|-------|---------------|
| `{{company_name}}` | Organization name |
| `{{company_logo}}` | Logo image |
| `{{project_name}}` | Project name |
| `{{client_name}}` | Client name |
| `{{drawing_title}}` | Drawing title |
| `{{drawing_number}}` | Drawing number (e.g., E-101) |
| `{{revision}}` | Revision letter |
| `{{date}}` | Export date |
| `{{drawn_by}}` | Designer name |
| `{{checked_by}}` | Reviewer name |
| `{{approved_by}}` | Approver name |
| `{{scale}}` | Drawing scale |
| `{{sheet_number}}` | Current sheet |
| `{{total_sheets}}` | Total sheet count |

### Template Storage

```
Organization Settings
├── title_block_template: 'standard' | 'minimal' | 'engineering' | 'client' | 'custom'
├── custom_template_svg: string | null
├── logo_url: string | null
└── default_title_block_data:
    ├── company_name: string
    ├── address: string
    ├── phone: string
    └── website: string
```

---

## Scale & Page Layout

### Scale Options

| Type | Options | Description |
|------|---------|-------------|
| Auto-fit | Single option | Scale drawing to fit page |
| Architectural | 1/8" = 1'-0", 1/4" = 1'-0", 1/2" = 1'-0", 1" = 1'-0" | Standard scales |
| Metric | 1:100, 1:50, 1:25, 1:10 | International |
| Custom | User enters ratio | Any scale |
| NTS | Not To Scale | Schematic drawings |

### Page Sizes

| Size | Dimensions | Common Use |
|------|------------|------------|
| Letter | 8.5" × 11" | Office printing |
| Legal | 8.5" × 14" | Extended drawings |
| Tabloid | 11" × 17" | Detailed drawings |
| A4 | 210mm × 297mm | International |
| A3 | 297mm × 420mm | International detailed |
| Arch D | 24" × 36" | Full construction documents |
| Custom | User-defined | Any size |

### Page Layout Configuration

```typescript
interface PageLayoutConfig {
  size: PageSize | { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  titleBlock: TitleBlockConfig;
}
```

### Multi-Page Handling

When drawing exceeds single page at selected scale:

| Option | Behavior |
|--------|----------|
| Auto-split | Divide into grid of pages with match lines |
| Scale to fit | Reduce scale to fit on one page |
| Warn user | Alert with suggestions (default) |

---

## Drawing Rendering

### Element Types

| Element Type | Rendering | Properties Used |
|--------------|-----------|-----------------|
| Equipment | Symbol/rectangle with label | manufacturer, model, dimensions |
| Cable | Line with endpoint markers | cable type, length, label |
| Text | Text string | content, font size, alignment |
| Dimension | Dimension line with value | start, end, offset, value |
| Symbol | SVG/predefined symbol | symbol type, size |

### Drawing Type Specifics

| Drawing Type | Content | Layout |
|--------------|---------|--------|
| Electrical | Signal flow diagram | Schematic, left-to-right |
| Elevation | Front/side equipment views | Scaled, with dimensions |
| RCP | Ceiling-mounted equipment | Plan view, north up |
| Rack | Equipment in rack units | Front elevation, RU grid |
| Cable Schedule | Table of all cables | Tabular, multi-column |
| Floor Plan | Room layout | Plan view, scaled |

### Layer Rendering Order

1. Architectural (room outline, walls)
2. AV Elements (equipment, cables)
3. Annotations (labels, callouts)
4. Dimensions (measurement lines)
5. Title Block (always on top)

### Line Weights

| Element | Weight | Color |
|---------|--------|-------|
| Room outline | 0.5pt | Black |
| Equipment outline | 0.35pt | Black |
| Cables | 0.25pt | Black or colored |
| Dimensions | 0.18pt | Black |
| Annotations | 0.25pt | Black |
| Grid/guides | 0.1pt | Light gray |

---

## Font Configuration

### Font Selection

```typescript
interface FontConfig {
  labelFont: string;        // Equipment labels, annotations
  dimensionFont: string;    // Dimension values
  titleBlockFont: string;   // Title block text

  labelSize: number;        // Default: 8pt
  dimensionSize: number;    // Default: 7pt
  annotationSize: number;   // Default: 9pt
  titleBlockHeadingSize: number;  // Default: 10pt
  titleBlockContentSize: number;  // Default: 9pt
}
```

### Font Sources

| Source | Method |
|--------|--------|
| System fonts | Tauri reads via `font-kit` crate |
| Embedded fallbacks | Bundle Helvetica/Arial |
| Organization default | Set in org settings |

### PDF Embedding

- Selected fonts subset-embedded in PDF
- Only glyphs used are included (smaller files)
- Ensures consistent display on any machine

---

## Package Contents

### Cover Page

```
┌─────────────────────────────────────────────────────────┐
│                    [COMPANY LOGO]                       │
│                                                         │
│                    PROJECT NAME                         │
│                    Client Name                          │
│                                                         │
│                  AV SYSTEM DRAWINGS                     │
│                                                         │
│  Table of Contents                                      │
│  ─────────────────────────────────────────────────────  │
│  E-101    Electrical Line Diagram ............... 2    │
│  E-102    Rack Elevation ........................ 3    │
│  E-103    Floor Plan ............................ 4    │
│  ...                                                    │
│                                                         │
│  Prepared by: Designer Name                             │
│  Date: January 18, 2026                                 │
│  Revision: A                                            │
└─────────────────────────────────────────────────────────┘
```

### Equipment List Page

| Column | Description |
|--------|-------------|
| Item # | Sequential number |
| Manufacturer | Equipment manufacturer |
| Model | Model number |
| Description | Brief description |
| Qty | Quantity in room |
| Location | Where installed |

### Cable Schedule Page

| Column | Description |
|--------|-------------|
| Cable # | Unique identifier |
| Type | HDMI, Cat6, XLR, etc. |
| From | Source device |
| To | Destination device |
| Length | Estimated length |
| Notes | Special requirements |

### Notes Page

- Project-specific notes
- Standard disclaimers (per org)
- Revision history table

### Content Selection UI

All items user-selectable with drag-to-reorder:
- Cover Page
- Drawings (any combination)
- Equipment List
- Cable Schedule
- Notes Page

---

## Export Workflow

### Entry Points

| Location | Action | Default Mode |
|----------|--------|--------------|
| Drawing toolbar | "Export" button | Single |
| Room page header | "Export All" | Package |
| Right-click drawing | Context menu | Single |
| Keyboard | Cmd/Ctrl + E | Current |
| Batch action | Multi-select | Batch |

### Export Modal

```
┌─────────────────────────────────────────────────────────┐
│ Export to PDF                                      [X]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Export Mode                                             │
│ [○ Single] [○ Batch] [● Combined Package]              │
│                                                         │
│ Contents                          Page Setup            │
│ ☑ Cover Page                      Size: [Tabloid    ▼] │
│ ☑ Electrical (E-101)              Orientation: [Land ▼]│
│ ☑ Rack Elevation (E-102)          Scale: [1/4" = 1' ▼] │
│ ☐ RCP (E-104)                                          │
│ ☑ Cable Schedule                  Margins              │
│ ☑ Equipment List                  [0.5] [0.5] [0.5]    │
│                                                         │
│ Title Block                                             │
│ Template: [Standard AV ▼]  Size: [5] × [1] in          │
│ Position: [Bottom Right ▼]                             │
│                                                         │
│ Output                                                  │
│ ~/Documents/AV Designer/Project X/exports/             │
│ Filename: [Project X - AV Drawings Rev A    ]          │
│ ☑ Also upload to cloud storage                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│              [Cancel]              [Export PDF]         │
└─────────────────────────────────────────────────────────┘
```

### Progress Indicator

```
┌─────────────────────────────────────────────────────────┐
│ Generating PDF...                                       │
│                                                         │
│ ████████████░░░░░░░░░░░░░░░░░░░░  35%                  │
│                                                         │
│ Rendering: Electrical Line Diagram (E-101)              │
│ Page 2 of 7                                             │
│                                                         │
│                              [Cancel]                   │
└─────────────────────────────────────────────────────────┘
```

### Export Complete

```
┌─────────────────────────────────────────────────────────┐
│ ✓ Export Complete                                       │
│                                                         │
│ Project X - AV Drawings Rev A.pdf                       │
│ 7 pages • 2.4 MB                                        │
│                                                         │
│ ☑ Saved locally                                        │
│ ☑ Uploaded to cloud                                    │
│                                                         │
│        [Open PDF]  [Open Folder]  [Done]               │
└─────────────────────────────────────────────────────────┘
```

---

## Rust Implementation

### Dependencies

```toml
[dependencies]
printpdf = "0.7"
font-kit = "0.14"
rusttype = "0.9"
image = "0.25"
base64 = "0.22"
```

### Module Structure

```
src-tauri/src/export/
├── mod.rs
├── pdf.rs                  # Existing types
├── pdf_generator.rs        # PDF generation
├── title_block.rs          # Title block rendering
├── drawing_renderer.rs     # Element rendering
├── font_manager.rs         # Font discovery/embedding
├── page_layout.rs          # Page setup
└── templates/
    ├── mod.rs
    ├── standard.svg
    ├── minimal.svg
    ├── engineering.svg
    └── client.svg
```

### Core Generator

```rust
pub struct PdfGenerator {
    doc: PdfDocumentReference,
    font_manager: FontManager,
    config: PdfExportConfig,
}

impl PdfGenerator {
    pub fn new(config: PdfExportConfig) -> Result<Self, PdfError>;

    pub fn add_cover_page(&mut self, project: &Project) -> Result<(), PdfError>;
    pub fn add_drawing_page(&mut self, drawing: &Drawing) -> Result<(), PdfError>;
    pub fn add_equipment_list(&mut self, equipment: &[Equipment]) -> Result<(), PdfError>;
    pub fn add_cable_schedule(&mut self, cables: &[Cable]) -> Result<(), PdfError>;
    pub fn add_notes_page(&mut self, notes: &str) -> Result<(), PdfError>;

    pub fn save(&self, path: &Path) -> Result<PdfExportResult, PdfError>;
    pub fn to_bytes(&self) -> Result<Vec<u8>, PdfError>;
}
```

### Drawing Renderer

```rust
pub struct DrawingRenderer<'a> {
    layer: PdfLayerReference,
    font_manager: &'a FontManager,
    scale: Scale,
    offset: Point,
}

impl DrawingRenderer<'_> {
    pub fn render_element(&mut self, element: &DrawingElement) -> Result<(), PdfError>;
    pub fn render_equipment(&mut self, props: &EquipmentProps) -> Result<(), PdfError>;
    pub fn render_cable(&mut self, props: &CableProps) -> Result<(), PdfError>;
    pub fn render_text(&mut self, props: &TextProps) -> Result<(), PdfError>;
    pub fn render_dimension(&mut self, props: &DimensionProps) -> Result<(), PdfError>;
    pub fn render_symbol(&mut self, props: &SymbolProps) -> Result<(), PdfError>;
}
```

### Font Manager

```rust
pub struct FontManager {
    system_fonts: Vec<FontInfo>,
    embedded_fonts: HashMap<String, IndirectFontRef>,
}

impl FontManager {
    pub fn discover_system_fonts() -> Vec<FontInfo>;
    pub fn embed_font(&mut self, doc: &PdfDocumentReference, name: &str)
        -> Result<IndirectFontRef, PdfError>;
    pub fn get_embedded(&self, name: &str) -> Option<&IndirectFontRef>;
}
```

### Tauri Commands

```rust
#[tauri::command]
pub async fn export_pdf(
    project: Project,
    drawings: Vec<Drawing>,
    config: PdfExportConfig,
    output_path: String,
) -> Result<PdfExportResult, String>;

#[tauri::command]
pub fn list_system_fonts() -> Vec<FontInfo>;

#[tauri::command]
pub fn get_default_export_path(project_name: &str) -> String;
```

---

## Frontend Integration

### Export Service

```typescript
class ExportService {
  async exportPdf(
    project: Project,
    drawings: Drawing[],
    config: ExportConfig
  ): Promise<PdfExportResult>;

  async listSystemFonts(): Promise<FontInfo[]>;

  async getDefaultExportPath(projectName: string): Promise<string>;

  async uploadToCloud(filePath: string, projectId: string): Promise<string>;
}
```

### React Hooks

```typescript
export function useSystemFonts(): UseQueryResult<FontInfo[]>;
export function useDefaultExportPath(projectName: string): UseQueryResult<string>;
export function useExportPdf(): UseMutationResult<PdfExportResult, Error, ExportParams>;
export function useExportSettings(): UseQueryResult<OrgExportSettings>;
```

### Components

| Component | Description |
|-----------|-------------|
| ExportModal | Main export wizard |
| ExportModeSelector | Single/Batch/Package toggle |
| ContentSelector | Checkboxes + reorder |
| PageSetupPanel | Size, orientation, margins, scale |
| TitleBlockPanel | Template, size, position |
| FontSelector | System font dropdown |
| OutputPanel | Directory, filename, cloud |
| ExportProgress | Progress bar |
| ExportComplete | Success dialog |

### Zustand Store

```typescript
interface ExportState {
  defaultConfig: Partial<ExportConfig>;
  isExporting: boolean;
  progress: number;
  currentPage: string;

  setDefaultConfig: (config: Partial<ExportConfig>) => void;
  startExport: () => void;
  updateProgress: (progress: number, currentPage: string) => void;
  completeExport: () => void;
}
```

---

## File Structure

### New Files

```
src-tauri/
├── Cargo.toml                      # Add dependencies
└── src/
    └── export/
        ├── mod.rs
        ├── pdf.rs                  # Keep existing
        ├── pdf_generator.rs
        ├── title_block.rs
        ├── drawing_renderer.rs
        ├── font_manager.rs
        ├── page_layout.rs
        └── templates/
            ├── mod.rs
            ├── standard.svg
            ├── minimal.svg
            ├── engineering.svg
            └── client.svg

src/
├── features/
│   └── export/
│       ├── export-service.ts
│       ├── use-export.ts
│       ├── components/
│       │   ├── ExportModal.tsx
│       │   ├── ExportModeSelector.tsx
│       │   ├── ContentSelector.tsx
│       │   ├── PageSetupPanel.tsx
│       │   ├── TitleBlockPanel.tsx
│       │   ├── FontSelector.tsx
│       │   ├── OutputPanel.tsx
│       │   ├── ExportProgress.tsx
│       │   ├── ExportComplete.tsx
│       │   └── index.ts
│       ├── types.ts
│       └── index.ts
├── stores/
│   └── export-store.ts
└── styles/
    └── features/
        └── export.css
```

---

## Testing Strategy

### Rust Tests

- PDF generation with various configurations
- Title block token replacement
- Element rendering accuracy
- Font embedding
- Multi-page generation
- File output

### Frontend Tests

- Export modal interactions
- Configuration persistence
- Progress updates
- Error handling
- Cloud upload

### E2E Tests

- Full export workflow
- Package with all content types
- Batch export multiple drawings
- Font selection and preview
