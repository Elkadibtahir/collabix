import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useDepartmentList } from '../../services/department-hooks';
import { useProjectList } from '../../services/project-hooks';
import { useCreateHandoverEntry } from '../../services/handover-hooks';
import { userService } from '../../services/user-service';
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function CreateHandoverModal({
  open,
  onClose,
  workspaceId,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
}) {
  const { toast } = useToast();
  const { data: departments } = useDepartmentList(workspaceId);
  const [departmentId, setDepartmentId] = useState('');
  const { data: projectsPage } = useProjectList(workspaceId, departmentId || undefined);
  const projects = projectsPage?.content ?? [];

  const { data: members } = useQuery({
    queryKey: ['handover', 'members', workspaceId],
    queryFn: () => userService(workspaceId).list(),
    enabled: !!workspaceId && open,
  });

  const createMutation = useCreateHandoverEntry(workspaceId);

  const [form, setForm] = useState({
    projectId: '',
    receiverId: '',
    title: '',
    content: '',
    priority: 'MEDIUM',
    dueDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm({ projectId: '', receiverId: '', title: '', content: '', priority: 'MEDIUM', dueDate: '' });
      setErrors({});
      setDepartmentId('');
    }
  }, [open]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const handleSubmit = async () => {
    const next: Record<string, string> = {};
    if (!departmentId) next.departmentId = 'Select a department';
    if (!form.projectId) next.projectId = 'Select a project';
    if (!form.receiverId) next.receiverId = 'Select a receiver';
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.content.trim()) next.content = 'Content is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await createMutation.mutateAsync({
        departmentId,
        projectId: form.projectId,
        receiverId: form.receiverId,
        title: form.title.trim(),
        content: form.content.trim(),
        priority: form.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        dueDate: form.dueDate || undefined,
      });
      toast({ title: 'Handover created', description: 'The handover draft has been created.', tone: 'success' });
      onClose();
    } catch (err) {
      toast({
        title: 'Failed to create handover',
        description: (err as { message?: string })?.message ?? 'An unexpected error occurred.',
        tone: 'danger',
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="New Handover"
      description="Create a handover entry and send it to a colleague."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending} leftIcon={<Send />}>
            Create & Send
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Department"
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setField('projectId', '');
          }}
          invalid={!!errors.departmentId}
          errorText={errors.departmentId}
          options={[
            { value: '', label: 'Select department' },
            ...(departments ?? []).map((d) => ({ value: d.id, label: d.name })),
          ]}
        />
        <Select
          label="Project"
          value={form.projectId}
          onChange={(e) => setField('projectId', e.target.value)}
          invalid={!!errors.projectId}
          errorText={errors.projectId}
          disabled={!departmentId}
          options={[
            { value: '', label: departmentId ? 'Select project' : 'Select a department first' },
            ...projects.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <Select
          label="Receiver"
          value={form.receiverId}
          onChange={(e) => setField('receiverId', e.target.value)}
          invalid={!!errors.receiverId}
          errorText={errors.receiverId}
          options={[
            { value: '', label: 'Select receiver' },
            ...(members ?? [])
              .filter((m) => m.status === 'ACTIVE')
              .map((m) => ({
                value: m.id,
                label: `${m.firstName} ${m.lastName}`,
              })),
          ]}
        />
        <Select
          label="Priority"
          value={form.priority}
          onChange={(e) => setField('priority', e.target.value)}
          options={PRIORITIES.map((p) => ({ value: p, label: p }))}
        />
      </div>
      <div className="mt-4">
        <Input
          label="Title"
          placeholder="e.g. Weekly handover - production deployment"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          invalid={!!errors.title}
          errorText={errors.title}
        />
      </div>
      <div className="mt-4">
        <Textarea
          label="Content"
          placeholder="Describe the work, tasks, blockers and context being handed over..."
          value={form.content}
          onChange={(e) => setField('content', e.target.value)}
          invalid={!!errors.content}
          errorText={errors.content}
        />
      </div>
      <div className="mt-4">
        <Input
          label="Due date (optional)"
          type="datetime-local"
          value={form.dueDate}
          onChange={(e) => setField('dueDate', e.target.value)}
        />
      </div>
    </Modal>
  );
}
