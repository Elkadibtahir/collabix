import { Activity, Clock, User, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { useWorkspaceDashboard } from '../../services/workspace-hooks';
import { cn } from '../../lib/cn';

function formatDate(dateStr: string): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function WorkspaceActivityPage({ workspaceId }: { workspaceId: string }) {
  const { data: dash, isLoading, isError, error, refetch, isFetching } = useWorkspaceDashboard(workspaceId || undefined);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="Failed to load activity"
            description={error instanceof Error ? error.message : 'An error occurred while loading workspace activity.'}
            action={
              <Button onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                Retry
              </Button>
            }
          />
        </CardBody>
      </Card>
    );
  }

  const activities = dash?.recentActivities ?? [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-display font-semibold text-text-primary">Activity Log</h1>
          <p className="mt-1 text-body text-text-secondary">Track all recent activity across this workspace.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={<Activity className="h-6 w-6" />}
              title="No recent activity"
              description="There is no activity logged for this workspace yet."
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="relative">
              <div className="absolute left-[25px] top-0 bottom-0 w-px bg-border-subtle" />
              <div className="divide-y divide-border-subtle">
                {activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-2 transition-colors">
                    <span className="relative z-10 flex h-[14px] w-[14px] items-center justify-center mt-1 shrink-0">
                      <span className="h-[14px] w-[14px] rounded-full border-2 border-accent-500 bg-canvas" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body text-text-primary">{a.description}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {a.actorName}
                        </span>
                        {a.projectName && (
                          <Badge tone="accent" variant="soft">{a.projectName}</Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(a.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
