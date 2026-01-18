import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project, Room, UUID } from '@/types';

interface ProjectState {
  // Data
  projects: Project[];
  rooms: Room[];

  // Loading states
  isLoadingProjects: boolean;
  isLoadingRooms: boolean;

  // Error states
  projectsError: string | null;
  roomsError: string | null;

  // Actions - Projects
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: UUID, updates: Partial<Project>) => void;
  removeProject: (id: UUID) => void;
  setProjectsLoading: (loading: boolean) => void;
  setProjectsError: (error: string | null) => void;

  // Actions - Rooms
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: UUID, updates: Partial<Room>) => void;
  removeRoom: (id: UUID) => void;
  setRoomsLoading: (loading: boolean) => void;
  setRoomsError: (error: string | null) => void;

  // Selectors
  getProjectById: (id: UUID) => Project | undefined;
  getRoomById: (id: UUID) => Room | undefined;
  getRoomsByProjectId: (projectId: UUID) => Room[];
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // Initial state
      projects: [],
      rooms: [],
      isLoadingProjects: false,
      isLoadingRooms: false,
      projectsError: null,
      roomsError: null,

      // Project actions
      setProjects: (projects) =>
        set({ projects, projectsError: null }, false, 'setProjects'),

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] }), false, 'addProject'),

      updateProject: (id, updates) =>
        set(
          (state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
            ),
          }),
          false,
          'updateProject'
        ),

      removeProject: (id) =>
        set(
          (state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            rooms: state.rooms.filter((r) => r.projectId !== id),
          }),
          false,
          'removeProject'
        ),

      setProjectsLoading: (loading) =>
        set({ isLoadingProjects: loading }, false, 'setProjectsLoading'),

      setProjectsError: (error) =>
        set({ projectsError: error }, false, 'setProjectsError'),

      // Room actions
      setRooms: (rooms) => set({ rooms, roomsError: null }, false, 'setRooms'),

      addRoom: (room) =>
        set((state) => ({ rooms: [...state.rooms, room] }), false, 'addRoom'),

      updateRoom: (id, updates) =>
        set(
          (state) => ({
            rooms: state.rooms.map((r) =>
              r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            ),
          }),
          false,
          'updateRoom'
        ),

      removeRoom: (id) =>
        set(
          (state) => ({
            rooms: state.rooms.filter((r) => r.id !== id),
          }),
          false,
          'removeRoom'
        ),

      setRoomsLoading: (loading) =>
        set({ isLoadingRooms: loading }, false, 'setRoomsLoading'),

      setRoomsError: (error) => set({ roomsError: error }, false, 'setRoomsError'),

      // Selectors
      getProjectById: (id) => get().projects.find((p) => p.id === id),

      getRoomById: (id) => get().rooms.find((r) => r.id === id),

      getRoomsByProjectId: (projectId) =>
        get().rooms.filter((r) => r.projectId === projectId),
    }),
    { name: 'ProjectStore' }
  )
);
