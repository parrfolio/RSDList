import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWants, useAddWant, useRemoveWant, useToggleWantStatus } from '@/hooks/useWants';
import { useReleases } from '@/hooks/useReleases';
import { useUIStore } from '@/stores/uiStore';
import { ReleaseCard } from '@/components/app/ReleaseCard';
import { ReleaseListItem } from '@/components/app/ReleaseListItem';
import { Skeleton } from '@/components/ui/skeleton';
import { buildWantId } from '@/types';
import type { Release, Want } from '@/types';

import albumViewIcon from '@/images/album-view.svg';
import listViewIcon from '@/images/list-view.svg';

export default function MyListPage() {
  const { isAuthenticated } = useAuth();
  const { activeEventId, viewMode, sortOrder, setViewMode } = useUIStore();
  const { data: wants, isLoading: wantsLoading } = useWants(activeEventId);
  const { data: releases, isLoading: releasesLoading } = useReleases(activeEventId);
  const addWant = useAddWant();
  const removeWant = useRemoveWant();
  const toggleStatus = useToggleWantStatus();

  const isLoading = wantsLoading || releasesLoading;

  // Build wantId → Want lookup
  const wantsMap = useMemo(() => {
    const map = new Map<string, Want>();
    if (wants) {
      for (const w of wants) {
        map.set(w.wantId, w);
      }
    }
    return map;
  }, [wants]);

  // Filter releases to only those in the wants list, sorted by artist
  const wantedReleases = useMemo(() => {
    if (!releases || !wants || wants.length === 0) return [];

    const wantedIds = new Set(wants.map((w) => w.releaseId));
    const filtered = releases.filter((r) => wantedIds.has(r.releaseId));

    // Fallback: build Release-like objects for wants with no matching release
    const foundReleaseIds = new Set(filtered.map((r) => r.releaseId));
    const fallbackReleases: Release[] = wants
      .filter((w) => !foundReleaseIds.has(w.releaseId))
      .map((w) => ({
        releaseId: w.releaseId,
        eventId: w.eventId,
        artist: w.artist,
        title: w.title,
        imageUrl: w.imageUrl ?? null,
        format: w.format ?? null,
        releaseType: w.releaseType ?? null,
        label: null,
        quantity: null,
        description: null,
        detailsUrl: null,
      }));

    const all = [...filtered, ...fallbackReleases];

    // Sort same as browse
    all.sort((a, b) => {
      const cmp = a.artist.localeCompare(b.artist);
      return sortOrder === 'ARTIST_ASC' ? cmp : -cmp;
    });

    return all;
  }, [releases, wants, sortOrder]);

  const acquiredCount = useMemo(
    () => (wants ?? []).filter((w) => w.status === 'ACQUIRED').length,
    [wants]
  );
  const total = wants?.length ?? 0;

  // --- Not authenticated ---
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-[#B3B3B3] text-sm">
          <Link to="/auth" className="text-[#E8A530] hover:underline">
            Sign in
          </Link>{' '}
          to track your wants
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Header: "Your List" + view toggle */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl leading-tight tracking-tight">Your List</h1>
          {!isLoading && total > 0 && (
            <p className="text-xs text-[#B3B3B3] mt-0.5">
              {acquiredCount} of {total} found
            </p>
          )}
        </div>

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

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg bg-[#1e1e1e]" />
              <Skeleton className="h-4 w-3/4 bg-[#1e1e1e]" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && total === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[#B3B3B3] text-sm">No releases in your list yet</p>
          <Link to="/rsd" className="text-[#E8A530] text-sm mt-2 hover:underline">
            Browse Releases
          </Link>
        </div>
      )}

      {/* Grid view */}
      {!isLoading && viewMode === 'GRID' && wantedReleases.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {wantedReleases.map((release) => (
            <ReleaseCard
              key={release.releaseId}
              release={release}
              want={wantsMap.get(buildWantId(release.eventId, release.releaseId))}
              isAuthenticated={isAuthenticated}
              onAddWant={(r) => addWant.mutate(r)}
              onRemoveWant={(id) => removeWant.mutate(id)}
              onToggleStatus={(wantId, newStatus) => toggleStatus.mutate({ wantId, newStatus })}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {!isLoading && viewMode === 'LIST' && wantedReleases.length > 0 && (
        <div className="space-y-2">
          {wantedReleases.map((release) => (
            <ReleaseListItem
              key={release.releaseId}
              release={release}
              want={wantsMap.get(buildWantId(release.eventId, release.releaseId))}
              isAuthenticated={isAuthenticated}
              onAddWant={(r) => addWant.mutate(r)}
              onRemoveWant={(id) => removeWant.mutate(id)}
              onToggleStatus={(wantId, newStatus) => toggleStatus.mutate({ wantId, newStatus })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
