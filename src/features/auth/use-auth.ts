/**
 * useAuth Hook - Authentication hook with proper initialization
 *
 * Provides access to auth state and actions, ensuring the auth store
 * is initialized exactly once when the hook is first used.
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from './auth-store';

/**
 * Custom hook for authentication
 *
 * Uses a ref-based initialization pattern to ensure the auth store
 * is initialized exactly once, avoiding the need for eslint-disable
 * comments on the exhaustive-deps rule.
 *
 * The initialize function reference is stable (from Zustand), so we
 * extract it directly from the store. The ref guards against any
 * potential multiple calls during React Strict Mode double-invocation.
 */
export function useAuth() {
  const authStore = useAuthStore();
  const initialize = useAuthStore((state) => state.initialize);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initialize();
    }
  }, [initialize]);

  return authStore;
}
