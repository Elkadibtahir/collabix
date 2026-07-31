import { cn } from '../../lib/cn';

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export interface ProgressProps {
  value: number;
  max?: number;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  accent: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  neutral: 'bg-border-strong',
  info: 'bg-info-500',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
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
