import { useMemo, useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  AtSign,
  Activity,
  FolderKanban,
  FileText,
  BookOpen,
  Bell,
  CalendarClock,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  File,
  FileSpreadsheet,
  Presentation,
  Loader2,
  AlertCircle,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { useUnreadNotifications } from '../services/notification-hooks';
import { usePersonalDashboard } from '../services/workspace-hooks';
import type { PersonalDashboardResponse } from '../services/workspace-service';
import { CreateProjectModal } from './projects/modals/CreateProjectModal';
import { Card, CardHeader, CardTitle, CardBody, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, type Tone } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Progress } from '../components/ui/Progress';
import { Table, type TableColumn } from '../components/ui/Table';
import { Tooltip } from '../components/ui/Tooltip';
import { IconButton } from '../components/ui/IconButton';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';

interface QuickAccessItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  path: string;
}

const quickAccess: QuickAccessItem[] = [
  { id: 'qa-projects', label: 'Projects', icon: FolderKanban, count: 0, path: '/app/projects' },
  { id: 'qa-tasks', label: 'My Tasks', icon: CheckSquare, count: 0, path: '/app/tasks' },
  { id: 'qa-documents', label: 'Documents', icon: FileText, count: 0, path: '/app/documents' },
  { id: 'qa-handover', label: 'Handover Journal', icon: ScrollText, count: 0, path: '/app/handover' },
  { id: 'qa-knowledge', label: 'Knowledge Base', icon: BookOpen, count: 0, path: '/app/knowledge' },
  { id: 'qa-notifications', label: 'Notifications', icon: Bell, count: 0, path: '/app/notifications' },
];

const priorityTone: Record<string, Tone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

const taskStatusBadge: Record<string, { tone: Tone; label: string }> = {
  todo: { tone: 'neutral', label: 'To Do' },
  'in-progress': { tone: 'accent', label: 'In Progress' },
  'in-review': { tone: 'info', label: 'In Review' },
  blocked: { tone: 'danger', label: 'Blocked' },
  completed: { tone: 'success', label: 'Done' },
  cancelled: { tone: 'neutral', label: 'Cancelled' },
  archived: { tone: 'neutral', label: 'Archived' },
};

const docIcon: Record<string, React.ReactNode> = {
  doc: <File className="h-4 w-4 text-accent-500" />,
  sheet: <FileSpreadsheet className="h-4 w-4 text-success-500" />,
  slides: <Presentation className="h-4 w-4 text-warning-500" />,
  pdf: <FileText className="h-4 w-4 text-danger-500" />,
  default: <FileText className="h-4 w-4 text-text-tertiary" />,
};

const statToneBg: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-100 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-100 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-100 dark:text-danger-500',
  info: 'bg-info-50 text-info-700 dark:bg-info-100 dark:text-info-500',
  neutral: 'bg-surface-2 text-text-secondary',
};

const statToneMap: Record<string, 'accent' | 'blue' | 'green' | 'teal' | 'purple' | 'orange' | 'amber' | 'cyan' | 'indigo' | 'emerald' | 'rose' | 'success' | 'warning' | 'danger' | 'info'> = {
  accent: 'purple',
  success: 'green',
  warning: 'amber',
  danger: 'rose',
  info: 'cyan',
  neutral: 'indigo',
}

function formatDate(instant: string | undefined): string {
  if (!instant) return '—';
  try {
    return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return instant;
  }
}

function WelcomeHeader({ dashboard, onNewProject }: { dashboard: PersonalDashboardResponse; onNewProject: () => void }) {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const displayName = user?.firstName ?? 'User';
  const displayInitials = user ? `${user.firstName} ${user.lastName}` : 'User';
  const openTasks = (dashboard.myTasks ?? []).filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;

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
              <span className="font-semibold text-accent-600 dark:text-accent-400">{openTasks} tasks</span> on your plate today.
            </p>
            <div className="mt-3">
              <Badge tone="neutral" variant="soft">Active</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button size="sm" leftIcon={<Plus />} onClick={onNewProject}>New Project</Button>
        </div>
      </CardBody>
    </Card>
  );
}

function StatCard({ icon, label, value, tone = 'accent' }: { icon: React.ReactNode; label: string; value: number | string; tone?: keyof typeof statToneMap }) {
  return (
    <div className="cx-card cx-card-hover flex items-center gap-3.5 p-4 animate-pop">
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5', statToneBg[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-2xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight text-text-primary">
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </p>
      </div>
    </div>
  );
}

