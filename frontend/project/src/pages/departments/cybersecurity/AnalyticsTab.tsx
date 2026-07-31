import { Card, CardBody, CardHeader, CardTitle, SectionHeader } from '../../../components/ui/Card';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart, PieChart } from '../../../components/ui/Charts';
import { Button } from '../../../components/ui/Button';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, Activity, Lock, Loader2 } from 'lucide-react';

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

export function CybersecurityAnalyticsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { data: dashboard, isLoading, error, refetch } = useDepartmentDashboard(wsId, deptId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-8 w-8 text-danger-500" />
        <p className="text-body font-medium text-text-secondary">Failed to load analytics data</p>
        <p className="text-caption text-text-tertiary">{error?.message ?? 'Unknown error'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { overview, taskSummary } = dashboard;
  const completionPct = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Shield />} label="Security Score" value={String(completionPct)} change={4} up tone="success" />
        <KpiCard icon={<AlertTriangle />} label="Active Tasks" value={String(taskSummary.activeTasks)} change={18} up tone="info" />
        <KpiCard icon={<Activity />} label="Active Projects" value={String(overview.activeProjects)} change={12} up tone="accent" />
        <KpiCard icon={<Lock />} label="Team Size" value={String(overview.activeMembers)} change={3} up tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Threat Trends</CardTitle></CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'Jan', value: 185 },
                { label: 'Feb', value: 220 },
                { label: 'Mar', value: 195 },
                { label: 'Apr', value: 310 },
                { label: 'May', value: 280 },
                { label: 'Jun', value: 350 },
              ]}
              height={200}
              tone="danger"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Incident Statistics</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'Critical', value: 3 },
                { label: 'High', value: 7 },
                { label: 'Medium', value: 12 },
                { label: 'Low', value: 8 },
              ]}
              height={200}
              tone="warning"
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Compliance Progress</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'SOC 2', value: 92 },
                { label: 'ISO', value: 65 },
                { label: 'GDPR', value: 88 },
                { label: 'HIPAA', value: 72 },
              ]}
              height={160}
              tone="success"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Risk Evolution</CardTitle></CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'Q1', value: 72 },
                { label: 'Q2', value: 78 },
                { label: 'Q3', value: 86 },
                { label: 'Q4', value: 82 },
              ]}
              height={160}
              tone="accent"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Attack Vectors</CardTitle></CardHeader>
          <CardBody>
            <PieChart
              data={[
                { label: 'Malware', value: 35, tone: 'danger' },
                { label: 'Phishing', value: 28, tone: 'warning' },
                { label: 'Brute Force', value: 18, tone: 'accent' },
                { label: 'DDoS', value: 12, tone: 'info' },
                { label: 'Other', value: 7, tone: 'neutral' },
              ]}
              size={120}
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
            <div className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-success-500">
              <span className="text-display font-bold text-success-600">84%</span>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Threat Detection', value: 95, max: 100 },
                { label: 'Incident Response', value: 82, max: 100 },
                { label: 'Patch Management', value: 70, max: 100 },
                { label: 'User Compliance', value: 88, max: 100 },
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
