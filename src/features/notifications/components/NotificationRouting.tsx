/**
 * Notification Routing Component
 *
 * Org-level rules that control who receives notifications for each event.
 */
import { useMemo, useState } from 'react';
import {
  useOrgNotificationRules,
  useUpsertOrgRule,
  useDeleteOrgRule,
} from '../use-notifications';
import {
  NOTIFICATION_EVENTS,
  CATEGORY_CONFIG,
  type NotificationCategory,
  type RecipientRule,
} from '../notification-types';

interface NotificationRoutingProps {
  orgId: string;
}

const RECIPIENT_RULES: RecipientRule[] = [
  'actor_only',
  'project_team',
  'role:editor',
  'role:admin',
  'role:owner',
  'all_members',
];

const RECIPIENT_RULE_LABELS: Record<RecipientRule, string> = {
  actor_only: 'Actor only',
  project_team: 'Project team',
  'role:editor': 'Editors',
  'role:admin': 'Admins',
  'role:owner': 'Owners',
  all_members: 'All members',
};

function CategorySection({
  category,
  events,
  getRule,
  onRuleChange,
}: {
  category: NotificationCategory;
  events: typeof NOTIFICATION_EVENTS;
  getRule: (category: NotificationCategory, eventType: string) => RecipientRule;
  onRuleChange: (
    category: NotificationCategory,
    eventType: string,
    recipientRule: RecipientRule,
    defaultRule: RecipientRule
  ) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = CATEGORY_CONFIG[category];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
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

      {isExpanded && (
        <div className="p-4 border-t border-border">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-text-tertiary">
                <th className="text-left font-medium pb-2">Event</th>
                <th className="text-left font-medium pb-2">Recipients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {events
                .filter((event) => event.category === category)
                .map((event) => {
                  const selectedRule = getRule(category, event.eventType);

                  return (
                    <tr key={event.eventType}>
                      <td className="py-2 text-sm text-text-primary">
                        {event.eventType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2">
                        <select
                          className="input text-sm"
                          value={selectedRule}
                          onChange={(e) =>
                            onRuleChange(
                              category,
                              event.eventType,
                              e.target.value as RecipientRule,
                              event.defaultRecipientRule
                            )
                          }
                        >
                          {RECIPIENT_RULES.map((rule) => (
                            <option key={rule} value={rule}>
                              {RECIPIENT_RULE_LABELS[rule]}
                            </option>
                          ))}
                        </select>
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

export function NotificationRouting({ orgId }: NotificationRoutingProps) {
  const { data: rules = [], isLoading } = useOrgNotificationRules(orgId);
  const upsertMutation = useUpsertOrgRule();
  const deleteMutation = useDeleteOrgRule();

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(NOTIFICATION_EVENTS.map((e) => e.category))];
    return uniqueCategories as NotificationCategory[];
  }, []);

  const ruleMap = useMemo(() => {
    const map = new Map<string, RecipientRule>();
    rules.forEach((rule) => {
      map.set(`${rule.category}:${rule.eventType}`, rule.recipientRule);
    });
    return map;
  }, [rules]);

  const ruleIdMap = useMemo(() => {
    const map = new Map<string, string>();
    rules.forEach((rule) => {
      map.set(`${rule.category}:${rule.eventType}`, rule.id);
    });
    return map;
  }, [rules]);

  const getRule = (category: NotificationCategory, eventType: string) => {
    const override = ruleMap.get(`${category}:${eventType}`);
    const defaultRule = NOTIFICATION_EVENTS.find(
      (event) => event.category === category && event.eventType === eventType
    )?.defaultRecipientRule;
    return override ?? defaultRule ?? 'all_members';
  };

  const handleRuleChange = (
    category: NotificationCategory,
    eventType: string,
    recipientRule: RecipientRule,
    defaultRule: RecipientRule
  ) => {
    const key = `${category}:${eventType}`;
    const existingRuleId = ruleIdMap.get(key);

    if (recipientRule === defaultRule) {
      if (existingRuleId) {
        deleteMutation.mutate({ id: existingRuleId, orgId });
      }
      return;
    }

    upsertMutation.mutate({
      data: {
        orgId,
        category,
        eventType,
        recipientRule,
      },
    });
  };

  if (!orgId) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 bg-bg-tertiary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Notification Routing</h2>
        <p className="text-sm text-text-secondary mt-1">
          Set who should receive each notification for this organization.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            events={NOTIFICATION_EVENTS}
            getRule={getRule}
            onRuleChange={handleRuleChange}
          />
        ))}
      </div>
    </div>
  );
}
