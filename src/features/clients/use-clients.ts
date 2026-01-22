/**
 * Client React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientService } from './client-service';
import { supabase } from '@/lib/supabase';
import type {
  CreateClientData,
  UpdateClientData,
  CreateContactData,
  UpdateContactData,
  CreatePriceBookEntryData,
} from './client-types';

// ============================================================================
// Query Keys
// ============================================================================

export const CLIENT_KEYS = {
  all: ['clients'] as const,
  list: () => [...CLIENT_KEYS.all, 'list'] as const,
  topLevel: () => [...CLIENT_KEYS.all, 'top-level'] as const,
  detail: (id: string) => [...CLIENT_KEYS.all, 'detail', id] as const,
  children: (parentId: string) => [...CLIENT_KEYS.all, 'children', parentId] as const,
  search: (query: string) => [...CLIENT_KEYS.all, 'search', query] as const,
  contacts: (clientId: string) => [...CLIENT_KEYS.all, 'contacts', clientId] as const,
  priceBook: (clientId: string) => [...CLIENT_KEYS.all, 'price-book', clientId] as const,
};

// ============================================================================
// Client Queries
// ============================================================================

/**
 * Fetch all clients
 */
export function useClientList() {
  return useQuery({
    queryKey: CLIENT_KEYS.list(),
    queryFn: () => ClientService.getAll(),
  });
}

/**
 * Fetch top-level clients only (no parent)
 */
export function useTopLevelClients() {
  return useQuery({
    queryKey: CLIENT_KEYS.topLevel(),
    queryFn: () => ClientService.getTopLevelClients(),
  });
}

/**
 * Fetch a single client by ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: CLIENT_KEYS.detail(id),
    queryFn: () => ClientService.getById(id),
    enabled: !!id,
  });
}

/**
 * Fetch subsidiary clients of a parent
 */
export function useClientChildren(parentId: string) {
  return useQuery({
    queryKey: CLIENT_KEYS.children(parentId),
    queryFn: () => ClientService.getChildren(parentId),
    enabled: !!parentId,
  });
}

/**
 * Search clients by name or contact fields.
 * Only executes when query is 2+ characters.
 */
export function useClientSearch(query: string) {
  return useQuery({
    queryKey: CLIENT_KEYS.search(query),
    queryFn: () => ClientService.search(query),
    enabled: query.length >= 2,
  });
}

// ============================================================================
// Client Mutations
// ============================================================================

/**
 * Create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClientData) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to create a client');
      }
      return ClientService.create(data, authData.user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: CLIENT_KEYS.children(variables.parentId),
        });
      }
    },
  });
}

/**
 * Update a client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
      ClientService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.detail(id) });
    },
  });
}

/**
 * Delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ClientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
    },
  });
}

// ============================================================================
// Contact Queries & Mutations
// ============================================================================

/**
 * Fetch contacts for a client
 */
export function useClientContacts(clientId: string) {
  return useQuery({
    queryKey: CLIENT_KEYS.contacts(clientId),
    queryFn: () => ClientService.getContacts(clientId),
    enabled: !!clientId,
  });
}

/**
 * Create a contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactData) => ClientService.createContact(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CLIENT_KEYS.contacts(variables.clientId),
      });
    },
  });
}

/**
 * Update a contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      clientId: string;
      data: UpdateContactData;
    }) => ClientService.updateContact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CLIENT_KEYS.contacts(variables.clientId),
      });
    },
  });
}

/**
 * Delete a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; clientId: string }) =>
      ClientService.deleteContact(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CLIENT_KEYS.contacts(variables.clientId),
      });
    },
  });
}

// ============================================================================
// Price Book Queries & Mutations
// ============================================================================

/**
 * Fetch price book for a client
 */
export function useClientPriceBook(clientId: string) {
  return useQuery({
    queryKey: CLIENT_KEYS.priceBook(clientId),
    queryFn: () => ClientService.getPriceBook(clientId),
    enabled: !!clientId,
  });
}

/**
 * Create a price book entry
 */
export function useCreatePriceBookEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceBookEntryData) =>
      ClientService.createPriceBookEntry(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CLIENT_KEYS.priceBook(variables.clientId),
      });
    },
  });
}

/**
 * Delete a price book entry
 */
export function useDeletePriceBookEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; clientId: string }) =>
      ClientService.deletePriceBookEntry(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CLIENT_KEYS.priceBook(variables.clientId),
      });
    },
  });
}
