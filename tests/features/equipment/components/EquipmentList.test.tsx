import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EquipmentList } from '@/features/equipment/components/EquipmentList';
import type { Equipment } from '@/types/equipment';

// Mock the equipment hooks
vi.mock('@/features/equipment/use-equipment', () => ({
  useEquipmentList: vi.fn(),
  useEquipmentByCategory: vi.fn(),
  useEquipmentSearch: vi.fn(),
}));

import {
  useEquipmentList,
  useEquipmentByCategory,
  useEquipmentSearch,
} from '@/features/equipment/use-equipment';

const mockEquipment: Equipment[] = [
  {
    id: '1',
    manufacturer: 'Shure',
    model: 'MXA920',
    sku: 'MXA920-S',
    category: 'audio',
    subcategory: 'microphones',
    description: 'Ceiling array microphone',
    cost: 2847,
    msrp: 3500,
    dimensions: { height: 2.5, width: 23.5, depth: 23.5 },
    weight: 6.2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    manufacturer: 'Sony',
    model: 'BRC-X1000',
    sku: 'BRC-X1000',
    category: 'video',
    subcategory: 'cameras',
    description: '4K PTZ camera',
    cost: 5200,
    msrp: 6500,
    dimensions: { height: 8, width: 6.5, depth: 7 },
    weight: 4.8,
    platformCertifications: ['teams', 'zoom'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    manufacturer: 'Crestron',
    model: 'CP4-R',
    sku: 'CP4-R',
    category: 'control',
    subcategory: 'processors',
    description: '4-Series Control Processor',
    cost: 3200,
    msrp: 4000,
    dimensions: { height: 1.75, width: 8.26, depth: 6.62 },
    weight: 2.5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
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
  vi.mocked(useEquipmentList).mockReturnValue({
    data: mockEquipment,
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof useEquipmentList>);

  vi.mocked(useEquipmentByCategory).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof useEquipmentByCategory>);

  vi.mocked(useEquipmentSearch).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof useEquipmentSearch>);
}

describe('EquipmentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHooksDefault();
  });

  describe('Rendering', () => {
    it('renders as a section element', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible name', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByRole('region')).toHaveAccessibleName(/equipment/i);
    });

    it('displays page title', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(
        screen.getByRole('heading', { name: /equipment/i, level: 1 })
      ).toBeInTheDocument();
    });

    it('displays equipment count', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByText(/3 items/i)).toBeInTheDocument();
    });
  });

  describe('Equipment Grid', () => {
    it('renders equipment cards in a grid', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      const grid = screen.getByTestId('equipment-grid');
      expect(grid).toBeInTheDocument();
    });

    it('displays all equipment items', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByText('Shure MXA920')).toBeInTheDocument();
      expect(screen.getByText('Sony BRC-X1000')).toBeInTheDocument();
      expect(screen.getByText('Crestron CP4-R')).toBeInTheDocument();
    });

    it('renders each equipment as a card', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(3);
    });
  });

  describe('Category Tabs', () => {
    it('renders category tabs', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    it('displays all category tabs', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /video/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /audio/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /control/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /infrastructure/i })).toBeInTheDocument();
    });

    it('has "All" tab selected by default', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      const allTab = screen.getByRole('tab', { name: /all/i });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
    });

    it('can select a category tab', async () => {
      const user = userEvent.setup();
      render(<EquipmentList />, { wrapper: createWrapper() });

      const videoTab = screen.getByRole('tab', { name: /video/i });
      await user.click(videoTab);

      expect(videoTab).toHaveAttribute('aria-selected', 'true');
    });

    it('filters equipment when category tab clicked', async () => {
      const user = userEvent.setup();
      const videoEquipment = mockEquipment.filter((e) => e.category === 'video');

      vi.mocked(useEquipmentByCategory).mockReturnValue({
        data: videoEquipment,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentByCategory>);

      render(<EquipmentList />, { wrapper: createWrapper() });

      const videoTab = screen.getByRole('tab', { name: /video/i });
      await user.click(videoTab);

      expect(useEquipmentByCategory).toHaveBeenCalledWith('video');
    });

    it('shows "All" tab uses full list hook', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(useEquipmentList).toHaveBeenCalled();
    });

    it('supports keyboard navigation between tabs', async () => {
      const user = userEvent.setup();
      render(<EquipmentList />, { wrapper: createWrapper() });

      const allTab = screen.getByRole('tab', { name: /all/i });
      allTab.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /video/i })).toHaveFocus();
    });
  });

  describe('Search', () => {
    it('renders search input', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('has placeholder text', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByPlaceholderText(/search equipment/i)).toBeInTheDocument();
    });

    it('updates search query on input', async () => {
      const user = userEvent.setup();
      render(<EquipmentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Shure');

      expect(searchInput).toHaveValue('Shure');
    });

    it('uses search hook when query has 2+ characters', async () => {
      const user = userEvent.setup();
      const searchResults = [mockEquipment[0]];

      vi.mocked(useEquipmentSearch).mockReturnValue({
        data: searchResults,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentSearch>);

      render(<EquipmentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Sh');

      await waitFor(() => {
        expect(useEquipmentSearch).toHaveBeenCalledWith('Sh');
      });
    });

    it('shows search results when query is active', async () => {
      const user = userEvent.setup();
      const searchResults = [mockEquipment[0]];

      vi.mocked(useEquipmentSearch).mockReturnValue({
        data: searchResults,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentSearch>);

      render(<EquipmentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Shure');

      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles).toHaveLength(1);
      });
    });

    it('has clear button when search has value', async () => {
      const user = userEvent.setup();
      render(<EquipmentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test');

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('clears search when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<EquipmentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test');

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Loading State', () => {
    it('shows loading state when fetching', () => {
      vi.mocked(useEquipmentList).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentList>);

      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByTestId('equipment-loading')).toBeInTheDocument();
    });

    it('shows loading skeletons', () => {
      vi.mocked(useEquipmentList).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentList>);

      render(<EquipmentList />, { wrapper: createWrapper() });
      const skeletons = screen.getAllByTestId('equipment-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('announces loading state to screen readers', () => {
      vi.mocked(useEquipmentList).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentList>);

      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no equipment', () => {
      vi.mocked(useEquipmentList).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentList>);

      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByTestId('equipment-empty')).toBeInTheDocument();
    });

    it('shows empty message', () => {
      vi.mocked(useEquipmentList).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentList>);

      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByText(/no equipment found/i)).toBeInTheDocument();
    });

    it('shows search-specific empty state when searching', async () => {
      const user = userEvent.setup();

      vi.mocked(useEquipmentSearch).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useEquipmentSearch>);

      render(<EquipmentList />, { wrapper: createWrapper() });

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/no results/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('shows error state when fetch fails', () => {
      vi.mocked(useEquipmentList).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load'),
      } as ReturnType<typeof useEquipmentList>);

      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByTestId('equipment-error')).toBeInTheDocument();
    });

    it('shows error message', () => {
      vi.mocked(useEquipmentList).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network connection failed'),
      } as ReturnType<typeof useEquipmentList>);

      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByText(/network connection failed/i)).toBeInTheDocument();
    });

    it('has retry button', () => {
      vi.mocked(useEquipmentList).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load'),
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useEquipmentList>);

      render(<EquipmentList />, { wrapper: createWrapper() });
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onSelect when equipment card clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(<EquipmentList onSelect={handleSelect} />, { wrapper: createWrapper() });

      const firstCard = screen.getByRole('button', { name: /Shure MXA920/i });
      await user.click(firstCard);

      expect(handleSelect).toHaveBeenCalledWith(mockEquipment[0]);
    });

    it('shows selected state for selectedId', () => {
      const handleSelect = vi.fn();
      render(<EquipmentList selectedId="1" onSelect={handleSelect} />, {
        wrapper: createWrapper(),
      });

      const selectedCard = screen.getByRole('button', { name: /Shure MXA920/i });
      expect(selectedCard).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Favorites', () => {
    it('calls onFavoriteToggle when favorite button clicked', async () => {
      const user = userEvent.setup();
      const handleFavorite = vi.fn();

      render(<EquipmentList onFavoriteToggle={handleFavorite} />, {
        wrapper: createWrapper(),
      });

      const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
      await user.click(favoriteButtons[0]);

      expect(handleFavorite).toHaveBeenCalledWith('1');
    });

    it('shows favorite state for favoriteIds', () => {
      render(<EquipmentList favoriteIds={['1', '2']} />, { wrapper: createWrapper() });

      const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
      expect(favoriteButtons[0]).toHaveAttribute('data-favorite', 'true');
      expect(favoriteButtons[1]).toHaveAttribute('data-favorite', 'true');
      expect(favoriteButtons[2]).toHaveAttribute('data-favorite', 'false');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('search has accessible label', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAccessibleName();
    });

    it('tabs have proper ARIA attributes', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      const tabs = screen.getAllByRole('tab');

      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('grid region is labeled', () => {
      render(<EquipmentList />, { wrapper: createWrapper() });
      const grid = screen.getByTestId('equipment-grid');
      expect(grid).toHaveAttribute('role', 'list');
    });
  });
});