function StatisticsOverview({ dashboard }: { dashboard: PersonalDashboardResponse }) {
  const stats = useMemo(
    () => [
      { id: 'assigned', label: 'Assigned Tasks', value: dashboard.myTasks?.length ?? 0, icon: <CheckSquare className="h-4 w-4" />, tone: 'accent' },
      { id: 'completed', label: 'Completed (this workspace)', value: dashboard.myTasks?.filter((t) => t.status === 'completed').length ?? 0, icon: <CheckCircle2 className="h-4 w-4" />, tone: 'success' },
      { id: 'overdue', label: 'Overdue', value: dashboard.overdueTasks ?? 0, icon: <Clock className="h-4 w-4" />, tone: 'danger' },
      { id: 'projects', label: 'Recent Projects', value: dashboard.recentWorkspaceProjects?.length ?? 0, icon: <FolderKanban className="h-4 w-4" />, tone: 'info' },
      { id: 'documents', label: 'Documents', value: dashboard.recentDocuments?.length ?? 0, icon: <FileText className="h-4 w-4" />, tone: 'neutral' },
      { id: 'knowledge', label: 'Knowledge Articles', value: dashboard.knowledgeArticles?.length ?? 0, icon: <BookOpen className="h-4 w-4" />, tone: 'accent' },
      { id: 'mentions', label: 'Unread Mentions', value: dashboard.unreadMentions?.length ?? 0, icon: <AtSign className="h-4 w-4" />, tone: 'warning' },
      { id: 'notifications', label: 'Unread Notifications', value: dashboard.unreadNotifications ?? 0, icon: <Bell className="h-4 w-4" />, tone: 'warning' },
      { id: 'activity', label: 'Recent Activities', value: ((dashboard.recentActivities?.length ?? 0) + (dashboard.workspaceActivities?.length ?? 0)), icon: <Activity className="h-4 w-4" />, tone: 'success' },
      { id: 'handovers', label: "Today's Handovers", value: dashboard.todaysHandovers?.length ?? 0, icon: <CalendarClock className="h-4 w-4" />, tone: 'info' },
    ],
    [dashboard],
  );

  return (
    <div>
      <SectionHeader title="Statistics Overview" description="Your work at a glance" />
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => <div key={s.id} className={cn('animate-stagger-' + ((i % 6) + 1))}><StatCard icon={s.icon} label={s.label} value={s.value} tone={s.tone} /></div>)}
      </div>
    </div>
  );
}

