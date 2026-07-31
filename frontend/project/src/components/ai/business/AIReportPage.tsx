import { useState } from 'react';
import { AIBusinessHeader } from './AIBusinessHeader';
import { AIBusinessContextPanel } from './AIBusinessContextPanel';
import { AIBusinessResultPanel } from './AIBusinessResultPanel';
import { AIBusinessFollowUp } from './AIBusinessFollowUp';
import { AIBusinessResources } from './AIBusinessResources';
import { AIBusinessEmptyState } from './AIBusinessEmptyState';
import { AIBusinessLoading } from './AIBusinessLoading';
import { AIBusinessErrorCard } from './AIBusinessErrorCard';
import { useAIGenerateReport } from '../../../services/reporting-ai-hooks';
import type { ReportingResponse } from '../../../services/reporting-ai-service';
import {
  reportContext,
  reportFollowUps,
  reportResources,
} from './AIBusinessTypes';

export function AIReportPage({
  workspaceId = '',
  departmentId = '',
}: {
  workspaceId?: string;
  departmentId?: string;
}) {
  const [hasResult, setHasResult] = useState(false);
  const [resultData, setResultData] = useState<ReportingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMutation = useAIGenerateReport();

  async function handleGenerate() {
    setError(null);
    try {
      const result = await generateMutation.mutateAsync({
        workspaceId,
        departmentId,
        title: 'Executive Report',
        reportType: 'EXECUTIVE_SUMMARY',
      });
      setResultData(result);
      setHasResult(true);
    } catch (err: any) {
      setError(err?.message ?? 'Report generation failed');
    }
  }

  if (generateMutation.isPending) return <AIBusinessLoading />;

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <AIBusinessHeader module="reports" title="Report AI" description="Generate professional executive reports and management summaries." />
        <AIBusinessErrorCard message={error} onRetry={() => { setError(null); handleGenerate(); }} onDismiss={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <AIBusinessHeader module="reports" title="Report AI" description="Generate professional executive reports and management summaries." />

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-72 shrink-0">
          <AIBusinessContextPanel
            options={reportContext}
            onAnalyze={handleGenerate}
            analyzeLabel="Generate Report"
            inputPlaceholder="Describe the report you need..."
          />
        </div>
        <div className="flex-1 min-w-0 space-y-5">
          {hasResult && resultData ? (
            <>
              <AIBusinessResultPanel
                summary={resultData.executiveSummary}
                insights={[
                  resultData.majorHighlights || 'No highlights available.',
                  resultData.businessHealth || 'No health data available.',
                  resultData.productivityReview || 'No productivity review available.',
                ]}
                recommendations={[resultData.recommendations || 'No recommendations available.']}
                keyPoints={[
                  `Report: ${resultData.title}`,
                  `Version: ${resultData.reportVersion}`,
                  `Status: ${resultData.approvalStatus}`,
                  `Execution: ${resultData.executionTime}ms`,
                ]}
              />
              <AIBusinessFollowUp actions={reportFollowUps} />
              <AIBusinessResources resources={reportResources} />
            </>
          ) : (
            <AIBusinessEmptyState module="reports" onAction={handleGenerate} />
          )}
        </div>
      </div>
    </div>
  );
}
