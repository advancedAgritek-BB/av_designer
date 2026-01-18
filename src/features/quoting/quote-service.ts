/**
 * Quote Service
 *
 * CRUD operations for quotes via Supabase, including
 * section and item management with proper snake_case/camelCase mapping.
 */

import { supabase } from '@/lib/supabase';
import type {
  Quote,
  QuoteSection,
  QuoteItem,
  QuoteTotals,
  QuoteStatus,
  ItemStatus,
} from '@/types/quote';

// ============================================================================
// Database Row Types (snake_case)
// ============================================================================

interface QuoteItemDbRow {
  id: string;
  equipment_id: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  margin: number;
  total: number;
  status: ItemStatus;
  notes?: string;
}

interface QuoteSectionDbRow {
  id: string;
  name: string;
  category: string;
  items: QuoteItemDbRow[];
  subtotal: number;
}

interface QuoteTotalsDbRow {
  equipment: number;
  labor: number;
  subtotal: number;
  tax: number;
  total: number;
  margin: number;
  margin_percentage: number;
}

interface QuoteDbRow {
  id: string;
  project_id: string;
  room_id: string;
  version: number;
  status: QuoteStatus;
  sections: QuoteSectionDbRow[] | null;
  totals: QuoteTotalsDbRow | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Create Input Type
// ============================================================================

export interface CreateQuoteInput {
  projectId: string;
  roomId: string;
  version: number;
  status: QuoteStatus;
  sections: QuoteSection[];
  totals: QuoteTotals;
}

// ============================================================================
// Quote Service
// ============================================================================

export class QuoteService {
  private readonly table = 'quotes';

  /**
   * Fetch all quotes ordered by updated_at descending
   */
  async getAll(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return this.mapRows((data as QuoteDbRow[] | null) || []);
  }

  /**
   * Fetch quotes by project ID
   */
  async getByProject(projectId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return this.mapRows((data as QuoteDbRow[] | null) || []);
  }

  /**
   * Fetch quotes by room ID
   */
  async getByRoom(roomId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('room_id', roomId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return this.mapRows((data as QuoteDbRow[] | null) || []);
  }

  /**
   * Fetch quote by ID
   */
  async getById(id: string): Promise<Quote | null> {
    const { data, error } = await supabase.from(this.table).select('*').eq('id', id).single();

    if (error) throw error;
    if (!data) return null;
    return this.mapRow(data as QuoteDbRow);
  }

  /**
   * Create a new quote
   */
  async create(input: CreateQuoteInput): Promise<Quote> {
    const dbInput = this.toDbRow(input);
    const { data, error } = await supabase.from(this.table).insert(dbInput).select().single();

    if (error) throw error;
    return this.mapRow(data as QuoteDbRow);
  }

  /**
   * Update an existing quote
   */
  async update(id: string, updates: Partial<Quote>): Promise<Quote> {
    const dbUpdates = this.toDbUpdates(updates);
    const { data, error } = await supabase
      .from(this.table)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as QuoteDbRow);
  }

  /**
   * Delete a quote
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);

    if (error) throw error;
  }

  // ==========================================================================
  // Private Methods - Row Mapping
  // ==========================================================================

  private mapRows(rows: QuoteDbRow[]): Quote[] {
    return rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: QuoteDbRow): Quote {
    return {
      id: row.id,
      projectId: row.project_id,
      roomId: row.room_id,
      version: row.version,
      status: row.status,
      sections: this.mapSections(row.sections),
      totals: this.mapTotals(row.totals),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapSections(sections: QuoteSectionDbRow[] | null): QuoteSection[] {
    if (!sections) return [];
    return sections.map((section) => ({
      id: section.id,
      name: section.name,
      category: section.category,
      items: this.mapItems(section.items),
      subtotal: section.subtotal,
    }));
  }

  private mapItems(items: QuoteItemDbRow[] | undefined): QuoteItem[] {
    if (!items) return [];
    return items.map((item) => ({
      id: item.id,
      equipmentId: item.equipment_id,
      quantity: item.quantity,
      unitCost: item.unit_cost,
      unitPrice: item.unit_price,
      margin: item.margin,
      total: item.total,
      status: item.status,
      ...(item.notes && { notes: item.notes }),
    }));
  }

  private mapTotals(totals: QuoteTotalsDbRow | null): QuoteTotals {
    if (!totals) {
      return {
        equipment: 0,
        labor: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        margin: 0,
        marginPercentage: 0,
      };
    }
    return {
      equipment: totals.equipment,
      labor: totals.labor,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      margin: totals.margin,
      marginPercentage: totals.margin_percentage,
    };
  }

  // ==========================================================================
  // Private Methods - To DB Conversion
  // ==========================================================================

  private toDbRow(input: CreateQuoteInput): Omit<QuoteDbRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      project_id: input.projectId,
      room_id: input.roomId,
      version: input.version,
      status: input.status,
      sections: this.sectionsToDb(input.sections),
      totals: this.totalsToDb(input.totals),
    };
  }

  private toDbUpdates(updates: Partial<Quote>): Record<string, unknown> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
    if (updates.roomId !== undefined) dbUpdates.room_id = updates.roomId;
    if (updates.version !== undefined) dbUpdates.version = updates.version;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.sections !== undefined) dbUpdates.sections = this.sectionsToDb(updates.sections);
    if (updates.totals !== undefined) dbUpdates.totals = this.totalsToDb(updates.totals);

    return dbUpdates;
  }

  private sectionsToDb(sections: QuoteSection[]): QuoteSectionDbRow[] {
    return sections.map((section) => ({
      id: section.id,
      name: section.name,
      category: section.category,
      items: this.itemsToDb(section.items),
      subtotal: section.subtotal,
    }));
  }

  private itemsToDb(items: QuoteItem[]): QuoteItemDbRow[] {
    return items.map((item) => ({
      id: item.id,
      equipment_id: item.equipmentId,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      unit_price: item.unitPrice,
      margin: item.margin,
      total: item.total,
      status: item.status,
      ...(item.notes && { notes: item.notes }),
    }));
  }

  private totalsToDb(totals: QuoteTotals): QuoteTotalsDbRow {
    return {
      equipment: totals.equipment,
      labor: totals.labor,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      margin: totals.margin,
      margin_percentage: totals.marginPercentage,
    };
  }
}

// Export singleton instance
export const quoteService = new QuoteService();
