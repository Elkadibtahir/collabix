import { useSearchParams, useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Loader2, AlertCircle, Sparkles, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardBody, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useAIReportHistory } from '../services/reporting-ai-hooks';

const statusIcon: Record<string, React.ReactNode> = {
  GENERATED: <CheckCircle2 className="h-4 w-4 text-success-500" />,
  PENDING: <Clock className="h-4 w-4 text-warning-500" />,
  FAILED: <XCircle className="h-4 w-4 text-danger-500" />,
};

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  GENERATED: 'success',
  PENDING: 'warning',
  FAILED: 'danger',
};

export function ReportsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspaceId = searchParams.get('ws') ?? '';
  const { data, isLoading, isError } = useAIReportHistory(workspaceId || undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
      </div>
    );
  }

  const reports = data?.content ?? [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-page font-semibold text-text-primary">Reports</h1>
          <p className="mt-1 text-body text-text-secondary">AI-generated executive reports and summaries.</p>
        </div>
        <Button leftIcon={<Sparkles />} onClick={() => navigate('/app/ai/reports')}>Generate Report</Button>
      </div>

      {isError ? (
        <EmptyState icon={<AlertCircle />} title="Unable to load reports" description="There was an error loading your reports. Please try again." />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<BarChart3 />}
          title="No reports yet"
          description="Generate your first AI-powered executive report to get started."
          action={<Button leftIcon={<Sparkles />} onClick={() => navigate('/app/ai/reports')}>Generate Report</Button>}
        />
      ) : (
        <>
          <SectionHeader title="Report History" description={`${data?.page?.totalElements ?? 0} total reports`} />
          <div className="grid gap-4">
            {reports.map((r) => (
              <Card key={r.reportId} className="hover:shadow-cx-md transition-shadow cursor-pointer" onClick={() => navigate(`/app/ai/report/${r.reportId}`)}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100 dark:text-accent-300 shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                        <FileText />
                      </span>
                      <div className="min-w-0">
                        <p className="text-body font-semibold text-text-primary truncate">{r.title}</p>
                        <p className="text-2xs text-text-tertiary mt-0.5">
                          {r.reportType?.replace(/_/g, ' ')} &middot; {r.generationDate ? new Date(r.generationDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                    <Badge tone={statusTone[r.generationStatus] ?? 'neutral'} variant="soft" dot>
                      {r.generationStatus ?? 'UNKNOWN'}
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}