import { useMutation } from '@tanstack/react-query';
import {
  analyticsAIService,
  type AnalyticsAIGenerateRequest,
  type AnalyticsAIEditRequest,
} from './analytics-ai-service';

const svc = analyticsAIService();

export function useAIGenerateAnalytics() {
  return useMutation({
    mutationFn: (data: AnalyticsAIGenerateRequest) => svc.generate(data),
  });
}

export function useAIRegenerateAnalytics() {
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: AnalyticsAIGenerateRequest }) =>
      svc.regenerate(reportId, data),
  });
}

export function useAIEditAnalytics() {
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: AnalyticsAIEditRequest }) =>
      svc.edit(reportId, data),
  });
}

export function useAIApproveAnalytics() {
  return useMutation({
    mutationFn: (reportId: string) => svc.approve(reportId),
  });
}

export function useAIRejectAnalytics() {
  return useMutation({
    mutationFn: (reportId: string) => svc.reject(reportId),
  });
}
