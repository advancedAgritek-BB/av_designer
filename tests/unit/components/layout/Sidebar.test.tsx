import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock the app store
const mockSetMode = vi.fn();
const mockToggleSidebar = vi.fn();
const mockUseAppStore = vi.fn();

vi.mock('@/stores/app-store', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => mockUseAppStore(selector),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock state: expanded, home mode
    mockUseAppStore.mockImplementation((selector) =>
      selector({
        currentMode: 'home',
        sidebarExpanded: true,
        setMode: mockSetMode,
        toggleSidebar: mockToggleSidebar,
      })
    );
  });

  describe('rendering', () => {
    it('renders as a navigation element', () => {
      render(<Sidebar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has proper aria-label', () => {
      render(<Sidebar />);
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'Main navigation'
      );
    });

    it('renders the app branding', () => {
      render(<Sidebar />);
      expect(screen.getByText('AV Designer')).toBeInTheDocument();
    });
  });

  describe('navigation items - main section', () => {
    it('renders Home navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    });

    it('renders Projects navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /projects/i })).toBeInTheDocument();
    });

    it('renders Room Design navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /room design/i })).toBeInTheDocument();
    });

    it('renders Drawings navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /drawings/i })).toBeInTheDocument();
    });

    it('renders Quoting navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /quoting/i })).toBeInTheDocument();
    });

    it('renders Standards navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /standards/i })).toBeInTheDocument();
    });
  });

  describe('navigation items - libraries section', () => {
    it('renders Libraries section heading', () => {
      render(<Sidebar />);
      expect(screen.getByText('Libraries')).toBeInTheDocument();
    });

    it('renders Equipment navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /equipment/i })).toBeInTheDocument();
    });

    it('renders Templates navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /templates/i })).toBeInTheDocument();
    });
  });

  describe('navigation items - support section', () => {
    it('renders Settings navigation item', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('highlights Home when currentMode is home', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      const homeButton = screen.getByRole('button', { name: /home/i });
      expect(homeButton).toHaveClass('nav-item-active');
    });

    it('highlights Projects when currentMode is projects', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'projects',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      expect(projectsButton).toHaveClass('nav-item-active');
    });

    it('highlights Equipment when currentMode is equipment', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'equipment',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      const equipmentButton = screen.getByRole('button', { name: /equipment/i });
      expect(equipmentButton).toHaveClass('nav-item-active');
    });

    it('has aria-current="page" on active item', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      const homeButton = screen.getByRole('button', { name: /home/i });
      expect(homeButton).toHaveAttribute('aria-current', 'page');
    });

    it('does not have aria-current on inactive items', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      expect(projectsButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('navigation interactions', () => {
    it('calls setMode with "home" when Home is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /home/i }));
      expect(mockSetMode).toHaveBeenCalledWith('home');
    });

    it('calls setMode with "projects" when Projects is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /projects/i }));
      expect(mockSetMode).toHaveBeenCalledWith('projects');
    });

    it('calls setMode with "room_design" when Room Design is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /room design/i }));
      expect(mockSetMode).toHaveBeenCalledWith('room_design');
    });

    it('calls setMode with "drawings" when Drawings is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /drawings/i }));
      expect(mockSetMode).toHaveBeenCalledWith('drawings');
    });

    it('calls setMode with "quoting" when Quoting is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /quoting/i }));
      expect(mockSetMode).toHaveBeenCalledWith('quoting');
    });

    it('calls setMode with "standards" when Standards is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /standards/i }));
      expect(mockSetMode).toHaveBeenCalledWith('standards');
    });

    it('calls setMode with "equipment" when Equipment is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /equipment/i }));
      expect(mockSetMode).toHaveBeenCalledWith('equipment');
    });

    it('calls setMode with "templates" when Templates is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /templates/i }));
      expect(mockSetMode).toHaveBeenCalledWith('templates');
    });

    it('calls setMode with "settings" when Settings is clicked', async () => {
      render(<Sidebar />);
      await userEvent.click(screen.getByRole('button', { name: /settings/i }));
      expect(mockSetMode).toHaveBeenCalledWith('settings');
    });
  });

  describe('expanded state', () => {
    it('renders expanded width when sidebarExpanded is true', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('data-expanded', 'true');
    });

    it('shows navigation labels when expanded', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      // Labels should be visible in expanded state
      expect(screen.getByText('Home')).toBeVisible();
      expect(screen.getByText('Projects')).toBeVisible();
    });

    it('shows branding text when expanded', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      expect(screen.getByText('AV Designer')).toBeVisible();
    });
  });

  describe('collapsed state', () => {
    it('renders collapsed width when sidebarExpanded is false', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: false,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('data-expanded', 'false');
    });

    it('hides navigation labels when collapsed', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: false,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      // Labels should be hidden (sr-only) in collapsed state
      const homeLabel = screen.getByText('Home');
      expect(homeLabel).toHaveClass('sr-only');
    });

    it('hides section headings when collapsed', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: false,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      const librariesHeading = screen.getByText('Libraries');
      expect(librariesHeading).toHaveClass('sr-only');
    });
  });

  describe('collapse toggle', () => {
    it('renders a collapse toggle button', () => {
      render(<Sidebar />);
      expect(
        screen.getByRole('button', { name: /collapse sidebar|expand sidebar/i })
      ).toBeInTheDocument();
    });

    it('calls toggleSidebar when collapse button is clicked', async () => {
      render(<Sidebar />);
      const toggleButton = screen.getByRole('button', {
        name: /collapse sidebar|expand sidebar/i,
      });
      await userEvent.click(toggleButton);
      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('shows "Collapse sidebar" label when expanded', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      expect(
        screen.getByRole('button', { name: /collapse sidebar/i })
      ).toBeInTheDocument();
    });

    it('shows "Expand sidebar" label when collapsed', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: false,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('navigation items are keyboard accessible', async () => {
      render(<Sidebar />);
      await userEvent.tab();
      // First focusable element should be a button (nav item or branding)
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName.toLowerCase()).toBe('button');
    });

    it('can navigate between items with tab', async () => {
      render(<Sidebar />);
      await userEvent.tab(); // First item
      await userEvent.tab(); // Second item
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName.toLowerCase()).toBe('button');
    });

    it('can activate items with Enter key', async () => {
      render(<Sidebar />);
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      projectsButton.focus();
      await userEvent.keyboard('{Enter}');
      expect(mockSetMode).toHaveBeenCalledWith('projects');
    });

    it('can activate items with Space key', async () => {
      render(<Sidebar />);
      const projectsButton = screen.getByRole('button', { name: /projects/i });
      projectsButton.focus();
      await userEvent.keyboard(' ');
      expect(mockSetMode).toHaveBeenCalledWith('projects');
    });

    it('icons have aria-hidden attribute', () => {
      render(<Sidebar />);
      const icons = screen.getAllByTestId('nav-icon');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('icons', () => {
    it('renders an icon for each navigation item', () => {
      render(<Sidebar />);
      const icons = screen.getAllByTestId('nav-icon');
      // 9 nav items: Home, Projects, Room Design, Drawings, Quoting, Standards, Equipment, Templates, Settings
      expect(icons.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('styling', () => {
    it('applies nav-item class to all navigation buttons', () => {
      render(<Sidebar />);
      const navButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.classList.contains('nav-item'));
      // Should have nav items (excluding toggle button)
      expect(navButtons.length).toBeGreaterThanOrEqual(9);
    });

    it('applies sidebar-transition class for smooth collapse animation', () => {
      render(<Sidebar />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('sidebar-transition');
    });
  });
});
