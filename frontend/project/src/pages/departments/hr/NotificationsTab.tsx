import { useState } from 'react';
import { Bell, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { Can } from '../../auth';
import { useAuth } from '../../../lib/auth-context';
import { useHrNotifications, useHrNotificationStats, useMarkHrNotificationRead, useMarkAllHrNotificationsRead, useDismissHrNotification, useDeleteHrNotification } from '../../../services/hr-notification-hooks';
import { formatEnum } from './hr-constants';

export function NotificationsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading } = useHrNotifications(wsId, deptId, { status: (statusFilter || undefined) as never, notificationType: typeFilter || undefined });
  const { data: stats } = useHrNotificationStats(wsId, deptId);
  const markRead = useMarkHrNotificationRead(wsId, deptId);
  const markAllRead = useMarkAllHrNotificationsRead(wsId, deptId, user?.id ?? '');
  const dismiss = useDismissHrNotification(wsId, deptId);
  const deleteNotif = useDeleteHrNotification(wsId, deptId);

  const notifications = data?.content ?? [];
  const typeOptions = stats ? Object.keys(stats.notificationsByType ?? {}) : [];

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Total</span>
            <span className="text-section font-bold text-text-primary">{stats.totalNotifications}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Unread</span>
            <span className="text-section font-bold text-accent-600">{stats.unreadCount}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Dismissed</span>
            <span className="text-section font-bold text-text-primary">{stats.dismissedCount}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Today</span>
            <span className="text-section font-bold text-success-600">{stats.todayCount}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="cx-input h-10 px-3 w-44">
            <option value="">All Statuses</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
          {typeOptions.length > 0 && (
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="cx-input h-10 px-3 w-56">
              <option value="">All Types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{formatEnum(t)}</option>
              ))}
            </select>
          )}
        </div>
        {notifications.length > 0 && (
          <Can permission="HR_NOTIFICATION_DISMISS">
            <Button variant="outline" size="sm" leftIcon={<CheckCheck />}
              onClick={() => markAllRead.mutate(undefined, { onSuccess: () => toast({ title: 'All marked as read', tone: 'success' }) })}>
              Mark All Read
            </Button>
          </Can>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell />} title="No notifications" description="Department notifications will appear here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-4 p-4 rounded-lg border bg-surface transition-colors ${n.status === 'UNREAD' ? 'border-accent-200 dark:border-accent-800' : 'border-border-subtle'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${n.status === 'UNREAD' ? 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300' : 'bg-surface-2 text-text-tertiary'}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-body font-medium text-text-primary">{n.title}</p>
                  {n.status === 'UNREAD' && <span className="h-2 w-2 rounded-full bg-accent-500 shrink-0" />}
                </div>
                {n.body && <p className="text-caption text-text-secondary mt-0.5">{n.body}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone={n.status === 'UNREAD' ? 'accent' : n.status === 'DISMISSED' ? 'neutral' : 'success'} variant="soft">{formatEnum(n.status)}</Badge>
                  {n.notificationType && <span className="text-2xs text-text-tertiary">{formatEnum(n.notificationType)}</span>}
                  <span className="text-2xs text-text-tertiary">{n.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {n.status === 'UNREAD' && (
                  <Can permission="HR_NOTIFICATION_DISMISS">
                    <IconButton label="Mark read" variant="ghost" size="sm" onClick={() => markRead.mutate(n.id)}>
                      <CheckCheck className="h-4 w-4" />
                    </IconButton>
                  </Can>
                )}
                {n.status !== 'DISMISSED' && (
                  <Can permission="HR_NOTIFICATION_DISMISS">
                    <IconButton label="Dismiss" variant="ghost" size="sm" onClick={() => dismiss.mutate(n.id)}>
                      <Bell className="h-4 w-4" />
                    </IconButton>
                  </Can>
                )}
                <Can permission="NOTIFICATION_DELETE">
                  <IconButton label="Delete" variant="ghost" size="sm" className="text-danger-600"
                    onClick={() => deleteNotif.mutate(n.id, { onSuccess: () => toast({ title: 'Notification deleted', tone: 'success' }) })}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </Can>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
