/**
 * Activity Feed Component
 *
 * Displays recent activity events for a project
 */
import type { ActivityEvent, ActivityEventType } from '../project-types';

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
}

/**
 * Event type configuration
 */
const EVENT_CONFIG: Record<
  ActivityEventType,
  { icon: string; label: string; color: string }
> = {
  project_created: { icon: '🎉', label: 'Project created', color: 'text-green-400' },
  project_updated: { icon: '✏️', label: 'Project updated', color: 'text-blue-400' },
  status_changed: { icon: '🔄', label: 'Status changed', color: 'text-purple-400' },
  task_created: { icon: '➕', label: 'Task added', color: 'text-blue-400' },
  task_completed: { icon: '✅', label: 'Task completed', color: 'text-green-400' },
  comment_added: { icon: '💬', label: 'Comment added', color: 'text-amber-400' },
  file_uploaded: { icon: '📎', label: 'File uploaded', color: 'text-cyan-400' },
  member_added: { icon: '👤', label: 'Member added', color: 'text-green-400' },
  member_removed: { icon: '👤', label: 'Member removed', color: 'text-red-400' },
};

/**
 * Single activity item
 */
function ActivityItem({ event }: { event: ActivityEvent }) {
  const config = EVENT_CONFIG[event.eventType] || {
    icon: '📋',
    label: event.eventType.replace('_', ' '),
    color: 'text-text-secondary',
  };

  const timeAgo = getRelativeTime(event.createdAt);
  const description = getEventDescription(event);

  return (
    <div className="flex gap-3 py-3">
      {/* Icon */}
      <div className="flex-shrink-0 size-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">
          <span className={config.color}>{config.label}</span>
          {description && <span className="text-text-secondary"> {description}</span>}
          {!description && event.summary && (
            <span className="text-text-secondary"> {event.summary}</span>
          )}
        </p>
        <p className="text-xs text-text-tertiary mt-0.5">{timeAgo}</p>
      </div>
    </div>
  );
}

/**
 * Get relative time string
 */
function getRelativeTime(dateString: string): string {
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

/**
 * Get event description from details
 */
function getEventDescription(event: ActivityEvent): string | null {
  const { details } = event;

  if (!details || typeof details !== 'object') return null;

  const detailRecord = details as Record<string, unknown>;

  if (event.eventType === 'status_changed' && detailRecord.from && detailRecord.to) {
    return `from ${String(detailRecord.from).replace('_', ' ')} to ${String(detailRecord.to).replace('_', ' ')}`;
  }

  if (event.eventType === 'task_created' && detailRecord.title) {
    return `"${detailRecord.title}"`;
  }

  if (event.eventType === 'task_completed' && detailRecord.title) {
    return `"${detailRecord.title}"`;
  }

  return null;
}

export function ActivityFeed({ events, maxItems = 10 }: ActivityFeedProps) {
  const displayedEvents = events.slice(0, maxItems);

  if (displayedEvents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-text-tertiary">No activity yet</div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {displayedEvents.map((event) => (
        <ActivityItem key={event.id} event={event} />
      ))}
    </div>
  );
}
