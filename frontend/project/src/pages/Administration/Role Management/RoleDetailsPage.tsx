import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Edit,
  Copy,
  Archive,
  MoreHorizontal,
  Shield,
  Lock,
  Users,
  Check,
  X as XIcon,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useRoleDetail } from '../../../services/admin-hooks';
import { useToast } from '../../../components/ui/Toast';
import { usePermissionsList } from '../../../services/admin-hooks';
import { cn } from '../../../lib/cn';
import type { RoleResponse } from '../../../types';

export function RoleDetailsPage({
  roleId,
  onBack,
}: {
  roleId: string;
  onBack?: () => void;
}) {
  const { data: roleData, isLoading } = useRoleDetail(roleId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <EmptyState
          icon={<Shield />}
          title="Role not found"
          description="The role you are looking for does not exist or has been archived."
        />
      </div>
    );
  }

  return <RoleDetailsContent roleData={roleData} onBack={onBack} />;
}

function RoleDetailsContent({ roleData, onBack }: { roleData: RoleResponse; onBack?: () => void }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('permissions');
  const { data: allPermissions } = usePermissionsList();

  const tabItems: TabItem[] = [
    { id: 'permissions', label: `Permissions (${roleData.permissions?.length ?? 0})` },
    { id: 'users', label: `Users (${roleData.userCount ?? 0})` },
    { id: 'details', label: 'Details' },
  ];

  const actionItems: DropdownItem[] = [
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Duplicate', icon: <Copy className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { divider: true },
    { label: 'Archive', icon: <Archive className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
  ];

  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return [];
    const groups: Record<string, { code: string; displayName: string; description: string; granted: boolean }[]> = {};

    for (const perm of allPermissions) {
      const prefix = perm.code.split('_')[0];
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push({
        code: perm.code,
        displayName: perm.displayName,
        description: perm.description,
        granted: roleData.permissions?.includes(perm.code) ?? false,
      });
    }

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions, roleData.permissions]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-page font-semibold text-text-primary">{roleData.name}</h1>
              <Badge tone="accent" variant="soft">{roleData.userCount ?? 0} users</Badge>
            </div>
            <p className="text-body text-text-secondary">{roleData.description}</p>
          </div>
        </div>
        <Dropdown
          trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-5 w-5" /></IconButton>}
          items={actionItems}
          align="right"
        />
      </div>

      <Tabs items={tabItems} onChange={setActiveTab} />

      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {groupedPermissions.length === 0 ? (
            <EmptyState
              icon={<Lock />}
              title="No permissions"
              description="No permissions data available for this role."
            />
          ) : (
            groupedPermissions.map(([group, perms]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle>{group}</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-1">
                    {perms.map((perm) => (
                      <div
                        key={perm.code}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg transition-colors',
                          perm.granted ? 'bg-surface-2' : 'opacity-50',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {perm.granted ? (
                            <Check className="h-4 w-4 text-success-500 shrink-0" />
                          ) : (
                            <XIcon className="h-4 w-4 text-text-tertiary shrink-0" />
                          )}
                          <div>
                            <p className="text-body font-medium text-text-primary">{perm.displayName}</p>
                            <p className="text-2xs text-text-tertiary">{perm.description}</p>
                          </div>
                        </div>
                        <code className="text-2xs font-mono text-text-tertiary bg-surface px-2 py-0.5 rounded shrink-0 ml-2">
                          {perm.code}
                        </code>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Users with this role</CardTitle>
          </CardHeader>
          <CardBody>
            <EmptyState
              icon={<Users />}
              title="User list coming soon"
              description="A list of users assigned to this role will be available in a future update."
            />
          </CardBody>
        </Card>
      )}

      {activeTab === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <DetailRow label="Name" value={roleData.name} />
            <DetailRow label="Description" value={roleData.description || '-'} />
            <DetailRow label="Role ID" value={roleData.id} />
            <DetailRow label="Users" value={String(roleData.userCount ?? 0)} />
            <DetailRow label="Permissions" value={String(roleData.permissions?.length ?? 0)} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border-subtle last:pb-0 last:border-0">
      <span className="text-caption text-text-secondary">{label}</span>
      <span className="text-body font-medium text-text-primary">{value}</span>
    </div>
  );
}
