import { Card, CardBody, CardHeader, CardTitle, SectionHeader } from '../../../components/ui/Card';
import { Progress } from '../../../components/ui/Progress';
import { TrendingUp, TrendingDown, BarChart3, Activity, Users, Target } from 'lucide-react';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
};

interface KpiItem {
  label: string;
  value: string | number;
  change: number;
  changeUp: boolean;
  icon: React.ReactNode;
}

interface MetricItem {
  label: string;
  value: number;
  max: number;
}

interface DeptAnalyticsData {
  kpis: KpiItem[];
  metrics: MetricItem[];
  chartPlaceholder?: string;
  healthScore?: number;
}

export function DeptAnalytics({ data, wsId, deptId }: { data?: DeptAnalyticsData; wsId?: string; deptId?: string }) {
  if (!data) {
    return (
      <Card>
        <CardBody className="py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <BarChart3 className="h-8 w-8 text-text-tertiary" />
            <p className="text-body font-medium text-text-secondary">Coming soon</p>
            <p className="text-caption text-text-tertiary">Analytics will be available in a future update.</p>
          </div>
        </CardBody>
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {data.kpis.map((k, i) => (
          <Card key={i}>
            <CardBody>
              <div className="flex items-start justify-between mb-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
                  {k.icon}
                </span>
                <span className={`inline-flex items-center gap-0.5 text-2xs font-medium ${k.changeUp ? 'text-success-600' : 'text-danger-600'}`}>
                  {k.changeUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {k.change}%
                </span>
              </div>
              <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{k.label}</p>
              <p className="text-page font-semibold text-text-primary leading-tight mt-1">{k.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {data.healthScore != null && (
        <Card>
          <CardHeader>
            <CardTitle>Department Health</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-accent-500">
                <span className="text-display font-bold text-accent-600">{data.healthScore}%</span>
              </div>
              <div className="flex-1 space-y-2">
                {data.metrics.map((m, i) => (
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-48 rounded-lg border border-border-subtle bg-surface-2">
            <div className="flex flex-col items-center gap-2 text-text-tertiary">
              <BarChart3 className="h-8 w-8" />
              <p className="text-caption">Chart visualization placeholder</p>
              <p className="text-2xs">Real charts will render here with backend data</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
