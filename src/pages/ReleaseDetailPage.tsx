import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRelease } from '@/hooks/useReleases';
import { useWants, useAddWant, useRemoveWant } from '@/hooks/useWants';
import { useAuth } from '@/hooks/useAuth';
import { buildWantId } from '@/types';
import { fixTitleArtist } from '@/lib/releaseUtils';
import backIcon from '@/images/back.svg';
import heartIcon from '@/images/heart.svg';

/** Extract the dominant colour from an image URL via a 1×1 canvas sample. */
function useDominantColor(imageUrl: string | null | undefined): string {
  const [color, setColor] = useState('#121212');

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      setColor(`rgb(${r}, ${g}, ${b})`);
    };
    img.onerror = () => setColor('#121212');
    img.src = imageUrl;
  }, [imageUrl]);

  return color;
}

/**
 * Clean descriptions that contain embedded metadata from detail-page text dumps.
 * Pattern: "Title DETAILS Date: ... Format: ... MORE INFO actual description"
 */
function cleanDescription(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;

  let text = raw.trim();

  // Pattern 1: "MORE INFO" delimiter — everything after it is the real description
  const moreInfoIdx = text.indexOf('MORE INFO');
  if (moreInfoIdx !== -1) {
    text = text.substring(moreInfoIdx + 'MORE INFO'.length).trim();
    return text || null;
  }

  // Pattern 2: Strip leading "TITLE DETAILS" prefix
  const detailsIdx = text.indexOf('DETAILS');
  if (detailsIdx !== -1 && detailsIdx < 80) {
    text = text.substring(detailsIdx + 'DETAILS'.length).trim();
  }

  // Pattern 3: Strip leading metadata lines
  const metadataPattern =
    /^(Date:\s*[^\n]+\s*)?(Format:\s*[^\n]+\s*)?(Label:\s*[^\n]+\s*)?(Quantity:\s*[^\n]+\s*)?(Release\s*type:\s*[^\n]+\s*)?/i;
  text = text.replace(metadataPattern, '').trim();

  return text || null;
}

/**
 * Detect and fix release data where the entire detail-page text dump was
 * stored in the wrong fields (e.g. title contains the full dump).
 * Returns corrected release fields.
 */
function fixDirtyRelease(release: {
  title: string;
  artist: string;
  label?: string | null;
  format?: string | null;
  quantity?: number | null;
  description?: string | null;
}) {
  // Detect dirty data: title contains "DETAILS" keyword
  const blob = release.title + ' ' + (release.description ?? '');
  const detailsIdx = blob.indexOf('DETAILS');
  if (detailsIdx === -1) {
    // Data looks clean — fix swapped title/artist and clean description
    const fixed = fixTitleArtist(release.title, release.artist);
    return {
      title: fixed.title,
      artist: fixed.artist,
      label: release.label,
      format: release.format,
      quantity: release.quantity,
      description: cleanDescription(release.description),
    };
  }

  // The dump is somewhere in the data — parse it out
  // Pattern: "Artist Title DETAILS Date: ... Format: ... Label: ... Quantity: ... Release type: ... MORE INFO description"
  // OR: "Title DETAILS ..." in just the title field

  const fullText = blob.trim();

  // Extract description (after MORE INFO)
  let description: string | null = null;
  const moreInfoIdx = fullText.indexOf('MORE INFO');
  if (moreInfoIdx !== -1) {
    description = fullText.substring(moreInfoIdx + 'MORE INFO'.length).trim() || null;
  }

  // Extract metadata from the DETAILS section
  const metaSection =
    moreInfoIdx !== -1
      ? fullText.substring(detailsIdx, moreInfoIdx)
      : fullText.substring(detailsIdx);

  const formatMatch = metaSection.match(
    /Format:\s*([^\n]+?)(?=\s*(?:Date|Label|Quantity|Release\s*type|MORE|$))/i
  );
  const labelMatch = metaSection.match(
    /Label:\s*([^\n]+?)(?=\s*(?:Date|Format|Quantity|Release\s*type|MORE|$))/i
  );
  const quantityMatch = metaSection.match(/Quantity:\s*([\d,]+)/i);

  // The real title is everything before "DETAILS" in the blob that's in the title field
  const titleBlob = release.title;
  const titleDetailsIdx = titleBlob.indexOf('DETAILS');
  let rawTitle = release.title;
  let rawArtist = release.artist;

  if (titleDetailsIdx !== -1) {
    rawTitle = titleBlob.substring(0, titleDetailsIdx).trim();
  }

  // Fix swapped artist/title even in dirty data
  const fixed = fixTitleArtist(rawTitle, rawArtist);

  return {
    title: fixed.title,
    artist: fixed.artist,
    label: labelMatch?.[1]?.trim() ?? release.label,
    format: formatMatch?.[1]?.trim() ?? release.format,
    quantity: quantityMatch ? parseInt(quantityMatch[1].replace(/,/g, ''), 10) : release.quantity,
    description,
  };
}

