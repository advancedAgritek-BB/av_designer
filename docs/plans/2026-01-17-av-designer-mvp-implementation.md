# AV Designer MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete end-to-end AV design system that enables designing conference rooms, validating against standards, generating quotes, and exporting electrical line diagrams and floor plans.

**Architecture:** Tauri desktop application with React/TypeScript frontend and Rust backend. Supabase for cloud database, authentication, and file storage. Local SQLite for offline capability with sync.

**Tech Stack:** Tauri 2.x, React 18, TypeScript 5, Vite, TailwindCSS, Zustand (state), React Query (data), PostgreSQL (Supabase), SQLite (local), Rust (backend processing)

---

## Required Skills Reference

The following skills MUST be invoked at the appropriate phases:

| Skill | When to Use | Phases |
|-------|-------------|--------|
| **@superpowers:using-git-worktrees** | Before starting implementation - create isolated worktree | Phase 0 (Pre-work) |
| **@superpowers:test-driven-development** | Every task - write failing tests first | All Phases |
| **@mega-mapper** | After Phase 1 - document architecture in ARCHITECTURE.md | Phase 1 completion |
| **@pg:design-postgres-tables** | When designing Supabase schema | Phase 1.4, Phase 8.3 |
| **@frontend-design:frontend-design** | All UI component and page creation | Phases 2, 3, 5, 6, 7 |
| **@superpowers:requesting-code-review** | After completing each phase | All Phase completions |
| **@superpowers:receiving-code-review** | When processing code review feedback | As needed |

### Skill Invocation Checkpoints

```
Phase 0 (Pre-work):
  → @superpowers:using-git-worktrees (create worktree for feature branch)

Phase 1 Completion:
  → @mega-mapper (generate ARCHITECTURE.md)
  → @superpowers:requesting-code-review

Phase 2 (Each UI task):
  → @superpowers:test-driven-development
  → @frontend-design:frontend-design

Phase 3 (Equipment Library UI):
  → @frontend-design:frontend-design (Programa-inspired design)
  → @superpowers:requesting-code-review

Phase 5 (Room Builder):
  → @frontend-design:frontend-design (canvas interactions)
  → @superpowers:requesting-code-review

Phase 7 (Quoting UI):
  → @frontend-design:frontend-design (Programa card layout)
  → @superpowers:requesting-code-review

Phase 8.3 (Database):
  → @pg:design-postgres-tables (Supabase schema)
```

---

## Table of Contents

