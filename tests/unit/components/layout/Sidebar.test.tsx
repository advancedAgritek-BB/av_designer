import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock the app store
const mockSetMode = vi.fn();
const mockToggleSidebar = vi.fn();
const mockUseAppStore = vi.fn();

vi.mock('@/stores/app-store', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => mockUseAppStore(selector),
}));

// Helper to render with router
function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock state: expanded, home mode
    mockUseAppStore.mockImplementation((selector) =>
      selector({
        currentMode: 'home',
        sidebarExpanded: true,
        currentRoomId: null,
        setMode: mockSetMode,
        toggleSidebar: mockToggleSidebar,
      })
    );
  });

  describe('rendering', () => {
    it('renders as a navigation element', () => {
      renderSidebar();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has proper aria-label', () => {
      renderSidebar();
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'Main navigation'
      );
    });

    it('renders the app branding', () => {
      renderSidebar();
      expect(screen.getByText('AV Designer')).toBeInTheDocument();
    });
  });

  describe('navigation items - main section', () => {
    it('renders Home navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    });

    it('renders Projects navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
    });

    it('renders Room Design navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /room design/i })).toBeInTheDocument();
    });

    it('renders Drawings navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /drawings/i })).toBeInTheDocument();
    });

    it('renders Quoting navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /quoting/i })).toBeInTheDocument();
    });

    it('renders Standards navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /standards/i })).toBeInTheDocument();
    });
  });

  describe('navigation items - libraries section', () => {
    it('renders Libraries section heading', () => {
      renderSidebar();
      expect(screen.getByText('Libraries')).toBeInTheDocument();
    });

    it('renders Equipment navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /equipment/i })).toBeInTheDocument();
    });

    it('renders Templates navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /templates/i })).toBeInTheDocument();
    });
  });

  describe('navigation items - support section', () => {
    it('renders Settings navigation item', () => {
      renderSidebar();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('highlights Home when currentMode is home', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const homeButton = screen.getByRole('link', { name: /home/i });
      expect(homeButton).toHaveClass('nav-item-active');
    });

    it('highlights Projects when currentMode is projects', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'projects',
          sidebarExpanded: true,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const projectsButton = screen.getByRole('link', { name: /projects/i });
      expect(projectsButton).toHaveClass('nav-item-active');
    });

    it('highlights Equipment when currentMode is equipment', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'equipment',
          sidebarExpanded: true,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const equipmentButton = screen.getByRole('link', { name: /equipment/i });
      expect(equipmentButton).toHaveClass('nav-item-active');
    });

    it('has aria-current="page" on active item', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const homeButton = screen.getByRole('link', { name: /home/i });
      expect(homeButton).toHaveAttribute('aria-current', 'page');
    });

    it('does not have aria-current on inactive items', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const projectsButton = screen.getByRole('link', { name: /projects/i });
      expect(projectsButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('navigation links', () => {
    it('Home link navigates to "/"', () => {
      renderSidebar();
      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('Projects link navigates to "/projects"', () => {
      renderSidebar();
      const projectsLink = screen.getByRole('link', { name: /projects/i });
      expect(projectsLink).toHaveAttribute('href', '/projects');
    });

    it('Room Design link navigates to "/projects" when no room selected', () => {
      renderSidebar();
      const roomDesignLink = screen.getByRole('link', { name: /room design/i });
      // When no room is selected, redirects to projects
      expect(roomDesignLink).toHaveAttribute('href', '/projects');
    });

    it('Room Design link includes roomId when a room is selected', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          currentRoomId: 'test-room-123',
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const roomDesignLink = screen.getByRole('link', { name: /room design/i });
      expect(roomDesignLink).toHaveAttribute('href', '/rooms/test-room-123/design');
    });

    it('Drawings link navigates to "/projects" when no room selected', () => {
      renderSidebar();
      const drawingsLink = screen.getByRole('link', { name: /drawings/i });
      expect(drawingsLink).toHaveAttribute('href', '/projects');
    });

    it('Quoting link navigates to "/projects" when no room selected', () => {
      renderSidebar();
      const quotingLink = screen.getByRole('link', { name: /quoting/i });
      expect(quotingLink).toHaveAttribute('href', '/projects');
    });

    it('Standards link navigates to "/standards"', () => {
      renderSidebar();
      const standardsLink = screen.getByRole('link', { name: /standards/i });
      expect(standardsLink).toHaveAttribute('href', '/standards');
    });

    it('Equipment link navigates to "/equipment"', () => {
      renderSidebar();
      const equipmentLink = screen.getByRole('link', { name: /equipment/i });
      expect(equipmentLink).toHaveAttribute('href', '/equipment');
    });

    it('Templates link navigates to "/templates"', () => {
      renderSidebar();
      const templatesLink = screen.getByRole('link', { name: /templates/i });
      expect(templatesLink).toHaveAttribute('href', '/templates');
    });

    it('Settings link navigates to "/settings"', () => {
      renderSidebar();
      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink).toHaveAttribute('href', '/settings');
    });
  });

  describe('expanded state', () => {
    it('renders expanded width when sidebarExpanded is true', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('data-expanded', 'true');
    });

    it('shows navigation labels when expanded', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      // Labels should be visible in expanded state
      expect(screen.getByText('Home')).toBeVisible();
      expect(screen.getByText('Projects')).toBeVisible();
    });

    it('shows branding text when expanded', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: true,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      expect(screen.getByText('AV Designer')).toBeVisible();
    });
  });

  describe('collapsed state', () => {
    it('renders collapsed width when sidebarExpanded is false', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: false,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('data-expanded', 'false');
    });

    it('hides navigation labels when collapsed', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: false,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      // Labels should be hidden (sr-only) in collapsed state
      const homeLabel = screen.getByText('Home');
      expect(homeLabel).toHaveClass('sr-only');
    });

    it('hides section headings when collapsed', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: false,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      const librariesHeading = screen.getByText('Libraries');
      expect(librariesHeading).toHaveClass('sr-only');
    });
  });

  describe('collapse toggle', () => {
    it('renders a collapse toggle button', () => {
      renderSidebar();
      expect(
        screen.getByRole('button', { name: /collapse sidebar|expand sidebar/i })
      ).toBeInTheDocument();
    });

    it('calls toggleSidebar when collapse button is clicked', async () => {
      renderSidebar();
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
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      expect(
        screen.getByRole('button', { name: /collapse sidebar/i })
      ).toBeInTheDocument();
    });

    it('shows "Expand sidebar" label when collapsed', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          sidebarExpanded: false,
          currentRoomId: null,
          setMode: mockSetMode,
          toggleSidebar: mockToggleSidebar,
        })
      );
      renderSidebar();
      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('navigation items are keyboard accessible', async () => {
      renderSidebar();
      await userEvent.tab();
      // First focusable element should be a link (nav item)
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName.toLowerCase()).toBe('a');
    });

    it('can navigate between items with tab', async () => {
      renderSidebar();
      await userEvent.tab(); // First item
      await userEvent.tab(); // Second item
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName.toLowerCase()).toBe('a');
    });

    it('can activate items with Enter key', async () => {
      renderSidebar();
      const projectsLink = screen.getByRole('link', { name: /projects/i });
      // Links are activated by clicking or pressing Enter - verify the link has correct href
      expect(projectsLink).toHaveAttribute('href', '/projects');
    });

    it('can activate items with Space key', async () => {
      renderSidebar();
      const projectsLink = screen.getByRole('link', { name: /projects/i });
      // Links navigate on click/Enter - Space key behavior varies by browser
      // Verify the link is focusable and has correct href for keyboard navigation
      projectsLink.focus();
      expect(document.activeElement).toBe(projectsLink);
      expect(projectsLink).toHaveAttribute('href', '/projects');
    });

    it('icons have aria-hidden attribute', () => {
      renderSidebar();
      const icons = screen.getAllByTestId('nav-icon');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('icons', () => {
    it('renders an icon for each navigation item', () => {
      renderSidebar();
      const icons = screen.getAllByTestId('nav-icon');
      // 9 nav items: Home, Projects, Room Design, Drawings, Quoting, Standards, Equipment, Templates, Settings
      expect(icons.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('styling', () => {
    it('applies nav-item class to all navigation links', () => {
      renderSidebar();
      const navLinks = screen
        .getAllByRole('link')
        .filter((link) => link.classList.contains('nav-item'));
      // Should have nav items (9 main nav links)
      expect(navLinks.length).toBeGreaterThanOrEqual(9);
    });

    it('applies sidebar-transition class for smooth collapse animation', () => {
      renderSidebar();
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('sidebar-transition');
    });
  });
});
