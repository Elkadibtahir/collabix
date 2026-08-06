import { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Settings,
  Archive,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Clock,
  Calendar,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardBody, SectionHeader, ViewToggle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { IconButton } from '../../components/ui/IconButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Progress } from '../../components/ui/Progress';
import { Can } from '../../pages/auth';
import { cn } from '../../lib/cn';
import { useToast } from '../../components/ui/Toast';
import type { Team, TeamStatus, ModalState } from './types';
import { statusBadge } from './types';
import { useTeamsData } from './data';
import { TeamDetailsPanel } from './TeamDetailsPanel';
import { TeamModal } from './TeamModals';

/* ============================================================   Types & helpers
============================================================ */


type SortKey = 'name' | 'members' | 'projects' | 'tasks' | 'completion';

const statToneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

const productivityTone = (v: number): 'success' | 'info' | 'warning' | 'danger' =>
  v >= 80 ? 'success' : v >= 65 ? 'info' : v >= 45 ? 'warning' : 'danger';

/* ============================================================   KPI card
============================================================ */

function KpiCard({ label, value, sub, icon, tone, trend, trendUp }: {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  tone: string;
  trend?: string;
  trendUp?: boolean;
}) {
  const Icon = icon;
  return (
    <Card className="hover:shadow-cx-md transition-shadow duration-200">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]', statToneBg[tone])}>
            <Icon />
          </div>
          {trend && (
            <span className={cn('inline-flex items-center gap-0.5 text-2xs font-medium', trendUp ? 'text-success-700 dark:text-success-500' : 'text-danger-700 dark:text-danger-500')}>
              {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend}
            </span>
          )}
        </div>
        <p className="mt-3 text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{value}</p>
        <p className="mt-1 text-2xs text-text-tertiary">{sub}</p>
      </CardBody>
    </Card>
  );
}

/* ============================================================   Action menu
============================================================ */

