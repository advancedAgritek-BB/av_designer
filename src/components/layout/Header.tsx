import { useAppStore } from '@/stores/app-store';
import { useProjectStore } from '@/stores/project-store';
import type { AppMode } from '@/types';

interface HeaderProps {
  userInitials?: string;
  onSearchClick?: () => void;
  onUserMenuClick?: () => void;
}

const MODE_LABELS: Record<AppMode, string> = {
  home: 'Home',
  projects: 'Projects',
  room_design: 'Room Design',
  drawings: 'Drawings',
  quoting: 'Quoting',
  standards: 'Standards',
  equipment: 'Equipment',
  templates: 'Templates',
  settings: 'Settings',
};

export function Header({ userInitials, onSearchClick, onUserMenuClick }: HeaderProps) {
  const currentMode = useAppStore((state) => state.currentMode);
  const currentProjectId = useAppStore((state) => state.currentProjectId);
  const currentRoomId = useAppStore((state) => state.currentRoomId);

  const projects = useProjectStore((state) => state.projects);
  const rooms = useProjectStore((state) => state.rooms);

  // Find current project and room
  const currentProject = currentProjectId
    ? projects.find((p) => p.id === currentProjectId)
    : null;
  const currentRoom = currentRoomId ? rooms.find((r) => r.id === currentRoomId) : null;

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: MODE_LABELS[currentMode], isCurrentPage: !currentProject && !currentRoom },
  ];

  if (currentProject) {
    breadcrumbItems.push({
      label: currentProject.name,
      isCurrentPage: !currentRoom,
      onClick: () => {
        // Navigate to project context (could dispatch action)
      },
    });
  }

  if (currentRoom) {
    breadcrumbItems.push({
      label: currentRoom.name,
      isCurrentPage: true,
    });
  }

  return (
    <header className="header" role="banner">
      <Breadcrumb items={breadcrumbItems} />
      <div className="header-actions">
        <SearchButton onClick={onSearchClick} />
        <UserMenuButton initials={userInitials} onClick={onUserMenuClick} />
      </div>
    </header>
  );
}

// Breadcrumb types and components
interface BreadcrumbItem {
  label: string;
  isCurrentPage: boolean;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="header-breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="breadcrumb-item"
            aria-current={item.isCurrentPage ? 'page' : undefined}
          >
            {index > 0 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
            )}
            {item.onClick && !item.isCurrentPage ? (
              <button
                type="button"
                className="breadcrumb-link"
                onClick={item.onClick}
                aria-label={item.label}
              >
                {item.label}
              </button>
            ) : (
              <span
                className={item.isCurrentPage ? 'breadcrumb-current' : 'breadcrumb-text'}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Search button
interface SearchButtonProps {
  onClick?: () => void;
}

function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      type="button"
      className="header-search-button"
      onClick={onClick}
      aria-label="Search"
    >
      <SearchIcon />
      <span className="header-search-shortcut">⌘K</span>
    </button>
  );
}

// User menu button
interface UserMenuButtonProps {
  initials?: string;
  onClick?: () => void;
}

function UserMenuButton({ initials, onClick }: UserMenuButtonProps) {
  return (
    <button
      type="button"
      className="header-user-button"
      onClick={onClick}
      aria-label="User menu"
    >
      <span className="header-user-avatar">{initials || '?'}</span>
    </button>
  );
}

// Icon components
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
