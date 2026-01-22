/**
 * Client Types
 */

import type { UUID } from '@/types';

// ============================================================================
// Client Types
// ============================================================================

export interface Client {
  id: UUID;
  name: string;
  parentId: UUID | null;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  address: ClientAddress;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  billingTerms: string;
  taxExempt: boolean;
  taxExemptId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: UUID | null;
}

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface ClientContact {
  id: UUID;
  clientId: UUID;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  tags: string[];
  notes: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPriceBookEntry {
  id: UUID;
  clientId: UUID;
  equipmentId: UUID;
  overridePriceCents: number | null;
  discountPercent: number | null;
  effectiveDate: string;
  expirationDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Client with Relations
// ============================================================================

export interface ClientWithContacts extends Client {
  contacts: ClientContact[];
}

export interface ClientWithChildren extends Client {
  children: Client[];
}

export interface ClientFull extends Client {
  contacts: ClientContact[];
  children: Client[];
  priceBook: ClientPriceBookEntry[];
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface CreateClientData {
  name: string;
  parentId?: UUID;
  industry?: string;
  website?: string;
  address?: ClientAddress;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingTerms?: string;
  taxExempt?: boolean;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  parentId?: UUID | null;
  industry?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  address?: ClientAddress;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  billingTerms?: string;
  taxExempt?: boolean;
  taxExemptId?: string | null;
  notes?: string | null;
}

export interface CreateContactData {
  clientId: UUID;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  tags?: string[];
  notes?: string;
  isPrimary?: boolean;
}

export interface UpdateContactData {
  name?: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  tags?: string[];
  notes?: string | null;
  isPrimary?: boolean;
}

export interface CreatePriceBookEntryData {
  clientId: UUID;
  equipmentId: UUID;
  overridePriceCents?: number;
  discountPercent?: number;
  effectiveDate: string;
  expirationDate?: string;
  notes?: string;
}

// ============================================================================
// Database Row Types (for mapping from Supabase)
// ============================================================================

export interface ClientRow {
  id: string;
  name: string;
  parent_id: string | null;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
  address: Record<string, string>;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  billing_terms: string;
  tax_exempt: boolean;
  tax_exempt_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ClientContactRow {
  id: string;
  client_id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  tags: string[];
  notes: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPriceBookRow {
  id: string;
  client_id: string;
  equipment_id: string;
  override_price_cents: number | null;
  discount_percent: number | null;
  effective_date: string;
  expiration_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
