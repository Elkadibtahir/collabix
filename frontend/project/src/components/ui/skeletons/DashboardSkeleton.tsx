import { cn } from '../../../lib/cn';
import { Skeleton } from '../Skeleton';
import { KPICardSkeleton, ChartSkeleton } from './CardSkeleton';
import { ListSkeleton } from './ListSkeleton';

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-elevated p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <ListSkeleton items={3} />
        </div>
        <div className="rounded-xl border border-border-subtle bg-elevated p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <ListSkeleton items={3} />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
