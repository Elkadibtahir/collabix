import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export interface NotificationResponse {
  id: string;
  workspaceId: string;
  recipientId: string;
  notificationType: string;
  title: string;
  body?: string;
  linkUrl?: string;
  projectId?: string;
  taskId?: string;
  commentId?: string;
  documentId?: string;
  resourceType?: string;
  resourceId?: string;
  readAt?: string;
  status: 'UNREAD' | 'READ' | 'DISMISSED' | 'ARCHIVED';
  priority: string;
  category: string;
  groupKey?: string;
  createdAt: string;
  updatedAt: string;
}

function base(wsId: string) {
  return `/workspaces/${wsId}/notifications`;
}

export interface NotificationPreferenceResponse {
  id: string;
  userId: string;
  workspaceId: string;
  notificationType: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  digestFrequency: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface NotificationPreferenceRequest {
  notificationType?: string;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  digestFrequency?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

function basePref(wsId: string) {
  return `/workspaces/${wsId}/notification-preferences`;
}

export const notificationService = {
  list: (wsId: string) =>
    apiClient.get<PageResponse<NotificationResponse>>(`${base(wsId)}`),

  getById: (wsId: string, notifId: string) =>
    apiClient.get<NotificationResponse>(`${base(wsId)}/${notifId}`),

  listUnread: (wsId: string) =>
    apiClient.get<PageResponse<NotificationResponse>>(`${base(wsId)}/unread`),

  unreadCount: (wsId: string) =>
    apiClient.get<number>(`${base(wsId)}/unread/count`),

  markAsRead: (wsId: string, notifId: string) =>
    apiClient.put<NotificationResponse>(`${base(wsId)}/${notifId}/read`),

  markAllAsRead: (wsId: string) =>
    apiClient.put<void>(`${base(wsId)}/read-all`),

  delete: (wsId: string, notifId: string) =>
    apiClient.delete<void>(`${base(wsId)}/${notifId}`),

  getPreferences: (wsId: string) =>
    apiClient.get<NotificationPreferenceResponse[]>(`${basePref(wsId)}`),

  createPreference: (wsId: string, data: NotificationPreferenceRequest) =>
    apiClient.post<NotificationPreferenceResponse>(`${basePref(wsId)}`, data),

  updatePreference: (wsId: string, prefId: string, data: NotificationPreferenceRequest) =>
    apiClient.put<NotificationPreferenceResponse>(`${basePref(wsId)}/${prefId}`, data),

  deletePreference: (wsId: string, prefId: string) =>
    apiClient.delete<void>(`${basePref(wsId)}/${prefId}`),
};
