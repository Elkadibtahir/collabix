import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface AIActivityItem {
  id: string;
  icon: ReactNode;
  title: string;
  description?: string;
  timestamp: string;
}

export interface AIActivityCardProps {
  items: AIActivityItem[];
  className?: string;
}

export function AIActivityCard({ items, className }: AIActivityCardProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            'flex items-start gap-3 py-3',
            i !== items.length - 1 && 'border-b border-border-subtle',
          )}
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-secondary [&>svg]:h-4 [&>svg]:w-4">
            {item.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-text-primary">{item.title}</p>
            {item.description && (
              <p className="mt-0.5 text-caption text-text-tertiary line-clamp-1">{item.description}</p>
            )}
          </div>
          <span className="shrink-0 text-2xs text-text-tertiary">{item.timestamp}</span>
        </div>
      ))}
    </div>
  );
}
