import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, LifeBuoy, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';

export function ActivationInvalid() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <AlertTriangle className="h-9 w-9" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-display font-bold text-text-primary tracking-tight">Invalid Activation Link</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            This activation link is invalid. This can happen if:
          </p>
        </div>

        <ul className="w-full space-y-2 text-left">
          {[
            'The token has already been used.',
            'The token is incorrect.',
            'The link is malformed.',
          ].map((reason) => (
            <li key={reason} className="flex items-start gap-2.5 text-body text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-tertiary" />
              {reason}
            </li>
          ))}
        </ul>

        <div className="flex w-full flex-col gap-2.5">
          <Button size="lg" fullWidth variant="primary" leftIcon={<LifeBuoy />}>
            Contact your administrator
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

        <div className="flex items-center gap-1.5 text-2xs text-text-tertiary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Activation links are single-use and time-limited for security.
        </div>
      </div>
    </AuthLayout>
  );
}
