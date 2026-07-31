import { apiClient } from '../lib/api';
import type { RoleResponse } from '../types';

export const roleService = {
  list: () =>
    apiClient.get<RoleResponse[]>('/roles'),

  getById: (id: string) =>
    apiClient.get<RoleResponse>(`/roles/${id}`),
};
