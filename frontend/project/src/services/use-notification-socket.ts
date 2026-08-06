import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth-context';

/**
 * Opens a WebSocket to /ws/notifications?userId=<id> and invalidates the
 * notification queries whenever the server pushes a new notification.
 */
export function useNotificationSocket() {
  const { user, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${window.location.host}/ws/notifications?userId=${encodeURIComponent(user.id)}`;
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data));
        const wsId: string | undefined = payload?.workspaceId;
        if (wsId) {
          qc.invalidateQueries({ queryKey: ['notifications', wsId] });
          qc.invalidateQueries({ queryKey: ['notifications', 'unread', wsId] });
          qc.invalidateQueries({ queryKey: ['notifications', 'count', wsId] });
        }
        qc.invalidateQueries({ queryKey: ['notifications', 'count'] });
      } catch {
        // ignore malformed payloads
      }
    };

    return () => {
      socket.close();
    };
  }, [user?.id, isAuthenticated, qc]);
}
