import { Link } from 'react-router-dom';
import { useAppStore } from '@/stores/app-store';
import { getRouteByMode } from '@/router';
import type { AppMode } from '@/types';

interface NavItem {
  mode: AppMode;
  label: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { mode: 'home', label: 'Home', icon: <HomeIcon /> },
  { mode: 'projects', label: 'Projects', icon: <FolderIcon /> },
  { mode: 'clients', label: 'Clients', icon: <UsersIcon /> },
  { mode: 'room_design', label: 'Room Design', icon: <PencilRulerIcon /> },
  { mode: 'drawings', label: 'Drawings', icon: <FileTextIcon /> },
  { mode: 'quoting', label: 'Quoting', icon: <DollarSignIcon /> },
  { mode: 'standards', label: 'Standards', icon: <ChartBarIcon /> },
];

const libraryNavItems: NavItem[] = [
  { mode: 'equipment', label: 'Equipment', icon: <PackageIcon /> },
  { mode: 'templates', label: 'Templates', icon: <BookOpenIcon /> },
];

const supportNavItems: NavItem[] = [
  { mode: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

/**
 * Get the route path for a nav item.
 * For room-specific routes (room_design, drawings, quoting),
 * returns a generic path if no room is selected.
 */
function getNavItemPath(mode: AppMode, currentRoomId: string | null): string {
  const route = getRouteByMode(mode);

  // For room-specific routes, substitute the roomId or use a placeholder
  if (route.includes(':roomId')) {
    if (currentRoomId) {
      return route.replace(':roomId', currentRoomId);
    }
    // If no room is selected, navigate to projects to select a room
    return '/projects';
  }

  return route;
}

function NavItemLink({
  item,
  isActive,
  isExpanded,
  currentRoomId,
}: {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  currentRoomId: string | null;
}) {
  const path = getNavItemPath(item.mode, currentRoomId);

  return (
    <Link
      to={path}
      className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span data-testid="nav-icon" aria-hidden="true" className="nav-icon">
        {item.icon}
      </span>
      <span className={isExpanded ? '' : 'sr-only'}>{item.label}</span>
    </Link>
  );
}

function SectionHeading({
  children,
  isExpanded,
}: {
  children: React.ReactNode;
  isExpanded: boolean;
}) {
  return <h3 className={`section-heading ${isExpanded ? '' : 'sr-only'}`}>{children}</h3>;
}

export function Sidebar() {
  const currentMode = useAppStore((state) => state.currentMode);
  const sidebarExpanded = useAppStore((state) => state.sidebarExpanded);
  const currentRoomId = useAppStore((state) => state.currentRoomId);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <nav
      className="sidebar sidebar-transition"
      aria-label="Main navigation"
      data-expanded={sidebarExpanded ? 'true' : 'false'}
    >
      {/* Branding */}
      <div className="sidebar-branding">
        <span className="sidebar-logo" aria-hidden="true">
          <LogoIcon />
        </span>
        <span className={sidebarExpanded ? 'sidebar-title' : 'sr-only'}>AV Designer</span>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-section">
        {mainNavItems.map((item) => (
          <NavItemLink
            key={item.mode}
            item={item}
            isActive={currentMode === item.mode}
            isExpanded={sidebarExpanded}
            currentRoomId={currentRoomId}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="sidebar-divider" aria-hidden="true" />

      {/* Libraries Section */}
      <div className="sidebar-section">
        <SectionHeading isExpanded={sidebarExpanded}>Libraries</SectionHeading>
        {libraryNavItems.map((item) => (
          <NavItemLink
            key={item.mode}
            item={item}
            isActive={currentMode === item.mode}
            isExpanded={sidebarExpanded}
            currentRoomId={currentRoomId}
          />
        ))}
      </div>

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* Support Section */}
      <div className="sidebar-section">
        {supportNavItems.map((item) => (
          <NavItemLink
            key={item.mode}
            item={item}
            isActive={currentMode === item.mode}
            isExpanded={sidebarExpanded}
            currentRoomId={currentRoomId}
          />
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <span data-testid="nav-icon" aria-hidden="true" className="nav-icon">
          {sidebarExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </span>
      </button>
    </nav>
  );
}

// Icon Components - Simple SVG icons (Lucide-style, 20px, 1.5px stroke)
function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PencilRulerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 5 4 4" />
      <path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13" />
      <path d="m8 6 2-2" />
      <path d="m2 22 5.5-1.5L21.17 6.83a2.82 2.82 0 0 0-4-4L3.5 16.5Z" />
      <path d="m18 16 2-2" />
      <path d="m17 11 4.3 4.3a2.41 2.41 0 0 1 0 3.4l-2.6 2.6a2.41 2.41 0 0 1-3.4 0L11 17" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function DollarSignIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}
