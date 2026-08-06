import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceReviewService } from './performance-review-service';
import type { CreatePerformanceReviewRequest, UpdatePerformanceReviewRequest } from './performance-review-service';

const keys = {
  all: (wsId: string, deptId: string) => ['performance-reviews', wsId, deptId] as const,
  detail: (wsId: string, deptId: string, id: string) => ['performance-reviews', wsId, deptId, id] as const,
  stats: (wsId: string, deptId: string) => ['performance-reviews', 'stats', wsId, deptId] as const,
};

export function usePerformanceReviewsList(wsId: string, deptId: string, page = 0, size = 10) {
  return useQuery({ queryKey: [...keys.all(wsId, deptId), page], queryFn: () => performanceReviewService.list(wsId, deptId, { page, size }), enabled: !!wsId && !!deptId });
}

export function usePerformanceReviewDetail(wsId: string, deptId: string, reviewId: string | undefined) {
  return useQuery({ queryKey: keys.detail(wsId, deptId, reviewId ?? ''), queryFn: () => performanceReviewService.getById(wsId, deptId, reviewId!), enabled: !!wsId && !!deptId && !!reviewId });
}

export function usePerformanceReviewStats(wsId: string, deptId: string) {
  return useQuery({ queryKey: keys.stats(wsId, deptId), queryFn: () => performanceReviewService.getStats(wsId, deptId), enabled: !!wsId && !!deptId });
}

export function useCreatePerformanceReview(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: CreatePerformanceReviewRequest) => performanceReviewService.create(wsId, deptId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }) });
}

export function useUpdatePerformanceReview(wsId: string, deptId: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: UpdatePerformanceReviewRequest) => performanceReviewService.update(wsId, deptId, reviewId, data), onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }); qc.invalidateQueries({ queryKey: keys.detail(wsId, deptId, reviewId) }); } });
}

export function useDeletePerformanceReview(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => performanceReviewService.delete(wsId, deptId, id), onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }) });
}

export function useSubmitPerformanceReview(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => performanceReviewService.submit(wsId, deptId, id), onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }) });
}

export function useApprovePerformanceReview(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => performanceReviewService.approve(wsId, deptId, id), onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }) });
}

export function useRejectPerformanceReview(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => performanceReviewService.reject(wsId, deptId, id, reason), onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }) });
}

export function useArchivePerformanceReview(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => performanceReviewService.archive(wsId, deptId, id), onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }) });
}
