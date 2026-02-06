import type { Release, Want } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Check, Disc3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReleaseListItemProps {
  release: Release;
  want?: Want;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onAddWant: (release: Release) => void;
  onRemoveWant: (wantId: string) => void;
  onTagClick?: (tag: string) => void;
  onDeleteRelease?: (releaseId: string) => void;
}

export function ReleaseListItem({
  release,
  want,
  isAuthenticated,
  isAdmin,
  onAddWant,
  onRemoveWant,
  onTagClick,
  onDeleteRelease,
}: ReleaseListItemProps) {
  const isWanted = want?.status === 'WANTED';
  const isAcquired = want?.status === 'ACQUIRED';
  const hasWant = !!want && (isWanted || isAcquired);

  return (
    <Link to={`/release/${release.releaseId}`} className="block">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
          isAcquired ? 'opacity-60 bg-success/5' : 'bg-card'
        }`}
      >
        {/* Thumbnail */}
        <div className="h-24 w-24 rounded bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
          {release.imageUrl ? (
            <img
              src={release.imageUrl}
              alt={release.artist}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Disc3 className="h-10 w-10 text-muted-foreground/30" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate">
            {release.title} – {release.artist}
          </h3>
          {release.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {release.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            {release.format && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-secondary/80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick?.(release.format!);
                }}
              >
                {release.format}
              </Badge>
            )}
            {release.releaseType && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-muted"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick?.(release.releaseType!);
                }}
              >
                {release.releaseType}
              </Badge>
            )}
            {release.label && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-muted"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick?.(release.label!);
                }}
              >
                {release.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {isAuthenticated && (
          <div className="flex-shrink-0">
            {!hasWant ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddWant(release);
                }}
              >
                <Heart className="h-4 w-4 mr-1" />
                Want
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveWant(want!.wantId);
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Added
              </Button>
            )}
          </div>
        )}

        {/* Admin delete */}
        {isAdmin && onDeleteRelease && (
          <Button
            size="sm"
            variant="ghost"
            className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm(`Delete "${release.artist} – ${release.title}"?`)) {
                onDeleteRelease(release.releaseId);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Link>
  );
}
