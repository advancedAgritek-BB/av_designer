/**
 * Settings Service
 *
 * Supabase API interactions for settings data including user preferences,
 * default profiles, integrations, API keys, audit logs, and org settings.
 */

import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import type {
  UserPreferences,
  UpdateUserPreferencesData,
  DefaultProfile,
  CreateDefaultProfileData,
  UpdateDefaultProfileData,
  Integration,
  UpsertIntegrationData,
  UpdateIntegrationData,
  ApiKey,
  CreateApiKeyData,
  AuditLog,
  OrgSettings,
  UpdateOrgSettingsData,
  UserSession,
  IntegrationCategory,
  BillingInvoice,
  CreateBillingInvoiceData,
  BillingStatus,
} from './settings-types';

// ============================================================================
// Type Row Definitions
// ============================================================================

type UserPreferencesRow = {
  id: string;
  user_id: string;
  theme: string;
  sidebar_collapsed: boolean;
  auto_save: boolean;
  auto_save_interval: number;
  confirm_deletions: boolean;
  measurement_unit: string;
  currency: string;
  date_format: string;
  number_format: string;
  grid_snap: boolean;
  grid_size: number;
  show_grid: boolean;
  default_zoom: number;
  default_profile_behavior: string;
  last_used_profile_id: string | null;
  created_at: string;
  updated_at: string;
};

type DefaultProfileRow = {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  room_type: string | null;
  platform: string | null;
  ecosystem: string | null;
  tier: string | null;
  equipment_margin: number | null;
  labor_margin: number | null;
  labor_rate: number | null;
  tax_rate: number | null;
  preferred_brands: string[];
  paper_size: string | null;
  title_block: string | null;
  default_scale: string | null;
  created_at: string;
  updated_at: string;
};

type IntegrationRow = {
  id: string;
  org_id: string;
  user_id: string;
  provider: string;
  category: string;
  is_connected: boolean;
  settings: Json;
  connected_account_email: string | null;
  connected_account_name: string | null;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
};

type ApiKeyRow = {
  id: string;
  org_id: string;
  created_by: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_revoked: boolean;
  revoked_at: string | null;
  revoked_by: string | null;
  created_at: string;
};

