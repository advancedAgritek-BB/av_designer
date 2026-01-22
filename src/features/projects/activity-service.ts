/**
 * Activity Service - Handles project activity events
 */

import { supabase } from '@/lib/supabase';
import type {
  ActivityEvent,
  ActivityEventRow,
  CreateActivityEventData,
} from './project-types';

function mapActivityFromDb(row: ActivityEventRow): ActivityEvent {
  return {
    id: row.id,
    projectId: row.project_id,
    eventType: row.event_type as ActivityEvent['eventType'],
    userId: row.user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    details: row.details || {},
    createdAt: row.created_at,
  };
}

export class ActivityService {
  /**
   * Fetch activity events for a project
   */
  static async getByProject(projectId: string): Promise<ActivityEvent[]> {
    const { data, error } = await supabase
      .from('activity_events' as never)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapActivityFromDb(row as ActivityEventRow));
  }

  /**
   * Create a new activity event
   */
  static async create(data: CreateActivityEventData): Promise<ActivityEvent> {
    const insertData = {
      project_id: data.projectId,
      event_type: data.eventType,
      entity_type: data.entityType,
      entity_id: data.entityId,
      user_id: data.userId,
      summary: data.summary,
      details: data.details || {},
    };

    const { data: row, error } = await supabase
      .from('activity_events' as never)
      .insert(insertData as never)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapActivityFromDb(row as ActivityEventRow);
  }
}
