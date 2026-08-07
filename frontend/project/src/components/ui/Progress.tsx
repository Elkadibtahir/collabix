import { cn } from '../../lib/cn';

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export interface ProgressProps {
  value: number;
  max?: number;
  tone?: Tone;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  accent: 'bg-gradient-to-r from-accent-500 to-accent-400',
  success: 'bg-gradient-to-r from-success-500 to-emerald-500',
  warning: 'bg-gradient-to-r from-warning-500 to-amber-400',
  danger: 'bg-gradient-to-r from-danger-500 to-rose-500',
  neutral: 'bg-gradient-to-r from-border-strong to-border-default',
  info: 'bg-gradient-to-r from-info-500 to-blue-500',
};

const sizeClasses = {
  xs: 'h-0.5',
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
};

export function Progress({ value, max = 100, tone = 'accent', size = 'md', showLabel, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${Math.round(pct)}%`}
        className={cn('w-full overflow-hidden rounded-full bg-surface-2', sizeClasses[size])}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-cx', toneClasses[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-caption text-text-tertiary text-right">{Math.round(pct)}%</div>
      )}
    </div>
  );
}
