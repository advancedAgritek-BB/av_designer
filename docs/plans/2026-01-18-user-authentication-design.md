# User Authentication Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

This design adds authentication to AV Designer with three methods:
- Email/password for general users
- Microsoft SSO (Azure AD/Entra ID) for enterprise
- Google SSO (Google Workspace) for enterprise

Users can sign up openly but must be invited to join an organization. Each organization has four roles: Owner, Admin, Editor, and Viewer with hierarchical permissions.

---

## Key Flows

### Signup Flow
1. User submits email/password (or clicks SSO)
2. Email verification sent
3. User verifies email
4. Redirect to onboarding: Create/join organization
5. Guided setup: First project creation
6. Optional: Equipment import
7. Dashboard

### Login Flow (Returning User)
1. User enters credentials (or clicks SSO)
2. If 2FA enabled: TOTP challenge
3. Redirect to dashboard

### SSO Login Flow
1. User clicks Microsoft/Google button
2. Redirect to provider
3. Provider authenticates, redirects back
4. Auto-create account if new user
5. If new: onboarding flow
6. If returning: dashboard

### Invitation Flow
1. Admin sends invite (email + role)
2. Invitee receives email with magic link
3. Invitee clicks link → /invite/:token
4. If no account: signup flow, then auto-join org
5. If has account: login, then auto-join org
6. Dashboard

---

## Session & Security

| Setting | Value |
|---------|-------|
| Session Duration | 7 days |
| Password Minimum | 8 characters |
| Password Complexity | Uppercase, lowercase, number required |
| Email Verification | Required before full access |
| Two-Factor Auth | Optional TOTP via authenticator apps |

---

## Data Model

### New Tables

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization membership
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (role != 'owner') -- owners cannot be invited
);

-- User profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Modified Tables

```sql
-- Add organization ownership to projects
ALTER TABLE projects
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization scope to equipment (null = global/shared)
ALTER TABLE equipment
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization scope to standards
ALTER TABLE standards
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization scope to rules
ALTER TABLE rules
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
```

### Constraints

- One owner per organization (enforced via trigger)
- Users can belong to multiple organizations
- Projects belong to organizations, not individual users

---

## Permission Matrix

| Permission | Owner | Admin | Editor | Viewer |
|------------|-------|-------|--------|--------|
| View projects & rooms | Y | Y | Y | Y |
| Create/edit rooms & designs | Y | Y | Y | N |
| Generate quotes & drawings | Y | Y | Y | N |
| Manage equipment catalog | Y | Y | N | N |
| Manage standards/rules | Y | Y | N | N |
| Invite/remove users | Y | Y | N | N |
| Change user roles | Y | Y | N | N |
| Manage billing | Y | N | N | N |
| Delete organization | Y | N | N | N |
| Transfer ownership | Y | N | N | N |

---

## Row Level Security Policies

### Helper Functions

```sql
-- Get current user's role in an organization
CREATE FUNCTION get_user_role(org_id UUID)
RETURNS org_role AS $$
  SELECT role FROM organization_members
  WHERE organization_id = org_id AND user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user has minimum role level
CREATE FUNCTION has_role(org_id UUID, min_role org_role)
RETURNS BOOLEAN AS $$
  SELECT CASE get_user_role(org_id)
    WHEN 'owner' THEN TRUE
    WHEN 'admin' THEN min_role IN ('admin', 'editor', 'viewer')
    WHEN 'editor' THEN min_role IN ('editor', 'viewer')
    WHEN 'viewer' THEN min_role = 'viewer'
    ELSE FALSE
  END
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get all organization IDs user belongs to
CREATE FUNCTION get_user_orgs()
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(organization_id)
  FROM organization_members
  WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;
```

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| organizations | member of org | authenticated | admin+ | owner only |
| organization_members | member of org | admin+ | admin+ | admin+ |
| invitations | admin+ of org | admin+ | none | admin+ |
| projects | member of org | editor+ | editor+ | admin+ |
| rooms | member of project's org | editor+ | editor+ | editor+ |
| equipment | member OR global | admin+ | admin+ | admin+ |
| standards/rules | member OR global | admin+ | admin+ | admin+ |
| quotes | member of project's org | editor+ | editor+ | editor+ |
| drawings | member of project's org | editor+ | editor+ | editor+ |

---

## Frontend Components

