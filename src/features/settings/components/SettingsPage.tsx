/**
 * Settings Page Shell Component
 *
 * Main settings page with sidebar navigation
 */

import { useState } from 'react';
import { SETTINGS_TABS, type SettingsTab } from '../settings-types';
import { AccountSettings } from './AccountSettings';
import { PreferencesSettings } from './PreferencesSettings';
import { DefaultsSettings } from './DefaultsSettings';
import { IntegrationsSettings } from './IntegrationsSettings';
import { OrganizationSettings } from './OrganizationSettings';
import { BillingSettings } from './BillingSettings';
import { SecuritySettings } from './SecuritySettings';
import { DataSettings } from './DataSettings';
import { NotificationPreferences } from '@/features/notifications/components/NotificationPreferences';
import { NotificationRouting } from '@/features/notifications/components/NotificationRouting';

interface SettingsPageProps {
  userId: string;
  orgId: string;
  userRole: 'owner' | 'admin' | 'member' | 'viewer';
}

/**
 * Settings navigation item
 */
function NavItem({
  tab,
  isActive,
  onClick,
}: {
  tab: (typeof SETTINGS_TABS)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
        isActive
          ? 'bg-bg-tertiary text-text-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
      }`}
    >
      <SettingsIcon name={tab.icon} />
      <span className="text-sm font-medium">{tab.label}</span>
    </button>
  );
}

/**
 * Simple icon component for settings tabs
 */
function SettingsIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    user: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    settings: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    sliders: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" x2="4" y1="21" y2="14" />
        <line x1="4" x2="4" y1="10" y2="3" />
        <line x1="12" x2="12" y1="21" y2="12" />
        <line x1="12" x2="12" y1="8" y2="3" />
        <line x1="20" x2="20" y1="21" y2="16" />
        <line x1="20" x2="20" y1="12" y2="3" />
        <line x1="2" x2="6" y1="14" y2="14" />
        <line x1="10" x2="14" y1="8" y2="8" />
        <line x1="18" x2="22" y1="16" y2="16" />
      </svg>
    ),
    bell: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
    plug: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22v-5" />
        <path d="M9 8V2" />
        <path d="M15 8V2" />
        <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
      </svg>
    ),
    building: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
      </svg>
    ),
    'credit-card': (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
    shield: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      </svg>
    ),
    database: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    ),
  };

  return <span className="text-text-tertiary">{icons[name] || icons.settings}</span>;
}

export function SettingsPage({ userId, orgId, userRole }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isOwner = userRole === 'owner';

  // Filter tabs based on user role
  const availableTabs = SETTINGS_TABS.filter((tab) => {
    if (tab.ownerOnly && !isOwner) return false;
    if (tab.adminOnly && !isAdmin) return false;
    return true;
  });

  // Separate user tabs from admin tabs
  const userTabs = availableTabs.filter((t) => !t.adminOnly && !t.ownerOnly);
  const adminTabs = availableTabs.filter((t) => t.adminOnly || t.ownerOnly);

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings userId={userId} />;
      case 'preferences':
        return <PreferencesSettings userId={userId} />;
      case 'defaults':
        return <DefaultsSettings userId={userId} />;
      case 'notifications':
        return (
          <div className="space-y-8">
            <NotificationPreferences userId={userId} />
            {isAdmin && <NotificationRouting orgId={orgId} />}
          </div>
        );
      case 'integrations':
        return <IntegrationsSettings userId={userId} orgId={orgId} />;
      case 'organization':
        return <OrganizationSettings orgId={orgId} />;
      case 'billing':
        return <BillingSettings orgId={orgId} />;
      case 'security':
        return <SecuritySettings userId={userId} orgId={orgId} />;
      case 'data':
        return <DataSettings userId={userId} orgId={orgId} isAdmin={isAdmin} />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">
          <h1 className="text-lg font-semibold text-text-primary mb-6">Settings</h1>

          <nav className="space-y-1">
            {userTabs.map((tab) => (
              <NavItem
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}

            {adminTabs.length > 0 && (
              <>
                <div className="my-4 border-t border-border" />
                {adminTabs.map((tab) => (
                  <NavItem
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="settings-content">{renderContent()}</main>
      </div>
    </div>
  );
}
