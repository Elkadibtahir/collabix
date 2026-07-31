import { apiClient } from '../lib/api';
import type { PermissionResponse } from '../types';

export const permissionService = {
  list: () =>
    apiClient.get<PermissionResponse[]>('/permissions'),

  getById: (id: string) =>
    apiClient.get<PermissionResponse>(`/permissions/${id}`),
};
