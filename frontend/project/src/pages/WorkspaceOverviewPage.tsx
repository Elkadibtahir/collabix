import { useSearchParams, useNavigate } from 'react-router-dom';
import { Briefcase, Users, FolderKanban, CheckSquare, Bell, Activity, AlertCircle, Loader2, ArrowLeft, Settings } from 'lucide-react';
import { Card, CardBody, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useWorkspaceDetail, useWorkspaceDashboard } from '../services/workspace-hooks';
import { cn } from '../lib/cn';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

function KpiCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string | number; sub: string; tone: string }) {
  return (
    <Card className="hover:shadow-cx-md transition-shadow duration-200">
      <CardBody>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]', toneBg[tone])}>{icon}</span>
        <p className="mt-3 text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{value}</p>
        <p className="mt-1 text-2xs text-text-tertiary">{sub}</p>
      </CardBody>
    </Card>
  );
}

export function WorkspaceOverviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspaceId = searchParams.get('ws') ?? '';
  const { data: ws, isLoading, isError } = useWorkspaceDetail(workspaceId || undefined);
  const { data: dash, isLoading: dLoading } = useWorkspaceDashboard(workspaceId || undefined);

  if (isLoading || dLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError || !ws) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-section font-semibold text-text-primary">Workspace not found</h3>
        <p className="mt-1 text-body text-text-tertiary">Select a workspace from the sidebar to view its overview.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/app/all-workspaces')}>View All Workspaces</Button>
      </div>
    );
  }

  const s = dash?.workspaceSummary;
  const t = dash?.taskSummary;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
            <h1 className="text-display font-semibold text-text-primary">{ws.name}</h1>
            <Badge tone={ws.status === 'ACTIVE' ? 'success' : 'neutral'} variant="soft" dot>{ws.status ?? 'Active'}</Badge>
          </div>
          <p className="mt-1 text-body text-text-secondary ml-11">{ws.description ?? 'No description'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 ml-11">
            <Badge tone="neutral" variant="soft">{s?.memberCount ?? ws.memberCount} members</Badge>
            <Badge tone="neutral" variant="soft">{s?.teamCount ?? ws.teamCount} teams</Badge>
          </div>
        </div>
        <Button variant="outline" leftIcon={<Settings />} onClick={() => navigate('/app/settings')}>Settings</Button>
      </div>

      <SectionHeader title="Overview" description="Key metrics at a glance" />
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon={<Users />} label="Members" value={s?.memberCount ?? ws.memberCount ?? 0} sub="Total members" tone="info" />
        <KpiCard icon={<FolderKanban />} label="Projects" value={dash?.projectSummary?.totalCount ?? ws.projectCount ?? 0} sub={`${dash?.projectSummary?.activeCount ?? 0} active`} tone="accent" />
        <KpiCard icon={<CheckSquare />} label="Tasks" value={t?.totalTasks ?? 0} sub={`${t?.completedTasks ?? 0} completed`} tone="success" />
        <KpiCard icon={<Activity />} label="Overdue" value={t?.overdueTasks ?? 0} sub="Tasks past due" tone="warning" />
        <KpiCard icon={<Bell />} label="Notifications" value={dash?.notificationSummary?.unread ?? 0} sub="Unread" tone="danger" />
        <KpiCard icon={<Briefcase />} label="Teams" value={dash?.teamSummary?.totalCount ?? 0} sub={`${dash?.teamSummary?.activeCount ?? 0} active`} tone="neutral" />
      </div>

      {dash?.recentActivities && dash.recentActivities.length > 0 && (
        <>
          <SectionHeader title="Recent Activity" description="Latest workspace activity" />
          <Card>
            <CardBody className="space-y-3">
              {dash.recentActivities.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-1">
                  <Activity className="h-4 w-4 mt-0.5 text-text-tertiary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-secondary">{a.description}</p>
                    <p className="text-2xs text-text-tertiary">{a.actorName} &middot; {a.projectName} &middot; {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}