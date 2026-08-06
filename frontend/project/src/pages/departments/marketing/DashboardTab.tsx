import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { useCampaignStats } from '../../../services/department-hooks';
import { useCampaigns } from '../../../services/marketing-campaign-hooks';
import { useToast } from '../../../components/ui/Toast';
import { Target, Users, BarChart3, Globe, Megaphone, Loader2, AlertCircle } from 'lucide-react';
import { campaignStatusColor, campaignStatusLabel } from './marketing-constants';

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

export function MarketingDashboardTab({ wsId, deptId, onNavigate }: { wsId: string; deptId: string; onNavigate?: (tab: string) => void }) {
  const { toast } = useToast();
  const { data: dashboard, isLoading, isError, error, refetch } = useDepartmentDashboard(wsId, deptId);
  const { data: campaignStats } = useCampaignStats(wsId, deptId);
  const { data: campaignsPage } = useCampaigns(wsId, deptId, {}, 0, 10);

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
  const completionRate = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  const campaigns = campaignsPage?.content ?? [];
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Target />} label="Active Campaigns" value={campaignStats?.activeCampaigns ?? 0} tone="success" sub={`${campaignStats?.totalCampaigns ?? 0} total`} />
        <KpiCard icon={<Users />} label="Team Size" value={overview.activeMembers} tone="accent" sub={`${overview.totalMembers} total`} />
        <KpiCard icon={<BarChart3 />} label="Avg Completion" value={campaignStats?.averageCompletionPercentage != null ? `${campaignStats.averageCompletionPercentage.toFixed(0)}%` : '—'} tone="info" />
        <KpiCard icon={<Globe />} label="Open Tasks" value={taskSummary.activeTasks} tone="warning" sub={`${completionRate}% completion`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Active Campaigns</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {activeCampaigns.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-caption text-text-tertiary mb-2">No active campaigns</p>
                <Button variant="outline" size="sm" leftIcon={<Megaphone />} onClick={() => onNavigate?.('campaigns')}>Create Campaign</Button>
              </div>
            ) : activeCampaigns.map((c) => (
              <div key={c.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-medium text-text-primary">{c.name}</span>
                    <Badge tone={campaignStatusColor[c.status]} variant="soft" dot>{campaignStatusLabel[c.status] ?? c.status}</Badge>
                  </div>
                  <span className="text-2xs text-text-tertiary">{(c.completionPercentage ?? 0)}%</span>
                </div>
                {(c.totalTasks ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                    <span>{c.completedTasks ?? 0}/{c.totalTasks ?? 0} tasks</span>
                    <Progress value={c.completionPercentage ?? 0} size="sm" tone="accent" />
                  </div>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Campaign Statistics</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-accent-600">{campaignStats?.totalCampaigns ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Total</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-success-600">{campaignStats?.activeCampaigns ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Active</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-info-600">{campaignStats?.completedCampaigns ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Completed</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-warning-600">{campaignStats?.plannedCampaigns ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Planned</span>
              </div>
            </div>
            {campaignStats && (
              <div className="flex items-center gap-2">
                <span className="text-caption text-text-secondary">Avg Duration:</span>
                <span className="text-caption font-medium text-text-primary">{campaignStats.averageDurationDays.toFixed(1)} days</span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            <Button variant="outline" fullWidth leftIcon={<Megaphone />} size="sm" onClick={() => onNavigate?.('campaigns')}>New Campaign</Button>
            <Button variant="outline" fullWidth leftIcon={<BarChart3 />} size="sm" onClick={() => onNavigate?.('reports')}>Generate Report</Button>
            <Button variant="outline" fullWidth leftIcon={<Globe />} size="sm" onClick={() => onNavigate?.('analytics')}>Analytics</Button>
            <Button variant="outline" fullWidth leftIcon={<Megaphone />} size="sm" onClick={() => onNavigate?.('documents')}>Content Library</Button>
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
            <CardTitle>Marketing Team ({overview.activeMembers}/{overview.totalMembers})</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentMembers.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No team members found</p>
            ) : departmentMembers.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-2xs font-semibold text-white bg-accent-500">
                  {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary">{m.firstName} {m.lastName}</p>
                  <p className="text-2xs text-text-tertiary">{m.role}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
