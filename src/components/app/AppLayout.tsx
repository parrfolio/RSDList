import { Outlet, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWants } from '@/hooks/useWants';
import { useUIStore } from '@/stores/uiStore';
import { User } from 'lucide-react';
import albumsIcon from '@/images/albums.svg';
import searchIcon from '@/images/search.svg';
import listIcon from '@/images/list.svg';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, firebaseUser } = useAuth();
  const { activeEventId, searchFocused, setSearchQuery, setSearchFocused } = useUIStore();
  const { data: wants } = useWants(activeEventId);
  const wantCount = isAuthenticated ? (wants?.length ?? 0) : 0;

  const isRsdActive = (location.pathname === '/rsd' || location.pathname === '/') && !searchFocused;
  const isSearchActive =
    searchFocused && (location.pathname === '/rsd' || location.pathname === '/');
  const isMyListActive = location.pathname === '/mylist';
  const isAccountActive = location.pathname === '/account';

  const photoURL = user?.photoURL ?? firebaseUser?.photoURL ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollRestoration />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2a2a2a] bg-[#121212]">
        <div className="h-16" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <NavItem
            icon={albumsIcon}
            label="RSD"
            active={isRsdActive}
            onClick={() => {
              setSearchQuery('');
              setSearchFocused(false);
              navigate('/rsd');
              window.scrollTo(0, 0);
            }}
          />
          <NavItem
            icon={searchIcon}
            label="Search"
            active={isSearchActive}
            onClick={() => {
              setSearchQuery('');
              setSearchFocused(true);
              if (location.pathname !== '/rsd' && location.pathname !== '/') {
                navigate('/rsd');
              }
            }}
          />
          <NavItem
            icon={listIcon}
            label="Your List"
            active={isMyListActive}
            badge={wantCount}
            onClick={() => navigate('/mylist')}
          />
          <button
            type="button"
            className="flex flex-col items-center justify-center"
            onClick={() => navigate('/account')}
            aria-label="Account"
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="h-6 w-6 rounded-full object-cover"
                style={isAccountActive ? { boxShadow: '0 0 0 2px #E8A530' } : undefined}
              />
            ) : (
              <User
                className="h-5 w-5"
                style={{ color: isAccountActive ? '#FFFFFF' : '#777777' }}
              />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex flex-col items-center justify-center gap-1 relative"
      onClick={onClick}
    >
      <div className="relative w-5 h-5">
        <img
          src={icon}
          alt={label}
          className="w-5 h-5"
          style={active ? { filter: 'brightness(0) invert(1)' } : undefined}
        />
        {badge != null && badge > 0 && (
          <span
            className="absolute flex items-center justify-center rounded-full bg-[#E8A530] text-white text-[9px] font-bold leading-none"
            style={{ left: '-6px', top: '-3px', width: '18px', height: '18px' }}
          >
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-semibold" style={{ color: active ? '#FFFFFF' : '#777777' }}>
        {label}
      </span>
    </button>
  );
}
