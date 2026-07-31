import { cn } from '../../../lib/cn';
import { Skeleton } from '../Skeleton';

export interface ListSkeletonProps {
  items?: number;
  className?: string;
}

export function ListSkeleton({ items = 4, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-elevated p-4">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-4 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function KanbanColumnSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border-subtle bg-elevated p-4 space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-10 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
