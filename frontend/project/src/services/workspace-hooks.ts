import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService, type WorkspaceSummaryResponse, type WorkspaceResponse, type CreateWorkspaceRequest, type UpdateWorkspaceRequest } from './workspace-service';

const workspaceKeys = {
  all: ['workspaces'] as const,
  list: () => ['workspaces', 'list'] as const,
  detail: (id: string) => ['workspaces', 'detail', id] as const,
};

export function useWorkspacesList(params?: { search?: string; sort?: string; order?: string }) {
  return useQuery<WorkspaceSummaryResponse[]>({
    queryKey: [...workspaceKeys.all, 'list', params],
    queryFn: () => workspaceService.list(params),
  });
}

export function useWorkspaceDetail(id: string | undefined) {
  return useQuery<WorkspaceResponse>({
    queryKey: workspaceKeys.detail(id ?? ''),
    queryFn: () => workspaceService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => workspaceService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useUpdateWorkspace(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWorkspaceRequest) => workspaceService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
      qc.invalidateQueries({ queryKey: workspaceKeys.detail(id) });
    },
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspaceService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useArchiveWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspaceService.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useRestoreWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspaceService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useArchivedWorkspacesList() {
  return useQuery<WorkspaceSummaryResponse[]>({
    queryKey: [...workspaceKeys.all, 'archived'],
    queryFn: () => workspaceService.listArchived(),
  });
}

export function useWorkspaceDashboard(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['workspace', 'dashboard', workspaceId],
    queryFn: () => workspaceService.getDashboard(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function usePersonalDashboard(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['workspace', 'personal-dashboard', workspaceId],
    queryFn: () => workspaceService.getPersonalDashboard(workspaceId!),
    enabled: !!workspaceId,
  });
}
