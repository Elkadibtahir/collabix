import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiModelService } from './ai-model-service';
import type {
  AIModelSearchCriteria,
  CreateAIModelRequest,
  UpdateAIModelRequest,
  ModelStatus,
} from './ai-model-service';

const keys = {
  all: (wsId: string, deptId: string) => ['ai-models', wsId, deptId] as const,
  list: (wsId: string, deptId: string, criteria?: AIModelSearchCriteria) =>
    ['ai-models', wsId, deptId, 'list', criteria] as const,
  detail: (wsId: string, deptId: string, modelId: string) =>
    ['ai-models', wsId, deptId, modelId] as const,
  stats: (wsId: string, deptId: string) => ['ai-models', wsId, deptId, 'stats'] as const,
};

export function useAIModels(wsId: string, deptId: string, criteria?: AIModelSearchCriteria) {
  return useQuery({
    queryKey: keys.list(wsId, deptId, criteria),
    queryFn: () => aiModelService.list(wsId, deptId, criteria),
    enabled: !!wsId && !!deptId,
  });
}

export function useAIModelDetail(wsId: string, deptId: string, modelId: string | undefined) {
  return useQuery({
    queryKey: keys.detail(wsId, deptId, modelId ?? ''),
    queryFn: () => aiModelService.getById(wsId, deptId, modelId!),
    enabled: !!wsId && !!deptId && !!modelId,
  });
}

export function useAIModelStats(wsId: string, deptId: string) {
  return useQuery({
    queryKey: keys.stats(wsId, deptId),
    queryFn: () => aiModelService.stats(wsId, deptId),
    enabled: !!wsId && !!deptId,
  });
}

export function useCreateAIModel(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAIModelRequest) => aiModelService.create(wsId, deptId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }),
  });
}

export function useUpdateAIModel(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ modelId, data }: { modelId: string; data: UpdateAIModelRequest }) =>
      aiModelService.update(wsId, deptId, modelId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.detail(wsId, deptId, variables.modelId) });
    },
  });
}

export function useChangeAIModelStatus(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ modelId, status }: { modelId: string; status: ModelStatus }) =>
      aiModelService.changeStatus(wsId, deptId, modelId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }),
  });
}

export function useArchiveAIModel(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modelId: string) => aiModelService.archive(wsId, deptId, modelId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }),
  });
}
