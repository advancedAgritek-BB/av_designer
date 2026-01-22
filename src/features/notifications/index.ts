// Notification Service & Types
export { NotificationService } from './notification-service';

// Types
export type {
  NotificationCategory,
  NotificationSeverity,
  RecipientRule,
  Notification,
  NotificationPreference,
  OrgNotificationRule,
  NotificationEventConfig,
  CreateNotificationData,
  CreateNotificationInput,
  CreateNotificationResult,
  UpdatePreferenceData,
  CreatePreferenceData,
  CreateOrgRuleData,
  UpdateOrgRuleData,
} from './notification-types';

export {
  NOTIFICATION_EVENTS,
  CATEGORY_CONFIG,
  SEVERITY_CONFIG,
} from './notification-types';

// Hooks
export {
  NOTIFICATION_KEYS,
  useNotifications,
  useUnreadNotifications,
  useNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
  useDismissAllNotifications,
  useRealtimeNotifications,
  useNotificationPreferences,
  useUpdatePreference,
  useUpsertPreference,
  useResetPreferences,
  useOrgNotificationRules,
  useUpdateOrgRule,
  useUpsertOrgRule,
  useDeleteOrgRule,
} from './use-notifications';

// Components
export { NotificationItem } from './components/NotificationItem';
export { NotificationPanel } from './components/NotificationPanel';
export { NotificationBell } from './components/NotificationBell';
export { NotificationPreferences } from './components/NotificationPreferences';
export { NotificationRouting } from './components/NotificationRouting';
