import { useMemo } from 'react';
import type { Release, Want } from '@/types';
import { useNavigate } from 'react-router-dom';
import { fixTitleArtist, cleanDescription, getProseOnly } from '@/lib/releaseUtils';
import heartIcon from '@/images/heart.svg';
import { StatusCircleIcon } from '@/components/app/StatusCircleIcon';

interface ReleaseListItemProps {
  release: Release;
  want?: Want;
  isAuthenticated: boolean;
  onAddWant: (release: Release) => void;
  onRemoveWant: (wantId: string) => void;
  onToggleStatus?: (wantId: string, newStatus: 'WANTED' | 'ACQUIRED') => void;
}

export function ReleaseListItem({
  release,
  want,
  isAuthenticated,
  onAddWant,
  onRemoveWant,
  onToggleStatus,
}: ReleaseListItemProps) {
  const hasWant = !!want && (want.status === 'WANTED' || want.status === 'ACQUIRED');
  const { title, artist } = fixTitleArtist(release.title, release.artist);
  const navigate = useNavigate();
  const description = useMemo(
    () => getProseOnly(cleanDescription(release.description)),
    [release.description]
  );

  return (
    <div
      className="block group cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/release/${release.releaseId}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/release/${release.releaseId}`)}
    >
      <div className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[#1e1e1e]">
        {/* Thumbnail */}
        <div className="h-16 w-16 rounded-md bg-[#1e1e1e] flex-shrink-0 overflow-hidden">
          {release.imageUrl ? (
            <img
              src={release.imageUrl}
              alt={release.artist}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#333] text-lg">♫</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-white font-bold leading-tight truncate">{title}</h3>
          <p className="text-xs text-[#B3B3B3] leading-tight truncate">{artist}</p>
          {description && (
            <p className="text-[#777] line-clamp-2 mt-1" style={{ fontSize: '12px' }}>
              {description}
            </p>
          )}
        </div>

        {/* Status toggle (MyList only) */}
        {onToggleStatus && want && (
          <button
            type="button"
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full py-1.5 border transition-colors ${
              want.status === 'ACQUIRED' ? 'border-[#E8A530]' : 'border-[#555]'
            }`}
            style={{ paddingLeft: '0.375rem', paddingRight: 0, minWidth: 95 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const next = want.status === 'ACQUIRED' ? 'WANTED' : 'ACQUIRED';
              onToggleStatus(want.wantId, next);
            }}
            aria-label={want.status === 'ACQUIRED' ? 'Mark as wanted' : 'Mark as got it'}
          >
            {/* Radio circle icon */}
            <StatusCircleIcon selected={want.status === 'ACQUIRED'} className="w-5 h-5" />
            {/* Label */}
            <span
              className={`text-xs font-semibold whitespace-nowrap ${
                want.status === 'ACQUIRED' ? 'text-[#E8A530]' : 'text-[#B3B3B3]'
              }`}
            >
              {want.status === 'ACQUIRED' ? 'Got it!' : 'Wanted'}
            </span>
          </button>
        )}

        {/* Heart action */}
        {isAuthenticated && (
          <button
            type="button"
            className="flex-shrink-0 p-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (hasWant) {
                onRemoveWant(want!.wantId);
              } else {
                onAddWant(release);
              }
            }}
            aria-label={
              hasWant ? `Remove ${release.title} from wants` : `Add ${release.title} to wants`
            }
          >
            {hasWant ? (
              <svg
                width="20"
                height="19"
                viewBox="0 0 20 19"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white h-5 w-5"
              >
                <path d="M18.2897 1.78491C17.2653 0.71139 15.89 0.0769175 14.4363 0.00731183C12.9827 -0.0622939 11.557 0.438051 10.4419 1.40913C10.3136 1.50968 10.1591 1.56766 9.99857 1.57548C9.83707 1.57059 9.68127 1.51231 9.55384 1.40913C8.43924 0.437498 7.01361 -0.0632202 5.56003 0.00639588C4.10645 0.0760119 2.73123 0.710871 1.70744 1.78491C1.16436 2.34595 0.733815 3.0133 0.440735 3.74834C0.147654 4.48339 -0.00214049 5.27151 2.31073e-05 6.0671C2.31073e-05 7.68461 0.606343 9.20558 1.67026 10.3077L8.05092 18.0655C8.29135 18.3585 8.59014 18.5938 8.92665 18.7551C9.26316 18.9164 9.62937 19 10 19C10.3706 19 10.7368 18.9164 11.0734 18.7551C11.4099 18.5938 11.7087 18.3585 11.9491 18.0655L18.2911 10.3493C18.8343 9.78827 19.2651 9.12095 19.5584 8.38592C19.8517 7.6509 20.0018 6.86276 20 6.0671C20.0012 5.27139 19.8507 4.48331 19.5572 3.74833C19.2636 3.01336 18.8329 2.34605 18.2897 1.78491Z" />
              </svg>
            ) : (
              <img src={heartIcon} alt="" className="h-5 w-5" style={{ opacity: 0.4 }} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
