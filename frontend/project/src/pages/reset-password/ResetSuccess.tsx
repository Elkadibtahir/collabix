import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';

export function ResetSuccess() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-scale-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-success-100 blur-xl opacity-60" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-500">
            <CheckCircle2 className="h-9 w-9" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-display font-bold text-text-primary tracking-tight">Password Updated Successfully</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            Your password has been updated. You can now sign in using your new password.
          </p>
        </div>

        <Button
          size="lg"
          fullWidth
          rightIcon={<ArrowRight />}
          onClick={() => navigate('/login')}
          className="mt-2"
        >
          Go to Login
        </Button>
      </div>
    </AuthLayout>
  );
}
