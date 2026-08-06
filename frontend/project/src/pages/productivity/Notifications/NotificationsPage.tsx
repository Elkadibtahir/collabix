import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Bell,
  Check,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { cn } from '../../../lib/cn';
import {
  useNotificationsList,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useUnreadCount,
} from '../../../services/notification-hooks';
import type { NotificationResponse, NotificationFilter } from './notification-types';
import { formatRelativeTime, getNotifIcon } from './notification-types';

type ViewMode = 'list' | 'grouped';

export function NotificationsPage() {
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<NotificationFilter>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const { data: notifsData, isLoading, isError } = useNotificationsList(wsId);
  const { data: unreadCountData } = useUnreadCount(wsId);
  const markAsRead = useMarkAsRead(wsId);
  const markAllAsRead = useMarkAllAsRead(wsId);
  const deleteNotif = useDeleteNotification(wsId);

  const notifications = useMemo(() => {
    if (!notifsData?.content) return [];
    return notifsData.content;
  }, [notifsData]);

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.body ?? '').toLowerCase().includes(q) ||
          (n.resourceType ?? '').toLowerCase().includes(q),
      );
    }

    if (filters.category) {
      result = result.filter((n) => n.category === filters.category);
    }
    if (filters.priority) {
      result = result.filter((n) => n.priority === filters.priority);
    }
    if (filters.isRead !== undefined) {
      result = result.filter((n) => (n.status === 'READ') === filters.isRead);
    }

    return result;
  }, [notifications, search, filters]);

  const unreadCount = unreadCountData ?? 0;
  const categories = Array.from(new Set(notifications.map((n) => n.category)));
  const priorities = Array.from(new Set(notifications.map((n) => n.priority)));

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.filter((n) => n.status === 'READ').length,
    mentions: notifications.filter((n) => n.notificationType === 'MENTION').length,
  };

  const tabItems: TabItem[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'unread', label: 'Unread', count: stats.unread },
    { id: 'mentions', label: 'Mentions', count: stats.mentions },
  ];

  const handleSelectNotification = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleMarkSelectedAsRead = () => {
    selectedNotifications.forEach((id) => markAsRead.mutate(id));
    setSelectedNotifications(new Set());
  };

  const handleDeleteSelected = () => {
    selectedNotifications.forEach((id) => deleteNotif.mutate(id));
    setSelectedNotifications(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-body font-medium text-danger-600">Failed to load notifications</p>
        <p className="text-caption text-text-tertiary">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Notifications</h1>
        <p className="text-body text-text-secondary">
          Stay updated with all your tasks, projects, and team activities.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} tone="accent" />
        <StatCard label="Unread" value={stats.unread} tone="warning" />
        <StatCard label="Read" value={stats.read} tone="success" />
        <StatCard label="Mentions" value={stats.mentions} tone="danger" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search notifications..."
              leftIcon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              containerClassName="w-full"
            />
          </div>

          <Dropdown
            trigger={
              <Button variant="outline">
                Category
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'All Categories', onClick: () => setFilters((f) => ({ ...f, category: undefined })) },
              { divider: true },
              ...categories.map((c) => ({
                label: c.charAt(0).toUpperCase() + c.slice(1),
                onClick: () => setFilters((f) => ({ ...f, category: c })),
              })),
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="outline">
                Priority
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'All Priorities', onClick: () => setFilters((f) => ({ ...f, priority: undefined })) },
              { divider: true },
              ...priorities.map((p) => ({
                label: p.charAt(0).toUpperCase() + p.slice(1),
                onClick: () => setFilters((f) => ({ ...f, priority: p })),
              })),
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => markAllAsRead.mutate()}>
            Mark All Read
          </Button>
          {selectedNotifications.size > 0 && (
            <div className="flex items-center gap-2 bg-surface-2 rounded-lg p-3">
              <span className="text-caption font-medium text-text-secondary">
                {selectedNotifications.size} selected
              </span>
              <IconButton label="Mark as read" variant="ghost" onClick={handleMarkSelectedAsRead}>
                <Check className="h-4 w-4" />
              </IconButton>
              <IconButton label="Delete" variant="ghost" onClick={handleDeleteSelected} className="text-danger-600 hover:text-danger-700">
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          )}
        </div>
      </div>

      <Tabs items={tabItems} onChange={(id) => {
        if (id === 'unread') {
          setFilters((f) => ({ ...f, isRead: false }));
        } else if (id === 'mentions') {
          setFilters((f) => ({ ...f, notificationType: 'MENTION' }));
        } else {
          setFilters((f) => ({ ...f, isRead: undefined, notificationType: undefined }));
        }
      }} />

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell />}
          title="No notifications"
          description="You're all caught up! Check back later for updates."
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isSelected={selectedNotifications.has(notification.id)}
              onSelect={() => handleSelectNotification(notification.id)}
              onMarkRead={() => markAsRead.mutate(notification.id)}
              onDelete={() => deleteNotif.mutate(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  const bgColor: Record<string, string> = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    danger: 'bg-danger-50 dark:bg-danger-100 text-danger-700 dark:text-danger-200',
  };

  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bgColor[tone])}>
      <p className="text-2xs font-medium opacity-75">{label}</p>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}

function NotificationItem({
  notification,
  isSelected,
  onSelect,
  onMarkRead,
  onDelete,
}: {
  notification: NotificationResponse;
  isSelected: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const priorityColor: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    LOW: 'success',
    NORMAL: 'info',
    HIGH: 'warning',
    URGENT: 'danger',
  };

  const actionItems: DropdownItem[] = [
    { label: 'Mark as read', icon: <Check className="h-4 w-4" />, onClick: onMarkRead },
    { divider: true },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: onDelete },
  ];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer',
        isSelected
          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900'
          : notification.status === 'READ'
            ? 'border-border-subtle bg-surface hover:bg-surface-2'
            : 'border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900',
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded border mt-1 shrink-0',
          isSelected ? 'bg-accent-500 border-accent-500' : 'border-border-subtle',
        )}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        {isSelected && <Check className="h-4 w-4 text-white" />}
      </div>

      <div className="text-2xl shrink-0">{getNotifIcon(notification.notificationType)}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h4 className="text-body font-semibold text-text-primary flex-1">
            {notification.title}
          </h4>
          {notification.status === 'UNREAD' && (
            <div className="h-2 w-2 rounded-full bg-warning-500 shrink-0 mt-1.5" />
          )}
        </div>
        {notification.body && (
          <p className="text-caption text-text-secondary mb-2">{notification.body}</p>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge tone={priorityColor[notification.priority] ?? 'info'} variant="soft">
            {notification.priority}
          </Badge>
          {notification.category && (
            <Badge tone="neutral" variant="soft">{notification.category}</Badge>
          )}
          <span className="text-2xs text-text-tertiary ml-auto">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      <Dropdown
        trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
        items={actionItems}
        align="right"
      />
    </div>
  );
}
