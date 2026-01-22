/**
 * Authentication & Authorization Types
 */

import type { UUID } from '@/types';

// ============================================================================
// Role Types
// ============================================================================

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type TeamRole = 'owner' | 'admin' | 'member';
export type UserRole = 'admin' | 'designer' | 'viewer';

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: UUID;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  jobTitle: string | null;
  timezone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Organization Types
// ============================================================================

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  phone: string | null;
  address: OrganizationAddress;
  createdAt: string;
  updatedAt: string;
  createdBy: UUID;
}

export interface OrganizationAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface OrganizationMember {
  id: UUID;
  orgId: UUID;
  userId: UUID;
  role: OrgRole;
  joinedAt: string;
  invitedBy: UUID | null;
  user?: User;
}

// ============================================================================
// Team Types
// ============================================================================

export interface Team {
  id: UUID;
  orgId: UUID;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: UUID;
}

export interface TeamMember {
  id: UUID;
  teamId: UUID;
  userId: UUID;
  role: TeamRole;
  joinedAt: string;
  user?: User;
}

// ============================================================================
// Auth State Types
// ============================================================================

export interface AuthState {
  user: User | null;
  currentOrg: Organization | null;
  currentTeam: Team | null;
  organizations: Organization[];
  teams: Team[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// ============================================================================
// Auth Action Types
// ============================================================================

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface CreateOrgData {
  name: string;
  slug: string;
  website?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  website?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  address?: OrganizationAddress;
}

export interface InviteMemberData {
  email: string;
  role: OrgRole;
  orgId: UUID;
}

export interface UpdateProfileData {
  fullName?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  timezone?: string;
}

// ============================================================================
// Database Row Types (for mapping from Supabase)
// ============================================================================

export interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  job_title: string | null;
  timezone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  address: Record<string, string>;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface OrganizationMemberRow {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  invited_by: string | null;
}

export interface TeamRow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}
