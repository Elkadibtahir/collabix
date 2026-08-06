import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useWorkspaceDetail, useUpdateWorkspace } from '../services/workspace-hooks';

export function EditWorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: ws, isLoading, isError } = useWorkspaceDetail(workspaceId);
  const update = useUpdateWorkspace(workspaceId ?? '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (ws) {
      setName(ws.name);
      setDescription(ws.description ?? '');
    }
  }, [ws]);

  function validate(): boolean {
    const errs: { name?: string } = {};
    if (!name.trim()) errs.name = 'Workspace name is required';
    else if (name.trim().length > 150) errs.name = 'Name must be 150 characters or less';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !workspaceId) return;
    try {
      await update.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: 'Workspace updated', tone: 'success' });
      navigate(`/app/workspace-overview?ws=${workspaceId}`);
    } catch {
      toast({ title: 'Failed to update workspace', tone: 'danger' });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError || !ws) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-section font-semibold text-text-primary">Workspace not found</h3>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/app/all-workspaces')}>
          Back to Workspaces
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-5 [&>svg]:w-5">
              <Briefcase />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-page">Edit Workspace</CardTitle>
                <Badge tone={ws.status === 'ACTIVE' ? 'success' : 'neutral'} variant="soft" dot>
                  {ws.status}
                </Badge>
              </div>
              <CardDescription>Update workspace settings for &ldquo;{ws.name}&rdquo;.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Workspace Name"
              placeholder="e.g. Engineering Team"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name && e.target.value.trim()) setErrors({}); }}
              errorText={errors.name}
              invalid={!!errors.name}
              required
              autoFocus
            />
            <Textarea
              label="Description (optional)"
              placeholder="A short description of your workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
              <Button type="submit" disabled={!name.trim() || update.isPending} loading={update.isPending}>
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/app/workspace-overview?ws=${workspaceId}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
