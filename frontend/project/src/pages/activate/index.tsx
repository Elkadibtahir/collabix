import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { ActivationForm } from './ActivationForm';
import { authService } from '../../services/auth-service';
import { LoadingScreen } from '../auth/LoadingScreen';

type TokenStatus = 'loading' | 'valid' | 'invalid' | 'expired';

export function ActivationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<TokenStatus>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    let cancelled = false;

    async function validate() {
      try {
        await authService.validateActivationToken(token);
        if (!cancelled) {
          setStatus('valid');
        }
      } catch (err: unknown) {
        if (!cancelled) {
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr.response?.status === 410 || axiosErr.response?.status === 400) {
              setStatus('expired');
            } else {
              setStatus('invalid');
            }
          } else {
            setStatus('invalid');
          }
        }
      }
    }

    validate();
    return () => { cancelled = true; };
  }, [token, navigate]);

  useEffect(() => {
    if (status === 'invalid') {
      navigate('/activate/invalid', { replace: true });
    } else if (status === 'expired') {
      navigate('/activate/expired', { replace: true });
    }
  }, [status, navigate]);

  if (status === 'loading' || !token) {
    return (
      <AuthLayout>
        <LoadingScreen variant="inline" message="Validating your activation link..." />
      </AuthLayout>
    );
  }

  if (status !== 'valid') {
    return null;
  }

  return (
    <AuthLayout>
      <ActivationForm token={token} />
    </AuthLayout>
  );
}
