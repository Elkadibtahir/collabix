import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import {
  AlertCircle,
  Network,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { Card, CardBody, SectionHeader, ViewToggle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/PageLoader';
import { Can } from '../pages/auth';
import { cn } from '../lib/cn';
import { useWorkspaceId } from '../hooks/useWorkspaceId';
import { useDepartmentList, useCreateDepartment } from '../services/department-hooks';

const statToneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

function KpiCard({ label, value, sub, tone }: {
  label: string;
  value: string | number;
  sub: string;
  tone: string;
}) {
  return (
    <Card className="hover:shadow-cx-md transition-shadow duration-200">
      <CardBody>
        <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{value}</p>
        <p className="mt-1 text-2xs text-text-tertiary">{sub}</p>
      </CardBody>
    </Card>
  );
}

function CreateDepartmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const wsId = useWorkspaceId();
  const { toast } = useToast();
  const createDept = useCreateDepartment();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createDept.mutateAsync({ workspaceId: wsId, data: { name: name.trim(), description: description.trim() || undefined } });
      toast({ title: 'Department created', tone: 'success' });
      setName('');
      setDescription('');
      onClose();
    } catch {
      toast({ title: 'Failed to create department', tone: 'danger' });
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Department" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Department Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering, Marketing" required />
        <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the department" />
        <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!name.trim() || createDept.isPending} loading={createDept.isPending}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}

export function DepartmentsPage() {
  const navigate = useNavigate();
  const wsId = useWorkspaceId();
  const { data: departments, isLoading, isError, error } = useDepartmentList(wsId);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!departments) return [];
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, search]);

  const totalTeams = useMemo(() => departments?.reduce((s, d) => s + (d.teamCount ?? 0), 0) ?? 0, [departments]);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-display font-semibold text-text-primary">Departments</h1>
            <Badge tone="success" variant="soft" dot>{departments?.length ?? 0} active</Badge>
          </div>
          <p className="mt-1 text-body text-text-secondary">Manage the departments inside the selected workspace.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="accent" variant="soft">{departments?.length ?? 0} departments</Badge>
            <Badge tone="neutral" variant="soft">{totalTeams} teams</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Can permission="DEPARTMENT_CREATE">
            <Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>Create Department</Button>
          </Can>
        </div>
      </div>

      <div>
        <SectionHeader title="Department Statistics" description="Key metrics across all departments" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <KpiCard label="Departments" value={departments?.length ?? 0} sub="in workspace" tone="accent" />
          <KpiCard label="Teams" value={totalTeams} sub="across departments" tone="info" />
          <KpiCard label="Projects" value="—" sub="active projects" tone="neutral" />
          <KpiCard label="Tasks" value="—" sub="open tasks" tone="warning" />
        </div>
      </div>

      <div>
        <SectionHeader
          title="All Departments"
          description="Browse and manage all departments"
          action={(
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-52 rounded-lg border border-border-default bg-surface-1 pl-8 pr-8 text-caption text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <ViewToggle mode={view} onChange={setView} modes={[{ id: 'grid', label: 'Grid' }, { id: 'list', label: 'List' }]} />
            </div>
          )}
        />
        {isLoading && <PageLoader />}
        {isError && (
          <Card>
            <CardBody className="py-16">
              <EmptyState
                icon={<AlertCircle className="h-6 w-6" />}
                title="Failed to load departments"
                description={error instanceof Error ? error.message : 'An error occurred while loading departments.'}
              />
            </CardBody>
          </Card>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <Card>
            <CardBody className="py-16">
              <EmptyState
                icon={<Network className="h-6 w-6" />}
                title={search ? 'No departments match your search' : 'No departments have been created yet.'}
                description={search ? 'Try a different search term.' : 'Create your first department to start organizing teams and members within this workspace.'}
                action={!search && <Can permission="DEPARTMENT_CREATE"><Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>Create Department</Button></Can>}
              />
            </CardBody>
          </Card>
        )}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className={cn(
            view === 'grid'
              ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-2'
          )}>
            {filtered.map((dept) => (
              <button
                key={dept.id}
                onClick={() => navigate(`/app/departments/${dept.id}${wsId ? `?ws=${wsId}` : ''}`)}
                className="text-left w-full"
              >
                <Card className="hover:shadow-cx-md transition-shadow duration-200 cursor-pointer">
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300">
                          <Network className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-body font-semibold text-text-primary">{dept.name}</p>
                          <p className="text-caption text-text-tertiary">{dept.teamCount ?? 0} teams</p>
                        </div>
                      </div>
                      {view === 'grid' && (
                        <Badge tone={dept.status === 'ACTIVE' ? 'success' : 'warning'} variant="soft">{dept.status}</Badge>
                      )}
                    </div>
                    {view === 'list' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge tone={dept.status === 'ACTIVE' ? 'success' : 'warning'} variant="soft">{dept.status}</Badge>
                        <span className="text-caption text-text-tertiary">{dept.teamCount ?? 0} teams</span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateDepartmentModal open={showCreate} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
