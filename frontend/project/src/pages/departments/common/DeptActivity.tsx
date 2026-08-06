import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader2, AlertCircle, Activity as ActivityIcon } from 'lucide-react';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { formatRelativeTime } from '../../../lib/format';

export function DeptActivity({ wsId, deptId }: { wsId?: string; deptId?: string }) {
  const { data: dashboard, isLoading, isError, refetch } = useDepartmentDashboard(wsId, deptId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-16 flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-danger-500" />
          <p className="text-body font-medium text-text-secondary">Failed to load activity</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </CardBody>
      </Card>
    );
  }

  const activities = dashboard?.departmentActivities ?? [];

  if (activities.length === 0) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState icon={<ActivityIcon />} title="No recent activity" description="Department activity events will appear here as they occur." />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="flex flex-col">
        <div className="relative border-l border-border-subtle ml-3 space-y-6 py-1">
          {activities.map((a) => (
            <div key={a.id} className="relative pl-6">
              <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-canvas" />
              <p className="text-body font-medium text-text-primary">{a.description}</p>
              <div className="flex items-center gap-2 text-2xs text-text-tertiary mt-0.5">
                {a.actorName && <span>{a.actorName}</span>}
                {a.projectName && <span>• {a.projectName}</span>}
                {a.createdAt && <span>• {formatRelativeTime(a.createdAt)}</span>}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
