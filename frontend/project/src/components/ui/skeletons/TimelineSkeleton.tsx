import { cn } from '../../../lib/cn';
import { Skeleton } from '../Skeleton';

export interface TimelineSkeletonProps {
  items?: number;
  className?: string;
}

export function TimelineSkeleton({ items = 5, className }: TimelineSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            {i < items - 1 && <div className="mt-1 w-px flex-1 bg-border-subtle" />}
          </div>
          <div className="flex-1 pb-4 space-y-1.5">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivitySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-border-subtle bg-elevated p-4">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}