### Auth Pages (`src/pages/auth/`)

| Page | Route | Description |
|------|-------|-------------|
| LoginPage | /login | Email/password form + SSO buttons |
| SignupPage | /signup | Registration form + SSO buttons |
| ForgotPasswordPage | /forgot-password | Email input for reset link |
| ResetPasswordPage | /reset-password | New password form (from email link) |
| VerifyEmailPage | /verify-email | Confirmation message + resend option |
| AcceptInvitePage | /invite/:token | Accept org invitation flow |

### Onboarding Pages (`src/pages/onboarding/`)

| Page | Route | Description |
|------|-------|-------------|
| OnboardingOrgPage | /onboarding/organization | Create new org or join existing |
| OnboardingProjectPage | /onboarding/project | Create first project with name + client |
| OnboardingEquipmentPage | /onboarding/equipment | Optional: import CSV or use starter pack |
| OnboardingCompletePage | /onboarding/complete | Success message + go to dashboard |

### Settings Pages (`src/pages/settings/`)

| Page | Route | Description |
|------|-------|-------------|
| OrganizationSettingsPage | /settings/organization | Org name, logo, slug (admin+) |
| MembersPage | /settings/members | User list, invite, role management (admin+) |
| SecurityPage | /settings/security | Password change, 2FA setup |
| ProfilePage | /settings/profile | Name, avatar, email preferences |

### Shared Components (`src/components/auth/`)

| Component | Description |
|-----------|-------------|
| AuthForm | Shared form wrapper with validation |
| SSOButtons | Microsoft + Google sign-in buttons |
| ProtectedRoute | Route wrapper checking auth + role |
| RoleGate | Conditional render based on user role |
| TwoFactorSetup | QR code display + verification input |
| TwoFactorChallenge | Login step for TOTP entry |
| RecoveryCodesDisplay | One-time display with copy/download |

---

## Services & Hooks

### Auth Service (`src/features/auth/auth-service.ts`)

| Method | Description |
|--------|-------------|
| signUp(email, password, fullName) | Create account, send verification email |
| signIn(email, password) | Email/password login |
| signInWithProvider(provider) | SSO login (microsoft, google) |
| signOut() | End session, clear local state |
| resetPassword(email) | Send password reset email |
| updatePassword(newPassword) | Change password (authenticated) |
| verifyEmail(token) | Confirm email from link |
| resendVerification() | Resend verification email |
| enrollMFA() | Generate TOTP secret, return QR code URI |
| verifyMFAEnrollment(code) | Verify setup code, enable 2FA |
| verifyMFAChallenge(code) | Verify code during login |
| unenrollMFA() | Disable 2FA (requires current code) |
| getRecoveryCodes() | Generate new recovery codes |

### Organization Service (`src/features/auth/organization-service.ts`)

| Method | Description |
|--------|-------------|
| createOrganization(name, slug) | Create org, set current user as owner |
| getOrganization(id) | Fetch org details |
| updateOrganization(id, data) | Update org settings |
| deleteOrganization(id) | Delete org (owner only) |
| getMembers(orgId) | List org members with roles |
| updateMemberRole(memberId, role) | Change member's role |
| removeMember(memberId) | Remove user from org |
| leaveOrganization(orgId) | Current user leaves org |

### Invitation Service (`src/features/auth/invitation-service.ts`)

| Method | Description |
|--------|-------------|
| createInvitation(orgId, email, role) | Send invite email |
| getInvitation(token) | Fetch invite details (for accept page) |
| acceptInvitation(token) | Join org from invite |
| cancelInvitation(id) | Revoke pending invite |
| listPendingInvitations(orgId) | Get all pending invites |

### React Hooks (`src/features/auth/use-auth.ts`)

| Hook | Description |
|------|-------------|
| useAuth() | Current user, loading state, auth methods |
| useUser() | User profile with org membership |
| useOrganization() | Current org context |
| useRole() | Current user's role in active org |
| useRequireAuth(minRole?) | Redirect if not authenticated/authorized |
| useMembers(orgId) | React Query hook for member list |
| useInvitations(orgId) | React Query hook for pending invites |

---

## State Management

### Auth Store (`src/stores/auth-store.ts`)

```typescript
interface AuthState {
  // User state
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Organization context
  currentOrganization: Organization | null;
  membership: OrganizationMember | null;
  organizations: Organization[]; // all orgs user belongs to

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  switchOrganization: (orgId: string) => void;
  clearAuth: () => void;
}
```

