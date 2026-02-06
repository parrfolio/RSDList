import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReleases, useDeleteRelease } from '@/hooks/useReleases';
import { useWants, useAddWant, useRemoveWant } from '@/hooks/useWants';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { useUIStore } from '@/stores/uiStore';
import { ReleaseCard } from '@/components/app/ReleaseCard';
import { ReleaseListItem } from '@/components/app/ReleaseListItem';
import { CreateEventDialog } from '@/components/app/CreateEventDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid, List, ArrowDownAZ, ArrowUpAZ, Search, Disc3, Trash2 } from 'lucide-react';
import { buildWantId, getEventLabel, type Want } from '@/types';

export default function BrowsePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const {
    viewMode,
    sortOrder,
    searchQuery,
    activeEventId,
    activeTags,
    setViewMode,
    setSortOrder,
    setSearchQuery,
    setActiveEventId,
    addTag,
    removeTag,
    clearTags,
  } = useUIStore();

  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: releases, isLoading: releasesLoading } = useReleases(activeEventId);
  const { data: wants } = useWants(activeEventId);
  const addWant = useAddWant();
  const removeWant = useRemoveWant();
  const deleteRelease = useDeleteRelease();
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

    // Sort
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const cmp = a.artist.localeCompare(b.artist);
      return sortOrder === 'ARTIST_ASC' ? cmp : -cmp;
    });

    return sorted;
  }, [releases, searchQuery, sortOrder, activeTags]);

  const isLoading = eventsLoading || releasesLoading;

  return (
    <div className="space-y-4">
      {/* Event selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={activeEventId ?? ''} onValueChange={setActiveEventId}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select RSD event" />
          </SelectTrigger>
          <SelectContent>
            {(events ?? []).map((e) => (
              <SelectItem key={e.eventId} value={e.eventId}>
                {getEventLabel(e.eventId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-xs">
          {filteredReleases.length} releases
        </Badge>
        {isAdmin && <CreateEventDialog />}
        {isAdmin && activeEventId && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
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
            <Trash2 className="h-3.5 w-3.5" />
            {deleteEvent.isPending ? 'Deleting...' : 'Delete List'}
          </Button>
        )}
      </div>

      {/* Search + view controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search artist or title..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val === '') clearTags();
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'ARTIST_ASC' ? 'ARTIST_DESC' : 'ARTIST_ASC')}
          title={sortOrder === 'ARTIST_ASC' ? 'A → Z' : 'Z → A'}
        >
          {sortOrder === 'ARTIST_ASC' ? (
            <ArrowDownAZ className="h-4 w-4" />
          ) : (
            <ArrowUpAZ className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant={viewMode === 'GRID' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('GRID')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'LIST' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('LIST')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Active tag filters */}
      {activeTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 text-xs">
              {tag}
              <button
                className="ml-0.5 hover:text-destructive"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag} filter`}
              >
                ✕
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={clearTags}>
            Clear all
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredReleases.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Disc3 className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold">No releases found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {searchQuery
              ? 'Try a different search term'
              : 'No releases available for this event yet'}
          </p>
        </div>
      )}

      {/* Grid view */}
      {!isLoading && viewMode === 'GRID' && filteredReleases.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredReleases.map((release) => (
            <ReleaseCard
              key={release.releaseId}
              release={release}
              want={wantsMap.get(buildWantId(release.eventId, release.releaseId))}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onAddWant={(r) => addWant.mutate(r)}
              onRemoveWant={(id) => removeWant.mutate(id)}
              onDeleteRelease={(id) => deleteRelease.mutate(id)}
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
              isAdmin={isAdmin}
              onAddWant={(r) => addWant.mutate(r)}
              onRemoveWant={(id) => removeWant.mutate(id)}
              onTagClick={(tag) => addTag(tag)}
              onDeleteRelease={(id) => deleteRelease.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
