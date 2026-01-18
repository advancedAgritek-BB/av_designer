# AV Designer - Product Requirements Document

**Version:** 1.1
**Date:** 2026-01-17
**Authors:** Brandon Burnette & Partner
**Status:** Draft

---

## Executive Summary

AV Designer is an internal desktop application for streamlining AV engineering subcontract work. Built by CTS-D/CTS-I certified professionals with 25 years of combined industry experience, it enables rapid room design, standards-based validation, automated quoting, and complete drawing package generation.

### Core Value Proposition

- Encode decades of AV design expertise into reusable, hierarchical standards
- Automate the design-to-documentation workflow
- Validate designs against multi-dimensional rule sets
- Generate complete drawing packages without manual CAD work
- Produce accurate quotes with flexible, template-driven pricing

---

## Table of Contents

1. [Users & Access Model](#1-users--access-model)
2. [Core Workflow](#2-core-workflow)
3. [Standards Engine](#3-standards-engine)
4. [Room Builder](#4-room-builder)
5. [Equipment Database](#5-equipment-database)
6. [Cabling Standards & Calculation](#6-cabling-standards--calculation)
7. [Drawing Generation](#7-drawing-generation)
8. [Quoting & BOM System](#8-quoting--bom-system)
9. [3D Visualization & Analysis](#9-3d-visualization--analysis)
10. [Client Portal](#10-client-portal)
11. [Technical Architecture](#11-technical-architecture)
12. [MVP Scope](#12-mvp-scope)

---

## 1. Users & Access Model

### Primary Users

Internal tool for AV engineering subcontracting business, with eventual client-facing portal.

### User Roles

| Role | Access Level |
|------|--------------|
| **Admin** | Full system access, manage standards, users, equipment library |
| **Designer** | Create/edit projects, run validations, generate outputs |
| **Viewer** | Read-only access to projects and documents |
| **Client Admin** | Portal: manage their users, view all projects, approve quotes |
| **Client Reviewer** | Portal: view assigned projects, add comments, request changes |
| **Client Viewer** | Portal: read-only access to approved documents |

---

## 2. Core Workflow

```
Architectural Input → Room Configuration → Design Validation → Review & Resolve → Quote Generation → Drawing Output
```

### Workflow Steps

1. **Import** - Load architectural drawings (CAD, PDF, or scans) as the base layer
2. **Configure** - Build the AV system using templates or custom placement, specifying equipment from the library
3. **Validate** - System checks design against applicable standards hierarchy, flags issues, and suggests optimizations
4. **Review & Resolve** - Capture internal review notes and client feedback, track issues to resolution, and maintain revision history
5. **Quote** - Generate BOM with rules-based pricing, adjust as needed using templates
6. **Document** - Export complete drawing packages (electrical, elevations, RCPs) as PDF for review or CAD for construction

---

## 3. Standards Engine

The standards engine is a multi-dimensional, layered rule system that encodes AV design expertise into reusable, combinable standards.

### 3.1 Standards Hierarchy

```
Your Standards (Global Defaults)
└── Client A
    ├── Client A - Corporate Offices
    └── Client A - Manufacturing Facilities
└── Client B
    ├── Client B - East Region
    └── Client B - West Region
```

**Inheritance Model:** Most specific wins. A rule defined at "Client A - Corporate Offices" overrides the same rule at "Client A" level, which overrides global defaults.

### 3.2 Rule Dimensions

Rules are organized across six independent dimensions that layer together:

| Dimension | Examples | Purpose |
|-----------|----------|---------|
| **Room Type** | Huddle, conference, training, boardroom, auditorium | Physical space characteristics |
| **Platform** | Teams, Zoom, Cisco Webex, Google Meet, multi-platform | Certification and integration requirements |
| **Hardware Ecosystem** | Poly, Logitech, Cisco, Crestron, Biamp, QSC | Vendor-specific standards and compatibility |
| **Quality Tier** | Budget, standard, premium, executive | Price/performance expectations |
| **Use Case** | Video conferencing, presentation, hybrid events, lecture capture | Functional requirements |
| **Client-Specific** | Acme Corp → Acme Corporate → Acme NYC HQ | Organizational overrides |

### 3.3 Layer Combination Example

```
Room: Conference (12 person)
Platform: Microsoft Teams
Ecosystem: Poly
Tier: Premium
Use Case: Video Conferencing
Client: Acme Corp → Corporate Offices
```

### 3.4 Conflict Resolution

1. System applies fixed priority order: Client > Platform > Ecosystem > Tier > Use Case > Room Type
2. Conflicts are flagged with warnings to the designer
3. Designer can accept default priority or manually intervene
4. Final quote remains manually editable as safety net

### 3.5 What Rules Control

| Aspect | Example Rules |
|--------|---------------|
| **Equipment Selection** | "Teams Rooms require certified devices from Microsoft's certified list" |
| **Quantities** | "Ceiling speakers = room_sqft / 80, rounded up, minimum 2" |
| **Placement** | "Displays mounted with center point at 54" AFF for seated viewing" |
| **Configuration** | "DSP mic automixer hold time = 1.5 seconds for conference rooms" |
| **Cabling** | "Use plenum-rated cables above drop ceiling; shielded Cat6A for AV-over-IP" |
| **Commercial** | "Poly ecosystem gets 35% margin; Logitech gets 30%" |

### 3.6 Rule Expression Types

| Type | Syntax Example | Use Case |
|------|----------------|----------|
| **Simple Constraint** | `display.size >= 75` | Basic requirements |
| **Formula** | `mic_zones = ceil(room.sqft / 200)` | Calculated quantities |
| **Conditional** | `if room.windows then display.brightness >= 500` | Context-dependent rules |
| **Range Match** | `room.sqft: 0-200 → "huddle_package_a"` | Lookup tables |
| **Pattern** | `if ecosystem == "Poly" and platform == "Teams" then require "Poly Studio X"` | Multi-dimension combinations |

### 3.7 Rule Creation Interface

**Visual Builder (simple rules):**
- Select dimension, condition type, values from dropdowns
- Preview affected equipment/quantities in real-time
- Good for: constraints, simple formulas, range matches

**Code Editor (complex rules):**
- YAML-based DSL for multi-condition logic
- Syntax highlighting, validation, autocomplete
- Good for: complex conditionals, multi-step calculations

**AI Assistant:**
- Describe rules in plain English: "Rooms over 600 sq ft with video conferencing need PTZ cameras instead of fixed USB cameras"
- System generates rule logic, shows preview, user approves or edits

### 3.8 Rule Versioning & Impact Analysis

- Standards sets are versioned; projects pin to a specific version
- Impact report shows rooms/projects affected by rule changes before publish
- Bulk upgrade with preview diff, per-project opt-in, and rollback
- Deprecation workflow for rules tied to EOL equipment

### 3.9 Rule Test Harness

- Save test cases (room profiles + expected outputs) per standards set
- Run tests on publish; block release on failures
- Required validation step for AI-generated rules before approval

---

## 4. Room Builder

The room builder is where designs come together—importing architectural backgrounds, placing equipment, and letting the standards engine validate and optimize.

### 4.1 Input Methods

| Method | Format | Process |
|--------|--------|---------|
| **CAD Import** | DWG, DXF | Parse layers, extract room boundaries, identify architectural elements |
| **PDF Import** | Vector/Raster PDF | Convert to workable canvas, set scale from known dimension |
| **Image/Scan** | PNG, JPG, TIFF | Trace room boundaries, manual scale calibration |
| **Manual Entry** | Dimensions form | Enter length, width, ceiling height, create room from scratch |

### 4.2 Room Configuration Workflow

```
1. Import/Create → 2. Set Properties → 3. Apply Template or Custom Build → 4. Validate → 5. Refine
```

**Step 1: Import or Create**
- Load architectural drawing or enter dimensions manually
- System detects room boundaries where possible

**Step 2: Set Room Properties**
- Room type, seating count, ceiling height
- Select platform, ecosystem, quality tier, use case
- Assign to client/folder for standards inheritance

**Step 3: Apply Standards**
- **Template mode:** Select a predefined package, system auto-populates equipment
- **Custom mode:** Start blank, add equipment manually
- **Hybrid:** Apply template, then modify

**Step 4: Validate**
- Standards engine checks design against all applicable rules
- Returns errors, warnings, suggestions with conflict highlighting

**Step 5: Refine**
- Address issues, accept/reject suggestions
- Manually adjust placement, swap equipment, override as needed

### 4.3 System Graph & Signal Flow

- Dedicated graph view for devices, ports, and signal types (audio, video, control, network)
- Auto-connect suggestions based on standards; manual overrides with validation
- Port-level checks for availability, compatibility, and required adapters
- Drives line diagrams and cable schedules; highlights unconnected devices

---

## 5. Equipment Database

The equipment library is the foundation for design validation, quoting, and drawing generation.

### 5.1 Data Structure

Each equipment item contains attributes across six categories:

| Category | Attributes |
|----------|------------|
| **Identity** | Manufacturer, model, SKU, category, subcategory, description, product images |
| **Physical** | Dimensions (H×W×D), weight, mounting type, rack units, color options |
| **Electrical** | Voltage, wattage, amperage, PoE class, circuit requirements, BTU output |
| **Performance** | Coverage angle, SPL, frequency response, pickup pattern, resolution, throw ratio |
| **Commercial** | Cost (per source), MSRP, lead time, availability status, warranty, EOL date |
| **Compatibility** | Platform certifications (Teams, Zoom), ecosystem membership, required accessories |
| **Assets** | Spec sheets, CAD blocks, Revit families, product photos, wiring diagrams |

### 5.2 Data Sources

| Source | Integration Method | Update Frequency |
|--------|-------------------|------------------|
| **Manual Entry** | Form-based input | As needed |
| **Manufacturer APIs** | Direct integration where available | Daily/weekly sync |
| **Distributor Feeds** | ADI, Snap One, etc. price/availability | Daily sync |
| **Spec Sheet Import** | AI-assisted extraction from PDFs | On demand |
| **D-Tools/Other** | CSV/XML import from existing systems | One-time or periodic |

### 5.3 Library Organization

```
Equipment Library
├── Your Master Library (canonical specs)
├── Manufacturer Overrides (corrections to vendor data)
├── Client Libraries
│   └── Acme Corp (client-specific alternates, custom items)
└── Archived (discontinued, replaced products)
```

### 5.4 Lifecycle & Alternate Management

- Lifecycle status (Active, NRND, EOL, Obsolete) with replacement suggestions
- Lead-time risk flags and supply chain notes surfaced in designs and quotes
- Approved alternates per client, with auto-substitution rules and price deltas
- Standards automatically warn when referenced items are deprecated or unavailable

---

## 6. Cabling Standards & Calculation

### 6.1 Cable Rule Categories

| Category | Example Rules |
|----------|---------------|
| **Length Limits** | "HDMI max 25ft without extender; HDBaseT max 330ft; Cat6A max 328ft" |
| **Type Requirements** | "Plenum-rated above drop ceiling; shielded for AV-over-IP; fiber for runs > 300ft" |
| **Service Loops** | "6ft excess at rack; 3ft at wall plates; 10ft at floor boxes" |
| **Pathway Rules** | "12\" separation from power; 3ft max J-hook spacing; conduit required through fire walls" |
| **Labeling** | "Format: ROOM#-DEVICE-PORT; labels at both ends within 6\" of termination" |
| **Termination** | "RJ45 for Cat6A; LC connectors for fiber; pull boxes for runs > 150ft with bends" |

### 6.2 Length Calculation Engine

```
Equipment Placement → Identify Cable Runs → Calculate Pathway Routes → Add Service Loops → Validate Against Rules
```

**Pathway Awareness:**
- Define cable pathways on floor plan (conduit runs, cable trays, ladder rack, J-hook routes)
- System routes cables through nearest pathway, not straight-line
- Accounts for vertical runs (floor-to-ceiling, between floors)
- Adds service loop lengths per rule at each termination point

**Override Capability:**
- Auto-calculated lengths shown with pathway breakdown
- Designer can override with manual entry
- Overrides flagged if they violate length rules

### 6.3 Cable Schedule Output

| Cable ID | Type | Source | Destination | Calc Length | Actual | Status |
|----------|------|--------|-------------|-------------|--------|--------|
| C-101 | Cat6A-PL | DSP-01 Port 3 | MIC-Z1 | 47ft | 50ft | OK |
| C-102 | HDMI | RACK-FL1 | DISPLAY-01 | 32ft | - | WARN: Exceeds 25ft limit |

### 6.4 Power, PoE, and Network Budgeting

- Aggregate power draw by rack/room; calculate circuit counts and load balance
- Track PoE class requirements and switch port capacity by room
- Estimate AV-over-IP bandwidth; propose VLAN/QoS templates
- Output electrical load schedule and network requirements sheet

---

## 7. Drawing Generation

The drawing engine transforms room designs into complete documentation packages.

### 7.1 Drawing Types

| Drawing | Purpose | Contents |
|---------|---------|----------|
| **Electrical Line Diagram** | Signal flow and connections | Equipment blocks, cable types, connector labels, signal direction |
| **Room Elevation** | Wall-mounted equipment placement | Front/side views, mounting heights, equipment spacing, annotations |
| **Reflected Ceiling Plan (RCP)** | Ceiling-mounted equipment | Mic zones, speaker placement, projector location, cable pathways |
| **Equipment Rack Elevation** | Rack layout | Front/rear views, U positions, equipment labels, ventilation |
| **Floor Plan** | Room layout with AV overlay | Furniture, equipment locations, cable routes, floor boxes |
| **Cable Schedule** | Wiring documentation | Cable ID, type, source, destination, length, label format |

### 7.2 Generation Process

```
Room Design → Drawing Template Selection → Auto-Generate → Review/Annotate → Export
```

**Auto-Generation:**
- System reads room configuration and equipment placement
- Applies drawing templates with your title blocks and standards
- Generates appropriate views based on equipment present
- Calculates cable lengths from placement data

**Annotation Layer:**
- Overlay AV elements on imported architectural backgrounds
- Maintain separation between architectural (locked) and AV (editable) layers
- Add callouts, dimensions, notes, detail references

### 7.3 Output Formats

| Format | Use Case |
|--------|----------|
| **PDF** | Client review, submittals, printing |
| **DWG/DXF** | Final construction documents, handoff to architects |
| **PNG/SVG** | Proposals, web portals, presentations |

### 7.4 Drawing Standards

- Title block templates per client
- Layer naming conventions
- Symbol libraries (your standards + client-specific)
- Dimension and annotation styles
- Revision tracking and history

### 7.5 Network & Rack Wiring Diagrams

- Network topology diagrams for AV-over-IP and control networks
- Port maps for switches, codecs, and DSPs with VLAN and QoS notes
- Rack wiring diagrams with patch panel labeling and power distribution
- Exported as part of the standard drawing package

---

## 8. Quoting & BOM System

### 8.1 BOM Structure

```
Project Quote
├── Equipment
│   ├── Video (displays, cameras, codecs)
│   ├── Audio (mics, speakers, DSP, amplifiers)
│   ├── Control (processors, touch panels, interfaces)
│   └── Infrastructure (racks, mounts, accessories)
├── Cabling
│   ├── Signal cables (HDMI, Cat6, fiber)
│   ├── Connectors & terminations
│   └── Pathway materials (conduit, J-hooks, velcro)
├── Labor
│   ├── Installation hours
│   ├── Programming hours
│   └── Project management
└── Services
    ├── Engineering & design
    ├── Training
    └── Warranty & support
```

### 8.2 Pricing Rules

| Rule Type | Example |
|-----------|---------|
| **Base Markup** | "Default equipment markup: 30% over cost" |
| **Category Markup** | "Cabling materials: 40%; Labor: $125/hr" |
| **Vendor Tiers** | "Crestron: 35%; Logitech: 28%; QSC: 32%" |
| **Client Pricing** | "Acme Corp: 25% discount on all equipment" |
| **Volume Breaks** | "Orders > $50K: additional 5% discount" |
| **Minimum Margins** | "Never price below 20% margin on any line item" |

### 8.3 Labor Estimation

| Task | Calculation |
|------|-------------|
| **Rack Build** | Base hours + (hours per RU × rack units) |
| **Device Install** | Hours per device type × quantity |
| **Cable Pulls** | Hours per run × cable count, adjusted for difficulty |
| **Programming** | Base hours + (hours per device × programmable device count) |
| **Commissioning** | Percentage of total install hours |

### 8.4 Template Architecture

```
Template Library
├── Master Templates (your defaults)
│   ├── Standard Proposal
│   ├── Change Order
│   ├── Service Agreement
│   └── Budget Estimate
├── Client Templates
│   └── Acme Corp
│       ├── Acme Proposal (based on Standard Proposal)
│       └── Acme Service (based on Service Agreement)
└── Project Overrides (one-off adjustments)
```

### 8.5 Template Components

| Component | Configurable Elements |
|-----------|----------------------|
| **Document Layout** | Logo, header/footer, page size, margins, fonts, colors |
| **Sections** | Which sections appear, order, naming, page breaks |
| **Line Item Display** | Columns shown, column order, description format, image inclusion |
| **Grouping** | Category structure, subtotal levels, how items are rolled up |
| **Pricing Display** | Show/hide unit cost, extended price, discounts, taxes |
| **Labor Presentation** | Itemized vs lump sum, rate visibility, task descriptions |
| **Terms & Conditions** | Payment terms, warranty, exclusions, validity period |
| **Calculations** | Tax rates, discount application, rounding rules |

### 8.6 Template Builder

**Visual Editor:**
- Drag-and-drop sections and columns
- Live preview with sample data
- Style controls for fonts, colors, spacing
- Conditional visibility (show section only if items present)

**Import Capability:**
- Upload existing Excel or Word quote templates
- AI-assisted mapping of your current format to system fields
- Review and adjust mappings before saving
- Preserves your existing branding and layout

### 8.7 Quote Output Formats

| Format | Audience | Detail Level |
|--------|----------|--------------|
| **Internal BOM** | Your team | Full cost breakdown, margins, vendor sources |
| **Client Proposal** | Customer | Sell prices, descriptions, no cost data |
| **Executive Summary** | Decision makers | Category totals, investment overview |
| **Detailed Spec** | Technical buyers | Full specs, model numbers, quantities |

### 8.8 Quote Versioning

- Full revision history for every quote
- Compare versions side-by-side
- Track who changed what and when
- Revert to previous versions
- Clone quotes as starting point for new projects

### 8.9 Procurement & Lead-Time Management

- Roll up lead times and availability risk by project and vendor
- Suggest approved alternates with price and spec deltas
- Export purchase orders and track procurement status by line item

---

## 9. 3D Visualization & Analysis

### 9.1 3D Room Rendering

| Feature | Description |
|---------|-------------|
| **Room Model** | Generate 3D room from dimensions, ceiling height, architectural import |
| **Equipment Placement** | Position devices with accurate 3D models from equipment library |
| **Furniture Layout** | Add tables, chairs, podiums for context and sightline analysis |
| **Material Surfaces** | Assign surface types (glass, drywall, acoustic tile) for audio modeling |
| **Camera Views** | Save preset viewpoints, walkthrough mode, client presentation views |

### 9.2 Coverage Analysis Tools

| Analysis Type | What It Shows |
|---------------|---------------|
| **Speaker SPL Distribution** | Sound pressure levels across room, identify hot/dead spots |
| **Microphone Pickup Zones** | Coverage areas per mic, overlap visualization, rejection zones |
| **Display Viewing Angles** | Acceptable viewing cone, distance limits, sightline obstructions |
| **Camera Coverage** | Field of view, participant visibility, PTZ preset reach |
| **Lighting Zones** | For rooms with lighting control, show coverage and levels |

### 9.3 Visualization Output

```
3D Model → Apply Analysis Overlay → Generate Heatmaps → Export Views
```

**Output Formats:**
- Interactive 3D (for internal review)
- Static renders (for proposals and documentation)
- Annotated analysis views (showing coverage issues)
- Client portal embeds (web-viewable 3D)

### 9.4 Integration with Validation

- Coverage gaps flagged as design warnings
- Suggestions generated: "Add speaker at position X to address dead spot"
- Before/after comparison when equipment moved

---

## 10. Client Portal

A secure, read-focused interface for clients to view projects, review designs, and approve quotes.

### 10.1 Portal Features

**Project Dashboard:**
- List of all projects for their organization
- Status indicators (design, review, approved, in progress, complete)
- Quick access to latest documents and quotes

**Design Review:**
- View room layouts and equipment placement (2D/3D)
- See coverage analysis visualizations
- Cannot edit, but can add comments and questions
- Side-by-side comparison of design revisions

**Quote Review:**
- View proposals in client-facing format (no cost data)
- Line-item visibility per template settings
- Digital approval workflow with signature capture
- Change request submission

**Document Access:**
- Download approved drawing packages
- Access equipment spec sheets and cut sheets
- View project timeline and milestones
- Historical project archive

### 10.2 Collaboration Features

| Feature | Description |
|---------|-------------|
| **Comments** | Clients add comments anchored to specific items or locations |
| **Notifications** | Email alerts when new documents posted or responses received |
| **Approval Workflow** | Multi-stage approval (technical review → budget review → final sign-off) |
| **Change Requests** | Structured form for requesting modifications with impact assessment |

### 10.3 Branding

- White-label with client's logo and colors
- Custom subdomain option (acme.yourportal.com)
- Branded email notifications

---

## 11. Technical Architecture

### 11.1 Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Application                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Frontend (React + TypeScript)              ││
│  │   UI Components • Room Builder • Drawing Canvas • 3D    ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Backend (Rust via Tauri)                 ││
│  │  File Processing • CAD Parsing • Drawing Generation     ││
│  │  Analysis Engines • Offline Cache • Local File I/O      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  PostgreSQL  │ │     Auth     │ │   File Storage       │ │
│  │  Database    │ │   (Users,    │ │   (Drawings, CAD,    │ │
│  │              │ │    Roles)    │ │    Attachments)      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌──────────────┐ ┌──────────────────────────────────────┐  │
│  │  Realtime    │ │         Edge Functions               │  │
│  │  (Sync)      │ │  (AI Processing, Integrations)       │  │
│  └──────────────┘ └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Client Portal                            │
│              (Web App - React + TypeScript)                  │
│         Hosted separately, connects to same Supabase         │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Component Responsibilities

| Component | Responsibilities |
|-----------|------------------|
| **React Frontend** | UI rendering, room builder canvas, 3D visualization, user interactions |
| **Rust Backend** | CAD file parsing, drawing generation, coverage calculations, heavy computation |
| **PostgreSQL** | Equipment library, standards rules, projects, quotes, user data |
| **Supabase Auth** | User management, role-based access, client portal authentication |
| **File Storage** | Architectural drawings, generated outputs, equipment assets, attachments |
| **Realtime** | Multi-user sync between partners, live updates |
| **Edge Functions** | AI rule generation, spec sheet parsing, external integrations |

### 11.3 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Tauri over Electron** | Smaller bundle, better performance for CAD/3D work, Rust for heavy processing |
| **Supabase over Firebase** | PostgreSQL handles complex relational data (standards hierarchy, equipment relationships) |
| **Rust for processing** | CAD parsing, drawing generation, and analysis need performance |
| **React for UI** | Rich ecosystem for complex interfaces, team's existing skill set |

### 11.4 Offline Capability

- Local cache of active projects and equipment library
- Work offline, sync when reconnected
- Conflict resolution for concurrent edits

### 11.5 Platform Support

- macOS (primary development platform)
- Windows (required from day one)
- Cross-platform via Tauri

### 11.6 Audit & Revision History

- Immutable audit log for standards, designs, and quotes
- Snapshot versions for rooms/projects with diff views
- Offline change queue with merge/conflict resolution

---

## 12. MVP Scope

### 12.1 MVP Philosophy

End-to-end but basic—simple versions of everything working together, then iterate on each component.

### 12.2 MVP Feature Set

| Component | MVP Scope |
|-----------|-----------|
| **Standards Engine** | Single-level hierarchy (your standards only), basic rule types, manual rule creation |
| **Room Builder** | Manual dimension entry, basic equipment placement, simple validation, basic connection graph |
| **Equipment Database** | Manual entry, core attributes only, no external integrations |
| **Cabling** | Basic length limits, manual cable entry, simple schedule output |
| **Drawing Generation** | Electrical line diagrams from connection graph, basic floor plan overlay, PDF export only |
| **Quoting** | Single template, basic markup rules, PDF export |
| **Review & Change Tracking** | Comment threads, issue status, room revision history |
| **3D Visualization** | Deferred to post-MVP |
| **Client Portal** | Deferred to post-MVP |

### 12.3 MVP Success Criteria

- Can design a complete conference room from scratch
- Can validate design against basic standards
- Can generate a quote with accurate BOM
- Can export electrical line diagram and floor plan from defined connections
- Can capture review comments and resolve issues within a room
- Can use for real client work

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **BOM** | Bill of Materials—itemized list of equipment for a project |
| **RCP** | Reflected Ceiling Plan—drawing showing ceiling-mounted equipment from above |
| **SPL** | Sound Pressure Level—measure of audio loudness in decibels |
| **DSP** | Digital Signal Processor—device that processes audio signals |
| **PTZ** | Pan-Tilt-Zoom—camera with motorized movement |
| **AFF** | Above Finished Floor—height measurement from floor surface |
| **HDBaseT** | Technology for transmitting video/audio over Cat cable |

---

## Appendix B: Open Questions

1. **CAD Library Format:** What format should equipment CAD blocks be stored in for drawing generation?
2. **AutoCAD MCP Integration:** Timeline and approach for future AutoCAD integration when MCP becomes available?
3. **Distributor API Access:** Which distributors offer API access for pricing/availability?
4. **AI Model Selection:** Which AI models for rule generation and spec sheet parsing?
5. **Licensing Model:** If this becomes a product, what licensing approach?
6. **Network Planning Scope:** Do we model VLANs/IPs and switch configs, or only port/bandwidth requirements?
7. **Standards Versioning Policy:** How often are standards published, and when should projects upgrade vs stay pinned?

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2026-01-17 | Brandon Burnette | Added review workflow, connection graph, lifecycle, and planning enhancements |
| 1.0 | 2026-01-17 | Brandon Burnette | Initial PRD |
