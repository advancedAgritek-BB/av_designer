/**
 * Template Service - Handles all template CRUD operations with Supabase
 */

import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import type {
  Template,
  TemplateVersion,
  TemplateWithVersion,
  TemplateType,
  TemplateScope,
  TemplateContent,
  TemplateFilters,
  CreateTemplateData,
  UpdateTemplateData,
  UpdateTemplateContentData,
  ForkTemplateData,
  PromoteTemplateData,
  TemplateRow,
  TemplateVersionRow,
} from './template-types';

// ============================================================================
// Type Mappers
// ============================================================================

function mapTemplateFromDb(row: TemplateRow): Template {
  return {
    id: row.id,
    type: row.type as TemplateType,
    name: row.name,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    scope: row.scope as TemplateScope,
    ownerId: row.owner_id,
    teamId: row.team_id,
    orgId: row.org_id,
    categoryTags: row.category_tags || [],
    currentVersion: row.current_version,
    isPublished: row.is_published,
    isArchived: row.is_archived,
    forkedFromId: row.forked_from_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVersionFromDb(row: TemplateVersionRow): TemplateVersion {
  return {
    id: row.id,
    templateId: row.template_id,
    version: row.version,
    content: row.content as unknown as TemplateContent,
    changeSummary: row.change_summary,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

// ============================================================================
// Template Service
// ============================================================================

export class TemplateService {
  /**
   * Get all templates accessible to the user with optional filters
   */
  static async getAll(filters?: TemplateFilters): Promise<Template[]> {
    let query = supabase
      .from('templates')
      .select('*')
      .eq('is_archived', filters?.isArchived ?? false);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.scope && filters.scope !== 'all') {
      query = query.eq('scope', filters.scope);
    }
    if (filters?.isPublished !== undefined) {
      query = query.eq('is_published', filters.isPublished);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order('name');

    if (error) throw new Error(error.message);
    const templates = (data || []).map((row) => mapTemplateFromDb(row as TemplateRow));

    if (!filters?.platform && !filters?.tier) {
      return templates;
    }

    if (filters?.type && filters.type !== 'room') {
      return templates;
    }

    const roomTemplates = templates.filter((template) => template.type === 'room');
    if (roomTemplates.length === 0) {
      return templates;
    }

    const versions = await Promise.all(
      roomTemplates.map(async (template) => ({
        template,
        version: await this.getCurrentVersion(template.id),
      }))
    );

    const matches = new Set(
      versions
        .filter(({ version }) => {
          if (
            !version ||
            !version.content ||
            (version.content as TemplateContent).type !== 'room'
          ) {
            return false;
          }
          const content = version.content as TemplateContent;
          if (content.type !== 'room') return false;
          const platformMatches =
            !filters?.platform || content.platform === filters.platform;
          const tierMatches = !filters?.tier || content.tier === filters.tier;
          return platformMatches && tierMatches;
        })
        .map(({ template }) => template.id)
    );

    return templates.filter((template) =>
      template.type === 'room' ? matches.has(template.id) : true
    );
  }

  /**
   * Get templates by type
   */
  static async getByType(type: TemplateType): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('type', type)
      .eq('is_archived', false)
      .eq('is_published', true)
      .order('name');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapTemplateFromDb(row as TemplateRow));
  }

  /**
   * Get templates by scope
   */
  static async getByScope(scope: TemplateScope): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('scope', scope)
      .eq('is_archived', false)
      .order('name');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapTemplateFromDb(row as TemplateRow));
  }

  /**
   * Get a single template by ID
   */
  static async getById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return mapTemplateFromDb(data as TemplateRow);
  }

  /**
   * Get a template with its current version content
   */
  static async getWithVersion(id: string): Promise<TemplateWithVersion | null> {
    const template = await this.getById(id);
    if (!template) return null;

    const version = await this.getCurrentVersion(id);
    if (!version) {
      return { ...template, content: {} as TemplateContent };
    }

    return { ...template, content: version.content };
  }

  /**
   * Create a new template
   */
  static async create(data: CreateTemplateData, userId: string): Promise<Template> {
    const insertData = {
      type: data.type,
      name: data.name,
      description: data.description,
      thumbnail_url: data.thumbnailUrl,
      scope: data.scope,
      owner_id: data.scope === 'personal' ? userId : null,
      team_id: data.teamId,
      org_id: data.orgId,
      category_tags: data.categoryTags || [],
      is_published: data.isPublished || false,
      forked_from_id: data.forkedFromId,
      current_version: 0,
    };

    const { data: template, error } = await supabase
      .from('templates')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    const created = mapTemplateFromDb(template as TemplateRow);

    // Create initial version and update current_version
    const initialVersion = await this.createVersion(
      created.id,
      data.content,
      userId,
      data.changeSummary || 'Initial version',
      1
    );

    const { data: updated, error: updateError } = await supabase
      .from('templates')
      .update({ current_version: initialVersion.version })
      .eq('id', created.id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);
    return mapTemplateFromDb(updated as TemplateRow);
  }

  /**
   * Update template metadata (not content)
   */
  static async update(id: string, data: UpdateTemplateData): Promise<Template> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.thumbnailUrl !== undefined) updateData.thumbnail_url = data.thumbnailUrl;
    if (data.categoryTags !== undefined) updateData.category_tags = data.categoryTags;
    if (data.isPublished !== undefined) updateData.is_published = data.isPublished;
    if (data.isArchived !== undefined) updateData.is_archived = data.isArchived;

    const { data: template, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapTemplateFromDb(template as TemplateRow);
  }

  /**
   * Update template content (creates new version)
   */
  static async updateContent(
    id: string,
    data: UpdateTemplateContentData,
    userId: string
  ): Promise<TemplateVersion> {
    const template = await this.getById(id);
    if (!template) throw new Error('Template not found');

    // Create new version
    const version = await this.createVersion(
      id,
      data.content,
      userId,
      data.changeSummary
    );

    // Update current_version on template
    await supabase
      .from('templates')
      .update({ current_version: version.version })
      .eq('id', id);

    return version;
  }

  /**
   * Delete a template
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  /**
   * Archive a template (soft delete)
   */
  static async archive(id: string): Promise<Template> {
    return this.update(id, { isArchived: true });
  }

  /**
   * Publish a draft template
   */
  static async publish(id: string): Promise<Template> {
    return this.update(id, { isPublished: true });
  }

  /**
   * Unpublish a template
   */
  static async unpublish(id: string): Promise<Template> {
    return this.update(id, { isPublished: false });
  }

  /**
   * Fork a template to personal scope
   */
  static async fork(
    sourceId: string,
    data: ForkTemplateData,
    userId: string,
    orgId: string
  ): Promise<Template> {
    const source = await this.getWithVersion(sourceId);
    if (!source) throw new Error('Source template not found');

    const createData: CreateTemplateData = {
      type: source.type,
      name: data.name,
      description: data.description || source.description || undefined,
      scope: data.scope || 'personal',
      teamId: data.teamId,
      orgId,
      categoryTags: source.categoryTags,
      isPublished: false,
      forkedFromId: sourceId,
      content: source.content,
      changeSummary: `Forked from "${source.name}"`,
    };

    return this.create(createData, userId);
  }

  /**
   * Duplicate a template within the same scope
   */
  static async duplicate(
    sourceId: string,
    name: string,
    userId: string
  ): Promise<Template> {
    const source = await this.getWithVersion(sourceId);
    if (!source) throw new Error('Source template not found');

    const createData: CreateTemplateData = {
      type: source.type,
      name,
      description: source.description || undefined,
      thumbnailUrl: source.thumbnailUrl || undefined,
      scope: source.scope,
      teamId: source.teamId || undefined,
      orgId: source.orgId,
      categoryTags: source.categoryTags,
      isPublished: false,
      content: source.content,
      changeSummary: `Duplicated from "${source.name}"`,
    };

    return this.create(createData, userId);
  }

  /**
   * Promote a template to a higher scope
   */
  static async promote(id: string, data: PromoteTemplateData): Promise<Template> {
    const updateData: Record<string, unknown> = {
      scope: data.scope,
      owner_id: null, // Remove personal ownership when promoting
    };

    if (data.scope === 'team' && data.teamId) {
      updateData.team_id = data.teamId;
    }

    const { data: template, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapTemplateFromDb(template as TemplateRow);
  }

  // ============================================================================
  // Version Operations
  // ============================================================================

  /**
   * Get all versions for a template
   */
  static async getVersions(templateId: string): Promise<TemplateVersion[]> {
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('version', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapVersionFromDb(row as TemplateVersionRow));
  }

  /**
   * Get a specific version
   */
  static async getVersion(
    templateId: string,
    version: number
  ): Promise<TemplateVersion | null> {
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .eq('version', version)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return mapVersionFromDb(data as TemplateVersionRow);
  }

  /**
   * Get the current version
   */
  static async getCurrentVersion(templateId: string): Promise<TemplateVersion | null> {
    const template = await this.getById(templateId);
    if (!template) return null;

    return this.getVersion(templateId, template.currentVersion);
  }

  /**
   * Create a new version
   */
  static async createVersion(
    templateId: string,
    content: TemplateContent,
    userId: string,
    changeSummary: string,
    forceVersion?: number
  ): Promise<TemplateVersion> {
    // Get current version number
    const template = await this.getById(templateId);
    const version = forceVersion ?? (template ? template.currentVersion + 1 : 1);

    const insertData = {
      template_id: templateId,
      version,
      content: content as unknown as Json,
      change_summary: changeSummary,
      created_by: userId,
    };

    const { data, error } = await supabase
      .from('template_versions')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapVersionFromDb(data as TemplateVersionRow);
  }

  /**
   * Restore a previous version (creates new version with old content)
   */
  static async restoreVersion(
    templateId: string,
    version: number,
    userId: string
  ): Promise<TemplateVersion> {
    const oldVersion = await this.getVersion(templateId, version);
    if (!oldVersion) throw new Error('Version not found');

    const newVersion = await this.updateContent(
      templateId,
      {
        content: oldVersion.content,
        changeSummary: `Restored from version ${version}`,
      },
      userId
    );

    return newVersion;
  }
}
