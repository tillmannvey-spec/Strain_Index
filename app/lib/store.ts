// Zustand Store for Global State Management

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Strain, StrainFilters } from '../types/strain';
import * as db from './db';

// Filter state interface
export interface FilterState {
  searchQuery: string;
  effects: string[];
  medicalConditions: string[];
  origin: string[];
  thcRange: { min: number; max: number } | null;
}

// App state interface
interface AppState {
  // Data
  strains: Strain[];
  isLoading: boolean;
  error: string | null;
  
  // Filters & Search
  filters: FilterState;
  searchQuery: string;
  
  // UI State
  isInitialized: boolean;
  lastSync: Date | null;
}

// Actions interface
interface AppActions {
  // Data Actions
  loadStrains: () => Promise<void>;
  addStrain: (strain: Omit<Strain, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateStrain: (id: string, strain: Partial<Strain>) => Promise<void>;
  deleteStrain: (id: string) => Promise<void>;
  refreshStrains: () => Promise<void>;
  
  // Filter Actions
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  
  // Utility Actions
  initialize: () => Promise<void>;
  clearError: () => void;
}

// Default filter state
const defaultFilters: FilterState = {
  searchQuery: '',
  effects: [],
  medicalConditions: [],
  origin: [],
  thcRange: null,
};

// Create the store with persistence
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial State
      strains: [],
      isLoading: false,
      error: null,
      filters: { ...defaultFilters },
      searchQuery: '',
      isInitialized: false,
      lastSync: null,

      // Initialize the store and database
      initialize: async () => {
        if (get().isInitialized) return;
        
        try {
          await db.initDB();
          await get().loadStrains();
          set({ isInitialized: true });
        } catch (error) {
          console.error('[Store] Initialization error:', error);
          set({ 
            error: 'Failed to initialize database',
            isInitialized: true 
          });
        }
      },

      // Load all strains from IndexedDB
      loadStrains: async () => {
        set({ isLoading: true, error: null });
        try {
          const strains = await db.getAllStrains();
          set({ 
            strains, 
            isLoading: false,
            lastSync: new Date()
          });
        } catch (error) {
          console.error('[Store] Load strains error:', error);
          set({ 
            error: 'Failed to load strains',
            isLoading: false 
          });
        }
      },

      // Add a new strain
      addStrain: async (strainData) => {
        set({ isLoading: true, error: null });
        try {
          const now = new Date();
          const newStrain: Strain = {
            ...strainData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
          };

          await db.addStrain(newStrain);
          
          // Update local state
          const { strains } = get();
          set({ 
            strains: [newStrain, ...strains],
            isLoading: false 
          });
        } catch (error) {
          console.error('[Store] Add strain error:', error);
          set({ 
            error: 'Failed to add strain',
            isLoading: false 
          });
          throw error;
        }
      },

      // Update an existing strain
      updateStrain: async (id, strainUpdate) => {
        set({ isLoading: true, error: null });
        try {
          await db.updateStrain(id, strainUpdate);
          
          // Update local state
          const { strains } = get();
          const updatedStrains = strains.map(strain => 
            strain.id === id 
              ? { ...strain, ...strainUpdate, updatedAt: new Date() }
              : strain
          );
          
          // Sort by updatedAt desc
          updatedStrains.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          set({ 
            strains: updatedStrains,
            isLoading: false 
          });
        } catch (error) {
          console.error('[Store] Update strain error:', error);
          set({ 
            error: 'Failed to update strain',
            isLoading: false 
          });
          throw error;
        }
      },

      // Delete a strain
      deleteStrain: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await db.deleteStrain(id);
          
          // Update local state
          const { strains } = get();
          set({ 
            strains: strains.filter(strain => strain.id !== id),
            isLoading: false 
          });
        } catch (error) {
          console.error('[Store] Delete strain error:', error);
          set({ 
            error: 'Failed to delete strain',
            isLoading: false 
          });
          throw error;
        }
      },

      // Refresh strains from database
      refreshStrains: async () => {
        await get().loadStrains();
      },

      // Set filters
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },

      // Reset filters
      resetFilters: () => {
        set({ filters: { ...defaultFilters } });
      },

      // Set search query
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'strain-index-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist filters and search query
        filters: state.filters,
        searchQuery: state.searchQuery,
      }),
    }
  )
);

// Selector hooks for derived state
export const useStrains = () => useAppStore((state) => state.strains);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useFilters = () => useAppStore((state) => state.filters);
export const useSearchQuery = () => useAppStore((state) => state.searchQuery);

// Get unique values for filters
export const useAvailableEffects = () => {
  const strains = useStrains();
  const effects = new Set<string>();
  strains.forEach(strain => {
    strain.effects.forEach(effect => effects.add(effect.name));
  });
  return Array.from(effects).sort();
};

export const useAvailableMedicalConditions = () => {
  const strains = useStrains();
  const conditions = new Set<string>();
  strains.forEach(strain => {
    strain.medicalUses.forEach(use => conditions.add(use.condition));
  });
  return Array.from(conditions).sort();
};

export const useAvailableOrigins = () => {
  const strains = useStrains();
  const origins = new Set<string>();
  strains.forEach(strain => {
    if (strain.origin) origins.add(strain.origin);
  });
  return Array.from(origins).sort();
};