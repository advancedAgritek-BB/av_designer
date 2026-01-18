/**
 * StandardsList Component Tests
 *
 * Tests for the hierarchical standards tree display component
 * with dimension filtering and state management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { StandardsList } from '@/features/standards/components/StandardsList';
import type { StandardNode, Rule } from '@/types/standards';

// Mock the standards hooks
vi.mock('@/features/standards/use-standards', () => ({
  useNodesList: vi.fn(),
  useRulesList: vi.fn(),
  useRulesByAspect: vi.fn(),
}));

import {
  useNodesList,
  useRulesList,
  useRulesByAspect,
} from '@/features/standards/use-standards';

const mockNodes: StandardNode[] = [
  {
    id: 'node-1',
    name: 'Platform Standards',
    parentId: null,
    type: 'folder',
    order: 1,
  },
  {
    id: 'node-2',
    name: 'Teams Standards',
    parentId: 'node-1',
    type: 'standard',
    order: 1,
  },
  {
    id: 'node-3',
    name: 'Zoom Standards',
    parentId: 'node-1',
    type: 'standard',
    order: 2,
  },
  {
    id: 'node-4',
    name: 'Room Type Standards',
    parentId: null,
    type: 'folder',
    order: 2,
  },
];

const mockRules: Rule[] = [
  {
    id: 'rule-1',
    name: 'Teams Display Size',
    description: 'Require 75" display for Teams rooms',
    aspect: 'equipment_selection',
    expressionType: 'constraint',
    conditions: [{ dimension: 'platform', operator: 'equals', value: 'teams' }],
    expression: 'display.size >= 75',
    priority: 80,
    isActive: true,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'rule-2',
    name: 'Premium Microphones',
    description: 'Premium tier requires ceiling mics',
    aspect: 'quantities',
    expressionType: 'constraint',
    conditions: [{ dimension: 'tier', operator: 'equals', value: 'premium' }],
    expression: 'microphones.count >= 2',
    priority: 75,
    isActive: true,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'rule-3',
    name: 'Inactive Rule',
    description: 'This rule is disabled',
    aspect: 'placement',
    expressionType: 'constraint',
    conditions: [{ dimension: 'room_type', operator: 'equals', value: 'huddle' }],
    expression: 'display.height <= 65',
    priority: 50,
    isActive: false,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function mockHooksDefault() {
  vi.mocked(useNodesList).mockReturnValue({
    data: mockNodes,
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof useNodesList>);

  vi.mocked(useRulesList).mockReturnValue({
    data: mockRules,
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof useRulesList>);

  vi.mocked(useRulesByAspect).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof useRulesByAspect>);
}

describe('StandardsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHooksDefault();
  });

  describe('Rendering', () => {
    it('renders as a section element', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible name', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByRole('region')).toHaveAccessibleName(/standards/i);
    });

    it('displays page title', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(
        screen.getByRole('heading', { name: /standards/i, level: 1 })
      ).toBeInTheDocument();
    });

    it('displays rule count', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByText(/3 rules/i)).toBeInTheDocument();
    });
  });

  describe('Standards Tree', () => {
    it('renders standards tree container', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const tree = screen.getByRole('tree');
      expect(tree).toBeInTheDocument();
    });

    it('displays root level folders', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByText('Platform Standards')).toBeInTheDocument();
      expect(screen.getByText('Room Type Standards')).toBeInTheDocument();
    });

    it('renders tree items with proper role', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const treeItems = screen.getAllByRole('treeitem');
      expect(treeItems.length).toBeGreaterThan(0);
    });

    it('folders are expandable', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const platformFolder = screen
        .getByText('Platform Standards')
        .closest('[role="treeitem"]');
      expect(platformFolder).toHaveAttribute('aria-expanded');
    });
  });

  describe('Folder Expansion', () => {
    it('expands folder on click', async () => {
      const user = userEvent.setup();
      render(<StandardsList />, { wrapper: createWrapper() });

      const platformFolder = screen.getByRole('treeitem', {
        name: /platform standards/i,
      });
      await user.click(platformFolder);

      expect(platformFolder).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows child nodes when expanded', async () => {
      const user = userEvent.setup();
      render(<StandardsList />, { wrapper: createWrapper() });

      const platformFolder = screen.getByRole('treeitem', {
        name: /platform standards/i,
      });
      await user.click(platformFolder);

      await waitFor(() => {
        expect(screen.getByText('Teams Standards')).toBeInTheDocument();
        expect(screen.getByText('Zoom Standards')).toBeInTheDocument();
      });
    });

    it('collapses folder on second click', async () => {
      const user = userEvent.setup();
      render(<StandardsList />, { wrapper: createWrapper() });

      const platformFolder = screen.getByRole('treeitem', {
        name: /platform standards/i,
      });
      await user.click(platformFolder);
      await user.click(platformFolder);

      expect(platformFolder).toHaveAttribute('aria-expanded', 'false');
    });

    it('supports keyboard expansion with Enter', async () => {
      const user = userEvent.setup();
      render(<StandardsList />, { wrapper: createWrapper() });

      const platformFolder = screen.getByRole('treeitem', {
        name: /platform standards/i,
      });
      platformFolder.focus();
      await user.keyboard('{Enter}');

      expect(platformFolder).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Aspect Tabs', () => {
    it('renders aspect filter tabs', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    it('displays all aspect tabs', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /equipment/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /quantities/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /placement/i })).toBeInTheDocument();
    });

    it('has "All" tab selected by default', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const allTab = screen.getByRole('tab', { name: /all/i });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
    });

    it('can select an aspect tab', async () => {
      const user = userEvent.setup();
      render(<StandardsList />, { wrapper: createWrapper() });

      const equipmentTab = screen.getByRole('tab', { name: /equipment/i });
      await user.click(equipmentTab);

      expect(equipmentTab).toHaveAttribute('aria-selected', 'true');
    });

    it('calls useRulesByAspect when aspect tab clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(useRulesByAspect).mockReturnValue({
        data: [mockRules[0]],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useRulesByAspect>);

      render(<StandardsList />, { wrapper: createWrapper() });

      const equipmentTab = screen.getByRole('tab', { name: /equipment/i });
      await user.click(equipmentTab);

      expect(useRulesByAspect).toHaveBeenCalledWith('equipment_selection');
    });
  });

  describe('Rule Display', () => {
    it('displays rules in list', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByText('Teams Display Size')).toBeInTheDocument();
      expect(screen.getByText('Premium Microphones')).toBeInTheDocument();
    });

    it('shows rule priority', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByText(/priority: 80/i)).toBeInTheDocument();
    });

    it('shows rule active state', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const inactiveRule = screen
        .getByText('Inactive Rule')
        .closest('[data-testid="rule-item"]');
      expect(inactiveRule).toHaveAttribute('data-active', 'false');
    });

    it('shows rule aspect badge', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByText(/equipment_selection/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state when fetching nodes', () => {
      vi.mocked(useNodesList).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useNodesList>);

      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByTestId('standards-loading')).toBeInTheDocument();
    });

    it('shows loading skeletons', () => {
      vi.mocked(useNodesList).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useNodesList>);

      render(<StandardsList />, { wrapper: createWrapper() });
      const skeletons = screen.getAllByTestId('standards-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('announces loading state to screen readers', () => {
      vi.mocked(useNodesList).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useNodesList>);

      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no standards', () => {
      vi.mocked(useNodesList).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useNodesList>);

      vi.mocked(useRulesList).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useRulesList>);

      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByTestId('standards-empty')).toBeInTheDocument();
    });

    it('shows empty message', () => {
      vi.mocked(useNodesList).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useNodesList>);

      vi.mocked(useRulesList).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useRulesList>);

      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByText(/no standards found/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error state when fetch fails', () => {
      vi.mocked(useNodesList).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load'),
      } as ReturnType<typeof useNodesList>);

      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByTestId('standards-error')).toBeInTheDocument();
    });

    it('shows error message', () => {
      vi.mocked(useNodesList).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network connection failed'),
      } as ReturnType<typeof useNodesList>);

      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByText(/network connection failed/i)).toBeInTheDocument();
    });

    it('has retry button', () => {
      vi.mocked(useNodesList).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load'),
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useNodesList>);

      render(<StandardsList />, { wrapper: createWrapper() });
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onNodeSelect when node clicked', async () => {
      const user = userEvent.setup();
      const handleNodeSelect = vi.fn();

      render(<StandardsList onNodeSelect={handleNodeSelect} />, {
        wrapper: createWrapper(),
      });

      const platformFolder = screen.getByRole('treeitem', {
        name: /platform standards/i,
      });
      await user.click(platformFolder);

      expect(handleNodeSelect).toHaveBeenCalledWith(mockNodes[0]);
    });

    it('calls onRuleSelect when rule clicked', async () => {
      const user = userEvent.setup();
      const handleRuleSelect = vi.fn();

      render(<StandardsList onRuleSelect={handleRuleSelect} />, {
        wrapper: createWrapper(),
      });

      const ruleItem = screen
        .getByText('Teams Display Size')
        .closest('[data-testid="rule-item"]');
      await user.click(ruleItem!);

      expect(handleRuleSelect).toHaveBeenCalledWith(mockRules[0]);
    });

    it('shows selected state for selectedNodeId', () => {
      render(<StandardsList selectedNodeId="node-1" />, { wrapper: createWrapper() });

      const selectedNode = screen.getByRole('treeitem', { name: /platform standards/i });
      expect(selectedNode).toHaveAttribute('aria-selected', 'true');
    });

    it('shows selected state for selectedRuleId', () => {
      render(<StandardsList selectedRuleId="rule-1" />, { wrapper: createWrapper() });

      const selectedRule = screen
        .getByText('Teams Display Size')
        .closest('[data-testid="rule-item"]');
      expect(selectedRule).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('tree has accessible label', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const tree = screen.getByRole('tree');
      expect(tree).toHaveAccessibleName();
    });

    it('tabs have proper ARIA attributes', () => {
      render(<StandardsList />, { wrapper: createWrapper() });
      const tabs = screen.getAllByRole('tab');

      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('supports keyboard navigation in tree', async () => {
      const user = userEvent.setup();
      render(<StandardsList />, { wrapper: createWrapper() });

      const firstTreeItem = screen.getAllByRole('treeitem')[0];
      firstTreeItem.focus();

      await user.keyboard('{ArrowDown}');
      // Should navigate to next item
      expect(document.activeElement).not.toBe(firstTreeItem);
    });
  });
});
