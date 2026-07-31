import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth-service';
import type { LoginPayload, LoginResult } from './auth-context';
import { useAuth } from './auth-context';

/** POST /auth/login — authenticate user, receive JWT pair */
export function useLoginMutation() {
  const { signIn } = useAuth();

  return useMutation<LoginResult, Error, LoginPayload>({
    mutationFn: (payload) => signIn(payload),
  });
}

/** POST /auth/logout — invalidate refresh token server-side */
export function useLogoutMutation() {
  const { signOut } = useAuth();

  return useMutation<void, Error, void>({
    mutationFn: () => {
      signOut();
      return Promise.resolve();
    },
  });
}

/** POST /auth/activate — activate account with token + password */
export function useActivateMutation() {
  return useMutation<void, Error, { activationToken: string; password: string; confirmPassword: string }>({
    mutationFn: (payload) =>
      authService.activate(payload),
  });
}

/** POST /auth/forgot-password — request password reset email */
export function useForgotPasswordMutation() {
  return useMutation<void, Error, { email: string }>({
    mutationFn: (payload) =>
      authService.forgotPassword(payload),
  });
}

/** POST /auth/reset-password — set new password with reset token */
export function useResetPasswordMutation() {
  return useMutation<void, Error, { resetToken: string; password: string; confirmPassword: string }>({
    mutationFn: (payload) =>
      authService.resetPassword(payload),
  });
}

/** POST /auth/change-password — change current user's password */
export function useChangePasswordMutation() {
  return useMutation<void, Error, { currentPassword: string; newPassword: string; confirmPassword: string }>({
    mutationFn: (payload) =>
      authService.changePassword(payload),
  });
}
