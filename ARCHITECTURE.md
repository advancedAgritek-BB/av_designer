# AV Designer - Architecture

**Last Updated:** 2026-01-22
**Status:** Phase 9 - Full Functionality Implementation

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

**Phase:** 9 In Progress - Full Functionality

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
- [x] Standards engine (types, rule engine, service, hooks, components)
- [x] Room builder (types, service, hooks, canvas, placement, validation)
- [x] Drawing generation (types, service, hooks, canvas, toolbar, page, Rust generators)
- [x] Quoting system (types, service, hooks, BOM generator, pricing engine, components)
- [x] Application router (React Router with lazy loading)
- [x] Page components (all feature pages with routing)
- [x] Supabase database schema (migrations, RLS policies, indexes)
- [x] End-to-end integration tests

### Phase 9 Additions (In Progress)

- [x] Environment validation with clear error messages for missing Supabase config
- [x] Logging utility (`src/lib/logger.ts`) for structured dev/prod logging
- [x] Error boundaries for graceful React error handling
- [x] OAuth authentication (Google and Microsoft via Supabase)
- [x] Auth pages (Login, Signup, OAuth callback)
- [x] Auth routes (/login, /signup, /auth/callback)
- [x] Type-safe database mappers for JSONB columns
- [x] Comprehensive seed data (35 equipment items, standards, rules)

### Remaining Work

