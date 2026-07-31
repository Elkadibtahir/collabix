import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Briefcase,
  Clock,
  Edit,
  MoreHorizontal,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import { useUserDetail, useDeactivateUser, useActivateUser } from '../../../services/admin-hooks';
import { EditUserModal } from './EditUserModal';
import type { UserResponse } from '../../../types';

function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function UserDetailsPage({
  userId,
  onBack,
}: {
  userId: string;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { data: userData, isLoading } = useUserDetail(userId);
  const deactivateUser = useDeactivateUser();
  const activateUser = useActivateUser();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!userData) {
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
          icon={<Briefcase />}
          title="User not found"
          description="The user you are looking for does not exist or has been removed."
        />
      </div>
    );
  }

  return (
    <>
      <UserDetailsContent
        userData={userData}
        onBack={onBack}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onEdit={() => setEditModalOpen(true)}
        onToggleStatus={async () => {
          try {
            if (userData.status === 'ACTIVE') {
              await deactivateUser.mutateAsync(userData.id);
              toast({ title: 'User deactivated', tone: 'success' });
            } else {
              await activateUser.mutateAsync(userData.id);
              toast({ title: 'User activated', tone: 'success' });
            }
          } catch {
            toast({ title: 'Failed to update user status', tone: 'danger' });
          }
        }}
      />
      <EditUserModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={userData}
      />
    </>
  );
}

function UserDetailsContent({
  userData,
  onBack,
  activeTab,
  onTabChange,
  onEdit,
  onToggleStatus,
}: {
  userData: UserResponse;
  onBack?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  const tabItems: TabItem[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'permissions', label: 'Permissions' },
  ];

  const actionItems: DropdownItem[] = [
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: onEdit },
    { divider: true },
    { label: 'Reset Password', icon: <RotateCcw className="h-4 w-4" /> },
    {
      label: userData.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
      icon: <Power className="h-4 w-4" />,
      onClick: onToggleStatus,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors shrink-0 mt-0.5"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-start gap-4">
            <Avatar name={`${userData.firstName} ${userData.lastName}`} />
            <div>
              <h1 className="text-page font-semibold text-text-primary">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-body text-text-secondary">{userData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="soft">
                  {formatStatus(userData.status)}
                </Badge>
                <Badge tone="info" variant="soft">
                  {userData.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <Dropdown
          trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-5 w-5" /></IconButton>}
          items={actionItems}
          align="right"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <InfoCard icon={<Mail />} label="Email" value={userData.email} />
        <InfoCard icon={<Briefcase />} label="Member Type" value={userData.memberType} />
        <InfoCard icon={<Building2 />} label="Department" value={userData.departmentName ?? 'Not Assigned'} />
        <InfoCard icon={<Users />} label="Team" value={userData.teamName ?? 'Not Assigned'} />
      </div>

      <Tabs items={tabItems} onChange={onTabChange} />

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <InfoRow label="Full Name" value={`${userData.firstName} ${userData.lastName}`} />
                <InfoRow label="Email" value={userData.email} />
                <InfoRow label="User ID" value={userData.id} />
                <InfoRow label="Department" value={userData.departmentName ?? 'Not Assigned'} />
                <InfoRow label="Team" value={userData.teamName ?? 'Not Assigned'} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className={`flex items-center justify-between p-3 rounded-lg border ${userData.status === 'ACTIVE' ? 'bg-success-50 dark:bg-success-100 border-success-200 dark:border-success-800' : 'bg-warning-50 dark:bg-warning-100 border-warning-200 dark:border-warning-800'}`}>
                  <div className="flex items-center gap-3">
                    {userData.status === 'ACTIVE' ? (
                      <CheckCircle2 className="h-5 w-5 text-success-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-warning-600" />
                    )}
                    <div>
                      <p className={`text-body font-medium ${userData.status === 'ACTIVE' ? 'text-success-900 dark:text-success-100' : 'text-warning-900 dark:text-warning-100'}`}>
                        Account {formatStatus(userData.status)}
                      </p>
                      <p className={`text-caption ${userData.status === 'ACTIVE' ? 'text-success-800 dark:text-success-200' : 'text-warning-800 dark:text-warning-200'}`}>
                        {userData.lastLoginAt ? `Last login: ${new Date(userData.lastLoginAt).toLocaleString()}` : 'No login activity recorded'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                <DetailItem label="Role" value={userData.role || '—'} />
                <DetailItem label="Status" value={formatStatus(userData.status)} />
                <DetailItem label="Department" value={userData.departmentName ?? 'Not Assigned'} />
                <DetailItem label="Team" value={userData.teamName ?? 'Not Assigned'} />
                <DetailItem label="Created" value={userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '—'} />
                <DetailItem label="Last Login" value={userData.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleString() : 'Never'} />
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <Card>
          <CardHeader>
            <CardTitle>Permissions & Roles</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-body font-medium text-text-primary mb-3">Assigned Roles</p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="info" variant="soft">
                  {userData.role}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className="text-accent-600 dark:text-accent-400 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xs text-text-tertiary">{label}</p>
          <p className="text-body font-medium text-text-primary truncate">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border-subtle last:pb-0 last:border-0">
      <span className="text-caption text-text-secondary">{label}</span>
      <span className="text-body font-medium text-text-primary">{value}</span>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="pb-3 border-b border-border-subtle last:pb-0 last:border-0">
      <p className="text-2xs text-text-tertiary mb-1">{label}</p>
      <p className="text-body font-medium text-text-primary">{value}</p>
    </div>
  );
}
