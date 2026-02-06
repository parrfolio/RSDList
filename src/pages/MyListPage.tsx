import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWants, useRemoveWant, useToggleWantStatus } from '@/hooks/useWants';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Check, Disc3, Heart, ShoppingBag } from 'lucide-react';
import type { Want } from '@/types';

export default function MyListPage() {
  const { isAuthenticated } = useAuth();
  const { activeEventId } = useUIStore();
  const { data: wants, isLoading } = useWants(activeEventId);
  const removeWant = useRemoveWant();
  const toggleStatus = useToggleWantStatus();

  const { wanted, acquired } = useMemo(() => {
    const w: Want[] = [];
    const a: Want[] = [];
    if (wants) {
      for (const want of wants) {
        if (want.status === 'WANTED') w.push(want);
        else a.push(want);
      }
    }
    // Sort alphabetically by artist
    w.sort((x, y) => x.artist.localeCompare(y.artist));
    a.sort((x, y) => x.artist.localeCompare(y.artist));
    return { wanted: w, acquired: a };
  }, [wants]);

  const total = wanted.length + acquired.length;
  const progress = total > 0 ? Math.round((acquired.length / total) * 100) : 0;

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
        <h3 className="text-lg font-semibold">Your list is empty</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-4">
          Browse releases and tap "Want" to start building your list
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
          <h2 className="text-xl font-bold">My List</h2>
          <span className="text-sm text-muted-foreground">
            {acquired.length} / {total} acquired
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="wanted">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wanted" className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            Wanted
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {wanted.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="acquired" className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Acquired
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {acquired.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wanted" className="space-y-2 pt-2">
          {wanted.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              All done! You've acquired everything on your list 🎉
            </p>
          ) : (
            wanted.map((want) => (
              <WantListItem
                key={want.wantId}
                want={want}
                onToggle={() =>
                  toggleStatus.mutate({ wantId: want.wantId, newStatus: 'ACQUIRED' })
                }
                onRemove={() => removeWant.mutate(want.wantId)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="acquired" className="space-y-2 pt-2">
          {acquired.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No acquisitions yet — happy hunting!
            </p>
          ) : (
            acquired.map((want) => (
              <WantListItem
                key={want.wantId}
                want={want}
                acquired
                onToggle={() =>
                  toggleStatus.mutate({ wantId: want.wantId, newStatus: 'WANTED' })
                }
                onRemove={() => removeWant.mutate(want.wantId)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WantListItem({
  want,
  acquired,
  onToggle,
  onRemove,
}: {
  want: Want;
  acquired?: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <Card className={acquired ? 'opacity-70' : ''}>
      <CardContent className="flex items-center gap-3 p-3">
        {/* Thumbnail */}
        <div className="h-12 w-12 rounded bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
          {want.imageUrl ? (
            <img
              src={want.imageUrl}
              alt={want.artist}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Disc3 className="h-6 w-6 text-muted-foreground/30" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate">
            {want.artist}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{want.title}</p>
          {want.format && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 mt-0.5">
              {want.format}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <Button size="sm" variant={acquired ? 'secondary' : 'default'} onClick={onToggle}>
            {acquired ? 'Undo' : <Check className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={onRemove}>
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
