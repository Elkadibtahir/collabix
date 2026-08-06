import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { useDepartmentDashboard, useAuditStats } from '../../../services/department-hooks';
import { useSecurityAudits } from '../../../services/security-audit-hooks';
import { useToast } from '../../../components/ui/Toast';
import { Shield, AlertTriangle, CheckCircle, Activity, Lock, FileText, Loader2 } from 'lucide-react';
import { auditStatusColor } from './security-constants';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-500',
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

export function CybersecurityDashboardTab({ wsId, deptId, onNavigate }: { wsId: string; deptId: string; onNavigate?: (tab: string) => void }) {
  const { toast } = useToast();
  const { data: dashboard, isLoading, isError, error, refetch } = useDepartmentDashboard(wsId, deptId);
  const { data: auditStats } = useAuditStats(wsId, deptId);
  const { data: auditsPage } = useSecurityAudits(wsId, deptId, {}, 0, 10);

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
        <AlertTriangle className="h-8 w-8 text-danger-500" />
        <p className="text-body font-medium text-text-secondary">Failed to load dashboard data</p>
        <p className="text-caption text-text-tertiary">{(error as Error)?.message ?? 'Unknown error'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { overview, taskSummary, departmentMembers, activeProjects, recentDocuments, departmentActivities } = dashboard;
  const completionPct = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  const audits = auditsPage?.content ?? [];
  const activeAudits = audits.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'UNDER_REVIEW');
  const completionByStatus = auditStats?.averageCompletionPercentage ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Shield />} label="Security Score" value={`${completionPct}/100`} tone="success" sub={`${taskSummary.activeTasks} open tasks`} />
        <KpiCard icon={<AlertTriangle />} label="Active Audits" value={auditStats?.activeAudits ?? 0} tone="warning" sub={`${auditStats?.averageCompletionPercentage ?? 0}% avg completion`} />
        <KpiCard icon={<CheckCircle />} label="Completed (30d)" value={auditStats?.completedAudits ?? taskSummary.archivedTasks} tone="info" />
        <KpiCard icon={<Activity />} label="Team Members" value={overview.activeMembers} tone="accent" sub={`${overview.totalMembers} total`} />
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
          <CardHeader><CardTitle>Audit Summary</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-accent-600">{auditStats?.totalAudits ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Total</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-warning-600">{auditStats?.activeAudits ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Active</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-success-600">{auditStats?.completedAudits ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Completed</span>
              </div>
              <div className="flex flex-col gap-1 items-center p-4 rounded-lg border border-border-subtle bg-surface-2">
                <span className="text-display font-bold text-neutral-600">{auditStats?.plannedAudits ?? 0}</span>
                <span className="text-2xs text-text-tertiary">Planned</span>
              </div>
            </div>
            {auditStats && (
              <div className="flex items-center gap-2">
                <span className="text-caption text-text-secondary">Completion Rate:</span>
                <Progress value={completionByStatus} size="sm" tone="success" className="flex-1" />
                <span className="text-caption font-medium text-text-primary">{completionByStatus.toFixed(0)}%</span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Active Audits</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {activeAudits.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No active audits</p>
            ) : activeAudits.map((audit) => (
              <div key={audit.id} className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-100">
                  <Shield className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary">{audit.name}</p>
                  <Badge tone={auditStatusColor(audit.status)} variant="soft" dot>{audit.status}</Badge>
                  {audit.auditType && <p className="text-2xs text-text-tertiary mt-0.5">{audit.auditType.replace(/_/g, ' ')}</p>}
                </div>
                <div className="text-right">
                  <span className="text-2xs text-text-tertiary">{audit.completionPercentage ?? 0}%</span>
                </div>
              </div>
            ))}
            {activeAudits.length === 0 && (
              <Button variant="ghost" size="sm" leftIcon={<Shield />} onClick={() => onNavigate?.('audits')}>Go to Audits</Button>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            <Button variant="outline" fullWidth leftIcon={<AlertTriangle />} size="sm" onClick={() => onNavigate?.('reports')}>Incident Report</Button>
            <Button variant="outline" fullWidth leftIcon={<Shield />} size="sm" onClick={() => onNavigate?.('audits')}>Security Review</Button>
            <Button variant="outline" fullWidth leftIcon={<FileText />} size="sm" onClick={() => onNavigate?.('audits')}>Generate Audit</Button>
            <Button variant="outline" fullWidth leftIcon={<Lock />} size="sm" onClick={() => onNavigate?.('analytics')}>Run Scan</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {departmentActivities.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No recent activity</p>
            ) : departmentActivities.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                <span className="flex h-2 w-2 rounded-full bg-danger-500 mt-1.5" />
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
          <CardHeader><CardTitle>Recent Documents</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {recentDocuments.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No recent documents</p>
            ) : recentDocuments.slice(0, 4).map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary truncate">{doc.title || doc.fileName}</p>
                  <p className="text-2xs text-text-tertiary truncate">{doc.projectName}</p>
                </div>
              </div>
            ))}
            {recentDocuments.length > 0 && (
              <Button variant="ghost" size="sm" rightIcon={<span>→</span>} onClick={() => onNavigate?.('documents')}>View All</Button>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Team ({overview.activeMembers}/{overview.totalMembers})</CardTitle>
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
