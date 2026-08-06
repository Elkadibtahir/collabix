import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart, PieChart } from '../../../components/ui/Charts';
import { Button } from '../../../components/ui/Button';
import { Loader2, AlertCircle, CheckSquare, FolderKanban, FileText, Bell } from 'lucide-react';
import { useWorkspaceAnalytics } from '../../../services/department-hooks';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
};

function KpiCard({ icon, label, value, sub, tone = 'accent' }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneBg[tone]} [&>svg]:h-4 [&>svg]:w-4`}>{icon}</span>
        </div>
        <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="text-page font-semibold text-text-primary leading-tight mt-1">{value}</p>
        {sub && <p className="text-2xs text-text-tertiary mt-0.5">{sub}</p>}
        </CardBody>
      </Card>
    );
  }

export function DeptAnalytics({ wsId }: { wsId?: string }) {
  const { data, isLoading, isError, error, refetch } = useWorkspaceAnalytics(wsId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardBody className="py-16 flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-danger-500" />
          <p className="text-body font-medium text-text-secondary">Failed to load analytics</p>
          <p className="text-caption text-text-tertiary">{(error as Error)?.message ?? 'An error occurred.'}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </CardBody>
      </Card>
);
  }

  const { tasks, activities, documents, notifications, charts } = data;
  const barChart = charts.find((c) => c.type === 'BAR');
  const lineChart = charts.find((c) => c.type === 'LINE');
  const pieChart = charts.find((c) => c.type === 'PIE' || c.type === 'DONUT');

  const toBarData = (c: typeof barChart) =>
    c?.series?.[0]?.points?.map((p) => ({ label: p.label ?? p.category ?? '', value: p.value })) ?? [];
  const toLineData = (c: typeof lineChart) =>
    c?.series?.[0]?.points?.map((p) => ({ label: p.label ?? p.category ?? '', value: p.value })) ?? [];
  const toPieData = (c: typeof pieChart) =>
    c?.series?.[0]?.points?.map((p) => ({ label: p.label ?? p.category ?? '', value: p.value, tone: 'accent' as const })) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<CheckSquare />} label="Active Tasks" value={tasks.activeCount} sub={`${tasks.completionRate}% completion`} tone="accent" />
        <KpiCard icon={<FolderKanban />} label="Overdue" value={tasks.overdueCount} sub={`${tasks.dueTodayCount} due today`} tone="warning" />
        <KpiCard icon={<FileText />} label="Documents" value={documents.documentCount} sub="in workspace" tone="info" />
        <KpiCard icon={<Bell />} label="Notifications" value={notifications.unreadCount} sub={`${notifications.todayCount} today`} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{lineChart?.title ?? 'Task Trend'}</CardTitle></CardHeader>
          <CardBody>
            {toLineData(lineChart).length > 0 ? (
              <LineChart data={toLineData(lineChart)} height={200} tone="accent" />
            ) : (
              <p className="text-caption text-text-tertiary py-8 text-center">No trend data available</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>{barChart?.title ?? 'Distribution'}</CardTitle></CardHeader>
          <CardBody>
            {toBarData(barChart).length > 0 ? (
              <BarChart data={toBarData(barChart)} height={200} tone="success" />
            ) : (
              <p className="text-caption text-text-tertiary py-8 text-center">No distribution data available</p>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Task Health</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {[
              { label: 'Completion Rate', value: tasks.completionRate, max: 100 },
              { label: 'Due This Week', value: tasks.dueThisWeekCount, max: Math.max(tasks.activeCount, 1) },
              { label: 'Velocity', value: tasks.velocity, max: Math.max(tasks.velocity, 1) },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xs text-text-tertiary">{m.label}</span>
                  <span className="text-2xs font-medium text-text-primary">{m.value > 100 ? m.value : `${m.value}/${m.max}`}</span>
                </div>
                <Progress value={Math.min((m.value / Math.max(m.max, 1)) * 100, 100)} size="sm"
                  tone={(m.value / Math.max(m.max, 1)) >= 0.8 ? 'success' : (m.value / Math.max(m.max, 1)) >= 0.5 ? 'warning' : 'danger'} />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>{pieChart?.title ?? 'Breakdown'}</CardTitle></CardHeader>
          <CardBody>
            {toPieData(pieChart).length > 0 ? (
              <PieChart data={toPieData(pieChart)} size={140} />
            ) : (
              <p className="text-caption text-text-tertiary py-8 text-center">No breakdown data available</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Documents & Activity</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {[
              { label: 'Documents', value: documents.documentCount, max: Math.max(documents.documentCount, 1) },
              { label: 'Knowledge Base', value: documents.knowledgeBaseCount, max: Math.max(documents.knowledgeBaseCount, 1) },
              { label: 'Activity Events', value: activities.totalCount, max: Math.max(activities.totalCount, 1) },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xs text-text-tertiary">{m.label}</span>
                  <span className="text-2xs font-medium text-text-primary">{m.value}</span>
                </div>
                <Progress value={Math.min((m.value / Math.max(m.max, 1)) * 100, 100)} size="sm" tone="info" />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
