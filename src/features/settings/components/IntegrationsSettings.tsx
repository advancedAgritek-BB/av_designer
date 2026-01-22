/**
 * Integrations Settings Component
 *
 * Connect external services for storage, calendar, CRM, accounting
 */

import { useState } from 'react';
import { Button, Modal, ModalFooter } from '@/components/ui';
import {
  useIntegrations,
  useDisconnectIntegration,
  useUpsertIntegration,
} from '../use-settings';
import {
  INTEGRATION_PROVIDERS,
  type Integration,
  type IntegrationCategory,
  type IntegrationProvider,
} from '../settings-types';

interface IntegrationsSettingsProps {
  userId: string;
  orgId: string;
}

/**
 * Integration card component
 */
function IntegrationCard({
  provider,
  integration,
  onConnect,
  onDisconnect,
}: {
  provider: IntegrationProvider;
  integration?: Integration;
  onConnect: (provider: IntegrationProvider) => void;
  onDisconnect: (integration: Integration) => void;
}) {
  const isConnected = integration?.isConnected ?? false;

  return (
    <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border">
      <div className="flex items-center gap-4">
        {/* Provider Icon */}
        <div className="size-10 bg-bg-tertiary rounded-lg flex items-center justify-center text-text-secondary">
          <span className="font-bold">{provider.name[0]}</span>
        </div>

        <div>
          <p className="font-medium text-text-primary">{provider.name}</p>
          <p className="text-sm text-text-tertiary">
            {isConnected
              ? `Connected as ${integration?.connectedAccountEmail || integration?.connectedAccountName || 'Account'}`
              : provider.description}
          </p>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-green-500">
            <span className="size-2 bg-green-500 rounded-full" />
            Connected
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => integration && onDisconnect(integration)}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => onConnect(provider)}>
          Connect
        </Button>
      )}
    </div>
  );
}

/**
 * Category section component
 */
function CategorySection({
  title,
  description,
  category,
  integrations,
  onConnect,
  onDisconnect,
}: {
  title: string;
  description: string;
  category: IntegrationCategory;
  integrations: Integration[];
  onConnect: (provider: IntegrationProvider) => void;
  onDisconnect: (integration: Integration) => void;
}) {
  const providers = INTEGRATION_PROVIDERS.filter((p) => p.category === category);

  return (
    <section className="settings-section">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
        <p className="text-xs text-text-tertiary">{description}</p>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => {
          const integration = integrations.find((i) => i.provider === provider.id);
          return (
            <IntegrationCard
              key={provider.id}
              provider={provider}
              integration={integration}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          );
        })}
      </div>
    </section>
  );
}

export function IntegrationsSettings({ userId, orgId }: IntegrationsSettingsProps) {
  const { data: integrations = [], isLoading } = useIntegrations(userId, orgId);
  const upsertMutation = useUpsertIntegration();
  const disconnectMutation = useDisconnectIntegration();

  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(
    null
  );
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [pendingDisconnect, setPendingDisconnect] = useState<Integration | null>(null);

  const handleConnect = (provider: IntegrationProvider) => {
    setSelectedProvider(provider);
    setAccountName('');
    setAccountEmail('');
    setAccessToken('');
    setConnectError(null);
  };

  const handleSaveConnection = () => {
    if (!selectedProvider) return;
    setConnectError(null);

    upsertMutation.mutate(
      {
        orgId,
        userId,
        provider: selectedProvider.id,
        category: selectedProvider.category,
        isConnected: true,
        connectedAccountName: accountName.trim() || null,
        connectedAccountEmail: accountEmail.trim() || null,
        settings: {
          accessToken: accessToken.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setSelectedProvider(null);
          setAccountName('');
          setAccountEmail('');
          setAccessToken('');
        },
        onError: (error) => {
          setConnectError(
            error instanceof Error ? error.message : 'Failed to connect integration'
          );
        },
      }
    );
  };

  const handleDisconnect = (integration: Integration) => {
    setPendingDisconnect(integration);
  };

  const confirmDisconnect = () => {
    if (!pendingDisconnect) return;
    disconnectMutation.mutate(pendingDisconnect.id, {
      onSuccess: () => setPendingDisconnect(null),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 bg-bg-tertiary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const connectedCount = integrations.filter((i) => i.isConnected).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Integrations</h2>
        <p className="text-sm text-text-secondary mt-1">
          Connect AV Designer with your favorite tools
        </p>
        {connectedCount > 0 && (
          <p className="text-xs text-text-tertiary mt-2">
            {connectedCount} integration{connectedCount !== 1 ? 's' : ''} connected
          </p>
        )}
      </div>

      <CategorySection
        title="Cloud Storage"
        description="Export drawings and quotes directly to cloud storage"
        category="storage"
        integrations={integrations}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <CategorySection
        title="Calendar"
        description="Sync project milestones and deadlines"
        category="calendar"
        integrations={integrations}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <CategorySection
        title="CRM"
        description="Sync clients and track opportunities"
        category="crm"
        integrations={integrations}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <CategorySection
        title="Accounting"
        description="Convert approved quotes to invoices"
        category="accounting"
        integrations={integrations}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <CategorySection
        title="Vendor Pricing"
        description="Auto-update equipment pricing from distributors"
        category="vendor"
        integrations={integrations}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Connect Modal */}
      <Modal
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title={
          selectedProvider ? `Connect ${selectedProvider.name}` : 'Connect Integration'
        }
        description="Save connection details for this provider."
        size="sm"
      >
        <div className="space-y-3">
          <label htmlFor="accountName" className="block text-sm text-text-secondary">
            Account name
          </label>
          <input
            id="accountName"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="settings-input"
            placeholder="e.g., AV Ops Team"
          />

          <label htmlFor="accountEmail" className="block text-sm text-text-secondary">
            Account email
          </label>
          <input
            id="accountEmail"
            type="email"
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            className="settings-input"
            placeholder="name@company.com"
          />

          <label htmlFor="accessToken" className="block text-sm text-text-secondary">
            Access token (optional)
          </label>
          <input
            id="accessToken"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="settings-input"
            placeholder="Paste token or API key"
          />

          {connectError && <p className="text-sm text-error">{connectError}</p>}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setSelectedProvider(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveConnection} disabled={upsertMutation.isPending}>
            {upsertMutation.isPending ? 'Connecting...' : 'Connect'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Disconnect Modal */}
      <Modal
        isOpen={!!pendingDisconnect}
        onClose={() => setPendingDisconnect(null)}
        title="Disconnect Integration"
        description="This will stop syncing data from the provider."
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Disconnect {pendingDisconnect?.provider}?
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setPendingDisconnect(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDisconnect}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
