import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';

export function SessionExpiredPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-500">
          <Clock className="h-9 w-9" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-display font-bold text-text-primary tracking-tight">Session Expired</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            Your session has expired. Please sign in again to continue.
          </p>
        </div>

        <Button
          size="lg"
          fullWidth
          rightIcon={<ArrowRight />}
          onClick={() => navigate('/login')}
          className="mt-2"
        >
          Return to Login
        </Button>
      </div>
    </AuthLayout>
  );
}
