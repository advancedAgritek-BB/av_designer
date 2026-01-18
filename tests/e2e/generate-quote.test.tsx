/**
 * E2E Generate Quote Workflow Tests
 *
 * Tests the complete workflow for generating and managing quotes.
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

describe('Generate Quote Workflow', () => {
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

  describe('Quote Page Access', () => {
    it('redirects to projects when accessing quotes without room selected', async () => {
      const { user } = renderApp(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Try to navigate to quotes
      const quotingLink = screen.getByRole('link', { name: /quoting/i });
      await user.click(quotingLink);

      // Should redirect to projects since no room is selected
      await waitFor(() => {
        expect(screen.getByTestId('projects-page')).toBeInTheDocument();
      });
    });

    it('loads quotes page when room is selected', async () => {
      const project = createMockProject({ id: 'project-1' });
      const room = createMockRoom({ id: 'room-1', projectId: 'project-1' });

      mockAppState.currentProjectId = project.id;
      mockAppState.currentRoomId = room.id;
      mockProjectState.projects = [project];
      mockProjectState.rooms = [room];

      renderApp(['/rooms/room-1/quotes']);

      await waitFor(() => {
        expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
      });
    });
  });

  describe('Quote Navigation Flow', () => {
    it('can navigate to quotes from room design', async () => {
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

      // Navigate to quotes
      const quotingLink = screen.getByRole('link', { name: /quoting/i });
      await user.click(quotingLink);

      await waitFor(() => {
        expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
      });
    });

    it('can navigate from quotes back to room design', async () => {
      const project = createMockProject({ id: 'project-1' });
      const room = createMockRoom({ id: 'room-1', projectId: 'project-1' });

      mockAppState.currentProjectId = project.id;
      mockAppState.currentRoomId = room.id;
      mockProjectState.projects = [project];
      mockProjectState.rooms = [room];

      const { user } = renderApp(['/rooms/room-1/quotes']);

      // Start on quotes page
      await waitFor(() => {
        expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
      });

      // Navigate to room design
      const roomDesignLink = screen.getByRole('link', { name: /room design/i });
      await user.click(roomDesignLink);

      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Quote Generation Flow', () => {
    it('follows complete workflow: project -> room -> design -> quote', async () => {
      const project = createMockProject({ id: 'project-1', name: 'Corporate HQ' });
      const room = createMockRoom({
        id: 'room-1',
        projectId: 'project-1',
        name: 'Executive Boardroom',
      });

      // Set up state BEFORE rendering (state must be set before render for mock to pick it up)
      mockAppState.currentProjectId = project.id;
      mockAppState.currentRoomId = room.id;
      mockProjectState.projects = [project];
      mockProjectState.rooms = [room];

      const { user } = renderApp(['/rooms/room-1/design']);

      // Start on room design page
      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });

      // Navigate to quotes
      const quotingLink = screen.getByRole('link', { name: /quoting/i });
      await user.click(quotingLink);

      await waitFor(() => {
        expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
      });

      // Navigate back to room design to show flow works
      const roomDesignLink = screen.getByRole('link', { name: /room design/i });
      await user.click(roomDesignLink);

      await waitFor(() => {
        expect(screen.getByTestId('room-design-page')).toBeInTheDocument();
      });
    });
  });
});

describe('Quote Page Features', () => {
  beforeEach(() => {
    cleanupTest();
    mockAppState.currentMode = 'quoting';
    mockAppState.sidebarExpanded = true;
    mockAppState.currentProjectId = 'project-1';
    mockAppState.currentRoomId = 'room-1';
    mockProjectState.projects = [createMockProject({ id: 'project-1' })];
    mockProjectState.rooms = [createMockRoom({ id: 'room-1', projectId: 'project-1' })];
    mockProjectState.isLoading = false;
  });

  it('renders quotes page with required structure', async () => {
    renderApp(['/rooms/room-1/quotes']);

    await waitFor(() => {
      expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
    });
  });

  it('shows correct sidebar link active state', async () => {
    renderApp(['/rooms/room-1/quotes']);

    await waitFor(() => {
      expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
    });

    // Quoting link should have correct href (MemoryRouter uses / not #/)
    const quotingLink = screen.getByRole('link', { name: /quoting/i });
    expect(quotingLink).toHaveAttribute('href', '/rooms/room-1/quotes');
  });
});

describe('Quote Context Preservation', () => {
  beforeEach(() => {
    cleanupTest();
    mockAppState.currentMode = 'quoting';
    mockAppState.sidebarExpanded = true;
    mockAppState.currentProjectId = 'project-1';
    mockAppState.currentRoomId = 'room-1';
    mockProjectState.projects = [
      createMockProject({ id: 'project-1', name: 'Corporate HQ Project' }),
    ];
    mockProjectState.rooms = [
      createMockRoom({ id: 'room-1', projectId: 'project-1', name: 'Main Boardroom' }),
    ];
    mockProjectState.isLoading = false;
  });

  it('maintains room context in navigation links', async () => {
    renderApp(['/rooms/room-1/quotes']);

    await waitFor(() => {
      expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
    });

    // All room-specific links should have the room ID (MemoryRouter uses / not #/)
    const roomDesignLink = screen.getByRole('link', { name: /room design/i });
    const drawingsLink = screen.getByRole('link', { name: /drawings/i });
    const quotingLink = screen.getByRole('link', { name: /quoting/i });

    expect(roomDesignLink).toHaveAttribute('href', '/rooms/room-1/design');
    expect(drawingsLink).toHaveAttribute('href', '/rooms/room-1/drawings');
    expect(quotingLink).toHaveAttribute('href', '/rooms/room-1/quotes');
  });

  it('shows project and room context in header', async () => {
    renderApp(['/rooms/room-1/quotes']);

    await waitFor(() => {
      expect(screen.getByText('Corporate HQ Project')).toBeInTheDocument();
      expect(screen.getByText('Main Boardroom')).toBeInTheDocument();
    });
  });
});

describe('Equipment to Quote Integration', () => {
  beforeEach(() => {
    cleanupTest();
    mockAppState.currentMode = 'equipment';
    mockAppState.sidebarExpanded = true;
    mockAppState.currentProjectId = null;
    mockAppState.currentRoomId = null;
    mockProjectState.projects = [];
    mockProjectState.rooms = [];
    mockProjectState.isLoading = false;
  });

  it('can navigate from equipment library to quotes flow', async () => {
    const project = createMockProject({ id: 'project-1' });
    const room = createMockRoom({ id: 'room-1', projectId: 'project-1' });

    // Set up state BEFORE rendering so links work correctly
    mockAppState.currentProjectId = project.id;
    mockAppState.currentRoomId = room.id;
    mockProjectState.projects = [project];
    mockProjectState.rooms = [room];

    const { user } = renderApp(['/equipment']);

    // Start on equipment page
    await waitFor(() => {
      expect(screen.getByTestId('equipment-page')).toBeInTheDocument();
    });

    // Navigate to quotes (with room already selected)
    const quotingLink = screen.getByRole('link', { name: /quoting/i });
    await user.click(quotingLink);

    await waitFor(() => {
      expect(screen.getByTestId('quotes-page')).toBeInTheDocument();
    });
  });
});
