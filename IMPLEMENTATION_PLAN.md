# AV Designer MVP - Implementation Plan

> **Source:** Full details in `docs/plans/2026-01-17-av-designer-mvp-implementation.md`
>
> **For Ralph:** Work through tasks in order. Mark `[x]` when complete. Update ARCHITECTURE.md after each phase.

---

## Current Phase: 4 - Standards Engine

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

- [x] Create `src/components/layout/Shell.tsx` combining Sidebar + Header + main content
- [x] Handle responsive layout
- [x] Wire up to App.tsx as root layout

### Task 2.7: Export UI Components

- [x] Create `src/components/ui/index.ts` with all exports
- [x] Create `src/components/layout/index.ts` with all exports

### Phase 2 Completion

→ Skills: `@superpowers:requesting-code-review`, `@superpowers:verification-before-completion`

- [x] Visual review of all components
- [x] Run full validation
- [x] Update ARCHITECTURE.md with component structure
- [x] Invoke `@superpowers:requesting-code-review`
- [x] Commit Phase 2 work

**Code Review Summary (2026-01-18):**
- Assessment: Ready to merge ✅
- Strengths: Excellent TDD (234 tests), strong accessibility, clean architecture, proper store integration
- Important items for future: Split globals.css (768 lines), extract Sidebar icons (367 lines), export prop types
- All validation checks pass

---

## Phase 3: Equipment Database

**Required Skills for ALL Phase 3 tasks:**
- `@superpowers:test-driven-development` - Write tests first
- `@react-best-practices` - Performance and patterns
- `@frontend-design:frontend-design` - Programa-inspired visual catalog style

### Task 3.1: Create Equipment Type Definitions

→ Skills: `@superpowers:test-driven-development`

- [x] Create `src/types/equipment.ts` with Equipment interfaces
- [x] Add EQUIPMENT_CATEGORIES and EQUIPMENT_SUBCATEGORIES constants
- [x] Create isValidEquipment validation function
- [x] Write tests in `tests/types/equipment.test.ts`

### Task 3.2: Create Equipment Service Layer

→ Skills: `@superpowers:test-driven-development`

- [x] Create `src/features/equipment/equipment-service.ts`
- [x] Implement CRUD operations (getAll, getById, create, update, delete)
- [x] Implement getByCategory and search methods
- [x] Add row mapping from snake_case to camelCase
- [x] Write tests in `tests/features/equipment/equipment-service.test.ts`

### Task 3.3: Create Equipment React Query Hooks

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`

- [x] Install `@tanstack/react-query`
- [x] Create `src/features/equipment/use-equipment.ts`
- [x] Implement useEquipmentList, useEquipmentByCategory, useEquipment hooks
- [x] Implement useEquipmentSearch with minimum query length
- [x] Implement mutations with cache invalidation
- [x] Write tests in `tests/features/equipment/use-equipment.test.tsx`

### Task 3.4: Create Equipment Card Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@frontend-design:frontend-design`

- [x] Create `src/features/equipment/components/EquipmentCard.tsx`
- [x] Display manufacturer, model, price, certifications
- [x] Add selected state with golden accent
- [x] Add favorite toggle button
- [x] Write tests in `tests/features/equipment/components/EquipmentCard.test.tsx`

### Task 3.5: Create Equipment List Page

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@frontend-design:frontend-design`

- [x] Create `src/features/equipment/components/EquipmentList.tsx`
- [x] Add category filtering tabs
- [x] Add search input
- [x] Display equipment in responsive grid
- [x] Show loading and empty states
- [x] Write tests in `tests/features/equipment/components/EquipmentList.test.tsx`

### Task 3.6: Create Equipment Form Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`

- [x] Create `src/features/equipment/components/EquipmentForm.tsx`
- [x] Add all equipment fields with validation
- [x] Support create and edit modes
- [x] Handle form submission with React Query mutations
- [x] Write tests in `tests/features/equipment/components/EquipmentForm.test.tsx`

### Task 3.7: Export Equipment Feature

