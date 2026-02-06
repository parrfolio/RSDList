import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'GRID' | 'LIST';
export type SortOrder = 'ARTIST_ASC' | 'ARTIST_DESC';

interface UIState {
  viewMode: ViewMode;
  sortOrder: SortOrder;
  searchQuery: string;
  activeEventId: string | null;

  setViewMode: (mode: ViewMode) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setActiveEventId: (eventId: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      viewMode: 'GRID',
      sortOrder: 'ARTIST_ASC',
      searchQuery: '',
      activeEventId: null,

      setViewMode: (mode) => set({ viewMode: mode }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveEventId: (eventId) => set({ activeEventId: eventId }),
    }),
    {
      name: 'rsd-ui-store',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortOrder: state.sortOrder,
        activeEventId: state.activeEventId,
      }),
    },
  ),
);
