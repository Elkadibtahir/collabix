import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';
import type {
  ConversationResponse,
  CreateConversationRequest,
  UpdateConversationRequest,
  ConversationMemberResponse,
} from '../types/communication';

function base(wsId: string) {
  return `/workspaces/${wsId}/conversations`;
}

export const conversationService = {
  list: (wsId: string) =>
    apiClient.get<PageResponse<ConversationResponse>>(`${base(wsId)}`),

  getById: (wsId: string, convId: string) =>
    apiClient.get<ConversationResponse>(`${base(wsId)}/${convId}`),

  create: (wsId: string, data: CreateConversationRequest) =>
    apiClient.post<ConversationResponse>(`${base(wsId)}`, data),

  update: (wsId: string, convId: string, data: UpdateConversationRequest) =>
    apiClient.put<ConversationResponse>(`${base(wsId)}/${convId}`, data),

  archive: (wsId: string, convId: string) =>
    apiClient.post<void>(`${base(wsId)}/${convId}/archive`),

  delete: (wsId: string, convId: string) =>
    apiClient.delete<void>(`${base(wsId)}/${convId}`),

  listByType: (wsId: string, type: string) =>
    apiClient.get<PageResponse<ConversationResponse>>(`${base(wsId)}/type/${type}`),

  listWorkspaceDefaults: (wsId: string) =>
    apiClient.get<ConversationResponse[]>(`${base(wsId)}/workspace-defaults`),

  listDirect: (wsId: string) =>
    apiClient.get<ConversationResponse[]>(`${base(wsId)}/direct`),

  addMember: (wsId: string, convId: string, userId: string) =>
    apiClient.post<ConversationResponse>(`${base(wsId)}/${convId}/members/${userId}`),

  removeMember: (wsId: string, convId: string, userId: string) =>
    apiClient.delete<void>(`${base(wsId)}/${convId}/members/${userId}`),

  listMembers: (wsId: string, convId: string) =>
    apiClient.get<ConversationMemberResponse[]>(`${base(wsId)}/${convId}/members`),

  getUnreadCount: (wsId: string, convId: string) =>
    apiClient.get<number>(`${base(wsId)}/${convId}/unread-count`),
};
