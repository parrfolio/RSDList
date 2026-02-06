import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWants, useRemoveWant, useToggleWantStatus } from '@/hooks/useWants';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Disc3, Heart, ShoppingBag, LayoutGrid, List, X } from 'lucide-react';
import type { Want } from '@/types';

/** Extract a numeric timestamp from a Firestore-style addedAt field */
function getAddedAtMs(want: Want): number {
  const ts = want.addedAt;
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  return 0;
}

export default function MyListPage() {
  const { isAuthenticated } = useAuth();
  const { activeEventId, viewMode, setViewMode } = useUIStore();
  const { data: wants, isLoading } = useWants(activeEventId);
  const removeWant = useRemoveWant();
  const toggleStatus = useToggleWantStatus();

  // Single flat list sorted by addedAt ascending
  const sortedWants = useMemo(() => {
    if (!wants) return [];
    return [...wants].sort((a, b) => getAddedAtMs(a) - getAddedAtMs(b));
  }, [wants]);

  const acquiredCount = useMemo(
    () => sortedWants.filter((w) => w.status === 'ACQUIRED').length,
    [sortedWants]
  );
  const total = sortedWants.length;
  const progress = total > 0 ? Math.round((acquiredCount / total) * 100) : 0;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-semibold">Sign in to track your wants</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-4">
          Create an account to save and manage your RSD wants list
        </p>
        <Button asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Disc3 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-semibold">Your wants list is empty</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-4">
          Browse releases and tap &ldquo;Want&rdquo; to start building your list
        </p>
        <Button asChild>
          <Link to="/rsd">Browse Releases</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My RSD Wants</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {acquiredCount} / {total} found
            </span>
            <Button
              variant={viewMode === 'GRID' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('GRID')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'LIST' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('LIST')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Grid view */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sortedWants.map((want) => (
            <WantGridItem
              key={want.wantId}
              want={want}
              onToggle={() =>
                toggleStatus.mutate({
                  wantId: want.wantId,
                  newStatus: want.status === 'WANTED' ? 'ACQUIRED' : 'WANTED',
                })
              }
              onRemove={() => removeWant.mutate(want.wantId)}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'LIST' && (
        <div className="space-y-2">
          {sortedWants.map((want) => (
            <WantListItem
              key={want.wantId}
              want={want}
              onToggle={() =>
                toggleStatus.mutate({
                  wantId: want.wantId,
                  newStatus: want.status === 'WANTED' ? 'ACQUIRED' : 'WANTED',
                })
              }
              onRemove={() => removeWant.mutate(want.wantId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  List-view item                                                     */
/* ------------------------------------------------------------------ */
function WantListItem({
  want,
  onToggle,
  onRemove,
}: {
  want: Want;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const isAcquired = want.status === 'ACQUIRED';

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        {/* Clickable album art */}
        <Link
          to={`/release/${want.releaseId}`}
          className="h-24 w-24 rounded bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden"
        >
          {want.imageUrl ? (
            <img
              src={want.imageUrl}
              alt={want.artist}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Disc3 className="h-8 w-8 text-muted-foreground/30" />
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate">
            {want.title} &ndash; {want.artist}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {want.format && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                {want.format}
              </Badge>
            )}
            {want.releaseType && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                {want.releaseType}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant={isAcquired ? 'default' : 'outline'}
            className={isAcquired ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
            onClick={onToggle}
          >
            {isAcquired && <Check className="h-4 w-4 mr-1" />}
            Found!
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid-view item                                                     */
/* ------------------------------------------------------------------ */
function WantGridItem({
  want,
  onToggle,
  onRemove,
}: {
  want: Want;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const isAcquired = want.status === 'ACQUIRED';

  return (
    <Card className="overflow-hidden">
      {/* Clickable album art */}
      <Link
        to={`/release/${want.releaseId}`}
        className="block aspect-square bg-muted flex items-center justify-center overflow-hidden"
      >
        {want.imageUrl ? (
          <img
            src={want.imageUrl}
            alt={want.artist}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Disc3 className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </Link>

      <CardContent className="p-2 space-y-1.5">
        <p className="text-xs font-medium leading-tight line-clamp-1">
          {want.artist} &ndash; {want.title}
        </p>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={isAcquired ? 'default' : 'outline'}
            className={`flex-1 text-xs h-7 ${
              isAcquired ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''
            }`}
            onClick={onToggle}
          >
            {isAcquired && <Check className="h-3 w-3 mr-0.5" />}
            Found!
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground h-7 w-7 p-0"
            onClick={onRemove}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
