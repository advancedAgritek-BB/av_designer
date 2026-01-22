/**
 * Billing Settings Component
 *
 * Plan, payment, and billing contact management
 */

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal, ModalFooter } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useOrganizationMembers } from '@/features/auth/use-organizations';
import {
  useBillingInvoices,
  useCreateBillingInvoice,
  useOrgSettings,
  useUpdateOrgSettings,
} from '../use-settings';
import type { BillingInvoice, BillingStatus, OrgSettings } from '../settings-types';

interface BillingSettingsProps {
  orgId: string;
}

const PLAN_OPTIONS = [
  {
    id: 'starter',
    name: 'Starter',
    priceCents: 0,
    billingCycle: 'monthly' as const,
    teamLimit: 3,
    storageLimitGb: 5,
    features: ['Up to 3 team members', 'Unlimited projects', 'Core templates'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceCents: 2900,
    billingCycle: 'monthly' as const,
    teamLimit: 5,
    storageLimitGb: 20,
    features: ['Up to 5 team members', 'Advanced templates', 'Priority support'],
  },
  {
    id: 'team',
    name: 'Team',
    priceCents: 4900,
    billingCycle: 'monthly' as const,
    teamLimit: 10,
    storageLimitGb: 50,
    features: ['Up to 10 team members', 'All integrations', 'Priority support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 9900,
    billingCycle: 'monthly' as const,
    teamLimit: 25,
    storageLimitGb: 200,
    features: ['Up to 25 team members', 'Custom branding', 'Dedicated success'],
  },
];

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100
  );

const formatDate = (value: string | null) => {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleDateString();
};

function useStorageEstimate(orgId: string) {
  return useQuery({
    queryKey: ['billing', 'storage-estimate', orgId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('drawings')
        .select('*', { count: 'exact', head: true });
      if (error) throw new Error(error.message);
      return Number(((count ?? 0) * 0.05).toFixed(2));
    },
    enabled: !!orgId,
  });
}

function BillingSettingsForm({
  orgId,
  orgSettings,
  invoices,
  members,
  storageEstimate,
  storageLoading,
}: {
  orgId: string;
  orgSettings: OrgSettings | null;
  invoices: BillingInvoice[];
  members: Array<unknown>;
  storageEstimate: number;
  storageLoading: boolean;
}) {
  const updateOrgSettingsMutation = useUpdateOrgSettings();
  const createInvoiceMutation = useCreateBillingInvoice();

  const fallbackPlan = PLAN_OPTIONS[2];
  const selectedPlan = PLAN_OPTIONS.find((plan) => plan.name === orgSettings?.planName);
  const initialPlanId = selectedPlan?.id ?? fallbackPlan.id;

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBrand, setPaymentBrand] = useState(orgSettings?.paymentMethodBrand ?? '');
  const [paymentLast4, setPaymentLast4] = useState(orgSettings?.paymentMethodLast4 ?? '');
  const [paymentExpMonth, setPaymentExpMonth] = useState(
    orgSettings?.paymentMethodExpMonth?.toString() ?? ''
  );
  const [paymentExpYear, setPaymentExpYear] = useState(
    orgSettings?.paymentMethodExpYear?.toString() ?? ''
  );

  const [billingEmail, setBillingEmail] = useState(
    orgSettings?.billingContactEmail ?? ''
  );
  const [billingCompany, setBillingCompany] = useState(
    orgSettings?.billingCompanyName ?? ''
  );
  const [billingTaxId, setBillingTaxId] = useState(orgSettings?.billingTaxId ?? '');

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<BillingStatus>('paid');
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const currentPlan = useMemo(() => {
    return (
      PLAN_OPTIONS.find((plan) => plan.name === orgSettings?.planName) || fallbackPlan
    );
  }, [fallbackPlan, orgSettings?.planName]);

  const teamLimit = orgSettings?.planTeamLimit ?? currentPlan.teamLimit;
  const storageLimit = orgSettings?.planStorageLimitGb ?? currentPlan.storageLimitGb;
  const teamUsagePercent = Math.min(100, Math.round((members.length / teamLimit) * 100));
  const storageUsagePercent = Math.min(
    100,
    Math.round((storageEstimate / storageLimit) * 100)
  );

  const handlePlanSave = () => {
    const plan = PLAN_OPTIONS.find((option) => option.id === selectedPlanId);
    if (!plan) return;

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    updateOrgSettingsMutation.mutate({
      orgId,
      data: {
        planName: plan.name,
        planPriceCents: plan.priceCents,
        planBillingCycle: plan.billingCycle,
        planTeamLimit: plan.teamLimit,
        planStorageLimitGb: plan.storageLimitGb,
        planNextBillingDate: nextBillingDate.toISOString(),
      },
    });
    setShowPlanModal(false);
  };

  const handlePaymentSave = () => {
    updateOrgSettingsMutation.mutate({
      orgId,
      data: {
        paymentMethodBrand: paymentBrand.trim() || null,
        paymentMethodLast4: paymentLast4.trim() || null,
        paymentMethodExpMonth: paymentExpMonth ? Number(paymentExpMonth) : null,
        paymentMethodExpYear: paymentExpYear ? Number(paymentExpYear) : null,
      },
    });
    setShowPaymentModal(false);
  };

  const handleBillingContactSave = () => {
    updateOrgSettingsMutation.mutate({
      orgId,
      data: {
        billingContactEmail: billingEmail.trim() || null,
        billingCompanyName: billingCompany.trim() || null,
        billingTaxId: billingTaxId.trim() || null,
      },
    });
  };

  const handleCreateInvoice = () => {
    if (!invoiceDate || !invoiceDescription || !invoiceAmount) return;

    createInvoiceMutation.mutate(
      {
        orgId,
        data: {
          invoiceDate,
          description: invoiceDescription,
          amountCents: Math.round(Number(invoiceAmount) * 100),
          status: invoiceStatus,
          invoiceUrl: invoiceUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setInvoiceDate('');
          setInvoiceDescription('');
          setInvoiceAmount('');
          setInvoiceStatus('paid');
          setInvoiceUrl('');
          setShowInvoiceModal(false);
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Billing</h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage plan, payment method, and billing contacts
        </p>
      </div>

      {/* Current Plan */}
      <section className="settings-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-text-primary">Current Plan</h3>
            <p className="text-xs text-text-tertiary">Update your subscription plan</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowPlanModal(true)}>
            Change Plan
          </Button>
        </div>

        <div className="p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {currentPlan.name} Plan
              </p>
              <p className="text-sm text-text-secondary">
                {formatCurrency(currentPlan.priceCents)}/{currentPlan.billingCycle}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Next billing date: {formatDate(orgSettings?.planNextBillingDate ?? null)}
              </p>
            </div>
            <div className="text-right text-xs text-text-tertiary">
              <p>Team limit: {teamLimit}</p>
              <p>Storage limit: {storageLimit} GB</p>
            </div>
          </div>
          <ul className="mt-4 text-xs text-text-secondary space-y-1">
            {currentPlan.features.map((feature) => (
              <li key={feature}>- {feature}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Usage */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Usage</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>Team members</span>
              <span>
                {members.length} of {teamLimit} used
              </span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-accent-gold rounded-full"
                style={{ width: `${teamUsagePercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>Estimated storage</span>
              <span>
                {storageLoading ? 'Calculating...' : `${storageEstimate} GB`} of{' '}
                {storageLimit} GB
              </span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-accent-gold rounded-full"
                style={{ width: `${storageUsagePercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Payment Method */}
      <section className="settings-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-primary">Payment Method</h3>
          <Button variant="secondary" size="sm" onClick={() => setShowPaymentModal(true)}>
            {paymentLast4 ? 'Update' : 'Add'}
          </Button>
        </div>

        {paymentLast4 ? (
          <div className="p-4 bg-bg-secondary rounded-lg border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {paymentBrand || 'Card'} ending in {paymentLast4}
              </p>
              <p className="text-xs text-text-tertiary">
                Expires {paymentExpMonth}/{paymentExpYear}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">No payment method on file</p>
        )}
      </section>

      {/* Billing History */}
      <section className="settings-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-primary">Billing History</h3>
          <Button variant="secondary" size="sm" onClick={() => setShowInvoiceModal(true)}>
            Add Invoice
          </Button>
        </div>

        {invoices.length === 0 ? (
          <p className="text-sm text-text-tertiary">No invoices recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-tertiary border-b border-border">
                  <th className="text-left font-medium pb-2">Date</th>
                  <th className="text-left font-medium pb-2">Description</th>
                  <th className="text-left font-medium pb-2">Amount</th>
                  <th className="text-left font-medium pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: BillingInvoice) => (
                  <tr key={invoice.id} className="border-b border-border/50">
                    <td className="py-3 text-sm text-text-tertiary">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="py-3 text-sm text-text-primary">
                      {invoice.description}
                    </td>
                    <td className="py-3 text-sm text-text-secondary">
                      {formatCurrency(invoice.amountCents)}
                    </td>
                    <td className="py-3 text-sm text-text-secondary capitalize">
                      {invoice.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Billing Contact */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Billing Contact</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="billingEmail"
              className="block text-sm text-text-secondary mb-1"
            >
              Billing email
            </label>
            <input
              id="billingEmail"
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              className="settings-input"
            />
          </div>
          <div>
            <label
              htmlFor="billingCompany"
              className="block text-sm text-text-secondary mb-1"
            >
              Company name
            </label>
            <input
              id="billingCompany"
              type="text"
              value={billingCompany}
              onChange={(e) => setBillingCompany(e.target.value)}
              className="settings-input"
            />
          </div>
          <div>
            <label
              htmlFor="billingTaxId"
              className="block text-sm text-text-secondary mb-1"
            >
              Tax ID
            </label>
            <input
              id="billingTaxId"
              type="text"
              value={billingTaxId}
              onChange={(e) => setBillingTaxId(e.target.value)}
              className="settings-input"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleBillingContactSave}>Save Changes</Button>
        </div>
      </section>

      {/* Plan Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Select a Plan"
        description="Choose the plan that fits your team."
        size="lg"
      >
        <div className="space-y-3">
          {PLAN_OPTIONS.map((plan) => (
            <label
              key={plan.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                selectedPlanId === plan.id ? 'border-accent-gold' : 'border-border'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{plan.name}</p>
                <p className="text-xs text-text-tertiary">
                  {formatCurrency(plan.priceCents)}/{plan.billingCycle}
                </p>
              </div>
              <input
                type="radio"
                name="planSelect"
                value={plan.id}
                checked={selectedPlanId === plan.id}
                onChange={() => setSelectedPlanId(plan.id)}
                className="settings-radio"
              />
            </label>
          ))}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowPlanModal(false)}>
            Cancel
          </Button>
          <Button onClick={handlePlanSave}>Update Plan</Button>
        </ModalFooter>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Method"
        description="Save a card record for billing."
        size="sm"
      >
        <div className="space-y-3">
          <label htmlFor="paymentBrand" className="block text-sm text-text-secondary">
            Card brand
          </label>
          <input
            id="paymentBrand"
            type="text"
            value={paymentBrand}
            onChange={(e) => setPaymentBrand(e.target.value)}
            className="settings-input"
            placeholder="Visa"
          />

          <label htmlFor="paymentLast4" className="block text-sm text-text-secondary">
            Last 4 digits
          </label>
          <input
            id="paymentLast4"
            type="text"
            value={paymentLast4}
            onChange={(e) => setPaymentLast4(e.target.value)}
            className="settings-input"
            placeholder="4242"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="paymentExpMonth"
                className="block text-sm text-text-secondary"
              >
                Exp month
              </label>
              <input
                id="paymentExpMonth"
                type="text"
                value={paymentExpMonth}
                onChange={(e) => setPaymentExpMonth(e.target.value)}
                className="settings-input"
                placeholder="12"
              />
            </div>
            <div>
              <label
                htmlFor="paymentExpYear"
                className="block text-sm text-text-secondary"
              >
                Exp year
              </label>
              <input
                id="paymentExpYear"
                type="text"
                value={paymentExpYear}
                onChange={(e) => setPaymentExpYear(e.target.value)}
                className="settings-input"
                placeholder="2027"
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button onClick={handlePaymentSave}>Save Payment Method</Button>
        </ModalFooter>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Add Invoice"
        description="Record a billing history entry."
        size="sm"
      >
        <div className="space-y-3">
          <label htmlFor="invoiceDate" className="block text-sm text-text-secondary">
            Invoice date
          </label>
          <input
            id="invoiceDate"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="settings-input"
          />

          <label
            htmlFor="invoiceDescription"
            className="block text-sm text-text-secondary"
          >
            Description
          </label>
          <input
            id="invoiceDescription"
            type="text"
            value={invoiceDescription}
            onChange={(e) => setInvoiceDescription(e.target.value)}
            className="settings-input"
            placeholder="Team Plan (Monthly)"
          />

          <label htmlFor="invoiceAmount" className="block text-sm text-text-secondary">
            Amount
          </label>
          <input
            id="invoiceAmount"
            type="number"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(e.target.value)}
            className="settings-input"
            placeholder="49.00"
          />

          <label htmlFor="invoiceStatus" className="block text-sm text-text-secondary">
            Status
          </label>
          <select
            id="invoiceStatus"
            value={invoiceStatus}
            onChange={(e) => setInvoiceStatus(e.target.value as BillingStatus)}
            className="settings-select"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <label htmlFor="invoiceUrl" className="block text-sm text-text-secondary">
            Invoice URL (optional)
          </label>
          <input
            id="invoiceUrl"
            type="url"
            value={invoiceUrl}
            onChange={(e) => setInvoiceUrl(e.target.value)}
            className="settings-input"
            placeholder="https://billing.example.com/invoice"
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateInvoice}
            disabled={createInvoiceMutation.isPending}
          >
            {createInvoiceMutation.isPending ? 'Saving...' : 'Add Invoice'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export function BillingSettings({ orgId }: BillingSettingsProps) {
  const { data: orgSettings, isLoading } = useOrgSettings(orgId);
  const { data: invoices = [] } = useBillingInvoices(orgId);
  const { data: members = [] } = useOrganizationMembers(orgId);
  const storageQuery = useStorageEstimate(orgId);

  if (isLoading) {
    return <p className="text-sm text-text-tertiary">Loading billing settings...</p>;
  }

  return (
    <BillingSettingsForm
      key={orgSettings?.updatedAt ?? 'billing-default'}
      orgId={orgId}
      orgSettings={orgSettings ?? null}
      invoices={invoices}
      members={members}
      storageEstimate={storageQuery.data ?? 0}
      storageLoading={storageQuery.isLoading}
    />
  );
}
