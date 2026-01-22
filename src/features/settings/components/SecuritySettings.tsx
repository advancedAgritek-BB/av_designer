/**
 * Security Settings Component
 *
 * Admin security policies, API keys, and audit logs
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import {
  useOrgSettings,
  useUpdateOrgSettings,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useAuditLogs,
  useUserSessions,
  useRevokeSession,
  useRevokeAllSessions,
} from '../use-settings';
import {
  PASSWORD_POLICY_OPTIONS,
  SESSION_TIMEOUT_OPTIONS,
  API_KEY_SCOPES,
  type ApiKey,
  type AuditLog,
  type OrgSettings,
  type UserSession,
} from '../settings-types';

interface SecuritySettingsProps {
  userId: string;
  orgId: string;
}

/**
 * API Key Row Component
 */
function ApiKeyRow({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKey;
  onRevoke: (key: ApiKey) => void;
}) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <tr className="border-b border-border/50">
      <td className="py-3">
        <p className="font-medium text-text-primary">{apiKey.name}</p>
        <p className="text-xs text-text-tertiary font-mono">{apiKey.keyPrefix}...</p>
      </td>
      <td className="py-3 text-sm text-text-secondary">
        {apiKey.scopes.length > 0 ? apiKey.scopes.join(', ') : 'All'}
      </td>
      <td className="py-3 text-sm text-text-tertiary">{formatDate(apiKey.createdAt)}</td>
      <td className="py-3 text-sm text-text-tertiary">
        {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : 'Never'}
      </td>
      <td className="py-3 text-right">
        {apiKey.isRevoked ? (
          <span className="text-sm text-error">Revoked</span>
        ) : (
          <Button variant="danger" size="sm" onClick={() => onRevoke(apiKey)}>
            Revoke
          </Button>
        )}
      </td>
    </tr>
  );
}

/**
 * Session Row Component
 */
function SessionRow({
  session,
  onRevoke,
}: {
  session: UserSession;
  onRevoke: (session: UserSession) => void;
}) {
  const formatDate = (date: string) => new Date(date).toLocaleString();

  return (
    <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg border border-border">
      <div className="flex items-center gap-3">
        <div className="size-8 bg-bg-tertiary rounded flex items-center justify-center text-text-tertiary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
            <line x1="2" x2="22" y1="20" y2="20" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            {session.browser || 'Unknown browser'} on {session.os || 'Unknown OS'}
            {session.isCurrent && (
              <span className="ml-2 text-xs text-green-500">(Current)</span>
            )}
          </p>
          <p className="text-xs text-text-tertiary">
            {session.location || 'Unknown location'} • {session.ipAddress || 'Unknown IP'}
          </p>
          <p className="text-xs text-text-tertiary">
            Last active: {formatDate(session.lastActiveAt)}
          </p>
        </div>
      </div>
      {!session.isCurrent && (
        <Button variant="secondary" size="sm" onClick={() => onRevoke(session)}>
          Revoke
        </Button>
      )}
    </div>
  );
}

/**
 * Audit Log Row Component
 */
function AuditLogRow({ log }: { log: AuditLog }) {
  const formatDate = (date: string) => new Date(date).toLocaleString();

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      login: 'User logged in',
      logout: 'User logged out',
      password_change: 'Password changed',
      project_create: 'Project created',
      project_update: 'Project updated',
      quote_create: 'Quote created',
      quote_approve: 'Quote approved',
      member_invite: 'Member invited',
      settings_change: 'Settings updated',
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  return (
    <tr className="border-b border-border/50">
      <td className="py-3 text-sm text-text-tertiary">{formatDate(log.createdAt)}</td>
      <td className="py-3 text-sm text-text-primary">{getActionLabel(log.action)}</td>
      <td className="py-3 text-sm text-text-secondary">{log.entityType}</td>
      <td className="py-3 text-sm text-text-tertiary">{log.ipAddress || '-'}</td>
    </tr>
  );
}

