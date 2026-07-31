import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface LoadingScreenProps {
  message?: string;
  variant?: 'fullscreen' | 'inline' | 'skeleton';
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-surface-2',
        className,
      )}
    />
  );
}

function SkeletonLayout() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-xl" />
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="h-3.5 w-32" />
        </div>
      </div>
      <SkeletonBlock className="h-48 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonBlock className="h-32 rounded-xl" />
        <SkeletonBlock className="h-32 rounded-xl" />
        <SkeletonBlock className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

export function LoadingScreen({ message, variant = 'fullscreen' }: LoadingScreenProps) {
  if (variant === 'skeleton') {
    return <SkeletonLayout />;
  }

  const containerClass =
    variant === 'fullscreen'
      ? 'fixed inset-0 z-50 flex items-center justify-center bg-canvas'
      : 'flex items-center justify-center py-20';

  return (
    <div className={containerClass} role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-cx-spin text-accent-600" />
        {message && (
          <p className="text-body text-text-secondary">{message}</p>
        )}
      </div>
    </div>
  );
}
