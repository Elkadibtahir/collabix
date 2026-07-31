import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/cn';

export type AuthErrorTone = 'error' | 'warning' | 'info';

const toneConfig: Record<AuthErrorTone, { container: string; text: string; icon: typeof AlertCircle }> = {
  error: {
    container: 'border-danger-100 bg-danger-50',
    text: 'text-danger-700',
    icon: AlertCircle,
  },
  warning: {
    container: 'border-warning-100 bg-warning-50',
    text: 'text-warning-700',
    icon: AlertTriangle,
  },
  info: {
    container: 'border-info-100 bg-info-50',
    text: 'text-info-700',
    icon: Info,
  },
};

const iconColor: Record<AuthErrorTone, string> = {
  error: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-info-500',
};

export interface AuthErrorAlertProps {
  tone: AuthErrorTone;
  title?: string;
  message: string;
  className?: string;
}

export function AuthErrorAlert({ tone, title, message, className }: AuthErrorAlertProps) {
  const config = toneConfig[tone];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3.5',
        config.container,
        className,
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColor[tone])} />
      <div className="min-w-0">
        {title && (
          <p className={cn('text-caption font-semibold mb-0.5', config.text)}>
            {title}
          </p>
        )}
        <p className={cn('text-caption leading-relaxed', config.text)}>
          {message}
        </p>
      </div>
    </div>
  );
}

export interface AuthErrorListProps {
  errors: { title?: string; message: string; tone?: AuthErrorTone }[];
}

export function AuthErrorList({ errors }: AuthErrorListProps) {
  if (errors.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {errors.map((err, i) => (
        <AuthErrorAlert
          key={i}
          tone={err.tone ?? 'error'}
          title={err.title}
          message={err.message}
        />
      ))}
    </div>
  );
}
