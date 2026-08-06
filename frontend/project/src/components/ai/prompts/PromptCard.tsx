import { Heart, Play, Eye } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Badge } from '../../ui/Badge';
import { promptCategories, type Prompt } from './PromptTypes';

interface PromptCardProps {
  prompt: Prompt;
  isFavorite: boolean;
  onPreview: (prompt: Prompt) => void;
  onRun: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
}

export function PromptCard({ prompt, isFavorite, onPreview, onRun, onToggleFavorite }: PromptCardProps) {
  const category = promptCategories.find((c) => c.id === prompt.category);

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl border border-border-subtle bg-elevated dark:bg-surface p-6',
        'hover:shadow-cx-md hover:-translate-y-0.5 transition-all duration-150',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <Badge variant="soft" tone="accent" className="text-2xs">
          {category?.label || prompt.category}
        </Badge>
        <button
          type="button"
          onClick={() => onToggleFavorite(prompt.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-danger-500 transition-colors"
        >
          <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-danger-500 text-danger-500')} />
        </button>
      </div>

      <h3 className="text-body font-semibold text-text-primary leading-snug mb-1.5">{prompt.title}</h3>
      <p className="text-caption text-text-tertiary leading-relaxed line-clamp-2 mb-4 flex-1">{prompt.description}</p>

      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-surface-2 px-2 py-0.5 text-2xs text-text-tertiary">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-2xs text-text-tertiary">{prompt.executionTime}</span>
          {prompt.lastUsed && (
            <>
              <span className="text-2xs text-text-tertiary">·</span>
              <span className="text-2xs text-text-tertiary">{prompt.lastUsed}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onPreview(prompt)}
            aria-label={`Preview ${prompt.title}`}
            className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-2xs font-medium text-text-secondary hover:bg-surface-2 transition-colors"
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => onRun(prompt)}
            aria-label={`Run ${prompt.title}`}
            className="flex items-center gap-1 rounded-lg bg-accent-600 px-2.5 py-1.5 text-2xs font-medium text-white hover:bg-accent-700 transition-colors"
          >
            <Play className="h-3 w-3" />
            Run
          </button>
        </div>
      </div>
    </article>
  );
}
