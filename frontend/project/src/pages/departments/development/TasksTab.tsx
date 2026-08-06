import { useState } from 'react';
import { FolderKanban, AlertCircle } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useProjectList } from '../../../services/project-hooks';
import { TasksPage } from '../../tasks/TasksPage';

export function DevelopmentTasksTab({ wsId, deptId }: { wsId: string; deptId: string }) {
  const [projectId, setProjectId] = useState<string>('');
  const { data: projectsPage, isLoading, isError } = useProjectList(wsId, deptId, undefined, 0);

  const projects = projectsPage?.content ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-6 w-6" />}
        title="Failed to load projects"
        description="Projects are required to scope tasks."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page font-semibold text-text-primary">Tasks</h1>
          <p className="text-body text-text-secondary">Manage tasks for a development project in this department.</p>
        </div>
        <div className="w-full max-w-xs">
          <Select
            label="Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: projects.length ? 'Select a project' : 'No projects available' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
      </div>

      {!projectId ? (
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={<FolderKanban className="h-6 w-6" />}
              title={projects.length ? 'Select a project' : 'No projects yet'}
              description={
                projects.length
                  ? 'Choose a project above to view, create, and manage its tasks.'
                  : 'Create a project in the Projects tab to start managing tasks.'
              }
            />
          </CardBody>
        </Card>
      ) : (
        <TasksPage workspaceId={wsId} departmentId={deptId} projectId={projectId} />
      )}
    </div>
  );
}

export default DevelopmentTasksTab;
