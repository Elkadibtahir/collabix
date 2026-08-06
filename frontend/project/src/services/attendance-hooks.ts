import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from './attendance-service';
import type { CreateAttendanceRequest, UpdateAttendanceRequest, CheckInRequest, CheckOutRequest } from './attendance-service';

const keys = {
  employeeHistory: (wsId: string, deptId: string, employeeId: string) => ['attendance', wsId, deptId, employeeId] as const,
  list: (wsId: string, deptId: string) => ['attendance', 'list', wsId, deptId] as const,
  detail: (wsId: string, deptId: string, id: string) => ['attendance', wsId, deptId, id] as const,
  stats: (wsId: string, deptId: string) => ['attendance', 'stats', wsId, deptId] as const,
};

export function useAttendanceByEmployee(wsId: string, deptId: string, employeeId: string | undefined) {
  return useQuery({ queryKey: keys.employeeHistory(wsId, deptId, employeeId ?? ''), queryFn: () => attendanceService.listByEmployee(wsId, deptId, employeeId!), enabled: !!wsId && !!deptId && !!employeeId });
}

export function useAttendanceList(wsId: string, deptId: string, page = 0, size = 10) {
  return useQuery({ queryKey: [...keys.list(wsId, deptId), page], queryFn: () => attendanceService.list(wsId, deptId, { page, size }), enabled: !!wsId && !!deptId });
}

export function useAttendanceDetail(wsId: string, deptId: string, attendanceId: string | undefined) {
  return useQuery({ queryKey: keys.detail(wsId, deptId, attendanceId ?? ''), queryFn: () => attendanceService.getById(wsId, deptId, attendanceId!), enabled: !!wsId && !!deptId && !!attendanceId });
}

export function useAttendanceStats(wsId: string, deptId: string) {
  return useQuery({ queryKey: keys.stats(wsId, deptId), queryFn: () => attendanceService.stats(wsId, deptId), enabled: !!wsId && !!deptId });
}

export function useAttendanceCheckIn(wsId: string, deptId: string, employeeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckInRequest) => attendanceService.checkIn(wsId, deptId, employeeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.employeeHistory(wsId, deptId, employeeId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}

export function useAttendanceCheckOut(wsId: string, deptId: string, employeeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data?: CheckOutRequest) => attendanceService.checkOut(wsId, deptId, employeeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.employeeHistory(wsId, deptId, employeeId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}

export function useCreateAttendance(wsId: string, deptId: string, employeeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttendanceRequest) => attendanceService.create(wsId, deptId, employeeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.employeeHistory(wsId, deptId, employeeId) });
      qc.invalidateQueries({ queryKey: keys.list(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}

export function useUpdateAttendance(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceRequest }) => attendanceService.update(wsId, deptId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}

export function useDeleteAttendance(wsId: string, deptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceService.delete(wsId, deptId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list(wsId, deptId) });
      qc.invalidateQueries({ queryKey: keys.stats(wsId, deptId) });
    },
  });
}
