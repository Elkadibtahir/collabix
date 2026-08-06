import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { AUDIT_TYPES, AUDIT_PRIORITIES } from './security-constants';
import type { SecurityAudit, CreateSecurityAuditRequest, UpdateSecurityAuditRequest, AuditType, AuditPriority } from '../../../services/security-audit-service';

interface Props {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  audit?: SecurityAudit | null;
  projects: { id: string; name: string }[];
  teams: { id: string; name: string }[];
  isSubmitting: boolean;
  onSubmit: (data: CreateSecurityAuditRequest | UpdateSecurityAuditRequest) => void;
}

export function SecurityAuditFormModal({ open, onClose, mode, audit, projects, teams, isSubmitting, onSubmit }: Props) {
  const [projectId, setProjectId] = useState(audit?.projectId ?? (projects[0]?.id ?? ''));
  const [teamId, setTeamId] = useState(audit?.teamId ?? '');
  const [name, setName] = useState(audit?.name ?? '');
  const [description, setDescription] = useState(audit?.description ?? '');
  const [auditType, setAuditType] = useState<AuditType>(audit?.auditType ?? 'GENERAL');
  const [priority, setPriority] = useState<AuditPriority>(audit?.priority ?? 'MEDIUM');
  const [startDate, setStartDate] = useState(audit?.startDate ?? '');
  const [endDate, setEndDate] = useState(audit?.endDate ?? '');

  const canSubmit = mode === 'create'
    ? !!projectId && name.trim().length > 0
    : name.trim().length > 0;

  const handleSubmit = () => {
    const basePayload = {
      teamId: teamId || undefined,
      name: name.trim(),
      description: description || undefined,
      auditType,
      priority,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    if (mode === 'create') {
      onSubmit({ ...basePayload, projectId } as CreateSecurityAuditRequest);
    } else {
      onSubmit(basePayload as UpdateSecurityAuditRequest);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'New Security Audit' : 'Edit Security Audit'}
      description={mode === 'create' ? 'Plan a new security audit for this department.' : 'Update the details of this security audit.'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={isSubmitting}>
            {mode === 'create' ? 'Create Audit' : 'Save Changes'}
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
          label="Audit Name *"
          placeholder="e.g. Q3 Access Control Review"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Audit Type *"
            value={auditType}
            onChange={(e) => setAuditType(e.target.value as AuditType)}
            options={AUDIT_TYPES}
          />
          <Select
            label="Priority *"
            value={priority}
            onChange={(e) => setPriority(e.target.value as AuditPriority)}
            options={AUDIT_PRIORITIES}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Textarea
          label="Description"
          placeholder="Describe the scope, objectives, and parameters of this security audit..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  );
}
