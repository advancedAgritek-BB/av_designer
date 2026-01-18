/**
 * Quote Hooks - Test Suite
 *
 * Tests for React Query hooks that manage quote state
 * including fetching, mutations, and cache invalidation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useQuotesList,
  useQuotesByProject,
  useQuotesByRoom,
  useQuote,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
} from '@/features/quoting/use-quotes';
import { quoteService } from '@/features/quoting/quote-service';
import type { Quote, QuoteSection, QuoteItem, QuoteTotals } from '@/types/quote';

// Mock the quote service
vi.mock('@/features/quoting/quote-service', () => ({
  quoteService: {
    getAll: vi.fn(),
    getByProject: vi.fn(),
    getByRoom: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Quote Hooks', () => {
  let queryClient: QueryClient;

  const mockItem: QuoteItem = {
    id: 'item-1',
    equipmentId: 'equip-123',
    quantity: 2,
    unitCost: 500,
    unitPrice: 750,
    margin: 250,
    total: 1500,
    status: 'quoting',
  };

  const mockSection: QuoteSection = {
    id: 'section-1',
    name: 'Video Equipment',
    category: 'video',
    items: [mockItem],
    subtotal: 1500,
  };

  const mockTotals: QuoteTotals = {
    equipment: 1500,
    labor: 500,
    subtotal: 2000,
    tax: 200,
    total: 2200,
    margin: 500,
    marginPercentage: 25,
  };

  const mockQuote: Quote = {
    id: 'quote-1',
    projectId: 'proj-123',
    roomId: 'room-456',
    version: 1,
    status: 'draft',
    sections: [mockSection],
    totals: mockTotals,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  // ============================================================================
  // useQuotesList Tests
  // ============================================================================

  describe('useQuotesList', () => {
    it('should fetch all quotes', async () => {
      vi.mocked(quoteService.getAll).mockResolvedValue([mockQuote]);

      const { result } = renderHook(() => useQuotesList(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(quoteService.getAll).toHaveBeenCalled();
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data![0].id).toBe('quote-1');
    });

    it('should handle empty result', async () => {
      vi.mocked(quoteService.getAll).mockResolvedValue([]);

      const { result } = renderHook(() => useQuotesList(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('should handle error', async () => {
      vi.mocked(quoteService.getAll).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useQuotesList(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ============================================================================
  // useQuotesByProject Tests
  // ============================================================================

  describe('useQuotesByProject', () => {
    it('should fetch quotes by project ID', async () => {
      vi.mocked(quoteService.getByProject).mockResolvedValue([mockQuote]);

      const { result } = renderHook(() => useQuotesByProject('proj-123'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(quoteService.getByProject).toHaveBeenCalledWith('proj-123');
      expect(result.current.data).toHaveLength(1);
    });

    it('should be disabled when projectId is empty', async () => {
      const { result } = renderHook(() => useQuotesByProject(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(quoteService.getByProject).not.toHaveBeenCalled();
    });

    it('should handle error', async () => {
      vi.mocked(quoteService.getByProject).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useQuotesByProject('proj-123'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useQuotesByRoom Tests
  // ============================================================================

  describe('useQuotesByRoom', () => {
    it('should fetch quotes by room ID', async () => {
      vi.mocked(quoteService.getByRoom).mockResolvedValue([mockQuote]);

      const { result } = renderHook(() => useQuotesByRoom('room-456'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(quoteService.getByRoom).toHaveBeenCalledWith('room-456');
      expect(result.current.data).toHaveLength(1);
    });

    it('should be disabled when roomId is empty', async () => {
      const { result } = renderHook(() => useQuotesByRoom(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(quoteService.getByRoom).not.toHaveBeenCalled();
    });

    it('should handle error', async () => {
      vi.mocked(quoteService.getByRoom).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useQuotesByRoom('room-456'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useQuote Tests
  // ============================================================================

  describe('useQuote', () => {
    it('should fetch single quote by ID', async () => {
      vi.mocked(quoteService.getById).mockResolvedValue(mockQuote);

      const { result } = renderHook(() => useQuote('quote-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(quoteService.getById).toHaveBeenCalledWith('quote-1');
      expect(result.current.data?.id).toBe('quote-1');
      expect(result.current.data?.projectId).toBe('proj-123');
    });

    it('should be disabled when id is empty', async () => {
      const { result } = renderHook(() => useQuote(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(quoteService.getById).not.toHaveBeenCalled();
    });

    it('should handle null result (not found)', async () => {
      vi.mocked(quoteService.getById).mockResolvedValue(null);

      const { result } = renderHook(() => useQuote('nonexistent'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });

    it('should handle error', async () => {
      vi.mocked(quoteService.getById).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useQuote('quote-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useCreateQuote Tests
  // ============================================================================

  describe('useCreateQuote', () => {
    it('should create a quote', async () => {
      vi.mocked(quoteService.create).mockResolvedValue(mockQuote);

      const { result } = renderHook(() => useCreateQuote(), { wrapper });

      await act(async () => {
        result.current.mutate({
          projectId: 'proj-123',
          roomId: 'room-456',
          version: 1,
          status: 'draft',
          sections: [mockSection],
          totals: mockTotals,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(quoteService.create).toHaveBeenCalled();
      expect(result.current.data?.id).toBe('quote-1');
    });

    it('should invalidate queries on success', async () => {
      vi.mocked(quoteService.create).mockResolvedValue(mockQuote);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateQuote(), { wrapper });

      await act(async () => {
        result.current.mutate({
          projectId: 'proj-123',
          roomId: 'room-456',
          version: 1,
          status: 'draft',
          sections: [],
          totals: mockTotals,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['quotes'] });
    });

    it('should handle error', async () => {
      vi.mocked(quoteService.create).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useCreateQuote(), { wrapper });

      await act(async () => {
        result.current.mutate({
          projectId: 'proj-123',
          roomId: 'room-456',
          version: 1,
          status: 'draft',
          sections: [],
          totals: mockTotals,
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useUpdateQuote Tests
  // ============================================================================

  describe('useUpdateQuote', () => {
    it('should update a quote', async () => {
      const updatedQuote = { ...mockQuote, status: 'quoting' as const, version: 2 };
      vi.mocked(quoteService.update).mockResolvedValue(updatedQuote);

      const { result } = renderHook(() => useUpdateQuote(), { wrapper });

      await act(async () => {
        result.current.mutate({
          id: 'quote-1',
          updates: { status: 'quoting', version: 2 },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(quoteService.update).toHaveBeenCalledWith('quote-1', {
        status: 'quoting',
        version: 2,
      });
      expect(result.current.data?.status).toBe('quoting');
    });

    it('should invalidate queries on success', async () => {
      vi.mocked(quoteService.update).mockResolvedValue(mockQuote);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateQuote(), { wrapper });

      await act(async () => {
        result.current.mutate({
          id: 'quote-1',
          updates: { status: 'approved' },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['quotes'] });
    });

    it('should handle error', async () => {
      vi.mocked(quoteService.update).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useUpdateQuote(), { wrapper });

      await act(async () => {
        result.current.mutate({
          id: 'quote-1',
          updates: { status: 'quoting' },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // useDeleteQuote Tests
  // ============================================================================

  describe('useDeleteQuote', () => {
    it('should delete a quote', async () => {
      vi.mocked(quoteService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteQuote(), { wrapper });

      await act(async () => {
        result.current.mutate('quote-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(quoteService.delete).toHaveBeenCalledWith('quote-1');
    });

    it('should invalidate queries on success', async () => {
      vi.mocked(quoteService.delete).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteQuote(), { wrapper });

      await act(async () => {
        result.current.mutate('quote-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['quotes'] });
    });

    it('should handle error', async () => {
      vi.mocked(quoteService.delete).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useDeleteQuote(), { wrapper });

      await act(async () => {
        result.current.mutate('quote-1');
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
