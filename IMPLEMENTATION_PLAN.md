# AV Designer MVP - Implementation Plan

> **Source:** Full details in `docs/plans/2026-01-17-av-designer-mvp-implementation.md`
>
> **For Ralph:** Work through tasks in order. Mark `[x]` when complete. Update ARCHITECTURE.md after each phase.

---

## Current Phase: 1 - Project Foundation

---

## Phase 0: Pre-Work Setup

- [x] Create git worktree for MVP development (branch: `feature/mvp-implementation`)
  → Skills: `@superpowers:using-git-worktrees`
  ✅ Completed: Worktree at `.worktrees/mvp` on branch `feature/mvp-implementation`

---

## Phase 1: Project Foundation

### Task 1.1: Initialize Tauri + React Project

- [x] Create project directory structure (`src/`, `src-tauri/`)
- [x] Initialize npm project and install dependencies (react, typescript, vite)
- [x] Install Tauri CLI (`@tauri-apps/cli@latest`)
- [x] Create `vite.config.ts` with Tauri settings
- [x] Create `tsconfig.json` with strict mode and path aliases
- [x] Create `index.html` entry point
- [x] Create `src/main.tsx` React entry
- [x] Create `src/App.tsx` root component
- [x] Run `npm run tauri init` to scaffold Tauri backend
- [x] Verify `npm run tauri dev` launches the app

### Task 1.2: Configure TailwindCSS with Design Tokens

- [ ] Install TailwindCSS, PostCSS, Autoprefixer
- [ ] Create `postcss.config.js`
- [ ] Create `tailwind.config.ts` with Revolut-inspired color tokens
- [ ] Create `src/styles/globals.css` with base styles and component classes
- [ ] Import globals.css in `src/main.tsx`
- [ ] Verify dark theme renders correctly

### Task 1.3: Set Up Project Directory Structure

- [ ] Create frontend directories (`components/ui`, `components/layout`, `features/*`, `lib`, `stores`, `types`, `hooks`)
- [ ] Create backend directories (`src-tauri/src/commands`, `src-tauri/src/database`)
- [ ] Create `src/types/index.ts` with core type definitions
- [ ] Create test directories (`tests/unit`, `tests/integration`)

### Task 1.4: Configure Supabase Client

→ Skills: `@superpowers:test-driven-development`, `@pg:design-postgres-tables`

- [ ] Install `@supabase/supabase-js`
- [ ] Create `.env.example` with Supabase placeholder variables
- [ ] Create `src/lib/supabase.ts` with typed client
- [ ] Create `src/lib/database.types.ts` with initial schema types
- [ ] Update `vite.config.ts` to resolve `@/` path alias
- [ ] Add `.env.local` to `.gitignore`

### Task 1.5: Set Up State Management (Zustand)

- [ ] Install Zustand
- [ ] Create `src/stores/app-store.ts` (sidebar, active mode, current project/room)
- [ ] Create `src/stores/project-store.ts` (projects, rooms, loading state)
- [ ] Create `src/stores/equipment-store.ts` (equipment items, selection)
- [ ] Verify stores work with devtools

### Task 1.6: Configure Testing (Vitest)

- [ ] Install Vitest, Testing Library, jsdom
- [ ] Create `vitest.config.ts`
- [ ] Create sample test to verify setup
- [ ] Add `test` script to `package.json`

### Task 1.7: Set Up ESLint and Prettier

- [ ] Install ESLint with TypeScript and React plugins
- [ ] Install Prettier
- [ ] Create `.eslintrc.cjs` with rules
- [ ] Create `.prettierrc` with configuration
- [ ] Add `lint` and `format` scripts to `package.json`
- [ ] Verify `./scripts/check.sh` runs successfully

### Task 1.8: Initialize Rust Backend Structure

