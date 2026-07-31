import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export interface KnowledgeAskRequest {
  workspaceId: string;
  departmentId: string;
  projectId?: string;
  question: string;
}

export interface KnowledgeSearchRequest {
  workspaceId: string;
  departmentId: string;
  projectId?: string;
  query: string;
  category?: string;
  documentType?: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  type: string;
  category: string;
  summary: string;
  workspaceName: string;
  departmentName: string;
  projectName: string;
  lastUpdated: string;
  version: number;
}

export interface KnowledgeAIResponse {
  answer: string;
  sources: KnowledgeSource[];
  confidence: string;
  missingInformation: string;
  suggestedRelatedDocuments: string[];
  executionTime: number;
  timestamp: string;
}

export function knowledgeAIService() {
  const base = '/knowledge/ai';
  return {
    ask: (data: KnowledgeAskRequest) =>
      apiClient.post<KnowledgeAIResponse>(`${base}/ask`, data),

    search: (data: KnowledgeSearchRequest) =>
      apiClient.post<KnowledgeSource[]>(`${base}/search`, data),

    getHistory: (workspaceId: string, page?: number, size?: number) => {
      const params: Record<string, unknown> = { workspaceId };
      if (page != null) params.page = page;
      if (size != null) params.size = size;
      return apiClient.get<PageResponse<KnowledgeAIResponse>>(`${base}/history`, { params });
    },
  };
}
