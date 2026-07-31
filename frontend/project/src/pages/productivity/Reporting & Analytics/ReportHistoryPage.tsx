import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Share2,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Timeline, type TimelineItem } from '../../../components/ui/Timeline';
import { useToast } from '../../../components/ui/Toast';
import { reportHistory } from './reports-data';

type HistoryType = 'all' | 'generated' | 'exported' | 'viewed' | 'shared';

export function ReportHistoryPage({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [historyType, setHistoryType] = useState<HistoryType>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

  const filteredHistory = useMemo(() => {
    let result = reportHistory;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.reportName.toLowerCase().includes(q) ||
          h.actor.toLowerCase().includes(q),
      );
    }

    if (historyType !== 'all') {
      result = result.filter((h) => h.type === historyType);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [search, historyType, sortBy]);

  const typeIcon: Record<string, string> = {
    generated: '📊',
    exported: '📥',
    downloaded: '⬇️',
    viewed: '👁️',
    shared: '🔗',
    favorited: '⭐',
  };

  const stats = {
    total: reportHistory.length,
    generated: reportHistory.filter((h) => h.type === 'generated').length,
    exported: reportHistory.filter((h) => h.type === 'exported').length,
    viewed: reportHistory.filter((h) => h.type === 'viewed').length,
    shared: reportHistory.filter((h) => h.type === 'shared').length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-page font-semibold text-text-primary">Report History</h1>
          <p className="text-body text-text-secondary">
            Track all report generation, exports and access activities.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total Activities" value={stats.total} tone="accent" />
        <StatCard label="Generated" value={stats.generated} tone="success" />
        <StatCard label="Exported" value={stats.exported} tone="info" />
        <StatCard label="Viewed" value={stats.viewed} tone="warning" />
        <StatCard label="Shared" value={stats.shared} tone="accent" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search reports or users..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dropdown
          trigger={
            <Button variant="outline">
              Type
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          }
          items={[
            { label: 'All Activities', onClick: () => setHistoryType('all') },
            { label: 'Generated', onClick: () => setHistoryType('generated') },
            { label: 'Exported', onClick: () => setHistoryType('exported') },
            { label: 'Viewed', onClick: () => setHistoryType('viewed') },
            { label: 'Shared', onClick: () => setHistoryType('shared') },
          ]}
        />

        <Dropdown
          trigger={
            <Button variant="outline">
              Sort
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          }
          items={[
            { label: 'Recent First', onClick: () => setSortBy('recent') },
            { label: 'Oldest First', onClick: () => setSortBy('oldest') },
          ]}
        />
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={<Clock />}
          title="No activities found"
          description="Report activities will appear here."
        />
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} icon={typeIcon[entry.type]} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  const bgColor = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
  } as const;

  return (
    <div className={`rounded-lg border border-border-subtle p-3 ${bgColor[tone]}`}>
      <p className="text-2xs font-medium opacity-75">{label}</p>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}

function HistoryItem({ entry, icon }: { entry: any; icon: string }) {
  const typeColor = {
    generated: 'success',
    exported: 'info',
    downloaded: 'accent',
    viewed: 'warning',
    shared: 'accent',
    favorited: 'warning',
  } as const;

  const actionText: Record<string, string> = {
    generated: 'generated',
    exported: 'exported',
    downloaded: 'downloaded',
    viewed: 'viewed',
    shared: 'shared',
    favorited: 'favorited',
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
      <span className="text-2xl shrink-0 mt-0.5">{icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-body font-medium text-text-primary truncate">
            {entry.reportName}
          </h4>
          <Badge tone={typeColor[entry.type]} variant="soft">
            {entry.type}
          </Badge>
        </div>

        <p className="text-caption text-text-secondary">
          <span className="font-semibold">{entry.actor}</span> {actionText[entry.type]} this report
          {entry.details && ` - ${entry.details}`}
        </p>

        <p className="text-2xs text-text-tertiary mt-2">
          <Clock className="inline h-3 w-3 mr-1" />
          {entry.timestamp}
        </p>
      </div>

      <div className="flex gap-1 shrink-0">
        <IconButton label="View" variant="ghost" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
          <Eye className="h-4 w-4" />
        </IconButton>
        <IconButton label="More" variant="ghost" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
