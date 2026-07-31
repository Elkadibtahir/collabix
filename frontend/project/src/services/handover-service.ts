import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

/* ---------- DTOs ---------- */

export interface HandoverEntryResponse {
  id: string;
  workspaceId: string;
  departmentId: string;
  projectId: string;
  taskId?: string;
  userId: string;
  workFinished: string;
  workRemaining: string;
  difficulties: string;
  blockers: string;
  importantInformation: string;
  priorities: string;
  timeSpentMinutes: number;
  needHelp: boolean;
  additionalNotes?: string;
  shift: 'MORNING' | 'EVENING';
  passedAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateHandoverEntryRequest {
  shift: 'MORNING' | 'EVENING';
  passedAt: string;
  workFinished: string;
  workRemaining: string;
  difficulties: string;
  blockers: string;
  importantInformation: string;
  priorities: string;
  timeSpentMinutes: number;
  needHelp: boolean;
  additionalNotes?: string;
}

export interface UpdateHandoverEntryRequest extends CreateHandoverEntryRequest {}

export interface HandoverJournalResponse {
  id: string;
  workspaceId: string;
  departmentId: string;
  projectId: string;
  shift: 'MORNING' | 'EVENING';
  logDate: string;
  generatedSummary: string;
  mainDoneWork: string;
  mainRemainingWork: string;
  blockers: string;
  difficulties: string;
  recommendations: string;
  generationStatus: 'PENDING' | 'GENERATED' | 'FAILED';
  generationDate?: string;
  generationProcessedBy?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface HandoverAIGenerateRequest {
  workspaceId: string;
  departmentId: string;
  projectId: string;
}

export interface HandoverAIEditRequest {
  workspaceId: string;
  departmentId: string;
  projectId: string;
  executiveSummary?: string;
  completedWork?: string;
  pendingWork?: string;
  criticalRisks?: string;
  blockedTasks?: string;
  recommendations?: string;
  priorityActions?: string;
  workContinuity?: string;
}

export interface HandoverAIResponse {
  journalId: string;
  workspaceId: string;
  departmentId: string;
  projectId: string;
  shift: 'MORNING' | 'EVENING';
  journalDate: string;
  executiveSummary: string;
  completedWork: string;
  pendingWork: string;
  criticalRisks: string;
  blockedTasks: string;
  recommendations: string;
  priorityActions: string;
  workContinuity: string;
  generationStatus: 'PENDING' | 'GENERATED' | 'FAILED';
  generationDate: string;
  generatedBy: string;
  executionTime: number;
  createdAt: string;
  updatedAt: string;
}

/* ---------- Service factory ---------- */

export function handoverEntryService(workspaceId: string, departmentId: string, projectId: string) {
  const base = `/workspaces/${workspaceId}/departments/${departmentId}/projects/${projectId}/handover-entries`;

  return {
    list: (page?: number, size?: number) => {
      const params: Record<string, unknown> = {};
      if (page != null) params.page = page;
      if (size != null) params.size = size;
      return apiClient.get<PageResponse<HandoverEntryResponse>>(base, { params });
    },

    getById: (entryId: string) =>
      apiClient.get<HandoverEntryResponse>(`${base}/${entryId}`),

    create: (data: CreateHandoverEntryRequest) =>
      apiClient.post<HandoverEntryResponse>(base, data),

    update: (entryId: string, data: UpdateHandoverEntryRequest) =>
      apiClient.put<HandoverEntryResponse>(`${base}/${entryId}`, data),

    delete: (entryId: string) =>
      apiClient.delete<void>(`${base}/${entryId}`),
  };
}

export function handoverJournalService(workspaceId: string, departmentId: string, projectId: string) {
  const base = `/workspaces/${workspaceId}/departments/${departmentId}/projects/${projectId}/handover-logs`;

  return {
    list: (page?: number, size?: number) => {
      const params: Record<string, unknown> = {};
      if (page != null) params.page = page;
      if (size != null) params.size = size;
      return apiClient.get<PageResponse<HandoverJournalResponse>>(base, { params });
    },

    getById: (journalId: string) =>
      apiClient.get<HandoverJournalResponse>(`${base}/${journalId}`),

    generate: (data: HandoverAIGenerateRequest) =>
      apiClient.post<HandoverAIResponse>(`${base}/generate`, data),

    regenerate: (journalId: string, data: HandoverAIGenerateRequest) =>
      apiClient.put<HandoverAIResponse>(`${base}/${journalId}/regenerate`, data),

    delete: (journalId: string) =>
      apiClient.delete<void>(`${base}/${journalId}`),
  };
}

export function handoverAIService() {
  const base = '/handover/ai';

  return {
    generate: (data: HandoverAIGenerateRequest) =>
      apiClient.post<HandoverAIResponse>(`${base}/generate`, data),

    regenerate: (journalId: string, data: HandoverAIGenerateRequest) =>
      apiClient.post<HandoverAIResponse>(`${base}/regenerate/${journalId}`, data),

    edit: (journalId: string, data: HandoverAIEditRequest) =>
      apiClient.put<HandoverAIResponse>(`${base}/${journalId}`, data),

    approve: (journalId: string) =>
      apiClient.post<HandoverAIResponse>(`${base}/${journalId}/approve`),

    reject: (journalId: string) =>
      apiClient.post<HandoverAIResponse>(`${base}/${journalId}/reject`),
  };
}
