/**
 * Project Detail Page
 *
 * Shows detailed project information with workstreams, tasks, and activity
 */
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardBody, Input, Modal, ModalFooter } from '@/components/ui';
import { useProject } from '../use-projects';
import {
  useRoomsByProject,
  useCreateRoom,
  useDeleteRoom,
} from '@/features/room-builder/use-rooms';
import {
  SaveAsTemplateModal,
  useApplyTemplate,
  useTemplateList,
} from '@/features/templates';
import {
  useWorkstreamsWithTasks,
  useCreateWorkstream,
  useUpdateWorkstream,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '../use-workstreams';
import { useProjectActivity, useCreateActivity } from '../use-activity';
import { useCurrentUser } from '@/features/auth/use-auth';
import { WorkstreamPanel } from './WorkstreamPanel';
import { ActivityFeed } from './ActivityFeed';
import { StatusPill } from './ProjectCard';
import type {
  Task,
  TaskStatus,
  Workstream,
  WorkstreamStatus,
  WorkstreamType,
} from '../project-types';
import type { Room, RoomType, Platform, Ecosystem, QualityTier } from '@/types/room';

type TabId = 'overview' | 'rooms' | 'workstreams' | 'activity';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'workstreams', label: 'Workstreams' },
  { id: 'activity', label: 'Activity' },
];

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  huddle: 'Huddle Room',
  conference: 'Conference Room',
  training: 'Training Room',
  boardroom: 'Boardroom',
  auditorium: 'Auditorium',
};

/**
 * Tab navigation
 */
function TabNav({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex border-b border-border" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === tab.id
              ? 'border-accent-gold text-accent-gold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function formatDateInput(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function toIsoDate(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00Z`).toISOString();
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-bg-tertiary rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-4 w-32 bg-bg-tertiary rounded animate-pulse" />
        </div>
      </div>
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-24 bg-bg-tertiary rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-bg-tertiary rounded" />
              <div className="h-4 w-3/4 bg-bg-tertiary rounded" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/**
 * Error state
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2 text-balance">
        Failed to load project
      </h3>
      <p className="text-text-secondary mb-6 max-w-sm text-pretty">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}

/**
 * Not found state
 */
function NotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-tertiary"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2 text-balance">
        Project not found
      </h3>
      <p className="text-text-secondary mb-6 max-w-sm text-pretty">
        The project you're looking for doesn't exist or has been deleted.
      </p>
      <Link to="/projects">
        <Button>Back to Projects</Button>
      </Link>
    </div>
  );
}

interface LocalRoomFormData {
  name: string;
  roomType: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: QualityTier;
  templateId?: string;
}

