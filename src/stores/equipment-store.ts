import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Equipment, EquipmentCategory, UUID } from '@/types';

interface EquipmentFilters {
  category: EquipmentCategory | null;
  manufacturer: string | null;
  searchQuery: string;
}

interface EquipmentState {
  // Data
  equipment: Equipment[];
  favorites: UUID[];

  // Selection
  selectedEquipmentId: UUID | null;

  // Filters
  filters: EquipmentFilters;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Data
  setEquipment: (equipment: Equipment[]) => void;
  addEquipment: (item: Equipment) => void;
  updateEquipment: (id: UUID, updates: Partial<Equipment>) => void;
  removeEquipment: (id: UUID) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Selection
  setSelectedEquipment: (id: UUID | null) => void;

  // Actions - Favorites
  toggleFavorite: (id: UUID) => void;
  isFavorite: (id: UUID) => boolean;

  // Actions - Filters
  setFilters: (filters: Partial<EquipmentFilters>) => void;
  clearFilters: () => void;

  // Selectors
  getEquipmentById: (id: UUID) => Equipment | undefined;
  getFilteredEquipment: () => Equipment[];
  getEquipmentByCategory: (category: EquipmentCategory) => Equipment[];
  getManufacturers: () => string[];
}

const defaultFilters: EquipmentFilters = {
  category: null,
  manufacturer: null,
  searchQuery: '',
};

export const useEquipmentStore = create<EquipmentState>()(
  devtools(
    (set, get) => ({
      // Initial state
      equipment: [],
      favorites: [],
      selectedEquipmentId: null,
      filters: defaultFilters,
      isLoading: false,
      error: null,

      // Data actions
      setEquipment: (equipment) =>
        set({ equipment, error: null }, false, 'setEquipment'),

      addEquipment: (item) =>
        set(
          (state) => ({ equipment: [...state.equipment, item] }),
          false,
          'addEquipment'
        ),

      updateEquipment: (id, updates) =>
        set(
          (state) => ({
            equipment: state.equipment.map((e) =>
              e.id === id
                ? { ...e, ...updates, updatedAt: new Date().toISOString() }
                : e
            ),
          }),
          false,
          'updateEquipment'
        ),

      removeEquipment: (id) =>
        set(
          (state) => ({
            equipment: state.equipment.filter((e) => e.id !== id),
            favorites: state.favorites.filter((fav) => fav !== id),
            selectedEquipmentId:
              state.selectedEquipmentId === id ? null : state.selectedEquipmentId,
          }),
          false,
          'removeEquipment'
        ),

      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      // Selection actions
      setSelectedEquipment: (id) =>
        set({ selectedEquipmentId: id }, false, 'setSelectedEquipment'),

      // Favorites actions
      toggleFavorite: (id) =>
        set(
          (state) => ({
            favorites: state.favorites.includes(id)
              ? state.favorites.filter((fav) => fav !== id)
              : [...state.favorites, id],
          }),
          false,
          'toggleFavorite'
        ),

      isFavorite: (id) => get().favorites.includes(id),

      // Filter actions
      setFilters: (filters) =>
        set(
          (state) => ({ filters: { ...state.filters, ...filters } }),
          false,
          'setFilters'
        ),

      clearFilters: () => set({ filters: defaultFilters }, false, 'clearFilters'),

      // Selectors
      getEquipmentById: (id) => get().equipment.find((e) => e.id === id),

      getFilteredEquipment: () => {
        const { equipment, filters } = get();
        return equipment.filter((item) => {
          if (filters.category && item.category !== filters.category) return false;
          if (filters.manufacturer && item.manufacturer !== filters.manufacturer)
            return false;
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const searchable = `${item.manufacturer} ${item.model} ${item.description}`.toLowerCase();
            if (!searchable.includes(query)) return false;
          }
          return true;
        });
      },

      getEquipmentByCategory: (category) =>
        get().equipment.filter((e) => e.category === category),

      getManufacturers: () => {
        const manufacturers = new Set(get().equipment.map((e) => e.manufacturer));
        return Array.from(manufacturers).sort();
      },
    }),
    { name: 'EquipmentStore' }
  )
);