/**
 * Format a raw description string, properly separating prose from track listings.
 * The raw data often has no line breaks: "...splendor.TracklistSIDE A1. Before You Accuse Me2. ..."
 * Returns { prose, trackList } where trackList is the formatted track section or null.
 */
function formatDescription(raw: string | null): { prose: string | null; trackList: string | null } {
  if (!raw) return { prose: null, trackList: null };

  let text = raw.trim();

  // Split on "Tracklist" or "Track List" (case-insensitive)
  const tracklistMatch = text.match(/Track\s*list/i);
  if (!tracklistMatch || tracklistMatch.index === undefined) {
    return { prose: text, trackList: null };
  }

  const prose = text.substring(0, tracklistMatch.index).trim() || null;
  let trackSection = text.substring(tracklistMatch.index + tracklistMatch[0].length).trim();

  // Insert line breaks before SIDE markers
  trackSection = trackSection.replace(/\s*(SIDE\s+[A-Z])/gi, '\n$1');

  // Insert line breaks before numbered tracks: "1. ", "2. ", etc.
  // But be careful not to break mid-word — look for digit followed by ". " or digit+"."
  trackSection = trackSection.replace(/(\d+)\.\s*/g, '\n$1. ');

  // Clean up multiple newlines
  trackSection = trackSection.replace(/\n{3,}/g, '\n\n').trim();

  return { prose, trackList: trackSection };
}