function RoomCard({ room, onDelete }: { room: Room; onDelete: () => void }) {
  const roomTypeLabel = ROOM_TYPE_LABELS[room.roomType] || room.roomType;
  const formattedDate = new Date(room.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link to={`/rooms/${room.id}/design`} className="block">
      <Card className="hover:border-white/20 transition-colors group">
        <CardBody>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-text-primary font-medium group-hover:text-accent-gold transition-colors">
                {room.name}
              </h3>
              <p className="text-sm text-text-secondary">{roomTypeLabel}</p>
            </div>
            <span className="text-xs text-text-tertiary">
              {room.width}' x {room.length}'
            </span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
            <span className="text-xs text-text-tertiary">Updated {formattedDate}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="text-xs text-text-tertiary hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Delete ${room.name}`}
            >
              Delete
            </button>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

function CreateRoomForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: LocalRoomFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const { data: roomTemplates = [] } = useTemplateList({
    type: 'room',
    isArchived: false,
  });
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('conference');
  const [width, setWidth] = useState('12');
  const [length, setLength] = useState('15');
  const [height, setHeight] = useState('9');
  const [templateId, setTemplateId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      roomType,
      width: parseFloat(width) || 12,
      length: parseFloat(length) || 15,
      ceilingHeight: parseFloat(height) || 9,
      platform: 'teams',
      ecosystem: 'poly',
      tier: 'standard',
      templateId: templateId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Room Name"
          placeholder="e.g., Main Conference Room"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="input-wrapper">
            <label className="label" htmlFor="room-template">
              Room Template (optional)
            </label>
            <select
              id="room-template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="input"
            >
              <option value="">Create from scratch</option>
              {roomTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper">
            <label className="label" htmlFor="room-type">
              Room Type
            </label>
            <select
              id="room-type"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
              className="input"
              disabled={!!templateId}
            >
              {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Width (ft)"
            type="number"
            min="5"
            max="100"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            disabled={!!templateId}
          />
          <Input
            label="Length (ft)"
            type="number"
            min="5"
            max="100"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            disabled={!!templateId}
          />
          <Input
            label="Height (ft)"
            type="number"
            min="7"
            max="30"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            disabled={!!templateId}
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading} disabled={!name.trim()}>
          Create Room
        </Button>
      </ModalFooter>
    </form>
  );
}

function DeleteRoomConfirmation({
  roomName,
  onConfirm,
  onCancel,
  isLoading,
}: {
  roomName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div>
      <p className="text-text-secondary">
        Are you sure you want to delete{' '}
        <strong className="text-text-primary">{roomName}</strong>? This action cannot be
        undone.
      </p>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={isLoading}>
          Delete Room
        </Button>
      </ModalFooter>
    </div>
  );
}

function RoomsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardBody>
            <div className="animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-bg-tertiary rounded" />
                  <div className="h-4 w-20 bg-bg-tertiary rounded" />
                </div>
                <div className="h-4 w-16 bg-bg-tertiary rounded" />
              </div>
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="h-3 w-20 bg-bg-tertiary rounded" />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

/**
 * Overview tab content
 */
function OverviewTab({
  project,
  projectId,
  onOpenRooms,
}: {
  project: { name: string; clientName: string; status: string; rooms: unknown[] };
  projectId: string;
  onOpenRooms: () => void;
}) {
  const navigate = useNavigate();
  const { data: rooms = [] } = useRoomsByProject(projectId);
  const primaryRoom = rooms[0];

  const handleDesign = () => {
    if (primaryRoom) {
      navigate(`/rooms/${primaryRoom.id}/design`);
    } else {
      onOpenRooms();
    }
  };

  const handleDrawings = () => {
    if (primaryRoom) {
      navigate(`/rooms/${primaryRoom.id}/drawings`);
    } else {
      onOpenRooms();
    }
  };

  const handleQuote = () => {
    if (primaryRoom) {
      navigate(`/rooms/${primaryRoom.id}/quotes`);
    } else {
      onOpenRooms();
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-3">Project Details</h3>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs text-text-tertiary">Client</dt>
            <dd className="text-text-primary">{project.clientName}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-tertiary">Status</dt>
            <dd>
              <StatusPill status={project.status as import('@/types').ProjectStatus} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-tertiary">Rooms</dt>
            <dd className="text-text-primary">{rooms.length} rooms</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleDesign}>
            Open Room Builder
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDrawings}>
            View Drawings
          </Button>
          <Button variant="secondary" size="sm" onClick={handleQuote}>
            Generate Quote
          </Button>
        </div>
        {!primaryRoom && (
          <p className="text-xs text-text-tertiary mt-2">
            Create a room to enable design, drawings, and quoting.
          </p>
        )}
      </section>
    </div>
  );
}

function RoomsTab({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { data: rooms, isLoading, error, refetch } = useRoomsByProject(projectId);
  const createRoom = useCreateRoom();
  const deleteRoom = useDeleteRoom();
  const applyTemplate = useApplyTemplate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const handleCreateRoom = async (data: LocalRoomFormData) => {
    if (data.templateId) {
      const result = await applyTemplate.mutateAsync({
        templateId: data.templateId,
        data: { name: data.name, projectId },
      });
      setIsCreateModalOpen(false);
      if (result.roomId) {
        navigate(`/rooms/${result.roomId}/design`);
      }
      return;
    }
    await createRoom.mutateAsync({ projectId, data });
    setIsCreateModalOpen(false);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    await deleteRoom.mutateAsync(roomToDelete.id);
    setRoomToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-text-secondary">Rooms</h3>
          <p className="text-xs text-text-tertiary mt-1">
            Design spaces within this project
          </p>
        </div>
        {rooms && rooms.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Room
          </Button>
        )}
      </div>

      {isLoading && <RoomsLoadingSkeleton />}

      {error && (
        <div className="text-center py-8 text-sm text-red-400">
          Failed to load rooms
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !error && rooms?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">No rooms yet</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Room
          </Button>
        </div>
      )}

      {!isLoading && !error && rooms && rooms.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onDelete={() => setRoomToDelete(room)} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Room"
        description="Create a room for design and drawings"
      >
        <CreateRoomForm
          onSubmit={handleCreateRoom}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createRoom.isPending || applyTemplate.isPending}
        />
        {createRoom.error && (
          <p className="mt-2 text-sm text-red-400">
            {createRoom.error instanceof Error
              ? createRoom.error.message
              : 'Failed to create room'}
          </p>
        )}
        {applyTemplate.error && (
          <p className="mt-2 text-sm text-red-400">
            {applyTemplate.error instanceof Error
              ? applyTemplate.error.message
              : 'Failed to apply template'}
          </p>
        )}
      </Modal>

      <Modal
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        title="Delete Room"
        size="sm"
      >
        {roomToDelete && (
          <DeleteRoomConfirmation
            roomName={roomToDelete.name}
            onConfirm={handleDeleteRoom}
            onCancel={() => setRoomToDelete(null)}
            isLoading={deleteRoom.isPending}
          />
        )}
      </Modal>
    </div>
  );
}

/**
 * Workstreams tab content
 */
function WorkstreamsTab({ projectId }: { projectId: string }) {
  const { data: workstreams, isLoading, error } = useWorkstreamsWithTasks(projectId);
  const createWorkstream = useCreateWorkstream();
  const updateWorkstream = useUpdateWorkstream();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createActivity = useCreateActivity();
  const { user } = useCurrentUser();

  const [workstreamModal, setWorkstreamModal] = useState<{
    mode: 'create' | 'edit';
    workstream?: Workstream;
  } | null>(null);
  const [taskModal, setTaskModal] = useState<{
    mode: 'create' | 'edit';
    workstreamId: string;
    task?: Task;
  } | null>(null);

  const handleTaskStatusChange = (
    taskId: string,
    workstreamId: string,
    status: TaskStatus
  ) => {
    updateTask.mutate({
      id: taskId,
      workstreamId,
      data: {
        status,
        completedDate: status === 'complete' ? new Date().toISOString() : null,
      },
    });

    if (status === 'complete' && user) {
      createActivity.mutate({
        projectId,
        eventType: 'task_completed',
        userId: user.id,
        entityType: 'task',
        entityId: taskId,
        summary: 'Task completed',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-bg-tertiary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-sm text-red-400">
        Failed to load workstreams
      </div>
    );
  }

  const isEmpty = !workstreams || workstreams.length === 0;

  return (
    <div className="space-y-4">
      {isEmpty ? (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">No workstreams yet</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWorkstreamModal({ mode: 'create' })}
          >
            Add Workstream
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Workstreams</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWorkstreamModal({ mode: 'create' })}
            >
              New Workstream
            </Button>
          </div>

          {workstreams.map((workstream) => (
            <WorkstreamPanel
              key={workstream.id}
              workstream={workstream}
              tasks={workstream.tasks}
              onTaskClick={(task) =>
                setTaskModal({ mode: 'edit', workstreamId: workstream.id, task })
              }
              onTaskStatusChange={(taskId, status) =>
                handleTaskStatusChange(taskId, workstream.id, status)
              }
              onAddTask={() =>
                setTaskModal({ mode: 'create', workstreamId: workstream.id })
              }
              onEditWorkstream={() => setWorkstreamModal({ mode: 'edit', workstream })}
            />
          ))}
        </>
      )}

      {/* Workstream Modal */}
      <Modal
        isOpen={!!workstreamModal}
        onClose={() => setWorkstreamModal(null)}
        title={workstreamModal?.mode === 'edit' ? 'Edit Workstream' : 'New Workstream'}
        description="Organize tasks within this project"
      >
        <WorkstreamForm
          initial={workstreamModal?.workstream}
          onCancel={() => setWorkstreamModal(null)}
          isLoading={createWorkstream.isPending || updateWorkstream.isPending}
          onSubmit={async (data) => {
            if (workstreamModal?.mode === 'edit' && workstreamModal.workstream) {
              const updated = await updateWorkstream.mutateAsync({
                id: workstreamModal.workstream.id,
                projectId,
                data,
              });
              if (user) {
                createActivity.mutate({
                  projectId,
                  eventType: 'project_updated',
                  userId: user.id,
                  entityType: 'workstream',
                  entityId: updated.id,
                  summary: `Updated workstream "${updated.name}"`,
                });
              }
            } else {
              const created = await createWorkstream.mutateAsync({
                projectId,
                ...data,
              });
              if (user) {
                createActivity.mutate({
                  projectId,
                  eventType: 'project_updated',
                  userId: user.id,
                  entityType: 'workstream',
                  entityId: created.id,
                  summary: `Created workstream "${created.name}"`,
                });
              }
            }
            setWorkstreamModal(null);
          }}
        />
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={!!taskModal}
        onClose={() => setTaskModal(null)}
        title={taskModal?.mode === 'edit' ? 'Edit Task' : 'New Task'}
        description="Track work within this workstream"
      >
        {taskModal &&
          (() => {
            const workstreamId = taskModal.workstreamId;
            const editingTask = taskModal.mode === 'edit' ? taskModal.task : undefined;

            return (
              <TaskForm
                initial={editingTask}
                onCancel={() => setTaskModal(null)}
                isLoading={createTask.isPending || updateTask.isPending}
                onDelete={
                  editingTask
                    ? async () => {
                        await deleteTask.mutateAsync({
                          id: editingTask.id,
                          workstreamId,
                        });
                        setTaskModal(null);
                      }
                    : undefined
                }
                isDeleting={deleteTask.isPending}
                onSubmit={async (data) => {
                  if (editingTask) {
                    const completedDate =
                      data.status === 'complete'
                        ? editingTask.completedDate || new Date().toISOString()
                        : null;
                    const updated = await updateTask.mutateAsync({
                      id: editingTask.id,
                      workstreamId,
                      data: { ...data, completedDate },
                    });
                    if (user && data.status === 'complete') {
                      createActivity.mutate({
                        projectId,
                        eventType: 'task_completed',
                        userId: user.id,
                        entityType: 'task',
                        entityId: updated.id,
                        summary: `Completed task "${updated.title}"`,
                        details: { title: updated.title },
                      });
                    }
                  } else {
                    const created = await createTask.mutateAsync({
                      workstreamId,
                      title: data.title,
                      description: data.description,
                      status: data.status,
                      dueDate: data.dueDate ?? undefined,
                      startDate: data.startDate ?? undefined,
                      blockedReason: data.blockedReason ?? undefined,
                    });
                    if (user) {
                      createActivity.mutate({
                        projectId,
                        eventType: 'task_created',
                        userId: user.id,
                        entityType: 'task',
                        entityId: created.id,
                        summary: `Added task "${created.title}"`,
                        details: { title: created.title },
                      });
                    }
                  }
                  setTaskModal(null);
                }}
              />
            );
          })()}
      </Modal>
    </div>
  );
}

function WorkstreamForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial?: Workstream;
  onSubmit: (data: {
    name: string;
    type: WorkstreamType;
    status: WorkstreamStatus;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<WorkstreamType>(initial?.type ?? 'custom');
  const [status, setStatus] = useState<WorkstreamStatus>(
    initial?.status ?? 'not_started'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), type, status });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Workstream Name"
          placeholder="e.g., Design"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <div className="input-wrapper">
          <label className="label" htmlFor="workstream-type">
            Type
          </label>
          <select
            id="workstream-type"
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as WorkstreamType)}
          >
            <option value="design">Design</option>
            <option value="procurement">Procurement</option>
            <option value="installation">Installation</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="input-wrapper">
          <label className="label" htmlFor="workstream-status">
            Status
          </label>
          <select
            id="workstream-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as WorkstreamStatus)}
          >
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading} disabled={!name.trim()}>
          {initial ? 'Save Workstream' : 'Create Workstream'}
        </Button>
      </ModalFooter>
    </form>
  );
}

