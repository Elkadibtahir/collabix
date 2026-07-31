import { BarChart3, Users, FolderKanban, CheckSquare, Bell, Activity, Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { useWorkspaceDashboard } from '../../services/workspace-hooks';
import { cn } from '../../lib/cn';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-500',
};

function StatCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string | number; sub: string; tone: string }) {
  return (
    <Card className="hover:shadow-cx-md transition-shadow duration-200">
      <CardBody>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]', toneBg[tone])}>{icon}</span>
        <p className="mt-3 text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{value}</p>
        <p className="mt-1 text-2xs text-text-tertiary">{sub}</p>
      </CardBody>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
      <span className="text-caption text-text-secondary">{label}</span>
      <span className="text-body font-medium text-text-primary">{value}</span>
    </div>
  );
}

export function WorkspaceAnalyticsPage({ workspaceId }: { workspaceId: string }) {
  const { data: dash, isLoading, isError, error, refetch, isFetching } = useWorkspaceDashboard(workspaceId || undefined);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="Failed to load analytics"
            description={error instanceof Error ? error.message : 'An error occurred while loading workspace analytics.'}
            action={
              <Button onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                Retry
              </Button>
            }
          />
        </CardBody>
      </Card>
    );
  }

  const s = dash?.workspaceSummary;
  const t = dash?.taskSummary;
  const p = dash?.projectSummary;
  const m = dash?.memberSummary;
  const tm = dash?.teamSummary;
  const n = dash?.notificationSummary;

  const hasData = dash && Object.keys(dash).length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div>
          <h1 className="text-display font-semibold text-text-primary">Analytics</h1>
          <p className="mt-1 text-body text-text-secondary">Workspace analytics and insights.</p>
        </div>
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title="No analytics data"
              description="Analytics data will appear once the workspace has activity."
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-display font-semibold text-text-primary">Analytics</h1>
          <p className="mt-1 text-body text-text-secondary">Workspace analytics and insights for {s?.name}.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={<Users />} label="Members" value={m?.totalCount ?? s?.memberCount ?? 0} sub={`${m?.activeCount ?? 0} active`} tone="info" />
        <StatCard icon={<Building2 />} label="Teams" value={tm?.totalCount ?? 0} sub={`${tm?.activeCount ?? 0} active`} tone="neutral" />
        <StatCard icon={<FolderKanban />} label="Projects" value={p?.totalCount ?? 0} sub={`${p?.activeCount ?? 0} active`} tone="accent" />
        <StatCard icon={<CheckSquare />} label="Tasks" value={t?.totalTasks ?? 0} sub={`${t?.completedTasks ?? 0} completed`} tone="success" />
        <StatCard icon={<Activity />} label="Overdue" value={t?.overdueTasks ?? 0} sub="Tasks past due" tone="danger" />
        <StatCard icon={<Bell />} label="Notifications" value={n?.unread ?? 0} sub={`${n?.total ?? 0} total`} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-1">
              <DetailRow label="Total Tasks" value={String(t?.totalTasks ?? 0)} />
              <DetailRow label="Active Tasks" value={String(t?.activeTasks ?? 0)} />
              <DetailRow label="Completed Tasks" value={String(t?.completedTasks ?? 0)} />
              <DetailRow label="Overdue Tasks" value={String(t?.overdueTasks ?? 0)} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-1">
              <DetailRow label="Total Projects" value={String(p?.totalCount ?? 0)} />
              <DetailRow label="Active Projects" value={String(p?.activeCount ?? 0)} />
              <DetailRow label="Completed Projects" value={String(p?.completedCount ?? 0)} />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
