import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
  MoreHorizontal,
  Eye,
  UserPlus,
  Edit2,
  UserX,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { IconButton } from '../../components/ui/IconButton';
import { Table } from '../../components/ui/Table';
import { Progress } from '../../components/ui/Progress';
import { Dropdown, type DropdownItem } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../lib/cn';
import { useToast } from '../../components/ui/Toast';
import { useUsersList } from '../../services/admin-hooks';
import type { MemberProfile, MemberFilters } from './members-types';
import { membersList } from './members-data';

type ViewMode = 'grid' | 'table';

export function MembersPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MemberFilters>({});
  const [sortBy, setSortBy] = useState<'name' | 'joinedDate' | 'workload'>('name');

  const filteredMembers = useMemo(() => {
    let result = membersList;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.jobTitle.toLowerCase().includes(q),
      );
    }

    if (filters.department) {
      result = result.filter((m) => m.department === filters.department);
    }
    if (filters.team) {
      result = result.filter((m) => m.team === filters.team);
    }
    if (filters.role) {
      result = result.filter((m) => m.role === filters.role);
    }
    if (filters.status) {
      result = result.filter((m) => m.status === filters.status);
    }
    if (filters.employmentType) {
      result = result.filter((m) => m.employmentType === filters.employmentType);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'joinedDate':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        case 'workload':
          return b.workload - a.workload;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [search, filters, sortBy]);

  const departments = Array.from(new Set(membersList.map((m) => m.department)));
  const teams = Array.from(new Set(membersList.map((m) => m.team)));
  const roles = Array.from(new Set(membersList.map((m) => m.role)));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Members</h1>
        <p className="text-body text-text-secondary">
          Manage all members inside the current workspace.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, title..."
              leftIcon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              containerClassName="w-full"
            />
          </div>

          <Dropdown
            trigger={
              <Button variant="outline" size="md">
                Department
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'All Departments', onClick: () => setFilters((f) => ({ ...f, department: undefined })) },
              { divider: true },
              ...departments.map((d) => ({
                label: d,
                onClick: () => setFilters((f) => ({ ...f, department: d })),
              })),
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="outline" size="md">
                Team
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'All Teams', onClick: () => setFilters((f) => ({ ...f, team: undefined })) },
              { divider: true },
              ...teams.map((t) => ({
                label: t,
                onClick: () => setFilters((f) => ({ ...f, team: t })),
              })),
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="outline" size="md">
                Role
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'All Roles', onClick: () => setFilters((f) => ({ ...f, role: undefined })) },
              { divider: true },
              ...roles.map((r) => ({
                label: r.charAt(0).toUpperCase() + r.slice(1),
                onClick: () => setFilters((f) => ({ ...f, role: r })),
              })),
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="outline" size="md">
                Sort
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'Name (A-Z)', onClick: () => setSortBy('name') },
              { label: 'Recently Joined', onClick: () => setSortBy('joinedDate') },
              { label: 'Highest Workload', onClick: () => setSortBy('workload') },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 border border-border-subtle rounded-lg p-1">
            <IconButton
              label="Grid view"
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="Table view"
              variant={viewMode === 'table' ? 'solid' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 w-8"
            >
              <LayoutList className="h-4 w-4" />
            </IconButton>
          </div>

          <Button leftIcon={<Plus />} onClick={() => toast({ title: 'Coming Soon', description: 'Invite member feature is coming soon.' })}>Invite Member</Button>
        </div>
      </div>

      {/* Content */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No members found"
          description="Try adjusting your search or filters to find members."
        />
      ) : viewMode === 'grid' ? (
        <MembersGridView members={filteredMembers} />
      ) : (
        <MembersTableView members={filteredMembers} />
      )}
    </div>
  );
}

