export type AuthEventType = 'session-expired' | 'unauthorized' | 'forbidden' | 'token-refreshed';

export interface AuthEvent {
  type: AuthEventType;
  message?: string;
  status?: number;
}

type Listener = (event: AuthEvent) => void;

const listeners = new Set<Listener>();

export function onAuthEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitAuthEvent(event: AuthEvent): void {
  listeners.forEach((l) => l(event));
}
