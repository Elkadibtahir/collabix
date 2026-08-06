import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import type {
  SprintResponse,
  CreateSprintRequest,
  UpdateSprintRequest,
} from '../../../services/sprint-service';
import type { ProjectResponse } from '../../projects/projects-types';
import type { TeamSummary } from '../../../services/team-service';

interface SprintFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  sprint?: SprintResponse;
  projects: ProjectResponse[];
  teams: TeamSummary[];
  isSubmitting: boolean;
  onSubmit: (data: CreateSprintRequest | UpdateSprintRequest) => void;
}

export function SprintFormModal({
  open,
  onClose,
  mode,
  sprint,
  projects,
  teams,
  isSubmitting,
  onSubmit,
}: SprintFormModalProps) {
  const [projectId, setProjectId] = useState('');
  const [teamId, setTeamId] = useState(sprint?.teamId ?? '');
  const [name, setName] = useState(sprint?.name ?? '');
  const [goal, setGoal] = useState(sprint?.goal ?? '');
  const [description, setDescription] = useState(sprint?.description ?? '');
  const [startDate, setStartDate] = useState(sprint?.startDate ?? '');
  const [endDate, setEndDate] = useState(sprint?.endDate ?? '');
  const [capacity, setCapacity] = useState(sprint?.capacity != null ? String(sprint.capacity) : '');

  const canSubmit = mode === 'create'
    ? !!projectId && name.trim().length > 0 && !!startDate && !!endDate
    : name.trim().length > 0;

  const handleSubmit = () => {
    const capacityNum = capacity ? Number(capacity) : undefined;
    const basePayload = {
      teamId: teamId || undefined,
      name: name.trim(),
      goal: goal || undefined,
      description: description || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      capacity: capacityNum && !Number.isNaN(capacityNum) ? capacityNum : undefined,
    };
    if (mode === 'create') {
      onSubmit({ ...basePayload, projectId } as CreateSprintRequest);
    } else {
      onSubmit(basePayload as UpdateSprintRequest);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'New Sprint' : 'Edit Sprint'}
      description={mode === 'create' ? 'Plan a new sprint for this development department.' : 'Update the details of this sprint.'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={isSubmitting}>
            {mode === 'create' ? 'Create Sprint' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {mode === 'create' && (
          <Select
            label="Project *"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: 'Select project…' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Name *"
              placeholder="e.g. Sprint 25 — Dashboard Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Goal"
              placeholder="What does this sprint aim to deliver?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <Select
            label="Team"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            options={[
              { value: '', label: 'Unassigned' },
              ...teams.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
          <Input
            label="Capacity"
            type="number"
            placeholder="Story points capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <Input
            label="Start Date *"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date *"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              placeholder="Describe the sprint scope, priorities, and expectations…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
