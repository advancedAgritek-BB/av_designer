import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { useAuthStore } from '@/features/auth/auth-store';
import type { User } from '@/features/auth/auth-types';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserMenu({ isOpen, onClose, user }: UserMenuProps) {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="user-menu-overlay" role="presentation" onClick={onClose}>
      <div
        className="user-menu"
        role="menu"
        aria-label="User menu"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="user-menu-header">
          <p className="user-menu-name">{user?.fullName || 'Account'}</p>
          {user?.email && <p className="user-menu-email">{user.email}</p>}
        </div>
        <div className="user-menu-items">
          <button
            type="button"
            role="menuitem"
            className="user-menu-item"
            onClick={() => {
              navigate(ROUTES.SETTINGS);
              onClose();
            }}
          >
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            className="user-menu-item user-menu-item-danger"
            onClick={() => {
              void signOut();
              onClose();
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
