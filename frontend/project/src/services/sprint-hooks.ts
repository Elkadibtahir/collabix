import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintService } from './sprint-service';
import type {
  SprintSearchCriteria,
  CreateSprintRequest,
  UpdateSprintRequest,
} from './sprint-service';

const keys = {
  all: (wsId: string, deptId: string) => ['sprints', wsId, deptId] as const,
  list: (wsId: string, deptId: string, criteria: SprintSearchCriteria | undefined, page: number) =>
    ['sprints', wsId, deptId, 'list', criteria, page] as const,
  detail: (wsId: string, deptId: string, sprintId: string) =>
    ['sprints', wsId, deptId, sprintId] as const,
  stats: (wsId: string, deptId: string) => ['sprints', wsId, deptId, 'stats'] as const,
};

export function useSprints(
  wsId: string,
  deptId: string,
  criteria?: SprintSearchCriteria,
  page = 0,
  size = 20,
) {
  return useQuery({
    queryKey: keys.list(wsId, deptId, criteria, page),
    queryFn: () => sprintService.list(wsId, deptId, criteria, page, size),
    enabled: !!wsId && !!deptId,
  });
}

export function useSprintDetail(wsId: string, deptId: string, sprintId: string | undefined) {
  return useQuery({
    queryKey: keys.detail(wsId, deptId, sprintId ?? ''),
    queryFn: () => sprintService.getById(wsId, deptId, sprintId!),
    enabled: !!wsId && !!deptId && !!sprintId,
  });
}

export function useSprintStats(wsId: string, deptId: string) {
  return useQuery({
    queryKey: keys.stats(wsId, deptId),
    queryFn: () => sprintService.stats(wsId, deptId),
    enabled: !!wsId && !!deptId,
  });
}

export function useCreateSprint(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSprintRequest) =>
      sprintService.create(wsId, deptId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'sprints', wsId, deptId] });
    },
  });
}

export function useUpdateSprint(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: string; data: UpdateSprintRequest }) =>
      sprintService.update(wsId, deptId, sprintId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.detail(wsId, deptId, variables.sprintId) });
      qc.invalidateQueries({ queryKey: ['department', 'sprints', wsId, deptId] });
    },
  });
}

export function useActivateSprint(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) => sprintService.activate(wsId, deptId, sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'sprints', wsId, deptId] });
    },
  });
}

export function useCompleteSprint(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) => sprintService.complete(wsId, deptId, sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'sprints', wsId, deptId] });
    },
  });
}

export function useArchiveSprint(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) => sprintService.archive(wsId, deptId, sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'sprints', wsId, deptId] });
    },
  });
}

export function useDeleteSprint(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) => sprintService.remove(wsId, deptId, sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) });
      qc.invalidateQueries({ queryKey: ['department', 'sprints', wsId, deptId] });
    },
  });
}
