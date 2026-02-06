import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import { Disc3, Heart, User, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWants } from '@/hooks/useWants';
import { useUIStore } from '@/stores/uiStore';
import { getEventLabel } from '@/types';

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const { activeEventId } = useUIStore();
  const { data: wants } = useWants(activeEventId);
  const location = useLocation();

  const wantedCount = wants?.filter((w) => w.status === 'WANTED').length ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-primary">RSD Wants</h1>
            {activeEventId && (
              <Badge
                variant="outline"
                className="text-[10px] hidden sm:inline-flex"
              >
                {getEventLabel(activeEventId)}
              </Badge>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto flex items-center justify-around h-16">
          <NavItem to="/rsd" icon={Search} label="Browse" active={location.pathname === '/rsd'} />
          <NavItem
            to="/mylist"
            icon={Heart}
            label="My List"
            active={location.pathname === '/mylist'}
            badge={wantedCount > 0 ? wantedCount : undefined}
          />
          <NavItem
            to={isAuthenticated ? '/account' : '/auth'}
            icon={User}
            label={isAuthenticated ? 'Account' : 'Sign In'}
            active={location.pathname === '/account' || location.pathname === '/auth'}
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
  badge,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors relative ${
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {badge !== undefined && (
          <span className="absolute -top-1.5 -right-2.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {badge}
          </span>
        )}
      </div>
      <span>{label}</span>
    </NavLink>
  );
}
