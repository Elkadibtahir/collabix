import { Card, CardBody, CardHeader, CardTitle, SectionHeader } from '../../../components/ui/Card';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart } from '../../../components/ui/Charts';
import { Button } from '../../../components/ui/Button';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { TrendingUp, TrendingDown, Users, Target, BarChart3, Globe, Loader2, AlertCircle } from 'lucide-react';

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

export function MarketingAnalyticsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
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

  const { overview, taskSummary } = dashboard;
  const completionRate = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Target />} label="Active Campaigns" value={String(overview.activeProjects)} change={12} up tone="success" />
        <KpiCard icon={<Users />} label="Active Members" value={String(overview.activeMembers)} change={3} up={false} tone="warning" />
        <KpiCard icon={<BarChart3 />} label="Task Completion" value={`${completionRate}%`} change={5} up tone="accent" />
        <KpiCard icon={<Globe />} label="Open Tasks" value={String(taskSummary.activeTasks)} change={8} up tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Campaign Trends</CardTitle></CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'Week 1', value: 65 },
                { label: 'Week 2', value: 78 },
                { label: 'Week 3', value: 82 },
                { label: 'Week 4', value: 91 },
                { label: 'Week 5', value: 85 },
                { label: 'Week 6', value: 94 },
              ]}
              height={200}
              tone="accent"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Marketing Performance</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'Jan', value: 45 },
                { label: 'Feb', value: 52 },
                { label: 'Mar', value: 58 },
                { label: 'Apr', value: 63 },
                { label: 'May', value: 70 },
                { label: 'Jun', value: 82 },
              ]}
              height={200}
              tone="accent"
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Lead Growth</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'Q1', value: 520 },
                { label: 'Q2', value: 680 },
                { label: 'Q3', value: 847 },
                { label: 'Q4', value: 720 },
              ]}
              height={160}
              tone="success"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'Visit', value: 24800 },
                { label: 'Lead', value: 3800 },
                { label: 'MQL', value: 1200 },
                { label: 'Deal', value: 120 },
              ]}
              height={160}
              tone="info"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Traffic Evolution</CardTitle></CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'Q1', value: 12000 },
                { label: 'Q2', value: 15800 },
                { label: 'Q3', value: 18500 },
                { label: 'Q4', value: 16200 },
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
              <span className="text-display font-bold text-accent-600">79%</span>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Campaign Performance', value: 82, max: 100 },
                { label: 'Content Quality', value: 90, max: 100 },
                { label: 'Channel Coverage', value: 75, max: 100 },
                { label: 'Brand Awareness', value: 68, max: 100 },
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
