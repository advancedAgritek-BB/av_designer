import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import type {
  Room,
  RoomFormData,
  PlacedEquipment,
  RoomType,
  Platform,
  Ecosystem,
  QualityTier,
  MountType,
} from '@/types/room';

/**
 * Database row type for placed equipment with snake_case columns
 */
interface PlacedEquipmentDbRow {
  id: string;
  equipment_id: string;
  x: number;
  y: number;
  rotation: number;
  mount_type: MountType;
  configuration?: Record<string, unknown>;
}

/**
 * Database row type with snake_case columns
 * Note: placed_equipment is Json in DB, we cast it to our typed array
 */
interface RoomDbRow {
  id: string;
  project_id: string;
  name: string;
  room_type: RoomType;
  width: number;
  length: number;
  ceiling_height: number;
  platform: Platform | null;
  ecosystem: Ecosystem | null;
  tier: QualityTier | null;
  placed_equipment: Json; // JSONB in database
  notes: string | null;
  location_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Service for room CRUD operations via Supabase
 */
export class RoomService {
  private readonly table = 'rooms';

  /**
   * Fetch all rooms ordered by name
   */
  async getAll(): Promise<Room[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return this.mapRows((data as unknown as RoomDbRow[]) || []);
  }

  /**
   * Fetch rooms by project ID
   */
  async getByProject(projectId: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (error) throw error;
    return this.mapRows((data as unknown as RoomDbRow[]) || []);
  }

  /**
   * Fetch single room by ID
   */
  async getById(id: string): Promise<Room | null> {
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
    return this.mapRow(data as unknown as RoomDbRow);
  }

  /**
   * Create new room
   */
  async create(projectId: string, formData: RoomFormData): Promise<Room> {
    // Map 'generic' platform to 'none' for database compatibility
    const dbPlatform = formData.platform === 'generic' ? 'none' : formData.platform;

    const insertData = {
      project_id: projectId,
      name: formData.name,
      room_type: formData.roomType,
      width: formData.width,
      length: formData.length,
      ceiling_height: formData.ceilingHeight,
      platform: dbPlatform as 'teams' | 'zoom' | 'webex' | 'meet' | 'multi' | 'none',
      ecosystem: formData.ecosystem,
      tier: formData.tier,
      placed_equipment: [],
    };

    const { data, error } = await supabase
      .from(this.table)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as unknown as RoomDbRow);
  }

