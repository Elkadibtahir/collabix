import { useMemo, useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  Sparkles,
  Search,
  MoreHorizontal,
  Eye,
  RotateCcw,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FilePlus2,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardBody } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge, type Tone } from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import {
  useAIReportHistory,
  useAIGenerateReport,
  useAIRegenerateReport,
  useAIApproveReport,
  useAIRejectReport,
} from '../../services/reporting-ai-hooks';
import type { ReportingGenerateRequest, ReportingResponse } from '../../services/reporting-ai-service';
import { useDepartmentsList } from '../../services/admin-hooks';
import { cn } from '../../lib/cn';

const PAGE_SIZE = 10;

const reportTypeLabels: Record<string, string> = {
  EXECUTIVE_SUMMARY: 'Executive Summary',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  CUSTOM: 'Custom',
};

const generationTone: Record<string, Tone> = {
  GENERATED: 'success',
  GENERATING: 'info',
  PENDING: 'warning',
  FAILED: 'danger',
};

const approvalTone: Record<string, Tone> = {
  APPROVED: 'success',
  PENDING: 'warning',
  DRAFT: 'info',
  REJECTED: 'danger',
};

const reportSections: { key: keyof ReportingResponse; label: string }[] = [
  { key: 'executiveSummary', label: 'Executive Summary' },
  { key: 'majorHighlights', label: 'Major Highlights' },
  { key: 'businessHealth', label: 'Business Health' },
  { key: 'productivityReview', label: 'Productivity Review' },
  { key: 'criticalRisks', label: 'Critical Risks' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'challenges', label: 'Challenges' },
  { key: 'recommendations', label: 'Recommendations' },
  { key: 'strategicPriorities', label: 'Strategic Priorities' },
  { key: 'nextActions', label: 'Next Actions' },
];