export default function ReleaseDetailPage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const navigate = useNavigate();
  const { data: release, isLoading } = useRelease(releaseId);
  const { isAuthenticated } = useAuth();
  const { data: wants } = useWants(release?.eventId);
  const { mutate: addWant } = useAddWant();
  const { mutate: removeWant } = useRemoveWant();

  const dominantColor = useDominantColor(release?.imageUrl);

  if (isLoading) {
    return <ReleaseDetailSkeleton />;
  }

  if (!release) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white gap-4">
        <h1 className="text-2xl font-bold">Release Not Found</h1>
        <p className="text-[#B3B3B3]">The release you are looking for does not exist.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const wantId = buildWantId(release.eventId, release.releaseId);
  const want = wants?.find((w) => w.wantId === wantId);
  const hasWant = !!want;

  // Fix dirty data where the full detail-page dump ended up in wrong fields
  const clean = fixDirtyRelease(release);
  const { prose, trackList } = formatDescription(clean.description);

  const handleHeartClick = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (hasWant) {
      removeWant(wantId);
    } else {
      addWant(release);
    }
  };

  return (
    <div
      className="min-h-screen text-white animate-in fade-in duration-300"
      style={{
        background: `linear-gradient(to bottom, ${dominantColor} 0%, #121212 60%)`,
      }}
    >
      {/* Floating header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <img src={backIcon} alt="Back" className="h-4 w-4" />
        </button>
        <button onClick={handleHeartClick} className="p-2 -mr-2">
          {hasWant ? (
            <svg
              width="20"
              height="19"
              viewBox="0 0 20 19"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path d="M18.2897 1.78491C17.2653 0.71139 15.89 0.0769175 14.4363 0.00731183C12.9827 -0.0622939 11.557 0.438051 10.4419 1.40913C10.3136 1.50968 10.1591 1.56766 9.99857 1.57548C9.83707 1.57059 9.68127 1.51231 9.55384 1.40913C8.43924 0.437498 7.01361 -0.0632202 5.56003 0.00639588C4.10645 0.0760119 2.73123 0.710871 1.70744 1.78491C1.16436 2.34595 0.733815 3.0133 0.440735 3.74834C0.147654 4.48339 -0.00214049 5.27151 2.31073e-05 6.0671C2.31073e-05 7.68461 0.606343 9.20558 1.67026 10.3077L8.05092 18.0655C8.29135 18.3585 8.59014 18.5938 8.92665 18.7551C9.26316 18.9164 9.62937 19 10 19C10.3706 19 10.7368 18.9164 11.0734 18.7551C11.4099 18.5938 11.7087 18.3585 11.9491 18.0655L18.2911 10.3493C18.8343 9.78827 19.2651 9.12095 19.5584 8.38592C19.8517 7.6509 20.0018 6.86276 20 6.0671C20.0012 5.27139 19.8507 4.48331 19.5572 3.74833C19.2636 3.01336 18.8329 2.34605 18.2897 1.78491Z" />
            </svg>
          ) : (
            <img src={heartIcon} alt="Want" className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Album art */}
      <div className="flex justify-center px-4 pt-4 pb-6">
        <div className="w-[65%] max-w-[300px] aspect-square rounded-lg overflow-hidden shadow-2xl">
          {release.imageUrl ? (
            <img
              src={release.imageUrl}
              alt={`${release.artist} - ${release.title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/10">
              <span className="text-4xl text-white/20">♫</span>
            </div>
          )}
        </div>
      </div>

      {/* Title & artist */}
      <div className="text-center px-6 space-y-1 pb-5">
        <h1 className="font-bold text-white" style={{ fontSize: '25px' }}>
          {clean.title}
        </h1>
        <p className="text-[16px] text-[#B3B3B3]">{clean.artist}</p>
      </div>

      {/* Info bar */}
      <div className="mx-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-sm font-bold text-white truncate px-1">{clean.label ?? '—'}</p>
            <p className="text-xs text-[#B3B3B3] mt-0.5">Label</p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-sm font-bold text-white truncate px-1">{clean.format ?? '—'}</p>
            <p className="text-xs text-[#B3B3B3] mt-0.5">Format</p>
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {clean.quantity?.toLocaleString() ?? '—'}
            </p>
            <p className="text-xs text-[#B3B3B3] mt-0.5">Quantity</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {prose && (
        <div className="px-6 pt-6 text-left">
          <p
            className="text-white leading-relaxed whitespace-pre-line"
            style={{ fontSize: '12px' }}
          >
            {prose}
          </p>
        </div>
      )}

      {/* Track List */}
      {trackList && (
        <div className="px-6 pt-6 pb-8 text-left">
          <h2 className="font-bold text-white mb-3" style={{ fontSize: '16px' }}>
            Track List
          </h2>
          <p
            className="text-white leading-relaxed whitespace-pre-line"
            style={{ fontSize: '12px' }}
          >
            {trackList}
          </p>
        </div>
      )}

      {/* Spacer when no track list */}
      {prose && !trackList && <div className="pb-8" />}
    </div>
  );
}

function ReleaseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Floating header skeleton */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="h-4 w-4 rounded bg-white/20 animate-pulse" />
        <div className="h-5 w-5 rounded bg-white/20 animate-pulse" />
      </header>

      {/* Album art skeleton */}
      <div className="flex justify-center px-4 pt-4 pb-6">
        <div className="w-[65%] max-w-[300px] aspect-square rounded-lg bg-white/10 animate-pulse" />
      </div>

      {/* Title skeleton */}
      <div className="text-center px-6 space-y-2 pb-5">
        <div className="h-7 w-3/4 mx-auto rounded bg-white/10 animate-pulse" />
        <div className="h-5 w-1/2 mx-auto rounded bg-white/10 animate-pulse" />
      </div>

      {/* Info bar skeleton */}
      <div className="mx-4 bg-white/10 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="h-4 w-16 mx-auto rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-10 mx-auto rounded bg-white/10 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-16 mx-auto rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-10 mx-auto rounded bg-white/10 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-16 mx-auto rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-10 mx-auto rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <div className="px-6 pt-6 pb-8 space-y-2">
        <div className="h-4 w-full rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-full rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}
