import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/App';

// Mock the stores
const mockAppStore = {
  currentMode: 'home' as const,
  sidebarExpanded: true,
  currentProjectId: null as string | null,
  currentRoomId: null as string | null,
  setMode: vi.fn(),
  toggleSidebar: vi.fn(),
  setSidebarExpanded: vi.fn(),
  setCurrentProject: vi.fn(),
  setCurrentRoom: vi.fn(),
  resetContext: vi.fn(),
};

const mockProjectStore = {
  projects: [] as Array<{ id: string; name: string }>,
  rooms: [] as Array<{ id: string; name: string; projectId: string }>,
  isLoading: false,
};

vi.mock('@/stores/app-store', () => ({
  useAppStore: (selector: (state: typeof mockAppStore) => unknown) =>
    selector(mockAppStore),
}));

vi.mock('@/stores/project-store', () => ({
  useProjectStore: (selector: (state: typeof mockProjectStore) => unknown) =>
    selector(mockProjectStore),
}));

// Mock the dashboard data hook
vi.mock('@/features/dashboard/hooks/use-dashboard-data', () => ({
  useDashboardData: () => ({
    stats: {
      totalProjects: 0,
      activeProjects: 0,
      projectsByStatus: {},
      totalQuotes: 0,
      quotesValue: 0,
      pendingApprovalCount: 0,
      notificationCount: 0,
    },
    recentProjects: [],
    quotePipeline: [],
    unreadNotifications: [],
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

// Mock the auth store
vi.mock('@/features/auth/auth-store', () => ({
  useAuthStore: (selector: (state: { user: null }) => unknown) =>
    selector({ user: null }),
}));

// Mock the notifications hooks
vi.mock('@/features/notifications/use-notifications', () => ({
  useMarkAllAsRead: () => ({ mutate: vi.fn() }),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppStore.currentMode = 'home';
    mockAppStore.sidebarExpanded = true;
  });

  it('renders the dashboard heading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Dashboard/i })
      ).toBeInTheDocument();
    });
  });

  it('renders the dashboard stats cards', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Active Projects/i)).toBeInTheDocument();
    });
  });

  it('renders quick action buttons', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Project/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /New Room/i })).toBeInTheDocument();
  });

  it('renders the home page with dashboard', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('renders the Shell layout', () => {
    render(<App />);
    // Shell includes sidebar navigation
    expect(
      screen.getByRole('navigation', { name: /main navigation/i })
    ).toBeInTheDocument();
    // Shell includes header
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // Shell includes main content area (at minimum the loading fallback)
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders user initials in header', () => {
    render(<App />);
    expect(screen.getByText('AV')).toBeInTheDocument();
  });
});
