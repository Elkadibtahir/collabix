import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  restoreProject,
  listArchivedProjects,
} from './project-service';
import type { CreateProjectRequest, UpdateProjectRequest, ProjectResponse } from '../pages/projects/projects-types';
import type { PageResponse } from '../types/api';

const projectKeys = {
  all: ['projects'] as const,
  list: (wsId: string, deptId: string) => ['projects', 'list', wsId, deptId] as const,
  paginated: (wsId: string, deptId: string, search?: string, page?: number) =>
    ['projects', 'paginated', wsId, deptId, search, page] as const,
  detail: (wsId: string, deptId: string, projectId: string) =>
    ['projects', 'detail', wsId, deptId, projectId] as const,
  archived: (wsId: string, deptId: string) => ['projects', 'archived', wsId, deptId] as const,
};

export function useProjectList(
  wsId: string | undefined,
  deptId: string | undefined,
  search?: string,
  page = 0,
) {
  return useQuery<PageResponse<ProjectResponse>>({
    queryKey: projectKeys.paginated(wsId!, deptId!, search, page),
    queryFn: () => listProjects(wsId!, deptId!, search, page),
    enabled: !!wsId && !!deptId,
  });
}

export function useProjectDetail(
  wsId: string | undefined,
  deptId: string | undefined,
  projectId: string | undefined,
) {
  return useQuery<ProjectResponse>({
    queryKey: projectKeys.detail(wsId!, deptId!, projectId!),
    queryFn: () => getProjectById(wsId!, deptId!, projectId!),
    enabled: !!wsId && !!deptId && !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      wsId,
      deptId,
      data,
    }: {
      wsId: string;
      deptId: string;
      data: CreateProjectRequest;
    }) => createProject(wsId, deptId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.list(variables.wsId, variables.deptId) });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      wsId,
      deptId,
      projectId,
      data,
    }: {
      wsId: string;
      deptId: string;
      projectId: string;
      data: UpdateProjectRequest;
    }) => updateProject(wsId, deptId, projectId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.list(variables.wsId, variables.deptId) });
      qc.invalidateQueries({
        queryKey: projectKeys.detail(variables.wsId, variables.deptId, variables.projectId),
      });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      wsId,
      deptId,
      projectId,
    }: {
      wsId: string;
      deptId: string;
      projectId: string;
    }) => deleteProject(wsId, deptId, projectId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.list(variables.wsId, variables.deptId) });
    },
  });
}

export function useRestoreProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      wsId,
      deptId,
      projectId,
    }: {
      wsId: string;
      deptId: string;
      projectId: string;
    }) => restoreProject(wsId, deptId, projectId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: projectKeys.list(variables.wsId, variables.deptId) });
      qc.invalidateQueries({
        queryKey: projectKeys.archived(variables.wsId, variables.deptId),
      });
    },
  });
}

export function useArchivedProjects(wsId: string | undefined, deptId: string | undefined) {
  return useQuery<ProjectResponse[]>({
    queryKey: projectKeys.archived(wsId!, deptId!),
    queryFn: () => listArchivedProjects(wsId!, deptId!),
    enabled: !!wsId && !!deptId,
  });
}
