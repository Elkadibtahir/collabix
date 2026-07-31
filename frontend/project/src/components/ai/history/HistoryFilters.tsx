import { cn } from '../../../lib/cn';
import { filterOptions, timeFilterOptions, type ActivityCategory } from './HistoryTypes';

interface HistoryFiltersProps {
  categoryActive: ActivityCategory | 'all';
  timeActive: string;
  onCategoryChange: (cat: ActivityCategory | 'all') => void;
  onTimeChange: (time: string) => void;
}

export function HistoryFilters({ categoryActive, timeActive, onCategoryChange, onTimeChange }: HistoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {filterOptions.map((opt) => {
          const isActive = categoryActive === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onCategoryChange(opt.id === 'all' ? 'all' : (opt.id as ActivityCategory))}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-caption font-medium transition-all whitespace-nowrap',
                isActive
                  ? 'bg-accent-600 text-white shadow-cx-xs'
                  : 'bg-surface text-text-secondary border border-border-subtle hover:border-accent-300 hover:text-accent-600 dark:hover:text-accent-300 dark:hover:border-accent-700',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {timeFilterOptions.map((opt) => {
          const isActive = timeActive === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onTimeChange(opt.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-2xs font-medium transition-all whitespace-nowrap',
                isActive
                  ? 'bg-surface-2 text-text-primary border border-border-subtle'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
