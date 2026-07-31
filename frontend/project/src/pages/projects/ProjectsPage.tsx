import { useState } from 'react';
import { Search, Plus, ChevronDown, FolderKanban, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Can } from '../../pages/auth';
import { useProjectList } from '../../services/project-hooks';
import { CreateProjectModal } from './modals/CreateProjectModal';
import type { ProjectResponse, ProjectPriority } from './projects-types';

const priorityColors: Record<ProjectPriority, 'danger' | 'warning' | 'info' | 'success'> = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'success',
};

const statusColors: Record<string, 'success' | 'neutral'> = {
  ACTIVE: 'success',
  ARCHIVED: 'neutral',
};

export function ProjectsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wsId = searchParams.get('ws') ?? '';
  const deptId = searchParams.get('dept') ?? '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError, error } = useProjectList(wsId || undefined, deptId || undefined, search || undefined, page);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
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
            title="Failed to load projects"
            description={error instanceof Error ? error.message : 'An unexpected error occurred.'}
          >
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  const projects = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Projects</h1>
        <p className="text-body text-text-secondary">Manage projects across your departments.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            containerClassName="w-full sm:max-w-xs"
          />
        </div>
        <Can permission="PROJECT_CREATE">
          <Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>Create Project</Button>
        </Can>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={<FolderKanban className="h-6 w-6" />}
              title="No projects found"
              description={search ? 'No projects match your search.' : 'No projects yet. Create your first project to get started.'}
            >
              {!search && (
                <Can permission="PROJECT_CREATE">
                  <Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>Create Project</Button>
                </Can>
              )}
            </EmptyState>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onClick={() => navigate(`/app/projects/${project.id}?ws=${wsId}&dept=${deptId}`)} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination page={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} className="self-center" />
          )}
        </>
      )}

      {showCreate && wsId && deptId && (
        <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} wsId={wsId} deptId={deptId} />
      )}
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: ProjectResponse; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left w-full rounded-xl border border-border-subtle bg-surface p-4 hover:border-border-default hover:shadow-cx-sm transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: project.color ?? '#e5e7eb' }}>
            <FolderKanban className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-body font-semibold text-text-primary truncate">{project.name}</h3>
            {project.departmentName && (
              <p className="text-2xs text-text-tertiary truncate">{project.departmentName}</p>
            )}
          </div>
        </div>
        {project.priority && (
          <Badge tone={priorityColors[project.priority]} variant="soft" dot className="shrink-0 capitalize">
            {project.priority.toLowerCase()}
          </Badge>
        )}
      </div>

      {project.description && (
        <p className="text-caption text-text-tertiary line-clamp-2 mb-3">{project.description}</p>
      )}

      <div className="flex items-center gap-2 mt-auto">
        <Badge tone={statusColors[project.status]} variant="soft" dot>
          {project.status === 'ACTIVE' ? 'Active' : 'Archived'}
        </Badge>
        {project.managerName && (
          <span className="text-2xs text-text-tertiary ml-auto">{project.managerName}</span>
        )}
      </div>
    </button>
  );
}
