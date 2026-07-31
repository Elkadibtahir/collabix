import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService } from './onboarding-service';
import type { CreateOnboardingRequest, UpdateOnboardingRequest, CreateOnboardingTaskRequest } from './onboarding-service';

const keys = {
  all: (wsId: string, deptId: string) => ['onboarding', wsId, deptId] as const,
  detail: (wsId: string, deptId: string, id: string) => ['onboarding', wsId, deptId, id] as const,
  tasks: (wsId: string, deptId: string, id: string) => ['onboarding', 'tasks', wsId, deptId, id] as const,
  stats: (wsId: string, deptId: string) => ['onboarding', 'stats', wsId, deptId] as const,
};

export function useOnboardingList(wsId: string, deptId: string) {
  return useQuery({ queryKey: keys.all(wsId, deptId), queryFn: () => onboardingService.list(wsId, deptId), enabled: !!wsId && !!deptId });
}

export function useOnboardingDetail(wsId: string, deptId: string, onboardingId: string | undefined) {
  return useQuery({ queryKey: keys.detail(wsId, deptId, onboardingId ?? ''), queryFn: () => onboardingService.getById(wsId, deptId, onboardingId!), enabled: !!wsId && !!deptId && !!onboardingId });
}

export function useOnboardingStats(wsId: string, deptId: string) {
  return useQuery({ queryKey: keys.stats(wsId, deptId), queryFn: () => onboardingService.getStats(wsId, deptId), enabled: !!wsId && !!deptId });
}

export function useOnboardingTasks(wsId: string, deptId: string, onboardingId: string | undefined) {
  return useQuery({ queryKey: keys.tasks(wsId, deptId, onboardingId ?? ''), queryFn: () => onboardingService.getTasks(wsId, deptId, onboardingId!), enabled: !!wsId && !!deptId && !!onboardingId });
}

export function useCreateOnboarding(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: CreateOnboardingRequest) => onboardingService.create(wsId, deptId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }) });
}

export function useUpdateOnboarding(wsId: string, deptId: string, onboardingId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: UpdateOnboardingRequest) => onboardingService.update(wsId, deptId, onboardingId, data), onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }); qc.invalidateQueries({ queryKey: keys.detail(wsId, deptId, onboardingId) }); } });
}

export function useDeleteOnboarding(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => onboardingService.delete(wsId, deptId, id), onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(wsId, deptId) }) });
}

export function useCreateOnboardingTask(wsId: string, deptId: string, onboardingId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: CreateOnboardingTaskRequest) => onboardingService.createTask(wsId, deptId, onboardingId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.tasks(wsId, deptId, onboardingId) }) });
}

export function useCompleteOnboardingTask(wsId: string, deptId: string, onboardingId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (taskId: string) => onboardingService.completeTask(wsId, deptId, onboardingId, taskId), onSuccess: () => qc.invalidateQueries({ queryKey: keys.tasks(wsId, deptId, onboardingId) }) });
}
