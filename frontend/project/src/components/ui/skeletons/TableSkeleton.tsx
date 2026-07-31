import { cn } from '../../../lib/cn';
import { Skeleton } from '../Skeleton';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-elevated overflow-hidden', className)}>
      <div className="flex items-center gap-4 border-b border-border-subtle bg-surface px-5 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={cn('flex items-center gap-4 px-5 py-4', r < rows - 1 && 'border-b border-border-subtle')}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={cn('h-4', c === 0 ? 'flex-[2]' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}
