import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  closable?: boolean;
  onClose?: () => void;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-text-secondary border-border-subtle',
  accent: 'bg-accent-50 text-accent-700 dark:bg-accent-100 dark:text-accent-200 border-accent-200/60 dark:border-accent-200/20',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-700 border-success-200/60 dark:border-success-200/20',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-700 border-warning-200/60 dark:border-warning-200/20',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-700 border-danger-200/60 dark:border-danger-200/20',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-700 border-info-200/60 dark:border-info-200/20',
};

export function Tag({ tone = 'neutral', closable, onClose, className, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-caption font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
      {closable && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Remove tag"
          className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
