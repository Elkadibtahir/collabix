import { Search, Heart, FolderKanban, BookMarked } from 'lucide-react';
import { AIEmptyState } from '../AIEmptyState';
import { promptCategories, type PromptCategoryId } from './PromptTypes';

interface PromptEmptyStateProps {
  variant: 'favorites' | 'recent' | 'no-results' | 'no-category';
  searchQuery?: string;
  category?: PromptCategoryId;
  onClearSearch?: () => void;
}

export function PromptEmptyState({ variant, searchQuery, category, onClearSearch }: PromptEmptyStateProps) {
  if (variant === 'no-results') {
    return (
      <AIEmptyState
        icon={<Search />}
        title="No prompts found"
        description={searchQuery ? `No prompts matching "${searchQuery}". Try a different search term or browse categories.` : 'Try adjusting your search or filters.'}
        actionLabel="Clear Search"
        onAction={onClearSearch}
      />
    );
  }

  if (variant === 'no-category') {
    const cat = category ? promptCategories.find((c) => c.id === category) : undefined;
    return (
      <AIEmptyState
        icon={<FolderKanban />}
        title={cat ? `No prompts in ${cat.label}` : 'No prompts in this category'}
        description="This category doesn't have any prompts yet. Check back later or browse other categories."
      />
    );
  }

  if (variant === 'favorites') {
    return (
      <AIEmptyState
        icon={<Heart />}
        title="No favorite prompts"
        description="Save your most-used prompts as favorites for quick access. Click the heart icon on any prompt to add it here."
      />
    );
  }

  return (
    <AIEmptyState
      icon={<BookMarked />}
      title="No recently used prompts"
      description="Prompts you run will appear here for quick access."
    />
  );
}
