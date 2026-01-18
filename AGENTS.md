# AV Designer - Technical Patterns & Reference

This document contains technical patterns, build commands, and project structure for the AV Designer application.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Desktop Shell** | Tauri 2.x | Native desktop app, Rust backend |
| **Frontend** | React 18 + TypeScript 5 | UI components and interactions |
| **Build Tool** | Vite | Fast bundling and HMR |
| **Styling** | TailwindCSS | Utility-first CSS with design tokens |
| **State** | Zustand | Lightweight state management |
| **Data Fetching** | React Query | Server state and caching |
| **Cloud DB** | Supabase (PostgreSQL) | Projects, equipment, standards |
| **Local DB** | SQLite | Offline cache |
| **Backend Processing** | Rust | CAD parsing, drawing generation |

---

## Build Commands

### Development

```bash
# Start development server (frontend only)
npm run dev

# Start Tauri development (frontend + Rust backend)
npm run tauri dev

# Run validation
./scripts/check.sh

# Run quick validation (format + typecheck only)
./scripts/check.sh --quick

# Run full validation (strict mode)
./scripts/check.sh --full

# Auto-fix formatting issues
./scripts/check.sh --fix
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/features/equipment/equipment.test.ts

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build frontend only
npm run build

# Build Tauri app for current platform
npm run tauri build

# Build for specific platform
npm run tauri build -- --target universal-apple-darwin  # macOS Universal
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
```

### Rust Backend

```bash
# From src-tauri directory
cd src-tauri

# Check Rust code
cargo check

# Run Rust tests
cargo test

# Format Rust code
cargo fmt

# Lint with Clippy
cargo clippy
```

---

## Project Structure

```
av_designer/
├── src/                          # Frontend source
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component with routing
│   ├── components/               # Shared components
│   │   ├── ui/                   # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   └── layout/               # Layout components
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── Shell.tsx
│   ├── features/                 # Feature modules
│   │   ├── equipment/            # Equipment library
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── room-builder/         # Room design canvas
│   │   ├── standards/            # Standards engine
│   │   ├── drawings/             # Drawing generation
│   │   └── quoting/              # Quote/BOM system
│   ├── lib/                      # Utilities and helpers
│   │   ├── supabase.ts           # Supabase client
│   │   ├── tauri.ts              # Tauri command wrappers
│   │   └── utils.ts              # General utilities
│   ├── stores/                   # Global state
│   │   └── app.ts                # App-level state
│   ├── hooks/                    # Shared hooks
│   ├── types/                    # Global type definitions
│   └── styles/                   # Global styles
│       └── globals.css           # Tailwind imports + base styles
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri entry point
│   │   ├── lib.rs                # Library exports
│   │   ├── commands/             # Tauri commands (IPC)
│   │   │   ├── mod.rs
│   │   │   ├── equipment.rs
│   │   │   └── drawings.rs
│   │   └── database/             # SQLite operations
│   │       ├── mod.rs
│   │       └── models.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── tests/                        # Test files
│   ├── unit/
│   └── integration/
├── docs/                         # Documentation
│   └── plans/                    # Planning documents
├── scripts/                      # Build/dev scripts
│   └── check.sh                  # Validation script
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── loop.sh                       # Ralph Wiggum Loop
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase.tsx | `EquipmentCard.tsx` |
| Hook | camelCase.ts | `useEquipment.ts` |
| Store | camelCase.ts | `equipmentStore.ts` |
| Type | camelCase.ts | `equipment.types.ts` |
| Utility | camelCase.ts | `formatCurrency.ts` |
| Test | *.test.ts | `EquipmentCard.test.tsx` |

### Components

```typescript
// Component file: EquipmentCard.tsx
export function EquipmentCard({ equipment }: EquipmentCardProps) {
  // ...
}

// Types in same file or separate .types.ts
interface EquipmentCardProps {
  equipment: Equipment;
  onSelect?: (id: string) => void;
}
```

### Stores (Zustand)

```typescript
// stores/equipmentStore.ts
import { create } from 'zustand';

