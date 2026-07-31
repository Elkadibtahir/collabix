import { cn } from '../../../lib/cn';
import { Skeleton } from '../Skeleton';

export interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-5', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3.5 w-20 mb-1.5" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-28 rounded-lg" />
    </div>
  );
}

export function DialogSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-52" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-20 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
