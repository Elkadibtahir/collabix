import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, LayoutGrid } from 'lucide-react';
import { AuthLayout } from '../layout/AuthLayout';
import { Button } from '../ui/Button';

export interface ErrorPageProps {
  title?: string;
  description?: string;
}

export function ErrorPage({ title = 'Internal Server Error', description = 'Something went wrong on our side. Please try again.' }: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <AlertTriangle className="h-9 w-9" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-hero font-bold text-text-primary tracking-tight">500</span>
          </div>
          <h2 className="text-display font-bold text-text-primary tracking-tight">{title}</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            {description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5 mt-2">
          <Button
            size="lg"
            fullWidth
            leftIcon={<RefreshCw />}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          <Button
            size="lg"
            fullWidth
            variant="outline"
            leftIcon={<LayoutGrid />}
            onClick={() => navigate('/app/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
