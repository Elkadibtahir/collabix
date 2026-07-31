import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../components/ui/Toast';
import { useCreateWorkspace } from '../services/workspace-hooks';

export function CreateWorkspacePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const create = useCreateWorkspace();

  function validate(): boolean {
    const errs: { name?: string } = {};
    if (!name.trim()) errs.name = 'Workspace name is required';
    else if (name.trim().length > 150) errs.name = 'Name must be 150 characters or less';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await create.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: 'Workspace created', description: `"${res.name}" is ready.`, tone: 'success' });
      navigate(`/app/workspace-overview?ws=${res.id}`);
    } catch {
      toast({ title: 'Failed to create workspace', tone: 'danger' });
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in py-8">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-page">Create Workspace</CardTitle>
            <CardDescription>Set up a new workspace for your team.</CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
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

            {/* Description */}
            <Textarea
              label="Description (optional)"
              placeholder="A short description of your workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
              <Button type="submit" disabled={!name.trim() || create.isPending} loading={create.isPending}>
                {create.isPending ? 'Creating...' : 'Create Workspace'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}