0. [Phase 0: Pre-Work Setup](#phase-0-pre-work-setup)
1. [Phase 1: Project Foundation](#phase-1-project-foundation)
2. [Phase 2: Design System & Core Components](#phase-2-design-system--core-components)
3. [Phase 3: Equipment Database](#phase-3-equipment-database)
4. [Phase 4: Standards Engine](#phase-4-standards-engine)
5. [Phase 5: Room Builder](#phase-5-room-builder)
6. [Phase 6: Drawing Generation](#phase-6-drawing-generation)
7. [Phase 7: Quoting & BOM System](#phase-7-quoting--bom-system)
8. [Phase 8: Integration & MVP Completion](#phase-8-integration--mvp-completion)

---

## Phase 0: Pre-Work Setup

### Task 0.1: Create Git Worktree for MVP Development

> **REQUIRED SKILL:** @superpowers:using-git-worktrees

**Purpose:** Create an isolated worktree for MVP development to avoid disrupting the main workspace.

**Step 1: Invoke the worktree skill**

Run: `/superpowers:using-git-worktrees`

**Step 2: Follow skill instructions to create worktree**

- Branch name: `feature/mvp-implementation`
- Description: AV Designer MVP implementation

**Step 3: Verify worktree is ready**

Run: `git worktree list`
Expected: Shows new worktree for feature branch

---

## Phase 1: Project Foundation

### Task 1.1: Initialize Tauri + React Project

**Files:**
- Create: `package.json`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/lib.rs`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `index.html`

**Step 1: Create project directory structure**

Run: `mkdir -p src src-tauri/src`

**Step 2: Initialize npm project with dependencies**

```bash
npm init -y
npm install react react-dom
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react
npm install -D @tauri-apps/cli@latest
```

**Step 3: Create package.json scripts**

```json
{
  "name": "av-designer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  }
}
```

**Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

**Step 5: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 6: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AV Designer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 7: Create src/main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 8: Create src/App.tsx**

```typescript
export default function App() {
  return (
    <div>
      <h1>AV Designer</h1>
      <p>Initializing...</p>
    </div>
  );
}
```

**Step 9: Initialize Tauri**

Run: `npm run tauri init`

Follow prompts:
- App name: av-designer
- Window title: AV Designer
- Dev server URL: http://localhost:1420
- Build command: npm run build
- Output directory: dist

**Step 10: Verify build works**

Run: `npm run tauri dev`
Expected: Application window opens with "AV Designer" heading

**Step 11: Commit**

```bash
git add .
git commit -m "feat: initialize Tauri + React + TypeScript project

- Tauri 2.x desktop app foundation
- Vite build configuration
- TypeScript strict mode

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Configure TailwindCSS with Design Tokens

> **REQUIRED SKILL:** @superpowers:test-driven-development - Follow TDD for all steps

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `src/styles/globals.css`
- Modify: `src/main.tsx`

**Step 1: Write the failing test**

```typescript
// tests/styles/design-tokens.test.ts
import { describe, it, expect } from 'vitest';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

describe('Design Tokens', () => {
  const config = resolveConfig(tailwindConfig);

  it('defines primary background colors', () => {
    expect(config.theme?.colors?.bg?.primary).toBe('#0D1421');
    expect(config.theme?.colors?.bg?.secondary).toBe('#151D2E');
  });

  it('defines accent gold color', () => {
    expect(config.theme?.colors?.accent?.gold).toBe('#C9A227');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/styles/design-tokens.test.ts`
Expected: FAIL with module not found

**Step 3: Install TailwindCSS dependencies**

Run: `npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react`

**Step 4: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 5: Create tailwind.config.ts with design tokens**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0D1421',
          secondary: '#151D2E',
          tertiary: '#1C2639',
          elevated: '#232F46',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8B95A5',
          tertiary: '#5C6573',
          muted: '#3D4654',
        },
        accent: {
          gold: '#C9A227',
          'gold-hover': '#E0B82E',
          blue: '#3B82F6',
          'blue-light': '#60A5FA',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.5' }],
        sm: ['12px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.5' }],
        lg: ['16px', { lineHeight: '1.5' }],
        xl: ['18px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 6: Create src/styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg-primary text-text-primary font-sans;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    @apply border-white/10;
  }
}

@layer components {
  .card {
    @apply bg-bg-secondary border border-white/5 rounded-lg shadow-lg;
  }

  .btn-primary {
    @apply bg-accent-gold text-bg-primary px-4 py-2 rounded-md font-medium
           hover:bg-accent-gold-hover transition-colors;
  }

  .btn-secondary {
    @apply bg-transparent border border-white/20 text-text-primary px-4 py-2 rounded-md
           hover:bg-bg-tertiary transition-colors;
  }

  .input {
    @apply bg-bg-tertiary border border-white/10 rounded-md px-3 py-2
           text-text-primary placeholder:text-text-tertiary
           focus:border-accent-blue focus:outline-none;
  }
}
```

**Step 7: Update src/main.tsx to import styles**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 8: Run test to verify it passes**

Run: `npm test tests/styles/design-tokens.test.ts`
Expected: PASS

**Step 9: Commit**

```bash
git add .
git commit -m "feat: configure TailwindCSS with Revolut-inspired design tokens

- Dark theme color palette
- Typography scale from UI spec
- Component utility classes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 1.3: Set Up Project Directory Structure

**Files:**
- Create: `src/components/.gitkeep`
- Create: `src/features/.gitkeep`
- Create: `src/lib/.gitkeep`
- Create: `src/stores/.gitkeep`
- Create: `src/types/.gitkeep`
- Create: `src/hooks/.gitkeep`
- Create: `src-tauri/src/commands/.gitkeep`
- Create: `src-tauri/src/database/.gitkeep`

**Step 1: Create frontend directory structure**

```bash
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/features/equipment
mkdir -p src/features/room-builder
mkdir -p src/features/standards
mkdir -p src/features/drawings
mkdir -p src/features/quoting
mkdir -p src/lib
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/hooks
mkdir -p tests/unit
mkdir -p tests/integration
```

**Step 2: Create backend directory structure**

```bash
mkdir -p src-tauri/src/commands
mkdir -p src-tauri/src/database
mkdir -p src-tauri/src/processing
mkdir -p src-tauri/src/export
```

**Step 3: Create type definitions file**

```typescript
// src/types/index.ts
export interface Project {
  id: string;
  name: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  projectId: string;
  name: string;
  type: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: QualityTier;
}

export type RoomType = 'huddle' | 'conference' | 'training' | 'boardroom' | 'auditorium';
export type Platform = 'teams' | 'zoom' | 'webex' | 'meet' | 'multi';
export type Ecosystem = 'poly' | 'logitech' | 'cisco' | 'crestron' | 'biamp' | 'qsc';
export type QualityTier = 'budget' | 'standard' | 'premium' | 'executive';

export interface Equipment {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  cost: number;
  msrp: number;
  dimensions: Dimensions;
  weight: number;
}

export type EquipmentCategory = 'video' | 'audio' | 'control' | 'infrastructure';

export interface Dimensions {
  height: number;
  width: number;
  depth: number;
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: establish project directory structure

- Frontend: components, features, lib, stores, types, hooks
- Backend: commands, database, processing, export
- Core type definitions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 1.4: Configure Supabase Client

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/database.types.ts`
- Create: `.env.example`
- Modify: `vite.config.ts`

**Step 1: Write the failing test**

```typescript
// tests/lib/supabase.test.ts
import { describe, it, expect } from 'vitest';
import { supabase } from '@/lib/supabase';

describe('Supabase Client', () => {
  it('creates a supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });
});
```

**Step 2: Install Supabase dependencies**

Run: `npm install @supabase/supabase-js`

**Step 3: Create .env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 4: Create src/lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

**Step 5: Create src/lib/database.types.ts (initial structure)**

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      equipment: {
        Row: {
          id: string;
          manufacturer: string;
          model: string;
          sku: string;
          category: string;
          subcategory: string;
          description: string;
          cost: number;
          msrp: number;
          dimensions: Json;
          weight: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['equipment']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['equipment']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          name: string;
          client_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          room_type: string;
          width: number;
          length: number;
          ceiling_height: number;
          platform: string;
          ecosystem: string;
          tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
```

**Step 6: Update vite.config.ts to resolve @ alias**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

**Step 7: Run test to verify it passes**

Run: `npm test tests/lib/supabase.test.ts`
Expected: PASS (with env vars set)

**Step 8: Commit**

```bash
git add .
git commit -m "feat: configure Supabase client with typed database schema

- Supabase client initialization
- Database type definitions
- Environment variable setup

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 1.5: Set Up State Management (Zustand)

**Files:**
- Create: `src/stores/app-store.ts`
- Create: `src/stores/equipment-store.ts`
- Create: `src/stores/project-store.ts`

**Step 1: Write the failing test**

```typescript
// tests/stores/app-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/app-store';

describe('App Store', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it('has initial sidebar collapsed state', () => {
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it('toggles sidebar', () => {
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
  });

  it('sets active mode', () => {
    useAppStore.getState().setActiveMode('room-design');
    expect(useAppStore.getState().activeMode).toBe('room-design');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/stores/app-store.test.ts`
Expected: FAIL with module not found

**Step 3: Install Zustand**

Run: `npm install zustand`

**Step 4: Create src/stores/app-store.ts**

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type AppMode =
  | 'home'
  | 'projects'
  | 'room-design'
  | 'drawings'
  | 'quoting'
  | 'standards'
  | 'equipment'
  | 'templates';

interface AppState {
  sidebarCollapsed: boolean;
  activeMode: AppMode;
  currentProjectId: string | null;
  currentRoomId: string | null;

  toggleSidebar: () => void;
  setActiveMode: (mode: AppMode) => void;
  setCurrentProject: (projectId: string | null) => void;
  setCurrentRoom: (roomId: string | null) => void;
  reset: () => void;
}

const initialState = {
  sidebarCollapsed: false,
  activeMode: 'home' as AppMode,
  currentProjectId: null,
  currentRoomId: null,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        toggleSidebar: () => set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed
        })),

        setActiveMode: (mode) => set({ activeMode: mode }),

        setCurrentProject: (projectId) => set({
          currentProjectId: projectId,
          currentRoomId: null,
        }),

        setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

        reset: () => set(initialState),
      }),
      {
        name: 'av-designer-app',
      }
    )
  )
);
```

**Step 5: Create src/stores/project-store.ts**

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project, Room } from '@/types';

interface ProjectState {
  projects: Project[];
  rooms: Room[];
  isLoading: boolean;
  error: string | null;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set) => ({
      projects: [],
      rooms: [],
      isLoading: false,
      error: null,

      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      setRooms: (rooms) => set({ rooms }),
      addRoom: (room) => set((state) => ({
        rooms: [...state.rooms, room]
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    })
  )
);
```

**Step 6: Create src/stores/equipment-store.ts**

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Equipment } from '@/types';

interface EquipmentState {
  equipment: Equipment[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;

  setEquipment: (equipment: Equipment[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useEquipmentStore = create<EquipmentState>()(
  devtools(
    (set) => ({
      equipment: [],
      selectedCategory: null,
      searchQuery: '',
      isLoading: false,

      setEquipment: (equipment) => set({ equipment }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setLoading: (isLoading) => set({ isLoading }),
    })
  )
);
```

**Step 7: Run test to verify it passes**

Run: `npm test tests/stores/app-store.test.ts`
Expected: PASS

**Step 8: Commit**

```bash
git add .
git commit -m "feat: set up Zustand state management stores

- App store: sidebar, navigation, current project/room
- Project store: projects and rooms data
- Equipment store: equipment library state

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Phase 1 Completion Checkpoint

> **INVOKE AT PHASE 1 END:**
> 1. @mega-mapper - Generate ARCHITECTURE.md documenting the project foundation
> 2. @superpowers:requesting-code-review - Review Phase 1 implementation

**Verification:**
- [ ] Tauri app builds and runs
- [ ] TailwindCSS design tokens match UI spec
- [ ] Supabase client configured
- [ ] Zustand stores initialized
- [ ] ARCHITECTURE.md created and accurate

---

## Phase 2: Design System & Core Components

> **REQUIRED SKILLS FOR THIS PHASE:**
> - @superpowers:test-driven-development - TDD for all components
> - @frontend-design:frontend-design - Invoke for each UI component to ensure high design quality

### Task 2.1: Create Icon Component with Lucide

> **INVOKE:** @frontend-design:frontend-design before implementing

**Files:**
- Create: `src/components/ui/icon.tsx`
- Test: `tests/components/icon.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/icon.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from '@/components/ui/icon';

describe('Icon Component', () => {
  it('renders an icon', () => {
    render(<Icon name="home" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies size prop', () => {
    render(<Icon name="home" size={24} data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/components/icon.test.tsx`
Expected: FAIL

**Step 3: Install Lucide React**

Run: `npm install lucide-react`

**Step 4: Create src/components/ui/icon.tsx**

```typescript
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type IconName = keyof typeof LucideIcons;

interface IconProps extends LucideProps {
  name: IconName;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideProps>;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <LucideIcon size={size} {...props} />;
}
```

**Step 5: Run test to verify it passes**

Run: `npm test tests/components/icon.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add Icon component with Lucide icons

- Typed icon names from Lucide library
- Configurable size and props

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2.2: Create Button Component

> **INVOKE:** @frontend-design:frontend-design before implementing

**Files:**
- Create: `src/components/ui/button.tsx`
- Test: `tests/components/button.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies primary variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent-gold');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-white/20');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/components/button.test.tsx`
Expected: FAIL

**Step 3: Create src/components/ui/button.tsx**

```typescript
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-accent-gold text-bg-primary hover:bg-accent-gold-hover',
  secondary: 'bg-transparent border border-white/20 text-text-primary hover:bg-bg-tertiary',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

**Step 4: Create src/lib/utils.ts (utility for className merging)**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 5: Install clsx and tailwind-merge**

Run: `npm install clsx tailwind-merge`

**Step 6: Run test to verify it passes**

Run: `npm test tests/components/button.test.tsx`
Expected: PASS

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add Button component with variants

- Primary, secondary, ghost variants
- Size options (sm, md, lg)
- Accessible focus states

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2.3: Create Input Component

> **INVOKE:** @frontend-design:frontend-design before implementing

**Files:**
- Create: `src/components/ui/input.tsx`
- Test: `tests/components/input.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/input.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders with label', () => {
    render(<Input label="Name" id="name" />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/components/input.test.tsx`
Expected: FAIL

**Step 3: Create src/components/ui/input.tsx**

```typescript
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm text-text-secondary font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'bg-bg-tertiary border rounded-md px-3 py-2',
            'text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-accent-blue/50',
            'transition-colors',
            error ? 'border-status-error' : 'border-white/10 focus:border-accent-blue',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-sm text-status-error">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/components/input.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Input component with label and error states

- Dark theme styling
- Label and error message support
- Focus ring styling

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2.4: Create Card Component

> **INVOKE:** @frontend-design:frontend-design before implementing

**Files:**
- Create: `src/components/ui/card.tsx`
- Test: `tests/components/card.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

describe('Card Component', () => {
  it('renders card with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders card with header and title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/components/card.test.tsx`
Expected: FAIL

**Step 3: Create src/components/ui/card.tsx**

```typescript
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-bg-secondary border border-white/5 rounded-lg shadow-lg',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-white/5', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-text-primary', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-white/5', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/components/card.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Card component with header, title, content, footer

- Revolut-style dark card design
- Composable subcomponents

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2.5: Create Application Shell Layout

> **INVOKE:** @frontend-design:frontend-design before implementing - Revolut-style dark theme

**Files:**
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Test: `tests/components/app-shell.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/components/app-shell.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/layout/app-shell';

describe('AppShell Component', () => {
  it('renders sidebar with navigation items', () => {
    render(<AppShell><div>Content</div></AppShell>);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders children in main area', () => {
    render(<AppShell><div>Main content</div></AppShell>);
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/components/app-shell.test.tsx`
Expected: FAIL

**Step 3: Create src/components/layout/sidebar.tsx**

```typescript
import { Icon } from '@/components/ui/icon';
import { useAppStore, type AppMode } from '@/stores/app-store';
import { cn } from '@/lib/utils';

interface NavItem {
  id: AppMode;
  label: string;
  icon: string;
}

const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'projects', label: 'Projects', icon: 'FolderOpen' },
  { id: 'room-design', label: 'Room Design', icon: 'PenTool' },
  { id: 'drawings', label: 'Drawings', icon: 'FileText' },
  { id: 'quoting', label: 'Quoting', icon: 'DollarSign' },
  { id: 'standards', label: 'Standards', icon: 'BarChart3' },
];

const libraryNavItems: NavItem[] = [
  { id: 'equipment', label: 'Equipment', icon: 'Package' },
  { id: 'templates', label: 'Templates', icon: 'BookOpen' },
];

export function Sidebar() {
  const { activeMode, setActiveMode, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'bg-bg-secondary border-r border-white/5 flex flex-col h-screen transition-all',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-gold rounded-md flex items-center justify-center">
            <span className="text-bg-primary font-bold">R</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-text-primary">AV Designer</span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {mainNavItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeMode === item.id}
            isCollapsed={sidebarCollapsed}
            onClick={() => setActiveMode(item.id)}
          />
        ))}

        {/* Divider */}
        <div className="my-4 border-t border-white/5" />

        {/* Section label */}
        {!sidebarCollapsed && (
          <span className="px-3 text-xs text-text-muted uppercase tracking-wider">
            Libraries
          </span>
        )}

        {libraryNavItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeMode === item.id}
            isCollapsed={sidebarCollapsed}
            onClick={() => setActiveMode(item.id)}
          />
        ))}
      </nav>

      {/* Help Link */}
      <div className="p-2 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-text-secondary hover:bg-bg-tertiary transition-colors">
          <Icon name="HelpCircle" size={20} />
          {!sidebarCollapsed && <span>Need Help?</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="p-4 border-t border-white/5 text-text-secondary hover:text-text-primary transition-colors"
      >
        <Icon name={sidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
      </button>
    </aside>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

function NavButton({ item, isActive, isCollapsed, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
        isActive
          ? 'bg-accent-gold/15 text-accent-gold'
          : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
      )}
    >
      <Icon name={item.icon as any} size={20} />
      {!isCollapsed && <span>{item.label}</span>}
    </button>
  );
}
```

**Step 4: Create src/components/layout/header.tsx**

```typescript
import { Icon } from '@/components/ui/icon';
import { useAppStore } from '@/stores/app-store';

const modeLabels: Record<string, string> = {
  home: 'Home',
  projects: 'Projects',
  'room-design': 'Room Design',
  drawings: 'Drawings',
  quoting: 'Quoting',
  standards: 'Standards',
  equipment: 'Equipment',
  templates: 'Templates',
};

export function Header() {
  const { activeMode } = useAppStore();

  return (
    <header className="h-14 bg-bg-secondary border-b border-white/5 flex items-center justify-between px-6">
      {/* Breadcrumb / Mode Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-text-primary">
          {modeLabels[activeMode] || 'AV Designer'}
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
          <Icon name="Search" size={20} />
        </button>

        {/* Settings */}
        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
          <Icon name="Settings" size={20} />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-bg-tertiary rounded-full">
          <div className="w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center">
            <span className="text-xs text-bg-primary font-medium">MP</span>
          </div>
        </button>
      </div>
    </header>
  );
}
```

**Step 5: Create src/components/layout/app-shell.tsx**

```typescript
import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Step 6: Run test to verify it passes**

Run: `npm test tests/components/app-shell.test.tsx`
Expected: PASS

**Step 7: Update App.tsx to use AppShell**

```typescript
import { AppShell } from '@/components/layout/app-shell';

export default function App() {
  return (
    <AppShell>
      <div className="text-text-primary">
        <h2 className="text-2xl font-bold mb-4">Welcome to AV Designer</h2>
        <p className="text-text-secondary">Select a mode from the sidebar to begin.</p>
      </div>
    </AppShell>
  );
}
```

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add application shell with sidebar and header

- Collapsible sidebar with navigation
- Revolut-style golden accent for active items
- Header with breadcrumb and user menu

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Equipment Database

> **REQUIRED SKILLS FOR THIS PHASE:**
> - @superpowers:test-driven-development - TDD for all features
> - @frontend-design:frontend-design - Invoke for Equipment Card and Library page (Programa-inspired)
> - @superpowers:requesting-code-review - After phase completion

### Task 3.1: Create Equipment Type Definitions

**Files:**
- Create: `src/types/equipment.ts`
- Test: `tests/types/equipment.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/types/equipment.test.ts
import { describe, it, expect } from 'vitest';
import type { Equipment, EquipmentCategory } from '@/types/equipment';
import { isValidEquipment, EQUIPMENT_CATEGORIES } from '@/types/equipment';

describe('Equipment Types', () => {
  it('validates equipment object', () => {
    const equipment: Equipment = {
      id: '1',
      manufacturer: 'Shure',
      model: 'MXA920',
      sku: 'MXA920-S',
      category: 'audio',
      subcategory: 'microphones',
      description: 'Ceiling array microphone',
      cost: 2847,
      msrp: 3500,
      dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
      weight: 6.2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(isValidEquipment(equipment)).toBe(true);
  });

  it('has all equipment categories', () => {
    expect(EQUIPMENT_CATEGORIES).toContain('video');
    expect(EQUIPMENT_CATEGORIES).toContain('audio');
    expect(EQUIPMENT_CATEGORIES).toContain('control');
    expect(EQUIPMENT_CATEGORIES).toContain('infrastructure');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/types/equipment.test.ts`
Expected: FAIL

**Step 3: Create src/types/equipment.ts**

```typescript
export const EQUIPMENT_CATEGORIES = ['video', 'audio', 'control', 'infrastructure'] as const;
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export const EQUIPMENT_SUBCATEGORIES: Record<EquipmentCategory, string[]> = {
  video: ['displays', 'cameras', 'codecs', 'switchers', 'extenders'],
  audio: ['microphones', 'speakers', 'dsp', 'amplifiers', 'mixers'],
  control: ['processors', 'touch-panels', 'keypads', 'interfaces'],
  infrastructure: ['racks', 'mounts', 'cables', 'connectors', 'power'],
};

export interface Dimensions {
  height: number;
  width: number;
  depth: number;
}

export interface ElectricalSpecs {
  voltage?: number;
  wattage?: number;
  amperage?: number;
  poeClass?: string;
  btuOutput?: number;
}

export interface Equipment {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  cost: number;
  msrp: number;
  dimensions: Dimensions;
  weight: number;
  electrical?: ElectricalSpecs;
  platformCertifications?: string[];
  imageUrl?: string;
  specSheetUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentFormData {
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  cost: number;
  msrp: number;
  dimensions: Dimensions;
  weight: number;
  electrical?: ElectricalSpecs;
  platformCertifications?: string[];
}

export function isValidEquipment(data: unknown): data is Equipment {
  if (!data || typeof data !== 'object') return false;
  const eq = data as Equipment;

  return (
    typeof eq.id === 'string' &&
    typeof eq.manufacturer === 'string' &&
    typeof eq.model === 'string' &&
    typeof eq.sku === 'string' &&
    EQUIPMENT_CATEGORIES.includes(eq.category) &&
    typeof eq.subcategory === 'string' &&
    typeof eq.cost === 'number' &&
    typeof eq.msrp === 'number' &&
    typeof eq.dimensions === 'object' &&
    typeof eq.dimensions.height === 'number' &&
    typeof eq.dimensions.width === 'number' &&
    typeof eq.dimensions.depth === 'number' &&
    typeof eq.weight === 'number'
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/types/equipment.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add comprehensive Equipment type definitions

- Equipment interface with all PRD-defined attributes
- Category and subcategory constants
- Validation function for runtime checks

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3.2: Create Equipment Service Layer

**Files:**
- Create: `src/features/equipment/equipment-service.ts`
- Test: `tests/features/equipment/equipment-service.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/features/equipment/equipment-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquipmentService } from '@/features/equipment/equipment-service';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
        })),
      })),
    })),
  },
}));

