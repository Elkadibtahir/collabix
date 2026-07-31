import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Archive, Trash2, AlertTriangle, ArrowLeft, Building2, ExternalLink, Clock } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { useWorkspaceDetail, useUpdateWorkspace, useArchiveWorkspace, useDeleteWorkspace } from '../../services/workspace-hooks';
import { useWorkspaceId } from '../../hooks/useWorkspaceId';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  active: 'success',
  archived: 'neutral',
  suspended: 'warning',
};

export function WorkspaceSettingsPage() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();
  const { toast } = useToast();
  const { data: workspace, isLoading, isError, error } = useWorkspaceDetail(workspaceId);
  const updateMutation = useUpdateWorkspace(workspaceId);
  const archiveMutation = useArchiveWorkspace();
  const deleteMutation = useDeleteWorkspace();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (!initialized && workspace) {
    setName(workspace.name);
    setDescription(workspace.description ?? '');
    setInitialized(true);
  }

  const handleSave = () => {
    if (!name.trim()) return;
    updateMutation.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => toast({ title: 'Workspace updated successfully', tone: 'success' }),
        onError: () => toast({ title: 'Failed to update workspace', tone: 'error' }),
      },
    );
  };

  const handleArchive = () => {
    if (!window.confirm('Are you sure you want to archive this workspace? It can be restored later.')) return;
    archiveMutation.mutate(workspaceId, {
      onSuccess: () => {
        toast({ title: 'Workspace archived', tone: 'success' });
        navigate('/app/all-workspaces');
      },
      onError: () => toast({ title: 'Failed to archive workspace', tone: 'error' }),
    });
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to permanently delete this workspace? This action cannot be undone.')) return;
    deleteMutation.mutate(workspaceId, {
      onSuccess: () => {
        toast({ title: 'Workspace deleted', tone: 'success' });
        navigate('/app/all-workspaces');
      },
      onError: () => toast({ title: 'Failed to delete workspace', tone: 'error' }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <nav className="flex shrink-0 flex-col gap-0.5 lg:w-56">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </nav>
          <div className="flex-1 min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardBody className="space-y-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <EmptyState
        icon={<AlertTriangle />}
        title="Failed to load workspace"
        description={error instanceof Error ? error.message : 'Could not load workspace settings. Please try again.'}
        action={<Button leftIcon={<ArrowLeft />} onClick={() => navigate('/app/all-workspaces')}>Back to Workspaces</Button>}
      />
    );
  }

  const isSaving = updateMutation.isPending;
  const canSave = name.trim() !== '' && name.trim() !== workspace.name || description.trim() !== (workspace.description ?? '');

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-text-tertiary" />
            <h1 className="text-page font-semibold text-text-primary">Workspace Settings</h1>
          </div>
          <p className="text-body text-text-secondary">
            Manage workspace name, description, and advanced actions.
          </p>
        </div>
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>General Information</CardTitle>
              <p className="text-caption text-text-secondary mt-1">
                Basic workspace details and identification.
              </p>
            </div>
            <Button
              size="sm"
              leftIcon={isSaving ? undefined : <Save />}
              onClick={handleSave}
              disabled={!canSave || isSaving}
              loading={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <Input
            label="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            helperText="Your workspace name visible to all members."
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helperText="Brief description of your workspace purpose."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Owner"
              value={`${workspace.owner.firstName} ${workspace.owner.lastName}`}
              disabled
            />
            <div>
              <p className="text-caption font-medium text-text-secondary mb-1.5">Status</p>
              <Badge variant={statusVariant[workspace.status] ?? 'neutral'}>
                {workspace.status.charAt(0).toUpperCase() + workspace.status.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Created" value={new Date(workspace.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} disabled />
            <Input label="Updated" value={new Date(workspace.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} disabled />
          </div>
          <Input label="Workspace ID" value={workspace.id} disabled />
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger-600">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="rounded-lg border border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-100 p-4">
            <div className="flex items-start gap-3">
              <Archive className="h-5 w-5 text-danger-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-body font-semibold text-danger-700 dark:text-danger-200">Archive Workspace</p>
                <p className="text-caption text-danger-600 dark:text-danger-300 mt-1">
                  Archiving will deactivate the workspace. Members will lose access until it is restored. Archived workspaces can be restored later.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-3"
                  leftIcon={<Archive />}
                  onClick={handleArchive}
                  loading={archiveMutation.isPending}
                  disabled={archiveMutation.isPending}
                >
                  Archive Workspace
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-100 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-danger-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-body font-semibold text-danger-700 dark:text-danger-200">Delete Workspace</p>
                <p className="text-caption text-danger-600 dark:text-danger-300 mt-1">
                  Deleting your workspace is permanent and cannot be undone. All data, projects, and member information will be permanently removed.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-3"
                  leftIcon={<Trash2 />}
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                  disabled={deleteMutation.isPending}
                >
                  Delete Workspace
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
