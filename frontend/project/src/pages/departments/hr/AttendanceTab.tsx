import { useState } from 'react';
import { Plus, X, Loader2, Clock, Pencil } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Badge, type Tone } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Pagination } from '../../../components/ui/Pagination';
import { useToast } from '../../../components/ui/Toast';
import { Can } from '../../auth';
import { useEmployeesList } from '../../../services/employee-hooks';
import { useAttendanceList, useAttendanceStats, useCreateAttendance, useUpdateAttendance, useDeleteAttendance } from '../../../services/attendance-hooks';
import type { AttendanceResponse, CreateAttendanceRequest, UpdateAttendanceRequest } from '../../../services/attendance-service';
import { ATTENDANCE_STATUSES, attendanceStatusColor, formatEnum, formatDate } from './hr-constants';

export function AttendanceTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AttendanceResponse | null>(null);
  const [form, setForm] = useState<CreateAttendanceRequest>({ date: '', status: 'PRESENT' });
  const [editForm, setEditForm] = useState<UpdateAttendanceRequest>({ status: 'PRESENT' });

  const { toast } = useToast();
  const { data, isLoading, isError } = useAttendanceList(wsId, deptId, page);
  const { data: stats } = useAttendanceStats(wsId, deptId);
  const { data: empData } = useEmployeesList(wsId, deptId, 0, 100);
  const createAttendance = useCreateAttendance(wsId, deptId, form.employeeId ?? '');
  const updateAttendance = useUpdateAttendance(wsId, deptId);
  const deleteAttendance = useDeleteAttendance(wsId, deptId);

  const records = data?.content ?? [];
  const totalPages = data?.page?.totalPages ?? 1;
  const employees = empData?.content ?? [];

  const filtered = records.filter((r) => {
    if (employeeFilter && r.employeeId !== employeeFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ date: '', status: 'PRESENT', employeeId: '' });
    setShowForm(true);
  };

  const openEdit = (r: AttendanceResponse) => {
    setEditing(r);
    setEditForm({ status: r.status, checkInTime: r.checkInTime ?? '', checkOutTime: r.checkOutTime ?? '', notes: r.notes ?? '' });
    setShowForm(true);
  };

  const handleCreate = () => {
    if (!form.employeeId) {
      toast({ title: 'Select an employee', tone: 'warning' });
      return;
    }
    createAttendance.mutate(form, {
      onSuccess: () => {
        toast({ title: 'Attendance record created', tone: 'success' });
        setShowForm(false);
      },
      onError: () => toast({ title: 'Failed to create record', tone: 'danger' }),
    });
  };

  const handleUpdate = () => {
    if (!editing) return;
    updateAttendance.mutate({ id: editing.id, data: editForm }, {
      onSuccess: () => { toast({ title: 'Record updated', tone: 'success' }); setShowForm(false); },
      onError: () => toast({ title: 'Failed to update record', tone: 'danger' }),
    });
  };

  const handleDelete = (r: AttendanceResponse) => {
    if (!window.confirm(`Delete attendance record for ${r.employeeName} on ${r.date}?`)) return;
    deleteAttendance.mutate(r.id, {
      onSuccess: () => toast({ title: 'Record deleted', tone: 'success' }),
      onError: () => toast({ title: 'Failed to delete record', tone: 'danger' }),
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  if (isError) {
    return <div className="flex flex-col items-center justify-center py-20 gap-3"><p className="text-body font-medium text-danger-600">Failed to load attendance</p><p className="text-caption text-text-tertiary">Please try again later.</p></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Total Records</span>
            <span className="text-section font-bold text-text-primary">{stats.totalRecords}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Present</span>
            <span className="text-section font-bold text-success-600">{stats.presentDays}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Absent</span>
            <span className="text-section font-bold text-danger-600">{stats.absentDays}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Attendance Rate</span>
            <span className="text-section font-bold text-accent-600">{stats.attendanceRate.toFixed(1)}%</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={employeeFilter}
          onChange={(e) => { setEmployeeFilter(e.target.value); setPage(0); }}
          containerClassName="flex-1 min-w-[180px] max-w-xs"
          options={[{ value: '', label: 'All Employees' }, ...employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))]}
        />
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          containerClassName="w-48"
          options={[{ value: '', label: 'All Statuses' }, ...ATTENDANCE_STATUSES.map((s) => ({ value: s, label: formatEnum(s) }))]}
        />
        <Can permission="ATTENDANCE_CREATE">
          <Button leftIcon={<Plus />} onClick={openCreate}>Add Record</Button>
        </Can>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Clock />} title="No attendance records" description="Attendance records for employees will appear here." />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
              <div className="flex-1 min-w-[160px]">
                <p className="text-body font-medium text-text-primary">{r.employeeName}</p>
                <p className="text-caption text-text-tertiary">{formatDate(r.date)} • {r.employeeNumber}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-2xs text-text-tertiary">
                {r.checkInTime && <span>In: {r.checkInTime}</span>}
                {r.checkOutTime && <span>Out: {r.checkOutTime}</span>}
                {r.workedHours != null && <span>{r.workedHours}h</span>}
              </div>
              <Badge tone={(attendanceStatusColor[r.status] ?? 'neutral') as Tone} variant="soft" dot>{formatEnum(r.status)}</Badge>
              <div className="flex items-center gap-1">
                <IconButton label="Edit" variant="ghost" size="sm" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <Can permission="ATTENDANCE_DELETE">
                  <IconButton label="Delete" variant="ghost" size="sm" className="text-danger-600" onClick={() => handleDelete(r)}>
                    <X className="h-4 w-4" />
                  </IconButton>
                </Can>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Attendance Record' : 'New Attendance Record'}
        description={editing ? `${editing.employeeName} — ${formatDate(editing.date)}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            {editing ? (
              <Button onClick={handleUpdate}>Save</Button>
            ) : (
              <Button onClick={handleCreate} disabled={!form.date}>Create</Button>
            )}
          </>
        }
      >
        {editing ? (
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={editForm.status ?? 'PRESENT'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as never })}
              options={ATTENDANCE_STATUSES.map((s) => ({ value: s, label: formatEnum(s) }))} />
            <div />
            <Input label="Check-in (HH:mm)" value={editForm.checkInTime ?? ''} onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })} />
            <Input label="Check-out (HH:mm)" value={editForm.checkOutTime ?? ''} onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })} />
            <div className="col-span-2">
              <Textarea label="Notes" rows={3} value={editForm.notes ?? ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Select label="Employee" value={form.employeeId ?? ''} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              containerClassName="col-span-2"
              options={[{ value: '', label: 'Select employee...' }, ...employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))]} />
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as never })}
              options={ATTENDANCE_STATUSES.map((s) => ({ value: s, label: formatEnum(s) }))} />
            <Input label="Check-in (HH:mm)" value={form.checkInTime ?? ''} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} />
            <Input label="Check-out (HH:mm)" value={form.checkOutTime ?? ''} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} />
            <div className="col-span-2">
              <Textarea label="Notes" rows={3} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
