import { useState } from 'react';
import { Search, ChevronDown, MoreHorizontal, Users, Shield, UserPlus } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { useToast } from '../../../components/ui/Toast';
import { EmptyState } from '../../../components/ui/EmptyState';

interface Member {
  id: string;
  name: string;
  role: string;
  team: string;
  workload: number;
  initials: string;
  tone: number;
}

interface Team {
  id: string;
  name: string;
  lead: string;
  members: number;
}

interface DeptManagementData {
  members: Member[];
  teams: Team[];
}

export function DeptManagement({ data, wsId, deptId }: { data?: DeptManagementData; wsId?: string; deptId?: string }) {
  if (!data) {
    return <EmptyState icon={<Users />} title="Coming soon" description="Team management will be available in a future update." />;
  }
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'members' | 'teams'>('members');

  const filtered = data.members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.team.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface p-0.5">
          <button onClick={() => setTab('members')}
            className={`rounded-md px-3 py-1.5 text-caption font-medium transition-colors ${tab === 'members' ? 'bg-accent-600 text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            Members
          </button>
          <button onClick={() => setTab('teams')}
            className={`rounded-md px-3 py-1.5 text-caption font-medium transition-colors ${tab === 'teams' ? 'bg-accent-600 text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            Teams
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search..." leftIcon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} containerClassName="max-w-xs" />
          <Button leftIcon={<UserPlus />} size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Add Member</Button>
        </div>
      </div>

      {tab === 'members' ? (
        filtered.length === 0 ? (
          <EmptyState icon={<Users />} title="No members found" description="Add members to this department." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wide text-text-tertiary">Name</th>
                    <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wide text-text-tertiary">Role</th>
                    <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wide text-text-tertiary">Team</th>
                    <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wide text-text-tertiary">Workload</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.name} size="xs" tone={m.tone} />
                          <span className="text-body font-medium text-text-primary">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-caption text-text-secondary">{m.role}</td>
                      <td className="px-4 py-3">
                        <Badge tone="neutral" variant="soft">{m.team}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-24">
                          <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                            <div className={`h-full rounded-full ${m.workload > 80 ? 'bg-danger-500' : m.workload > 60 ? 'bg-warning-500' : 'bg-success-500'}`}
                              style={{ width: `${m.workload}%` }} />
                          </div>
                          <span className="text-2xs font-medium text-text-tertiary">{m.workload}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <IconButton label="Actions" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}><MoreHorizontal className="h-4 w-4" /></IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.teams.map((t) => (
            <Card key={t.id}>
              <CardBody className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-50 text-info-600 dark:bg-info-100 dark:text-info-300">
                  <Shield className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-text-primary">{t.name}</p>
                  <p className="text-2xs text-text-tertiary">Lead: {t.lead} • {t.members} members</p>
                </div>
                <IconButton label="Actions" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}><MoreHorizontal className="h-4 w-4" /></IconButton>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
