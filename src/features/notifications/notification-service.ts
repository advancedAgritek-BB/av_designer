/**
 * Notification Service - Handles notification CRUD operations with Supabase
 */

import { supabase } from '@/lib/supabase';
import type {
  Notification,
  NotificationPreference,
  OrgNotificationRule,
  NotificationCategory,
  NotificationSeverity,
  RecipientRule,
  CreateNotificationData,
  CreateNotificationInput,
  CreateNotificationResult,
  UpdatePreferenceData,
  CreatePreferenceData,
  CreateOrgRuleData,
  UpdateOrgRuleData,
  NotificationRow,
  NotificationPreferenceRow,
  OrgNotificationRuleRow,
} from './notification-types';

// ============================================================================
// Type Mappers
// ============================================================================

export function mapNotificationFromDb(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category as NotificationCategory,
    eventType: row.event_type,
    severity: row.severity as NotificationSeverity,
    title: row.title,
    message: row.message,
    entityType: row.entity_type,
    entityId: row.entity_id,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

function mapPreferenceFromDb(row: NotificationPreferenceRow): NotificationPreference {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category as NotificationCategory,
    eventType: row.event_type,
    inAppEnabled: row.in_app_enabled,
    emailEnabled: row.email_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrgRuleFromDb(row: OrgNotificationRuleRow): OrgNotificationRule {
  return {
    id: row.id,
    orgId: row.org_id,
    category: row.category as NotificationCategory,
    eventType: row.event_type,
    recipientRule: row.recipient_rule as RecipientRule,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Notification Service
// ============================================================================

export class NotificationService {
  // ============================================================================
  // Notification Operations
  // ============================================================================

  /**
   * Get all notifications for the current user
   */
  static async getAll(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapNotificationFromDb(row as NotificationRow));
  }

  /**
   * Get unread notifications for the current user
   */
  static async getUnread(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapNotificationFromDb(row as NotificationRow));
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  /**
   * Create a new notification
   */
  static async create(data: CreateNotificationData): Promise<Notification> {
    const insertData = {
      user_id: data.userId,
      category: data.category,
      event_type: data.eventType,
      severity: data.severity,
      title: data.title,
      message: data.message,
      entity_type: data.entityType,
      entity_id: data.entityId,
    };

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapNotificationFromDb(notification as NotificationRow);
  }

  /**
   * Trigger a notification event via Edge Function
   */
  static async trigger(
    data: CreateNotificationInput
  ): Promise<CreateNotificationResult | null> {
    const { data: result, error } = await supabase.functions.invoke(
      'create-notification',
      {
        body: {
          org_id: data.orgId,
          category: data.category,
          event_type: data.eventType,
          severity: data.severity,
          title: data.title,
          message: data.message,
          entity_type: data.entityType,
          entity_id: data.entityId,
          actor_id: data.actorId,
          project_id: data.projectId,
          metadata: data.metadata,
        },
      }
    );

    if (error) throw new Error(error.message);
    return (result as CreateNotificationResult) || null;
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapNotificationFromDb(data as NotificationRow);
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
  }

  /**
   * Delete a notification
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAll(userId: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  // ============================================================================
  // Preference Operations
  // ============================================================================

  /**
   * Get all preferences for a user
   */
  static async getPreferences(userId: string): Promise<NotificationPreference[]> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('category')
      .order('event_type');

    if (error) throw new Error(error.message);
    return (data || []).map((row) =>
      mapPreferenceFromDb(row as NotificationPreferenceRow)
    );
  }

  /**
   * Get a specific preference
   */
  static async getPreference(
    userId: string,
    category: NotificationCategory,
    eventType: string
  ): Promise<NotificationPreference | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('event_type', eventType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return mapPreferenceFromDb(data as NotificationPreferenceRow);
  }

  /**
   * Create or update a preference (upsert)
   */
  static async upsertPreference(
    userId: string,
    data: CreatePreferenceData
  ): Promise<NotificationPreference> {
    const insertData = {
      user_id: userId,
      category: data.category,
      event_type: data.eventType,
      in_app_enabled: data.inAppEnabled ?? true,
      email_enabled: data.emailEnabled ?? true,
    };

    const { data: preference, error } = await supabase
      .from('notification_preferences')
      .upsert(insertData, { onConflict: 'user_id,category,event_type' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPreferenceFromDb(preference as NotificationPreferenceRow);
  }

  /**
   * Update a preference
   */
  static async updatePreference(
    id: string,
    data: UpdatePreferenceData
  ): Promise<NotificationPreference> {
    const updateData: Record<string, unknown> = {};
    if (data.inAppEnabled !== undefined) updateData.in_app_enabled = data.inAppEnabled;
    if (data.emailEnabled !== undefined) updateData.email_enabled = data.emailEnabled;

    const { data: preference, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPreferenceFromDb(preference as NotificationPreferenceRow);
  }

  /**
   * Reset all preferences to defaults (delete all custom preferences)
   */
  static async resetPreferences(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  // ============================================================================
  // Org Rule Operations
  // ============================================================================

  /**
   * Get all notification rules for an organization
   */
  static async getOrgRules(orgId: string): Promise<OrgNotificationRule[]> {
    const { data, error } = await supabase
      .from('org_notification_rules')
      .select('*')
      .eq('org_id', orgId)
      .order('category')
      .order('event_type');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapOrgRuleFromDb(row as OrgNotificationRuleRow));
  }

  /**
   * Get a specific org rule
   */
  static async getOrgRule(
    orgId: string,
    category: NotificationCategory,
    eventType: string
  ): Promise<OrgNotificationRule | null> {
    const { data, error } = await supabase
      .from('org_notification_rules')
      .select('*')
      .eq('org_id', orgId)
      .eq('category', category)
      .eq('event_type', eventType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return mapOrgRuleFromDb(data as OrgNotificationRuleRow);
  }

  /**
   * Create or update an org rule (upsert)
   */
  static async upsertOrgRule(
    data: CreateOrgRuleData,
    userId: string
  ): Promise<OrgNotificationRule> {
    const insertData = {
      org_id: data.orgId,
      category: data.category,
      event_type: data.eventType,
      recipient_rule: data.recipientRule,
      created_by: userId,
    };

    const { data: rule, error } = await supabase
      .from('org_notification_rules')
      .upsert(insertData, { onConflict: 'org_id,category,event_type' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapOrgRuleFromDb(rule as OrgNotificationRuleRow);
  }

  /**
   * Update an org rule
   */
  static async updateOrgRule(
    id: string,
    data: UpdateOrgRuleData
  ): Promise<OrgNotificationRule> {
    const { data: rule, error } = await supabase
      .from('org_notification_rules')
      .update({ recipient_rule: data.recipientRule })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapOrgRuleFromDb(rule as OrgNotificationRuleRow);
  }

  /**
   * Delete an org rule
   */
  static async deleteOrgRule(id: string): Promise<void> {
    const { error } = await supabase.from('org_notification_rules').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }
}
