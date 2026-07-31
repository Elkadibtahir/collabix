import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';
import type {
  MessageResponse,
  CreateMessageRequest,
  UpdateMessageRequest,
} from '../types/communication';

function base(wsId: string, convId: string) {
  return `/workspaces/${wsId}/conversations/${convId}/messages`;
}

export const messageService = {
  list: (wsId: string, convId: string, cursor?: string) => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiClient.get<PageResponse<MessageResponse>>(`${base(wsId, convId)}${params}`);
  },

  getById: (wsId: string, msgId: string) =>
    apiClient.get<MessageResponse>(`/workspaces/${wsId}/messages/${msgId}`),

  create: (wsId: string, convId: string, data: CreateMessageRequest) =>
    apiClient.post<MessageResponse>(`${base(wsId, convId)}`, data),

  update: (wsId: string, convId: string, msgId: string, data: UpdateMessageRequest) =>
    apiClient.put<MessageResponse>(`${base(wsId, convId)}/${msgId}`, data),

  delete: (wsId: string, convId: string, msgId: string) =>
    apiClient.delete<void>(`${base(wsId, convId)}/${msgId}`),

  listPinned: (wsId: string, convId: string) =>
    apiClient.get<MessageResponse[]>(`${base(wsId, convId)}/pinned`),

  listFiles: (wsId: string, convId: string) =>
    apiClient.get<PageResponse<MessageResponse>>(`${base(wsId, convId)}/files`),

  search: (wsId: string, convId: string, query: string) =>
    apiClient.get<PageResponse<MessageResponse>>(`${base(wsId, convId)}/search?query=${encodeURIComponent(query)}`),
};
