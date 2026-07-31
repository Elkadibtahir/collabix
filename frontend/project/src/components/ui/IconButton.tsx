import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  label: string;
  children: ReactNode;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
};

const variantClasses = {
  ghost: 'text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-transparent',
  outline: 'text-text-primary border border-border-default hover:bg-surface hover:border-border-strong',
  solid: 'bg-accent-600 text-white hover:bg-accent-700 border border-transparent',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', variant = 'ghost', label, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-all duration-150 ease-cx',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96]',
          '[&>svg]:h-[18px] [&>svg]:w-[18px]',
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
