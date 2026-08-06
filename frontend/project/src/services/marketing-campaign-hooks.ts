import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingCampaignService } from './marketing-campaign-service';
import type {
  MarketingCampaignSearchCriteria,
  CreateMarketingCampaignRequest,
  UpdateMarketingCampaignRequest,
} from './marketing-campaign-service';

const keys = {
  all: (wsId: string, deptId: string) => ['campaigns', wsId, deptId] as const,
  list: (wsId: string, deptId: string, criteria: MarketingCampaignSearchCriteria | undefined, page: number) =>
    ['campaigns', wsId, deptId, 'list', criteria, page] as const,
  detail: (wsId: string, deptId: string, campaignId: string) =>
    ['campaigns', wsId, deptId, campaignId] as const,
  stats: (wsId: string, deptId: string) => ['campaigns', wsId, deptId, 'stats'] as const,
};

export function useCampaigns(
  wsId: string,
  deptId: string,
  criteria?: MarketingCampaignSearchCriteria,
  page = 0,
  size = 20,
) {
  return useQuery({
    queryKey: keys.list(wsId, deptId, criteria, page),
    queryFn: () => marketingCampaignService.list(wsId, deptId, criteria, page, size),
    enabled: !!wsId && !!deptId,
  });
}

export function useCampaignDetail(wsId: string, deptId: string, campaignId: string | undefined) {
  return useQuery({
    queryKey: keys.detail(wsId, deptId, campaignId ?? ''),
    queryFn: () => marketingCampaignService.getById(wsId, deptId, campaignId!),
    enabled: !!wsId && !!deptId && !!campaignId,
  });
}

export function useCampaignStats(wsId: string, deptId: string) {
  return useQuery({
    queryKey: keys.stats(wsId, deptId),
    queryFn: () => marketingCampaignService.stats(wsId, deptId),
    enabled: !!wsId && !!deptId,
  });
}

export function useCreateCampaign(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMarketingCampaignRequest) =>
      marketingCampaignService.create(wsId, deptId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'campaigns', wsId, deptId] });
    },
  });
}

export function useUpdateCampaign(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: string; data: UpdateMarketingCampaignRequest }) =>
      marketingCampaignService.update(wsId, deptId, campaignId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.detail(wsId, deptId, variables.campaignId) });
      qc.invalidateQueries({ queryKey: ['department', 'campaigns', wsId, deptId] });
    },
  });
}

export function useActivateCampaign(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => marketingCampaignService.activate(wsId, deptId, campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'campaigns', wsId, deptId] });
    },
  });
}

export function useCompleteCampaign(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => marketingCampaignService.complete(wsId, deptId, campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'campaigns', wsId, deptId] });
    },
  });
}

export function useArchiveCampaign(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => marketingCampaignService.archive(wsId, deptId, campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'campaigns', wsId, deptId] });
    },
  });
}
