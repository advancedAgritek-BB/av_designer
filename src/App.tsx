/**
 * Application Root Component
 *
 * Sets up providers and routing for the AV Designer application.
 */
import { useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Shell } from '@/components/layout';
import { AppRoutes, getModeByPath } from '@/router';
import { useAppStore } from '@/stores/app-store';

// Create QueryClient outside component to avoid re-creation on render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Route-to-Mode Synchronizer
 *
 * Keeps the app store mode in sync with the current route.
 * This ensures sidebar highlighting works correctly.
 */
function RouteModeSync() {
  const location = useLocation();
  const setMode = useAppStore((state) => state.setMode);

  useEffect(() => {
    const mode = getModeByPath(location.pathname);
    setMode(mode);
  }, [location.pathname, setMode]);

  return null;
}

/**
 * Main Application Content
 *
 * Wraps the router with Shell layout and handles global callbacks.
 */
function AppContent() {
  const handleSearchClick = () => {
    // TODO: Implement search modal
  };

  const handleUserMenuClick = () => {
    // TODO: Implement user menu dropdown
  };

  return (
    <>
      <RouteModeSync />
      <Shell
        userInitials="AV"
        onSearchClick={handleSearchClick}
        onUserMenuClick={handleUserMenuClick}
      >
        <AppRoutes />
      </Shell>
    </>
  );
}

/**
 * Application Root
 *
 * Sets up QueryClient, Router, and renders the main content.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </QueryClientProvider>
  );
}
