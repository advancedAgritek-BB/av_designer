/**
 * Task Card Component
 *
 * Displays a task in a compact card format
 */
import type { Task, TaskStatus } from '../project-types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange?: (status: TaskStatus) => void;
}

/**
 * Status configuration
 */
const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-bg-tertiary text-text-secondary' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-400' },
  blocked: { label: 'Blocked', className: 'bg-red-500/20 text-red-400' },
  complete: { label: 'Complete', className: 'bg-green-500/20 text-green-400' },
};

/**
 * Checkbox for task completion
 */
function TaskCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`size-4 rounded border flex items-center justify-center transition-colors ${
        checked
          ? 'bg-green-500 border-green-500'
          : 'border-border hover:border-text-tertiary'
      }`}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {checked && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M2 5l2 2 4-4" />
        </svg>
      )}
    </button>
  );
}

export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const statusConfig = STATUS_CONFIG[task.status];
  const isDone = task.status === 'complete';

  const handleCheckChange = (checked: boolean) => {
    if (onStatusChange) {
      onStatusChange(checked ? 'complete' : 'pending');
    }
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const isOverdue = task.dueDate && !isDone && new Date(task.dueDate) < new Date();

  return (
    <div
      onClick={onClick}
      className="p-3 bg-bg-secondary border border-border rounded-lg hover:border-white/20 transition-colors cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <TaskCheckbox checked={isDone} onChange={handleCheckChange} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-medium ${
                isDone ? 'text-text-tertiary line-through' : 'text-text-primary'
              } group-hover:text-accent-gold transition-colors`}
            >
              {task.title}
            </h4>

            {/* Status indicator */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
            {formattedDueDate && (
              <span className={isOverdue ? 'text-red-400' : ''}>
                {isOverdue ? 'Overdue: ' : ''}
                {formattedDueDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { STATUS_CONFIG as TASK_STATUS_CONFIG };
