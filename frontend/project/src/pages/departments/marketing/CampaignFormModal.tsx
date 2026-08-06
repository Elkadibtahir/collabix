import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { CAMPAIGN_TYPES, CAMPAIGN_PRIORITIES, campaignTypeLabel, campaignPriorityLabel } from './marketing-constants';
import type {
  MarketingCampaignResponse,
  CreateMarketingCampaignRequest,
  CampaignType,
  CampaignPriority,
  UpdateMarketingCampaignRequest,
} from '../../../services/marketing-campaign-service';
import type { ProjectResponse } from '../../projects/projects-types';
import type { TeamSummary } from '../../../services/team-service';

interface CampaignFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  campaign?: MarketingCampaignResponse;
  projects: ProjectResponse[];
  teams: TeamSummary[];
  isSubmitting: boolean;
  onSubmit: (data: CreateMarketingCampaignRequest | UpdateMarketingCampaignRequest) => void;
}

export function CampaignFormModal({
  open,
  onClose,
  mode,
  campaign,
  projects,
  teams,
  isSubmitting,
  onSubmit,
}: CampaignFormModalProps) {
  const [projectId, setProjectId] = useState('');
  const [teamId, setTeamId] = useState(campaign?.teamId ?? '');
  const [name, setName] = useState(campaign?.name ?? '');
  const [campaignType, setCampaignType] = useState<CampaignType>(campaign?.campaignType ?? 'GENERAL');
  const [priority, setPriority] = useState<CampaignPriority>(campaign?.priority ?? 'MEDIUM');
  const [objective, setObjective] = useState(campaign?.objective ?? '');
  const [targetAudience, setTargetAudience] = useState(campaign?.targetAudience ?? '');
  const [startDate, setStartDate] = useState(campaign?.startDate ?? '');
  const [endDate, setEndDate] = useState(campaign?.endDate ?? '');
  const [description, setDescription] = useState(campaign?.description ?? '');

  const canSubmit = mode === 'create'
    ? !!projectId && name.trim().length > 0
    : name.trim().length > 0;

  const handleSubmit = () => {
    const basePayload = {
      teamId: teamId || undefined,
      name: name.trim(),
      description: description || undefined,
      campaignType,
      objective: objective || undefined,
      priority,
      targetAudience: targetAudience || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    if (mode === 'create') {
      onSubmit({ ...basePayload, projectId } as CreateMarketingCampaignRequest);
    } else {
      onSubmit(basePayload as UpdateMarketingCampaignRequest);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'New Marketing Campaign' : 'Edit Marketing Campaign'}
      description={mode === 'create' ? 'Plan a new campaign for this marketing department.' : 'Update the details of this campaign.'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={isSubmitting}>
            {mode === 'create' ? 'Create Campaign' : 'Save Changes'}
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
              placeholder="e.g. Summer Social Media Push"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Select
            label="Campaign Type *"
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value as CampaignType)}
            options={CAMPAIGN_TYPES.map((t) => ({ value: t, label: campaignTypeLabel[t] }))}
          />
          <Select
            label="Priority *"
            value={priority}
            onChange={(e) => setPriority(e.target.value as CampaignPriority)}
            options={CAMPAIGN_PRIORITIES.map((p) => ({ value: p, label: campaignPriorityLabel[p] }))}
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
          <div />
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
          <div className="sm:col-span-2">
            <Input
              label="Objective"
              placeholder="What does this campaign aim to achieve?"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Target Audience"
              placeholder="e.g. Existing customers, 25-40, tech-savvy"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              placeholder="Describe the campaign scope, channels, and goals…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
