import { AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn';

export type AlertTone = 'error' | 'warning' | 'info' | 'success';

const toneStyles: Record<AlertTone, { container: string; text: string; icon: typeof AlertCircle }> = {
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
  success: {
    container: 'border-success-100 bg-success-50',
    text: 'text-success-700',
    icon: CheckCircle2,
  },
};

const iconColors: Record<AlertTone, string> = {
  error: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-info-500',
  success: 'text-success-500',
};

export interface AlertProps {
  tone: AlertTone;
  message: string;
}

export function Alert({ tone, message }: AlertProps) {
  const style = toneStyles[tone];
  const Icon = style.icon;
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 animate-fade-in',
        style.container,
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', iconColors[tone])} />
      <p className={cn('text-caption font-medium leading-relaxed', style.text)}>
        {message}
      </p>
    </div>
  );
}
