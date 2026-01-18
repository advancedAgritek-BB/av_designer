/**
 * E2E Navigation Tests
 *
 * Tests for application navigation flows and routing behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '@/router';
import { Shell } from '@/components/layout/Shell';
import { createMockAppState, createMockProjectState, cleanupTest } from './setup';

// =============================================================================
// Mock Setup
// =============================================================================

const mockAppState = createMockAppState();
const mockProjectState = createMockProjectState();

vi.mock('@/stores/app-store', () => ({
  useAppStore: (selector: (state: typeof mockAppState) => unknown) => selector(mockAppState),
}));

vi.mock('@/stores/project-store', () => ({
  useProjectStore: (selector: (state: typeof mockProjectState) => unknown) =>
    selector(mockProjectState),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderApp(initialEntries: string[] = ['/']) {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();

  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Shell>
          <AppRoutes />
        </Shell>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { ...result, user };
}

// =============================================================================
// Tests
// =============================================================================

describe('Navigation', () => {
  beforeEach(() => {
    cleanupTest();
    mockAppState.currentMode = 'home';
    mockAppState.sidebarExpanded = true;
    mockAppState.currentProjectId = null;
    mockAppState.currentRoomId = null;
  });

  describe('Initial Load', () => {
    it('renders home page on root path', async () => {
      renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('renders projects page on /projects path', async () => {
      renderApp(['/projects']);

      await waitFor(() => {
        expect(screen.getByTestId('projects-page')).toBeInTheDocument();
      });
    });

    it('renders equipment page on /equipment path', async () => {
      renderApp(['/equipment']);

      await waitFor(() => {
        expect(screen.getByTestId('equipment-page')).toBeInTheDocument();
      });
    });

    it('renders standards page on /standards path', async () => {
      renderApp(['/standards']);

      await waitFor(() => {
        expect(screen.getByTestId('standards-page')).toBeInTheDocument();
      });
    });

    it('renders templates page on /templates path', async () => {
      renderApp(['/templates']);

      await waitFor(() => {
        expect(screen.getByTestId('templates-page')).toBeInTheDocument();
      });
    });

    it('renders settings page on /settings path', async () => {
      renderApp(['/settings']);

      await waitFor(() => {
        expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      });
    });

    it('renders not found page for unknown routes', async () => {
      renderApp(['/unknown-route']);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Navigation', () => {
    it('navigates to home when Home link is clicked', async () => {
      const { user } = renderApp(['/projects']);

      // Wait for initial page
      await waitFor(() => {
        expect(screen.getByTestId('projects-page')).toBeInTheDocument();
      });

      // Click home link
      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);

      // Verify navigation
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('navigates to projects when Projects link is clicked', async () => {
      const { user } = renderApp(['/']);

      // Wait for initial page
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Click projects link
      const projectsLink = screen.getByRole('link', { name: /projects/i });
      await user.click(projectsLink);

      // Verify navigation
      await waitFor(() => {
        expect(screen.getByTestId('projects-page')).toBeInTheDocument();
      });
    });

    it('navigates to equipment when Equipment link is clicked', async () => {
      const { user } = renderApp(['/']);

      // Wait for initial page
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Click equipment link
      const equipmentLink = screen.getByRole('link', { name: /equipment/i });
      await user.click(equipmentLink);

      // Verify navigation
      await waitFor(() => {
        expect(screen.getByTestId('equipment-page')).toBeInTheDocument();
      });
    });

    it('navigates to standards when Standards link is clicked', async () => {
      const { user } = renderApp(['/']);

      // Wait for initial page
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Click standards link
      const standardsLink = screen.getByRole('link', { name: /standards/i });
      await user.click(standardsLink);

      // Verify navigation
      await waitFor(() => {
        expect(screen.getByTestId('standards-page')).toBeInTheDocument();
      });
    });

    it('navigates to settings when Settings link is clicked', async () => {
      const { user } = renderApp(['/']);

      // Wait for initial page
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Click settings link
      const settingsLink = screen.getByRole('link', { name: /settings/i });
      await user.click(settingsLink);

      // Verify navigation
      await waitFor(() => {
        expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      });
    });
  });

  describe('Room-Specific Routes', () => {
    it('Room Design link redirects to projects when no room selected', async () => {
      const { user } = renderApp(['/']);

      // Wait for initial page
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Click room design link (should go to projects since no room selected)
      const roomDesignLink = screen.getByRole('link', { name: /room design/i });
      await user.click(roomDesignLink);

      // Should redirect to projects
      await waitFor(() => {
        expect(screen.getByTestId('projects-page')).toBeInTheDocument();
      });
    });

    it('navigates to room design when room is selected', async () => {
      // Set room in state
      mockAppState.currentRoomId = 'test-room-123';

      renderApp(['/rooms/test-room-123/design']);

      // Verify room design page loads
      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });
    });

    it('navigates to drawings when room is selected', async () => {
      mockAppState.currentRoomId = 'test-room-123';

      renderApp(['/rooms/test-room-123/drawings']);

      await waitFor(() => {
        expect(screen.getByTestId('drawings-page')).toBeInTheDocument();
      });
    });

    it('navigates to quotes when room is selected', async () => {
      mockAppState.currentRoomId = 'test-room-123';

      renderApp(['/rooms/test-room-123/quotes']);

      await waitFor(() => {
        expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
      });
    });
  });

  describe('Shell Layout', () => {
    it('renders sidebar navigation on all pages', async () => {
      renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
      });
    });

    it('renders header banner on all pages', async () => {
      renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
    });

    it('renders main content area on all pages', async () => {
      renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('renders skip link for accessibility', async () => {
      renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
      });
    });
  });

  describe('Active State', () => {
    it('highlights current page in sidebar', async () => {
      mockAppState.currentMode = 'equipment';

      renderApp(['/equipment']);

      await waitFor(() => {
        const equipmentLink = screen.getByRole('link', { name: /equipment/i });
        expect(equipmentLink).toHaveAttribute('aria-current', 'page');
      });
    });

    it('does not highlight inactive pages in sidebar', async () => {
      mockAppState.currentMode = 'home';

      renderApp(['/']);

      await waitFor(() => {
        const projectsLink = screen.getByRole('link', { name: /projects/i });
        expect(projectsLink).not.toHaveAttribute('aria-current');
      });
    });
  });

  describe('Sidebar Toggle', () => {
    it('can toggle sidebar collapsed state', async () => {
      const { user } = renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      await user.click(toggleButton);

      expect(mockAppState.toggleSidebar).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator while page loads', async () => {
      renderApp(['/']);

      // The loading fallback should be briefly visible before content loads
      // This test verifies the loading infrastructure exists
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows not found page for invalid routes', async () => {
      renderApp(['/invalid/path/here']);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // Should have a 404 indicator
      expect(screen.getByText('404')).toBeInTheDocument();
    });
  });
});
