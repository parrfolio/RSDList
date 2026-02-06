import { useParams, useNavigate } from 'react-router-dom';
import { useRelease } from '@/hooks/useReleases';
import { useWants, useAddWant, useRemoveWant, useToggleWantStatus } from '@/hooks/useWants';
import { useAuth } from '@/hooks/useAuth';
import { buildWantId } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    Heart,
    Check,
    Disc3,
    ExternalLink,
    Disc,
    Building2,
    Calendar,
    X,
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
    const eventName = release.eventId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace('Rsd', 'RSD');

    return (
        <div className="pb-24 dark:bg-zinc-950 min-h-screen animate-in fade-in duration-300">
            {/* Navigation Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <span className="font-semibold text-sm truncate opacity-0 animate-in slide-in-from-left-2 fade-in fill-mode-forwards delay-150 duration-500">
                    {release.title}
                </span>
            </div>

            {/* Hero Section: Artwork */}
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
                                DRAWN
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
                        <DetailRow 
                            icon={<Disc className="h-4 w-4" />} 
                            label="Format" 
                            value={release.format} 
                        />
                         <DetailRow 
                            icon={<Hash className="h-4 w-4" />} 
                            label="Quantity" 
                            value={formatQuantity(release.quantity)} 
                        />
                        <DetailRow 
                            icon={<Calendar className="h-4 w-4" />} 
                            label="Event" 
                            value={eventName} 
                        />
                    </CardContent>
                </Card>

                {/* External Link */}
                {release.detailsUrl && (
                    <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={release.detailsUrl} target="_blank" rel="noopener noreferrer">
                            View on RecordStoreDay.com <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                    </Button>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-20">
                <div className="container max-w-md mx-auto">
                    {!isAuthenticated ? (
                         <Button className="w-full" asChild>
                             <a href="/auth">Sign in to track release</a>
                         </Button>
                    ) : (
                        <div className="flex gap-3">
                            {!want ? (
                                <Button size="lg" className="w-full gap-2 font-semibold" onClick={() => addWant(release)}>
                                    <Heart className="h-5 w-5" />
                                    Add to My List
                                </Button>
                            ) : isWanted ? (
                                <>
                                    <Button size="lg" className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => toggleStatus({ wantId, newStatus: 'ACQUIRED'})}>
                                        <Check className="h-5 w-5" />
                                        Got It!
                                    </Button>
                                    <Button size="lg" variant="secondary" className="px-4 text-muted-foreground hover:text-destructive" onClick={() => removeWant(wantId)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </>
                            ) : (
                                <div className="w-full flex items-center justify-between gap-3 p-2 bg-success/10 text-success rounded-md border border-success/20">
                                     <span className="flex items-center gap-2 font-semibold px-2">
                                        <Check className="h-5 w-5" />
                                        In Your Collection
                                     </span>
                                     <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-destructive" onClick={() => toggleStatus({ wantId, newStatus: 'WANTED'})}>
                                        Undo
                                     </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | number | null }) {
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
        <div className="container max-w-2xl py-8 space-y-8 animate-pulse">
            <div className="flex justify-center">
                <Skeleton className="h-64 w-64 rounded-md" />
            </div>
            <div className="space-y-4 text-center">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
}
