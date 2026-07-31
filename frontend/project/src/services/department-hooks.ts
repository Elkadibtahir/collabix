import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService, listDepartments, getDepartmentById, createDepartment, type DepartmentDashboardResponse, type DepartmentSummary, type DepartmentResponse, type CreateDepartmentRequest } from './department-service';

const departmentKeys = {
  all: ['departments'] as const,
  list: (workspaceId: string) => ['departments', 'list', workspaceId] as const,
};

export function useDepartmentList(workspaceId: string | undefined) {
  return useQuery<DepartmentSummary[]>({
    queryKey: departmentKeys.list(workspaceId!),
    queryFn: () => listDepartments(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useDepartmentDetail(workspaceId: string | undefined, departmentId: string | undefined) {
  return useQuery<DepartmentResponse>({
    queryKey: ['departments', 'detail', workspaceId, departmentId],
    queryFn: () => getDepartmentById(workspaceId!, departmentId!),
    enabled: !!workspaceId && !!departmentId,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: CreateDepartmentRequest }) =>
      createDepartment(workspaceId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: departmentKeys.list(variables.workspaceId) });
    },
  });
}

/* ============================================================
   Dashboard
============================================================ */
export function useDepartmentDashboard(
  workspaceId: string | undefined,
  departmentId: string | undefined,
) {
  return useQuery<DepartmentDashboardResponse>({
    queryKey: ['department', 'dashboard', workspaceId, departmentId],
    queryFn: async () => {
      const svc = departmentService(workspaceId!, departmentId!);
      const res = await svc.getDashboard();
      return res;
    },
    enabled: !!workspaceId && !!departmentId,
  });
}

/* ============================================================
   Sprint stats (Development)
============================================================ */
export function useSprintStats(
  workspaceId: string | undefined,
  departmentId: string | undefined,
) {
  return useQuery({
    queryKey: ['department', 'sprints', workspaceId, departmentId],
    queryFn: async () => {
      const svc = departmentService(workspaceId!, departmentId!);
      const res = await svc.getSprintStats();
      return res;
    },
    enabled: !!workspaceId && !!departmentId,
  });
}

/* ============================================================
   Campaign stats (Marketing)
============================================================ */
export function useCampaignStats(
  workspaceId: string | undefined,
  departmentId: string | undefined,
) {
  return useQuery({
    queryKey: ['department', 'campaigns', workspaceId, departmentId],
    queryFn: async () => {
      const svc = departmentService(workspaceId!, departmentId!);
      const res = await svc.getCampaignStats();
      return res;
    },
    enabled: !!workspaceId && !!departmentId,
  });
}

/* ============================================================
   Audit stats (Cybersecurity)
============================================================ */
export function useAuditStats(
  workspaceId: string | undefined,
  departmentId: string | undefined,
) {
  return useQuery({
    queryKey: ['department', 'audits', workspaceId, departmentId],
    queryFn: async () => {
      const svc = departmentService(workspaceId!, departmentId!);
      const res = await svc.getAuditStats();
      return res;
    },
    enabled: !!workspaceId && !!departmentId,
  });
}

/* ============================================================
   AI Model stats
============================================================ */
export function useModelStats(
  workspaceId: string | undefined,
  departmentId: string | undefined,
) {
  return useQuery({
    queryKey: ['department', 'models', workspaceId, departmentId],
    queryFn: async () => {
      const svc = departmentService(workspaceId!, departmentId!);
      const res = await svc.getModelStats();
      return res;
    },
    enabled: !!workspaceId && !!departmentId,
  });
}

/* ============================================================
   Workspace Analytics
============================================================ */
export function useWorkspaceAnalytics(
  workspaceId: string | undefined,
) {
  return useQuery({
    queryKey: ['workspace', 'analytics', workspaceId],
    queryFn: async () => {
      const svc = departmentService(workspaceId!, '');
      const res = await svc.getAnalytics();
      return res;
    },
    enabled: !!workspaceId,
  });
}
