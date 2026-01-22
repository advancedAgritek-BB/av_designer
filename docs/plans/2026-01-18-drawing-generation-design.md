# Drawing Generation System Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

The Drawing Generation System transforms room designs into complete documentation packages. All drawings are auto-generated from room data and connections, fully editable after generation, with changes syncing back to source data.

**Core Principles:**
- Single source of truth for connections (port-level detail)
- Auto-suggest connections from learned client patterns
- All drawings editable; changes sync bidirectionally
- Per-client templates learned from ingested historical designs

---

## Drawing Types

| Drawing Type | Content | Generation Source |
|--------------|---------|-------------------|
| **Electrical Line Diagram** | Block diagram arranged as overhead room view; equipment by physical location; racks as summary blocks | Connections + room layout |
| **Floor Plan** | Equipment on architectural underlay (if imported) or auto-generated room outline | Room data + architectural import |
| **Reflected Ceiling Plan (RCP)** | Ceiling-mounted equipment on architectural underlay or room outline | Room data + architectural import |
| **Rack Elevation** | Detailed front view of each rack with U positions and equipment | Rack equipment + learned patterns |
| **Cable Schedule** | Tabular list with client-configurable columns | Connections data |
| **Room Elevation** | Wall views; generated only for walls with significant equipment (smart detection) | Room data + equipment placement |
| **Coverage Analysis** | Camera FOV, mic pickup, speaker coverage zones overlaid on floor plan | Equipment specs + placement |

---

## Connection System

### Data Model

```typescript
interface Connection {
  id: string;
  fromEquipmentId: string;
  fromPort: string;              // e.g., "HDMI Out 1"
  toEquipmentId: string;
  toPort: string;                // e.g., "HDMI In 2"
  signalType: 'video' | 'audio' | 'control' | 'network' | 'power';
  cableType: string;             // e.g., "HDMI 2.1", "Cat6", "XLR"
  cableId: string;               // for cable schedule labeling
  length: number;                // calculated or manual override
  pathway: string;               // conduit, tray, etc.
  properties: Record<string, unknown>;  // client-specific fields
}
```

### Three Editing Views

All views edit the same connection data (single source of truth):

| View | Best For | UI Approach |
|------|----------|-------------|
| **Dedicated Connection Editor** | Complex signal flow design, initial system architecture | Node-graph interface; drag ports to connect |
| **Room Builder Panel** | Quick edits while placing equipment | Side panel shows selected equipment's connections |
| **Electrical Diagram** | Visual verification, presentation adjustments | Click connection lines to edit; drag to reroute |

### Auto-Suggest Behavior

1. When equipment is placed, system proposes connections based on:
   - Equipment category (camera → codec → display)
   - Client-specific learned patterns (if template selected)
   - Standards rules (platform requirements, ecosystem compatibility)
2. Suggestions appear as dashed lines
3. User confirms or dismisses each suggestion
4. Confirmed connections become solid and generate into drawings

---

## Connection Interaction Design

### Electrical Diagram Cable Editing

Cable ends are draggable with magnet-snap behavior:

```
┌─────────────────────────────────────────────────────────────┐
│  Click cable end → Drag → Magnet snaps to equipment block   │
│                                                             │
│   ┌──────────┐                         ┌──────────┐        │
│   │  Camera  │─────────○ drag ○───────▶│ Display  │        │
│   │          │         ↑               │          │        │
│   └──────────┘    cable end            └──────────┘        │
│                   (draggable)           (magnet zone)       │
└─────────────────────────────────────────────────────────────┘
```

### Port Selection Popup

When cable end snaps to equipment with multiple valid ports:

```
┌──────────────────────┐
│ Select Input         │
├──────────────────────┤
│ ○ HDMI In 1          │
│ ○ HDMI In 2          │
│ ○ HDMI In 3 (in use) │  ← grayed out
└──────────────────────┘
```

### Interaction Rules

