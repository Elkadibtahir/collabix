import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export interface EmployeeResponse {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: string;
  position: string;
  departmentId: string;
  teamId?: string;
  managerId?: string;
  employmentType: string;
  employmentStatus: string;
  startDate: string;
  endDate?: string;
  profilePicturePath?: string;
  candidateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  candidateId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: string;
  position: string;
  teamId?: string;
  managerId?: string;
  employmentType: string;
  startDate: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: string;
  position?: string;
  teamId?: string;
  managerId?: string;
  employmentType?: string;
  employmentStatus?: string;
  startDate?: string;
  endDate?: string;
  profilePicturePath?: string;
}

export interface EmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveCount: number;
  probationCount: number;
  employeesByDepartment: Record<string, number>;
  employeesByTeam: Record<string, number>;
  employeesByEmploymentType: Record<string, number>;
  employeesByStatus: Record<string, number>;
  newHiresThisMonth: number;
}

export interface EmployeeTimelineEntry {
  id: string;
  eventType: string;
  title: string;
  description?: string;
  occurredAt: string;
  actorId?: string;
  actorName?: string;
}

function base(wsId: string, deptId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/employees`;
}

export const employeeService = {
  list: (wsId: string, deptId: string, params?: { page?: number; size?: number; keyword?: string; status?: string }) =>
    apiClient.get<PageResponse<EmployeeResponse>>(`${base(wsId, deptId)}`, { params }),

  getById: (wsId: string, deptId: string, employeeId: string) =>
    apiClient.get<EmployeeResponse>(`${base(wsId, deptId)}/${employeeId}`),

  create: (wsId: string, deptId: string, data: CreateEmployeeRequest) =>
    apiClient.post<EmployeeResponse>(`${base(wsId, deptId)}`, data),

  update: (wsId: string, deptId: string, employeeId: string, data: UpdateEmployeeRequest) =>
    apiClient.put<EmployeeResponse>(`${base(wsId, deptId)}/${employeeId}`, data),

  delete: (wsId: string, deptId: string, employeeId: string) =>
    apiClient.delete<void>(`${base(wsId, deptId)}/${employeeId}`),

  getTimeline: (wsId: string, deptId: string, employeeId: string) =>
    apiClient.get<EmployeeTimelineEntry[]>(`${base(wsId, deptId)}/${employeeId}/timeline`),

  getStats: (wsId: string, deptId: string) =>
    apiClient.get<EmployeeStatistics>(`${base(wsId, deptId)}/stats`),
};
