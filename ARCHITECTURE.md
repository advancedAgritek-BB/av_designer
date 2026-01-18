# AV Designer - Architecture

**Last Updated:** 2026-01-17
**Status:** Initial - Pre-Implementation

---

## Overview

AV Designer is a desktop application for AV engineering subcontract work. It enables rapid room design, standards-based validation, automated quoting, and complete drawing package generation.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Desktop Application                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Frontend (React + TypeScript)                  ││
│  │   UI Components • Room Builder • Drawing Canvas • 3D        ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                Backend (Rust via Tauri)                     ││
│  │  File Processing • CAD Parsing • Drawing Generation         ││
│  │  Analysis Engines • Offline Cache • Local File I/O          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  PostgreSQL  │ │     Auth     │ │   File Storage           │ │
│  │  Database    │ │   (Users,    │ │   (Drawings, CAD,        │ │
│  │              │ │    Roles)    │ │    Attachments)          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current State

**Phase:** Pre-Implementation (Phase 0)

### Implemented

- [ ] Project foundation (Tauri + React + TypeScript)
- [ ] Design system with Tailwind tokens
- [ ] Core UI components
- [ ] Equipment database
- [ ] Standards engine
- [ ] Room builder
- [ ] Drawing generation
- [ ] Quoting system

### In Progress

- Initial project setup and tooling

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Desktop Shell | Tauri | 2.x | Native desktop app with Rust backend |
| Frontend | React | 18.x | UI components and interactions |
| Language | TypeScript | 5.x | Type-safe frontend development |
| Build Tool | Vite | 5.x | Fast bundling and HMR |
| Styling | TailwindCSS | 3.x | Utility-first CSS with design tokens |
| State | Zustand | 4.x | Lightweight client state management |
| Data Fetching | React Query | 5.x | Server state and caching |
| Cloud DB | Supabase | - | PostgreSQL, Auth, Storage |
| Local DB | SQLite | - | Offline cache via Rust |
| Backend | Rust | 1.7x | CAD parsing, drawing generation |

---

## Directory Structure

```
av_designer/
├── src/                          # Frontend source
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component
│   ├── components/               # Shared components
│   │   ├── ui/                   # Design system primitives
│   │   └── layout/               # Shell, Sidebar, Header
│   ├── features/                 # Feature modules
│   │   ├── equipment/            # Equipment library
│   │   ├── room-builder/         # Room design canvas
│   │   ├── standards/            # Standards engine
│   │   ├── drawings/             # Drawing generation
│   │   └── quoting/              # Quote/BOM system
│   ├── lib/                      # Utilities
│   ├── stores/                   # Global state
│   ├── hooks/                    # Shared hooks
│   ├── types/                    # Global types
│   └── styles/                   # Global CSS
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   ├── commands/             # Tauri IPC commands
│   │   └── database/             # SQLite operations
│   └── Cargo.toml
├── docs/plans/                   # Planning documents
├── scripts/                      # Build scripts
└── tests/                        # Test files
```

---

## Core Modules

### 1. Equipment Library

**Purpose:** Manage AV equipment catalog with specs, pricing, and compatibility.

**Location:** `src/features/equipment/`

**Key Types:**
```typescript
interface Equipment {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  // ... physical, electrical, commercial attributes
}
```

**Status:** Not started

---

### 2. Standards Engine

**Purpose:** Multi-dimensional rule system for design validation.

**Location:** `src/features/standards/`

**Rule Dimensions:**
- Room Type (huddle, conference, boardroom, etc.)
- Platform (Teams, Zoom, Cisco, etc.)
- Hardware Ecosystem (Poly, Logitech, Crestron, etc.)
- Quality Tier (budget, standard, premium, executive)
- Use Case (video conferencing, presentation, etc.)
- Client-Specific overrides

**Status:** Not started

---

### 3. Room Builder

**Purpose:** Visual canvas for designing AV systems in rooms.

**Location:** `src/features/room-builder/`

**Key Features:**
- Import architectural backgrounds (CAD, PDF, images)
- Drag-drop equipment placement
- Signal flow graph for connections
- Real-time validation against standards

**Status:** Not started

---

### 4. Drawing Generation

**Purpose:** Generate documentation packages from room designs.

**Location:** `src/features/drawings/`

**Drawing Types:**
- Electrical line diagrams
- Room elevations
- Reflected ceiling plans (RCP)
- Rack elevations
- Cable schedules
- Floor plans with AV overlay

**Status:** Not started

---

### 5. Quoting System

**Purpose:** Generate BOMs and quotes from room designs.

**Location:** `src/features/quoting/`

**Key Features:**
- Equipment with markup rules
- Cabling calculations
- Labor estimation
- Quote templates
- PDF export

**Status:** Not started

---

## Data Flow

```
User Action (UI)
      │
      ▼
React Component
      │
      ├──► Zustand Store (client state)
      │         │
      │         ▼
      │    Local updates, optimistic UI
      │
      └──► React Query (server state)
                │
                ├──► Supabase Client (cloud data)
                │         │
                │         ▼
                │    PostgreSQL + Storage
                │
                └──► Tauri Command (local processing)
                          │
                          ▼
                     Rust Backend
                          │
                          ▼
                     SQLite (offline cache)
```

---

## Design System

Based on Revolut dark theme with golden accent.

**Colors:**
- Background: `#0D1421` (primary), `#151D2E` (secondary)
- Text: `#FFFFFF` (primary), `#8B95A5` (secondary)
- Accent: `#C9A227` (gold), `#3B82F6` (blue)
- Status: green/yellow/red for success/warning/error

**See:** `docs/plans/2026-01-17-av-designer-ui-design.md`

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Desktop framework | Tauri | Smaller bundle, Rust for heavy processing |
| Database | Supabase | PostgreSQL for complex relations, built-in auth |
| State management | Zustand | Lightweight, no boilerplate |
| Styling | TailwindCSS | Rapid development, design token support |

---

## Update Log

| Date | Change |
|------|--------|
| 2026-01-17 | Initial architecture document created |

---

## Notes for Ralph

When implementing features:

1. **Check this file first** to understand current state
2. **Update this file** after adding new components or changing structure
3. **Reference the specs** in `docs/plans/` for detailed requirements
4. **Follow patterns** in `AGENTS.md` for naming and structure
