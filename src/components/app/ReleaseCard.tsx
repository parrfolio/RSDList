import type { Release, Want } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Check, Disc3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReleaseCardProps {
  release: Release;
  want?: Want;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onAddWant: (release: Release) => void;
  onRemoveWant: (wantId: string) => void;
  onToggleAcquired: (wantId: string, newStatus: 'WANTED' | 'ACQUIRED') => void;
  onDeleteRelease?: (releaseId: string) => void;
}

export function ReleaseCard({
  release,
  want,
  isAuthenticated,
  isAdmin,
  onAddWant,
  onRemoveWant,
  onToggleAcquired,
  onDeleteRelease,
}: ReleaseCardProps) {
  const isWanted = want?.status === 'WANTED';
  const isAcquired = want?.status === 'ACQUIRED';

  return (
    <Link to={`/release/${release.releaseId}`} className="block group">
      <Card className={`overflow-hidden transition-all hover:shadow-md ${isAcquired ? 'opacity-75' : ''}`}>
        {/* Album art */}
        <div className="aspect-square bg-muted flex items-center justify-center relative">
          {release.imageUrl ? (
            <img
              src={release.imageUrl}
              alt={`${release.artist} – ${release.title}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Disc3 className="h-16 w-16 text-muted-foreground/30" />
          )}

          {/* Status overlay */}
          {isAcquired && (
            <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
              <div className="bg-success text-success-foreground rounded-full p-2">
                <Check className="h-6 w-6" />
              </div>
            </div>
          )}

          {/* Admin delete */}
          {isAdmin && onDeleteRelease && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(`Delete "${release.artist} – ${release.title}"?`)) {
                  onDeleteRelease(release.releaseId);
                }
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">
              {release.artist}
            </h3>
            <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
              {release.title}
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {release.format && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {release.format}
              </Badge>
            )}
            {release.releaseType && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {release.releaseType}
              </Badge>
            )}
          </div>

          {/* Actions */}
          {isAuthenticated && (
            <div className="flex gap-2 pt-1">
              {!want ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddWant(release);
                  }}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Want
                </Button>
              ) : isWanted ? (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleAcquired(want.wantId, 'ACQUIRED');
                    }}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Got It
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveWant(want.wantId);
                    }}
                  >
                    ✕
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleAcquired(want.wantId, 'WANTED');
                  }}
                >
                  Move back to wanted
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
