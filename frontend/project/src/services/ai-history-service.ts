import { apiClient } from '../lib/api';

export interface AIHistoryRequest {
  user: string;
  workspace: string;
  department: string;
  provider: 'GEMINI' | 'GROQ';
  model: string;
  prompt: string;
  response: string;
  executionTime: number;
  tokenCount?: number;
  success: boolean;
}

export interface AIHistoryResponse {
  id: string;
  user: string;
  workspace: string;
  department: string;
  provider: 'GEMINI' | 'GROQ';
  model: string;
  prompt: string;
  response: string;
  executionTime: number;
  tokenCount?: number;
  success: boolean;
  createdAt: string;
}

export function aiHistoryService() {
  const base = '/ai/history';
  return {
    create: (data: AIHistoryRequest) =>
      apiClient.post<AIHistoryResponse>(base, data),

    getById: (id: string) =>
      apiClient.get<AIHistoryResponse>(`${base}/${id}`),
  };
}
