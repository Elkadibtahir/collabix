import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  Eye,
  Download,
  Copy,
  Trash2,
  MoreHorizontal,
  Star,
  FileText,
} from 'lucide-react';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge, type Tone } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/cn';
import { reportsList } from './reports-data';
import { useToast } from '../../../components/ui/Toast';
import type { ReportMetadata, ReportFilter, ReportType, ReportStatus } from './report-types';

type ViewMode = 'grid' | 'list';

export function ReportsCenterPage({ onNewReport, onBrowseTemplates }: { onNewReport?: () => void; onBrowseTemplates?: () => void }) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ReportFilter>({});
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size'>('recent');

  const filteredReports = useMemo(() => {
    let result = reportsList;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (filters.type) {
      result = result.filter((r) => r.type === filters.type);
    }
    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters.department) {
      result = result.filter((r) => r.department === filters.department);
    }
    if (filters.isFavorite) {
      result = result.filter((r) => r.isFavorite === true);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [search, filters, sortBy]);

  const reportTypes = Array.from(new Set(reportsList.map((r) => r.type)));
  const statuses = Array.from(new Set(reportsList.map((r) => r.status)));
  const departments = Array.from(new Set(reportsList.map((r) => r.department).filter(Boolean)));

  const stats = {
    total: reportsList.length,
    generated: reportsList.filter((r) => r.status === 'generated').length,
    pending: reportsList.filter((r) => r.status === 'pending').length,
    favorites: reportsList.filter((r) => r.isFavorite).length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Reports</h1>
        <p className="text-body text-text-secondary">
          Generate, browse and manage workspace reports.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Reports" value={stats.total} tone="accent" />
        <StatCard label="Generated" value={stats.generated} tone="success" />
        <StatCard label="Pending" value={stats.pending} tone="warning" />
        <StatCard label="Favorites" value={stats.favorites} tone="info" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search reports..."
              leftIcon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              containerClassName="w-full"
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
              { label: 'All Types', onClick: () => setFilters((f) => ({ ...f, type: undefined })) },
              { divider: true },
              ...reportTypes.map((t) => ({
                label: t.charAt(0).toUpperCase() + t.slice(1),
                onClick: () => setFilters((f) => ({ ...f, type: t as ReportType })),
              })),
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="outline">
                Status
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'All Statuses', onClick: () => setFilters((f) => ({ ...f, status: undefined })) },
              { divider: true },
              ...statuses.map((s) => ({
                label: s.charAt(0).toUpperCase() + s.slice(1),
                onClick: () => setFilters((f) => ({ ...f, status: s as ReportStatus })),
              })),
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
              { label: 'Recent', onClick: () => setSortBy('recent') },
              { label: 'Name', onClick: () => setSortBy('name') },
              { label: 'Size', onClick: () => setSortBy('size') },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 border border-border-subtle rounded-lg p-1">
            <IconButton
              label="Grid view"
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}
             
              onClick={() => setViewMode('grid')}
              className="h-8 w-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="List view"
              variant={viewMode === 'list' ? 'solid' : 'ghost'}
             
              onClick={() => setViewMode('list')}
              className="h-8 w-8"
            >
              <LayoutList className="h-4 w-4" />
            </IconButton>
          </div>

          <Button leftIcon={<Plus />} onClick={onNewReport}>
            New Report
          </Button>
          <Button variant="outline" onClick={onBrowseTemplates}>
            Browse Templates
          </Button>
        </div>
      </div>

      {/* Reports Grid/List */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No reports found"
          description="Create a new report or browse templates to get started."
        />
      ) : viewMode === 'grid' ? (
        <GridView reports={filteredReports} />
      ) : (
        <ListView reports={filteredReports} />
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
  tone: 'accent' | 'success' | 'warning' | 'info';
}) {
  const bgColor = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
  } as const;

  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bgColor[tone])}>
      <p className="text-2xs font-medium opacity-75">{label}</p>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}

function GridView({ reports }: { reports: ReportMetadata[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

function ListView({ reports }: { reports: ReportMetadata[] }) {
  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <ReportListRow key={report.id} report={report} />
      ))}
    </div>
  );
}

function ReportCard({ report }: { report: ReportMetadata }) {
  const { toast } = useToast();
  const statusColor: Record<string, Tone> = {
    generated: 'success',
    draft: 'warning',
    pending: 'info',
    failed: 'danger',
    cancelled: 'neutral',
  };

  const typeEmoji: Record<string, string> = {
    workspace: '🏢',
    department: '👥',
    team: '👨‍💼',
    project: '📋',
    productivity: '📊',
    knowledge: '📚',
    documents: '📄',
    activity: '🔄',
    handover: '📝',
    notification: '🔔',
  };

  const actionItems: DropdownItem[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Download', icon: <Download className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Duplicate', icon: <Copy className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { divider: true },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
  ];

  return (
    <Card>
      <CardBody>
        <div className="flex items-start gap-3">
          <div className="text-2xl mr-2">{typeEmoji[report.type]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-body font-medium text-text-primary truncate">{report.name}</h4>
              <Badge tone={statusColor[report.status]} variant="soft">{report.status}</Badge>
            </div>
            <p className="text-caption text-text-secondary mt-1 line-clamp-2">{report.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <IconButton label="More" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>
          </div>
        </div>
      </CardBody>
    </Card>
  );
  }

function ReportListRow({ report }: { report: ReportMetadata }) {
  const { toast } = useToast();
  const statusColor: Record<string, Tone> = {
    generated: 'success',
    draft: 'warning',
    pending: 'info',
    failed: 'danger',
    cancelled: 'neutral',
  };

  const typeEmoji: Record<string, string> = {
    workspace: '🏢',
    department: '👥',
    team: '👨‍💼',
    project: '📋',
    productivity: '📊',
    knowledge: '📚',
    documents: '📄',
    activity: '🔄',
    handover: '📝',
    notification: '🔔',
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
      <div className="text-2xl">{typeEmoji[report.type]}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-body font-medium text-text-primary truncate">{report.name}</h4>
          <Badge tone={statusColor[report.status]} variant="soft">
            {report.status}
          </Badge>
        </div>
        <p className="text-caption text-text-secondary line-clamp-1">
          {report.description}
        </p>
      </div>

      <div className="flex items-center gap-4 text-center shrink-0">
        <div>
          <p className="text-caption font-medium text-text-primary">{report.createdBy}</p>
          <p className="text-2xs text-text-tertiary">{report.createdAt}</p>
        </div>
        {report.pages && (
          <div>
            <p className="text-caption font-medium text-text-primary">{report.pages}</p>
            <p className="text-2xs text-text-tertiary">pages</p>
          </div>
        )}
      </div>

      <IconButton
        label="Favorite"
        variant="ghost"
       
        className={cn(
          'text-text-tertiary',
          report.isFavorite && 'text-warning-600',
        )}
      >
        <Star className="h-4 w-4" fill={report.isFavorite ? 'currentColor' : 'none'} />
      </IconButton>

      <Dropdown
        trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
        items={[
          { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
          { label: 'Download', icon: <Download className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
          { divider: true },
          { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
        ]}
        align="right"
      />
    </div>
  );
}
