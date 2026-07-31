import { cn } from '../../../lib/cn';
import { Skeleton } from '../Skeleton';

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-elevated p-5', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

export function KPICardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-elevated p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-elevated p-5', className)}>
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="flex justify-between mt-3">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}
