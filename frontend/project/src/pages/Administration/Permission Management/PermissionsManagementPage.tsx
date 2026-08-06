import { useState } from 'react';
import { Search, Shield, Info, Check, X as XIcon } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { usePermissionsList, useRolesList } from '../../../services/admin-hooks';
import type { PermissionResponse } from '../../../types';

export function PermissionsManagementPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponse | null>(null);

  const { data: permissions, isLoading, isError, error } = usePermissionsList();
  const { data: roles } = useRolesList();

  const filteredPermissions = (permissions ?? []).filter(
    (p) =>
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  );

  const tabItems: TabItem[] = [
    { id: 'catalog', label: 'Catalog' },
    { id: 'matrix', label: 'Permission Matrix' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-page font-semibold text-text-primary">Permissions</h1>
        <EmptyState
          icon={<Shield />}
          title="Failed to load permissions"
          description={error?.message ?? 'An error occurred while fetching permissions.'}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Permissions</h1>
        <p className="text-body text-text-secondary">
          View and manage all available permissions across modules.
        </p>
      </div>

      <div className="flex-1 max-w-md">
        <Input
          placeholder="Search permissions..."
          leftIcon={<Search />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs items={tabItems} onChange={setActiveTab} />

      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {filteredPermissions.length === 0 ? (
            <EmptyState
              icon={<Shield />}
              title="No permissions found"
              description="Try adjusting your search."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Permission Catalog</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {filteredPermissions.map((perm) => (
                    <button
                      key={perm.id}
                      type="button"
                      onClick={() => setSelectedPermission(perm)}
                      className="w-full flex items-start justify-between p-3 rounded-lg border border-border-subtle bg-surface-2 hover:bg-surface-3 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <p className="text-body font-medium text-text-primary">{perm.displayName}</p>
                        <p className="text-caption text-text-secondary mt-1">{perm.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge tone="info" variant="soft">
                            {perm.code}
                          </Badge>
                        </div>
                      </div>
                      <code className="text-2xs font-mono text-text-tertiary bg-surface px-2 py-1 rounded shrink-0 ml-2">
                        {perm.id}
                      </code>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'matrix' && (
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <p className="text-caption text-text-secondary mt-1">
              Shows which permissions are assigned to each role
            </p>
          </CardHeader>
          <CardBody>
            {(!roles || roles.length === 0) ? (
              <p className="text-body text-text-secondary text-center py-8">No roles available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label="Permission matrix">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary min-w-[200px]">
                        Permission
                      </th>
                      {roles.map((role) => (
                        <th
                          key={role.id}
                          className="px-4 py-3 text-center text-caption font-semibold text-text-secondary min-w-[120px]"
                        >
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions?.map((perm) => (
                      <tr key={perm.id} className="border-b border-border-subtle hover:bg-surface-2">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-body font-medium text-text-primary">{perm.displayName}</p>
                            <p className="text-2xs text-text-tertiary">{perm.code}</p>
                          </div>
                        </td>
                        {roles.map((role) => {
                          const granted = role.permissions?.includes(perm.code);
                          return (
                            <td key={`${perm.id}-${role.id}`} className="px-4 py-3 text-center">
                              {granted ? (
                                <Check className="h-4 w-4 text-success-500 mx-auto" />
                              ) : (
                                <XIcon className="h-4 w-4 text-text-tertiary mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle text-caption text-text-tertiary">
              <Info className="h-3.5 w-3.5" />
              Permission assignments are managed through role configuration on the backend
            </div>
          </CardBody>
        </Card>
      )}
      

      <PermissionDetailsModal
        permission={selectedPermission}
        onClose={() => setSelectedPermission(null)}
      />
    </div>
  );
}

function PermissionDetailsModal({
  permission,
  onClose,
}: {
  permission: PermissionResponse | null;
  onClose: () => void;
}) {
  return (
    <Modal open={!!permission} onClose={onClose} title="Permission Details" size="md">
      {permission && (
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-text-primary">{permission.displayName}</h3>
              <p className="text-body text-text-secondary mt-1">{permission.description}</p>
            </div>
          </div>

          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-2xs text-text-tertiary mb-1">Permission Code</p>
            <code className="text-body font-mono text-text-primary">{permission.code}</code>
          </div>

          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-2xs text-text-tertiary mb-1">Permission ID</p>
            <code className="text-body font-mono text-text-primary">{permission.id}</code>
          </div>
        </div>
      )}
    </Modal>
  );
}