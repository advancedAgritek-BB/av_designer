/**
 * Auth Store - Zustand store for authentication state management
 */

import { create } from 'zustand';
import { logger } from '../../lib/logger';
import { AuthService } from './auth-service';
import type {
  Organization,
  Team,
  AuthState,
  SignUpData,
  SignInData,
  CreateOrgData,
  UpdateOrganizationData,
  UpdateProfileData,
} from './auth-types';

function getDefaultOrganizationName(user: { fullName?: string | null; email?: string | null }) {
  const fullName = user.fullName?.trim();
  const firstName = fullName ? fullName.split(/\s+/)[0] : null;
  if (firstName) return `${firstName}'s Workspace`;

  const email = user.email?.trim();
  if (email) {
    const handle = email.split('@')[0]?.trim();
    if (handle) return `${handle}'s Workspace`;
  }

  return 'My Workspace';
}

function getDefaultOrganizationSlug(userId: string) {
  const prefix = userId.split('-')[0] || userId.slice(0, 8);
  return `workspace-${prefix}`.toLowerCase();
}

// ============================================================================
// Store Interface
// ============================================================================

interface AuthStore extends AuthState {
  // Actions
  initialize: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentOrg: (org: Organization | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  updateProfile: (updates: UpdateProfileData) => Promise<void>;
  updateOrganization: (
    orgId: string,
    updates: UpdateOrganizationData
  ) => Promise<Organization>;
  createOrganization: (data: CreateOrgData) => Promise<Organization>;
  loadTeamsForOrg: (orgId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: AuthState = {
  user: null,
  currentOrg: null,
  currentTeam: null,
  organizations: [],
  teams: [],
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// ============================================================================
// Store
// ============================================================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  /**
   * Initialize auth state from session
   */
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      const user = await AuthService.getCurrentUser();

      if (user) {
        let organizations = await AuthService.getUserOrganizations(user.id);
        let currentOrg = organizations[0] || null;

        // If the user has no memberships yet, try to recover any org they created,
        // then bootstrap their membership. If still none, create a default org so
        // core features (equipment/templates) aren't blocked.
        if (!currentOrg) {
          try {
            const createdOrgs = await AuthService.getOrganizationsCreatedByUser(user.id);
            const fallbackOrg = createdOrgs[0] ?? null;
            if (fallbackOrg) {
              await AuthService.ensureOrganizationMembership(
                fallbackOrg.id,
                user.id,
                'owner'
              );
              organizations = [fallbackOrg];
              currentOrg = fallbackOrg;
            } else {
              const defaultOrg = await AuthService.createOrganization({
                name: getDefaultOrganizationName(user),
                slug: getDefaultOrganizationSlug(user.id),
              });
              organizations = [defaultOrg];
              currentOrg = defaultOrg;
            }
          } catch (error) {
            logger.warn('Failed to bootstrap default organization:', error);
          }
        }

        let teams: Team[] = [];
        if (currentOrg) {
          teams = await AuthService.getUserTeams(user.id, currentOrg.id);
        }

        set({
          user,
          organizations,
          currentOrg,
          teams,
          currentTeam: teams[0] || null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          organizations: [],
          currentOrg: null,
          teams: [],
          currentTeam: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      logger.error('Auth initialization error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
      });
    }
  },

  /**
   * Sign up a new user
   */
  signUp: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.signUp(data);
      // User needs to verify email before signing in
      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Sign in an existing user
   */
  signIn: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.signIn(data);

      const user = await AuthService.getCurrentUser();

      if (!user) {
        const message =
          'Signed in, but failed to load your user profile. This usually means the Supabase database schema is missing (public.users) or your profile row was not created.';
        set({ isLoading: false, error: message });
        throw new Error(message);
      }

      let organizations = await AuthService.getUserOrganizations(user.id);
      let currentOrg = organizations[0] || null;

      if (!currentOrg) {
        try {
          const createdOrgs = await AuthService.getOrganizationsCreatedByUser(user.id);
          const fallbackOrg = createdOrgs[0] ?? null;
          if (fallbackOrg) {
            await AuthService.ensureOrganizationMembership(
              fallbackOrg.id,
              user.id,
              'owner'
            );
            organizations = [fallbackOrg];
            currentOrg = fallbackOrg;
          } else {
            const defaultOrg = await AuthService.createOrganization({
              name: getDefaultOrganizationName(user),
              slug: getDefaultOrganizationSlug(user.id),
            });
            organizations = [defaultOrg];
            currentOrg = defaultOrg;
          }
        } catch (error) {
          logger.warn('Failed to bootstrap default organization:', error);
        }
      }

      let teams: Team[] = [];
      if (currentOrg) {
        teams = await AuthService.getUserTeams(user.id, currentOrg.id);
      }

      set({
        user,
        organizations,
        currentOrg,
        teams,
        currentTeam: teams[0] || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      await AuthService.signOut();
    } finally {
      set({ ...initialState, isLoading: false });
    }
  },

  /**
   * Set the current organization
   */
  setCurrentOrg: (org) => {
    set({ currentOrg: org, currentTeam: null, teams: [] });

    // Load teams for the new org
    const { user } = get();
    if (org && user) {
      get().loadTeamsForOrg(org.id);
    }
  },

  /**
   * Set the current team
   */
  setCurrentTeam: (team) => {
    set({ currentTeam: team });
  },

  /**
   * Update the current user's profile
   */
  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      const updatedUser = await AuthService.updateProfile(user.id, updates);
      set({ user: updatedUser });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Create a new organization
   */
  createOrganization: async (data) => {
    try {
      const org = await AuthService.createOrganization(data);
      set((state) => ({
        organizations: [...state.organizations, org],
        currentOrg: org,
        teams: [],
        currentTeam: null,
      }));
      return org;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create organization';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Update an organization profile
   */
  updateOrganization: async (orgId, updates) => {
    try {
      const updatedOrg = await AuthService.updateOrganization(orgId, updates);
      set((state) => ({
        organizations: state.organizations.map((org) =>
          org.id === orgId ? updatedOrg : org
        ),
        currentOrg: state.currentOrg?.id === orgId ? updatedOrg : state.currentOrg,
      }));
      return updatedOrg;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update organization';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Load teams for a specific organization
   */
  loadTeamsForOrg: async (orgId) => {
    const { user } = get();
    if (!user) return;

    try {
      const teams = await AuthService.getUserTeams(user.id, orgId);
      set({ teams, currentTeam: teams[0] || null });
    } catch (error) {
      logger.error('Failed to load teams:', error);
    }
  },

  /**
   * Refresh the current user profile from the database
   */
  refreshUser: async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        set({ user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      logger.error('Failed to refresh user:', error);
    }
  },

  /**
   * Clear the error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset to initial state
   */
  reset: () => {
    set({ ...initialState, isLoading: false });
  },
}));
