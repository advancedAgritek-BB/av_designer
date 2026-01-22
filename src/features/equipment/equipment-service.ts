import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import type { Equipment, EquipmentCategory, EquipmentFormData } from '@/types/equipment';

/**
 * Database row type matching actual Supabase schema
 */
interface EquipmentDbRow {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  cost_cents: number;
  msrp_cents: number;
  dimensions: { height: number; width: number; depth: number };
  weight_lbs: number | null;
  electrical: {
    voltage?: number;
    wattage?: number;
    amperage?: number;
    poeClass?: string;
    btuOutput?: number;
  } | null;
  platform_certifications: string[] | null;
  image_url: string | null;
  spec_sheet_url: string | null;
  pricing: unknown;
  specifications: unknown;
  compatibility: unknown;
  organization_id: string | null;
  is_active: boolean;
  preferred_pricing_index: number;
  created_at: string;
  updated_at: string;
}

/**
 * Service for equipment CRUD operations via Supabase
 */
export class EquipmentService {
  private readonly table = 'equipment';

  /**
   * Fetch all equipment ordered by manufacturer
   */
  async getAll(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('manufacturer', { ascending: true });

    if (error) throw error;
    return this.mapRows((data as unknown as EquipmentDbRow[]) || []);
  }

  /**
   * Fetch equipment by category
   */
  async getByCategory(category: EquipmentCategory): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('category', category)
      .order('manufacturer', { ascending: true });

    if (error) throw error;
    return this.mapRows((data as unknown as EquipmentDbRow[]) || []);
  }

  /**
   * Fetch single equipment by ID
   */
  async getById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 = no rows returned
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapRow(data as unknown as EquipmentDbRow);
  }

  /**
   * Search equipment by manufacturer, model, or description
   */
  async search(query: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .or(
        `manufacturer.ilike.%${query}%,model.ilike.%${query}%,description.ilike.%${query}%`
      )
      .limit(50);

    if (error) throw error;
    return this.mapRows((data as unknown as EquipmentDbRow[]) || []);
  }

  /**
   * Create new equipment
   */
  async create(formData: EquipmentFormData): Promise<Equipment> {
    const insertData = {
      manufacturer: formData.manufacturer,
      model: formData.model,
      sku: formData.sku,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      cost_cents: Math.round(formData.cost * 100),
      msrp_cents: Math.round(formData.msrp * 100),
      dimensions: formData.dimensions as unknown as Json,
      weight_lbs: formData.weight,
      electrical: (formData.electrical ?? null) as unknown as Json,
      platform_certifications: formData.platformCertifications,
    };

    const { data, error } = await supabase
      .from(this.table)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as unknown as EquipmentDbRow);
  }

  /**
   * Update existing equipment
   */
  async update(id: string, formData: Partial<EquipmentFormData>): Promise<Equipment> {
    const updateData: Record<string, unknown> = {};

    if (formData.manufacturer !== undefined)
      updateData.manufacturer = formData.manufacturer;
    if (formData.model !== undefined) updateData.model = formData.model;
    if (formData.sku !== undefined) updateData.sku = formData.sku;
    if (formData.category !== undefined) updateData.category = formData.category;
    if (formData.subcategory !== undefined) updateData.subcategory = formData.subcategory;
    if (formData.description !== undefined) updateData.description = formData.description;
    if (formData.cost !== undefined) updateData.cost_cents = Math.round(formData.cost * 100);
    if (formData.msrp !== undefined) updateData.msrp_cents = Math.round(formData.msrp * 100);
    if (formData.dimensions !== undefined) updateData.dimensions = formData.dimensions;
    if (formData.weight !== undefined) updateData.weight_lbs = formData.weight;
    if (formData.electrical !== undefined) updateData.electrical = formData.electrical;
    if (formData.platformCertifications !== undefined) {
      updateData.platform_certifications = formData.platformCertifications;
    }

    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as unknown as EquipmentDbRow);
  }

  /**
   * Delete equipment by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Find equipment by manufacturer and SKU within an organization
   */
  async findByManufacturerSku(
    organizationId: string,
    manufacturer: string,
    sku: string
  ): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('organization_id', organizationId)
      .eq('manufacturer', manufacturer)
      .eq('sku', sku)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapRow(data as unknown as EquipmentDbRow);
  }

  /**
   * Add distributor pricing to an equipment item (stub - updates pricing field)
   */
  async addPricing(
    _equipmentId: string,
    _pricing: { distributor: string; cost: number; msrp: number }
  ): Promise<void> {
    // TODO: Implement pricing update when pricing schema is finalized
    // For now, this is a stub to allow imports to proceed
  }

  /**
   * Map multiple database rows to Equipment objects
   */
  private mapRows(rows: EquipmentDbRow[]): Equipment[] {
    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Map single database row (snake_case) to Equipment object (camelCase)
   * Converts cents to dollars for cost/msrp
   */
  private mapRow(row: EquipmentDbRow): Equipment {
    return {
      id: row.id,
      manufacturer: row.manufacturer,
      model: row.model,
      sku: row.sku,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      cost: row.cost_cents / 100,
      msrp: row.msrp_cents / 100,
      dimensions: row.dimensions,
      weight: row.weight_lbs ?? 0,
      electrical: row.electrical ?? undefined,
      platformCertifications: row.platform_certifications ?? undefined,
      imageUrl: row.image_url ?? undefined,
      specSheetUrl: row.spec_sheet_url ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * Singleton instance of EquipmentService
 */
export const equipmentService = new EquipmentService();
