/**
 * E2E Create Room Workflow Tests
 *
 * Tests the complete workflow for creating and configuring a room.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '@/router';
import { Shell } from '@/components/layout/Shell';
import {
  createMockAppState,
  createMockProjectState,
  createMockProject,
  createMockRoom,
  cleanupTest,
} from './setup';

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

describe('Create Room Workflow', () => {
  beforeEach(() => {
    cleanupTest();
    mockAppState.currentMode = 'home';
    mockAppState.sidebarExpanded = true;
    mockAppState.currentProjectId = null;
    mockAppState.currentRoomId = null;
    mockProjectState.projects = [];
    mockProjectState.rooms = [];
    mockProjectState.isLoading = false;
  });

  describe('Room Design Page Access', () => {
    it('redirects to projects when accessing room design without room selected', async () => {
      const { user } = renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Try to navigate to room design
      const roomDesignLink = screen.getByRole('link', { name: /room design/i });
      await user.click(roomDesignLink);

      // Should redirect to projects since no room is selected
      await waitFor(() => {
        expect(screen.getByTestId('projects-page')).toBeInTheDocument();
      });
    });

    it('loads room design page when room is selected', async () => {
      const project = createMockProject({ id: 'project-1' });
      const room = createMockRoom({ id: 'room-1', projectId: 'project-1' });

      mockAppState.currentProjectId = project.id;
      mockAppState.currentRoomId = room.id;
      mockProjectState.projects = [project];
      mockProjectState.rooms = [room];

      renderApp(['/rooms/room-1/design']);

      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });
    });
  });

  describe('Room Context in Header', () => {
    it('shows project context in header when project selected', async () => {
      const project = createMockProject({ id: 'project-1', name: 'Corporate HQ' });

      mockAppState.currentProjectId = project.id;
      mockProjectState.projects = [project];

      renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByText('Corporate HQ')).toBeInTheDocument();
      });
    });

    it('shows room context in header when room selected', async () => {
      const project = createMockProject({ id: 'project-1', name: 'Corporate HQ' });
      const room = createMockRoom({
        id: 'room-1',
        projectId: 'project-1',
        name: 'Main Boardroom',
      });

      mockAppState.currentProjectId = project.id;
      mockAppState.currentRoomId = room.id;
      mockProjectState.projects = [project];
      mockProjectState.rooms = [room];

      renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByText('Main Boardroom')).toBeInTheDocument();
      });
    });
  });

  describe('Room Navigation Flow', () => {
    it('navigates between room-specific pages correctly', async () => {
      const project = createMockProject({ id: 'project-1' });
      const room = createMockRoom({ id: 'room-1', projectId: 'project-1' });

      mockAppState.currentProjectId = project.id;
      mockAppState.currentRoomId = room.id;
      mockProjectState.projects = [project];
      mockProjectState.rooms = [room];

      const { user } = renderApp(['/rooms/room-1/design']);

      // Start on room design page
      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });

      // Navigate to drawings
      const drawingsLink = screen.getByRole('link', { name: /drawings/i });
      await user.click(drawingsLink);

      await waitFor(() => {
        expect(screen.getByTestId('drawings-page')).toBeInTheDocument();
      });

      // Navigate to quotes
      const quotingLink = screen.getByRole('link', { name: /quoting/i });
      await user.click(quotingLink);

      await waitFor(() => {
        expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
      });

      // Navigate back to room design
      const roomDesignLink = screen.getByRole('link', { name: /room design/i });
      await user.click(roomDesignLink);

      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });
    });
  });

  describe('Project to Room Flow', () => {
    it('can navigate from projects page to room design', async () => {
      const project = createMockProject({ id: 'project-1' });
      const room = createMockRoom({ id: 'room-1', projectId: 'project-1' });

      mockProjectState.projects = [project];
      mockProjectState.rooms = [room];

      // Set room context first so links work
      mockAppState.currentProjectId = project.id;
      mockAppState.currentRoomId = room.id;

      const { user } = renderApp(['/projects']);

      await waitFor(() => {
        expect(screen.getByTestId('projects-page')).toBeInTheDocument();
      });

      // Navigate to room design
      const roomDesignLink = screen.getByRole('link', { name: /room design/i });
      await user.click(roomDesignLink);

      // Verify navigation
      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });
    });
  });

  describe('Back to Projects Flow', () => {
    it('can navigate back to projects from room design', async () => {
      const project = createMockProject({ id: 'project-1' });
      const room = createMockRoom({ id: 'room-1', projectId: 'project-1' });

      mockAppState.currentProjectId = project.id;
      mockAppState.currentRoomId = room.id;
      mockProjectState.projects = [project];
      mockProjectState.rooms = [room];

      const { user } = renderApp(['/rooms/room-1/design']);

      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });

      // Navigate back to projects
      const projectsLink = screen.getByRole('link', { name: /projects/i });
      await user.click(projectsLink);

      await waitFor(() => {
        expect(screen.getByTestId('projects-page')).toBeInTheDocument();
      });
    });
  });
});

describe('Room Design Page Features', () => {
  beforeEach(() => {
    cleanupTest();
    mockAppState.currentMode = 'room-design';
    mockAppState.sidebarExpanded = true;
    mockAppState.currentProjectId = 'project-1';
    mockAppState.currentRoomId = 'room-1';
    mockProjectState.projects = [createMockProject({ id: 'project-1' })];
    mockProjectState.rooms = [createMockRoom({ id: 'room-1', projectId: 'project-1' })];
    mockProjectState.isLoading = false;
  });

  it('renders room design page with required elements', async () => {
    renderApp(['/rooms/room-1/design']);

    await waitFor(() => {
      expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
    });
  });
});

describe('Drawings Page Features', () => {
  beforeEach(() => {
    cleanupTest();
    mockAppState.currentMode = 'drawings';
    mockAppState.sidebarExpanded = true;
    mockAppState.currentProjectId = 'project-1';
    mockAppState.currentRoomId = 'room-1';
    mockProjectState.projects = [createMockProject({ id: 'project-1' })];
    mockProjectState.rooms = [createMockRoom({ id: 'room-1', projectId: 'project-1' })];
    mockProjectState.isLoading = false;
  });

  it('renders drawings page with required elements', async () => {
    renderApp(['/rooms/room-1/drawings']);

    await waitFor(() => {
      expect(screen.getByTestId('drawings-page')).toBeInTheDocument();
    });
  });
});
