import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface TimelineItem {
  id: string;
  icon?: ReactNode;
  tone?: Tone;
  title: string;
  description?: string;
  timestamp?: string;
  actor?: string;
}

const dotClasses: Record<Tone, string> = {
  accent: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  neutral: 'bg-border-strong',
};

const iconBg: Record<Tone, string> = {
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-100 dark:text-accent-200',
  success: 'bg-success-100 text-success-700 dark:bg-success-100 dark:text-success-700',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-100 dark:text-warning-700',
  danger: 'bg-danger-100 text-danger-700 dark:bg-danger-100 dark:text-danger-700',
  info: 'bg-info-100 text-info-700 dark:bg-info-100 dark:text-info-700',
  neutral: 'bg-surface-2 text-text-tertiary',
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn('relative', className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 bottom-0 w-px bg-border-subtle"
                aria-hidden="true"
              />
            )}
            <div className="relative z-10 shrink-0">
              {item.icon ? (
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full [&>svg]:h-4 [&>svg]:w-4',
                    iconBg[item.tone ?? 'neutral'],
                  )}
                >
                  {item.icon}
                </span>
              ) : (
                <span
                  className={cn(
                    'mt-1 flex h-8 w-8 items-center justify-center',
                  )}
                >
                  <span className={cn('h-2.5 w-2.5 rounded-full ring-4 ring-canvas dark:ring-surface', dotClasses[item.tone ?? 'neutral'])} />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-body font-medium text-text-primary">{item.title}</p>
                {item.timestamp && (
                  <time className="shrink-0 text-caption text-text-tertiary">{item.timestamp}</time>
                )}
              </div>
              {item.actor && (
                <p className="text-caption font-medium text-text-secondary">{item.actor}</p>
              )}
              {item.description && (
                <p className="mt-1 text-body text-text-tertiary">{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
