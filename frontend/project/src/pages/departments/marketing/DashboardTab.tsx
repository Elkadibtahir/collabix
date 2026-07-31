import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart, PieChart } from '../../../components/ui/Charts';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { useToast } from '../../../components/ui/Toast';
import { TrendingUp, TrendingDown, Users, Target, BarChart3, Mail, Globe, Share2, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

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

const campaigns: { name: string; status: string; progress: number; roi: string; budget: string }[] = [];

const emailCampaigns: { name: string; opens: string; clicks: string; sent: string; status: string }[] = [];

export function MarketingDashboardTab({ wsId, deptId }: { wsId: string; deptId: string }) {
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
        <KpiCard icon={<Target />} label="Active Campaigns" value={String(overview.activeProjects)} change="+12%" up tone="success" />
        <KpiCard icon={<Users />} label="Team Size" value={String(overview.activeMembers)} change="+0.5%" up tone="accent" />
        <KpiCard icon={<BarChart3 />} label="Task Completion" value={`${completionRate}%`} change="-0.3%" up={false} tone="warning" />
        <KpiCard icon={<Globe />} label="Open Tasks" value={String(taskSummary.activeTasks)} change="+8%" up tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Lead Funnel</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              data={[
                { label: 'Impressions', value: 24800 },
                { label: 'Clicks', value: 12400 },
                { label: 'Leads', value: 3800 },
                { label: 'MQLs', value: 1200 },
                { label: 'SQLs', value: 480 },
                { label: 'Deals', value: 120 },
              ]}
              height={180}
              tone="accent"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Traffic Overview</CardTitle></CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'Mon', value: 3200 },
                { label: 'Tue', value: 4100 },
                { label: 'Wed', value: 3800 },
                { label: 'Thu', value: 5200 },
                { label: 'Fri', value: 4900 },
                { label: 'Sat', value: 2800 },
                { label: 'Sun', value: 2100 },
              ]}
              height={180}
              tone="accent"
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Active Campaigns</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {campaigns.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No campaigns</p>
            ) : campaigns.map((c, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium text-text-primary">{c.name}</span>
                  <Badge tone={c.status === 'active' ? 'success' : 'info'} variant="soft">{c.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-2xs text-text-tertiary">
                  <span>ROI: {c.roi}</span>
                  <span>Budget: {c.budget}</span>
                </div>
                <Progress value={c.progress} size="sm" tone={c.progress >= 80 ? 'success' : c.progress >= 40 ? 'warning' : 'info'} />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Email Campaign Performance</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {emailCampaigns.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No email campaigns</p>
            ) : emailCampaigns.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary">{e.name}</p>
                  <div className="flex items-center gap-3 text-2xs text-text-tertiary mt-0.5">
                    <span>Open: {e.opens}</span>
                    <span>Click: {e.clicks}</span>
                    <span>Sent: {e.sent}</span>
                  </div>
                </div>
                <Badge
                  tone={e.status === 'active' ? 'success' : e.status === 'completed' ? 'info' : 'neutral'}
                  variant="soft"
                >
                  {e.status}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Marketing Team ({overview.activeMembers}/{overview.totalMembers})</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentMembers.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No team members found</p>
            ) : departmentMembers.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center gap-3">
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

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            <Button variant="outline" fullWidth leftIcon={<Target />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Create Campaign</Button>
            <Button variant="outline" fullWidth leftIcon={<BarChart3 />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Generate Report</Button>
            <Button variant="outline" fullWidth leftIcon={<Mail />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Email Campaign</Button>
            <Button variant="outline" fullWidth leftIcon={<Globe />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Content Library</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Brand Assets</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2 text-caption text-text-secondary">
            <p className="text-caption text-text-tertiary text-center py-4">No brand assets yet</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Campaign Activity</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentActivities.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No recent activity</p>
            ) : departmentActivities.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                <span className="flex h-2 w-2 rounded-full bg-accent-500" />
                <span className="flex-1 text-caption text-text-primary">{a.description}</span>
                <span className="text-2xs text-text-tertiary shrink-0">{a.actorName}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Channel Distribution</CardTitle></CardHeader>
          <CardBody>
            <PieChart
              data={[
                { label: 'Organic Search', value: 38, tone: 'accent' },
                { label: 'Social Media', value: 24, tone: 'success' },
                { label: 'Email', value: 18, tone: 'info' },
                { label: 'Paid Ads', value: 12, tone: 'warning' },
                { label: 'Referral', value: 8, tone: 'neutral' },
              ]}
              size={140}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}