/**
 * Notification Preferences Component
 *
 * User preferences for notification channels per event type
 */
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui';
import {
  useNotificationPreferences,
  useUpsertPreference,
  useResetPreferences,
} from '../use-notifications';
import {
  NOTIFICATION_EVENTS,
  CATEGORY_CONFIG,
  type NotificationCategory,
  type NotificationPreference,
} from '../notification-types';

interface NotificationPreferencesProps {
  userId: string;
}

/**
 * Toggle switch component
 */
function Toggle({
  checked,
  onChange,
  disabled = false,
  locked = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled || locked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? 'bg-accent-gold' : 'bg-bg-tertiary'
      } ${disabled || locked ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/**
 * Category accordion section
 */
function CategorySection({
  category,
  events,
  preferences,
  onPreferenceChange,
}: {
  category: NotificationCategory;
  events: typeof NOTIFICATION_EVENTS;
  preferences: NotificationPreference[];
  onPreferenceChange: (
    category: NotificationCategory,
    eventType: string,
    field: 'inAppEnabled' | 'emailEnabled',
    value: boolean
  ) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = CATEGORY_CONFIG[category];

  // Get preference for an event, with fallback to defaults
  const getPreference = (eventType: string) => {
    const pref = preferences.find(
      (p) => p.category === category && p.eventType === eventType
    );
    const defaultEvent = events.find(
      (e) => e.category === category && e.eventType === eventType
    );

    return {
      inAppEnabled: pref?.inAppEnabled ?? defaultEvent?.defaultInApp ?? true,
      emailEnabled: pref?.emailEnabled ?? defaultEvent?.defaultEmail ?? false,
    };
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-secondary hover:bg-bg-tertiary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{config.icon}</span>
          <span className="font-medium text-text-primary">{config.label}</span>
        </div>
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
          className={`text-text-tertiary transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-border">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-text-tertiary">
                <th className="text-left font-medium pb-2">Event</th>
                <th className="text-center font-medium pb-2 w-20">In-App</th>
                <th className="text-center font-medium pb-2 w-20">Email</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {events
                .filter((e) => e.category === category)
                .map((event) => {
                  const pref = getPreference(event.eventType);
                  const isLocked = event.severity === 'action_required';

                  return (
                    <tr key={event.eventType}>
                      <td className="py-2 text-sm text-text-primary">
                        {event.eventType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2 text-center">
                        <Toggle
                          checked={pref.inAppEnabled}
                          onChange={(value) =>
                            onPreferenceChange(
                              category,
                              event.eventType,
                              'inAppEnabled',
                              value
                            )
                          }
                          locked={isLocked}
                        />
                      </td>
                      <td className="py-2 text-center">
                        <Toggle
                          checked={pref.emailEnabled}
                          onChange={(value) =>
                            onPreferenceChange(
                              category,
                              event.eventType,
                              'emailEnabled',
                              value
                            )
                          }
                        />
                      </td>
                      <td className="py-2 text-center">
                        {isLocked && (
                          <span
                            className="text-text-tertiary"
                            title="Cannot disable in-app for action required events"
                          >
                            🔒
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const { data: preferences = [], isLoading } = useNotificationPreferences(userId);
  const upsertMutation = useUpsertPreference();
  const resetMutation = useResetPreferences();

  // Group events by category
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(NOTIFICATION_EVENTS.map((e) => e.category))];
    return uniqueCategories as NotificationCategory[];
  }, []);

  const handlePreferenceChange = (
    category: NotificationCategory,
    eventType: string,
    field: 'inAppEnabled' | 'emailEnabled',
    value: boolean
  ) => {
    // Get current preference or defaults
    const existing = preferences.find(
      (p) => p.category === category && p.eventType === eventType
    );
    const defaultEvent = NOTIFICATION_EVENTS.find(
      (e) => e.category === category && e.eventType === eventType
    );

    const data = {
      category,
      eventType,
      inAppEnabled:
        field === 'inAppEnabled'
          ? value
          : (existing?.inAppEnabled ?? defaultEvent?.defaultInApp ?? true),
      emailEnabled:
        field === 'emailEnabled'
          ? value
          : (existing?.emailEnabled ?? defaultEvent?.defaultEmail ?? false),
    };

    upsertMutation.mutate({ userId, data });
  };

  const handleReset = () => {
    if (window.confirm('Reset all notification preferences to defaults?')) {
      resetMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-bg-tertiary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Notification Preferences
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Choose how you want to be notified for each event type
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            events={NOTIFICATION_EVENTS}
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
          />
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <Button variant="secondary" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
