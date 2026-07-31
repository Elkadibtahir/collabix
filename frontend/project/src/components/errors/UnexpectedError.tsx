import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

export interface UnexpectedErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function UnexpectedError({ message = 'Something went wrong', onRetry, className, compact }: UnexpectedErrorProps) {
  if (compact) {
    return (
      <div className={cn('flex flex-col items-center justify-center px-6 py-8 text-center', className)}>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-50 text-danger-500 mb-3 [&>svg]:h-5 [&>svg]:w-5">
          <AlertTriangle />
        </span>
        <p className="text-body font-medium text-text-primary mb-1">{message}</p>
        {onRetry && (
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw />} onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500 mb-4 [&>svg]:h-6 [&>svg]:w-6">
        <AlertTriangle />
      </span>
      <h3 className="text-section font-semibold text-text-primary mb-1">Unexpected Error</h3>
      <p className="text-body text-text-tertiary max-w-sm">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="primary" size="sm" leftIcon={<RefreshCw />} onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
