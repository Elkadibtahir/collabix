import { apiClient } from '../lib/api';

export type ModelType =
  | 'CLASSIFICATION'
  | 'REGRESSION'
  | 'OBJECT_DETECTION'
  | 'NLP'
  | 'COMPUTER_VISION'
  | 'RECOMMENDATION'
  | 'TIME_SERIES'
  | 'CUSTOM';

export type ModelStatus =
  | 'PLANNING'
  | 'TRAINING'
  | 'VALIDATING'
  | 'READY'
  | 'DEPLOYED'
  | 'RETIRED'
  | 'ARCHIVED';

export interface AIModelResponse {
  id: string;
  departmentId: string;
  projectId: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  name: string;
  description?: string;
  modelType: ModelType;
  modelVersion?: string;
  objective?: string;
  status: ModelStatus;
  accuracy?: number;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAIModelRequest {
  projectId: string;
  teamId?: string;
  name: string;
  description?: string;
  modelType: ModelType;
  modelVersion?: string;
  objective?: string;
  accuracy?: number;
  ownerId?: string;
}

export interface UpdateAIModelRequest {
  teamId?: string;
  name?: string;
  description?: string;
  modelType?: ModelType;
  modelVersion?: string;
  objective?: string;
  accuracy?: number;
  ownerId?: string;
}

export interface AIModelSearchCriteria {
  projectId?: string;
  teamId?: string;
  status?: ModelStatus;
  modelType?: ModelType;
  ownerId?: string;
  modelVersion?: string;
  keyword?: string;
}

export interface AIModelStatistics {
  totalModels: number;
  trainingModels: number;
  readyModels: number;
  deployedModels: number;
  archivedModels: number;
  averageAccuracy: number;
  modelsByStatus: Record<string, number>;
  modelsByProject: Record<string, number>;
  modelsByTeam: Record<string, number>;
}

function base(wsId: string, deptId: string) {
  return `/workspaces/${wsId}/departments/${deptId}/models`;
}

function toQuery(criteria?: AIModelSearchCriteria): string {
  if (!criteria) return '';
  const params = new URLSearchParams();
  Object.entries(criteria).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const aiModelService = {
  list: (wsId: string, deptId: string, criteria?: AIModelSearchCriteria) =>
    apiClient.get<AIModelResponse[]>(`${base(wsId, deptId)}${toQuery(criteria)}`),

  getById: (wsId: string, deptId: string, modelId: string) =>
    apiClient.get<AIModelResponse>(`${base(wsId, deptId)}/${modelId}`),

  create: (wsId: string, deptId: string, data: CreateAIModelRequest) =>
    apiClient.post<AIModelResponse>(`${base(wsId, deptId)}`, data),

  update: (wsId: string, deptId: string, modelId: string, data: UpdateAIModelRequest) =>
    apiClient.put<AIModelResponse>(`${base(wsId, deptId)}/${modelId}`, data),

  changeStatus: (wsId: string, deptId: string, modelId: string, status: ModelStatus) =>
    apiClient.put<AIModelResponse>(`${base(wsId, deptId)}/${modelId}/status`, status),

  archive: (wsId: string, deptId: string, modelId: string) =>
    apiClient.put<AIModelResponse>(`${base(wsId, deptId)}/${modelId}/archive`),

  stats: (wsId: string, deptId: string) =>
    apiClient.get<AIModelStatistics>(`${base(wsId, deptId)}/stats`),
};
