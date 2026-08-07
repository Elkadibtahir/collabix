import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  invalid?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      successText,
      leftIcon,
      rightIcon,
      invalid,
      className,
      containerClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;
    const showError = invalid || !!errorText;
    const showSuccess = !showError && !!successText;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-caption font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={showError}
            className={cn(
              'cx-input transition-colors',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              showError && 'border-danger-500 bg-danger-50/30 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgb(var(--danger-100))] dark:bg-danger-500/5',
              showSuccess && 'border-success-500 focus:border-success-500 focus:shadow-[0_0_0_3px_rgb(var(--success-100))]',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
              {rightIcon}
            </span>
          )}
        </div>
        {showError && (
          <p className="mt-1.5 text-caption text-danger-500">{errorText}</p>
        )}
        {showSuccess && (
          <p className="mt-1.5 text-caption text-success-700 dark:text-success-500">{successText}</p>
        )}
        {!showError && !showSuccess && helperText && (
          <p className="mt-1.5 text-caption text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
