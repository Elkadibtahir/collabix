import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'REMOTE' | 'VACATION' | 'SICK_LEAVE' | 'BUSINESS_TRIP' | 'HOLIDAY';

export interface AttendanceResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workedHours?: number;
  breakDuration?: number;
  overtimeHours?: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceRequest {
  employeeId?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  breakDuration?: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceRequest {
  checkInTime?: string;
  checkOutTime?: string;
  breakDuration?: number;
  status?: AttendanceStatus;
  notes?: string;
}

export interface CheckInRequest {
  date: string;
  notes?: string;
}

export interface CheckOutRequest {
  notes?: string;
}

export interface AttendanceStatistics {
  totalRecords: number;
  presentDays: number;
  absentDays: number;
  lateArrivals: number;
  remoteWorkDays: number;
  vacationDays: number;
  sickLeaveDays: number;
  averageWorkedHours: number;
  totalOvertimeHours: number;
  attendanceRate: number;
  attendanceByStatus: Record<string, number>;
}

export interface AttendanceSearchCriteria {
  employeeId?: string;
  teamId?: string;
  status?: AttendanceStatus;
  dateFrom?: string;
  dateTo?: string;
  month?: number;
  year?: number;
  createdBy?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

function employeeBase(wsId: string, deptId: string, employeeId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/employees/${employeeId}/attendance`;
}

function deptBase(wsId: string, deptId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/attendance`;
}

function toQuery(params: object): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export const attendanceService = {
  checkIn: (wsId: string, deptId: string, employeeId: string, data: CheckInRequest) =>
    apiClient.post<AttendanceResponse>(`${employeeBase(wsId, deptId, employeeId)}/check-in`, data),

  checkOut: (wsId: string, deptId: string, employeeId: string, data?: CheckOutRequest) =>
    apiClient.post<AttendanceResponse>(`${employeeBase(wsId, deptId, employeeId)}/check-out`, data),

  create: (wsId: string, deptId: string, employeeId: string, data: CreateAttendanceRequest) =>
    apiClient.post<AttendanceResponse>(`${employeeBase(wsId, deptId, employeeId)}`, data),

  listByEmployee: (wsId: string, deptId: string, employeeId: string) =>
    apiClient.get<PageResponse<AttendanceResponse>>(`${employeeBase(wsId, deptId, employeeId)}`),

  getById: (wsId: string, deptId: string, attendanceId: string) =>
    apiClient.get<AttendanceResponse>(`${deptBase(wsId, deptId)}/${attendanceId}`),

  list: (wsId: string, deptId: string, criteria?: AttendanceSearchCriteria) =>
    apiClient.get<PageResponse<AttendanceResponse>>(`${deptBase(wsId, deptId)}${toQuery(criteria ?? {})}`),

  update: (wsId: string, deptId: string, attendanceId: string, data: UpdateAttendanceRequest) =>
    apiClient.put<AttendanceResponse>(`${deptBase(wsId, deptId)}/${attendanceId}`, data),

  delete: (wsId: string, deptId: string, attendanceId: string) =>
    apiClient.delete<void>(`${deptBase(wsId, deptId)}/${attendanceId}`),

  stats: (wsId: string, deptId: string) =>
    apiClient.get<AttendanceStatistics>(`${deptBase(wsId, deptId)}/stats`),
};
