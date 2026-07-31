import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { PieChart, BarChart } from '../../../components/ui/Charts';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { useToast } from '../../../components/ui/Toast';
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp, TrendingDown, FileText, Lock, ArrowRight, Users, Clock, Loader2 } from 'lucide-react';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-500',
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

const severityColors: Record<string, string> = { critical: 'danger', high: 'warning', medium: 'info', low: 'neutral' };

const alerts = [
  { severity: 'critical', title: 'Multiple failed login attempts - root admin', time: '15m ago' },
  { severity: 'high', title: 'Unusual outbound data transfer detected', time: '45m ago' },
  { severity: 'medium', title: 'SSL certificate expiring in 7 days', time: '2h ago' },
  { severity: 'low', title: 'Deprecated TLS version in use on legacy server', time: '4h ago' },
];

const auditSchedule = [
  { name: 'SOC 2 Type II', due: 'Aug 15, 2026', status: 'On Track', tone: 'success' as const },
  { name: 'ISO 27001', due: 'Sep 30, 2026', status: 'In Progress', tone: 'warning' as const },
  { name: 'GDPR Review', due: 'Oct 10, 2026', status: 'Not Started', tone: 'neutral' as const },
  { name: 'HIPAA Audit', due: 'Nov 5, 2026', status: 'On Track', tone: 'success' as const },
];

const onCallTeam = [
  { initials: 'AH', name: 'Ahmed Hassan', role: 'CISO', phone: '+1 (555) 0101' },
  { initials: 'SC', name: 'Sofia Cruz', role: 'Security Engineer', phone: '+1 (555) 0102' },
  { initials: 'RM', name: 'Raj Mehta', role: 'Network Security', phone: '+1 (555) 0103' },
];

export function CybersecurityDashboardTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { toast } = useToast();
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
        <p className="text-body font-medium text-text-secondary">Failed to load dashboard data</p>
        <p className="text-caption text-text-tertiary">{error?.message ?? 'Unknown error'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { overview, taskSummary, departmentMembers } = dashboard;
  const completionPct = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Shield />} label="Security Score" value={`${completionPct}/100`} change="+4" up tone="success" />
        <KpiCard icon={<AlertTriangle />} label="Open Incidents" value={String(taskSummary.activeTasks)} change="-2" up tone="warning" />
        <KpiCard icon={<CheckCircle />} label="Resolved (30d)" value={String(taskSummary.archivedTasks)} change="+12" up tone="info" />
        <KpiCard icon={<Activity />} label="Team Members" value={String(overview.activeMembers)} change="-30s" up tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Active Projects</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            {dashboard.activeProjects.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No active projects</p>
            ) : dashboard.activeProjects.map((proj, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div>
                  <p className="text-caption font-medium text-text-primary">{proj.name}</p>
                  <p className="text-2xs text-text-tertiary">{proj.taskCount} tasks</p>
                </div>
                <Badge
                  tone={proj.status === 'ACTIVE' ? 'success' : proj.status === 'PLANNED' ? 'info' : 'neutral'}
                  variant="soft"
                >
                  {proj.status}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Risk Overview</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {[
              { label: 'Network Security', score: 92, level: 'low' },
              { label: 'Endpoint Protection', score: 78, level: 'medium' },
              { label: 'Access Management', score: 85, level: 'low' },
              { label: 'Data Privacy', score: 70, level: 'medium' },
              { label: 'Third Party Risk', score: 55, level: 'high' },
            ].map((r, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption text-text-primary">{r.label}</span>
                  <Badge tone={r.level === 'low' ? 'success' : r.level === 'medium' ? 'warning' : 'danger'} variant="soft">{r.score}%</Badge>
                </div>
                <Progress value={r.score} size="sm" tone={r.score >= 80 ? 'success' : r.score >= 60 ? 'warning' : 'danger'} />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Task Summary</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {[
              { std: 'Total', status: String(taskSummary.totalTasks), tone: 'accent' as const },
              { std: 'Active', status: String(taskSummary.activeTasks), tone: 'warning' as const },
              { std: 'Overdue', status: String(taskSummary.overdueTasks), tone: 'danger' as const },
              { std: 'Archived', status: String(taskSummary.archivedTasks), tone: 'neutral' as const },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-surface-2">
                <span className="text-caption text-text-primary">{c.std}</span>
                <Badge tone={c.tone} variant="soft">{c.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            <Button variant="outline" fullWidth leftIcon={<AlertTriangle />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Incident Report</Button>
            <Button variant="outline" fullWidth leftIcon={<Shield />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Security Review</Button>
            <Button variant="outline" fullWidth leftIcon={<FileText />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Generate Audit</Button>
            <Button variant="outline" fullWidth leftIcon={<Lock />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Run Scan</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Security Policies</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2 text-caption text-text-secondary">
            <p>• Acceptable Use Policy</p>
            <p>• Incident Response Plan</p>
            <p>• Data Classification Guide</p>
            <p>• Access Control Policy</p>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>View All</Button>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Threat Distribution</CardTitle></CardHeader>
          <CardBody>
            <PieChart
              data={[
                { label: 'Malware', value: 35, tone: 'danger' },
                { label: 'Phishing', value: 28, tone: 'warning' },
                { label: 'Unauthorized Access', value: 18, tone: 'accent' },
                { label: 'DDoS', value: 10, tone: 'info' },
                { label: 'Insider Threat', value: 9, tone: 'neutral' },
              ]}
              size={140}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Security Alerts</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                <span className={`flex h-2 w-2 rounded-full mt-1.5 ${a.severity === 'critical' ? 'bg-danger-500' : a.severity === 'high' ? 'bg-warning-500' : a.severity === 'medium' ? 'bg-info-500' : 'bg-text-tertiary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-caption text-text-primary">{a.title}</p>
                  <p className="text-2xs text-text-tertiary">{a.time}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Audit Schedule</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {auditSchedule.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div>
                  <p className="text-caption font-medium text-text-primary">{a.name}</p>
                  <p className="text-2xs text-text-tertiary">Due: {a.due}</p>
                </div>
                <Badge tone={a.tone} variant="soft">{a.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Security Team ({overview.activeMembers}/{overview.totalMembers})</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentMembers.length === 0 ? onCallTeam.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-2xs font-semibold text-white bg-accent-500">
                  {m.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary">{m.name}</p>
                  <p className="text-2xs text-text-tertiary">{m.role}</p>
                </div>
              </div>
            )) : departmentMembers.slice(0, 5).map((m, i) => (
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
      </div>
    </div>
  );
}