- [x] Create `src/features/equipment/index.ts` with all exports
- [x] Wire Equipment page to App.tsx routing
- [x] Connect to sidebar navigation

### Phase 3 Completion

→ Skills: `@superpowers:requesting-code-review`, `@superpowers:verification-before-completion`

- [x] Visual review of all components
- [x] Run full validation (`./scripts/check.sh --full`)
- [x] Update ARCHITECTURE.md with equipment feature structure
- [x] Invoke `@superpowers:requesting-code-review`
- [x] Commit Phase 3 work

**Code Review Summary (2026-01-18):**
- Assessment: Ready to merge ✅
- Critical issues addressed:
  - EquipmentForm.tsx (950 lines) split into 8 modular files (largest: 291 lines)
  - globals.css (1343 lines) split into 12 CSS modules (largest: 266 lines)
- Strengths: Comprehensive TDD (431 tests), robust form validation, clean component composition
- Important items for future: Add prop type exports, search debouncing, SQL escaping review
- All validation checks pass

---

## Phase 4: Standards Engine

**Required Skills for ALL Phase 4 tasks:**
- `@superpowers:test-driven-development` - Write tests first
- `@react-best-practices` - Performance and patterns (for UI components)

### Task 4.1: Create Standards Type Definitions

→ Skills: `@superpowers:test-driven-development`

- [x] Create `src/types/standards.ts` with Standards interfaces
- [x] Add RULE_DIMENSIONS, RULE_EXPRESSION_TYPES, RULE_ASPECTS constants
- [x] Add DIMENSION_PRIORITY for conflict resolution
- [x] Create Rule, RuleCondition, Standard, ValidationResult interfaces
- [x] Write tests in `tests/types/standards.test.ts`

### Task 4.2: Create Rule Evaluation Engine

→ Skills: `@superpowers:test-driven-development`

- [x] Create `src/features/standards/rule-engine.ts`
- [x] Implement evaluateCondition method (equals, not_equals, contains, greater_than, less_than, in)
- [x] Implement evaluateRule method with condition matching
- [x] Implement evaluateExpression for simple constraint parsing
- [x] Implement validateDesign with severity levels
- [x] Write tests in `tests/features/standards/rule-engine.test.ts`

### Task 4.3: Create Standards Service Layer

→ Skills: `@superpowers:test-driven-development`

- [x] Create `src/features/standards/standards-service.ts`
- [x] Implement CRUD operations for standards, nodes, and rules
- [x] Implement getNodesByParent, getRulesByAspect, searchRules methods
- [x] Add row mapping from snake_case to camelCase
- [x] Write tests in `tests/features/standards/standards-service.test.ts`

### Task 4.4: Create Standards React Query Hooks

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`

- [x] Create `src/features/standards/use-standards.ts`
- [x] Implement useStandardsList, useStandard hooks
- [x] Implement useNodesList, useNodesByParent hooks
- [x] Implement useRulesList, useRulesByAspect, useRulesSearch hooks
- [x] Implement mutations with cache invalidation
- [x] Write tests in `tests/features/standards/use-standards.test.tsx`

### Task 4.5: Create Standards List Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@frontend-design:frontend-design`

- [x] Create `src/features/standards/components/StandardsList.tsx`
- [x] Display hierarchical standards tree with expand/collapse
- [x] Add filtering by aspect (equipment, quantities, placement, etc.)
- [x] Show loading, empty, and error states
- [x] Write tests in `tests/features/standards/components/StandardsList.test.tsx`

### Task 4.6: Create Rule Editor Component

→ Skills: `@superpowers:test-driven-development`, `@react-best-practices`, `@frontend-design:frontend-design`

- [x] Create `src/features/standards/components/RuleEditor.tsx`
- [x] Add condition builder UI with dimension, operator, value fields
- [x] Add expression editor textarea
- [x] Support create and edit modes with pre-population
- [x] Add form validation with error messages
- [x] Write tests in `tests/features/standards/components/RuleEditor.test.tsx`

### Task 4.7: Export Standards Feature

