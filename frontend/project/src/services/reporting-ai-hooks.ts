import { useMutation, useQuery } from '@tanstack/react-query';
import {
  reportingAIService,
  type ReportingGenerateRequest,
  type ReportingEditRequest,
} from './reporting-ai-service';

const svc = reportingAIService();

export function useAIGenerateReport() {
  return useMutation({
    mutationFn: (data: ReportingGenerateRequest) => svc.generate(data),
  });
}

export function useAIRegenerateReport() {
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: ReportingGenerateRequest }) =>
      svc.regenerate(reportId, data),
  });
}

export function useAIEditReport() {
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: ReportingEditRequest }) =>
      svc.edit(reportId, data),
  });
}

export function useAIApproveReport() {
  return useMutation({
    mutationFn: (reportId: string) => svc.approve(reportId),
  });
}

export function useAIRejectReport() {
  return useMutation({
    mutationFn: (reportId: string) => svc.reject(reportId),
  });
}

export function useAIReportHistory(workspaceId: string | undefined, page?: number, size?: number) {
  return useQuery({
    queryKey: ['reporting-ai', 'history', workspaceId, page, size],
    queryFn: () => svc.getHistory(workspaceId!, page, size),
    enabled: !!workspaceId,
  });
}
