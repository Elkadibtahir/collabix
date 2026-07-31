export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type ProjectPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ProjectResponse {
  id: string;
  departmentId: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  managerId?: string;
  managerName?: string;
  departmentName?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  managerId?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  managerId?: string;
  color?: string;
  icon?: string;
}

export interface ProjectFilters {
  departmentId?: string;
  managerId?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  search?: string;
}
