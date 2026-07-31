import { useState } from 'react';
import { Search, Plus, ChevronDown, MoreHorizontal, Eye, UserPlus, X, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useCandidatesList, useCreateCandidate, useDeleteCandidate, useChangeCandidateStatus } from '../../../services/candidate-hooks';
import type { CreateCandidateRequest } from '../../../services/candidate-service';

const statusColors: Record<string, string> = {
  NEW: 'info',
  SCREENING: 'warning',
  INTERVIEW: 'accent',
  OFFER: 'success',
  HIRED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export function CandidatesTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCandidateRequest>({
    firstName: '', lastName: '', email: '', position: '', phone: '', source: 'APPLICATION',
  });

  const { data, isLoading, isError } = useCandidatesList(wsId, deptId);
  const createCandidate = useCreateCandidate(wsId, deptId);
  const deleteCandidate = useDeleteCandidate(wsId, deptId);
  const changeStatus = useChangeCandidateStatus(wsId, deptId);

  const candidates = data?.content ?? [];

  const filtered = candidates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.position.toLowerCase().includes(q);
  });

  const handleCreate = () => {
    createCandidate.mutate(form, {
      onSuccess: () => { setShowForm(false); setForm({ firstName: '', lastName: '', email: '', position: '', phone: '', source: 'APPLICATION' }); },
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  if (isError) {
    return <div className="flex flex-col items-center justify-center py-20 gap-3"><p className="text-body font-medium text-danger-600">Failed to load candidates</p><p className="text-caption text-text-tertiary">Please try again later.</p></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search candidates..." leftIcon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="max-w-sm" />
        <Button leftIcon={<Plus />} onClick={() => setShowForm(true)}>Add Candidate</Button>
      </div>

      {showForm && (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-body font-semibold text-text-primary">New Candidate</h3>
              <IconButton label="Close" variant="ghost" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></IconButton>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <Input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <div className="col-span-2">
                <Input placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!form.firstName || !form.lastName || !form.email || !form.position}>Create</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={<UserPlus />} title="No candidates found" description="Add candidates to start building your pipeline." />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300 text-body font-semibold">
                {c.firstName[0]}{c.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary">{c.firstName} {c.lastName}</p>
                <p className="text-caption text-text-tertiary">{c.position} • {c.email}</p>
              </div>
              <Badge tone={(statusColors[c.currentStatus] ?? 'neutral') as any} variant="soft">{c.currentStatus}</Badge>
              <div className="flex items-center gap-1">
                <IconButton label="Change Status" variant="ghost" size="sm"
                  onClick={() => changeStatus.mutate({ id: c.id, data: { newStatus: c.currentStatus === 'NEW' ? 'SCREENING' : c.currentStatus === 'SCREENING' ? 'INTERVIEW' : c.currentStatus === 'INTERVIEW' ? 'OFFER' : 'HIRED' } })}
                ><Eye className="h-4 w-4" /></IconButton>
                <IconButton label="Delete" variant="ghost" size="sm" className="text-danger-600"
                  onClick={() => deleteCandidate.mutate(c.id)}
                ><X className="h-4 w-4" /></IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