- [ ] Create `src/features/standards/index.ts` with all exports
- [ ] Wire Standards page to App.tsx routing
- [ ] Connect to sidebar navigation

### Phase 4 Completion

→ Skills: `@superpowers:requesting-code-review`, `@superpowers:verification-before-completion`

- [ ] Visual review of all components
- [ ] Run full validation (`./scripts/check.sh --full`)
- [ ] Update ARCHITECTURE.md with standards feature structure
- [ ] Invoke `@superpowers:requesting-code-review`
- [ ] Commit Phase 4 work

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

- **Task 2.6: Create Shell Component** (2026-01-18)
  - TDD approach: wrote 35 tests first, watched them fail, then implemented
  - Features: combines Sidebar + Header + main content area
  - Layout: flex container with sidebar on left, main wrapper on right
  - Main wrapper: contains header and scrollable content area
  - Props: children, className, userInitials, onSearchClick, onUserMenuClick
  - Accessibility: skip link to main content, proper ARIA roles (banner, navigation, main)
  - CSS styles: shell, shell-main-wrapper, shell-content, shell-skip-link
  - Data attribute for sidebar expanded state to support layout transitions
  - Wired up to App.tsx as root layout with design system demo content
  - Exports via src/components/layout/index.ts

- **Task 2.7: Export UI Components** (2026-01-18)
  - src/components/ui/index.ts exports: Button, Input, Card, CardHeader, CardBody, CardFooter
  - src/components/layout/index.ts exports: Sidebar, Header, Shell

- **Task 3.5: Create Equipment List Page** (2026-01-18)
  - TDD approach: wrote 38 tests first, watched them fail, then implemented
  - Features: category filtering tabs (All, Video, Audio, Control, Infrastructure)
  - Search input with debounced query and clear button
  - Responsive grid layout for equipment cards
  - States: loading (with skeleton animation), empty, error (with retry)
  - Props: selectedId, favoriteIds, onSelect, onFavoriteToggle
  - Accessibility: proper ARIA roles, keyboard navigation for tabs
  - CSS: shimmer loading animation, focus states, golden accent for active tab
  - Exports via src/features/equipment/components/EquipmentList.tsx

- **Task 3.6: Create Equipment Form Component** (2026-01-18)
  - TDD approach: wrote 60 tests first, watched them fail, then implemented
  - Features: full CRUD form for equipment with create/edit modes
  - Sections: Basic Information, Pricing, Physical Specifications, Electrical (collapsible), Certifications
  - Validation: required fields (manufacturer, model, SKU, category, subcategory), positive number checks
  - Category/subcategory relationship: dynamic subcategory options based on selected category
  - Electrical specs: optional collapsible section for voltage, wattage, amperage, PoE class, BTU
  - Platform certifications: comma-separated input parsed into array
  - Props: mode (create/edit), equipment, onSubmit, onCancel, isLoading
  - Accessibility: form labels, error associations, fieldset grouping, focus management on validation errors
  - Uses key prop pattern for form reset between modes (documented in component)
  - CSS: responsive grid layout, section styling, collapse button styles

- **Task 3.7: Export Equipment Feature** (2026-01-18)
  - Created `src/features/equipment/index.ts` with all feature exports
  - Exports: EquipmentService, equipmentService, all hooks, all components
  - Re-exports types and constants from @/types/equipment for convenience
  - Wired Equipment page to App.tsx with mode-based routing
  - Added QueryClientProvider with React Query to App.tsx
  - Created AppContent component with mode switching (home, equipment)
  - HomeContent component extracts design system demo content
  - Equipment state: selectedEquipmentId, favoriteIds with callbacks
  - Sidebar already connected to app-store for Equipment mode navigation

---

## Blocked Tasks

*Move blocked tasks here with reason*

---

## Notes

- Full implementation details: `docs/plans/2026-01-17-av-designer-mvp-implementation.md`
- UI specifications: `docs/plans/2026-01-17-av-designer-ui-design.md`
- Product requirements: `docs/plans/2026-01-17-av-designer-prd.md`
