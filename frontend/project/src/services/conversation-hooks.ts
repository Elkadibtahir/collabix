import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from './conversation-service';
import type { CreateConversationRequest, UpdateConversationRequest } from '../types/communication';

const convKeys = {
  all: (wsId: string) => ['conversations', wsId] as const,
  detail: (wsId: string, convId: string) => ['conversations', wsId, convId] as const,
  members: (wsId: string, convId: string) => ['conversations', wsId, convId, 'members'] as const,
  type: (wsId: string, type: string) => ['conversations', wsId, 'type', type] as const,
  direct: (wsId: string) => ['conversations', wsId, 'direct'] as const,
  defaults: (wsId: string) => ['conversations', wsId, 'defaults'] as const,
  unread: (wsId: string, convId: string) => ['conversations', wsId, convId, 'unread'] as const,
};

export function useConversationsList(wsId: string) {
  return useQuery({
    queryKey: convKeys.all(wsId),
    queryFn: () => conversationService.list(wsId),
    enabled: !!wsId,
  });
}

export function useConversationDetail(wsId: string, convId: string | undefined) {
  return useQuery({
    queryKey: convKeys.detail(wsId, convId ?? ''),
    queryFn: () => conversationService.getById(wsId, convId!),
    enabled: !!wsId && !!convId,
  });
}

export function useConversationsByType(wsId: string, type: string) {
  return useQuery({
    queryKey: convKeys.type(wsId, type),
    queryFn: () => conversationService.listByType(wsId, type),
    enabled: !!wsId && !!type,
  });
}

export function useWorkspaceDefaults(wsId: string) {
  return useQuery({
    queryKey: convKeys.defaults(wsId),
    queryFn: () => conversationService.listWorkspaceDefaults(wsId),
    enabled: !!wsId,
  });
}

export function useDirectConversations(wsId: string) {
  return useQuery({
    queryKey: convKeys.direct(wsId),
    queryFn: () => conversationService.listDirect(wsId),
    enabled: !!wsId,
  });
}

export function useConversationMembers(wsId: string, convId: string) {
  return useQuery({
    queryKey: convKeys.members(wsId, convId),
    queryFn: () => conversationService.listMembers(wsId, convId),
    enabled: !!wsId && !!convId,
  });
}

export function useUnreadCount(wsId: string, convId: string) {
  return useQuery({
    queryKey: convKeys.unread(wsId, convId),
    queryFn: () => conversationService.getUnreadCount(wsId, convId),
    enabled: !!wsId && !!convId,
  });
}

export function useCreateConversation(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConversationRequest) =>
      conversationService.create(wsId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: convKeys.all(wsId) });
    },
  });
}

export function useUpdateConversation(wsId: string, convId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateConversationRequest) =>
      conversationService.update(wsId, convId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: convKeys.all(wsId) });
      qc.invalidateQueries({ queryKey: convKeys.detail(wsId, convId) });
    },
  });
}

export function useArchiveConversation(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (convId: string) =>
      conversationService.archive(wsId, convId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: convKeys.all(wsId) });
    },
  });
}

export function useDeleteConversation(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (convId: string) =>
      conversationService.delete(wsId, convId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: convKeys.all(wsId) });
    },
  });
}

export function useAddMember(wsId: string, convId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      conversationService.addMember(wsId, convId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: convKeys.members(wsId, convId) });
    },
  });
}

export function useRemoveMember(wsId: string, convId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      conversationService.removeMember(wsId, convId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: convKeys.members(wsId, convId) });
    },
  });
}
