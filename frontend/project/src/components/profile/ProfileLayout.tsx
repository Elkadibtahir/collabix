import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, Shield, Palette, Bell, Monitor, Clock, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../lib/auth-context';

const navItems = [
  { label: 'My Profile', icon: User, path: '/app/profile' },
  { label: 'Account Settings', icon: Settings, path: '/app/profile/account' },
  { label: 'Security', icon: Shield, path: '/app/profile/security' },
  { label: 'Preferences', icon: Palette, path: '/app/profile/preferences' },
  { label: 'Notifications', icon: Bell, path: '/app/profile/notifications' },
  { label: 'Active Sessions', icon: Monitor, path: '/app/profile/sessions' },
  { label: 'Activity Timeline', icon: Clock, path: '/app/profile/activity' },
];

export function ProfileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'US';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobileOpen]);

  const isActive = (path: string) => {
    if (path === '/app/profile') return location.pathname === '/app/profile';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex gap-0 lg:gap-6">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open profile navigation"
        aria-expanded={mobileOpen}
        aria-haspopup="dialog"
        className="lg:hidden fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent-600 text-white shadow-cx-lg hover:bg-accent-700 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-text-primary/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in lg:hidden"
          aria-hidden="true"
        />
      )}

      <div
        ref={sidebarRef}
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? 'true' : undefined}
        aria-label={mobileOpen ? 'Profile navigation' : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 shrink-0 bg-elevated border-r border-border-subtle overflow-y-auto transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:block lg:h-[calc(100vh-7rem)] lg:border lg:border-border-subtle lg:rounded-xl lg:bg-surface',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 lg:hidden">
          <p className="text-section font-semibold text-text-primary">Profile</p>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-5 border-b border-border-subtle">
          <div className="flex items-center gap-3 lg:flex-col lg:text-center">
            <Avatar name={displayName} size="lg" className="lg:h-16 lg:w-16" />
            <div className="min-w-0 lg:text-center">
              <p className="text-body font-semibold text-text-primary truncate">{displayName}</p>
              <p className="text-caption text-text-tertiary truncate">{user?.email ?? ''}</p>
              <div className="mt-1.5 flex items-center gap-1.5 lg:justify-center">
                <Badge tone="accent" variant="soft" className="text-2xs">{(user?.roles ?? []).join(', ')}</Badge>
              </div>
            </div>
          </div>
        </div>

        <nav className="p-2" aria-label="Profile navigation">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body transition-colors text-left',
                  active
                    ? 'bg-accent-600/10 text-accent-700 dark:bg-accent-100/15 dark:text-accent-200 font-medium'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-accent-500 shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
