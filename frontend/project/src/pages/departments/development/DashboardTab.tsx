import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { useSprintStats } from '../../../services/department-hooks';
import { useToast } from '../../../components/ui/Toast';
import { Code, Bug, GitBranch, CheckCircle, BarChart3, Loader2, AlertCircle, FolderKanban, CheckSquare } from 'lucide-react';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-300',
  neutral: 'bg-surface-2 text-text-secondary',
};

function KpiCard({ icon, label, value, sub, tone = 'accent' }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <Card className="hover:shadow-cx-md transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneBg[tone]}`}>{icon}</span>
        </div>
        <p className="mt-3 text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary">{value}</p>
        {sub && <p className="mt-1 text-2xs text-text-tertiary">{sub}</p>}
      </CardBody>
    </Card>
  );
}

export function DevelopmentDashboardTab({ wsId, deptId, onNavigate }: { wsId: string; deptId: string; onNavigate?: (tab: string) => void }) {
  const { toast } = useToast();
  const { data: dashboard, isLoading, isError, error, refetch } = useDepartmentDashboard(wsId, deptId);
  const { data: sprintStats } = useSprintStats(wsId, deptId);

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
        <p className="text-body font-medium text-text-secondary">Failed to load dashboard data</p>
        <p className="text-caption text-text-tertiary">{(error as Error)?.message ?? 'Unknown error'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { overview, taskSummary, departmentMembers, activeProjects, recentProjects, departmentActivities } = dashboard;
  const departmentTasks = dashboard.departmentTasks ?? [];
  const completionRate = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Code />} label="Active Projects" value={overview.activeProjects} tone="success" />
        <KpiCard icon={<Bug />} label="Overdue Tasks" value={taskSummary.overdueTasks} tone="warning" sub={`${taskSummary.tasksDueToday} due today`} />
        <KpiCard icon={<GitBranch />} label="Task Completion" value={`${completionRate}%`} tone="accent" sub={`${taskSummary.archivedTasks} archived`} />
        <KpiCard icon={<CheckCircle />} label="Sprint Velocity" value={sprintStats?.averageVelocity ?? '—'} tone="info" sub={`Avg ${sprintStats?.averageCompletionRate ?? 0}% completion`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Active Projects</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {activeProjects.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No active projects</p>
            ) : activeProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div>
                  <p className="text-caption font-medium text-text-primary">{p.name}</p>
                  <p className="text-2xs text-text-tertiary">{p.taskCount} tasks</p>
                </div>
                <Badge tone={p.status === 'ACTIVE' ? 'success' : p.status === 'PLANNED' ? 'info' : 'neutral'} variant="soft">{p.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sprint Overview</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-accent-600">{sprintStats?.totalSprints ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Total Sprints</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-success-600">{sprintStats?.activeSprints ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Active</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-info-600">{sprintStats?.completedSprints ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Completed</span>
              </div>
            </div>
            {sprintStats?.averageCompletionRate != null && (
              <div className="flex items-center gap-2">
                <span className="text-caption text-text-secondary">Avg Completion:</span>
                <Progress value={sprintStats.averageCompletionRate} size="sm" tone="accent" className="flex-1" />
                <span className="text-caption font-medium text-text-primary">{sprintStats.averageCompletionRate.toFixed(0)}%</span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>My Tasks</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentTasks.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No tasks assigned</p>
            ) : departmentTasks.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-start gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                <span className={`flex h-2 w-2 rounded-full mt-1.5 shrink-0 ${t.status === 'COMPLETED' ? 'bg-success-500' : t.status === 'OVERDUE' ? 'bg-danger-500' : 'bg-accent-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary">{t.title}</p>
                  {t.projectName && <p className="text-2xs text-text-tertiary truncate">{t.projectName}</p>}
                </div>
                <Badge tone={t.status === 'COMPLETED' ? 'success' : t.status === 'OVERDUE' ? 'danger' : 'accent'} variant="soft" dot>
                  {t.status}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            <Button variant="outline" fullWidth leftIcon={<GitBranch />} size="sm" onClick={() => onNavigate?.('sprints')}>Sprints</Button>
            <Button variant="outline" fullWidth leftIcon={<FolderKanban />} size="sm" onClick={() => onNavigate?.('projects')}>Projects</Button>
            <Button variant="outline" fullWidth leftIcon={<CheckSquare />} size="sm" onClick={() => onNavigate?.('tasks')}>Tasks</Button>
            <Button variant="outline" fullWidth leftIcon={<BarChart3 />} size="sm" onClick={() => onNavigate?.('analytics')}>Analytics</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentActivities.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No recent activity</p>
            ) : departmentActivities.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                <span className="flex h-2 w-2 rounded-full bg-accent-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-caption text-text-primary">{a.description}</p>
                  {a.projectName && <p className="text-2xs text-text-tertiary truncate">{a.projectName}</p>}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Projects</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {recentProjects.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No recent projects</p>
            ) : recentProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div>
                  <p className="text-caption font-medium text-text-primary">{p.name}</p>
                  <p className="text-2xs text-text-tertiary">{p.taskCount} tasks</p>
                </div>
                <Badge tone={p.status === 'ACTIVE' ? 'success' : p.status === 'PLANNED' ? 'info' : 'neutral'} variant="soft">{p.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team ({overview.activeMembers}/{overview.totalMembers})</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentMembers.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No members found</p>
            ) : departmentMembers.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-2xs font-semibold text-white bg-accent-500">
                  {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary">{m.firstName} {m.lastName}</p>
                  <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                    <span>{m.role}</span>
                    {m.teamName && <span>· {m.teamName}</span>}
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
