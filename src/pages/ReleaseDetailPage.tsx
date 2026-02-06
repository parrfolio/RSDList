import { useParams, useNavigate } from 'react-router-dom';
import { useRelease } from '@/hooks/useReleases';
import { useWants, useAddWant, useRemoveWant, useToggleWantStatus } from '@/hooks/useWants';
import { useAuth } from '@/hooks/useAuth';
import { buildWantId } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Heart,
  Check,
  Disc3,
  Disc,
  Building2,
  Calendar,
  Hash,
} from 'lucide-react';

export default function ReleaseDetailPage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const navigate = useNavigate();
  const { data: release, isLoading } = useRelease(releaseId);
  const { isAuthenticated } = useAuth();

  // We need the eventId to build the wantId. release data has eventId.
  const { data: wants } = useWants(release?.eventId);

  const { mutate: addWant } = useAddWant();
  const { mutate: removeWant } = useRemoveWant();
  const { mutate: toggleStatus } = useToggleWantStatus();

  if (isLoading) {
    return <ReleaseDetailSkeleton />;
  }

  if (!release) {
    return (
      <div className="container max-w-2xl py-8 space-y-4 text-center">
        <h1 className="text-2xl font-bold">Release Not Found</h1>
        <p className="text-muted-foreground">The release you are looking for does not exist.</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Determine want status
  const wantId = buildWantId(release.eventId, release.releaseId);
  const want = wants?.find((w) => w.wantId === wantId);
  const isWanted = want?.status === 'WANTED';
  const isAcquired = want?.status === 'ACQUIRED';

  // Format helpers
  const formatQuantity = (q?: number | null) => q?.toLocaleString() ?? 'Unknown';
  const eventName = release.eventId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace('Rsd', 'RSD');

  return (
    <div className="pb-24 dark:bg-zinc-950 min-h-screen animate-in fade-in duration-300">
      {/* Navigation Header */}
      <div classNamedark:bg-zinc-950 min-h-screen animate-in fade-in duration-300">
      {/* Fixed Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b px-4 py-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm truncate">
          {release.artist}
        </span>
      </div>

      {/* Top spacing for fixed header */}
      <div className="h-14" /ero Section: Artwork */}
      <div className="bg-muted/30 pb-6 border-b">
        <div className="container max-w-md mx-auto p-6 flex justify-center">
          <div className="relative aspect-square w-full max-w-[320px] shadow-xl rounded-md overflow-hidden bg-background">
            {release.imageUrl ? (
              <img
                src={release.imageUrl}
                alt={`${release.artist} - ${release.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Disc3 className="h-32 w-32 text-muted-foreground/20" />
              </div>
            )}

            {/* Status Overlay Badge if acquired */}
            {isAcquired && (
              <div className="absolute top-4 right-4 bg-success text-success-foreground px-3 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5 animate-in zoom-in spin-in-3 duration-300">
                <Check className="h-3.5 w-3.5" />
                Got
              </div>
            )}
          </div>
        </div>

        {/* Title Block */}
        <div className="container max-w-2xl px-6 text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-foreground">
            {release.artist}
          </h1>
          <h2 className="text-xl md:text-2xl text-muted-foreground font-light leading-snug">
            {release.title}
          </h2>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {release.format && <Badge variant="secondary">{release.format}</Badge>}
            {release.releaseType && (
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                {release.releaseType}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container max-w-2xl px-4 py-6 space-y-6">
        {/* Description */}
        {release.description && (
          <div className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed">
            <p>{release.description}</p>
          </div>
        )}

        {/* Details Card */}
        <Card>
          <CardContent className="p-0 divide-y">
            <DetailRow
              icon={<Building2 className="h-4 w-4" />}
              label="Label"
              value={release.label}
            />
            <DetailRow icon={<Disc className="h-4 w-4" />} label="Format" value={release.format} />
            <DetailRow
              icon={<Hash className="h-4 w-4" />}
              label="Quantity"
              value={formatQuantity(release.quantity)}
            />
            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Event" value={eventName} />
          </Action Buttons */}
        {isAuthenticated ? (
          <div className="space-y-2">
            {!want ? (
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2"
                onClick={() => addWant(release)}
              >
                <Heart className="h-4 w-4" />
                Want
              </Button>
            ) : isWanted ? (
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="default"
                  className="flex-1 gap-2"
                  onClick={() => toggleStatus({ wantId, newStatus: 'ACQUIRED' })}
                >
                  <Check className="h-4 w-4" />
                  Got It
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => removeWant(wantId)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="w-full gap-2"
                onClick={() => toggleStatus({ wantId, newStatus: 'WANTED' })}
              >
                <Check className="h-4 w-4" />
                In Your Collection
              </Button>
            )}
          </div>
        ) : (
          <Button variant="outline" className="w-full" asChild>
            <a href="/auth">Sign in to track</a>
          </Button>
        )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between p-4 py-3">
      <div className="flex items-center gap-3 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function ReleaseDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Fixed header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b px-4 py-3 flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {/* Top spacing */}
      <div className="h-14" />
      
      <div className="container max-w-2xl px-4 py-8 space-y-8 animate-pulse">
        <div className="flex justify-center">
          <Skeleton className="h-80 w-80 rounded-md" />
        </div>
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
