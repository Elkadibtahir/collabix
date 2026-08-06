import { useState } from 'react';
import { Search, Plus, Cpu, Archive, Loader2, AlertCircle, Pencil } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge, type Tone } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../lib/auth-context';
import {
  useAIModels,
  useAIModelStats,
  useCreateAIModel,
  useUpdateAIModel,
  useChangeAIModelStatus,
  useArchiveAIModel,
} from '../../../services/ai-model-hooks';
import type { AIModelResponse, AIModelSearchCriteria, CreateAIModelRequest, ModelStatus, ModelType, UpdateAIModelRequest } from '../../../services/ai-model-service';
import { useProjectList } from '../../../services/project-hooks';
import { useTeamsByDepartment } from '../../../services/admin-hooks';
import { formatRelativeTime } from '../../../lib/format';
import { ModelFormModal } from './ModelFormModal';
import {
  MODEL_STATUSES,
  MODEL_TYPES,
  modelStatusColor,
  modelStatusLabel,
  modelTypeColor,
  modelTypeLabel,
  allowedStatusTransitions,
  canArchiveModel,
} from './ai-constants';

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

function StatCard({ icon, label, value, tone = 'accent', sub }: { icon: React.ReactNode; label: string; value: string | number; tone?: Tone; sub?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 [&>svg]:h-4 [&>svg]:w-4 ${toneBg[tone]}`}>{icon}</span>
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

export function ModelsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AIModelResponse | null>(null);
  const [statusPick, setStatusPick] = useState<Record<string, string>>({});

  const criteria: AIModelSearchCriteria = {
    keyword: keyword || undefined,
    status: (statusFilter || undefined) as ModelStatus | undefined,
    modelType: (typeFilter || undefined) as ModelType | undefined,
    projectId: projectFilter || undefined,
    teamId: teamFilter || undefined,
  };

  const { data: models, isLoading, isError, refetch } = useAIModels(wsId, deptId, criteria);
  const { data: stats } = useAIModelStats(wsId, deptId);
  const { data: projectsPage } = useProjectList(wsId, deptId);
  const { data: teams } = useTeamsByDepartment(wsId, deptId);

  const createModel = useCreateAIModel(wsId, deptId);
  const updateModel = useUpdateAIModel(wsId, deptId);
  const changeStatus = useChangeAIModelStatus(wsId, deptId);
  const archiveModel = useArchiveAIModel(wsId, deptId);

  const projects = projectsPage?.content ?? [];
  const teamList = teams ?? [];

  const handleCreate = (data: CreateAIModelRequest | UpdateAIModelRequest) => {
    createModel.mutate(data as CreateAIModelRequest, {
      onSuccess: () => {
        toast({ title: 'Model created', tone: 'success' });
        setShowCreate(false);
      },
      onError: () => toast({ title: 'Failed to create model', tone: 'danger' }),
    });
  };

  const handleUpdate = (data: CreateAIModelRequest | UpdateAIModelRequest) => {
    if (!editing) return;
    updateModel.mutate({ modelId: editing.id, data: data as UpdateAIModelRequest }, {
      onSuccess: () => {
        toast({ title: 'Model updated', tone: 'success' });
        setEditing(null);
      },
      onError: () => toast({ title: 'Failed to update model', tone: 'danger' }),
    });
  };

  const handleStatusChange = (modelId: string, status: string) => {
    setStatusPick((prev) => ({ ...prev, [modelId]: '' }));
    changeStatus.mutate({ modelId, status: status as ModelStatus }, {
      onSuccess: () => toast({ title: 'Model status updated', tone: 'success' }),
      onError: () => toast({ title: 'Failed to update status', tone: 'danger' }),
    });
  };

  const handleArchive = (model: AIModelResponse) => {
    if (!window.confirm(`Archive "${model.name}"? This cannot be undone.`)) return;
    archiveModel.mutate(model.id, {
      onSuccess: () => toast({ title: 'Model archived', tone: 'success' }),
      onError: () => toast({ title: 'Failed to archive model', tone: 'danger' }),
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-8 w-8 text-danger-500" />
        <p className="text-body font-medium text-danger-600">Failed to load AI models</p>
        <p className="text-caption text-text-tertiary">Please try again later.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const modelList = models ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={<Cpu />} label="Total Models" value={stats?.totalModels ?? 0} tone="accent" />
        <StatCard icon={<Cpu />} label="In Training" value={stats?.trainingModels ?? 0} tone="warning" />
        <StatCard icon={<Cpu />} label="Ready" value={stats?.readyModels ?? 0} tone="success" />
        <StatCard icon={<Cpu />} label="Deployed" value={stats?.deployedModels ?? 0} tone="info" />
        <StatCard icon={<Cpu />} label="Archived" value={stats?.archivedModels ?? 0} tone="neutral" />
        <StatCard icon={<Cpu />} label="Avg Accuracy" value={stats?.averageAccuracy != null ? `${stats.averageAccuracy.toFixed(1)}%` : '—'} tone="accent" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search models…"
            leftIcon={<Search />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            containerClassName="flex-1 min-w-[200px]"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerClassName="w-44"
            options={[{ value: '', label: 'All Statuses' }, ...MODEL_STATUSES.map((s) => ({ value: s, label: modelStatusLabel[s] }))]}
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            containerClassName="w-44"
            options={[{ value: '', label: 'All Types' }, ...MODEL_TYPES.map((t) => ({ value: t, label: modelTypeLabel[t] }))]}
          />
          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            containerClassName="w-44"
            options={[{ value: '', label: 'All Projects' }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          />
          <Select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            containerClassName="w-44"
            options={[{ value: '', label: 'All Teams' }, ...teamList.map((t) => ({ value: t.id, label: t.name }))]}
          />
          <Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>New Model</Button>
        </div>

        {modelList.length === 0 ? (
          <Card>
            <CardBody className="py-16">
              <EmptyState icon={<Cpu />} title="No AI models found" description="Create a model to start building your model registry." />
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {modelList.map((m) => {
              const allowed = allowedStatusTransitions(m.status);
              return (
                <div key={m.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${toneBg[modelStatusColor[m.status]]} [&>svg]:h-5 [&>svg]:w-5`}>
                    <Cpu />
                  </span>
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-body font-medium text-text-primary">{m.name}</p>
                      <Badge tone={modelTypeColor[m.modelType]} variant="soft">{modelTypeLabel[m.modelType] ?? m.modelType}</Badge>
                      <Badge tone={modelStatusColor[m.status]} variant="soft" dot>{modelStatusLabel[m.status] ?? m.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-2xs text-text-tertiary mt-0.5 flex-wrap">
                      {m.projectName && <span>{m.projectName}</span>}
                      {m.teamName && <span>• {m.teamName}</span>}
                      {m.modelVersion && <span>• v{m.modelVersion}</span>}
                      {m.accuracy != null && <span>• Accuracy: {m.accuracy}%</span>}
                      <span>• Updated {formatRelativeTime(m.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={statusPick[m.id] ?? ''}
                      onChange={(e) => handleStatusChange(m.id, e.target.value)}
                      disabled={allowed.length === 0}
                      containerClassName="w-44"
                      options={[{ value: '', label: allowed.length === 0 ? 'No transitions' : 'Change status…' }, ...allowed.map((s) => ({ value: s, label: modelStatusLabel[s] }))]}
                    />
                    <IconButton label="Edit" variant="ghost" size="sm" onClick={() => setEditing(m)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="Archive"
                      variant="ghost"
                      size="sm"
                      className="text-danger-600"
                      disabled={!canArchiveModel(m.status)}
                      onClick={() => handleArchive(m)}
                    >
                      <Archive className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ModelFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        mode="create"
        projects={projects}
        teams={teamList}
        defaultOwnerId={user?.id}
        isSubmitting={createModel.isPending}
        onSubmit={handleCreate}
      />

      <ModelFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        mode="edit"
        model={editing ?? undefined}
        projects={projects}
        teams={teamList}
        defaultOwnerId={user?.id}
        isSubmitting={updateModel.isPending}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
