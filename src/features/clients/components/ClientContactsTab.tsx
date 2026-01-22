/**
 * Client Contacts Tab
 *
 * Manages contacts for a client
 */
import { useState } from 'react';
import { Button, Card, CardBody, Input, Modal, ModalFooter } from '@/components/ui';
import {
  useClientContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from '../use-clients';
import type {
  ClientContact,
  CreateContactData,
  UpdateContactData,
} from '../client-types';

interface ClientContactsTabProps {
  clientId: string;
}

/**
 * Contact form for create/edit
 */
function ContactForm({
  contact,
  clientId,
  onSubmit,
  onCancel,
  isLoading,
}: {
  contact?: ClientContact;
  clientId: string;
  onSubmit: (data: CreateContactData | UpdateContactData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(contact?.name || '');
  const [title, setTitle] = useState(contact?.title || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [mobile, setMobile] = useState(contact?.mobile || '');
  const [isPrimary, setIsPrimary] = useState(contact?.isPrimary || false);
  const [notes, setNotes] = useState(contact?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (contact) {
      // Update
      onSubmit({
        name: name.trim(),
        title: title.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        mobile: mobile.trim() || null,
        isPrimary,
        notes: notes.trim() || null,
      });
    } else {
      // Create
      onSubmit({
        clientId,
        name: name.trim(),
        title: title.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        mobile: mobile.trim() || undefined,
        isPrimary,
        notes: notes.trim() || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., IT Director"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrimary"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="rounded border-border bg-bg-secondary text-accent-gold focus:ring-accent-gold"
          />
          <label htmlFor="isPrimary" className="text-sm text-text-secondary">
            Primary Contact
          </label>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-gold resize-none"
            rows={3}
          />
        </div>
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading} disabled={!name.trim()}>
          {contact ? 'Save Changes' : 'Add Contact'}
        </Button>
      </ModalFooter>
    </form>
  );
}

/**
 * Contact card
 */
function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: ClientContact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-text-primary font-medium">{contact.name}</h4>
              {contact.isPrimary && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-accent-gold/20 text-accent-gold">
                  Primary
                </span>
              )}
            </div>
            {contact.title && (
              <p className="text-sm text-text-secondary">{contact.title}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-2 py-1"
              aria-label={`Edit ${contact.name}`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs text-text-tertiary hover:text-red-400 transition-colors px-2 py-1"
              aria-label={`Delete ${contact.name}`}
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-sm">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="block text-accent-gold hover:underline"
            >
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="block text-text-secondary hover:text-text-primary"
            >
              {contact.phone}
            </a>
          )}
          {contact.mobile && (
            <a
              href={`tel:${contact.mobile}`}
              className="block text-text-secondary hover:text-text-primary"
            >
              {contact.mobile} (mobile)
            </a>
          )}
        </div>

        {contact.notes && (
          <p className="mt-3 pt-3 border-t border-white/5 text-sm text-text-tertiary">
            {contact.notes}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Empty state
 */
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="size-12 mb-3 rounded-full bg-bg-tertiary flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-tertiary"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      </div>
      <h3 className="text-base font-medium text-text-primary mb-1 text-balance">
        No contacts yet
      </h3>
      <p className="text-sm text-text-secondary mb-4 text-pretty">
        Add contacts for this client
      </p>
      <Button variant="secondary" size="sm" onClick={onCreate}>
        Add Contact
      </Button>
    </div>
  );
}

export function ClientContactsTab({ clientId }: ClientContactsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<ClientContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<ClientContact | null>(null);

  const { data: contacts, isLoading, error } = useClientContacts(clientId);
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

  const handleCreate = async (data: CreateContactData | UpdateContactData) => {
    try {
      await createMutation.mutateAsync(data as CreateContactData);
      setIsCreateModalOpen(false);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleUpdate = async (data: CreateContactData | UpdateContactData) => {
    if (!contactToEdit) return;
    try {
      await updateMutation.mutateAsync({
        id: contactToEdit.id,
        clientId,
        data: data as UpdateContactData,
      });
      setContactToEdit(null);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: contactToDelete.id, clientId });
      setContactToDelete(null);
    } catch {
      // Error handled by mutation state
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardBody>
              <div className="animate-pulse space-y-2">
                <div className="h-5 w-32 bg-bg-tertiary rounded" />
                <div className="h-4 w-24 bg-bg-tertiary rounded" />
                <div className="h-4 w-40 bg-bg-tertiary rounded mt-3" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">
          {error instanceof Error ? error.message : 'Failed to load contacts'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-text-primary">Contacts</h2>
        {contacts && contacts.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Contact
          </Button>
        )}
      </div>

      {contacts?.length === 0 && (
        <EmptyState onCreate={() => setIsCreateModalOpen(true)} />
      )}

      {contacts && contacts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => setContactToEdit(contact)}
              onDelete={() => setContactToDelete(contact)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Contact"
      >
        <ContactForm
          clientId={clientId}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
        {createMutation.error && (
          <p className="mt-2 text-sm text-red-400">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'Failed to add contact'}
          </p>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!contactToEdit}
        onClose={() => setContactToEdit(null)}
        title="Edit Contact"
      >
        {contactToEdit && (
          <ContactForm
            contact={contactToEdit}
            clientId={clientId}
            onSubmit={handleUpdate}
            onCancel={() => setContactToEdit(null)}
            isLoading={updateMutation.isPending}
          />
        )}
        {updateMutation.error && (
          <p className="mt-2 text-sm text-red-400">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : 'Failed to update contact'}
          </p>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!contactToDelete}
        onClose={() => setContactToDelete(null)}
        title="Delete Contact"
        size="sm"
      >
        {contactToDelete && (
          <div>
            <p className="text-text-secondary">
              Are you sure you want to delete{' '}
              <strong className="text-text-primary">{contactToDelete.name}</strong>?
            </p>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setContactToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </ModalFooter>
          </div>
        )}
        {deleteMutation.error && (
          <p className="mt-2 text-sm text-red-400">
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : 'Failed to delete contact'}
          </p>
        )}
      </Modal>
    </div>
  );
}