- [ ] Create `src-tauri/src/commands/mod.rs`
- [ ] Create `src-tauri/src/database/mod.rs`
- [ ] Set up basic Tauri command registration in `main.rs`
- [ ] Add `serde` and `serde_json` to Cargo.toml
- [ ] Verify `cargo check` passes

### Phase 1 Completion

→ Skills: `@mega-mapper`, `@superpowers:requesting-code-review`, `@superpowers:verification-before-completion`

- [ ] Run full validation (`./scripts/check.sh --full`)
- [ ] Invoke `@mega-mapper` to document architecture
- [ ] Update ARCHITECTURE.md with implemented structure
- [ ] Invoke `@superpowers:requesting-code-review`
- [ ] Commit with summary of Phase 1 work

---

## Phase 2: Design System & Core Components

**Required Skills for ALL Phase 2 tasks:**
- `@superpowers:test-driven-development` - Write tests first
- `@react-best-practices` - Performance and patterns
- `@web-design-guidelines` - Accessibility and UX
- `@frontend-design:frontend-design` - Visual design

### Task 2.1: Create Button Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [ ] Create `src/components/ui/Button.tsx` with primary/secondary/ghost variants
- [ ] Add disabled, loading states
- [ ] Write tests for Button component

### Task 2.2: Create Input Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [ ] Create `src/components/ui/Input.tsx` with label, error, helper text
- [ ] Add size variants (sm, md, lg)
- [ ] Write tests for Input component

### Task 2.3: Create Card Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [ ] Create `src/components/ui/Card.tsx` with header, body, footer slots
- [ ] Add hover and selected states
- [ ] Write tests for Card component

### Task 2.4: Create Sidebar Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [ ] Create `src/components/layout/Sidebar.tsx` with navigation items
- [ ] Add collapsed/expanded states with icon rail
- [ ] Highlight active item with golden accent
- [ ] Connect to app-store for state

### Task 2.5: Create Header Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [ ] Create `src/components/layout/Header.tsx` with breadcrumbs
- [ ] Add search trigger and user menu
- [ ] Write tests for Header component

### Task 2.6: Create Shell Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [ ] Create `src/components/layout/Shell.tsx` combining Sidebar + Header + main content
- [ ] Handle responsive layout
- [ ] Wire up to App.tsx as root layout

### Task 2.7: Export UI Components

- [ ] Create `src/components/ui/index.ts` with all exports
- [ ] Create `src/components/layout/index.ts` with all exports

### Phase 2 Completion

→ Skills: `@superpowers:requesting-code-review`, `@superpowers:verification-before-completion`

- [ ] Visual review of all components
- [ ] Run full validation
- [ ] Update ARCHITECTURE.md with component structure
- [ ] Invoke `@superpowers:requesting-code-review`
- [ ] Commit Phase 2 work

---

## Phase 3: Equipment Database

*Tasks to be added when Phase 2 is complete*

---

## Phase 4: Standards Engine

*Tasks to be added when Phase 3 is complete*

---

## Phase 5: Room Builder

*Tasks to be added when Phase 4 is complete*

---

## Phase 6: Drawing Generation

*Tasks to be added when Phase 5 is complete*

---

## Phase 7: Quoting & BOM System

*Tasks to be added when Phase 6 is complete*

---

## Phase 8: Integration & MVP Completion

*Tasks to be added when Phase 7 is complete*

---

## Completed Tasks

- **Task 1.1: Initialize Tauri + React Project** (2026-01-17)
  - Created Tauri 2.x + React 19 + TypeScript 5 project
  - Configured Vite with path aliases and Tauri settings
  - Rust backend builds successfully
  - Frontend dev server runs on port 1420

---

## Blocked Tasks

*Move blocked tasks here with reason*

---

## Notes

- Full implementation details: `docs/plans/2026-01-17-av-designer-mvp-implementation.md`
- UI specifications: `docs/plans/2026-01-17-av-designer-ui-design.md`
- Product requirements: `docs/plans/2026-01-17-av-designer-prd.md`