- [ ] Templates feature completion (mount types, connections, preview)
- [ ] Equipment import with Excel support
- [ ] Email notification templates and retry logic
- [ ] PDF export implementation
- [ ] Offline mode with SQLite cache

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
│   ├── App.tsx                   # Root component with router integration
│   ├── router.tsx                # Application routes with lazy loading
│   ├── routes.ts                 # Route constants and navigation helpers
│   ├── pages/                    # Page components
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── ProjectsPage.tsx      # Projects list page
│   │   ├── EquipmentPage.tsx     # Equipment catalog page
│   │   ├── AuthCallbackPage.tsx  # OAuth redirect handler
│   │   ├── StandardsPage.tsx     # Standards management page
│   │   ├── RoomDesignPage.tsx    # Room builder page wrapper
│   │   ├── DrawingsPageWrapper.tsx # Drawings page wrapper
│   │   ├── QuotesPage.tsx        # Quotes page wrapper
│   │   ├── TemplatesPage.tsx     # Templates page
│   │   ├── SettingsPage.tsx      # Settings page
│   │   ├── NotFoundPage.tsx      # 404 page
│   │   └── index.ts              # Page exports
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
│   │   ├── standards/            # Standards engine feature
│   │   │   ├── rule-engine.ts        # Rule evaluation with expression parsing
│   │   │   ├── standards-service.ts  # CRUD operations via Supabase
│   │   │   ├── use-standards.ts      # React Query hooks
│   │   │   ├── components/
│   │   │   │   ├── StandardsList.tsx     # Hierarchical tree with aspect tabs
│   │   │   │   └── RuleEditor.tsx        # Rule create/edit form
│   │   │   └── index.ts              # Public feature exports
│   │   ├── room-builder/         # Room design feature
│   │   │   ├── room-service.ts       # CRUD operations via Supabase
│   │   │   ├── use-rooms.ts          # React Query hooks
│   │   │   ├── equipment-placement.ts # Snap, collision, validation logic
│   │   │   ├── components/
│   │   │   │   ├── DesignCanvas.tsx      # Interactive room canvas
│   │   │   │   ├── RoomPropertiesPanel.tsx # Dimensions & config form
│   │   │   │   ├── ValidationPanel.tsx   # Errors/warnings display
│   │   │   │   └── RoomBuilder.tsx       # Main page composer
│   │   │   └── index.ts              # Public feature exports
│   │   ├── drawings/             # Drawing generation feature
│   │   │   ├── drawing-service.ts    # CRUD operations via Supabase
│   │   │   ├── use-drawings.ts       # React Query hooks
│   │   │   ├── components/
│   │   │   │   ├── DrawingCanvas.tsx     # Interactive drawing canvas
│   │   │   │   ├── DrawingToolbar.tsx    # Type selector, layers, export
│   │   │   │   └── DrawingsPage.tsx      # Main page composer
│   │   │   └── index.ts              # Public feature exports
│   │   └── quoting/              # Quote/BOM system
│   │       ├── quote-service.ts      # CRUD operations via Supabase
│   │       ├── use-quotes.ts         # React Query hooks
│   │       ├── bom-generator.ts      # Bill of Materials generation
│   │       ├── pricing-engine.ts     # Margin, markup, labor, tax calculations
│   │       ├── components/
│   │       │   ├── QuoteCard.tsx         # Quote summary card
│   │       │   └── QuotePage.tsx         # Full quote page with editing
│   │       └── index.ts              # Public feature exports
│   │   └── auth/                 # Authentication feature
│   │       ├── auth-service.ts       # Auth operations with OAuth
│   │       ├── use-auth.ts           # Auth hooks (useAuth, useRequireAuth, etc.)
│   │       ├── components/
│   │       │   ├── LoginPage.tsx         # Login with OAuth buttons
│   │       │   ├── SignupPage.tsx        # Signup page
│   │       │   ├── LoginForm.tsx         # Email/password login form
│   │       │   ├── SignupForm.tsx        # Registration form
│   │       │   ├── AuthGuard.tsx         # Route protection component
│   │       │   └── OAuthButtons.tsx      # Google/Microsoft OAuth buttons
│   │       └── index.ts              # Public feature exports
│   ├── lib/                      # Utilities
│   │   ├── supabase.ts           # Supabase client
│   │   ├── supabase-env.ts       # Environment detection utility
│   │   ├── logger.ts             # Structured logging (dev/prod)
│   │   ├── database.types.ts     # Database type definitions
│   │   └── database-mappers.ts   # Type-safe JSON column mappers
│   ├── stores/                   # Zustand state stores
│   │   ├── app-store.ts          # App-wide state (mode, sidebar)
│   │   ├── project-store.ts      # Projects and rooms
│   │   └── equipment-store.ts    # Equipment catalog
│   ├── hooks/                    # Shared hooks (planned)
│   ├── types/                    # Global types
│   │   ├── index.ts              # Core domain types
│   │   ├── equipment.ts          # Equipment types & validation
│   │   ├── standards.ts          # Standards, rules, conditions types
│   │   ├── room.ts               # Room, placement, mount types
│   │   ├── drawing.ts            # Drawing, layer, element types
│   │   ├── quote.ts              # Quote, section, item, totals types
│   │   └── database-json.ts      # Types for database JSONB columns
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
│       │   ├── equipment-form.css
│       │   ├── standards.css
│       │   ├── design-canvas.css
│       │   ├── room-properties-panel.css
│       │   ├── validation-panel.css
│       │   ├── room-builder-page.css
│       │   ├── drawing-canvas.css
│       │   ├── drawing-toolbar.css
│       │   ├── drawings-page.css
│       │   ├── quoting.css       # Quote card and page styles
│       │   └── auth.css          # Auth page styles
│       └── utilities.css         # Helper classes
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   ├── lib.rs                # App library with command registration
│   │   ├── commands/             # Tauri IPC commands
│   │   │   └── mod.rs            # greet, get_app_info
│   │   ├── database/             # SQLite operations
│   │   │   └── mod.rs            # DatabaseManager (placeholder)
│   │   ├── drawings/             # Drawing generation
│   │   │   ├── mod.rs            # Module exports
│   │   │   └── electrical.rs     # Electrical line diagram generator
│   │   └── export/               # Export functionality
│   │       ├── mod.rs            # Module exports
│   │       └── pdf.rs            # PDF export with title blocks
│   └── Cargo.toml
├── supabase/                     # Supabase configuration
│   ├── config.toml               # Supabase project config
│   ├── seed.sql                  # Seed data (35 equipment, standards, rules)
│   └── migrations/               # Database migrations
│       └── 001_initial_schema.sql # Initial schema with all tables
├── docs/plans/                   # Planning documents
├── scripts/                      # Build scripts
│   └── check.sh                  # Validation script (format, lint, test)
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── app.test.tsx          # App component tests
│   │   ├── router.test.tsx       # Router tests (54 tests)
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
│   │   ├── equipment/
│   │   │   ├── equipment-service.test.ts       # Service tests (18 tests)
│   │   │   ├── use-equipment.test.tsx          # Hook tests (16 tests)
│   │   │   └── components/
│   │   │       ├── EquipmentCard.test.tsx      # Card tests (33 tests)
│   │   │       ├── EquipmentList.test.tsx      # List tests (38 tests)
│   │   │       └── EquipmentForm.test.tsx      # Form tests (60 tests)
│   │   ├── standards/
│   │   │   ├── rule-engine.test.ts             # Rule engine tests (55 tests)
│   │   │   ├── standards-service.test.ts       # Service tests (24 tests)
│   │   │   ├── use-standards.test.tsx          # Hook tests (28 tests)
│   │   │   └── components/
│   │   │       ├── StandardsList.test.tsx      # Tree/list tests (37 tests)
│   │   │       └── RuleEditor.test.tsx         # Form tests (36 tests)
│   │   ├── room-builder/
│   │   │   ├── room-service.test.ts            # Service tests (23 tests)
│   │   │   ├── use-rooms.test.tsx              # Hook tests (21 tests)
│   │   │   ├── equipment-placement.test.ts     # Placement tests (39 tests)
│   │   │   └── components/
│   │   │       ├── DesignCanvas.test.tsx       # Canvas tests (43 tests)
│   │   │       ├── RoomPropertiesPanel.test.tsx # Panel tests (35 tests)
│   │   │       ├── ValidationPanel.test.tsx    # Validation tests (41 tests)
│   │   │       └── RoomBuilder.test.tsx        # Page tests (33 tests)
│   │   └── drawings/
│   │       ├── drawing-service.test.ts         # Service tests (27 tests)
│   │       ├── use-drawings.test.tsx           # Hook tests (27 tests)
│   │       └── components/
│   │           ├── DrawingCanvas.test.tsx      # Canvas tests (63 tests)
│   │           ├── DrawingToolbar.test.tsx     # Toolbar tests (49 tests)
│   │           └── DrawingsPage.test.tsx       # Page tests (49 tests)
│   │   └── quoting/
│   │       ├── quote-service.test.ts           # Service tests (25 tests)
│   │       ├── use-quotes.test.tsx             # Hook tests (22 tests)
│   │       ├── bom-generator.test.ts           # BOM generator tests (22 tests)
│   │       ├── pricing-engine.test.ts          # Pricing engine tests (42 tests)
│   │       └── components/
│   │           ├── QuoteCard.test.tsx          # Card tests (44 tests)
│   │           └── QuotePage.test.tsx          # Page tests (44 tests)
│   ├── types/
│   │   ├── equipment.test.ts     # Equipment type tests (32 tests)
│   │   ├── standards.test.ts     # Standards type tests (47 tests)
│   │   ├── room.test.ts          # Room type tests (96 tests)
│   │   ├── drawing.test.ts       # Drawing type tests (105 tests)
│   │   └── quote.test.ts         # Quote type tests (131 tests)
│   ├── e2e/                      # End-to-end integration tests
│   │   ├── setup.tsx             # E2E test utilities
│   │   ├── navigation.test.tsx   # Navigation flow tests
│   │   ├── create-room.test.tsx  # Room creation workflow tests
│   │   └── generate-quote.test.tsx # Quote generation workflow tests
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

