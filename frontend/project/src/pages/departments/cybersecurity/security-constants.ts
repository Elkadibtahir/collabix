import type { Tone } from '../../../components/ui/Badge';
import type { AuditStatus, AuditPriority, AuditType } from '../../../services/security-audit-service';

export const AUDIT_STATUSES: { value: AuditStatus; label: string }[] = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const AUDIT_TYPES: { value: AuditType; label: string }[] = [
  { value: 'ACCESS_CONTROL', label: 'Access Control' },
  { value: 'NETWORK_SECURITY', label: 'Network Security' },
  { value: 'APPLICATION_SECURITY', label: 'Application Security' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'COMPLIANCE', label: 'Compliance' },
  { value: 'DATA_PROTECTION', label: 'Data Protection' },
  { value: 'IDENTITY_MANAGEMENT', label: 'Identity Management' },
  { value: 'GENERAL', label: 'General' },
];

export const AUDIT_PRIORITIES: { value: AuditPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export function auditStatusColor(status: AuditStatus): Tone {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'accent';
    case 'UNDER_REVIEW':
      return 'info';
    case 'PLANNED':
      return 'warning';
    case 'ARCHIVED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function auditPriorityColor(priority: AuditPriority): Tone {
  switch (priority) {
    case 'CRITICAL':
      return 'danger';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
    case 'LOW':
      return 'neutral';
    default:
      return 'neutral';
  }
}
