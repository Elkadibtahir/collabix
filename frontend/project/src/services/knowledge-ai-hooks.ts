import { useMutation, useQuery } from '@tanstack/react-query';
import {
  knowledgeAIService,
  type KnowledgeAskRequest,
  type KnowledgeSearchRequest,
} from './knowledge-ai-service';

const svc = knowledgeAIService();

export function useAIAskQuestion() {
  return useMutation({
    mutationFn: (data: KnowledgeAskRequest) => svc.ask(data),
  });
}

export function useAISearchKnowledge() {
  return useMutation({
    mutationFn: (data: KnowledgeSearchRequest) => svc.search(data),
  });
}

export function useAIKnowledgeHistory(workspaceId: string | undefined, page?: number, size?: number) {
  return useQuery({
    queryKey: ['knowledge-ai', 'history', workspaceId, page, size],
    queryFn: () => svc.getHistory(workspaceId!, page, size),
    enabled: !!workspaceId,
  });
}