function TaskForm({
  initial,
  onSubmit,
  onCancel,
  onDelete,
  isLoading,
  isDeleting,
}: {
  initial?: Task;
  onSubmit: (data: {
    title: string;
    description?: string;
    status: TaskStatus;
    dueDate?: string | null;
    startDate?: string | null;
    blockedReason?: string | null;
  }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading: boolean;
  isDeleting: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'pending');
  const [dueDate, setDueDate] = useState(formatDateInput(initial?.dueDate));
  const [startDate, setStartDate] = useState(formatDateInput(initial?.startDate));
  const [blockedReason, setBlockedReason] = useState(initial?.blockedReason ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      status,
      dueDate: dueDate ? toIsoDate(dueDate) : null,
      startDate: startDate ? toIsoDate(startDate) : null,
      blockedReason: blockedReason.trim() ? blockedReason.trim() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g., Site survey"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <div className="input-wrapper">
          <label className="label" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            className="input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details for this task"
          />
        </div>
        <div className="input-wrapper">
          <label className="label" htmlFor="task-status">
            Status
          </label>
          <select
            id="task-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="input-wrapper">
            <label className="label" htmlFor="task-start-date">
              Start date
            </label>
            <input
              id="task-start-date"
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <label className="label" htmlFor="task-due-date">
              Due date
            </label>
            <input
              id="task-due-date"
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        {status === 'blocked' && (
          <div className="input-wrapper">
            <label className="label" htmlFor="task-blocked-reason">
              Blocked reason
            </label>
            <input
              id="task-blocked-reason"
              type="text"
              className="input"
              value={blockedReason}
              onChange={(e) => setBlockedReason(e.target.value)}
              placeholder="What's blocking this task?"
            />
          </div>
        )}
      </div>
      <ModalFooter className={onDelete ? 'justify-between' : undefined}>
        {onDelete && (
          <Button variant="danger" type="button" onClick={onDelete} loading={isDeleting}>
            Delete Task
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={!title.trim()}>
            {initial ? 'Save Task' : 'Create Task'}
          </Button>
        </div>
      </ModalFooter>
    </form>
  );
}

/**
 * Activity tab content
 */
function ActivityTab({ projectId }: { projectId: string }) {
  const { data: events = [], isLoading, error, refetch } = useProjectActivity(projectId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-bg-tertiary rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-sm text-red-400">
        Failed to load activity
        <div className="mt-3">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <ActivityFeed events={events} />;
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);

  const { data: project, isLoading, error, refetch } = useProject(projectId || '');
  const { data: projectRooms = [] } = useRoomsByProject(projectId || '');

  if (isLoading) {
    return (
      <main role="main" data-testid="project-detail-page" className="space-y-6">
        <LoadingSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main role="main" data-testid="project-detail-page">
        <ErrorState
          message={
            error instanceof Error ? error.message : 'An unexpected error occurred'
          }
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  if (!project) {
    return (
      <main role="main" data-testid="project-detail-page">
        <NotFoundState />
      </main>
    );
  }

  return (
    <main role="main" data-testid="project-detail-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Back to projects"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary text-balance">
              {project.name}
            </h1>
            <p className="text-text-secondary mt-0.5">{project.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSaveTemplateOpen(true)}
          >
            Save as Template
          </Button>
          <StatusPill status={project.status} />
        </div>
      </div>

      {/* Tabs */}
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <Card>
        <CardBody>
          {activeTab === 'overview' && (
            <OverviewTab
              project={project}
              projectId={project.id}
              onOpenRooms={() => setActiveTab('rooms')}
            />
          )}
          {activeTab === 'rooms' && <RoomsTab projectId={project.id} />}
          {activeTab === 'workstreams' && <WorkstreamsTab projectId={project.id} />}
          {activeTab === 'activity' && <ActivityTab projectId={project.id} />}
        </CardBody>
      </Card>

      <SaveAsTemplateModal
        isOpen={isSaveTemplateOpen}
        onClose={() => setIsSaveTemplateOpen(false)}
        type="project"
        project={project}
        rooms={projectRooms}
      />
    </main>
  );
}
