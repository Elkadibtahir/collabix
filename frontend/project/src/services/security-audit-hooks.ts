import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  securityAuditService,
  type SecurityAudit,
  type SecurityAuditStatistics,
  type SecurityAuditSearchCriteria,
  type CreateSecurityAuditRequest,
  type UpdateSecurityAuditRequest,
} from './security-audit-service';

export function useSecurityAudits(
  wsId: string | undefined,
  deptId: string | undefined,
  criteria: SecurityAuditSearchCriteria = {},
  page = 0,
  size = 20,
) {
  return useQuery({
    queryKey: ['security-audits', wsId, deptId, { ...criteria, page, size }],
    queryFn: () => securityAuditService(wsId!, deptId!).list(criteria, page, size),
    enabled: !!wsId && !!deptId,
  });
}

export function useSecurityAuditStats(
  wsId: string | undefined,
  deptId: string | undefined,
) {
  return useQuery<SecurityAuditStatistics>({
    queryKey: ['security-audits', 'stats', wsId, deptId],
    queryFn: () => securityAuditService(wsId!, deptId!).stats(),
    enabled: !!wsId && !!deptId,
  });
}

export function useCreateSecurityAudit(wsId: string, deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSecurityAuditRequest) => securityAuditService(wsId, deptId).create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-audits', wsId, deptId] });
    },
  });
}

export function useUpdateSecurityAudit(wsId: string, deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: string; data: UpdateSecurityAuditRequest }) =>
      securityAuditService(wsId, deptId).update(auditId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-audits', wsId, deptId] });
    },
  });
}

export function useStartSecurityAudit(wsId: string, deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auditId: string) => securityAuditService(wsId, deptId).start(auditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-audits', wsId, deptId] });
    },
  });
}

export function useCompleteSecurityAudit(wsId: string, deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auditId: string) => securityAuditService(wsId, deptId).complete(auditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-audits', wsId, deptId] });
    },
  });
}

export function useArchiveSecurityAudit(wsId: string, deptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auditId: string) => securityAuditService(wsId, deptId).archive(auditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-audits', wsId, deptId] });
    },
  });
}

export type { SecurityAudit };
