import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'ARCHIVED';
export type AuditType = 'ACCESS_CONTROL' | 'NETWORK_SECURITY' | 'APPLICATION_SECURITY' | 'INFRASTRUCTURE' | 'COMPLIANCE' | 'DATA_PROTECTION' | 'IDENTITY_MANAGEMENT' | 'GENERAL';
export type AuditPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityAudit {
  id: string;
  departmentId: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  name: string;
  description?: string;
  auditType: AuditType;
  status: AuditStatus;
  priority: AuditPriority;
  startDate?: string;
  endDate?: string;
  totalTasks?: number;
  completedTasks?: number;
  remainingTasks?: number;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAuditStatistics {
  totalAudits: number;
  activeAudits: number;
  completedAudits: number;
  plannedAudits: number;
  archivedAudits: number;
  averageCompletionPercentage: number;
  averageCompletionTimeDays: number;
}

export interface SecurityAuditSearchCriteria {
  keyword?: string;
  status?: string;
  auditType?: string;
  priority?: string;
}

export interface CreateSecurityAuditRequest {
  projectId: string;
  teamId?: string;
  name: string;
  description?: string;
  auditType: AuditType;
  priority: AuditPriority;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSecurityAuditRequest {
  teamId?: string;
  name?: string;
  description?: string;
  auditType?: AuditType;
  priority?: AuditPriority;
  startDate?: string;
  endDate?: string;
}

export function securityAuditService(workspaceId: string, departmentId: string) {
  const base = `/workspaces/${workspaceId}/departments/${departmentId}/audits`;

  return {
    list: (criteria: SecurityAuditSearchCriteria = {}, page = 0, size = 20) => {
      const params: Record<string, unknown> = { page, size };
      if (criteria.keyword) params.keyword = criteria.keyword;
      if (criteria.status) params.status = criteria.status;
      if (criteria.auditType) params.auditType = criteria.auditType;
      if (criteria.priority) params.priority = criteria.priority;
      return apiClient.get<PageResponse<SecurityAudit>>(base, { params });
    },

    getById: (auditId: string) =>
      apiClient.get<SecurityAudit>(`${base}/${auditId}`),

    stats: () =>
      apiClient.get<SecurityAuditStatistics>(`${base}/stats`),

    create: (data: CreateSecurityAuditRequest) =>
      apiClient.post<SecurityAudit>(base, data),

    update: (auditId: string, data: UpdateSecurityAuditRequest) =>
      apiClient.put<SecurityAudit>(`${base}/${auditId}`, data),

    start: (auditId: string) =>
      apiClient.put<SecurityAudit>(`${base}/${auditId}/start`),

    complete: (auditId: string) =>
      apiClient.put<SecurityAudit>(`${base}/${auditId}/complete`),

    archive: (auditId: string) =>
      apiClient.put<SecurityAudit>(`${base}/${auditId}/archive`),
  };
}
