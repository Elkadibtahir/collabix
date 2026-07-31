import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from './knowledge-service';
import type { CreateKnowledgeBaseRequest, UpdateKnowledgeBaseRequest } from './knowledge-service';

const kbKeys = {
  all: (wsId: string, deptId: string, projId: string) =>
    ['knowledge', wsId, deptId, projId] as const,
  detail: (wsId: string, deptId: string, projId: string, kbId: string) =>
    ['knowledge', wsId, deptId, projId, kbId] as const,
  categories: (wsId: string, deptId: string, projId: string) =>
    ['knowledge', 'categories', wsId, deptId, projId] as const,
};

export function useKnowledgeList(wsId: string, deptId: string, projId: string) {
  return useQuery({
    queryKey: kbKeys.all(wsId, deptId, projId),
    queryFn: () => knowledgeService.list(wsId, deptId, projId),
    enabled: !!wsId && !!deptId && !!projId,
  });
}

export function useKnowledgeDetail(wsId: string, deptId: string, projId: string, kbId: string | undefined) {
  return useQuery({
    queryKey: kbKeys.detail(wsId, deptId, projId, kbId ?? ''),
    queryFn: () => knowledgeService.getById(wsId, deptId, projId, kbId!),
    enabled: !!wsId && !!deptId && !!projId && !!kbId,
  });
}

export function useKnowledgeCategories(wsId: string, deptId: string, projId: string) {
  return useQuery({
    queryKey: kbKeys.categories(wsId, deptId, projId),
    queryFn: () => knowledgeService.getCategories(wsId, deptId, projId),
    enabled: !!wsId && !!deptId && !!projId,
  });
}

export function useCreateKnowledge(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKnowledgeBaseRequest) =>
      knowledgeService.create(wsId, deptId, projId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kbKeys.all(wsId, deptId, projId) });
    },
  });
}

export function useUpdateKnowledge(wsId: string, deptId: string, projId: string, kbId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateKnowledgeBaseRequest) =>
      knowledgeService.update(wsId, deptId, projId, kbId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kbKeys.all(wsId, deptId, projId) });
      qc.invalidateQueries({ queryKey: kbKeys.detail(wsId, deptId, projId, kbId) });
    },
  });
}

export function useDeleteKnowledge(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kbId: string) =>
      knowledgeService.delete(wsId, deptId, projId, kbId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kbKeys.all(wsId, deptId, projId) });
    },
  });
}
