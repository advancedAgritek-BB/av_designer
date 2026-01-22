/**
 * Client Service - Handles all client CRUD operations with Supabase
 */

import { supabase } from '@/lib/supabase';
import type {
  Client,
  ClientContact,
  ClientPriceBookEntry,
  CreateClientData,
  UpdateClientData,
  CreateContactData,
  UpdateContactData,
  CreatePriceBookEntryData,
  ClientRow,
  ClientContactRow,
  ClientPriceBookRow,
} from './client-types';

// ============================================================================
// Type Mappers
// ============================================================================

function mapClientFromDb(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    industry: row.industry,
    website: row.website,
    logoUrl: row.logo_url,
    address: row.address || {},
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    billingTerms: row.billing_terms,
    taxExempt: row.tax_exempt,
    taxExemptId: row.tax_exempt_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

function mapContactFromDb(row: ClientContactRow): ClientContact {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    title: row.title,
    email: row.email,
    phone: row.phone,
    mobile: row.mobile,
    tags: row.tags || [],
    notes: row.notes,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPriceBookFromDb(row: ClientPriceBookRow): ClientPriceBookEntry {
  return {
    id: row.id,
    clientId: row.client_id,
    equipmentId: row.equipment_id,
    overridePriceCents: row.override_price_cents,
    discountPercent: row.discount_percent,
    effectiveDate: row.effective_date,
    expirationDate: row.expiration_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Client Service
// ============================================================================

export class ClientService {
  /**
   * Get all clients ordered by name
   */
  static async getAll(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*').order('name');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapClientFromDb(row as ClientRow));
  }

  /**
   * Search clients by name, industry, or contact details.
   */
  static async search(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(
        `name.ilike.%${query}%,industry.ilike.%${query}%,contact_name.ilike.%${query}%,contact_email.ilike.%${query}%`
      )
      .order('name')
      .limit(50);

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapClientFromDb(row as ClientRow));
  }

  /**
   * Get top-level clients (no parent)
   */
  static async getTopLevelClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .is('parent_id', null)
      .order('name');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapClientFromDb(row as ClientRow));
  }

  /**
   * Get clients by parent ID (subsidiaries)
   */
  static async getChildren(parentId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('parent_id', parentId)
      .order('name');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapClientFromDb(row as ClientRow));
  }

  /**
   * Get a single client by ID
   */
  static async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return mapClientFromDb(data as ClientRow);
  }

  /**
   * Create a new client
   */
  static async create(data: CreateClientData, userId: string): Promise<Client> {
    const insertData = {
      name: data.name,
      parent_id: data.parentId,
      industry: data.industry,
      website: data.website,
      address: (data.address || {}) as Record<string, string>,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      billing_terms: data.billingTerms || 'Net 30',
      tax_exempt: data.taxExempt || false,
      notes: data.notes,
      created_by: userId,
    };

    const { data: client, error } = await supabase
      .from('clients')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapClientFromDb(client as ClientRow);
  }

  /**
   * Update an existing client
   */
  static async update(id: string, data: UpdateClientData): Promise<Client> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.parentId !== undefined) updateData.parent_id = data.parentId;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
    if (data.address !== undefined)
      updateData.address = data.address as Record<string, string>;
    if (data.contactName !== undefined) updateData.contact_name = data.contactName;
    if (data.contactEmail !== undefined) updateData.contact_email = data.contactEmail;
    if (data.contactPhone !== undefined) updateData.contact_phone = data.contactPhone;
    if (data.billingTerms !== undefined) updateData.billing_terms = data.billingTerms;
    if (data.taxExempt !== undefined) updateData.tax_exempt = data.taxExempt;
    if (data.taxExemptId !== undefined) updateData.tax_exempt_id = data.taxExemptId;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapClientFromDb(client as ClientRow);
  }

  /**
   * Delete a client
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ============================================================================
  // Contact Operations
  // ============================================================================

  /**
   * Get all contacts for a client
   */
  static async getContacts(clientId: string): Promise<ClientContact[]> {
    const { data, error } = await supabase
      .from('client_contacts')
      .select('*')
      .eq('client_id', clientId)
      .order('is_primary', { ascending: false })
      .order('name');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapContactFromDb(row as ClientContactRow));
  }

  /**
   * Create a new contact
   */
  static async createContact(data: CreateContactData): Promise<ClientContact> {
    const insertData = {
      client_id: data.clientId,
      name: data.name,
      title: data.title,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      tags: data.tags || [],
      notes: data.notes,
      is_primary: data.isPrimary || false,
    };

    const { data: contact, error } = await supabase
      .from('client_contacts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapContactFromDb(contact as ClientContactRow);
  }

  /**
   * Update an existing contact
   */
  static async updateContact(
    id: string,
    data: UpdateContactData
  ): Promise<ClientContact> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.isPrimary !== undefined) updateData.is_primary = data.isPrimary;

    const { data: contact, error } = await supabase
      .from('client_contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapContactFromDb(contact as ClientContactRow);
  }

  /**
   * Delete a contact
   */
  static async deleteContact(id: string): Promise<void> {
    const { error } = await supabase.from('client_contacts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ============================================================================
  // Price Book Operations
  // ============================================================================

  /**
   * Get price book entries for a client
   */
  static async getPriceBook(clientId: string): Promise<ClientPriceBookEntry[]> {
    const { data, error } = await supabase
      .from('client_price_book')
      .select('*')
      .eq('client_id', clientId)
      .order('effective_date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapPriceBookFromDb(row as ClientPriceBookRow));
  }

  /**
   * Create a price book entry
   */
  static async createPriceBookEntry(
    data: CreatePriceBookEntryData
  ): Promise<ClientPriceBookEntry> {
    const insertData = {
      client_id: data.clientId,
      equipment_id: data.equipmentId,
      override_price_cents: data.overridePriceCents,
      discount_percent: data.discountPercent,
      effective_date: data.effectiveDate,
      expiration_date: data.expirationDate,
      notes: data.notes,
    };

    const { data: entry, error } = await supabase
      .from('client_price_book')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPriceBookFromDb(entry as ClientPriceBookRow);
  }

  /**
   * Delete a price book entry
   */
  static async deletePriceBookEntry(id: string): Promise<void> {
    const { error } = await supabase.from('client_price_book').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
