import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface ErrorCardProps {
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorCard({ title, description, onRetry, retryLabel = 'Try Again' }: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <AlertTriangle className="h-9 w-9" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-display font-bold text-text-primary tracking-tight">{title}</h2>
        <p className="text-body text-text-secondary leading-relaxed max-w-sm">{description}</p>
      </div>
      {onRetry && (
        <Button size="lg" fullWidth variant="primary" onClick={onRetry} leftIcon={<RotateCw />}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
