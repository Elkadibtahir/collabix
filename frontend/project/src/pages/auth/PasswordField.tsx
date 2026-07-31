import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

export interface PasswordFieldProps {
  registration: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  label?: string;
  showForgotPassword?: boolean;
  autoFocus?: boolean;
}

export function PasswordField({
  registration,
  error,
  disabled,
  placeholder = 'Enter your password',
  autoComplete = 'current-password',
  label = 'Password',
  showForgotPassword,
  autoFocus,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = registration.name ?? 'password';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-caption font-medium text-text-secondary">
          {label}
        </label>
        {showForgotPassword && (
          <a
            href="/forgot-password"
            className="text-body font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors"
          >
            Forgot password?
          </a>
        )}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
          <Lock />
        </span>
        <input
          {...registration}
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          placeholder={placeholder}
          className={cn(
            'cx-input pl-9 pr-10 transition-colors',
            error && 'border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgb(var(--danger-100))]',
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors disabled:opacity-50"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="text-caption text-danger-500" role="alert">{error.message}</p>
      )}
    </div>
  );
}
