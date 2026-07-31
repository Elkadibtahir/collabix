import { useState } from 'react';
import { Search, Plus, MoreHorizontal, X, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useEmployeesList, useCreateEmployee, useDeleteEmployee } from '../../../services/employee-hooks';
import type { CreateEmployeeRequest } from '../../../services/employee-service';

const statusColors: Record<string, string> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  PROBATION: 'info',
  TERMINATED: 'danger',
  ARCHIVED: 'neutral',
};

const typeColors: Record<string, string> = {
  FULL_TIME: 'accent',
  PART_TIME: 'info',
  CONTRACT: 'warning',
  INTERN: 'neutral',
};

export function EmployeesTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateEmployeeRequest>({
    firstName: '', lastName: '', email: '', position: '', employmentType: 'FULL_TIME', startDate: '',
  });

  const { data, isLoading, isError } = useEmployeesList(wsId, deptId);
  const createEmp = useCreateEmployee(wsId, deptId);
  const deleteEmp = useDeleteEmployee(wsId, deptId);

  const employees = data?.content ?? [];

  const filtered = employees.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.position.toLowerCase().includes(q);
  });

  const handleCreate = () => {
    createEmp.mutate(form, {
      onSuccess: () => { setShowForm(false); setForm({ firstName: '', lastName: '', email: '', position: '', employmentType: 'FULL_TIME', startDate: '' }); },
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  if (isError) {
    return <div className="flex flex-col items-center justify-center py-20 gap-3"><p className="text-body font-medium text-danger-600">Failed to load employees</p><p className="text-caption text-text-tertiary">Please try again later.</p></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search employees..." leftIcon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="max-w-sm" />
        <Button leftIcon={<Plus />} onClick={() => setShowForm(true)}>Add Employee</Button>
      </div>

      {showForm && (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-body font-semibold text-text-primary">New Employee</h3>
              <IconButton label="Close" variant="ghost" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></IconButton>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <Input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              <Input placeholder="Start Date (YYYY-MM-DD)" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                className="cx-input h-10 px-3">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!form.firstName || !form.lastName || !form.email || !form.position || !form.startDate}>Create</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={<Search />} title="No employees found" description="Add employees to start managing your team." />
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
              <Avatar name={`${e.firstName} ${e.lastName}`} size="sm" tone={0} />
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary">{e.firstName} {e.lastName}</p>
                <p className="text-caption text-text-tertiary">{e.position} • {e.employeeNumber}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Badge tone={(typeColors[e.employmentType] ?? 'neutral') as any} variant="soft">{e.employmentType.replace(/_/g, ' ')}</Badge>
                <Badge tone={(statusColors[e.employmentStatus] ?? 'neutral') as any} variant="soft">{e.employmentStatus.replace(/_/g, ' ')}</Badge>
              </div>
              <IconButton label="Delete" variant="ghost" size="sm" className="text-danger-600" onClick={() => deleteEmp.mutate(e.id)}>
                <X className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
