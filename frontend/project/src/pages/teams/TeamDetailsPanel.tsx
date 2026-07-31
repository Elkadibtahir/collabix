import {
  X,
  Users,
  CheckSquare,
  TrendingUp,
  Clock,
  UserPlus,
  Shield,
  ArrowRightLeft,
  Archive,
  MoreHorizontal,
  Calendar,
  Activity as ActivityIcon,
  FolderKanban,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Progress } from '../../components/ui/Progress';
import { IconButton } from '../../components/ui/IconButton';
import { Button } from '../../components/ui/Button';
import { Timeline } from '../../components/ui/Timeline';
import { cn } from '../../lib/cn';
import type { Team } from './types';
import { statusBadge, availabilityMeta, projectStatusMeta } from './types';

const statToneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

function productivityTone(v: number): 'success' | 'info' | 'warning' | 'danger' {
  return v >= 80 ? 'success' : v >= 65 ? 'info' : v >= 45 ? 'warning' : 'danger';
}

interface Props {
  team: Team;
  onClose: () => void;
  onAction: (kind: 'edit' | 'archive' | 'assign' | 'change-manager' | 'move', team: Team) => void;
}

export function TeamDetailsPanel({ team, onClose, onAction }: Props) {
  const status = statusBadge[team.status];
  const avgWorkload = Math.round(team.members.reduce((a, m) => a + m.workload, 0) / Math.max(team.members.length, 1));

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-text-primary/40 dark:bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className="relative h-full w-full max-w-xl bg-canvas border-l border-border-subtle shadow-cx-xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-page font-semibold text-text-primary truncate">{team.name}</h2>
              <Badge tone={status.tone} variant="soft" dot>{status.label}</Badge>
            </div>
            <p className="mt-0.5 text-caption text-text-tertiary truncate">{team.department} · Created {team.createdAt}</p>
          </div>
          <IconButton label="Close" variant="ghost" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* General info */}
          <section>
            <h3 className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-tertiary">General Information</h3>
            <p className="text-body text-text-secondary leading-relaxed">{team.description}</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border-subtle bg-surface px-3 py-2">
                <p className="text-2xs text-text-tertiary">Department</p>
                <p className="text-caption font-medium text-text-primary">{team.department}</p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface px-3 py-2">
                <p className="text-2xs text-text-tertiary">Manager</p>
                <div className="flex items-center gap-1.5">
                  <Avatar name={team.manager} tone={team.managerTone} />
                  <span className="text-caption font-medium text-text-primary truncate">{team.manager}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section>
            <h3 className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-tertiary">Statistics</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatTile icon={Users} tone="accent" label="Members" value={team.memberCount} />
              <StatTile icon={FolderKanban} tone="info" label="Projects" value={team.activeProjects} />
              <StatTile icon={CheckSquare} tone="success" label="Completed" value={team.completedTasks} />
              <StatTile icon={Clock} tone="warning" label="Open Tasks" value={team.openTasks} />
              <StatTile icon={TrendingUp} tone="neutral" label="Completion" value={`${team.completionRate}%`} />
              <StatTile icon={ActivityIcon} tone="info" label="Avg Workload" value={`${avgWorkload}%`} />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-2xs font-medium text-text-tertiary">Completion Rate</span>
                  <span className="text-2xs font-semibold text-text-primary">{team.completionRate}%</span>
                </div>
                <Progress value={team.completionRate} tone={productivityTone(team.completionRate)} />
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-2xs font-medium text-text-tertiary">Current Workload</span>
                  <span className="text-2xs font-semibold text-text-primary">{team.workload}%</span>
                </div>
                <Progress value={team.workload} tone={productivityTone(team.workload)} />
              </div>
            </div>
          </section>

          {/* Member list */}
          <section>
            <h3 className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-tertiary">Members</h3>
            <div className="flex flex-col gap-2">
              {team.members.map((m) => {
                const avail = availabilityMeta[m.availability];
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
                    <div className="relative">
                      <Avatar name={m.name} tone={m.tone} />
                      <span className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface', m.online ? 'bg-success-500' : 'bg-text-tertiary')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-medium text-text-primary truncate">{m.name}</p>
                      <p className="text-2xs text-text-tertiary">{m.role} · {m.position}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('h-2 w-2 rounded-full', avail.dot)} />
                        <span className="text-2xs text-text-tertiary">{avail.label}</span>
                      </div>
                      <div className="mt-0.5 w-20">
                        <Progress value={m.workload} tone={productivityTone(m.workload)} />
                      </div>
                    </div>
                    <MemberActionMenu />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Projects */}
          <section>
            <h3 className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-tertiary">Projects</h3>
            <div className="flex flex-col gap-2">
              {team.projects.map((p) => {
                const ps = projectStatusMeta[p.status];
                return (
                  <div key={p.id} className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-body font-medium text-text-primary truncate">{p.name}</p>
                      <Badge tone={ps.tone} variant="soft">{ps.label}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={p.progress} tone={productivityTone(p.progress)} />
                      <span className="text-2xs font-medium text-text-tertiary shrink-0">{p.progress}%</span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-2xs text-text-tertiary">
                      <Calendar className="h-3 w-3" /> {p.deadline}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent activity */}
          <section>
            <h3 className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-tertiary">Recent Activity</h3>
            <Card variant="inner">
              <CardBody>
                <Timeline items={team.activity.map((a) => ({ id: a.id, icon: <a.icon />, tone: a.tone, title: a.title, actor: a.actor, timestamp: a.timestamp }))} />
              </CardBody>
            </Card>
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 border-t border-border-subtle px-5 py-3">
          <Button variant="ghost" onClick={() => onAction('archive', team)} leftIcon={<Archive className="h-4 w-4" />}>
            Archive
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onAction('assign', team)} leftIcon={<UserPlus className="h-4 w-4" />}>
              Assign
            </Button>
            <Button variant="outline" onClick={() => onAction('move', team)} leftIcon={<ArrowRightLeft className="h-4 w-4" />}>
              Move
            </Button>
            <Button onClick={() => onAction('edit', team)} leftIcon={<Shield className="h-4 w-4" />}>
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function StatTile({ icon: Icon, tone, label, value }: { icon: typeof Users; tone: string; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
      <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg [&>svg]:h-3.5 [&>svg]:w-3.5', statToneBg[tone])}>
        <Icon />
      </span>
      <p className="mt-2 text-2xs text-text-tertiary">{label}</p>
      <p className="text-body font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function MemberActionMenu() {
  return (
    <div className="relative shrink-0">
      <IconButton label="Member actions" variant="ghost" className="h-7 w-7">
        <MoreHorizontal className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
