import { Card, CardBody, CardHeader, CardTitle, SectionHeader } from '../../../components/ui/Card';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart, PieChart } from '../../../components/ui/Charts';
import { Button } from '../../../components/ui/Button';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { TrendingUp, TrendingDown, Cpu, FlaskConical, Rocket, Brain, Lightbulb, Activity, Loader2, AlertCircle } from 'lucide-react';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
};

function KpiCard({ icon, label, value, change, up, tone = 'accent' }: { icon: React.ReactNode; label: string; value: string; change?: number; up?: boolean; tone?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneBg[tone]} [&>svg]:h-4 [&>svg]:w-4`}>{icon}</span>
          <span className={`inline-flex items-center gap-0.5 text-2xs font-medium ${up ? 'text-success-600' : 'text-danger-600'}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}%
          </span>
        </div>
        <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="text-page font-semibold text-text-primary leading-tight mt-1">{value}</p>
      </CardBody>
    </Card>
  );
}

export function AIAnalyticsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { data: dashboard, isLoading, isError, error, refetch } = useDepartmentDashboard(wsId, deptId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-8 w-8 text-danger-500" />
        <p className="text-body font-medium text-text-secondary">Failed to load analytics data</p>
        <p className="text-caption text-text-tertiary">{(error as Error)?.message ?? 'Unknown error'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { overview, taskSummary, aiModelSummary } = dashboard;
  const completionRate = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Brain />} label="Innovation Score" value={`${completionRate}/100`} change={5} up tone="accent" />
        <KpiCard icon={<Cpu />} label="Active Projects" value={String(overview.activeProjects)} change={3} up tone="success" />
        <KpiCard icon={<FlaskConical />} label="Active Tasks" value={String(taskSummary.activeTasks)} change={4} up tone="info" />
        <KpiCard icon={<Rocket />} label="Total Models" value={String(aiModelSummary?.totalModels ?? 0)} change={8} up tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Research Progress</CardTitle></CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'Jan', value: 25 },
                { label: 'Feb', value: 32 },
                { label: 'Mar', value: 28 },
                { label: 'Apr', value: 45 },
                { label: 'May', value: 52 },
                { label: 'Jun', value: 60 },
              ]}
              height={200}
              tone="accent"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Automation Statistics</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'Q1', value: 45 },
                { label: 'Q2', value: 58 },
                { label: 'Q3', value: 76 },
                { label: 'Q4', value: 62 },
              ]}
              height={200}
              tone="success"
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Experiment Progress</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'Running', value: 7 },
                { label: 'Completed', value: 22 },
                { label: 'Failed', value: 4 },
                { label: 'Planned', value: 9 },
              ]}
              height={160}
              tone="info"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Project Health</CardTitle></CardHeader>
          <CardBody>
            <PieChart
              data={[
                { label: 'On Track', value: 5, tone: 'success' },
                { label: 'At Risk', value: 2, tone: 'warning' },
                { label: 'Blocked', value: 1, tone: 'danger' },
                { label: 'Complete', value: 3, tone: 'info' },
              ]}
              size={120}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Model Performance Trend</CardTitle></CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'v1', value: 72 },
                { label: 'v2', value: 82 },
                { label: 'v3', value: 88 },
                { label: 'v4', value: 92 },
              ]}
              height={160}
              tone="accent"
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Health</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-accent-500">
              <span className="text-display font-bold text-accent-600">76%</span>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Model Performance', value: 90, max: 100 },
                { label: 'Data Quality', value: 78, max: 100 },
                { label: 'Research Output', value: 72, max: 100 },
                { label: 'Automation Coverage', value: 65, max: 100 },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xs text-text-tertiary">{m.label}</span>
                    <span className="text-2xs font-medium text-text-primary">{m.value}/{m.max}</span>
                  </div>
                  <Progress value={(m.value / m.max) * 100} size="sm"
                    tone={(m.value / m.max) >= 0.8 ? 'success' : (m.value / m.max) >= 0.5 ? 'warning' : 'danger'} />
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
