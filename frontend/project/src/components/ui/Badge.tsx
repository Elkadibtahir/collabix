import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
type Variant = 'soft' | 'solid' | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: Variant;
  dot?: boolean;
}

const toneSoft: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-text-secondary',
  accent: 'bg-accent-50 text-accent-700 dark:bg-accent-100 dark:text-accent-200',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-700',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-700',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-700',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-700',
};

const toneSolid: Record<Tone, string> = {
  neutral: 'bg-border-default text-white',
  accent: 'bg-accent-600 text-white',
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-500 text-white',
  danger: 'bg-danger-500 text-white',
  info: 'bg-info-500 text-white',
};

const toneOutline: Record<Tone, string> = {
  neutral: 'border border-border-default text-text-secondary',
  accent: 'border border-accent-300 text-accent-700 dark:text-accent-300',
  success: 'border border-success-500 text-success-700 dark:text-success-500',
  warning: 'border border-warning-500 text-warning-700 dark:text-warning-500',
  danger: 'border border-danger-500 text-danger-700 dark:text-danger-500',
  info: 'border border-info-500 text-info-700 dark:text-info-500',
};

const dotColor: Record<Tone, string> = {
  neutral: 'bg-text-tertiary',
  accent: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
};

export function Badge({ tone = 'neutral', variant = 'soft', dot, className, children, ...props }: BadgeProps) {
  const toneClass =
    variant === 'solid' ? toneSolid[tone] : variant === 'outline' ? toneOutline[tone] : toneSoft[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-2xs font-medium leading-[16px] whitespace-nowrap',
        toneClass,
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor[tone])} />}
      {children}
    </span>
  );
}