describe('EquipmentService', () => {
  let service: EquipmentService;

  beforeEach(() => {
    service = new EquipmentService();
  });

  it('fetches all equipment', async () => {
    const result = await service.getAll();
    expect(result).toEqual([]);
  });

  it('fetches equipment by category', async () => {
    const result = await service.getByCategory('audio');
    expect(Array.isArray(result)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/features/equipment/equipment-service.test.ts`
Expected: FAIL

**Step 3: Create src/features/equipment/equipment-service.ts**

```typescript
import { supabase } from '@/lib/supabase';
import type { Equipment, EquipmentCategory, EquipmentFormData } from '@/types/equipment';

export class EquipmentService {
  private readonly table = 'equipment';

  async getAll(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('manufacturer', { ascending: true });

    if (error) throw error;
    return this.mapRows(data || []);
  }

  async getByCategory(category: EquipmentCategory): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('category', category)
      .order('manufacturer', { ascending: true });

    if (error) throw error;
    return this.mapRows(data || []);
  }

  async getById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapRow(data);
  }

  async search(query: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .or(`manufacturer.ilike.%${query}%,model.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(50);

    if (error) throw error;
    return this.mapRows(data || []);
  }

  async create(formData: EquipmentFormData): Promise<Equipment> {
    const { data, error } = await supabase
      .from(this.table)
      .insert({
        manufacturer: formData.manufacturer,
        model: formData.model,
        sku: formData.sku,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        cost: formData.cost,
        msrp: formData.msrp,
        dimensions: formData.dimensions,
        weight: formData.weight,
        electrical: formData.electrical,
        platform_certifications: formData.platformCertifications,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data);
  }

  async update(id: string, formData: Partial<EquipmentFormData>): Promise<Equipment> {
    const updateData: Record<string, unknown> = {};

    if (formData.manufacturer !== undefined) updateData.manufacturer = formData.manufacturer;
    if (formData.model !== undefined) updateData.model = formData.model;
    if (formData.sku !== undefined) updateData.sku = formData.sku;
    if (formData.category !== undefined) updateData.category = formData.category;
    if (formData.subcategory !== undefined) updateData.subcategory = formData.subcategory;
    if (formData.description !== undefined) updateData.description = formData.description;
    if (formData.cost !== undefined) updateData.cost = formData.cost;
    if (formData.msrp !== undefined) updateData.msrp = formData.msrp;
    if (formData.dimensions !== undefined) updateData.dimensions = formData.dimensions;
    if (formData.weight !== undefined) updateData.weight = formData.weight;
    if (formData.electrical !== undefined) updateData.electrical = formData.electrical;
    if (formData.platformCertifications !== undefined) {
      updateData.platform_certifications = formData.platformCertifications;
    }

    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapRows(rows: any[]): Equipment[] {
    return rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: any): Equipment {
    return {
      id: row.id,
      manufacturer: row.manufacturer,
      model: row.model,
      sku: row.sku,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      cost: row.cost,
      msrp: row.msrp,
      dimensions: row.dimensions,
      weight: row.weight,
      electrical: row.electrical,
      platformCertifications: row.platform_certifications,
      imageUrl: row.image_url,
      specSheetUrl: row.spec_sheet_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const equipmentService = new EquipmentService();
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/features/equipment/equipment-service.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Equipment service layer for Supabase operations

- CRUD operations for equipment
- Search functionality
- Row mapping from snake_case to camelCase

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3.3: Create Equipment React Query Hooks

**Files:**
- Create: `src/features/equipment/use-equipment.ts`
- Test: `tests/features/equipment/use-equipment.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/features/equipment/use-equipment.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEquipmentList } from '@/features/equipment/use-equipment';
import type { ReactNode } from 'react';

vi.mock('@/features/equipment/equipment-service', () => ({
  equipmentService: {
    getAll: vi.fn(() => Promise.resolve([
      { id: '1', manufacturer: 'Shure', model: 'MXA920' }
    ])),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useEquipmentList', () => {
  it('fetches equipment list', async () => {
    const { result } = renderHook(() => useEquipmentList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].manufacturer).toBe('Shure');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/features/equipment/use-equipment.test.tsx`
Expected: FAIL

**Step 3: Install React Query**

Run: `npm install @tanstack/react-query`

**Step 4: Create src/features/equipment/use-equipment.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from './equipment-service';
import type { EquipmentCategory, EquipmentFormData } from '@/types/equipment';

const EQUIPMENT_KEYS = {
  all: ['equipment'] as const,
  list: () => [...EQUIPMENT_KEYS.all, 'list'] as const,
  byCategory: (category: EquipmentCategory) =>
    [...EQUIPMENT_KEYS.all, 'category', category] as const,
  detail: (id: string) => [...EQUIPMENT_KEYS.all, 'detail', id] as const,
  search: (query: string) => [...EQUIPMENT_KEYS.all, 'search', query] as const,
};

export function useEquipmentList() {
  return useQuery({
    queryKey: EQUIPMENT_KEYS.list(),
    queryFn: () => equipmentService.getAll(),
  });
}

export function useEquipmentByCategory(category: EquipmentCategory) {
  return useQuery({
    queryKey: EQUIPMENT_KEYS.byCategory(category),
    queryFn: () => equipmentService.getByCategory(category),
  });
}

export function useEquipment(id: string) {
  return useQuery({
    queryKey: EQUIPMENT_KEYS.detail(id),
    queryFn: () => equipmentService.getById(id),
    enabled: !!id,
  });
}

export function useEquipmentSearch(query: string) {
  return useQuery({
    queryKey: EQUIPMENT_KEYS.search(query),
    queryFn: () => equipmentService.search(query),
    enabled: query.length >= 2,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EquipmentFormData) => equipmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EquipmentFormData> }) =>
      equipmentService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.detail(id) });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => equipmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEYS.all });
    },
  });
}
```

**Step 5: Run test to verify it passes**

Run: `npm test tests/features/equipment/use-equipment.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add React Query hooks for equipment operations

- useEquipmentList, useEquipmentByCategory, useEquipment
- useEquipmentSearch for searching
- Mutations with cache invalidation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3.4: Create Equipment Card Component

> **INVOKE:** @frontend-design:frontend-design before implementing - Programa-inspired visual catalog style

**Files:**
- Create: `src/features/equipment/components/equipment-card.tsx`
- Test: `tests/features/equipment/components/equipment-card.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/features/equipment/components/equipment-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EquipmentCard } from '@/features/equipment/components/equipment-card';
import type { Equipment } from '@/types/equipment';

const mockEquipment: Equipment = {
  id: '1',
  manufacturer: 'Shure',
  model: 'MXA920',
  sku: 'MXA920-S',
  category: 'audio',
  subcategory: 'microphones',
  description: 'Ceiling array microphone',
  cost: 2847,
  msrp: 3500,
  dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
  weight: 6.2,
  platformCertifications: ['teams', 'zoom'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('EquipmentCard', () => {
  it('displays equipment name', () => {
    render(<EquipmentCard equipment={mockEquipment} />);
    expect(screen.getByText('Shure MXA920')).toBeInTheDocument();
  });

  it('displays manufacturer', () => {
    render(<EquipmentCard equipment={mockEquipment} />);
    expect(screen.getByText('Shure')).toBeInTheDocument();
  });

  it('displays price', () => {
    render(<EquipmentCard equipment={mockEquipment} />);
    expect(screen.getByText('$2,847')).toBeInTheDocument();
  });

  it('displays platform certifications', () => {
    render(<EquipmentCard equipment={mockEquipment} />);
    expect(screen.getByText(/teams/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/features/equipment/components/equipment-card.test.tsx`
Expected: FAIL

**Step 3: Create src/features/equipment/components/equipment-card.tsx**

```typescript
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { Equipment } from '@/types/equipment';

interface EquipmentCardProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
  showFavorite?: boolean;
}

export function EquipmentCard({
  equipment,
  onClick,
  isSelected,
  showFavorite = true,
}: EquipmentCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(equipment.cost);

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-bg-secondary border rounded-lg p-4 cursor-pointer transition-all',
        'hover:border-accent-blue/50 hover:shadow-lg',
        isSelected ? 'border-accent-gold' : 'border-white/5'
      )}
    >
      {/* Image placeholder */}
      <div className="aspect-square bg-bg-tertiary rounded-md mb-3 flex items-center justify-center">
        {equipment.imageUrl ? (
          <img
            src={equipment.imageUrl}
            alt={equipment.model}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <Icon name="Package" size={48} className="text-text-muted" />
        )}
      </div>

      {/* Name */}
      <h3 className="font-medium text-text-primary truncate">
        {equipment.manufacturer} {equipment.model}
      </h3>

      {/* Manufacturer badge */}
      <p className="text-sm text-text-secondary mb-2">{equipment.manufacturer}</p>

      {/* Price */}
      <p className="text-lg font-semibold text-text-primary mb-2">{formattedPrice}</p>

      {/* Footer with status and certifications */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-status-success">
          <span className="w-2 h-2 rounded-full bg-status-success" />
          In Stock
        </div>

        {showFavorite && (
          <button
            className="text-text-secondary hover:text-accent-gold transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Toggle favorite
            }}
          >
            <Icon name="Star" size={16} />
          </button>
        )}
      </div>

      {/* Platform certifications */}
      {equipment.platformCertifications && equipment.platformCertifications.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {equipment.platformCertifications.map((cert) => (
            <span
              key={cert}
              className="text-xs px-2 py-0.5 bg-bg-tertiary rounded text-text-secondary capitalize"
            >
              {cert} ✓
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/features/equipment/components/equipment-card.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add EquipmentCard component with Programa-inspired design

- Product image placeholder
- Price formatting
- Platform certification badges
- Favorite toggle button

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3.5: Create Equipment Library Page

> **INVOKE:** @frontend-design:frontend-design before implementing - Programa-inspired product library layout

**Files:**
- Create: `src/features/equipment/pages/equipment-library.tsx`
- Create: `src/features/equipment/components/equipment-grid.tsx`
- Create: `src/features/equipment/components/category-sidebar.tsx`

**Step 1: Write the failing test**

```typescript
// tests/features/equipment/pages/equipment-library.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EquipmentLibraryPage } from '@/features/equipment/pages/equipment-library';

vi.mock('@/features/equipment/use-equipment', () => ({
  useEquipmentList: () => ({
    data: [
      { id: '1', manufacturer: 'Shure', model: 'MXA920', category: 'audio' }
    ],
    isLoading: false,
    isSuccess: true,
  }),
}));

const queryClient = new QueryClient();

describe('EquipmentLibraryPage', () => {
  it('renders equipment library heading', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <EquipmentLibraryPage />
      </QueryClientProvider>
    );
    expect(screen.getByText('Libraries')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <EquipmentLibraryPage />
      </QueryClientProvider>
    );
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/features/equipment/pages/equipment-library.test.tsx`
Expected: FAIL

**Step 3: Create src/features/equipment/components/category-sidebar.tsx**

```typescript
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_SUBCATEGORIES, type EquipmentCategory } from '@/types/equipment';
import { useState } from 'react';

interface CategorySidebarProps {
  selectedCategory: EquipmentCategory | null;
  selectedSubcategory: string | null;
  onSelectCategory: (category: EquipmentCategory | null) => void;
  onSelectSubcategory: (subcategory: string | null) => void;
}

const categoryIcons: Record<EquipmentCategory, string> = {
  video: 'Monitor',
  audio: 'Volume2',
  control: 'Sliders',
  infrastructure: 'Server',
};

export function CategorySidebar({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<EquipmentCategory>>(new Set());

  const toggleExpanded = (category: EquipmentCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="w-48 shrink-0">
      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">
        Categories
      </h3>

      {/* All Products */}
      <button
        onClick={() => {
          onSelectCategory(null);
          onSelectSubcategory(null);
        }}
        className={cn(
          'w-full text-left px-3 py-2 rounded-md mb-1 transition-colors',
          selectedCategory === null
            ? 'bg-accent-gold/15 text-accent-gold'
            : 'text-text-secondary hover:bg-bg-tertiary'
        )}
      >
        All Products
      </button>

      {/* Categories */}
      {EQUIPMENT_CATEGORIES.map((category) => {
        const isExpanded = expandedCategories.has(category);
        const isSelected = selectedCategory === category;
        const subcategories = EQUIPMENT_SUBCATEGORIES[category];

        return (
          <div key={category}>
            <button
              onClick={() => {
                toggleExpanded(category);
                onSelectCategory(category);
                onSelectSubcategory(null);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                isSelected && !selectedSubcategory
                  ? 'bg-accent-gold/15 text-accent-gold'
                  : 'text-text-secondary hover:bg-bg-tertiary'
              )}
            >
              <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={14} />
              <Icon name={categoryIcons[category] as any} size={16} />
              <span className="capitalize flex-1 text-left">{category}</span>
            </button>

            {isExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      onSelectCategory(category);
                      onSelectSubcategory(sub);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                      selectedSubcategory === sub
                        ? 'text-accent-gold'
                        : 'text-text-tertiary hover:text-text-secondary'
                    )}
                  >
                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

**Step 4: Create src/features/equipment/components/equipment-grid.tsx**

```typescript
import { EquipmentCard } from './equipment-card';
import type { Equipment } from '@/types/equipment';

interface EquipmentGridProps {
  equipment: Equipment[];
  onSelect?: (equipment: Equipment) => void;
  selectedId?: string;
}

export function EquipmentGrid({ equipment, onSelect, selectedId }: EquipmentGridProps) {
  if (equipment.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        <p>No equipment found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {equipment.map((item) => (
        <EquipmentCard
          key={item.id}
          equipment={item}
          onClick={() => onSelect?.(item)}
          isSelected={selectedId === item.id}
        />
      ))}
    </div>
  );
}
```

**Step 5: Create src/features/equipment/pages/equipment-library.tsx**

```typescript
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CategorySidebar } from '../components/category-sidebar';
import { EquipmentGrid } from '../components/equipment-grid';
import { useEquipmentList } from '../use-equipment';
import type { EquipmentCategory, Equipment } from '@/types/equipment';

export function EquipmentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const { data: equipment = [], isLoading } = useEquipmentList();

  const filteredEquipment = useMemo(() => {
    let filtered = equipment;

    if (selectedCategory) {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter((e) => e.subcategory === selectedSubcategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.manufacturer.toLowerCase().includes(query) ||
          e.model.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [equipment, selectedCategory, selectedSubcategory, searchQuery]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Libraries</h1>
        <Button>
          <Icon name="Plus" size={16} className="mr-2" />
          New
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-tertiary border border-white/10 rounded-md pl-10 pr-4 py-2
                       text-text-primary placeholder:text-text-tertiary
                       focus:outline-none focus:border-accent-blue"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Category Sidebar */}
        <CategorySidebar
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectCategory={setSelectedCategory}
          onSelectSubcategory={setSelectedSubcategory}
        />

        {/* Equipment Grid */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Icon name="Loader2" size={24} className="animate-spin text-text-secondary" />
            </div>
          ) : (
            <EquipmentGrid
              equipment={filteredEquipment}
              onSelect={setSelectedEquipment}
              selectedId={selectedEquipment?.id}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-4 text-sm text-text-secondary">
        {filteredEquipment.length} items
        {selectedCategory && ` | Showing: ${selectedCategory}`}
        {selectedSubcategory && ` > ${selectedSubcategory}`}
      </div>
    </div>
  );
}
```

**Step 6: Run test to verify it passes**

Run: `npm test tests/features/equipment/pages/equipment-library.test.tsx`
Expected: PASS

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add Equipment Library page with category filtering

- Programa-inspired product grid layout
- Category sidebar with expandable subcategories
- Search functionality
- Equipment selection state

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Standards Engine

### Task 4.1: Create Standards Type Definitions

**Files:**
- Create: `src/types/standards.ts`

**Step 1: Write the failing test**

```typescript
// tests/types/standards.test.ts
import { describe, it, expect } from 'vitest';
import type { Standard, Rule, RuleCondition } from '@/types/standards';
import { RULE_DIMENSIONS, RULE_EXPRESSION_TYPES } from '@/types/standards';

describe('Standards Types', () => {
  it('has all rule dimensions', () => {
    expect(RULE_DIMENSIONS).toContain('room_type');
    expect(RULE_DIMENSIONS).toContain('platform');
    expect(RULE_DIMENSIONS).toContain('ecosystem');
    expect(RULE_DIMENSIONS).toContain('tier');
    expect(RULE_DIMENSIONS).toContain('use_case');
    expect(RULE_DIMENSIONS).toContain('client');
  });

  it('has all expression types', () => {
    expect(RULE_EXPRESSION_TYPES).toContain('constraint');
    expect(RULE_EXPRESSION_TYPES).toContain('formula');
    expect(RULE_EXPRESSION_TYPES).toContain('conditional');
    expect(RULE_EXPRESSION_TYPES).toContain('range_match');
    expect(RULE_EXPRESSION_TYPES).toContain('pattern');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/types/standards.test.ts`
Expected: FAIL

**Step 3: Create src/types/standards.ts**

```typescript
export const RULE_DIMENSIONS = [
  'room_type',
  'platform',
  'ecosystem',
  'tier',
  'use_case',
  'client',
] as const;
export type RuleDimension = (typeof RULE_DIMENSIONS)[number];

export const RULE_EXPRESSION_TYPES = [
  'constraint',
  'formula',
  'conditional',
  'range_match',
  'pattern',
] as const;
export type RuleExpressionType = (typeof RULE_EXPRESSION_TYPES)[number];

export const RULE_ASPECTS = [
  'equipment_selection',
  'quantities',
  'placement',
  'configuration',
  'cabling',
  'commercial',
] as const;
export type RuleAspect = (typeof RULE_ASPECTS)[number];

export interface RuleCondition {
  dimension: RuleDimension;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: string | number | string[];
}

export interface Rule {
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

export interface StandardNode {
  id: string;
  name: string;
  parentId: string | null;
  type: 'folder' | 'standard';
  order: number;
}

export interface Standard {
  id: string;
  nodeId: string;
  rules: Rule[];
  createdAt: string;
  updatedAt: string;
}

export interface StandardsHierarchy {
  nodes: StandardNode[];
  standards: Map<string, Standard>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
}

export interface ValidationIssue {
  ruleId: string;
  ruleName: string;
  message: string;
  severity: 'error' | 'warning' | 'suggestion';
  equipmentId?: string;
  field?: string;
  suggestedFix?: string;
}

// Rule resolution order: Client > Platform > Ecosystem > Tier > Use Case > Room Type
export const DIMENSION_PRIORITY: Record<RuleDimension, number> = {
  client: 6,
  platform: 5,
  ecosystem: 4,
  tier: 3,
  use_case: 2,
  room_type: 1,
};
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/types/standards.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Standards Engine type definitions

- Rule dimensions (room_type, platform, ecosystem, etc.)
- Expression types (constraint, formula, conditional, etc.)
- Validation result structure
- Dimension priority for conflict resolution

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 4.2: Create Rule Evaluation Engine

**Files:**
- Create: `src/features/standards/rule-engine.ts`
- Test: `tests/features/standards/rule-engine.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/features/standards/rule-engine.test.ts
import { describe, it, expect } from 'vitest';
import { RuleEngine } from '@/features/standards/rule-engine';
import type { Rule, RuleCondition } from '@/types/standards';

describe('RuleEngine', () => {
  const engine = new RuleEngine();

  describe('evaluateCondition', () => {
    it('evaluates equals condition', () => {
      const condition: RuleCondition = {
        dimension: 'platform',
        operator: 'equals',
        value: 'teams',
      };
      const context = { platform: 'teams' };
      expect(engine.evaluateCondition(condition, context)).toBe(true);
    });

    it('evaluates greater_than condition', () => {
      const condition: RuleCondition = {
        dimension: 'room_type',
        operator: 'greater_than',
        value: 400,
      };
      const context = { room_sqft: 600 };
      expect(engine.evaluateCondition(condition, context)).toBe(true);
    });
  });

  describe('evaluateRule', () => {
    it('returns true when all conditions match', () => {
      const rule: Rule = {
        id: '1',
        name: 'Teams Display Size',
        description: 'Require 75" display for Teams rooms',
        aspect: 'equipment_selection',
        expressionType: 'constraint',
        conditions: [
          { dimension: 'platform', operator: 'equals', value: 'teams' },
        ],
        expression: 'display.size >= 75',
        priority: 1,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      };
      const context = { platform: 'teams', display: { size: 85 } };
      expect(engine.evaluateRule(rule, context).applies).toBe(true);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/features/standards/rule-engine.test.ts`
Expected: FAIL

**Step 3: Create src/features/standards/rule-engine.ts**

```typescript
import type {
  Rule,
  RuleCondition,
  ValidationResult,
  ValidationIssue,
  RuleDimension,
  DIMENSION_PRIORITY,
} from '@/types/standards';

interface RuleContext {
  [key: string]: any;
}

interface RuleEvaluationResult {
  applies: boolean;
  passed: boolean;
  message?: string;
}

export class RuleEngine {
  evaluateCondition(condition: RuleCondition, context: RuleContext): boolean {
    const contextValue = this.getContextValue(condition.dimension, context);

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;

      case 'not_equals':
        return contextValue !== condition.value;

      case 'contains':
        if (Array.isArray(contextValue)) {
          return contextValue.includes(condition.value);
        }
        if (typeof contextValue === 'string') {
          return contextValue.includes(String(condition.value));
        }
        return false;

      case 'greater_than':
        return Number(contextValue) > Number(condition.value);

      case 'less_than':
        return Number(contextValue) < Number(condition.value);

      case 'in':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(contextValue);
        }
        return false;

      default:
        return false;
    }
  }

  evaluateRule(rule: Rule, context: RuleContext): RuleEvaluationResult {
    if (!rule.isActive) {
      return { applies: false, passed: true };
    }

    // Check if all conditions match (rule applies to this context)
    const applies = rule.conditions.every((condition) =>
      this.evaluateCondition(condition, context)
    );

    if (!applies) {
      return { applies: false, passed: true };
    }

    // Evaluate the expression
    const passed = this.evaluateExpression(rule.expression, context);

    return {
      applies: true,
      passed,
      message: passed ? undefined : `Rule "${rule.name}" failed: ${rule.description}`,
    };
  }

  evaluateExpression(expression: string, context: RuleContext): boolean {
    // Simple expression evaluator
    // Format: "field.subfield operator value"
    const match = expression.match(/^(\w+(?:\.\w+)*)\s*(>=|<=|>|<|==|!=)\s*(.+)$/);

    if (!match) {
      console.warn(`Invalid expression: ${expression}`);
      return true;
    }

    const [, path, operator, rawValue] = match;
    const contextValue = this.resolvePath(path, context);
    const value = this.parseValue(rawValue);

    switch (operator) {
      case '>=':
        return Number(contextValue) >= Number(value);
      case '<=':
        return Number(contextValue) <= Number(value);
      case '>':
        return Number(contextValue) > Number(value);
      case '<':
        return Number(contextValue) < Number(value);
      case '==':
        return contextValue == value;
      case '!=':
        return contextValue != value;
      default:
        return true;
    }
  }

  validateDesign(rules: Rule[], context: RuleContext): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const suggestions: ValidationIssue[] = [];

    // Sort rules by priority (higher priority rules evaluated first)
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const result = this.evaluateRule(rule, context);

      if (result.applies && !result.passed) {
        const issue: ValidationIssue = {
          ruleId: rule.id,
          ruleName: rule.name,
          message: result.message || rule.description,
          severity: this.getSeverity(rule),
        };

        switch (issue.severity) {
          case 'error':
            errors.push(issue);
            break;
          case 'warning':
            warnings.push(issue);
            break;
          case 'suggestion':
            suggestions.push(issue);
            break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  private getContextValue(dimension: RuleDimension, context: RuleContext): any {
    // Map dimensions to context fields
    switch (dimension) {
      case 'room_type':
        return context.roomType || context.room_type;
      case 'platform':
        return context.platform;
      case 'ecosystem':
        return context.ecosystem;
      case 'tier':
        return context.tier || context.qualityTier;
      case 'use_case':
        return context.useCase || context.use_case;
      case 'client':
        return context.clientId || context.client;
      default:
        return context[dimension];
    }
  }

  private resolvePath(path: string, context: RuleContext): any {
    return path.split('.').reduce((obj, key) => obj?.[key], context);
  }

  private parseValue(value: string): any {
    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num)) return num;

    // Remove quotes for string values
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    // Boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    return value;
  }

  private getSeverity(rule: Rule): 'error' | 'warning' | 'suggestion' {
    // High priority rules are errors, medium are warnings, low are suggestions
    if (rule.priority >= 80) return 'error';
    if (rule.priority >= 40) return 'warning';
    return 'suggestion';
  }
}

export const ruleEngine = new RuleEngine();
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/features/standards/rule-engine.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Rule Engine for standards evaluation

- Condition evaluation (equals, greater_than, contains, etc.)
- Expression evaluation (simple constraint parser)
- Design validation with severity levels

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

*(Continuing with abbreviated tasks for remaining phases due to length)*

---

## Phase 5: Room Builder

> **REQUIRED SKILLS FOR THIS PHASE:**
> - @superpowers:test-driven-development - TDD for all features
> - @frontend-design:frontend-design - Invoke for canvas and panel UI components
> - @superpowers:requesting-code-review - After phase completion

### Task 5.1: Create Room Type Definitions

**Files:**
- Create: `src/types/room.ts`

```typescript
// src/types/room.ts
export interface Room {
  id: string;
  projectId: string;
  name: string;
  roomType: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: QualityTier;
  placedEquipment: PlacedEquipment[];
  createdAt: string;
  updatedAt: string;
}

export interface PlacedEquipment {
  id: string;
  equipmentId: string;
  x: number;
  y: number;
  rotation: number;
  mountType: 'floor' | 'wall' | 'ceiling' | 'rack';
  configuration?: Record<string, any>;
}

export type RoomType = 'huddle' | 'conference' | 'training' | 'boardroom' | 'auditorium';
export type Platform = 'teams' | 'zoom' | 'webex' | 'meet' | 'multi';
export type Ecosystem = 'poly' | 'logitech' | 'cisco' | 'crestron' | 'biamp' | 'qsc';
export type QualityTier = 'budget' | 'standard' | 'premium' | 'executive';
```

---

### Task 5.2: Create Canvas Component for Room Design

**Files:**
- Create: `src/features/room-builder/components/design-canvas.tsx`
- Create: `src/features/room-builder/hooks/use-canvas.ts`

---

### Task 5.3: Create Equipment Placement Logic

**Files:**
- Create: `src/features/room-builder/equipment-placement.ts`

---

### Task 5.4: Create Room Properties Panel

**Files:**
- Create: `src/features/room-builder/components/room-panel.tsx`

---

### Task 5.5: Create Validation Panel

**Files:**
- Create: `src/features/room-builder/components/validation-panel.tsx`

---

## Phase 6: Drawing Generation

### Task 6.1: Create Drawing Type Definitions

**Files:**
- Create: `src/types/drawing.ts`

```typescript
// src/types/drawing.ts
export type DrawingType = 'electrical' | 'elevation' | 'rcp' | 'rack' | 'cable_schedule' | 'floor_plan';

export interface Drawing {
  id: string;
  roomId: string;
  type: DrawingType;
  layers: DrawingLayer[];
  overrides: DrawingOverride[];
  generatedAt: string;
}

export interface DrawingLayer {
  id: string;
  name: string;
  type: 'title_block' | 'architectural' | 'av_elements' | 'annotations' | 'dimensions';
  isLocked: boolean;
  isVisible: boolean;
  elements: DrawingElement[];
}

export interface DrawingElement {
  id: string;
  type: 'equipment' | 'cable' | 'text' | 'dimension' | 'symbol';
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, any>;
}

export interface DrawingOverride {
  elementId: string;
  field: string;
  originalValue: any;
  newValue: any;
  createdAt: string;
}
```

---

### Task 6.2: Create Electrical Line Diagram Generator (Rust)

**Files:**
- Create: `src-tauri/src/drawings/electrical.rs`
- Create: `src-tauri/src/drawings/mod.rs`

---

### Task 6.3: Create Drawing Canvas Component

**Files:**
- Create: `src/features/drawings/components/drawing-canvas.tsx`

---

### Task 6.4: Create PDF Export (Rust)

**Files:**
- Create: `src-tauri/src/export/pdf.rs`

---

## Phase 7: Quoting & BOM System

> **REQUIRED SKILLS FOR THIS PHASE:**
> - @superpowers:test-driven-development - TDD for all features
> - @frontend-design:frontend-design - Invoke for Quote Card and Quote Page (Programa-style cards)
> - @superpowers:requesting-code-review - After phase completion

### Task 7.1: Create Quote Type Definitions

**Files:**
- Create: `src/types/quote.ts`

```typescript
// src/types/quote.ts
export interface Quote {
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

export type QuoteStatus = 'draft' | 'quoting' | 'client_review' | 'approved' | 'ordered';

export interface QuoteSection {
  id: string;
  name: string;
  category: string;
  items: QuoteItem[];
  subtotal: number;
}

export interface QuoteItem {
  id: string;
  equipmentId: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  margin: number;
  total: number;
  status: ItemStatus;
  notes?: string;
}

export type ItemStatus = 'quoting' | 'client_review' | 'ordered' | 'delivered' | 'installed';

export interface QuoteTotals {
  equipment: number;
  labor: number;
  subtotal: number;
  tax: number;
  total: number;
  margin: number;
  marginPercentage: number;
}
```

---

### Task 7.2: Create Quote Card Component (Programa-style)

**Files:**
- Create: `src/features/quoting/components/quote-card.tsx`

---

### Task 7.3: Create BOM Generator

**Files:**
- Create: `src/features/quoting/bom-generator.ts`

---

### Task 7.4: Create Pricing Rules Engine

**Files:**
- Create: `src/features/quoting/pricing-engine.ts`

---

### Task 7.5: Create Quote Page

**Files:**
- Create: `src/features/quoting/pages/quote-page.tsx`

---

## Phase 8: Integration & MVP Completion

> **REQUIRED SKILLS FOR THIS PHASE:**
> - @pg:design-postgres-tables - Invoke for Task 8.3 (Supabase schema design)
> - @superpowers:requesting-code-review - Final MVP review

### Task 8.1: Create App Router

**Files:**
- Create: `src/router.tsx`
- Modify: `src/App.tsx`

---

### Task 8.2: Wire Up All Feature Pages

**Files:**
- Modify: `src/components/layout/app-shell.tsx`

---

### Task 8.3: Create Supabase Database Migrations

> **INVOKE:** @pg:design-postgres-tables before designing schema - PostgreSQL best practices for Supabase

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Tables to Design:**
- `equipment` - Product library with full attributes from PRD
- `projects` - Project metadata
- `rooms` - Room configurations with dimensions and settings
- `placed_equipment` - Equipment placed in rooms
- `standards` - Standards hierarchy nodes
- `rules` - Validation rules attached to standards
- `quotes` - Quote headers with versioning
- `quote_items` - Line items in quotes
- `clients` - Client organizations
- `users` - User accounts with roles

---

### Task 8.4: End-to-End Testing

**Files:**
- Create: `tests/e2e/create-room.test.ts`
- Create: `tests/e2e/generate-quote.test.ts`

---

### Task 8.5: Final Build & Package

**Step 1: Build for production**

Run: `npm run tauri build`

**Step 2: Test built app**

Run: Open built application and verify all MVP features work

**Step 3: Create release commit**

```bash
git add .
git commit -m "feat: complete AV Designer MVP

- Equipment database with Programa-style library
- Standards engine with rule evaluation
- Room builder with canvas and validation
- Drawing generation (electrical, floor plan)
- Quoting system with BOM and pricing

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Appendix: Key Commands Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run tauri dev` |
| Run tests | `npm test` |
| Run specific test | `npm test tests/path/file.test.ts` |
| Build for production | `npm run tauri build` |
| Type check | `npx tsc --noEmit` |
| Lint | `npm run lint` |

---

## Appendix: Critical Files Quick Reference

| Purpose | File |
|---------|------|
| Design tokens | `tailwind.config.ts` |
| Supabase client | `src/lib/supabase.ts` |
| App state | `src/stores/app-store.ts` |
| Equipment types | `src/types/equipment.ts` |
| Standards types | `src/types/standards.ts` |
| Rule engine | `src/features/standards/rule-engine.ts` |
| App shell | `src/components/layout/app-shell.tsx` |
