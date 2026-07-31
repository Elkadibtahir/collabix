import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  helperText?: string;
}

export function RadioGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div role="radiogroup" className={cn('flex flex-col gap-2.5', className)}>{children}</div>;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className={cn('flex items-start gap-2.5', className)}>
        <div className="relative flex h-4 w-4 shrink-0 items-center justify-center pt-0.5">
          <input
            ref={ref}
            type="radio"
            id={inputId}
            className="peer absolute h-4 w-4 cursor-pointer appearance-none rounded-full border border-border-default bg-canvas transition-colors checked:border-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas"
            {...props}
          />
          <span className="pointer-events-none absolute h-2 w-2 rounded-full bg-accent-600 opacity-0 peer-checked:opacity-100" />
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
Radio.displayName = 'Radio';
