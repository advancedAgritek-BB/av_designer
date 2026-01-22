/**
 * Client List Component
 *
 * Renders a grid of client cards
 */
import { ClientCard } from './ClientCard';
import type { Client } from '../client-types';

interface ClientListProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
  onClientDelete: (client: Client) => void;
}

export function ClientList({ clients, onClientClick, onClientDelete }: ClientListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onClick={() => onClientClick(client)}
          onDelete={() => onClientDelete(client)}
        />
      ))}
    </div>
  );
}
