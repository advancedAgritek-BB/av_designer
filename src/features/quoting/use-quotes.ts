/**
 * Quote Hooks
 *
 * React Query hooks for managing quote state including
 * fetching, creating, updating, and deleting quotes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quoteService, type CreateQuoteInput } from './quote-service';
import type { Quote } from '@/types/quote';

/**
 * Query key factory for quote queries
 * Provides consistent cache key structure for invalidation
 */
const QUOTE_KEYS = {
  all: ['quotes'] as const,
  list: () => [...QUOTE_KEYS.all, 'list'] as const,
  byProject: (projectId: string) => [...QUOTE_KEYS.all, 'project', projectId] as const,
  byRoom: (roomId: string) => [...QUOTE_KEYS.all, 'room', roomId] as const,
  detail: (id: string) => [...QUOTE_KEYS.all, 'detail', id] as const,
};

/**
 * Fetch all quotes
 */
export function useQuotesList() {
  return useQuery({
    queryKey: QUOTE_KEYS.list(),
    queryFn: () => quoteService.getAll(),
  });
}

/**
 * Fetch quotes by project ID
 * Disabled when projectId is empty
 */
export function useQuotesByProject(projectId: string) {
  return useQuery({
    queryKey: QUOTE_KEYS.byProject(projectId),
    queryFn: () => quoteService.getByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Fetch quotes by room ID
 * Disabled when roomId is empty
 */
export function useQuotesByRoom(roomId: string) {
  return useQuery({
    queryKey: QUOTE_KEYS.byRoom(roomId),
    queryFn: () => quoteService.getByRoom(roomId),
    enabled: !!roomId,
  });
}

/**
 * Fetch single quote by ID
 * Disabled when id is empty
 */
export function useQuote(id: string) {
  return useQuery({
    queryKey: QUOTE_KEYS.detail(id),
    queryFn: () => quoteService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create new quote
 * Invalidates all quote queries on success
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateQuoteInput) => quoteService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
    },
  });
}

/**
 * Update existing quote
 * Invalidates all quote queries on success
 */
export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Quote> }) =>
      quoteService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
    },
  });
}

/**
 * Delete quote
 * Invalidates all quote queries on success
 */
export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quoteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTE_KEYS.all });
    },
  });
}
