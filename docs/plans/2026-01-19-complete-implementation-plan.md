# Complete AV Designer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all remaining features to transform AV Designer from MVP to production-ready application with full authentication, real data, offline support, and professional drawing generation.

**Architecture:** Feature-first implementation with strict dependency ordering. Each phase builds foundation for subsequent phases. TDD throughout with frequent commits.

**Tech Stack:** TypeScript, React, Zustand, Supabase (Auth, Database, Realtime), SQLite (offline), Tauri (desktop), printpdf (Rust PDF generation)

---

## Implementation Overview

### Phase Dependency Graph

```
Phase 1: User Authentication (Foundation)
    ↓
Phase 2: Projects & Clients System
    ↓
Phase 3: Templates System ←──────────┐
    ↓                                │
Phase 4: Notifications System        │
    ↓                                │
Phase 5: Settings System             │
    ↓                                │
Phase 6: Real Data Integration ──────┘
    ↓
Phase 7: Drawing Generation System
    ↓
Phase 8: PDF Export System
    ↓
Phase 9: Supabase Production Deployment (Parallel from Phase 2)
    ↓
Phase 10: Offline Mode (Final)
```

### Estimated Scope

| Phase | New Files | Modified Files | Tests | Complexity |
|-------|-----------|----------------|-------|------------|
| 1. Authentication | ~25 | ~10 | ~180 | High |
| 2. Projects/Clients | ~30 | ~8 | ~200 | High |
| 3. Templates | ~18 | ~5 | ~200 | Medium |
| 4. Notifications | ~15 | ~6 | ~150 | Medium |
| 5. Settings | ~20 | ~5 | ~220 | Medium |
| 6. Real Data | ~12 | ~8 | ~100 | Medium |
| 7. Drawing Generation | ~25 | ~10 | ~180 | Very High |
| 8. PDF Export | ~10 | ~5 | ~80 | High |
| 9. Production Deploy | ~8 | ~12 | ~50 | Medium |
| 10. Offline Mode | ~15 | ~15 | ~150 | Very High |
| **Total** | **~178** | **~84** | **~1510** | |

---

## Phase 1: User Authentication System

**Reference:** `docs/plans/2026-01-18-user-authentication-design.md`

**Goal:** Implement complete auth system with organizations, teams, roles, and SSO support.

### Task 1.1: Database Schema - Users & Organizations

**Files:**
- Create: `supabase/migrations/001_auth_users_orgs.sql`

**Step 1: Write the migration file**

```sql
-- 001_auth_users_orgs.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  job_title TEXT,
  timezone TEXT DEFAULT 'America/Los_Angeles',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- Organization members (junction table)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by UUID REFERENCES public.users(id),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_members_org ON public.organization_members(org_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Org members can view their orgs
CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Org members can view other members in their org
CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Step 2: Apply migration locally**

Run: `npx supabase db push`
Expected: Migration applied successfully

**Step 3: Commit**

```bash
git add supabase/migrations/001_auth_users_orgs.sql
git commit -m "feat(auth): add users and organizations schema

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.2: Database Schema - Teams

**Files:**
- Create: `supabase/migrations/002_auth_teams.sql`

**Step 1: Write the migration file**

```sql
-- 002_auth_teams.sql

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

CREATE INDEX idx_teams_org ON public.teams(org_id);

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);

-- RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Org members can view teams in their org
CREATE POLICY "Org members can view teams"
  ON public.teams FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Team members can view their team members
CREATE POLICY "Team members can view members"
  ON public.team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );
```

**Step 2: Apply migration**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/002_auth_teams.sql
git commit -m "feat(auth): add teams schema

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.3: Auth Types

**Files:**
- Create: `src/features/auth/auth-types.ts`

**Step 1: Write types file**

```typescript
// src/features/auth/auth-types.ts

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type TeamRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  jobTitle: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  phone: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface OrganizationMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  joinedAt: string;
  invitedBy: string | null;
  user?: User;
}

export interface Team {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user?: User;
}

export interface AuthState {
  user: User | null;
  currentOrg: Organization | null;
  currentTeam: Team | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface CreateOrgData {
  name: string;
  slug: string;
  website?: string;
}
```

