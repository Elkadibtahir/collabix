import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { promptCategories, type PromptCategoryId } from './PromptTypes';

export interface PromptCategoryNavProps {
  active: PromptCategoryId | 'all';
  onChange: (category: PromptCategoryId | 'all') => void;
}

export function PromptCategoryNav({ active, onChange }: PromptCategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  }

  const allCategories = [{ id: 'all' as const, label: 'All Prompts', icon: null }, ...promptCategories];

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-elevated border border-border-subtle shadow-cx-sm text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity -ml-3"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none pb-1"
      >
        {allCategories.map((cat) => {
          const isActive = active === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-caption font-medium transition-all whitespace-nowrap',
                isActive
                  ? 'bg-accent-600 text-white shadow-cx-xs'
                  : 'bg-surface text-text-secondary border border-border-subtle hover:border-accent-300 hover:text-accent-600 dark:hover:text-accent-300 dark:hover:border-accent-700',
              )}
            >
              {Icon && <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-white' : 'text-text-tertiary')} />}
              {cat.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-elevated border border-border-subtle shadow-cx-sm text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity -mr-3"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
