import { useState } from 'react';
import { Search, FileText, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardBody } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useAIReportHistory } from '../../../services/reporting-ai-hooks';
import { formatDate } from '../../knowledge/types/document-types';

export function DeptReports({ wsId, deptId }: { wsId?: string; deptId?: string }) {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useAIReportHistory(wsId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-16 flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-danger-500" />
          <p className="text-body font-medium text-text-secondary">Failed to load reports</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </CardBody>
      </Card>
    );
  }

  const reports = (data?.content ?? []).filter((r) => !deptId || r.departmentId === deptId);

  const filtered = reports.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.title.toLowerCase().includes(q) || (r.generatedBy ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search reports..."
          leftIcon={<Search />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="max-w-sm"
        />
        <Badge tone="neutral" variant="soft">{filtered.length} reports</Badge>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BarChart3 />}
          title={search ? 'No reports match your search' : 'No reports yet'}
          description="Generated reports will appear here."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.reportId} className="flex items-center gap-4 p-4 rounded-lg border border-border-subtle bg-surface hover:bg-surface-2 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-tertiary">
                <FileText className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary">{r.title}</p>
                <p className="text-2xs text-text-tertiary">
                  {r.generatedBy ?? '—'} • {r.generationDate ? formatDate(r.generationDate) : '—'}
                </p>
              </div>
              <Badge tone="neutral" variant="soft">{r.reportType}</Badge>
              <Badge
                tone={r.generationStatus === 'COMPLETED' ? 'success' : r.generationStatus === 'FAILED' ? 'danger' : 'warning'}
                variant="soft"
              >
                {r.generationStatus}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
