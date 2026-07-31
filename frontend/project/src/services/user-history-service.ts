import { apiClient } from '../lib/api';
import type { UserHistoryResponse, UserHistorySearchCriteria, PageResponse } from '../types';

export function userHistoryService(workspaceId: string) {
  const base = `/workspaces/${workspaceId}/users/history`;

  return {
    list: (criteria: UserHistorySearchCriteria, page: number, size: number) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      if (criteria.keyword) params.set('keyword', criteria.keyword);
      if (criteria.userId) params.set('userId', criteria.userId);
      if (criteria.action) params.set('action', criteria.action);
      if (criteria.actions?.length) params.set('actions', criteria.actions.join(','));
      if (criteria.performedBy) params.set('performedBy', criteria.performedBy);
      if (criteria.departmentId) params.set('departmentId', criteria.departmentId);
      if (criteria.createdAfter) params.set('createdAfter', criteria.createdAfter);
      if (criteria.createdBefore) params.set('createdBefore', criteria.createdBefore);
      const q = params.toString();
      return apiClient.get<PageResponse<UserHistoryResponse>>(`${base}?${q}`);
    },
  };
}
