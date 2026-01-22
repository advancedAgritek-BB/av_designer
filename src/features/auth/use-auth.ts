/**
 * Auth React Hooks
 *
 * Provides convenient hooks for authentication in React components.
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from './auth-store';
import { supabase } from '@/lib/supabase';

/**
 * Main auth hook - provides all auth functionality
 *
 * Uses a ref-based initialization pattern to ensure the auth store
 * is initialized exactly once, avoiding the need for eslint-disable
 * comments on the exhaustive-deps rule.
 */
export function useAuth() {
  const store = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      store.initialize();
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await store.initialize();
      } else if (event === 'SIGNED_OUT') {
        store.reset();
      }
      // TOKEN_REFRESHED: no action needed
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [store]);

  return {
    // State
    user: store.user,
    currentOrg: store.currentOrg,
    currentTeam: store.currentTeam,
    organizations: store.organizations,
    teams: store.teams,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    error: store.error,

    // Actions
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    setCurrentOrg: store.setCurrentOrg,
    setCurrentTeam: store.setCurrentTeam,
    updateProfile: store.updateProfile,
    createOrganization: store.createOrganization,
    clearError: store.clearError,
  };
}

/**
 * Hook for checking if auth is required
 * Useful for protected route logic
 */
export function useRequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  return {
    isAuthenticated,
    isLoading,
    requireAuth: !isLoading && !isAuthenticated,
  };
}

/**
 * Hook for accessing just the current user
 */
export function useCurrentUser() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  return { user, isLoading };
}

/**
 * Hook for accessing organization context
 */
export function useCurrentOrg() {
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const organizations = useAuthStore((s) => s.organizations);
  const setCurrentOrg = useAuthStore((s) => s.setCurrentOrg);

  return { currentOrg, organizations, setCurrentOrg };
}

/**
 * Hook for accessing team context
 */
export function useCurrentTeam() {
  const currentTeam = useAuthStore((s) => s.currentTeam);
  const teams = useAuthStore((s) => s.teams);
  const setCurrentTeam = useAuthStore((s) => s.setCurrentTeam);

  return { currentTeam, teams, setCurrentTeam };
}

/**
 * Hook for auth error state
 */
export function useAuthError() {
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  return { error, clearError };
}
