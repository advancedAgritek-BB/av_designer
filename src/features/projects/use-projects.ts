import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, type ProjectFormData } from './project-service';
import { ActivityService } from './activity-service';
import { supabase } from '@/lib/supabase';
import { NotificationService } from '@/features/notifications/notification-service';
import { useAuthStore } from '@/features/auth/auth-store';

/**
 * Query key factory for project queries
 * Provides consistent cache key structure for invalidation
 */
export const PROJECT_KEYS = {
  all: ['projects'] as const,
  list: () => [...PROJECT_KEYS.all, 'list'] as const,
  byClient: (clientId: string) => [...PROJECT_KEYS.all, 'client', clientId] as const,
  detail: (id: string) => [...PROJECT_KEYS.all, 'detail', id] as const,
  search: (query: string) => [...PROJECT_KEYS.all, 'search', query] as const,
};

/**
 * Fetch all projects
 */
export function useProjectList() {
  return useQuery({
    queryKey: PROJECT_KEYS.list(),
    queryFn: () => projectService.getAll(),
  });
}

/**
 * Fetch projects for a specific client
 */
export function useProjectsByClient(clientId: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.byClient(clientId),
    queryFn: () => projectService.getByClientId(clientId),
    enabled: !!clientId,
  });
}

/**
 * Fetch single project by ID
 * Disabled when id is empty
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}

/**
 * Search projects by name or client.
 * Only executes when query is 2+ characters.
 */
export function useProjectSearch(query: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.search(query),
    queryFn: () => projectService.search(query),
    enabled: query.length >= 2,
  });
}

/**
 * Create new project
 * Gets user ID from Supabase auth session
 * Invalidates all project queries on success
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const currentOrg = useAuthStore((state) => state.currentOrg);

  return useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('You must be logged in to create a project');
      }
      const project = await projectService.create(data, authData.user.id);
      try {
        await ActivityService.create({
          projectId: project.id,
          eventType: 'project_created',
          userId: authData.user.id,
          entityType: 'project',
          entityId: project.id,
          summary: `Created project "${project.name}"`,
        });
      } catch {
        // Ignore activity logging failures
      }
      if (currentOrg?.id) {
        try {
          await NotificationService.trigger({
            orgId: currentOrg.id,
            category: 'projects',
            eventType: 'created',
            severity: 'info',
            title: `Project created`,
            message: `Project "${project.name}" was created.`,
            entityType: 'project',
            entityId: project.id,
            actorId: authData.user.id,
            projectId: project.id,
          });
        } catch {
          // Ignore notification failures
        }
      }
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
}

/**
 * Update existing project
 * Invalidates all project queries and specific detail on success
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const currentOrg = useAuthStore((state) => state.currentOrg);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProjectFormData> }) => {
      const project = await projectService.update(id, data);
      if (currentOrg?.id && data.clientId) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user) {
            await NotificationService.trigger({
              orgId: currentOrg.id,
              category: 'projects',
              eventType: 'client_assigned',
              severity: 'info',
              title: `Client assigned`,
              message: `Client assigned to project "${project.name}".`,
              entityType: 'project',
              entityId: project.id,
              actorId: authData.user.id,
              projectId: project.id,
            });
          }
        } catch {
          // Ignore notification failures
        }
      }
      return project;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
    },
  });
}

/**
 * Delete project
 * Invalidates all project queries on success
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
}
