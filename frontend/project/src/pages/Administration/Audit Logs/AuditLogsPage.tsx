import { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Clock,
  Filter,
  MoreHorizontal,
  Eye,
  User,
} from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Pagination } from '../../../components/ui/Pagination';
import { Modal } from '../../../components/ui/Modal';
import { cn } from '../../../lib/cn';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useUserHistory } from '../../../services/admin-hooks';
import type { UserHistoryResponse } from '../../../types';

const PAGE_SIZE = 10;

export function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<UserHistoryResponse | null>(null);

  const { data: historyPage, isLoading, isError, error } = useUserHistory(
    { keyword: search || undefined, action: actionFilter },
    page - 1,
    PAGE_SIZE,
  );

  const logs = historyPage?.content ?? [];
  const totalPages = historyPage?.page?.totalPages ?? 1;
  const totalElements = historyPage?.page?.totalElements ?? 0;

  const actions = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const log of logs) {
      if (!seen.has(log.action)) {
        seen.add(log.action);
        result.push(log.action);
      }
    }
    return result;
  }, [logs]);

  const stats = {
    total: totalElements,
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page font-semibold text-text-primary">Audit Logs</h1>
          <p className="text-body text-text-secondary">Track all administrative actions and system changes.</p>
        </div>
        <EmptyState
          icon={<Filter />}
          title="Failed to load audit logs"
          description={error?.message ?? 'An error occurred while fetching logs.'}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Audit Logs</h1>
        <p className="text-body text-text-secondary">
          Track all administrative actions and system changes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Events" value={stats.total} tone="accent" />
        <StatCard label="Info" value={logs.filter((l) => !l.action?.startsWith('ERROR') && !l.action?.startsWith('WARN')).length} tone="info" />
        <StatCard label="Warnings" value={logs.filter((l) => l.action?.startsWith('WARN')).length} tone="warning" />
        <StatCard label="Errors" value={logs.filter((l) => l.action?.startsWith('ERROR')).length} tone="danger" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by user, action, or description..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <Dropdown
          trigger={
            <Button variant="outline">
              Action
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          }
          items={[
            { label: 'All Actions', onClick: () => { setActionFilter(undefined); setPage(1); } },
            { divider: true },
            ...actions.map((a) => ({
              label: a,
              onClick: () => { setActionFilter(a); setPage(1); },
            })),
          ]}
        />
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<Filter />}
          title="No audit logs found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Audit logs table">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Timestamp</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">User</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Action</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Email</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Description</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <AuditLogRow
                      key={log.id}
                      log={log}
                      formatTimestamp={formatTimestamp}
                      onView={() => setSelectedLog(log)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                <p className="text-caption text-text-tertiary">
                  Page {page} of {totalPages} ({totalElements} total)
                </p>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <AuditDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} formatTimestamp={formatTimestamp} />
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const bgColor: Record<string, string | undefined> = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    danger: 'bg-danger-50 dark:bg-danger-100 text-danger-700 dark:text-danger-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
  };

  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bgColor[tone ?? ''])}>
      <p className="text-2xs font-medium opacity-75">{label}</p>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}

function AuditLogRow({
  log,
  formatTimestamp,
  onView,
}: {
  log: UserHistoryResponse;
  formatTimestamp: (ts: string) => string;
  onView: () => void;
}) {
  const actionItems: DropdownItem[] = [
    { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: onView },
  ];

  return (
    <tr className="border-b border-border-subtle hover:bg-surface-2 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-text-tertiary shrink-0" />
          <span className="text-body text-text-secondary">{formatTimestamp(log.createdAt)}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-body font-medium text-text-primary">{log.userFullName || log.performedByName}</p>
      </td>
      <td className="px-4 py-3">
        <Badge tone="info" variant="soft">
          {log.action}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <p className="text-body text-text-secondary">{log.userEmail}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-body text-text-secondary max-w-xs truncate">{log.description || '-'}</p>
      </td>
      <td className="px-4 py-3 text-right">
        <Dropdown
          trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
          items={actionItems}
          align="right"
        />
      </td>
    </tr>
  );
}

function AuditDetailsModal({
  log,
  onClose,
  formatTimestamp,
}: {
  log: UserHistoryResponse | null;
  onClose: () => void;
  formatTimestamp: (ts: string) => string;
}) {
  if (!log) return null;

  return (
    <Modal open={!!log} onClose={onClose} title="Audit Event Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="info" variant="soft">{log.action}</Badge>
            </div>
            <p className="text-body text-text-primary mt-2">{log.description || 'No description'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-caption font-semibold text-text-secondary">Performed By</h4>
            <div className="bg-surface-2 rounded-lg p-3 flex items-center gap-3">
              <User className="h-4 w-4 text-text-tertiary" />
              <div>
                <p className="text-body font-medium text-text-primary">{log.performedByName}</p>
                <p className="text-2xs text-text-tertiary">Email: {log.performedByEmail}</p>
                <p className="text-2xs text-text-tertiary">ID: {log.performedById}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-caption font-semibold text-text-secondary">Timestamp</h4>
            <div className="bg-surface-2 rounded-lg p-3 flex items-center gap-3">
              <Clock className="h-4 w-4 text-text-tertiary" />
              <p className="text-body font-medium text-text-primary">{formatTimestamp(log.createdAt)}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-caption font-semibold text-text-secondary mb-3">Affected User</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailBox label="Name" value={log.userFullName} />
            <DetailBox label="Email" value={log.userEmail} />
            <DetailBox label="User ID" value={log.userId} />
          </div>
        </div>

        {log.workspaceName && (
          <div>
            <h4 className="text-caption font-semibold text-text-secondary mb-3">Workspace</h4>
            <DetailBox label="Name" value={log.workspaceName} />
          </div>
        )}

        {(log.oldValue || log.newValue) && (
          <div>
            <h4 className="text-caption font-semibold text-text-secondary mb-3">Changes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {log.oldValue && <DetailBox label="Old Value" value={log.oldValue} />}
              {log.newValue && <DetailBox label="New Value" value={log.newValue} />}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 rounded-lg p-3">
      <p className="text-2xs text-text-tertiary mb-1">{label}</p>
      <p className="text-body font-medium text-text-primary break-all">{value}</p>
    </div>
  );
}
