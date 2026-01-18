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

- [x] Install TailwindCSS, PostCSS, Autoprefixer
- [x] Create `postcss.config.js`
- [x] Create `src/styles/globals.css` with Tailwind v4 @theme config and component classes
- [x] Import globals.css in `src/main.tsx`
- [x] Verify dark theme renders correctly

### Task 1.3: Set Up Project Directory Structure

- [x] Create frontend directories (`components/ui`, `components/layout`, `features/*`, `lib`, `stores`, `types`, `hooks`)
- [x] Create backend directories (`src-tauri/src/commands`, `src-tauri/src/database`)
- [x] Create `src/types/index.ts` with core type definitions
- [x] Create test directories (`tests/unit`, `tests/integration`)

### Task 1.4: Configure Supabase Client

→ Skills: `@superpowers:test-driven-development`, `@pg:design-postgres-tables`

- [x] Install `@supabase/supabase-js`
- [x] Create `.env.example` with Supabase placeholder variables
- [x] Create `src/lib/supabase.ts` with typed client
- [x] Create `src/lib/database.types.ts` with initial schema types
- [x] Verify `vite.config.ts` resolves `@/` path alias (already configured)
- [x] Verify `.env.local` in `.gitignore` (already configured)

### Task 1.5: Set Up State Management (Zustand)

- [x] Install Zustand
- [x] Create `src/stores/app-store.ts` (sidebar, active mode, current project/room)
- [x] Create `src/stores/project-store.ts` (projects, rooms, loading state)
- [x] Create `src/stores/equipment-store.ts` (equipment items, selection)
- [x] Verify stores work with devtools

### Task 1.6: Configure Testing (Vitest)

- [x] Install Vitest, Testing Library, jsdom
- [x] Create `vitest.config.ts`
- [x] Create sample test to verify setup
- [x] Add `test` script to `package.json`

### Task 1.7: Set Up ESLint and Prettier

- [x] Install ESLint with TypeScript and React plugins
- [x] Install Prettier
- [x] Create `eslint.config.js` with flat config (ESLint 9)
- [x] Create `.prettierrc` with configuration
- [x] Add `lint` and `format` scripts to `package.json`
- [x] Verify `./scripts/check.sh` runs successfully

### Task 1.8: Initialize Rust Backend Structure

- [x] Create `src-tauri/src/commands/mod.rs`
- [x] Create `src-tauri/src/database/mod.rs`
- [x] Set up basic Tauri command registration in `lib.rs`
- [x] Add `serde` and `serde_json` to Cargo.toml
- [x] Verify `cargo check` and `cargo test` pass

### Phase 1 Completion

→ Skills: `@mega-mapper`, `@superpowers:requesting-code-review`, `@superpowers:verification-before-completion`

- [x] Run full validation (`./scripts/check.sh --full`)
- [x] Update ARCHITECTURE.md with implemented structure
- [x] Invoke `@superpowers:requesting-code-review`
- [x] Commit with summary of Phase 1 work

**Code Review Summary (2026-01-17):**
- Assessment: Ready to merge ✅
- Strengths: Excellent structure, comprehensive types, solid stores, proper tooling
- Important items for Phase 2: Add `isSupabaseConfigured` export, type transformation layer, store tests
- All validation checks pass

---

## Phase 2: Design System & Core Components

**Required Skills for ALL Phase 2 tasks:**
- `@superpowers:test-driven-development` - Write tests first
- `@react-best-practices` - Performance and patterns
- `@web-design-guidelines` - Accessibility and UX
- `@frontend-design:frontend-design` - Visual design

### Task 2.1: Create Button Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [x] Create `src/components/ui/Button.tsx` with primary/secondary/ghost variants
- [x] Add disabled, loading states
- [x] Write tests for Button component

### Task 2.2: Create Input Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [x] Create `src/components/ui/Input.tsx` with label, error, helper text
- [x] Add size variants (sm, md, lg)
- [x] Write tests for Input component

### Task 2.3: Create Card Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [x] Create `src/components/ui/Card.tsx` with header, body, footer slots
- [x] Add hover and selected states
- [x] Write tests for Card component

### Task 2.4: Create Sidebar Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [x] Create `src/components/layout/Sidebar.tsx` with navigation items
- [x] Add collapsed/expanded states with icon rail
- [x] Highlight active item with golden accent
- [x] Connect to app-store for state

### Task 2.5: Create Header Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@web-design-guidelines`, `@frontend-design:frontend-design`

- [x] Create `src/components/layout/Header.tsx` with breadcrumbs
- [x] Add search trigger and user menu
- [x] Write tests for Header component

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

