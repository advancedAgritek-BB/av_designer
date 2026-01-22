/**
 * Settings System Types
 *
 * Types for user preferences, default profiles, integrations, API keys,
 * audit logs, org settings, and user sessions.
 */

// ============================================================================
// Theme & Preferences Types
// ============================================================================

export type Theme = 'dark' | 'light' | 'system';
export type MeasurementUnit = 'imperial' | 'metric';
export type DefaultProfileBehavior = 'always_default' | 'ask' | 'remember_last';
export type PasswordPolicy = 'basic' | 'standard' | 'strong';
export type IntegrationCategory =
  | 'storage'
  | 'calendar'
  | 'crm'
  | 'accounting'
  | 'vendor';

// ============================================================================
// User Preferences
// ============================================================================

export interface UserPreferences {
  id: string;
  userId: string;

  // Appearance
  theme: Theme;

  // Behavior
  sidebarCollapsed: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  confirmDeletions: boolean;

  // Units & Formats
  measurementUnit: MeasurementUnit;
  currency: string;
  dateFormat: string;
  numberFormat: string;

  // Canvas
  gridSnap: boolean;
  gridSize: number;
  showGrid: boolean;
  defaultZoom: number;

  // Defaults behavior
  defaultProfileBehavior: DefaultProfileBehavior;
  lastUsedProfileId: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPreferencesData {
  theme?: Theme;
  sidebarCollapsed?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  confirmDeletions?: boolean;
  measurementUnit?: MeasurementUnit;
  currency?: string;
  dateFormat?: string;
  numberFormat?: string;
  gridSnap?: boolean;
  gridSize?: number;
  showGrid?: boolean;
  defaultZoom?: number;
  defaultProfileBehavior?: DefaultProfileBehavior;
  lastUsedProfileId?: string | null;
}

// ============================================================================
// Default Profiles
// ============================================================================

export interface DefaultProfile {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;

  // Room defaults
  roomType: string | null;
  platform: string | null;
  ecosystem: string | null;
  tier: string | null;

  // Quoting defaults
  equipmentMargin: number | null;
  laborMargin: number | null;
  laborRate: number | null;
  taxRate: number | null;

  // Equipment preferences
  preferredBrands: string[];

  // Drawing defaults
  paperSize: string | null;
  titleBlock: string | null;
  defaultScale: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDefaultProfileData {
  name: string;
  isDefault?: boolean;
  roomType?: string | null;
  platform?: string | null;
  ecosystem?: string | null;
  tier?: string | null;
  equipmentMargin?: number | null;
  laborMargin?: number | null;
  laborRate?: number | null;
  taxRate?: number | null;
  preferredBrands?: string[];
  paperSize?: string | null;
  titleBlock?: string | null;
  defaultScale?: string | null;
}

export type UpdateDefaultProfileData = Partial<CreateDefaultProfileData>;

// ============================================================================
// Integrations
// ============================================================================

export interface Integration {
  id: string;
  orgId: string;
  userId: string;
  provider: string;
  category: IntegrationCategory;
  isConnected: boolean;
  settings: Record<string, unknown>;
  connectedAccountEmail: string | null;
  connectedAccountName: string | null;
  connectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateIntegrationData {
  isConnected?: boolean;
  settings?: Record<string, unknown>;
  connectedAccountEmail?: string | null;
  connectedAccountName?: string | null;
}

export interface UpsertIntegrationData extends UpdateIntegrationData {
  orgId: string;
  userId: string;
  provider: string;
  category: IntegrationCategory;
}

// Integration provider configurations
export interface IntegrationProvider {
  id: string;
  name: string;
  category: IntegrationCategory;
  icon: string;
  description: string;
  oauthUrl?: string;
}

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  // Storage
  {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'storage',
    icon: 'drive',
    description: 'Export to Google Drive',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    icon: 'dropbox',
    description: 'Export to Dropbox',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    category: 'storage',
    icon: 'onedrive',
    description: 'Export to OneDrive',
  },

  // Calendar
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'calendar',
    icon: 'calendar',
    description: 'Sync project deadlines',
  },
  {
    id: 'outlook_calendar',
    name: 'Outlook Calendar',
    category: 'calendar',
    icon: 'outlook',
    description: 'Sync project deadlines',
  },

