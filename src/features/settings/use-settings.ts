/**
 * Settings React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from './settings-service';
import type {
  UpdateUserPreferencesData,
  CreateDefaultProfileData,
  UpdateDefaultProfileData,
  UpsertIntegrationData,
  UpdateIntegrationData,
  CreateApiKeyData,
  CreateBillingInvoiceData,
  UpdateOrgSettingsData,
} from './settings-types';

// ============================================================================
// Query Keys
// ============================================================================

export const SETTINGS_KEYS = {
  all: ['settings'] as const,
  preferences: (userId: string) => [...SETTINGS_KEYS.all, 'preferences', userId] as const,
  profiles: (userId: string) => [...SETTINGS_KEYS.all, 'profiles', userId] as const,
  profile: (id: string) => [...SETTINGS_KEYS.all, 'profile', id] as const,
  integrations: (userId: string, orgId?: string) =>
    [...SETTINGS_KEYS.all, 'integrations', userId, orgId ?? 'all'] as const,
  integration: (id: string) => [...SETTINGS_KEYS.all, 'integration', id] as const,
  apiKeys: (orgId: string) => [...SETTINGS_KEYS.all, 'api-keys', orgId] as const,
  auditLogs: (orgId: string) => [...SETTINGS_KEYS.all, 'audit-logs', orgId] as const,
  orgSettings: (orgId: string) => [...SETTINGS_KEYS.all, 'org-settings', orgId] as const,
  sessions: (userId: string) => [...SETTINGS_KEYS.all, 'sessions', userId] as const,
  billingInvoices: (orgId: string) =>
    [...SETTINGS_KEYS.all, 'billing-invoices', orgId] as const,
};

// ============================================================================
// User Preferences Hooks
// ============================================================================

/**
 * Fetch user preferences
 */
export function useUserPreferences(userId: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.preferences(userId),
    queryFn: () => SettingsService.getPreferences(userId),
    enabled: !!userId,
  });
}

/**
 * Update user preferences
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; data: UpdateUserPreferencesData }) =>
      SettingsService.upsertPreferences(params.userId, params.data),
    onSuccess: (preferences) => {
      queryClient.setQueryData(
        SETTINGS_KEYS.preferences(preferences.userId),
        preferences
      );
    },
  });
}

// ============================================================================
// Default Profiles Hooks
// ============================================================================

/**
 * Fetch all default profiles for a user
 */
export function useDefaultProfiles(userId: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.profiles(userId),
    queryFn: () => SettingsService.getDefaultProfiles(userId),
    enabled: !!userId,
  });
}

/**
 * Fetch a single default profile
 */
export function useDefaultProfile(id: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.profile(id),
    queryFn: () => SettingsService.getDefaultProfile(id),
    enabled: !!id,
  });
}

/**
 * Create a new default profile
 */
export function useCreateDefaultProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; data: CreateDefaultProfileData }) =>
      SettingsService.createDefaultProfile(params.userId, params.data),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.profiles(profile.userId),
      });
    },
  });
}

/**
 * Update a default profile
 */
export function useUpdateDefaultProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: UpdateDefaultProfileData }) =>
      SettingsService.updateDefaultProfile(params.id, params.data),
    onSuccess: (profile) => {
      queryClient.setQueryData(SETTINGS_KEYS.profile(profile.id), profile);
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.profiles(profile.userId),
      });
    },
  });
}

/**
 * Delete a default profile
 */
export function useDeleteDefaultProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; userId: string }) =>
      SettingsService.deleteDefaultProfile(params.id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.profiles(userId),
      });
    },
  });
}

// ============================================================================
// Integrations Hooks
// ============================================================================

/**
 * Fetch user integrations
 */
export function useIntegrations(userId: string, orgId?: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.integrations(userId, orgId),
    queryFn: () => SettingsService.getIntegrations(userId, orgId),
    enabled: !!userId && !!orgId,
  });
}

/**
 * Upsert an integration connection
 */
export function useUpsertIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertIntegrationData) => SettingsService.upsertIntegration(data),
    onSuccess: (integration) => {
      queryClient.setQueryData(SETTINGS_KEYS.integration(integration.id), integration);
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.integrations(integration.userId, integration.orgId),
      });
    },
  });
}

/**
 * Fetch a single integration
 */
