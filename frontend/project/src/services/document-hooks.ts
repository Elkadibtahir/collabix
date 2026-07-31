import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from './document-service';
import type { CreateDocumentRequest, UpdateDocumentRequest } from '../pages/knowledge/types/document-types';

const docKeys = {
  all: (wsId: string, deptId: string, projId: string) =>
    ['documents', wsId, deptId, projId] as const,
  detail: (wsId: string, deptId: string, projId: string, docId: string) =>
    ['documents', wsId, deptId, projId, docId] as const,
  workspace: (wsId: string) =>
    ['documents', 'workspace', wsId] as const,
};

export function useDocumentsList(wsId: string, deptId: string, projId: string) {
  return useQuery({
    queryKey: docKeys.all(wsId, deptId, projId),
    queryFn: () => documentService.list(wsId, deptId, projId),
    enabled: !!wsId && !!deptId && !!projId,
  });
}

export function useWorkspaceDocuments(wsId: string) {
  return useQuery({
    queryKey: docKeys.workspace(wsId),
    queryFn: () => documentService.listByWorkspace(wsId),
    enabled: !!wsId,
  });
}

export function useDocumentDetail(wsId: string, deptId: string, projId: string, docId: string | undefined) {
  return useQuery({
    queryKey: docKeys.detail(wsId, deptId, projId, docId ?? ''),
    queryFn: () => documentService.getById(wsId, deptId, projId, docId!),
    enabled: !!wsId && !!deptId && !!projId && !!docId,
  });
}

export function useCreateDocument(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentRequest) =>
      documentService.create(wsId, deptId, projId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
    },
  });
}

export function useUploadDocument(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, taskId, title, description, category, tags }: {
      file: File; taskId?: string; title?: string; description?: string; category?: string; tags?: string;
    }) => documentService.upload(wsId, deptId, projId, file, taskId, title, description, category, tags),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
    },
  });
}

export function useUpdateDocument(wsId: string, deptId: string, projId: string, docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDocumentRequest) =>
      documentService.update(wsId, deptId, projId, docId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
      qc.invalidateQueries({ queryKey: docKeys.detail(wsId, deptId, projId, docId) });
    },
  });
}

export function useDeleteDocument(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      documentService.delete(wsId, deptId, projId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
    },
  });
}

export function useArchiveDocument(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      documentService.archive(wsId, deptId, projId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
    },
  });
}

export function useRestoreDocument(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      documentService.restore(wsId, deptId, projId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
    },
  });
}

export function useSubmitForApproval(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      documentService.submitForApproval(wsId, deptId, projId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
    },
  });
}

export function useApproveDocument(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      documentService.approve(wsId, deptId, projId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
    },
  });
}

export function useRejectDocument(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      documentService.reject(wsId, deptId, projId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all(wsId, deptId, projId) });
    },
  });
}