function SecuritySettingsContent({
  userId,
  orgId,
  orgSettings,
}: SecuritySettingsProps & { orgSettings: OrgSettings | null }) {
  const updateOrgSettingsMutation = useUpdateOrgSettings();
  const { data: apiKeys = [] } = useApiKeys(orgId);
  const createApiKeyMutation = useCreateApiKey();
  const revokeApiKeyMutation = useRevokeApiKey();
  const { data: auditLogs = [] } = useAuditLogs(orgId, { limit: 20 });
  const { data: sessions = [] } = useUserSessions(userId);
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeAllSessions();

  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [allowedDomainsInput, setAllowedDomainsInput] = useState(
    () => orgSettings?.allowedEmailDomains?.join(', ') ?? ''
  );

  const ssoProviders = [
    { id: 'microsoft', label: 'Microsoft (Azure AD)' },
    { id: 'google', label: 'Google Workspace' },
  ];

  const handleCreateApiKey = () => {
    createApiKeyMutation.mutate(
      {
        orgId,
        userId,
        data: { name: newKeyName, scopes: newKeyScopes },
      },
      {
        onSuccess: (result) => {
          setCreatedKey(result.plainTextKey);
          setNewKeyName('');
          setNewKeyScopes([]);
        },
      }
    );
  };

  const handleRevokeApiKey = (apiKey: ApiKey) => {
    if (window.confirm(`Revoke API key "${apiKey.name}"? This cannot be undone.`)) {
      revokeApiKeyMutation.mutate({ id: apiKey.id, userId, orgId });
    }
  };

  const handleRevokeSession = (session: UserSession) => {
    revokeSessionMutation.mutate({ id: session.id, userId });
  };

  const handleRevokeAllSessions = () => {
    const currentSession = sessions.find((s) => s.isCurrent);
    if (window.confirm('Sign out of all other devices?')) {
      revokeAllSessionsMutation.mutate({ userId, exceptCurrentId: currentSession?.id });
    }
  };

  const handlePolicyChange = (field: string, value: unknown) => {
    updateOrgSettingsMutation.mutate({
      orgId,
      data: { [field]: value },
    });
  };

  const handleDomainUpdate = () => {
    const domains = allowedDomainsInput
      .split(',')
      .map((domain) => domain.trim())
      .filter(Boolean);
    handlePolicyChange('allowedEmailDomains', domains);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Security</h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage security policies, API keys, and view activity
        </p>
      </div>

      {/* Security Policies */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Security Policies</h3>

        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={orgSettings?.require2fa ?? false}
              onChange={(e) => handlePolicyChange('require2fa', e.target.checked)}
              className="settings-checkbox"
            />
            <span className="text-sm text-text-primary">
              Require two-factor authentication for all users
            </span>
          </label>

          <div>
            <label
              htmlFor="passwordPolicy"
              className="block text-sm text-text-secondary mb-1"
            >
              Password Policy
            </label>
            <select
              id="passwordPolicy"
              value={orgSettings?.passwordPolicy ?? 'strong'}
              onChange={(e) => handlePolicyChange('passwordPolicy', e.target.value)}
              className="settings-select"
            >
              {PASSWORD_POLICY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} - {opt.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sessionTimeout"
              className="block text-sm text-text-secondary mb-1"
            >
              Session Timeout
            </label>
            <select
              id="sessionTimeout"
              value={orgSettings?.sessionTimeoutDays ?? 7}
              onChange={(e) =>
                handlePolicyChange('sessionTimeoutDays', Number(e.target.value))
              }
              className="settings-select"
            >
              {SESSION_TIMEOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={orgSettings?.ssoOnly ?? false}
              onChange={(e) => handlePolicyChange('ssoOnly', e.target.checked)}
              className="settings-checkbox"
            />
            <span className="text-sm text-text-primary">
              Allow SSO only (disable email/password login)
            </span>
          </label>

          <div>
            <p className="text-sm text-text-secondary mb-2">Allowed SSO Providers</p>
            <div className="space-y-2">
              {ssoProviders.map((provider) => (
                <label
                  key={provider.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(orgSettings?.allowedSsoProviders ?? []).includes(
                      provider.id
                    )}
                    onChange={(e) => {
                      const current = new Set(orgSettings?.allowedSsoProviders ?? []);
                      if (e.target.checked) {
                        current.add(provider.id);
                      } else {
                        current.delete(provider.id);
                      }
                      handlePolicyChange('allowedSsoProviders', Array.from(current));
                    }}
                    className="settings-checkbox"
                  />
                  <span className="text-sm text-text-primary">{provider.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="allowedDomains"
              className="block text-sm text-text-secondary mb-1"
            >
              Domain restrictions (comma-separated)
            </label>
            <input
              id="allowedDomains"
              type="text"
              value={allowedDomainsInput}
              onChange={(e) => setAllowedDomainsInput(e.target.value)}
              onBlur={handleDomainUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDomainUpdate();
                }
              }}
              className="settings-input"
              placeholder="acme.com, acme.io"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Leave blank to allow any verified email domain.
            </p>
          </div>
        </div>
      </section>

      {/* Active Sessions */}
      <section className="settings-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-primary">Active Sessions</h3>
          {sessions.length > 1 && (
            <Button variant="secondary" size="sm" onClick={handleRevokeAllSessions}>
              Sign out all other devices
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onRevoke={handleRevokeSession}
            />
          ))}
          {sessions.length === 0 && (
            <p className="text-sm text-text-tertiary">No active sessions</p>
          )}
        </div>
      </section>

      {/* API Keys */}
      <section className="settings-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-text-primary">API Keys</h3>
            <p className="text-xs text-text-tertiary">
              Manage keys for external integrations
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowNewKeyModal(true)}>
            + Create Key
          </Button>
        </div>

        {apiKeys.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-tertiary border-b border-border">
                  <th className="text-left font-medium pb-2">Name</th>
                  <th className="text-left font-medium pb-2">Scopes</th>
                  <th className="text-left font-medium pb-2">Created</th>
                  <th className="text-left font-medium pb-2">Last used</th>
                  <th className="text-right font-medium pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <ApiKeyRow key={key.id} apiKey={key} onRevoke={handleRevokeApiKey} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">No API keys created</p>
        )}
      </section>

      {/* Audit Log */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Recent Activity</h3>

        {auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-tertiary border-b border-border">
                  <th className="text-left font-medium pb-2">Time</th>
                  <th className="text-left font-medium pb-2">Action</th>
                  <th className="text-left font-medium pb-2">Entity</th>
                  <th className="text-left font-medium pb-2">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <AuditLogRow key={log.id} log={log} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">No activity logged yet</p>
        )}
      </section>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-primary border border-border rounded-lg w-full max-w-md p-6">
            {createdKey ? (
              <>
                <h3 className="font-semibold text-text-primary mb-4">API Key Created</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Copy this key now. You won&apos;t be able to see it again.
                </p>
                <div className="p-3 bg-bg-tertiary rounded-lg font-mono text-sm break-all mb-4">
                  {createdKey}
                </div>
                <Button
                  onClick={() => {
                    setCreatedKey(null);
                    setShowNewKeyModal(false);
                  }}
                >
                  Done
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-text-primary mb-4">Create API Key</h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="keyName"
                      className="block text-sm text-text-secondary mb-1"
                    >
                      Key Name
                    </label>
                    <input
                      id="keyName"
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="settings-input"
                      placeholder="e.g., Production API"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-secondary mb-2">
                      Scopes (optional)
                    </label>
                    <div className="space-y-2">
                      {API_KEY_SCOPES.map((scope) => (
                        <label
                          key={scope.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newKeyScopes.includes(scope.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewKeyScopes([...newKeyScopes, scope.id]);
                              } else {
                                setNewKeyScopes(
                                  newKeyScopes.filter((s) => s !== scope.id)
                                );
                              }
                            }}
                            className="settings-checkbox"
                          />
                          <span className="text-sm text-text-primary">{scope.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-text-tertiary mt-2">
                      Leave empty for full access
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="secondary" onClick={() => setShowNewKeyModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateApiKey}
                      disabled={!newKeyName.trim() || createApiKeyMutation.isPending}
                    >
                      Create Key
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SecuritySettings({ userId, orgId }: SecuritySettingsProps) {
  const { data: orgSettings, isLoading } = useOrgSettings(orgId);

  if (isLoading) {
    return <p className="text-sm text-text-tertiary">Loading security settings...</p>;
  }

  return (
    <SecuritySettingsContent
      key={orgSettings?.updatedAt ?? 'security-default'}
      userId={userId}
      orgId={orgId}
      orgSettings={orgSettings ?? null}
    />
  );
}