export function WorkspaceReportsPage({ workspaceId }: { workspaceId: string }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [regenerateReportTarget, setRegenerateReportTarget] = useState<ReportingResponse | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportingResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; report: ReportingResponse } | null>(null);

  const { data: history, isLoading, isError, error } = useAIReportHistory(workspaceId, page, PAGE_SIZE);
  const { data: departments } = useDepartmentsList();
  const generateReport = useAIGenerateReport();
  const regenerateReport = useAIRegenerateReport();
  const approveReport = useAIApproveReport();
  const rejectReport = useAIRejectReport();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reports = useMemo(() => {
    const all = history?.content ?? [];
    let result = all;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.title.toLowerCase().includes(q) || (r.generatedBy ?? '').toLowerCase().includes(q),
      );
    }
    if (typeFilter) result = result.filter((r) => r.reportType === typeFilter);
    if (statusFilter) result = result.filter((r) => r.approvalStatus === statusFilter);
    return result;
  }, [history, search, typeFilter, statusFilter]);

  const totals = useMemo(() => {
    const all = history?.content ?? [];
    return {
      total: history?.page?.totalElements ?? all.length,
      approved: all.filter((r) => r.approvalStatus === 'APPROVED').length,
      pending: all.filter((r) => r.approvalStatus === 'PENDING').length,
      draft: all.filter((r) => r.approvalStatus === 'DRAFT').length,
    };
  }, [history]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['reporting-ai', 'history', workspaceId] });

  const handleGenerate = async (data: ReportingGenerateRequest) => {
    try {
      await generateReport.mutateAsync(data);
      toast({ title: 'Report generated', tone: 'success' });
      setGenerating(false);
      invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate report';
      toast({ title: msg, tone: 'danger' });
      throw err;
    }
  };

  const handleRegenerate = async (data: ReportingGenerateRequest, reportId: string) => {
    try {
      await regenerateReport.mutateAsync({ reportId, data });
      toast({ title: 'Report regenerated', tone: 'success' });
      setGenerating(false);
      invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to regenerate report';
      toast({ title: msg, tone: 'danger' });
      throw err;
    }
  };

  const handleReview = async (type: 'approve' | 'reject') => {
    if (!confirmAction) return;
    try {
      if (type === 'approve') await approveReport.mutateAsync(confirmAction.report.reportId);
      else await rejectReport.mutateAsync(confirmAction.report.reportId);
      toast({ title: type === 'approve' ? 'Report approved' : 'Report rejected', tone: 'success' });
      setConfirmAction(null);
      invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toast({ title: msg, tone: 'danger' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-52" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-6 w-6" />}
        title="Failed to load reports"
        description={error?.message ?? 'An error occurred while fetching reports.'}
      />
    );
  }

  const reportTypes = Array.from(new Set((history?.content ?? []).map((r) => r.reportType)));
  const approvalStatuses = Array.from(new Set((history?.content ?? []).map((r) => r.approvalStatus)));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page font-semibold text-text-primary">Workspace Reports</h1>
          <p className="text-body text-text-secondary">
            Generate, review, and manage AI-powered reports for this workspace.
          </p>
        </div>
        <Button variant="primary" leftIcon={<FilePlus2 className="h-4 w-4" />} onClick={() => setGenerating(true)}>
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Reports" value={totals.total} icon={<FileText />} tone="accent" />
        <StatCard label="Approved" value={totals.approved} icon={<CheckCircle2 />} tone="success" />
        <StatCard label="Pending Approval" value={totals.pending} icon={<Clock />} tone="warning" />
        <StatCard label="Drafts" value={totals.draft} icon={<Sparkles />} tone="info" />
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search reports by title or author..."
            leftIcon={<Search />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            className="w-44"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            options={[
              { value: '', label: 'All Types' },
              ...reportTypes.map((t) => ({ value: t, label: reportTypeLabels[t] ?? t })),
            ]}
          />
          <Select
            className="w-44"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: '', label: 'All Statuses' },
              ...approvalStatuses.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title={search || typeFilter || statusFilter ? 'No reports match your filters' : 'No reports yet'}
              description={
                search || typeFilter || statusFilter
                  ? 'Try adjusting your search or filters.'
                  : 'Generate your first AI report to get started.'
              }
              action={
                !(search || typeFilter || statusFilter) ? (
                  <Button variant="primary" size="sm" leftIcon={<Sparkles className="h-4 w-4" />} onClick={() => setGenerating(true)}>
                    Generate Report
                  </Button>
                ) : undefined
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Workspace reports table">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Report</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Type</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Generated</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Version</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-left text-caption font-semibold text-text-secondary">Approval</th>
                    <th className="px-4 py-3 text-right text-caption font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <ReportRow
                      key={report.reportId}
                      report={report}
                      onPreview={() => setPreviewReport(report)}
                      onRegenerate={() => { setRegenerateReportTarget(report); setGenerating(true); }}
                      onApprove={() => setConfirmAction({ type: 'approve', report })}
                      onReject={() => setConfirmAction({ type: 'reject', report })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {history && history.page && history.page.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                <p className="text-caption text-text-tertiary">
                  Page {history.page.page + 1} of {history.page.totalPages}
                </p>
                <Pagination
                  page={history.page.page + 1}
                  totalPages={history.page.totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <GenerateReportModal
        open={generating}
        workspaceId={workspaceId}
        departments={departments ?? []}
        report={regenerateReportTarget}
        onClose={() => { setGenerating(false); setRegenerateReportTarget(null); }}
        onGenerate={async (data) => {
          if (regenerateReportTarget) await handleRegenerate(data, regenerateReportTarget.reportId);
          else await handleGenerate(data);
          setRegenerateReportTarget(null);
        }}
        isRegenerating={!!regenerateReportTarget}
      />

      <PreviewReportModal report={previewReport} onClose={() => setPreviewReport(null)} />

      {confirmAction && (
        <Modal
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={confirmAction.type === 'approve' ? 'Approve Report' : 'Reject Report'}
          size="sm"
        >
          <p className="text-body text-text-secondary">
            {confirmAction.type === 'approve'
              ? `Approve "${confirmAction.report.title}"? This will mark the report as final.`
              : `Reject "${confirmAction.report.title}"? The report will be marked as rejected.`}
          </p>
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border-subtle">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction.type === 'approve' ? 'primary' : 'danger'}
              leftIcon={confirmAction.type === 'approve' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              onClick={() => handleReview(confirmAction.type)}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  const bg: Record<string, string> = {
    accent: 'bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200',
    success: 'bg-success-50 dark:bg-success-100 text-success-700 dark:text-success-200',
    warning: 'bg-warning-50 dark:bg-warning-100 text-warning-700 dark:text-warning-200',
    info: 'bg-info-50 dark:bg-info-100 text-info-700 dark:text-info-200',
  };
  return (
    <div className={cn('rounded-lg border border-border-subtle p-3', bg[tone])}>
      <div className="flex items-center justify-between">
        <p className="text-2xs font-medium opacity-75">{label}</p>
        <span className="[&>svg]:h-4 [&>svg]:w-4 opacity-75">{icon}</span>
      </div>
      <p className="text-section font-semibold mt-1">{value}</p>
    </div>
  );
}

function ReportRow({
  report,
  onPreview,
  onRegenerate,
  onApprove,
  onReject,
}: {
  report: ReportingResponse;
  onPreview: () => void;
  onRegenerate: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const actions: DropdownItem[] = [
    { label: 'Preview Report', icon: <Eye className="h-4 w-4" />, onClick: onPreview },
    { label: 'Regenerate', icon: <RotateCcw className="h-4 w-4" />, onClick: onRegenerate },
    { divider: true },
    { label: 'Approve', icon: <CheckCircle2 className="h-4 w-4" />, onClick: onApprove },
    { label: 'Reject', icon: <XCircle className="h-4 w-4" />, danger: true, onClick: onReject },
  ];

  return (
    <tr className="border-b border-border-subtle hover:bg-surface-2 transition-colors">
      <td className="px-4 py-3">
        <button type="button" onClick={onPreview} className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-100 text-accent-700 dark:text-accent-200">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <p className="text-body font-medium text-text-primary">{report.title}</p>
            <p className="text-caption text-text-tertiary">by {report.generatedBy ?? '—'}</p>
          </div>
        </button>
      </td>
      <td className="px-4 py-3">
        <Badge tone="info" variant="soft">{reportTypeLabels[report.reportType] ?? report.reportType}</Badge>
      </td>
      <td className="px-4 py-3">
        <p className="text-body text-text-secondary">{new Date(report.generationDate ?? report.createdAt).toLocaleDateString()}</p>
      </td>
      <td className="px-4 py-3">
        <Badge tone="neutral" variant="outline">v{report.reportVersion}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge tone={generationTone[report.generationStatus] ?? 'info'} variant="soft">{report.generationStatus}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge tone={approvalTone[report.approvalStatus] ?? 'info'} variant="soft">{report.approvalStatus}</Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <Dropdown
          trigger={<IconButton label="Report actions" variant="ghost"><MoreHorizontal className="h-4 w-4" /></IconButton>}
          items={actions}
          align="right"
        />
      </td>
    </tr>
  );
}

function GenerateReportModal({
  open,
  workspaceId,
  departments,
  report,
  onClose,
  onGenerate,
  isRegenerating,
}: {
  open: boolean;
  workspaceId: string;
  departments: { id: string; name: string }[];
  report: ReportingResponse | null;
  onClose: () => void;
  onGenerate: (data: ReportingGenerateRequest) => Promise<void>;
  isRegenerating: boolean;
}) {
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState<string>('EXECUTIVE_SUMMARY');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = !!report && isRegenerating;
  const modalTitle = isEdit ? 'Regenerate Report' : 'Generate Report';

  useEffect(() => {
    if (report && isRegenerating) {
      setTitle(report.title);
      setReportType(report.reportType);
      setDepartmentId(report.departmentId);
      setPeriodStart(report.periodStart ?? '');
      setPeriodEnd(report.periodEnd ?? '');
    } else if (!open) {
      reset();
    }
  }, [report, isRegenerating, open]);

  const handleSubmit = async () => {
    if (!title.trim() || !departmentId) return;
    setSaving(true);
    try {
      await onGenerate({
        workspaceId,
        departmentId,
        title: title.trim(),
        reportType: reportType as ReportingGenerateRequest['reportType'],
        ...(periodStart ? { periodStart } : {}),
        ...(periodEnd ? { periodEnd } : {}),
      });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setTitle('');
    setReportType('EXECUTIVE_SUMMARY');
    setDepartmentId('');
    setPeriodStart('');
    setPeriodEnd('');
  };

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} size="md">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Input
            label="Report Title"
            placeholder="e.g. Q3 Performance Summary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'EXECUTIVE_SUMMARY', label: 'Executive Summary' },
              { value: 'WEEKLY', label: 'Weekly' },
              { value: 'MONTHLY', label: 'Monthly' },
              { value: 'QUARTERLY', label: 'Quarterly' },
              { value: 'CUSTOM', label: 'Custom' },
            ]}
          />
          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={[
              { value: '', label: departments?.length ? 'Select a department' : 'No departments available' },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
          {departments.length === 0 && (
            <p className="text-caption text-warning-700 dark:text-warning-300 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> Create a department before generating reports.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Period Start"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
            <Input
              label="Period End"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
          <p className="text-caption text-text-tertiary flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Period dates are optional.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
            disabled={!title.trim() || !departmentId}
            leftIcon={isEdit ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          >
            {isEdit ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PreviewReportModal({ report, onClose }: { report: ReportingResponse | null; onClose: () => void }) {
  return (
    <Modal open={!!report} onClose={onClose} title={report?.title ?? 'Report Preview'} size="lg">
      {report && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info" variant="soft">{reportTypeLabels[report.reportType] ?? report.reportType}</Badge>
            <Badge tone={generationTone[report.generationStatus] ?? 'info'} variant="soft">{report.generationStatus}</Badge>
            <Badge tone={approvalTone[report.approvalStatus] ?? 'info'} variant="soft">{report.approvalStatus}</Badge>
            <Badge tone="neutral" variant="outline">v{report.reportVersion}</Badge>
          </div>
          <p className="text-caption text-text-tertiary">
            Generated by {report.generatedBy ?? '—'} on {new Date(report.generationDate ?? report.createdAt).toLocaleString()} ({report.executionTime}ms)
          </p>
          {reportSections.map(({ key, label }) => {
            const value = report[key];
            if (!value || String(value).trim() === '') return null;
            return (
              <div key={key} className="rounded-lg border border-border-subtle p-4">
                <p className="text-caption font-semibold text-accent-700 dark:text-accent-300 mb-1.5">{label}</p>
                <p className="text-body text-text-secondary whitespace-pre-wrap">{String(value)}</p>
              </div>
            );
          })}
          {report.finalReport && (
            <div className="rounded-lg border border-border-subtle p-4">
              <p className="text-caption font-semibold text-accent-700 dark:text-accent-300 mb-1.5">Final Report</p>
              <p className="text-body text-text-secondary whitespace-pre-wrap">{report.finalReport}</p>
            </div>
          )}
          <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default WorkspaceReportsPage;
