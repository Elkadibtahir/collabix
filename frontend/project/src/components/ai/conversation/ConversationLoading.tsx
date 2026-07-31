import { Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { type LoadingState, LoadingMessages } from './ConversationTypes';

function Block({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-shimmer rounded-md bg-gradient-to-r from-surface-2 via-border-subtle to-surface-2 bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

export function ConversationLoadingThinking({ state }: { state: LoadingState }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4 animate-fade-in">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 dark:bg-accent-100/15">
        <Sparkles className="h-4 w-4 text-accent-600 dark:text-accent-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-caption font-semibold text-text-primary">Collabix AI</p>
          <span className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            {LoadingMessages[state]}
          </span>
        </div>
        <div className="space-y-2.5">
          <Block className="h-4 w-3/4" />
          <Block className="h-4 w-1/2" />
          <Block className="h-4 w-5/6" />
          <Block className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function ConversationLoadingStreaming() {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 shadow-cx-xs">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-caption font-semibold text-text-primary">Collabix AI</p>
          <span className="text-2xs text-text-tertiary">Streaming...</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-0.5 rounded-full bg-accent-500 animate-pulse" />
          <span className="h-2.5 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '200ms' }} />
          <span className="h-2.5 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '400ms' }} />
          <span className="h-2.5 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '600ms' }} />
          <span className="h-2.5 w-0.5 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '800ms' }} />
        </div>
      </div>
    </div>
  );
}

export function ConversationPageLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
        <div className="space-y-1.5">
          <Block className="h-5 w-48" />
          <Block className="h-3 w-24" />
        </div>
        <div className="flex gap-1">
          <Block className="h-8 w-8 rounded-lg" />
          <Block className="h-8 w-8 rounded-lg" />
          <Block className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="h-8 w-8 text-accent-500 animate-pulse" />
          <p className="text-body text-text-tertiary">Loading conversation...</p>
        </div>
      </div>
    </div>
  );
}
