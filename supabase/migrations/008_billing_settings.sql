-- 008_billing_settings.sql
-- Billing settings and invoice history

SET search_path = public, extensions;

ALTER TABLE public.org_settings
  ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'Starter',
  ADD COLUMN IF NOT EXISTS plan_price_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plan_billing_cycle TEXT DEFAULT 'monthly' CHECK (plan_billing_cycle IN ('monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS plan_next_billing_date DATE,
  ADD COLUMN IF NOT EXISTS plan_team_limit INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS plan_storage_limit_gb INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS billing_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS billing_company_name TEXT,
  ADD COLUMN IF NOT EXISTS billing_tax_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_brand TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_last4 TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_exp_month INTEGER,
  ADD COLUMN IF NOT EXISTS payment_method_exp_year INTEGER;

CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
  invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_org_id ON public.billing_invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_date ON public.billing_invoices(invoice_date DESC);

ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view invoices"
  ON public.billing_invoices FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage invoices"
  ON public.billing_invoices FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
