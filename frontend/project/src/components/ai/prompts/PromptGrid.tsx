import { type Prompt } from './PromptTypes';
import { PromptCard } from './PromptCard';

interface PromptGridProps {
  prompts: Prompt[];
  onPreview: (prompt: Prompt) => void;
  onRun: (prompt: Prompt) => void;
  onToggleFavorite: (id: string) => void;
  favorites: Set<string>;
}

export function PromptGrid({ prompts, onPreview, onRun, onToggleFavorite, favorites }: PromptGridProps) {
  if (prompts.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          isFavorite={favorites.has(prompt.id)}
          onPreview={onPreview}
          onRun={onRun}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