- **Task 1.2: Configure TailwindCSS with Design Tokens** (2026-01-17)
  - Tailwind CSS v4 with @theme configuration
  - Revolut-inspired dark theme color palette
  - Component utility classes (card, btn, input, pill)
  - Design system fully functional

- **Task 1.3: Set Up Project Directory Structure** (2026-01-17)
  - Frontend directories: components, features, lib, stores, types, hooks
  - Backend directories: commands, database
  - Core type definitions with all domain models
  - Test directories ready

- **Task 1.4: Configure Supabase Client** (2026-01-17)
  - Supabase JS client with typed database
  - Environment variable configuration
  - Database types for all core tables
  - Vite client types added to tsconfig

- **Task 1.5: Set Up State Management (Zustand)** (2026-01-17)
  - App store: mode, sidebar, project/room context
  - Project store: projects, rooms with CRUD actions
  - Equipment store: catalog, favorites, filters
  - Redux DevTools integration enabled

- **Task 1.6: Configure Testing (Vitest)** (2026-01-17)
  - Vitest with React Testing Library
  - jsdom environment for component tests
  - Initial App component tests passing
  - npm test scripts configured

- **Task 1.7: Set Up ESLint and Prettier** (2026-01-17)
  - ESLint 9 with flat config
  - TypeScript and React plugins
  - Prettier for code formatting
  - scripts/check.sh passes all validations

- **Task 1.8: Initialize Rust Backend Structure** (2026-01-17)
  - Created commands module with greet and get_app_info commands
  - Created database module with DatabaseManager placeholder
  - Registered Tauri commands in lib.rs
  - serde/serde_json already present in Cargo.toml
  - cargo check and cargo test both pass (4 tests)

- **Task 2.1: Create Button Component** (2026-01-18)
  - TDD approach: wrote 27 tests first, watched them fail, then implemented
  - Button variants: primary, secondary, ghost, danger
  - States: disabled (with aria-disabled), loading (with spinner and aria-busy)
  - Sizes: sm, md (default), lg
  - Uses forwardRef for proper ref forwarding
  - Exports via src/components/ui/index.ts

- **Task 2.2: Create Input Component** (2026-01-18)
  - TDD approach: wrote 38 tests first, watched them fail, then implemented
  - Features: label, error message, helper text, required indicator
  - Sizes: sm, md (default), lg
  - States: disabled, error (with aria-invalid), required
  - Accessibility: aria-describedby for error/helper, label association via htmlFor
  - Uses forwardRef for proper ref forwarding
  - Exports via src/components/ui/index.ts

- **Task 2.3: Create Card Component** (2026-01-18)
  - TDD approach: wrote 45 tests first, watched them fail, then implemented
  - Components: Card, CardHeader, CardBody, CardFooter (slot pattern)
  - Variants: default, elevated
  - States: hoverable, selected (with aria-selected), interactive (with keyboard support)
  - Padding options: none, sm, md (default), lg
  - Features: title/description props on CardHeader, keyboard activation (Enter/Space)
  - Accessibility: role="button" and tabIndex for interactive cards
  - Exports via src/components/ui/index.ts

- **Task 2.4: Create Sidebar Component** (2026-01-18)
  - TDD approach: wrote 45 tests first, watched them fail, then implemented
  - Features: navigation items for all app modes, branding, section headings
  - States: expanded (220px) and collapsed (64px icon rail)
  - Active highlighting: golden accent background and text color
  - Sections: Main (Home, Projects, Room Design, Drawings, Quoting, Standards), Libraries (Equipment, Templates), Settings
  - Toggle button to collapse/expand with keyboard support
  - Accessibility: aria-label on nav, aria-current on active item, aria-hidden on icons
  - Connected to app-store for currentMode, sidebarExpanded, setMode, toggleSidebar
  - Custom Lucide-style SVG icons (20px, 1.5px stroke)

- **Task 2.5: Create Header Component** (2026-01-18)
  - TDD approach: wrote 38 tests first, watched them fail, then implemented
  - Features: breadcrumb navigation, search trigger, user menu
  - Breadcrumbs: mode title with optional project/room context path
  - Search button: icon with keyboard shortcut hint (Cmd+K)
  - User menu: avatar with initials display
  - Callbacks: onSearchClick, onUserMenuClick for parent component integration
  - Accessibility: aria-label on navigation, aria-current on current breadcrumb item
  - CSS styles added to globals.css for all header elements
  - Exports via src/components/layout/index.ts

---

## Blocked Tasks

*Move blocked tasks here with reason*

---

## Notes

- Full implementation details: `docs/plans/2026-01-17-av-designer-mvp-implementation.md`
- UI specifications: `docs/plans/2026-01-17-av-designer-ui-design.md`
- Product requirements: `docs/plans/2026-01-17-av-designer-prd.md`
