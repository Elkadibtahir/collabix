import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useDepartmentDashboard, useModelStats } from '../../../services/department-hooks';
import { useAIModels } from '../../../services/ai-model-hooks';
import { useToast } from '../../../components/ui/Toast';
import { Cpu, Rocket, Brain, FileText, BookOpen, Database, Clock, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { modelStatusLabel, modelTypeLabel, modelStatusColor } from './ai-constants';

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

const knowledgeCategoryIcons: Record<string, React.ReactNode> = {
  Models: <Brain />,
  Papers: <FileText />,
  Datasets: <Database />,
  Playbooks: <BookOpen />,
  Logs: <Clock />,
};

function KnowledgeAssetCard({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-surface-2 transition-colors">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
          {knowledgeCategoryIcons[name] ?? <FileText />}
        </span>
        <span className="text-caption text-text-primary">{name}</span>
      </div>
      <Badge tone="neutral" variant="soft">{count}</Badge>
    </div>
  );
}

export function AIDashboardTab({ wsId, deptId, onNavigate }: { wsId: string; deptId: string; onNavigate?: (tab: string) => void }) {
  const { toast } = useToast();
  const { data: dashboard, isLoading, isError, error, refetch } = useDepartmentDashboard(wsId, deptId);
  const { data: modelStats } = useModelStats(wsId, deptId);
  const { data: models } = useAIModels(wsId, deptId);

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

  const { overview, taskSummary, departmentMembers, activeProjects, aiModelSummary, recentProjects, recentKnowledgeArticles, departmentActivities } = dashboard;

  const knowledgeCategories = recentKnowledgeArticles.reduce((acc, article) => {
    const cat = article.category || 'Other';
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trainingModels = models?.filter((m) => m.status === 'TRAINING') ?? [];
  const readyOrDeployedModels = models?.filter((m) => (m.status === 'READY' || m.status === 'DEPLOYED') && m.accuracy != null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <KpiCard icon={<Brain />} label="Total Models" value={modelStats?.totalModels ?? aiModelSummary?.totalModels ?? 0} tone="accent" />
        <KpiCard icon={<Cpu />} label="In Training" value={modelStats?.trainingModels ?? aiModelSummary?.modelsInTraining ?? 0} tone="warning" />
        <KpiCard icon={<Rocket />} label="Ready Models" value={modelStats?.readyModels ?? aiModelSummary?.readyModels ?? 0} tone="success" />
        <KpiCard icon={<BarChart3 />} label="Avg Accuracy" value={modelStats?.averageAccuracy != null ? `${modelStats.averageAccuracy.toFixed(1)}%` : '—'} tone="info" />
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
          <CardHeader><CardTitle>Models in Training</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {trainingModels.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No models currently training</p>
            ) : trainingModels.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-100">
                  <Cpu className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-text-primary">{m.name}</p>
                  <div className="flex items-center gap-2 text-2xs text-text-tertiary mt-0.5 flex-wrap">
                    {m.teamName && <span>{m.teamName}</span>}
                    {m.modelVersion && <span>· v{m.modelVersion}</span>}
                    {m.objective && <span>· {m.objective}</span>}
                  </div>
                </div>
                <Badge tone={modelStatusColor[m.status]} variant="soft">{modelStatusLabel[m.status] ?? m.status}</Badge>
              </div>
            ))}
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
            <Button variant="outline" fullWidth leftIcon={<Cpu />} size="sm" onClick={() => onNavigate?.('models')}>Model Registry</Button>
            <Button variant="outline" fullWidth leftIcon={<Rocket />} size="sm" onClick={() => onNavigate?.('activity')}>View Activity</Button>
            <Button variant="outline" fullWidth leftIcon={<FileText />} size="sm" onClick={() => onNavigate?.('documents')}>Knowledge Base</Button>
            <Button variant="outline" fullWidth leftIcon={<BarChart3 />} size="sm" onClick={() => onNavigate?.('analytics')}>Analytics</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Knowledge Base</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-2">
            {Object.entries(knowledgeCategories).length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No knowledge assets yet</p>
            ) : Object.entries(knowledgeCategories).slice(0, 5).map(([cat, count]) => (
              <KnowledgeAssetCard key={cat} name={cat} count={count} />
            ))}
            {Object.entries(knowledgeCategories).length > 0 && (
              <Button variant="ghost" size="sm" rightIcon={<span>→</span>} onClick={() => onNavigate?.('documents')}>View All</Button>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Model Registry</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {readyOrDeployedModels.length === 0 ? (
              <p className="text-caption text-text-tertiary py-4 text-center">No models with performance data</p>
            ) : readyOrDeployedModels.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-caption font-medium text-text-primary">{m.name}</p>
                    <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                      {m.modelType && <span>{modelTypeLabel[m.modelType] ?? m.modelType}</span>}
                      {m.accuracy != null && <span>· Accuracy: {m.accuracy}%</span>}
                      {m.projectName && <span>· {m.projectName}</span>}
                    </div>
                  </div>
                </div>
                <Badge tone={modelStatusColor[m.status]} variant="soft">{modelStatusLabel[m.status] ?? m.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

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
      </div>

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
                <p className="text-2xs text-text-tertiary">{m.role}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
