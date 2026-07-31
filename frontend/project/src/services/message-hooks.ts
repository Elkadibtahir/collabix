import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { messageService } from './message-service';
import type { CreateMessageRequest, UpdateMessageRequest } from '../types/communication';

const msgKeys = {
  list: (wsId: string, convId: string) => ['messages', wsId, convId] as const,
  pinned: (wsId: string, convId: string) => ['messages', wsId, convId, 'pinned'] as const,
  files: (wsId: string, convId: string) => ['messages', wsId, convId, 'files'] as const,
  search: (wsId: string, convId: string, query: string) => ['messages', wsId, convId, 'search', query] as const,
};

export function useMessages(wsId: string, convId: string) {
  return useInfiniteQuery({
    queryKey: msgKeys.list(wsId, convId),
    queryFn: ({ pageParam }) => messageService.list(wsId, convId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.page.last && lastPage.content.length > 0) {
        return lastPage.content[lastPage.content.length - 1].id;
      }
      return undefined;
    },
    enabled: !!wsId && !!convId,
  });
}

export function usePinnedMessages(wsId: string, convId: string) {
  return useQuery({
    queryKey: msgKeys.pinned(wsId, convId),
    queryFn: () => messageService.listPinned(wsId, convId),
    enabled: !!wsId && !!convId,
  });
}

export function useConversationFiles(wsId: string, convId: string) {
  return useQuery({
    queryKey: msgKeys.files(wsId, convId),
    queryFn: () => messageService.listFiles(wsId, convId),
    enabled: !!wsId && !!convId,
  });
}

export function useSearchMessages(wsId: string, convId: string, query: string) {
  return useQuery({
    queryKey: msgKeys.search(wsId, convId, query),
    queryFn: () => messageService.search(wsId, convId, query),
    enabled: !!wsId && !!convId && query.length > 0,
  });
}

export function useCreateMessage(wsId: string, convId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMessageRequest) =>
      messageService.create(wsId, convId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: msgKeys.list(wsId, convId) });
      qc.invalidateQueries({ queryKey: ['conversations', wsId] });
    },
  });
}

export function useUpdateMessage(wsId: string, convId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ msgId, data }: { msgId: string; data: UpdateMessageRequest }) =>
      messageService.update(wsId, convId, msgId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: msgKeys.list(wsId, convId) });
    },
  });
}

export function useDeleteMessage(wsId: string, convId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (msgId: string) =>
      messageService.delete(wsId, convId, msgId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: msgKeys.list(wsId, convId) });
    },
  });
}
