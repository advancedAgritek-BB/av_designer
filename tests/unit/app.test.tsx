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

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppStore.currentMode = 'home';
    mockAppStore.sidebarExpanded = true;
  });

  it('renders the heading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Welcome to AV Designer/i })
      ).toBeInTheDocument();
    });
  });

  it('renders the design system preview', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Design system initialized/i)).toBeInTheDocument();
    });
  });

  it('renders button variants', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Primary$/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /^Secondary$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Ghost$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Danger$/i })).toBeInTheDocument();
  });

  it('renders status pills', async () => {
    render(<App />);
    await waitFor(() => {
      const main = screen.getByRole('main');
      // Look for pills in main content area to avoid sidebar nav item matches
      expect(main.querySelector('.pill-quoting')).toBeInTheDocument();
    });
    const main = screen.getByRole('main');
    expect(main.querySelector('.pill-review')).toBeInTheDocument();
    expect(main.querySelector('.pill-ordered')).toBeInTheDocument();
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
