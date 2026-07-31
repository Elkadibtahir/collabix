import { useState, useMemo } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  FolderKanban,
  FileText,
  BookOpen,
  Bell,
  CalendarClock,
  Activity,
  Plus,
  Upload,
  StickyNote,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  ExternalLink,
  ChevronRight,
  File,
  FileSpreadsheet,
  Presentation,
  Star,
  AlertCircle,
  Info,
  Users,
  Building2,
  LayoutGrid,
  ListChecks,
  BellRing,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useUnreadNotifications } from '../services/notification-hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardBody, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar, AvatarGroup } from '../components/ui/Avatar';
import { Progress } from '../components/ui/Progress';
import { Table, type TableColumn } from '../components/ui/Table';
import { Tabs } from '../components/ui/Tabs';
import { Timeline } from '../components/ui/Timeline';
import { Tooltip } from '../components/ui/Tooltip';
import { IconButton } from '../components/ui/IconButton';
import { BarChart, LineChart, PieChart, ActivityChart } from '../components/ui/Charts';
import { cn } from '../lib/cn';
import { useToast } from '../components/ui/Toast';

/* ============================================================
   Types
============================================================ */

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee: string;
  progress: number;
}

interface Project {
  id: string;
  name: string;
  department: string;
  team: string;
  progress: number;
  dueDate: string;
  members: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
}

interface Deadline {
  id: string;
  task: string;
  project: string;
  dueDate: string;
  remaining: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface DocItem {
  id: string;
  name: string;
  type: 'doc' | 'sheet' | 'slides' | 'pdf';
  department: string;
  author: string;
  modified: string;
}

interface KbArticle {
  id: string;
  title: string;
  category: string;
  viewed: string;
  favorite: boolean;
}

interface QuickAccessItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

/* ============================================================
   Static UI config (no backend required)
============================================================ */

const quickAccess: QuickAccessItem[] = [
  { id: 'qa-projects', label: 'Projects', icon: FolderKanban, count: 0 },
  { id: 'qa-tasks', label: 'Tasks', icon: ListChecks, count: 0 },
  { id: 'qa-documents', label: 'Documents', icon: FileText, count: 0 },
  { id: 'qa-teams', label: 'Teams', icon: Users, count: 0 },
  { id: 'qa-knowledge', label: 'Knowledge Base', icon: BookOpen, count: 0 },
  { id: 'qa-notifications', label: 'Notifications', icon: BellRing, count: 0 },
  { id: 'qa-reports', label: 'Reports', icon: BarChart3, count: 0 },
  { id: 'qa-dashboard', label: 'Dashboard', icon: LayoutGrid, count: 0 },
];

/* ============================================================
   Helpers
============================================================ */

const priorityTone = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
} as const;

const statusBadge = {
  'on-track': { tone: 'success' as const, label: 'On Track' },
  'at-risk': { tone: 'warning' as const, label: 'At Risk' },
  delayed: { tone: 'danger' as const, label: 'Delayed' },
  completed: { tone: 'neutral' as const, label: 'Completed' },
};

const taskStatusBadge = {
  todo: { tone: 'neutral' as const, label: 'To Do' },
  'in-progress': { tone: 'accent' as const, label: 'In Progress' },
  review: { tone: 'info' as const, label: 'In Review' },
  done: { tone: 'success' as const, label: 'Done' },
};

const docIcon: Record<DocItem['type'], React.ReactNode> = {
  doc: <File className="h-4 w-4 text-accent-500" />,
  sheet: <FileSpreadsheet className="h-4 w-4 text-success-500" />,
  slides: <Presentation className="h-4 w-4 text-warning-500" />,
  pdf: <FileText className="h-4 w-4 text-danger-500" />,
};

const statToneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

/* ============================================================
   Section components
============================================================ */

