import { Card, CardBody, CardHeader, CardTitle, SectionHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Users, FolderKanban, CheckSquare, Activity, TrendingUp, Briefcase, AlertCircle } from 'lucide-react';
import { useDepartmentDetail } from '../../../services/department-hooks';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

function StatCard({ icon, label, value, sub, tone = 'accent' }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3 mb-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${toneBg[tone]}`}>{icon}</span>
          <div className="min-w-0">
            <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
            <p className="text-page font-semibold text-text-primary leading-tight">{value}</p>
            {sub && <p className="text-2xs text-text-tertiary mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function DeptOverview({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { data: dept, isLoading, isError } = useDepartmentDetail(wsId || undefined, deptId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardBody><Skeleton className="h-16 w-full" /></CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState icon={<AlertCircle className="h-6 w-6" />} title="Failed to load department data" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {dept?.description && (
        <Card>
          <CardBody>
            <p className="text-body text-text-secondary">{dept.description}</p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatCard icon={<Users />} label="Teams" value={dept?.teamCount ?? 0} sub="active teams" tone="accent" />
        <StatCard icon={<FolderKanban />} label="Projects" value="—" tone="info" />
        <StatCard icon={<CheckSquare />} label="Tasks" value="—" tone="warning" />
        <StatCard icon={<TrendingUp />} label="Status" value={dept?.status ?? '—'} tone="success" />
      </div>
    </div>
  );
}