**Key Types:**
```typescript
type RuleAspect = 'equipment_selection' | 'quantities' | 'placement' |
                  'configuration' | 'cabling' | 'commercial';
type RuleExpressionType = 'constraint' | 'formula' | 'conditional' |
                          'range_match' | 'pattern';
type ConditionOperator = 'equals' | 'not_equals' | 'contains' |
                         'greater_than' | 'less_than' | 'in';

interface Rule {
  id: string;
  name: string;
  description: string;
  aspect: RuleAspect;
  expressionType: RuleExpressionType;
  conditions: RuleCondition[];
  expression: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StandardNode {
  id: string;
  name: string;
  parentId: string | null;
  type: 'folder' | 'standard';
  order: number;
}
```

**Components:**
| Component | Description |
|-----------|-------------|
| StandardsList | Hierarchical tree with expandable folders, aspect filter tabs, rule display |
| RuleEditor | Form for creating/editing rules with condition builder and expression editor |

**Hooks (React Query):**
| Hook | Description |
|------|-------------|
| useStandardsList | Fetch all standards |
| useStandard | Fetch single by ID |
| useCreateStandard | Create mutation with cache invalidation |
| useUpdateStandard | Update mutation with cache invalidation |
| useDeleteStandard | Delete mutation with cache invalidation |
| useNodesList | Fetch all hierarchy nodes |
| useNode | Fetch single node by ID |
| useNodesByParent | Fetch children of a parent node |
| useCreateNode | Create node mutation |
| useUpdateNode | Update node mutation |
| useDeleteNode | Delete node mutation |
| useRulesList | Fetch all rules |
| useRule | Fetch single rule by ID |
| useRulesByAspect | Fetch rules filtered by aspect |
| useSearchRules | Search rules by name/description |
| useCreateRule | Create rule mutation |
| useUpdateRule | Update rule mutation |
| useDeleteRule | Delete rule mutation |