function MembersGridView({ members }: { members: MemberProfile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

function MemberCard({ member }: { member: MemberProfile }) {
  const statusColor: Record<typeof member.status, string> = {
    active: 'success',
    away: 'warning',
    offline: 'neutral',
    inactive: 'danger',
  };

  const availabilityColor: Record<typeof member.availability, string> = {
    available: 'success',
    busy: 'danger',
    away: 'warning',
    offline: 'neutral',
  };

  const actionItems: DropdownItem[] = [
    { label: 'View Profile', icon: <Eye className="h-4 w-4" />, onClick: () => {} },
    { label: 'Assign Project', icon: <Plus className="h-4 w-4" />, onClick: () => {} },
    { label: 'Assign Team', icon: <UserPlus className="h-4 w-4" />, onClick: () => {} },
    { divider: true },
    { label: 'Edit', icon: <Edit2 className="h-4 w-4" />, onClick: () => {} },
    { label: 'Deactivate', icon: <UserX className="h-4 w-4" />, danger: true, onClick: () => {} },
  ];

  return (
    <Card className="flex flex-col overflow-hidden hover:border-border-default transition-colors group">
      <CardBody className="flex flex-col gap-4">
        {/* Header with avatar and actions */}
        <div className="flex items-start justify-between gap-3">
          <Avatar name={member.name} size="lg" tone={member.tone} />
          <Dropdown trigger={<IconButton label="Actions" variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></IconButton>} items={actionItems} align="right" />
        </div>

        {/* Member info */}
        <div className="flex flex-col gap-1">
          <div>
            <h3 className="text-body font-semibold text-text-primary">{member.name}</h3>
            <p className="text-caption text-text-secondary">{member.jobTitle}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="accent" variant="soft" dot>
              {member.department}
            </Badge>
            <Badge tone="info" variant="soft" dot>
              {member.role}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 border-t border-border-subtle pt-3">
          <DetailRow icon={<Briefcase />} label={member.team} />
          <DetailRow icon={<Clock />} label={member.lastActive} />
          <DetailRow icon={<CheckCircle2 />} label={`${member.currentTasks} tasks`} />
        </div>

        {/* Workload */}
        <div className="space-y-1.5 border-t border-border-subtle pt-3">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-text-tertiary">Workload</span>
            <span className="text-2xs font-semibold text-text-primary">{member.workload}%</span>
          </div>
          <Progress value={member.workload} size="sm" />
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 border-t border-border-subtle pt-3">
          <Badge tone={statusColor[member.status] as any} variant="soft" dot>
            {member.status}
          </Badge>
          <Badge tone={availabilityColor[member.availability] as any} variant="soft" dot>
            {member.availability}
          </Badge>
        </div>
      </CardBody>
    </Card>
  );
}

function DetailRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-caption text-text-secondary">
      <span className="shrink-0 text-text-tertiary [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function MembersTableView({ members }: { members: MemberProfile[] }) {
  const statusTones: Record<string, any> = {
    active: 'success',
    away: 'warning',
    offline: 'neutral',
    inactive: 'danger',
  };

  return (
    <Table
      columns={[
        {
          key: 'name',
          header: 'Member',
          sortable: true,
          width: '240px',
          render: (row: MemberProfile) => (
            <div className="flex items-center gap-2">
              <Avatar name={row.name} size="sm" tone={row.tone} />
              <div className="min-w-0">
                <p className="text-body font-medium text-text-primary truncate">{row.name}</p>
                <p className="text-caption text-text-tertiary truncate">{row.jobTitle}</p>
              </div>
            </div>
          ),
          sortValue: (row: MemberProfile) => row.name,
        },
        {
          key: 'department',
          header: 'Department',
          width: '140px',
          render: (row: MemberProfile) => <Badge tone="accent" variant="soft">{row.department}</Badge>,
        },
        {
          key: 'team',
          header: 'Team',
          width: '140px',
          render: (row: MemberProfile) => <span className="text-body text-text-secondary">{row.team}</span>,
        },
        {
          key: 'role',
          header: 'Role',
          width: '120px',
          render: (row: MemberProfile) => (
            <Badge tone="info" variant="soft">
              {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
            </Badge>
          ),
        },
        {
          key: 'projects',
          header: 'Projects',
          width: '100px',
          align: 'center',
          render: (row: MemberProfile) => (
            <Badge tone="neutral" variant="soft">
              {row.currentProjects}
            </Badge>
          ),
        },
        {
          key: 'tasks',
          header: 'Tasks',
          width: '100px',
          align: 'center',
          render: (row: MemberProfile) => (
            <Badge tone="neutral" variant="soft">
              {row.currentTasks}
            </Badge>
          ),
        },
        {
          key: 'workload',
          header: 'Workload',
          width: '140px',
          sortable: true,
          render: (row: MemberProfile) => (
            <div className="flex items-center gap-2">
              <Progress value={row.workload} size="sm" className="w-16" />
              <span className="text-caption font-medium text-text-tertiary min-w-[2.5rem] text-right">
                {row.workload}%
              </span>
            </div>
          ),
          sortValue: (row: MemberProfile) => row.workload,
        },
        {
          key: 'status',
          header: 'Status',
          width: '120px',
          render: (row: MemberProfile) => (
            <Badge tone={statusTones[row.status]} variant="soft" dot>
              {row.status}
            </Badge>
          ),
        },
        {
          key: 'lastActive',
          header: 'Last Active',
          width: '120px',
          render: (row: MemberProfile) => <span className="text-caption text-text-tertiary">{row.lastActive}</span>,
        },
        {
          key: 'actions',
          header: '',
          width: '80px',
          align: 'right',
          render: (row: MemberProfile) => (
            <div className="flex justify-end">
              <Dropdown
                trigger={<IconButton label="Actions" variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></IconButton>}
                items={[
                  { label: 'View Profile', icon: <Eye className="h-4 w-4" />, onClick: () => {} },
                  { label: 'Edit', icon: <Edit2 className="h-4 w-4" />, onClick: () => {} },
                  { label: 'Deactivate', icon: <UserX className="h-4 w-4" />, danger: true, onClick: () => {} },
                ]}
                align="right"
              />
            </div>
          ),
        },
      ]}
      rows={members}
      rowKey={(m) => m.id}
      pageSize={15}
      stickyHeader
      maxHeight="600px"
    />
  );
}
