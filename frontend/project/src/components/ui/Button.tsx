import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-accent-500 to-accent-700 text-white hover:from-accent-600 hover:to-accent-800 active:to-accent-800 shadow-[var(--shadow-glow-accent)] border border-accent-600/30 hover:shadow-cx-md',
  secondary:
    'bg-surface-2 text-text-primary hover:bg-border-subtle active:bg-border-default border border-border-subtle hover:shadow-cx-sm',
  outline:
    'bg-transparent text-text-primary border border-border-default hover:bg-white dark:hover:bg-surface-2 hover:border-border-strong hover:shadow-cx-sm',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-transparent',
  danger:
    'bg-gradient-to-b from-danger-500 to-danger-700 text-white hover:from-danger-600 hover:to-danger-700 active:to-danger-700 shadow-cx-xs border border-transparent',
  success:
    'bg-gradient-to-b from-success-500 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-800 shadow-cx-xs border border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-caption gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-body gap-2 rounded-[10px]',
  lg: 'h-11 px-5 text-body-lg gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', leftIcon, rightIcon, loading, fullWidth, className, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 ease-cx',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.98] hover:-translate-y-px',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-cx-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
        )}
        {!loading && leftIcon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{rightIcon}</span>}
      </button>
    );
  },
);
Button.displayName = 'Button';
