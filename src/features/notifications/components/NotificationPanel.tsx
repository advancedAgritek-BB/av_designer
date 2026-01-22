/**
 * Notification Panel Component
 *
 * Dropdown panel showing notification list with actions
 */
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../notification-types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (notification: Notification) => void;
  onDismissAll: () => void;
  onNavigate: (notification: Notification) => void;
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="size-8 bg-bg-tertiary rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-bg-tertiary rounded" />
            <div className="h-3 w-1/2 bg-bg-tertiary rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="size-12 rounded-full flex items-center justify-center text-2xl mb-3"
        style={{
          background: 'linear-gradient(135deg, #6366F120, #06B6D420)',
        }}
      >
        ✓
      </div>
      <p className="text-sm font-medium text-text-primary">You're all caught up!</p>
      <p className="text-xs text-text-tertiary mt-1">No new notifications</p>
    </div>
  );
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onDismissAll,
  onNavigate,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-[360px] max-h-[400px] bg-bg-primary border border-border rounded-lg shadow-lg overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-xs text-accent-gold hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Close notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[300px]">
        {isLoading ? (
          <LoadingSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={onMarkAsRead}
                onDismiss={onDismiss}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-center px-4 py-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onDismissAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
