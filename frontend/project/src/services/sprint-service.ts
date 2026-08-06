import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';

export interface SprintResponse {
  id: string;
  departmentId: string;
  projectId: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  name: string;
  goal?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: SprintStatus;
  capacity?: number;
  velocity?: number;
  completedStoryPoints?: number;
  totalStoryPoints?: number;
  totalTasks?: number;
  completedTasks?: number;
  remainingTasks?: number;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintRequest {
  projectId: string;
  teamId?: string;
  name: string;
  goal?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
}

export interface UpdateSprintRequest {
  teamId?: string;
  name?: string;
  goal?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
}

export interface SprintSearchCriteria {
  projectId?: string;
  teamId?: string;
  status?: SprintStatus;
  dateFrom?: string;
  dateTo?: string;
  name?: string;
}

export interface SprintStatistics {
  totalSprints: number;
  activeSprints: number;
  completedSprints: number;
  plannedSprints: number;
  cancelledSprints: number;
  averageDurationDays: number;
  averageCompletionRate: number;
  averageVelocity: number;
  averageTasksPerSprint: number;
  sprintsByStatus: Record<string, number>;
  sprintsByProject: Record<string, number>;
}

export type SprintPage = PageResponse<SprintResponse>;

function base(wsId: string, deptId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/sprints`;
}

function toQuery(
  criteria?: SprintSearchCriteria,
  page = 0,
  size = 20,
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  if (criteria) {
    Object.entries(criteria).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const sprintService = {
  list: (
    wsId: string,
    deptId: string,
    criteria?: SprintSearchCriteria,
    page = 0,
    size = 20,
  ) =>
    apiClient.get<SprintPage>(
      `${base(wsId, deptId)}${toQuery(criteria, page, size)}`,
    ),

  getById: (wsId: string, deptId: string, sprintId: string) =>
    apiClient.get<SprintResponse>(`${base(wsId, deptId)}/${sprintId}`),

  create: (wsId: string, deptId: string, data: CreateSprintRequest) =>
    apiClient.post<SprintResponse>(`${base(wsId, deptId)}`, data),

  update: (
    wsId: string,
    deptId: string,
    sprintId: string,
    data: UpdateSprintRequest,
  ) => apiClient.put<SprintResponse>(`${base(wsId, deptId)}/${sprintId}`, data),

  activate: (wsId: string, deptId: string, sprintId: string) =>
    apiClient.put<SprintResponse>(`${base(wsId, deptId)}/${sprintId}/activate`),

  complete: (wsId: string, deptId: string, sprintId: string) =>
    apiClient.put<SprintResponse>(`${base(wsId, deptId)}/${sprintId}/complete`),

  archive: (wsId: string, deptId: string, sprintId: string) =>
    apiClient.put<SprintResponse>(`${base(wsId, deptId)}/${sprintId}/archive`),

  remove: (wsId: string, deptId: string, sprintId: string) =>
    apiClient.delete<void>(`${base(wsId, deptId)}/${sprintId}`),

  stats: (wsId: string, deptId: string) =>
    apiClient.get<SprintStatistics>(`${base(wsId, deptId)}/stats`),
};
