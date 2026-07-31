import { useState } from 'react';
import { AIBusinessHeader } from './AIBusinessHeader';
import { AIBusinessContextPanel } from './AIBusinessContextPanel';
import { AIBusinessResultPanel } from './AIBusinessResultPanel';
import { AIBusinessFollowUp } from './AIBusinessFollowUp';
import { AIBusinessResources } from './AIBusinessResources';
import { AIBusinessEmptyState } from './AIBusinessEmptyState';
import { AIBusinessLoading } from './AIBusinessLoading';
import { AIBusinessErrorCard } from './AIBusinessErrorCard';
import { useAIAskQuestion } from '../../../services/knowledge-ai-hooks';
import type { KnowledgeAIResponse } from '../../../services/knowledge-ai-service';
import {
  knowledgeContext,
  knowledgeFollowUps,
  knowledgeResources,
} from './AIBusinessTypes';

export function AIKnowledgePage({
  workspaceId = '',
  departmentId = '',
}: {
  workspaceId?: string;
  departmentId?: string;
}) {
  const [hasResult, setHasResult] = useState(false);
  const [resultData, setResultData] = useState<KnowledgeAIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const askMutation = useAIAskQuestion();

  async function handleSearch() {
    setError(null);
    try {
      const result = await askMutation.mutateAsync({
        workspaceId,
        departmentId,
        question: 'Summarize key knowledge documents in this workspace.',
      });
      setResultData(result);
      setHasResult(true);
    } catch (err: any) {
      setError(err?.message ?? 'Knowledge search failed');
    }
  }

  if (askMutation.isPending) return <AIBusinessLoading />;

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <AIBusinessHeader module="knowledge" title="Knowledge AI" description="Search, explain and explore your company knowledge base." />
        <AIBusinessErrorCard message={error} onRetry={() => { setError(null); handleSearch(); }} onDismiss={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <AIBusinessHeader module="knowledge" title="Knowledge AI" description="Search, explain and explore your company knowledge base." />

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-72 shrink-0">
          <AIBusinessContextPanel
            options={knowledgeContext}
            onAnalyze={handleSearch}
            analyzeLabel="Search Knowledge"
            inputPlaceholder="Ask about policies, procedures or documentation..."
          />
        </div>
        <div className="flex-1 min-w-0 space-y-5">
          {hasResult && resultData ? (
            <>
              <AIBusinessResultPanel
                summary={resultData.answer}
                insights={resultData.sources.map((s) => `${s.title} (${s.type})`)}
                recommendations={resultData.suggestedRelatedDocuments}
                keyPoints={[
                  `Confidence: ${resultData.confidence}`,
                  `Sources: ${resultData.sources.length} documents found`,
                  `Execution: ${resultData.executionTime}ms`,
                  resultData.missingInformation || 'No missing information',
                ]}
              />
              <AIBusinessFollowUp actions={knowledgeFollowUps} />
              <AIBusinessResources resources={knowledgeResources} />
            </>
          ) : (
            <AIBusinessEmptyState module="knowledge" onAction={handleSearch} />
          )}
        </div>
      </div>
    </div>
  );
}
