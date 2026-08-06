import { useState } from 'react';
import { Search, Plus, Rocket, Archive, Loader2, AlertCircle, Pencil, PlayCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge, type Tone } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Progress } from '../../../components/ui/Progress';
import { Pagination } from '../../../components/ui/Pagination';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import {
  useSprints,
  useSprintStats,
  useCreateSprint,
  useUpdateSprint,
  useActivateSprint,
  useCompleteSprint,
  useArchiveSprint,
  useDeleteSprint,
} from '../../../services/sprint-hooks';
import type { SprintResponse, SprintSearchCriteria, SprintStatus, CreateSprintRequest, UpdateSprintRequest } from '../../../services/sprint-service';
import { useProjectList } from '../../../services/project-hooks';
import { useTeamsByDepartment } from '../../../services/admin-hooks';
import { formatRelativeTime } from '../../../lib/format';
import { SprintFormModal } from './SprintFormModal';
import {
  SPRINT_STATUSES,
  sprintStatusColor,
  sprintStatusLabel,
  canActivateSprint,
  canCompleteSprint,
  canArchiveSprint,
  canEditSprint,
  canDeleteSprint,
} from './sprint-constants';

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

export function DevelopmentSprintsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { toast } = useToast();

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<SprintResponse | null>(null);

  const criteria: SprintSearchCriteria = {
    name: keyword || undefined,
    status: (statusFilter || undefined) as SprintStatus | undefined,
    projectId: projectFilter || undefined,
    teamId: teamFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data: pageData, isLoading, isError, refetch } = useSprints(wsId, deptId, criteria, page);
  const { data: stats } = useSprintStats(wsId, deptId);
  const { data: projectsPage } = useProjectList(wsId, deptId);
  const { data: teams } = useTeamsByDepartment(wsId, deptId);

  const createSprint = useCreateSprint(wsId, deptId);
  const updateSprint = useUpdateSprint(wsId, deptId);
  const activateSprint = useActivateSprint(wsId, deptId);
  const completeSprint = useCompleteSprint(wsId, deptId);
  const archiveSprint = useArchiveSprint(wsId, deptId);
  const deleteSprint = useDeleteSprint(wsId, deptId);

  const projects = projectsPage?.content ?? [];
  const teamList = teams ?? [];
  const sprints = pageData?.content ?? [];
  const totalPages = pageData?.page?.totalPages ?? 1;

  const handleCreate = (data: CreateSprintRequest | UpdateSprintRequest) => {
    createSprint.mutate(data as CreateSprintRequest, {
      onSuccess: () => {
        toast({ title: 'Sprint created', tone: 'success' });
        setShowCreate(false);
      },
      onError: () => toast({ title: 'Failed to create sprint', tone: 'danger' }),
    });
  };

  const handleUpdate = (data: CreateSprintRequest | UpdateSprintRequest) => {
    if (!editing) return;
    updateSprint.mutate({ sprintId: editing.id, data: data as UpdateSprintRequest }, {
      onSuccess: () => {
        toast({ title: 'Sprint updated', tone: 'success' });
        setEditing(null);
      },
      onError: () => toast({ title: 'Failed to update sprint', tone: 'danger' }),
    });
  };

  const handleActivate = (sprint: SprintResponse) => {
    if (!window.confirm(`Activate "${sprint.name}"?`)) return;
    activateSprint.mutate(sprint.id, {
      onSuccess: () => toast({ title: 'Sprint activated', tone: 'success' }),
      onError: () => toast({ title: 'Failed to activate sprint', tone: 'danger' }),
    });
  };

  const handleComplete = (sprint: SprintResponse) => {
    if (!window.confirm(`Mark "${sprint.name}" as completed?`)) return;
    completeSprint.mutate(sprint.id, {
      onSuccess: () => toast({ title: 'Sprint completed', tone: 'success' }),
      onError: () => toast({ title: 'Failed to complete sprint', tone: 'danger' }),
    });
  };

  const handleArchive = (sprint: SprintResponse) => {
    if (!window.confirm(`Archive "${sprint.name}"?`)) return;
    archiveSprint.mutate(sprint.id, {
      onSuccess: () => toast({ title: 'Sprint archived', tone: 'success' }),
      onError: () => toast({ title: 'Failed to archive sprint', tone: 'danger' }),
    });
  };

  const handleDelete = (sprint: SprintResponse) => {
    if (!window.confirm(`Delete "${sprint.name}"? This cannot be undone.`)) return;
    deleteSprint.mutate(sprint.id, {
      onSuccess: () => toast({ title: 'Sprint deleted', tone: 'success' }),
      onError: () => toast({ title: 'Failed to delete sprint', tone: 'danger' }),
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-8 w-8 text-danger-500" />
        <p className="text-body font-medium text-danger-600">Failed to load development sprints</p>
        <p className="text-caption text-text-tertiary">Please try again later.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={<Rocket />} label="Total Sprints" value={stats?.totalSprints ?? 0} tone="accent" />
        <StatCard icon={<PlayCircle />} label="Active" value={stats?.activeSprints ?? 0} tone="success" />
        <StatCard icon={<CheckCircle2 />} label="Completed" value={stats?.completedSprints ?? 0} tone="info" />
        <StatCard icon={<Rocket />} label="Planned" value={stats?.plannedSprints ?? 0} tone="warning" />
        <StatCard icon={<Archive />} label="Cancelled" value={stats?.cancelledSprints ?? 0} tone="danger" />
        <StatCard icon={<PlayCircle />} label="Avg Completion" value={stats?.averageCompletionRate != null ? `${stats.averageCompletionRate.toFixed(1)}%` : '—'} tone="success" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search sprints…"
            leftIcon={<Search />}
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            containerClassName="flex-1 min-w-[200px]"
          />
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            containerClassName="w-40"
            options={[{ value: '', label: 'All Statuses' }, ...SPRINT_STATUSES.map((s) => ({ value: s, label: sprintStatusLabel[s] }))]}
          />
          <Select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setPage(0); }}
            containerClassName="w-44"
            options={[{ value: '', label: 'All Projects' }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          />
          <Select
            value={teamFilter}
            onChange={(e) => { setTeamFilter(e.target.value); setPage(0); }}
            containerClassName="w-44"
            options={[{ value: '', label: 'All Teams' }, ...teamList.map((t) => ({ value: t.id, label: t.name }))]}
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            containerClassName="w-44"
            aria-label="Sprint start date from"
            title="Sprint start date from"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            containerClassName="w-44"
            aria-label="Sprint end date to"
            title="Sprint end date to"
          />
          <Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>New Sprint</Button>
        </div>

        {sprints.length === 0 ? (
          <Card>
            <CardBody className="py-16">
              <EmptyState icon={<Rocket />} title="No sprints found" description="Create a sprint to start planning your development iterations." />
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {sprints.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${toneBg[sprintStatusColor[s.status]]} [&>svg]:h-5 [&>svg]:w-5`}>
                  <Rocket />
                </span>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-body font-medium text-text-primary">{s.name}</p>
                    <Badge tone={sprintStatusColor[s.status]} variant="soft" dot>{sprintStatusLabel[s.status] ?? s.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-2xs text-text-tertiary mt-0.5 flex-wrap">
                    {s.projectName && <span>{s.projectName}</span>}
                    {s.teamName && <span>• {s.teamName}</span>}
                    {s.startDate && <span>• {s.startDate}</span>}
                    {s.endDate && <span>→ {s.endDate}</span>}
                    <span>• Updated {formatRelativeTime(s.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-2xs text-text-tertiary">
                    <span className="w-32">{s.completedTasks ?? 0}/{s.totalTasks ?? 0} tasks</span>
                    <Progress value={s.completionPercentage ?? 0} size="sm" tone={(s.completionPercentage ?? 0) >= 80 ? 'success' : (s.completionPercentage ?? 0) >= 40 ? 'warning' : 'info'} className="flex-1" />
                    <span className="w-10 text-right">{(s.completionPercentage ?? 0).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canActivateSprint(s.status) && (
                    <IconButton label="Activate" variant="ghost" size="sm" onClick={() => handleActivate(s)}>
                      <PlayCircle className="h-4 w-4" />
                    </IconButton>
                  )}
                  {canCompleteSprint(s.status) && (
                    <IconButton label="Complete" variant="ghost" size="sm" onClick={() => handleComplete(s)}>
                      <CheckCircle2 className="h-4 w-4" />
                    </IconButton>
                  )}
                  <IconButton
                    label="Edit"
                    variant="ghost"
                    size="sm"
                    disabled={!canEditSprint(s.status)}
                    onClick={() => setEditing(s)}
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label="Archive"
                    variant="ghost"
                    size="sm"
                    disabled={!canArchiveSprint(s.status)}
                    onClick={() => handleArchive(s)}
                  >
                    <Archive className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    className="text-danger-600"
                    disabled={!canDeleteSprint(s.status)}
                    onClick={() => handleDelete(s)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
          </div>
        )}
      </div>

      <SprintFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        mode="create"
        projects={projects}
        teams={teamList}
        isSubmitting={createSprint.isPending}
        onSubmit={handleCreate}
      />

      <SprintFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        mode="edit"
        sprint={editing ?? undefined}
        projects={projects}
        teams={teamList}
        isSubmitting={updateSprint.isPending}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
