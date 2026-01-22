import { lazy } from 'react';

export const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage }))
);

export const DesignSystemPage = lazy(() =>
  import('@/pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage }))
);

export const LoginPage = lazy(() =>
  import('@/features/auth/components/LoginPage').then((m) => ({ default: m.LoginPage }))
);

export const SignupPage = lazy(() =>
  import('@/features/auth/components/SignupPage').then((m) => ({ default: m.SignupPage }))
);

export const ClientsPage = lazy(() =>
  import('@/pages/ClientsPage').then((m) => ({ default: m.ClientsPage }))
);

export const ClientDetailPage = lazy(() =>
  import('@/pages/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage }))
);

export const ProjectsPage = lazy(() =>
  import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);

export const ProjectDetailPage = lazy(() =>
  import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);

export const EquipmentPage = lazy(() =>
  import('@/pages/EquipmentPage').then((m) => ({ default: m.EquipmentPage }))
);

export const StandardsPage = lazy(() =>
  import('@/pages/StandardsPage').then((m) => ({ default: m.StandardsPage }))
);

export const TemplatesPage = lazy(() =>
  import('@/pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage }))
);

export const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

export const RoomDesignPage = lazy(() =>
  import('@/pages/RoomDesignPage').then((m) => ({ default: m.RoomDesignPage }))
);

export const DrawingsPage = lazy(() =>
  import('@/pages/DrawingsPageWrapper').then((m) => ({
    default: m.DrawingsPageWrapper,
  }))
);

export const QuotesPage = lazy(() =>
  import('@/pages/QuotesPage').then((m) => ({ default: m.QuotesPage }))
);

export const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
