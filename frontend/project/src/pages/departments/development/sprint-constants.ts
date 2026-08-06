import type { SprintStatus } from '../../../services/sprint-service';
import type { Tone } from '../../../components/ui/Badge';

export const SPRINT_STATUSES: SprintStatus[] = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED',
];

export const sprintStatusLabel: Record<string, string> = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  ARCHIVED: 'Archived',
};

export const sprintStatusColor: Record<string, Tone> = {
  PLANNED: 'neutral',
  ACTIVE: 'success',
  COMPLETED: 'info',
  CANCELLED: 'danger',
  ARCHIVED: 'neutral',
};

export function canActivateSprint(status: SprintStatus): boolean {
  return status === 'PLANNED';
}

export function canCompleteSprint(status: SprintStatus): boolean {
  return status === 'ACTIVE';
}

export function canArchiveSprint(status: SprintStatus): boolean {
  return status !== 'ARCHIVED';
}

export function canEditSprint(status: SprintStatus): boolean {
  return status !== 'COMPLETED' && status !== 'ARCHIVED' && status !== 'CANCELLED';
}

export function canDeleteSprint(status: SprintStatus): boolean {
  return status === 'PLANNED';
}
