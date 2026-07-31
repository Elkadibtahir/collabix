import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Info,
  KeyRound,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { AuthHeader, Alert, PasswordStrengthIndicator } from '../auth';
import { LoadingButton } from '../auth';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth-service';

const requirements = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const activationSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required.')
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain one uppercase letter')
      .regex(/[a-z]/, 'Must contain one lowercase letter')
      .regex(/\d/, 'Must contain one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type ActivationFormData = z.infer<typeof activationSchema>;

export interface ActivationFormProps {
  token: string;
}

export function ActivationForm({ token }: ActivationFormProps) {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivationFormData>({
    resolver: zodResolver(activationSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const reqStates = useMemo(
    () => requirements.map((r) => ({ ...r, met: r.test(password ?? '') })),
    [password],
  );
  const allMet = reqStates.every((r) => r.met);
  const passwordsMatch = confirmPassword === password;
  const canSubmit = allMet && passwordsMatch && !!password && !!confirmPassword;

  async function onSubmit(data: ActivationFormData) {
    setServerError(null);
    try {
      await authService.activate({
        activationToken: token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      navigate('/activate/success', { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosErr.response?.status === 400) {
          navigate('/activate/invalid', { replace: true });
          return;
        }
        if (axiosErr.response?.status === 410) {
          navigate('/activate/expired', { replace: true });
          return;
        }
        setServerError(
          axiosErr.response?.data?.message ??
            'Activation failed. Please try again or contact your administrator.',
        );
      } else {
        setServerError(
          'A network error occurred. Please check your connection and try again.',
        );
      }
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300">
          <KeyRound className="h-5 w-5" />
        </span>
        <AuthHeader
          id="activate-heading"
          title="Activate your account"
          subtitle="The administrator has created your account. Choose a password to activate it."
        />
      </div>

      {serverError && (
        <div role="alert" aria-live="assertive">
          <Alert tone="error" message={serverError} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate aria-labelledby="activate-heading">
        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="activation-password" className="text-caption font-medium text-text-secondary">
            New Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
              <Lock />
            </span>
            <input
              {...register('password')}
              id="activation-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isSubmitting}
              autoFocus
              aria-invalid={!!errors.password}
              placeholder="Create a secure password"
              className={cn(
                'cx-input pl-9 pr-10 transition-colors',
                errors.password && 'border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgb(var(--danger-100))]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              disabled={isSubmitting}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors disabled:opacity-50"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Password strength */}
        <PasswordStrengthIndicator password={password ?? ''} />

        {/* Requirements checklist */}
        {password && (
          <div className="animate-fade-in">
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {reqStates.map((r) => (
                <li
                  key={r.key}
                  className={cn(
                    'flex items-center gap-2 text-caption transition-colors',
                    r.met ? 'text-success-600 dark:text-success-400' : 'text-text-tertiary',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors',
                      r.met ? 'bg-success-500 text-white' : 'bg-surface-2 text-text-tertiary',
                    )}
                  >
                    {r.met ? (
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    ) : (
                      <X className="h-2.5 w-2.5" strokeWidth={3} />
                    )}
                  </span>
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="activation-confirm" className="text-caption font-medium text-text-secondary">
            Confirm Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">
              <Lock />
            </span>
            <input
              {...register('confirmPassword')}
              id="activation-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
              placeholder="Re-enter your password"
              className={cn(
                'cx-input pl-9 pr-10 transition-colors',
                errors.confirmPassword && 'border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgb(var(--danger-100))]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              disabled={isSubmitting}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors disabled:opacity-50"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-caption text-danger-500" role="alert">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <LoadingButton
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Activating your account..."
            disabled={!canSubmit}
            rightIcon={!isSubmitting ? <ArrowRight /> : undefined}
          >
            Activate Account
          </LoadingButton>
          <Button
            type="button"
            size="lg"
            fullWidth
            variant="outline"
            leftIcon={<ArrowLeft />}
            disabled={isSubmitting}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </div>
      </form>

      {/* Activation info */}
      <div className="rounded-lg border border-border-subtle bg-surface px-4 py-3.5">
        <p className="text-caption font-medium text-text-secondary mb-2">After activating your account:</p>
        <ul className="flex flex-col gap-1.5">
          {[
            'Your password will be securely encrypted.',
            'Your account will become active.',
            'You will be able to sign in to Collabix.',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-caption text-text-secondary">
              <Check className="h-3.5 w-3.5 shrink-0 text-success-500" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Security reminder */}
      <div className="flex items-center justify-center gap-1.5 text-2xs text-text-tertiary">
        <Info className="h-3.5 w-3.5" />
        For security reasons, activation links are valid for a limited period of time.
      </div>
    </div>
  );
}
