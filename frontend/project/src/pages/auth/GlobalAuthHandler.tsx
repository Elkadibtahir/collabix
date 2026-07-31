import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { SessionExpiredDialog } from './SessionExpiredDialog';

export function GlobalAuthHandler() {
  const { sessionExpired, clearSessionExpiry, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionExpired) {
      signOut();
    }
  }, [sessionExpired, signOut]);

  return (
    <SessionExpiredDialog
      open={sessionExpired}
      onDismiss={() => {
        clearSessionExpiry();
        navigate('/login');
      }}
    />
  );
}