**Rule Engine:**
| Method | Description |
|--------|-------------|
| evaluateCondition | Evaluate single condition against context |
| evaluateRule | Evaluate rule with all conditions against context |
| evaluateRules | Find matching rules and sort by priority |
| parseExpression | Parse expression string into operations |
| executeExpression | Execute parsed expression with context values |

**Status:** Complete (195 tests)

---

### 3. Room Builder

**Purpose:** Visual canvas for designing AV systems in rooms.

**Location:** `src/features/room-builder/`

**Key Features:**
- Interactive design canvas with zoom controls
- Equipment palette with drag-drop placement
- Snap-to-grid positioning
- Collision detection for equipment
- Mount type constraints (floor, ceiling, wall, rack)
- Real-time validation against standards
- Room dimensions and configuration panel

**Key Types:**
```typescript
type RoomType = 'huddle' | 'conference' | 'boardroom' | 'training' | 'auditorium';
type Platform = 'teams' | 'zoom' | 'webex' | 'meet' | 'multi' | 'none';
type Ecosystem = 'poly' | 'logitech' | 'cisco' | 'crestron' | 'biamp' | 'qsc' | 'mixed';
type Tier = 'budget' | 'standard' | 'premium' | 'executive';
type MountType = 'floor' | 'ceiling' | 'wall' | 'rack';

interface Room {
  id: string;
  projectId: string;
  name: string;
  roomType: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: Tier;
  placedEquipment: PlacedEquipment[];
  createdAt: string;
  updatedAt: string;
}

interface PlacedEquipment {
  id: string;
  equipmentId: string;
  x: number;
  y: number;
  rotation: number;
  mountType: MountType;
}
```

**Components:**
| Component | Description |
|-----------|-------------|
| DesignCanvas | Interactive canvas with equipment rendering, selection, zoom controls |
| RoomPropertiesPanel | Form for dimensions, room type, platform, ecosystem, tier |
| ValidationPanel | Grouped display of errors, warnings, suggestions with dismiss |
| RoomBuilder | Main page composing canvas, panels, and equipment palette |

**Hooks (React Query):**
| Hook | Description |
|------|-------------|
| useRoomsList | Fetch all rooms |
| useRoomsByProject | Fetch rooms by project ID |
| useRoom | Fetch single room by ID |
| useCreateRoom | Create mutation with cache invalidation |
| useUpdateRoom | Update mutation with cache invalidation |
| useDeleteRoom | Delete mutation with cache invalidation |
| useAddPlacedEquipment | Add equipment to room |
| useRemovePlacedEquipment | Remove equipment from room |
| useUpdatePlacedEquipment | Update equipment position/rotation |

