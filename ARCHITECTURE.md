# AV Designer - Architecture

**Last Updated:** 2026-01-18
**Status:** Phase 3 Complete - Equipment Database

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

**Phase:** 3 - Equipment Database (Complete)

### Implemented

- [x] Project foundation (Tauri 2.x + React 19 + TypeScript 5)
- [x] Design system with Tailwind CSS v4 @theme tokens
- [x] State management (Zustand with devtools)
- [x] Supabase client with typed database
- [x] Testing setup (Vitest + React Testing Library)
- [x] Linting/formatting (ESLint 9 + Prettier)
- [x] Rust backend structure (commands + database modules)
- [x] Core UI components (Button, Input, Card)
- [x] Layout components (Sidebar, Header, Shell)
- [x] Equipment database (service, hooks, components)
- [ ] Standards engine
- [ ] Room builder
- [ ] Drawing generation
- [ ] Quoting system

### In Progress

- Phase 4: Standards Engine (next)

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
| Data Fetching | React Query | 5.x | Server state, caching, mutations |
| Database Client | Supabase JS | 2.x | Server state, auth, realtime |
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
│   │   ├── ui/                   # Design system primitives
│   │   │   ├── Button.tsx        # Button with variants, sizes, loading
│   │   │   ├── Input.tsx         # Input with label, error, helper
│   │   │   ├── Card.tsx          # Card with header, body, footer slots
│   │   │   └── index.ts          # Component exports
│   │   └── layout/               # Layout components
│   │       ├── Sidebar.tsx       # Navigation sidebar with collapse
│   │       ├── Header.tsx        # Breadcrumbs, search, user menu
│   │       ├── Shell.tsx         # Main app shell layout
│   │       └── index.ts          # Component exports
│   ├── features/                 # Feature modules
│   │   ├── equipment/            # Equipment database feature
│   │   │   ├── equipment-service.ts  # CRUD operations via Supabase
│   │   │   ├── use-equipment.ts      # React Query hooks
│   │   │   ├── components/
│   │   │   │   │   ├── EquipmentCard.tsx     # Equipment catalog card
│   │   │   │   ├── EquipmentList.tsx     # List with filters/search
│   │   │   │   ├── EquipmentForm.tsx     # Create/edit form (composer)
│   │   │   │   ├── EquipmentFormBasicInfo.tsx     # Basic info section
│   │   │   │   ├── EquipmentFormPricing.tsx       # Pricing section
│   │   │   │   ├── EquipmentFormPhysicalSpecs.tsx # Physical specs section
│   │   │   │   ├── EquipmentFormElectrical.tsx    # Electrical section
│   │   │   │   ├── EquipmentFormCertifications.tsx # Certifications section
│   │   │   │   ├── equipment-form-types.ts        # Form types and state
│   │   │   │   └── equipment-form-validation.ts   # Validation logic
│   │   │   └── index.ts              # Public feature exports
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
│   │   ├── index.ts              # Core domain types
│   │   └── equipment.ts          # Equipment types & validation
│   └── styles/                   # Modular CSS
│       ├── globals.css           # Entry point (imports all modules)
│       ├── theme.css             # Tailwind @theme tokens
│       ├── base.css              # HTML element styles
│       ├── components/           # Component styles
│       │   ├── buttons.css
│       │   ├── cards.css
│       │   ├── inputs.css
│       │   └── pills.css
│       ├── layout/               # Layout component styles
│       │   ├── sidebar.css
│       │   ├── header.css
│       │   └── shell.css
│       ├── features/             # Feature-specific styles
│       │   ├── equipment-card.css
│       │   ├── equipment-list.css
│       │   └── equipment-form.css
│       └── utilities.css         # Helper classes
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
│   │   ├── app.test.tsx          # App component tests
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.test.tsx   # Button tests (27 tests)
│   │   │   │   ├── Input.test.tsx    # Input tests (38 tests)
│   │   │   │   └── Card.test.tsx     # Card tests (45 tests)
│   │   │   └── layout/
│   │   │       ├── Sidebar.test.tsx  # Sidebar tests (45 tests)
│   │   │       └── Header.test.tsx   # Header tests (38 tests)
│   │   └── Shell.test.tsx        # Shell tests (35 tests)
│   ├── features/                 # Feature tests
│   │   └── equipment/
│   │       ├── equipment-service.test.ts       # Service tests (18 tests)
│   │       ├── use-equipment.test.tsx          # Hook tests (16 tests)
│   │       └── components/
│   │           ├── EquipmentCard.test.tsx      # Card tests (33 tests)
│   │           ├── EquipmentList.test.tsx      # List tests (38 tests)
│   │           └── EquipmentForm.test.tsx      # Form tests (60 tests)
│   ├── types/
│   │   └── equipment.test.ts     # Equipment type tests (32 tests)
│   └── setup.ts                  # Test setup with jsdom
├── .env.example                  # Environment variable template
├── eslint.config.js              # ESLint 9 flat config
├── .prettierrc                   # Prettier configuration
├── vitest.config.ts              # Vitest configuration
├── vite.config.ts                # Vite configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## Component Library

