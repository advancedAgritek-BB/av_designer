/**
 * Notification Item Component
 *
 * Single notification row with gradient border and actions
 */
import type { Notification } from '../notification-types';
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from '../notification-types';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (notification: Notification) => void;
  onDismiss?: (notification: Notification) => void;
  onNavigate?: (notification: Notification) => void;
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
  onNavigate,
}: NotificationItemProps) {
  const category = CATEGORY_CONFIG[notification.category];
  const severity = SEVERITY_CONFIG[notification.severity];
  const actionRequired = notification.severity === 'action_required';

  const handleClick = () => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification);
    }
    if (onNavigate) {
      onNavigate(notification);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(notification);
    }
  };

  return (
    <div
      className={`group relative flex gap-3 p-3 cursor-pointer hover:bg-bg-tertiary/50 transition-colors ${
        !notification.isRead ? 'bg-bg-secondary' : ''
      } ${actionRequired ? 'notification-action-required' : ''}`}
      style={{
        borderLeft: `3px solid`,
        borderImage: `linear-gradient(135deg, ${severity.gradientStart}, ${severity.gradientEnd}) 1`,
      }}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 size-8 rounded-full flex items-center justify-center text-sm"
        style={{
          background: `linear-gradient(135deg, ${severity.gradientStart}20, ${severity.gradientEnd}20)`,
        }}
      >
        {category.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-text-primary truncate">
            {notification.title}
          </p>
          <span className="text-xs text-text-tertiary shrink-0 tabular-nums">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">
          {notification.message}
        </p>
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-tertiary hover:text-text-primary"
          aria-label="Dismiss notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}

      {/* Unread indicator */}
      {!notification.isRead && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${severity.gradientStart}, ${severity.gradientEnd})`,
          }}
        />
      )}
    </div>
  );
}
