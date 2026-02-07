import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'GRID' | 'LIST';
export type SortOrder = 'ARTIST_ASC' | 'ARTIST_DESC';

interface UIState {
    viewMode: ViewMode;
    sortOrder: SortOrder;
    searchQuery: string;
    searchFocused: boolean;
    activeEventId: string | null;
    activeTags: string[];

    setViewMode: (mode: ViewMode) => void;
    setSortOrder: (order: SortOrder) => void;
    setSearchQuery: (query: string) => void;
    setSearchFocused: (focused: boolean) => void;
    setActiveEventId: (eventId: string | null) => void;
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    clearTags: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            viewMode: 'GRID',
            sortOrder: 'ARTIST_ASC',
            searchQuery: '',
            searchFocused: false,
            activeEventId: null,
            activeTags: [],

            setViewMode: (mode) => set({ viewMode: mode }),
            setSortOrder: (order) => set({ sortOrder: order }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSearchFocused: (focused) => set({ searchFocused: focused }),
            setActiveEventId: (eventId) => set({ activeEventId: eventId }),
            addTag: (tag) =>
                set((state) => ({
                    activeTags: state.activeTags.includes(tag)
                        ? state.activeTags
                        : [...state.activeTags, tag],
                })),
            removeTag: (tag) =>
                set((state) => ({
                    activeTags: state.activeTags.filter((t) => t !== tag),
                })),
            clearTags: () => set({ activeTags: [] }),
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
