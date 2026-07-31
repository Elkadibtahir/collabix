import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, LifeBuoy, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';

export function ActivationExpired() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-500">
          <Clock className="h-9 w-9" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-display font-bold text-text-primary tracking-tight">Activation Link Expired</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            Your activation link has expired. Please ask your administrator to generate a new activation email.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <Button
            size="lg"
            fullWidth
            variant="primary"
            leftIcon={<ArrowLeft />}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
          <Button size="lg" fullWidth variant="outline" leftIcon={<LifeBuoy />}>
            Contact Administrator
          </Button>
        </div>

        <div className="flex items-center gap-1.5 text-2xs text-text-tertiary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Activation links are single-use and time-limited for security.
        </div>
      </div>
    </AuthLayout>
  );
}
