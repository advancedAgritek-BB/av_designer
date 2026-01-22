/**
 * Auth Feature - Public API
 */

// Types
export type {
  User,
  Organization,
  Team,
  OrgRole,
  TeamRole,
  UserRole,
  OrganizationMember,
  TeamMember,
  AuthState,
  SignUpData,
  SignInData,
  CreateOrgData,
  UpdateOrganizationData,
  InviteMemberData,
  UpdateProfileData,
} from './auth-types';

// Service
export { AuthService } from './auth-service';

// Store
export { useAuthStore } from './auth-store';

// Hooks
export {
  useAuth,
  useRequireAuth,
  useCurrentUser,
  useCurrentOrg,
  useCurrentTeam,
  useAuthError,
} from './use-auth';

// Components
export { LoginForm } from './components/LoginForm';
export { LoginPage } from './components/LoginPage';
export { SignupForm } from './components/SignupForm';
export { SignupPage } from './components/SignupPage';
export { AuthGuard } from './components/AuthGuard';
export { OAuthButtons } from './components/OAuthButtons';
