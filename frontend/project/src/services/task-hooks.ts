import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  taskService,
  commentService,
  attachmentService,
  activityService,
  checklistService,
} from './task-service';
import type {
  TaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  AttachmentResponse,
  CreateAttachmentRequest,
  ActivityResponse,
  CreateActivityRequest,
  ChecklistResponse,
  CreateChecklistRequest,
  UpdateChecklistRequest,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
} from '../pages/tasks/tasks-types';
import type { PageResponse } from '../types/api';

const taskKeys = {
  all: ['tasks'] as const,
  list: (wsId: string, deptId: string, projId: string, params?: Record<string, unknown>) =>
    ['tasks', 'list', wsId, deptId, projId, params] as const,
  detail: (wsId: string, deptId: string, projId: string, taskId: string) =>
    ['tasks', 'detail', wsId, deptId, projId, taskId] as const,
  archived: (wsId: string, deptId: string, projId: string) =>
    ['tasks', 'archived', wsId, deptId, projId] as const,
  comments: (wsId: string, deptId: string, projId: string, taskId: string) =>
    ['tasks', 'comments', wsId, deptId, projId, taskId] as const,
  attachments: (wsId: string, deptId: string, projId: string, taskId: string) =>
    ['tasks', 'attachments', wsId, deptId, projId, taskId] as const,
  activities: (wsId: string, deptId: string, projId: string, taskId: string) =>
    ['tasks', 'activities', wsId, deptId, projId, taskId] as const,
  checklists: (wsId: string, deptId: string, projId: string, taskId: string) =>
    ['tasks', 'checklists', wsId, deptId, projId, taskId] as const,
};

export function useTasksList(
  wsId: string, deptId: string, projId: string,
  params?: { search?: string; status?: string; priority?: string; assigneeId?: string; page?: number; size?: number },
) {
  return useQuery<PageResponse<TaskResponse>>({
    queryKey: taskKeys.list(wsId, deptId, projId, params),
    queryFn: () => taskService.list(wsId, deptId, projId, params),
    enabled: !!wsId && !!deptId && !!projId,
  });
}

export function useArchivedTasksList(wsId: string, deptId: string, projId: string) {
  return useQuery<TaskResponse[]>({
    queryKey: taskKeys.archived(wsId, deptId, projId),
    queryFn: () => taskService.listArchived(wsId, deptId, projId),
    enabled: !!wsId && !!deptId && !!projId,
  });
}

export function useTaskDetail(wsId: string, deptId: string, projId: string, taskId: string | undefined) {
  return useQuery<TaskResponse>({
    queryKey: taskKeys.detail(wsId, deptId, projId, taskId ?? ''),
    queryFn: () => taskService.getById(wsId, deptId, projId, taskId!),
    enabled: !!wsId && !!deptId && !!projId && !!taskId,
  });
}

export function useCreateTask(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(wsId, deptId, projId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list(wsId, deptId, projId) });
    },
  });
}

export function useUpdateTask(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskRequest) => taskService.update(wsId, deptId, projId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list(wsId, deptId, projId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(wsId, deptId, projId, taskId) });
    },
  });
}

export function useDeleteTask(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskService.delete(wsId, deptId, projId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list(wsId, deptId, projId) });
    },
  });
}

export function useRestoreTask(wsId: string, deptId: string, projId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskService.restore(wsId, deptId, projId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list(wsId, deptId, projId) });
      qc.invalidateQueries({ queryKey: taskKeys.archived(wsId, deptId, projId) });
    },
  });
}

export function useCommentsList(wsId: string, deptId: string, projId: string, taskId: string) {
  return useQuery<PageResponse<CommentResponse>>({
    queryKey: taskKeys.comments(wsId, deptId, projId, taskId),
    queryFn: () => commentService.list(wsId, deptId, projId, taskId),
    enabled: !!wsId && !!deptId && !!projId && !!taskId,
  });
}

export function useCreateComment(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentService.create(wsId, deptId, projId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.comments(wsId, deptId, projId, taskId) });
    },
  });
}

export function useUpdateComment(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) =>
      commentService.update(wsId, deptId, projId, taskId, commentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.comments(wsId, deptId, projId, taskId) });
    },
  });
}

export function useDeleteComment(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentService.delete(wsId, deptId, projId, taskId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.comments(wsId, deptId, projId, taskId) });
    },
  });
}

export function useAttachmentsList(wsId: string, deptId: string, projId: string, taskId: string) {
  return useQuery<PageResponse<AttachmentResponse>>({
    queryKey: taskKeys.attachments(wsId, deptId, projId, taskId),
    queryFn: () => attachmentService.list(wsId, deptId, projId, taskId),
    enabled: !!wsId && !!deptId && !!projId && !!taskId,
  });
}

export function useCreateAttachment(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttachmentRequest) => attachmentService.create(wsId, deptId, projId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.attachments(wsId, deptId, projId, taskId) });
    },
  });
}

export function useDeleteAttachment(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => attachmentService.delete(wsId, deptId, projId, taskId, attachmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.attachments(wsId, deptId, projId, taskId) });
    },
  });
}

export function useActivitiesList(wsId: string, deptId: string, projId: string, taskId: string) {
  return useQuery<PageResponse<ActivityResponse>>({
    queryKey: taskKeys.activities(wsId, deptId, projId, taskId),
    queryFn: () => activityService.list(wsId, deptId, projId, taskId),
    enabled: !!wsId && !!deptId && !!projId && !!taskId,
  });
}

export function useChecklistsList(wsId: string, deptId: string, projId: string, taskId: string) {
  return useQuery<ChecklistResponse[]>({
    queryKey: taskKeys.checklists(wsId, deptId, projId, taskId),
    queryFn: () => checklistService.list(wsId, deptId, projId, taskId),
    enabled: !!wsId && !!deptId && !!projId && !!taskId,
  });
}

export function useCreateChecklist(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChecklistRequest) => checklistService.create(wsId, deptId, projId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.checklists(wsId, deptId, projId, taskId) });
    },
  });
}

export function useUpdateChecklist(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, data }: { checklistId: string; data: UpdateChecklistRequest }) =>
      checklistService.update(wsId, deptId, projId, taskId, checklistId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: taskKeys.checklists(wsId, deptId, projId, taskId) });
    },
  });
}

export function useDeleteChecklist(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checklistId: string) => checklistService.delete(wsId, deptId, projId, taskId, checklistId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.checklists(wsId, deptId, projId, taskId) });
    },
  });
}

export function useCreateChecklistItem(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, data }: { checklistId: string; data: CreateChecklistItemRequest }) =>
      checklistService.createItem(wsId, deptId, projId, taskId, checklistId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.checklists(wsId, deptId, projId, taskId) });
    },
  });
}

export function useUpdateChecklistItem(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, itemId, data }: { checklistId: string; itemId: string; data: UpdateChecklistItemRequest }) =>
      checklistService.updateItem(wsId, deptId, projId, taskId, checklistId, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.checklists(wsId, deptId, projId, taskId) });
    },
  });
}

export function useDeleteChecklistItem(wsId: string, deptId: string, projId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, itemId }: { checklistId: string; itemId: string }) =>
      checklistService.deleteItem(wsId, deptId, projId, taskId, checklistId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.checklists(wsId, deptId, projId, taskId) });
    },
  });
}