**Equipment Placement:**
| Function | Description |
|----------|-------------|
| snapToGrid | Snap coordinates to grid lines |
| detectCollision | Check collision between two equipment items |
| detectCollisions | Check equipment against all existing items |
| isWithinBounds | Verify equipment within room dimensions |
| isValidMountPosition | Validate mount type constraints |
| normalizeRotation | Normalize angle to 0-359 range |
| rotateBy | Rotate with snap increment |
| alignToWall | Align position to nearest/specified wall |
| calculatePlacementPosition | Calculate final snapped position |
| validatePlacement | Full placement validation with errors |

**Status:** Complete (235 tests)

---

### 4. Drawing Generation

**Purpose:** Generate documentation packages from room designs.

**Location:** `src/features/drawings/`

**Key Features:**
- Interactive drawing canvas with zoom, pan, selection
- Layer-based rendering with visibility controls
- Multiple drawing types (electrical, elevation, RCP, rack, cable schedule, floor plan)
- Element positioning and drag-drop editing
- PDF export via Rust backend
- Print support

**Key Types:**
```typescript
type DrawingType = 'electrical' | 'elevation' | 'rcp' | 'rack' | 'cable_schedule' | 'floor_plan';
type LayerType = 'title_block' | 'architectural' | 'av_elements' | 'annotations' | 'dimensions';
type ElementType = 'equipment' | 'cable' | 'text' | 'dimension' | 'symbol';

interface Drawing {
  id: string;
  roomId: string;
  type: DrawingType;
  layers: DrawingLayer[];
  overrides: DrawingOverride[];
  generatedAt: string;
}

interface DrawingLayer {
  id: string;
  name: string;
  type: LayerType;
  isLocked: boolean;
  isVisible: boolean;
  elements: DrawingElement[];
}

interface DrawingElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, unknown>;
}
```

**Components:**
| Component | Description |
|-----------|-------------|
| DrawingCanvas | Interactive canvas with layer rendering, zoom, pan, element selection |
| DrawingToolbar | Type selector, layer visibility toggles, export/print buttons |
| DrawingsPage | Main page composing canvas, toolbar, drawing list, properties panel |

**Hooks (React Query):**
| Hook | Description |
|------|-------------|
| useDrawingsList | Fetch all drawings |
| useDrawingsByRoom | Fetch drawings by room ID |
| useDrawingsByType | Fetch drawings by type |
| useDrawing | Fetch single drawing by ID |
| useCreateDrawing | Create mutation with cache invalidation |
| useUpdateDrawing | Update mutation with cache invalidation |
| useDeleteDrawing | Delete mutation with cache invalidation |

**Rust Backend:**
| Module | Description |
|--------|-------------|
| drawings/electrical.rs | Electrical line diagram generation with signal flow analysis |
| export/pdf.rs | PDF export with title blocks and page layouts |

**Status:** Complete (320 tests)

---

### 5. Quoting System

**Purpose:** Generate BOMs and quotes from room designs with pricing, labor, and tax calculations.

**Location:** `src/features/quoting/`

**Key Features:**
- BOM generation from room's placed equipment
- Quantity aggregation for duplicate items
- Category-based grouping
- Margin and markup calculations
- Labor estimation based on equipment category
- Tax calculation
- Quote status workflow (draft → client_review → approved → ordered)
- Inline editing for quantities and margins
- Export and print functionality

**Key Types:**
```typescript
type QuoteStatus = 'draft' | 'quoting' | 'client_review' | 'approved' | 'ordered';
type ItemStatus = 'quoting' | 'client_review' | 'ordered' | 'delivered' | 'installed';

interface Quote {
  id: string;
  projectId: string;
  roomId: string;
  version: number;
  status: QuoteStatus;
  sections: QuoteSection[];
  totals: QuoteTotals;
  createdAt: string;
  updatedAt: string;
}

interface QuoteSection {
  id: string;
  name: string;
  category: string;
  items: QuoteItem[];
  subtotal: number;
}

interface QuoteItem {
  id: string;
  equipmentId: string;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  extendedCost: number;
  extendedPrice: number;
  margin: number;
  marginPercentage: number;
  status: ItemStatus;
  notes?: string;
}

interface QuoteTotals {
  equipment: number;
  labor: number;
  subtotal: number;
  tax: number;
  total: number;
  margin: number;
  marginPercentage: number;
}
```

