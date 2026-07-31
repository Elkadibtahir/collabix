import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from './announcement-service';
import type { CreateAnnouncementRequest, UpdateAnnouncementRequest } from './announcement-service';

const annKeys = {
  all: (wsId: string) => ['announcements', wsId] as const,
  detail: (wsId: string, annId: string) => ['announcements', wsId, annId] as const,
};

export function useAnnouncementsList(wsId: string) {
  return useQuery({
    queryKey: annKeys.all(wsId),
    queryFn: () => announcementService.list(wsId),
    enabled: !!wsId,
  });
}

export function useAnnouncementDetail(wsId: string, annId: string | undefined) {
  return useQuery({
    queryKey: annKeys.detail(wsId, annId ?? ''),
    queryFn: () => announcementService.getById(wsId, annId!),
    enabled: !!wsId && !!annId,
  });
}

export function useCreateAnnouncement(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) =>
      announcementService.create(wsId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: annKeys.all(wsId) });
    },
  });
}

export function useUpdateAnnouncement(wsId: string, annId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAnnouncementRequest) =>
      announcementService.update(wsId, annId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: annKeys.all(wsId) });
    },
  });
}

export function useDeleteAnnouncement(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (annId: string) =>
      announcementService.delete(wsId, annId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: annKeys.all(wsId) });
    },
  });
}
