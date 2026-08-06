import { useState } from 'react';
import { AIBusinessHeader } from './AIBusinessHeader';
import { AIBusinessContextPanel } from './AIBusinessContextPanel';
import { AIBusinessResultPanel } from './AIBusinessResultPanel';
import { AIBusinessFollowUp } from './AIBusinessFollowUp';
import { AIBusinessResources } from './AIBusinessResources';
import { AIBusinessEmptyState } from './AIBusinessEmptyState';
import { AIBusinessLoading } from './AIBusinessLoading';
import { AIBusinessErrorCard } from './AIBusinessErrorCard';
import { useAIGenerateHandover } from '../../../services/handover-hooks';
import type { HandoverAIResponse } from '../../../services/handover-service';

import {
  handoverContext,
  handoverFollowUps,
  handoverResources,
} from './AIBusinessTypes';

export function AIHandoverPage({
  workspaceId = '',
  departmentId = '',
  projectId = '',
}: {
  workspaceId?: string;
  departmentId?: string;
  projectId?: string;
}) {
  const [hasResult, setHasResult] = useState(false);
  const [resultData, setResultData] = useState<HandoverAIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMutation = useAIGenerateHandover(workspaceId, departmentId, projectId);

  async function handleAnalyze() {
    setError(null);
    try {
      const result = await generateMutation.mutateAsync({
        workspaceId,
        departmentId,
        projectId,
      });
      setResultData(result);
      setHasResult(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI generation failed');
    }
  }

  if (generateMutation.isPending) return <AIBusinessLoading />;

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <AIBusinessHeader module="handover" title="Handover AI" description="Review handover journals, detect risks and ensure work continuity." />
        <AIBusinessErrorCard message={error} onRetry={() => { setError(null); handleAnalyze(); }} onDismiss={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <AIBusinessHeader module="handover" title="Handover AI" description="Review handover journals, detect risks and ensure work continuity." />

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-72 shrink-0">
          <AIBusinessContextPanel
            options={handoverContext}
            onAnalyze={handleAnalyze}
            analyzeLabel="Review Handover"
            inputPlaceholder="Ask about handover details, risks or gaps..."
          />
        </div>
        <div className="flex-1 min-w-0 space-y-5">
          {hasResult && resultData ? (
            <>
              <AIBusinessResultPanel
                summary={resultData.executiveSummary}
                insights={[
                  resultData.completedWork ? `Completed: ${resultData.completedWork}` : 'No completed work recorded.',
                  resultData.pendingWork ? `Pending: ${resultData.pendingWork}` : 'No pending work recorded.',
                  resultData.criticalRisks ? `Risks: ${resultData.criticalRisks}` : 'No critical risks identified.',
                ]}
                recommendations={[resultData.recommendations]}
                keyPoints={[
                  `Priority Actions: ${resultData.priorityActions || 'None specified'}`,
                  `Work Continuity: ${resultData.workContinuity || 'Not specified'}`,
                  `Blocked Tasks: ${resultData.blockedTasks || 'None'}`,
                ]}
              />
              <AIBusinessFollowUp actions={handoverFollowUps} />
              <AIBusinessResources resources={handoverResources} />
            </>
          ) : (
            <AIBusinessEmptyState module="handover" onAction={handleAnalyze} />
          )}
        </div>
      </div>
    </div>
  );
}
