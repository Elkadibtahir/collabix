import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { useDepartmentDetail } from '../../../services/department-hooks';
import { Bell, Settings as SettingsIcon, Shield, AlertCircle } from 'lucide-react';

export function DeptSettings({ wsId, deptId }: { wsId: string; deptId: string }) {
  const { toast } = useToast();
  const { data: dept, isLoading, isError } = useDepartmentDetail(wsId || undefined, deptId);
  const [name, setName] = useState('');

  useEffect(() => {
    if (dept?.name) setName(dept.name);
  }, [dept?.name]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardBody><Skeleton className="h-32 w-full" /></CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState icon={<AlertCircle className="h-6 w-6" />} title="Failed to load settings" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100">
              <SettingsIcon className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure department preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-2xs font-medium text-text-secondary mb-1 block">Department Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Save Changes</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-50 text-info-600 dark:bg-info-100">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {[
            { label: 'Activity updates', desc: 'Get notified about department activity' },
            { label: 'New members', desc: 'When new members join the department' },
            { label: 'Report generation', desc: 'When reports are generated' },
            { label: 'Document uploads', desc: 'When new documents are added' },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
              <div>
                <p className="text-caption font-medium text-text-primary">{n.label}</p>
                <p className="text-2xs text-text-tertiary">{n.desc}</p>
              </div>
              <label className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full border border-border-default bg-surface-2 transition-colors">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="absolute left-0.5 h-4 w-4 rounded-full bg-text-tertiary transition-all peer-checked:left-4 peer-checked:bg-accent-600" />
              </label>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-100">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Configure who can access this department</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
            <div>
              <p className="text-caption font-medium text-text-primary">Department Status</p>
              <p className="text-2xs text-text-tertiary">{dept?.status === 'ACTIVE' ? 'Active and visible to workspace members' : 'Archived'}</p>
            </div>
            <Badge tone={dept?.status === 'ACTIVE' ? 'success' : 'neutral'} variant="soft">{dept?.status ?? '—'}</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
