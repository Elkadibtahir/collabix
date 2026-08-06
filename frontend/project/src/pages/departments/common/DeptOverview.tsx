import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { Users, FolderKanban, CheckSquare, TrendingUp, AlertCircle, Activity, FileText } from 'lucide-react';
import { useDepartmentDetail, useDepartmentDashboard } from '../../../services/department-hooks';

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

export function DeptOverview({ wsId, deptId }: { wsId?: string; deptId?: string }) {
  const { data: dept, isLoading, isError, refetch } = useDepartmentDetail(wsId, deptId);
  const { data: dashboard, isLoading: dashLoading, isError: dashError } = useDepartmentDashboard(wsId, deptId);

  if (isLoading || dashLoading) {
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

  if (isError || dashError || !dashboard) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="Failed to load department data"
            action={<Button variant="outline" size="sm" onClick={() => { refetch(); }}>Retry</Button>}
          />
        </CardBody>
      </Card>
    );
  }

  const { overview, taskSummary, activeProjects, departmentMembers, departmentActivities } = dashboard;
  const completionRate = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;
  const team = departmentMembers.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {dept?.description && (
        <Card>
          <CardBody>
            <p className="text-body text-text-secondary">{dept.description}</p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatCard icon={<Users />} label="Team Members" value={overview.activeMembers} sub={`${overview.totalMembers} total`} tone="accent" />
        <StatCard icon={<FolderKanban />} label="Active Projects" value={overview.activeProjects} sub={`${overview.archivedProjects} archived`} tone="info" />
        <StatCard icon={<CheckSquare />} label="Open Tasks" value={taskSummary.activeTasks} sub={`${completionRate}% complete`} tone="warning" />
        <StatCard icon={<TrendingUp />} label="Status" value={dept?.status ?? '—'} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-secondary">
                <FolderKanban className="h-5 w-5" />
              </span>
              <div>
                <p className="text-body font-semibold text-text-primary">Active Projects</p>
                <p className="text-2xs text-text-tertiary">Overview of current project progress</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {activeProjects.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No active projects</p>
            ) : activeProjects.map((project) => (
              <div key={project.id} className="rounded-lg border border-border-subtle bg-surface p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-body font-medium text-text-primary truncate">{project.name}</p>
                    <p className="text-2xs text-text-tertiary">{project.taskCount} tasks</p>
                  </div>
                  <span className="text-2xs text-text-secondary uppercase">{project.status}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-body font-semibold text-text-primary">Team Members</p>
                  <p className="text-2xs text-text-tertiary">Key contributors and department leads</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {team.length === 0 ? (
                <p className="text-caption text-text-tertiary py-4 text-center">No members found</p>
              ) : team.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-2xs font-semibold text-white bg-accent-500">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-body font-medium text-text-primary truncate">{member.firstName} {member.lastName}</p>
                    <p className="text-2xs text-text-tertiary truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-50 text-info-600 dark:bg-info-100">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-body font-semibold text-text-primary">Recent Documents</p>
                  <p className="text-2xs text-text-tertiary">Latest files shared in this department</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              {dashboard.recentDocuments.length === 0 ? (
                <p className="text-caption text-text-tertiary py-4 text-center">No recent documents</p>
              ) : dashboard.recentDocuments.slice(0, 4).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-caption font-medium text-text-primary truncate">{doc.title || doc.fileName}</p>
                    <p className="text-2xs text-text-tertiary truncate">{doc.projectName}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
