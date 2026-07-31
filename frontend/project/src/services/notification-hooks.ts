import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from './notification-service';

const notifKeys = {
  all: (wsId: string) => ['notifications', wsId] as const,
  unread: (wsId: string) => ['notifications', 'unread', wsId] as const,
  count: (wsId: string) => ['notifications', 'count', wsId] as const,
};

export function useNotificationsList(wsId: string) {
  return useQuery({
    queryKey: notifKeys.all(wsId),
    queryFn: () => notificationService.list(wsId),
    enabled: !!wsId,
  });
}

export function useUnreadNotifications(wsId: string) {
  return useQuery({
    queryKey: notifKeys.unread(wsId),
    queryFn: () => notificationService.listUnread(wsId),
    enabled: !!wsId,
  });
}

export function useUnreadCount(wsId: string) {
  return useQuery({
    queryKey: notifKeys.count(wsId),
    queryFn: () => notificationService.unreadCount(wsId),
    enabled: !!wsId,
    refetchInterval: 60_000,
  });
}

export function useMarkAsRead(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notifId: string) =>
      notificationService.markAsRead(wsId, notifId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notifKeys.all(wsId) });
      qc.invalidateQueries({ queryKey: notifKeys.unread(wsId) });
      qc.invalidateQueries({ queryKey: notifKeys.count(wsId) });
    },
  });
}

export function useMarkAllAsRead(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(wsId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notifKeys.all(wsId) });
      qc.invalidateQueries({ queryKey: notifKeys.unread(wsId) });
      qc.invalidateQueries({ queryKey: notifKeys.count(wsId) });
    },
  });
}

export function useDeleteNotification(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notifId: string) =>
      notificationService.delete(wsId, notifId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notifKeys.all(wsId) });
      qc.invalidateQueries({ queryKey: notifKeys.count(wsId) });
    },
  });
}

const prefKeys = {
  all: (wsId: string) => ['notification-preferences', wsId] as const,
};

export function useNotificationPreferences(wsId: string) {
  return useQuery({
    queryKey: prefKeys.all(wsId),
    queryFn: () => notificationService.getPreferences(wsId),
    enabled: !!wsId,
  });
}

export function useCreatePreference(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: import('./notification-service').NotificationPreferenceRequest) =>
      notificationService.createPreference(wsId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prefKeys.all(wsId) });
    },
  });
}

export function useUpdatePreference(wsId: string, prefId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: import('./notification-service').NotificationPreferenceRequest) =>
      notificationService.updatePreference(wsId, prefId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prefKeys.all(wsId) });
    },
  });
}

export function useDeletePreference(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefId: string) =>
      notificationService.deletePreference(wsId, prefId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prefKeys.all(wsId) });
    },
  });
}
