import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RotateCw } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';

export function ResetInvalid() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <AlertTriangle className="h-9 w-9" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-display font-bold text-text-primary tracking-tight">Invalid Reset Link</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            This password reset link is no longer valid.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <Button
            size="lg"
            fullWidth
            variant="primary"
            leftIcon={<RotateCw />}
            onClick={() => navigate('/forgot-password')}
          >
            Request a New Reset Link
          </Button>
          <Button
            size="lg"
            fullWidth
            variant="outline"
            leftIcon={<ArrowLeft />}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
