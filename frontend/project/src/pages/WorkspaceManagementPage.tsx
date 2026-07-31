import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Plus, Search, Filter, ArrowUpDown, MoreHorizontal,
  ExternalLink, Pencil, Archive, Trash2, Building2, Users,
  Network, FolderKanban, LayoutGrid, List, X,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { IconButton } from '../components/ui/IconButton';
import { Tooltip } from '../components/ui/Tooltip';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { cn } from '../lib/cn';
import { useToast } from '../components/ui/Toast';
import { useWorkspacesList, useDeleteWorkspace, useArchiveWorkspace } from '../services/workspace-hooks';
import type { WorkspaceSummaryResponse } from '../services/workspace-service';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'archived';
type SortKey = 'name' | 'members' | 'created';

const statusBadge: Record<string, { tone: 'success' | 'neutral' | 'warning'; label: string }> = {
  ACTIVE: { tone: 'success', label: 'Active' },
  ARCHIVED: { tone: 'neutral', label: 'Archived' },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ---------- Archive Modal ---------- */

function ArchiveModal({ open, onClose, workspace, onConfirm }: {
  open: boolean; onClose: () => void;
  workspace: { name: string } | null;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Archive Workspace" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 dark:bg-warning-100/10 dark:border-warning-800 p-3">
          <Archive className="h-5 w-5 text-warning-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-body font-medium text-warning-800 dark:text-warning-300">Archive &ldquo;{workspace?.name ?? ''}&rdquo;?</p>
            <p className="mt-1 text-caption text-warning-700 dark:text-warning-400">
              The workspace will be archived. Members will lose access. You can restore it later by contacting support.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Archive Workspace</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Delete Modal ---------- */

function DeleteModal({ open, onClose, workspace, onConfirm }: {
  open: boolean; onClose: () => void;
  workspace: { name: string } | null;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  const match = workspace?.name ?? '';

  return (
    <Modal open={open} onClose={onClose} title="Delete Workspace" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 dark:bg-danger-100/10 dark:border-danger-800 p-3">
          <Trash2 className="h-5 w-5 text-danger-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-body font-medium text-danger-800 dark:text-danger-300">Delete &ldquo;{workspace?.name ?? ''}&rdquo;?</p>
            <p className="mt-1 text-caption text-danger-700 dark:text-danger-400">
              This action is permanent and cannot be undone. All data associated with this workspace will be deleted.
            </p>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-caption font-medium text-text-secondary">
            Type <span className="font-semibold text-text-primary">{match}</span> to confirm:
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={match}
            className="cx-input h-10 w-full"
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => { setConfirmText(''); onClose(); }}>Cancel</Button>
          <Button variant="danger" disabled={confirmText !== match} onClick={() => { setConfirmText(''); onConfirm(); }}>
            Delete Workspace
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Sub-components ---------- */

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-tertiary [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      <span className="text-caption text-text-tertiary">{label}:</span>
      <span className="text-caption font-semibold text-text-primary">{value}</span>
    </div>
  );
}

/* ---------- Workspace Card (grid) ---------- */

function WorkspaceCard({ ws, onAction }: {
  ws: WorkspaceSummaryResponse;
  onAction: (action: string, ws: WorkspaceSummaryResponse) => void;
}) {
  const status = statusBadge[ws.status] ?? statusBadge.ACTIVE;
  const initials = getInitials(ws.name);

  return (
    <Card className="hover:shadow-cx-md transition-shadow duration-200">
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 text-sm font-bold shrink-0">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate">{ws.name}</p>
              <p className="mt-0.5 text-caption text-text-tertiary line-clamp-2">{ws.description || 'No description'}</p>
            </div>
          </div>
          <div className="relative shrink-0">
            <DropdownMenu onAction={(a) => onAction(a, ws)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone} variant="soft" dot>{status.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-caption">
          <StatBadge icon={<Users className="h-3.5 w-3.5" />} label="Members" value={ws.memberCount ?? 0} />
          <StatBadge icon={<Network className="h-3.5 w-3.5" />} label="Teams" value={ws.teamCount ?? 0} />
          <StatBadge icon={<FolderKanban className="h-3.5 w-3.5" />} label="Projects" value={ws.projectCount ?? 0} />
        </div>

        <div className="flex items-center justify-between border-t border-border-subtle pt-3">
          <p className="text-2xs text-text-tertiary">Created {formatDate(ws.createdAt)}</p>
        </div>

        <Button size="sm" variant="outline" fullWidth onClick={() => onAction('open', ws)} leftIcon={<ExternalLink />}>
          Open Workspace
        </Button>
      </CardBody>
    </Card>
  );
}

/* ---------- Workspace Row (list) ---------- */

function WorkspaceRow({ ws, onAction }: {
  ws: WorkspaceSummaryResponse;
  onAction: (action: string, ws: WorkspaceSummaryResponse) => void;
}) {
  const status = statusBadge[ws.status] ?? statusBadge.ACTIVE;
  const initials = getInitials(ws.name);

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle hover:bg-surface-2 transition-colors">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 text-xs font-bold shrink-0">
        {initials}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-text-primary truncate">{ws.name}</p>
        <p className="text-caption text-text-tertiary truncate">{ws.description || 'No description'}</p>
      </div>
      <Badge tone={status.tone} variant="soft" dot className="shrink-0">{status.label}</Badge>
      <div className="flex items-center gap-4 text-caption text-text-secondary shrink-0">
        <span>{ws.memberCount ?? 0} members</span>
        <span>{ws.teamCount ?? 0} teams</span>
        <span>{ws.projectCount ?? 0} projects</span>
      </div>
      <p className="text-caption text-text-tertiary shrink-0 w-24 text-right">{formatDate(ws.createdAt)}</p>
      <DropdownMenu onAction={(a) => onAction(a, ws)} />
    </div>
  );
}

/* ---------- Dropdown Menu ---------- */

function DropdownMenu({ onAction }: { onAction: (action: string) => void }) {
  const [open, setOpen] = useState(false);

  const actions = [
    { id: 'open', label: 'Open Workspace', icon: ExternalLink },
    { id: 'edit', label: 'Edit Workspace', icon: Pencil },
    { id: 'archive', label: 'Archive Workspace', icon: Archive },
    { id: 'delete', label: 'Delete Workspace', icon: Trash2, danger: true },
  ];

  return (
    <div className="relative">
      <IconButton label="Actions" variant="ghost" size="sm" className="h-8 w-8" onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal className="h-4 w-4" />
      </IconButton>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-52 rounded-lg border border-border-default bg-elevated shadow-cx-lg py-1">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => { setOpen(false); onAction(a.id); }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-body transition-colors',
                    a.danger
                      ? 'text-danger-700 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-100/20'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   Page
============================================================ */

export function WorkspaceManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortKey>('created');
  const [page, setPage] = useState(1);

  const [archiveTarget, setArchiveTarget] = useState<WorkspaceSummaryResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceSummaryResponse | null>(null);

  const PAGE_SIZE = 9;

  const { data: workspacesData, isLoading, isError, error } = useWorkspacesList();
  const deleteMutation = useDeleteWorkspace();
  const archiveMutation = useArchiveWorkspace();

  const workspaces = useMemo(() => workspacesData ?? [], [workspacesData]);

  const sorted = useMemo(() => {
    let list = [...workspaces];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(ws => ws.name.toLowerCase().includes(q) || (ws.description ?? '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter(ws => ws.status.toLowerCase() === statusFilter);
    }
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'members') return (b.memberCount ?? 0) - (a.memberCount ?? 0);
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
    return list;
  }, [workspaces, query, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  const onFilterChange = useCallback((setter: any) => (val: any) => { setPage(1); setter(val); }, []);

  const handleAction = useCallback((action: string, ws: WorkspaceSummaryResponse) => {
    switch (action) {
      case 'open':
        navigate(`/app/workspace-overview?ws=${ws.id}`);
        break;
      case 'edit':
        navigate(`/app/edit-workspace/${ws.id}`);
        break;
      case 'archive':
        if (ws.status === 'ACTIVE') setArchiveTarget(ws);
        else toast({ title: `"${ws.name}" is already archived`, tone: 'info' });
        break;
      case 'delete':
        setDeleteTarget(ws);
        break;
    }
  }, [navigate, toast]);

  const handleArchive = useCallback(async () => {
    if (!archiveTarget) return;
    try {
      await archiveMutation.mutateAsync(archiveTarget.id);
      toast({ title: `"${archiveTarget.name}" archived`, tone: 'success' });
      setArchiveTarget(null);
    } catch {
      toast({ title: 'Failed to archive workspace', tone: 'danger' });
    }
  }, [archiveTarget, archiveMutation, toast]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: `"${deleteTarget.name}" deleted`, tone: 'success' });
      setDeleteTarget(null);
    } catch {
      toast({ title: 'Failed to delete workspace', tone: 'danger' });
    }
  }, [deleteTarget, deleteMutation, toast]);

  /* ---- Loading state ---- */
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  /* ---- Error state ---- */
  if (isError) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title="Failed to load workspaces"
            description={error instanceof Error ? error.message : 'An error occurred'}
            action={<Button onClick={() => window.location.reload()}>Retry</Button>}
          />
        </CardBody>
      </Card>
    );
  }

  /* ---- Empty state ---- */
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={<Briefcase className="h-6 w-6" />}
              title="No workspaces yet"
              description="Create your first workspace to start organizing departments, teams and projects."
              action={
                <Button leftIcon={<Plus />} onClick={() => navigate('/app/create-workspace')}>
                  Create your first Workspace
                </Button>
              }
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  /* ---- Main content ---- */
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-display font-semibold text-text-primary">Workspace Management</h1>
          <p className="mt-1 text-body text-text-secondary">Manage all collaborative workspaces.</p>
        </div>
        <Button leftIcon={<Plus />} onClick={() => navigate('/app/create-workspace')}>
          Create Workspace
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search workspaces..."
            className="cx-input h-10 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface p-0.5">
            {(['all', 'active', 'archived'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-caption font-medium capitalize transition-colors',
                  statusFilter === s ? 'bg-accent-600 text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface p-0.5">
            {(['name', 'members', 'created'] as const).map(s => (
              <Tooltip key={s} content={`Sort by ${s}`}>
                <button
                  onClick={() => { setSortBy(s); setPage(1); }}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                    sortBy === s ? 'bg-accent-600 text-white' : 'text-text-secondary hover:bg-surface-2',
                  )}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface p-0.5">
            {(['grid', 'list'] as const).map(m => (
              <Tooltip key={m} content={`${m} view`}>
                <button
                  onClick={() => setViewMode(m)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                    viewMode === m ? 'bg-accent-600 text-white' : 'text-text-secondary hover:bg-surface-2',
                  )}
                >
                  {m === 'grid' ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Results info */}
      <p className="text-caption text-text-tertiary -mt-3">
        Showing {sorted.length} workspace{sorted.length !== 1 ? 's' : ''}
        {query && ` matching "${query}"`}
      </p>

      {/* Workspace cards / list */}
      {paginated.length === 0 ? (
        <Card>
          <CardBody className="py-12">
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No matching workspaces"
              description="Try adjusting your search or filters."
              action={<Button variant="outline" onClick={() => { setQuery(''); setStatusFilter('all'); }}>Clear filters</Button>}
            />
          </CardBody>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map(ws => (
            <WorkspaceCard key={ws.id} ws={ws} onAction={handleAction} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Workspaces</CardTitle>
            <CardDescription>{sorted.length} workspace{sorted.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardBody className="p-0">
            {paginated.map(ws => (
              <WorkspaceRow key={ws.id} ws={ws} onAction={handleAction} />
            ))}
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-caption text-text-tertiary">
            Page {page} of {totalPages}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Archive Modal */}
      <ArchiveModal
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        workspace={archiveTarget ? { name: archiveTarget.name } : null}
        onConfirm={handleArchive}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        workspace={deleteTarget ? { name: deleteTarget.name } : null}
        onConfirm={handleDelete}
      />
    </div>
  );
}
