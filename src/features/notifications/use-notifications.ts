/**
 * Notification React Query Hooks
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService, mapNotificationFromDb } from './notification-service';
import { supabase } from '@/lib/supabase';
import type {
  CreatePreferenceData,
  UpdatePreferenceData,
  CreateOrgRuleData,
  UpdateOrgRuleData,
  Notification,
  NotificationRow,
} from './notification-types';

// ============================================================================
// Query Keys
// ============================================================================

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (userId: string) => [...NOTIFICATION_KEYS.all, 'list', userId] as const,
  unread: (userId: string) => [...NOTIFICATION_KEYS.all, 'unread', userId] as const,
  count: (userId: string) => [...NOTIFICATION_KEYS.all, 'count', userId] as const,
  preferences: (userId: string) =>
    [...NOTIFICATION_KEYS.all, 'preferences', userId] as const,
  orgRules: (orgId: string) => [...NOTIFICATION_KEYS.all, 'org-rules', orgId] as const,
};

// ============================================================================
// Notification Queries
// ============================================================================

/**
 * Fetch all notifications for a user
 */
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(userId),
    queryFn: () => NotificationService.getAll(userId),
    enabled: !!userId,
  });
}

/**
 * Fetch unread notifications for a user
 */
export function useUnreadNotifications(userId: string) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unread(userId),
    queryFn: () => NotificationService.getUnread(userId),
    enabled: !!userId,
  });
}

/**
 * Fetch unread notification count
 */
export function useNotificationCount(userId: string) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.count(userId),
    queryFn: () => NotificationService.getUnreadCount(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// ============================================================================
// Notification Mutations
// ============================================================================

/**
 * Mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),
    onSuccess: (notification) => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.list(notification.userId),
      });
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.unread(notification.userId),
      });
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.count(notification.userId),
      });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => NotificationService.markAllAsRead(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId) });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread(userId) });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.count(userId) });
    },
  });
}

/**
 * Dismiss (delete) a notification
 */
export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; userId: string }) =>
      NotificationService.delete(params.id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId) });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread(userId) });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.count(userId) });
    },
  });
}

/**
 * Dismiss all notifications
 */
export function useDismissAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => NotificationService.deleteAll(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(userId) });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread(userId) });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.count(userId) });
    },
  });
}

// ============================================================================
// Real-time Subscription Hook
// ============================================================================

/**
 * Subscribe to real-time notifications
 */
export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Add new notification to cache
          const newNotification = mapNotificationFromDb(payload.new as NotificationRow);

          // Update unread list
          queryClient.setQueryData(
            NOTIFICATION_KEYS.unread(userId),
            (old: Notification[] | undefined) => {
              if (!old) return [newNotification];
              return [newNotification, ...old];
            }
          );

          // Update all list
          queryClient.setQueryData(
            NOTIFICATION_KEYS.list(userId),
            (old: Notification[] | undefined) => {
              if (!old) return [newNotification];
              return [newNotification, ...old];
            }
          );

          // Increment count
          queryClient.setQueryData(
            NOTIFICATION_KEYS.count(userId),
            (old: number | undefined) => (old || 0) + 1
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}

// ============================================================================
// Preference Queries & Mutations
// ============================================================================

/**
 * Fetch notification preferences for a user
 */
export function useNotificationPreferences(userId: string) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.preferences(userId),
    queryFn: () => NotificationService.getPreferences(userId),
    enabled: !!userId,
  });
}

/**
 * Update a notification preference
 */
export function useUpdatePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: UpdatePreferenceData; userId: string }) =>
      NotificationService.updatePreference(params.id, params.data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.preferences(userId) });
    },
  });
}

/**
 * Create or update a preference
 */
export function useUpsertPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; data: CreatePreferenceData }) =>
      NotificationService.upsertPreference(params.userId, params.data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.preferences(userId) });
    },
  });
}

/**
 * Reset preferences to defaults
 */
export function useResetPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => NotificationService.resetPreferences(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.preferences(userId) });
    },
  });
}

// ============================================================================
// Org Rule Queries & Mutations
// ============================================================================

/**
 * Fetch notification rules for an organization
 */
export function useOrgNotificationRules(orgId: string) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.orgRules(orgId),
    queryFn: () => NotificationService.getOrgRules(orgId),
    enabled: !!orgId,
  });
}

/**
 * Update an org notification rule
 */
export function useUpdateOrgRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: UpdateOrgRuleData; orgId: string }) =>
      NotificationService.updateOrgRule(params.id, params.data),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.orgRules(orgId) });
    },
  });
}

/**
 * Create or update an org rule
 */
export function useUpsertOrgRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { data: CreateOrgRuleData }) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to manage org rules');
      }
      return NotificationService.upsertOrgRule(params.data, authData.user.id);
    },
    onSuccess: (rule) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.orgRules(rule.orgId) });
    },
  });
}

/**
 * Delete an org rule
 */
export function useDeleteOrgRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; orgId: string }) =>
      NotificationService.deleteOrgRule(params.id),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.orgRules(orgId) });
    },
  });
}
