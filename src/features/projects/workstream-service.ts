/**
 * Workstream Service - Handles workstream and task CRUD operations
 */

import { supabase } from '@/lib/supabase';
import type {
  Workstream,
  Task,
  TaskDependency,
  WorkstreamWithTasks,
  CreateWorkstreamData,
  UpdateWorkstreamData,
  CreateTaskData,
  UpdateTaskData,
  CreateTaskDependencyData,
  WorkstreamRow,
  TaskRow,
  WorkstreamStatus,
  TaskStatus,
  DependencyType,
} from './project-types';

// Task Dependency Row Type
interface TaskDependencyRow {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: string;
  created_at: string;
}

// ============================================================================
// Type Mappers
// ============================================================================

function mapWorkstreamFromDb(row: WorkstreamRow): Workstream {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    type: row.type as Workstream['type'],
    status: row.status as WorkstreamStatus,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTaskFromDb(row: TaskRow): Task {
  return {
    id: row.id,
    workstreamId: row.workstream_id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    assigneeId: row.assignee_id,
    dueDate: row.due_date,
    startDate: row.start_date,
    completedDate: row.completed_date,
    blockedReason: row.blocked_reason,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

// ============================================================================
// Workstream Service
// ============================================================================

export class WorkstreamService {
  /**
   * Get all workstreams for a project
   */
  static async getByProject(projectId: string): Promise<Workstream[]> {
    const { data, error } = await supabase
      .from('workstreams')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapWorkstreamFromDb(row as WorkstreamRow));
  }

  /**
   * Get workstreams with their tasks
   */
  static async getWithTasks(projectId: string): Promise<WorkstreamWithTasks[]> {
    const workstreams = await this.getByProject(projectId);

    const workstreamsWithTasks = await Promise.all(
      workstreams.map(async (workstream) => {
        const tasks = await TaskService.getByWorkstream(workstream.id);
        return { ...workstream, tasks };
      })
    );

    return workstreamsWithTasks;
  }

  /**
   * Get a single workstream by ID
   */
  static async getById(id: string): Promise<Workstream | null> {
    const { data, error } = await supabase
      .from('workstreams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return mapWorkstreamFromDb(data as WorkstreamRow);
  }

  /**
   * Create a new workstream
   */
  static async create(data: CreateWorkstreamData): Promise<Workstream> {
    const insertData = {
      project_id: data.projectId,
      name: data.name,
      type: data.type || 'custom',
      status: data.status || 'not_started',
      sort_order: data.sortOrder || 0,
    };

    const { data: workstream, error } = await supabase
      .from('workstreams')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapWorkstreamFromDb(workstream as WorkstreamRow);
  }

  /**
   * Update a workstream
   */
  static async update(id: string, data: UpdateWorkstreamData): Promise<Workstream> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

    const { data: workstream, error } = await supabase
      .from('workstreams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapWorkstreamFromDb(workstream as WorkstreamRow);
  }

  /**
   * Delete a workstream
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('workstreams').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  /**
   * Reorder workstreams
   */
  static async reorder(workstreamIds: string[]): Promise<void> {
    const updates = workstreamIds.map((id, index) =>
      supabase.from('workstreams').update({ sort_order: index }).eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      throw new Error('Failed to reorder workstreams');
    }
  }
}

// ============================================================================
// Task Service
// ============================================================================

export class TaskService {
  /**
   * Get all tasks for a workstream
   */
  static async getByWorkstream(workstreamId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workstream_id', workstreamId)
      .order('sort_order');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapTaskFromDb(row as TaskRow));
  }

  /**
   * Get all tasks for a project (across all workstreams)
   */
  static async getByProject(projectId: string): Promise<Task[]> {
    // First get workstream IDs for this project
    const { data: workstreams, error: wsError } = await supabase
      .from('workstreams')
      .select('id')
      .eq('project_id', projectId);

    if (wsError) throw new Error(wsError.message);
    if (!workstreams || workstreams.length === 0) return [];

    const workstreamIds = workstreams.map((ws) => ws.id);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('workstream_id', workstreamIds)
      .order('sort_order');

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapTaskFromDb(row as TaskRow));
  }

  /**
   * Get a single task by ID
   */
  static async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return mapTaskFromDb(data as TaskRow);
  }

  /**
   * Create a new task
   */
  static async create(data: CreateTaskData, userId: string): Promise<Task> {
    const insertData = {
      workstream_id: data.workstreamId,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      assignee_id: data.assigneeId,
      due_date: data.dueDate,
      start_date: data.startDate,
      blocked_reason: data.blockedReason,
      sort_order: data.sortOrder || 0,
      created_by: userId,
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapTaskFromDb(task as TaskRow);
  }

  /**
   * Update a task
   */
  static async update(id: string, data: UpdateTaskData): Promise<Task> {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assigneeId !== undefined) updateData.assignee_id = data.assigneeId;
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
    if (data.startDate !== undefined) updateData.start_date = data.startDate;
    if (data.completedDate !== undefined) updateData.completed_date = data.completedDate;
    if (data.blockedReason !== undefined) updateData.blocked_reason = data.blockedReason;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapTaskFromDb(task as TaskRow);
  }

  /**
   * Delete a task
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  /**
   * Move task to different workstream
   */
  static async moveToWorkstream(taskId: string, newWorkstreamId: string): Promise<Task> {
    const updateData = {
      workstream_id: newWorkstreamId,
      sort_order: 0,
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapTaskFromDb(task as TaskRow);
  }

  /**
   * Reorder tasks within a workstream
   */
  static async reorder(taskIds: string[]): Promise<void> {
    const updates = taskIds.map((id, index) =>
      supabase.from('tasks').update({ sort_order: index }).eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      throw new Error('Failed to reorder tasks');
    }
  }
}

// ============================================================================
// Task Dependency Service
// ============================================================================

export class TaskDependencyService {
  /**
   * Get dependencies for a task
   */
  static async getByTask(taskId: string): Promise<TaskDependency[]> {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select('*')
      .eq('task_id', taskId);

    if (error) throw new Error(error.message);
    return (data || []).map((row) => {
      const typedRow = row as TaskDependencyRow;
      return {
        id: typedRow.id,
        taskId: typedRow.task_id,
        dependsOnTaskId: typedRow.depends_on_task_id,
        dependencyType: typedRow.dependency_type as DependencyType,
        createdAt: typedRow.created_at,
      };
    });
  }

  /**
   * Create a task dependency
   */
  static async create(data: CreateTaskDependencyData): Promise<TaskDependency> {
    const insertData = {
      task_id: data.taskId,
      depends_on_task_id: data.dependsOnTaskId,
      dependency_type: data.dependencyType,
    };

    const { data: dependency, error } = await supabase
      .from('task_dependencies')
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    const typedDep = dependency as TaskDependencyRow;
    return {
      id: typedDep.id,
      taskId: typedDep.task_id,
      dependsOnTaskId: typedDep.depends_on_task_id,
      dependencyType: typedDep.dependency_type as DependencyType,
      createdAt: typedDep.created_at,
    };
  }

  /**
   * Delete a task dependency
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('task_dependencies').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
