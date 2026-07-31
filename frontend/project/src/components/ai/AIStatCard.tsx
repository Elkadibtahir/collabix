import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface AIStatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  description?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

const toneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

export function AIStatCard({ icon, label, value, description, tone = 'accent', className }: AIStatCardProps) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-elevated p-4 hover:shadow-cx-md transition-shadow duration-200', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
          <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{value}</p>
          {description && <p className="mt-1 text-2xs text-text-tertiary">{description}</p>}
        </div>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]', toneBg[tone])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
