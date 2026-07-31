import { Sparkles, Square } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface ConversationStreamingProps {
  visible: boolean;
  onStop: () => void;
}

export function ConversationStreaming({ visible, onStop }: ConversationStreamingProps) {
  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 shadow-cx-xs">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-caption font-semibold text-text-primary">Collabix AI</p>
          <span className="text-2xs text-text-tertiary">Generating response...</span>
        </div>
        <div className="rounded-xl border border-border-subtle bg-elevated dark:bg-surface px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-0.5 rounded-full bg-accent-500 animate-pulse" />
            <span className="h-3 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-2.5 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="h-3.5 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '450ms' }} />
            <span className="h-2 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '600ms' }} />
            <span className="h-3 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '750ms' }} />
          </div>
        </div>
        <div className="mt-2">
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generation"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-caption text-text-secondary hover:bg-danger-50 hover:text-danger-600 hover:border-danger-300 dark:hover:bg-danger-500/10 dark:hover:text-danger-400 transition-colors"
          >
            <Square className="h-3 w-3 fill-current" />
            Stop generation
          </button>
        </div>
      </div>
    </div>
  );
}