export function useIntegration(id: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.integration(id),
    queryFn: () => SettingsService.getIntegration(id),
    enabled: !!id,
  });
}

/**
 * Update an integration
 */
export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: UpdateIntegrationData }) =>
      SettingsService.updateIntegration(params.id, params.data),
    onSuccess: (integration) => {
      queryClient.setQueryData(SETTINGS_KEYS.integration(integration.id), integration);
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.integrations(integration.userId, integration.orgId),
      });
    },
  });
}

/**
 * Disconnect an integration
 */
export function useDisconnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SettingsService.disconnectIntegration(id),
    onSuccess: (integration) => {
      queryClient.setQueryData(SETTINGS_KEYS.integration(integration.id), integration);
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.integrations(integration.userId, integration.orgId),
      });
    },
  });
}

// ============================================================================
// API Keys Hooks
// ============================================================================

/**
 * Fetch API keys for an org
 */
export function useApiKeys(orgId: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.apiKeys(orgId),
    queryFn: () => SettingsService.getApiKeys(orgId),
    enabled: !!orgId,
  });
}

/**
 * Create a new API key
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { orgId: string; userId: string; data: CreateApiKeyData }) =>
      SettingsService.createApiKey(params.orgId, params.userId, params.data),
    onSuccess: ({ apiKey }) => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.apiKeys(apiKey.orgId),
      });
    },
  });
}

/**
 * Revoke an API key
 */
export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; userId: string; orgId: string }) =>
      SettingsService.revokeApiKey(params.id, params.userId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.apiKeys(orgId),
      });
    },
  });
}

// ============================================================================
// Audit Logs Hooks
// ============================================================================

/**
 * Fetch audit logs for an org
 */
export function useAuditLogs(
  orgId: string,
  options?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: [...SETTINGS_KEYS.auditLogs(orgId), options],
    queryFn: () => SettingsService.getAuditLogs(orgId, options),
    enabled: !!orgId,
  });
}

/**
 * Create an audit log entry
 */
export function useCreateAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      orgId: string;
      userId: string | null;
      action: string;
      entityType: string;
      entityId?: string;
      details?: Record<string, unknown>;
    }) =>
      SettingsService.createAuditLog(
        params.orgId,
        params.userId,
        params.action,
        params.entityType,
        params.entityId,
        params.details
      ),
    onSuccess: (log) => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.auditLogs(log.orgId),
      });
    },
  });
}

// ============================================================================
// Org Settings Hooks
// ============================================================================

/**
 * Fetch org settings
 */
export function useOrgSettings(orgId: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.orgSettings(orgId),
    queryFn: () => SettingsService.getOrgSettings(orgId),
    enabled: !!orgId,
  });
}

/**
 * Update org settings
 */
export function useUpdateOrgSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { orgId: string; data: UpdateOrgSettingsData }) =>
      SettingsService.upsertOrgSettings(params.orgId, params.data),
    onSuccess: (settings) => {
      queryClient.setQueryData(SETTINGS_KEYS.orgSettings(settings.orgId), settings);
    },
  });
}

// ============================================================================
// Billing Invoices Hooks
// ============================================================================

/**
 * Fetch billing invoices for an org
 */
export function useBillingInvoices(orgId: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.billingInvoices(orgId),
    queryFn: () => SettingsService.getBillingInvoices(orgId),
    enabled: !!orgId,
  });
}

/**
 * Create a billing invoice
 */
export function useCreateBillingInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { orgId: string; data: CreateBillingInvoiceData }) =>
      SettingsService.createBillingInvoice(params.orgId, params.data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.billingInvoices(invoice.orgId),
      });
    },
  });
}

// ============================================================================
// User Sessions Hooks
// ============================================================================

/**
 * Fetch user sessions
 */
export function useUserSessions(userId: string) {
  return useQuery({
    queryKey: SETTINGS_KEYS.sessions(userId),
    queryFn: () => SettingsService.getUserSessions(userId),
    enabled: !!userId,
  });
}

/**
 * Revoke a session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; userId: string }) =>
      SettingsService.revokeSession(params.id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.sessions(userId),
      });
    },
  });
}

/**
 * Revoke all sessions
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; exceptCurrentId?: string }) =>
      SettingsService.revokeAllSessions(params.userId, params.exceptCurrentId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.sessions(userId),
      });
    },
  });
}
