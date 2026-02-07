import type { Release, Want } from '@/types';
import { Link } from 'react-router-dom';
import { fixTitleArtist } from '@/lib/releaseUtils';
import heartIcon from '@/images/heart.svg';

interface ReleaseCardProps {
  release: Release;
  want?: Want;
  isAuthenticated: boolean;
  onAddWant: (release: Release) => void;
  onRemoveWant: (wantId: string) => void;
  onToggleStatus?: (wantId: string, newStatus: 'WANTED' | 'ACQUIRED') => void;
}

export function ReleaseCard({
  release,
  want,
  isAuthenticated,
  onAddWant,
  onRemoveWant,
  onToggleStatus,
}: ReleaseCardProps) {
  const hasWant = !!want && (want.status === 'WANTED' || want.status === 'ACQUIRED');
  const { title, artist } = fixTitleArtist(release.title, release.artist);

  return (
    <div className="group">
      {/* Album art — links to detail page */}
      <Link to={`/release/${release.releaseId}`} className="block">
        <div className="aspect-square rounded-lg overflow-hidden bg-[#1e1e1e] relative">
          {release.imageUrl ? (
            <img
              src={release.imageUrl}
              alt={`${release.artist} – ${release.title}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#333] text-3xl">♫</span>
            </div>
          )}
        </div>
      </Link>

      {/* Title + Artist + heart */}
      <div className="flex items-start gap-1.5 mt-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-bold leading-tight truncate">{title}</p>
          <p className="text-xs text-[#B3B3B3] leading-tight truncate">{artist}</p>
        </div>

        {/* Status arrow (MyList only) */}
        {onToggleStatus && want && (
          <button
            type="button"
            className="flex-shrink-0 p-0.5"
            onClick={() => {
              const next = want.status === 'ACQUIRED' ? 'WANTED' : 'ACQUIRED';
              onToggleStatus(want.wantId, next);
            }}
            aria-label={want.status === 'ACQUIRED' ? 'Mark as wanted' : 'Mark as got it'}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full ${
                want.status === 'ACQUIRED' ? 'bg-[#E8A530]' : 'bg-[#555]'
              }`}
            >
              {want.status === 'ACQUIRED' ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 2L5 8M5 8L2 5M5 8L8 5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 8L5 2M5 2L2 5M5 2L8 5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>
        )}

        {isAuthenticated && (
          <button
            type="button"
            className="flex-shrink-0 p-0.5"
            onClick={() => {
              if (hasWant) {
                onRemoveWant(want!.wantId);
              } else {
                onAddWant(release);
              }
            }}
            aria-label={hasWant ? `Remove ${title} from wants` : `Add ${title} to wants`}
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
