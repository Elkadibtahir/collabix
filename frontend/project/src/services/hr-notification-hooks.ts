import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrNotificationService } from './hr-notification-service';
import type { HrNotificationSearchCriteria } from './hr-notification-service';

const keys = {
  list: (wsId: string, deptId: string) => ['hr-notifications', wsId, deptId] as const,
  detail: (wsId: string, deptId: string, id: string) => ['hr-notifications', wsId, deptId, id] as const,
  stats: (wsId: string, deptId: string) => ['hr-notifications', 'stats', wsId, deptId] as const,
};

export function useHrNotifications(wsId: string, deptId: string, criteria?: HrNotificationSearchCriteria) {
  return useQuery({ queryKey: [...keys.list(wsId, deptId), criteria], queryFn: () => hrNotificationService.list(wsId, deptId, criteria), enabled: !!wsId && !!deptId });
}

export function useHrNotificationDetail(wsId: string, deptId: string, notificationId: string | undefined) {
  return useQuery({ queryKey: keys.detail(wsId, deptId, notificationId ?? ''), queryFn: () => hrNotificationService.getById(wsId, deptId, notificationId!), enabled: !!wsId && !!deptId && !!notificationId });
}

export function useHrNotificationStats(wsId: string, deptId: string) {
  return useQuery({ queryKey: keys.stats(wsId, deptId), queryFn: () => hrNotificationService.stats(wsId, deptId), enabled: !!wsId && !!deptId });
}

export function useMarkHrNotificationRead(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => hrNotificationService.markAsRead(wsId, deptId, notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}

export function useMarkAllHrNotificationsRead(wsId: string, deptId: string, recipientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => hrNotificationService.markAllAsRead(wsId, deptId, recipientId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}

export function useDismissHrNotification(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => hrNotificationService.dismiss(wsId, deptId, notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}

export function useDeleteHrNotification(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => hrNotificationService.delete(wsId, deptId, notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}
