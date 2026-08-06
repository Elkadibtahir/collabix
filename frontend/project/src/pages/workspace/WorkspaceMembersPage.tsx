import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  MoreHorizontal,
  Eye,
  Power,
  Trash2,
  UserCog,
  Network,
  Users,
  UserCheck,
  Shield,
  AlertCircle,
  X,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge, type Tone } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { IconButton } from '../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { Can } from '../auth';
import { cn } from '../../lib/cn';
import {
  useUsersList,
  useUserStatistics,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useUpdateUser,
  useDepartmentsList,
  useTeamsByDepartment,
} from '../../services/admin-hooks';
import { useWorkspaceTeams } from '../../services/team-hooks';
import { useToast } from '../../components/ui/Toast';
import type { UserResponse } from '../../types';
import { UserStatus } from '../../types';

const PAGE_SIZE = 10;

function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

const statusTone: Record<string, Tone> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  PENDING_ACTIVATION: 'info',
  SUSPENDED: 'danger',
  LOCKED: 'danger',
  ARCHIVED: 'warning',
  SOFT_DELETED: 'danger',
};

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  const bg: Record<string, string> = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
  };
  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bg[tone])}>
      <div className="flex items-center justify-between">
        <p className="text-2xs font-medium opacity-75">{label}</p>
        <span className="[&>svg]:h-4 [&>svg]:w-4 opacity-75">{icon}</span>
      </div>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}

interface ConfirmAction {
  type: 'delete' | 'deactivate' | 'activate';
  userId?: string;
  label: string;
}

