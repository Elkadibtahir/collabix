import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  HelpCircle,
  Check,
  CheckCircle2,
  AlertCircle,
  Info,
  User,
  Building2,
  Settings,
  Palette,
  LogOut,
  Bell as BellIcon,
  Shield,
  Loader2,
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/cn';
import { SearchModal } from '../search/SearchModal';
import { useUnreadCount, useUnreadNotifications } from '../../services/notification-hooks';
import { useWorkspaceId } from '../../hooks/useWorkspaceId';
import { useWorkspacesList } from '../../services/workspace-hooks';
import { useAuth } from '../../lib/auth-context';
import { isAdmin } from '../../lib/access';

/* ---------- Workspace Selector ---------- */

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function WorkspaceSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const workspaceId = useWorkspaceId();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: workspaces, isLoading, isError, refetch } = useWorkspacesList();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreateWorkspace = (user?.permissions ?? []).includes('WORKSPACE_CREATE');
  const isAdminUser = isAdmin(user?.roles ?? []);

  const active = useMemo(() => {
    if (!workspaces?.length) return null;
    return workspaces.find((ws) => ws.id === workspaceId) ?? workspaces[0];
  }, [workspaces, workspaceId]);

  useEffect(() => {
    if (!workspaces?.length || workspaceId) return;
    const firstId = workspaces[0].id;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('ws', firstId);
      return next;
    });
  }, [workspaces, workspaceId, setSearchParams]);

  const initials = active ? getInitials(active.name) : 'WS';

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleSelect = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('ws', id);
      return next;
    });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !isLoading && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={active ? `Current workspace: ${active.name}` : 'Select workspace'}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2 transition-colors"
      >
        {isLoading ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-text-tertiary">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        ) : isError ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-danger-50 text-danger-500" title="Failed to load workspaces">
            <AlertCircle className="h-4 w-4" />
          </span>
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-600 text-white text-2xs font-bold shrink-0">
            {initials}
          </span>
        )}
        <span className="hidden md:block text-body font-semibold text-text-primary">
          {active?.name ?? (isError ? 'Connection error' : isLoading ? 'Loading...' : 'No workspace')}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-text-tertiary hidden md:block" />
      </button>
      {open && workspaces && (
        <div className="absolute left-0 top-full mt-1 w-72 rounded-lg border border-border-subtle bg-elevated p-1.5 shadow-cx-lg animate-scale-in z-50">
          {active && (
            <>
              <p className="px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-text-tertiary">Current workspace</p>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-md bg-accent-50 dark:bg-accent-100/20 px-2 py-2 text-body text-accent-700 dark:text-accent-200"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-600 text-white text-2xs font-bold shrink-0">
                  {getInitials(active.name)}
                </span>
                <span className="flex-1 text-left font-medium">{active.name}</span>
                <Check className="h-4 w-4 text-accent-600 dark:text-accent-300" />
              </button>
              <div className="my-1.5 h-px bg-border-subtle" />
            </>
          )}
          <p className="px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-text-tertiary">All workspaces</p>
          <div className="max-h-56 overflow-y-auto">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => handleSelect(ws.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-body transition-colors',
                  ws.id === active?.id
                    ? 'hidden'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-600 text-white text-2xs font-bold shrink-0">
                  {getInitials(ws.name)}
                </span>
                <span className="flex-1 text-left font-medium truncate">{ws.name}</span>
                <span className="text-2xs text-text-tertiary">{ws.memberCount ?? 0} members</span>
              </button>
            ))}
          </div>
          <div className="my-1 h-px bg-border-subtle" />
          {isAdminUser && (
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/app/all-workspaces'); }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-body text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border-default text-text-tertiary">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="font-medium">View all workspaces</span>
            </button>
          )}
          {isAdminUser && canCreateWorkspace && (
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/app/create-workspace'); }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-body text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border-default text-text-tertiary">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="font-medium">Create workspace</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Notifications Dropdown ---------- */

function mapNotifForDropdown(n: { category?: string; notificationType?: string; id: string; title: string; body?: string; createdAt: string; status?: string }) {
  const type = n.category ?? n.notificationType ?? 'info';
  const toneMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    mention: 'info',
    assigned: 'success',
    deadline: 'warning',
    document: 'info',
    comment: 'info',
    project: 'info',
    task: 'success',
    system: 'info',
    warning: 'warning',
    urgent: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success',
  };
  const tone = toneMap[type.toLowerCase()] ?? 'info';
  return {
    id: n.id,
    title: n.title,
    description: n.body ?? '',
    timestamp: formatRelativeTime(n.createdAt),
    tone,
    unread: n.status === 'UNREAD',
  };
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const notifIcon = {
  success: <CheckCircle2 className="h-4 w-4 text-success-500" />,
  warning: <AlertCircle className="h-4 w-4 text-warning-500" />,
  danger: <AlertCircle className="h-4 w-4 text-danger-500" />,
  info: <Info className="h-4 w-4 text-info-500" />,
};

function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const workspaceId = useWorkspaceId();
  const { data: count } = useUnreadCount(workspaceId);
  const { data: unreadData } = useUnreadNotifications(workspaceId);
  const navigate = useNavigate();

  const notifications = useMemo(() => {
    if (!unreadData?.content) return [];
    return unreadData.content.map(mapNotifForDropdown);
  }, [unreadData]);

  const unreadCount = count ?? 0;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-2xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border-subtle bg-elevated shadow-cx-lg animate-scale-in z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <p className="text-section font-semibold text-text-primary">Notifications</p>
            <span className="text-caption text-text-tertiary">{unreadCount} unread</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 mx-auto text-text-tertiary mb-2" />
                <p className="text-caption text-text-tertiary">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2',
                    n.unread && 'bg-accent-50/40 dark:bg-accent-100/15',
                  )}
                >
                  <span className="mt-0.5 shrink-0">{notifIcon[n.tone]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-body font-medium text-text-primary truncate">{n.title}</p>
                      <span className="shrink-0 text-2xs text-text-tertiary">{n.timestamp}</span>
                    </div>
                    <p className="mt-0.5 text-caption text-text-tertiary line-clamp-2">{n.description}</p>
                  </div>
                  {n.unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-accent-500 shrink-0" />}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border-subtle px-4 py-2.5">
            <button
              className="w-full text-center text-caption font-medium text-accent-600 dark:text-accent-400 hover:underline"
              onClick={() => { navigate('/app/notifications'); setOpen(false); }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- User Menu ---------- */

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'US';

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const userPermissions = user?.permissions ?? [];
  const canAccessWorkspaceSettings = userPermissions.includes('WORKSPACE_UPDATE');

  const menuItems = [
    { label: 'My Profile', icon: <User />, path: '/app/profile' },
    { label: 'Security', icon: <Shield />, path: '/app/profile/security' },
    { label: 'Notifications', icon: <BellIcon />, path: '/app/profile/notifications' },
    { label: 'Preferences', icon: <Palette />, path: '/app/profile/preferences' },
    ...(canAccessWorkspaceSettings
      ? [{ label: 'Workspace Settings' as const, icon: <Settings />, path: '/app/settings' as const }]
      : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-surface-2 transition-colors"
      >
        <Avatar name={displayName} size="sm" />
        <div className="hidden md:block text-left">
          <p className="text-caption font-medium text-text-primary leading-none">{displayName}</p>
          <p className="text-2xs text-text-tertiary mt-0.5">{user?.email ?? ''}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-text-tertiary hidden md:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-lg border border-border-subtle bg-elevated p-1.5 shadow-cx-lg animate-scale-in z-50">
          <div className="flex items-center gap-3 px-2 py-2.5 border-b border-border-subtle">
            <Avatar name={displayName} size="md" />
            <div className="min-w-0">
              <p className="text-body font-semibold text-text-primary truncate">{displayName}</p>
              <p className="text-caption text-text-tertiary truncate">{user?.email ?? ''}</p>
            </div>
          </div>
          <nav className="mt-1 flex flex-col gap-0.5">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => { navigate(item.path); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-body text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
              >
                <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="my-1 h-px bg-border-subtle" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-body text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-100 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Global Search ---------- */

function GlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open global search"
        className="relative flex w-full max-w-md items-center gap-2 rounded-lg border border-border-subtle bg-surface-2/60 px-3 py-1.5 text-body text-text-tertiary hover:border-border-default hover:text-text-secondary transition-colors"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search projects, tasks, documents...</span>
        <kbd className="shrink-0 rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-2xs font-medium text-text-tertiary">
          ⌘K
        </kbd>
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ---------- Topbar ---------- */

export interface TopbarProps {
  onMenuClick: () => void;
  breadcrumbs?: ReactNode;
}

export function Topbar({ onMenuClick, breadcrumbs }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 sm:gap-3 border-b border-border-subtle bg-topbar-bg/80 backdrop-blur-md px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 transition-colors shrink-0"
      >
        <Menu className="h-5 w-5" />
      </button>

      <WorkspaceSelector />

      <div className="hidden md:block ml-1">{breadcrumbs}</div>

      <div className="ml-auto flex-1 sm:flex-initial sm:ml-4">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <IconButton label="Help" variant="ghost" size="sm" className="hidden sm:flex">
          <HelpCircle />
        </IconButton>

        <NotificationsButton />

        <IconButton label="Toggle theme" variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'light' ? <Moon /> : <Sun />}
        </IconButton>

        <div className="mx-1 h-6 w-px bg-border-subtle hidden sm:block" />

        <UserMenu />
      </div>
    </header>
  );
}
