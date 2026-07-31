import { useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { ResetForm } from './ResetForm';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <AuthLayout>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-body text-text-secondary text-center py-8">
          Missing reset token. Please use the link from your email.
        </p>
      )}
    </AuthLayout>
  );
}
