import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { BarChart, LineChart, PieChart } from '../../../components/ui/Charts';
import { useDepartmentDashboard } from '../../../services/department-hooks';
import { useToast } from '../../../components/ui/Toast';
import { TrendingUp, TrendingDown, Cpu, FlaskConical, Rocket, BarChart3, Brain, BookOpen, FileText, Lightbulb, ArrowRight, Users, Activity, Database, Target, Loader2, AlertCircle } from 'lucide-react';

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

const projects = [
  { name: 'Customer Chatbot v2', phase: 'Training', progress: 60, team: 'ML Team' },
  { name: 'Document Classification', phase: 'Deployment', progress: 85, team: 'Data Team' },
  { name: 'Predictive Analytics Engine', phase: 'Research', progress: 25, team: 'Research' },
  { name: 'Process Automation Bot', phase: 'Development', progress: 40, team: 'Automation' },
];

const experiments = [
  { name: 'LLM Fine-tuning', status: 'Running', metric: 'Accuracy: 92%' },
  { name: 'Recommendation System', status: 'Completed', metric: 'Precision: 87%' },
  { name: 'Anomaly Detection', status: 'Running', metric: 'F1: 0.91' },
];

const modelPerformance = [
  { model: 'Chatbot v2', accuracy: 92, latency: '210ms', status: 'production', tone: 'success' as const },
  { model: 'Classifier v3', accuracy: 88, latency: '45ms', status: 'production', tone: 'success' as const },
  { model: 'Recommendation', accuracy: 87, latency: '180ms', status: 'staging', tone: 'warning' as const },
  { model: 'Anomaly Detector', accuracy: 91, latency: '32ms', status: 'development', tone: 'info' as const },
];

const milestones = [
  { name: 'Chatbot v2 Production Launch', date: 'Aug 15, 2026', status: 'On Track', tone: 'success' as const },
  { name: 'Research Paper Submission', date: 'Sep 1, 2026', status: 'At Risk', tone: 'warning' as const },
  { name: 'Q3 Automation Review', date: 'Sep 30, 2026', status: 'On Track', tone: 'success' as const },
  { name: 'ML Model Registry v2', date: 'Oct 15, 2026', status: 'Planning', tone: 'neutral' as const },
];

const knowledgeAssets = [
  { name: 'Research Papers', count: 48, icon: <BookOpen /> },
  { name: 'Model Cards', count: 12, icon: <Cpu /> },
  { name: 'Datasets', count: 25, icon: <Database /> },
  { name: 'Experiment Logs', count: 156, icon: <FlaskConical /> },
  { name: 'Playbooks', count: 18, icon: <FileText /> },
];

export function AIDashboardTab({ wsId, deptId }: { wsId: string; deptId: string }) {
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

  const { overview, taskSummary, departmentMembers, aiModelSummary } = dashboard;
  const completionRate = taskSummary.totalTasks > 0
    ? Math.round(((taskSummary.totalTasks - taskSummary.activeTasks) / taskSummary.totalTasks) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Cpu />} label="Active Projects" value={String(overview.activeProjects)} change="+2" up tone="accent" />
        <KpiCard icon={<FlaskConical />} label="Active Tasks" value={String(taskSummary.activeTasks)} change="+3" up tone="info" />
        <KpiCard icon={<Rocket />} label="Model Completion" value={`${completionRate}%`} change="+8%" up tone="success" />
        <KpiCard icon={<Brain />} label="Total Models" value={String(aiModelSummary?.totalModels ?? 0)} change="+5" up tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Active Projects</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            {dashboard.activeProjects.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No active projects</p>
            ) : dashboard.activeProjects.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
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
          <CardHeader><CardTitle>Active Experiments</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {experiments.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div>
                  <p className="text-caption font-medium text-text-primary">{e.name}</p>
                  <p className="text-2xs text-text-tertiary">{e.metric}</p>
                </div>
                <Badge tone={e.status === 'Running' ? 'warning' : 'success'} variant="soft">{e.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Innovation Pipeline</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {[
              { idea: 'Automated Report Generator', stage: 'Prototype' },
              { idea: 'Sentiment Analysis Tool', stage: 'Research' },
              { idea: 'Smart Document Search', stage: 'Development' },
              { idea: 'AI Meeting Assistant', stage: 'Idea' },
            ].map((idea, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                <Lightbulb className="h-4 w-4 text-warning-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-caption text-text-primary">{idea.idea}</p>
                  <p className="text-2xs text-text-tertiary">{idea.stage}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            <Button variant="outline" fullWidth leftIcon={<Cpu />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Create AI Project</Button>
            <Button variant="outline" fullWidth leftIcon={<FlaskConical />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>New Experiment</Button>
            <Button variant="outline" fullWidth leftIcon={<FileText />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Research Report</Button>
            <Button variant="outline" fullWidth leftIcon={<BookOpen />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Knowledge Base</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Research Resources</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2 text-caption text-text-secondary">
            <p>• ML Model Registry</p>
            <p>• Research Papers Library</p>
            <p>• Dataset Catalog</p>
            <p>• Experiment Logs</p>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>View All</Button>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Model Performance</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {modelPerformance.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption font-medium text-text-primary">{m.model}</p>
                    <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                      <span>Accuracy: {m.accuracy}%</span>
                      <span>Latency: {m.latency}</span>
                    </div>
                  </div>
                </div>
                <Badge tone={m.tone} variant="soft">{m.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Knowledge Assets</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {knowledgeAssets.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-surface-2 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
                    {a.icon}
                  </span>
                  <span className="text-caption text-text-primary">{a.name}</span>
                </div>
                <Badge tone="neutral" variant="soft">{a.count}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Upcoming Milestones</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div>
                  <p className="text-caption font-medium text-text-primary">{m.name}</p>
                  <p className="text-2xs text-text-tertiary">{m.date}</p>
                </div>
                <Badge tone={m.tone} variant="soft">{m.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Team ({overview.activeMembers}/{overview.totalMembers})</CardTitle></CardHeader>
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
