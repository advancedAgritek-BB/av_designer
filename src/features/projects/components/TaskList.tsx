/**
 * Task List Component
 *
 * Displays a list of tasks with optional grouping
 */
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '../project-types';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  emptyMessage = 'No tasks',
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-text-tertiary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task)}
          onStatusChange={
            onTaskStatusChange
              ? (status) => onTaskStatusChange(task.id, status)
              : undefined
          }
        />
      ))}
    </div>
  );
}
