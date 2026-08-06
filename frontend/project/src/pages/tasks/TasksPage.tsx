import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  LayoutList,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Clock,
  FolderKanban,
  MoreHorizontal,
  Eye,
  Edit2,
  Archive,
  Briefcase,
  Network,
  Folder,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge, type Tone } from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../components/ui/Dropdown';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Avatar } from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useWorkspacesList } from '../../services/workspace-hooks';
import { useDepartmentList } from '../../services/department-hooks';
import { useProjectList } from '../../services/project-hooks';
import { useTasksList, useCreateTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask } from '../../services/task-hooks';
import { mapTaskResponse, FRONTEND_STATUS_MAP } from './tasks-types';
import type { Task, TaskStatus } from './tasks-types';
import { TaskModal, type TaskModalKind } from './TaskModals';

type ViewMode = 'kanban' | 'list' | 'calendar';

const taskStatuses = ['todo', 'in-progress', 'in-review', 'blocked', 'completed', 'archived'];
const statusLabels: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  blocked: 'Blocked',
  completed: 'Completed',
  archived: 'Archived',
};
const statusColors: Record<string, Tone> = {
  todo: 'info',
  'in-progress': 'accent',
  'in-review': 'warning',
  blocked: 'danger',
  completed: 'success',
  archived: 'neutral',
};

interface TasksPageProps {
  workspaceId?: string;
  departmentId?: string;
  projectId?: string;
}

export function TasksPage({ workspaceId = '', departmentId = '', projectId = '' }: TasksPageProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'progress'>('priority');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modal, setModal] = useState<TaskModalKind>(null);

  // Context selector state (used when no ws/dept/proj provided in URL)
  const [selWs, setSelWs] = useState(workspaceId);
  const [selDept, setSelDept] = useState(departmentId);
  const [selProj, setSelProj] = useState(projectId);

  const { data: workspaces } = useWorkspacesList();
  const { data: departments } = useDepartmentList(selWs || undefined);
  const { data: projects } = useProjectList(selWs || undefined, selDept || undefined, undefined, 0);

  const hasContext = !!workspaceId && !!departmentId && !!projectId;

  // Resolve effective context: use URL props, or selections from the fallback selector.
  const effWs = workspaceId || selWs;
  const effDept = departmentId || selDept;
  const effProj = projectId || selProj;

  const { data: tasksPage, isLoading, isError, error } = useTasksList(effWs, effDept, effProj, {
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const createTask = useCreateTask(effWs, effDept, effProj);
  const updateTask = useUpdateTask(effWs, effDept, effProj);
  const updateStatus = useUpdateTaskStatus(effWs, effDept, effProj);
  const deleteTask = useDeleteTask(effWs, effDept, effProj);

  const tasks: Task[] = useMemo(() => {
    if (!tasksPage?.content) return [];
    return tasksPage.content.map(mapTaskResponse);
  }, [tasksPage]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline || !b.deadline) return 0;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'progress':
          return (b.progress ?? 0) - (a.progress ?? 0);
        case 'priority':
        default: {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
      }
    });
    return result;
  }, [tasks, search, sortBy]);

  const stats = useMemo(() => ({
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  }), [tasks]);

  const handleModalSubmit = useCallback((data: { title: string; description?: string }) => {
    if (!modal) return;
    switch (modal.kind) {
      case 'create':
        createTask.mutate({ title: data.title, description: data.description }, {
          onSuccess: () => toast({ title: 'Task created', tone: 'success' }),
          onError: () => toast({ title: 'Failed to create task', tone: 'danger' }),
        });
        break;
      case 'edit':
        updateTask.mutate({ taskId: modal.task.id, data: { title: data.title, description: data.description } }, {
          onSuccess: () => toast({ title: 'Task updated', tone: 'success' }),
          onError: () => toast({ title: 'Failed to update task', tone: 'danger' }),
        });
        break;
      case 'archive':
        deleteTask.mutate(modal.task.id, {
          onSuccess: () => toast({ title: 'Task archived', tone: 'success' }),
          onError: () => toast({ title: 'Failed to archive task', tone: 'danger' }),
        });
        break;
      case 'delete':
        deleteTask.mutate(modal.task.id, {
          onSuccess: () => toast({ title: 'Task deleted', tone: 'success' }),
          onError: () => toast({ title: 'Failed to delete task', tone: 'danger' }),
        });
        break;
    }
  }, [modal, createTask, updateTask, deleteTask, toast]);

