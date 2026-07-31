import { Card, CardBody } from '../../../components/ui/Card';
import { Timeline } from '../../../components/ui/Timeline';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Clock, Activity as ActivityIcon } from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  tone: 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  title: string;
  timestamp: string;
}

export function DeptActivity({ items, wsId, deptId }: { items?: ActivityItem[]; wsId?: string; deptId?: string }) {
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardBody className="py-16">
          <EmptyState icon={<ActivityIcon />} title="No recent activity" description="Department activity will appear here." />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <Timeline items={items} />
      </CardBody>
    </Card>
  );
}
