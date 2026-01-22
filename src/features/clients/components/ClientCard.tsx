/**
 * Client Card Component
 *
 * Displays a client summary in a card format
 */
import { Card, CardBody } from '@/components/ui';
import type { Client } from '../client-types';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
  onDelete: () => void;
}

/**
 * Industry badge component
 */
function IndustryBadge({ industry }: { industry: string | null }) {
  if (!industry) return null;

  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary">
      {industry}
    </span>
  );
}

export function ClientCard({ client, onClick, onDelete }: ClientCardProps) {
  const formattedDate = new Date(client.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hasContactInfo = client.contactName || client.contactEmail;

  return (
    <Card className="hover:border-white/20 transition-colors cursor-pointer group">
      <CardBody>
        <div className="flex items-start justify-between" onClick={onClick}>
          <div className="space-y-1">
            <h3 className="text-text-primary font-medium group-hover:text-accent-gold transition-colors">
              {client.name}
            </h3>
            {hasContactInfo && (
              <p className="text-sm text-text-secondary">
                {client.contactName}
                {client.contactName && client.contactEmail && ' · '}
                {client.contactEmail}
              </p>
            )}
          </div>
          <IndustryBadge industry={client.industry} />
        </div>

        {/* Address preview if available */}
        {client.address?.city && (
          <p className="text-xs text-text-tertiary mt-2">
            {[client.address.city, client.address.state].filter(Boolean).join(', ')}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <span className="text-xs text-text-tertiary tabular-nums">
            Updated {formattedDate}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-text-tertiary hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Delete ${client.name}`}
          >
            Delete
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
