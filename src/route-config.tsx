import {
  ClientDetailPage,
  ClientsPage,
  DesignSystemPage,
  DrawingsPage,
  EquipmentPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  ProjectDetailPage,
  ProjectsPage,
  QuotesPage,
  RoomDesignPage,
  SettingsPage,
  SignupPage,
  StandardsPage,
  TemplatesPage,
} from './route-components';

/**
 * Route configuration array for use with createBrowserRouter or testing
 */
export const RouteConfig = [
  { path: '/', element: <HomePage /> },
  { path: '/design-system', element: <DesignSystemPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/clients', element: <ClientsPage /> },
  { path: '/clients/:clientId', element: <ClientDetailPage /> },
  { path: '/projects', element: <ProjectsPage /> },
  { path: '/projects/:projectId', element: <ProjectDetailPage /> },
  { path: '/equipment', element: <EquipmentPage /> },
  { path: '/standards', element: <StandardsPage /> },
  { path: '/templates', element: <TemplatesPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/rooms/:roomId/design', element: <RoomDesignPage /> },
  { path: '/rooms/:roomId/drawings', element: <DrawingsPage /> },
  { path: '/rooms/:roomId/quotes', element: <QuotesPage /> },
  { path: '*', element: <NotFoundPage /> },
];
