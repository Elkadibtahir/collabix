import { Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface ConversationMessageSystemProps {
  content: string;
  timestamp: string;
  variant?: 'info' | 'warning' | 'error';
}

const variantConfig = {
  info: {
    icon: Info,
    bg: 'bg-info-50 dark:bg-info-500/10',
    border: 'border-info-200 dark:border-info-500/30',
    text: 'text-info-700 dark:text-info-300',
    iconColor: 'text-info-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning-50 dark:bg-warning-500/10',
    border: 'border-warning-200 dark:border-warning-500/30',
    text: 'text-warning-700 dark:text-warning-300',
    iconColor: 'text-warning-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-danger-50 dark:bg-danger-500/10',
    border: 'border-danger-200 dark:border-danger-500/30',
    text: 'text-danger-700 dark:text-danger-300',
    iconColor: 'text-danger-500',
  },
};

export function ConversationMessageSystem({ content, timestamp, variant = 'info' }: ConversationMessageSystemProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="flex justify-center">
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5',
          config.bg,
          config.border,
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', config.iconColor)} />
        <div className="flex items-center gap-2">
          <p className={cn('text-caption', config.text)}>{content}</p>
          <span className="text-2xs text-text-tertiary">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
