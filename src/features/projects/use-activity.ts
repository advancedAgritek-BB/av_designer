/**
 * Activity React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityService } from './activity-service';
import type { CreateActivityEventData } from './project-types';

export const ACTIVITY_KEYS = {
  all: ['activity'] as const,
  byProject: (projectId: string) => [...ACTIVITY_KEYS.all, 'project', projectId] as const,
};

/**
 * Fetch activity events for a project
 */
export function useProjectActivity(projectId: string) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.byProject(projectId),
    queryFn: () => ActivityService.getByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Create a new activity event
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityEventData) => ActivityService.create(data),
    onSuccess: (event) => {
      queryClient.invalidateQueries({
        queryKey: ACTIVITY_KEYS.byProject(event.projectId),
      });
    },
  });
}
