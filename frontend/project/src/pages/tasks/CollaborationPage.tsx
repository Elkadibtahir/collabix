import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, AtSign, Activity, Loader2, Users, AlertCircle, Search } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePersonalDashboard } from '../../services/workspace-hooks';
import { useWorkspaceAnalytics } from '../../services/department-hooks';
import { cn } from '../../lib/cn';

interface FeedItem {
  id: string;
  type: 'comment' | 'mention' | 'activity';
  authorName: string;
  content: string;
  context: string;
  timestamp: string;
}

export function CollaborationPage() {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get('ws') ?? '';
  const [search, setSearch] = useState('');
  const [feedType, setFeedType] = useState<'all' | 'comments' | 'mentions' | 'activity'>('all');

  const { data: dashboard, isLoading: dashLoading, isError: dashError } = usePersonalDashboard(workspaceId || undefined);
  const { data: analytics, isLoading: anLoading } = useWorkspaceAnalytics(workspaceId || undefined) as { data: { commentCount?: number; memberCount?: number } | undefined; isLoading: boolean };

  const feedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    if (dashboard) {
      dashboard.recentComments?.forEach((c) => {
        items.push({
          id: `c-${c.id}`,
          type: 'comment',
          authorName: c.authorName ?? 'Unknown',
          content: c.content,
          context: c.taskTitle ?? 'Task',
          timestamp: c.createdAt,
        });
      });
      dashboard.unreadMentions?.forEach((m) => {
        items.push({
          id: `m-${m.id}`,
          type: 'mention',
          authorName: m.mentionedBy ?? 'Someone',
          content: m.content,
          context: 'Mention',
          timestamp: m.createdAt,
        });
      });
      dashboard.recentActivities?.forEach((a) => {
        items.push({
          id: `a-${a.id}`,
          type: 'activity',
          authorName: a.actorName ?? 'System',
          content: a.description,
          context: a.projectName ?? 'General',
          timestamp: a.createdAt,
        });
      });
      dashboard.workspaceActivities?.forEach((a) => {
        items.push({
          id: `wa-${a.id}`,
          type: 'activity',
          authorName: a.actorName ?? 'System',
          content: a.description,
          context: a.projectName ?? 'General',
          timestamp: a.createdAt,
        });
      });
    }
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [dashboard]);

  const filteredItems = useMemo(() => {
    let result = feedItems;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.authorName.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q) ||
        i.context.toLowerCase().includes(q)
      );
    }
    if (feedType !== 'all') {
      result = result.filter((i) => i.type === feedType);
    }
    return result;
  }, [feedItems, search, feedType]);

  const commentCount = dashboard?.recentComments?.length ?? 0;
  const mentionCount = dashboard?.unreadMentions?.length ?? 0;
  const activityCount = (dashboard?.recentActivities?.length ?? 0) + (dashboard?.workspaceActivities?.length ?? 0);

  if (dashLoading || anLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500 dark:bg-danger-500/10">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-section font-semibold text-text-primary">Unable to load collaboration data</h3>
        <p className="mt-1 text-body text-text-tertiary">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Collaboration</h1>
        <p className="text-body text-text-secondary">
          Discuss, collaborate, and stay connected with your team.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<MessageSquare />} label="Comments" value={commentCount} />
        <StatCard icon={<AtSign />} label="Mentions" value={mentionCount} />
        <StatCard icon={<Activity />} label="Activities" value={activityCount} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-2">
          <Input
            placeholder="Search feed..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="w-full sm:max-w-xs"
          />
          <div className="flex gap-1">
            {(['all', 'comments', 'mentions', 'activity'] as const).map((t) => (
              <Button
                key={t}
                variant={feedType === t ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFeedType(t)}
              >
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<MessageSquare />}
          title="No activity yet"
          description="Collaboration feed will populate as your team works on projects."
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 [&>svg]:h-[18px] [&>svg]:w-[18px]">
        {icon}
      </span>
      <div>
        <p className="text-2xs text-text-tertiary">{label}</p>
        <p className="text-body font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const typeColor = item.type === 'comment' ? 'accent' : item.type === 'mention' ? 'warning' : 'info';
  const typeLabel = item.type === 'comment' ? 'Comment' : item.type === 'mention' ? 'Mention' : 'Activity';
  return (
    <Card className="hover:border-border-default transition-colors">
      <CardBody className="space-y-2">
        <div className="flex items-center gap-2">
          <Avatar name={item.authorName} size="sm" />
          <p className="text-body font-semibold text-text-primary">{item.authorName}</p>
          <Badge tone={typeColor} variant="soft">{typeLabel}</Badge>
          <span className="text-2xs text-text-tertiary ml-auto">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
        </div>
        <p className="text-body text-text-secondary leading-relaxed">{item.content}</p>
        {item.context && item.type !== 'mention' && (
          <Badge tone="neutral" variant="soft">{item.context}</Badge>
        )}
      </CardBody>
    </Card>
  );
}