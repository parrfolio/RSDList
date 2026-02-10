import { useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReleases } from '@/hooks/useReleases';
import { fixTitleArtist } from '@/lib/releaseUtils';
import { useWants, useAddWant, useRemoveWant } from '@/hooks/useWants';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { useUIStore } from '@/stores/uiStore';
import { ReleaseCard } from '@/components/app/ReleaseCard';
import { ReleaseListItem } from '@/components/app/ReleaseListItem';
import { CreateEventDialog } from '@/components/app/CreateEventDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { BuyMeCoffee } from '@/components/app/BuyMeCoffee';
import { buildWantId, getEventLabel, parseEventId, type Want } from '@/types';

import albumViewIcon from '@/images/album-view.svg';
import listViewIcon from '@/images/list-view.svg';
import closeIcon from '@/images/close.svg';

/** Short header label: "RSD 2026" or "RSD BF 2025" */
function getShortEventLabel(eventId: string): string {
  const { year, season } = parseEventId(eventId);
  return season === 'spring' ? `RSD ${year}` : `RSD BF ${year}`;
}

export default function BrowsePage() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, isAdmin } = useAuth();
  const {
    viewMode,
    sortOrder,
    searchQuery,
    searchFocused,
    activeEventId,
    activeTags,
    setViewMode,
    setSortOrder,
    setSearchQuery,
    setSearchFocused,
    setActiveEventId,
    removeTag,
    clearTags,
  } = useUIStore();

  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: releases, isLoading: releasesLoading } = useReleases(activeEventId);
  const { data: wants } = useWants(activeEventId);
  const addWant = useAddWant();
  const removeWant = useRemoveWant();
  const deleteEvent = useDeleteEvent();

  // Set default event on first load
  useMemo(() => {
    if (!activeEventId && events && events.length > 0) {
      setActiveEventId(events[0].eventId);
    }
  }, [activeEventId, events, setActiveEventId]);

  // Build a wantId → Want lookup map
  const wantsMap = useMemo(() => {
    const map = new Map<string, Want>();
    if (wants) {
      for (const w of wants) {
        map.set(w.wantId, w);
      }
    }
    return map;
  }, [wants]);

  // Filter and sort releases
  const filteredReleases = useMemo(() => {
    if (!releases) return [];
    let filtered = releases;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) => r.artist.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (activeTags.length > 0) {
      filtered = filtered.filter((r) => {
        const releaseTags = [r.format, r.releaseType, r.label]
          .filter(Boolean)
          .map((t) => t!.toLowerCase());
        return activeTags.every((tag) => releaseTags.some((rt) => rt.includes(tag.toLowerCase())));
      });
    }

    // Sort by display artist (after fixTitleArtist correction)
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const aArtist = fixTitleArtist(a.title, a.artist).artist;
      const bArtist = fixTitleArtist(b.title, b.artist).artist;
      const cmp = aArtist.localeCompare(bArtist);
      return sortOrder === 'ARTIST_ASC' ? cmp : -cmp;
    });

    return sorted;
  }, [releases, searchQuery, sortOrder, activeTags]);

  const isLoading = eventsLoading || releasesLoading;

  /** Cycle to the next event when tapping the header title */
  const cycleEvent = () => {
    if (!events || events.length <= 1) return;
    const currentIdx = events.findIndex((e) => e.eventId === activeEventId);
    const nextIdx = (currentIdx + 1) % events.length;
    setActiveEventId(events[nextIdx].eventId);
  };

  // Auto-focus search when searchFocused flag is set
  useMemo(() => {
    if (searchFocused) {
      // Small delay to let the page render/scroll
      setTimeout(() => {
        searchInputRef.current?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [searchFocused]);

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Header: Event name + view toggle + settings */}
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="text-white font-bold text-2xl leading-tight tracking-tight select-none"
          onClick={cycleEvent}
          aria-label="Cycle event"
        >
          {activeEventId ? getShortEventLabel(activeEventId) : 'RSD'}
        </button>

        <div className="flex items-center gap-3">
          {/* Album (grid) view toggle */}
          <button
            type="button"
            onClick={() => setViewMode('GRID')}
            aria-label="Grid view"
            className="p-1"
          >
            <img
              src={albumViewIcon}
              alt="Grid view"
              className="h-5 w-5"
              style={viewMode === 'GRID' ? { filter: 'brightness(0) invert(1)' } : { opacity: 0.5 }}
            />
          </button>

          {/* List view toggle */}
          <button
            type="button"
            onClick={() => setViewMode('LIST')}
            aria-label="List view"
            className="p-1"
          >
            <img
              src={listViewIcon}
              alt="List view"
              className="h-5 w-5"
              style={viewMode === 'LIST' ? { filter: 'brightness(0) invert(1)' } : { opacity: 0.5 }}
            />
          </button>
        </div>
      </header>

      {/* Search input */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search artist or title…"
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            if (val === '') clearTags();
          }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            // Only clear searchFocused if query is empty
            if (!searchQuery.trim()) {
              // Delay to allow click events to fire first
              setTimeout(() => setSearchFocused(false), 200);
            }
          }}
          className="w-full rounded-lg bg-[#1e1e1e] border border-[#333] px-4 py-2.5 pr-10 text-sm text-white placeholder-[#777] focus:outline-none focus:border-[#555] transition-colors"
          aria-label="Search releases"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              clearTags();
              searchInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Clear search"
          >
            <img src={closeIcon} alt="" className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Search prompt */}
      {!isLoading && searchFocused && !searchQuery.trim() && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <p className="text-[#B3B3B3] text-sm leading-relaxed">
            Search for your favorite RSD release and add it to your want list!
          </p>
          <BuyMeCoffee />
        </div>
      )}

      {/* Only show results when not in empty search mode */}
      {!(searchFocused && !searchQuery.trim()) && (
        <>
          {/* Sort control (subtle) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#B3B3B3]">
              {filteredReleases.length} release{filteredReleases.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() =>
                setSortOrder(sortOrder === 'ARTIST_ASC' ? 'ARTIST_DESC' : 'ARTIST_ASC')
              }
              className="text-xs text-[#B3B3B3] hover:text-white transition-colors"
              aria-label={sortOrder === 'ARTIST_ASC' ? 'Sort A to Z' : 'Sort Z to A'}
            >
              {sortOrder === 'ARTIST_ASC' ? 'A → Z' : 'Z → A'}
            </button>
          </div>

          {/* Active tag filters */}
          {activeTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {activeTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-[#2a2a2a] px-3 py-1 text-xs text-white"
                >
                  {tag}
                  <button
                    className="ml-0.5 text-[#777] hover:text-white"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag} filter`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                className="text-xs text-[#777] hover:text-white transition-colors"
                onClick={clearTags}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <CreateEventDialog />

              {/* Event selector dropdown for admins */}
              <select
                value={activeEventId ?? ''}
                onChange={(e) => setActiveEventId(e.target.value || null)}
                className="rounded-md bg-[#1e1e1e] border border-[#333] px-2 py-1 text-xs text-[#B3B3B3] focus:outline-none focus:border-[#555]"
                aria-label="Select event"
              >
                {(events ?? []).map((e) => (
                  <option key={e.eventId} value={e.eventId}>
                    {getEventLabel(e.eventId)}
                  </option>
                ))}
              </select>

              {activeEventId && (
                <button
                  type="button"
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  onClick={() => {
                    const label = events?.find((e) => e.eventId === activeEventId);
                    if (
                      confirm(
                        `Delete "${label ? getEventLabel(label.eventId) : activeEventId}" and all its releases? This cannot be undone.`
                      )
                    ) {
                      deleteEvent.mutate(activeEventId, {
                        onSuccess: () => {
                          setActiveEventId(
                            events?.[0]?.eventId !== activeEventId
                              ? (events?.[0]?.eventId ?? null)
                              : (events?.[1]?.eventId ?? null)
                          );
                        },
                      });
                    }
                  }}
                  disabled={deleteEvent.isPending}
                >
                  {deleteEvent.isPending ? 'Deleting…' : 'Delete Event'}
                </button>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-lg bg-[#1e1e1e]" />
                  <Skeleton className="h-4 w-3/4 bg-[#1e1e1e]" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredReleases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[#777] text-sm">
                {searchQuery
                  ? 'No releases match your search'
                  : 'No releases available for this event yet'}
              </p>
            </div>
          )}

          {/* Grid view */}
          {!isLoading && viewMode === 'GRID' && filteredReleases.length > 0 && (
            <div className="grid-albums">
              {filteredReleases.map((release) => (
                <ReleaseCard
                  key={release.releaseId}
                  release={release}
                  want={wantsMap.get(buildWantId(release.eventId, release.releaseId))}
                  isAuthenticated={isAuthenticated}
                  onAddWant={(r) => addWant.mutate(r)}
                  onRemoveWant={(id) => removeWant.mutate(id)}
                />
              ))}
            </div>
          )}

          {/* List view */}
          {!isLoading && viewMode === 'LIST' && filteredReleases.length > 0 && (
            <div className="space-y-2">
              {filteredReleases.map((release) => (
                <ReleaseListItem
                  key={release.releaseId}
                  release={release}
                  want={wantsMap.get(buildWantId(release.eventId, release.releaseId))}
                  isAuthenticated={isAuthenticated}
                  onAddWant={(r) => addWant.mutate(r)}
                  onRemoveWant={(id) => removeWant.mutate(id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