function MyTasks({ dashboard, navigate }: { dashboard: PersonalDashboardResponse; navigate: (to: string) => void }) {
  const tasks = dashboard.myTasks ?? [];

  const columns: TableColumn<(typeof tasks)[number]>[] = [
    {
      key: 'title',
      header: 'Task',
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-2xs text-text-tertiary">{r.id}</span>
          <button
            className="font-medium text-text-primary hover:text-accent-600 text-left"
            onClick={() => navigate(`/app/tasks/${r.id}`)}
          >
            {r.title}
          </button>
        </div>
      ),
    },
    {
      key: 'projectName',
      header: 'Project',
      sortable: true,
      sortValue: (r) => r.projectName,
      render: (r) => <span className="text-caption text-text-secondary">{r.projectName || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const meta = taskStatusBadge[r.status?.toLowerCase() ?? ''] ?? taskStatusBadge['todo'];
        return (
          <Badge tone={meta.tone} variant="soft" dot>
            {meta.label}
          </Badge>
        );
      },
    },
    {
      key: 'dueAt',
      header: 'Deadline',
      sortable: true,
      sortValue: (r) => r.dueAt,
      render: (r) => <span className="text-caption text-text-secondary">{formatDate(r.dueAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Tooltip content="Open task">
          <IconButton
            label="Open"
            variant="ghost"
            size="sm"
            className="h-7 w-7"
            onClick={() => navigate(`/app/tasks/${r.id}`)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="My Tasks"
        description="Tasks assigned to you across all projects"
        action={
          <Button size="sm" variant="outline" leftIcon={<ExternalLink className="h-4 w-4" />} onClick={() => navigate('/app/tasks')}>
            View all
          </Button>
        }
      />
      {tasks.length > 0 ? (
        <Table columns={columns} rows={tasks} rowKey={(r) => r.id} pageSize={7} searchable={false} />
      ) : (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No tasks assigned</p>
              <p className="text-caption text-text-tertiary mt-1">Your tasks will appear here once assigned to you.</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function MyProjects({ dashboard, navigate }: { dashboard: PersonalDashboardResponse; navigate: (to: string) => void }) {
  const projects = dashboard.recentWorkspaceProjects ?? [];

  return (
    <div>
      <SectionHeader
        title="Recent Projects"
        description="Recently active projects in your workspace"
        action={<Button size="sm" variant="outline" onClick={() => navigate('/app/projects')}>View all</Button>}
      />
      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="hover:shadow-cx-md transition-shadow duration-200">
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      className="font-semibold text-text-primary hover:text-accent-600 text-left truncate"
                      onClick={() => navigate(`/app/projects/${p.id}`)}
                    >
                      {p.name}
                    </button>
                    <p className="mt-0.5 text-caption text-text-tertiary truncate">{p.departmentName || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                  <ExternalLink className="h-3 w-3" />
                  <span>Open project</span>
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

function ActivityTimeline({ dashboard }: { dashboard: PersonalDashboardResponse }) {
  const items = useMemo(() => {
    const evts: { id: string; authorName: string; description: string; context: string; timestamp: string }[] = [];
    (dashboard.recentActivities ?? []).forEach((a) => {
      evts.push({
        id: `a-${a.id}`,
        authorName: 'You',
        description: a.description,
        context: a.projectName ?? 'General',
        timestamp: a.createdAt,
      });
    });
    (dashboard.workspaceActivities ?? []).forEach((a) => {
      evts.push({
        id: `wa-${a.type}-${a.timestamp}`,
        authorName: a.actorName ?? 'System',
        description: a.description,
        context: a.type ?? 'Activity',
        timestamp: a.timestamp,
      });
    });
    return evts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [dashboard]);

  return (
    <div>
      <SectionHeader title="Activity Timeline" description="Recent activity from your workspace" />
      <Card>
        <CardBody>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No recent activity</p>
              <p className="text-caption text-text-tertiary mt-1">Activity from your workspace will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-3">
                  <Avatar name={a.authorName} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body text-text-primary">
                      <span className="font-semibold">{a.authorName}</span>
                      <span className="mx-1 text-text-tertiary">&middot;</span>
                      <span className="text-text-secondary">{a.description}</span>
                      <span className="mx-1 text-text-tertiary">&middot;</span>
                      <Badge tone="neutral" variant="soft">{a.context}</Badge>
                    </p>
                    <p className="mt-0.5 text-2xs text-text-tertiary">{formatDate(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function TodayHandovers({ dashboard, navigate }: { dashboard: PersonalDashboardResponse; navigate: (to: string) => void }) {
  const handovers = dashboard.todaysHandovers ?? [];
  if (handovers.length === 0) return null;
  return (
    <div>
      <SectionHeader title="Today's Handovers" description="Passations assigned to you today" action={<Button size="sm" variant="outline" onClick={() => navigate('/app/handover')}>View all</Button>} />
      <div className="flex flex-col gap-2">
        {handovers.map((h) => (
          <Card key={h.id} className="hover:border-border-default transition-colors">
            <CardBody className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-text-primary truncate">{h.title}</p>
                <p className="text-caption text-text-tertiary truncate">{h.senderName ? `From ${h.senderName}` : ''} {h.projectName ? `· ${h.projectName}` : ''}</p>
              </div>
              <Badge tone={priorityTone[h.priority] ?? 'neutral'} variant="soft">{h.priority}</Badge>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

function UpcomingDeadlines({ dashboard, navigate }: { dashboard: PersonalDashboardResponse; navigate: (to: string) => void }) {
  const now = useMemo(() => new Date(), []);
  const deadlines = useMemo(() => {
    return (dashboard.myTasks ?? [])
      .filter((t) => t.dueAt)
      .map((t) => ({
        id: t.id,
        task: t.title,
        project: t.projectName,
        dueAt: t.dueAt,
        overdue: new Date(t.dueAt).getTime() < now.getTime(),
      }))
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [dashboard, now]);

  return (
    <div>
      <SectionHeader title="Upcoming Deadlines" description="Tasks and deliverables due soon" />
      <Card>
        <CardBody>
          {deadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarClock className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No upcoming deadlines</p>
              <p className="text-caption text-text-tertiary mt-1">You are ahead of schedule!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {deadlines.map((d, i) => (
                <div
                  key={d.id}
                  className={cn(
                    'flex items-center gap-3 py-3',
                    i !== deadlines.length - 1 && 'border-b border-border-subtle',
                  )}
                >
                  <span className={cn('h-8 w-1 rounded-full shrink-0', d.overdue ? 'bg-danger-500' : 'bg-info-500')} />
                  <div className="min-w-0 flex-1">
                    <button
                      className="text-body font-medium text-text-primary hover:text-accent-600 text-left truncate"
                      onClick={() => navigate(`/app/tasks/${d.id}`)}
                    >
                      {d.task}
                    </button>
                    <p className="text-caption text-text-tertiary truncate">{d.project || '—'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-caption font-medium text-text-secondary">{formatDate(d.dueAt)}</p>
                    <Badge tone={d.overdue ? 'danger' : 'info'} variant="soft" dot>
                      {d.overdue ? 'Overdue' : 'Due soon'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function RecentDocuments({ dashboard, navigate }: { dashboard: PersonalDashboardResponse; navigate: (to: string) => void }) {
  const docs = dashboard.recentDocuments ?? [];

  return (
    <div>
      <SectionHeader
        title="Recent Documents"
        description="Recently edited files"
        action={<Button size="sm" variant="outline" onClick={() => navigate('/app/documents')}>View all</Button>}
      />
      <Card>
        <CardBody>
          {docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No documents yet</p>
              <p className="text-caption text-text-tertiary mt-1">Documents will appear here once created.</p>
            </div>
          ) : (
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
                    {docIcon[doc.mimeType.split('/')[0]] ?? docIcon['default']}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-text-primary truncate">{doc.title || doc.fileName}</p>
                    <p className="text-caption text-text-tertiary truncate">{doc.projectName || '—'}</p>
                  </div>
                  <span className="shrink-0 text-2xs text-text-tertiary">{formatDate(doc.createdAt)}</span>
                  <button
                    className="shrink-0"
                    onClick={() => {}}
                    aria-label="Open document"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-text-secondary hover:text-text-primary" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function KnowledgeBase({ dashboard, navigate }: { dashboard: PersonalDashboardResponse; navigate: (to: string) => void }) {
  const articles = dashboard.knowledgeArticles ?? [];
  const { toast } = useToast();

  return (
    <div>
      <SectionHeader
        title="Knowledge Base"
        description="Recently viewed articles"
        action={<Button size="sm" variant="outline" onClick={() => navigate('/app/knowledge')}>View all</Button>}
      />
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input placeholder="Search articles..." leftIcon={<Search />} containerClassName="w-full" />
          </div>
          {articles.length > 0 ? (
            <div className="flex flex-col">
              {articles.map((a, i) => (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-center gap-3 py-2.5',
                    i !== articles.length - 1 && 'border-b border-border-subtle',
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-text-primary truncate">{a.title}</p>
                    <p className="text-caption text-text-tertiary truncate">{a.category} · viewed {formatDate(a.createdAt)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/app/knowledge`)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <BookOpen className="h-8 w-8 text-text-tertiary mb-2" />
              <p className="text-caption text-text-tertiary">No knowledge base articles yet</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function RecentNotifications({ navigate, notifPage }: { navigate: (to: string) => void; notifPage: ReturnType<typeof useUnreadNotifications>['data'] }) {
  return (
    <div>
      <SectionHeader
        title="Recent Notifications"
        action={<Button size="sm" variant="ghost" onClick={() => navigate('/app/notifications')}>View All</Button>}
      />
      <Card>
        <CardBody className="flex flex-col gap-1">
          {!notifPage?.content || notifPage.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-text-tertiary mb-3" />
              <p className="text-body font-medium text-text-primary">No notifications</p>
              <p className="text-caption text-text-tertiary mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifPage.content.slice(0, 6).map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface"
              >
                <span className="mt-0.5 shrink-0 [&>svg]:h-4 [&>svg]:w-4">
                  <Bell className="h-4 w-4 text-warning-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-body font-medium text-text-primary truncate">{n.title}</p>
                    <span className="shrink-0 text-2xs text-text-tertiary">{formatDate(n.createdAt)}</span>
                  </div>
                  {n.body && <p className="mt-0.5 text-caption text-text-tertiary line-clamp-1">{n.body}</p>}
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function QuickAccess({ dashboard, navigate }: { dashboard: PersonalDashboardResponse; navigate: (to: string) => void }) {
  const counts = useMemo(
    () => [
      { id: 'qa-projects', count: dashboard.recentWorkspaceProjects?.length ?? 0 },
      { id: 'qa-tasks', count: dashboard.myTasks?.length ?? 0 },
      { id: 'qa-documents', count: dashboard.recentDocuments?.length ?? 0 },
      { id: 'qa-knowledge', count: dashboard.knowledgeArticles?.length ?? 0 },
      { id: 'qa-notifications', count: dashboard.unreadNotifications ?? 0 },
      { id: 'qa-handover', count: 0 },
    ],
    [dashboard],
  );

  return (
    <div>
      <SectionHeader title="Quick Access" description="Jump to any section" />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {quickAccess.map((qa) => {
          const Icon = qa.icon;
          const count = counts.find((c) => c.id === qa.id)?.count ?? 0;
          return (
            <button
              key={qa.id}
              className="group flex items-center gap-3 rounded-xl border border-border-subtle bg-elevated p-3 text-left hover:shadow-cx-md hover:border-border-default transition-all duration-150"
              onClick={() => navigate(qa.path)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-secondary group-hover:bg-accent-50 group-hover:text-accent-600 dark:group-hover:bg-accent-100 dark:group-hover:text-accent-300 transition-colors">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-body font-medium text-text-primary truncate">{qa.label}</p>
                {count > 0 && <p className="text-2xs text-text-tertiary">{count} items</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarWidget() {
  const currentMonth = useMemo(() => new Date(), []);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();

  const cells: Array<number | null> = [];
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
              const isToday = d === today;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-center rounded-lg py-1.5 text-caption transition-colors',
                    isToday ? 'bg-accent-600 text-white font-semibold' : 'text-text-secondary hover:bg-surface-2',
                  )}
                >
                  <span>{d}</span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function PerformanceSummary({ dashboard }: { dashboard: PersonalDashboardResponse }) {
  const totalTasks = dashboard.myTasks?.length ?? 0;
  const completedTasks = dashboard.myTasks?.filter((t) => t.status === 'completed').length ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <SectionHeader title="Performance Summary" description="Your productivity at a glance" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <Badge tone="neutral" variant="soft" dot>{completionRate}% complete</Badge>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <Progress value={completionRate} size="md" tone={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'accent' : 'warning'} />
              <p className="text-2xs text-text-tertiary">{completedTasks} of {totalTasks} tasks completed</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Badge tone="neutral" variant="soft" dot>{dashboard.overdueTasks ?? 0} overdue</Badge>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CalendarClock className="h-8 w-8 text-text-tertiary mb-2" />
              <p className="text-caption text-text-tertiary">
                {dashboard.overdueTasks ?? 0} overdue, {(dashboard.myTasks ?? []).filter((t) => t.dueAt).length - (dashboard.overdueTasks ?? 0)} upcoming
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get('ws') ?? '';
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const { data: dashboard, isLoading, isError } = usePersonalDashboard(workspaceId || undefined);
  const { data: notifPage } = useUnreadNotifications(workspaceId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

if (isError || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500 dark:bg-danger-500/10">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-section font-semibold text-text-primary">Unable to load dashboard</h3>
        <p className="mt-1 text-body text-text-secondary">Please try again later.</p>
      </div>
    );
  }

  const go = (to: string) => navigate(to);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <WelcomeHeader dashboard={dashboard} onNewProject={() => setShowCreate(true)} />

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} wsId={workspaceId || undefined} />

      <StatisticsOverview dashboard={dashboard} />

      <MyTasks dashboard={dashboard} navigate={go} />

      <MyProjects dashboard={dashboard} navigate={go} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityTimeline dashboard={dashboard} />
        </div>
        <div>
          <TodayHandovers dashboard={dashboard} navigate={go} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RecentNotifications navigate={go} notifPage={notifPage} />
        <UpcomingDeadlines dashboard={dashboard} navigate={go} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RecentDocuments dashboard={dashboard} navigate={go} />
        <KnowledgeBase dashboard={dashboard} navigate={go} />
      </div>

      <QuickAccess dashboard={dashboard} navigate={go} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div><CalendarWidget /></div>
        <div className="lg:col-span-2"><PerformanceSummary dashboard={dashboard} /></div>
      </div>
    </div>
  );
}