function StatCard({ stat }: { stat: { id: string; label: string; value: number; icon: LucideIcon; trend: string; trendUp: boolean; sub: string; tone: string } }) {
  const Icon = stat.icon;
  return (
    <Card className="hover:shadow-cx-md transition-shadow duration-200">
      <CardBody className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]', statToneBg[stat.tone])}>
            <Icon />
          </div>
          <p className="text-2xs font-medium uppercase tracking-wide text-text-tertiary">{stat.label}</p>
          <p className="mt-1 text-page font-semibold text-text-primary leading-tight">{stat.value}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn('inline-flex items-center gap-0.5 text-2xs font-medium', stat.trendUp ? 'text-success-700 dark:text-success-500' : 'text-danger-700 dark:text-danger-500')}>
              {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {stat.trend}
            </span>
            <span className="text-2xs text-text-tertiary">{stat.sub}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

const defaultStats = [
  { id: 'assigned', label: 'Assigned Tasks', value: 0, icon: CheckSquare, trend: '-', trendUp: true, sub: 'No data', tone: 'accent' },
  { id: 'completed', label: 'Completed', value: 0, icon: CheckCircle2, trend: '-', trendUp: true, sub: 'No data', tone: 'success' },
  { id: 'projects', label: 'Projects', value: 0, icon: FolderKanban, trend: '-', trendUp: true, sub: 'No data', tone: 'info' },
  { id: 'documents', label: 'Documents', value: 0, icon: FileText, trend: '-', trendUp: true, sub: 'No data', tone: 'neutral' },
  { id: 'knowledge', label: 'Knowledge Articles', value: 0, icon: BookOpen, trend: '-', trendUp: true, sub: 'No data', tone: 'accent' },
  { id: 'notifications', label: 'Unread Notifications', value: 0, icon: Bell, trend: '-', trendUp: true, sub: 'No data', tone: 'warning' },
  { id: 'deadlines', label: 'Upcoming Deadlines', value: 0, icon: CalendarClock, trend: '-', trendUp: true, sub: 'No data', tone: 'danger' },
  { id: 'activity', label: 'Activity Score', value: 0, icon: Activity, trend: '-', trendUp: true, sub: 'No data', tone: 'success' },
];

function WelcomeHeader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const displayName = user?.firstName ?? 'User';
  const displayInitials = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <Card className="overflow-hidden">
      <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={displayInitials} size="lg" />
          <div>
            <p className="text-caption text-text-tertiary">{dateStr} · {timeStr}</p>
            <h1 className="mt-0.5 text-display font-semibold text-text-primary">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-1 text-body text-text-secondary">
              <span className="font-semibold text-accent-600 dark:text-accent-400">0 tasks</span> to complete today.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="neutral" variant="soft">Active</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button size="sm" leftIcon={<Plus />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>New Project</Button>
          <Button size="sm" variant="outline" leftIcon={<Plus />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>New Task</Button>
          <Button size="sm" variant="outline" leftIcon={<Upload />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Upload</Button>
          <Button size="sm" variant="outline" leftIcon={<StickyNote />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Note</Button>
        </div>
      </CardBody>
    </Card>
  );
}

function StatisticsOverview() {
  return (
    <div>
      <SectionHeader title="Statistics Overview" description="Your work at a glance" />
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {defaultStats.map((s) => <StatCard key={s.id} stat={s} />)}
      </div>
    </div>
  );
}

function MyTasks() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('today');
  const [search, setSearch] = useState('');

  const tasks: Task[] = [];

  const filtered = useMemo(() => {
    if (activeTab === 'today') return tasks.filter((t) => t.deadline.includes('Today'));
    if (activeTab === 'all') return tasks;
    if (activeTab === 'mine') return tasks;
    return tasks;
  }, [activeTab]);

  const searched = useMemo(() => {
    if (!search) return filtered;
    return filtered.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [filtered, search]);

  const columns: TableColumn<Task>[] = [
    {
      key: 'title',
      header: 'Task',
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-2xs text-text-tertiary">{r.id}</span>
          <span className="font-medium text-text-primary">{r.title}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      sortValue: (r) => r.priority,
      render: (r) => <Badge tone={priorityTone[r.priority]} variant="soft">{r.priority}</Badge>,
    },
    {
      key: 'deadline',
      header: 'Deadline',
      sortable: true,
      sortValue: (r) => r.deadline,
      render: (r) => <span className="text-caption text-text-secondary">{r.deadline}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={taskStatusBadge[r.status].tone} variant="soft" dot>{taskStatusBadge[r.status].label}</Badge>,
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar name={r.assignee} size="xs" />
          <span className="text-caption text-text-secondary">{r.assignee.split(' ')[0]}</span>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      sortable: true,
      sortValue: (r) => r.progress,
      render: (r) => (
        <div className="flex items-center gap-2 w-28">
          <Progress value={r.progress} size="sm" tone={r.progress === 100 ? 'success' : 'accent'} />
          <span className="text-2xs text-text-tertiary w-8">{r.progress}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {r.status !== 'done' && (
            <Tooltip content="Mark complete">
              <IconButton label="Complete" variant="ghost" size="sm" className="h-7 w-7" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
                <Check className="h-3.5 w-3.5" />
              </IconButton>
            </Tooltip>
          )}
            <Tooltip content="Open task">
              <IconButton label="Open" variant="ghost" size="sm" className="h-7 w-7" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
                <ExternalLink className="h-3.5 w-3.5" />
              </IconButton>
            </Tooltip>
          <IconButton label="More" variant="ghost" size="sm" className="h-7 w-7" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
            <MoreHorizontal className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="My Tasks"
        description="Tasks assigned to you across all projects"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="cx-input h-8 pl-8 w-40 text-caption"
              />
            </div>
            <Button size="sm" variant="outline" leftIcon={<Filter />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Filter</Button>
          </div>
        }
      />
      <Tabs
        items={[
          { id: 'today', label: 'Today', count: 0 },
          { id: 'mine', label: 'Assigned to me', count: 0 },
          { id: 'all', label: 'All', count: tasks.length },
        ]}
        active={activeTab}
        onChange={setActiveTab}
        className="mb-4"
      />
      <Table
        columns={columns}
        rows={searched}
        rowKey={(r) => r.id}
        pageSize={5}
        searchable={false}
        emptyTitle="No tasks found"
        emptyDescription="Connect a project to see your tasks here."
      />
    </div>
  );
}

function MyProjects() {
  const { toast } = useToast();
  const projects: Project[] = [];

  return (
    <div>
      <SectionHeader title="My Projects" description="Active projects in your team" action={<Button size="sm" variant="outline" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>View all</Button>} />
      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="hover:shadow-cx-md transition-shadow duration-200">
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">{p.name}</p>
                    <p className="mt-0.5 text-caption text-text-tertiary">{p.department} · {p.team}</p>
                  </div>
                  <Badge tone={statusBadge[p.status].tone} variant="soft" dot>{statusBadge[p.status].label}</Badge>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-2xs font-medium text-text-tertiary">Progress</span>
                    <span className="text-2xs font-semibold text-text-secondary">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} size="sm" tone={p.progress >= 80 ? 'success' : p.progress >= 50 ? 'accent' : 'warning'} />
                </div>
                <div className="flex items-center justify-between">
                  <AvatarGroup names={p.members} size="xs" max={4} />
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-caption text-text-tertiary">
                      <CalendarClock className="h-3.5 w-3.5" /> {p.dueDate}
                    </span>
                    <Badge tone={priorityTone[p.priority]} variant="soft">{p.priority}</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderKanban className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No projects available</p>
              <p className="text-caption text-text-tertiary mt-1">Create a project to get started.</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function DepartmentOverview() {
  return (
    <div>
      <SectionHeader title="Department Overview" description="No department data" />
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-8 text-center">
          <Building2 className="h-10 w-10 text-text-tertiary mb-3" />
          <p className="text-body font-medium text-text-primary">No department data available</p>
          <p className="text-caption text-text-tertiary mt-1">Department information will appear once you join a workspace.</p>
        </CardBody>
      </Card>
    </div>
  );
}

function MyTeams() {
  const { toast } = useToast();
  const teams: { id: string; name: string; members: string[]; projects: number; openTasks: number }[] = [];

  if (teams.length === 0) {
    return (
      <div>
        <SectionHeader title="My Teams" description="Teams you belong to" />
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No teams yet</p>
              <p className="text-caption text-text-tertiary mt-1">Join or create a team to get started.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="My Teams" description="Teams you belong to" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t) => (
          <Card key={t.id} className="hover:shadow-cx-md transition-shadow duration-200">
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300">
                    <Users className="h-[18px] w-[18px]" />
                  </div>
                  <p className="font-semibold text-text-primary">{t.name}</p>
                </div>
                <IconButton label="Open team" variant="ghost" size="sm" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
                  <ChevronRight />
                </IconButton>
              </div>
              <div className="flex items-center justify-between">
                <AvatarGroup names={t.members} size="xs" max={4} />
                <div className="flex gap-4 text-caption">
                  <div>
                    <p className="font-semibold text-text-primary">{t.projects}</p>
                    <p className="text-2xs text-text-tertiary">Projects</p>
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{t.openTasks}</p>
                    <p className="text-2xs text-text-tertiary">Open Tasks</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ActivityTimeline() {
  return (
    <div>
      <SectionHeader title="Activity Timeline" description="Recent activity from your teams" />
      <Card>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-10 w-10 text-text-tertiary mb-3" />
            <p className="text-body font-medium text-text-primary">No recent activity</p>
            <p className="text-caption text-text-tertiary mt-1">Activity from your teams will appear here.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function RecentNotifications() {
  const { toast } = useToast();
  const { data: notifPage } = useUnreadNotifications('');

  const notifications = useMemo(() => {
    if (!notifPage?.content) return [];
    return notifPage.content.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.body ?? '',
      timestamp: n.createdAt,
      priority: n.priority as 'low' | 'medium' | 'high' | 'urgent',
      unread: n.status === 'UNREAD',
    }));
  }, [notifPage]);

  if (notifications.length === 0) {
    return (
      <div>
        <SectionHeader title="Recent Notifications" action={<Button size="sm" variant="ghost" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>View All</Button>} />
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No notifications</p>
              <p className="text-caption text-text-tertiary mt-1">You're all caught up!</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Recent Notifications" action={<Button size="sm" variant="ghost" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>View All</Button>} />
      <Card>
        <CardBody className="flex flex-col gap-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface',
                n.unread && 'bg-accent-50/40 dark:bg-accent-100/15',
              )}
            >
              <span className="mt-0.5 shrink-0 [&>svg]:h-4 [&>svg]:w-4">
                <Info className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-body font-medium text-text-primary truncate">{n.title}</p>
                  <span className="shrink-0 text-2xs text-text-tertiary">{n.timestamp}</span>
                </div>
                <p className="mt-0.5 text-caption text-text-tertiary line-clamp-1">{n.description}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge tone={priorityTone[n.priority] ?? 'neutral'} variant="soft">{n.priority}</Badge>
                  {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function UpcomingDeadlines() {
  const deadlines: Deadline[] = [];

  return (
    <div>
      <SectionHeader title="Upcoming Deadlines" description="Tasks and deliverables due soon" />
      <Card>
        <CardBody>
          {deadlines.length > 0 ? (
            <div className="flex flex-col">
              {deadlines.map((d, i) => (
                <div
                  key={d.id}
                  className={cn(
                    'flex items-center gap-3 py-3',
                    i !== deadlines.length - 1 && 'border-b border-border-subtle',
                  )}
                >
                  <span className={cn('h-8 w-1 rounded-full shrink-0', {
                    'bg-neutral-500': priorityTone[d.priority] === 'neutral',
                    'bg-info-500': priorityTone[d.priority] === 'info',
                    'bg-warning-500': priorityTone[d.priority] === 'warning',
                    'bg-danger-500': priorityTone[d.priority] === 'danger',
                  })} />
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-text-primary truncate">{d.task}</p>
                    <p className="text-caption text-text-tertiary">{d.project}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-caption font-medium text-text-secondary">{d.dueDate}</p>
                    <p className="text-2xs text-text-tertiary">{d.remaining}</p>
                  </div>
                  <Badge tone={priorityTone[d.priority]} variant="soft">{d.priority}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarClock className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No upcoming deadlines</p>
              <p className="text-caption text-text-tertiary mt-1">You're ahead of schedule!</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function RecentDocuments() {
  const { toast } = useToast();
  const docs: DocItem[] = [];

  return (
    <div>
      <SectionHeader title="Recent Documents" description="Recently edited files" />
      <Card>
        <CardBody>
          {docs.length > 0 ? (
            <div className="flex flex-col">
              {docs.map((doc, i) => (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center gap-3 py-3',
                    i !== docs.length - 1 && 'border-b border-border-subtle',
                  )}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 shrink-0">
                    {docIcon[doc.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-text-primary truncate">{doc.name}</p>
                    <p className="text-caption text-text-tertiary">{doc.department} · {doc.author}</p>
                  </div>
                  <span className="shrink-0 text-caption text-text-tertiary">{doc.modified}</span>
                  <IconButton label="Open" variant="ghost" size="sm" className="h-7 w-7" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No documents yet</p>
              <p className="text-caption text-text-tertiary mt-1">Upload a document to get started.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function KnowledgeBase() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const articles: KbArticle[] = [];
  const filtered = articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <SectionHeader title="Knowledge Base" description="Recently viewed articles" />
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="cx-input h-9 pl-9"
            />
          </div>
          {articles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Engineering', 'Security', 'DevOps'].map((cat) => (
                <button key={cat} className="rounded-md bg-surface-2 px-2.5 py-1 text-caption font-medium text-text-secondary hover:bg-border-subtle transition-colors" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col">
            {articles.length > 0 ? (
              filtered.map((a, i) => (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-center gap-3 py-2.5',
                    i !== filtered.length - 1 && 'border-b border-border-subtle',
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-text-primary truncate">{a.title}</p>
                    <p className="text-caption text-text-tertiary">{a.category} · viewed {a.viewed}</p>
                  </div>
                  {a.favorite && <Star className="h-4 w-4 text-warning-500 fill-warning-500 shrink-0" />}
                  <IconButton label="Open" variant="ghost" size="sm" className="h-7 w-7" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-10 w-10 text-text-tertiary mb-3" />
                <p className="text-body font-medium text-text-primary">No articles yet</p>
                <p className="text-caption text-text-tertiary mt-1">Knowledge base articles will appear here.</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function QuickAccess() {
  const { toast } = useToast();
  return (
    <div>
      <SectionHeader title="Quick Access" description="Jump to any section" />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {quickAccess.map((qa) => {
          const Icon = qa.icon;
          return (
            <button
              key={qa.id}
              className="group flex items-center gap-3 rounded-xl border border-border-subtle bg-elevated p-3 text-left hover:shadow-cx-md hover:border-border-default transition-all duration-150"
              onClick={() => toast({ title: 'Coming soon', tone: 'info' })}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-secondary group-hover:bg-accent-50 group-hover:text-accent-600 dark:group-hover:bg-accent-100 dark:group-hover:text-accent-300 transition-colors">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-body font-medium text-text-primary truncate">{qa.label}</p>
                {qa.count > 0 && <p className="text-2xs text-text-tertiary">{qa.count} items</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarWidget() {
  const [currentMonth] = useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();

  const events: Record<number, { type: string; tone: string }[]> = {};

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <SectionHeader title="Calendar" description={monthName} />
      <Card>
        <CardBody>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-2xs font-semibold uppercase text-text-tertiary py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const dayEvents = events[d] || [];
              const isToday = d === today;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg py-1.5 text-caption transition-colors',
                    isToday ? 'bg-accent-600 text-white font-semibold' : 'text-text-secondary hover:bg-surface-2',
                  )}
                >
                  <span>{d}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayEvents.map((e, j) => (
                        <span
                          key={j}
                          className={cn('h-1 w-1 rounded-full', {
                            'bg-accent-500': e.tone === 'accent',
                            'bg-danger-500': e.tone === 'danger',
                            'bg-success-500': e.tone === 'success',
                            'bg-warning-500': e.tone === 'warning',
                            'bg-info-500': e.tone === 'info',
                            'bg-white': isToday,
                          })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-border-subtle pt-3">
            <span className="flex items-center gap-1.5 text-2xs text-text-tertiary"><span className="h-2 w-2 rounded-full bg-accent-500" /> Meetings</span>
            <span className="flex items-center gap-1.5 text-2xs text-text-tertiary"><span className="h-2 w-2 rounded-full bg-danger-500" /> Deadlines</span>
            <span className="flex items-center gap-1.5 text-2xs text-text-tertiary"><span className="h-2 w-2 rounded-full bg-success-500" /> Tasks</span>
            <span className="flex items-center gap-1.5 text-2xs text-text-tertiary"><span className="h-2 w-2 rounded-full bg-warning-500" /> Events</span>
          </div>
          {Object.keys(events).length === 0 && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <p className="text-caption text-text-tertiary">No events this month</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function PerformanceSummary() {
  return (
    <div>
      <SectionHeader title="Performance Summary" description="Your productivity at a glance" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed</CardTitle>
            <Badge tone="neutral" variant="soft" dot>No data</Badge>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No activity data</p>
              <p className="text-caption text-text-tertiary mt-1">Charts will appear when you have task activity.</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity Trend</CardTitle>
            <Badge tone="neutral" variant="soft" dot>No data</Badge>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No trend data</p>
              <p className="text-caption text-text-tertiary mt-1">Activity trends will appear once you have sufficient data.</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project Distribution</CardTitle>
            <Badge tone="neutral" variant="soft">0 projects</Badge>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No project data</p>
              <p className="text-caption text-text-tertiary mt-1">Project distribution will appear when projects are created.</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity Heatmap</CardTitle>
            <Badge tone="neutral" variant="soft">No data</Badge>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No activity data</p>
              <p className="text-caption text-text-tertiary mt-1">Heatmap will populate with your activity over time.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Dashboard Page
============================================================ */

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <WelcomeHeader />

      <StatisticsOverview />

      <MyTasks />

      <MyProjects />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2"><DepartmentOverview /></div>
        <div><ActivityTimeline /></div>
      </div>

      <MyTeams />

      <div className="grid gap-8 lg:grid-cols-2">
        <RecentNotifications />
        <UpcomingDeadlines />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RecentDocuments />
        <KnowledgeBase />
      </div>

      <QuickAccess />

      <div className="grid gap-8 lg:grid-cols-3">
        <div><CalendarWidget /></div>
        <div className="lg:col-span-2"><PerformanceSummary /></div>
      </div>
    </div>
  );
}
