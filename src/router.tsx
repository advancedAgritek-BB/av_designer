/**
 * Application Router Components
 *
 * Contains the AppRoutes component and RouteConfig for the application.
 * Route constants and helpers are in routes.ts for Fast Refresh compatibility.
 */
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Re-export route utilities for convenience
export {
  ROUTES,
  getRouteByMode,
  getModeByPath,
  isValidRoute,
  buildRoomDesignPath,
  buildDrawingsPath,
  buildQuotesPath,
} from './routes';

// =============================================================================
// Lazy-loaded Page Components
// =============================================================================

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage }))
);

const ProjectsPage = lazy(() =>
  import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);

const EquipmentPage = lazy(() =>
  import('@/pages/EquipmentPage').then((m) => ({ default: m.EquipmentPage }))
);

const StandardsPage = lazy(() =>
  import('@/pages/StandardsPage').then((m) => ({ default: m.StandardsPage }))
);

const TemplatesPage = lazy(() =>
  import('@/pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage }))
);

const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const RoomDesignPage = lazy(() =>
  import('@/pages/RoomDesignPage').then((m) => ({ default: m.RoomDesignPage }))
);

const DrawingsPage = lazy(() =>
  import('@/pages/DrawingsPageWrapper').then((m) => ({
    default: m.DrawingsPageWrapper,
  }))
);

const QuotesPage = lazy(() =>
  import('@/pages/QuotesPage').then((m) => ({ default: m.QuotesPage }))
);

const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const ClientsPage = lazy(() =>
  import('@/pages/ClientsPage').then((m) => ({ default: m.ClientsPage }))
);

const ClientDetailPage = lazy(() =>
  import('@/pages/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage }))
);

const ProjectDetailPage = lazy(() =>
  import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);

const LoginPage = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.LoginPage }))
);

const SignupPage = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.SignupPage }))
);

const AuthCallbackPage = lazy(() =>
  import('@/pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage }))
);

// =============================================================================
// Loading Fallback
// =============================================================================

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-text-secondary">Loading...</div>
    </div>
  );
}

// =============================================================================
// Route Configuration
// =============================================================================

/**
 * Route configuration array for use with createBrowserRouter or testing
 */
export const RouteConfig = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/projects', element: <ProjectsPage /> },
  { path: '/projects/:projectId', element: <ProjectDetailPage /> },
  { path: '/clients', element: <ClientsPage /> },
  { path: '/clients/:clientId', element: <ClientDetailPage /> },
  { path: '/equipment', element: <EquipmentPage /> },
  { path: '/standards', element: <StandardsPage /> },
  { path: '/templates', element: <TemplatesPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/rooms/:roomId/design', element: <RoomDesignPage /> },
  { path: '/rooms/:roomId/drawings', element: <DrawingsPage /> },
  { path: '/rooms/:roomId/quotes', element: <QuotesPage /> },
  { path: '*', element: <NotFoundPage /> },
];

// =============================================================================
// AppRoutes Component
// =============================================================================

/**
 * Main application routes component
 * Wraps all routes with Suspense for lazy loading
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:clientId" element={<ClientDetailPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/standards" element={<StandardsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/rooms/:roomId/design" element={<RoomDesignPage />} />
        <Route path="/rooms/:roomId/drawings" element={<DrawingsPage />} />
        <Route path="/rooms/:roomId/quotes" element={<QuotesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
