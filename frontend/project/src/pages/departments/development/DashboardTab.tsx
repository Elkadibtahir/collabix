import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart } from '../../../components/ui/Charts';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { useToast } from '../../../components/ui/Toast';
import { TrendingUp, TrendingDown, Code, GitBranch, Bug, CheckCircle, Users, Clock, ArrowRight, BookOpen, BarChart3, GitPullRequest, Activity, Terminal, Loader2, AlertCircle } from 'lucide-react';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
};

function KpiCard({ icon, label, value, change, up, tone = 'accent' }: { icon: React.ReactNode; label: string; value: string; change?: string; up?: boolean; tone?: string }) {
  return (
    <Card className="hover:shadow-cx-md transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneBg[tone]}`}>{icon}</span>
          {change && (
            <span className={`inline-flex items-center gap-0.5 text-2xs font-medium ${up ? 'text-success-600' : 'text-danger-600'}`}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change}
            </span>
          )}
        </div>
        <p className="mt-3 text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary">{value}</p>
      </CardBody>
    </Card>
  );
}

const sprints = [
  { name: 'Sprint 24: API Optimization', progress: 65, status: 'active', tasks: { done: 18, total: 28 } },
  { name: 'Sprint 25: Dashboard Redesign', progress: 30, status: 'active', tasks: { done: 8, total: 26 } },
  { name: 'Sprint 26: Mobile App', progress: 0, status: 'planned', tasks: { done: 0, total: 32 } },
];

const pullRequests = [
  { title: 'feat: API Gateway timeout config', author: 'David Wu', status: 'open', comments: 5, updated: '2h ago' },
  { title: 'fix: Dashboard chart data binding', author: 'Sarah Nelson', status: 'review', comments: 8, updated: '4h ago' },
  { title: 'refactor: Extract auth middleware', author: 'Luis Garcia', status: 'open', comments: 3, updated: '6h ago' },
  { title: 'chore: Update dependencies', author: 'Maya Mishra', status: 'merged', comments: 2, updated: '1d ago' },
];

const buildStatus = [
  { name: 'API Gateway', status: 'Passing', duration: '3m 12s', branch: 'main', tone: 'success' as const },
  { name: 'Frontend App', status: 'Passing', duration: '2m 45s', branch: 'develop', tone: 'success' as const },
  { name: 'Mobile App', status: 'Failing', duration: '4m 30s', branch: 'feature/chat', tone: 'danger' as const },
  { name: 'Documentation', status: 'Passing', duration: '1m 10s', branch: 'main', tone: 'success' as const },
];

export function DevelopmentDashboardTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { toast } = useToast();
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
        <p className="text-body font-medium text-text-secondary">Failed to load dashboard data</p>
        <p className="text-caption text-text-tertiary">{(error as Error)?.message ?? 'Unknown error'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { overview, taskSummary, departmentMembers, departmentActivities, activeProjects } = dashboard;
  const completionRate = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Code />} label="Active Projects" value={String(overview.activeProjects)} change="+2" up tone="success" />
        <KpiCard icon={<Bug />} label="Overdue Tasks" value={String(taskSummary.overdueTasks)} change="-8" up tone="warning" />
        <KpiCard icon={<GitBranch />} label="Task Completion" value={`${completionRate}%`} change="+12%" up tone="accent" />
        <KpiCard icon={<CheckCircle />} label="Code Review Queue" value="14" change="+3" up={false} tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Active Projects</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {activeProjects.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No active projects</p>
            ) : activeProjects.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div>
                  <p className="text-caption font-medium text-text-primary">{p.name}</p>
                  <p className="text-2xs text-text-tertiary">{p.taskCount} tasks</p>
                </div>
                <Badge
                  tone={p.status === 'ACTIVE' ? 'success' : p.status === 'PLANNED' ? 'info' : 'neutral'}
                  variant="soft"
                >
                  {p.status}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sprint Burndown (Sprint 24)</CardTitle></CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'Day 1', value: 28 },
                { label: 'Day 3', value: 24 },
                { label: 'Day 5', value: 19 },
                { label: 'Day 7', value: 14 },
                { label: 'Day 9', value: 10 },
                { label: 'Day 11', value: 8 },
              ]}
              height={180}
              tone="accent"
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Task Summary</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {[
              { label: 'Total Tasks', count: taskSummary.totalTasks, color: 'accent' as const },
              { label: 'Active', count: taskSummary.activeTasks, color: 'info' as const },
              { label: 'Overdue', count: taskSummary.overdueTasks, color: 'danger' as const },
              { label: 'Archived', count: taskSummary.archivedTasks, color: 'neutral' as const },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-surface-2">
                <span className="text-caption text-text-primary">{t.label}</span>
                <Badge tone={t.color} variant="soft">{t.count}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Code Review Queue</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            {pullRequests.map((pr, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-2 transition-colors">
                <GitPullRequest className={`h-4 w-4 shrink-0 ${pr.status === 'merged' ? 'text-success-500' : pr.status === 'review' ? 'text-warning-500' : 'text-accent-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary truncate">{pr.title}</p>
                  <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                    <span>{pr.author}</span>
                    <span>· {pr.comments} comments</span>
                    <span>· {pr.updated}</span>
                  </div>
                </div>
                <Badge
                  tone={pr.status === 'merged' ? 'success' : pr.status === 'review' ? 'warning' : 'accent'}
                  variant="soft"
                >
                  {pr.status}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Release Progress</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {[
              { name: 'v3.2.0 - API Gateway', status: 'In Progress', progress: 75 },
              { name: 'v3.3.0 - Dashboard', status: 'Planning', progress: 20 },
              { name: 'v4.0.0 - Mobile App', status: 'Backlog', progress: 5 },
            ].map((r, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-text-primary">{r.name}</span>
                  <Badge tone={r.status === 'In Progress' ? 'warning' : r.status === 'Planning' ? 'info' : 'neutral'} variant="soft">{r.status}</Badge>
                </div>
                <Progress value={r.progress} size="xs" />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            <Button variant="outline" fullWidth leftIcon={<GitBranch />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Create Sprint</Button>
            <Button variant="outline" fullWidth leftIcon={<BarChart3 />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Sprint Report</Button>
            <Button variant="outline" fullWidth leftIcon={<Code />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>New Repository</Button>
            <Button variant="outline" fullWidth leftIcon={<Users />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Code Review</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Technical Docs</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2 text-caption text-text-secondary">
            <p>• API Reference v3.2</p>
            <p>• Architecture Overview</p>
            <p>• Development Setup Guide</p>
            <p>• Deployment Playbook</p>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>View All</Button>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Team Members ({overview.activeMembers}/{overview.totalMembers})</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentMembers.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No members found</p>
            ) : departmentMembers.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-2xs font-semibold text-white bg-accent-500">
                  {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary">{m.firstName} {m.lastName}</p>
                  <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                    <span>{m.role}</span>
                    <span>· {m.teamName}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Build Pipeline</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {buildStatus.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div className="flex items-center gap-3">
                  <Terminal className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption font-medium text-text-primary">{b.name}</p>
                    <p className="text-2xs text-text-tertiary">{b.branch} · {b.duration}</p>
                  </div>
                </div>
                <Badge tone={b.tone} variant="soft">{b.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
