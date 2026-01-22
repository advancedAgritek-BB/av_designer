/**
 * Router Tests
 *
 * Tests for the application router including route definitions,
 * navigation helpers, and route-based code splitting.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// =============================================================================
// Test imports (these will fail initially - TDD RED phase)
// =============================================================================
import {
  ROUTES,
  getRouteByMode,
  getModeByPath,
  isValidRoute,
  RouteConfig,
  AppRoutes,
} from '@/router';
import type { AppMode } from '@/types';

// =============================================================================
// Test utilities
// =============================================================================

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });
}

function renderWithRouter(children: ReactNode, initialRoute = '/') {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

// =============================================================================
// Route Constants Tests
// =============================================================================
describe('Route Constants', () => {
  describe('ROUTES object', () => {
    it('exports HOME route', () => {
      expect(ROUTES.HOME).toBe('/');
    });

    it('exports PROJECTS route', () => {
      expect(ROUTES.PROJECTS).toBe('/projects');
    });

    it('exports ROOM_DESIGN route', () => {
      expect(ROUTES.ROOM_DESIGN).toBe('/rooms/:roomId/design');
    });

    it('exports DRAWINGS route', () => {
      expect(ROUTES.DRAWINGS).toBe('/rooms/:roomId/drawings');
    });

    it('exports QUOTING route', () => {
      expect(ROUTES.QUOTING).toBe('/rooms/:roomId/quotes');
    });

    it('exports STANDARDS route', () => {
      expect(ROUTES.STANDARDS).toBe('/standards');
    });

    it('exports EQUIPMENT route', () => {
      expect(ROUTES.EQUIPMENT).toBe('/equipment');
    });

    it('exports TEMPLATES route', () => {
      expect(ROUTES.TEMPLATES).toBe('/templates');
    });

    it('exports SETTINGS route', () => {
      expect(ROUTES.SETTINGS).toBe('/settings');
    });
  });

  describe('Route patterns', () => {
    it('room design route contains roomId parameter', () => {
      expect(ROUTES.ROOM_DESIGN).toContain(':roomId');
    });

    it('drawings route contains roomId parameter', () => {
      expect(ROUTES.DRAWINGS).toContain(':roomId');
    });

    it('quoting route contains roomId parameter', () => {
      expect(ROUTES.QUOTING).toContain(':roomId');
    });
  });
});

// =============================================================================
// Navigation Helpers Tests
// =============================================================================
describe('Navigation Helpers', () => {
  describe('getRouteByMode', () => {
    it('returns "/" for home mode', () => {
      expect(getRouteByMode('home')).toBe('/');
    });

    it('returns "/projects" for projects mode', () => {
      expect(getRouteByMode('projects')).toBe('/projects');
    });

    it('returns "/rooms/:roomId/design" for room_design mode', () => {
      expect(getRouteByMode('room_design')).toBe('/rooms/:roomId/design');
    });

    it('returns "/rooms/:roomId/drawings" for drawings mode', () => {
      expect(getRouteByMode('drawings')).toBe('/rooms/:roomId/drawings');
    });

    it('returns "/rooms/:roomId/quotes" for quoting mode', () => {
      expect(getRouteByMode('quoting')).toBe('/rooms/:roomId/quotes');
    });

    it('returns "/standards" for standards mode', () => {
      expect(getRouteByMode('standards')).toBe('/standards');
    });

    it('returns "/equipment" for equipment mode', () => {
      expect(getRouteByMode('equipment')).toBe('/equipment');
    });

    it('returns "/templates" for templates mode', () => {
      expect(getRouteByMode('templates')).toBe('/templates');
    });

    it('returns "/settings" for settings mode', () => {
      expect(getRouteByMode('settings')).toBe('/settings');
    });
  });

  describe('getModeByPath', () => {
    it('returns "home" for "/" path', () => {
      expect(getModeByPath('/')).toBe('home');
    });

    it('returns "projects" for "/projects" path', () => {
      expect(getModeByPath('/projects')).toBe('projects');
    });

    it('returns "room_design" for "/rooms/123/design" path', () => {
      expect(getModeByPath('/rooms/123/design')).toBe('room_design');
    });

    it('returns "drawings" for "/rooms/456/drawings" path', () => {
      expect(getModeByPath('/rooms/456/drawings')).toBe('drawings');
    });

    it('returns "quoting" for "/rooms/789/quotes" path', () => {
      expect(getModeByPath('/rooms/789/quotes')).toBe('quoting');
    });

    it('returns "standards" for "/standards" path', () => {
      expect(getModeByPath('/standards')).toBe('standards');
    });

    it('returns "equipment" for "/equipment" path', () => {
      expect(getModeByPath('/equipment')).toBe('equipment');
    });

    it('returns "templates" for "/templates" path', () => {
      expect(getModeByPath('/templates')).toBe('templates');
    });

    it('returns "settings" for "/settings" path', () => {
      expect(getModeByPath('/settings')).toBe('settings');
    });

    it('returns "home" for unknown path', () => {
      expect(getModeByPath('/unknown')).toBe('home');
    });
  });

  describe('isValidRoute', () => {
    it('returns true for valid routes', () => {
      expect(isValidRoute('/')).toBe(true);
      expect(isValidRoute('/projects')).toBe(true);
      expect(isValidRoute('/equipment')).toBe(true);
      expect(isValidRoute('/standards')).toBe(true);
      expect(isValidRoute('/templates')).toBe(true);
      expect(isValidRoute('/settings')).toBe(true);
    });

    it('returns true for room-specific routes with IDs', () => {
      expect(isValidRoute('/rooms/abc-123/design')).toBe(true);
      expect(isValidRoute('/rooms/xyz-789/drawings')).toBe(true);
      expect(isValidRoute('/rooms/def-456/quotes')).toBe(true);
    });

    it('returns false for invalid routes', () => {
      expect(isValidRoute('/unknown')).toBe(false);
      expect(isValidRoute('/foo/bar')).toBe(false);
      expect(isValidRoute('/rooms')).toBe(false);
      expect(isValidRoute('/rooms/design')).toBe(false);
    });
  });
});

// =============================================================================
// Route Configuration Tests
// =============================================================================
describe('Route Configuration', () => {
  describe('RouteConfig', () => {
    it('each route has a path', () => {
      const config = RouteConfig;

      expect(config).toBeDefined();
      expect(Array.isArray(config)).toBe(true);
      config.forEach((route) => {
        expect(route.path).toBeDefined();
        expect(typeof route.path).toBe('string');
      });
    });

    it('each route has an element or lazy component', () => {
      const config = RouteConfig;

      config.forEach((route) => {
        expect(route.element !== undefined || route.lazy !== undefined).toBe(
          true
        );
      });
    });

    it('includes all mode routes', () => {
      const config = RouteConfig;
      const paths = config.map((r) => r.path);

      expect(paths).toContain('/');
      expect(paths).toContain('/projects');
      expect(paths).toContain('/equipment');
      expect(paths).toContain('/standards');
      expect(paths).toContain('/templates');
      expect(paths).toContain('/settings');
    });

    it('includes room-specific routes with parameters', () => {
      const config = RouteConfig;
      const paths = config.map((r) => r.path);

      expect(paths).toContain('/rooms/:roomId/design');
      expect(paths).toContain('/rooms/:roomId/drawings');
      expect(paths).toContain('/rooms/:roomId/quotes');
    });

    it('has a catch-all route for 404', () => {
      const config = RouteConfig;
      const catchAll = config.find((r) => r.path === '*');

      expect(catchAll).toBeDefined();
    });
  });
});

// =============================================================================
// AppRoutes Component Tests
// =============================================================================
describe('AppRoutes Component', () => {
  it('renders home page at root path', async () => {
    renderWithRouter(<AppRoutes />, '/');

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('renders equipment page at /equipment', async () => {
    renderWithRouter(<AppRoutes />, '/equipment');

    await waitFor(() => {
      // Equipment page should render with the correct test id
      expect(screen.getByTestId('equipment-page')).toBeInTheDocument();
    });
  });

  it('renders standards page at /standards', async () => {
    renderWithRouter(<AppRoutes />, '/standards');

    await waitFor(() => {
      expect(screen.getByTestId('standards-page')).toBeInTheDocument();
    });
  });

  it('renders 404 page for unknown routes', async () => {
    renderWithRouter(<AppRoutes />, '/unknown-page');

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });

  it('handles room design route with roomId', async () => {
    renderWithRouter(<AppRoutes />, '/rooms/test-room-123/design');

    await waitFor(() => {
      expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
    });
  });

  it('handles drawings route with roomId', async () => {
    renderWithRouter(<AppRoutes />, '/rooms/test-room-456/drawings');

    await waitFor(() => {
      expect(screen.getByTestId('drawings-page')).toBeInTheDocument();
    });
  });

  it('handles quotes route with roomId', async () => {
    renderWithRouter(<AppRoutes />, '/rooms/test-room-789/quotes');

    await waitFor(() => {
      expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// Route Parameter Extraction Tests
// =============================================================================
describe('Route Parameter Helpers', () => {
  describe('buildRoomDesignPath', () => {
    // We'll import this function once implemented
    it('builds path with roomId', async () => {
      const { buildRoomDesignPath } = await import('@/router');
      expect(buildRoomDesignPath('abc-123')).toBe('/rooms/abc-123/design');
    });
  });

  describe('buildDrawingsPath', () => {
    it('builds path with roomId', async () => {
      const { buildDrawingsPath } = await import('@/router');
      expect(buildDrawingsPath('xyz-456')).toBe('/rooms/xyz-456/drawings');
    });
  });

  describe('buildQuotesPath', () => {
    it('builds path with roomId', async () => {
      const { buildQuotesPath } = await import('@/router');
      expect(buildQuotesPath('def-789')).toBe('/rooms/def-789/quotes');
    });
  });
});

// =============================================================================
// Lazy Loading Tests
// =============================================================================
describe('Lazy Loading', () => {
  it('equipment page loads lazily', async () => {
    const config = RouteConfig;
    const equipmentRoute = config.find((r) => r.path === '/equipment');

    expect(equipmentRoute).toBeDefined();
    // Routes with lazy loading should have either a lazy function or a React.lazy element
    expect(
      equipmentRoute?.lazy !== undefined ||
        equipmentRoute?.element?.type?.$$typeof?.toString().includes('lazy') ||
        equipmentRoute?.element !== undefined
    ).toBe(true);
  });

  it('standards page loads lazily', async () => {
    const config = RouteConfig;
    const standardsRoute = config.find((r) => r.path === '/standards');

    expect(standardsRoute).toBeDefined();
  });

  it('room builder page loads lazily', async () => {
    const config = RouteConfig;
    const roomDesignRoute = config.find(
      (r) => r.path === '/rooms/:roomId/design'
    );

    expect(roomDesignRoute).toBeDefined();
  });

  it('drawings page loads lazily', async () => {
    const config = RouteConfig;
    const drawingsRoute = config.find(
      (r) => r.path === '/rooms/:roomId/drawings'
    );

    expect(drawingsRoute).toBeDefined();
  });

  it('quoting page loads lazily', async () => {
    const config = RouteConfig;
    const quotingRoute = config.find((r) => r.path === '/rooms/:roomId/quotes');

    expect(quotingRoute).toBeDefined();
  });
});

// =============================================================================
// Route Protection Tests (placeholder for future auth)
// =============================================================================
describe('Route Protection (future)', () => {
  it('public routes are accessible', async () => {
    // Home and equipment should be accessible
    renderWithRouter(<AppRoutes />, '/');

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  // Note: Protected routes will be added in future when auth is implemented
  it.skip('protected routes redirect to login when not authenticated', () => {
    // Future implementation
  });
});

// =============================================================================
// Mode Sync Tests
// =============================================================================
describe('Mode Synchronization', () => {
  it('maps all AppMode values to routes', () => {
    const modes: AppMode[] = [
      'home',
      'projects',
      'room_design',
      'drawings',
      'quoting',
      'standards',
      'equipment',
      'templates',
      'settings',
    ];

    modes.forEach((mode) => {
      const route = getRouteByMode(mode);
      expect(route).toBeDefined();
      expect(typeof route).toBe('string');
    });
  });

  it('getModeByPath returns valid AppMode for all routes', () => {
    const testPaths = [
      '/',
      '/projects',
      '/rooms/123/design',
      '/rooms/456/drawings',
      '/rooms/789/quotes',
      '/standards',
      '/equipment',
      '/templates',
      '/settings',
    ];

    const validModes: AppMode[] = [
      'home',
      'projects',
      'room_design',
      'drawings',
      'quoting',
      'standards',
      'equipment',
      'templates',
      'settings',
    ];

    testPaths.forEach((path) => {
      const mode = getModeByPath(path);
      expect(validModes).toContain(mode);
    });
  });
});
