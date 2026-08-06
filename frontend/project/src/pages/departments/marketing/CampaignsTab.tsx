import { useState } from 'react';
import { Search, Plus, Megaphone, Archive, Loader2, AlertCircle, Pencil, PlayCircle, CheckCircle2 } from 'lucide-react';
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
  useCampaigns,
  useCampaignStats,
  useCreateCampaign,
  useUpdateCampaign,
  useActivateCampaign,
  useCompleteCampaign,
  useArchiveCampaign,
} from '../../../services/marketing-campaign-hooks';
import type { MarketingCampaignResponse, MarketingCampaignSearchCriteria, CampaignStatus, CampaignType, CampaignPriority, CreateMarketingCampaignRequest, UpdateMarketingCampaignRequest } from '../../../services/marketing-campaign-service';
import { useProjectList } from '../../../services/project-hooks';
import { useTeamsByDepartment } from '../../../services/admin-hooks';
import { Can } from '../../auth/PermissionGuard';
import { formatRelativeTime } from '../../../lib/format';
import { CampaignFormModal } from './CampaignFormModal';
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  CAMPAIGN_PRIORITIES,
  campaignStatusColor,
  campaignStatusLabel,
  campaignTypeColor,
  campaignTypeLabel,
  campaignPriorityColor,
  campaignPriorityLabel,
  canActivateCampaign,
  canCompleteCampaign,
  canArchiveCampaign,
  canEditCampaign,
} from './marketing-constants';

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

