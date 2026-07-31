import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export interface EmployeeSkillResponse {
  id: string;
  employeeId: string;
  skillName: string;
  category: string;
  proficiencyLevel: string;
  yearsOfExperience?: number;
  lastUsedDate?: string;
  certificationName?: string;
  certificationIssuer?: string;
  certificationDate?: string;
  certificationExpiration?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeSkillRequest {
  skillName: string;
  category: string;
  proficiencyLevel: string;
  yearsOfExperience?: number;
  lastUsedDate?: string;
  certificationName?: string;
  certificationIssuer?: string;
  certificationDate?: string;
  certificationExpiration?: string;
  notes?: string;
}

export interface UpdateEmployeeSkillRequest {
  skillName?: string;
  category?: string;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
  lastUsedDate?: string;
  certificationName?: string;
  certificationIssuer?: string;
  certificationDate?: string;
  certificationExpiration?: string;
  notes?: string;
  active?: boolean;
}

export interface EmployeeSkillStatistics {
  totalSkills: number;
  verifiedCount: number;
  unverifiedCount: number;
  certificationCount: number;
  expiringCertificationCount: number;
  averageSkillsPerEmployee: number;
  skillsByCategory: Record<string, number>;
  skillsByLevel: Record<string, number>;
}

function base(wsId: string, deptId: string, employeeId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/employees/${employeeId}/skills`;
}

export const employeeSkillService = {
  list: (wsId: string, deptId: string, employeeId: string) =>
    apiClient.get<PageResponse<EmployeeSkillResponse>>(`${base(wsId, deptId, employeeId)}`),

  getById: (wsId: string, deptId: string, employeeId: string, skillId: string) =>
    apiClient.get<EmployeeSkillResponse>(`${base(wsId, deptId, employeeId)}/${skillId}`),

  create: (wsId: string, deptId: string, employeeId: string, data: CreateEmployeeSkillRequest) =>
    apiClient.post<EmployeeSkillResponse>(`${base(wsId, deptId, employeeId)}`, data),

  update: (wsId: string, deptId: string, employeeId: string, skillId: string, data: UpdateEmployeeSkillRequest) =>
    apiClient.put<EmployeeSkillResponse>(`${base(wsId, deptId, employeeId)}/${skillId}`, data),

  delete: (wsId: string, deptId: string, employeeId: string, skillId: string) =>
    apiClient.delete<void>(`${base(wsId, deptId, employeeId)}/${skillId}`),

  verify: (wsId: string, deptId: string, employeeId: string, skillId: string) =>
    apiClient.put<EmployeeSkillResponse>(`${base(wsId, deptId, employeeId)}/${skillId}/verify`),

  unverify: (wsId: string, deptId: string, employeeId: string, skillId: string) =>
    apiClient.delete<EmployeeSkillResponse>(`${base(wsId, deptId, employeeId)}/${skillId}/verify`),

  getStats: (wsId: string, deptId: string) =>
    apiClient.get<EmployeeSkillStatistics>(`/workspaces/${wsId}/departments/${deptId}/skills/stats`),
};
