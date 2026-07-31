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
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-text-tertiary [&>svg]:h-6 [&>svg]:w-6">
          {icon}
        </div>
      )}
      <h3 className="text-section font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-body text-text-tertiary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
