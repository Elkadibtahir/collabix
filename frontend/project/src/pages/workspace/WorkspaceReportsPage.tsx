import { BarChart3, FileText } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export function WorkspaceReportsPage({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-display font-semibold text-text-primary">Reports</h1>
        <p className="mt-1 text-body text-text-secondary">Generate and view workspace reports.</p>
      </div>
      <Card>
        <CardBody className="py-16">
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="Reports center coming soon"
            description="The reports center is under development. You will be able to generate and view detailed workspace reports here in a future update."
          />
        </CardBody>
      </Card>
    </div>
  );
}
