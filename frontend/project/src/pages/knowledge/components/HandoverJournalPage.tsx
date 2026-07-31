import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  Eye,
  Download,
  Share2,
  Printer,
  Archive,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { IconButton } from '../../../components/ui/IconButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageLoader } from '../../../components/ui/PageLoader';
import { useToast } from '../../../components/ui/Toast';
import { useHandoverJournals, useHandoverJournal } from '../../../services/handover-hooks';
import type { HandoverJournalResponse, HandoverAIResponse } from '../../../services/handover-service';

type ViewMode = 'dashboard' | 'report';

interface FiltersType {
  search?: string;
  department?: string;
  shift?: string;
  status?: string;
}

/* ---------- Mapper: backend DTO → frontend shape ---------- */

function mapJournalToReport(j: HandoverJournalResponse | HandoverAIResponse) {
  return {
    id: j.id ?? j.journalId ?? '',
    reportNumber: `HO-${(j as any).journalDate?.substring(0, 10) ?? new Date().toISOString().substring(0, 10)}-${(j.id ?? j.journalId ?? '').substring(0, 4)}`,
    department: (j as any).departmentId ?? '',
    team: '',
    project: (j as any).projectId ?? '',
    shift: j.shift === 'MORNING' ? 'morning' as const : 'evening' as const,
    date: (j as any).journalDate ?? (j as any).logDate ?? j.createdAt?.substring(0, 10) ?? '',
    generatedAt: (j as any).generationDate ?? j.createdAt ?? '',
    status: (j.generationStatus === 'GENERATED' ? 'completed' : j.generationStatus === 'FAILED' ? 'archived' : 'pending') as 'pending' | 'completed' | 'archived',
    submittedEntries: 0,
    contributors: 0,
    completedTasks: 0,
    pendingTasks: 0,
    blockedTasks: 0,
    criticalIssues: 0,
    overallProgress: j.generationStatus === 'GENERATED' ? 100 : j.generationStatus === 'FAILED' ? 0 : 50,
  };
}

