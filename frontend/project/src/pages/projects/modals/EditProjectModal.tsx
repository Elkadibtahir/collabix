import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useUpdateProject } from '../../../services/project-hooks';
import { useToast } from '../../../components/ui/Toast';
import type { ProjectResponse, UpdateProjectRequest, ProjectPriority } from '../projects-types';

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  wsId: string;
  deptId: string;
  project: ProjectResponse;
}

export function EditProjectModal({ open, onClose, wsId, deptId, project }: EditProjectModalProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateProject();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [priority, setPriority] = useState<ProjectPriority | ''>(project.priority ?? '');
  const [startDate, setStartDate] = useState(project.startDate ?? '');
  const [endDate, setEndDate] = useState(project.endDate ?? '');
  const [color, setColor] = useState(project.color ?? '#6366f1');

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description ?? '');
      setPriority(project.priority ?? '');
      setStartDate(project.startDate ?? '');
      setEndDate(project.endDate ?? '');
      setColor(project.color ?? '#6366f1');
    }
  }, [open, project]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const data: UpdateProjectRequest = {
      name: name !== project.name ? name.trim() : undefined,
      description: description !== (project.description ?? '') ? description.trim() || undefined : undefined,
      priority: (priority || undefined) !== project.priority ? (priority as ProjectPriority) || undefined : undefined,
      startDate: (startDate || undefined) !== project.startDate ? startDate || undefined : undefined,
      endDate: (endDate || undefined) !== project.endDate ? endDate || undefined : undefined,
      color: (color || undefined) !== project.color ? color || undefined : undefined,
    };
    try {
      await updateMutation.mutateAsync({ wsId, deptId, projectId: project.id, data });
      toast({ title: 'Success', description: 'Project updated successfully.', tone: 'success' });
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to update project.', tone: 'danger' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Project"
      description={`Update details for ${project.name}.`}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Project Name *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter project name" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProjectPriority)}
            options={[
              { value: '', label: 'No priority' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
          />
          <div>
            <label className="mb-1.5 block text-caption font-medium text-text-secondary">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-full rounded-lg border border-border-subtle bg-surface px-2 cursor-pointer" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
