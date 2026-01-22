/**
 * Quick Actions Bar
 * Dashboard header with title, search, and quick action buttons
 */

import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';

// ============================================================================
// Types
// ============================================================================

interface QuickActionsBarProps {
  onSearchChange?: (query: string) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Dashboard header bar with title, action buttons, and optional search
 */
export function QuickActionsBar({ onSearchChange }: QuickActionsBarProps) {
  const navigate = useNavigate();

  const handleNewProject = () => {
    navigate('/projects?new=true');
  };

  const handleNewRoom = () => {
    navigate('/rooms/new');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  return (
    <div className="dashboard-header">
      <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
      <div className="dashboard-actions">
        <Button variant="primary" size="sm" onClick={handleNewProject}>
          + New Project
        </Button>
        <Button variant="secondary" size="sm" onClick={handleNewRoom}>
          + New Room
        </Button>
        <div style={{ width: 200 }}>
          <Input
            placeholder="Search..."
            size="sm"
            onChange={handleSearchChange}
            aria-label="Search dashboard"
          />
        </div>
      </div>
    </div>
  );
}
