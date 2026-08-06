import { useState } from 'react';
import { Search, Plus, Shield, PlayCircle, CheckCircle2, Archive, AlertCircle, Pencil } from 'lucide-react';
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
  useSecurityAudits,
  useSecurityAuditStats,
  useCreateSecurityAudit,
  useUpdateSecurityAudit,
  useStartSecurityAudit,
  useCompleteSecurityAudit,
  useArchiveSecurityAudit,
} from '../../../services/security-audit-hooks';
import type { SecurityAudit, SecurityAuditSearchCriteria, CreateSecurityAuditRequest, UpdateSecurityAuditRequest } from '../../../services/security-audit-service';
import { useProjectList } from '../../../services/project-hooks';
import { useTeamsByDepartment } from '../../../services/admin-hooks';
import { formatRelativeTime } from '../../../lib/format';
import { SecurityAuditFormModal } from './SecurityAuditFormModal';
import {
  AUDIT_STATUSES,
  AUDIT_TYPES,
  AUDIT_PRIORITIES,
  auditStatusColor,
  auditPriorityColor,
} from './security-constants';

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

export function SecurityAuditsTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { toast } = useToast();

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<SecurityAudit | null>(null);

  const criteria: SecurityAuditSearchCriteria = {
    keyword: keyword || undefined,
    status: statusFilter || undefined,
    auditType: typeFilter || undefined,
    priority: priorityFilter || undefined,
  };

  const { data: pageData, isLoading, isError, refetch } = useSecurityAudits(wsId, deptId, criteria, page);
  const { data: stats } = useSecurityAuditStats(wsId, deptId);
  const { data: projectsPage } = useProjectList(wsId, deptId);
  const { data: teams } = useTeamsByDepartment(wsId, deptId);

  const createAudit = useCreateSecurityAudit(wsId, deptId);
  const updateAudit = useUpdateSecurityAudit(wsId, deptId);
  const startAudit = useStartSecurityAudit(wsId, deptId);
  const completeAudit = useCompleteSecurityAudit(wsId, deptId);
  const archiveAudit = useArchiveSecurityAudit(wsId, deptId);

  const projects = projectsPage?.content ?? [];
  const teamList = teams ?? [];
  const audits = pageData?.content ?? [];
  const totalPages = pageData?.page?.totalPages ?? 1;

  const handleSubmit = async (data: CreateSecurityAuditRequest | UpdateSecurityAuditRequest) => {
    try {
      if (editing) {
        await updateAudit.mutateAsync({ auditId: editing.id, data: data as UpdateSecurityAuditRequest });
        toast({ title: 'Security audit updated', tone: 'success' });
      } else {
        await createAudit.mutateAsync(data as CreateSecurityAuditRequest);
        toast({ title: 'Security audit created', tone: 'success' });
      }
      setShowCreate(false);
      setEditing(null);
      refetch();
    } catch {
      toast({ title: 'Operation failed', tone: 'danger' });
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startAudit.mutateAsync(id);
      toast({ title: 'Audit started', tone: 'success' });
      refetch();
    } catch {
      toast({ title: 'Failed to start audit', tone: 'danger' });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeAudit.mutateAsync(id);
      toast({ title: 'Audit completed', tone: 'success' });
      refetch();
    } catch {
      toast({ title: 'Failed to complete audit', tone: 'danger' });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveAudit.mutateAsync(id);
      toast({ title: 'Audit archived', tone: 'success' });
      refetch();
    } catch {
      toast({ title: 'Failed to archive audit', tone: 'danger' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Shield />} label="Total Audits" value={stats?.totalAudits ?? 0} tone="accent" />
        <StatCard icon={<PlayCircle />} label="Active" value={stats?.activeAudits ?? 0} tone="warning" />
        <StatCard icon={<CheckCircle2 />} label="Completed" value={stats?.completedAudits ?? 0} tone="success" sub={`${stats?.averageCompletionPercentage ?? 0}% avg completion`} />
        <StatCard icon={<Archive />} label="Planned / Archived" value={(stats?.plannedAudits ?? 0) + (stats?.archivedAudits ?? 0)} tone="neutral" />
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Input
              placeholder="Search audits..."
              leftIcon={<Search />}
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
              containerClassName="max-w-xs"
            />
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              options={[{ value: '', label: 'All Statuses' }, ...AUDIT_STATUSES]}
              className="w-40"
            />
            <Select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              options={[{ value: '', label: 'All Types' }, ...AUDIT_TYPES]}
              className="w-44"
            />
            <Select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
              options={[{ value: '', label: 'All Priorities' }, ...AUDIT_PRIORITIES]}
              className="w-40"
            />
          </div>
          <Button variant="primary" leftIcon={<Plus />} onClick={() => { setEditing(null); setShowCreate(true); }}>
            New Security Audit
          </Button>
        </CardBody>
      </Card>

      {/* Audits List */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-text-tertiary">Loading security audits...</div>
            ) : isError ? (
            <div className="p-8 text-center text-danger-600 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" /> Failed to load security audits.
            </div>
          ) : audits.length === 0 ? (
            <EmptyState
              icon={<Shield className="h-8 w-8" />}
              title="No security audits found"
              description="Get started by creating a security audit or adjusting your filters."
              action={<Button variant="primary" leftIcon={<Plus />} onClick={() => { setEditing(null); setShowCreate(true); }}>New Audit</Button>}
            />
          ) : (
            <div className="divide-y divide-border">
              {audits.map((audit) => (
                <div key={audit.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-2 transition-colors">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text-primary text-sm truncate">{audit.name}</h3>
                      <Badge tone={auditStatusColor(audit.status)} variant="soft">{audit.status}</Badge>
                      <Badge tone={auditPriorityColor(audit.priority)} variant="solid">{audit.priority}</Badge>
                      <Badge tone="neutral" variant="soft">{audit.auditType}</Badge>
                    </div>
                    {audit.description && <p className="text-xs text-text-secondary line-clamp-1">{audit.description}</p>}
                    <div className="flex items-center gap-4 text-2xs text-text-tertiary">
                      {audit.projectName && <span>Project: <strong>{audit.projectName}</strong></span>}
                      {audit.teamName && <span>Team: <strong>{audit.teamName}</strong></span>}
                      <span>Created {formatRelativeTime(audit.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-28 text-right hidden sm:block">
                      <div className="text-2xs text-text-secondary mb-1">{audit.completionPercentage ?? 0}% completed</div>
                      <Progress value={audit.completionPercentage ?? 0} size="sm" />
                    </div>

                    <div className="flex items-center gap-1">
                      {audit.status === 'PLANNED' && (
                        <IconButton label="Start Audit" variant="ghost" size="sm" onClick={() => handleStart(audit.id)}>
                          <PlayCircle className="h-4 w-4" />
                        </IconButton>
                      )}
                      {(audit.status === 'IN_PROGRESS' || audit.status === 'UNDER_REVIEW') && (
                        <IconButton label="Complete Audit" variant="ghost" size="sm" onClick={() => handleComplete(audit.id)}>
                          <CheckCircle2 className="h-4 w-4" />
                        </IconButton>
                      )}
                      {audit.status !== 'ARCHIVED' && (
                        <IconButton label="Archive Audit" variant="ghost" size="sm" onClick={() => handleArchive(audit.id)}>
                          <Archive className="h-4 w-4" />
                        </IconButton>
                      )}
                      <IconButton label="Edit Audit" variant="ghost" size="sm" onClick={() => { setEditing(audit); setShowCreate(true); }}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
        </div>
      )}

      {(showCreate || editing) && (
        <SecurityAuditFormModal
          open={showCreate || !!editing}
          mode={editing ? 'edit' : 'create'}
          audit={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSubmit={handleSubmit}
          projects={projects}
          teams={teamList}
          isSubmitting={createAudit.isPending || updateAudit.isPending}
        />
      )}
    </div>
  );
}
