/**
 * Notifications Panel
 *
 * Dashboard panel displaying recent unread notifications with
 * actions to mark as read and navigate to full notifications view.
 */

import { Link } from 'react-router-dom';
import { useMarkAllAsRead } from '@/features/notifications/use-notifications';
import { useAuthStore } from '@/features/auth/auth-store';
import type { Notification } from '@/features/notifications/notification-types';

// ============================================================================
// Types
// ============================================================================

interface NotificationsPanelProps {
  notifications: Notification[];
  unreadCount: number;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format a date as relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
}

// ============================================================================
// Components
// ============================================================================

/**
 * Single notification item in the list
 */
interface NotificationItemProps {
  notification: Notification;
}

function NotificationItem({ notification }: NotificationItemProps) {
  const isUnread = !notification.isRead;

  return (
    <div className="notification-item">
      {isUnread && <span className="notification-unread-dot" />}
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">
          {formatRelativeTime(notification.createdAt)}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state when no notifications exist
 */
function EmptyState() {
  return (
    <div className="notifications-empty">
      <p className="notifications-empty-text">No notifications</p>
    </div>
  );
}

/**
 * Panel header with title, badge, and mark all as read button
 */
interface PanelHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  isLoading: boolean;
}

function PanelHeader({ unreadCount, onMarkAllAsRead, isLoading }: PanelHeaderProps) {
  return (
    <div className="notifications-header">
      <div className="notifications-title-group">
        <h3 className="notifications-title">Notifications</h3>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </div>
      {unreadCount > 0 && (
        <button
          type="button"
          className="notifications-mark-read-btn"
          onClick={onMarkAllAsRead}
          disabled={isLoading}
        >
          Mark all as read
        </button>
      )}
    </div>
  );
}

/**
 * Panel footer with link to full notifications view
 */
function PanelFooter() {
  return (
    <div className="notifications-footer">
      <Link to="/settings" className="notifications-view-all">
        View all notifications
      </Link>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Dashboard panel showing recent notifications
 */
export function NotificationsPanel({
  notifications,
  unreadCount,
}: NotificationsPanelProps) {
  const user = useAuthStore((state) => state.user);
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead.mutate(user.id);
    }
  };

  return (
    <div className="notifications-panel">
      <PanelHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        isLoading={markAllAsRead.isPending}
      />

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        )}
      </div>

      <PanelFooter />
    </div>
  );
}