- Cable ends show grab handle on hover
- Drag cable end; equipment blocks highlight when in magnet range
- Release near block → snaps to block edge
- Single available port → auto-connects immediately
- Multiple available ports → popup menu appears
- In-use ports shown but disabled (grayed out)
- Incompatible ports hidden (can't connect HDMI to XLR)
- Escape or click away cancels; cable returns to original position

### Visual Feedback

- **Dragging:** Cable follows cursor as bezier curve
- **Valid target:** Equipment block glows green
- **Invalid target:** Equipment block shows red outline
- **Connected:** Solid line with signal-type color coding

---

## Equipment Symbols & Assets

### Equipment Data Model Extension

```typescript
interface Equipment {
  // ... existing fields ...

  symbols: {
    svg: string;               // URL/path for canvas display
    dxf: string;               // URL/path for CAD export
    pdfVector: string;         // URL/path for print export
  };

  ports: Port[];

  physicalProfile: {
    rackUnits: number;         // For rack-mounted equipment (0 if not rack-mountable)
    mountType: 'floor' | 'wall' | 'ceiling' | 'rack' | 'table';
    symbol2D: {
      width: number;
      height: number;
      anchor: 'center' | 'corner';
    };
  };
}

interface Port {
  id: string;
  name: string;                // "HDMI Out 1"
  direction: 'input' | 'output' | 'bidirectional';
  signalType: 'video' | 'audio' | 'control' | 'network' | 'power';
  connector: string;           // "HDMI", "XLR-M", "RJ45", etc.
  position: { x: number; y: number };  // Position on symbol for routing
}
```

### Symbol Usage Per Drawing Type

| Drawing | Symbol Used | Detail Level |
|---------|-------------|--------------|
| Electrical Line Diagram | Simplified block with label | Equipment name, model, port indicators |
| Floor Plan / RCP | Top-down 2D footprint | Scaled to room dimensions |
| Rack Elevation | Front-panel view | Full detail with port positions |
| Room Elevation | Side/front profile | Mounted appearance on wall |

### Symbol Formats

| Format | Purpose |
|--------|---------|
| **SVG** | Canvas display, web rendering |
| **DXF** | CAD export for construction teams |
| **PDF Vector** | High-quality print export |

**Fallback:** If equipment lacks custom symbol, system generates a labeled rectangle from category and dimensions.

---

## Pattern Learning System

### Purpose

Analyze multiple ingested designs per client to automatically discover:
- **Standards:** Consistent patterns across all designs (locked defaults)
- **Options:** Valid variations between designs (dropdown choices)

### Learning Process

```
Multiple Designs → Pattern Analysis → Standards + Options
     ↓                    ↓                    ↓
  "Project A"      Find commonalities    "Always use Biamp DSP"
  "Project B"      Identify variations   "Huddle: TesiraFORTE"
  "Project C"                            "Boardroom: TesiraFORTE AVB"
```

### Ingestion Sources

| Format | Extraction Method |
|--------|-------------------|
| AutoCAD DWG/DXF | Parse blocks, layers, attributes; map to equipment library |
| Visio VSD/VSDX | Extract shapes, connectors, text; identify equipment and signal flow |
| PDF drawings | OCR + vector extraction; AI-assisted equipment identification |
| Spreadsheets (BOM/cable schedules) | Direct column mapping to equipment and connection data |
| Structured JSON/XML | Direct import if client has existing data exports |

### What Gets Discovered

| Category | Standards (Core Similarities) | Options (Valid Variations) |
|----------|------------------------------|---------------------------|
| **Signal Flow** | "All mics → DSP → amps" | "Dante vs analog between DSP and amps" |
| **Equipment** | "Always Crestron control" | "CP4 for small rooms, PRO4 for large" |
| **Rack Layout** | "1U spacing between categories" | "Top-down or bottom-up stacking" |
| **Cable Types** | "Belden for all audio" | "Plenum vs riser per room location" |
| **Labeling** | "ROOM-CAT-NUM format" | "Abbreviated vs full category names" |
| **Rack Style** | N/A | "RoomReady kits for huddle, traditional for boardroom" |

### Confidence Scoring

| Confidence | Classification | Behavior |
|------------|----------------|----------|
| 90%+ of designs | **Standard** | Locked default; override requires justification |
| 50-90% | **Preferred Option** | Suggested first in dropdown |
| 20-50% | **Available Option** | Shown in dropdown list |
| Below 20% | **Exception** | Flagged for review; may be one-off |

### Designer Experience

When creating a new room for a known client:
1. System shows standards as pre-selected defaults
2. Options appear as dropdown choices where variation exists
3. Warnings appear if designer deviates from discovered standards
4. Designer can override with justification (logged for future pattern analysis)

---

## Drawing Generation Logic

### Electrical Line Diagram

1. Query all connections for the room
2. Group equipment by physical location (which wall/area of room)
3. Lay out equipment blocks in overhead spatial arrangement
4. Draw connection lines between ports, grouped by signal type
5. Racks rendered as summary blocks (link to detailed rack drawing)
6. Apply client labeling conventions from template

### Floor Plan & RCP

1. Load architectural underlay if imported; else generate room outline from dimensions
2. Place equipment symbols at their X/Y coordinates, scaled to room
3. Floor Plan: floor-standing and wall-mounted equipment
4. RCP: ceiling-mounted equipment (cameras, speakers, mics)
5. Add equipment labels per client convention

### Rack Elevation

1. Identify all rack-mounted equipment in room
2. Apply learned rack layout pattern (stacking order, spacing)
3. If multiple racks: assign equipment based on signal proximity and learned patterns
4. Render front-panel view with U positions
5. Show port labels, power connections, cable exit points

### Cable Schedule

1. Export all connections as table rows
2. Apply client-configured columns (show/hide fields, column order)
3. Auto-calculate cable lengths from equipment positions + pathway routing
4. Apply client labeling convention for cable IDs
5. Sort by signal type, source equipment, or custom preference

### Room Elevation

1. Detect walls with mounted equipment (displays, cameras, speakers, panels)
2. Generate elevation view only for qualifying walls (smart detection)
3. Show equipment at correct height and position
4. Include mounting details, clearances, cable drop locations

### Coverage Analysis

1. Query equipment with coverage specs (cameras, mics, speakers)
2. Overlay FOV cones, pickup patterns, SPL coverage on floor plan
3. Highlight gaps or overlaps
4. Color-code by coverage quality (full, partial, gap)

---

## Architectural Import

### Supported Formats

| Format | Handling |
|--------|----------|
| **DWG/DXF** | Parse layers; extract walls, doors, furniture; scale from drawing units |
| **PDF (vector)** | Extract vector geometry; identify room boundaries |
| **PDF (scanned)** | AI-assisted boundary detection; manual trace assist |
| **Image (PNG/JPG)** | Scale calibration tool; use as raster underlay |

### Import Workflow

1. User uploads architectural file
2. System detects scale (from title block or user calibration)
3. User confirms room boundary and orientation
4. System extracts (or user traces): walls, doors, windows, columns
5. Architectural layer locked as underlay
6. AV equipment placed on layer above

### Layer Management

```
Drawing Layers (bottom to top):
├── Architectural (imported, locked)
│   ├── Walls
│   ├── Doors/Windows
│   └── Furniture (optional)
├── AV Equipment
├── Connections/Cabling
├── Annotations
└── Title Block
```

### No Architectural Available

- System generates room outline from manual dimensions
- User can add walls, doors, obstacles manually
- Simple drawing tools: rectangles, lines, standard door/window symbols

### Multi-Room Projects

- Import full floor plan; define room boundaries within it
- Each room shares the architectural underlay
- Equipment placed per-room
- Drawings generated per-room or combined

---

## Export & Integration

### Export Formats

| Format | Use Case | Implementation |
|--------|----------|----------------|
| **PDF** | Client review, submittals, printing | Rust printpdf; title blocks; multi-page packages |
| **DWG/DXF** | Construction teams, CAD integration | Rust DXF writer; preserves layers and blocks |
| **Structured JSON** | Re-import, API integrations, backups | Full drawing data with connections and metadata |

### Export Modes

| Mode | Output | Use Case |
|------|--------|----------|
| **Single Drawing** | One file | Quick export for review |
| **Drawing Package** | Multi-page PDF or ZIP | Full project documentation |
| **Selective Export** | User picks drawings | Custom submittal packages |

### Cloud Integrations

| Platform | Integration |
|----------|-------------|
| **Procore** | Direct upload to project documents; link drawings to locations |
| **PlanGrid** | Push drawings to sheet sets; sync revisions |
| **SharePoint/OneDrive** | Save to client's document library |
| **Box/Dropbox** | Generic cloud storage export |

### Revision Tracking

- Each export creates a revision record
- Revision ID stamped on title block
- Previous versions accessible for comparison
- Change log shows modifications between revisions

### Title Block System

- Client-configurable title block templates
- Auto-populated: project name, drawing title, revision, date, scale
- Client template fields: company logo, approval signatures, custom fields

---

## Data Architecture

### Data Model Relationships

```
Project
├── Client (links to learned templates)
├── Architectural Import (optional)
└── Rooms[]
    ├── Dimensions & Properties
    ├── Placed Equipment[]
    │   └── Equipment (from library, includes symbols & ports)
    ├── Connections[] (port-level, single source of truth)
    └── Generated Drawings[]
        ├── Electrical Line Diagram
        ├── Floor Plan
        ├── RCP
        ├── Rack Elevations[]
        ├── Room Elevations[]
        ├── Cable Schedule
        └── Coverage Analysis
```

### UI Navigation

| Location | Drawing Actions |
|----------|-----------------|
| **Room Builder** | Side panel shows connections for selected equipment; quick edit |
| **Connection Editor** | Full node-graph interface; design complete signal flow |
| **Drawings Tab** | List of all generated drawings; click to view/edit; regenerate button |
| **Drawing Canvas** | View/edit individual drawing; layer controls; export actions |

### Generation Triggers

| Trigger | Behavior |
|---------|----------|
| **Manual** | User clicks "Generate Drawings" after design complete |
| **Auto-refresh** | Drawings marked stale when room/connections change; regenerate on view |
| **Batch** | Generate all drawings for project export |

### Edit → Sync Flow

1. User edits connection on Electrical Diagram (drag cable end)
2. Change writes back to Connections data (single source of truth)
3. Other views (Room Builder, Connection Editor) reflect change immediately
4. Dependent drawings (Cable Schedule) marked for regeneration

---

## Implementation Phases

### Phase 1: Connection System Foundation
- Implement Connection data model with port-level detail
- Build Dedicated Connection Editor (node-graph UI)
- Add connection panel to Room Builder
- Auto-suggest connections from equipment categories

### Phase 2: Electrical Line Diagram
- Implement spatial layout algorithm (overhead room view)
- Add drag-to-connect interaction with port selection popup
- Bidirectional sync between diagram edits and connection data
- Signal-type color coding and labeling

### Phase 3: Floor Plan, RCP, Room Elevation
- Architectural import (DWG/DXF, PDF, image)
- Equipment symbol placement at scale
- Smart wall detection for room elevations
- Layer management UI

### Phase 4: Rack Elevation & Cable Schedule
- Rack assignment and layout algorithms
- Client-configurable cable schedule columns
- Auto-calculate cable lengths from routing

### Phase 5: Coverage Analysis
- Camera FOV visualization
- Microphone pickup pattern overlay
- Speaker SPL coverage mapping
- Gap/overlap detection

### Phase 6: Pattern Learning
- Design ingestion from multiple formats
- Pattern extraction and confidence scoring
- Standards vs options discovery
- Client template generation

### Phase 7: Export & Integration
- PDF generation with title blocks (complete printpdf implementation)
- DXF export with layers and blocks
- Cloud platform integrations (Procore, PlanGrid)
- Revision tracking system

---

## Open Questions

1. **Symbol Library Seeding:** How to bootstrap equipment symbols before users upload custom ones?
2. **Pattern Learning ML:** Rule-based extraction vs ML model for pattern discovery?
3. **Offline Support:** Should pattern learning work offline or require cloud processing?
4. **Multi-User Editing:** Real-time collaboration on drawings or lock-based editing?
