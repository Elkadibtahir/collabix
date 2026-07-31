import { useState, useMemo } from 'react';
import { useToast } from '../../components/ui/Toast';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  MoreHorizontal,
  Edit2,
  Archive,
  Share2,
  Plus,
  Send,
  Paperclip,
  Smile,
  X,
  Trash2,
  ListChecks,
  RotateCcw,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, type Tone } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { IconButton } from '../../components/ui/IconButton';
import { Progress } from '../../components/ui/Progress';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { Dropdown, type DropdownItem } from '../../components/ui/Dropdown';
import { Timeline, type TimelineItem } from '../../components/ui/Timeline';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import {
  useTaskDetail,
  useUpdateTask,
  useDeleteTask,
  useCommentsList,
  useCreateComment,
  useDeleteComment,
  useAttachmentsList,
  useActivitiesList,
  useChecklistsList,
  useCreateChecklist,
  useDeleteChecklist,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
} from '../../services/task-hooks';
import {
  mapTaskResponse,
  mapCommentResponse,
  mapAttachmentResponse,
  mapActivityResponse,
} from './tasks-types';
import type { Task, ChecklistResponse } from './tasks-types';
import { TaskModal, type TaskModalKind } from './TaskModals';

const statusColor: Record<string, Tone> = {
  todo: 'info',
  'in-progress': 'accent',
  'in-review': 'warning',
  blocked: 'danger',
  completed: 'success',
  archived: 'neutral',
};

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  blocked: 'Blocked',
  completed: 'Completed',
  archived: 'Archived',
};

interface TaskDetailsPageProps {
  taskId: string;
  workspaceId?: string;
  departmentId?: string;
  projectId?: string;
  onBack?: () => void;
}

