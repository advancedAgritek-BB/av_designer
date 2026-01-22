/**
 * Extended Project Types
 *
 * Types for the Projects & Clients System Phase 2
 */

import type { UUID } from '@/types';

// ============================================================================
// Project Extended Types
// ============================================================================

export type ProjectStatusExtended =
  | 'draft'
  | 'quoting'
  | 'client_review'
  | 'ordered'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export interface ProjectExtended {
  id: UUID;
  name: string;
  clientId: UUID | null;
  clientName: string;
  status: ProjectStatusExtended;
  description: string | null;
  startDate: string | null;
  targetEndDate: string | null;
  budgetCents: number | null;
  tags: string[];
  userId: UUID;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Project Contact Types
// ============================================================================

export interface ProjectContact {
  id: UUID;
  projectId: UUID;
  clientContactId: UUID;
  role: string;
  isPrimary: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectContactData {
  projectId: UUID;
  clientContactId: UUID;
  role: string;
  isPrimary?: boolean;
  notes?: string;
}

// ============================================================================
// Project Location Types
// ============================================================================

export interface ProjectLocation {
  id: UUID;
  projectId: UUID;
  name: string;
  address: LocationAddress;
  accessNotes: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface CreateProjectLocationData {
  projectId: UUID;
  name: string;
  address?: LocationAddress;
  accessNotes?: string;
  isPrimary?: boolean;
}

export interface UpdateProjectLocationData {
  name?: string;
  address?: LocationAddress;
  accessNotes?: string | null;
  isPrimary?: boolean;
}

// ============================================================================
// Workstream Types
// ============================================================================

export type WorkstreamType = 'design' | 'procurement' | 'installation' | 'custom';
export type WorkstreamStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';

export interface Workstream {
  id: UUID;
  projectId: UUID;
  name: string;
  type: WorkstreamType;
  status: WorkstreamStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkstreamData {
  projectId: UUID;
  name: string;
  type?: WorkstreamType;
  status?: WorkstreamStatus;
  sortOrder?: number;
}

export interface UpdateWorkstreamData {
  name?: string;
  type?: WorkstreamType;
  status?: WorkstreamStatus;
  sortOrder?: number;
}

// ============================================================================
// Task Types
// ============================================================================

export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'complete';

export interface Task {
  id: UUID;
  workstreamId: UUID;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigneeId: UUID | null;
  dueDate: string | null;
  startDate: string | null;
  completedDate: string | null;
  blockedReason: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: UUID;
}

export interface CreateTaskData {
  workstreamId: UUID;
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: UUID;
  dueDate?: string;
  startDate?: string;
  blockedReason?: string;
  sortOrder?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assigneeId?: UUID | null;
  dueDate?: string | null;
  startDate?: string | null;
  completedDate?: string | null;
  blockedReason?: string | null;
  sortOrder?: number;
}

// ============================================================================
// Task Dependency Types
// ============================================================================

export type DependencyType = 'blocks' | 'blocked_by' | 'related';

export interface TaskDependency {
  id: UUID;
  taskId: UUID;
  dependsOnTaskId: UUID;
  dependencyType: DependencyType;
  createdAt: string;
}

export interface CreateTaskDependencyData {
  taskId: UUID;
  dependsOnTaskId: UUID;
  dependencyType: DependencyType;
}

// ============================================================================
// Activity Event Types
// ============================================================================

export type ActivityEventType =
  | 'project_created'
  | 'project_updated'
  | 'status_changed'
  | 'task_created'
  | 'task_completed'
  | 'comment_added'
  | 'file_uploaded'
  | 'member_added'
  | 'member_removed';

export interface ActivityEvent {
  id: UUID;
  projectId: UUID;
  eventType: ActivityEventType;
  userId: UUID;
  entityType: string;
  entityId: UUID;
  summary: string;
  details: Record<string, unknown> | unknown[];
  createdAt: string;
}

export interface CreateActivityEventData {
  projectId: UUID;
  eventType: ActivityEventType;
  userId: UUID;
  entityType: string;
  entityId: UUID;
  summary: string;
  details?: Record<string, unknown> | unknown[];
}

// ============================================================================
// Composite Types (for UI)
// ============================================================================

export interface WorkstreamWithTasks extends Workstream {
  tasks: Task[];
}

export interface ProjectWithWorkstreams extends ProjectExtended {
  workstreams: WorkstreamWithTasks[];
}

export interface ProjectFull extends ProjectExtended {
  workstreams: WorkstreamWithTasks[];
  locations: ProjectLocation[];
  contacts: ProjectContact[];
  recentActivity: ActivityEvent[];
}

// ============================================================================
// Database Row Types
// ============================================================================

export interface ProjectExtendedRow {
  id: string;
  name: string;
  client_id: string | null;
  client_name: string;
  status: string;
  description: string | null;
  start_date: string | null;
  target_end_date: string | null;
  budget_cents: number | null;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkstreamRow {
  id: string;
  project_id: string;
  name: string;
  type: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  workstream_id: string;
  title: string;
  description: string | null;
  status: string;
  assignee_id: string | null;
  due_date: string | null;
  start_date: string | null;
  completed_date: string | null;
  blocked_reason: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProjectLocationRow {
  id: string;
  project_id: string;
  name: string;
  address: Record<string, string>;
  access_notes: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityEventRow {
  id: string;
  project_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  summary: string;
  details: Record<string, unknown> | unknown[];
  created_at: string;
}