interface EquipmentState {
  items: Equipment[];
  selectedId: string | null;
  setSelected: (id: string | null) => void;
  addItem: (item: Equipment) => void;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  items: [],
  selectedId: null,
  setSelected: (id) => set({ selectedId: id }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

### Tauri Commands

```rust
// src-tauri/src/commands/equipment.rs
#[tauri::command]
pub async fn get_equipment_list() -> Result<Vec<Equipment>, String> {
    // ...
}

#[tauri::command]
pub async fn save_equipment(equipment: Equipment) -> Result<(), String> {
    // ...
}
```

```typescript
// Frontend wrapper: lib/tauri.ts
import { invoke } from '@tauri-apps/api/core';

export async function getEquipmentList(): Promise<Equipment[]> {
  return invoke('get_equipment_list');
}
```

---

## Design System Tokens

Reference the full design system in `docs/plans/2026-01-17-av-designer-ui-design.md`.

### Quick Reference

```typescript
// Colors (use Tailwind classes)
bg-bg-primary      // #0D1421 - main background
bg-bg-secondary    // #151D2E - cards, panels
bg-bg-tertiary     // #1C2639 - inputs, hover
text-text-primary  // #FFFFFF - primary text
text-text-secondary // #8B95A5 - secondary text
text-accent-gold   // #C9A227 - active/selected

// Components
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<input className="input" />
<div className="card">Card content</div>
```

---

## Common Patterns

### Feature Module Structure

Each feature in `src/features/` follows this pattern:

```
features/equipment/
├── components/           # Feature-specific components
│   ├── EquipmentList.tsx
│   ├── EquipmentCard.tsx
│   └── EquipmentForm.tsx
├── hooks/                # Feature-specific hooks
│   ├── useEquipment.ts
│   └── useEquipmentSearch.ts
├── stores/               # Feature state (if needed)
│   └── equipmentStore.ts
├── types.ts              # Feature types
├── api.ts                # API calls (Supabase/Tauri)
└── index.ts              # Public exports
```

### Data Flow

```
User Action
    ↓
React Component (UI)
    ↓
Zustand Store (client state) or React Query (server state)
    ↓
Supabase Client (cloud) or Tauri Command (local/processing)
    ↓
Database (PostgreSQL or SQLite)
```

### Validation Before Commit

Always run before committing:

```bash
./scripts/check.sh
```

This runs:
1. Prettier (format)
2. TypeScript (type check)
3. ESLint (lint)
4. Vitest (tests)
5. Rust checks (if applicable)

---

## Common Gotchas

### Tauri IPC

- Commands must be registered in `main.rs` or `lib.rs`
- Use `Result<T, String>` for error handling
- Async commands need `#[tauri::command]` and `async`

### Supabase

- Row Level Security (RLS) is enabled - check policies
- Use typed clients with generated types
- Handle null values from nullable columns

### React Query

- Set appropriate `staleTime` for data that changes rarely
- Use `queryKey` arrays for cache invalidation
- Mutations should invalidate related queries

### TailwindCSS

- Custom colors are in `tailwind.config.ts`
- Use design tokens, not raw colors
- The `card`, `btn-primary`, etc. classes are in `globals.css`

---

## Environment Variables

```bash
# .env.local (not committed)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Accessed in code
import.meta.env.VITE_SUPABASE_URL
```

---

## Debugging

### Frontend

- React DevTools for component inspection
- Zustand DevTools for state
- React Query DevTools for cache state
- Browser Network tab for API calls

### Tauri/Rust

```bash
# Run with debug logging
RUST_LOG=debug npm run tauri dev

# Check Rust panic backtraces
RUST_BACKTRACE=1 npm run tauri dev
```

---

## Quick Reference: Creating a New Feature

1. Create feature directory: `src/features/my-feature/`
2. Add types: `types.ts`
3. Add API layer: `api.ts`
4. Add components: `components/`
5. Add hooks if needed: `hooks/`
6. Export from `index.ts`
7. Add route in `App.tsx` if needed
8. Add sidebar navigation item if needed
