import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateAttachmentService } from './candidate-attachment-service';

const keys = {
  attachments: (wsId: string, deptId: string, candidateId: string) => ['candidate-attachments', wsId, deptId, candidateId] as const,
  detail: (wsId: string, deptId: string, candidateId: string, id: string) => ['candidate-attachments', wsId, deptId, candidateId, id] as const,
  stats: (wsId: string, deptId: string) => ['candidate-attachments', 'stats', wsId, deptId] as const,
};

export function useCandidateAttachments(wsId: string, deptId: string, candidateId: string | undefined) {
  return useQuery({ queryKey: keys.attachments(wsId, deptId, candidateId ?? ''), queryFn: () => candidateAttachmentService.list(wsId, deptId, candidateId!), enabled: !!wsId && !!deptId && !!candidateId });
}

export function useCandidateAttachmentDetail(wsId: string, deptId: string, candidateId: string, attachmentId: string | undefined) {
  return useQuery({ queryKey: keys.detail(wsId, deptId, candidateId, attachmentId ?? ''), queryFn: () => candidateAttachmentService.getById(wsId, deptId, candidateId, attachmentId!), enabled: !!wsId && !!deptId && !!attachmentId });
}

export function useCandidateAttachmentStats(wsId: string, deptId: string) {
  return useQuery({ queryKey: keys.stats(wsId, deptId), queryFn: () => candidateAttachmentService.stats(wsId, deptId), enabled: !!wsId && !!deptId });
}

export function useUploadCandidateAttachment(wsId: string, deptId: string, candidateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof candidateAttachmentService.upload>[3]) => candidateAttachmentService.upload(wsId, deptId, candidateId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.attachments(wsId, deptId, candidateId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}

export function useReplaceCandidateAttachment(wsId: string, deptId: string, candidateId: string, attachmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof candidateAttachmentService.replace>[4]) => candidateAttachmentService.replace(wsId, deptId, candidateId, attachmentId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.attachments(wsId, deptId, candidateId) }),
  });
}

export function useDeleteCandidateAttachment(wsId: string, deptId: string, candidateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => candidateAttachmentService.delete(wsId, deptId, candidateId, attachmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.attachments(wsId, deptId, candidateId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}