export function MarketingCampaignsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { toast } = useToast();

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<MarketingCampaignResponse | null>(null);

  const criteria: MarketingCampaignSearchCriteria = {
    keyword: keyword || undefined,
    status: (statusFilter || undefined) as CampaignStatus | undefined,
    campaignType: (typeFilter || undefined) as CampaignType | undefined,
    priority: (priorityFilter || undefined) as CampaignPriority | undefined,
    projectId: projectFilter || undefined,
    teamId: teamFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data: pageData, isLoading, isError, refetch } = useCampaigns(wsId, deptId, criteria, page);
  const { data: stats } = useCampaignStats(wsId, deptId);
  const { data: projectsPage } = useProjectList(wsId, deptId);
  const { data: teams } = useTeamsByDepartment(wsId, deptId);

  const createCampaign = useCreateCampaign(wsId, deptId);
  const updateCampaign = useUpdateCampaign(wsId, deptId);
  const activateCampaign = useActivateCampaign(wsId, deptId);
  const completeCampaign = useCompleteCampaign(wsId, deptId);
  const archiveCampaign = useArchiveCampaign(wsId, deptId);

  const projects = projectsPage?.content ?? [];
  const teamList = teams ?? [];
  const campaigns = pageData?.content ?? [];
  const totalPages = pageData?.page?.totalPages ?? 1;

  const handleCreate = (data: CreateMarketingCampaignRequest | UpdateMarketingCampaignRequest) => {
    createCampaign.mutate(data as CreateMarketingCampaignRequest, {
      onSuccess: () => {
        toast({ title: 'Campaign created', tone: 'success' });
        setShowCreate(false);
      },
      onError: () => toast({ title: 'Failed to create campaign', tone: 'danger' }),
    });
  };

  const handleUpdate = (data: CreateMarketingCampaignRequest | UpdateMarketingCampaignRequest) => {
    if (!editing) return;
    updateCampaign.mutate({ campaignId: editing.id, data: data as UpdateMarketingCampaignRequest }, {
      onSuccess: () => {
        toast({ title: 'Campaign updated', tone: 'success' });
        setEditing(null);
      },
      onError: () => toast({ title: 'Failed to update campaign', tone: 'danger' }),
    });
  };

  const handleActivate = (campaign: MarketingCampaignResponse) => {
    if (!window.confirm(`Activate "${campaign.name}"?`)) return;
    activateCampaign.mutate(campaign.id, {
      onSuccess: () => toast({ title: 'Campaign activated', tone: 'success' }),
      onError: () => toast({ title: 'Failed to activate campaign', tone: 'danger' }),
    });
  };

  const handleComplete = (campaign: MarketingCampaignResponse) => {
    if (!window.confirm(`Mark "${campaign.name}" as completed?`)) return;
    completeCampaign.mutate(campaign.id, {
      onSuccess: () => toast({ title: 'Campaign completed', tone: 'success' }),
      onError: () => toast({ title: 'Failed to complete campaign', tone: 'danger' }),
    });
  };

  const handleArchive = (campaign: MarketingCampaignResponse) => {
    if (!window.confirm(`Archive "${campaign.name}"? This cannot be undone.`)) return;
    archiveCampaign.mutate(campaign.id, {
      onSuccess: () => toast({ title: 'Campaign archived', tone: 'success' }),
      onError: () => toast({ title: 'Failed to archive campaign', tone: 'danger' }),
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-8 w-8 text-danger-500" />
        <p className="text-body font-medium text-danger-600">Failed to load marketing campaigns</p>
        <p className="text-caption text-text-tertiary">Please try again later.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={<Megaphone />} label="Total Campaigns" value={stats?.totalCampaigns ?? 0} tone="accent" />
        <StatCard icon={<PlayCircle />} label="Active" value={stats?.activeCampaigns ?? 0} tone="success" />
        <StatCard icon={<CheckCircle2 />} label="Completed" value={stats?.completedCampaigns ?? 0} tone="info" />
        <StatCard icon={<Megaphone />} label="Planned" value={stats?.plannedCampaigns ?? 0} tone="warning" />
        <StatCard icon={<Archive />} label="Archived" value={stats?.archivedCampaigns ?? 0} tone="neutral" />
        <StatCard icon={<PlayCircle />} label="Avg Completion" value={stats?.averageCompletionPercentage != null ? `${stats.averageCompletionPercentage.toFixed(1)}%` : '—'} tone="success" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search campaigns…"
            leftIcon={<Search />}
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            containerClassName="flex-1 min-w-[200px]"
          />
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            containerClassName="w-40"
            options={[{ value: '', label: 'All Statuses' }, ...CAMPAIGN_STATUSES.map((s) => ({ value: s, label: campaignStatusLabel[s] }))]}
          />
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            containerClassName="w-40"
            options={[{ value: '', label: 'All Types' }, ...CAMPAIGN_TYPES.map((t) => ({ value: t, label: campaignTypeLabel[t] }))]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
            containerClassName="w-36"
            options={[{ value: '', label: 'All Priorities' }, ...CAMPAIGN_PRIORITIES.map((p) => ({ value: p, label: campaignPriorityLabel[p] }))]}
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
            aria-label="Start date from"
            title="Start date from"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            containerClassName="w-44"
            aria-label="End date to"
            title="End date to"
          />
          <Can permission="CAMPAIGN_CREATE">
            <Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>New Campaign</Button>
          </Can>
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <CardBody className="py-16">
              <EmptyState icon={<Megaphone />} title="No campaigns found" description="Create a campaign to start planning your marketing efforts." />
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${toneBg[campaignStatusColor[c.status]]} [&>svg]:h-5 [&>svg]:w-5`}>
                  <Megaphone />
                </span>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-body font-medium text-text-primary">{c.name}</p>
                    <Badge tone={campaignTypeColor[c.campaignType]} variant="soft">{campaignTypeLabel[c.campaignType] ?? c.campaignType}</Badge>
                    <Badge tone={campaignPriorityColor[c.priority]} variant="soft">{campaignPriorityLabel[c.priority] ?? c.priority}</Badge>
                    <Badge tone={campaignStatusColor[c.status]} variant="soft" dot>{campaignStatusLabel[c.status] ?? c.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-2xs text-text-tertiary mt-0.5 flex-wrap">
                    {c.projectName && <span>{c.projectName}</span>}
                    {c.teamName && <span>• {c.teamName}</span>}
                    {c.startDate && <span>• {c.startDate}</span>}
                    {c.endDate && <span>→ {c.endDate}</span>}
                    <span>• Updated {formatRelativeTime(c.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-2xs text-text-tertiary">
                    <span className="w-32">{c.completedTasks ?? 0}/{c.totalTasks ?? 0} tasks</span>
                    <Progress value={c.completionPercentage ?? 0} size="sm" tone={(c.completionPercentage ?? 0) >= 80 ? 'success' : (c.completionPercentage ?? 0) >= 40 ? 'warning' : 'info'} className="flex-1" />
                    <span className="w-10 text-right">{(c.completionPercentage ?? 0).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canActivateCampaign(c.status) && (
                    <Can permission="CAMPAIGN_ACTIVATE">
                      <IconButton label="Activate" variant="ghost" size="sm" onClick={() => handleActivate(c)}>
                        <PlayCircle className="h-4 w-4" />
                      </IconButton>
                    </Can>
                  )}
                  {canCompleteCampaign(c.status) && (
                    <Can permission="CAMPAIGN_COMPLETE">
                      <IconButton label="Complete" variant="ghost" size="sm" onClick={() => handleComplete(c)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </IconButton>
                    </Can>
                  )}
                  <Can permission="CAMPAIGN_UPDATE">
                    <IconButton
                      label="Edit"
                      variant="ghost"
                      size="sm"
                      disabled={!canEditCampaign(c.status)}
                      onClick={() => setEditing(c)}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                  </Can>
                  <Can permission="CAMPAIGN_ARCHIVE">
                    <IconButton
                      label="Archive"
                      variant="ghost"
                      size="sm"
                      className="text-danger-600"
                      disabled={!canArchiveCampaign(c.status)}
                      onClick={() => handleArchive(c)}
                    >
                      <Archive className="h-4 w-4" />
                    </IconButton>
                  </Can>
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

      <CampaignFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        mode="create"
        projects={projects}
        teams={teamList}
        isSubmitting={createCampaign.isPending}
        onSubmit={handleCreate}
      />

      <CampaignFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        mode="edit"
        campaign={editing ?? undefined}
        projects={projects}
        teams={teamList}
        isSubmitting={updateCampaign.isPending}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
