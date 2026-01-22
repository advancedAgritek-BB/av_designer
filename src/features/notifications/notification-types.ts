/**
 * Notification Types
 *
 * Types for the Notifications System Phase 4
 */

import type { UUID } from '@/types';

// ============================================================================
// Core Types
// ============================================================================

export type NotificationCategory =
  | 'quotes'
  | 'projects'
  | 'rooms'
  | 'drawings'
  | 'equipment'
  | 'standards'
  | 'system'
  | 'team';

export type NotificationSeverity = 'info' | 'warning' | 'action_required';

export type RecipientRule =
  | 'actor_only'
  | 'project_team'
  | 'role:editor'
  | 'role:admin'
  | 'role:owner'
  | 'all_members';

// ============================================================================
// Notification Entity
// ============================================================================

export interface Notification {
  id: UUID;
  userId: UUID;
  category: NotificationCategory;
  eventType: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entityType: string;
  entityId: UUID;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  id: UUID;
  userId: UUID;
  category: NotificationCategory;
  eventType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrgNotificationRule {
  id: UUID;
  orgId: UUID;
  category: NotificationCategory;
  eventType: string;
  recipientRule: RecipientRule;
  createdBy: UUID;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Event Definitions
// ============================================================================

export interface NotificationEventConfig {
  category: NotificationCategory;
  eventType: string;
  severity: NotificationSeverity;
  defaultInApp: boolean;
  defaultEmail: boolean;
  defaultRecipientRule: RecipientRule;
}

export const NOTIFICATION_EVENTS: NotificationEventConfig[] = [
  // Quotes
  {
    category: 'quotes',
    eventType: 'created',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'quotes',
    eventType: 'status_changed',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'quotes',
    eventType: 'approval_requested',
    severity: 'action_required',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'role:admin',
  },
  {
    category: 'quotes',
    eventType: 'approved',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'quotes',
    eventType: 'rejected',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'quotes',
    eventType: 'exported',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'actor_only',
  },
  // Projects
  {
    category: 'projects',
    eventType: 'created',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'role:admin',
  },
  {
    category: 'projects',
    eventType: 'archived',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'projects',
    eventType: 'client_assigned',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'projects',
    eventType: 'deadline_approaching',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'project_team',
  },
  // Rooms
  {
    category: 'rooms',
    eventType: 'created',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'rooms',
    eventType: 'design_completed',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'rooms',
    eventType: 'validation_failed',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'rooms',
    eventType: 'equipment_added',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'rooms',
    eventType: 'equipment_removed',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'project_team',
  },
  // Drawings
  {
    category: 'drawings',
    eventType: 'generated',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'drawings',
    eventType: 'exported',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'project_team',
  },
  {
    category: 'drawings',
    eventType: 'regeneration_needed',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'project_team',
  },
  // Equipment
  {
    category: 'equipment',
    eventType: 'added',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'all_members',
  },
  {
    category: 'equipment',
    eventType: 'pricing_updated',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'all_members',
  },
  {
    category: 'equipment',
    eventType: 'discontinued',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'all_members',
  },
  {
    category: 'equipment',
    eventType: 'spec_sheet_updated',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'all_members',
  },
  // Standards
  {
    category: 'standards',
    eventType: 'rule_added',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'role:admin',
  },
  {
    category: 'standards',
    eventType: 'rule_modified',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'role:admin',
  },
  {
    category: 'standards',
    eventType: 'rule_deactivated',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'role:admin',
  },
  {
    category: 'standards',
    eventType: 'compliance_alert',
    severity: 'action_required',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'role:admin',
  },
  // System
  {
    category: 'system',
    eventType: 'app_update_available',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'all_members',
  },
  {
    category: 'system',
    eventType: 'sync_completed',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'all_members',
  },
  {
    category: 'system',
    eventType: 'sync_failed',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'all_members',
  },
  {
    category: 'system',
    eventType: 'storage_warning',
    severity: 'warning',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'all_members',
  },
  // Team
  {
    category: 'team',
    eventType: 'user_invited',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'role:admin',
  },
  {
    category: 'team',
    eventType: 'user_joined',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: false,
    defaultRecipientRule: 'role:admin',
  },
  {
    category: 'team',
    eventType: 'user_role_changed',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'role:admin',
  },
  {
    category: 'team',
    eventType: 'user_removed',
    severity: 'info',
    defaultInApp: true,
    defaultEmail: true,
    defaultRecipientRule: 'role:admin',
  },
];

// ============================================================================
// Create/Update Types
// ============================================================================

export interface CreateNotificationData {
  userId: UUID;
  category: NotificationCategory;
  eventType: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entityType: string;
  entityId: UUID;
}

export interface CreateNotificationInput {
  orgId: UUID;
  category: NotificationCategory;
  eventType: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entityType: string;
  entityId: UUID;
  actorId: UUID;
  projectId?: UUID;
  metadata?: Record<string, unknown>;
}

export interface CreateNotificationResult {
  recipients: number;
  inAppSent: number;
  emailSent: number;
}

export interface UpdatePreferenceData {
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
}

export interface CreatePreferenceData {
  category: NotificationCategory;
  eventType: string;
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
}

export interface CreateOrgRuleData {
  orgId: UUID;
  category: NotificationCategory;
  eventType: string;
  recipientRule: RecipientRule;
}

export interface UpdateOrgRuleData {
  recipientRule: RecipientRule;
}

// ============================================================================
// Database Row Types
// ============================================================================

export interface NotificationRow {
  id: string;
  user_id: string;
  category: string;
  event_type: string;
  severity: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferenceRow {
  id: string;
  user_id: string;
  category: string;
  event_type: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgNotificationRuleRow {
  id: string;
  org_id: string;
  category: string;
  event_type: string;
  recipient_rule: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UI Configuration
// ============================================================================

export const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { label: string; icon: string }
> = {
  quotes: { label: 'Quotes', icon: '💰' },
  projects: { label: 'Projects', icon: '📁' },
  rooms: { label: 'Rooms', icon: '🏠' },
  drawings: { label: 'Drawings', icon: '📐' },
  equipment: { label: 'Equipment', icon: '🔧' },
  standards: { label: 'Standards', icon: '📋' },
  system: { label: 'System', icon: '⚙️' },
  team: { label: 'Team', icon: '👥' },
};

export const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  { label: string; gradientStart: string; gradientEnd: string }
> = {
  info: { label: 'Info', gradientStart: '#6366F1', gradientEnd: '#06B6D4' },
  warning: { label: 'Warning', gradientStart: '#F472B6', gradientEnd: '#FB923C' },
  action_required: {
    label: 'Action Required',
    gradientStart: '#8B5CF6',
    gradientEnd: '#EC4899',
  },
};
