import { useState } from 'react';
import { cn } from '../../lib/cn';
import { type ActivityFilter } from './ActivityTypes';

interface ActivityFiltersProps {
  filters: { id: ActivityFilter; label: string }[];
  active: ActivityFilter;
  onSelect: (id: ActivityFilter) => void;
}

export function ActivityFilters({ filters, active, onSelect }: ActivityFiltersProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? filters : filters.slice(0, 8);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {displayed.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onSelect(f.id)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-caption font-medium transition-all duration-150 border',
            active === f.id
              ? 'bg-accent-600 text-white border-accent-600 shadow-cx-sm'
              : 'bg-surface text-text-secondary border-border-subtle hover:bg-surface-2 hover:text-text-primary hover:border-border-default',
          )}
        >
          {f.label}
        </button>
      ))}
      {filters.length > 8 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="rounded-full px-3.5 py-1.5 text-caption font-medium text-accent-600 dark:text-accent-400 hover:underline transition-colors"
        >
          {showAll ? 'Show less' : `+${filters.length - 8} more`}
        </button>
      )}
    </div>
  );
}
