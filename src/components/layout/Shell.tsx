import type { ReactNode } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface ShellProps {
  children: ReactNode;
  className?: string;
  userInitials?: string;
  onSearchClick?: () => void;
  onUserMenuClick?: () => void;
}

export function Shell({
  children,
  className,
  userInitials,
  onSearchClick,
  onUserMenuClick,
  ...props
}: ShellProps & React.HTMLAttributes<HTMLDivElement>) {
  const sidebarExpanded = useAppStore((state) => state.sidebarExpanded);

  return (
    <div className={`shell ${className ?? ''}`} {...props}>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="shell-skip-link">
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main wrapper containing header and content */}
      <div
        className="shell-main-wrapper"
        data-sidebar-expanded={sidebarExpanded ? 'true' : 'false'}
      >
        {/* Header */}
        <Header
          userInitials={userInitials}
          onSearchClick={onSearchClick}
          onUserMenuClick={onUserMenuClick}
        />

        {/* Main content area */}
        <main id="main-content" className="shell-content" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