  // CRM
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    icon: 'salesforce',
    description: 'Sync clients and opportunities',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    icon: 'hubspot',
    description: 'Sync clients and contacts',
  },

  // Accounting
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'accounting',
    icon: 'quickbooks',
    description: 'Create invoices from quotes',
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'accounting',
    icon: 'xero',
    description: 'Create invoices from quotes',
  },

  // Vendor
  {
    id: 'wesco',
    name: 'WESCO/Anixter',
    category: 'vendor',
    icon: 'wesco',
    description: 'Auto-update equipment pricing',
  },
  {
    id: 'adi',
    name: 'ADI',
    category: 'vendor',
    icon: 'adi',
    description: 'Auto-update equipment pricing',
  },
  {
    id: 'snapone',
    name: 'Snap One',
    category: 'vendor',
    icon: 'snapone',
    description: 'Auto-update equipment pricing',
  },
];

// ============================================================================
// API Keys
// ============================================================================

export interface ApiKey {
  id: string;
  orgId: string;
  createdBy: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  isRevoked: boolean;
  revokedAt: string | null;
  revokedBy: string | null;
  createdAt: string;
}

export interface CreateApiKeyData {
  name: string;
  scopes?: string[];
  expiresAt?: string | null;
}

// API key scopes
export const API_KEY_SCOPES = [
  { id: 'read:projects', name: 'Read Projects', description: 'Read access to projects' },
  { id: 'write:projects', name: 'Write Projects', description: 'Create/update projects' },
  { id: 'read:quotes', name: 'Read Quotes', description: 'Read access to quotes' },
  { id: 'write:quotes', name: 'Write Quotes', description: 'Create/update quotes' },
  { id: 'read:equipment', name: 'Read Equipment', description: 'Read equipment catalog' },
  {
    id: 'write:equipment',
    name: 'Write Equipment',
    description: 'Update equipment catalog',
  },
] as const;

// ============================================================================
// Audit Logs
// ============================================================================

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// Audit log action types
export type AuditAction =
  | 'login'
  | 'logout'
  | 'password_change'
  | '2fa_enable'
  | '2fa_disable'
  | 'project_create'
  | 'project_update'
  | 'project_delete'
  | 'project_archive'
  | 'quote_create'
  | 'quote_approve'
  | 'quote_reject'
  | 'quote_export'
  | 'member_invite'
  | 'member_join'
  | 'member_role_change'
  | 'member_remove'
  | 'settings_change'
  | 'billing_plan_change'
  | 'billing_payment_method_change';

// ============================================================================
// Org Settings
// ============================================================================

export interface OrgSettings {
  id: string;
  orgId: string;

  // Branding
  primaryColor: string | null;
  secondaryColor: string | null;
  footerText: string | null;
  logoOnQuotes: boolean;
  logoOnDrawings: boolean;
  logoOnPdfs: boolean;

  // Security policies
  require2fa: boolean;
  passwordPolicy: PasswordPolicy;
  sessionTimeoutDays: number;
  ssoOnly: boolean;
  allowedSsoProviders: string[];
  allowedEmailDomains: string[];

  // Data retention
  autoArchiveMonths: number | null;
  deleteArchivedAfter: string | null;
  auditLogRetentionYears: number | null;

