import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Circle, Loader2, Trash2, Rocket, CheckCheck } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge, type Tone } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { IconButton } from '../../../components/ui/IconButton';
import { Modal } from '../../../components/ui/Modal';
import { Progress } from '../../../components/ui/Progress';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Pagination } from '../../../components/ui/Pagination';
import { useToast } from '../../../components/ui/Toast';
import { useOnboardingList, useOnboardingTasks, useOnboardingStats, useCreateOnboarding, useDeleteOnboarding, useCreateOnboardingTask, useCompleteOnboardingTask, useDeleteOnboardingTask } from '../../../services/onboarding-hooks';
import type { CreateOnboardingRequest, CreateOnboardingTaskRequest } from '../../../services/onboarding-service';
import { onboardingService } from '../../../services/onboarding-service';
import { useEmployeesList } from '../../../services/employee-hooks';
import { useUsersList } from '../../../services/admin-hooks';
import { onboardingStatusColor, formatDate, formatEnum } from './hr-constants';

export function OnboardingTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [planForm, setPlanForm] = useState<CreateOnboardingRequest>({ employeeId: '', startDate: '' });
  const [taskForm, setTaskForm] = useState<CreateOnboardingTaskRequest>({ title: '' });

  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useOnboardingList(wsId, deptId, page);
  const { data: stats } = useOnboardingStats(wsId, deptId);
  const { data: tasksData } = useOnboardingTasks(wsId, deptId, expanded ?? '');
  const { data: empData } = useEmployeesList(wsId, deptId, 0, 100);
  const { data: usersData } = useUsersList();
  const createOnboarding = useCreateOnboarding(wsId, deptId);
  const deleteOnboarding = useDeleteOnboarding(wsId, deptId);
  const createTask = useCreateOnboardingTask(wsId, deptId, expanded ?? '');
  const completeTask = useCompleteOnboardingTask(wsId, deptId, expanded ?? '');
  const deleteTask = useDeleteOnboardingTask(wsId, deptId, expanded ?? '');

  const completePlan = useMutation({
    mutationFn: (id: string) => onboardingService.update(wsId, deptId, id, { status: 'COMPLETED' }),
    onSuccess: () => { toast({ title: 'Onboarding marked complete', tone: 'success' }); qc.invalidateQueries({ queryKey: ['onboarding', wsId, deptId] }); },
    onError: () => toast({ title: 'Failed to update onboarding', tone: 'danger' }),
  });

  const onboardings = data?.content ?? [];
  const totalPages = data?.page?.totalPages ?? 1;
  const tasks = tasksData ?? [];
  const employees = empData?.content ?? [];

  const openCreate = () => {
    setPlanForm({ employeeId: '', startDate: '', expectedCompletionDate: undefined, assignedManagerId: undefined, notes: undefined });
    setShowCreate(true);
  };

  const handleCreate = () => {
    createOnboarding.mutate(planForm, {
      onSuccess: () => { toast({ title: 'Onboarding plan created', tone: 'success' }); setShowCreate(false); },
      onError: () => toast({ title: 'Failed to create onboarding plan', tone: 'danger' }),
    });
  };

  const handleComplete = (id: string) => {
    completePlan.mutate(id);
  };

  const handleDeletePlan = (id: string) => {
    if (!window.confirm('Delete this onboarding plan? This cannot be undone.')) return;
    deleteOnboarding.mutate(id, {
      onSuccess: () => toast({ title: 'Onboarding plan deleted', tone: 'success' }),
      onError: () => toast({ title: 'Failed to delete onboarding plan', tone: 'danger' }),
    });
  };

  const handleAddTask = () => {
    if (!expanded) return;
    createTask.mutate(taskForm, {
      onSuccess: () => { toast({ title: 'Task added', tone: 'success' }); setShowTask(false); setTaskForm({ title: '' }); },
      onError: () => toast({ title: 'Failed to add task', tone: 'danger' }),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask.mutate(taskId, {
      onSuccess: () => toast({ title: 'Task deleted', tone: 'success' }),
      onError: () => toast({ title: 'Failed to delete task', tone: 'danger' }),
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-tertiary" /></div>;
  }

  if (isError) {
    return <div className="flex flex-col items-center justify-center py-20 gap-3"><p className="text-body font-medium text-danger-600">Failed to load onboarding</p><p className="text-caption text-text-tertiary">Please try again later.</p></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Total</span>
            <span className="text-section font-bold text-text-primary">{stats.totalOnboardings}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Active</span>
            <span className="text-section font-bold text-warning-600">{stats.activeOnboardings}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Completed</span>
            <span className="text-section font-bold text-success-600">{stats.completedOnboardings}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle">
            <span className="text-2xs text-text-tertiary">Overdue Tasks</span>
            <span className="text-section font-bold text-danger-600">{stats.overdueTasks}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-caption text-text-secondary">Track onboarding plans for new employees from start to completion.</p>
        <Button leftIcon={<Plus />} onClick={openCreate}>New Onboarding</Button>
      </div>

      {onboardings.length === 0 ? (
        <EmptyState icon={<Rocket />} title="No onboarding plans" description="Create onboarding plans for new employees." />
      ) : (
        <div className="space-y-3">
          {onboardings.map((o) => (
            <Card key={o.id}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300 text-caption font-semibold">
                      {o.employeeName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? '??'}
                    </div>
                    <div>
                      <p className="text-body font-medium text-text-primary">{o.employeeName}</p>
                      <p className="text-2xs text-text-tertiary">{o.employeeNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={(onboardingStatusColor[o.status] ?? 'neutral') as Tone} variant="soft" dot>{formatEnum(o.status)}</Badge>
                    {(o.status === 'NOT_STARTED' || o.status === 'IN_PROGRESS' || o.status === 'ON_HOLD') && (
                      <Button variant="outline" size="sm" leftIcon={<CheckCheck />} onClick={() => handleComplete(o.id)}>Complete</Button>
                    )}
                    <IconButton label="Delete plan" variant="ghost" size="sm" className="text-danger-600" onClick={() => handleDeletePlan(o.id)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xs text-text-tertiary">Progress</span>
                    <span className="text-2xs font-medium text-text-primary">{o.completionPercentage}%</span>
                  </div>
                  <Progress value={o.completionPercentage} size="sm" tone={o.completionPercentage >= 80 ? 'success' : o.completionPercentage >= 40 ? 'warning' : 'info'} />
                </div>

                <div className="flex items-center gap-4 text-2xs text-text-tertiary">
                  <span>{o.completedTasks}/{o.totalTasks} tasks</span>
                  <span>Start: {formatDate(o.startDate)}</span>
                  {o.expectedCompletionDate && <span>Due: {formatDate(o.expectedCompletionDate)}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    {expanded === o.id ? 'Hide Tasks' : 'View Tasks'} ({o.totalTasks})
                  </Button>
                  {expanded === o.id && (
                    <Button variant="outline" size="sm" leftIcon={<Plus />} onClick={() => { setTaskForm({ title: '' }); setShowTask(true); }}>Add Task</Button>
                  )}
                </div>

                {expanded === o.id && (
                  <div className="flex flex-col gap-2 border-t border-border-subtle pt-3">
                    {tasks.length === 0 ? (
                      <p className="text-caption text-text-tertiary">No tasks yet. Add the first onboarding task.</p>
                    ) : (
                      tasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                          <button onClick={() => completeTask.mutate(t.id)} className="shrink-0" aria-label={t.status === 'COMPLETED' ? 'Task completed' : 'Mark task complete'}>
                            {t.status === 'COMPLETED' ? (
                              <CheckCircle className="h-5 w-5 text-success-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-text-tertiary" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-caption font-medium ${t.status === 'COMPLETED' ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                              {t.title}
                            </p>
                            {t.dueDate && <p className="text-2xs text-text-tertiary">Due: {formatDate(t.dueDate)}</p>}
                          </div>
                          <Badge tone={(t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'warning' : 'neutral') as Tone} variant="soft">{formatEnum(t.status)}</Badge>
                          <IconButton label="Delete task" variant="ghost" size="sm" className="text-danger-600" onClick={() => handleDeleteTask(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Onboarding Plan"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!planForm.employeeId || !planForm.startDate}>Create</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Select label="Employee" value={planForm.employeeId} onChange={(e) => setPlanForm({ ...planForm, employeeId: e.target.value })}
            options={[{ value: '', label: 'Select employee...' }, ...employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName} — ${e.position}` }))]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={planForm.startDate} onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })} />
            <Input label="Expected Completion" type="date" value={planForm.expectedCompletionDate ?? ''} onChange={(e) => setPlanForm({ ...planForm, expectedCompletionDate: e.target.value || undefined })} />
          </div>
          <Select label="Assigned Manager" value={planForm.assignedManagerId ?? ''} onChange={(e) => setPlanForm({ ...planForm, assignedManagerId: e.target.value || undefined })}
            options={[{ value: '', label: 'No manager' }, ...(usersData ?? []).map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))]} />
          <Textarea label="Notes" rows={3} value={planForm.notes ?? ''} onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={showTask}
        onClose={() => setShowTask(false)}
        title="Add Onboarding Task"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowTask(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!taskForm.title}>Add</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input label="Task Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
          <Input label="Due Date" type="date" value={taskForm.dueDate ?? ''} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value || undefined })} />
          <Select label="Assign To" value={taskForm.assignedUserId ?? ''} onChange={(e) => setTaskForm({ ...taskForm, assignedUserId: e.target.value || undefined })}
            options={[{ value: '', label: 'Unassigned' }, ...(usersData ?? []).map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))]} />
          <Textarea label="Description" rows={3} value={taskForm.description ?? ''} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
