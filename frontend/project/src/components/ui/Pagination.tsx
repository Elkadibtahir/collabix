import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const pages = getPages(page, totalPages);
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle text-text-secondary hover:bg-surface-2 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-text-tertiary">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-caption font-medium transition-colors',
              p === page
                ? 'bg-accent-600 text-white border border-accent-600'
                : 'text-text-secondary border border-transparent hover:bg-surface-2',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle text-text-secondary hover:bg-surface-2 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