  // Billing
  planName: string | null;
  planPriceCents: number | null;
  planBillingCycle: 'monthly' | 'annual' | null;
  planNextBillingDate: string | null;
  planTeamLimit: number | null;
  planStorageLimitGb: number | null;
  billingContactEmail: string | null;
  billingCompanyName: string | null;
  billingTaxId: string | null;
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
  paymentMethodExpMonth: number | null;
  paymentMethodExpYear: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrgSettingsData {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  footerText?: string | null;
  logoOnQuotes?: boolean;
  logoOnDrawings?: boolean;
  logoOnPdfs?: boolean;
  require2fa?: boolean;
  passwordPolicy?: PasswordPolicy;
  sessionTimeoutDays?: number;
  ssoOnly?: boolean;
  allowedSsoProviders?: string[];
  allowedEmailDomains?: string[];
  autoArchiveMonths?: number | null;
  deleteArchivedAfter?: string | null;
  auditLogRetentionYears?: number | null;
  planName?: string | null;
  planPriceCents?: number | null;
  planBillingCycle?: 'monthly' | 'annual' | null;
  planNextBillingDate?: string | null;
  planTeamLimit?: number | null;
  planStorageLimitGb?: number | null;
  billingContactEmail?: string | null;
  billingCompanyName?: string | null;
  billingTaxId?: string | null;
  paymentMethodBrand?: string | null;
  paymentMethodLast4?: string | null;
  paymentMethodExpMonth?: number | null;
  paymentMethodExpYear?: number | null;
}

// ============================================================================
// Billing
// ============================================================================

export type BillingStatus = 'paid' | 'pending' | 'failed';

export interface BillingInvoice {
  id: string;
  orgId: string;
  invoiceDate: string;
  description: string;
  amountCents: number;
  status: BillingStatus;
  invoiceUrl: string | null;
  createdAt: string;
}

export interface CreateBillingInvoiceData {
  invoiceDate: string;
  description: string;
  amountCents: number;
  status?: BillingStatus;
  invoiceUrl?: string | null;
}

// ============================================================================
// User Sessions
// ============================================================================

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
}

// ============================================================================
// Settings Tab Navigation
// ============================================================================

export type SettingsTab =
  | 'account'
  | 'preferences'
  | 'defaults'
  | 'notifications'
  | 'integrations'
  | 'organization'
  | 'billing'
  | 'security'
  | 'data';

export interface SettingsTabConfig {
  id: SettingsTab;
  label: string;
  icon: string;
  adminOnly: boolean;
  ownerOnly: boolean;
}

export const SETTINGS_TABS: SettingsTabConfig[] = [
  { id: 'account', label: 'Account', icon: 'user', adminOnly: false, ownerOnly: false },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: 'settings',
    adminOnly: false,
    ownerOnly: false,
  },
  {
    id: 'defaults',
    label: 'Defaults',
    icon: 'sliders',
    adminOnly: false,
    ownerOnly: false,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'bell',
    adminOnly: false,
    ownerOnly: false,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'plug',
    adminOnly: false,
    ownerOnly: false,
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: 'building',
    adminOnly: true,
    ownerOnly: false,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: 'credit-card',
    adminOnly: false,
    ownerOnly: true,
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'shield',
    adminOnly: true,
    ownerOnly: false,
  },
  { id: 'data', label: 'Data', icon: 'database', adminOnly: false, ownerOnly: false },
];

// ============================================================================
// Preference Options
// ============================================================================

export const THEME_OPTIONS = [
  { value: 'dark' as const, label: 'Dark' },
  { value: 'light' as const, label: 'Light' },
  { value: 'system' as const, label: 'System' },
];

export const MEASUREMENT_OPTIONS = [
  { value: 'imperial' as const, label: 'Imperial (ft, in)' },
  { value: 'metric' as const, label: 'Metric (m, cm)' },
];

export const AUTOSAVE_INTERVALS = [
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 0, label: 'Disabled' },
];

export const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

export const NUMBER_FORMAT_OPTIONS = [
  { value: '1,234.56', label: '1,234.56' },
  { value: '1.234,56', label: '1.234,56' },
  { value: '1 234,56', label: '1 234,56' },
];

export const DEFAULT_PROFILE_BEHAVIOR_OPTIONS = [
  { value: 'always_default' as const, label: 'Always use default profile' },
  { value: 'ask' as const, label: 'Ask which profile to use' },
  { value: 'remember_last' as const, label: 'Remember last used profile' },
];

export const PASSWORD_POLICY_OPTIONS = [
  { value: 'basic' as const, label: 'Basic', description: 'Min 8 characters' },
  {
    value: 'standard' as const,
    label: 'Standard',
    description: 'Min 10 chars, upper + lower + number',
  },
  {
    value: 'strong' as const,
    label: 'Strong',
    description: 'Min 12 chars, upper + lower + number + special',
  },
];

export const SESSION_TIMEOUT_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
];

export const ARCHIVE_MONTHS_OPTIONS = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
  { value: 18, label: '18 months' },
  { value: 24, label: '24 months' },
  { value: null, label: 'Never' },
];

export const AUDIT_RETENTION_OPTIONS = [
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 5, label: '5 years' },
  { value: null, label: 'Forever' },
];
