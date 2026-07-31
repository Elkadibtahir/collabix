import { apiClient } from '../lib/api';
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  CompleteActivationRequest,
  UserResponse,
} from '../types';

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),

  refresh: (data: RefreshTokenRequest) =>
    apiClient.post<RefreshTokenResponse>('/auth/refresh', data),

  logout: (data: RefreshTokenRequest) =>
    apiClient.post<void>('/auth/logout', data),

  me: () =>
    apiClient.get<UserResponse>('/auth/me'),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<void>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<void>('/auth/reset-password', data),

  activate: (data: CompleteActivationRequest) =>
    apiClient.post<void>('/auth/activate', data),

  validateActivationToken: (token: string) =>
    apiClient.get<void>(`/auth/activate?token=${encodeURIComponent(token)}`),

  resendActivation: (email: string) =>
    apiClient.post<void>(`/auth/resend-activation?email=${encodeURIComponent(email)}`),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<void>('/auth/change-password', data),
};
