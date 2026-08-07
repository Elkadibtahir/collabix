import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AnimatedCounter } from './AnimatedCounter';

export type StatTone =
  | 'accent'
  | 'blue'
  | 'green'
  | 'teal'
  | 'purple'
  | 'orange'
  | 'amber'
  | 'cyan'
  | 'indigo'
  | 'emerald'
  | 'rose'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

const iconContainer: Record<StatTone, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-600/15 dark:text-accent-300',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-600/15 dark:text-blue-700',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-500',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-500',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-500',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-500',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-500',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-500',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-500',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-500',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-500',
  success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/15 dark:text-danger-500',
  info: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-500',
};

const topAccent: Record<StatTone, string> = {
  accent: 'from-accent-500/60',
  blue: 'from-blue-500/60',
  green: 'from-emerald-500/60',
  teal: 'from-teal-500/60',
  purple: 'from-purple-500/60',
  orange: 'from-orange-500/60',
  amber: 'from-amber-500/60',
  cyan: 'from-cyan-500/60',
  indigo: 'from-indigo-500/60',
  emerald: 'from-emerald-500/60',
  rose: 'from-rose-500/60',
  success: 'from-success-500/60',
  warning: 'from-warning-500/60',
  danger: 'from-danger-500/60',
  info: 'from-info-500/60',
};

const lightGradient: Record<StatTone, string> = {
  accent: 'bg-accent-50/40 dark:bg-accent-200/5',
  blue: 'bg-blue-50/40 dark:bg-blue-600/5',
  green: 'bg-emerald-50/40 dark:bg-emerald-500/5',
  teal: 'bg-teal-50/40 dark:bg-teal-500/5',
  purple: 'bg-purple-50/40 dark:bg-purple-500/5',
  orange: 'bg-orange-50/40 dark:bg-orange-500/5',
  amber: 'bg-amber-50/40 dark:bg-amber-500/5',
  cyan: 'bg-cyan-50/40 dark:bg-cyan-500/5',
  indigo: 'bg-indigo-50/40 dark:bg-indigo-500/5',
  emerald: 'bg-emerald-50/40 dark:bg-emerald-500/5',
  rose: 'bg-rose-50/40 dark:bg-rose-500/5',
  success: 'bg-success-50/40 dark:bg-success-500/5',
  warning: 'bg-warning-50/40 dark:bg-warning-500/5',
  danger: 'bg-danger-50/40 dark:bg-danger-500/5',
  info: 'bg-info-50/40 dark:bg-info-500/5',
};

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: StatTone;
  subtitle?: string;
  animate?: boolean;
  className?: string;
}

export function StatCard({ icon, label, value, tone = 'accent', subtitle, animate = true, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'cx-card cx-card-hover animate-pop relative overflow-hidden p-4',
        className,
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent', lightGradient[tone])} />
      <div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 blur-md" />
      <div className="relative flex items-center gap-3.5">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5', iconContainer[tone])}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-text-primary">
            {animate ? <AnimatedCounter value={value} /> : value.toLocaleString()}
          </p>
          {subtitle && <p className="mt-0.5 truncate text-2xs text-text-tertiary">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}