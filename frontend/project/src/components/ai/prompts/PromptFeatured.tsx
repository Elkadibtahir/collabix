import { Sparkles, Play, Eye, Heart } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Badge } from '../../ui/Badge';
import { promptCategories, type Prompt } from './PromptTypes';

interface PromptFeaturedProps {
  prompts: Prompt[];
  onPreview: (prompt: Prompt) => void;
  onRun: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
  favorites: Set<string>;
}

export function PromptFeatured({ prompts, onPreview, onRun, onToggleFavorite, favorites }: PromptFeaturedProps) {
  if (prompts.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent-600" />
        <h2 className="text-section font-semibold text-text-primary">Featured AI Workflows</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {prompts.map((prompt) => {
          const category = promptCategories.find((c) => c.id === prompt.category);
          const isFav = favorites.has(prompt.id);
          return (
            <article
              key={prompt.id}
              className={cn(
                'relative flex flex-col rounded-2xl border border-border-subtle bg-elevated dark:bg-surface p-6',
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
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-danger-500 transition-colors"
                >
                  <Heart className={cn('h-3.5 w-3.5', isFav && 'fill-danger-500 text-danger-500')} />
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
                <span className="text-2xs text-text-tertiary">{prompt.executionTime}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPreview(prompt)}
                    className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-2xs font-medium text-text-secondary hover:bg-surface-2 transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => onRun(prompt)}
                    className="flex items-center gap-1 rounded-lg bg-accent-600 px-2.5 py-1.5 text-2xs font-medium text-white hover:bg-accent-700 transition-colors"
                  >
                    <Play className="h-3 w-3" />
                    Run
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