  /**
   * Update existing room
   */
  async update(id: string, formData: Partial<RoomFormData>): Promise<Room> {
    const updateData: Record<string, unknown> = {};

    if (formData.name !== undefined) updateData.name = formData.name;
    if (formData.roomType !== undefined) updateData.room_type = formData.roomType;
    if (formData.width !== undefined) updateData.width = formData.width;
    if (formData.length !== undefined) updateData.length = formData.length;
    if (formData.ceilingHeight !== undefined)
      updateData.ceiling_height = formData.ceilingHeight;
    if (formData.platform !== undefined) updateData.platform = formData.platform;
    if (formData.ecosystem !== undefined) updateData.ecosystem = formData.ecosystem;
    if (formData.tier !== undefined) updateData.tier = formData.tier;

    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as unknown as RoomDbRow);
  }

  /**
   * Delete room by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Add placed equipment to room
   */
  async addPlacedEquipment(roomId: string, equipment: PlacedEquipment): Promise<Room> {
    const room = await this.getById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const newEquipment: PlacedEquipmentDbRow = {
      id: equipment.id,
      equipment_id: equipment.equipmentId,
      x: equipment.x,
      y: equipment.y,
      rotation: equipment.rotation,
      mount_type: equipment.mountType,
      configuration: equipment.configuration,
    };

    const currentEquipment = room.placedEquipment.map((pe) =>
      this.mapPlacedEquipmentToDb(pe)
    );
    const updatedEquipment = [...currentEquipment, newEquipment];

    const { data, error } = await supabase
      .from(this.table)
      .update({ placed_equipment: updatedEquipment as unknown as Json })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as unknown as RoomDbRow);
  }

  /**
   * Remove placed equipment from room
   */
  async removePlacedEquipment(roomId: string, placedEquipmentId: string): Promise<Room> {
    const room = await this.getById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const existingIndex = room.placedEquipment.findIndex(
      (pe) => pe.id === placedEquipmentId
    );
    if (existingIndex === -1) {
      throw new Error('Placed equipment not found');
    }

    const updatedEquipment = room.placedEquipment
      .filter((pe) => pe.id !== placedEquipmentId)
      .map((pe) => this.mapPlacedEquipmentToDb(pe));

    const { data, error } = await supabase
      .from(this.table)
      .update({ placed_equipment: updatedEquipment as unknown as Json })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as unknown as RoomDbRow);
  }

  /**
   * Update placed equipment position/rotation in room
   */
  async updatePlacedEquipment(
    roomId: string,
    placedEquipmentId: string,
    updates: Partial<Omit<PlacedEquipment, 'id' | 'equipmentId'>>
  ): Promise<Room> {
    const room = await this.getById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const existingIndex = room.placedEquipment.findIndex(
      (pe) => pe.id === placedEquipmentId
    );
    if (existingIndex === -1) {
      throw new Error('Placed equipment not found');
    }

    const updatedEquipment = room.placedEquipment.map((pe) => {
      if (pe.id === placedEquipmentId) {
        return this.mapPlacedEquipmentToDb({
          ...pe,
          ...updates,
        });
      }
      return this.mapPlacedEquipmentToDb(pe);
    });

    const { data, error } = await supabase
      .from(this.table)
      .update({ placed_equipment: updatedEquipment as unknown as Json })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as unknown as RoomDbRow);
  }

  /**
   * Set all placed equipment for a room (replaces existing)
   */
  async setPlacedEquipment(roomId: string, equipment: PlacedEquipment[]): Promise<Room> {
    const dbEquipment = equipment.map((pe) => this.mapPlacedEquipmentToDb(pe));

    const { data, error } = await supabase
      .from(this.table)
      .update({ placed_equipment: dbEquipment as unknown as Json })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as unknown as RoomDbRow);
  }

  /**
   * Map multiple database rows to Room objects
   */
  private mapRows(rows: RoomDbRow[]): Room[] {
    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Map single database row (snake_case) to Room object (camelCase)
   */
  private mapRow(row: RoomDbRow): Room {
    // Cast placed_equipment from Json to typed array
    const placedEquipmentArray = (row.placed_equipment || []) as unknown as PlacedEquipmentDbRow[];

    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      roomType: row.room_type,
      width: row.width,
      length: row.length,
      ceilingHeight: row.ceiling_height,
      platform: row.platform ?? 'generic',
      ecosystem: row.ecosystem ?? 'mixed',
      tier: row.tier ?? 'standard',
      placedEquipment: placedEquipmentArray.map((pe) =>
        this.mapPlacedEquipment(pe)
      ),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Map placed equipment from database format to camelCase
   */
  private mapPlacedEquipment(pe: PlacedEquipmentDbRow): PlacedEquipment {
    return {
      id: pe.id,
      equipmentId: pe.equipment_id,
      x: pe.x,
      y: pe.y,
      rotation: pe.rotation,
      mountType: pe.mount_type,
      configuration: pe.configuration,
    };
  }

  /**
   * Map placed equipment to database format (snake_case)
   */
  private mapPlacedEquipmentToDb(pe: PlacedEquipment): PlacedEquipmentDbRow {
    return {
      id: pe.id,
      equipment_id: pe.equipmentId,
      x: pe.x,
      y: pe.y,
      rotation: pe.rotation,
      mount_type: pe.mountType,
      configuration: pe.configuration,
    };
  }
}

/**
 * Singleton instance of RoomService
 */
export const roomService = new RoomService();