export function TaskDetailsPage({ taskId, workspaceId = '', departmentId = '', projectId = '', onBack }: TaskDetailsPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [commentText, setCommentText] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<TaskModalKind>(null);
  const { toast } = useToast();

  const { data: taskData, isLoading: taskLoading, isError: taskError } = useTaskDetail(workspaceId, departmentId, projectId, taskId);
  const { data: commentsPage } = useCommentsList(workspaceId, departmentId, projectId, taskId);
  const { data: attachmentsPage } = useAttachmentsList(workspaceId, departmentId, projectId, taskId);
  const { data: activitiesPage } = useActivitiesList(workspaceId, departmentId, projectId, taskId);
  const { data: checklistsData } = useChecklistsList(workspaceId, departmentId, projectId, taskId);

  const updateTask = useUpdateTask(workspaceId, departmentId, projectId, taskId);
  const deleteTask = useDeleteTask(workspaceId, departmentId, projectId);
  const createComment = useCreateComment(workspaceId, departmentId, projectId, taskId);
  const deleteComment = useDeleteComment(workspaceId, departmentId, projectId, taskId);
  const createChecklist = useCreateChecklist(workspaceId, departmentId, projectId, taskId);
  const deleteChecklist = useDeleteChecklist(workspaceId, departmentId, projectId, taskId);
  const createItem = useCreateChecklistItem(workspaceId, departmentId, projectId, taskId);
  const updateItem = useUpdateChecklistItem(workspaceId, departmentId, projectId, taskId);
  const deleteItem = useDeleteChecklistItem(workspaceId, departmentId, projectId, taskId);

  const task: Task | null = useMemo(() => {
    if (!taskData) return null;
    return mapTaskResponse(taskData);
  }, [taskData]);

  const comments = useMemo(() => {
    if (!commentsPage?.content) return [];
    return commentsPage.content.map(mapCommentResponse);
  }, [commentsPage]);

  const attachments = useMemo(() => {
    if (!attachmentsPage?.content) return [];
    return attachmentsPage.content.map(mapAttachmentResponse);
  }, [attachmentsPage]);

  const activities = useMemo(() => {
    if (!activitiesPage?.content) return [];
    return activitiesPage.content.map(mapActivityResponse);
  }, [activitiesPage]);

  const timelineItems: TimelineItem[] = useMemo(() => {
    return activities.map((a) => ({
      id: a.id,
      title: a.description,
      timestamp: a.timestamp,
      tone: 'neutral' as const,
    }));
  }, [activities]);

  const tabItems: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'checklist', label: 'Checklist', count: checklistsData?.length ?? 0 },
    { id: 'activity', label: 'Activity' },
    { id: 'comments', label: 'Comments', count: comments.length },
    { id: 'attachments', label: 'Attachments', count: attachments.length },
  ];

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    createComment.mutate({ content: commentText.trim() }, {
      onSuccess: () => { setCommentText(''); toast({ title: 'Comment added', tone: 'success' }); },
      onError: () => toast({ title: 'Failed to add comment', tone: 'danger' }),
    });
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    createChecklist.mutate({ title: newChecklistTitle.trim() }, {
      onSuccess: () => { setNewChecklistTitle(''); toast({ title: 'Checklist created', tone: 'success' }); },
      onError: () => toast({ title: 'Failed to create checklist', tone: 'danger' }),
    });
  };

  const handleAddItem = (checklistId: string) => {
    const text = newItemText[checklistId]?.trim();
    if (!text) return;
    createItem.mutate({ checklistId, data: { title: text } }, {
      onSuccess: () => { setNewItemText((prev) => ({ ...prev, [checklistId]: '' })); },
      onError: () => toast({ title: 'Failed to add item', tone: 'danger' }),
    });
  };

  const handleToggleItem = (checklistId: string, itemId: string, completed: boolean) => {
    updateItem.mutate({ checklistId, itemId, data: { completed: !completed } });
  };

  const handleSaveItemTitle = (checklistId: string, itemId: string) => {
    const text = editingItem[`${itemId}-title`]?.trim();
    if (!text) return;
    updateItem.mutate({ checklistId, itemId, data: { title: text } }, {
      onSuccess: () => setEditingItem((prev) => ({ ...prev, [`${itemId}-title`]: '' })),
    });
  };

  if (taskLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <EmptyState
        icon={<AlertCircle />}
        title="Task not found"
        description="The task could not be loaded. It may have been deleted or you may not have access."
      />
    );
  }

  const detailActionItems: DropdownItem[] = [
    { label: 'Edit', icon: <Edit2 className="h-4 w-4" />, onClick: () => setModal({ kind: 'edit', task: { id: task.id, title: task.title, description: task.description } }) },
    { divider: true, label: 'Danger zone' },
    { label: 'Archive', icon: <Archive className="h-4 w-4" />, onClick: () => setModal({ kind: 'archive', task: { id: task.id, title: task.title } }) },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setModal({ kind: 'delete', task: { id: task.id, title: task.title } }) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TaskModal state={modal} onClose={() => setModal(null)} onSubmit={(data) => {
        if (!modal) return;
        switch (modal.kind) {
          case 'edit':
            updateTask.mutate({ title: data.title, description: data.description }, {
              onSuccess: () => toast({ title: 'Task updated', tone: 'success' }),
              onError: () => toast({ title: 'Failed to update task', tone: 'danger' }),
            });
            break;
          case 'archive':
            deleteTask.mutate(modal.task.id, {
              onSuccess: () => { toast({ title: 'Task archived', tone: 'success' }); if (onBack) onBack(); },
            });
            break;
          case 'delete':
            deleteTask.mutate(modal.task.id, {
              onSuccess: () => { toast({ title: 'Task deleted', tone: 'success' }); if (onBack) onBack(); },
            });
            break;
        }
        setModal(null);
      }} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <IconButton label="Back" variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </IconButton>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-page font-semibold text-text-primary">{task.title}</h1>
              <Badge tone={statusColor[task.status]} variant="soft" dot>
                {statusLabels[task.status]}
              </Badge>
              <Badge tone={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : task.priority === 'medium' ? 'info' : 'success'} variant="soft">
                {task.priority}
              </Badge>
            </div>
            <p className="text-body text-text-secondary mt-1">{task.projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            trigger={
              <Button variant="outline" size="md">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
            items={detailActionItems}
            align="right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

          <div className="mt-4">
            {activeTab === 'overview' && (
              <Card>
                <CardBody className="space-y-4">
                  <div>
                    <h3 className="text-caption font-semibold text-text-primary mb-1">Description</h3>
                    <p className="text-body text-text-secondary">{task.description || 'No description provided.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
                    <InfoRow icon={<Calendar />} label="Created" value={task.createdAt} />
                    <InfoRow icon={<Clock />} label="Deadline" value={task.deadline || 'No deadline'} />
                    {task.assigneeName && <InfoRow icon={<Users />} label="Assignee" value={task.assigneeName} />}
                    {task.startDate && <InfoRow icon={<Clock />} label="Start Date" value={task.startDate} />}
                  </div>
                </CardBody>
              </Card>
            )}

            {activeTab === 'checklist' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="New checklist title..."
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    containerClassName="flex-1"
                  />
                  <Button onClick={handleAddChecklist} disabled={!newChecklistTitle.trim()} leftIcon={<Plus className="h-4 w-4" />}>Add</Button>
                </div>
                {(!checklistsData || checklistsData.length === 0) ? (
                  <Card><CardBody className="py-8 text-center"><p className="text-body text-text-secondary">No checklists yet. Create one above.</p></CardBody></Card>
                ) : (
                  checklistsData.map((cl) => (
                    <Card key={cl.id}>
                      <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ListChecks className="h-4 w-4 text-text-tertiary" />
                          <CardTitle>{cl.title}</CardTitle>
                          <Badge tone="neutral" variant="soft">{cl.completedItems}/{cl.totalItems}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={cl.completionPercentage} size="sm" className="w-20" />
                          <IconButton label="Delete checklist" variant="ghost" size="sm" onClick={() => deleteChecklist.mutate(cl.id, { onSuccess: () => toast({ title: 'Checklist deleted', tone: 'success' }) })}>
                            <Trash2 className="h-4 w-4 text-danger-500" />
                          </IconButton>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-1">
                        {cl.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 py-1">
                            <Checkbox checked={item.completed} onChange={() => handleToggleItem(cl.id, item.id, item.completed)} />
                            {editingItem[`${item.id}-title`] != null && editingItem[`${item.id}-title`] !== undefined ? (
                              <Input
                                value={editingItem[`${item.id}-title`] ?? item.title}
                                onChange={(e) => setEditingItem((prev) => ({ ...prev, [`${item.id}-title`]: e.target.value }))}
                                onBlur={() => handleSaveItemTitle(cl.id, item.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveItemTitle(cl.id, item.id); }}
                                autoFocus
                                containerClassName="flex-1"
                              />
                            ) : (
                              <span
                                className={`flex-1 text-body ${item.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}
                                onDoubleClick={() => setEditingItem((prev) => ({ ...prev, [`${item.id}-title`]: item.title }))}
                              >
                                {item.title}
                              </span>
                            )}
                            <IconButton label="Delete item" variant="ghost" size="sm" onClick={() => deleteItem.mutate({ checklistId: cl.id, itemId: item.id })}>
                              <X className="h-3 w-3 text-text-tertiary" />
                            </IconButton>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-2">
                          <Input
                            placeholder="Add item..."
                            value={newItemText[cl.id] ?? ''}
                            onChange={(e) => setNewItemText((prev) => ({ ...prev, [cl.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(cl.id); }}
                            containerClassName="flex-1"
                          />
                          <IconButton label="Add item" variant="ghost" size="sm" onClick={() => handleAddItem(cl.id)}>
                            <Plus className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <Card>
                <CardBody>
                  {timelineItems.length === 0 ? (
                    <p className="text-body text-text-secondary py-4 text-center">No activity recorded yet.</p>
                  ) : (
                    <Timeline items={timelineItems} />
                  )}
                </CardBody>
              </Card>
            )}

            {activeTab === 'comments' && (
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddComment} disabled={!commentText.trim()} leftIcon={<Send className="h-4 w-4" />}>Send</Button>
                  </div>
                  {comments.length === 0 ? (
                    <p className="text-body text-text-secondary py-4 text-center">No comments yet.</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="flex gap-3 py-3 border-b border-border-subtle last:border-0">
                        <Avatar name={c.author || 'User'} size="sm" tone={0} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-caption font-medium text-text-primary">{c.author || 'User'}</span>
                            <span className="text-2xs text-text-tertiary">{c.timestamp}</span>
                          </div>
                          <p className="text-body text-text-secondary mt-1">{c.content}</p>
                        </div>
                        <IconButton label="Delete comment" variant="ghost" size="sm" onClick={() => deleteComment.mutate(c.id)}>
                          <X className="h-3 w-3 text-text-tertiary" />
                        </IconButton>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            )}

            {activeTab === 'attachments' && (
              <Card>
                <CardBody>
                  {attachments.length === 0 ? (
                    <p className="text-body text-text-secondary py-4 text-center">No attachments yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {attachments.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle">
                          <FileText className="h-8 w-8 text-text-tertiary" />
                          <div className="min-w-0">
                            <p className="text-caption font-medium text-text-primary truncate">{a.name}</p>
                            <p className="text-2xs text-text-tertiary">{a.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-caption text-text-tertiary">Status</span>
                <Badge tone={statusColor[task.status]} variant="soft" dot>{statusLabels[task.status]}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-caption text-text-tertiary">Priority</span>
                <Badge tone={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : task.priority === 'medium' ? 'info' : 'success'} variant="soft">{task.priority}</Badge>
              </div>
              {task.assigneeName && (
                <div className="flex items-center justify-between">
                  <span className="text-caption text-text-tertiary">Assignee</span>
                  <span className="text-caption font-medium text-text-primary">{task.assigneeName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-caption text-text-tertiary">Created</span>
                <span className="text-caption text-text-primary">{task.createdAt}</span>
              </div>
              {task.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-caption text-text-tertiary">Due</span>
                  <span className="text-caption text-text-primary">{task.deadline}</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-tertiary">{icon}</span>
      <div>
        <p className="text-2xs text-text-tertiary">{label}</p>
        <p className="text-caption text-text-primary">{value}</p>
      </div>
    </div>
  );
}
