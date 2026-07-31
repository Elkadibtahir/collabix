import { WifiOff, RefreshCw, X } from 'lucide-react';
import { AuthLayout } from '../layout/AuthLayout';
import { Button } from '../ui/Button';

export interface NetworkErrorPageProps {
  onDismiss?: () => void;
}

export function NetworkErrorPage({ onDismiss }: NetworkErrorPageProps) {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-500">
          <WifiOff className="h-9 w-9" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-display font-bold text-text-primary tracking-tight">Network Error</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            You're currently offline or unable to reach the server. Please check your connection and try again.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5 mt-2">
          <Button
            size="lg"
            fullWidth
            leftIcon={<RefreshCw />}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
          {onDismiss && (
            <Button
              size="lg"
              fullWidth
              variant="ghost"
              leftIcon={<X />}
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