**Step 2: Commit**

```bash
git add src/features/auth/auth-types.ts
git commit -m "feat(auth): add auth types

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.4: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase.ts`

**Step 1: Write Supabase client**

```typescript
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
}
```

**Step 2: Add environment variables template**

Create: `.env.example`

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 3: Commit**

```bash
git add src/lib/supabase.ts .env.example
git commit -m "feat(auth): add Supabase client setup

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.5: Auth Service

**Files:**
- Create: `src/features/auth/auth-service.ts`
- Test: `src/features/auth/__tests__/auth-service.test.ts`

**Step 1: Write failing test**

```typescript
// src/features/auth/__tests__/auth-service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth-service';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create user and return user data', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });

      expect(result.user).toBeDefined();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { full_name: 'Test User' },
        },
      });
    });

    it('should throw error on signup failure', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already exists' } as any,
      });

      await expect(
        AuthService.signUp({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('signIn', () => {
    it('should sign in user and return session', async () => {
      const mockSession = { access_token: 'token123' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: { id: '123' } as any, session: mockSession as any },
        error: null,
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.session).toBeDefined();
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await AuthService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/auth/__tests__/auth-service.test.ts`
Expected: FAIL - module not found

**Step 3: Write implementation**

```typescript
// src/features/auth/auth-service.ts

import { supabase } from '@/lib/supabase';
import type {
  User,
  Organization,
  OrganizationMember,
  SignUpData,
  SignInData,
  CreateOrgData,
} from './auth-types';

function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    jobTitle: row.job_title,
    timezone: row.timezone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrgFromDb(row: any): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    website: row.website,
    phone: row.phone,
    address: row.address || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

export class AuthService {
  static async signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    });

    if (error) throw new Error(error.message);
    return authData;
  }

  static async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    return authData;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !data) return null;
    return mapUserFromDb(data);
  }

  static async getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        org_id,
        organizations (*)
      `)
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((row: any) => mapOrgFromDb(row.organizations));
  }

  static async createOrganization(data: CreateOrgData): Promise<Organization> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        name: data.name,
        slug: data.slug,
        website: data.website,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Add creator as owner
    await supabase.from('organization_members').insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner',
    });

    return mapOrgFromDb(org);
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
        phone: updates.phone,
        job_title: updates.jobTitle,
        timezone: updates.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapUserFromDb(data);
  }
}
```

**Step 4: Run tests**

Run: `npm test -- src/features/auth/__tests__/auth-service.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/auth/auth-service.ts src/features/auth/__tests__/auth-service.test.ts
git commit -m "feat(auth): add auth service with signup, signin, signout

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.6: Auth Store

**Files:**
- Create: `src/features/auth/auth-store.ts`
- Test: `src/features/auth/__tests__/auth-store.test.ts`

**Step 1: Write failing test**

```typescript
// src/features/auth/__tests__/auth-store.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../auth-store';
import { AuthService } from '../auth-service';

vi.mock('../auth-service');

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.currentOrg).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('should set user on successful sign in', async () => {
    const mockUser = { id: '123', email: 'test@example.com', fullName: 'Test' };
    vi.mocked(AuthService.signIn).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(AuthService.getUserOrganizations).mockResolvedValue([]);

    await useAuthStore.getState().signIn({ email: 'test@example.com', password: 'pass' });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('should clear user on sign out', async () => {
    useAuthStore.setState({ user: { id: '123' } as any, isAuthenticated: true });
    vi.mocked(AuthService.signOut).mockResolvedValue(undefined);

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
```

**Step 2: Run test to verify failure**

Run: `npm test -- src/features/auth/__tests__/auth-store.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/features/auth/auth-store.ts

import { create } from 'zustand';
import { AuthService } from './auth-service';
import type {
  User,
  Organization,
  Team,
  AuthState,
  SignUpData,
  SignInData,
  CreateOrgData,
} from './auth-types';

interface AuthStore extends AuthState {
  organizations: Organization[];
  teams: Team[];

  // Actions
  initialize: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentOrg: (org: Organization | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  createOrganization: (data: CreateOrgData) => Promise<Organization>;
  reset: () => void;
}

const initialState: AuthState & { organizations: Organization[]; teams: Team[] } = {
  user: null,
  currentOrg: null,
  currentTeam: null,
  isLoading: true,
  isAuthenticated: false,
  organizations: [],
  teams: [],
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  initialize: async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        const organizations = await AuthService.getUserOrganizations(user.id);
        set({
          user,
          organizations,
          currentOrg: organizations[0] || null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  signUp: async (data) => {
    set({ isLoading: true });
    try {
      await AuthService.signUp(data);
      // User needs to verify email before signing in
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signIn: async (data) => {
    set({ isLoading: true });
    try {
      await AuthService.signIn(data);
      const user = await AuthService.getCurrentUser();
      if (user) {
        const organizations = await AuthService.getUserOrganizations(user.id);
        set({
          user,
          organizations,
          currentOrg: organizations[0] || null,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    await AuthService.signOut();
    set(initialState);
    set({ isLoading: false });
  },

  setCurrentOrg: (org) => {
    set({ currentOrg: org, currentTeam: null });
  },

  setCurrentTeam: (team) => {
    set({ currentTeam: team });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const updatedUser = await AuthService.updateProfile(user.id, updates);
    set({ user: updatedUser });
  },

  createOrganization: async (data) => {
    const org = await AuthService.createOrganization(data);
    set((state) => ({
      organizations: [...state.organizations, org],
      currentOrg: org,
    }));
    return org;
  },

  reset: () => {
    set(initialState);
  },
}));
```

**Step 4: Run tests**

Run: `npm test -- src/features/auth/__tests__/auth-store.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/auth/auth-store.ts src/features/auth/__tests__/auth-store.test.ts
git commit -m "feat(auth): add auth store with Zustand

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.7: Auth React Hooks

**Files:**
- Create: `src/features/auth/use-auth.ts`

**Step 1: Write hooks**

```typescript
// src/features/auth/use-auth.ts

import { useEffect } from 'react';
import { useAuthStore } from './auth-store';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    store.initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await store.initialize();
        } else if (event === 'SIGNED_OUT') {
          store.reset();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user: store.user,
    currentOrg: store.currentOrg,
    currentTeam: store.currentTeam,
    organizations: store.organizations,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    setCurrentOrg: store.setCurrentOrg,
    setCurrentTeam: store.setCurrentTeam,
    updateProfile: store.updateProfile,
    createOrganization: store.createOrganization,
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    requireAuth: !isLoading && !isAuthenticated,
  };
}

export function useCurrentUser() {
  const { user, isLoading } = useAuthStore();
  return { user, isLoading };
}

export function useCurrentOrg() {
  const { currentOrg, organizations, setCurrentOrg } = useAuthStore();
  return { currentOrg, organizations, setCurrentOrg };
}
```

**Step 2: Commit**

```bash
git add src/features/auth/use-auth.ts
git commit -m "feat(auth): add React hooks for auth

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.8: Login Page Component

**Files:**
- Create: `src/features/auth/components/LoginPage.tsx`
- Create: `src/features/auth/components/LoginForm.tsx`
- Test: `src/features/auth/components/__tests__/LoginForm.test.tsx`

**Step 1: Write failing test**

```typescript
// src/features/auth/components/__tests__/LoginForm.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  it('should render email and password fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('should disable submit button while loading', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading />);

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
```

**Step 2: Run test to verify failure**

Run: `npm test -- src/features/auth/components/__tests__/LoginForm.test.tsx`
Expected: FAIL

**Step 3: Write LoginForm component**

```typescript
// src/features/auth/components/LoginForm.tsx

import { useState } from 'react';
import type { SignInData } from '../auth-types';

interface LoginFormProps {
  onSubmit: (data: SignInData) => Promise<void> | void;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (!password) {
      setValidationError('Password is required');
      return;
    }

    await onSubmit({ email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      {(validationError || error) && (
        <div className="form-error" role="alert">
          {validationError || error}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn btn-primary">
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
```

**Step 4: Write LoginPage component**

```typescript
// src/features/auth/components/LoginPage.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../use-auth';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      setError(null);
      await signIn(data);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your account</p>
        </div>

        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Run tests**

Run: `npm test -- src/features/auth/components/__tests__/LoginForm.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add src/features/auth/components/
git commit -m "feat(auth): add login page and form components

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.9: Signup Page Component

**Files:**
- Create: `src/features/auth/components/SignupPage.tsx`
- Create: `src/features/auth/components/SignupForm.tsx`
- Test: `src/features/auth/components/__tests__/SignupForm.test.tsx`

(Similar pattern to LoginForm - write test first, implement, run tests, commit)

### Task 1.10: Auth Guard Component

**Files:**
- Create: `src/features/auth/components/AuthGuard.tsx`

**Step 1: Write implementation**

```typescript
// src/features/auth/components/AuthGuard.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useRequireAuth } from '../use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, requireAuth } = useRequireAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (requireAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

**Step 2: Commit**

```bash
git add src/features/auth/components/AuthGuard.tsx
git commit -m "feat(auth): add auth guard component for protected routes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.11: Feature Index Export

**Files:**
- Create: `src/features/auth/index.ts`

**Step 1: Write exports**

```typescript
// src/features/auth/index.ts

// Types
export * from './auth-types';

// Service
export { AuthService } from './auth-service';

// Store
export { useAuthStore } from './auth-store';

// Hooks
export { useAuth, useRequireAuth, useCurrentUser, useCurrentOrg } from './use-auth';

// Components
export { LoginPage } from './components/LoginPage';
export { LoginForm } from './components/LoginForm';
export { SignupPage } from './components/SignupPage';
export { SignupForm } from './components/SignupForm';
export { AuthGuard } from './components/AuthGuard';
```

**Step 2: Commit**

```bash
git add src/features/auth/index.ts
git commit -m "feat(auth): add feature index exports

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.12: Integrate Auth into App Router

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/routes.tsx` (or equivalent router config)

**Step 1: Update App to include auth initialization**

```typescript
// In src/App.tsx - add auth provider wrapper

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth';

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ... rest of app
}
```

**Step 2: Update routes with auth guard**

```typescript
// In routes config - wrap protected routes

import { AuthGuard, LoginPage, SignupPage } from '@/features/auth';

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      // ... protected routes
    ],
  },
];
```

**Step 3: Commit**

```bash
git add src/App.tsx src/routes.tsx
git commit -m "feat(auth): integrate auth into app router

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Task 1.13: Auth Styles

**Files:**
- Create: `src/styles/features/auth.css`

**Step 1: Write styles**

```css
/* src/styles/features/auth.css */

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: var(--space-6);
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.auth-header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.auth-header p {
  color: var(--text-secondary);
}

.login-form,
.signup-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-field label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.form-field input {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
}

.form-field input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-primary-alpha);
}

.form-error {
  padding: var(--space-2) var(--space-3);
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: var(--radius-md);
  color: var(--error-text);
  font-size: var(--text-sm);
}

.auth-footer {
  margin-top: var(--space-6);
  text-align: center;
}

.auth-footer p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--accent-primary);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.auth-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}
```

**Step 2: Import in globals**

Add to `src/styles/globals.css`:
```css
@import './features/auth.css';
```

**Step 3: Commit**

```bash
git add src/styles/features/auth.css src/styles/globals.css
git commit -m "feat(auth): add auth page styles

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Projects & Clients System

**Reference:** `docs/plans/2026-01-18-projects-clients-design.md`

**Goal:** Implement complete projects and clients management with hierarchy, contacts, pricing, and activity tracking.

### Task 2.1: Database Schema - Clients

**Files:**
- Create: `supabase/migrations/003_clients.sql`

(Similar detailed TDD pattern as Phase 1 tasks)

### Task 2.2: Database Schema - Projects

**Files:**
- Create: `supabase/migrations/004_projects.sql`

### Task 2.3: Database Schema - Workstreams & Tasks

**Files:**
- Create: `supabase/migrations/005_workstreams_tasks.sql`

### Task 2.4: Client Types

**Files:**
- Create: `src/features/clients/client-types.ts`

### Task 2.5: Client Service

**Files:**
- Create: `src/features/clients/client-service.ts`
- Test: `src/features/clients/__tests__/client-service.test.ts`

### Task 2.6: Client Store

**Files:**
- Create: `src/features/clients/client-store.ts`

### Task 2.7: Client Hooks

**Files:**
- Create: `src/features/clients/use-clients.ts`

### Task 2.8: Clients List Page

**Files:**
- Create: `src/features/clients/components/ClientsPage.tsx`
- Create: `src/features/clients/components/ClientCard.tsx`
- Create: `src/features/clients/components/ClientList.tsx`

### Task 2.9: Client Detail Page

**Files:**
- Create: `src/features/clients/components/ClientDetailPage.tsx`
- Create: `src/features/clients/components/ClientOverviewTab.tsx`
- Create: `src/features/clients/components/ClientContactsTab.tsx`

### Task 2.10: Project Types

**Files:**
- Create: `src/features/projects/project-types.ts`

### Task 2.11: Project Service

**Files:**
- Create: `src/features/projects/project-service.ts`
- Test: `src/features/projects/__tests__/project-service.test.ts`

### Task 2.12: Project Store

**Files:**
- Create: `src/features/projects/project-store.ts`

### Task 2.13: Projects Kanban View

**Files:**
- Create: `src/features/projects/components/ProjectsKanban.tsx`
- Create: `src/features/projects/components/ProjectCard.tsx`

### Task 2.14: Projects List View

**Files:**
- Create: `src/features/projects/components/ProjectsList.tsx`

### Task 2.15: Project Detail Page

**Files:**
- Create: `src/features/projects/components/ProjectDetailPage.tsx`

### Task 2.16: Workstream & Task Components

**Files:**
- Create: `src/features/projects/components/WorkstreamPanel.tsx`
- Create: `src/features/projects/components/TaskList.tsx`
- Create: `src/features/projects/components/TaskCard.tsx`

### Task 2.17: Activity Feed

**Files:**
- Create: `src/features/projects/components/ActivityFeed.tsx`

### Task 2.18: Styles

**Files:**
- Create: `src/styles/features/clients.css`
- Create: `src/styles/features/projects.css`

---

## Phase 3: Templates System

**Reference:** `docs/plans/2026-01-18-templates-design.md`

(18 tasks following same TDD pattern)

---

## Phase 4: Notifications System

**Reference:** `docs/plans/2026-01-18-notifications-design.md`

(15 tasks following same TDD pattern)

---

## Phase 5: Settings System

**Reference:** `docs/plans/2026-01-18-settings-design.md`

(20 tasks following same TDD pattern)

---

## Phase 6: Real Data Integration

**Reference:** `docs/plans/2026-01-18-real-data-integration-design.md`

(12 tasks following same TDD pattern)

---

## Phase 7: Drawing Generation System

**Reference:** `docs/plans/2026-01-18-drawing-generation-design.md`

(25 tasks following same TDD pattern)

---

## Phase 8: PDF Export System

**Reference:** `docs/plans/2026-01-18-pdf-export-design.md`

(10 tasks following same TDD pattern)

---

## Phase 9: Supabase Production Deployment

**Reference:** `docs/plans/2026-01-18-supabase-production-deployment-design.md`

(8 tasks following same TDD pattern)

---

## Phase 10: Offline Mode

**Reference:** `docs/plans/2026-01-18-offline-mode-design.md`

(15 tasks following same TDD pattern)

---

## Verification Checkpoints

After each phase, verify:

1. **All tests pass:** `npm test`
2. **Build succeeds:** `npm run build`
3. **No lint errors:** `npm run lint`
4. **Type check passes:** `npm run typecheck`
5. **Feature works end-to-end:** Manual testing

---

## Commit Conventions

All commits should follow this format:

```
<type>(<scope>): <description>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `test`, `docs`, `refactor`, `style`, `chore`

Scopes: `auth`, `clients`, `projects`, `templates`, `notifications`, `settings`, `data`, `drawings`, `pdf`, `deploy`, `offline`
