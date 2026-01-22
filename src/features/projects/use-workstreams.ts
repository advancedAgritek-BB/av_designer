/**
 * Workstream & Task React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  WorkstreamService,
  TaskService,
  TaskDependencyService,
} from './workstream-service';
import { supabase } from '@/lib/supabase';
import type {
  CreateWorkstreamData,
  UpdateWorkstreamData,
  CreateTaskData,
  UpdateTaskData,
  CreateTaskDependencyData,
} from './project-types';

// ============================================================================
// Query Keys
// ============================================================================

export const WORKSTREAM_KEYS = {
  all: ['workstreams'] as const,
  byProject: (projectId: string) =>
    [...WORKSTREAM_KEYS.all, 'project', projectId] as const,
  withTasks: (projectId: string) =>
    [...WORKSTREAM_KEYS.all, 'project', projectId, 'with-tasks'] as const,
  detail: (id: string) => [...WORKSTREAM_KEYS.all, 'detail', id] as const,
};

export const TASK_KEYS = {
  all: ['tasks'] as const,
  byWorkstream: (workstreamId: string) =>
    [...TASK_KEYS.all, 'workstream', workstreamId] as const,
  byProject: (projectId: string) => [...TASK_KEYS.all, 'project', projectId] as const,
  detail: (id: string) => [...TASK_KEYS.all, 'detail', id] as const,
  dependencies: (taskId: string) => [...TASK_KEYS.all, 'dependencies', taskId] as const,
};

// ============================================================================
// Workstream Hooks
// ============================================================================

/**
 * Fetch workstreams for a project
 */
export function useProjectWorkstreams(projectId: string) {
  return useQuery({
    queryKey: WORKSTREAM_KEYS.byProject(projectId),
    queryFn: () => WorkstreamService.getByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Fetch workstreams with their tasks
 */
export function useWorkstreamsWithTasks(projectId: string) {
  return useQuery({
    queryKey: WORKSTREAM_KEYS.withTasks(projectId),
    queryFn: () => WorkstreamService.getWithTasks(projectId),
    enabled: !!projectId,
  });
}

/**
 * Fetch a single workstream
 */
export function useWorkstream(id: string) {
  return useQuery({
    queryKey: WORKSTREAM_KEYS.detail(id),
    queryFn: () => WorkstreamService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create a workstream
 */
export function useCreateWorkstream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkstreamData) => WorkstreamService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.byProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.withTasks(variables.projectId),
      });
    },
  });
}

/**
 * Update a workstream
 */
export function useUpdateWorkstream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; projectId: string; data: UpdateWorkstreamData }) =>
      WorkstreamService.update(params.id, params.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.byProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.withTasks(variables.projectId),
      });
    },
  });
}

/**
 * Delete a workstream
 */
export function useDeleteWorkstream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; projectId: string }) =>
      WorkstreamService.delete(params.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.byProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.withTasks(variables.projectId),
      });
    },
  });
}

/**
 * Reorder workstreams
 */
export function useReorderWorkstreams() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workstreamIds }: { workstreamIds: string[]; projectId: string }) =>
      WorkstreamService.reorder(workstreamIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.byProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.withTasks(variables.projectId),
      });
    },
  });
}

// ============================================================================
// Task Hooks
// ============================================================================

/**
 * Fetch tasks for a workstream
 */
export function useWorkstreamTasks(workstreamId: string) {
  return useQuery({
    queryKey: TASK_KEYS.byWorkstream(workstreamId),
    queryFn: () => TaskService.getByWorkstream(workstreamId),
    enabled: !!workstreamId,
  });
}

/**
 * Fetch all tasks for a project
 */
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: TASK_KEYS.byProject(projectId),
    queryFn: () => TaskService.getByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Fetch a single task
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => TaskService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create a task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to create a task');
      }
      return TaskService.create(data, authData.user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.byWorkstream(variables.workstreamId),
      });
      // Also invalidate workstreams with tasks
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.all,
      });
    },
  });
}

/**
 * Update a task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      workstreamId: string;
      data: UpdateTaskData;
    }) => TaskService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.byWorkstream(variables.workstreamId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.all,
      });
    },
  });
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; workstreamId: string }) => TaskService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.byWorkstream(variables.workstreamId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.all,
      });
    },
  });
}

/**
 * Reorder tasks
 */
export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskIds }: { taskIds: string[]; workstreamId: string }) =>
      TaskService.reorder(taskIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.byWorkstream(variables.workstreamId),
      });
      queryClient.invalidateQueries({
        queryKey: WORKSTREAM_KEYS.all,
      });
    },
  });
}

// ============================================================================
// Task Dependency Hooks
// ============================================================================

/**
 * Fetch dependencies for a task
 */
export function useTaskDependencies(taskId: string) {
  return useQuery({
    queryKey: TASK_KEYS.dependencies(taskId),
    queryFn: () => TaskDependencyService.getByTask(taskId),
    enabled: !!taskId,
  });
}

/**
 * Create a task dependency
 */
export function useCreateTaskDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDependencyData) => TaskDependencyService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.dependencies(variables.taskId),
      });
    },
  });
}

/**
 * Delete a task dependency
 */
export function useDeleteTaskDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; taskId: string }) =>
      TaskDependencyService.delete(params.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.dependencies(variables.taskId),
      });
    },
  });
}