### UI Components

Located in `src/components/ui/`

| Component | Props | Description |
|-----------|-------|-------------|
| Button | `variant`, `size`, `loading`, `disabled` | Primary action button with 4 variants (primary, secondary, ghost, danger), 3 sizes |
| Input | `label`, `error`, `helperText`, `size`, `required` | Form input with label, error/helper text, 3 sizes |
| Card | `variant`, `padding`, `hoverable`, `selected`, `onClick` | Container with optional header/body/footer slots, 2 variants |
| CardHeader | `title`, `description` | Card header with optional title and description |
| CardBody | - | Card content area |
| CardFooter | - | Card footer for actions |

### Layout Components

Located in `src/components/layout/`

| Component | Props | Description |
|-----------|-------|-------------|
| Shell | `userInitials`, `onSearchClick`, `onUserMenuClick` | Main app layout combining Sidebar + Header + content |
| Sidebar | - | Navigation sidebar with collapse, connected to app-store |
| Header | `userInitials`, `onSearchClick`, `onUserMenuClick` | Breadcrumbs + search + user menu, context-aware |

### Design System Classes

Defined in `src/styles/globals.css`:

- **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`
- **Inputs:** `.input`, `.input-error`, `.input-sm`, `.input-lg`, `.label`, `.input-wrapper`
- **Cards:** `.card`, `.card-elevated`, `.card-hoverable`, `.card-selected`, `.card-header`, `.card-body`, `.card-footer`
- **Layout:** `.shell`, `.sidebar`, `.header`, `.nav-item`, `.nav-item-active`
- **Pills:** `.pill`, `.pill-quoting`, `.pill-review`, `.pill-ordered`, `.pill-progress`, `.pill-hold`

---

## Core Modules

### 1. Equipment Library

**Purpose:** Manage AV equipment catalog with specs, pricing, and compatibility.

**Location:** `src/features/equipment/`

**Key Types:**
```typescript
type EquipmentCategory = 'video' | 'audio' | 'control' | 'infrastructure';

interface Equipment {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  cost: number;
  msrp: number;
  dimensions: { height: number; width: number; depth: number };
  weight: number;
  electrical?: ElectricalSpecs;
  platformCertifications?: string[];
  imageUrl?: string;
  specSheetUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Components:**
| Component | Description |
|-----------|-------------|
| EquipmentCard | Catalog card with image, price, certifications, favorite toggle |
| EquipmentList | Grid with category tabs, search, loading/empty/error states |
| EquipmentForm | Full CRUD form with validation, create/edit modes |

**Hooks (React Query):**
| Hook | Description |
|------|-------------|
| useEquipmentList | Fetch all equipment |
| useEquipmentByCategory | Fetch by category |
| useEquipment | Fetch single by ID |
| useEquipmentSearch | Search with min 2 chars |
| useCreateEquipment | Create mutation with cache invalidation |
| useUpdateEquipment | Update mutation with cache invalidation |
| useDeleteEquipment | Delete mutation with cache invalidation |

**Status:** Complete (197 tests)

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
| 2026-01-18 | Phase 2 complete: Design System & Core Components - Button (27 tests), Input (38 tests), Card (45 tests), Sidebar (45 tests), Header (38 tests), Shell (35 tests) - Total: 234 tests |
| 2026-01-18 | Phase 3 complete: Equipment Database - Types (32 tests), Service (18 tests), Hooks (16 tests), EquipmentCard (33 tests), EquipmentList (38 tests), EquipmentForm (60 tests), App (6 tests) - Total: 431 tests |
| 2026-01-18 | Code review refactoring: Split EquipmentForm (950→291 lines) into 8 modular files; Split globals.css (1343→32 lines) into 12 CSS modules |

---

## Notes for Ralph

When implementing features:

1. **Check this file first** to understand current state
2. **Update this file** after adding new components or changing structure
3. **Reference the specs** in `docs/plans/` for detailed requirements
4. **Follow patterns** in `AGENTS.md` for naming and structure
