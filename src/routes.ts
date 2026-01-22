/**
 * Route Constants and Navigation Helpers
 *
 * This file contains route definitions and helper functions for navigation.
 * Separated from router.tsx for React Fast Refresh compatibility.
 */
import type { AppMode } from '@/types';

// =============================================================================
// Route Constants
// =============================================================================

/**
 * Route path constants for all application routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  AUTH_CALLBACK: '/auth/callback',
  PROJECTS: '/projects',
  CLIENTS: '/clients',
  ROOM_DESIGN: '/rooms/:roomId/design',
  DRAWINGS: '/rooms/:roomId/drawings',
  QUOTING: '/rooms/:roomId/quotes',
  STANDARDS: '/standards',
  EQUIPMENT: '/equipment',
  TEMPLATES: '/templates',
  SETTINGS: '/settings',
} as const;

// =============================================================================
// Mode-to-Route Mapping
// =============================================================================

/**
 * Maps AppMode to route paths
 */
const MODE_TO_ROUTE: Record<AppMode, string> = {
  home: ROUTES.HOME,
  projects: ROUTES.PROJECTS,
  clients: ROUTES.CLIENTS,
  room_design: ROUTES.ROOM_DESIGN,
  drawings: ROUTES.DRAWINGS,
  quoting: ROUTES.QUOTING,
  standards: ROUTES.STANDARDS,
  equipment: ROUTES.EQUIPMENT,
  templates: ROUTES.TEMPLATES,
  settings: ROUTES.SETTINGS,
};

/**
 * Patterns for matching paths to modes
 * Order matters - more specific patterns should come first
 */
const PATH_PATTERNS: Array<{ pattern: RegExp; mode: AppMode }> = [
  { pattern: /^\/rooms\/[^/]+\/design$/, mode: 'room_design' },
  { pattern: /^\/rooms\/[^/]+\/drawings$/, mode: 'drawings' },
  { pattern: /^\/rooms\/[^/]+\/quotes$/, mode: 'quoting' },
  { pattern: /^\/projects$/, mode: 'projects' },
  { pattern: /^\/clients$/, mode: 'clients' },
  { pattern: /^\/standards$/, mode: 'standards' },
  { pattern: /^\/equipment$/, mode: 'equipment' },
  { pattern: /^\/templates$/, mode: 'templates' },
  { pattern: /^\/settings$/, mode: 'settings' },
  { pattern: /^\/$/, mode: 'home' },
];

// =============================================================================
// Navigation Helpers
// =============================================================================

/**
 * Get the route path for a given AppMode
 */
export function getRouteByMode(mode: AppMode): string {
  return MODE_TO_ROUTE[mode];
}

/**
 * Get the AppMode for a given path
 * Returns 'home' for unknown paths
 */
export function getModeByPath(path: string): AppMode {
  for (const { pattern, mode } of PATH_PATTERNS) {
    if (pattern.test(path)) {
      return mode;
    }
  }
  return 'home';
}

/**
 * Check if a path is a valid route
 */
export function isValidRoute(path: string): boolean {
  // Check static routes
  const staticRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/projects',
    '/clients',
    '/standards',
    '/equipment',
    '/templates',
    '/settings',
  ];
  if (staticRoutes.includes(path)) {
    return true;
  }

  // Check dynamic room routes
  const roomRoutePattern = /^\/rooms\/[^/]+\/(design|drawings|quotes)$/;
  return roomRoutePattern.test(path);
}

// =============================================================================
// Path Builders
// =============================================================================

/**
 * Build the room design path for a given roomId
 */
export function buildRoomDesignPath(roomId: string): string {
  return `/rooms/${roomId}/design`;
}

/**
 * Build the drawings path for a given roomId
 */
export function buildDrawingsPath(roomId: string): string {
  return `/rooms/${roomId}/drawings`;
}

/**
 * Build the quotes path for a given roomId
 */
export function buildQuotesPath(roomId: string): string {
  return `/rooms/${roomId}/quotes`;
}
