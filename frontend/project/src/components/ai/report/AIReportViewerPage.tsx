import { useState } from 'react';
import { AlertCircle, FileText } from 'lucide-react';
import { AIReportViewerHeader } from './AIReportViewerHeader';
import { AIReportViewerSummary } from './AIReportViewerSummary';
import { AIReportViewerInsights } from './AIReportViewerInsights';
import { AIReportViewerRecommendations } from './AIReportViewerRecommendations';
import { AIReportViewerCharts } from './AIReportViewerCharts';
import { AIReportViewerSources } from './AIReportViewerSources';
import { AIReportViewerActions } from './AIReportViewerActions';
import { AIReportViewerRelated } from './AIReportViewerRelated';
import type { ReportViewerData } from './AIReportViewerTypes';
import { AIEmptyState } from '../AIEmptyState';
import { AILoadingHero } from '../AILoadingCard';

interface ReportViewerState {
  status: 'loading' | 'error' | 'empty' | 'ready';
  data: ReportViewerData | null;
}

export function AIReportViewerPage() {
  const [favorite, setFavorite] = useState(true);
  const [{ status, data }, setState] = useState<ReportViewerState>({ status: 'empty', data: null });

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-6 animate-fade-in max-w-[1440px] mx-auto">
        <AILoadingHero />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-border-subtle bg-elevated p-5">
              <div aria-hidden="true" className="h-10 w-10 rounded-lg bg-surface-2 animate-shimmer mb-4" />
              <div aria-hidden="true" className="h-4 w-3/5 bg-surface-2 animate-shimmer rounded mb-2" />
              <div aria-hidden="true" className="h-3 w-4/5 bg-surface-2 animate-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in max-w-[1440px] mx-auto">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500 dark:bg-danger-500/10">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-section font-semibold text-text-primary">Failed to load report</h3>
        <p className="mt-1 max-w-sm text-body text-text-tertiary text-center">
          Something went wrong while loading this report. Please try again.
        </p>
        <button
          type="button"
          onClick={() => setState({ status: 'loading', data: null })}
          className="mt-5 rounded-lg bg-accent-600 px-4 py-2 text-body font-medium text-white hover:bg-accent-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === 'empty' || !data) {
    return (
      <AIEmptyState
        icon={<FileText className="h-6 w-6" />}
        title="No report found"
        description="The report you're looking for does not exist or has been removed."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-[1440px] mx-auto">
      <AIReportViewerHeader
        title={data.title}
        generatedDate={data.generatedDate}
        workspace={data.workspace}
        department={data.department}
        category={data.category}
        status={data.status}
        favorite={favorite}
        onToggleFavorite={() => setFavorite(!favorite)}
      />

      <AIReportViewerSummary summary={data.summary} />

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-section font-semibold text-text-primary mb-4">Key Insights</h2>
          <AIReportViewerInsights insights={data.insights} />
        </div>

        <div>
          <h2 className="text-section font-semibold text-text-primary mb-4">Recommendations</h2>
          <AIReportViewerRecommendations recommendations={data.recommendations} />
        </div>

        <AIReportViewerCharts />

        <AIReportViewerSources sources={data.sources} />

        <AIReportViewerRelated reports={data.relatedReports} />
      </div>

      <AIReportViewerActions favorite={favorite} onToggleFavorite={() => setFavorite(!favorite)} />
    </div>
  );
}
