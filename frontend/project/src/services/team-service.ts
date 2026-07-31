import { apiClient } from '../lib/api';

export interface TeamResponse {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export interface TeamSummary {
  id: string;
  departmentId: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
  memberCount?: number;
}

export const listTeamsByDepartment = (workspaceId: string, departmentId: string) =>
  apiClient.get<TeamSummary[]>(`/workspaces/${workspaceId}/departments/${departmentId}/teams`);

export const getTeamById = (workspaceId: string, departmentId: string, teamId: string) =>
  apiClient.get<TeamResponse>(`/workspaces/${workspaceId}/departments/${departmentId}/teams/${teamId}`);

export const teamService = (wsId: string) => ({
  listByDepartment: (deptId: string) => listTeamsByDepartment(wsId, deptId),
});
