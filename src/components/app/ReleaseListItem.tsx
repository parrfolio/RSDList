import type { Release, Want } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Check, Disc3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReleaseListItemProps {
  release: Release;
  want?: Want;
  isAuthenticated: boolean;
  onAddWant: (release: Release) => void;
  onRemoveWant: (wantId: string) => void;
  onToggleAcquired: (wantId: string, newStatus: 'WANTED' | 'ACQUIRED') => void;
}

export function ReleaseListItem({
  release,
  want,
  isAuthenticated,
  onAddWant,
  onRemoveWant,
  onToggleAcquired,
}: ReleaseListItemProps) {
  const isWanted = want?.status === 'WANTED';
  const isAcquired = want?.status === 'ACQUIRED';

  return (
    <Link to={`/release/${release.releaseId}`} className="block">
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
        isAcquired ? 'opacity-60 bg-success/5' : 'bg-card'
      }`}
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 rounded bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
        {release.imageUrl ? (
          <img
            src={release.imageUrl}
            alt={release.artist}
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
          {release.artist}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{release.title}</p>
        <div className="flex gap-1 mt-0.5">
          {release.format && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              {release.format}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      {isAuthenticated && (
        <div className="flex-shrink-0">
          {!want ? (
            <Button
              size="sm"
              variant="ge) => {
                e.preventDefault();
                e.stopPropagation();
                onAddWant(release);
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          ) : isWanted ? (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleAcquired(want.wantId, 'ACQUIRED');
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveWant(want.wantId);
                }
                onClick={() => onRemoveWant(want.wantId)}
    </Link>
              >
                ✕
              </Button>
            </div>
          ) : (
            <Badge className="bg-success text-success-foreground">
              <Check className="h-3 w-3 mr-1" />
              Got
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
