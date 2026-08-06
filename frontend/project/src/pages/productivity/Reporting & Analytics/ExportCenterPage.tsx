import { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Share2,
  Copy,
  Trash2,
  FileText,
  Table as TableIcon,
  File as FileIcon,
  Printer,
  Clock,
  MoreHorizontal,
  Search,
  ChevronDown,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge, type Tone } from '../../../components/ui/Badge';
import type { ReportExport } from './report-types';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';

export function ExportCenterPage({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>();

  const exports: ReportExport[] = [];

  const filteredExports = exports.filter((exp) => {
    const matchesSearch =
      search === '' ||
      exp.reportName.toLowerCase().includes(search.toLowerCase()) ||
      exp.generatedBy.toLowerCase().includes(search.toLowerCase());
    const matchesFormat = !filterFormat || exp.format === filterFormat;
    return matchesSearch && matchesFormat;
  });

  const stats = {
    total: exports.length,
    success: exports.filter((e) => e.status === 'success').length,
    pending: exports.filter((e) => e.status === 'pending').length,
    totalSize: (exports.reduce((sum, e) => sum + e.fileSize, 0) / 1024).toFixed(1),
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
          <h1 className="text-page font-semibold text-text-primary">Export Center</h1>
          <p className="text-body text-text-secondary">
            Manage all exported reports and downloads.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Exports" value={stats.total} tone="accent" />
        <StatCard label="Successful" value={stats.success} tone="success" />
        <StatCard label="Pending" value={stats.pending} tone="info" />
        <StatCard label="Total Size" value={`${stats.totalSize} MB`} tone="warning" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search exports..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dropdown
          trigger={
            <Button variant="outline">
              Format
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          }
          items={[
            { label: 'All Formats', onClick: () => setFilterFormat(undefined) },
            { divider: true },
            { label: 'PDF', onClick: () => setFilterFormat('pdf') },
            { label: 'CSV', onClick: () => setFilterFormat('csv') },
            { label: 'Excel', onClick: () => setFilterFormat('excel') },
          ]}
        />
      </div>

      {/* Export Cards */}
      {filteredExports.length === 0 ? (
        <EmptyState
          icon={<FileIcon />}
          title="No exports found"
          description="Generate and export a report to see it here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredExports.map((exp) => (
            <ExportCard key={exp.id} export={exp} />
          ))}
        </div>
      )}

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          <p className="text-body text-text-secondary mb-3">
            Create a new export from existing reports
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <QuickExportButton format="pdf" icon={<FileText />} />
            <QuickExportButton format="csv" icon={<TableIcon />} />
            <QuickExportButton format="excel" icon={<TableIcon />} />
            <QuickExportButton format="print" icon={<Printer />} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'accent' | 'success' | 'warning' | 'info';
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

function ExportCard({ export: exp }: { export: ReportExport }) {
  const { toast } = useToast();
  const formatIcon: Record<string, React.ReactNode> = {
    pdf: <FileText className="h-5 w-5" />,
    csv: <TableIcon className="h-5 w-5" />,
    excel: <TableIcon className="h-5 w-5" />,
    print: <Printer className="h-5 w-5" />,
  };

  const formatLabel: Record<string, string> = {
    pdf: 'PDF',
    csv: 'CSV',
    excel: 'Excel',
    print: 'Print',
  };

  const statusColor: Record<string, Tone> = {
    success: 'success',
    pending: 'info',
    failed: 'danger',
  };

  const actionItems: DropdownItem[] = [
    { label: 'Download', icon: <Download className="h-4 w-4" />, disabled: exp.status !== 'success', onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Share', icon: <Share2 className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Copy Link', icon: <Copy className="h-4 w-4" />, disabled: exp.status !== 'success', onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { divider: true },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
  ];

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
      {/* Icon */}
      <div className="text-accent-600 dark:text-accent-400">{formatIcon[exp.format]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-body font-medium text-text-primary truncate">
            {exp.reportName}
          </h4>
          <Badge tone={statusColor[exp.status]} variant="soft">
            {exp.status === 'success' ? 'Downloaded' : exp.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-caption text-text-secondary">
          <span className="flex items-center gap-1">
            <FileIcon className="h-3 w-3" />
            {formatLabel[exp.format]}
          </span>
          <span>{(exp.fileSize / 1024).toFixed(1)} KB</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {exp.generatedAt}
          </span>
          <span className="flex items-center gap-1">
            by {exp.generatedBy}
          </span>
        </div>
      </div>

      {/* Actions */}
      {exp.status === 'pending' ? (
        <div className="flex items-center gap-2 text-info-600">
          <Clock className="h-4 w-4" />
          <span className="text-caption font-medium">Processing...</span>
        </div>
      ) : (
        <div className="flex gap-1 shrink-0">
          <Button
            variant="outline"
           
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => toast({ title: 'Coming soon', tone: 'info' })}
          >
            Download
          </Button>
          <Dropdown
            trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
            items={actionItems}
            align="right"
          />
        </div>
      )}
    </div>
  );
}

function QuickExportButton({ format, icon }: { format: string; icon: React.ReactNode }) {
  const { toast } = useToast();
  const formatLabel: Record<string, string> = {
    pdf: 'Export as PDF',
    csv: 'Export as CSV',
    excel: 'Export as Excel',
    print: 'Print Report',
  };

  return (
    <Button variant="outline" fullWidth onClick={() => toast({ title: 'Coming soon', tone: 'info' })}>
      {icon}
      <span className="hidden sm:inline">{formatLabel[format]}</span>
      <span className="sm:hidden">{format.toUpperCase()}</span>
    </Button>
  );
}
