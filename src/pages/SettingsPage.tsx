/**
 * Settings Page
 *
 * Application settings and preferences
 */
import { SettingsPage as SettingsPageComponent } from '@/features/settings';
import { useAuthStore } from '@/features/auth/auth-store';

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const currentOrg = useAuthStore((state) => state.currentOrg);

  // Show loading or placeholder if not authenticated
  if (!user) {
    return (
      <main role="main" data-testid="settings-page" className="space-y-6">
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
        <p className="text-text-secondary">Please sign in to access settings.</p>
      </main>
    );
  }

  // TODO: Get user's actual role from organization membership
  // For now, default to 'member'. The auth store would need to track the user's
  // org membership role for proper admin/owner functionality.
  const userRole = 'member' as const;

  return (
    <SettingsPageComponent
      userId={user.id}
      orgId={currentOrg?.id || ''}
      userRole={userRole}
    />
  );
}
