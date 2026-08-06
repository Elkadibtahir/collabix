import { useState, useMemo } from 'react';
import { Clock, Star, Sparkles } from 'lucide-react';
import { PromptHeader } from './PromptHeader';
import { PromptSearch } from './PromptSearch';
import { PromptCategoryNav, type PromptCategoryNavProps } from './PromptCategoryNav';
import { PromptFeatured } from './PromptFeatured';
import { PromptGrid } from './PromptGrid';
import { PromptDetailDrawer } from './PromptDetailDrawer';
import { PromptRunModal } from './PromptRunModal';
import { PromptEmptyState } from './PromptEmptyState';
import { PromptLoading } from './PromptLoading';
import { PromptErrorCard } from './PromptErrorCard';
import type { Prompt, PromptCategoryId } from './PromptTypes';

const emptyPrompts: Prompt[] = [];

export function PromptLibraryPage() {
  const [activeCategory, setActiveCategory] = useState<PromptCategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [runPrompt, setRunPrompt] = useState<Prompt | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searches, setSearches] = useState<string[]>([]);

  const prompts = emptyPrompts;

  const filtered = useMemo(() => {
    let items = [...prompts];
    if (activeCategory === 'favorites') {
      items = items.filter((p) => favorites.has(p.id));
    } else if (activeCategory !== 'all') {
      items = items.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return items;
  }, [activeCategory, searchQuery, favorites]);

  const featured = useMemo(() => prompts.filter((p) => p.featured), []);
  const recent = useMemo<Prompt[]>(() => [], []);
  const favoritePrompts = useMemo(() => prompts.filter((p) => favorites.has(p.id)), [favorites]);

  function handleToggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.trim() && !searches.includes(query.trim())) {
      setSearches((prev) => [query.trim(), ...prev].slice(0, 5));
    }
  }

  const handleCategoryChange: PromptCategoryNavProps['onChange'] = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
  };

  if (loading) return <PromptLoading />;

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PromptHeader searches={searches} onSearch={() => {}} />
        <PromptErrorCard message={error} onRetry={() => setError(null)} onDismiss={() => setError(null)} />
      </div>
    );
  }

  const showFavorites = activeCategory === 'all' && !searchQuery && favoritePrompts.length > 0;
  const showRecent = activeCategory === 'all' && !searchQuery && recent.length > 0;
  const showFeatured = activeCategory === 'all' && !searchQuery;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <PromptHeader searches={searches} onSearch={handleSearch} />

      <PromptSearch
        query={searchQuery}
        onQueryChange={handleSearch}
        recentSearches={searches}
        popularPrompts={prompts.filter((p) => p.featured).map((p) => p.title)}
        onClearSearch={() => setSearchQuery('')}
      />

      <PromptCategoryNav active={activeCategory} onChange={handleCategoryChange} />

      {showFeatured && (
        <PromptFeatured prompts={featured} onPreview={setSelectedPrompt} onRun={setRunPrompt} onToggleFavorite={handleToggleFavorite} favorites={favorites} />
      )}

      {showRecent && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-text-tertiary" />
            <h2 className="text-section font-semibold text-text-primary">Recently Used</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {recent.map((prompt) => (
              <div key={prompt.id} className="shrink-0 w-64 rounded-xl border border-border-subtle bg-surface p-4 hover:shadow-cx-sm hover:-translate-y-0.5 transition-all duration-150">
                <p className="text-caption font-medium text-text-primary truncate">{prompt.title}</p>
                <p className="text-2xs text-text-tertiary mt-1">{prompt.lastUsed}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRunPrompt(prompt)}
                    className="flex-1 rounded-lg bg-accent-600 px-3 py-1.5 text-2xs font-medium text-white hover:bg-accent-700 transition-colors"
                  >
                    Run
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPrompt(prompt)}
                    className="rounded-lg border border-border-subtle px-3 py-1.5 text-2xs font-medium text-text-secondary hover:bg-surface-2 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showFavorites && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-text-tertiary" />
            <h2 className="text-section font-semibold text-text-primary">Favorites</h2>
          </div>
          <PromptGrid
            prompts={favoritePrompts}
            onPreview={setSelectedPrompt}
            onRun={setRunPrompt}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        </section>
      )}

      {(activeCategory !== 'all' || searchQuery) && filtered.length === 0 ? (
        <PromptEmptyState
          variant={searchQuery ? 'no-results' : 'no-category'}
          searchQuery={searchQuery}
          category={activeCategory !== 'all' ? activeCategory : undefined}
          onClearSearch={() => setSearchQuery('')}
        />
      ) : (
        <section className="flex flex-col gap-4">
          {(activeCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-text-tertiary" />
              <h2 className="text-section font-semibold text-text-primary">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Prompts'}
              </h2>
              <span className="text-caption text-text-tertiary">{filtered.length}</span>
            </div>
          )}
          {!showFavorites && !showRecent && !showFeatured && (
            <PromptGrid
              prompts={filtered}
              onPreview={setSelectedPrompt}
              onRun={setRunPrompt}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
            />
          )}
        </section>
      )}

      {selectedPrompt && (
        <PromptDetailDrawer
          prompt={selectedPrompt}
          isFavorite={favorites.has(selectedPrompt.id)}
          onClose={() => setSelectedPrompt(null)}
          onToggleFavorite={() => handleToggleFavorite(selectedPrompt.id)}
          onRun={() => { setRunPrompt(selectedPrompt); setSelectedPrompt(null); }}
        />
      )}

      {runPrompt && (
        <PromptRunModal
          prompt={runPrompt}
          onClose={() => setRunPrompt(null)}
          onRun={() => {}}
        />
      )}
    </div>
  );
}
