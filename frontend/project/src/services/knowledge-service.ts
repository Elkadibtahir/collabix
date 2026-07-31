import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export interface KnowledgeBaseResponse {
  id: string;
  projectId: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  version: number;
  isPinned: boolean;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateKnowledgeBaseRequest {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string;
}

export interface UpdateKnowledgeBaseRequest {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  tags?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  isPinned?: boolean;
}

function base(wsId: string, deptId: string, projId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/projects/${projId}/knowledge-base`;
}

export const knowledgeService = {
  list: (wsId: string, deptId: string, projId: string) =>
    apiClient.get<PageResponse<KnowledgeBaseResponse>>(`${base(wsId, deptId, projId)}`),

  getById: (wsId: string, deptId: string, projId: string, kbId: string) =>
    apiClient.get<KnowledgeBaseResponse>(`${base(wsId, deptId, projId)}/${kbId}`),

  create: (wsId: string, deptId: string, projId: string, data: CreateKnowledgeBaseRequest) =>
    apiClient.post<KnowledgeBaseResponse>(`${base(wsId, deptId, projId)}`, data),

  update: (wsId: string, deptId: string, projId: string, kbId: string, data: UpdateKnowledgeBaseRequest) =>
    apiClient.put<KnowledgeBaseResponse>(`${base(wsId, deptId, projId)}/${kbId}`, data),

  delete: (wsId: string, deptId: string, projId: string, kbId: string) =>
    apiClient.delete<void>(`${base(wsId, deptId, projId)}/${kbId}`),

  getCategories: (wsId: string, deptId: string, projId: string) =>
    apiClient.get<string[]>(`${base(wsId, deptId, projId)}/categories`),

  getByCategory: (wsId: string, deptId: string, projId: string, category: string) =>
    apiClient.get<PageResponse<KnowledgeBaseResponse>>(`${base(wsId, deptId, projId)}/categories/${category}`),

  getVersions: (wsId: string, deptId: string, projId: string, kbId: string) =>
    apiClient.get<KnowledgeBaseResponse[]>(`${base(wsId, deptId, projId)}/${kbId}/versions`),
};
