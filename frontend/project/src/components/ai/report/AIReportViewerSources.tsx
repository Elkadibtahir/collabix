import { FileText, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { type Source } from './AIReportViewerTypes';

interface AIReportViewerSourcesProps {
  sources: Source[];
}

export function AIReportViewerSources({ sources }: AIReportViewerSourcesProps) {
  const navigate = useNavigate();

  if (sources.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-caption font-semibold text-text-primary">Sources & References</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((src) => (
          <button
            key={src.id}
            type="button"
            onClick={() => navigate(src.path)}
            className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3 text-left hover:shadow-cx-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-100/10 dark:text-accent-300">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-caption font-medium text-text-primary truncate">{src.title}</p>
              <Badge variant="soft" tone="neutral" className="text-2xs mt-0.5">{src.type}</Badge>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
