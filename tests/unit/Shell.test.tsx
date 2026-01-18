import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';

// Helper to render Shell with router context
function renderShell(
  children: React.ReactNode = 'Content',
  props: Omit<React.ComponentProps<typeof Shell>, 'children'> = {}
) {
  return render(
    <MemoryRouter>
      <Shell {...props}>{children}</Shell>
    </MemoryRouter>
  );
}

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

describe('Shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    mockAppStore.currentMode = 'home';
    mockAppStore.sidebarExpanded = true;
    mockAppStore.currentProjectId = null;
    mockAppStore.currentRoomId = null;
    mockProjectStore.projects = [];
    mockProjectStore.rooms = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Structure', () => {
    it('renders without crashing', () => {
      renderShell();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders a container element with shell class', () => {
      const { container } = renderShell();
      expect(container.querySelector('.shell')).toBeInTheDocument();
    });

    it('renders Sidebar component', () => {
      renderShell();
      expect(
        screen.getByRole('navigation', { name: /main navigation/i })
      ).toBeInTheDocument();
    });

    it('renders Header component', () => {
      renderShell();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders main content area', () => {
      renderShell();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders children inside main content area', () => {
      renderShell(<div data-testid="test-content">Test Content</div>);
      const main = screen.getByRole('main');
      expect(within(main).getByTestId('test-content')).toBeInTheDocument();
    });

    it('renders sidebar, header, and main in correct layout order', () => {
      const { container } = renderShell();
      const shell = container.querySelector('.shell');
      expect(shell).toBeInTheDocument();

      // Check that sidebar and main wrapper are direct children
      const sidebar = shell?.querySelector('.sidebar');
      const mainWrapper = shell?.querySelector('.shell-main-wrapper');
      expect(sidebar).toBeInTheDocument();
      expect(mainWrapper).toBeInTheDocument();
    });
  });

  describe('Sidebar Integration', () => {
    it('sidebar reflects expanded state from store', () => {
      mockAppStore.sidebarExpanded = true;
      renderShell();
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toHaveAttribute('data-expanded', 'true');
    });

    it('sidebar reflects collapsed state from store', () => {
      mockAppStore.sidebarExpanded = false;
      renderShell();
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toHaveAttribute('data-expanded', 'false');
    });

    it('sidebar shows active mode from store', () => {
      mockAppStore.currentMode = 'projects';
      renderShell();
      const activeItem = screen.getByRole('link', { name: /projects/i });
      expect(activeItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Header Integration', () => {
    it('header shows current mode in breadcrumb', () => {
      mockAppStore.currentMode = 'equipment';
      renderShell();
      const header = screen.getByRole('banner');
      expect(within(header).getByText('Equipment')).toBeInTheDocument();
    });

    it('header shows project context when set', () => {
      mockAppStore.currentProjectId = 'proj-1';
      mockProjectStore.projects = [{ id: 'proj-1', name: 'Test Project' }];
      renderShell();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('header shows room context when set', () => {
      mockAppStore.currentProjectId = 'proj-1';
      mockAppStore.currentRoomId = 'room-1';
      mockProjectStore.projects = [{ id: 'proj-1', name: 'Test Project' }];
      mockProjectStore.rooms = [
        { id: 'room-1', name: 'Conference Room A', projectId: 'proj-1' },
      ];
      renderShell();
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('has flex layout with sidebar on left', () => {
      const { container } = renderShell();
      const shell = container.querySelector('.shell');
      expect(shell).toHaveClass('shell');
    });

    it('main wrapper contains header and main content', () => {
      const { container } = renderShell();
      const mainWrapper = container.querySelector('.shell-main-wrapper');
      expect(mainWrapper).toBeInTheDocument();

      const header = mainWrapper?.querySelector('header');
      const main = mainWrapper?.querySelector('main');
      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });

    it('main content area has shell-content class', () => {
      const { container } = renderShell();
      const main = container.querySelector('main');
      expect(main).toHaveClass('shell-content');
    });

    it('main content area fills available space', () => {
      const { container } = renderShell();
      const mainWrapper = container.querySelector('.shell-main-wrapper');
      expect(mainWrapper).toHaveClass('shell-main-wrapper');
    });
  });

  describe('Responsive Behavior', () => {
    it('shell has full viewport height', () => {
      const { container } = renderShell();
      const shell = container.querySelector('.shell');
      expect(shell).toHaveClass('shell');
    });

    it('content area is scrollable', () => {
      const { container } = renderShell();
      const main = container.querySelector('.shell-content');
      expect(main).toHaveClass('shell-content');
    });
  });

  describe('Header Callbacks', () => {
    it('passes onSearchClick callback to header', async () => {
      const onSearchClick = vi.fn();
      renderShell('Content', { onSearchClick });

      const searchButton = screen.getByRole('button', { name: /search/i });
      await userEvent.click(searchButton);

      expect(onSearchClick).toHaveBeenCalledTimes(1);
    });

    it('passes onUserMenuClick callback to header', async () => {
      const onUserMenuClick = vi.fn();
      renderShell('Content', { onUserMenuClick });

      const userButton = screen.getByRole('button', { name: /user menu/i });
      await userEvent.click(userButton);

      expect(onUserMenuClick).toHaveBeenCalledTimes(1);
    });

    it('passes userInitials to header', () => {
      renderShell('Content', { userInitials: 'JD' });
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('main content area has role="main"', () => {
      renderShell();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('header has role="banner"', () => {
      renderShell();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('sidebar has role="navigation"', () => {
      renderShell();
      expect(
        screen.getByRole('navigation', { name: /main navigation/i })
      ).toBeInTheDocument();
    });

    it('skip link exists for accessibility', () => {
      renderShell();
      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('main content area has id for skip link target', () => {
      renderShell();
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('skip link is visually hidden by default', () => {
      renderShell();
      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toHaveClass('shell-skip-link');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className to shell container', () => {
      const { container } = renderShell('Content', { className: 'custom-class' });
      const shell = container.querySelector('.shell');
      expect(shell).toHaveClass('custom-class');
    });

    it('spreads additional props to shell container', () => {
      const { container } = renderShell('Content', { 'data-testid': 'custom-shell' });
      const shell = container.querySelector('.shell');
      expect(shell).toHaveAttribute('data-testid', 'custom-shell');
    });
  });

  describe('Loading State', () => {
    it('can render loading content in main area', () => {
      renderShell(<div data-testid="loading-spinner">Loading...</div>);
      const main = screen.getByRole('main');
      expect(within(main).getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('can render empty content in main area', () => {
      renderShell(null);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toBeEmptyDOMElement();
    });
  });

  describe('Multiple Children', () => {
    it('renders multiple children in main area', () => {
      renderShell(
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </>
      );
      const main = screen.getByRole('main');
      expect(within(main).getByTestId('child-1')).toBeInTheDocument();
      expect(within(main).getByTestId('child-2')).toBeInTheDocument();
      expect(within(main).getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Sidebar Collapse Transition', () => {
    it('main wrapper adjusts when sidebar is expanded', () => {
      mockAppStore.sidebarExpanded = true;
      const { container } = renderShell();
      const mainWrapper = container.querySelector('.shell-main-wrapper');
      expect(mainWrapper).toHaveAttribute('data-sidebar-expanded', 'true');
    });

    it('main wrapper adjusts when sidebar is collapsed', () => {
      mockAppStore.sidebarExpanded = false;
      const { container } = renderShell();
      const mainWrapper = container.querySelector('.shell-main-wrapper');
      expect(mainWrapper).toHaveAttribute('data-sidebar-expanded', 'false');
    });
  });
});
