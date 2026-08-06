import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { MODEL_TYPES, modelTypeLabel } from './ai-constants';
import type {
  AIModelResponse,
  CreateAIModelRequest,
  ModelType,
  UpdateAIModelRequest,
} from '../../../services/ai-model-service';
import type { ProjectResponse } from '../../projects/projects-types';
import type { TeamSummary } from '../../../services/team-service';

interface ModelFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  model?: AIModelResponse;
  projects: ProjectResponse[];
  teams: TeamSummary[];
  defaultOwnerId?: string;
  isSubmitting: boolean;
  onSubmit: (data: CreateAIModelRequest | UpdateAIModelRequest) => void;
}

export function ModelFormModal({
  open,
  onClose,
  mode,
  model,
  projects,
  teams,
  defaultOwnerId,
  isSubmitting,
  onSubmit,
}: ModelFormModalProps) {
  const [projectId, setProjectId] = useState('');
  const [teamId, setTeamId] = useState(model?.teamId ?? '');
  const [name, setName] = useState(model?.name ?? '');
  const [modelType, setModelType] = useState<ModelType>(model?.modelType ?? 'CLASSIFICATION');
  const [modelVersion, setModelVersion] = useState(model?.modelVersion ?? '');
  const [objective, setObjective] = useState(model?.objective ?? '');
  const [accuracy, setAccuracy] = useState(model?.accuracy != null ? String(model.accuracy) : '');
  const [description, setDescription] = useState(model?.description ?? '');

  const canSubmit = mode === 'create'
    ? !!projectId && name.trim().length > 0 && !!modelType
    : name.trim().length > 0 && !!modelType;

  const handleSubmit = () => {
    const basePayload = {
      teamId: teamId || undefined,
      name: name.trim(),
      description: description || undefined,
      modelType,
      modelVersion: modelVersion || undefined,
      objective: objective || undefined,
      accuracy: accuracy !== '' ? Number(accuracy) : undefined,
      ownerId: defaultOwnerId,
    };
    if (mode === 'create') {
      onSubmit({ ...basePayload, projectId, ownerId: basePayload.ownerId } as CreateAIModelRequest);
    } else {
      onSubmit(basePayload as UpdateAIModelRequest);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'New AI Model' : 'Edit AI Model'}
      description={mode === 'create' ? 'Register a machine learning model in the model registry.' : 'Update the details of this AI model.'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={isSubmitting}>
            {mode === 'create' ? 'Create Model' : 'Save Changes'}
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
              placeholder="e.g. Customer Churn Classifier"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Select
            label="Model Type *"
            value={modelType}
            onChange={(e) => setModelType(e.target.value as ModelType)}
            options={MODEL_TYPES.map((t) => ({ value: t, label: modelTypeLabel[t] }))}
          />
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
            label="Version"
            placeholder="e.g. v1.2.0"
            value={modelVersion}
            onChange={(e) => setModelVersion(e.target.value)}
          />
          <Input
            label="Accuracy (%)"
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 92.5"
            value={accuracy}
            onChange={(e) => setAccuracy(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Objective"
              placeholder="What problem does this model solve?"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              placeholder="Describe the model architecture, dataset, and purpose…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
