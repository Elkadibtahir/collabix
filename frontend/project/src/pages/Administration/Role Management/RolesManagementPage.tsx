import { useState } from 'react';
import {
  Plus,
  Search,
  Copy,
  Edit,
  Archive,
  Trash2,
  MoreHorizontal,
  Users,
  Lock,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Can } from '../../../pages/auth';
import { Skeleton } from '../../../components/ui/Skeleton';
import { IconButton as ToggleButton } from '../../../components/ui/IconButton';
import { useToast } from '../../../components/ui/Toast';
import { useRolesList } from '../../../services/admin-hooks';
import type { RoleResponse } from '../../../types';

export function RolesManagementPage({
  onCreateRole,
  onEditRole,
}: {
  onCreateRole?: () => void;
  onEditRole?: (roleId: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { data: roles, isLoading, isError, error } = useRolesList();
  const { toast } = useToast();
  const comingSoon = () => toast({ title: 'Coming soon', tone: 'info' });

  const filteredRoles = (roles ?? []).filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Lock />}
        title="Failed to load roles"
        description={error?.message ?? 'An error occurred while fetching roles.'}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Roles</h1>
        <p className="text-body text-text-secondary">
          Create and manage roles with specific permission sets.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search roles..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden">
            <ToggleButton
              label="Card view"
              variant={viewMode === 'cards' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
            </ToggleButton>
            <ToggleButton
              label="Table view"
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </ToggleButton>
          </div>
          <Can permission="ROLE_CREATE">
            <Button leftIcon={<Plus />} onClick={() => { if (!onCreateRole) comingSoon(); else onCreateRole(); }}>
              Create Role
            </Button>
          </Can>
        </div>
      </div>

      {filteredRoles.length === 0 ? (
        <EmptyState
          icon={<Lock />}
          title="No roles found"
          description="Create a new role to get started."
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <RoleCard key={role.id} role={role} onEdit={() => onEditRole?.(role.id)} />
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Roles table">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Role</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Description</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
          {filteredRoles.map((role) => (
            <tr key={role.id} className="border-b border-border-subtle hover:bg-surface-2 transition-colors">
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEditRole?.(role.id)}
                  className="text-left hover:opacity-80 transition-opacity"
                >
                  <p className="text-body font-medium text-text-primary">{role.name}</p>
                </button>
              </td>
              <td className="px-4 py-3">
                <p className="text-body text-text-secondary">{role.description}</p>
              </td>
              <td className="px-4 py-3 text-right">
                <Dropdown
                  trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
                  items={[
                    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: () => onEditRole?.(role.id) },
                    { label: 'Duplicate', icon: <Copy className="h-4 w-4" />, onClick: comingSoon },
                    { divider: true },
                    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: comingSoon },
                  ]}
                  align="right"
                />
              </td>
            </tr>
          ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function RoleCard({ role, onEdit }: { role: RoleResponse; onEdit: () => void }) {
  const { toast } = useToast();
  const comingSoon = () => toast({ title: 'Coming soon', tone: 'info' });
  const actionItems: DropdownItem[] = [
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: onEdit },
    { label: 'Duplicate', icon: <Copy className="h-4 w-4" />, onClick: comingSoon },
    { divider: true },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: comingSoon },
  ];

  return (
    <Card className="hover:border-border-default transition-colors cursor-pointer" onClick={onEdit}>
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-body font-semibold text-text-primary">{role.name}</h3>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
              items={actionItems}
              align="right"
            />
          </div>
        </div>

        <p className="text-caption text-text-secondary line-clamp-2">{role.description}</p>

        <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="text-2xs text-text-tertiary">{role.permissions?.length ?? 0} permissions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="text-2xs text-text-tertiary">{role.userCount ?? 0} users</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}