import type { FieldErrors } from 'react-hook-form';

export interface FormValidationMessagesProps {
  errors: FieldErrors;
  touchedFields?: Record<string, boolean>;
}

export function FormValidationMessages({ errors }: FormValidationMessagesProps) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {entries.map(([field, error]) => {
        if (!error || typeof error === 'string') return null;
        const message = (error as { message?: string }).message;
        if (!message) return null;
        return (
          <p key={field} className="text-caption text-danger-500" role="alert">
            {message}
          </p>
        );
      })}
    </div>
  );
}
