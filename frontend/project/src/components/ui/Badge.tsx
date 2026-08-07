import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
type Variant = 'soft' | 'solid' | 'outline' | 'ghost' | 'primary';

type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: Variant;
  size?: BadgeSize;
  dot?: boolean;
}

const toneSoft: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-text-secondary dark:bg-border-subtle/50 dark:text-text-secondary',
  accent: 'bg-accent-50 text-accent-700 border border-accent-200/60 dark:bg-accent-100 dark:text-accent-200 dark:border-accent-200/20',
  success: 'bg-success-50 text-success-700 border border-success-200/60 dark:bg-success-100 dark:text-success-700 dark:border-success-200/20',
  warning: 'bg-warning-50 text-warning-700 border border-warning-200/60 dark:bg-warning-100 dark:text-warning-700 dark:border-warning-200/20',
  danger: 'bg-danger-50 text-danger-700 border border-danger-200/60 dark:bg-danger-100 dark:text-danger-700 dark:border-danger-200/20',
  info: 'bg-info-50 text-info-700 border border-info-200/60 dark:bg-info-100 dark:text-info-700 dark:border-info-200/20',
};

const toneSolid: Record<Tone, string> = {
  neutral: 'bg-border-default text-white',
  accent: 'bg-gradient-to-b from-accent-500 to-accent-600 text-white',
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

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2 py-1 text-2xs',
  md: 'px-2.5 py-1 text-2xs',
};

export function Badge({ tone = 'neutral', variant = 'soft', size = 'md', dot, className, children, ...props }: BadgeProps) {
  const toneClass =
    variant === 'solid' || variant === 'primary'
      ? toneSolid[tone]
      : variant === 'outline' || variant === 'ghost'
      ? toneOutline[tone]
      : toneSoft[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full text-2xs font-medium leading-[16px] whitespace-nowrap',
        'shadow-[0_1px_2px_rgb(0_0_0/0.04)]',
        sizeClasses[size],
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
