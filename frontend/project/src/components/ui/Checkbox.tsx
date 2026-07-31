import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  helperText?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, indeterminate, className, id, checked, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className={cn('flex items-start gap-2.5', className)}>
        <div className="relative flex h-4 w-4 shrink-0 items-center justify-center pt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            aria-checked={indeterminate ? 'mixed' : checked}
            className="peer absolute h-4 w-4 cursor-pointer appearance-none rounded border border-border-default bg-canvas transition-colors checked:border-accent-600 checked:bg-accent-600 indeterminate:border-accent-600 indeterminate:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas"
            {...props}
          />
          <span className="pointer-events-none absolute flex h-4 w-4 items-center justify-center text-white opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100">
            {indeterminate ? (
              <span className="h-0.5 w-2 rounded-full bg-white" />
            ) : (
              <Check className="h-3 w-3" strokeWidth={3} />
            )}
          </span>
        </div>
        {(label || helperText) && (
          <div className="min-w-0">
            {label && (
              <label htmlFor={inputId} className="cursor-pointer text-body text-text-primary">
                {label}
              </label>
            )}
            {helperText && <p className="text-caption text-text-tertiary">{helperText}</p>}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';
