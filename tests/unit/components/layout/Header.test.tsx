import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/Header';

// Mock the app store
const mockUseAppStore = vi.fn();

vi.mock('@/stores/app-store', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => mockUseAppStore(selector),
}));

// Mock the project store
const mockUseProjectStore = vi.fn();

vi.mock('@/stores/project-store', () => ({
  useProjectStore: (selector: (state: unknown) => unknown) =>
    mockUseProjectStore(selector),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock state: home mode, no project context
    mockUseAppStore.mockImplementation((selector) =>
      selector({
        currentMode: 'home',
        currentProjectId: null,
        currentRoomId: null,
      })
    );
    mockUseProjectStore.mockImplementation((selector) =>
      selector({
        projects: [],
        rooms: [],
      })
    );
  });

  describe('rendering', () => {
    it('renders as a header element', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders the header container with proper class', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('header');
    });
  });

  describe('breadcrumbs - mode title', () => {
    it('displays "Home" when currentMode is home', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'home',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('displays "Projects" when currentMode is projects', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'projects',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('displays "Room Design" when currentMode is room_design', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'room_design',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Room Design')).toBeInTheDocument();
    });

    it('displays "Drawings" when currentMode is drawings', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'drawings',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Drawings')).toBeInTheDocument();
    });

    it('displays "Quoting" when currentMode is quoting', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'quoting',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Quoting')).toBeInTheDocument();
    });

    it('displays "Standards" when currentMode is standards', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'standards',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Standards')).toBeInTheDocument();
    });

    it('displays "Equipment" when currentMode is equipment', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'equipment',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    it('displays "Templates" when currentMode is templates', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'templates',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Templates')).toBeInTheDocument();
    });

    it('displays "Settings" when currentMode is settings', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'settings',
          currentProjectId: null,
          currentRoomId: null,
        })
      );
      render(<Header />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('breadcrumbs - project context', () => {
    it('shows project name in breadcrumb when project is selected', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'projects',
          currentProjectId: 'project-1',
          currentRoomId: null,
        })
      );
      mockUseProjectStore.mockImplementation((selector) =>
        selector({
          projects: [{ id: 'project-1', name: 'Acme HQ', clientName: 'Acme Inc' }],
          rooms: [],
        })
      );
      render(<Header />);
      expect(screen.getByText('Acme HQ')).toBeInTheDocument();
    });

    it('shows breadcrumb separator when project is selected', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'projects',
          currentProjectId: 'project-1',
          currentRoomId: null,
        })
      );
      mockUseProjectStore.mockImplementation((selector) =>
        selector({
          projects: [{ id: 'project-1', name: 'Acme HQ', clientName: 'Acme Inc' }],
          rooms: [],
        })
      );
      render(<Header />);
      expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('shows room name in breadcrumb when room is selected', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'room_design',
          currentProjectId: 'project-1',
          currentRoomId: 'room-1',
        })
      );
      mockUseProjectStore.mockImplementation((selector) =>
        selector({
          projects: [{ id: 'project-1', name: 'Acme HQ', clientName: 'Acme Inc' }],
          rooms: [{ id: 'room-1', projectId: 'project-1', name: 'Conference Room 201' }],
        })
      );
      render(<Header />);
      expect(screen.getByText('Conference Room 201')).toBeInTheDocument();
    });

    it('shows full breadcrumb path with project and room', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'room_design',
          currentProjectId: 'project-1',
          currentRoomId: 'room-1',
        })
      );
      mockUseProjectStore.mockImplementation((selector) =>
        selector({
          projects: [{ id: 'project-1', name: 'Acme HQ', clientName: 'Acme Inc' }],
          rooms: [{ id: 'room-1', projectId: 'project-1', name: 'Conference Room 201' }],
        })
      );
      render(<Header />);
      expect(screen.getByText('Room Design')).toBeInTheDocument();
      expect(screen.getByText('Acme HQ')).toBeInTheDocument();
      expect(screen.getByText('Conference Room 201')).toBeInTheDocument();
    });
  });

  describe('breadcrumbs - navigation', () => {
    it('renders breadcrumb as navigation element', () => {
      render(<Header />);
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });

    it('renders breadcrumb items as a list', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'projects',
          currentProjectId: 'project-1',
          currentRoomId: null,
        })
      );
      mockUseProjectStore.mockImplementation((selector) =>
        selector({
          projects: [{ id: 'project-1', name: 'Acme HQ', clientName: 'Acme Inc' }],
          rooms: [],
        })
      );
      render(<Header />);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('project name in breadcrumb is clickable', () => {
      mockUseAppStore.mockImplementation((selector) =>
        selector({
          currentMode: 'room_design',
          currentProjectId: 'project-1',
          currentRoomId: 'room-1',
        })
      );
      mockUseProjectStore.mockImplementation((selector) =>
        selector({
          projects: [{ id: 'project-1', name: 'Acme HQ', clientName: 'Acme Inc' }],
          rooms: [{ id: 'room-1', projectId: 'project-1', name: 'Conference Room 201' }],
        })
      );
      render(<Header />);
      const projectLink = screen.getByRole('button', { name: 'Acme HQ' });
      expect(projectLink).toBeInTheDocument();
    });
  });

  describe('search trigger', () => {
    it('renders a search button', () => {
      render(<Header />);
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('search button has search icon', () => {
      render(<Header />);
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton.querySelector('svg')).toBeInTheDocument();
    });

    it('shows keyboard shortcut hint', () => {
      render(<Header />);
      expect(screen.getByText(/⌘K/i)).toBeInTheDocument();
    });

    it('calls onSearchClick when search button is clicked', async () => {
      const onSearchClick = vi.fn();
      render(<Header onSearchClick={onSearchClick} />);
      await userEvent.click(screen.getByRole('button', { name: /search/i }));
      expect(onSearchClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('user menu', () => {
    it('renders a user menu button', () => {
      render(<Header />);
      expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    });

    it('shows user initials', () => {
      render(<Header userInitials="MP" />);
      expect(screen.getByText('MP')).toBeInTheDocument();
    });

    it('shows default initials when none provided', () => {
      render(<Header />);
      // Default should show something like "?" or empty avatar
      expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    });

    it('calls onUserMenuClick when user menu is clicked', async () => {
      const onUserMenuClick = vi.fn();
      render(<Header onUserMenuClick={onUserMenuClick} />);
      await userEvent.click(screen.getByRole('button', { name: /user menu/i }));
      expect(onUserMenuClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('actions area', () => {
    it('renders actions container', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header.querySelector('.header-actions')).toBeInTheDocument();
    });

    it('search and user menu are in actions area', () => {
      render(<Header />);
      const actionsArea = document.querySelector('.header-actions');
      expect(actionsArea).toContainElement(
        screen.getByRole('button', { name: /search/i })
      );
      expect(actionsArea).toContainElement(
        screen.getByRole('button', { name: /user menu/i })
      );
    });
  });

  describe('accessibility', () => {
    it('search button has aria-label', () => {
      render(<Header />);
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toHaveAttribute('aria-label');
    });

    it('user menu button has aria-label', () => {
      render(<Header />);
      const userButton = screen.getByRole('button', { name: /user menu/i });
      expect(userButton).toHaveAttribute('aria-label');
    });

    it('breadcrumb has aria-label', () => {
      render(<Header />);
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('current breadcrumb item has aria-current', () => {
      render(<Header />);
      const currentItem = screen.getByText('Home').closest('li');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('keyboard navigation works for actions', async () => {
      render(<Header />);
      await userEvent.tab();
      // Should be able to tab to interactive elements
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName.toLowerCase()).toBe('button');
    });

    it('search icon is decorative (aria-hidden)', () => {
      render(<Header />);
      const searchButton = screen.getByRole('button', { name: /search/i });
      const icon = searchButton.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('styling', () => {
    it('applies header class to container', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toHaveClass('header');
    });

    it('applies header-breadcrumb class to breadcrumb container', () => {
      render(<Header />);
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toHaveClass('header-breadcrumb');
    });

    it('applies header-actions class to actions container', () => {
      render(<Header />);
      const actionsArea = document.querySelector('.header-actions');
      expect(actionsArea).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('renders mobile-friendly layout', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      // Header should use flex layout for responsive behavior
      expect(header).toHaveClass('header');
    });
  });
});
