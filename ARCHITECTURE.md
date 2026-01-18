# AV Designer - Architecture

**Last Updated:** 2026-01-17
**Status:** Phase 1 Complete - Project Foundation

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

**Phase:** 1 - Project Foundation (Complete)

### Implemented

- [x] Project foundation (Tauri 2.x + React 19 + TypeScript 5)
- [x] Design system with Tailwind CSS v4 @theme tokens
- [x] State management (Zustand with devtools)
- [x] Supabase client with typed database
- [x] Testing setup (Vitest + React Testing Library)
- [x] Linting/formatting (ESLint 9 + Prettier)
- [x] Rust backend structure (commands + database modules)
- [ ] Core UI components
- [ ] Equipment database
- [ ] Standards engine
- [ ] Room builder
- [ ] Drawing generation
- [ ] Quoting system

### In Progress

- Phase 2: Design System & Core Components

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Desktop Shell | Tauri | 2.9.x | Native desktop app with Rust backend |
| Frontend | React | 19.x | UI components and interactions |
| Language | TypeScript | 5.9.x | Type-safe frontend development (strict mode) |
| Build Tool | Vite | 7.x | Fast bundling and HMR |
| Styling | TailwindCSS | 4.x | Utility-first CSS with @theme tokens |
| State | Zustand | 5.x | Lightweight client state management |
| Data Fetching | Supabase JS | 2.x | Server state, auth, realtime |
| Cloud DB | Supabase | - | PostgreSQL, Auth, Storage |
| Local DB | SQLite | - | Offline cache via Rust (planned) |
| Backend | Rust | 1.8x | CAD parsing, drawing generation |
| Testing | Vitest | 4.x | Unit and integration tests |
| Linting | ESLint | 9.x | Flat config with TypeScript/React plugins |
| Formatting | Prettier | 3.x | Code formatting |

---

## Directory Structure

```
av_designer/
├── src/                          # Frontend source
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component with design system demo
│   ├── components/               # Shared components
│   │   ├── ui/                   # Design system primitives (planned)
│   │   └── layout/               # Shell, Sidebar, Header (planned)
│   ├── features/                 # Feature modules
│   │   ├── equipment/            # Equipment library (planned)
│   │   ├── room-builder/         # Room design canvas (planned)
│   │   ├── standards/            # Standards engine (planned)
│   │   ├── drawings/             # Drawing generation (planned)
│   │   └── quoting/              # Quote/BOM system (planned)
│   ├── lib/                      # Utilities
│   │   ├── supabase.ts           # Supabase client
│   │   └── database.types.ts     # Database type definitions
│   ├── stores/                   # Zustand state stores
│   │   ├── app-store.ts          # App-wide state (mode, sidebar)
│   │   ├── project-store.ts      # Projects and rooms
│   │   └── equipment-store.ts    # Equipment catalog
│   ├── hooks/                    # Shared hooks (planned)
│   ├── types/                    # Global types
│   │   └── index.ts              # Core domain types
│   └── styles/                   # Global CSS
│       └── globals.css           # Tailwind @theme + component classes
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   ├── lib.rs                # App library with command registration
│   │   ├── commands/             # Tauri IPC commands
│   │   │   └── mod.rs            # greet, get_app_info
│   │   └── database/             # SQLite operations
│   │       └── mod.rs            # DatabaseManager (placeholder)
│   └── Cargo.toml
├── docs/plans/                   # Planning documents
├── scripts/                      # Build scripts
│   └── check.sh                  # Validation script (format, lint, test)
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   └── app.test.tsx          # App component tests
│   └── setup.ts                  # Test setup with jsdom
├── .env.example                  # Environment variable template
├── eslint.config.js              # ESLint 9 flat config
├── .prettierrc                   # Prettier configuration
├── vitest.config.ts              # Vitest configuration
├── vite.config.ts                # Vite configuration
└── tsconfig.json                 # TypeScript configuration
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
| 2026-01-17 | Phase 1 complete: Tauri 2.x, React 19, TypeScript 5, TailwindCSS 4, Zustand 5, Supabase client, Vitest, ESLint 9, Prettier, Rust backend modules |

---

## Notes for Ralph

When implementing features:

1. **Check this file first** to understand current state
2. **Update this file** after adding new components or changing structure
3. **Reference the specs** in `docs/plans/` for detailed requirements
4. **Follow patterns** in `AGENTS.md` for naming and structure
