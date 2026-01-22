/**
 * Notification Bell Component
 *
 * Header icon with unread count badge
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationPanel } from './NotificationPanel';
import {
  useUnreadNotifications,
  useNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
  useDismissAllNotifications,
  useRealtimeNotifications,
} from '../use-notifications';
import type { Notification } from '../notification-types';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Queries
  const { data: notifications = [], isLoading } = useUnreadNotifications(userId);
  const { data: count = 0 } = useNotificationCount(userId);

  // Subscribe to real-time updates
  useRealtimeNotifications(userId);

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const dismissMutation = useDismissNotification();
  const dismissAllMutation = useDismissAllNotifications();

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMarkAsRead = useCallback(
    (notification: Notification) => {
      markAsReadMutation.mutate(notification.id);
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate(userId);
  }, [markAllAsReadMutation, userId]);

  const handleDismiss = useCallback(
    (notification: Notification) => {
      dismissMutation.mutate({ id: notification.id, userId });
    },
    [dismissMutation, userId]
  );

  const handleDismissAll = useCallback(() => {
    dismissAllMutation.mutate(userId);
  }, [dismissAllMutation, userId]);

  const handleNavigate = useCallback(
    (notification: Notification) => {
      // Navigate to the entity based on type
      const routes: Record<string, string> = {
        quote: `/quotes/${notification.entityId}`,
        project: `/projects/${notification.entityId}`,
        room: `/rooms/${notification.entityId}`,
        drawing: `/drawings/${notification.entityId}`,
        equipment: `/equipment/${notification.entityId}`,
      };

      const route = routes[notification.entityType];
      if (route) {
        navigate(route);
        handleClose();
      }
    },
    [navigate, handleClose]
  );

  // Format count display
  const displayCount = count > 99 ? '99+' : count;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
        aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ''}`}
      >
        {/* Bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={count > 0 ? 'animate-bell-shake' : ''}
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {/* Badge */}
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-xs font-medium text-white rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            }}
          >
            {displayCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <NotificationPanel
        isOpen={isOpen}
        onClose={handleClose}
        notifications={notifications}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDismiss={handleDismiss}
        onDismissAll={handleDismissAll}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