**Components:**
| Component | Description |
|-----------|-------------|
| QuoteCard | Summary card with status pill, totals, margin, action buttons |
| QuotePage | Full page with sections, inline editing, totals, status workflow |

**Hooks (React Query):**
| Hook | Description |
|------|-------------|
| useQuotesList | Fetch all quotes |
| useQuotesByProject | Fetch quotes by project ID |
| useQuotesByRoom | Fetch quotes by room ID |
| useQuote | Fetch single quote by ID |
| useCreateQuote | Create mutation with cache invalidation |
| useUpdateQuote | Update mutation with cache invalidation |
| useDeleteQuote | Delete mutation with cache invalidation |

**BOM Generator:**
| Function | Description |
|----------|-------------|
| generateBOM | Generate BOM from placed equipment with totals |
| aggregateDuplicates | Combine duplicate equipment by ID |
| groupByCategory | Group BOM items by equipment category |
| createBOMItem | Create BOM item from equipment and quantity |

**Pricing Engine:**
| Function | Description |
|----------|-------------|
| calculateMargin | Calculate margin from cost and price |
| calculateMarkup | Calculate markup from cost and price |
| applyMarginPercentage | Apply margin % to get price from cost |
| applyMarkupPercentage | Apply markup % to get price from cost |
| calculateLabor | Calculate labor cost from equipment with category-based rates |
| calculateTax | Calculate tax from subtotal with exemptions |
| calculateQuoteTotals | Calculate complete quote totals |

**Status:** Complete (330 tests)

---

### 6. Application Routing

**Purpose:** Client-side routing with lazy loading and mode synchronization.

**Location:** `src/router.tsx`, `src/routes.ts`, `src/pages/`

**Key Features:**
- React Router v6 with BrowserRouter
- Lazy-loaded page components for code splitting
- Route constants and path builders
- Mode-to-route bidirectional mapping
- 404 handling with NotFoundPage
- Route guards (prepared for future auth)

**Route Structure:**
```typescript
const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  ROOM_DESIGN: '/rooms/:roomId/design',
  DRAWINGS: '/rooms/:roomId/drawings',
  QUOTING: '/rooms/:roomId/quotes',
  STANDARDS: '/standards',
  EQUIPMENT: '/equipment',
  TEMPLATES: '/templates',
  SETTINGS: '/settings',
};
```

**Navigation Helpers:**
| Function | Description |
|----------|-------------|
| getRouteByMode | Get route path for an AppMode |
| getModeByPath | Get AppMode for a given path |
| isValidRoute | Check if a path is a valid route |
| buildRoomDesignPath | Build design path with roomId |
| buildDrawingsPath | Build drawings path with roomId |
| buildQuotesPath | Build quotes path with roomId |

**Page Components:**
| Page | Route | Description |
|------|-------|-------------|
| HomePage | / | Landing page with dashboard |
| ProjectsPage | /projects | Project list and management |
| EquipmentPage | /equipment | Equipment catalog |
| StandardsPage | /standards | Standards management |
| RoomDesignPage | /rooms/:roomId/design | Room builder |
| DrawingsPageWrapper | /rooms/:roomId/drawings | Drawing generation |
| QuotesPage | /rooms/:roomId/quotes | Quoting system |
| TemplatesPage | /templates | Template library |
| SettingsPage | /settings | Application settings |
| NotFoundPage | * | 404 error page |

**Status:** Complete (54 router tests + E2E tests)

---

### 7. Authentication

**Purpose:** User authentication with email/password and OAuth providers.

**Location:** `src/features/auth/`

**Key Features:**
- Email/password authentication via Supabase Auth
- OAuth authentication (Google, Microsoft)
- Session management with automatic refresh
- Protected routes via AuthGuard
- Environment-aware error messages (local vs production)

**Key Types:**
```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type OAuthProvider = 'google' | 'azure';
```

