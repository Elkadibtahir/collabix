import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';
import type { NotificationResponse } from './notification-service';

export type HrNotificationStatus = 'UNREAD' | 'READ' | 'DISMISSED' | 'ARCHIVED';

export interface HrNotificationSearchCriteria {
  recipientId?: string;
  notificationType?: string;
  module?: string;
  status?: HrNotificationStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface HrNotificationStatistics {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  dismissedCount: number;
  archivedCount: number;
  todayCount: number;
  notificationsByType: Record<string, number>;
  notificationsByModule: Record<string, number>;
  notificationsByStatus: Record<string, number>;
}

function base(wsId: string, deptId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/notifications`;
}

function toQuery(params: object): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export const hrNotificationService = {
  list: (wsId: string, deptId: string, criteria?: HrNotificationSearchCriteria) =>
    apiClient.get<PageResponse<NotificationResponse>>(`${base(wsId, deptId)}${toQuery(criteria ?? {})}`),

  getById: (wsId: string, deptId: string, notificationId: string) =>
    apiClient.get<NotificationResponse>(`${base(wsId, deptId)}/${notificationId}`),

  markAsRead: (wsId: string, deptId: string, notificationId: string) =>
    apiClient.put<NotificationResponse>(`${base(wsId, deptId)}/${notificationId}/read`),

  markAllAsRead: (wsId: string, deptId: string, recipientId: string) =>
    apiClient.put<void>(`${base(wsId, deptId)}/read-all?recipientId=${recipientId}`),

  dismiss: (wsId: string, deptId: string, notificationId: string) =>
    apiClient.put<NotificationResponse>(`${base(wsId, deptId)}/${notificationId}/dismiss`),

  delete: (wsId: string, deptId: string, notificationId: string) =>
    apiClient.delete<void>(`${base(wsId, deptId)}/${notificationId}`),

  stats: (wsId: string, deptId: string) =>
    apiClient.get<HrNotificationStatistics>(`${base(wsId, deptId)}/stats`),
};
