# AV Designer - UI Design Specification

**Version:** 1.1
**Date:** 2026-01-17
**Status:** Draft

**Visual Inspiration:** Revolut Business (dark theme, color palette, data presentation) + Programa (product library, quote cards, section grouping)

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Visual Style Guide](#2-visual-style-guide)
3. [Global Design System](#3-global-design-system)
4. [Room Design Mode](#4-room-design-mode)
5. [Drawing Generation Mode](#5-drawing-generation-mode)
6. [Quoting Mode](#6-quoting-mode)
7. [Equipment Library Mode](#7-equipment-library-mode)
8. [Standards Management Mode](#8-standards-management-mode)
9. [Project Dashboard Mode](#9-project-dashboard-mode)
10. [Command Palette](#10-command-palette)
11. [Settings & Preferences](#11-settings--preferences)
12. [Keyboard Shortcuts](#12-keyboard-shortcuts)

---

## 1. Design Principles

### Visual Foundation

| Aspect | Specification |
|--------|---------------|
| **Theme** | Dark-first with Revolut-inspired deep navy palette |
| **Density** | Hybrid: dense workspace for design modes, clean/spacious for admin areas |
| **Typography** | Inter or SF Pro for UI, monospace for data/code |
| **Color System** | Deep navy base, golden/amber accent, semantic status colors |
| **Borders/Edges** | Subtle 1px borders, soft shadows, layered depth |

### Interaction Patterns

| Pattern | Implementation |
|---------|----------------|
| **Layout** | Adaptive - changes based on current mode/task |
| **Navigation** | Sidebar with icon + text, golden highlight for active item |
| **Panels** | Collapsible with icon rail toggle (Photoshop-style) |
| **Canvas** | Direct manipulation primary, modifier keys for navigation |
| **Feedback** | Layered - status bar for critical, contextual for in-progress, notification center for history |
| **Keyboard** | Comprehensive shortcuts available, UI fully usable without them |
| **Windows** | Flexible - single window default, detachable panels, multi-monitor support |

---

## 2. Visual Style Guide

### Color Palette (Revolut-Inspired Dark Theme)

#### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0D1421` | Main application background |
| `--bg-secondary` | `#151D2E` | Cards, panels, elevated surfaces |
| `--bg-tertiary` | `#1C2639` | Hover states, input fields |
| `--bg-elevated` | `#232F46` | Modals, dropdowns, popovers |

#### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#FFFFFF` | Primary text, headings |
| `--text-secondary` | `#8B95A5` | Secondary text, labels |
| `--text-tertiary` | `#5C6573` | Placeholder text, disabled |
| `--text-muted` | `#3D4654` | Very subtle text |

#### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-gold` | `#C9A227` | Selected sidebar items, primary actions |
| `--accent-gold-hover` | `#E0B82E` | Hover state for gold accent |
| `--accent-blue` | `#3B82F6` | Links, interactive elements |
| `--accent-blue-light` | `#60A5FA` | Hover state for blue |

#### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--status-success` | `#22C55E` | Success, completed, valid |
| `--status-warning` | `#F59E0B` | Warnings, pending |
| `--status-error` | `#EF4444` | Errors, critical issues |
| `--status-info` | `#3B82F6` | Information, suggestions |

#### Status Pills (Programa-Inspired)

| Status | Background | Text |
|--------|------------|------|
| `Quoting` | `#FEF3C7` | `#92400E` |
| `Client Review` | `#DBEAFE` | `#1E40AF` |
| `Ordered` | `#D1FAE5` | `#065F46` |
| `In Progress` | `#E0E7FF` | `#3730A3` |
| `On Hold` | `#F3F4F6` | `#374151` |

### Typography

```
Font Family:
  UI: Inter, -apple-system, BlinkMacSystemFont, sans-serif
  Mono: JetBrains Mono, SF Mono, monospace

Font Sizes:
  --text-xs:    11px / 1.5
  --text-sm:    12px / 1.5
  --text-base:  14px / 1.5
  --text-lg:    16px / 1.5
  --text-xl:    18px / 1.4
  --text-2xl:   24px / 1.3
  --text-3xl:   30px / 1.2

Font Weights:
  --font-normal:   400
  --font-medium:   500
  --font-semibold: 600
  --font-bold:     700
```

### Spacing & Sizing

```
Spacing Scale:
  --space-1:  4px
  --space-2:  8px
  --space-3:  12px
  --space-4:  16px
  --space-5:  20px
  --space-6:  24px
  --space-8:  32px
  --space-10: 40px
  --space-12: 48px

Border Radius:
  --radius-sm:   4px
  --radius-md:   8px
  --radius-lg:   12px
  --radius-xl:   16px
  --radius-full: 9999px
```

### Component Patterns

#### Cards (Revolut-Style)

```
Background: var(--bg-secondary)
Border: 1px solid rgba(255, 255, 255, 0.06)
Border Radius: var(--radius-lg)
Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3)
Padding: var(--space-4) to var(--space-6)
```

#### Inputs (Dark Theme)

```
Background: var(--bg-tertiary)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border Radius: var(--radius-md)
Text: var(--text-primary)
Placeholder: var(--text-tertiary)
Focus Border: var(--accent-blue)
```

#### Buttons

```
Primary:
  Background: var(--accent-gold)
  Text: #0D1421
  Hover: var(--accent-gold-hover)

Secondary:
  Background: transparent
  Border: 1px solid rgba(255, 255, 255, 0.2)
  Text: var(--text-primary)
  Hover Background: var(--bg-tertiary)

Ghost:
  Background: transparent
  Text: var(--text-secondary)
  Hover Text: var(--text-primary)
```

#### Sidebar (Revolut-Style)

```
Background: var(--bg-secondary)
Width: 220px (expanded), 64px (collapsed)

Nav Item:
  Padding: 12px 16px
  Border Radius: var(--radius-md)
  Icon: 20px, var(--text-secondary)
  Text: var(--text-secondary)

Nav Item (Active):
  Background: rgba(201, 162, 39, 0.15)
  Icon: var(--accent-gold)
  Text: var(--accent-gold)

Nav Item (Hover):
  Background: var(--bg-tertiary)
```

### Iconography

- Style: Outlined, 1.5px stroke
- Size: 20px for navigation, 16px for inline
- Library: Lucide Icons or Heroicons
- Active color: `var(--accent-gold)`
- Default color: `var(--text-secondary)`

---

## 3. Global Design System

### Application Shell (Revolut-Inspired)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌────────────────────┐  ┌─────────────────────────────────────────┐   │
│  │                    │  │                                         │   │
│  │  [R] AV Designer   │  │  Home                     🔍  ⚙  [MP]  │   │
│  │                    │  │                                         │   │
│  │  ┌──────────────┐  │  ├─────────────────────────────────────────┤   │
│  │  │ 🏠 Home      │◀─│  │                                         │   │
│  │  └──────────────┘  │  │                                         │   │
│  │                    │  │                                         │   │
│  │  📁 Projects       │  │                                         │   │
│  │                    │  │                                         │   │
│  │  📐 Room Design    │  │        MAIN WORKSPACE AREA              │   │
│  │                    │  │                                         │   │
│  │  📋 Drawings       │  │        (adapts per mode)                │   │
│  │                    │  │                                         │   │
│  │  💰 Quoting        │  │                                         │   │
│  │                    │  │                                         │   │
│  │  📊 Standards      │  │                                         │   │
│  │                    │  │                                         │   │
│  │  ─────────────     │  │                                         │   │
│  │  LIBRARIES         │  │                                         │   │
│  │                    │  │                                         │   │
│  │  📦 Equipment      │  │                                         │   │
│  │                    │  │                                         │   │
│  │  📚 Templates      │  │                                         │   │
│  │                    │  │                                         │   │
│  │                    │  │                                         │   │
│  │  ─────────────     │  │                                         │   │
│  │                    │  │                                         │   │
│  │  ❓ Need Help?     │  │                                         │   │
│  │                    │  └─────────────────────────────────────────┘   │
│  │                    │                                                 │
│  └────────────────────┘                                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Sidebar Navigation (Revolut-Style)

Dark sidebar with golden accent for active state:

| Section | Items |
|---------|-------|
| **Main** | Home, Projects, Room Design, Drawings, Quoting, Standards |
| **Libraries** | Equipment, Templates |
| **Support** | Need Help? |

**Visual States:**

```
Default:     Icon (--text-secondary) + Text (--text-secondary)
Hover:       Background (--bg-tertiary)
Active:      Background (rgba(201,162,39,0.15)) + Icon/Text (--accent-gold)
```

### Header Bar (Per-Mode Context)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Home                                           🔍   ⚙   [MP] Acme Inc │
└─────────────────────────────────────────────────────────────────────────┘
     ↑                                             ↑    ↑        ↑
  Mode Title                                   Search Settings  Org/User
```

When in a project context:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Projects  /  Acme HQ  /  Conference Room 201        🔍  ⚙  [MP] ▼    │
└─────────────────────────────────────────────────────────────────────────┘
     ↑              ↑              ↑
  Breadcrumb navigation (clickable)
```

### Status Bar (Subtle, Bottom)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ● Synced  │  2 warnings  │                              Cmd+K to search│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Room Design Mode

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Room Design ▼    Acme HQ > Conf Room 201        [Validate] 🔔 │
├────┬──────────────────────────────────────────────────────────────┬─────┤
│    │                                                              │ ≡ P │ ← Panel
│ 📁 │                                                              │ ≡ L │   Toggle
│ 🏠 │                                                              │ ≡ V │   Rail
│ 📐 │                 DESIGN CANVAS                                │ ≡ R │
│ 💰 │                                                              │ ≡ M │
│ 📋 │          [Architectural BG + AV Overlay]                     │     │
│ 📦 │                                                              │     │
│ ⚙️ │                                                              │     │
│    │                                                              │     │
│    ├──────────────────────────────────────────────────────────────┤     │
│    │  Equipment Palette (collapsible drawer)                      │     │
├────┴──────────────────────────────────────────────────────────────┴─────┤
│  Snap: Grid ✓ Guides ✓  │  Zoom: 100%  │  2 errors, 3 warnings         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Panel System

Right-side icon rail toggles collapsible panels:

| Icon | Panel | Contents |
|------|-------|----------|
| **P** | Properties | Selected equipment settings, position, rotation, connections |
| **L** | Layers | Architectural (locked), AV Equipment, Annotations, Cable Routes |
| **V** | Validation | Errors (expandable), Warnings, Suggestions with "Apply" actions |
| **R** | Room | Dimensions, type, platform, ecosystem, tier, client assignment |
| **M** | Minimap | Zoomed-out overview, click to navigate, viewport indicator |

**Panel Behavior:**
- Click icon to expand panel (pushes canvas or overlays based on preference)
- Click again or click elsewhere to collapse
- Multiple panels can be open, stack vertically
- Drag to reorder panel icons
- Double-click to pin panel open

### Equipment Palette

Collapsible drawer at bottom of canvas:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search equipment...    [Favorites ★] [Recent ⏱] [All Categories ▼]  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│ │  📺     │ │  🎤     │ │  🔊     │ │  📷     │ │  ⬚      │  ← Drag   │
│ │ Display │ │ Shure   │ │ QSC     │ │ Poly    │ │ Crestron│    to     │
│ │ 75" 4K  │ │ MXA920  │ │ AD-C6T  │ │ Studio  │ │ TSW-770 │    canvas │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                                                          [▼ Collapse]  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Canvas Interactions

| Action | Input |
|--------|-------|
| **Select** | Click equipment |
| **Multi-select** | Shift+Click or drag selection box |
| **Move** | Drag selected equipment |
| **Pan** | Space+Drag or middle-mouse drag |
| **Zoom** | Scroll wheel or pinch |
| **Rotate** | R key while selected, or rotation handle |
| **Delete** | Backspace/Delete key |
| **Duplicate** | Cmd+D or Alt+Drag |
| **Context menu** | Right-click |

### Snapping Controls

Toggle bar at bottom of canvas:

```
Snap: [Grid ✓] [Guides ✓] [Dimensions ✓] [Zones ✓]  |  Grid Size: [12"] ▼
```

| Snap Type | Behavior |
|-----------|----------|
| **Grid** | Align to configurable grid spacing |
| **Smart Guides** | Dynamic alignment to other equipment, walls, center points |
| **Dimensions** | Snap to specific distances from walls/equipment |
| **Zones** | Snap to defined areas (seating, presenter, etc.) |

### Validation Feedback

| Severity | Canvas Display | Panel Display |
|----------|----------------|---------------|
| **Error** | Red outline on equipment, error icon badge | Red row, expandable details, "Fix" action |
| **Warning** | — | Yellow row, details, "Review" action |
| **Suggestion** | — | Blue row, details, "Apply" action |

Click error in panel → canvas zooms to and highlights the equipment.

---

## 5. Drawing Generation Mode

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Drawings ▼    Acme HQ > Conf Room 201           [Export ▼] 🔔 │
├────┬────────────────────────────────────────────────────────────────────┤
│    │ ┌──────────────────────────────────────────────────────────────┐   │
│ 📁 │ │  Electrical  │  Elevations  │  RCP  │  Rack  │  Cable Sched │   │ ← Drawing
│ 🏠 │ └──────────────────────────────────────────────────────────────┘   │   Tabs
│ 📐 │ ┌──────────────────────────────────────────────────────────────┐   │
│ 💰 │ │                                                              │   │
│ 📋 │ │                                                              │   │
│ 📦 │ │                    DRAWING CANVAS                            │   │
│ ⚙️ │ │                                                              │   │
│    │ │              [Generated + Editable Layers]                   │   │
│    │ │                                                              │   │
│    │ └──────────────────────────────────────────────────────────────┘   │
│    │ ┌──────────────────────────────────────────────────────────────┐   │
│    │ │ 🔧 Select │ ✏️ Annotate │ 📏 Dimension │ 💬 Note │ ✂️ Edit   │   │ ← Tool Bar
│    │ └──────────────────────────────────────────────────────────────┘   │
├────┴────────────────────────────────────────────────────────────────────┤
│  ⚠️ 3 manual overrides  │  Last generated: 2 min ago  │  [Regenerate]  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Drawing Tabs

| Tab | Contents |
|-----|----------|
| **Electrical** | Signal flow diagram, equipment blocks, cable connections |
| **Elevations** | Front/side wall views, mounting heights, equipment on walls |
| **RCP** | Reflected ceiling plan, mics, speakers, projector, pathways |
| **Rack** | Front/rear rack elevations, U positions, equipment labels |
| **Cable Schedule** | Table view of all cables, sortable, editable |
| **Floor Plan** | Room layout with AV equipment overlay |

### Tool Bar

| Tool | Function |
|------|----------|
| **Select** | Click to select elements, drag to move editable items |
| **Annotate** | Add callout bubbles, leaders, text labels |
| **Dimension** | Draw dimension lines between points |
| **Note** | Add text blocks, revision notes, general notes |
| **Edit** | Modify generated elements (unlocks editing mode) |

### Layer System

```
┌─────────────────────────────────────┐
│ Layers                            [+ −] │
├─────────────────────────────────────┤
│ 👁️ 🔒 Title Block                       │ ← Locked
│ 👁️ 🔒 Architectural Background          │ ← Locked
│ 👁️ 🔓 Generated AV Elements       ⚠️ 2  │ ← Overrides tracked
│ 👁️ 🔓 Annotations                       │ ← Fully editable
│ 👁️ 🔓 Dimensions                        │ ← Fully editable
│ 👁️ 🔓 Notes                             │ ← Fully editable
└─────────────────────────────────────┘
```

### Override Tracking

When you edit a generated element:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Manual Overrides (3)                                    [Review All] │
├─────────────────────────────────────────────────────────────────────────┤
│ • Display-01 position moved 6" left                    [Revert] [Keep] │
│ • Cable C-102 label changed "HDMI-01" → "VID-MAIN"     [Revert] [Keep] │
│ • Speaker SPK-03 added (not in room design)            [Sync ↑] [Keep] │
└─────────────────────────────────────────────────────────────────────────┘
```

| Action | Effect |
|--------|--------|
| **Revert** | Restore to generated version |
| **Keep** | Preserve override, flag if regeneration would conflict |
| **Sync ↑** | Push change back to room design |

### Regenerate Warning

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠️ Regenerate Drawings                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  You have 3 manual overrides that may be affected:                      │
│                                                                         │
│  • Display-01 position (will be overwritten)                            │
│  • Cable C-102 label (will be preserved - annotation layer)             │
│  • Speaker SPK-03 (will be removed - not in room design)                │
│                                                                         │
│  [ ] Don't warn me again for annotation-only changes                    │
│                                                                         │
│                           [Cancel]  [Regenerate Anyway]  [Review First] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Export Options

```
Export ▼
├── This Drawing
│   ├── PDF (print-ready)
│   ├── DWG (AutoCAD)
│   └── PNG (presentation)
├── All Drawings
│   ├── PDF Package (combined)
│   ├── PDF Package (separate files)
│   └── DWG Package
└── Export Settings...
```

---

## 6. Quoting Mode (Programa-Inspired)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Summary]  [Financial]  [Approvals]     Navigate to Section ▼   │   │ ← Tab Bar
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────┐  ┌───────────────────┐ │
│  │ Totals                                      │  │ ☐ Add Markup      │ │
│  │ $67,845.00         0.00%                   │  │                   │ │
│  │ TOTAL PRICE        TOTAL DISCOUNT          │  │ ◉ Bulk Quotes     │ │
│  └────────────────────────────────────────────┘  │ ◎ Share           │ │
│                                                   └───────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 Search    ⚙ Filter    ↕ Sort                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│            SECTION-GROUPED PRODUCT CARDS (Programa-style)               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Product Card View (Programa-Inspired)

Section-grouped layout with rich product cards:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Video  2                                                               │ ← Section Header
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ┌──────────┐                                                     │   │
│  │ │          │  75" Commercial Display        Samsung QM75B        │   │
│  │ │  [IMG]   │  PRODUCT DETAILS               PRODUCT NAME         │   │
│  │ │          │                                                     │   │
│  │ │          │  VID-01                        Samsung              │   │
│  │ └──────────┘  DOC CODE                      BRAND                │   │
│  │                                                                   │   │
│  │  ─            $2,100.00      2        $4,200.00   ADI            │   │
│  │  TRADE PRICE  UNIT PRICE     QTY      TOTAL       SUPPLIER       │   │
│  │                                                                   │   │
│  │                                    [Details]  [Quote]  ◉ Quoting │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ┌──────────┐                                                     │   │
│  │ │          │  Video Conferencing Bar        Poly Studio X50      │   │
│  │ │  [IMG]   │  PRODUCT DETAILS               PRODUCT NAME         │   │
│  │ │          │                                                     │   │
│  │ │          │  VID-02                        Poly                 │   │
│  │ └──────────┘  DOC CODE                      BRAND                │   │
│  │                                                                   │   │
│  │  ─            $3,200.00      1        $3,200.00   Snap One       │   │
│  │  TRADE PRICE  UNIT PRICE     QTY      TOTAL       SUPPLIER       │   │
│  │                                                                   │   │
│  │                                [Details]  [Quote]  ◉ Client Review│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Audio  4                                                               │ ← Next Section
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ┌──────────┐                                                     │   │
│  │ │          │  Ceiling Array Microphone      Shure MXA920         │   │
│  │ │  [IMG]   │  PRODUCT DETAILS               PRODUCT NAME         │   │
│  │ │          │                                                     │   │
│  │ │          │  AUD-01                        Shure                │   │
│  │ └──────────┘  DOC CODE                      BRAND                │   │
│  │                                                                   │   │
│  │  ─            $2,847.00      2        $5,694.00   ADI            │   │
│  │  TRADE PRICE  UNIT PRICE     QTY      TOTAL       SUPPLIER       │   │
│  │                                                                   │   │
│  │                                  [Details]  [Quote]  ◉ Ordered   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        + New Section                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                                                           + New        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Status Pills

Soft, muted colors for procurement status (Programa-style):

| Status | Style |
|--------|-------|
| **Quoting** | `bg: #FEF3C7` `text: #92400E` - Amber/yellow |
| **Client Review** | `bg: #DBEAFE` `text: #1E40AF` - Light blue |
| **Ordered** | `bg: #D1FAE5` `text: #065F46` - Green |
| **Delivered** | `bg: #E0E7FF` `text: #3730A3` - Purple |
| **Installed** | `bg: #F3F4F6` `text: #374151` - Gray |

### Spreadsheet View (Alternative)

Toggle between card view and dense spreadsheet:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [◉ Cards]  [○ Table]                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ▼ VIDEO                                                     $7,400    │
│  ┌────────┬──────────────────────────┬─────┬─────────┬─────────┬──────┐│
│  │ Image  │ Item                     │ Qty │ Cost    │ Total   │Status││
│  ├────────┼──────────────────────────┼─────┼─────────┼─────────┼──────┤│
│  │ [img]  │ Samsung QM75B 75"        │  2  │ $2,100  │ $4,200  │◉ Qtg ││
│  │ [img]  │ Poly Studio X50          │  1  │ $3,200  │ $3,200  │◉ Rev ││
│  └────────┴──────────────────────────┴─────┴─────────┴─────────┴──────┘│
│                                                                         │
│  ▼ AUDIO                                                     $12,380   │
│  ...                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Preview View (Side-by-Side with Live PDF)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │                             │  │    ┌──────────────────────┐     │  │
│  │  QUOTE FORM                 │  │    │     PROPOSAL         │     │  │
│  │                             │  │    │                      │     │  │
│  │  Customer                   │  │    │  Acme Corp           │     │  │
│  │  ┌───────────────────────┐  │  │    │  Conference Room 201 │     │  │
│  │  │ Acme Corp         [↗] │  │  │    │                      │     │  │
│  │  └───────────────────────┘  │  │    │  ─────────────────   │     │  │
│  │                             │  │    │                      │     │  │
│  │  Details                    │  │    │  VIDEO SYSTEMS       │     │  │
│  │  Invoice number   INV-001   │  │    │                      │     │  │
│  │  Payment schedule Due 30d   │  │    │  Samsung QM75B (2)   │     │  │
│  │  Currency         USD       │  │    │       $4,200.00      │     │  │
│  │                             │  │    │                      │     │  │
│  │  Items                      │  │    │  Poly Studio X50     │     │  │
│  │  ┌───────────────────────┐  │  │    │       $3,200.00      │     │  │
│  │  │ Item #1            ▲  │  │  │    │                      │     │  │
│  │  │ Name: Samsung QM75B   │  │  │    └──────────────────────┘     │  │
│  │  │ Quantity: 2           │  │  │        [Invoice PDF] [Email]    │  │
│  │  │ Price: $2,100         │  │  │                                 │  │
│  │  └───────────────────────┘  │  │  Customize your PDF in Settings │  │
│  │                             │  │                                 │  │
│  │  + Add Item                 │  └─────────────────────────────────┘  │
│  │                             │                                       │
│  │  Subtotal      $7,400.00    │                                       │
│  │  Tax               $0.00    │                                       │
│  │                             │                                       │
│  │        [        Send        ]                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Margin Analysis Panel

```
┌─────────────────────────────────────────┐
│ Margin Analysis                    [×]  │
├─────────────────────────────────────────┤
│ Overall Margin         32.4%  ($22,615) │
│ ████████████████████░░░░░░░░░░░         │
├─────────────────────────────────────────┤
│ By Category                             │
│ Video          33%   ██████████████     │
│ Audio          35%   ███████████████    │
│ Control        38%   ████████████████   │
│ Cabling        42%   ██████████████████ │
│ Labor          28%   ███████████        │
├─────────────────────────────────────────┤
│ ⚠️ 2 items below minimum margin (20%)   │
│ • HDMI Cable 25ft - 18%    [Adjust]     │
│ • Conduit Fittings - 15%   [Adjust]     │
└─────────────────────────────────────────┘
```

### Pricing Rules

Pricing can be defined at equipment level and in standards hierarchy:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRICING RULE RESOLUTION                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Equipment Library          Standards Hierarchy                        │
│   ┌─────────────────┐        ┌─────────────────┐                       │
│   │ Category Rules  │        │ Your Defaults   │                       │
│   │ (Audio: 35%)    │        │ (Base margins)  │                       │
│   └────────┬────────┘        └────────┬────────┘                       │
│            │                          │                                 │
│   ┌────────▼────────┐        ┌────────▼────────┐                       │
│   │ Item Rules      │        │ Client Rules    │                       │
│   │ (MXA920: 38%)   │        │ (Acme: -5%)     │                       │
│   └────────┬────────┘        └────────┬────────┘                       │
│            │                          │                                 │
│            └──────────┬───────────────┘                                 │
│                       ▼                                                 │
│              ┌─────────────────┐                                        │
│              │ Resolved Price  │  ← Most specific wins                  │
│              │ (with override  │    Manual overrides on top             │
│              │  tracking)      │                                        │
│              └─────────────────┘                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Equipment-Level Pricing

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Shure MXA920 Ceiling Array Microphone                         [Pricing]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Markup Method       [Percentage ▼]    │  Margin %        [35    ]%     │
│                                                                         │
│ Minimum Margin      [20    ]%         │  Warning if below minimum  ✓   │
│                                                                         │
│ Price Rounding      [Nearest $10 ▼]                                     │
│                                                                         │
│ Cost Source Priority                                                    │
│   1. [ADI             ▼]  Current: $2,847                              │
│   2. [Snap One        ▼]  Current: $2,890                              │
│   3. [Manual Entry    ▼]  Current: $2,800                              │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│ Client Overrides                                                        │
│ ┌─────────────────────┬────────────┬──────────────────────────────────┐│
│ │ Client              │ Margin     │ Notes                            ││
│ ├─────────────────────┼────────────┼──────────────────────────────────┤│
│ │ Acme Corp           │ 30%        │ Volume discount agreement        ││
│ │ Beta Industries     │ 40%        │ Premium support included         ││
│ └─────────────────────┴────────────┴──────────────────────────────────┘│
│                                                      [+ Add Override]   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Price Detail View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Shure MXA920                                              Price Details │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Cost:        $2,847    (Source: ADI)                                    │
│ Base Margin: 35%       (Source: Equipment Library)                      │
│ Client Adj:  -5%       (Source: Acme Corp pricing rule)                 │
│ Final Margin: 30%                                                       │
│ ───────────────────                                                     │
│ Calculated:  $4,067                                                     │
│ Rounded:     $4,070    (Nearest $10)                                    │
│                                                                         │
│ Manual Override: $3,900  ⚠️ Below calculated, margin now 27%           │
│                                                    [Clear Override]     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Version History

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Version History                                              [Compare] │
├─────────────────────────────────────────────────────────────────────────┤
│ ● v2.1 (current) - Jan 17, 2:30pm - Added control system               │
│ ○ v2.0 - Jan 16, 4:15pm - Client requested Poly over Logitech          │
│ ○ v1.1 - Jan 15, 11:00am - Adjusted speaker quantity                   │
│ ○ v1.0 - Jan 14, 9:00am - Initial quote                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Equipment Library Mode (Programa-Inspired)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  LIBRARIES                                    [+ New]                   │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 Search products...                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────┬───────────────────────────────────────────────┐   │
│  │                 │                                               │   │
│  │  CATEGORIES     │         PRODUCT LIBRARY                       │   │
│  │                 │                                               │   │
│  │  All Products   │  ┌─────────────────────────────────────────┐  │   │
│  │                 │  │ [★ Favorites]  [⏱ Recent]  [All ▼]      │  │   │
│  │  ▼ Audio        │  └─────────────────────────────────────────┘  │   │
│  │    Microphones  │                                               │   │
│  │    Speakers     │       PRODUCT GRID / LIST                     │   │
│  │    DSP          │                                               │   │
│  │    Amplifiers   │                                               │   │
│  │                 │                                               │   │
│  │  ▼ Video        │                                               │   │
│  │    Displays     │                                               │   │
│  │    Cameras      │                                               │   │
│  │    Codecs       │                                               │   │
│  │                 │                                               │   │
│  │  ▶ Control      │                                               │   │
│  │  ▶ Infrastructure│                                              │   │
│  │                 │                                               │   │
│  └─────────────────┴───────────────────────────────────────────────┘   │
│                                                                         │
│  1,247 items  │  Showing: Audio > Microphones                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Product Grid (Programa-Inspired Visual Catalog)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │                   │  │                   │  │                   │   │
│  │    ┌─────────┐    │  │    ┌─────────┐    │  │    ┌─────────┐    │   │
│  │    │         │    │  │    │         │    │  │    │         │    │   │
│  │    │  [IMG]  │    │  │    │  [IMG]  │    │  │    │  [IMG]  │    │   │
│  │    │         │    │  │    │         │    │  │    │         │    │   │
│  │    └─────────┘    │  │    └─────────┘    │  │    └─────────┘    │   │
│  │                   │  │                   │  │                   │   │
│  │  Shure MXA920     │  │  Shure MXA910     │  │  Sennheiser TCC2  │   │
│  │  Ceiling Array    │  │  Ceiling Array    │  │  TeamConnect      │   │
│  │                   │  │                   │  │  Ceiling 2        │   │
│  │  $2,847           │  │  $3,200           │  │  $2,650           │   │
│  │                   │  │                   │  │                   │   │
│  │  ● In Stock  ★    │  │  ● In Stock       │  │  ○ 2-3 wks   ★    │   │
│  │  Teams ✓  Zoom ✓  │  │  Teams ✓          │  │  Teams ✓  Zoom ✓  │   │
│  │                   │  │                   │  │                   │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
│                                                                         │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │                   │  │                   │  │                   │   │
│  │    ┌─────────┐    │  │    ┌─────────┐    │  │    ┌─────────┐    │   │
│  │    │         │    │  │    │         │    │  │    │         │    │   │
│  │    │  [IMG]  │    │  │    │  [IMG]  │    │  │    │  [IMG]  │    │   │
│  │    ...       │    │  │    ...       │    │  │    ...       │    │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Product Detail Modal (Programa-Inspired Tabbed View)

Slide-out modal with image gallery and tabbed details:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ←  →                    Shure MXA920               [↗]  [×]   Draft ▼ │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Summary]  [Financial]  [Attachments]  [Approvals]              │   │ ← Tabs
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────────┐  ┌──────────────┐                             │   │
│  │  │              │  │              │    Drag & drop or           │   │
│  │  │    [IMG 1]   │  │    [IMG 2]   │    browse files             │   │
│  │  │              │  │              │    Upload up to 2 images    │   │
│  │  └──────────────┘  └──────────────┘                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Product Name                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Shure MXA920 Ceiling Array Microphone                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Product Description                    Doc Code                        │
│  ┌──────────────────────────────┐      ┌────────────────────────────┐  │
│  │ Ceiling array microphone     │      │ MIC-01                     │  │
│  │ for conferencing             │      └────────────────────────────┘  │
│  └──────────────────────────────┘                                      │
│                                                                         │
│  Product Details                        Quantity                        │
│  ┌──────────────────────────────┐      ┌────────────────────────────┐  │
│  │ IntelliMix DSP, 8 lobes,     │      │ 1                          │  │
│  │ Dante network, AEC...        │      └────────────────────────────┘  │
│  └──────────────────────────────┘                                      │
│                                                                         │
│  Brand                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Shure                                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  SKU                                    Lead Time                       │
│  ┌──────────────────────────────┐      ┌────────────────────────────┐  │
│  │ MXA920-R                     │      │ In Stock              ▼   │  │
│  └──────────────────────────────┘      └────────────────────────────┘  │
│                                                                         │
│  Product URL                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [↗] https://shure.com/mxa920                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Supplier                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ○ Add existing or new supplier                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Product Specifications                                                 │
│                                                                         │
│  Coverage Area         30' × 30'                                        │
│  Frequency Response    180 Hz - 17 kHz                                  │
│  Pickup Patterns       8 configurable lobes                             │
│  Network              Dante (10 channels)                               │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  [📄 Download PDF]                                           Saved ✓   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Financial Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Summary]  [Financial]  [Attachments]  [Approvals]                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Cost Sources                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Priority   Source        Cost        Last Updated              │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  1          ADI           $2,847      Jan 15, 2026              │   │
│  │  2          Snap One      $2,890      Jan 14, 2026              │   │
│  │  3          Manual        $2,800      Jan 10, 2026              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Pricing Rules                                                          │
│  ┌──────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ Markup Method                │  │ Margin                         │  │
│  │ [Percentage          ▼]     │  │ [35           ]%               │  │
│  └──────────────────────────────┘  └────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ Minimum Margin               │  │ Price Rounding                 │  │
│  │ [20           ]%             │  │ [Nearest $10          ▼]      │  │
│  └──────────────────────────────┘  └────────────────────────────────┘  │
│                                                                         │
│  Client Overrides                                               [+ Add] │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Client              Margin    Notes                            │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  Acme Corp           30%       Volume discount agreement        │   │
│  │  Beta Industries     40%       Premium support included         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Attachments Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Summary]  [Financial]  [Attachments]  [Approvals]                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                          ↑                                      │   │
│  │           Drag & drop or browse files                           │   │
│  │           Upload spec sheets, CAD blocks, wiring diagrams       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ 📄               │  │ 📐               │  │ 📄               │      │
│  │ Spec Sheet       │  │ CAD Block        │  │ Wiring Diagram   │      │
│  │ PDF · 2.4 MB     │  │ DWG · 156 KB     │  │ PDF · 890 KB     │      │
│  │ [↓] [×]          │  │ [↓] [×]          │  │ [↓] [×]          │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Import Options

```
[+ New] ▼
├── From Manufacturer Feed
│   ├── Shure Product Database
│   ├── Crestron Product API
│   └── [+ Connect Manufacturer...]
├── From Distributor
│   ├── ADI Price List
│   ├── Snap One Catalog
│   └── [+ Connect Distributor...]
├── From File
│   ├── CSV / Excel Import
│   ├── D-Tools Export
│   └── Spec Sheet (AI-assisted extraction)
└── Manual Entry
```

---

## 8. Standards Management Mode

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Standards ▼                                   [+ New Rule] 🔔  │
├────┬────────────────────────────────────────────────────────────────────┤
│    │ ┌─────────────────┬────────────────────────────────────────────┐   │
│ 📁 │ │                 │                                            │   │
│ 🏠 │ │   HIERARCHY     │            RULES LIST                      │   │
│ 📐 │ │   TREE          │            (for selected level)            │   │
│ 💰 │ │                 │                                            │   │
│ 📋 │ │                 │                                            │   │
│ 📦 │ │                 │                                            │   │
│ ⚙️ │ │                 │                                            │   │
│    │ │                 │                                            │   │
│    │ │                 │                                            │   │
│    │ └─────────────────┴────────────────────────────────────────────┘   │
├────┴────────────────────────────────────────────────────────────────────┤
│  Viewing: Your Standards > Room Types > Conference  │  24 rules active │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hierarchy Tree

```
┌─────────────────────────────┐
│ Standards Hierarchy    [+ −]│
├─────────────────────────────┤
│ 🔍 Search tree...           │
├─────────────────────────────┤
│ ▼ 📁 Your Standards         │
│   ├─ ▼ Room Types           │
│   │   ├─ 🏠 Huddle     (8)  │
│   │   ├─ 🏠 Conference (24) │ ← Selected
│   │   ├─ 🏠 Training   (18) │
│   │   ├─ 🏠 Boardroom  (31) │
│   │   └─ 🏠 Auditorium (42) │
│   ├─ ▼ Platforms            │
│   │   ├─ 💻 Teams      (15) │
│   │   ├─ 💻 Zoom       (12) │
│   │   └─ 💻 Webex      (9)  │
│   ├─ ▼ Ecosystems           │
│   │   ├─ 🔧 Poly       (22) │
│   │   ├─ 🔧 Logitech   (18) │
│   │   └─ 🔧 Cisco      (20) │
│   ├─ ▼ Quality Tiers        │
│   │   ├─ 💎 Premium    (28) │
│   │   ├─ ⭐ Standard   (15) │
│   │   └─ 💰 Budget     (10) │
│   └─ ▶ Use Cases            │
├─────────────────────────────┤
│ ▼ 📁 Clients                │
│   ├─ ▼ 🏢 Acme Corp         │
│   │   ├─ Corporate     (12) │
│   │   └─ Manufacturing (8)  │
│   ├─ ▶ 🏢 Beta Industries   │
│   └─ ▶ 🏢 Gamma Tech        │
└─────────────────────────────┘
  [+ Add Client] [+ Add Folder]
```

### Rules List

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Conference Room Rules                                      [+ New Rule] │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [All ▼]  [Design 📐]  [Pricing 💰]  [Cabling 🔌]    🔍 Search...   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ EQUIPMENT SELECTION                                                     │
│ ┌───┬───────────────────────────────────────────────────────┬─────────┐│
│ │ ● │ Display minimum 55" for rooms < 400 sqft              │ [Edit]  ││
│ │ ● │ Display minimum 75" for rooms 400-800 sqft            │ [Edit]  ││
│ │ ● │ Dual displays required for rooms > 600 sqft           │ [Edit]  ││
│ │ ○ │ Codec required when room has video conferencing       │ [Edit]  ││
│ └───┴───────────────────────────────────────────────────────┴─────────┘│
│                                                                         │
│ QUANTITIES                                                              │
│ ┌───┬───────────────────────────────────────────────────────┬─────────┐│
│ │ ● │ Ceiling speakers = ceil(sqft / 80), min 2             │ [Edit]  ││
│ │ ● │ Mic zones = ceil(sqft / 200), min 1                   │ [Edit]  ││
│ └───┴───────────────────────────────────────────────────────┴─────────┘│
│                                                                         │
│ ● Active  ○ Disabled                              Showing 12 of 24 rules│
└─────────────────────────────────────────────────────────────────────────┘
```

### Rule Editor (Slide-Out Panel)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Edit Rule                                              [Cancel] [Save]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ RULE BASICS                                                             │
│ ─────────────────────────────────────────────────────────────────────── │
│ Name          [Display minimum size by room                   ]         │
│ Description   [Ensures display is appropriately sized for room]         │
│ Type          [Design 📐 ▼]     Category  [Equipment Selection ▼]       │
│ Status        (●) Active  ( ) Disabled                                  │
│                                                                         │
│ RULE LOGIC                                                              │
│ ─────────────────────────────────────────────────────────────────────── │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Visual Builder]  [Code Editor]  [AI Assist ✨]                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Visual Builder:                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │  WHEN                                                               │ │
│ │  ┌─────────────┐ ┌────┐ ┌─────────────┐                            │ │
│ │  │ room.sqft   │ │ <  │ │ 400         │                            │ │
│ │  └─────────────┘ └────┘ └─────────────┘                            │ │
│ │                                                                     │ │
│ │  THEN REQUIRE                                                       │ │
│ │  ┌─────────────────────┐ ┌────┐ ┌─────────────┐                    │ │
│ │  │ display.size_inches │ │ >= │ │ 55          │                    │ │
│ │  └─────────────────────┘ └────┘ └─────────────┘                    │ │
│ │                                                                     │ │
│ │  [+ Add Condition]  [+ Add Requirement]                             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ VALIDATION BEHAVIOR                                                     │
│ ─────────────────────────────────────────────────────────────────────── │
│ Severity       (●) Error  ( ) Warning  ( ) Suggestion                   │
│ Message        [Display too small for room size. Minimum 55" required.] │
│ Auto-fix       [✓] Suggest equipment swap                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Code Editor View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1 │ rule:                                                              │
│  2 │   name: display-minimum-size                                       │
│  3 │   conditions:                                                      │
│  4 │     - when: room.sqft < 400                                        │
│  5 │       require: display.size_inches >= 55                           │
│  6 │     - when: room.sqft >= 400 AND room.sqft < 800                   │
│  7 │       require: display.size_inches >= 75                           │
│  8 │     - when: room.sqft >= 800                                       │
│  9 │       require: display.size_inches >= 85                           │
│ 10 │   on_fail:                                                         │
│ 11 │     severity: error                                                │
│ 12 │     message: "Display too small for room size"                     │
│ 13 │     suggest: equipment_swap(category: "display")                   │
└─────────────────────────────────────────────────────────────────────────┘
                                           [Validate] [Format] [Preview]
```

### AI Assist View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Describe your rule in plain English:                                    │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Conference rooms with video conferencing that are larger than       │ │
│ │ 600 square feet should have PTZ cameras instead of fixed USB        │ │
│ │ cameras, unless the client has specified Logitech ecosystem         │ │
│ │ in which case Rally cameras are acceptable.                         │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                              [Generate Rule ✨]         │
├─────────────────────────────────────────────────────────────────────────┤
│ Generated Rule Preview:                                                 │
│                                                                         │
│ WHEN                                                                    │
│   room.type = "conference" AND                                          │
│   room.use_case = "video_conferencing" AND                              │
│   room.sqft > 600 AND                                                   │
│   ecosystem != "logitech"                                               │
│                                                                         │
│ THEN REQUIRE                                                            │
│   camera.type = "ptz"                                                   │
│                                                                         │
│ EXCEPT WHEN                                                             │
│   ecosystem = "logitech" → camera.model LIKE "Rally%"                  │
│                                                                         │
│                                  [Edit Generated] [Accept & Save]       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Inheritance Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Acme Corp > Corporate Offices                              [+ New Rule] │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Show: [All ▼]  [Inherited 📥]  [Local 📍]  [Overridden ⚡]         │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ 📥 INHERITED FROM: Your Standards > Conference                         │
│ ┌───┬───────────────────────────────────────────────────────┬─────────┐│
│ │ ● │ Display minimum 55" for rooms < 400 sqft              │ [Override]│
│ │ ● │ Display minimum 75" for rooms 400-800 sqft            │ [Override]│
│ │ ● │ Ceiling speakers = ceil(sqft / 80), min 2             │ [Override]│
│ └───┴───────────────────────────────────────────────────────┴─────────┘│
│                                                                         │
│ ⚡ OVERRIDDEN AT THIS LEVEL                                             │
│ ┌───┬───────────────────────────────────────────────────────┬─────────┐│
│ │ ● │ Display minimum 65" for rooms < 400 sqft   (was 55")  │ [Edit]  ││
│ └───┴───────────────────────────────────────────────────────┴─────────┘│
│                                                                         │
│ 📍 LOCAL RULES (this level only)                                        │
│ ┌───┬───────────────────────────────────────────────────────┬─────────┐│
│ │ ● │ All rooms require Crestron control system             │ [Edit]  ││
│ │ ● │ Biamp DSP required for rooms with > 4 mic zones       │ [Edit]  ││
│ └───┴───────────────────────────────────────────────────────┴─────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Conflict Detection

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Rule Conflicts Detected                                      [×]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ The following rules may conflict when applied together:                 │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ CONFLICT 1                                                          │ │
│ │                                                                     │ │
│ │ 📐 Ecosystem: Poly                                                  │ │
│ │    "Use Poly Studio X series for video bars"                        │ │
│ │                                                                     │ │
│ │         ⚡ CONFLICTS WITH                                           │ │
│ │                                                                     │ │
│ │ 💰 Quality Tier: Budget                                             │ │
│ │    "Use USB cameras for budget tier (no codec)"                     │ │
│ │                                                                     │ │
│ │ Priority Resolution: Ecosystem > Quality Tier                       │ │
│ │ → Poly Studio X will be used                                        │ │
│ │                                                                     │ │
│ │                           [Accept Priority] [Edit Rules] [Ignore]   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Project Dashboard Mode

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Projects ▼                        [+ New Project] [Import] 🔔  │
├────┬────────────────────────────────────────────────────────────────────┤
│    │ ┌──────────────────────────────────────────────────────────────┐   │
│ 📁 │ │ 🔍 Search projects...     [View: Kanban ▼]  [Filter ▼]  [⋮] │   │
│ 🏠 │ └──────────────────────────────────────────────────────────────┘   │
│ 📐 │                                                                    │
│ 💰 │                                                                    │
│ 📋 │                    PROJECT VIEW AREA                               │
│ 📦 │              (Kanban / List / Client-grouped)                      │
│ ⚙️ │                                                                    │
│    │                                                                    │
│    │                                                                    │
├────┴────────────────────────────────────────────────────────────────────┤
│  42 projects  │  12 active  │  $847K pipeline                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Kanban View

```
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ DESIGN        │ │ REVIEW        │ │ APPROVED      │ │ IN PROGRESS   │
│ 4 projects    │ │ 3 projects    │ │ 2 projects    │ │ 3 projects    │
├───────────────┤ ├───────────────┤ ├───────────────┤ ├───────────────┤
│┌─────────────┐│ │┌─────────────┐│ │┌─────────────┐│ │┌─────────────┐│
││ Acme HQ     ││ ││ Beta Lobby  ││ ││ Gamma Conf  ││ ││ Delta Train ││
││ Conf 201    ││ ││ Renovation  ││ ││ Room A      ││ ││ Center      ││
││             ││ ││             ││ ││             ││ ││             ││
││ $67,845     ││ ││ $124,500    ││ ││ $45,200     ││ ││ $89,750     ││
││ 2 rooms     ││ ││ 1 room      ││ ││ 3 rooms     ││ ││ 5 rooms     ││
││ ⚠️ 2 issues ││ ││ Awaiting    ││ ││ Install     ││ ││ 40%         ││
││ Updated 2h  ││ ││ sign-off    ││ ││ scheduled   ││ ││ complete    ││
│└─────────────┘│ │└─────────────┘│ │└─────────────┘│ │└─────────────┘│
│┌─────────────┐│ │┌─────────────┐│ │┌─────────────┐│ │┌─────────────┐│
││ Acme HQ     ││ ││ Acme Mfg    ││ ││ Beta East   ││ ││ Gamma Board ││
││ Boardroom   ││ ││ Floor 2     ││ ││ Campus      ││ ││ Room        ││
││             ││ ││             ││ ││             ││ ││             ││
││ $142,300    ││ ││ $78,900     ││ ││ $234,000    ││ ││ $156,400    ││
│└─────────────┘│ │└─────────────┘│ │└─────────────┘│ │└─────────────┘│
│               │ │               │ │               │ │               │
│  [+ Add]      │ │               │ │               │ │               │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

### List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│   │ Project           │ Client        │ Status    │ Value    │ Updated │
├───┼───────────────────┼───────────────┼───────────┼──────────┼─────────┤
│ ☐ │ HQ Conf 201       │ Acme Corp     │ 🔵 Design │ $67,845  │ 2h ago  │
│ ☐ │ HQ Boardroom      │ Acme Corp     │ 🔵 Design │ $142,300 │ 1d ago  │
│ ☐ │ Lobby Renovation  │ Beta Ind.     │ 🟡 Review │ $124,500 │ 3h ago  │
│ ☐ │ Manufacturing F2  │ Acme Corp     │ 🟡 Review │ $78,900  │ 5h ago  │
│ ☐ │ Conf Room A       │ Gamma Tech    │ 🟢 Approved│ $45,200 │ 2d ago  │
│ ☐ │ East Campus       │ Beta Ind.     │ 🟢 Approved│ $234,000│ 1w ago  │
│ ☐ │ Training Center   │ Delta Corp    │ 🔷 Active │ $89,750  │ 4h ago  │
│ ☐ │ Board Room        │ Gamma Tech    │ 🔷 Active │ $156,400 │ 1d ago  │
│ ☐ │ HQ Expansion      │ Epsilon Inc   │ ⏸️ Hold   │ $320,000 │ 2w ago  │
└───┴───────────────────┴───────────────┴───────────┴──────────┴─────────┘
  [Columns ▼]  Sort by: [Updated ▼]               Showing 1-9 of 42  [< >]
```

### Client-Grouped View

```
▼ 🏢 ACME CORP                                    4 projects  $289,045
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐             │
│ │ HQ Conf 201     │ │ HQ Boardroom    │ │ Mfg Floor 2     │             │
│ │ 🔵 Design       │ │ 🔵 Design       │ │ 🟡 Review       │             │
│ │ $67,845         │ │ $142,300        │ │ $78,900         │             │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘

▼ 🏢 BETA INDUSTRIES                              2 projects  $358,500
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────┐ ┌─────────────────┐                                 │
│ │ Lobby Reno      │ │ East Campus     │                                 │
│ │ 🟡 Review       │ │ 🟢 Approved     │                                 │
│ │ $124,500        │ │ $234,000        │                                 │
│ └─────────────────┘ └─────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────┘

▶ 🏢 GAMMA TECH                                   2 projects  $201,600
▶ 🏢 DELTA CORP                                   1 project   $89,750
```

### Project Card Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Acme HQ - Conference Room 201                                     [×]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Client        Acme Corp > Corporate Offices                             │
│ Status        🔵 Design                                                 │
│ Created       Jan 10, 2026                                              │
│ Updated       2 hours ago by Brandon                                    │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ ROOMS                                                                   │
│ ┌──────────────────────────────┬─────────────┬─────────────────────────┐│
│ │ Room                         │ Status      │ Value                   ││
│ ├──────────────────────────────┼─────────────┼─────────────────────────┤│
│ │ Conference Room 201          │ ⚠️ 2 issues │ $45,320                 ││
│ │ Huddle Room 202              │ ✓ Valid     │ $22,525                 ││
│ └──────────────────────────────┴─────────────┴─────────────────────────┘│
│                                                                         │
│ QUOTE                                                                   │
│ Equipment      $52,430                                                  │
│ Cabling        $4,215                                                   │
│ Labor          $11,200                                                  │
│ ─────────────────────                                                   │
│ Total          $67,845          Margin: 32%                             │
│                                                                         │
│           [Open Project]  [View Quote]  [Generate Drawings]  [⋮ More]   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PIPELINE OVERVIEW                                           Jan 2026    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   $289K     │  │   $203K     │  │   $279K     │  │   $847K     │    │
│  │   Design    │  │   Review    │  │   Approved  │  │   Total     │    │
│  │   4 proj    │  │   3 proj    │  │   2 proj    │  │   Pipeline  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
│  Active Work: $246K across 3 projects                                   │
│  Completed This Month: $412K across 5 projects                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Command Palette

### Default State (Cmd+K)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 Type a command or search...                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ RECENT                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🏠  Acme HQ Conf 201                                    Project     │ │
│ │ 📦  Shure MXA920                                        Equipment   │ │
│ │ 📐  Open Room Design                                    Action      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ QUICK ACTIONS                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ➕  New Project                                         Cmd+N       │ │
│ │ 📁  Open Project...                                     Cmd+O       │ │
│ │ 💾  Save                                                Cmd+S       │ │
│ │ 📤  Export...                                           Cmd+E       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ NAVIGATE                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📁  Projects                                            Cmd+1       │ │
│ │ 📐  Room Design                                         Cmd+2       │ │
│ │ 📋  Drawings                                            Cmd+3       │ │
│ │ 💰  Quoting                                             Cmd+4       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                              [?] Help  [⚙️] Preferences │
└─────────────────────────────────────────────────────────────────────────┘
```

### Search Results

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 shure mxa                                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ EQUIPMENT                                                               │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📦  Shure MXA920 Ceiling Array                          $2,847      │ │
│ │ 📦  Shure MXA910 Ceiling Array                          $3,200      │ │
│ │ 📦  Shure MXA902 Integrated Conferencing                $2,100      │ │
│ │ 📦  Shure MXA710 Linear Array                           $2,650      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ACTIONS                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ➕  Add Shure MXA920 to current room                    Enter       │ │
│ │ 📋  View Shure MXA920 specs                             Cmd+Enter   │ │
│ │ ⭐  Toggle Shure MXA920 favorite                                    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ PROJECTS USING "SHURE MXA"                                              │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🏠  Acme HQ Conf 201                          2× MXA920             │ │
│ │ 🏠  Beta Lobby                                1× MXA910             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### AI Query

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 show me all Poly projects for Acme over $50k                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ✨ AI QUERY RESULTS                                                     │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Found 2 projects matching: Acme Corp + Poly ecosystem + >$50K       │ │
│ │                                                                     │ │
│ │ 🏠  Acme HQ Boardroom                                               │ │
│ │     Poly ecosystem • $142,300 • Design phase                        │ │
│ │                                                                     │ │
│ │ 🏠  Acme Manufacturing Floor 2                                      │ │
│ │     Poly ecosystem • $78,900 • Review phase                         │ │
│ │                                                                     │ │
│ │                                         [Open First] [View All →]   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ REFINE QUERY                                                            │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ "...that are in review status"                                      │ │
│ │ "...with video conferencing"                                        │ │
│ │ "...created this month"                                             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Settings & Preferences

### Settings Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Preferences                                                       [×]   │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────┐                                                   │
│ │ General           │ [Settings content for selected category]         │
│ │ Appearance        │                                                   │
│ │ Keyboard          │                                                   │
│ │ Canvas            │                                                   │
│ │ Validation        │                                                   │
│ │ Quoting           │                                                   │
│ │ Drawings          │                                                   │
│ │ Data & Sync       │                                                   │
│ │ Integrations      │                                                   │
│ │ Account           │                                                   │
│ └───────────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### General Settings

| Setting | Options |
|---------|---------|
| **Startup** | Reopen last project, Check for updates |
| **Auto-save** | Enable/disable, interval (1-30 minutes) |
| **Notifications** | Validation warnings, sync conflicts, sounds |
| **Language** | English (US), etc. |
| **Units** | Imperial (ft, in), Metric (m, cm) |
| **Currency** | USD, EUR, GBP, etc. |

### Appearance Settings

| Setting | Options |
|---------|---------|
| **Theme** | Dark, Light, System |
| **Accent Color** | Blue, Purple, Green, Orange |
| **Density** | Comfortable, Compact |
| **Font Size** | Slider (Small to Large) |
| **Sidebar** | Show labels on hover, collapse on small windows |

### Canvas Settings

| Setting | Options |
|---------|---------|
| **Grid** | Show/hide, size (inches), style (lines, dots) |
| **Snapping** | Grid, guides, dimensions, zones (each toggleable) |
| **Snap Threshold** | Pixels (4-16) |
| **Zoom** | Scroll speed, invert direction, min/max zoom |
| **Performance** | Reduce animations, cache symbols |

### Validation Settings

| Setting | Options |
|---------|---------|
| **Auto-validation** | On placement, on property change, continuous |
| **Display** | Show errors/warnings/suggestions inline |
| **Priority Order** | Drag-to-reorder dimension priority |

### Data & Sync Settings

| Setting | Options |
|---------|---------|
| **Cloud Sync** | Status, enable/disable, what to sync |
| **Offline Mode** | Enable, cache size, clear cache |
| **Conflict Resolution** | Ask, keep local, keep server |
| **Data Management** | Export all, import |

### Integrations Settings

| Setting | Options |
|---------|---------|
| **Distributor Feeds** | ADI, Snap One, etc. (connect/configure) |
| **Manufacturer Feeds** | Shure, Crestron, etc. (connect/configure) |
| **CAD Integration** | AutoCAD status, notify when available |

### Account Settings

| Setting | Options |
|---------|---------|
| **Profile** | Name, email, role, edit profile |
| **Team Members** | List, invite new member |
| **Security** | Change password, 2FA |
| **Sessions** | Active devices, sign out others |

---

## 12. Keyboard Shortcuts

### Global

| Shortcut | Action |
|----------|--------|
| Cmd+K | Command palette |
| Cmd+N | New project |
| Cmd+O | Open project |
| Cmd+S | Save |
| Cmd+Z | Undo |
| Cmd+Shift+Z | Redo |
| Cmd+, | Preferences |

### Navigation

| Shortcut | Action |
|----------|--------|
| Cmd+1 | Projects |
| Cmd+2 | Room Design |
| Cmd+3 | Drawings |
| Cmd+4 | Quoting |
| Cmd+5 | Standards |
| Cmd+6 | Equipment Library |

### Panels

| Shortcut | Action |
|----------|--------|
| Cmd+Shift+P | Properties |
| Cmd+Shift+L | Layers |
| Cmd+Shift+I | Validation |
| Cmd+Shift+M | Minimap |

### Room Design

| Shortcut | Action |
|----------|--------|
| V | Select tool |
| H | Pan tool |
| Space+Drag | Pan canvas |
| Scroll | Zoom |
| Cmd+0 | Fit to screen |
| R | Rotate |
| Delete | Remove item |
| Cmd+D | Duplicate |
| Cmd+G | Group |
| Cmd+Shift+V | Validate |

### Drawings

| Shortcut | Action |
|----------|--------|
| A | Annotate |
| D | Dimension |
| N | Note |
| Cmd+E | Export |

### Quoting

| Shortcut | Action |
|----------|--------|
| Tab | Next cell |
| Shift+Tab | Previous cell |
| Enter | Edit cell |
| Cmd+Shift+M | Margin view |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-17 | Brandon Burnette | Initial UI design specification |
