/**
 * Clients Page
 *
 * Lists all clients with ability to create, edit, and delete
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Input, Modal, ModalFooter } from '@/components/ui';
import { useTopLevelClients, useCreateClient, useDeleteClient } from '../use-clients';
import { ClientList } from './ClientList';
import type { Client, CreateClientData } from '../client-types';

/**
 * Create client form
 */
function CreateClientForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: CreateClientData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      industry: industry.trim() || undefined,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Client Name"
          placeholder="e.g., Acme Corporation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Industry"
          placeholder="e.g., Technology, Finance, Healthcare"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <Input
          label="Primary Contact Name"
          placeholder="e.g., John Smith"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
        />
        <Input
          label="Primary Contact Email"
          type="email"
          placeholder="e.g., john@acme.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading} disabled={!name.trim()}>
          Create Client
        </Button>
      </ModalFooter>
    </form>
  );
}

/**
 * Delete confirmation content
 */
function DeleteConfirmation({
  clientName,
  onConfirm,
  onCancel,
  isLoading,
}: {
  clientName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div>
      <p className="text-text-secondary">
        Are you sure you want to delete{' '}
        <strong className="text-text-primary">{clientName}</strong>? This will also delete
        all associated contacts and price book entries. This action cannot be undone.
      </p>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={isLoading}>
          Delete Client
        </Button>
      </ModalFooter>
    </div>
  );
}

/**
 * Empty state when no clients exist
 */
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-tertiary"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2 text-balance">
        No clients yet
      </h3>
      <p className="text-text-secondary mb-6 max-w-sm text-pretty">
        Add your first client to start organizing projects, contacts, and custom pricing.
      </p>
      <Button onClick={onCreate}>Add Your First Client</Button>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2 text-balance">
        Failed to load clients
      </h3>
      <p className="text-text-secondary mb-6 max-w-sm text-pretty">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardBody>
            <div className="animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-bg-tertiary rounded" />
                  <div className="h-4 w-48 bg-bg-tertiary rounded" />
                </div>
                <div className="h-5 w-16 bg-bg-tertiary rounded-full" />
              </div>
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="h-3 w-20 bg-bg-tertiary rounded" />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function ClientsPage() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const { data: clients, isLoading, error, refetch } = useTopLevelClients();
  const createMutation = useCreateClient();
  const deleteMutation = useDeleteClient();

  const handleCreateClient = async (data: CreateClientData) => {
    try {
      const newClient = await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      navigate(`/clients/${newClient.id}`);
    } catch {
      // Error is handled by mutation state
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      await deleteMutation.mutateAsync(clientToDelete.id);
      setClientToDelete(null);
    } catch {
      // Error is handled by mutation state
    }
  };

  const handleClientClick = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  return (
    <main role="main" data-testid="clients-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary text-balance">
            Clients
          </h1>
          <p className="text-text-secondary mt-1 text-pretty">
            Manage your client relationships and contacts
          </p>
        </div>
        {clients && clients.length > 0 && (
          <Button onClick={() => setIsCreateModalOpen(true)}>New Client</Button>
        )}
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton />}

      {error && (
        <ErrorState
          message={
            error instanceof Error ? error.message : 'An unexpected error occurred'
          }
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && clients?.length === 0 && (
        <EmptyState onCreate={() => setIsCreateModalOpen(true)} />
      )}

      {!isLoading && !error && clients && clients.length > 0 && (
        <ClientList
          clients={clients}
          onClientClick={handleClientClick}
          onClientDelete={setClientToDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Client"
        description="Create a new client profile"
      >
        <CreateClientForm
          onSubmit={handleCreateClient}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
        {createMutation.error && (
          <p className="mt-2 text-sm text-red-400">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'Failed to create client'}
          </p>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        title="Delete Client"
        size="sm"
      >
        {clientToDelete && (
          <DeleteConfirmation
            clientName={clientToDelete.name}
            onConfirm={handleDeleteClient}
            onCancel={() => setClientToDelete(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
        {deleteMutation.error && (
          <p className="mt-2 text-sm text-red-400">
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : 'Failed to delete client'}
          </p>
        )}
      </Modal>
    </main>
  );
}
