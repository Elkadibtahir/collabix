import { AlertCircle, WifiOff, Clock, AlertTriangle, CloudOff, RefreshCw, X, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { Button } from '../../ui/Button';
import { ErrorConfig, type ErrorType } from './ConversationTypes';

interface ConversationErrorCardProps {
  type: ErrorType;
  onRetry: () => void;
  onDismiss: () => void;
}

const errorIcons: Record<ErrorType, React.ReactNode> = {
  generation_failed: <AlertCircle className="h-8 w-8" />,
  connection_lost: <WifiOff className="h-8 w-8" />,
  timeout: <Clock className="h-8 w-8" />,
  unexpected: <AlertTriangle className="h-8 w-8" />,
  unavailable: <CloudOff className="h-8 w-8" />,
};

const errorIconColors: Record<ErrorType, string> = {
  generation_failed: 'text-danger-500',
  connection_lost: 'text-warning-500',
  timeout: 'text-warning-500',
  unexpected: 'text-danger-500',
  unavailable: 'text-text-tertiary',
};

const errorBgColors: Record<ErrorType, string> = {
  generation_failed: 'bg-danger-50 dark:bg-danger-500/10',
  connection_lost: 'bg-warning-50 dark:bg-warning-500/10',
  timeout: 'bg-warning-50 dark:bg-warning-500/10',
  unexpected: 'bg-danger-50 dark:bg-danger-500/10',
  unavailable: 'bg-surface-2',
};

export function ConversationErrorCard({ type, onRetry, onDismiss }: ConversationErrorCardProps) {
  const navigate = useNavigate();
  const config = ErrorConfig[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-border-subtle px-6 py-10 text-center',
        errorBgColors[type],
      )}
      role="alert"
    >
      <span className={errorIconColors[type]}>{errorIcons[type]}</span>
      <div>
        <h3 className="text-body font-semibold text-text-primary">{config.title}</h3>
        <p className="mt-1 max-w-sm text-caption text-text-secondary">{config.description}</p>
      </div>
      <div className="flex items-center gap-3">
        {config.canRetry && (
          <Button variant="primary" size="sm" leftIcon={<RefreshCw />} onClick={onRetry}>
            Try Again
          </Button>
        )}
        {config.canDismiss && (
          <Button variant="ghost" size="sm" leftIcon={<X />} onClick={onDismiss}>
            Dismiss
          </Button>
        )}
        <Button variant="ghost" size="sm" leftIcon={<Home />} onClick={() => navigate('/app/ai')}>
          Return Home
        </Button>
      </div>
    </div>
  );
}
