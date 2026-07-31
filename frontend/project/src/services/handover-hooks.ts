import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  handoverEntryService,
  handoverJournalService,
  handoverAIService,
  type CreateHandoverEntryRequest,
  type UpdateHandoverEntryRequest,
  type HandoverAIGenerateRequest,
  type HandoverAIEditRequest,
} from './handover-service';

/* ---------- Query keys ---------- */

const handoverKeys = {
  entries: {
    all: (wsId: string, deptId: string, projId: string) =>
      ['handover', 'entries', wsId, deptId, projId] as const,
    detail: (wsId: string, deptId: string, projId: string, id: string) =>
      ['handover', 'entries', wsId, deptId, projId, id] as const,
  },
  journals: {
    all: (wsId: string, deptId: string, projId: string) =>
      ['handover', 'journals', wsId, deptId, projId] as const,
    detail: (wsId: string, deptId: string, projId: string, id: string) =>
      ['handover', 'journals', wsId, deptId, projId, id] as const,
  },
};

/* ========== Handover Entry Hooks ========== */

export function useHandoverEntries(wsId: string, deptId: string, projId: string, page?: number, size?: number) {
  const svc = handoverEntryService(wsId, deptId, projId);

  return useQuery({
    queryKey: handoverKeys.entries.all(wsId, deptId, projId),
    queryFn: () => svc.list(page, size),
    enabled: !!wsId && !!deptId && !!projId,
  });
}

export function useHandoverEntry(wsId: string, deptId: string, projId: string, entryId: string | undefined) {
  const svc = handoverEntryService(wsId, deptId, projId);

  return useQuery({
    queryKey: handoverKeys.entries.detail(wsId, deptId, projId, entryId ?? ''),
    queryFn: () => svc.getById(entryId!),
    enabled: !!wsId && !!deptId && !!projId && !!entryId,
  });
}

export function useCreateHandoverEntry(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  const svc = handoverEntryService(wsId, deptId, projId);

  return useMutation({
    mutationFn: (data: CreateHandoverEntryRequest) => svc.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: handoverKeys.entries.all(wsId, deptId, projId) });
    },
  });
}

export function useUpdateHandoverEntry(wsId: string, deptId: string, projId: string, entryId: string) {
  const qc = useQueryClient();
  const svc = handoverEntryService(wsId, deptId, projId);

  return useMutation({
    mutationFn: (data: UpdateHandoverEntryRequest) => svc.update(entryId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: handoverKeys.entries.all(wsId, deptId, projId) });
      qc.invalidateQueries({ queryKey: handoverKeys.entries.detail(wsId, deptId, projId, entryId) });
    },
  });
}

export function useDeleteHandoverEntry(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  const svc = handoverEntryService(wsId, deptId, projId);

  return useMutation({
    mutationFn: (entryId: string) => svc.delete(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: handoverKeys.entries.all(wsId, deptId, projId) });
    },
  });
}

/* ========== Handover Journal Hooks ========== */

export function useHandoverJournals(wsId: string, deptId: string, projId: string, page?: number, size?: number) {
  const svc = handoverJournalService(wsId, deptId, projId);

  return useQuery({
    queryKey: handoverKeys.journals.all(wsId, deptId, projId),
    queryFn: () => svc.list(page, size),
    enabled: !!wsId && !!deptId && !!projId,
  });
}

export function useHandoverJournal(wsId: string, deptId: string, projId: string, journalId: string | undefined) {
  const svc = handoverJournalService(wsId, deptId, projId);

  return useQuery({
    queryKey: handoverKeys.journals.detail(wsId, deptId, projId, journalId ?? ''),
    queryFn: () => svc.getById(journalId!),
    enabled: !!wsId && !!deptId && !!projId && !!journalId,
  });
}

export function useGenerateHandoverJournal(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  const svc = handoverJournalService(wsId, deptId, projId);

  return useMutation({
    mutationFn: () => svc.generate({ workspaceId: wsId, departmentId: deptId, projectId: projId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: handoverKeys.journals.all(wsId, deptId, projId) });
    },
  });
}

export function useRegenerateHandoverJournal(wsId: string, deptId: string, projId: string, journalId: string) {
  const qc = useQueryClient();
  const svc = handoverJournalService(wsId, deptId, projId);

  return useMutation({
    mutationFn: () => svc.regenerate(journalId, { workspaceId: wsId, departmentId: deptId, projectId: projId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: handoverKeys.journals.all(wsId, deptId, projId) });
      qc.invalidateQueries({ queryKey: handoverKeys.journals.detail(wsId, deptId, projId, journalId) });
    },
  });
}

export function useDeleteHandoverJournal(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  const svc = handoverJournalService(wsId, deptId, projId);

  return useMutation({
    mutationFn: (journalId: string) => svc.delete(journalId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: handoverKeys.journals.all(wsId, deptId, projId) });
    },
  });
}

/* ========== AI Handover Hooks ========== */

export function useAIGenerateHandover() {
  const svc = handoverAIService();

  return useMutation({
    mutationFn: (data: HandoverAIGenerateRequest) => svc.generate(data),
  });
}

export function useAIRegenerateHandover() {
  const svc = handoverAIService();

  return useMutation({
    mutationFn: ({ journalId, data }: { journalId: string; data: HandoverAIGenerateRequest }) =>
      svc.regenerate(journalId, data),
  });
}

export function useAIEditHandover() {
  const svc = handoverAIService();

  return useMutation({
    mutationFn: ({ journalId, data }: { journalId: string; data: HandoverAIEditRequest }) =>
      svc.edit(journalId, data),
  });
}

export function useAIApproveHandover() {
  const svc = handoverAIService();

  return useMutation({
    mutationFn: (journalId: string) => svc.approve(journalId),
  });
}

export function useAIRejectHandover() {
  const svc = handoverAIService();

  return useMutation({
    mutationFn: (journalId: string) => svc.reject(journalId),
  });
}
