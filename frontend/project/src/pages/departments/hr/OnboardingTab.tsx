import { useState } from 'react';
import { Search, Plus, CheckCircle, Circle, X, Loader2 } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Progress } from '../../../components/ui/Progress';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useOnboardingList, useCreateOnboarding, useOnboardingTasks, useCompleteOnboardingTask, useOnboardingStats } from '../../../services/onboarding-hooks';

export function OnboardingTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError } = useOnboardingList(wsId, deptId);
  const { data: stats } = useOnboardingStats(wsId, deptId);
  const { data: tasksData } = useOnboardingTasks(wsId, deptId, expanded ?? '');
  const createOnboarding = useCreateOnboarding(wsId, deptId);
  const completeTask = useCompleteOnboardingTask(wsId, deptId, expanded ?? '');

  const onboardings = data?.content ?? [];
  const tasks = tasksData ?? [];

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

      {onboardings.length === 0 ? (
        <EmptyState icon={<Plus />} title="No onboarding plans" description="Create onboarding plans for new employees." />
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
                  <Badge tone={o.status === 'COMPLETED' ? 'success' : o.status === 'ACTIVE' ? 'warning' : 'info'} variant="soft">
                    {o.status}
                  </Badge>
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
                  <span>Start: {o.startDate}</span>
                  {o.expectedCompletionDate && <span>Due: {o.expectedCompletionDate}</span>}
                </div>

                <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  {expanded === o.id ? 'Hide Tasks' : 'View Tasks'} ({o.totalTasks})
                </Button>

                {expanded === o.id && (
                  <div className="flex flex-col gap-2 border-t border-border-subtle pt-3">
                    {tasks.length === 0 ? (
                      <p className="text-caption text-text-tertiary">No tasks loaded.</p>
                    ) : (
                      tasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition-colors">
                          <button onClick={() => completeTask.mutate(t.id)} className="shrink-0">
                            {t.status === 'COMPLETED' ? (
                              <CheckCircle className="h-5 w-5 text-success-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-text-tertiary" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-caption font-medium', t.status === 'COMPLETED' ? 'text-text-tertiary line-through' : 'text-text-primary')}>
                              {t.title}
                            </p>
                            {t.dueDate && <p className="text-2xs text-text-tertiary">Due: {t.dueDate}</p>}
                          </div>
                          <Badge tone={t.status === 'COMPLETED' ? 'success' : 'warning'} variant="soft">{t.status}</Badge>
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
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