function TeamActionMenu({ team, onAction }: { team: Team; onAction: (kind: 'view' | 'edit' | 'archive', team: Team) => void }) {
  const [open, setOpen] = useState(false);
  const isArchived = team.status === 'archived';
  const actions = [
    { id: 'view' as const, label: 'View Team', icon: ExternalLink },
    { id: 'edit' as const, label: 'Manage Team', icon: Settings },
    { id: 'archive' as const, label: isArchived ? 'Unarchive Team' : 'Archive Team', icon: Archive },
  ];
  return (
    <div className="relative">
      <IconButton label="Actions" variant="ghost" size="sm" className="h-8 w-8" onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal className="h-4 w-4" />
      </IconButton>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-48 rounded-lg border border-border-default bg-elevated shadow-cx-lg py-1">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => { onAction(a.id, team); setOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-body text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================   Team card
============================================================ */

function TeamCard({ team, onAction, onSelect }: {
  team: Team;
  onAction: (kind: 'view' | 'edit' | 'archive', team: Team) => void;
  onSelect: (team: Team) => void;
}) {
  const status = statusBadge[team.status];
  const memberNames = team.members.map((m) => m.name);
  return (
    <Card className="group hover:shadow-cx-md transition-shadow duration-200">
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <button onClick={() => onSelect(team)} className="flex items-start gap-3 min-w-0 text-left">
            <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0 [&>svg]:h-5 [&>svg]:w-5', statToneBg.neutral)}>
              <Users />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">{team.name}</p>
              <p className="mt-0.5 text-caption text-text-tertiary line-clamp-2">{team.description}</p>
            </div>
          </button>
          <TeamActionMenu team={team} onAction={onAction} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone} variant="soft" dot>{status.label}</Badge>
          <Badge tone="neutral" variant="soft">{team.department}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Avatar name={team.manager} size="xs" tone={team.managerTone} />
          <div>
            <p className="text-2xs text-text-tertiary">Team Manager</p>
            <p className="text-caption font-medium text-text-secondary">{team.manager}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border-subtle pt-3">
          <div>
            <p className="text-2xs text-text-tertiary">Members</p>
            <p className="text-body font-semibold text-text-primary">{team.memberCount}</p>
          </div>
          <div>
            <p className="text-2xs text-text-tertiary">Projects</p>
            <p className="text-body font-semibold text-text-primary">{team.activeProjects}</p>
          </div>
          <div>
            <p className="text-2xs text-text-tertiary">Open Tasks</p>
            <p className="text-body font-semibold text-text-primary">{team.openTasks}</p>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-2xs font-medium text-text-tertiary">Completion Rate</span>
            <span className="text-2xs font-semibold text-text-primary">{team.completionRate}%</span>
          </div>
          <Progress value={team.completionRate} size="sm" tone={productivityTone(team.completionRate)} />
        </div>

        <div className="flex items-center justify-between border-t border-border-subtle pt-3">
          <AvatarGroup names={memberNames} size="xs" max={5} />
          <span className="flex items-center gap-1.5 text-2xs text-text-tertiary">
            <Clock className="h-3 w-3" /> {team.createdAt}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

/* ============================================================   Table view
============================================================ */

function TeamTable({ teams, onAction, onSelect }: {
  teams: Team[];
  onAction: (kind: 'view' | 'edit' | 'archive', team: Team) => void;
  onSelect: (team: Team) => void;
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Team', 'Department', 'Manager', 'Members', 'Projects', 'Tasks', 'Completion', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const status = statusBadge[team.status];
              return (
                <tr key={team.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => onSelect(team)} className="flex items-center gap-2.5 text-left min-w-0">
                      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0 [&>svg]:h-4 [&>svg]:w-4', statToneBg.neutral)}>
                        <Users />
                      </span>
                      <div className="min-w-0">
                        <p className="text-body font-medium text-text-primary truncate hover:text-accent-600 dark:hover:text-accent-400 transition-colors">{team.name}</p>
                        <p className="text-2xs text-text-tertiary truncate max-w-[200px]">{team.description}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3"><Badge tone="neutral" variant="soft">{team.department}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={team.manager} size="xs" tone={team.managerTone} />
                      <span className="text-caption text-text-secondary truncate">{team.manager}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-caption text-text-secondary">{team.memberCount}</td>
                  <td className="px-4 py-3 text-caption text-text-secondary">{team.activeProjects}</td>
                  <td className="px-4 py-3 text-caption text-text-secondary">{team.openTasks}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 w-28">
                      <Progress value={team.completionRate} size="sm" tone={productivityTone(team.completionRate)} />
                      <span className="text-2xs font-medium text-text-tertiary shrink-0">{team.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={status.tone} variant="soft" dot>{status.label}</Badge></td>
                  <td className="px-4 py-3 text-caption text-text-tertiary whitespace-nowrap">{team.createdAt}</td>
                  <td className="px-4 py-3"><TeamActionMenu team={team} onAction={onAction} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================================================
   Page
============================================================ */

export function TeamsPage() {
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TeamStatus>('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [selected, setSelected] = useState<Team | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [showEmptyDemo, setShowEmptyDemo] = useState(false);
  const { toast } = useToast();
  const { teams: allTeams, departments, managers } = useTeamsData();

  const filtered = useMemo(() => {
    let list = allTeams.filter((t) => {
      const q = query.toLowerCase();
      const matchesQuery = !query || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchesDept = deptFilter === 'all' || t.department === deptFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesManager = managerFilter === 'all' || t.manager === managerFilter;
      return matchesQuery && matchesDept && matchesStatus && matchesManager;
    });
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'members': return b.memberCount - a.memberCount;
        case 'projects': return b.activeProjects - a.activeProjects;
        case 'tasks': return b.openTasks - a.openTasks;
        case 'completion': return b.completionRate - a.completionRate;
        default: return 0;
      }
    });
    return list;
  }, [query, deptFilter, statusFilter, managerFilter, sortBy, allTeams]);

  const totalMembers = allTeams.reduce((a, t) => a + t.memberCount, 0);
  const totalProjects = allTeams.reduce((a, t) => a + t.activeProjects, 0);
  const totalOpen = allTeams.reduce((a, t) => a + t.openTasks, 0);
  const totalCompleted = allTeams.reduce((a, t) => a + t.completedTasks, 0);
  const avgCompletion = allTeams.length > 0 ? Math.round(allTeams.reduce((a, t) => a + (t.completionRate ?? 0), 0) / allTeams.length) : 0;
  const avgWorkload = allTeams.length > 0 ? Math.round(allTeams.reduce((a, t) => a + (t.workload ?? 0), 0) / allTeams.length) : 0;
  const upcomingDeadlines = allTeams.reduce((a, t) => a + t.upcomingDeadlines, 0);

  function handleAction(kind: 'view' | 'edit' | 'archive', team: Team) {
    if (kind === 'view') setSelected(team);
    else if (kind === 'edit') setModal({ kind: 'edit', team });
    else if (kind === 'archive') setModal({ kind: 'archive', team });
  }

  function handlePanelAction(kind: 'edit' | 'archive' | 'assign' | 'change-manager' | 'move', team: Team) {
    setSelected(null);
    setModal({ kind, team });
  }

  const list = showEmptyDemo ? [] : filtered;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-display font-semibold text-text-primary">Teams</h1>
            <Badge tone="success" variant="soft" dot>Active</Badge>
          </div>
          <p className="mt-1 text-body text-text-secondary">Manage operational teams within your organization.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="accent" variant="soft" dot>Engineering Workspace</Badge>
            <Badge tone="neutral" variant="soft">{allTeams.length} teams</Badge>
            <Badge tone="neutral" variant="soft">{totalMembers} members</Badge>
            <Badge tone="neutral" variant="soft">{departments.length} departments</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Can permission="TEAM_CREATE">
            <Button leftIcon={<Plus />} onClick={() => setModal({ kind: 'create' })}>Create Team</Button>
          </Can>
          <Button variant="outline" leftIcon={<Settings />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Settings</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div>
        <SectionHeader title="Team Statistics" description="Key metrics across all teams" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <KpiCard label="Teams" value={allTeams.length} sub="in workspace" icon={Users} tone="accent" trend="+2" trendUp />
          <KpiCard label="Members" value={totalMembers} sub="across all teams" icon={Users} tone="info" trend="+5" trendUp />
          <KpiCard label="Projects" value={totalProjects} sub="active projects" icon={FolderKanban} tone="neutral" trend="+3" trendUp />
          <KpiCard label="Completed" value={totalCompleted} sub="tasks completed" icon={CheckSquare} tone="success" trend="+24" trendUp />
          <KpiCard label="Open Tasks" value={totalOpen} sub="in progress" icon={Clock} tone="warning" trend="-8" trendUp={false} />
          <KpiCard label="Avg Completion" value={`${avgCompletion}%`} sub="across teams" icon={TrendingUp} tone="success" trend="+4%" trendUp />
          <KpiCard label="Avg Workload" value={`${avgWorkload}%`} sub="current load" icon={Shield} tone="info" />
          <KpiCard label="Deadlines" value={upcomingDeadlines} sub="upcoming" icon={Calendar} tone="warning" />
        </div>
      </div>

      {/* Teams + toolbar */}
      <div>
        <SectionHeader title="All Teams" description="Browse and manage all teams" action={<ViewToggle mode={view} onChange={setView} modes={[{ id: 'grid', label: 'Grid' }, { id: 'table', label: 'Table' }]} />} />

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams..."
              className="cx-input h-10 pl-9 w-full"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect label="Department" value={deptFilter} onChange={setDeptFilter} options={['all', ...departments]} />
            <FilterSelect label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as 'all' | TeamStatus)} options={['all', 'active', 'forming', 'restructuring', 'archived']} />
            <FilterSelect label="Manager" value={managerFilter} onChange={setManagerFilter} options={['all', ...managers]} />
            <FilterSelect label="Sort" value={sortBy} onChange={(v) => setSortBy(v as SortKey)} options={['name', 'members', 'projects', 'tasks', 'completion']} />
          </div>
        </div>

        {list.length === 0 ? (
          <Card>
            <CardBody className="py-16">
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No teams have been created yet."
                description="Create your first team to start organizing members and projects within your departments."
                action={
                  <div className="flex flex-col items-center gap-2">
                    <Can permission="TEAM_CREATE">
                      <Button leftIcon={<Plus />} onClick={() => setModal({ kind: 'create' })}>Create Team</Button>
                    </Can>
                    {filtered.length > 0 && (
                      <button onClick={() => setShowEmptyDemo(false)} className="text-2xs text-text-tertiary hover:text-text-primary transition-colors">
                        Show existing teams
                      </button>
                    )}
                    {filtered.length === 0 && !showEmptyDemo && (
                      <span className="text-2xs text-text-tertiary">Try adjusting your filters.</span>
                    )}
                  </div>
                }
              />
            </CardBody>
          </Card>
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {list.map((t) => (
              <TeamCard key={t.id} team={t} onAction={handleAction} onSelect={setSelected} />
            ))}
          </div>
        ) : (
          <TeamTable teams={list} onAction={handleAction} onSelect={setSelected} />
        )}

        {filtered.length > 0 && !showEmptyDemo && (
          <div className="mt-4 flex justify-center">
            <button onClick={() => setShowEmptyDemo(true)} className="text-2xs text-text-tertiary hover:text-text-primary transition-colors">
              Preview empty state
            </button>
          </div>
        )}
      </div>

      {/* Details panel */}
      {selected && (
        <TeamDetailsPanel team={selected} onClose={() => setSelected(null)} onAction={handlePanelAction} />
      )}

      {/* Modals */}
      <TeamModal state={modal} onClose={() => setModal(null)} />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface p-0.5">
      <span className="px-2 py-1 text-2xs font-medium text-text-tertiary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md bg-transparent px-2 py-1 text-2xs capitalize text-text-secondary outline-none cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o === 'all' ? 'All' : o}</option>)}
      </select>
    </div>
  );
}
