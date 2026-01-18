/**
 * End-to-End Test Setup
 *
 * Provides test utilities and helpers for E2E integration tests.
 * These tests verify complete user workflows across multiple components.
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import type { ReactNode } from 'react';

// =============================================================================
// Test Query Client
// =============================================================================

/**
 * Create a fresh QueryClient for each test
 * Configured with no retries and immediate error handling for faster tests
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// =============================================================================
// Mock Store State
// =============================================================================

export interface MockAppState {
  currentMode: string;
  sidebarExpanded: boolean;
  currentProjectId: string | null;
  currentRoomId: string | null;
  setMode: ReturnType<typeof vi.fn>;
  toggleSidebar: ReturnType<typeof vi.fn>;
  setSidebarExpanded: ReturnType<typeof vi.fn>;
  setCurrentProject: ReturnType<typeof vi.fn>;
  setCurrentRoom: ReturnType<typeof vi.fn>;
  resetContext: ReturnType<typeof vi.fn>;
}

export interface MockProjectState {
  projects: Array<{ id: string; name: string; client_name?: string; status?: string }>;
  rooms: Array<{ id: string; name: string; projectId: string }>;
  isLoading: boolean;
}

/**
 * Create default mock app store state
 */
export function createMockAppState(overrides: Partial<MockAppState> = {}): MockAppState {
  return {
    currentMode: 'home',
    sidebarExpanded: true,
    currentProjectId: null,
    currentRoomId: null,
    setMode: vi.fn(),
    toggleSidebar: vi.fn(),
    setSidebarExpanded: vi.fn(),
    setCurrentProject: vi.fn(),
    setCurrentRoom: vi.fn(),
    resetContext: vi.fn(),
    ...overrides,
  };
}

/**
 * Create default mock project store state
 */
export function createMockProjectState(
  overrides: Partial<MockProjectState> = {}
): MockProjectState {
  return {
    projects: [],
    rooms: [],
    isLoading: false,
    ...overrides,
  };
}

// =============================================================================
// Render Helpers
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

/**
 * Render a component with all necessary providers for E2E testing
 */
export function renderWithProviders(ui: ReactNode, options: RenderOptions = {}) {
  const { initialEntries = ['/'], queryClient = createTestQueryClient() } = options;

  const user = userEvent.setup();

  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );

  return {
    ...result,
    user,
    queryClient,
  };
}

// =============================================================================
// Navigation Helpers
// =============================================================================

/**
 * Navigate to a specific route by clicking a link
 */
export async function navigateToRoute(
  user: ReturnType<typeof userEvent.setup>,
  linkName: RegExp | string
) {
  const link = screen.getByRole('link', { name: linkName });
  await user.click(link);
}

/**
 * Wait for a page to be loaded (checks for data-testid)
 */
export async function waitForPageLoad(testId: string) {
  await waitFor(() => {
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
}

/**
 * Wait for navigation to complete by checking URL or page content
 */
export async function waitForNavigation(expectedContent: RegExp | string) {
  await waitFor(() => {
    expect(screen.getByText(expectedContent)).toBeInTheDocument();
  });
}

// =============================================================================
// Form Helpers
// =============================================================================

/**
 * Fill in a form field by label
 */
export async function fillFormField(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp | string,
  value: string
) {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  await user.type(input, value);
}

/**
 * Select an option from a dropdown
 */
export async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp | string,
  optionText: string
) {
  const select = screen.getByLabelText(label);
  await user.selectOptions(select, optionText);
}

/**
 * Click a button by name
 */
export async function clickButton(
  user: ReturnType<typeof userEvent.setup>,
  buttonName: RegExp | string
) {
  const button = screen.getByRole('button', { name: buttonName });
  await user.click(button);
}

/**
 * Submit a form
 */
export async function submitForm(user: ReturnType<typeof userEvent.setup>) {
  const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
  await user.click(submitButton);
}

// =============================================================================
// Assertion Helpers
// =============================================================================

/**
 * Assert that a success message is displayed
 */
export function expectSuccessMessage(message: RegExp | string) {
  expect(screen.getByText(message)).toBeInTheDocument();
}

/**
 * Assert that an error message is displayed
 */
export function expectErrorMessage(message: RegExp | string) {
  expect(screen.getByText(message)).toBeInTheDocument();
}

/**
 * Assert that a loading state is shown
 */
export function expectLoading() {
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
}

/**
 * Assert that an element with specific text exists within a container
 */
export function expectWithinContainer(containerTestId: string, text: RegExp | string) {
  const container = screen.getByTestId(containerTestId);
  expect(within(container).getByText(text)).toBeInTheDocument();
}

// =============================================================================
// Mock Data Factories
// =============================================================================

/**
 * Create a mock project
 */
export function createMockProject(overrides: Partial<{ id: string; name: string; client_name: string; status: string }> = {}) {
  return {
    id: `project-${Date.now()}`,
    name: 'Test Project',
    client_name: 'Test Client',
    status: 'draft',
    ...overrides,
  };
}

/**
 * Create a mock room
 */
export function createMockRoom(overrides: Partial<{ id: string; name: string; projectId: string; room_type: string; width: number; length: number }> = {}) {
  return {
    id: `room-${Date.now()}`,
    name: 'Test Conference Room',
    projectId: 'project-1',
    room_type: 'conference',
    width: 20,
    length: 30,
    ceiling_height: 9,
    platform: 'teams',
    tier: 'standard',
    ...overrides,
  };
}

/**
 * Create mock equipment
 */
export function createMockEquipment(overrides: Partial<{ id: string; manufacturer: string; model: string; sku: string; category: string }> = {}) {
  return {
    id: `equipment-${Date.now()}`,
    manufacturer: 'Test Manufacturer',
    model: 'Test Model',
    sku: 'TEST-SKU-001',
    category: 'video',
    subcategory: 'displays',
    description: 'Test equipment description',
    cost: 1000,
    msrp: 1500,
    dimensions: { height: 24, width: 55, depth: 3 },
    weight: 45,
    ...overrides,
  };
}

/**
 * Create a mock quote
 */
export function createMockQuote(overrides: Partial<{ id: string; projectId: string; roomId: string; items: unknown[]; total: number }> = {}) {
  return {
    id: `quote-${Date.now()}`,
    projectId: 'project-1',
    roomId: 'room-1',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    currency: 'USD',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

// =============================================================================
// Cleanup
// =============================================================================

/**
 * Clean up after each test
 * Call this in afterEach if needed
 */
export function cleanupTest() {
  vi.clearAllMocks();
}
