import { Mail } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface EmailFieldProps {
  registration: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function EmailField({ registration, error, disabled, placeholder = 'name@example.com', autoFocus }: EmailFieldProps) {
  const id = registration.name ?? 'email';
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-medium text-text-secondary">
        Email
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
          <Mail />
        </span>
        <input
          {...registration}
          id={id}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          placeholder={placeholder}
          className={cn(
            'cx-input pl-9 transition-colors',
            error && 'border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgb(var(--danger-100))]',
          )}
        />
      </div>
      {error && (
        <p className="text-caption text-danger-500" role="alert">{error.message}</p>
      )}
    </div>
  );
}