### Integration with Existing Stores

| Store | Changes |
|-------|---------|
| app-store | Add `organizationId` to persist active org selection |
| project-store | Filter projects by `currentOrganization.id` |
| equipment-store | Filter by org + include global (org_id = null) items |

### Auth State Initialization

On app load:
1. Check Supabase session - if none, redirect to /login
2. Fetch user profile from `user_profiles`
3. Fetch organizations from `organization_members`
4. Set current org from localStorage or first org in list
5. If no orgs and onboarding incomplete - redirect to /onboarding/organization
6. Otherwise - proceed to requested route or dashboard

### Session Listener

Subscribe to `supabase.auth.onAuthStateChange`:
- `SIGNED_IN` - fetch profile + orgs, update store
- `SIGNED_OUT` - clear store, redirect to /login
- `TOKEN_REFRESHED` - no action needed
- `USER_UPDATED` - refetch profile

---

## Onboarding Flow

```
Signup Complete
      |
      v
+-------------------------------------+
|  Step 1: Organization               |
|  +-------------------------------+  |
|  | o Create new organization     |  |
|  |   [Organization name]         |  |
|  |   [URL slug].avdesigner.app   |  |
|  |                               |  |
|  | o Join existing (have invite) |  |
|  |   [Paste invite link]         |  |
|  +-------------------------------+  |
+-------------------------------------+
      |
      v
+-------------------------------------+
|  Step 2: First Project              |
|  +-------------------------------+  |
|  | Project name: [_____________] |  |
|  | Client name:  [_____________] |  |
|  | (optional)                    |  |
|  +-------------------------------+  |
+-------------------------------------+
      |
      v
+-------------------------------------+
|  Step 3: Equipment (Optional)       |
|  +-------------------------------+  |
|  | o Start with empty catalog    |  |
|  | o Import from CSV             |  |
|  | o Use starter equipment pack  |  |
|  |   (common AV items pre-loaded)|  |
|  +-------------------------------+  |
+-------------------------------------+
      |
      v
+-------------------------------------+
|  Complete!                          |
|  Your workspace is ready.           |
|  [Go to Dashboard]                  |
+-------------------------------------+
```

### Onboarding State

```typescript
interface OnboardingState {
  currentStep: 'organization' | 'project' | 'equipment' | 'complete';
  organizationId: string | null;
  projectId: string | null;
  equipmentChoice: 'empty' | 'csv' | 'starter' | null;
}
```

### Skip/Resume Logic

- If user has pending invite: skip to accept flow, then Step 2
- If user leaves mid-onboarding: resume at last incomplete step on next login
- Mark `onboarding_completed = true` only after Step 3

---

## Route Protection

### Route Configuration

```typescript
type RouteProtection =
  | 'public'        // Anyone (login, signup, etc.)
  | 'authenticated' // Any logged-in user
  | 'onboarded'     // Logged in + completed onboarding
  | 'role';         // Specific minimum role required

const routes = {
  // Public routes
  '/login': { protection: 'public' },
  '/signup': { protection: 'public' },
  '/forgot-password': { protection: 'public' },
  '/reset-password': { protection: 'public' },
  '/invite/:token': { protection: 'public' },

  // Authenticated but pre-onboarding
  '/verify-email': { protection: 'authenticated' },
  '/onboarding/*': { protection: 'authenticated' },

  // Requires completed onboarding
  '/': { protection: 'onboarded' },
  '/projects': { protection: 'onboarded' },
  '/rooms/:roomId/*': { protection: 'onboarded' },
  '/equipment': { protection: 'onboarded' },
  '/standards': { protection: 'onboarded', minRole: 'admin' },

  // Settings with role requirements
  '/settings/profile': { protection: 'onboarded' },
  '/settings/security': { protection: 'onboarded' },
  '/settings/organization': { protection: 'onboarded', minRole: 'admin' },
  '/settings/members': { protection: 'onboarded', minRole: 'admin' },
};
```

### ProtectedRoute Component

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  minRole?: 'viewer' | 'editor' | 'admin' | 'owner';
}

