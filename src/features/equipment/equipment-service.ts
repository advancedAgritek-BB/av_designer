import { supabase } from '@/lib/supabase';
import type { Equipment, EquipmentCategory, EquipmentFormData } from '@/types/equipment';

/**
 * Database row type with snake_case columns
 */
interface EquipmentDbRow {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: EquipmentCategory;
  subcategory: string;
  description: string;
  cost: number;
  msrp: number;
  dimensions: { height: number; width: number; depth: number };
  weight: number;
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
    return this.mapRows((data as EquipmentDbRow[] | null) || []);
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
    return this.mapRows((data as EquipmentDbRow[] | null) || []);
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
    return this.mapRow(data as EquipmentDbRow);
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
    return this.mapRows((data as EquipmentDbRow[] | null) || []);
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
      cost: formData.cost,
      msrp: formData.msrp,
      dimensions: formData.dimensions,
      weight: formData.weight,
      electrical: formData.electrical,
      platform_certifications: formData.platformCertifications,
    };

    const { data, error } = await supabase
      .from(this.table)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as EquipmentDbRow);
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
    if (formData.cost !== undefined) updateData.cost = formData.cost;
    if (formData.msrp !== undefined) updateData.msrp = formData.msrp;
    if (formData.dimensions !== undefined) updateData.dimensions = formData.dimensions;
    if (formData.weight !== undefined) updateData.weight = formData.weight;
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
    return this.mapRow(data as EquipmentDbRow);
  }

  /**
   * Delete equipment by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Map multiple database rows to Equipment objects
   */
  private mapRows(rows: EquipmentDbRow[]): Equipment[] {
    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Map single database row (snake_case) to Equipment object (camelCase)
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
      cost: row.cost,
      msrp: row.msrp,
      dimensions: row.dimensions,
      weight: row.weight,
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
