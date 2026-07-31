import { useState } from 'react';
import { useToast } from '../components/ui/Toast';
import {
  Building2,
  Network,
  Users,
  UserPlus,
  FolderKanban,
  CheckSquare,
  Shield,
  Activity,
  Mail,
  UserCheck,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/cn';

const statToneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

function KpiCard({ label, value, sub, icon, tone }: {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  tone: string;
}) {
  const Icon = icon;
  return (
    <Card className="hover:shadow-cx-md transition-shadow duration-200">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]', statToneBg[tone])}>
            <Icon />
          </div>
        </div>
        <p className="mt-3 text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{value}</p>
        <p className="mt-1 text-2xs text-text-tertiary">{sub}</p>
      </CardBody>
    </Card>
  );
}

export function OrganizationPage() {
  const { toast } = useToast();
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-display font-semibold text-text-primary">Organization</h1>
            <Badge tone="success" variant="soft" dot>Active</Badge>
          </div>
          <p className="mt-1 text-body text-text-secondary">Manage the organizational structure of the selected workspace.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="accent" variant="soft" dot>Workspace</Badge>
            <Badge tone="neutral" variant="soft">0 members</Badge>
            <Badge tone="neutral" variant="soft">0 departments</Badge>
            <Badge tone="neutral" variant="soft">0 teams</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button leftIcon={<Plus />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Department</Button>
          <Button variant="outline" leftIcon={<Plus />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Team</Button>
          <Button variant="outline" leftIcon={<UserPlus />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Invite Member</Button>
        </div>
      </div>

      <div>
        <SectionHeader title="Organization Summary" description="Key metrics at a glance" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <KpiCard label="Departments" value={0} sub="across workspace" icon={Network} tone="accent" />
          <KpiCard label="Teams" value={0} sub="in all departments" icon={Users} tone="info" />
          <KpiCard label="Members" value={0} sub="total people" icon={UserPlus} tone="accent" />
          <KpiCard label="Managers" value={0} sub="team leads & admins" icon={Shield} tone="neutral" />
          <KpiCard label="Active Members" value={0} sub="currently online" icon={Activity} tone="success" />
          <KpiCard label="Pending Invitations" value={0} sub="awaiting response" icon={Mail} tone="warning" />
          <KpiCard label="Recently Joined" value={0} sub="in last 30 days" icon={UserCheck} tone="info" />
          <KpiCard label="Projects" value={0} sub="across departments" icon={FolderKanban} tone="neutral" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeader title="Departments" description="Organizational units within this workspace" />
          <Card>
            <CardBody className="py-12">
              <EmptyState
                icon={<Network className="h-6 w-6" />}
                title="Organization data not yet available"
                description="Department, team and member data will appear once the workspace is set up and connected to the backend."
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
