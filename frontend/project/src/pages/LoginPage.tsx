import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Info } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthHeader, AuthFooter, EmailField, PasswordField, Alert } from './auth';
import { LoadingButton } from './auth';
import { useAuth } from '../lib/auth-context';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean(),
});

type LoginFormData = z.input<typeof loginSchema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setServerError(null);
    try {
      await signIn({
        email: data.email,
        password: data.password,
        remember: data.remember,
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message ?? 'Invalid email or password. Please try again.');
      } else {
        setServerError('A network error occurred. Please check your connection and try again.');
      }
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-7">
        <AuthHeader
          id="login-heading"
          title="Welcome back"
          subtitle="Sign in to access your workspace and continue collaborating with your team."
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
          aria-labelledby="login-heading"
        >
          <EmailField
            registration={register('email')}
            error={errors.email}
            disabled={isSubmitting}
            autoFocus
          />

          <PasswordField
            registration={register('password')}
            error={errors.password}
            disabled={isSubmitting}
            showForgotPassword
          />

          {/* Remember + Forgot row with checkbox */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('remember')}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-border-default text-accent-600 focus:ring-2 focus:ring-accent-500/20 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-body text-text-secondary select-none">Remember me</span>
            </label>
          </div>

          <LoadingButton
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Signing you in..."
            rightIcon={!isSubmitting ? <ArrowRight /> : undefined}
          >
            Sign in
          </LoadingButton>
        </form>

        <div className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface px-3.5 py-3">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-text-tertiary" />
          <p className="text-caption text-text-secondary leading-relaxed">
            Your account must be created by your administrator before you can sign in. If you have
            received an invitation email,{' '}
            <a href="/activate" className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors">
              activate your account
            </a>{' '}
            before attempting to log in.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-center">
          <p className="text-body font-medium text-text-primary">Need access?</p>
          <p className="text-caption text-text-tertiary">
            Please contact your Workspace administrator.
          </p>
        </div>

        <div className="border-t border-border-subtle pt-5">
          <p className="text-caption text-text-secondary text-center">
            Need help accessing your account? Contact your IT administrator or your Workspace administrator.
          </p>
        </div>

        <AuthFooter />
      </div>
    </AuthLayout>
  );
}
