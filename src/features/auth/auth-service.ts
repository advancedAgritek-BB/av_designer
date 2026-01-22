/**
 * Auth Service - Handles all authentication operations with Supabase
 */

import { supabase } from '@/lib/supabase';
import type {
  User,
  Organization,
  OrganizationMember,
  Team,
  SignUpData,
  SignInData,
  CreateOrgData,
  UpdateOrganizationData,
  InviteMemberData,
  UpdateProfileData,
  UserRow,
  OrganizationRow,
  OrganizationMemberRow,
  TeamRow,
} from './auth-types';

// ============================================================================
// Custom Error Classes
// ============================================================================

export type AuthErrorCode = 'OAUTH_ERROR' | 'AUTH_ERROR' | 'DATABASE_ERROR';

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ============================================================================
// Type Mappers
// ============================================================================

function mapUserFromDb(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    jobTitle: row.job_title,
    timezone: row.timezone,
    role: row.role as User['role'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrgFromDb(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    website: row.website,
    phone: row.phone,
    address: row.address || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

function mapTeamFromDb(row: TeamRow): Team {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

function mapOrganizationMemberFromDb(
  row: OrganizationMemberRow & { users?: UserRow | null }
): OrganizationMember {
  return {
    id: row.id,
    orgId: row.org_id,
    userId: row.user_id,
    role: row.role as OrganizationMember['role'],
    joinedAt: row.joined_at,
    invitedBy: row.invited_by,
    user: row.users ? mapUserFromDb(row.users) : undefined,
  };
}

// ============================================================================
// Auth Service
// ============================================================================

export class AuthService {
  private static isMissingTableError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const err = error as {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };
    if (err.code === '42P01') return true;
    if (
      typeof err.code === 'string' &&
      err.code.toUpperCase().startsWith('PGRST') &&
      typeof err.message === 'string' &&
      err.message.toLowerCase().includes('schema cache') &&
      err.message.toLowerCase().includes('users')
    ) {
      return true;
    }
    const haystack =
      `${err.code ?? ''} ${err.message ?? ''} ${err.details ?? ''} ${err.hint ?? ''}`.toLowerCase();
    return haystack.includes('does not exist') && haystack.includes('users');
  }

  private static async createUserProfileFromAuth(): Promise<User> {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser || !authUser.email) {
      throw new Error('Not authenticated');
    }

    const fullNameFromMetadata =
      typeof authUser.user_metadata?.full_name === 'string'
        ? authUser.user_metadata.full_name.trim()
        : '';

    const fullName =
      fullNameFromMetadata ||
      authUser.email
        .split('@')[0]
        ?.replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) ||
      'User';

    const avatarUrl =
      typeof authUser.user_metadata?.avatar_url === 'string'
        ? authUser.user_metadata.avatar_url
        : null;

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: fullName,
        avatar_url: avatarUrl,
      })
      .select('*')
      .single();

    if (error || !data) {
      if (AuthService.isMissingTableError(error)) {
        throw new Error(
          'Database schema missing: `public.users` table not found. Run the Supabase migrations for this project.'
        );
      }
      throw new Error(error?.message ?? 'Failed to create user profile');
    }

    return mapUserFromDb(data as UserRow);
  }

  /**
   * Sign up a new user
   */
  static async signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    });

    if (error) throw new Error(error.message);
    return authData;
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    return authData;
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      throw new AuthError(error.message, 'OAUTH_ERROR');
    }
  }

  /**
   * Sign in with Microsoft OAuth
   */
  static async signInWithMicrosoft(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email profile openid',
      },
    });
    if (error) {
      throw new AuthError(error.message, 'OAUTH_ERROR');
    }
  }

  /**
   * Get the currently authenticated user's profile
   */
  static async getCurrentUser(): Promise<User | null> {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    if (!authUser) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      if (AuthService.isMissingTableError(error)) {
        throw new Error(
          'Database schema missing: `public.users` table not found. Run the Supabase migrations for this project.'
        );
      }
      throw new Error(error.message);
    }

    if (data) return mapUserFromDb(data as UserRow);

    return AuthService.createUserProfileFromAuth();
  }

  /**
   * Get all organizations the user belongs to
   */
  static async getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select(
        `
        org_id,
        organizations (*)
      `
      )
      .eq('user_id', userId);

    if (error || !data) return [];

    return data
      .map((row) => {
        const org = row.organizations as unknown as OrganizationRow;
        return org ? mapOrgFromDb(org) : null;
      })
      .filter((org): org is Organization => org !== null);
  }

  /**
   * Get organizations created by the user (even if membership rows are missing).
   * Useful for recovering from partial org bootstrap failures.
   */
  static async getOrganizationsCreatedByUser(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return (data as OrganizationRow[]).map(mapOrgFromDb);
  }

  /**
   * Ensure the current user has a membership row for the given organization.
   * (Best-effort; no-op if the membership already exists.)
   */
  static async ensureOrganizationMembership(
    orgId: string,
    userId: string,
    role: OrganizationMember['role'] = 'owner'
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    if (user.id !== userId) {
      throw new Error('User mismatch while bootstrapping organization membership');
    }

    const { error } = await supabase.from('organization_members').insert({
      org_id: orgId,
      user_id: userId,
      role,
    });

    if (!error) return;
    // 23505 = unique_violation (membership already exists)
    if (error.code === '23505') return;
    throw new Error(error.message);
  }

  /**
   * Get all teams the user belongs to within an organization
   */
  static async getUserTeams(userId: string, orgId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(
        `
        team_id,
        teams!inner (*)
      `
      )
      .eq('user_id', userId)
      .eq('teams.org_id', orgId);

    if (error || !data) return [];

    return data
      .map((row) => {
        const team = row.teams as unknown as TeamRow;
        return team ? mapTeamFromDb(team) : null;
      })
      .filter((team): team is Team => team !== null);
  }

  /**
   * Create a new organization
   */
  static async createOrganization(data: CreateOrgData): Promise<Organization> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: orgData, error } = await supabase
      .from('organizations')
      .insert({
        name: data.name,
        slug: data.slug,
        website: data.website,
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !orgData)
      throw new Error(error?.message ?? 'Failed to create organization');

    const org = orgData as OrganizationRow;

    // Add creator as owner
    const { error: memberError } = await supabase.from('organization_members').insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) {
      // Rollback org creation on member insert failure
      await supabase.from('organizations').delete().eq('id', org.id);
      throw new Error(memberError.message);
    }

    return mapOrgFromDb(org);
  }

  /**
   * Update the current user's profile
   */
  static async updateProfile(userId: string, updates: UpdateProfileData): Promise<User> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle;
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapUserFromDb(data as UserRow);
  }

  /**
   * Get an organization by ID
   */
  static async getOrganization(orgId: string): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) throw new Error(error.message);
    return mapOrgFromDb(data as OrganizationRow);
  }

  /**
   * Update organization profile details
   */
  static async updateOrganization(
    orgId: string,
    updates: UpdateOrganizationData
  ): Promise<Organization> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.website !== undefined) updateData.website = updates.website;
    if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', orgId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapOrgFromDb(data as OrganizationRow);
  }

  /**
   * Get organization members with profile data
   */
  static async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('*, users!organization_members_user_id_fkey (*)')
      .eq('org_id', orgId)
      .order('joined_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as unknown as (OrganizationMemberRow & { users?: UserRow | null })[]).map(
      mapOrganizationMemberFromDb
    );
  }

  /**
   * Invite an existing user by email into an organization
   */
  static async inviteOrganizationMember(
    data: InviteMemberData & { invitedBy: string }
  ): Promise<OrganizationMember> {
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single();

    const resolvedUser = userRow as UserRow | null;

    if (userError || !resolvedUser) {
      throw new Error('User not found. Ask them to sign up first.');
    }

    const { data: memberRow, error } = await supabase
      .from('organization_members')
      .insert({
        org_id: data.orgId,
        user_id: resolvedUser.id,
        role: data.role,
        invited_by: data.invitedBy,
      })
      .select('*, users!organization_members_user_id_fkey (*)')
      .single();

    if (error) throw new Error(error.message);
    return mapOrganizationMemberFromDb(
      memberRow as unknown as OrganizationMemberRow & { users?: UserRow | null }
    );
  }

  /**
   * Update a member's role
   */
  static async updateOrganizationMemberRole(
    memberId: string,
    role: OrganizationMember['role']
  ): Promise<OrganizationMember> {
    const { data, error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId)
      .select('*, users!organization_members_user_id_fkey (*)')
      .single();

    if (error) throw new Error(error.message);
    return mapOrganizationMemberFromDb(
      data as unknown as OrganizationMemberRow & { users?: UserRow | null }
    );
  }

  /**
   * Remove a member from an organization
   */
  static async removeOrganizationMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);

    if (error) throw new Error(error.message);
  }

  /**
   * Get organization by slug
   */
  static async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return mapOrgFromDb(data as OrganizationRow);
  }

  /**
   * Check if a slug is available
   */
  static async isSlugAvailable(slug: string): Promise<boolean> {
    const { data } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    return data === null;
  }
}
