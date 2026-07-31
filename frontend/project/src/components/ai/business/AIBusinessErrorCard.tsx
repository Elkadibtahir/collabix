import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '../../ui/Button';

interface AIBusinessErrorCardProps {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export function AIBusinessErrorCard({ message, onRetry, onDismiss }: AIBusinessErrorCardProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border-subtle bg-danger-50 dark:bg-danger-500/10 px-6 py-10 text-center"
      role="alert"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-100 dark:bg-danger-500/20 text-danger-500">
        <AlertCircle className="h-6 w-6" />
      </span>
      <div>
        <h3 className="text-section font-semibold text-text-primary">Unable to complete</h3>
        <p className="mt-1 max-w-sm text-body text-text-secondary">{message}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" leftIcon={<RefreshCw />} onClick={onRetry}>
          Try Again
        </Button>
        <Button variant="ghost" size="sm" leftIcon={<X />} onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
