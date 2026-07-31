import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { IconButton } from '../../ui/IconButton';

interface ConversationComposerProps {
  onSend: (message: string) => void;
  onStopGeneration?: () => void;
  streaming?: boolean;
  placeholder?: string;
  suggestedPrompts?: string[];
  onPromptSelect?: (prompt: string) => void;
}

export function ConversationComposer({
  onSend,
  onStopGeneration,
  streaming,
  placeholder = 'Ask Collabix AI...',
  suggestedPrompts,
  onPromptSelect,
}: ConversationComposerProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || streaming) return;
    onSend(trimmed);
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handlePromptClick(prompt: string) {
    setValue(prompt);
    if (onPromptSelect) onPromptSelect(prompt);
    textareaRef.current?.focus();
  }

  return (
    <div className="border-t border-border-subtle bg-elevated dark:bg-surface rounded-b-xl">
      {suggestedPrompts && suggestedPrompts.length > 0 && !value && !focused && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-1">
          {suggestedPrompts.slice(0, 4).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1 text-2xs text-text-tertiary hover:border-accent-300 hover:text-accent-600 dark:hover:text-accent-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          'flex items-end gap-2 px-4 py-3 transition-all',
          focused && 'bg-surface dark:bg-surface-2',
        )}
      >
        <IconButton
          size="sm"
          label="Attach context"
          variant="ghost"
          className="shrink-0 text-text-tertiary hover:text-text-primary"
        >
          <Paperclip className="h-4 w-4" />
        </IconButton>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            aria-label="Message input"
            rows={1}
            className={cn(
              'w-full resize-none rounded-xl border bg-surface px-4 py-2.5 pr-10 text-body text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent',
              'transition-colors',
              streaming && 'opacity-60',
            )}
            style={{ maxHeight: '200px' }}
          />
          {value && !streaming && (
            <button
              type="button"
              onClick={() => setValue('')}
              aria-label="Clear input"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {streaming ? (
          <button
            type="button"
            onClick={onStopGeneration}
            aria-label="Stop generating"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-500 text-white hover:bg-danger-700 transition-colors"
          >
            <span className="h-4 w-4 rounded-sm bg-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            aria-label="Send message"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all',
              value.trim()
                ? 'bg-accent-600 text-white hover:bg-accent-700 shadow-cx-xs active:scale-[0.96]'
                : 'bg-surface-2 text-text-tertiary cursor-not-allowed',
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="px-4 pb-2 text-2xs text-text-tertiary text-center">
        Collabix AI uses advanced enterprise AI technology. Responses are generated based on your workspace data.
      </p>
    </div>
  );
}
