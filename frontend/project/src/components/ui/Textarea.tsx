import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, helperText, errorText, invalid, className, containerClassName, id, ...props },
    ref,
  ) => {
    const inputId = id || props.name;
    const showError = invalid || !!errorText;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-caption font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={showError}
          className={cn(
            'cx-input resize-y min-h-[88px] leading-relaxed',
            showError && 'border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgb(var(--danger-100))]',
            className,
          )}
          {...props}
        />
        {showError ? (
          <p className="mt-1.5 text-caption text-danger-500">{errorText}</p>
        ) : (
          helperText && <p className="mt-1.5 text-caption text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
