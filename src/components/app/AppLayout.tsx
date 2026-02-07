import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWants } from '@/hooks/useWants';
import { useUIStore } from '@/stores/uiStore';
import albumsIcon from '@/images/albums.svg';
import searchIcon from '@/images/search.svg';
import listIcon from '@/images/list.svg';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { activeEventId, setSearchQuery, setSearchFocused } = useUIStore();
  const { data: wants } = useWants(activeEventId);
  const wantCount = isAuthenticated ? (wants?.length ?? 0) : 0;

  const isRsdActive =
    (location.pathname === '/rsd' || location.pathname === '/') &&
    !useUIStore.getState().searchFocused;
  const isSearchActive = useUIStore.getState().searchFocused;
  const isMyListActive = location.pathname === '/mylist';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main content — full bleed, padded at bottom for nav */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Fixed bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2a2a2a] bg-[#121212]">
        <div className="flex items-center justify-around h-16">
          <NavItem
            to="/rsd"
            icon={albumsIcon}
            label="RSD"
            active={isRsdActive}
            onClick={() => setSearchFocused(false)}
          />
          <NavItem
            to="/rsd"
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
            to="/mylist"
            icon={listIcon}
            label="Your List"
            active={isMyListActive}
            badge={wantCount}
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  to: string;
  icon: string;
  label: string;
  active: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      className="flex flex-col items-center gap-1 px-4 py-2 relative"
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <div className="relative">
        <img
          src={icon}
          alt={label}
          className="h-5 w-5"
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
    </NavLink>
  );
}
