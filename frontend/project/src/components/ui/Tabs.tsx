import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  active?: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs({ items, active = items[0]?.id, onChange, className, size = 'md' }: TabsProps) {
  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-border-subtle', className)}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative inline-flex items-center gap-2 font-medium transition-colors duration-150 ease-cx',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-t-md',
              size === 'sm' ? 'px-2.5 py-2 text-caption' : 'px-3 py-2.5 text-body',
              isActive
                ? 'text-accent-600 dark:text-accent-400'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {item.icon && <span className="[&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-2xs font-semibold',
                  isActive
                    ? 'bg-accent-100 text-accent-700 dark:bg-accent-100 dark:text-accent-200'
                    : 'bg-surface-2 text-text-tertiary',
                )}
              >
                {item.count}
              </span>
            )}
            {isActive && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-accent-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