type AuditLogRow = {
  id: string;
  org_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Json;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type OrgSettingsRow = {
  id: string;
  org_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  footer_text: string | null;
  logo_on_quotes: boolean;
  logo_on_drawings: boolean;
  logo_on_pdfs: boolean;
  require_2fa: boolean;
  password_policy: string;
  session_timeout_days: number;
  sso_only: boolean;
  allowed_sso_providers: string[];
  allowed_email_domains: string[];
  auto_archive_months: number | null;
  delete_archived_after: string | null;
  audit_log_retention_years: number | null;
  plan_name: string | null;
  plan_price_cents: number | null;
  plan_billing_cycle: string | null;
  plan_next_billing_date: string | null;
  plan_team_limit: number | null;
  plan_storage_limit_gb: number | null;
  billing_contact_email: string | null;
  billing_company_name: string | null;
  billing_tax_id: string | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  payment_method_exp_month: number | null;
  payment_method_exp_year: number | null;
  created_at: string;
  updated_at: string;
};

type UserSessionRow = {
  id: string;
  user_id: string;
  device_info: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  location: string | null;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
  expires_at: string;
};

type BillingInvoiceRow = {
  id: string;
  org_id: string;
  invoice_date: string;
  description: string;
  amount_cents: number;
  status: string;
  invoice_url: string | null;
  created_at: string;
};

// ============================================================================
// Mappers
// ============================================================================

function mapPreferencesFromDb(row: UserPreferencesRow): UserPreferences {
  return {
    id: row.id,
    userId: row.user_id,
    theme: row.theme as UserPreferences['theme'],
    sidebarCollapsed: row.sidebar_collapsed,
    autoSave: row.auto_save,
    autoSaveInterval: row.auto_save_interval,
    confirmDeletions: row.confirm_deletions,
    measurementUnit: row.measurement_unit as UserPreferences['measurementUnit'],
    currency: row.currency,
    dateFormat: row.date_format,
    numberFormat: row.number_format,
    gridSnap: row.grid_snap,
    gridSize: row.grid_size,
    showGrid: row.show_grid,
    defaultZoom: row.default_zoom,
    defaultProfileBehavior:
      row.default_profile_behavior as UserPreferences['defaultProfileBehavior'],
    lastUsedProfileId: row.last_used_profile_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfileFromDb(row: DefaultProfileRow): DefaultProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isDefault: row.is_default,
    roomType: row.room_type,
    platform: row.platform,
    ecosystem: row.ecosystem,
    tier: row.tier,
    equipmentMargin: row.equipment_margin,
    laborMargin: row.labor_margin,
    laborRate: row.labor_rate,
    taxRate: row.tax_rate,
    preferredBrands: row.preferred_brands || [],
    paperSize: row.paper_size,
    titleBlock: row.title_block,
    defaultScale: row.default_scale,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapIntegrationFromDb(row: IntegrationRow): Integration {
  return {
    id: row.id,
    orgId: row.org_id,
    userId: row.user_id,
    provider: row.provider,
    category: row.category as IntegrationCategory,
    isConnected: row.is_connected,
    settings: (row.settings as Record<string, unknown>) || {},
    connectedAccountEmail: row.connected_account_email,
    connectedAccountName: row.connected_account_name,
    connectedAt: row.connected_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapApiKeyFromDb(row: ApiKeyRow): ApiKey {
  return {
    id: row.id,
    orgId: row.org_id,
    createdBy: row.created_by,
    name: row.name,
    keyPrefix: row.key_prefix,
    scopes: row.scopes || [],
    lastUsedAt: row.last_used_at,
    expiresAt: row.expires_at,
    isRevoked: row.is_revoked,
    revokedAt: row.revoked_at,
    revokedBy: row.revoked_by,
    createdAt: row.created_at,
  };
}

function mapAuditLogFromDb(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    orgId: row.org_id,
    userId: row.user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: (row.details as Record<string, unknown>) || {},
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  };
}

function mapOrgSettingsFromDb(row: OrgSettingsRow): OrgSettings {
  return {
    id: row.id,
    orgId: row.org_id,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    footerText: row.footer_text,
    logoOnQuotes: row.logo_on_quotes,
    logoOnDrawings: row.logo_on_drawings,
    logoOnPdfs: row.logo_on_pdfs,
    require2fa: row.require_2fa,
    passwordPolicy: row.password_policy as OrgSettings['passwordPolicy'],
    sessionTimeoutDays: row.session_timeout_days,
    ssoOnly: row.sso_only,
    allowedSsoProviders: row.allowed_sso_providers || [],
    allowedEmailDomains: row.allowed_email_domains || [],
    autoArchiveMonths: row.auto_archive_months,
    deleteArchivedAfter: row.delete_archived_after,
    auditLogRetentionYears: row.audit_log_retention_years,
    planName: row.plan_name,
    planPriceCents: row.plan_price_cents,
    planBillingCycle: row.plan_billing_cycle as OrgSettings['planBillingCycle'],
    planNextBillingDate: row.plan_next_billing_date,
    planTeamLimit: row.plan_team_limit,
    planStorageLimitGb: row.plan_storage_limit_gb,
    billingContactEmail: row.billing_contact_email,
    billingCompanyName: row.billing_company_name,
    billingTaxId: row.billing_tax_id,
    paymentMethodBrand: row.payment_method_brand,
    paymentMethodLast4: row.payment_method_last4,
    paymentMethodExpMonth: row.payment_method_exp_month,
    paymentMethodExpYear: row.payment_method_exp_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSessionFromDb(row: UserSessionRow): UserSession {
  return {
    id: row.id,
    userId: row.user_id,
    deviceInfo: row.device_info,
    browser: row.browser,
    os: row.os,
    ipAddress: row.ip_address,
    location: row.location,
    isCurrent: row.is_current,
    lastActiveAt: row.last_active_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

function mapBillingInvoiceFromDb(row: BillingInvoiceRow): BillingInvoice {
  return {
    id: row.id,
    orgId: row.org_id,
    invoiceDate: row.invoice_date,
    description: row.description,
    amountCents: row.amount_cents,
    status: row.status as BillingStatus,
    invoiceUrl: row.invoice_url,
    createdAt: row.created_at,
  };
}

// ============================================================================
// Settings Service
// ============================================================================

export const SettingsService = {
  // ==========================================================================
  // User Preferences
  // ==========================================================================

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    if (!data) return null;
    return mapPreferencesFromDb(data as UserPreferencesRow);
  },

  async upsertPreferences(
    userId: string,
    updates: UpdateUserPreferencesData
  ): Promise<UserPreferences> {
    const updateData = {
      user_id: userId,
      theme: updates.theme,
      sidebar_collapsed: updates.sidebarCollapsed,
      auto_save: updates.autoSave,
      auto_save_interval: updates.autoSaveInterval,
      confirm_deletions: updates.confirmDeletions,
      measurement_unit: updates.measurementUnit,
      currency: updates.currency,
      date_format: updates.dateFormat,
      number_format: updates.numberFormat,
      grid_snap: updates.gridSnap,
      grid_size: updates.gridSize,
      show_grid: updates.showGrid,
      default_zoom: updates.defaultZoom,
      default_profile_behavior: updates.defaultProfileBehavior,
      last_used_profile_id: updates.lastUsedProfileId,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values and ensure user_id is present
    const cleanData: Record<string, unknown> = { user_id: userId };
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(cleanData as { user_id: string; [key: string]: unknown }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPreferencesFromDb(data as UserPreferencesRow);
  },

  // ==========================================================================
  // Default Profiles
  // ==========================================================================

  async getDefaultProfiles(userId: string): Promise<DefaultProfile[]> {
    const { data, error } = await supabase
      .from('default_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('name');

    if (error) throw new Error(error.message);
    return (data as DefaultProfileRow[]).map(mapProfileFromDb);
  },

  async getDefaultProfile(id: string): Promise<DefaultProfile> {
    const { data, error } = await supabase
      .from('default_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return mapProfileFromDb(data as DefaultProfileRow);
  },

  async createDefaultProfile(
    userId: string,
    profileData: CreateDefaultProfileData
  ): Promise<DefaultProfile> {
    // If setting as default, clear other defaults first
    if (profileData.isDefault) {
      await supabase
        .from('default_profiles')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('default_profiles')
      .insert({
        user_id: userId,
        name: profileData.name,
        is_default: profileData.isDefault ?? false,
        room_type: profileData.roomType,
        platform: profileData.platform,
        ecosystem: profileData.ecosystem,
        tier: profileData.tier,
        equipment_margin: profileData.equipmentMargin,
        labor_margin: profileData.laborMargin,
        labor_rate: profileData.laborRate,
        tax_rate: profileData.taxRate,
        preferred_brands: profileData.preferredBrands ?? [],
        paper_size: profileData.paperSize,
        title_block: profileData.titleBlock,
        default_scale: profileData.defaultScale,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapProfileFromDb(data as DefaultProfileRow);
  },

  async updateDefaultProfile(
    id: string,
    updates: UpdateDefaultProfileData
  ): Promise<DefaultProfile> {
    // Get the current profile to know the user
    const { data: current } = await supabase
      .from('default_profiles')
      .select('user_id')
      .eq('id', id)
      .single();

    // If setting as default, clear other defaults first
    if (updates.isDefault && current) {
      await supabase
        .from('default_profiles')
        .update({ is_default: false })
        .eq('user_id', current.user_id);
    }

    const updateData = {
      name: updates.name,
      is_default: updates.isDefault,
      room_type: updates.roomType,
      platform: updates.platform,
      ecosystem: updates.ecosystem,
      tier: updates.tier,
      equipment_margin: updates.equipmentMargin,
      labor_margin: updates.laborMargin,
      labor_rate: updates.laborRate,
      tax_rate: updates.taxRate,
      preferred_brands: updates.preferredBrands,
      paper_size: updates.paperSize,
      title_block: updates.titleBlock,
      default_scale: updates.defaultScale,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    );

    const { data, error } = await supabase
      .from('default_profiles')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapProfileFromDb(data as DefaultProfileRow);
  },

  async deleteDefaultProfile(id: string): Promise<void> {
    const { error } = await supabase.from('default_profiles').delete().eq('id', id);

    if (error) throw new Error(error.message);
  },

  // ==========================================================================
  // Integrations
  // ==========================================================================

  async getIntegrations(userId: string, orgId?: string): Promise<Integration[]> {
    let query = supabase.from('integrations').select('*').eq('user_id', userId);

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { data, error } = await query.order('category').order('provider');

    if (error) throw new Error(error.message);
    return (data as IntegrationRow[]).map(mapIntegrationFromDb);
  },

  async getIntegration(id: string): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return mapIntegrationFromDb(data as IntegrationRow);
  },

  async upsertIntegration(data: UpsertIntegrationData): Promise<Integration> {
    const isConnected = data.isConnected ?? true;

    const { data: integrationData, error } = await supabase
      .from('integrations')
      .upsert(
        {
          org_id: data.orgId,
          user_id: data.userId,
          provider: data.provider,
          category: data.category,
          is_connected: isConnected,
          settings: (data.settings ?? {}) as unknown as Json,
          connected_account_email: data.connectedAccountEmail ?? null,
          connected_account_name: data.connectedAccountName ?? null,
          connected_at: isConnected ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id,user_id,provider' }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapIntegrationFromDb(integrationData as IntegrationRow);
  },

  async updateIntegration(
    id: string,
    updates: UpdateIntegrationData
  ): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .update({
        is_connected: updates.isConnected,
        settings: updates.settings as unknown as Json,
        connected_account_email: updates.connectedAccountEmail,
        connected_account_name: updates.connectedAccountName,
        connected_at: updates.isConnected ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapIntegrationFromDb(data as IntegrationRow);
  },

  async disconnectIntegration(id: string): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .update({
        is_connected: false,
        connected_account_email: null,
        connected_account_name: null,
        connected_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapIntegrationFromDb(data as IntegrationRow);
  },

  // ==========================================================================
  // API Keys
  // ==========================================================================

  async getApiKeys(orgId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as ApiKeyRow[]).map(mapApiKeyFromDb);
  },

  async createApiKey(
    orgId: string,
    userId: string,
    keyData: CreateApiKeyData
  ): Promise<{ apiKey: ApiKey; plainTextKey: string }> {
    // Generate a random key
    const plainTextKey = `avd_${crypto.randomUUID().replace(/-/g, '')}`;
    const keyPrefix = plainTextKey.substring(0, 12);

    // Hash the key (in production, use bcrypt or similar)
    const encoder = new TextEncoder();
    const data = encoder.encode(plainTextKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const { data: apiKeyData, error } = await supabase
      .from('api_keys')
      .insert({
        org_id: orgId,
        created_by: userId,
        name: keyData.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes: keyData.scopes ?? [],
        expires_at: keyData.expiresAt,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      apiKey: mapApiKeyFromDb(apiKeyData as ApiKeyRow),
      plainTextKey,
    };
  },

  async revokeApiKey(id: string, userId: string): Promise<ApiKey> {
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapApiKeyFromDb(data as ApiKeyRow);
  },

  // ==========================================================================
  // Audit Logs
  // ==========================================================================

  async getAuditLogs(
    orgId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<AuditLog[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return (data as AuditLogRow[]).map(mapAuditLogFromDb);
  },

  async createAuditLog(
    orgId: string,
    userId: string | null,
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, unknown>
  ): Promise<AuditLog> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        org_id: orgId,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: (details as unknown as Json) ?? {},
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapAuditLogFromDb(data as AuditLogRow);
  },

  // ==========================================================================
  // Org Settings
  // ==========================================================================

  async getOrgSettings(orgId: string): Promise<OrgSettings | null> {
    const { data, error } = await supabase
      .from('org_settings')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    if (!data) return null;
    return mapOrgSettingsFromDb(data as OrgSettingsRow);
  },

  async upsertOrgSettings(
    orgId: string,
    updates: UpdateOrgSettingsData
  ): Promise<OrgSettings> {
    const updateData = {
      org_id: orgId,
      primary_color: updates.primaryColor,
      secondary_color: updates.secondaryColor,
      footer_text: updates.footerText,
      logo_on_quotes: updates.logoOnQuotes,
      logo_on_drawings: updates.logoOnDrawings,
      logo_on_pdfs: updates.logoOnPdfs,
      require_2fa: updates.require2fa,
      password_policy: updates.passwordPolicy,
      session_timeout_days: updates.sessionTimeoutDays,
      sso_only: updates.ssoOnly,
      allowed_sso_providers: updates.allowedSsoProviders,
      allowed_email_domains: updates.allowedEmailDomains,
      auto_archive_months: updates.autoArchiveMonths,
      delete_archived_after: updates.deleteArchivedAfter,
      audit_log_retention_years: updates.auditLogRetentionYears,
      plan_name: updates.planName,
      plan_price_cents: updates.planPriceCents,
      plan_billing_cycle: updates.planBillingCycle,
      plan_next_billing_date: updates.planNextBillingDate,
      plan_team_limit: updates.planTeamLimit,
      plan_storage_limit_gb: updates.planStorageLimitGb,
      billing_contact_email: updates.billingContactEmail,
      billing_company_name: updates.billingCompanyName,
      billing_tax_id: updates.billingTaxId,
      payment_method_brand: updates.paymentMethodBrand,
      payment_method_last4: updates.paymentMethodLast4,
      payment_method_exp_month: updates.paymentMethodExpMonth,
      payment_method_exp_year: updates.paymentMethodExpYear,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values and ensure org_id is present
    const cleanData: Record<string, unknown> = { org_id: orgId };
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    const { data, error } = await supabase
      .from('org_settings')
      .upsert(cleanData as { org_id: string; [key: string]: unknown }, {
        onConflict: 'org_id',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapOrgSettingsFromDb(data as OrgSettingsRow);
  },

  // ==========================================================================
  // Billing Invoices
  // ==========================================================================

  async getBillingInvoices(orgId: string): Promise<BillingInvoice[]> {
    const { data, error } = await supabase
      .from('billing_invoices' as never)
      .select('*')
      .eq('org_id', orgId)
      .order('invoice_date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as BillingInvoiceRow[]).map(mapBillingInvoiceFromDb);
  },

  async createBillingInvoice(
    orgId: string,
    data: CreateBillingInvoiceData
  ): Promise<BillingInvoice> {
    const insertData = {
      org_id: orgId,
      invoice_date: data.invoiceDate,
      description: data.description,
      amount_cents: data.amountCents,
      status: data.status ?? 'paid',
      invoice_url: data.invoiceUrl ?? null,
    };

    const { data: invoiceData, error } = await supabase
      .from('billing_invoices' as never)
      .insert(insertData as never)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapBillingInvoiceFromDb(invoiceData as BillingInvoiceRow);
  },

  // ==========================================================================
  // User Sessions
  // ==========================================================================

  async getUserSessions(userId: string): Promise<UserSession[]> {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as UserSessionRow[]).map(mapSessionFromDb);
  },

  async revokeSession(id: string): Promise<void> {
    const { error } = await supabase.from('user_sessions').delete().eq('id', id);

    if (error) throw new Error(error.message);
  },

  async revokeAllSessions(userId: string, exceptCurrentId?: string): Promise<void> {
    let query = supabase.from('user_sessions').delete().eq('user_id', userId);

    if (exceptCurrentId) {
      query = query.neq('id', exceptCurrentId);
    }

    const { error } = await query;
    if (error) throw new Error(error.message);
  },
};
