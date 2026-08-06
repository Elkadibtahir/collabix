import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export interface OnboardingResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  status: string;
  startDate: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  assignedHrId?: string;
  assignedManagerId?: string;
  notes?: string;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOnboardingRequest {
  employeeId: string;
  startDate: string;
  expectedCompletionDate?: string;
  assignedHrId?: string;
  assignedManagerId?: string;
  notes?: string;
}

export interface UpdateOnboardingRequest {
  status?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  assignedHrId?: string;
  assignedManagerId?: string;
  notes?: string;
}

export interface OnboardingTaskResponse {
  id: string;
  onboardingId: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  completedDate?: string;
  assignedUserId?: string;
  notes?: string;
  taskOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOnboardingTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  assignedUserId?: string;
  notes?: string;
  taskOrder?: number;
}

export interface OnboardingStatistics {
  totalOnboardings: number;
  activeOnboardings: number;
  completedOnboardings: number;
  cancelledOnboardings: number;
  onHoldCount: number;
  notStartedCount: number;
  onboardingThisMonth: number;
  overdueTasks: number;
  averageCompletionDays: number;
  completionRate: number;
  onboardingsByStatus: Record<string, number>;
}

function base(wsId: string, deptId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/onboarding`;
}

export const onboardingService = {
  list: (wsId: string, deptId: string, params?: { page?: number; size?: number; keyword?: string; status?: string }) =>
    apiClient.get<PageResponse<OnboardingResponse>>(`${base(wsId, deptId)}`, { params }),

  getById: (wsId: string, deptId: string, onboardingId: string) =>
    apiClient.get<OnboardingResponse>(`${base(wsId, deptId)}/${onboardingId}`),

  create: (wsId: string, deptId: string, data: CreateOnboardingRequest) =>
    apiClient.post<OnboardingResponse>(`${base(wsId, deptId)}`, data),

  update: (wsId: string, deptId: string, onboardingId: string, data: UpdateOnboardingRequest) =>
    apiClient.put<OnboardingResponse>(`${base(wsId, deptId)}/${onboardingId}`, data),

  delete: (wsId: string, deptId: string, onboardingId: string) =>
    apiClient.delete<void>(`${base(wsId, deptId)}/${onboardingId}`),

  getTasks: (wsId: string, deptId: string, onboardingId: string) =>
    apiClient.get<OnboardingTaskResponse[]>(`${base(wsId, deptId)}/${onboardingId}/tasks`),

  createTask: (wsId: string, deptId: string, onboardingId: string, data: CreateOnboardingTaskRequest) =>
    apiClient.post<OnboardingTaskResponse>(`${base(wsId, deptId)}/${onboardingId}/tasks`, data),

  completeTask: (wsId: string, deptId: string, onboardingId: string, taskId: string) =>
    apiClient.put<OnboardingTaskResponse>(`${base(wsId, deptId)}/${onboardingId}/tasks/${taskId}/complete`),

  deleteTask: (wsId: string, deptId: string, onboardingId: string, taskId: string) =>
    apiClient.delete<void>(`${base(wsId, deptId)}/${onboardingId}/tasks/${taskId}`),

  getStats: (wsId: string, deptId: string) =>
    apiClient.get<OnboardingStatistics>(`${base(wsId, deptId)}/stats`),
};
