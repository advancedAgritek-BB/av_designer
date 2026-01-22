/**
 * Workstream Panel Component
 *
 * Displays a workstream with its tasks in a collapsible panel
 */
import { useState } from 'react';
import { Button } from '@/components/ui';
import { TaskList } from './TaskList';
import type { Workstream, Task, TaskStatus, WorkstreamStatus } from '../project-types';

interface WorkstreamPanelProps {
  workstream: Workstream;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  onAddTask?: () => void;
  onEditWorkstream?: () => void;
  defaultExpanded?: boolean;
}

/**
 * Workstream status colors
 */
const WORKSTREAM_STATUS_CONFIG: Record<
  WorkstreamStatus,
  { color: string; bgColor: string }
> = {
  not_started: { color: 'text-text-tertiary', bgColor: 'bg-bg-tertiary' },
  in_progress: { color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  blocked: { color: 'text-red-400', bgColor: 'bg-red-500/20' },
  complete: { color: 'text-green-400', bgColor: 'bg-green-500/20' },
};

export function WorkstreamPanel({
  workstream,
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onAddTask,
  onEditWorkstream,
  defaultExpanded = true,
}: WorkstreamPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const statusConfig = WORKSTREAM_STATUS_CONFIG[workstream.status];
  const completedTasks = tasks.filter((t) => t.status === 'complete').length;
  const totalTasks = tasks.length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-bg-secondary cursor-pointer hover:bg-bg-tertiary/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-text-tertiary transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>

          {/* Title */}
          <h3 className="font-medium text-text-primary">{workstream.name}</h3>

          {/* Status badge */}
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
          >
            {workstream.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          {totalTasks > 0 && (
            <span className="text-xs text-text-tertiary tabular-nums">
              {completedTasks}/{totalTasks} tasks
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onAddTask && (
              <Button variant="ghost" size="sm" onClick={onAddTask}>
                + Task
              </Button>
            )}
            {onEditWorkstream && (
              <button
                type="button"
                onClick={onEditWorkstream}
                className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Edit workstream"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-border">
          <TaskList
            tasks={tasks}
            onTaskClick={onTaskClick}
            onTaskStatusChange={onTaskStatusChange}
            emptyMessage="No tasks in this workstream"
          />
        </div>
      )}
    </div>
  );
}
