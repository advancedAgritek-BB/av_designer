import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppMode, UUID } from '@/types';

interface AppState {
  // UI State
  currentMode: AppMode;
  sidebarExpanded: boolean;

  // Context State
  currentProjectId: UUID | null;
  currentRoomId: UUID | null;

  // Actions
  setMode: (mode: AppMode) => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setCurrentProject: (projectId: UUID | null) => void;
  setCurrentRoom: (roomId: UUID | null) => void;
  resetContext: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        currentMode: 'home',
        sidebarExpanded: true,
        currentProjectId: null,
        currentRoomId: null,

        // Actions
        setMode: (mode) => set({ currentMode: mode }, false, 'setMode'),

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarExpanded: !state.sidebarExpanded }),
            false,
            'toggleSidebar'
          ),

        setSidebarExpanded: (expanded) =>
          set({ sidebarExpanded: expanded }, false, 'setSidebarExpanded'),

        setCurrentProject: (projectId) =>
          set(
            { currentProjectId: projectId, currentRoomId: null },
            false,
            'setCurrentProject'
          ),

        setCurrentRoom: (roomId) =>
          set({ currentRoomId: roomId }, false, 'setCurrentRoom'),

        resetContext: () =>
          set(
            { currentProjectId: null, currentRoomId: null, currentMode: 'home' },
            false,
            'resetContext'
          ),
      }),
      {
        name: 'av-designer-app-store',
        partialize: (state) => ({
          sidebarExpanded: state.sidebarExpanded,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);