export function WorkspaceMembersPage({ workspaceId }: { workspaceId: string }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | undefined>();
  const [teamFilter, setTeamFilter] = useState<string | undefined>();
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [previewUser, setPreviewUser] = useState<UserResponse | null>(null);
  const [assignUser, setAssignUser] = useState<UserResponse | null>(null);

  const { data: users, isLoading, isError, error } = useUsersList();
  const { data: stats } = useUserStatistics();
  const { data: departments } = useDepartmentsList();
  const { data: workspaceTeams } = useWorkspaceTeams(workspaceId || undefined);
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    let result = [...users];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    if (deptFilter) result = result.filter((u) => u.departmentId === deptFilter);
    if (teamFilter) result = result.filter((u) => u.teamId === teamFilter);
    if (roleFilter) result = result.filter((u) => u.role === roleFilter);
    if (statusFilter) result = result.filter((u) => u.status === statusFilter);

    return result;
  }, [users, search, deptFilter, teamFilter, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statuses = users ? Array.from(new Set(users.map((u) => u.status))) : [];
  const roles = users ? Array.from(new Set(users.map((u) => u.role))) : [];

  const displayStats = {
    total: stats?.totalUsers ?? users?.length ?? 0,
    active: stats?.activeUsers ?? (users ? users.filter((u) => u.status === UserStatus.ACTIVE).length : 0),
    managers: stats?.usersPerRole?.['MANAGER'] ?? 0,
    pending: stats?.pendingActivationUsers ?? 0,
  };

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'delete') {
        if (confirmAction.userId) await deleteUser.mutateAsync(confirmAction.userId);
        toast({ title: confirmAction.label, tone: 'success' });
      } else if (confirmAction.type === 'activate') {
        if (confirmAction.userId) await activateUser.mutateAsync(confirmAction.userId);
        toast({ title: confirmAction.label, tone: 'success' });
      } else if (confirmAction.type === 'deactivate') {
        if (confirmAction.userId) await deactivateUser.mutateAsync(confirmAction.userId);
        toast({ title: confirmAction.label, tone: 'success' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toast({ title: msg, tone: 'danger' });
    }
    setConfirmAction(null);
  }, [confirmAction, deleteUser, activateUser, deactivateUser, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-52" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-6 w-6" />}
        title="Failed to load members"
        description={error?.message ?? 'An error occurred while fetching workspace members.'}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Workspace Members</h1>
        <p className="text-body text-text-secondary">
          Manage all members within the current workspace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Members" value={displayStats.total} icon={<Users />} tone="accent" />
        <StatCard label="Active" value={displayStats.active} icon={<UserCheck />} tone="success" />
        <StatCard label="Managers" value={displayStats.managers} icon={<Shield />} tone="info" />
        <StatCard label="Pending Activation" value={displayStats.pending} icon={<AlertCircle />} tone="warning" />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search members by name or email..."
              leftIcon={<Search />}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              className="w-40"
              value={deptFilter ?? ''}
              onChange={(e) => { setDeptFilter(e.target.value || undefined); setPage(1); }}
              options={[
                { value: '', label: 'All Departments' },
                ...(departments ?? []).map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
            <Select
              className="w-40"
              value={teamFilter ?? ''}
              onChange={(e) => { setTeamFilter(e.target.value || undefined); setPage(1); }}
              options={[
                { value: '', label: 'All Teams' },
                ...(workspaceTeams ?? []).map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
            <Select
              className="w-40"
              value={roleFilter ?? ''}
              onChange={(e) => { setRoleFilter(e.target.value || undefined); setPage(1); }}
              options={[
                { value: '', label: 'All Roles' },
                ...roles.map((r) => ({ value: r, label: formatStatus(r) })),
              ]}
            />
            <Select
              className="w-40"
              value={statusFilter ?? ''}
              onChange={(e) => { setStatusFilter(e.target.value || undefined); setPage(1); }}
              options={[
                { value: '', label: 'All Statuses' },
                ...statuses.map((s) => ({ value: s, label: formatStatus(s) })),
              ]}
            />
          </div>
        </div>
      </div>

      {paginatedUsers.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No members found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Workspace members table">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Member</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Department</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Team</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Role</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Last Login</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <MemberRow
                      key={user.id}
                      user={user}
                      onView={() => setPreviewUser(user)}
                      onAssign={() => setAssignUser(user)}
                      onToggleStatus={(id, action) => setConfirmAction({
                        type: action,
                        userId: id,
                        label: action === 'activate' ? 'Member activated' : 'Member deactivated',
                      })}
                      onDelete={(id) => setConfirmAction({ type: 'delete', userId: id, label: 'Member removed' })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                <p className="text-caption text-text-tertiary">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
                </p>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {confirmAction && (
        <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title="Confirm Action" size="sm">
          <p className="text-body text-text-secondary">
            Are you sure you want to {confirmAction.type === 'delete' ? 'remove this member' : confirmAction.type === 'activate' ? 'activate this member' : 'deactivate this member'}?
          </p>
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border-subtle">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button variant={confirmAction.type === 'delete' ? 'danger' : 'primary'} onClick={handleConfirmAction}>
              Confirm
            </Button>
          </div>
        </Modal>
      )}

      <MemberPreviewModal user={previewUser} onClose={() => setPreviewUser(null)} />

      <AssignModal
        workspaceId={workspaceId}
        user={assignUser}
        departments={departments ?? []}
        workspaceTeams={workspaceTeams ?? []}
        onClose={() => setAssignUser(null)}
        onSave={async (id, data) => {
          try {
            await updateUser.mutateAsync({ id, data });
            toast({ title: 'Assignment updated', tone: 'success' });
            setAssignUser(null);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to update assignment';
            toast({ title: msg, tone: 'danger' });
          }
        }}
      />
    </div>
  );
}

function MemberRow({
  user,
  onView,
  onAssign,
  onToggleStatus,
  onDelete,
}: {
  user: UserResponse;
  onView: () => void;
  onAssign: () => void;
  onToggleStatus: (id: string, action: 'activate' | 'deactivate') => void;
  onDelete: (id: string) => void;
}) {
  const isActive = user.status === UserStatus.ACTIVE;

  const actionItems: DropdownItem[] = [
    { label: 'View Profile', icon: <Eye className="h-4 w-4" />, onClick: onView },
    { label: 'Assign Team / Department', icon: <UserCog className="h-4 w-4" />, onClick: onAssign },
    { divider: true },
    {
      label: isActive ? 'Deactivate' : 'Reactivate',
      icon: <Power className="h-4 w-4" />,
      onClick: () => onToggleStatus(user.id, isActive ? 'deactivate' : 'activate'),
    },
    { divider: true },
    { label: 'Remove', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => onDelete(user.id) },
  ];

  return (
    <tr className="border-b border-border-subtle hover:bg-surface-2 transition-colors">
      <td className="px-4 py-3">
        <button type="button" onClick={onView} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar name={`${user.firstName} ${user.lastName}`} />
          <div className="text-left">
            <p className="text-body font-medium text-text-primary">{user.firstName} {user.lastName}</p>
            <p className="text-caption text-text-tertiary">{user.email}</p>
          </div>
        </button>
      </td>
      <td className="px-4 py-3">
        <p className="text-body text-text-secondary">{user.departmentName ?? <span className="italic text-text-tertiary">Not Assigned</span>}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-body text-text-secondary">{user.teamName ?? <span className="italic text-text-tertiary">Not Assigned</span>}</p>
      </td>
      <td className="px-4 py-3">
        <Badge tone="info" variant="soft">{user.role || '—'}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge tone={statusTone[user.status] ?? 'info'} variant="soft">{formatStatus(user.status)}</Badge>
      </td>
      <td className="px-4 py-3">
        <p className="text-body text-text-secondary">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</p>
      </td>
      <td className="px-4 py-3 text-right">
        <Can permission="USER_UPDATE" fallback={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}>
          <Dropdown
            trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
            items={actionItems}
            align="right"
          />
        </Can>
      </td>
    </tr>
  );
}

function MemberPreviewModal({ user, onClose }: { user: UserResponse | null; onClose: () => void }) {
  return (
    <Modal open={!!user} onClose={onClose} title="Member Profile" size="sm">
      {user && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
            <div>
              <p className="text-body font-semibold text-text-primary">{user.firstName} {user.lastName}</p>
              <p className="text-caption text-text-tertiary">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoTile label="Role" value={user.role} />
            <InfoTile label="Member Type" value={user.memberType} />
            <InfoTile label="Department" value={user.departmentName ?? 'Not Assigned'} />
            <InfoTile label="Team" value={user.teamName ?? 'Not Assigned'} />
            <InfoTile label="Status" value={formatStatus(user.status)} />
            <InfoTile label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'} />
            <InfoTile label="Created" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
            <InfoTile label="Updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'} />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-4">
            <Button variant="outline" onClick={onClose} leftIcon={<X className="h-4 w-4" />}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface px-3 py-2">
      <p className="text-2xs text-text-tertiary">{label}</p>
      <p className="text-body font-medium text-text-primary truncate">{value}</p>
    </div>
  );
}

function AssignModal({
  workspaceId,
  user,
  departments,
  workspaceTeams,
  onClose,
  onSave,
}: {
  workspaceId: string;
  user: UserResponse | null;
  departments: { id: string; name: string }[];
  workspaceTeams: { id: string; name: string; departmentId: string }[];
  onClose: () => void;
  onSave: (id: string, data: { departmentId?: string | null; teamId?: string; removeTeam?: boolean }) => Promise<void>;
}) {
  const [deptId, setDeptId] = useState<string>(user?.departmentId ?? '');
  const [teamId, setTeamId] = useState<string>(user?.teamId ?? '');
  const [saving, setSaving] = useState(false);

  const { data: deptTeams } = useTeamsByDepartment(workspaceId, deptId || undefined);

  const availableTeams = deptId
    ? deptTeams ?? workspaceTeams.filter((t) => t.departmentId === deptId)
    : workspaceTeams;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await onSave(user.id, {
        departmentId: deptId || null,
        ...(teamId ? { teamId } : { removeTeam: true }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title={`Assign ${user ? `${user.firstName} ${user.lastName}` : ''}`} size="sm">
      {user && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Select
              label="Department"
              value={deptId}
              onChange={(e) => { setDeptId(e.target.value); setTeamId(''); }}
              options={[
                { value: '', label: 'Not Assigned' },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
            <Select
              label="Team"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              options={[
                { value: '', label: 'Not Assigned' },
                ...(availableTeams ?? []).map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
            <p className="text-caption text-text-tertiary flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5" /> Selecting a department updates the team options accordingly.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default WorkspaceMembersPage;