if (!hasContext) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page font-semibold text-text-primary">Tasks</h1>
          <p className="text-body text-text-secondary">Select a workspace, department, and project to manage its tasks.</p>
        </div>
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <Briefcase className="h-4 w-4" />
              <span className="text-body font-medium text-text-primary">Workspace</span>
            </div>
            <Select
              value={selWs}
              onChange={(e) => { setSelWs(e.target.value); setSelDept(''); setSelProj(''); }}
              options={[
                { value: '', label: 'Select a workspace' },
                ...(workspaces ?? []).map((w) => ({ value: w.id, label: w.name })),
              ]}
            />
            {selWs && (
              <>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Network className="h-4 w-4" />
                  <span className="text-body font-medium text-text-primary">Department</span>
                </div>
                <Select
                  value={selDept}
                  onChange={(e) => { setSelDept(e.target.value); setSelProj(''); }}
                  options={[
                    { value: '', label: 'Select a department' },
                    ...(departments ?? []).map((d) => ({ value: d.id, label: d.name })),
                  ]}
                />
              </>
            )}
            {selWs && selDept && (
              <>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Folder className="h-4 w-4" />
                  <span className="text-body font-medium text-text-primary">Project</span>
                </div>
                <Select
                  value={selProj}
                  onChange={(e) => setSelProj(e.target.value)}
                  options={[
                    { value: '', label: 'Select a project' },
                    ...(projects?.content ?? []).map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </>
            )}
            {selWs && selDept && selProj && (
              <Button
                leftIcon={<FolderKanban />}
                onClick={() => navigate(`/app/tasks?ws=${selWs}&dept=${selDept}&proj=${selProj}`)}
              >
                View Tasks
              </Button>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-72" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<CheckCircle2 />}
        title="Failed to load tasks"
        description={(error as Error)?.message ?? 'An error occurred while fetching tasks.'}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TaskModal state={modal} onClose={() => setModal(null)} onSubmit={handleModalSubmit} />

      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Tasks</h1>
        <p className="text-body text-text-secondary">Manage and track all tasks across your projects.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Tasks" value={stats.total} tone="accent" />
        <StatCard label="In Progress" value={stats.inProgress} tone="info" />
        <StatCard label="Completed" value={stats.completed} tone="success" />
        <StatCard label="Blocked" value={stats.blocked} tone="danger" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              leftIcon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              containerClassName="w-full"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              ...taskStatuses.map((s) => ({ value: s, label: statusLabels[s] })),
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
              { label: 'Priority', onClick: () => setSortBy('priority') },
              { label: 'Deadline', onClick: () => setSortBy('deadline') },
              { label: 'Progress', onClick: () => setSortBy('progress') },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 border border-border-subtle rounded-lg p-1">
            <IconButton label="Kanban view" variant={viewMode === 'kanban' ? 'solid' : 'ghost'} onClick={() => setViewMode('kanban')} className="h-8 w-8">
              <LayoutGrid className="h-4 w-4" />
            </IconButton>
            <IconButton label="List view" variant={viewMode === 'list' ? 'solid' : 'ghost'} onClick={() => setViewMode('list')} className="h-8 w-8">
              <LayoutList className="h-4 w-4" />
            </IconButton>
            <IconButton label="Calendar view" variant={viewMode === 'calendar' ? 'solid' : 'ghost'} onClick={() => setViewMode('calendar')} className="h-8 w-8">
              <Calendar className="h-4 w-4" />
            </IconButton>
          </div>
          <Button leftIcon={<Plus />} onClick={() => setModal({ kind: 'create' })}>Create Task</Button>
        </div>
      </div>

      {filteredTasks.length === 0 && !isLoading ? (
        <EmptyState icon={<CheckCircle2 />} title="No tasks found" description="Try adjusting your search or filters to find tasks." />
      ) : viewMode === 'kanban' ? (
        <KanbanView
          tasks={filteredTasks}
          wsId={effWs}
          deptId={effDept}
          projId={effProj}
          updateStatus={updateStatus}
          onTaskClick={(id) => navigate(`/app/tasks/${id}?ws=${workspaceId}&dept=${departmentId}&proj=${projectId}`)}
          onEdit={(task) => setModal({ kind: 'edit', task })}
          onArchive={(task) => setModal({ kind: 'archive', task })}
        />
      ) : viewMode === 'list' ? (
        <ListView tasks={filteredTasks} onTaskClick={(id) => navigate(`/app/tasks/${id}?ws=${workspaceId}&dept=${departmentId}&proj=${projectId}`)} onEdit={(task) => setModal({ kind: 'edit', task })} onArchive={(task) => setModal({ kind: 'archive', task })} />
      ) : (
        <CalendarView tasks={filteredTasks} onTaskClick={(id) => navigate(`/app/tasks/${id}?ws=${workspaceId}&dept=${departmentId}&proj=${projectId}`)} onEdit={(task) => setModal({ kind: 'edit', task })} onArchive={(task) => setModal({ kind: 'archive', task })} />
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  const bgColor: Record<string, string> = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    danger: 'bg-danger-50 dark:bg-danger-100 text-danger-700 dark:text-danger-200',
  };
  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bgColor[tone] ?? bgColor.accent)}>
      <p className="text-2xs font-medium opacity-75">{label}</p>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}

const KANBAN_COLUMNS: Array<{ id: TaskStatus; label: string; tone: Tone }> = [
  { id: 'todo', label: 'To Do', tone: 'info' },
  { id: 'in-progress', label: 'In Progress', tone: 'accent' },
  { id: 'in-review', label: 'In Review', tone: 'warning' },
  { id: 'blocked', label: 'Blocked', tone: 'danger' },
  { id: 'completed', label: 'Done', tone: 'success' },
];

const priorityToneMap: Record<string, Tone> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'success',
};

function KanbanView({
  tasks,
  wsId,
  deptId,
  projId,
  updateStatus,
  onTaskClick,
  onEdit,
  onArchive,
}: {
  tasks: Task[];
  wsId: string;
  deptId: string;
  projId: string;
  updateStatus: ReturnType<typeof useUpdateTaskStatus>;
  onTaskClick: (id: string) => void;
  onEdit: (task: Task) => void;
  onArchive: (task: Task) => void;
}) {
  const { toast } = useToast();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDrop = (targetStatus: TaskStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = draggedId;
    setDraggedId(null);
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    updateStatus.mutate(
      { taskId, status: FRONTEND_STATUS_MAP[targetStatus] },
      {
        onSuccess: () => toast({ title: 'Task status updated', tone: 'success' }),
        onError: () => toast({ title: 'Failed to update task status', tone: 'danger' }),
      },
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className="flex flex-col gap-3 min-w-[220px]">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge tone={col.tone} variant="soft" dot />
                <span className="text-2xs font-semibold text-text-tertiary">{col.label}</span>
              </div>
              <Badge tone="neutral" variant="soft">{colTasks.length}</Badge>
            </div>
            <div
              className="flex flex-col gap-2 min-h-[60px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop(col.id)}
            >
              {colTasks.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-border-subtle bg-surface p-4 text-center">
                  <p className="text-2xs text-text-tertiary">Drop tasks here</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={() => setDraggedId(task.id)}
                    onClick={() => onTaskClick(task.id)}
                    onEdit={() => onEdit(task)}
                    onArchive={() => onArchive(task)}
                    isDragging={draggedId === task.id}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({
  task,
  onDragStart,
  onClick,
  onEdit,
  onArchive,
  isDragging,
}: {
  task: Task;
  onDragStart: () => void;
  onClick: () => void;
  onEdit: () => void;
  onArchive: () => void;
  isDragging: boolean;
}) {
  const actionItems: DropdownItem[] = [
    { label: 'Open', icon: <Eye className="h-4 w-4" />, onClick },
    { label: 'Edit', icon: <Edit2 className="h-4 w-4" />, onClick: onEdit },
    { divider: true },
    { label: 'Archive', icon: <Archive className="h-4 w-4" />, onClick: onArchive },
  ];
  return (
    <div
      draggable
      onDragStart={(e: React.DragEvent) => {
        onDragStart();
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border-subtle bg-surface p-3 hover:border-border-default hover:shadow-cx-sm transition-all cursor-pointer group',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-body font-medium text-text-primary line-clamp-2 flex-1">{task.title}</h4>
        <Dropdown
          trigger={
            <IconButton
              label="Actions"
              variant="ghost"
              size="sm"
              className="h-6 w-6 shrink-0"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-4" />
            </IconButton>
          }
          items={actionItems}
          align="right"
        />
      </div>
      {task.description && (
        <p className="text-2xs text-text-tertiary line-clamp-2 mb-3">{task.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {task.priority && (
          <Badge tone={priorityToneMap[task.priority] ?? 'info'} variant="soft" dot>
            {task.priority}
          </Badge>
        )}
        {task.deadline && (
          <div className="flex items-center gap-1 text-2xs text-text-tertiary">
            <Clock className="h-3 w-3" />
            <span>{task.deadline}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle">
        {task.assigneeName ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assigneeName} size="xs" />
            <span className="text-2xs text-text-tertiary truncate max-w-[100px]">
              {task.assigneeName}
            </span>
          </div>
        ) : (
          <Badge tone="neutral" variant="soft" dot>Unassigned</Badge>
        )}
        <Badge tone="neutral" variant="soft" dot>{task.projectName}</Badge>
      </div>
    </div>
  );
}

function ListView({ tasks, onTaskClick, onEdit, onArchive }: { tasks: Task[]; onTaskClick: (id: string) => void; onEdit: (task: { id: string; title: string; description?: string }) => void; onArchive: (task: { id: string; title: string }) => void }) {
  return (
    <div className="space-y-2">
      {tasks.filter(t => t.status !== 'archived').map((task) => <TaskListRow key={task.id} task={task} onClick={() => onTaskClick(task.id)} onEdit={() => onEdit(task)} onArchive={() => onArchive(task)} />)}
    </div>
  );
}

function TaskListRow({ task, onClick, onEdit, onArchive }: { task: Task; onClick: () => void; onEdit: () => void; onArchive: () => void }) {
  const priorityColor: Record<string, Tone> = { urgent: 'danger', high: 'warning', medium: 'info', low: 'success' };
  const statusColor: Record<string, Tone> = { todo: 'info', 'in-progress': 'accent', 'in-review': 'warning', blocked: 'danger', completed: 'success', archived: 'neutral' };
  const actionItems: DropdownItem[] = [
    { label: 'Open', icon: <Eye className="h-4 w-4" />, onClick },
    { label: 'Edit', icon: <Edit2 className="h-4 w-4" />, onClick: onEdit },
    { divider: true },
    { label: 'Archive', icon: <Archive className="h-4 w-4" />, onClick: onArchive },
  ];
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface p-3 hover:bg-surface-2 transition-colors group cursor-pointer" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-body font-medium text-text-primary truncate flex-1">{task.title}</h4>
          <Badge tone={statusColor[task.status]} variant="soft" dot>{statusLabels[task.status]}</Badge>
        </div>
        <div className="flex items-center gap-2 text-caption text-text-secondary">
          {task.deadline && <span>{task.deadline}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={priorityColor[task.priority]} variant="soft">{task.priority}</Badge>
        <Dropdown
          trigger={
            <IconButton label="Actions" variant="ghost" size="sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </IconButton>
          }
          items={actionItems}
          align="right"
        />
      </div>
    </div>
  );
}

function CalendarView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (id: string) => void; onEdit: (task: { id: string; title: string; description?: string }) => void; onArchive: (task: { id: string; title: string }) => void }) {
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (task.deadline) {
      if (!tasksByDate[task.deadline]) tasksByDate[task.deadline] = [];
      tasksByDate[task.deadline].push(task);
    }
  });
  const sortedDates = Object.keys(tasksByDate).sort();
  if (sortedDates.length === 0) {
    return (
      <Card><CardBody className="py-8 text-center"><p className="text-body text-text-secondary">No upcoming deadlines</p></CardBody></Card>
    );
  }
  return (
    <div className="space-y-4">
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-2 px-2">
            <Calendar className="h-4 w-4 text-text-tertiary" />
            <h3 className="text-caption font-semibold text-text-primary">{date}</h3>
            <Badge tone="neutral" variant="soft">{tasksByDate[date].length} task{tasksByDate[date].length !== 1 ? 's' : ''}</Badge>
          </div>
          <div className="space-y-2">
            {tasksByDate[date].map((task) => (
              <div key={task.id} className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface p-3 hover:bg-surface-2 transition-colors group cursor-pointer" onClick={() => onTaskClick(task.id)}>
                <div className="flex-1 min-w-0">
                  <h4 className="text-body font-medium text-text-primary truncate">{task.title}</h4>
                </div>
                <Badge tone={statusColors[task.status]} variant="soft" dot>{statusLabels[task.status]}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
