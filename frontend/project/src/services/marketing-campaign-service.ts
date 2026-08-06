import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export type CampaignStatus =
  | 'PLANNED'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type CampaignType =
  | 'SOCIAL_MEDIA'
  | 'EMAIL'
  | 'CONTENT'
  | 'SEO'
  | 'BRANDING'
  | 'EVENT'
  | 'ADVERTISEMENT'
  | 'PRODUCT_LAUNCH'
  | 'GENERAL';

export type CampaignPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MarketingCampaignResponse {
  id: string;
  departmentId: string;
  projectId: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  name: string;
  description?: string;
  campaignType: CampaignType;
  objective?: string;
  status: CampaignStatus;
  priority: CampaignPriority;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  totalTasks?: number;
  completedTasks?: number;
  remainingTasks?: number;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketingCampaignRequest {
  projectId: string;
  teamId?: string;
  name: string;
  description?: string;
  campaignType: CampaignType;
  objective?: string;
  priority: CampaignPriority;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateMarketingCampaignRequest {
  teamId?: string;
  name?: string;
  description?: string;
  campaignType?: CampaignType;
  objective?: string;
  priority?: CampaignPriority;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
}

export interface MarketingCampaignSearchCriteria {
  projectId?: string;
  teamId?: string;
  status?: CampaignStatus;
  campaignType?: CampaignType;
  priority?: CampaignPriority;
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
}

export interface MarketingCampaignStatistics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  plannedCampaigns: number;
  cancelledCampaigns: number;
  archivedCampaigns: number;
  averageCompletionPercentage: number;
  averageDurationDays: number;
  campaignsByStatus: Record<string, number>;
  campaignsByProject: Record<string, number>;
  campaignsByTeam: Record<string, number>;
}

export type MarketingCampaignPage = PageResponse<MarketingCampaignResponse>;

function base(wsId: string, deptId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/campaigns`;
}

function toQuery(
  criteria?: MarketingCampaignSearchCriteria,
  page = 0,
  size = 20,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  if (criteria) {
    Object.entries(criteria).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const marketingCampaignService = {
  list: (
    wsId: string,
    deptId: string,
    criteria?: MarketingCampaignSearchCriteria,
    page = 0,
    size = 20,
  ) =>
    apiClient.get<MarketingCampaignPage>(
      `${base(wsId, deptId)}${toQuery(criteria, page, size)}`,
    ),

  getById: (wsId: string, deptId: string, campaignId: string) =>
    apiClient.get<MarketingCampaignResponse>(`${base(wsId, deptId)}/${campaignId}`),

  create: (wsId: string, deptId: string, data: CreateMarketingCampaignRequest) =>
    apiClient.post<MarketingCampaignResponse>(`${base(wsId, deptId)}`, data),

  update: (
    wsId: string,
    deptId: string,
    campaignId: string,
    data: UpdateMarketingCampaignRequest,
  ) => apiClient.put<MarketingCampaignResponse>(`${base(wsId, deptId)}/${campaignId}`, data),

  activate: (wsId: string, deptId: string, campaignId: string) =>
    apiClient.put<MarketingCampaignResponse>(`${base(wsId, deptId)}/${campaignId}/activate`),

  complete: (wsId: string, deptId: string, campaignId: string) =>
    apiClient.put<MarketingCampaignResponse>(`${base(wsId, deptId)}/${campaignId}/complete`),

  archive: (wsId: string, deptId: string, campaignId: string) =>
    apiClient.put<MarketingCampaignResponse>(`${base(wsId, deptId)}/${campaignId}/archive`),

  stats: (wsId: string, deptId: string) =>
    apiClient.get<MarketingCampaignStatistics>(`${base(wsId, deptId)}/stats`),
};
