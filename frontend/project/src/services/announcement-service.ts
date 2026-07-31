import { apiClient } from '../lib/api';
import type { PageResponse } from '../types/api';

export interface AnnouncementResponse {
  id: string;
  workspaceId: string;
  departmentId?: string;
  teamId?: string;
  projectId?: string;
  title: string;
  content: string;
  isPinned: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  isPinned?: boolean;
  departmentId?: string;
  teamId?: string;
  projectId?: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

function base(wsId: string) {
  return `/workspaces/${wsId}/announcements`;
}

export const announcementService = {
  list: (wsId: string) =>
    apiClient.get<PageResponse<AnnouncementResponse>>(`${base(wsId)}`),

  getById: (wsId: string, annId: string) =>
    apiClient.get<AnnouncementResponse>(`${base(wsId)}/${annId}`),

  create: (wsId: string, data: CreateAnnouncementRequest) =>
    apiClient.post<AnnouncementResponse>(`${base(wsId)}`, data),

  update: (wsId: string, annId: string, data: UpdateAnnouncementRequest) =>
    apiClient.put<AnnouncementResponse>(`${base(wsId)}/${annId}`, data),

  delete: (wsId: string, annId: string) =>
    apiClient.delete<void>(`${base(wsId)}/${annId}`),

  listByDepartment: (wsId: string, deptId: string) =>
    apiClient.get<PageResponse<AnnouncementResponse>>(`${base(wsId)}/departments/${deptId}`),

  listByTeam: (wsId: string, teamId: string) =>
    apiClient.get<PageResponse<AnnouncementResponse>>(`${base(wsId)}/teams/${teamId}`),

  listByProject: (wsId: string, projId: string) =>
    apiClient.get<PageResponse<AnnouncementResponse>>(`${base(wsId)}/projects/${projId}`),
};
