import { useState, useCallback } from 'react';
import { Archive, RotateCcw, Users, Network, FolderKanban, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { useArchivedWorkspacesList, useRestoreWorkspace } from '../../services/workspace-hooks';
import { useToast } from '../../components/ui/Toast';
import type { WorkspaceSummaryResponse } from '../../services/workspace-service';

function getInitials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ArchivedWorkspacesPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const { data: workspacesData, isLoading, isError, error, refetch } = useArchivedWorkspacesList();
  const restoreMutation = useRestoreWorkspace();

  const workspaces = workspacesData ?? [];
  const filtered = query
    ? workspaces.filter(ws => ws.name.toLowerCase().includes(query.toLowerCase()))
    : workspaces;

  const handleRestore = useCallback(async (ws: WorkspaceSummaryResponse) => {
    setRestoringId(ws.id);
    try {
      await restoreMutation.mutateAsync(ws.id);
      toast({ title: `"${ws.name}" restored successfully`, tone: 'success' });
    } catch {
      toast({ title: `Failed to restore "${ws.name}"`, tone: 'danger' });
    } finally {
      setRestoringId(null);
    }
  }, [restoreMutation, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState
            icon={<Archive className="h-6 w-6" />}
            title="Failed to load archived workspaces"
            description={error instanceof Error ? error.message : 'An error occurred while loading archived workspaces.'}
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

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div>
          <h1 className="text-display font-semibold text-text-primary">Archived Workspaces</h1>
          <p className="mt-1 text-body text-text-secondary">View and restore archived workspaces.</p>
        </div>
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={<Archive className="h-6 w-6" />}
              title="No archived workspaces"
              description="Archived workspaces will appear here. Workspaces are archived to preserve data while removing active access."
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-display font-semibold text-text-primary">Archived Workspaces</h1>
          <p className="mt-1 text-body text-text-secondary">View and restore archived workspaces.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search archived workspaces..."
          className="cx-input h-10 pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardBody className="py-12">
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No matching workspaces"
              description="Try adjusting your search."
              action={<Button variant="outline" onClick={() => setQuery('')}>Clear search</Button>}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(ws => {
            const initials = getInitials(ws.name);
            const isRestoring = restoringId === ws.id;
            return (
              <Card key={ws.id} className="hover:shadow-cx-md transition-shadow duration-200">
                <CardBody className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-text-tertiary dark:bg-border-subtle dark:text-text-secondary text-sm font-bold shrink-0">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary truncate">{ws.name}</p>
                        <p className="mt-0.5 text-caption text-text-tertiary line-clamp-2">{ws.description || 'No description'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Badge tone="neutral" variant="soft" dot>Archived</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-caption">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-text-tertiary" />
                      <span className="text-text-tertiary">Members:</span>
                      <span className="font-semibold text-text-primary">{ws.memberCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Network className="h-3.5 w-3.5 text-text-tertiary" />
                      <span className="text-text-tertiary">Teams:</span>
                      <span className="font-semibold text-text-primary">{ws.teamCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FolderKanban className="h-3.5 w-3.5 text-text-tertiary" />
                      <span className="text-text-tertiary">Projects:</span>
                      <span className="font-semibold text-text-primary">{ws.projectCount ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                    <p className="text-2xs text-text-tertiary">Created {formatDate(ws.createdAt)}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    fullWidth
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                    onClick={() => handleRestore(ws)}
                    disabled={isRestoring}
                    loading={isRestoring}
                  >
                    {isRestoring ? 'Restoring...' : 'Restore'}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
