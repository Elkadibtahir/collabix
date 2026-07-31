import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  containerClassName?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, helperText, errorText, invalid, className, containerClassName, id, options, children, ...props },
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
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            aria-invalid={showError}
            className={cn(
              'cx-input cursor-pointer appearance-none pr-9',
              showError && 'border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgb(var(--danger-100))]',
              className,
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        </div>
        {showError ? (
          <p className="mt-1.5 text-caption text-danger-500">{errorText}</p>
        ) : (
          helperText && <p className="mt-1.5 text-caption text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
