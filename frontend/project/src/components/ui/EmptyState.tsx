import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {icon && (
        <div className="relative mb-5">
          <div className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-br from-accent-200/40 via-accent-100/40 to-transparent dark:from-accent-200/20 blur-lg" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-elevated text-accent-500 shadow-cx-md dark:text-accent-400 [&>svg]:h-6 [&>svg]:w-6">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-section font-bold text-text-primary tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-body text-text-tertiary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