export function HandoverJournalPage({
  workspaceId = '',
  departmentId = '',
  projectId = '',
}: {
  workspaceId?: string;
  departmentId?: string;
  projectId?: string;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedReport, setSelectedReport] = useState<ReturnType<typeof mapJournalToReport> | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FiltersType>({});
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'entries'>('date');
  const { toast } = useToast();

  const { data: journalsPage, isLoading, isError, error } = useHandoverJournals(workspaceId, departmentId, projectId);
  const journals = journalsPage?.content ?? [];

  const mappedReports = useMemo(() => journals.map(mapJournalToReport), [journals]);

  const filteredReports = useMemo(() => {
    let result = mappedReports;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.reportNumber.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          (r.team?.toLowerCase() || '').includes(q),
      );
    }

    if (filters.department) {
      result = result.filter((r) => r.department === filters.department);
    }
    if (filters.shift) {
      result = result.filter((r) => r.shift === filters.shift);
    }
    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.overallProgress - a.overallProgress;
        case 'entries':
          return b.submittedEntries - a.submittedEntries;
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [mappedReports, search, filters, sortBy]);

  const departments = Array.from(new Set(mappedReports.map((r) => r.department)));
  const shifts = Array.from(new Set(mappedReports.map((r) => r.shift)));

  const stats = {
    todayReports: journals.length,
    thisWeek: journals.length,
    completedDepts: mappedReports.filter((r) => r.status === 'completed').length,
    missingEntries: 0,
    avgCompletion: mappedReports.length > 0
      ? Math.round(mappedReports.reduce((sum, r) => sum + r.overallProgress, 0) / mappedReports.length)
      : 0,
  };

  /* ---------- Loading state ---------- */
  if (isLoading) {
    return <PageLoader />;
  }

  /* ---------- Error state ---------- */
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-danger-500" />
        <p className="text-body font-medium text-text-primary">Failed to load handover journals</p>
        <p className="text-caption text-text-tertiary">{(error as any)?.message ?? 'An unexpected error occurred'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (viewMode === 'report' && selectedReport) {
    return (
      <ReportView
        report={selectedReport}
        workspaceId={workspaceId}
        departmentId={departmentId}
        projectId={projectId}
        onBack={() => {
          setViewMode('dashboard');
          setSelectedReport(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page font-semibold text-text-primary">Handover Journal</h1>
        <p className="text-body text-text-secondary">
          Automatically generated work summaries from employee handover entries.
        </p>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <AnalyticsWidget icon={<FileText />} label="Journals" value={stats.todayReports} tone="info" />
        <AnalyticsWidget icon={<TrendingUp />} label="This Week" value={stats.thisWeek} tone="accent" />
        <AnalyticsWidget icon={<CheckCircle2 />} label="Completed" value={stats.completedDepts} tone="success" />
        <AnalyticsWidget icon={<AlertCircle />} label="Pending" value={mappedReports.filter((r) => r.status === 'pending').length} tone="warning" />
        <AnalyticsWidget icon={<TrendingUp />} label="Avg Completion" value={`${stats.avgCompletion}%`} tone="success" />
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
                Department
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'All Departments', onClick: () => setFilters((f) => ({ ...f, department: undefined })) },
              ...(departments.length > 0 ? [{ divider: true as const }] : []),
              ...departments.map((d) => ({
                label: d,
                onClick: () => setFilters((f) => ({ ...f, department: d })),
              })),
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="outline">
                Shift
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={[
              { label: 'All Shifts', onClick: () => setFilters((f) => ({ ...f, shift: undefined })) },
              ...(shifts.length > 0 ? [{ divider: true as const }] : []),
              ...shifts.map((s) => ({
                label: s.charAt(0).toUpperCase() + s.slice(1),
                onClick: () => setFilters((f) => ({ ...f, shift: s })),
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
              { label: 'Date', onClick: () => setSortBy('date') },
              { label: 'Progress', onClick: () => setSortBy('progress') },
              { label: 'Entries', onClick: () => setSortBy('entries') },
            ]}
          />
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No reports found"
          description="Try adjusting your search or filters to find reports."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onView={() => {
                setSelectedReport(report);
                setViewMode('report');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsWidget({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: string }) {
  const bgColor: Record<string, string> = {
    accent: 'bg-accent-50 dark:bg-accent-100',
    success: 'bg-success-50 dark:bg-success-100',
    warning: 'bg-warning-50 dark:bg-warning-100',
    info: 'bg-info-50 dark:bg-info-100',
    danger: 'bg-danger-50 dark:bg-danger-100',
  };
  const textColor: Record<string, string> = {
    accent: 'text-accent-700 dark:text-accent-200',
    success: 'text-success-700 dark:text-success-200',
    warning: 'text-warning-700 dark:text-warning-200',
    info: 'text-info-700 dark:text-info-200',
    danger: 'text-danger-700 dark:text-danger-200',
  };
  return (
    <div className={`rounded-lg p-3 border border-border-subtle ${bgColor[tone]} ${textColor[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <p className="text-2xs font-medium opacity-75">{label}</p>
      </div>
      <p className="text-display font-bold">{value}</p>
    </div>
  );
}

function ReportCard({ report, onView }: { report: ReturnType<typeof mapJournalToReport>; onView: () => void }) {
  const statusColor: Record<string, 'warning' | 'success' | 'neutral'> = {
    pending: 'warning',
    completed: 'success',
    archived: 'neutral',
  };
  const shiftEmoji: Record<string, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙',
  };
  const { toast } = useToast();
  const actionItems: DropdownItem[] = [
    { label: 'View Report', icon: <Eye className="h-4 w-4" />, onClick: onView },
    { label: 'Download', icon: <Download className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Print', icon: <Printer className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { divider: true },
    { label: 'Archive', icon: <Archive className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
  ];
  return (
    <Card className="hover:border-border-default transition-colors">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{shiftEmoji[report.shift]}</span>
              <h3 className="text-body font-semibold text-text-primary">{report.reportNumber}</h3>
            </div>
            <p className="text-caption text-text-secondary">
              {report.department}{report.team ? ` • ${report.team}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusColor[report.status]} variant="soft">{report.status}</Badge>
            <Dropdown trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>} items={actionItems} align="right" />
          </div>
        </div>
        <div className="space-y-3 py-3 border-t border-border-subtle border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="h-4 w-4" />
              <span className="text-body">{report.date}</span>
            </div>
            <span className="text-caption text-text-tertiary">{report.generatedAt}</span>
          </div>
          {report.project && (
            <div className="text-caption text-text-secondary"><strong>Project:</strong> {report.project}</div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatItem label="Entries" value={report.submittedEntries} icon={<FileText />} />
          <StatItem label="Contributors" value={report.contributors} icon={<Users />} />
          <StatItem label="Completed" value={report.completedTasks} icon={<CheckCircle2 />} tone="success" />
          <StatItem label="Pending" value={report.pendingTasks} icon={<Clock />} tone="warning" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption font-medium text-text-secondary">Overall Progress</span>
            <span className="text-section font-semibold text-text-primary">{report.overallProgress}%</span>
          </div>
          <Progress value={report.overallProgress} />
        </div>
        {report.criticalIssues > 0 && (
          <div className="rounded-lg border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900 p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-caption font-medium text-danger-700 dark:text-danger-200">
                {report.criticalIssues} Critical Issue{report.criticalIssues !== 1 ? 's' : ''}
              </p>
              <p className="text-2xs text-danger-600 dark:text-danger-300">Requires immediate attention</p>
            </div>
          </div>
        )}
        <Button fullWidth onClick={onView} variant="outline">View Full Report</Button>
      </CardBody>
    </Card>
  );
}

function StatItem({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone?: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-text-tertiary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <p className="text-2xs text-text-tertiary">{label}</p>
      </div>
      <p className="text-section font-bold text-text-primary">{value}</p>
    </div>
  );
}

function ReportView({ report, workspaceId, departmentId, projectId, onBack }: {
  report: ReturnType<typeof mapJournalToReport>;
  workspaceId: string;
  departmentId: string;
  projectId: string;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const { data: journalDetail } = useHandoverJournal(workspaceId, departmentId, projectId, report.id || undefined);

  const journal = journalDetail;

  const shiftDisplay: Record<string, string> = {
    morning: 'Morning (6 AM - 2 PM)',
    afternoon: 'Afternoon (2 PM - 10 PM)',
    evening: 'Evening (10 PM - 6 AM)',
    night: 'Night (12 AM - 8 AM)',
  };

  const actionItems: DropdownItem[] = [
    { label: 'Print', icon: <Printer className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Export PDF', icon: <Download className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { label: 'Share', icon: <Share2 className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
    { divider: true },
    { label: 'Archive', icon: <Archive className="h-4 w-4" />, onClick: () => toast({ title: 'Coming soon', tone: 'info' }) },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="print:block hidden mb-4">
        <h1 className="text-3xl font-bold mb-2">Handover Report</h1>
        <p className="text-gray-600">{report.reportNumber}</p>
      </div>

      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast({ title: 'Coming soon', tone: 'info' })}><Printer className="h-4 w-4" /> Print</Button>
          <Dropdown trigger={<IconButton label="Actions" variant="ghost"><MoreHorizontal /></IconButton>} items={actionItems} align="right" />
        </div>
      </div>

      <Card className="mb-6 print:border-0 print:shadow-none">
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <ReportInfoBox label="Department" value={report.department} />
            <ReportInfoBox label="Team" value={report.team || 'N/A'} />
            <ReportInfoBox label="Project" value={report.project || 'N/A'} />
            <ReportInfoBox label="Shift" value={shiftDisplay[report.shift] ?? report.shift} />
            <ReportInfoBox label="Date" value={report.date} />
            <ReportInfoBox label="Generated" value={report.generatedAt} />
            <ReportInfoBox label="Report #" value={report.reportNumber} />
            <ReportInfoBox label="Entries" value={report.submittedEntries.toString()} />
          </div>
        </CardBody>
      </Card>

      {journal && (
        <>
          <Card className="mb-6 print:border-0 print:shadow-none">
            <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
            <CardBody>
              <p className="text-body leading-relaxed text-text-secondary">{journal.generatedSummary}</p>
            </CardBody>
          </Card>

          <Card className="mb-6 print:border-0 print:shadow-none">
            <CardHeader><CardTitle>Completed Work</CardTitle></CardHeader>
            <CardBody>
              <p className="text-body leading-relaxed text-text-secondary whitespace-pre-wrap">{journal.mainDoneWork}</p>
            </CardBody>
          </Card>

          <Card className="mb-6 print:border-0 print:shadow-none">
            <CardHeader><CardTitle>Remaining Work</CardTitle></CardHeader>
            <CardBody>
              <p className="text-body leading-relaxed text-text-secondary whitespace-pre-wrap">{journal.mainRemainingWork}</p>
            </CardBody>
          </Card>

          {journal.blockers && (
            <Card className="mb-6 print:border-0 print:shadow-none border-danger-200 dark:border-danger-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-danger-600" />
                  Blockers
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-body leading-relaxed text-danger-700 dark:text-danger-200 whitespace-pre-wrap">{journal.blockers}</p>
              </CardBody>
            </Card>
          )}

          {journal.difficulties && (
            <Card className="mb-6 print:border-0 print:shadow-none">
              <CardHeader><CardTitle>Difficulties</CardTitle></CardHeader>
              <CardBody>
                <p className="text-body leading-relaxed text-text-secondary whitespace-pre-wrap">{journal.difficulties}</p>
              </CardBody>
            </Card>
          )}

          {journal.recommendations && (
            <Card className="mb-6 print:border-0 print:shadow-none">
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardBody>
                <p className="text-body leading-relaxed text-text-secondary whitespace-pre-wrap">{journal.recommendations}</p>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {!journal && (
        <Card className="mb-6 print:border-0 print:shadow-none">
          <CardBody>
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <FileText className="h-8 w-8 text-text-tertiary" />
              <p className="text-body text-text-secondary">Journal details not available</p>
              <p className="text-caption text-text-tertiary">Generated summary will appear here.</p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="mb-6 print:border-0 print:shadow-none">
        <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatBox label="Overall Progress" value={`${report.overallProgress}%`} />
            <StatBox label="Status" value={report.status} />
            <StatBox label="Shift" value={report.shift} />
            <StatBox label="Generated" value={report.date} />
          </div>
        </CardBody>
      </Card>

      <div className="text-center py-6 text-caption text-text-tertiary border-t border-border-subtle print:border-0">
        <p>This report was automatically generated by Collabix</p>
        <p className="mt-1">Report ID: {report.reportNumber}</p>
      </div>
    </div>
  );
}

function ReportInfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs text-text-tertiary font-medium mb-1">{label}</p>
      <p className="text-body font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 p-3">
      <p className="text-2xs text-text-tertiary mb-1">{label}</p>
      <p className="text-section font-bold text-text-primary">{value}</p>
    </div>
  );
}