// Behavior:
// 1. Not authenticated -> redirect to /login
// 2. Not verified -> redirect to /verify-email
// 3. Not onboarded -> redirect to /onboarding/organization
// 4. Insufficient role -> show 403 forbidden page
// 5. All checks pass -> render children
```

### RoleGate Component

```typescript
// For conditional UI rendering based on role
<RoleGate minRole="admin" fallback={<ViewOnlyBadge />}>
  <EditButton />
</RoleGate>
```

---

## Two-Factor Authentication

### Setup Flow

1. User navigates to /settings/security
2. Click "Enable 2FA" - generates TOTP secret
3. Display QR code + manual entry key
4. User scans with authenticator app
5. User enters 6-digit code to verify
6. On success: store `two_factor_enabled = true`, show recovery codes
7. User must save recovery codes (one-time display)

### Login Flow with 2FA

1. User enters email/password - success
2. If `two_factor_enabled`: show TOTP input screen
3. User enters 6-digit code from app
4. Verify code - complete login
5. Alternative: enter recovery code (single use)

---

## Error Handling

| Scenario | User Message | Action |
|----------|--------------|--------|
| Invalid credentials | "Email or password is incorrect" | Show inline, clear password |
| Email not verified | "Please verify your email to continue" | Link to resend |
| Account disabled | "Your account has been disabled. Contact support." | Show support email |
| SSO provider error | "Unable to connect to [Provider]. Try again." | Retry button |
| Invite expired | "This invitation has expired" | Link to request new |
| Invite already used | "This invitation has already been accepted" | Link to login |
| Session expired | "Your session has expired. Please log in again." | Redirect to login |
| 2FA code invalid | "Invalid code. Please try again." | Clear input, retry |
| Rate limited | "Too many attempts. Try again in X minutes." | Disable form, countdown |

---

## Email Templates

| Email | Subject | Trigger |
|-------|---------|---------|
| Verification | "Verify your AV Designer account" | Signup |
| Password Reset | "Reset your AV Designer password" | Forgot password |
| Invitation | "You've been invited to join [Org] on AV Designer" | Admin invites user |
| Password Changed | "Your password was changed" | Password update |

---

## Rate Limiting

| Action | Limit | Window |
|--------|-------|--------|
| Login attempts | 5 | 15 minutes |
| Password reset requests | 3 | 1 hour |
| Verification email resends | 3 | 1 hour |
| Invitation sends | 10 | 1 hour |

---

## File Structure

```
src/
├── features/
│   └── auth/
│       ├── auth-service.ts
│       ├── organization-service.ts
│       ├── invitation-service.ts
│       ├── use-auth.ts
│       ├── components/
│       │   ├── AuthForm.tsx
│       │   ├── SSOButtons.tsx
│       │   ├── ProtectedRoute.tsx
│       │   ├── RoleGate.tsx
│       │   ├── TwoFactorSetup.tsx
│       │   ├── TwoFactorChallenge.tsx
│       │   └── RecoveryCodesDisplay.tsx
│       ├── types.ts
│       └── index.ts
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   ├── AcceptInvitePage.tsx
│   │   └── index.ts
│   ├── onboarding/
│   │   ├── OnboardingOrgPage.tsx
│   │   ├── OnboardingProjectPage.tsx
│   │   ├── OnboardingEquipmentPage.tsx
│   │   ├── OnboardingCompletePage.tsx
│   │   └── index.ts
│   └── settings/
│       ├── ProfilePage.tsx
│       ├── SecurityPage.tsx
│       ├── OrganizationSettingsPage.tsx
│       ├── MembersPage.tsx
│       └── index.ts
├── stores/
│   └── auth-store.ts
└── styles/
    └── features/
        ├── auth.css
        └── onboarding.css

supabase/
└── migrations/
    └── 002_authentication.sql
```

---

## Implementation Notes

1. **Supabase Auth Configuration**
   - Enable Email provider with email verification
   - Enable Microsoft OAuth provider (Azure AD)
   - Enable Google OAuth provider
   - Configure redirect URLs for OAuth flows

2. **Database Migration Order**
   - Create organizations table first
   - Create organization_members with FK to organizations
   - Create invitations table
   - Create user_profiles table
   - Add organization_id to existing tables
   - Create RLS helper functions
   - Apply RLS policies

3. **Testing Strategy**
   - Unit tests for services and hooks
   - Integration tests for auth flows
   - E2E tests for complete user journeys
   - Mock Supabase auth in tests
