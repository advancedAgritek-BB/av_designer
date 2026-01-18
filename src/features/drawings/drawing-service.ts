import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import type {
  Drawing,
  DrawingLayer,
  DrawingElement,
  DrawingOverride,
  DrawingType,
  LayerType,
  ElementType,
} from '@/types/drawing';

/**
 * Database row type for drawing elements
 */
interface DrawingElementDbRow {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, unknown>;
}

/**
 * Database row type for drawing layers with snake_case columns
 */
interface DrawingLayerDbRow {
  id: string;
  name: string;
  type: LayerType;
  is_locked: boolean;
  is_visible: boolean;
  elements: DrawingElementDbRow[];
}

/**
 * Database row type for drawing overrides with snake_case columns
 */
interface DrawingOverrideDbRow {
  element_id: string;
  field: string;
  original_value: unknown;
  new_value: unknown;
  created_at: string;
}

/**
 * Database row type with snake_case columns
 */
interface DrawingDbRow {
  id: string;
  room_id: string;
  type: DrawingType;
  layers: DrawingLayerDbRow[] | null;
  overrides: DrawingOverrideDbRow[] | null;
  generated_at: string;
}

/**
 * Service for drawing CRUD operations via Supabase
 */
export class DrawingService {
  private readonly table = 'drawings';

  /**
   * Fetch all drawings ordered by generated_at descending
   */
  async getAll(): Promise<Drawing[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return this.mapRows((data as DrawingDbRow[] | null) || []);
  }

  /**
   * Fetch drawings by room ID
   */
  async getByRoom(roomId: string): Promise<Drawing[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('room_id', roomId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return this.mapRows((data as DrawingDbRow[] | null) || []);
  }

  /**
   * Fetch drawings by type
   */
  async getByType(type: DrawingType): Promise<Drawing[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('type', type)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return this.mapRows((data as DrawingDbRow[] | null) || []);
  }

  /**
   * Fetch single drawing by ID
   */
  async getById(id: string): Promise<Drawing | null> {
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
    return this.mapRow(data as DrawingDbRow);
  }

  /**
   * Create new drawing
   */
  async create(
    roomId: string,
    type: DrawingType,
    layers?: DrawingLayer[]
  ): Promise<Drawing> {
    const insertData = {
      room_id: roomId,
      type,
      layers: (layers ? this.mapLayersToDb(layers) : []) as unknown as Json,
      overrides: [] as unknown as Json,
      generated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(this.table)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as DrawingDbRow);
  }

  /**
   * Update existing drawing
   */
  async update(
    id: string,
    updates: Partial<{
      type: DrawingType;
      layers: DrawingLayer[];
      overrides: DrawingOverride[];
    }>
  ): Promise<Drawing> {
    const updateData: {
      type?: DrawingType;
      layers?: Json;
      overrides?: Json;
    } = {};

    if (updates.type !== undefined) {
      updateData.type = updates.type;
    }
    if (updates.layers !== undefined) {
      updateData.layers = this.mapLayersToDb(updates.layers) as unknown as Json;
    }
    if (updates.overrides !== undefined) {
      updateData.overrides = this.mapOverridesToDb(updates.overrides) as unknown as Json;
    }

    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as DrawingDbRow);
  }

  /**
   * Delete drawing by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Map multiple database rows to Drawing objects
   */
  private mapRows(rows: DrawingDbRow[]): Drawing[] {
    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Map single database row (snake_case) to Drawing object (camelCase)
   */
  private mapRow(row: DrawingDbRow): Drawing {
    return {
      id: row.id,
      roomId: row.room_id,
      type: row.type,
      layers: this.mapLayers(row.layers || []),
      overrides: this.mapOverrides(row.overrides || []),
      generatedAt: row.generated_at,
    };
  }

  /**
   * Map layers from database format to camelCase
   */
  private mapLayers(layers: DrawingLayerDbRow[]): DrawingLayer[] {
    return layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      type: layer.type,
      isLocked: layer.is_locked,
      isVisible: layer.is_visible,
      elements: this.mapElements(layer.elements || []),
    }));
  }

  /**
   * Map elements from database format (already camelCase in DB)
   */
  private mapElements(elements: DrawingElementDbRow[]): DrawingElement[] {
    return elements.map((element) => ({
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      rotation: element.rotation,
      properties: element.properties,
    }));
  }

  /**
   * Map overrides from database format to camelCase
   */
  private mapOverrides(overrides: DrawingOverrideDbRow[]): DrawingOverride[] {
    return overrides.map((override) => ({
      elementId: override.element_id,
      field: override.field,
      originalValue: override.original_value,
      newValue: override.new_value,
      createdAt: override.created_at,
    }));
  }

  /**
   * Map layers to database format (snake_case)
   */
  private mapLayersToDb(layers: DrawingLayer[]): DrawingLayerDbRow[] {
    return layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      type: layer.type,
      is_locked: layer.isLocked,
      is_visible: layer.isVisible,
      elements: this.mapElementsToDb(layer.elements),
    }));
  }

  /**
   * Map elements to database format (stays same)
   */
  private mapElementsToDb(elements: DrawingElement[]): DrawingElementDbRow[] {
    return elements.map((element) => ({
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      rotation: element.rotation,
      properties: element.properties as Record<string, unknown>,
    }));
  }

  /**
   * Map overrides to database format (snake_case)
   */
  private mapOverridesToDb(overrides: DrawingOverride[]): DrawingOverrideDbRow[] {
    return overrides.map((override) => ({
      element_id: override.elementId,
      field: override.field,
      original_value: override.originalValue,
      new_value: override.newValue,
      created_at: override.createdAt,
    }));
  }
}

/**
 * Singleton instance of DrawingService
 */
export const drawingService = new DrawingService();
