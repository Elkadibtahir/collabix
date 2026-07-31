import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useCreateProject } from '../../../services/project-hooks';
import { useToast } from '../../../components/ui/Toast';
import type { CreateProjectRequest, ProjectPriority } from '../projects-types';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  wsId: string;
  deptId: string;
}

export function CreateProjectModal({ open, onClose, wsId, deptId }: CreateProjectModalProps) {
  const { toast } = useToast();
  const createMutation = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectPriority | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#6366f1');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const data: CreateProjectRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      priority: (priority as ProjectPriority) || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      color: color || undefined,
    };
    try {
      await createMutation.mutateAsync({ wsId, deptId, data });
      toast({ title: 'Success', description: 'Project created successfully.' });
      onClose();
      setName('');
      setDescription('');
      setPriority('');
      setStartDate('');
      setEndDate('');
    } catch {
      toast({ title: 'Error', description: 'Failed to create project.' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Project"
      description="Add a new project to this department."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
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
