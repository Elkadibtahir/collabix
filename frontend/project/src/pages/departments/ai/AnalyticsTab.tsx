import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart, PieChart } from '../../../components/ui/Charts';
import { Button } from '../../../components/ui/Button';
import { useDepartmentDashboard, useModelStats, useWorkspaceAnalytics } from '../../../services/department-hooks';
import { Cpu, FlaskConical, Rocket, Brain, Loader2, AlertCircle } from 'lucide-react';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
};

function KpiCard({ icon, label, value, tone = 'accent' }: { icon: React.ReactNode; label: string; value: string | number; tone?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneBg[tone]} [&>svg]:h-4 [&>svg]:w-4`}>{icon}</span>
        </div>
        <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="text-page font-semibold text-text-primary leading-tight mt-1">{value}</p>
      </CardBody>
    </Card>
  );
}

export function AIAnalyticsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { data: dashboard, isLoading, isError, error, refetch } = useDepartmentDashboard(wsId, deptId);
  const { data: modelStats } = useModelStats(wsId, deptId);
  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError } = useWorkspaceAnalytics(wsId);

  if (isLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError || !dashboard || analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-8 w-8 text-danger-500" />
        <p className="text-body font-medium text-text-secondary">Failed to load analytics data</p>
        <p className="text-caption text-text-tertiary">{(error as Error)?.message ?? 'Unknown error'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { taskSummary, aiModelSummary } = dashboard;

  const charts = analytics?.charts ?? [];
  const lineChart = charts.find((c) => c.type === 'LINE');
  const barChart = charts.find((c) => c.type === 'BAR');
  const pieChart = charts.find((c) => c.type === 'PIE' || c.type === 'DONUT');

  const toLineData = (c: typeof lineChart) =>
    c?.series?.[0]?.points?.map((p) => ({ label: p.label ?? p.category ?? '', value: p.value })) ?? [];
  const toBarData = (c: typeof barChart) =>
    c?.series?.[0]?.points?.map((p) => ({ label: p.label ?? p.category ?? '', value: p.value })) ?? [];
  const toPieData = (c: typeof pieChart) =>
    c?.series?.[0]?.points?.map((p) => ({ label: p.label ?? p.category ?? '', value: p.value, tone: 'accent' as const })) ?? [];

  const lineData = toLineData(lineChart);
  const barData = toBarData(barChart);
  const pieData = toPieData(pieChart);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Brain />} label="Total Models" value={String(aiModelSummary?.totalModels ?? 0)} tone="accent" />
        <KpiCard icon={<Cpu />} label="In Training" value={String(modelStats?.trainingModels ?? aiModelSummary?.modelsInTraining ?? 0)} tone="info" />
        <KpiCard icon={<FlaskConical />} label="Ready Models" value={String(modelStats?.readyModels ?? aiModelSummary?.readyModels ?? 0)} tone="success" />
        <KpiCard icon={<Rocket />} label="Deployed Models" value={String(modelStats?.deployedModels ?? aiModelSummary?.deployedModels ?? 0)} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{lineChart?.title ?? 'Research Progress'}</CardTitle></CardHeader>
          <CardBody>
            {lineData.length > 0 ? <LineChart data={lineData} height={200} tone="accent" /> : <p className="text-caption text-text-tertiary py-8 text-center">No trend data available</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>{barChart?.title ?? 'Distribution'}</CardTitle></CardHeader>
          <CardBody>
            {barData.length > 0 ? <BarChart data={barData} height={200} tone="success" /> : <p className="text-caption text-text-tertiary py-8 text-center">No distribution data available</p>}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Task Health</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'Active', value: taskSummary.activeTasks },
                { label: 'Overdue', value: taskSummary.overdueTasks },
                { label: 'Archived', value: taskSummary.archivedTasks },
              ]}
              height={160}
              tone="info"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>{pieChart?.title ?? 'Breakdown'}</CardTitle></CardHeader>
          <CardBody>
            {pieData.length > 0 ? <PieChart data={pieData} size={140} /> : <p className="text-caption text-text-tertiary py-8 text-center">No breakdown data available</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Model Health</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {[
              { label: 'Model Performance', value: aiModelSummary?.readyModels ?? 0, max: Math.max(aiModelSummary?.totalModels ?? 1, 1) },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xs text-text-tertiary">{m.label}</span>
                  <span className="text-2xs font-medium text-text-primary">{m.value}/{m.max}</span>
                </div>
                <Progress value={(m.value / Math.max(m.max, 1)) * 100} size="sm" tone="accent" />
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
              <span className="text-2xs text-text-tertiary">Avg Accuracy</span>
              <span className="text-body font-semibold text-text-primary">{modelStats?.averageAccuracy ?? 0}%</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
