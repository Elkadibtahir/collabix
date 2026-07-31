import { useState } from 'react';
import { Search, Users, Shield, UserPlus, Mail, Calendar } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export function WorkspaceMembersPage({ workspaceId }: { workspaceId: string }) {
  const [search, setSearch] = useState('');
  const isLoading = false;
  const isError = false;

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
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
            icon={<Users className="h-6 w-6" />}
            title="Failed to load members"
            description="An error occurred while loading workspace members."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-display font-semibold text-text-primary">Workspace Members</h1>
          <p className="mt-1 text-body text-text-secondary">View and manage members of this workspace.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="cx-input h-10 pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardBody>
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Member listing coming soon"
            description="A detailed list of workspace members with search, filtering, and role management will be available in a future update."
          />
        </CardBody>
      </Card>
    </div>
  );
}
