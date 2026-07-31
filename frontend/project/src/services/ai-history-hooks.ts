import { useMutation, useQuery } from '@tanstack/react-query';
import { aiHistoryService, type AIHistoryRequest } from './ai-history-service';

const svc = aiHistoryService();

export function useCreateAIHistory() {
  return useMutation({
    mutationFn: (data: AIHistoryRequest) => svc.create(data),
  });
}

export function useAIHistory(id: string | undefined) {
  return useQuery({
    queryKey: ['ai-history', id],
    queryFn: () => svc.getById(id!),
    enabled: !!id,
  });
}
