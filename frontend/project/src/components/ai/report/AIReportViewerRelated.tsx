import { FileText, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Badge } from '../../ui/Badge';
import { type RelatedReport } from './AIReportViewerTypes';

interface AIReportViewerRelatedProps {
  reports: RelatedReport[];
}

export function AIReportViewerRelated({ reports }: AIReportViewerRelatedProps) {
  if (reports.length === 0) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-caption font-semibold text-text-primary">Related Reports</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {reports.map((r) => (
          <button
            key={r.id}
            type="button"
            className="group shrink-0 w-64 rounded-xl border border-border-subtle bg-surface p-4 text-left hover:shadow-cx-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300 mb-3">
              <FileText className="h-4 w-4" />
            </span>
            <p className="text-caption font-medium text-text-primary truncate">{r.title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="soft" tone="accent" className="text-2xs">{r.category}</Badge>
              <span className="text-2xs text-text-tertiary">{r.date}</span>
            </div>
            <div className="flex items-center gap-1 mt-3 text-2xs font-medium text-accent-600 dark:text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Open report <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
