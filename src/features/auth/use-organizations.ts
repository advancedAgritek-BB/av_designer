/**
 * Organization Hooks
 *
 * React Query hooks for organization management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from './auth-service';
import { useAuthStore } from './auth-store';
import type { OrgRole } from './auth-types';

// Query keys
export const ORG_KEYS = {
  all: ['organizations'] as const,
  detail: (id: string) => [...ORG_KEYS.all, id] as const,
  members: (orgId: string) => [...ORG_KEYS.detail(orgId), 'members'] as const,
};

/**
 * Fetch organization by ID
 */
export function useOrganization(orgId: string | null) {
  return useQuery({
    queryKey: ORG_KEYS.detail(orgId || ''),
    queryFn: async () => {
      if (!orgId) return null;
      return AuthService.getOrganization(orgId);
    },
    enabled: !!orgId,
  });
}

/**
 * Fetch organization members
 */
export function useOrganizationMembers(orgId: string | null) {
  return useQuery({
    queryKey: ORG_KEYS.members(orgId || ''),
    queryFn: async () => {
      if (!orgId) return [];
      return AuthService.getOrganizationMembers(orgId);
    },
    enabled: !!orgId,
  });
}

/**
 * Invite a new member to organization
 */
export function useInviteOrganizationMember() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      orgId,
      email,
      role,
    }: {
      orgId: string;
      email: string;
      role: OrgRole;
    }) => {
      if (!user?.id) {
        throw new Error('You must be signed in to invite members');
      }
      return AuthService.inviteOrganizationMember({
        orgId,
        email,
        role,
        invitedBy: user.id,
      });
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.members(orgId) });
    },
  });
}

/**
 * Update a member's role
 * Note: memberId is the organization_members record ID, not the user ID
 */
export function useUpdateOrganizationMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      orgId: string;
      memberId: string;
      role: OrgRole;
    }) => {
      return AuthService.updateOrganizationMemberRole(memberId, role);
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.members(orgId) });
    },
  });
}

/**
 * Remove a member from organization
 * Note: memberId is the organization_members record ID, not the user ID
 */
export function useRemoveOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId }: { orgId: string; memberId: string }) => {
      return AuthService.removeOrganizationMember(memberId);
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.members(orgId) });
    },
  });
}
