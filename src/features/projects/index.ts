// Project Service & Types
export { projectService, type ProjectFormData } from './project-service';
export {
  PROJECT_KEYS,
  useProjectList,
  useProjectsByClient,
  useProject,
  useProjectSearch,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from './use-projects';

// Extended Project Types
export type {
  ProjectStatusExtended,
  ProjectExtended,
  ProjectContact,
  CreateProjectContactData,
  ProjectLocation,
  LocationAddress,
  CreateProjectLocationData,
  UpdateProjectLocationData,
  Workstream,
  WorkstreamStatus,
  CreateWorkstreamData,
  UpdateWorkstreamData,
  Task,
  TaskStatus,
  CreateTaskData,
  UpdateTaskData,
  TaskDependency,
  DependencyType,
  CreateTaskDependencyData,
  ActivityEvent,
  ActivityEventType,
  CreateActivityEventData,
  WorkstreamWithTasks,
  ProjectWithWorkstreams,
  ProjectFull,
} from './project-types';

// Workstream & Task Services
export {
  WorkstreamService,
  TaskService,
  TaskDependencyService,
} from './workstream-service';
export { ActivityService } from './activity-service';

// Workstream & Task Hooks
export {
  WORKSTREAM_KEYS,
  TASK_KEYS,
  useProjectWorkstreams,
  useWorkstreamsWithTasks,
  useWorkstream,
  useCreateWorkstream,
  useUpdateWorkstream,
  useDeleteWorkstream,
  useReorderWorkstreams,
  useWorkstreamTasks,
  useProjectTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useReorderTasks,
  useTaskDependencies,
  useCreateTaskDependency,
  useDeleteTaskDependency,
} from './use-workstreams';

// Activity Hooks
export { ACTIVITY_KEYS, useProjectActivity, useCreateActivity } from './use-activity';

// Components
export { ProjectCard, StatusPill, STATUS_CONFIG } from './components/ProjectCard';
export { ProjectsKanban } from './components/ProjectsKanban';
export { ProjectsList } from './components/ProjectsList';
export { ProjectDetailPage } from './components/ProjectDetailPage';
export { TaskCard, TASK_STATUS_CONFIG } from './components/TaskCard';
export { TaskList } from './components/TaskList';
export { WorkstreamPanel } from './components/WorkstreamPanel';
export { ActivityFeed } from './components/ActivityFeed';
