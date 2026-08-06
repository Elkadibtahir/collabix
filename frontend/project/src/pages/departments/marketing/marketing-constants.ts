import type { CampaignStatus, CampaignType, CampaignPriority } from '../../../services/marketing-campaign-service';
import type { Tone } from '../../../components/ui/Badge';

export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  'PLANNED',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED',
];

export const campaignStatusLabel: Record<string, string> = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  ARCHIVED: 'Archived',
};

export const campaignStatusColor: Record<string, Tone> = {
  PLANNED: 'neutral',
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  COMPLETED: 'info',
  CANCELLED: 'danger',
  ARCHIVED: 'neutral',
};

export const CAMPAIGN_TYPES: CampaignType[] = [
  'SOCIAL_MEDIA',
  'EMAIL',
  'CONTENT',
  'SEO',
  'BRANDING',
  'EVENT',
  'ADVERTISEMENT',
  'PRODUCT_LAUNCH',
  'GENERAL',
];

export const campaignTypeLabel: Record<string, string> = {
  SOCIAL_MEDIA: 'Social Media',
  EMAIL: 'Email',
  CONTENT: 'Content',
  SEO: 'SEO',
  BRANDING: 'Branding',
  EVENT: 'Event',
  ADVERTISEMENT: 'Advertisement',
  PRODUCT_LAUNCH: 'Product Launch',
  GENERAL: 'General',
};

export const campaignTypeColor: Record<string, Tone> = {
  SOCIAL_MEDIA: 'accent',
  EMAIL: 'info',
  CONTENT: 'success',
  SEO: 'warning',
  BRANDING: 'neutral',
  EVENT: 'info',
  ADVERTISEMENT: 'warning',
  PRODUCT_LAUNCH: 'accent',
  GENERAL: 'neutral',
};

export const CAMPAIGN_PRIORITIES: CampaignPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const campaignPriorityLabel: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const campaignPriorityColor: Record<string, Tone> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

export function canActivateCampaign(status: CampaignStatus): boolean {
  return status === 'PLANNED';
}

export function canCompleteCampaign(status: CampaignStatus): boolean {
  return status === 'ACTIVE' || status === 'ON_HOLD';
}

export function canArchiveCampaign(status: CampaignStatus): boolean {
  return status !== 'ARCHIVED';
}

export function canEditCampaign(status: CampaignStatus): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED' && status !== 'ARCHIVED';
}
