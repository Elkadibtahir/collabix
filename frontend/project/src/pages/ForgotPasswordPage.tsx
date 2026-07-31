import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MailCheck,
  RotateCw,
  LifeBuoy,
} from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthHeader, EmailField, Alert } from './auth';
import { LoadingButton } from './auth';
import { Button } from '../components/ui/Button';
import { authService } from '../services/auth-service';

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotFormData) {
    setServerError(null);
    try {
      await authService.forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(
          axiosErr.response?.data?.message ?? 'Something went wrong. Please try again later.',
        );
      } else {
        setServerError('A network error occurred. Please check your connection and try again.');
      }
    }
  }

  if (submittedEmail !== null) {
    return (
      <AuthLayout>
        <SuccessView
          email={submittedEmail}
          onLogin={() => navigate('/login')}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-7">
        <AuthHeader
          id="forgot-heading"
          title="Forgot your password?"
          subtitle="Enter the email associated with your account and we'll send you a secure link to reset your password."
        />

        {serverError && (
          <div role="alert" aria-live="assertive">
            <Alert tone="error" message={serverError} />
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
          aria-labelledby="forgot-heading"
        >
          <EmailField
            registration={register('email')}
            error={errors.email}
            disabled={isSubmitting}
            placeholder="name@example.com"
            autoFocus
          />

          <LoadingButton
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Sending reset instructions..."
            rightIcon={!isSubmitting ? <ArrowRight /> : undefined}
          >
            Send Reset Link
          </LoadingButton>
        </form>

        <div className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface px-3.5 py-3">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-text-tertiary" />
          <p className="text-caption text-text-secondary leading-relaxed">
            For security reasons, we never reveal whether an email address exists in our system. If the email is
            associated with an account, you'll receive reset instructions.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-border-subtle pt-5">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-body font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </button>
          <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <LifeBuoy className="h-3.5 w-3.5" />
            Need help? Contact your Workspace Administrator.
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

function SuccessView({ email, onLogin }: { email: string; onLogin: () => void }) {
  const [resending, setResending] = useState(false);

  async function resend() {
    setResending(true);
    try {
      await authService.forgotPassword({ email });
    } catch {
      // Silently fail — we never reveal whether the email exists
    }
    window.setTimeout(() => setResending(false), 1500);
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center animate-scale-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-success-100 blur-xl opacity-60" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-500">
          <MailCheck className="h-9 w-9" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-display font-bold text-text-primary tracking-tight">Check your inbox</h2>
        <p className="text-body text-text-secondary leading-relaxed max-w-sm">
          If an account exists for {email || 'this email address'}, you will receive a password reset link shortly.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2.5 mt-2">
        <Button size="lg" fullWidth variant="primary" leftIcon={<ArrowLeft />} onClick={onLogin}>
          Return to Login
        </Button>
        <Button
          size="lg"
          fullWidth
          variant="outline"
          loading={resending}
          onClick={resend}
          leftIcon={!resending ? <RotateCw /> : undefined}
        >
          {resending ? 'Sending...' : 'Resend Email'}
        </Button>
      </div>
    </div>
  );
}
