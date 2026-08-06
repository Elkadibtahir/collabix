import { useState } from 'react';
import { Clock, Filter } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

export function ActivityTimelinePage() {
  const { toast } = useToast();
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page font-semibold text-text-primary">Activity Timeline</h1>
          <p className="text-caption text-text-secondary mt-0.5">Track your recent actions and events</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Filter />} onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>Filter</Button>
      </div>

      <Card>
        <CardBody>
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title="No activity yet"
            description="Your recent activity will appear here once you start using the workspace."
          />
        </CardBody>
      </Card>
    </div>
  );
}
