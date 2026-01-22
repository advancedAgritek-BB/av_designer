/**
 * Client Overview Tab
 *
 * Displays client details and allows editing
 */
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useUpdateClient } from '../use-clients';
import type { Client, UpdateClientData, ClientAddress } from '../client-types';

interface ClientOverviewTabProps {
  client: Client;
}

export function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateClientData>({
    name: client.name,
    industry: client.industry,
    website: client.website,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    billingTerms: client.billingTerms,
    taxExempt: client.taxExempt,
    taxExemptId: client.taxExemptId,
    notes: client.notes,
    address: client.address,
  });

  const updateMutation = useUpdateClient();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id: client.id, data: formData });
      setIsEditing(false);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleCancel = () => {
    setFormData({
      name: client.name,
      industry: client.industry,
      website: client.website,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      billingTerms: client.billingTerms,
      taxExempt: client.taxExempt,
      taxExemptId: client.taxExemptId,
      notes: client.notes,
      address: client.address,
    });
    setIsEditing(false);
  };

  const updateAddress = (key: keyof ClientAddress, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value || undefined,
      },
    }));
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-text-primary">Edit Client</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </div>

        {updateMutation.error && (
          <p className="text-sm text-red-400">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : 'Failed to update client'}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-text-secondary">Basic Information</h3>
            <Input
              label="Client Name"
              value={formData.name || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Industry"
              value={formData.industry || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, industry: e.target.value }))
              }
            />
            <Input
              label="Website"
              type="url"
              value={formData.website || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="https://"
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-text-secondary">Primary Contact</h3>
            <Input
              label="Contact Name"
              value={formData.contactName || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactName: e.target.value }))
              }
            />
            <Input
              label="Contact Email"
              type="email"
              value={formData.contactEmail || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
              }
            />
            <Input
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
              }
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-text-secondary">Address</h3>
            <Input
              label="Street"
              value={formData.address?.street || ''}
              onChange={(e) => updateAddress('street', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={formData.address?.city || ''}
                onChange={(e) => updateAddress('city', e.target.value)}
              />
              <Input
                label="State"
                value={formData.address?.state || ''}
                onChange={(e) => updateAddress('state', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="ZIP Code"
                value={formData.address?.zip || ''}
                onChange={(e) => updateAddress('zip', e.target.value)}
              />
              <Input
                label="Country"
                value={formData.address?.country || ''}
                onChange={(e) => updateAddress('country', e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-text-secondary">Billing</h3>
            <Input
              label="Billing Terms"
              value={formData.billingTerms || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, billingTerms: e.target.value }))
              }
              placeholder="e.g., Net 30"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="taxExempt"
                checked={formData.taxExempt || false}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, taxExempt: e.target.checked }))
                }
                className="rounded border-border bg-bg-secondary text-accent-gold focus:ring-accent-gold"
              />
              <label htmlFor="taxExempt" className="text-sm text-text-secondary">
                Tax Exempt
              </label>
            </div>
            {formData.taxExempt && (
              <Input
                label="Tax Exempt ID"
                value={formData.taxExemptId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, taxExemptId: e.target.value }))
                }
              />
            )}
          </section>
        </div>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Notes</h3>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-gold resize-none"
            rows={4}
            placeholder="Add notes about this client..."
          />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-text-primary">Client Details</h2>
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">Basic Information</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-text-tertiary">Name</dt>
              <dd className="text-text-primary">{client.name}</dd>
            </div>
            {client.industry && (
              <div>
                <dt className="text-xs text-text-tertiary">Industry</dt>
                <dd className="text-text-primary">{client.industry}</dd>
              </div>
            )}
            {client.website && (
              <div>
                <dt className="text-xs text-text-tertiary">Website</dt>
                <dd>
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-gold hover:underline"
                  >
                    {client.website}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">Primary Contact</h3>
          <dl className="space-y-2">
            {client.contactName && (
              <div>
                <dt className="text-xs text-text-tertiary">Name</dt>
                <dd className="text-text-primary">{client.contactName}</dd>
              </div>
            )}
            {client.contactEmail && (
              <div>
                <dt className="text-xs text-text-tertiary">Email</dt>
                <dd>
                  <a
                    href={`mailto:${client.contactEmail}`}
                    className="text-accent-gold hover:underline"
                  >
                    {client.contactEmail}
                  </a>
                </dd>
              </div>
            )}
            {client.contactPhone && (
              <div>
                <dt className="text-xs text-text-tertiary">Phone</dt>
                <dd>
                  <a
                    href={`tel:${client.contactPhone}`}
                    className="text-accent-gold hover:underline"
                  >
                    {client.contactPhone}
                  </a>
                </dd>
              </div>
            )}
            {!client.contactName && !client.contactEmail && !client.contactPhone && (
              <p className="text-text-tertiary text-sm">No primary contact set</p>
            )}
          </dl>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">Address</h3>
          {client.address?.street || client.address?.city ? (
            <address className="not-italic text-text-primary">
              {client.address.street && <div>{client.address.street}</div>}
              {(client.address.city || client.address.state || client.address.zip) && (
                <div>
                  {[client.address.city, client.address.state].filter(Boolean).join(', ')}
                  {client.address.zip && ` ${client.address.zip}`}
                </div>
              )}
              {client.address.country && <div>{client.address.country}</div>}
            </address>
          ) : (
            <p className="text-text-tertiary text-sm">No address set</p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">Billing</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-text-tertiary">Terms</dt>
              <dd className="text-text-primary">{client.billingTerms}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Tax Status</dt>
              <dd className="text-text-primary">
                {client.taxExempt ? (
                  <span>
                    Tax Exempt
                    {client.taxExemptId && (
                      <span className="text-text-secondary"> ({client.taxExemptId})</span>
                    )}
                  </span>
                ) : (
                  'Standard'
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {client.notes && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">Notes</h3>
          <p className="text-text-primary whitespace-pre-wrap">{client.notes}</p>
        </section>
      )}
    </div>
  );
}