**Components:**
| Component | Description |
|-----------|-------------|
| LoginPage | Login page with OAuth buttons and email form |
| SignupPage | Registration page with email form |
| LoginForm | Email/password login form |
| SignupForm | Registration form with validation |
| OAuthButtons | Google and Microsoft OAuth buttons |
| AuthGuard | Route protection component |

**Hooks:**
| Hook | Description |
|------|-------------|
| useAuth | Main auth hook with login, logout, signup |
| useRequireAuth | Returns requireAuth flag for protected routes |
| useCurrentUser | Access current user |
| useCurrentOrg | Access current organization |
| useCurrentTeam | Access current team |
| useAuthError | Access auth error state |

**Auth Service:**
| Method | Description |
|--------|-------------|
| signInWithEmail | Email/password login |
| signUpWithEmail | Email registration |
| signInWithOAuth | OAuth login (Google, Microsoft) |
| signOut | Logout and clear session |
| getSession | Get current session |
| onAuthStateChange | Subscribe to auth changes |

**Status:** Complete (auth tests in feature tests)

---

### 8. Database Schema

**Purpose:** PostgreSQL database with Supabase for cloud data storage.

**Location:** `supabase/migrations/001_initial_schema.sql`

**Tables:**
| Table | Description |
|-------|-------------|
| users | User profiles (linked to Supabase Auth) |
| clients | Client/customer records |
| projects | AV design projects |
| equipment | Equipment catalog with specs |
| rooms | Room designs with placement data |
| room_equipment | Junction table for equipment placement |
| standard_nodes | Hierarchical standards structure |
| standards | Standards with rules |
| rules | Validation rules for designs |
| quotes | Generated quotes |
| drawings | Drawing metadata |

**Key Features:**
- UUID primary keys with uuid-ossp extension
- Custom enums for categories, statuses, types
- JSONB columns for flexible data (dimensions, electrical, placement)
- Row Level Security (RLS) for all tables
- Automatic updated_at triggers
- Full-text search index on equipment
- Comprehensive indexes for common queries

**RLS Policies:**
- Users can only access their own projects
- Room access inherited from project ownership
- Equipment viewable by all authenticated users
- Standards/rules viewable by all, editable by admins

**Status:** Complete (schema ready for deployment)

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
| 2026-01-18 | Phase 4 complete: Standards Engine - Types (24 tests), Rule Engine (44 tests), Service (26 tests), Hooks (28 tests), StandardsList (37 tests), RuleEditor (36 tests) - Total: 626 tests |
| 2026-01-18 | Phase 5 complete: Room Builder - Types (96 tests), Service (23 tests), Hooks (21 tests), Placement (39 tests), DesignCanvas (43 tests), RoomPropertiesPanel (35 tests), ValidationPanel (41 tests), RoomBuilder (33 tests) - Total: 989 tests |
| 2026-01-18 | Phase 6 complete: Drawing Generation - Types (105 tests), Service (27 tests), Hooks (27 tests), DrawingCanvas (63 tests), DrawingToolbar (49 tests), DrawingsPage (49 tests), Rust electrical/PDF modules - Total: 1309 tests |
| 2026-01-18 | Phase 7 complete: Quoting System - Types (131 tests), Service (25 tests), Hooks (22 tests), BOM Generator (22 tests), Pricing Engine (42 tests), QuoteCard (44 tests), QuotePage (44 tests) - Total: 1639 tests |
| 2026-01-18 | Phase 8 complete: Integration & MVP - Router (54 tests), Pages (11 components), Supabase schema (12 tables with RLS), E2E tests (3 test suites) - Total: 1742 tests - MVP Ready |
| 2026-01-22 | Phase 9 in progress: Full Functionality - OAuth auth (Google/Microsoft), auth pages (login, signup, callback), environment validation, logging utility, error boundaries, database mappers, seed data (35 equipment items, standards, rules) - Total: 1748 tests |

---

## Notes for Ralph

When implementing features:

1. **Check this file first** to understand current state
2. **Update this file** after adding new components or changing structure
3. **Reference the specs** in `docs/plans/` for detailed requirements
4. **Follow patterns** in `AGENTS.md` for naming and structure
