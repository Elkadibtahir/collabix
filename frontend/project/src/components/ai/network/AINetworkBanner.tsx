import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { cn } from '../../../lib/cn';

export type NetworkState = 'offline' | 'reconnecting' | 'slow-network' | 'online';

interface AINetworkBannerProps {
  state: NetworkState;
  onDismiss?: () => void;
}

const config: Record<NetworkState, { icon: typeof Wifi; label: string; description: string; colors: string }> = {
  offline: {
    icon: WifiOff,
    label: 'You are offline',
    description: 'AI features may be unavailable. Please check your connection.',
    colors: 'bg-danger-50 border-danger-200 text-danger-700 dark:bg-danger-500/10 dark:border-danger-500/30 dark:text-danger-300',
  },
  reconnecting: {
    icon: RefreshCw,
    label: 'Reconnecting...',
    description: 'Attempting to restore connection to AI services.',
    colors: 'bg-warning-50 border-warning-200 text-warning-700 dark:bg-warning-500/10 dark:border-warning-500/30 dark:text-warning-300',
  },
  'slow-network': {
    icon: Clock,
    label: 'Slow network detected',
    description: 'AI responses may be delayed due to network latency.',
    colors: 'bg-warning-50 border-warning-200 text-warning-700 dark:bg-warning-500/10 dark:border-warning-500/30 dark:text-warning-300',
  },
  online: {
    icon: Wifi,
    label: 'Connected',
    description: '',
    colors: '',
  },
};

export function AINetworkBanner({ state, onDismiss }: AINetworkBannerProps) {
  if (state === 'online') return null;
  const cfg = config[state];
  const Icon = cfg.icon;

  return (
    <div
      role="alert"
      className={cn('flex items-center gap-3 rounded-lg border px-4 py-2.5 text-caption animate-slide-up transition-opacity duration-200', cfg.colors)}
    >
      <Icon className={cn('h-4 w-4 shrink-0', state === 'reconnecting' && 'animate-cx-spin')} />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{cfg.label}</p>
        <p className="opacity-80">{cfg.description}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 flex h-6 w-6 items-center justify-center rounded text-inherit opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}

export function AINetworkOverlay({ state }: { state: NetworkState }) {
  if (state !== 'reconnecting' && state !== 'slow-network') return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-canvas/70 backdrop-blur-[1px] animate-fade-in">
      <div className="flex flex-col items-center gap-2 text-center">
        <RefreshCw className={cn('h-5 w-5 text-text-tertiary', state === 'reconnecting' && 'animate-cx-spin')} />
        <p className="text-caption font-medium text-text-secondary">
          {state === 'reconnecting' ? 'Reconnecting...' : 'Network latency detected'}
        </p>
        <p className="text-2xs text-text-tertiary max-w-[200px]">
          {state === 'reconnecting' ? 'Attempting to restore connection.' : 'Responses may be delayed.'}
        </p>
      </div>
    </div>
  );
}
