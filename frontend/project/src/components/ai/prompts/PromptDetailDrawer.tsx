import { useEffect, useRef } from 'react';
import { X, Heart, Play, Clock, Tags, Target, CheckCircle2, FileText, Lightbulb } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { promptCategories, type Prompt } from './PromptTypes';

interface PromptDetailDrawerProps {
  prompt: Prompt;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onRun: () => void;
}

export function PromptDetailDrawer({ prompt, isFavorite, onClose, onToggleFavorite, onRun }: PromptDetailDrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const category = promptCategories.find((c) => c.id === prompt.category);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-text-primary/30 dark:bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`${prompt.title} details`}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[520px] bg-elevated dark:bg-surface border-l border-border-subtle shadow-cx-xl animate-slide-right overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-elevated dark:bg-surface">
          <div className="flex items-center gap-2">
            <Badge variant="soft" tone="accent">{category?.label || prompt.category}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-danger-500 transition-colors"
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-danger-500 text-danger-500')} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-page font-semibold text-text-primary">{prompt.title}</h2>
            <p className="mt-1.5 text-body text-text-secondary leading-relaxed">{prompt.description}</p>
          </div>

          <div className="flex items-center gap-3 text-caption text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {prompt.executionTime}
            </span>
            {prompt.lastUsed && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Last used {prompt.lastUsed}
              </span>
            )}
            {prompt.tags.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Tags className="h-3.5 w-3.5" />
                {prompt.tags.length} tags
              </span>
            )}
          </div>

          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="soft" tone="neutral">{tag}</Badge>
              ))}
            </div>
          )}

          <DetailSection icon={<Target className="h-4 w-4" />} title="Business Objective">
            <p className="text-body text-text-secondary">{prompt.businessObjective}</p>
          </DetailSection>

          <DetailSection icon={<Lightbulb className="h-4 w-4" />} title="Typical Use Cases">
            <ul className="space-y-2">
              {prompt.useCases.map((uc) => (
                <li key={uc} className="flex items-start gap-2 text-body text-text-secondary">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                  {uc}
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection icon={<FileText className="h-4 w-4" />} title="Required Context">
            <ul className="space-y-1.5">
              {prompt.requiredContext.map((ctx) => (
                <li key={ctx} className="flex items-start gap-2 text-body text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                  {ctx}
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection icon={<FileText className="h-4 w-4" />} title="Expected Output">
            <div className="rounded-xl border border-border-subtle bg-surface-2 p-4">
              <p className="text-caption text-text-secondary leading-relaxed">{prompt.expectedOutput}</p>
            </div>
          </DetailSection>

          <div className="rounded-xl border border-border-subtle bg-surface-2 p-4">
            <p className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">Example Result</p>
            <div className="rounded-lg border border-border-subtle bg-elevated p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-success-500" />
                <span className="text-2xs font-medium text-text-primary">Sample output will appear here</span>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-3/4 rounded bg-surface-2" />
                <div className="h-2.5 w-1/2 rounded bg-surface-2" />
                <div className="h-2.5 w-5/6 rounded bg-surface-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border-subtle bg-elevated dark:bg-surface px-6 py-4">
          <Button fullWidth size="lg" leftIcon={<Play />} onClick={onRun}>
            Run Prompt
          </Button>
        </div>
      </div>
    </>
  );
}

function DetailSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-accent-600 dark:text-accent-400">{icon}</span>
        <h3 className="text-caption font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}
