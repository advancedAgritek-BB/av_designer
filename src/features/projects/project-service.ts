import { supabase } from '@/lib/supabase';
import type { Project, ProjectStatus, UUID } from '@/types';

/**
 * Form data for creating/updating projects
 */
export interface ProjectFormData {
  name: string;
  clientId?: UUID | null;
  clientName: string;
  status?: ProjectStatus;
  description?: string;
}

/**
 * Database row type with snake_case columns
 */
interface ProjectDbRow {
  id: string;
  name: string;
  client_id: string | null;
  client_name: string;
  status: ProjectStatus;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service for project CRUD operations via Supabase
 */
export class ProjectService {
  private readonly table = 'projects';

  /**
   * Fetch all projects ordered by updated_at descending
   */
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return this.mapRows((data as ProjectDbRow[] | null) || []);
  }

  /**
   * Search projects by name, client, or description
   */
  async search(query: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .or(
        `name.ilike.%${query}%,client_name.ilike.%${query}%,description.ilike.%${query}%,project_number.ilike.%${query}%`
      )
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return this.mapRows((data as ProjectDbRow[] | null) || []);
  }

  /**
   * Fetch projects for a specific client
   */
  async getByClientId(clientId: UUID): Promise<Project[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return this.mapRows((data as ProjectDbRow[] | null) || []);
  }

  /**
   * Fetch single project by ID
   */
  async getById(id: UUID): Promise<Project | null> {
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
    return this.mapRow(data as ProjectDbRow);
  }

  /**
   * Create new project
   */
  async create(formData: ProjectFormData, userId: UUID): Promise<Project> {
    const insertData = {
      name: formData.name,
      client_id: formData.clientId ?? null,
      client_name: formData.clientName,
      status: formData.status || 'draft',
      description: formData.description || null,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from(this.table)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as ProjectDbRow);
  }

  /**
   * Update existing project
   */
  async update(id: UUID, formData: Partial<ProjectFormData>): Promise<Project> {
    const updateData: Record<string, unknown> = {};

    if (formData.name !== undefined) updateData.name = formData.name;
    if (formData.clientId !== undefined) updateData.client_id = formData.clientId;
    if (formData.clientName !== undefined) updateData.client_name = formData.clientName;
    if (formData.status !== undefined) updateData.status = formData.status;
    if (formData.description !== undefined) updateData.description = formData.description;

    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as ProjectDbRow);
  }

  /**
   * Delete project by ID
   */
  async delete(id: UUID): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Map multiple database rows to Project objects
   */
  private mapRows(rows: ProjectDbRow[]): Project[] {
    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Map single database row (snake_case) to Project object (camelCase)
   */
  private mapRow(row: ProjectDbRow): Project {
    return {
      id: row.id,
      name: row.name,
      clientId: row.client_id,
      clientName: row.client_name,
      status: row.status,
      rooms: [], // Rooms loaded separately via room service
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * Singleton instance of ProjectService
 */
export const projectService = new ProjectService();
