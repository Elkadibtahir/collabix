import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { useDepartmentDetail, useUpdateDepartment } from '../../../services/department-hooks';
import { Settings as SettingsIcon, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export function DeptSettings({ wsId, deptId }: { wsId?: string; deptId?: string }) {
  const { toast } = useToast();
  const { data: dept, isLoading, isError } = useDepartmentDetail(wsId, deptId);
  const updateDepartment = useUpdateDepartment(wsId, deptId);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dept?.name) setName(dept.name);
  }, [dept?.name]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        {[1, 2].map((i) => (
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

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Department name is required', tone: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await updateDepartment.mutateAsync({ name: name.trim() });
      toast({ title: 'Department settings saved', description: 'Your changes have been applied.', tone: 'success' });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : 'Failed to save settings', tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

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
            <div>
              <label className="text-2xs font-medium text-text-secondary mb-1 block">Department ID</label>
              <Input value={dept?.id ?? ''} disabled />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" leftIcon={<CheckCircle2 />} onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
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

export default DeptSettings;
